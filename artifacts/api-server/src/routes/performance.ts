import { Router, type IRouter } from "express";
import {
  db,
  performanceCategoriesTable,
  performanceIndicatorsTable,
  performanceIndicatorValuesTable,
  feedStatusTable,
  type PerformanceCategory,
  type PerformanceIndicator,
  type PerformanceIndicatorValue,
} from "@workspace/db";
import { and, asc, eq, like } from "drizzle-orm";
import {
  CreatePerformanceIndicatorBody,
  UpdatePerformanceIndicatorBody,
  UpsertPerformanceIndicatorValueBody,
} from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";
import { PERFORMANCE_FEED_PREFIX } from "../lib/performanceIndicators";

const router: IRouter = Router();

function mapCategory(c: PerformanceCategory) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    position: c.position,
  };
}

function mapIndicator(i: PerformanceIndicator) {
  return {
    id: i.id,
    slug: i.slug,
    categoryId: i.categoryId,
    title: i.title,
    description: i.description,
    unit: i.unit,
    source: i.source,
    sourceUrl: i.sourceUrl,
    updateMode: i.updateMode,
    polarity: i.polarity,
    externalKey: i.externalKey,
    position: i.position,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

function mapValue(v: PerformanceIndicatorValue) {
  return {
    id: v.id,
    indicatorId: v.indicatorId,
    period: v.period,
    value: Number(v.value),
    note: v.note,
    manual: v.manual,
    source: v.source,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

// Elenco delle categorie, ciascuna con i propri indicatori (senza serie
// storica, per mantenere la risposta leggera). Le serie si ottengono dal
// dettaglio del singolo indicatore.
router.get("/performance/categories", async (_req, res) => {
  const [categories, indicators] = await Promise.all([
    db
      .select()
      .from(performanceCategoriesTable)
      .orderBy(
        asc(performanceCategoriesTable.position),
        asc(performanceCategoriesTable.id),
      ),
    db
      .select()
      .from(performanceIndicatorsTable)
      .orderBy(
        asc(performanceIndicatorsTable.position),
        asc(performanceIndicatorsTable.id),
      ),
  ]);

  const indicatorsByCategory = new Map<number, PerformanceIndicator[]>();
  for (const ind of indicators) {
    const list = indicatorsByCategory.get(ind.categoryId) ?? [];
    list.push(ind);
    indicatorsByCategory.set(ind.categoryId, list);
  }

  res.json(
    categories.map((c) => ({
      ...mapCategory(c),
      indicators: (indicatorsByCategory.get(c.id) ?? []).map(mapIndicator),
    })),
  );
});

// Elenco piatto degli indicatori, opzionalmente filtrato per categoria.
router.get("/performance/indicators", async (req, res) => {
  const categoryId = req.query.categoryId
    ? Number(req.query.categoryId)
    : undefined;

  const conditions = [];
  if (categoryId !== undefined && !Number.isNaN(categoryId)) {
    conditions.push(eq(performanceIndicatorsTable.categoryId, categoryId));
  }

  const rows = await db
    .select()
    .from(performanceIndicatorsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      asc(performanceIndicatorsTable.position),
      asc(performanceIndicatorsTable.id),
    );

  res.json(rows.map(mapIndicator));
});

// Stato delle fonti automatiche della sezione performance.
router.get("/performance/feed-status", async (_req, res) => {
  const rows = await db
    .select()
    .from(feedStatusTable)
    .where(like(feedStatusTable.source, `${PERFORMANCE_FEED_PREFIX}%`))
    .orderBy(asc(feedStatusTable.label));

  res.json(
    rows.map((f) => ({
      id: f.id,
      source: f.source,
      label: f.label,
      url: f.url,
      status: f.status,
      error: f.error,
      itemsTotal: f.itemsTotal,
      itemsNew: f.itemsNew,
      lastCheckedAt: f.lastCheckedAt ? f.lastCheckedAt.toISOString() : null,
      lastUpdatedAt: f.lastUpdatedAt ? f.lastUpdatedAt.toISOString() : null,
    })),
  );
});

// Risolve un indicatore per id numerico o per slug.
async function findIndicator(
  idOrSlugRaw: string | string[],
): Promise<PerformanceIndicator | undefined> {
  const idOrSlug = Array.isArray(idOrSlugRaw)
    ? (idOrSlugRaw[0] ?? "")
    : idOrSlugRaw;
  const numericId = Number(idOrSlug);
  const [row] = await db
    .select()
    .from(performanceIndicatorsTable)
    .where(
      Number.isInteger(numericId) && idOrSlug.trim() !== ""
        ? eq(performanceIndicatorsTable.id, numericId)
        : eq(performanceIndicatorsTable.slug, idOrSlug),
    );
  return row;
}

// Dettaglio di un indicatore con la sua serie storica ordinata per periodo.
router.get("/performance/indicators/:id", async (req, res) => {
  const indicator = await findIndicator(req.params.id);
  if (!indicator) {
    res.status(404).json({ error: "Indicatore non trovato" });
    return;
  }

  const values = await db
    .select()
    .from(performanceIndicatorValuesTable)
    .where(eq(performanceIndicatorValuesTable.indicatorId, indicator.id))
    .orderBy(asc(performanceIndicatorValuesTable.period));

  res.json({
    ...mapIndicator(indicator),
    values: values.map(mapValue),
  });
});

// --- Endpoint redazione (protetti da requireIngestAuth) ---

// Crea un nuovo indicatore manuale.
router.post(
  "/performance/indicators",
  requireIngestAuth,
  async (req, res) => {
    const parsed = CreatePerformanceIndicatorBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }

    const data = parsed.data;
    const slug = data.slug.trim();
    const title = data.title.trim();
    const unit = data.unit.trim();
    if (!slug || !title || !unit) {
      res
        .status(400)
        .json({ error: "Slug, titolo e unità di misura sono obbligatori" });
      return;
    }

    const [category] = await db
      .select({ id: performanceCategoriesTable.id })
      .from(performanceCategoriesTable)
      .where(eq(performanceCategoriesTable.id, data.categoryId));
    if (!category) {
      res.status(400).json({ error: "Categoria non trovata" });
      return;
    }

    const [existing] = await db
      .select({ id: performanceIndicatorsTable.id })
      .from(performanceIndicatorsTable)
      .where(eq(performanceIndicatorsTable.slug, slug));
    if (existing) {
      res.status(409).json({ error: "Slug già in uso" });
      return;
    }

    const [created] = await db
      .insert(performanceIndicatorsTable)
      .values({
        slug,
        categoryId: data.categoryId,
        title,
        description: data.description?.trim() ?? "",
        unit,
        source: data.source?.trim() || "Redazione",
        sourceUrl: data.sourceUrl?.trim() || null,
        updateMode: data.updateMode ?? "manual",
        polarity: data.polarity ?? "neutral",
        externalKey: data.externalKey?.trim() || null,
        position: data.position ?? 0,
      })
      .returning();

    res.status(201).json(mapIndicator(created));
  },
);

// Aggiorna i metadati di un indicatore esistente.
router.patch(
  "/performance/indicators/:id",
  requireIngestAuth,
  async (req, res) => {
    const indicator = await findIndicator(req.params.id);
    if (!indicator) {
      res.status(404).json({ error: "Indicatore non trovato" });
      return;
    }

    const parsed = UpdatePerformanceIndicatorBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }
    const data = parsed.data;

    const updates: Partial<typeof performanceIndicatorsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.categoryId !== undefined) {
      const [category] = await db
        .select({ id: performanceCategoriesTable.id })
        .from(performanceCategoriesTable)
        .where(eq(performanceCategoriesTable.id, data.categoryId));
      if (!category) {
        res.status(400).json({ error: "Categoria non trovata" });
        return;
      }
      updates.categoryId = data.categoryId;
    }
    if (data.title !== undefined) {
      const title = data.title.trim();
      if (!title) {
        res.status(400).json({ error: "Il titolo è obbligatorio" });
        return;
      }
      updates.title = title;
    }
    if (data.description !== undefined) {
      updates.description = data.description.trim();
    }
    if (data.unit !== undefined) {
      const unit = data.unit.trim();
      if (!unit) {
        res.status(400).json({ error: "L'unità di misura è obbligatoria" });
        return;
      }
      updates.unit = unit;
    }
    if (data.source !== undefined) {
      updates.source = data.source.trim() || "Redazione";
    }
    if (data.sourceUrl !== undefined) {
      updates.sourceUrl = data.sourceUrl.trim() || null;
    }
    if (data.updateMode !== undefined) {
      updates.updateMode = data.updateMode;
    }
    if (data.polarity !== undefined) {
      updates.polarity = data.polarity;
    }
    if (data.externalKey !== undefined) {
      updates.externalKey = data.externalKey.trim() || null;
    }
    if (data.position !== undefined) {
      updates.position = data.position;
    }

    const [updated] = await db
      .update(performanceIndicatorsTable)
      .set(updates)
      .where(eq(performanceIndicatorsTable.id, indicator.id))
      .returning();

    res.json(mapIndicator(updated));
  },
);

// Inserisce o aggiorna un valore della serie storica per un dato periodo.
// Il valore viene marcato come "manuale", così l'ingestione automatica non lo
// sovrascriverà più.
router.put(
  "/performance/indicators/:id/values",
  requireIngestAuth,
  async (req, res) => {
    const indicator = await findIndicator(req.params.id);
    if (!indicator) {
      res.status(404).json({ error: "Indicatore non trovato" });
      return;
    }

    const parsed = UpsertPerformanceIndicatorValueBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }
    const data = parsed.data;
    const period = data.period.trim();
    if (!period) {
      res.status(400).json({ error: "Il periodo è obbligatorio" });
      return;
    }

    const now = new Date();
    const [row] = await db
      .insert(performanceIndicatorValuesTable)
      .values({
        indicatorId: indicator.id,
        period,
        value: String(data.value),
        note: data.note?.trim() || null,
        manual: true,
        source: data.source?.trim() || "Redazione",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          performanceIndicatorValuesTable.indicatorId,
          performanceIndicatorValuesTable.period,
        ],
        set: {
          value: String(data.value),
          note: data.note?.trim() || null,
          manual: true,
          source: data.source?.trim() || "Redazione",
          updatedAt: now,
        },
      })
      .returning();

    await db
      .update(performanceIndicatorsTable)
      .set({ updatedAt: now })
      .where(eq(performanceIndicatorsTable.id, indicator.id));

    res.json(mapValue(row));
  },
);

// Elimina un valore della serie storica di un indicatore.
router.delete(
  "/performance/indicators/:id/values/:period",
  requireIngestAuth,
  async (req, res) => {
    const indicator = await findIndicator(req.params.id);
    if (!indicator) {
      res.status(404).json({ error: "Indicatore non trovato" });
      return;
    }

    const period = Array.isArray(req.params.period)
      ? (req.params.period[0] ?? "")
      : req.params.period;
    const deleted = await db
      .delete(performanceIndicatorValuesTable)
      .where(
        and(
          eq(performanceIndicatorValuesTable.indicatorId, indicator.id),
          eq(performanceIndicatorValuesTable.period, period),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Valore non trovato" });
      return;
    }

    res.status(204).end();
  },
);

export default router;
