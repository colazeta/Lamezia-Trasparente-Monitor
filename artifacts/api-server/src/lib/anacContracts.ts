import {
  db,
  contractsTable,
  themesTable,
  feedStatusTable,
  classifyMacrotema,
  type InsertContract,
} from "@workspace/db";
import { eq, isNotNull } from "drizzle-orm";
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

// --- Estrazione del beneficiario (aggiudicatario) dal testo dell'atto ---
// Il feed L.190 non espone un campo strutturato per l'aggiudicatario e gli
// endpoint open data ANAC/BDNCP per singolo CIG non sono raggiungibili dal
// server (WAF / 404). Il testo dell'atto (<oggetto>), però, nomina spesso
// l'operatore economico affidatario. Lo estraiamo in modo conservativo,
// privilegiando le forme societarie (Srl, Spa, Soc. Coop., …) per garantire
// alta precisione ed evitare di inquinare le analitiche.
const FORM_SOURCE =
  "(s\\.?\\s?r\\.?\\s?l\\.?\\s?s?|s\\.?\\s?p\\.?\\s?a|s\\.?\\s?n\\.?\\s?c|s\\.?\\s?a\\.?\\s?s|s\\.?\\s?c\\.?\\s?s|società\\s+cooperativa(?:\\s+sociale)?|soc\\.?\\s*coop\\.?(?:\\s*soc(?:\\.|iale)?)?|cooperativa(?:\\s+sociale)?|consorzio|e\\.?\\s?t\\.?\\s?s|o\\.?\\s?n\\.?\\s?l\\.?\\s?u\\.?\\s?s|a\\.?\\s?p\\.?\\s?s)\\b\\.?";
const FORM_RE = new RegExp(`\\b${FORM_SOURCE}`, "i");

// Connettori ammessi all'interno di una ragione sociale ("X di Y", "A & B").
const NAME_CONNECTORS = new Set([
  "di",
  "de",
  "del",
  "della",
  "dei",
  "degli",
  "e",
  "&",
  "-",
]);
// Parole generiche da rimuovere in testa al nome estratto.
const GENERIC_NAME_WORDS = new Set([
  "ente",
  "gestore",
  "operatore",
  "economico",
  "spett",
  "spettabile",
  "ditta",
  "impresa",
  "alla",
  "dalla",
  "società",
  "societa",
  "al",
  "del",
  "della",
]);

function isNameToken(t: string): boolean {
  // Parola che inizia con maiuscola (o acronimo) ammettendo apostrofi/&/cifre.
  return (
    /^[A-ZÀ-Ý0-9&][A-Za-zÀ-ÿ0-9'’&.\-]*$/.test(t) && /[A-ZÀ-Ý]/.test(t)
  );
}

function stripConnectorEdges(tokens: string[]): string[] {
  const out = tokens.slice();
  while (out.length && NAME_CONNECTORS.has(out[0].toLowerCase())) out.shift();
  while (out.length && NAME_CONNECTORS.has(out[out.length - 1].toLowerCase()))
    out.pop();
  return out;
}

// Strategia A (alta precisione): ragione sociale che termina con una forma
// giuridica. Risaliamo a ritroso dai token che precedono la forma.
function extractFromLegalForm(oggetto: string): string | null {
  const g = new RegExp(`\\b${FORM_SOURCE}`, "gi");
  let best: string | null = null;
  let match: RegExpExecArray | null;
  while ((match = g.exec(oggetto))) {
    const formStr = match[0];
    const pre = oggetto.slice(0, match.index).trim();
    if (!pre) continue;
    const preTokens = pre.split(/\s+/);
    const name: string[] = [];
    for (let i = preTokens.length - 1; i >= 0; i--) {
      const t = preTokens[i];
      if (isNameToken(t)) {
        name.unshift(t);
        continue;
      }
      if (
        NAME_CONNECTORS.has(t.toLowerCase()) &&
        name.length > 0 &&
        i > 0 &&
        isNameToken(preTokens[i - 1])
      ) {
        name.unshift(t);
        continue;
      }
      break;
    }
    let tokens = stripConnectorEdges(name);
    while (tokens.length && GENERIC_NAME_WORDS.has(tokens[0].toLowerCase()))
      tokens.shift();
    // Almeno un token distintivo (non generico) di lunghezza significativa.
    const distinctive = tokens.filter(
      (t) =>
        !GENERIC_NAME_WORDS.has(t.toLowerCase()) &&
        t.replace(/[.\-'’]/g, "").length >= 4,
    );
    if (distinctive.length >= 1) {
      const full = clean([...tokens, formStr].join(" "));
      if (!best || full.length > best.length) best = full;
    }
  }
  return best;
}

// Strategia B: frasi introduttive esplicite seguite da un nome proprio, anche
// senza forma giuridica (es. "in favore dell'operatore economico X").
const TRIGGER_RE =
  /(?:in favore (?:dell['’]operatore economico |della società |della ditta |dell['’]impresa |dell['’]associazione |del |della |dell['’]|di )|operatore economico |ente gestore )/i;

function extractFromTrigger(oggetto: string): string | null {
  const m = TRIGGER_RE.exec(oggetto);
  if (!m) return null;
  const rest = oggetto.slice(m.index + m[0].length);
  const cm =
    /^([A-ZÀ-Ý][A-Za-zÀ-ÿ0-9'’&.\- ]{2,70}?)(?=\s*(?:,|\.|;|:|CIG|CUP|P\.?\s?Iva|P\.?\s?I|periodo|per (?:l|i|la|le|gli|un|il)|a seguito|relativ|$))/.exec(
      rest,
    );
  if (!cm) return null;
  const cand = clean(cm[1]);
  const caps = cand.split(/\s+/).filter((t) => isNameToken(t));
  // Richiediamo almeno due token "nome proprio" oppure una forma giuridica,
  // per non scambiare un sostantivo comune per un'azienda.
  if (caps.length >= 2 || FORM_RE.test(cand)) return cand;
  return null;
}

// Restituisce l'aggiudicatario individuato nel testo, oppure null.
export function extractBeneficiario(oggetto: string): string | null {
  if (!oggetto) return null;
  const raw = extractFromLegalForm(oggetto) ?? extractFromTrigger(oggetto);
  if (!raw) return null;
  // Rimuove la punteggiatura di fine frase eventualmente agganciata alla forma.
  const name = raw.replace(/[.,;:]+$/, "").trim();
  return name.length >= 3 ? name : null;
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

// CUP (Codice Unico di Progetto): 15 caratteri alfanumerici che identificano
// in modo univoco un investimento pubblico. È la chiave più affidabile per
// collegare un contratto al tema civico del progetto di cui fa parte.
const CUP_IN_TEXT_RE = /\b([A-Z]\d{2}[A-Z][0-9A-Z]{11})\b/gi;

// Estrae i CUP eventualmente citati nel testo libero di un tema (sintesi o
// descrizione redatte dalla redazione).
export function extractCupsFromText(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(CUP_IN_TEXT_RE)) {
    out.add(m[1].toUpperCase());
  }
  return [...out];
}

// Costruisce la mappa CUP -> themeId usata per associare i contratti ANAC al
// tema corretto. Le associazioni provengono da due fonti complementari:
//  1. i CUP citati nel testo dei temi curati dalla redazione;
//  2. i CUP dei contratti già collegati a un tema (così i nuovi contratti dello
//     stesso progetto ereditano automaticamente il tema).
export function buildCupThemeMap(
  themes: { id: number; summary: string; description: string }[],
  themedContracts: { cup: string | null; themeId: number | null }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of themes) {
    for (const cup of extractCupsFromText(`${t.summary} ${t.description}`)) {
      if (!map.has(cup)) map.set(cup, t.id);
    }
  }
  for (const c of themedContracts) {
    if (c.cup && c.themeId != null) {
      const cup = c.cup.toUpperCase();
      if (!map.has(cup)) map.set(cup, c.themeId);
    }
  }
  return map;
}

// Restituisce il tema da associare a un contratto in base al suo CUP, oppure
// null se non c'è una corrispondenza certa ("dove applicabile").
export function resolveThemeId(
  cup: string | null,
  cupThemeMap: Map<string, number>,
): number | null {
  if (!cup) return null;
  return cupThemeMap.get(cup.toUpperCase()) ?? null;
}

async function loadCupThemeMap(): Promise<Map<string, number>> {
  const [themes, themed] = await Promise.all([
    db
      .select({
        id: themesTable.id,
        summary: themesTable.summary,
        description: themesTable.description,
      })
      .from(themesTable),
    db
      .select({ cup: contractsTable.cup, themeId: contractsTable.themeId })
      .from(contractsTable)
      .where(isNotNull(contractsTable.themeId)),
  ]);
  return buildCupThemeMap(themes, themed);
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
      supplier: extractBeneficiario(oggetto) ?? "Non specificato",
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
      macrotema: classifyMacrotema(`${title} ${oggetto}`),
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

    // Mappa CUP -> tema, per associare ogni contratto al tema corretto.
    const cupThemeMap = await loadCupThemeMap();

    const now = new Date();
    let upserted = 0;
    for (const c of parsed) {
      const themeId = resolveThemeId(c.cup, cupThemeMap);
      const existing = await db
        .select({
          id: contractsTable.id,
          macrotemaManual: contractsTable.macrotemaManual,
        })
        .from(contractsTable)
        .where(eq(contractsTable.sourceId, c.sourceId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(contractsTable)
          .set({
            title: c.title,
            description: c.description,
            supplier: c.supplier,
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
            // Aggiorna il tema solo quando c'è una corrispondenza certa, per
            // non sovrascrivere un collegamento curato manualmente.
            ...(themeId !== null ? { themeId } : {}),
            // Riclassifica il macrotema solo se la redazione non l'ha corretto
            // a mano: in tal caso la scelta manuale è autorevole.
            ...(existing[0].macrotemaManual ? {} : { macrotema: c.macrotema }),
            lastSeenAt: now,
          })
          .where(eq(contractsTable.sourceId, c.sourceId));
      } else {
        await db
          .insert(contractsTable)
          .values({ ...c, themeId, firstSeenAt: now, lastSeenAt: now });
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
