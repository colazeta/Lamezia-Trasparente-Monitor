import { Router, type IRouter } from "express";
import { db, publicationsTable } from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { normaliseSearchText } from "@workspace/publication-standardisation";
import { mapPublicPublication } from "../lib/publicActProjection";

const router: IRouter = Router();

type PublicDelibera = NonNullable<ReturnType<typeof mapPublicPublication>>;

function deliberationSubtype(
  publication: PublicDelibera,
): "giunta" | "consiglio" | "altro" {
  if (publication.subcategory === "consiglio") return "consiglio";
  if (publication.subcategory === "giunta") return "giunta";
  const type = publication.tipologia.toLocaleUpperCase("it-IT");
  if (type.includes("CONSIGLIO")) return "consiglio";
  if (type.includes("GIUNTA")) return "giunta";
  return "altro";
}

router.get("/delibere", async (req, res) => {
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;

  // Keep historical rows ingested before category normalisation. The raw type
  // is used only to select candidates; every returned field still comes from
  // the public-safe projector below.
  const conditions = [
    or(
      eq(publicationsTable.category, "delibera"),
      ilike(publicationsTable.tipologia, "%DELIBERAZION%"),
      ilike(publicationsTable.tipologia, "%DELIBERA%"),
    )!,
  ];

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
    const delibera = {
      ...projected,
      category: "delibera",
      subcategory: deliberationSubtype(projected),
    };
    if (
      (tipo === "giunta" || tipo === "consiglio") &&
      delibera.subcategory !== tipo
    ) {
      return [];
    }
    if (
      normalisedQuery &&
      !delibera.presentation.search_text.includes(normalisedQuery) &&
      !normaliseSearchText(delibera.progressivo).includes(normalisedQuery)
    ) {
      return [];
    }
    return [delibera];
  });
  res.json(publicRows);
});

export default router;
