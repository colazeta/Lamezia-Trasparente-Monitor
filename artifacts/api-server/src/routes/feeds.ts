import { Router, type IRouter } from "express";
import {
  db,
  publicationsTable,
  contractsTable,
  themesTable,
  themeDocumentsTable,
  themePostsTable,
  themeEmailsTable,
  actsTable,
} from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import {
  buildRssFeed,
  feedUrl,
  siteUrl,
  toPlainText,
  type FeedChannel,
  type FeedItem,
} from "../lib/feeds";
import { mapPublicPublication } from "../lib/publicActProjection";

const router: IRouter = Router();

const RSS_CONTENT_TYPE = "application/rss+xml; charset=utf-8";
const FEED_LIMIT = 50;

function sendFeed(
  res: Parameters<Parameters<IRouter["get"]>[1]>[1],
  channel: FeedChannel,
): void {
  res.setHeader("Content-Type", RSS_CONTENT_TYPE);
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(buildRssFeed(channel));
}

// Link pubblico di un atto dell'Albo: preferisce il documento ufficiale (primo
// allegato) così il lettore apre direttamente il PDF; altrimenti rimanda alla
// pagina pubblica dell'Albo. Il GUID storico non cambia (evita duplicati nei
// reader RSS); il nuovo identificatore cross-surface vive nel namespace lt.
function publicationItem(
  p: typeof publicationsTable.$inferSelect,
  fallback: string,
): FeedItem | null {
  const projected = mapPublicPublication(p);
  if (!projected) return null;
  const descriptionParts = [projected.tipologia];
  if (projected.provenienza) descriptionParts.push(projected.provenienza);
  descriptionParts.push(projected.oggetto);
  const attachment = projected.attachments[0];
  return {
    title: projected.presentation.display_title,
    link: attachment?.storagePath ?? attachment?.officialUrl ?? fallback,
    guid: `albo:${p.progressivo}`,
    publicId: projected.publicId,
    date: feedDate(
      projected.pubStart ?? projected.dataAtto ?? projected.firstSeenAt,
    ),
    description: toPlainText(descriptionParts.join(" — ")),
  };
}

function feedDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function publicationItems(
  rows: (typeof publicationsTable.$inferSelect)[],
  fallback: string,
): FeedItem[] {
  return rows.flatMap((row) => {
    const item = publicationItem(row, fallback);
    return item ? [item] : [];
  });
}

// Feed dell'Albo Pretorio: tutti gli atti pubblicati più recenti.
router.get("/feeds/albo.xml", async (_req, res) => {
  const rows = await db
    .select()
    .from(publicationsTable)
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id))
    .limit(FEED_LIMIT);

  const fallback = siteUrl("/albo");
  sendFeed(res, {
    title: "Albo Pretorio Civico — Lamezia Trasparente",
    link: fallback,
    description:
      "Gli atti pubblicati più recenti dall'Albo Pretorio del Comune di Lamezia Terme, monitorati in modo indipendente.",
    selfUrl: feedUrl("/feeds/albo.xml"),
    items: publicationItems(rows, fallback),
  });
});

// Feed delle delibere (nuove pubblicazioni/delibere).
router.get("/feeds/delibere.xml", async (_req, res) => {
  const rows = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.category, "delibera"))
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id))
    .limit(FEED_LIMIT);

  const fallback = siteUrl("/delibere");
  sendFeed(res, {
    title: "Delibere — Lamezia Trasparente",
    link: fallback,
    description:
      "Le delibere comunali più recenti pubblicate all'Albo Pretorio del Comune di Lamezia Terme.",
    selfUrl: feedUrl("/feeds/delibere.xml"),
    items: publicationItems(rows, fallback),
  });
});

// Feed dei nuovi contratti/appalti pubblici (dati ANAC).
router.get("/feeds/contratti.xml", async (_req, res) => {
  const rows = await db
    .select()
    .from(contractsTable)
    .orderBy(desc(contractsTable.awardDate), desc(contractsTable.id))
    .limit(FEED_LIMIT);

  const eur = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  sendFeed(res, {
    title: "Appalti Pubblici — Lamezia Trasparente",
    link: siteUrl("/contratti"),
    description:
      "I contratti e gli affidamenti pubblici più recenti della stazione appaltante Comune di Lamezia Terme (dati ANAC).",
    selfUrl: feedUrl("/feeds/contratti.xml"),
    items: rows.map((c) => {
      const parts = [`Beneficiario: ${c.supplier}`, `Importo: ${eur.format(Number(c.amount))}`];
      if (c.procedureType) parts.push(`Procedura: ${c.procedureType}`);
      if (c.description) parts.push(c.description);
      return {
        title: c.title,
        link: siteUrl(`/contratti/${c.id}`),
        guid: `contract:${c.id}`,
        date: c.awardDate,
        description: toPlainText(parts.join(" — ")),
      };
    }),
  });
});

// Feed degli aggiornamenti di un singolo Tema: documenti, atti, corrispondenza
// e post della cronistoria, ordinati dal più recente.
router.get("/feeds/temi/:id.xml", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const [theme] = await db
    .select()
    .from(themesTable)
    .where(eq(themesTable.id, id));
  if (!theme) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }

  const themePage = siteUrl(`/temi/${id}`);

  const [documents, emails, acts, posts] = await Promise.all([
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
    db.select().from(actsTable).where(eq(actsTable.themeId, id)),
    db
      .select()
      .from(themePostsTable)
      .where(eq(themePostsTable.themeId, id))
      .orderBy(desc(themePostsTable.eventDate)),
  ]);

  const items: FeedItem[] = [];

  for (const p of posts) {
    items.push({
      title: p.title ?? "Aggiornamento della cronistoria",
      link: themePage,
      guid: `theme:${id}:post:${p.id}`,
      date: p.eventDate,
      description: toPlainText(p.body),
    });
  }
  for (const d of documents) {
    items.push({
      title: `Documento: ${d.title}`,
      link: d.url || themePage,
      guid: `theme:${id}:doc:${d.id}`,
      date: d.date,
      description: toPlainText(`Nuovo documento (${d.type}): ${d.title}`),
    });
  }
  for (const a of acts) {
    items.push({
      title: `Atto: ${a.title}`,
      link: themePage,
      guid: `theme:${id}:act:${a.id}`,
      date: a.publishDate,
      description: toPlainText(a.summary || a.title),
    });
  }
  for (const e of emails) {
    items.push({
      title: `Corrispondenza: ${e.subject}`,
      link: themePage,
      guid: `theme:${id}:email:${e.id}`,
      date: e.date,
      description: toPlainText(`${e.sender} → ${e.recipient}: ${e.subject}`),
    });
  }

  items.sort((a, b) => {
    const ta = a.date ? a.date.getTime() : 0;
    const tb = b.date ? b.date.getTime() : 0;
    return tb - ta;
  });

  sendFeed(res, {
    title: `Tema: ${theme.title} — Lamezia Trasparente`,
    link: themePage,
    description: theme.summary,
    selfUrl: feedUrl(`/feeds/temi/${id}.xml`),
    items: items.slice(0, FEED_LIMIT),
  });
});

export default router;
