import { Router, type IRouter } from "express";
import {
  db,
  oversightOpinionsTable,
  oversightOpinionDocumentsTable,
  type OversightOpinion,
  type OversightOpinionDocument,
} from "@workspace/db";
import { and, asc, desc, eq, gte, ilike, lt, or } from "drizzle-orm";

const router: IRouter = Router();

function mapOpinion(o: OversightOpinion) {
  return {
    id: o.id,
    title: o.title,
    issuingBody: o.issuingBody,
    opinionType: o.opinionType,
    subject: o.subject,
    outcome: o.outcome,
    status: o.status,
    opinionDate: o.opinionDate.toISOString(),
  };
}

function mapDocument(d: OversightOpinionDocument) {
  return {
    id: d.id,
    title: d.title,
    type: d.type,
    url: d.url,
    date: d.date.toISOString(),
  };
}

router.get("/oversight-opinions", async (req, res) => {
  const issuingBody =
    typeof req.query.issuingBody === "string"
      ? req.query.issuingBody
      : undefined;
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const yearRaw =
    typeof req.query.year === "string" ? Number(req.query.year) : undefined;
  const year =
    yearRaw !== undefined && Number.isInteger(yearRaw) ? yearRaw : undefined;
  const sort = typeof req.query.sort === "string" ? req.query.sort : "recent";

  const conditions = [eq(oversightOpinionsTable.status, "pubblicato")];
  if (issuingBody) {
    conditions.push(eq(oversightOpinionsTable.issuingBody, issuingBody));
  }
  if (year !== undefined) {
    conditions.push(
      gte(oversightOpinionsTable.opinionDate, new Date(Date.UTC(year, 0, 1))),
      lt(oversightOpinionsTable.opinionDate, new Date(Date.UTC(year + 1, 0, 1))),
    );
  }
  if (search) {
    const term = `%${search}%`;
    const match = or(
      ilike(oversightOpinionsTable.title, term),
      ilike(oversightOpinionsTable.subject, term),
      ilike(oversightOpinionsTable.opinionType, term),
    );
    if (match) conditions.push(match);
  }

  const orderBy =
    sort === "oldest"
      ? asc(oversightOpinionsTable.opinionDate)
      : desc(oversightOpinionsTable.opinionDate);

  const rows = await db
    .select()
    .from(oversightOpinionsTable)
    .where(and(...conditions))
    .orderBy(orderBy, desc(oversightOpinionsTable.id));

  res.json(rows.map(mapOpinion));
});

router.get("/oversight-opinions/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Parere non trovato" });
    return;
  }

  const [opinion] = await db
    .select()
    .from(oversightOpinionsTable)
    .where(
      and(
        eq(oversightOpinionsTable.id, id),
        eq(oversightOpinionsTable.status, "pubblicato"),
      ),
    );

  if (!opinion) {
    res.status(404).json({ error: "Parere non trovato" });
    return;
  }

  const documents = await db
    .select()
    .from(oversightOpinionDocumentsTable)
    .where(eq(oversightOpinionDocumentsTable.opinionId, id))
    .orderBy(
      desc(oversightOpinionDocumentsTable.date),
      asc(oversightOpinionDocumentsTable.id),
    );

  res.json({
    ...mapOpinion(opinion),
    body: opinion.body,
    documents: documents.map(mapDocument),
  });
});

export default router;
