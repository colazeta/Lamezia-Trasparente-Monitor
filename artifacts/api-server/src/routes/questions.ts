import { Router, type IRouter } from "express";
import { db, questionsTable } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import { CreateQuestionBody, UpdateQuestionBody } from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

const router: IRouter = Router();

function mapQuestion(q: typeof questionsTable.$inferSelect) {
  return {
    id: q.id,
    text: q.text,
    teaser: q.teaser,
    destinationPath: q.destinationPath,
    ctaLabel: q.ctaLabel,
    topic: q.topic,
    featured: q.featured,
    sortOrder: q.sortOrder,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}

const orderBy = [
  asc(questionsTable.sortOrder),
  asc(questionsTable.id),
] as const;

// Lettura pubblica: solo le domande pubblicate, ordinate.
router.get("/questions", async (req, res) => {
  const topic =
    typeof req.query.topic === "string" ? req.query.topic : undefined;
  const featuredOnly = req.query.featured === "true";

  const conditions = [eq(questionsTable.status, "published")];
  if (topic) {
    conditions.push(eq(questionsTable.topic, topic));
  }
  if (featuredOnly) {
    conditions.push(eq(questionsTable.featured, true));
  }

  const rows = await db
    .select()
    .from(questionsTable)
    .where(and(...conditions))
    .orderBy(...orderBy);

  res.json(rows.map(mapQuestion));
});

// Lettura protetta: tutte le domande, incluse le bozze (per l'area editor).
router.get("/questions/all", requireIngestAuth, async (_req, res) => {
  const rows = await db
    .select()
    .from(questionsTable)
    .orderBy(...orderBy);

  res.json(rows.map(mapQuestion));
});

router.post("/questions", requireIngestAuth, async (req, res) => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati della domanda non validi" });
    return;
  }

  const text = parsed.data.text.trim();
  const destinationPath = parsed.data.destinationPath.trim();
  const ctaLabel = parsed.data.ctaLabel.trim();
  const topic = parsed.data.topic.trim();
  if (!text || !destinationPath || !ctaLabel || !topic) {
    res.status(400).json({ error: "Dati della domanda non validi" });
    return;
  }

  const teaser = parsed.data.teaser?.trim() ? parsed.data.teaser.trim() : null;

  const [question] = await db
    .insert(questionsTable)
    .values({
      text,
      teaser,
      destinationPath,
      ctaLabel,
      topic,
      featured: parsed.data.featured ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
      status: parsed.data.status ?? "draft",
    })
    .returning();

  res.status(201).json(mapQuestion(question));
});

router.patch("/questions/:id", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Domanda non trovata" });
    return;
  }

  const parsed = UpdateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati della domanda non validi" });
    return;
  }

  const updates: Partial<typeof questionsTable.$inferInsert> & {
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (parsed.data.text !== undefined) {
    const text = parsed.data.text.trim();
    if (!text) {
      res.status(400).json({ error: "Il testo della domanda è obbligatorio" });
      return;
    }
    updates.text = text;
  }
  if (parsed.data.teaser !== undefined) {
    updates.teaser = parsed.data.teaser?.trim()
      ? parsed.data.teaser.trim()
      : null;
  }
  if (parsed.data.destinationPath !== undefined) {
    const destinationPath = parsed.data.destinationPath.trim();
    if (!destinationPath) {
      res.status(400).json({ error: "La destinazione è obbligatoria" });
      return;
    }
    updates.destinationPath = destinationPath;
  }
  if (parsed.data.ctaLabel !== undefined) {
    const ctaLabel = parsed.data.ctaLabel.trim();
    if (!ctaLabel) {
      res.status(400).json({ error: "L'etichetta del pulsante è obbligatoria" });
      return;
    }
    updates.ctaLabel = ctaLabel;
  }
  if (parsed.data.topic !== undefined) {
    const topic = parsed.data.topic.trim();
    if (!topic) {
      res.status(400).json({ error: "L'argomento è obbligatorio" });
      return;
    }
    updates.topic = topic;
  }
  if (parsed.data.featured !== undefined) {
    updates.featured = parsed.data.featured;
  }
  if (parsed.data.sortOrder !== undefined) {
    updates.sortOrder = parsed.data.sortOrder;
  }
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
  }

  const [question] = await db
    .update(questionsTable)
    .set(updates)
    .where(eq(questionsTable.id, id))
    .returning();

  if (!question) {
    res.status(404).json({ error: "Domanda non trovata" });
    return;
  }

  res.json(mapQuestion(question));
});

router.delete("/questions/:id", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Domanda non trovata" });
    return;
  }

  const deleted = await db
    .delete(questionsTable)
    .where(eq(questionsTable.id, id))
    .returning();

  if (deleted.length === 0) {
    res.status(404).json({ error: "Domanda non trovata" });
    return;
  }

  res.status(204).end();
});

export default router;
