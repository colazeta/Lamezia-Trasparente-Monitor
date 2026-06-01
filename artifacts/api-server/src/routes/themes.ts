import { Router, type IRouter, type Request } from "express";
import { randomUUID, createHash } from "node:crypto";
import {
  db,
  themesTable,
  categoriesTable,
  themeDocumentsTable,
  themePostsTable,
  themeEmailsTable,
  themeMetricsTable,
  contractsTable,
  actsTable,
  sharesTable,
  themeRelevanceEventsTable,
  themeFollowersTable,
} from "@workspace/db";
import { and, eq, desc, ilike, sql } from "drizzle-orm";
import {
  ShareThemeBody,
  FollowThemeBody,
  RequestSubscriptionsLinkBody,
  CreateThemePostBody,
  UpdateThemePostBody,
} from "@workspace/api-zod";
import {
  notifyThemeFollowers,
  sendFollowConfirmationEmail,
  sendSubscriptionsLinkEmail,
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

function mapPost(p: typeof themePostsTable.$inferSelect) {
  return {
    id: p.id,
    themeId: p.themeId,
    title: p.title,
    body: p.body,
    eventDate: p.eventDate.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
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

  const [documents, emails, metrics, contracts, acts, posts] =
    await Promise.all([
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
      db
        .select()
        .from(themeMetricsTable)
        .where(eq(themeMetricsTable.themeId, id)),
      db.select().from(contractsTable).where(eq(contractsTable.themeId, id)),
      db.select().from(actsTable).where(eq(actsTable.themeId, id)),
      db
        .select()
        .from(themePostsTable)
        .where(eq(themePostsTable.themeId, id))
        .orderBy(desc(themePostsTable.eventDate), desc(themePostsTable.id)),
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
    posts: posts.map(mapPost),
  });
});

router.get("/themes/:id/posts", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
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

  const posts = await db
    .select()
    .from(themePostsTable)
    .where(eq(themePostsTable.themeId, id))
    .orderBy(desc(themePostsTable.eventDate), desc(themePostsTable.id));

  res.json(posts.map(mapPost));
});

router.post("/themes/:id/posts", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const parsed = CreateThemePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Il testo del post è obbligatorio" });
    return;
  }

  const title = parsed.data.title?.trim() ? parsed.data.title.trim() : null;
  const body = parsed.data.body.trim();
  if (!body) {
    res.status(400).json({ error: "Il testo del post è obbligatorio" });
    return;
  }

  let eventDate = new Date();
  if (parsed.data.eventDate) {
    const candidate = new Date(parsed.data.eventDate);
    if (Number.isNaN(candidate.getTime())) {
      res.status(400).json({ error: "Data dell'evento non valida" });
      return;
    }
    eventDate = candidate;
  }

  const [theme] = await db
    .select({ id: themesTable.id })
    .from(themesTable)
    .where(eq(themesTable.id, id));
  if (!theme) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [post] = await db
    .insert(themePostsTable)
    .values({ themeId: id, title, body, eventDate })
    .returning();

  await db
    .update(themesTable)
    .set({ updatedAt: new Date() })
    .where(eq(themesTable.id, id));

  res.status(201).json(mapPost(post));
});

router.patch(
  "/themes/:id/posts/:postId",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    const postId = Number(req.params.postId);
    if (Number.isNaN(id) || Number.isNaN(postId)) {
      res.status(404).json({ error: "Post non trovato" });
      return;
    }

    const parsed = UpdateThemePostBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }

    const updates: {
      title?: string | null;
      body?: string;
      eventDate?: Date;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (parsed.data.title !== undefined) {
      updates.title = parsed.data.title?.trim()
        ? parsed.data.title.trim()
        : null;
    }
    if (parsed.data.body !== undefined) {
      const body = parsed.data.body.trim();
      if (!body) {
        res.status(400).json({ error: "Il testo del post è obbligatorio" });
        return;
      }
      updates.body = body;
    }
    if (parsed.data.eventDate !== undefined) {
      const candidate = new Date(parsed.data.eventDate);
      if (Number.isNaN(candidate.getTime())) {
        res.status(400).json({ error: "Data dell'evento non valida" });
        return;
      }
      updates.eventDate = candidate;
    }

    const [post] = await db
      .update(themePostsTable)
      .set(updates)
      .where(
        and(
          eq(themePostsTable.id, postId),
          eq(themePostsTable.themeId, id),
        ),
      )
      .returning();

    if (!post) {
      res.status(404).json({ error: "Post non trovato" });
      return;
    }

    res.json(mapPost(post));
  },
);

router.delete(
  "/themes/:id/posts/:postId",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    const postId = Number(req.params.postId);
    if (Number.isNaN(id) || Number.isNaN(postId)) {
      res.status(404).json({ error: "Post non trovato" });
      return;
    }

    const deleted = await db
      .delete(themePostsTable)
      .where(
        and(
          eq(themePostsTable.id, postId),
          eq(themePostsTable.themeId, id),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Post non trovato" });
      return;
    }

    res.status(204).end();
  },
);

// Deriva una chiave anti-abuso stabile dalla provenienza della richiesta. Si
// basa sull'IP del client (risolto tramite `trust proxy`) e ne salva solo
// l'hash, così da non conservare l'indirizzo in chiaro. La chiave permette di
// deduplicare i clic ripetuti dalla stessa sorgente: un solo segnale di
// rilevanza per IP e per tema.
function relevanceDedupeKey(req: Request): string {
  const source = req.ip ?? req.socket.remoteAddress ?? "unknown";
  return createHash("sha256").update(source).digest("hex");
}

router.post("/themes/:id/relevant", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const dedupeKey = relevanceDedupeKey(req);

  const updated = await db.transaction(async (tx) => {
    const [exists] = await tx
      .select({ id: themesTable.id })
      .from(themesTable)
      .where(eq(themesTable.id, id));
    if (!exists) {
      return null;
    }

    // Inserisce l'evento solo se questa sorgente non ha già segnalato il tema.
    // In caso di duplicato l'inserimento viene ignorato e il contatore resta
    // invariato, così un singolo utente non può gonfiare la rilevanza.
    const inserted = await tx
      .insert(themeRelevanceEventsTable)
      .values({ themeId: id, dedupeKey })
      .onConflictDoNothing({
        target: [
          themeRelevanceEventsTable.themeId,
          themeRelevanceEventsTable.dedupeKey,
        ],
      })
      .returning();

    if (inserted.length > 0) {
      const [row] = await tx
        .update(themesTable)
        .set({ relevanceCount: sql`${themesTable.relevanceCount} + 1` })
        .where(eq(themesTable.id, id))
        .returning();
      return row ?? null;
    }

    const [row] = await tx
      .select()
      .from(themesTable)
      .where(eq(themesTable.id, id));
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

async function addFollower(
  themeId: number,
  email: string,
): Promise<{
  theme: typeof themesTable.$inferSelect | null;
  isNew: boolean;
  unsubscribeToken: string;
} | null> {
  const unsubscribeToken = randomUUID();

  const result = await db.transaction(async (tx) => {
    const [exists] = await tx
      .select({ id: themesTable.id })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    if (!exists) {
      return null;
    }

    const inserted = await tx
      .insert(themeFollowersTable)
      .values({ themeId, email, unsubscribeToken })
      .onConflictDoNothing({
        target: [themeFollowersTable.themeId, themeFollowersTable.email],
      })
      .returning();

    const isNew = inserted.length > 0;

    if (isNew) {
      await tx
        .update(themesTable)
        .set({ followerCount: sql`${themesTable.followerCount} + 1` })
        .where(eq(themesTable.id, themeId));
    }

    const [row] = await tx
      .select()
      .from(themesTable)
      .where(eq(themesTable.id, themeId));

    return { theme: row ?? null, isNew };
  });

  if (!result) {
    return null;
  }

  return { ...result, unsubscribeToken };
}

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

  const result = await addFollower(id, email);

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
      unsubscribeToken: result.unsubscribeToken,
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

function apiUrl(path: string): string {
  const base = process.env.PUBLIC_BASE_URL
    ? process.env.PUBLIC_BASE_URL.replace(/\/$/, "")
    : process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "";
  return `${base}/api${path}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSubscriptionsPage(params: {
  email: string;
  token: string;
  subscriptions: { themeId: number; title: string }[];
}): string {
  const homeLink = `<p style="margin-top:24px"><a href="${escapeHtml(homeUrl())}">Torna a Lamezia Trasparente</a></p>`;

  if (params.subscriptions.length === 0) {
    return `<!doctype html><html lang="it"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Le tue iscrizioni</title><style>body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}.card{background:#fff;padding:32px 40px;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.1);max-width:560px;width:90%;color:#1a1a1a}a{color:#2563eb}</style></head><body><div class="card"><h1>Le tue iscrizioni</h1><p>Non segui più nessun tema.</p>${homeLink}</div></body></html>`;
  }

  const items = params.subscriptions
    .map(
      (s) =>
        `<li style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #eee"><span>${escapeHtml(
          s.title,
        )}</span><form method="post" action="${escapeHtml(
          apiUrl("/subscriptions/unsubscribe"),
        )}" style="margin:0"><input type="hidden" name="token" value="${escapeHtml(
          params.token,
        )}" /><input type="hidden" name="themeId" value="${s.themeId}" /><button type="submit" style="background:#fff;color:#dc2626;border:1px solid #dc2626;padding:8px 16px;border-radius:8px;font-size:14px;cursor:pointer">Annulla</button></form></li>`,
    )
    .join("");

  const unsubscribeAll = `<form method="post" action="${escapeHtml(
    apiUrl("/subscriptions/unsubscribe-all"),
  )}" style="margin-top:24px"><input type="hidden" name="token" value="${escapeHtml(
    params.token,
  )}" /><button type="submit" style="background:#dc2626;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;cursor:pointer">Annulla tutte le iscrizioni</button></form>`;

  return `<!doctype html><html lang="it"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Le tue iscrizioni</title><style>body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}.card{background:#fff;padding:32px 40px;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.1);max-width:560px;width:90%;color:#1a1a1a}ul{list-style:none;padding:0;margin:16px 0 0}a{color:#2563eb}</style></head><body><div class="card"><h1>Le tue iscrizioni</h1><p>Temi seguiti da <strong>${escapeHtml(
    params.email,
  )}</strong>:</p><ul>${items}</ul>${unsubscribeAll}${homeLink}</div></body></html>`;
}

function renderStatusPage(params: {
  title: string;
  message: string;
  withHomeLink?: boolean;
  resubscribe?: { themeId: number; email: string };
  subscriptionsToken?: string;
}): string {
  const subscriptionsLink = params.subscriptionsToken
    ? `<p><a href="${escapeHtml(apiUrl(`/subscriptions?token=${encodeURIComponent(params.subscriptionsToken)}`))}">Gestisci tutte le tue iscrizioni</a></p>`
    : "";
  const link = params.withHomeLink
    ? `<p><a href="${escapeHtml(homeUrl())}">Torna a Lamezia Trasparente</a></p>`
    : "";
  const form = params.resubscribe
    ? `<form method="post" action="${escapeHtml(apiUrl("/resubscribe"))}" style="margin-top:8px"><input type="hidden" name="themeId" value="${params.resubscribe.themeId}" /><input type="hidden" name="email" value="${escapeHtml(params.resubscribe.email)}" /><button type="submit" style="background:#2563eb;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;cursor:pointer">Iscriviti di nuovo</button></form>`
    : "";
  return `<!doctype html><html lang="it"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(params.title)}</title><style>body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}div{background:#fff;padding:32px 40px;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.1);max-width:480px;text-align:center;color:#1a1a1a}a{color:#2563eb}</style></head><body><div><h1>Lamezia Trasparente</h1><p>${params.message}</p>${form}${subscriptionsLink}${link}</div></body></html>`;
}

router.get("/unsubscribe", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";

  const sendPage = (
    message: string,
    withHomeLink = false,
    resubscribe?: { themeId: number; email: string },
    subscriptionsToken?: string,
  ) => {
    res
      .status(200)
      .type("html")
      .send(
        renderStatusPage({
          title: "Iscrizione annullata",
          message,
          withHomeLink,
          resubscribe,
          subscriptionsToken,
        }),
      );
  };

  if (!token) {
    sendPage("Link di annullamento non valido.");
    return;
  }

  const deleted = await db.transaction(async (tx) => {
    const removed = await tx
      .delete(themeFollowersTable)
      .where(eq(themeFollowersTable.unsubscribeToken, token))
      .returning();
    if (removed.length > 0) {
      await tx
        .update(themesTable)
        .set({
          followerCount: sql`GREATEST(${themesTable.followerCount} - 1, 0)`,
        })
        .where(eq(themesTable.id, removed[0].themeId));
    }
    return removed;
  });

  if (deleted.length > 0) {
    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, deleted[0].themeId));

    const { token: remainingToken } = await getSubscriptionsByEmail(
      deleted[0].email,
    );

    const message = theme
      ? `Iscrizione annullata. Non riceverai più aggiornamenti su <strong>${escapeHtml(theme.title)}</strong>.`
      : "Iscrizione annullata. Non riceverai più aggiornamenti su questo tema.";
    sendPage(
      message,
      true,
      {
        themeId: deleted[0].themeId,
        email: deleted[0].email,
      },
      remainingToken ?? undefined,
    );
  } else {
    sendPage("Iscrizione già annullata o link non valido.");
  }
});

router.post("/resubscribe", async (req, res) => {
  const body = req.body as { themeId?: unknown; email?: unknown };
  const themeId = Number(body.themeId);
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  const sendPage = (
    message: string,
    withHomeLink = false,
    subscriptionsToken?: string,
  ) => {
    res
      .status(200)
      .type("html")
      .send(
        renderStatusPage({
          title: "Iscrizione ripristinata",
          message,
          withHomeLink,
          subscriptionsToken,
        }),
      );
  };

  if (Number.isNaN(themeId) || !email) {
    sendPage("Richiesta di iscrizione non valida.");
    return;
  }

  const result = await addFollower(themeId, email);

  if (!result || !result.theme) {
    sendPage("Tema non trovato.");
    return;
  }

  if (result.isNew) {
    void sendFollowConfirmationEmail({
      email,
      themeId,
      themeTitle: result.theme.title,
      unsubscribeToken: result.unsubscribeToken,
    });
  }

  const { token: remainingToken } = await getSubscriptionsByEmail(email);

  const message = `Iscrizione ripristinata. Riceverai di nuovo aggiornamenti su <strong>${escapeHtml(result.theme.title)}</strong>.`;
  sendPage(message, true, remainingToken ?? undefined);
});

async function getEmailByToken(token: string): Promise<string | null> {
  const [follower] = await db
    .select({ email: themeFollowersTable.email })
    .from(themeFollowersTable)
    .where(eq(themeFollowersTable.unsubscribeToken, token));
  return follower?.email ?? null;
}

async function getSubscriptionsByEmail(email: string): Promise<{
  token: string | null;
  subscriptions: { themeId: number; title: string }[];
}> {
  const rows = await db
    .select({
      themeId: themeFollowersTable.themeId,
      title: themesTable.title,
      token: themeFollowersTable.unsubscribeToken,
    })
    .from(themeFollowersTable)
    .innerJoin(themesTable, eq(themeFollowersTable.themeId, themesTable.id))
    .where(eq(themeFollowersTable.email, email))
    .orderBy(themesTable.title);

  return {
    token: rows[0]?.token ?? null,
    subscriptions: rows.map((r) => ({ themeId: r.themeId, title: r.title })),
  };
}

router.get("/subscriptions", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";

  const sendInvalid = () => {
    res
      .status(200)
      .type("html")
      .send(
        renderStatusPage({
          title: "Iscrizioni",
          message: "Link non valido o scaduto.",
          withHomeLink: true,
        }),
      );
  };

  if (!token) {
    sendInvalid();
    return;
  }

  const email = await getEmailByToken(token);
  if (!email) {
    sendInvalid();
    return;
  }

  const { token: pageToken, subscriptions } =
    await getSubscriptionsByEmail(email);

  res
    .status(200)
    .type("html")
    .send(
      renderSubscriptionsPage({
        email,
        token: pageToken ?? token,
        subscriptions,
      }),
    );
});

router.post("/subscriptions/request", async (req, res) => {
  const parsed = RequestSubscriptionsLinkBody.safeParse(req.body);

  // A generic response is returned regardless of outcome so the endpoint
  // never reveals whether an address has subscriptions (no enumeration).
  const genericMessage =
    "Se l'indirizzo ha iscrizioni attive, riceverai un'email con il link per gestirle.";

  if (!parsed.success) {
    res.status(400).json({ error: "Indirizzo email non valido" });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();

  const { token } = await getSubscriptionsByEmail(email);

  void sendSubscriptionsLinkEmail({ email, token });

  res.status(200).json({ message: genericMessage });
});

router.post("/subscriptions/unsubscribe", async (req, res) => {
  const body = req.body as { token?: unknown; themeId?: unknown };
  const token = typeof body.token === "string" ? body.token : "";
  const themeId = Number(body.themeId);

  const sendInvalid = () => {
    res
      .status(200)
      .type("html")
      .send(
        renderStatusPage({
          title: "Iscrizioni",
          message: "Link non valido o scaduto.",
          withHomeLink: true,
        }),
      );
  };

  if (!token || Number.isNaN(themeId)) {
    sendInvalid();
    return;
  }

  const email = await getEmailByToken(token);
  if (!email) {
    sendInvalid();
    return;
  }

  await db.transaction(async (tx) => {
    const deleted = await tx
      .delete(themeFollowersTable)
      .where(
        and(
          eq(themeFollowersTable.email, email),
          eq(themeFollowersTable.themeId, themeId),
        ),
      )
      .returning();
    if (deleted.length > 0) {
      await tx
        .update(themesTable)
        .set({
          followerCount: sql`GREATEST(${themesTable.followerCount} - 1, 0)`,
        })
        .where(eq(themesTable.id, themeId));
    }
  });

  const { token: pageToken, subscriptions } =
    await getSubscriptionsByEmail(email);

  res
    .status(200)
    .type("html")
    .send(
      renderSubscriptionsPage({
        email,
        token: pageToken ?? token,
        subscriptions,
      }),
    );
});

router.post("/subscriptions/unsubscribe-all", async (req, res) => {
  const body = req.body as { token?: unknown };
  const token = typeof body.token === "string" ? body.token : "";

  const sendInvalid = () => {
    res
      .status(200)
      .type("html")
      .send(
        renderStatusPage({
          title: "Iscrizioni",
          message: "Link non valido o scaduto.",
          withHomeLink: true,
        }),
      );
  };

  if (!token) {
    sendInvalid();
    return;
  }

  const email = await getEmailByToken(token);
  if (!email) {
    sendInvalid();
    return;
  }

  await db.transaction(async (tx) => {
    const deleted = await tx
      .delete(themeFollowersTable)
      .where(eq(themeFollowersTable.email, email))
      .returning();
    for (const row of deleted) {
      await tx
        .update(themesTable)
        .set({
          followerCount: sql`GREATEST(${themesTable.followerCount} - 1, 0)`,
        })
        .where(eq(themesTable.id, row.themeId));
    }
  });

  res
    .status(200)
    .type("html")
    .send(
      renderStatusPage({
        title: "Iscrizioni annullate",
        message:
          "Hai annullato tutte le tue iscrizioni. Non riceverai più aggiornamenti.",
        withHomeLink: true,
      }),
    );
});

export default router;
