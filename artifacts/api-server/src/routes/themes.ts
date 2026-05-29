import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
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
  themeFollowersTable,
} from "@workspace/db";
import { and, eq, desc, ilike, sql } from "drizzle-orm";
import { ShareThemeBody, FollowThemeBody } from "@workspace/api-zod";
import {
  notifyThemeFollowers,
  sendFollowConfirmationEmail,
} from "../lib/notifications";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

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
      followerCount: themesTable.followerCount,
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
      followerCount: themesTable.followerCount,
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
    followerCount: updated.followerCount,
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
    followerCount: updated.followerCount,
    updatedAt: updated.updatedAt.toISOString(),
  });
});

router.post("/themes/:id/follow", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const parsed = FollowThemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Indirizzo email non valido" });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const unsubscribeToken = randomUUID();

  const result = await db.transaction(async (tx) => {
    const [exists] = await tx
      .select({ id: themesTable.id })
      .from(themesTable)
      .where(eq(themesTable.id, id));
    if (!exists) {
      return null;
    }

    const inserted = await tx
      .insert(themeFollowersTable)
      .values({ themeId: id, email, unsubscribeToken })
      .onConflictDoNothing({
        target: [themeFollowersTable.themeId, themeFollowersTable.email],
      })
      .returning();

    const isNew = inserted.length > 0;

    if (isNew) {
      await tx
        .update(themesTable)
        .set({ followerCount: sql`${themesTable.followerCount} + 1` })
        .where(eq(themesTable.id, id));
    }

    const [row] = await tx
      .select()
      .from(themesTable)
      .where(eq(themesTable.id, id));

    return { theme: row ?? null, isNew };
  });

  if (!result || !result.theme) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const updated = result.theme;

  if (result.isNew) {
    void sendFollowConfirmationEmail({
      email,
      themeId: id,
      themeTitle: updated.title,
      unsubscribeToken,
    });
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
    followerCount: updated.followerCount,
    updatedAt: updated.updatedAt.toISOString(),
  });
});

router.post("/themes/:id/documents", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const body = req.body as {
    title?: unknown;
    type?: unknown;
    url?: unknown;
  };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const url =
    typeof body.url === "string" && body.url.trim() ? body.url.trim() : null;

  if (!title || !type) {
    res.status(400).json({ error: "Titolo e tipo sono obbligatori" });
    return;
  }

  const [theme] = await db
    .select({ id: themesTable.id })
    .from(themesTable)
    .where(eq(themesTable.id, id));
  if (!theme) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [document] = await db
    .insert(themeDocumentsTable)
    .values({ themeId: id, title, type, url })
    .returning();

  await db
    .update(themesTable)
    .set({ updatedAt: new Date() })
    .where(eq(themesTable.id, id));

  void notifyThemeFollowers({
    themeId: id,
    contentType: "document",
    contentTitle: title,
  });

  res.status(201).json({
    id: document.id,
    title: document.title,
    type: document.type,
    url: document.url,
    date: document.date.toISOString(),
  });
});

router.post("/themes/:id/acts", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const body = req.body as {
    title?: unknown;
    type?: unknown;
    number?: unknown;
    summary?: unknown;
    publishDate?: unknown;
    endDate?: unknown;
  };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const number = typeof body.number === "string" ? body.number.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";

  if (!title || !type || !number || !summary) {
    res
      .status(400)
      .json({ error: "Titolo, tipo, numero e sintesi sono obbligatori" });
    return;
  }

  const publishDate =
    typeof body.publishDate === "string" && body.publishDate.trim()
      ? new Date(body.publishDate)
      : new Date();
  const endDate =
    typeof body.endDate === "string" && body.endDate.trim()
      ? new Date(body.endDate)
      : publishDate;
  if (Number.isNaN(publishDate.getTime()) || Number.isNaN(endDate.getTime())) {
    res.status(400).json({ error: "Date non valide" });
    return;
  }

  const [theme] = await db
    .select({ id: themesTable.id })
    .from(themesTable)
    .where(eq(themesTable.id, id));
  if (!theme) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [act] = await db
    .insert(actsTable)
    .values({ themeId: id, title, type, number, summary, publishDate, endDate })
    .returning();

  await db
    .update(themesTable)
    .set({ updatedAt: new Date() })
    .where(eq(themesTable.id, id));

  void notifyThemeFollowers({
    themeId: id,
    contentType: "act",
    contentTitle: title,
  });

  res.status(201).json(mapAct(act));
});

router.post("/themes/:id/emails", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const body = req.body as {
    subject?: unknown;
    sender?: unknown;
    recipient?: unknown;
    direction?: unknown;
    body?: unknown;
    date?: unknown;
  };
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const sender = typeof body.sender === "string" ? body.sender.trim() : "";
  const recipient =
    typeof body.recipient === "string" ? body.recipient.trim() : "";
  const direction =
    typeof body.direction === "string" ? body.direction.trim() : "";
  const emailBody = typeof body.body === "string" ? body.body.trim() : "";

  if (!subject || !sender || !recipient || !direction || !emailBody) {
    res.status(400).json({
      error:
        "Oggetto, mittente, destinatario, direzione e testo sono obbligatori",
    });
    return;
  }

  const date =
    typeof body.date === "string" && body.date.trim()
      ? new Date(body.date)
      : new Date();
  if (Number.isNaN(date.getTime())) {
    res.status(400).json({ error: "Data non valida" });
    return;
  }

  const [theme] = await db
    .select({ id: themesTable.id })
    .from(themesTable)
    .where(eq(themesTable.id, id));
  if (!theme) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [email] = await db
    .insert(themeEmailsTable)
    .values({
      themeId: id,
      subject,
      sender,
      recipient,
      direction,
      body: emailBody,
      date,
    })
    .returning();

  await db
    .update(themesTable)
    .set({ updatedAt: new Date() })
    .where(eq(themesTable.id, id));

  void notifyThemeFollowers({
    themeId: id,
    contentType: "email",
    contentTitle: subject,
  });

  res.status(201).json({
    id: email.id,
    subject: email.subject,
    sender: email.sender,
    recipient: email.recipient,
    direction: email.direction,
    body: email.body,
    date: email.date.toISOString(),
  });
});

function homeUrl(): string {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "") || "/";
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "/";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

router.get("/unsubscribe", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";

  const sendPage = (message: string, withHomeLink = false) => {
    const link = withHomeLink
      ? `<p><a href="${escapeHtml(homeUrl())}">Torna a Lamezia Trasparente</a></p>`
      : "";
    res
      .status(200)
      .type("html")
      .send(
        `<!doctype html><html lang="it"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Iscrizione annullata</title><style>body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}div{background:#fff;padding:32px 40px;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.1);max-width:480px;text-align:center;color:#1a1a1a}a{color:#2563eb}</style></head><body><div><h1>Lamezia Trasparente</h1><p>${message}</p>${link}</div></body></html>`,
      );
  };

  if (!token) {
    sendPage("Link di annullamento non valido.");
    return;
  }

  const deleted = await db
    .delete(themeFollowersTable)
    .where(eq(themeFollowersTable.unsubscribeToken, token))
    .returning();

  if (deleted.length > 0) {
    await db
      .update(themesTable)
      .set({ followerCount: sql`GREATEST(${themesTable.followerCount} - 1, 0)` })
      .where(eq(themesTable.id, deleted[0].themeId));

    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, deleted[0].themeId));

    const message = theme
      ? `Iscrizione annullata. Non riceverai più aggiornamenti su <strong>${escapeHtml(theme.title)}</strong>.`
      : "Iscrizione annullata. Non riceverai più aggiornamenti su questo tema.";
    sendPage(message, true);
  } else {
    sendPage("Iscrizione già annullata o link non valido.");
  }
});

export default router;
