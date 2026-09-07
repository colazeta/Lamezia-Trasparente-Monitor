import { Router } from "express";
import type { Pool } from "pg";
import {
  InspectionInputError,
  inspectionTable,
  readInspectionCatalog,
  readInspectionRows,
  withInspectionTransaction,
  type InspectionReadOptions,
} from "@workspace/db/inspection";
import { requireDatabaseOwner } from "../middlewares/requireDatabaseOwner";

export function createDatabaseAdminRouter(pool: Pick<Pool, "connect">) {
  const router = Router();
  let active = 0;
  // Mounted on the prefix: unauthorised requests cannot reach any catalog query.
  router.use(requireDatabaseOwner);
  router.get(
    ["/catalog", "/tables/:name", "/tables/:name/record"],
    async (req, res) => {
      if (active >= 2) {
        res
          .set("Retry-After", "2")
          .status(429)
          .json({ error: "Console occupata: riprova tra poco" });
        return;
      }
      active++;
      try {
        const result = await withInspectionTransaction(pool, async (client) => {
          const catalog = await readInspectionCatalog(client);
          if (req.path === "/catalog") return catalog;
          const table = inspectionTable(catalog, String(req.params.name));
          const scalar = (key: string): string | undefined => {
            const value = req.query[key];
            if (value !== undefined && typeof value !== "string")
              throw new InspectionInputError("Parametro non valido");
            if (typeof value === "string" && value.length > 4096)
              throw new InspectionInputError("Parametro troppo lungo");
            return value;
          };
          const allowed = new Set(
            req.path.endsWith("/record")
              ? ["key"]
              : [
                  "page",
                  "pageSize",
                  "column",
                  "value",
                  "match",
                  "sort",
                  "direction",
                ],
          );
          if (Object.keys(req.query).some((key) => !allowed.has(key)))
            throw new InspectionInputError("Parametro non supportato");
          const options: InspectionReadOptions = req.path.endsWith("/record")
            ? { key: JSON.parse(scalar("key") ?? "null") }
            : {
                page: scalar("page") === undefined ? 1 : Number(scalar("page")),
                pageSize:
                  scalar("pageSize") === undefined
                    ? 50
                    : Number(scalar("pageSize")),
                column: scalar("column"),
                value: scalar("value"),
                sort: scalar("sort"),
                direction: scalar("direction") as "asc" | "desc" | undefined,
                match: scalar("match") as "contains" | "equals" | undefined,
              };
          if (
            req.path.endsWith("/record") &&
            (!options.key ||
              Array.isArray(options.key) ||
              typeof options.key !== "object")
          )
            throw new InspectionInputError("Chiave primaria richiesta");
          return readInspectionRows(client, table, options);
        });
        res.json(result);
      } catch (error) {
        const code = (error as { code?: string })?.code;
        if (
          error instanceof InspectionInputError ||
          error instanceof SyntaxError ||
          code?.startsWith("22")
        ) {
          res
            .status(400)
            .json({ error: "Tabella, chiave o parametri non validi" });
        } else if (code === "57014" || code === "55P03") {
          res
            .status(503)
            .json({
              error: "Lettura oltre il limite: restringi il filtro e riprova",
            });
        } else {
          req.log?.error({ code }, "Database inspection failed");
          res
            .status(503)
            .json({ error: "Database non disponibile per la consultazione" });
        }
      } finally {
        active--;
      }
    },
  );
  // No generic SQL, export-to-public, write, or mutation endpoints.
  router.use((_req, res) => {
    res.status(405).json({ error: "Operazione non disponibile" });
  });
  return router;
}
