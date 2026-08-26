import { Router, type IRouter } from "express";
import {
  db,
  publicationsTable,
  classifyMacrotema,
  type Publication,
} from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

const router: IRouter = Router();

type DeliberaSubtype = "giunta" | "consiglio" | "altro";

function inferDeliberaSubtype(publication: Publication): DeliberaSubtype {
  const tipologia = (publication.tipologia ?? "").toUpperCase();

  if (tipologia.includes("CONSIGLIO")) return "consiglio";
  if (tipologia.includes("GIUNTA")) return "giunta";
  if (publication.subcategory === "consiglio") return "consiglio";
  if (publication.subcategory === "giunta") return "giunta";
  return "altro";
}

function mapDelibera(publication: Publication) {
  return {
    id: publication.id,
    progressivo: publication.progressivo,
    tipologia: publication.tipologia,
    category: "delibera",
    subcategory: inferDeliberaSubtype(publication),
    provenienza: publication.provenienza,
    oggetto: publication.oggetto,
    dataAtto: publication.dataAtto ? publication.dataAtto.toISOString() : null,
    pubStart: publication.pubStart ? publication.pubStart.toISOString() : null,
    pubEnd: publication.pubEnd ? publication.pubEnd.toISOString() : null,
    numRegSet: publication.numRegSet,
    numRegGen: publication.numRegGen,
    cups: publication.cups,
    pnrrMission: publication.pnrrMission,
    isPnrr: publication.isPnrr,
    attachments: publication.attachments ?? [],
    isNew: publication.isNew,
    firstSeenAt: publication.firstSeenAt.toISOString(),
    macrotema:
      publication.macrotema ??
      classifyMacrotema(`${publication.oggetto} ${publication.tipologia ?? ""}`),
    brief: publication.brief ?? null,
    briefManual: publication.briefManual,
    briefGeneratedAt: publication.briefGeneratedAt
      ? publication.briefGeneratedAt.toISOString()
      : null,
    odgMacrotemi: [],
  };
}

router.get("/delibere", async (req, res) => {
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;

  // Historical rows may pre-date the category/subcategory classifier.  The
  // official Albo `tipologia` remains authoritative, so include records whose
  // source label unambiguously identifies a deliberation even when the stored
  // category is still `albo`.
  const isDelibera = or(
    eq(publicationsTable.category, "delibera"),
    ilike(publicationsTable.tipologia, "%DELIBERAZION%"),
    ilike(publicationsTable.tipologia, "%DELIBERA%"),
  )!;

  const conditions = [isDelibera];

  if (tipo === "giunta") {
    conditions.push(
      or(
        and(
          eq(publicationsTable.category, "delibera"),
          eq(publicationsTable.subcategory, "giunta"),
        ),
        ilike(publicationsTable.tipologia, "%GIUNTA%"),
      )!,
    );
  } else if (tipo === "consiglio") {
    conditions.push(
      or(
        and(
          eq(publicationsTable.category, "delibera"),
          eq(publicationsTable.subcategory, "consiglio"),
        ),
        ilike(publicationsTable.tipologia, "%CONSIGLIO%"),
      )!,
    );
  }

  if (q) {
    conditions.push(
      or(
        ilike(publicationsTable.oggetto, `%${q}%`),
        ilike(publicationsTable.tipologia, `%${q}%`),
        ilike(publicationsTable.progressivo, `%${q}%`),
      )!,
    );
  }

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

  res.json(rows.map(mapDelibera));
});

export default router;
