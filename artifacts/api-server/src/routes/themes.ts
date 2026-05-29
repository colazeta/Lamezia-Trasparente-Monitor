import { Router, type IRouter } from "express";
import {
  db,
  themesTable,
  categoriesTable,
  themeDocumentsTable,
  themeEmailsTable,
  themeMetricsTable,
  contractsTable,
  actsTable,
  sharesTable,
} from "@workspace/db";
import { and, eq, desc, ilike, sql } from "drizzle-orm";
import { ShareThemeBody } from "@workspace/api-zod";

const router: IRouter = Router();

function mapContract(c: typeof contractsTable.$inferSelect) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    supplier: c.supplier,
    amount: Number(c.amount),
    procedureType: c.procedureType,
    status: c.status,
    awardDate: c.awardDate.toISOString(),
    themeId: c.themeId,
  };
}

function mapAct(a: typeof actsTable.$inferSelect) {
  return {
    id: a.id,
    title: a.title,
    type: a.type,
    number: a.number,
    summary: a.summary,
    publishDate: a.publishDate.toISOString(),
    endDate: a.endDate.toISOString(),
    themeId: a.themeId,
  };
}

router.get("/themes", async (req, res) => {
  const categoryId = req.query.categoryId
    ? Number(req.query.categoryId)
    : undefined;
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const sort =
    typeof req.query.sort === "string" ? req.query.sort : "recent";

  const conditions = [];
  if (categoryId && !Number.isNaN(categoryId)) {
    conditions.push(eq(themesTable.categoryId, categoryId));
  }
  if (search) {
    conditions.push(ilike(themesTable.title, `%${search}%`));
  }

  const orderBy =
    sort === "relevance"
      ? desc(themesTable.relevanceCount)
      : sort === "shares"
        ? desc(themesTable.shareCount)
        : desc(themesTable.updatedAt);

  const rows = await db
    .select({
      id: themesTable.id,
      title: themesTable.title,
      slug: themesTable.slug,
      summary: themesTable.summary,
      categoryId: themesTable.categoryId,
      categoryName: categoriesTable.name,
      status: themesTable.status,
      relevanceCount: themesTable.relevanceCount,
      shareCount: themesTable.shareCount,
      updatedAt: themesTable.updatedAt,
    })
    .from(themesTable)
    .innerJoin(categoriesTable, eq(themesTable.categoryId, categoriesTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy);

  res.json(
    rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() })),
  );
});

router.get("/themes/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [theme] = await db
    .select({
      id: themesTable.id,
      title: themesTable.title,
      slug: themesTable.slug,
      summary: themesTable.summary,
      description: themesTable.description,
      categoryId: themesTable.categoryId,
      categoryName: categoriesTable.name,
      status: themesTable.status,
      relevanceCount: themesTable.relevanceCount,
      shareCount: themesTable.shareCount,
      updatedAt: themesTable.updatedAt,
    })
    .from(themesTable)
    .innerJoin(categoriesTable, eq(themesTable.categoryId, categoriesTable.id))
    .where(eq(themesTable.id, id));

  if (!theme) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [documents, emails, metrics, contracts, acts] = await Promise.all([
    db
      .select()
      .from(themeDocumentsTable)
      .where(eq(themeDocumentsTable.themeId, id))
      .orderBy(desc(themeDocumentsTable.date)),
    db
      .select()
      .from(themeEmailsTable)
      .where(eq(themeEmailsTable.themeId, id))
      .orderBy(desc(themeEmailsTable.date)),
    db.select().from(themeMetricsTable).where(eq(themeMetricsTable.themeId, id)),
    db.select().from(contractsTable).where(eq(contractsTable.themeId, id)),
    db.select().from(actsTable).where(eq(actsTable.themeId, id)),
  ]);

  res.json({
    ...theme,
    updatedAt: theme.updatedAt.toISOString(),
    documents: documents.map((d) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      url: d.url,
      date: d.date.toISOString(),
    })),
    emails: emails.map((e) => ({
      id: e.id,
      subject: e.subject,
      sender: e.sender,
      recipient: e.recipient,
      direction: e.direction,
      date: e.date.toISOString(),
      body: e.body,
    })),
    metrics: metrics.map((m) => ({
      id: m.id,
      label: m.label,
      value: m.value,
      unit: m.unit,
    })),
    contracts: contracts.map(mapContract),
    acts: acts.map(mapAct),
  });
});

router.post("/themes/:id/relevant", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [updated] = await db
    .update(themesTable)
    .set({ relevanceCount: sql`${themesTable.relevanceCount} + 1` })
    .where(eq(themesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [category] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, updated.categoryId));

  res.json({
    id: updated.id,
    title: updated.title,
    slug: updated.slug,
    summary: updated.summary,
    categoryId: updated.categoryId,
    categoryName: category?.name ?? "",
    status: updated.status,
    relevanceCount: updated.relevanceCount,
    shareCount: updated.shareCount,
    updatedAt: updated.updatedAt.toISOString(),
  });
});

router.post("/themes/:id/share", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const parsed = ShareThemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }

  const updated = await db.transaction(async (tx) => {
    const [exists] = await tx
      .select({ id: themesTable.id })
      .from(themesTable)
      .where(eq(themesTable.id, id));
    if (!exists) {
      return null;
    }

    await tx
      .insert(sharesTable)
      .values({ themeId: id, channel: parsed.data.channel });

    const [row] = await tx
      .update(themesTable)
      .set({ shareCount: sql`${themesTable.shareCount} + 1` })
      .where(eq(themesTable.id, id))
      .returning();

    return row ?? null;
  });

  if (!updated) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [category] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, updated.categoryId));

  res.json({
    id: updated.id,
    title: updated.title,
    slug: updated.slug,
    summary: updated.summary,
    categoryId: updated.categoryId,
    categoryName: category?.name ?? "",
    status: updated.status,
    relevanceCount: updated.relevanceCount,
    shareCount: updated.shareCount,
    updatedAt: updated.updatedAt.toISOString(),
  });
});

export default router;
