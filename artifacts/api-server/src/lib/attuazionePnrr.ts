import {
  db,
  attuazionePnrrProjectsTable,
  feedStatusTable,
  type InsertAttuazionePnrrProject,
  type PnrrAttachment,
} from "@workspace/db";
import { logger } from "./logger";

export const ATTUAZIONE_SOURCE = "attuazione-pnrr-lamezia";
export const ATTUAZIONE_LABEL = "Attuazione Misure PNRR – Comune di Lamezia Terme";
export const ATTUAZIONE_URL =
  "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr";

const BASE_ORIGIN = "https://www.comune.lamezia-terme.cz.it";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";

const IT_MONTHS: Record<string, number> = {
  gen: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mag: 4,
  giu: 5,
  lug: 6,
  ago: 7,
  set: 8,
  ott: 9,
  nov: 10,
  dic: 11,
};

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&agrave;/g, "à")
    .replace(/&egrave;/g, "è")
    .replace(/&eacute;/g, "é")
    .replace(/&igrave;/g, "ì")
    .replace(/&ograve;/g, "ò")
    .replace(/&ugrave;/g, "ù")
    .replace(/&nbsp;/g, " ");
}

function clean(s: string | undefined | null): string | null {
  if (!s) return null;
  const v = decodeEntities(s.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  return v.length ? v : null;
}

function parseItAbbrevDate(s: string | null): Date | null {
  if (!s) return null;
  const m = /(\d{1,2})\s+([a-zA-Zàèéìòù]{3,})\.?\s+(\d{4})/.exec(s);
  if (!m) return null;
  const day = Number(m[1]);
  const month = IT_MONTHS[m[2].slice(0, 3).toLowerCase()];
  const year = Number(m[3]);
  if (month === undefined) return null;
  const d = new Date(year, month, day, 12, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

function extractProjectLinks(indexHtml: string): { sourceId: string; url: string }[] {
  const seen = new Map<string, string>();
  const re = /href="([^"]*\/it\/attuazione-misure-pnrr\/(\d+))"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(indexHtml)) !== null) {
    const sourceId = m[2];
    const url = m[1].startsWith("http") ? m[1] : `${BASE_ORIGIN}${m[1]}`;
    if (!seen.has(sourceId)) seen.set(sourceId, url);
  }
  return Array.from(seen.entries()).map(([sourceId, url]) => ({ sourceId, url }));
}

function field(descBlock: string, label: string): string | null {
  const re = new RegExp(
    `<b>\\s*${label}\\s*:?\\s*</b>([\\s\\S]*?)(?:</p>|<p>|<b>)`,
    "i",
  );
  const m = re.exec(descBlock);
  return clean(m?.[1] ?? null);
}

function sectionContent(html: string, anchorId: string): string | null {
  const idx = html.indexOf(`id="${anchorId}"`);
  if (idx === -1) return null;
  return html.slice(idx, idx + 4000);
}

function parseProject(
  sourceId: string,
  url: string,
  html: string,
): InsertAttuazionePnrrProject {
  const titleMatch =
    /data-element="attuator-title"[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  const title =
    clean(titleMatch?.[1] ?? null) ?? `Progetto PNRR ${sourceId}`;

  const mission = field(html, "Missione");
  const component = field(html, "Componente");
  const investment = field(html, "Investimento");
  const intervention = field(html, "Intervento");
  const holder = field(html, "Titolare");
  const attuatore = field(html, "Soggetto Attuatore");
  let cup = field(html, "CUP");
  if (cup) cup = cup.toUpperCase().replace(/\s+/g, "");

  const status =
    field(html, "Stato di avanzamento") ?? field(html, "Stato");
  const startDate = parseItAbbrevDate(
    field(html, "Data di avvio") ?? field(html, "Data avvio"),
  );
  const endDate = parseItAbbrevDate(
    field(html, "Data di fine") ??
      field(html, "Data fine") ??
      field(html, "Data di conclusione"),
  );

  // Importo finanziato: lo memorizziamo come valore numerico (stringa decimale,
  // come contracts.amount) così è ordinabile/sommabile. Il formato sorgente è
  // italiano (es. "1.234.567,89 €").
  let importoFinanziato: string | null = null;
  const importoSection = sectionContent(html, "importo-finanziato");
  if (importoSection) {
    const euro = /([\d.]+,\d{2})\s*&euro;|([\d.]+,\d{2})\s*€/.exec(
      importoSection,
    );
    const raw = euro ? (euro[1] ?? euro[2]).trim() : null;
    if (raw) {
      const numeric = Number(raw.replace(/\./g, "").replace(",", "."));
      if (!Number.isNaN(numeric) && numeric > 0) {
        importoFinanziato = numeric.toFixed(2);
      }
    }
  }

  const pubMatch =
    /Data di [Pp]ubblicazione\s*:?\s*([0-9]{1,2}\s+[a-zA-Zàèéìòù]{3,}\.?\s+[0-9]{4})/.exec(
      html,
    );
  const publishedAt = parseItAbbrevDate(pubMatch?.[1] ?? null);

  const attachments: PnrrAttachment[] = [];
  const seenUrls = new Set<string>();
  const attSection = sectionContent(html, "atti-legislativi-e-amministrativi");
  if (attSection) {
    const linkRe = /<a\s+href="([^"]+\.(?:pdf|p7m|zip|docx?|xlsx?))"[^>]*>([\s\S]*?)<\/a>/gi;
    let lm: RegExpExecArray | null;
    while ((lm = linkRe.exec(attSection)) !== null) {
      const rawUrl = lm[1];
      const attUrl = rawUrl.startsWith("http")
        ? rawUrl
        : `${BASE_ORIGIN}${rawUrl}`;
      if (seenUrls.has(attUrl)) continue;
      seenUrls.add(attUrl);
      const attTitle =
        clean(lm[2]) ?? attUrl.split("/").pop() ?? "Allegato";
      attachments.push({ title: attTitle, url: attUrl });
    }
  }

  return {
    sourceId,
    url,
    title,
    mission,
    component,
    investment,
    intervention,
    holder,
    attuatore,
    cup,
    importoFinanziato,
    status,
    startDate,
    endDate,
    publishedAt,
    attachments,
  };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Fetch failed with status ${res.status} for ${url}`);
  }
  return res.text();
}

export async function runAttuazioneIngestion(): Promise<{
  total: number;
  upserted: number;
}> {
  logger.info({ source: ATTUAZIONE_SOURCE }, "Starting attuazione PNRR ingestion");
  try {
    const indexHtml = await fetchText(ATTUAZIONE_URL);
    const links = extractProjectLinks(indexHtml);

    const projects: InsertAttuazionePnrrProject[] = [];
    for (const link of links) {
      try {
        const html = await fetchText(link.url);
        projects.push(parseProject(link.sourceId, link.url, html));
      } catch (err) {
        logger.warn(
          { err, url: link.url, source: ATTUAZIONE_SOURCE },
          "Failed to fetch/parse attuazione project, skipping",
        );
      }
    }

    const now = new Date();
    let upserted = 0;
    for (const p of projects) {
      await db
        .insert(attuazionePnrrProjectsTable)
        .values({ ...p, firstSeenAt: now, lastSeenAt: now })
        .onConflictDoUpdate({
          target: attuazionePnrrProjectsTable.sourceId,
          set: {
            url: p.url,
            title: p.title,
            mission: p.mission,
            component: p.component,
            investment: p.investment,
            intervention: p.intervention,
            holder: p.holder,
            attuatore: p.attuatore,
            cup: p.cup,
            importoFinanziato: p.importoFinanziato,
            status: p.status,
            startDate: p.startDate,
            endDate: p.endDate,
            publishedAt: p.publishedAt,
            attachments: p.attachments,
            lastSeenAt: now,
          },
        });
      upserted += 1;
    }

    await db
      .insert(feedStatusTable)
      .values({
        source: ATTUAZIONE_SOURCE,
        label: ATTUAZIONE_LABEL,
        url: ATTUAZIONE_URL,
        status: "ok",
        error: null,
        itemsTotal: projects.length,
        itemsNew: upserted,
        lastCheckedAt: now,
        lastUpdatedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: {
          status: "ok",
          error: null,
          itemsTotal: projects.length,
          itemsNew: upserted,
          lastCheckedAt: now,
          lastUpdatedAt: now,
        },
      });

    logger.info(
      { source: ATTUAZIONE_SOURCE, total: projects.length, upserted },
      "Attuazione PNRR ingestion complete",
    );
    return { total: projects.length, upserted };
  } catch (err) {
    logger.error(
      { err, source: ATTUAZIONE_SOURCE },
      "Attuazione PNRR ingestion failed",
    );
    const now = new Date();
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    await db
      .insert(feedStatusTable)
      .values({
        source: ATTUAZIONE_SOURCE,
        label: ATTUAZIONE_LABEL,
        url: ATTUAZIONE_URL,
        status: "error",
        error: message,
        lastCheckedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: { status: "error", error: message, lastCheckedAt: now },
      });
    throw err;
  }
}
