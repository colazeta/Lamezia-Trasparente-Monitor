import { Router, type IRouter } from "express";
import {
  db,
  oversightOpinionsTable,
  oversightOpinionDocumentsTable,
  type OversightOpinion,
  type OversightOpinionDocument,
} from "@workspace/db";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import {
  CreateOversightOpinionBody,
  UpdateOversightOpinionBody,
  AddOversightOpinionDocumentBody,
} from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

const router: IRouter = Router();

function mapOpinion(o: OversightOpinion) {
  return {
    id: o.id,
    title: o.title,
    issuingBody: o.issuingBody,
    opinionType: o.opinionType,
    subject: o.subject,
    outcome: o.outcome,
    referenceYear: o.referenceYear,
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
    conditions.push(eq(oversightOpinionsTable.referenceYear, year));
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

  const rows = await db
    .select()
    .from(oversightOpinionsTable)
    .where(and(...conditions))
    .orderBy(
      ...(sort === "referenceYear"
        ? [
            desc(oversightOpinionsTable.referenceYear),
            asc(oversightOpinionsTable.issuingBody),
            desc(oversightOpinionsTable.id),
          ]
        : sort === "oldest"
          ? [
              asc(oversightOpinionsTable.opinionDate),
              desc(oversightOpinionsTable.id),
            ]
          : [
              desc(oversightOpinionsTable.opinionDate),
              desc(oversightOpinionsTable.id),
            ]),
    );

  res.json(rows.map(mapOpinion));
});

// Lettura protetta: tutti i pareri (incluse le bozze) con i documenti, per
// l'area editor — una sola richiesta per popolare l'editor.
router.get("/oversight-opinions/all", requireIngestAuth, async (_req, res) => {
  const opinions = await db
    .select()
    .from(oversightOpinionsTable)
    .orderBy(
      desc(oversightOpinionsTable.referenceYear),
      desc(oversightOpinionsTable.opinionDate),
      desc(oversightOpinionsTable.id),
    );

  const documents = await db
    .select()
    .from(oversightOpinionDocumentsTable)
    .orderBy(
      desc(oversightOpinionDocumentsTable.date),
      asc(oversightOpinionDocumentsTable.id),
    );

  const docsByOpinion = new Map<number, OversightOpinionDocument[]>();
  for (const doc of documents) {
    const list = docsByOpinion.get(doc.opinionId) ?? [];
    list.push(doc);
    docsByOpinion.set(doc.opinionId, list);
  }

  res.json(
    opinions.map((o) => ({
      ...mapOpinion(o),
      body: o.body,
      documents: (docsByOpinion.get(o.id) ?? []).map(mapDocument),
    })),
  );
});

router.post("/oversight-opinions", requireIngestAuth, async (req, res) => {
  const parsed = CreateOversightOpinionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati del parere non validi" });
    return;
  }

  const title = parsed.data.title.trim();
  const issuingBody = parsed.data.issuingBody.trim();
  const opinionType = parsed.data.opinionType.trim();
  const subject = parsed.data.subject.trim();
  if (!title || !issuingBody || !opinionType || !subject) {
    res.status(400).json({ error: "Dati del parere non validi" });
    return;
  }

  const opinionDate = parsed.data.opinionDate
    ? new Date(parsed.data.opinionDate)
    : undefined;
  if (opinionDate && Number.isNaN(opinionDate.getTime())) {
    res.status(400).json({ error: "Data di emissione non valida" });
    return;
  }

  const [opinion] = await db
    .insert(oversightOpinionsTable)
    .values({
      title,
      issuingBody,
      opinionType,
      subject,
      outcome: parsed.data.outcome?.trim() ? parsed.data.outcome.trim() : null,
      body: parsed.data.body?.trim() ? parsed.data.body.trim() : null,
      referenceYear: parsed.data.referenceYear ?? null,
      status: parsed.data.status ?? "pubblicato",
      ...(opinionDate ? { opinionDate } : {}),
    })
    .returning();

  res.status(201).json({
    ...mapOpinion(opinion),
    body: opinion.body,
    documents: [],
  });
});

router.patch("/oversight-opinions/:id", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Parere non trovato" });
    return;
  }

  const parsed = UpdateOversightOpinionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati del parere non validi" });
    return;
  }

  const updates: Partial<typeof oversightOpinionsTable.$inferInsert> & {
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (parsed.data.title !== undefined) {
    const title = parsed.data.title.trim();
    if (!title) {
      res.status(400).json({ error: "Il titolo è obbligatorio" });
      return;
    }
    updates.title = title;
  }
  if (parsed.data.issuingBody !== undefined) {
    const issuingBody = parsed.data.issuingBody.trim();
    if (!issuingBody) {
      res.status(400).json({ error: "L'organo emittente è obbligatorio" });
      return;
    }
    updates.issuingBody = issuingBody;
  }
  if (parsed.data.opinionType !== undefined) {
    const opinionType = parsed.data.opinionType.trim();
    if (!opinionType) {
      res.status(400).json({ error: "La tipologia è obbligatoria" });
      return;
    }
    updates.opinionType = opinionType;
  }
  if (parsed.data.subject !== undefined) {
    const subject = parsed.data.subject.trim();
    if (!subject) {
      res.status(400).json({ error: "L'oggetto è obbligatorio" });
      return;
    }
    updates.subject = subject;
  }
  if (parsed.data.outcome !== undefined) {
    updates.outcome = parsed.data.outcome?.trim()
      ? parsed.data.outcome.trim()
      : null;
  }
  if (parsed.data.body !== undefined) {
    updates.body = parsed.data.body?.trim() ? parsed.data.body.trim() : null;
  }
  if (parsed.data.referenceYear !== undefined) {
    updates.referenceYear = parsed.data.referenceYear;
  }
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
  }
  if (parsed.data.opinionDate !== undefined) {
    const opinionDate = new Date(parsed.data.opinionDate);
    if (Number.isNaN(opinionDate.getTime())) {
      res.status(400).json({ error: "Data di emissione non valida" });
      return;
    }
    updates.opinionDate = opinionDate;
  }

  const [opinion] = await db
    .update(oversightOpinionsTable)
    .set(updates)
    .where(eq(oversightOpinionsTable.id, id))
    .returning();

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

router.delete("/oversight-opinions/:id", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Parere non trovato" });
    return;
  }

  await db
    .delete(oversightOpinionDocumentsTable)
    .where(eq(oversightOpinionDocumentsTable.opinionId, id));

  const deleted = await db
    .delete(oversightOpinionsTable)
    .where(eq(oversightOpinionsTable.id, id))
    .returning();

  if (deleted.length === 0) {
    res.status(404).json({ error: "Parere non trovato" });
    return;
  }

  res.status(204).end();
});

router.post(
  "/oversight-opinions/:id/documents",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Parere non trovato" });
      return;
    }

    const parsed = AddOversightOpinionDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati del documento non validi" });
      return;
    }

    const title = parsed.data.title.trim();
    const type = parsed.data.type.trim();
    if (!title || !type) {
      res.status(400).json({ error: "Dati del documento non validi" });
      return;
    }

    const date = parsed.data.date ? new Date(parsed.data.date) : undefined;
    if (date && Number.isNaN(date.getTime())) {
      res.status(400).json({ error: "Data del documento non valida" });
      return;
    }

    const [opinion] = await db
      .select()
      .from(oversightOpinionsTable)
      .where(eq(oversightOpinionsTable.id, id));

    if (!opinion) {
      res.status(404).json({ error: "Parere non trovato" });
      return;
    }

    const [document] = await db
      .insert(oversightOpinionDocumentsTable)
      .values({
        opinionId: id,
        title,
        type,
        url: parsed.data.url?.trim() ? parsed.data.url.trim() : null,
        ...(date ? { date } : {}),
      })
      .returning();

    res.status(201).json(mapDocument(document));
  },
);

router.delete(
  "/oversight-opinions/:id/documents/:documentId",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    const documentId = Number(req.params.documentId);
    if (Number.isNaN(id) || Number.isNaN(documentId)) {
      res.status(404).json({ error: "Documento non trovato" });
      return;
    }

    const deleted = await db
      .delete(oversightOpinionDocumentsTable)
      .where(
        and(
          eq(oversightOpinionDocumentsTable.id, documentId),
          eq(oversightOpinionDocumentsTable.opinionId, id),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Documento non trovato" });
      return;
    }

    res.status(204).end();
  },
);

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
