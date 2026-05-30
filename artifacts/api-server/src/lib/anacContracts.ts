import {
  db,
  contractsTable,
  feedStatusTable,
  type InsertContract,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export const ANAC_SOURCE = "anac-contratti-lamezia";
export const ANAC_LABEL =
  "Contratti pubblici ANAC – Comune di Lamezia Terme";
// Portale pubblico ANAC sui contratti pubblici (dati aperti BDNCP).
export const ANAC_PORTAL_URL =
  "https://dati.anticorruzione.it/superset/dashboard/appalti/";

// Codice Fiscale della stazione appaltante (Comune di Lamezia Terme).
const STAZIONE_CF = "00301390795";
const STAZIONE_NOME = "Comune di Lamezia Terme";
// Feed L.190/2012 (sezione "Bandi di gara e contratti") esposto dal medesimo
// provider Tinn dell'Albo Pretorio. CIG/CUP/importo sono nel testo dell'oggetto.
const ANAC_FEED_URL = `https://albo.tinnvision.cloud/export/xml?wich=190&ente=${STAZIONE_CF}`;
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Modalità di scelta del contraente che NON configurano una gara competitiva.
const NON_COMPETITIVE_KEYWORDS = [
  "affidamento diretto",
  "affidamenti diretti",
  "senza gara",
  "senza previa pubblicazione",
  "cottimo fiduciario",
  "in house",
  "trattativa diretta",
  "procedura negoziata senza",
];

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
    .replace(/&nbsp;/g, " ");
}

function clean(s: string | undefined | null): string {
  if (!s) return "";
  return decodeEntities(s.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const m = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i").exec(block);
  return clean(m?.[1] ?? "");
}

// 27/05/2026 -> Date (mezzogiorno, per evitare problemi di fuso).
function parseItDate(s: string): Date | null {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Importo in formato italiano (1.234.567,89) presente nel testo dell'oggetto.
function parseImporto(text: string): string | null {
  const m =
    /(?:€|euro|importo[^0-9]{0,20})\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/i.exec(
      text,
    );
  const raw = m?.[1];
  if (!raw) return null;
  const numeric = Number(raw.replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(numeric) || numeric <= 0) return null;
  return numeric.toFixed(2);
}

function extractCig(text: string): string | null {
  // CIG: 10 caratteri alfanumerici, talvolta preceduti dall'etichetta.
  const m = /CIG[\s:.]*([0-9A-Za-z]{10})/.exec(text);
  return m ? m[1].toUpperCase() : null;
}

function extractCup(text: string): string | null {
  // CUP: 15 caratteri alfanumerici.
  const m = /CUP[\s:.]*([0-9A-Za-z]{15})/.exec(text);
  return m ? m[1].toUpperCase() : null;
}

function deriveProcedure(oggetto: string): string {
  const lower = oggetto.toLowerCase();
  if (lower.includes("affidamento diretto")) return "Affidamento diretto";
  if (lower.includes("procedura negoziata")) return "Procedura negoziata";
  if (lower.includes("procedura aperta")) return "Procedura aperta";
  if (lower.includes("gara")) return "Procedura di gara";
  return "Non specificata";
}

function deriveAcquisitionTool(oggetto: string): string | null {
  const lower = oggetto.toLowerCase();
  if (lower.includes("mepa") || lower.includes("mercato elettronico"))
    return "MePA";
  if (lower.includes("consip")) return "Consip";
  if (lower.includes("convenzione")) return "Convenzione";
  return null;
}

function anacUrlForCig(cig: string): string {
  return `${ANAC_PORTAL_URL}?cig=${cig}`;
}

type ParsedContract = InsertContract & { sourceId: string };

function parseFeed(xml: string): ParsedContract[] {
  const blocks = xml.match(/<pubblicazione>[\s\S]*?<\/pubblicazione>/gi) ?? [];
  const results: ParsedContract[] = [];
  for (const block of blocks) {
    const progressivo = tag(block, "progressivo");
    const oggetto = tag(block, "oggetto");
    if (!progressivo || !oggetto) continue;

    // Solo gli atti con CIG sono contratti pubblici tracciati da ANAC;
    // gli altri atti dell'albo (ordinanze, convocazioni...) vengono scartati.
    const cig = extractCig(oggetto);
    if (!cig) continue;

    const cup = extractCup(oggetto);
    const provenienza = tag(block, "provenienza");
    const tipologia = tag(block, "tipologia");
    const dataAtto =
      parseItDate(tag(block, "data-atto")) ??
      parseItDate(tag(block, "data-reg-gen")) ??
      new Date();
    const procedureType = deriveProcedure(oggetto);
    const acquisitionTool = deriveAcquisitionTool(oggetto);
    const lower = oggetto.toLowerCase();
    const withoutTender = NON_COMPETITIVE_KEYWORDS.some((k) =>
      lower.includes(k),
    );
    const withoutMepa = !(
      acquisitionTool === "MePA" || acquisitionTool === "Consip"
    );

    const title = oggetto.length > 160 ? `${oggetto.slice(0, 157)}…` : oggetto;

    results.push({
      sourceId: `anac-${progressivo}`,
      title,
      description: oggetto,
      supplier: "Non specificato",
      amount: parseImporto(oggetto) ?? "0.00",
      procedureType,
      status: tipologia || "Pubblicato",
      cig,
      cup,
      stazioneAppaltante: provenienza
        ? `${STAZIONE_NOME} – ${provenienza}`
        : STAZIONE_NOME,
      acquisitionTool,
      withoutTender,
      withoutMepa,
      anacUrl: cig ? anacUrlForCig(cig) : ANAC_PORTAL_URL,
      awardDate: dataAtto,
    });
  }
  return results;
}

async function fetchFeed(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/xml, text/xml" },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed with status ${res.status} for ${url}`);
  }
  return res.text();
}

export async function runAnacContractsIngestion(): Promise<{
  total: number;
  upserted: number;
}> {
  logger.info({ source: ANAC_SOURCE }, "Starting ANAC contracts ingestion");
  try {
    const xml = await fetchFeed(ANAC_FEED_URL);
    const parsed = parseFeed(xml);

    const now = new Date();
    let upserted = 0;
    for (const c of parsed) {
      const existing = await db
        .select({ id: contractsTable.id })
        .from(contractsTable)
        .where(eq(contractsTable.sourceId, c.sourceId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(contractsTable)
          .set({
            title: c.title,
            description: c.description,
            amount: c.amount,
            procedureType: c.procedureType,
            status: c.status,
            cig: c.cig,
            cup: c.cup,
            stazioneAppaltante: c.stazioneAppaltante,
            acquisitionTool: c.acquisitionTool,
            withoutTender: c.withoutTender,
            withoutMepa: c.withoutMepa,
            anacUrl: c.anacUrl,
            awardDate: c.awardDate,
            lastSeenAt: now,
          })
          .where(eq(contractsTable.sourceId, c.sourceId));
      } else {
        await db
          .insert(contractsTable)
          .values({ ...c, firstSeenAt: now, lastSeenAt: now });
      }
      upserted += 1;
    }

    await db
      .insert(feedStatusTable)
      .values({
        source: ANAC_SOURCE,
        label: ANAC_LABEL,
        url: ANAC_PORTAL_URL,
        status: "ok",
        error: null,
        itemsTotal: parsed.length,
        itemsNew: upserted,
        lastCheckedAt: now,
        lastUpdatedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: {
          status: "ok",
          error: null,
          itemsTotal: parsed.length,
          itemsNew: upserted,
          lastCheckedAt: now,
          lastUpdatedAt: now,
        },
      });

    logger.info(
      { source: ANAC_SOURCE, total: parsed.length, upserted },
      "ANAC contracts ingestion complete",
    );
    return { total: parsed.length, upserted };
  } catch (err) {
    logger.error({ err, source: ANAC_SOURCE }, "ANAC contracts ingestion failed");
    const now = new Date();
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    await db
      .insert(feedStatusTable)
      .values({
        source: ANAC_SOURCE,
        label: ANAC_LABEL,
        url: ANAC_PORTAL_URL,
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
