import { Router, type IRouter } from "express";
import { db, publicationsTable } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { normaliseSearchText } from "@workspace/publication-standardisation";
import { mapPublicPublication } from "../lib/publicActProjection";

const router: IRouter = Router();

router.get("/delibere", async (req, res) => {
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;

  const conditions = [eq(publicationsTable.category, "delibera")];

  const rows = await db
    .select()
    .from(publicationsTable)
    .where(and(...conditions))
    .orderBy(
      desc(
        sql`COALESCE(${publicationsTable.dataAtto}, ${publicationsTable.pubStart}, ${publicationsTable.firstSeenAt})`,
      ),
      desc(publicationsTable.id),
    );

  const normalisedQuery = q ? normaliseSearchText(q) : null;
  const publicRows = rows.flatMap((row) => {
    const projected = mapPublicPublication(row);
    if (!projected) return [];
    if (
      (tipo === "giunta" || tipo === "consiglio") &&
      projected.subcategory !== tipo
    ) {
      return [];
    }
    if (
      normalisedQuery &&
      !projected.presentation.search_text.includes(normalisedQuery) &&
      !normaliseSearchText(projected.progressivo).includes(normalisedQuery)
    ) {
      return [];
    }
    return [projected];
  });
  res.json(publicRows);
});

export default router;
