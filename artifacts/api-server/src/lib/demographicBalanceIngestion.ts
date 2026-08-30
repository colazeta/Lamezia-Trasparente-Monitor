import { createHash } from "node:crypto";
import {
  db,
  demographicObservationsTable,
  demographicReleasesTable,
  demographicSeriesTable,
  feedStatusTable,
  type DemographicReferenceType,
  type DemographicSourceStatus,
} from "@workspace/db";
import { and, eq, like } from "drizzle-orm";
import { logger } from "./logger";
import {
  type BalanceField,
  type BalanceGranularity,
  type DemoIstatResponse,
  balanceSeriesKey,
  extractBalanceRows,
  normalizeDemoLabel,
} from "./demographicBalance";
import {
  canonicalDimensionKey,
  LAMEZIA_ISTAT_CODE,
} from "./demographics";

const DEMO_APP_URL = "https://demo.istat.it/app/";
const DEMO_SEARCH_URL = "https://demo.istat.it/app/RPCCerca.php";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";
const LAMEZIA_MACROAREA_CODE = "4";
const LAMEZIA_REGION_CODE = "18";
const LAMEZIA_PROVINCE_CODE = "079";

export type DemoFormContract = {
  table: "P02" | "D7B";
  years: number[];
  fixedFields: Record<string, string>;
};

type FieldDefinition = {
  field: BalanceField;
  title: string;
  description: string;
  referenceType: DemographicReferenceType;
};

const FIELDS: FieldDefinition[] = [
  {
    field: "births",
    title: "Nati vivi",
    description: "Nati vivi residenti nel periodo di riferimento.",
    referenceType: "flow",
  },
  {
    field: "deaths",
    title: "Morti",
    description: "Decessi di residenti nel periodo di riferimento.",
    referenceType: "flow",
  },
  {
    field: "internalIn",
    title: "Iscritti da altri comuni",
    description: "Iscrizioni anagrafiche provenienti da altri comuni italiani.",
    referenceType: "flow",
  },
  {
    field: "internalOut",
    title: "Cancellati verso altri comuni",
    description: "Cancellazioni anagrafiche verso altri comuni italiani.",
    referenceType: "flow",
  },
  {
    field: "foreignIn",
    title: "Iscritti dall'estero",
    description: "Iscrizioni anagrafiche di persone provenienti dall'estero.",
    referenceType: "flow",
  },
  {
    field: "foreignOut",
    title: "Cancellati per l'estero",
    description: "Cancellazioni anagrafiche di residenti diretti all'estero.",
    referenceType: "flow",
  },
  {
    field: "otherIn",
    title: "Iscritti per altri motivi",
    description: "Iscrizioni anagrafiche per motivi diversi dai trasferimenti di residenza ordinari.",
    referenceType: "flow",
  },
  {
    field: "otherOut",
    title: "Cancellati per altri motivi",
    description: "Cancellazioni anagrafiche per motivi diversi dai trasferimenti di residenza ordinari.",
    referenceType: "flow",
  },
  {
    field: "statisticalAdjustment",
    title: "Aggiustamento statistico",
    description: "Aggiustamento statistico del bilancio demografico definitivo ISTAT.",
    referenceType: "flow",
  },
  {
    field: "coverageAdjustment",
    title: "Saldo di sovra e sotto copertura censuaria",
    description: "Saldo di sovra e sotto copertura censuaria quando diffuso separatamente dalla fonte.",
    referenceType: "flow",
  },
  {
    field: "populationStart",
    title: "Popolazione a inizio periodo",
    description: "Popolazione residente conteggiata all'inizio del periodo.",
    referenceType: "stock",
  },
  {
    field: "populationEnd",
    title: "Popolazione a fine periodo",
    description: "Popolazione residente conteggiata alla fine del periodo.",
    referenceType: "stock",
  },
];

function tableCode(granularity: BalanceGranularity): "P02" | "D7B" {
  return granularity === "annual" ? "P02" : "D7B";
}

function sourceUrl(granularity: BalanceGranularity) {
  return `${DEMO_APP_URL}?i=${tableCode(granularity)}&l=it`;
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function attribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

export function parseDemoFormContract(
  html: string,
  expectedTable: "P02" | "D7B",
): DemoFormContract {
  const formMatch = html.match(
    /<form\b[^>]*id=["']form-0["'][^>]*>([\s\S]*?)<\/form>/i,
  );
  if (!formMatch) throw new Error("ISTAT demo schema changed: form-0 not found");
  const form = formMatch[1];

  const fixedFields: Record<string, string> = {};
  for (const match of form.matchAll(/<input\b[^>]*>/gi)) {
    const tag = match[0];
    if ((attribute(tag, "type") ?? "").toLowerCase() !== "hidden") continue;
    const name = attribute(tag, "name");
    if (!name) continue;
    fixedFields[name] = attribute(tag, "value") ?? "";
  }

  const table = fixedFields["hid-i"];
  if (table !== expectedTable) {
    throw new Error(
      `ISTAT demo schema changed: form-0 hid-i=${table ?? "missing"}, expected ${expectedTable}`,
    );
  }
  for (const required of [
    "hid-i",
    "hid-a",
    "hid-l",
    "hid-cat",
    "hid-dati",
    "hid-tavola",
  ]) {
    if (!(required in fixedFields)) {
      throw new Error(`ISTAT demo schema changed: hidden field ${required} missing`);
    }
  }

  const yearSelect = form.match(
    /<select\b[^>]*name=["']a["'][^>]*>([\s\S]*?)<\/select>/i,
  );
  if (!yearSelect) throw new Error("ISTAT demo schema changed: year selector a missing");
  const years = [
    ...yearSelect[1].matchAll(
      /<option\b[^>]*value=["']?(\d{4})["']?[^>]*>/gi,
    ),
  ]
    .map((item) => Number(item[1]))
    .filter(Number.isInteger);
  const uniqueYears = [...new Set(years)].sort((left, right) => left - right);
  if (!uniqueYears.length) throw new Error("ISTAT demo schema changed: no years in form-0");

  return {
    table: expectedTable,
    years: uniqueYears,
    fixedFields,
  };
}

export function buildPayloadFromContract(
  contract: DemoFormContract,
  year: number,
): Record<string, string> {
  if (!contract.years.includes(year)) {
    throw new Error(
      `ISTAT demo ${contract.table}: year ${year} not declared by form-0`,
    );
  }
  return {
    ...contract.fixedFields,
    a: String(year),
    "hid-a": String(year),
    ripartizione: LAMEZIA_MACROAREA_CODE,
    regione: LAMEZIA_REGION_CODE,
    provincia: LAMEZIA_PROVINCE_CODE,
    comune: LAMEZIA_ISTAT_CODE,
  };
}

function columnTitle(column: { data: string; title: string }) {
  return normalizeDemoLabel(`${column.title} ${column.data}`);
}

function isFinalPopulationStart(title: string) {
  return (
    title.includes("popolazione censita al 1 gennaio") ||
    title.includes("popolazione censita al primo gennaio")
  );
}

function isFinalPopulationEnd(title: string) {
  return title.includes("popolazione censita al 31 dicembre");
}

function isTotalColumn(column: { data: string; title: string }) {
  const text = columnTitle(column);
  const key = column.data.toLowerCase();
  return (
    text.includes(" totale") ||
    text.startsWith("totale ") ||
    text.endsWith(" totale") ||
    /(?:^|[_-])(tot|totale|t|9)$/.test(key)
  );
}

function isSexSpecificColumn(column: { data: string; title: string }) {
  const text = columnTitle(column);
  const key = column.data.toLowerCase();
  return (
    text.includes(" maschi") ||
    text.includes(" femmine") ||
    text.includes(" males") ||
    text.includes(" females") ||
    /(?:^|[_-])(m|f|maschi|femmine|males|females|1|2)$/.test(key)
  );
}

function normalizeColumnSemanticTitle(column: { data: string; title: string }) {
  const original = columnTitle(column);
  if (isFinalPopulationStart(original)) {
    return { ...column, title: `Popolazione iniziale · ${column.title}` };
  }
  if (isFinalPopulationEnd(original)) {
    return { ...column, title: `Popolazione finale · ${column.title}` };
  }
  if (original.includes("altri iscritti")) {
    return { ...column, title: `Iscritti per altri motivi · ${column.title}` };
  }
  if (original.includes("altri cancellati")) {
    return { ...column, title: `Cancellati per altri motivi · ${column.title}` };
  }
  return { ...column };
}

function columnPriority(
  column: { data: string; title: string },
  granularity: BalanceGranularity,
) {
  const text = columnTitle(column);
  let priority = 0;
  if (isTotalColumn(column)) priority += 100;
  if (isSexSpecificColumn(column)) priority -= 50;
  if (
    granularity === "annual" &&
    (text.includes("popolazione iniziale popolazione censita") ||
      text.includes("popolazione finale popolazione censita"))
  ) {
    priority += 200;
  }
  return priority;
}

/**
 * Rende il parser indipendente dal layout del sesso usato dalla risposta.
 * Alcune tavole esprimono Maschi/Femmine/Totale come righe, altre come colonne:
 * in quest'ultimo caso portiamo le colonne Totale davanti alle corrispondenti
 * colonne specifiche per sesso. Le righe non vengono alterate. Per gli stock
 * annuali, la popolazione censita definitiva ha priorità sulla provvisoria.
 *
 * Se la risposta contiene chiavi non elencate in `datatable.columns`, le
 * aggiungiamo come candidati tecnici usando il nome della chiave come titolo;
 * il parser core continuerà comunque a fallire se non riconosce le sei poste
 * obbligatorie, evitando pubblicazioni parziali o ambigue.
 */
export function prepareBalanceResponse(
  response: DemoIstatResponse,
  granularity: BalanceGranularity,
): { response: DemoIstatResponse; hasFinalAnnualStocks: boolean } {
  const datatable = response.datatable;
  if (!datatable) return { response, hasFinalAnnualStocks: false };

  const declared = datatable.columns ?? [];
  const declaredKeys = new Set(declared.map((column) => column.data));
  const firstRow = datatable.data?.[0] ?? {};
  const synthetic = Object.keys(firstRow)
    .filter((key) => !declaredKeys.has(key))
    .map((key) => ({ data: key, title: key }));

  let hasFinalStart = false;
  let hasFinalEnd = false;
  const normalized = [...declared, ...synthetic].map((column) => {
    const original = columnTitle(column);
    if (granularity === "annual" && isFinalPopulationStart(original)) {
      hasFinalStart = true;
    }
    if (granularity === "annual" && isFinalPopulationEnd(original)) {
      hasFinalEnd = true;
    }
    return normalizeColumnSemanticTitle(column);
  });

  const ordered = normalized
    .map((column, index) => ({
      column,
      index,
      priority: columnPriority(column, granularity),
    }))
    .sort((left, right) => right.priority - left.priority || left.index - right.index)
    .map((item) => item.column);

  return {
    response: {
      ...response,
      datatable: {
        ...datatable,
        columns: ordered,
      },
    },
    hasFinalAnnualStocks: hasFinalStart && hasFinalEnd,
  };
}

export function refineAnnualStatus(
  rows: ReturnType<typeof extractBalanceRows>,
  hasFinalAnnualStocks: boolean,
  fallback: DemographicSourceStatus,
) {
  return rows.map((row) => {
    const finalEvidence =
      hasFinalAnnualStocks ||
      row.values.statisticalAdjustment !== undefined ||
      row.values.coverageAdjustment !== undefined;
    return {
      ...row,
      status: finalEvidence ? ("final" as const) : fallback,
    };
  });
}

async function fetchContract(
  granularity: BalanceGranularity,
): Promise<DemoFormContract> {
  const table = tableCode(granularity);
  const response = await fetch(sourceUrl(granularity), {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(
      `ISTAT demo ${table} schema fetch failed with status ${response.status}`,
    );
  }
  return parseDemoFormContract(await response.text(), table);
}

async function fetchYear(
  granularity: BalanceGranularity,
  contract: DemoFormContract,
  year: number,
): Promise<{ raw: string; parsed: DemoIstatResponse }> {
  const response = await fetch(DEMO_SEARCH_URL, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams(buildPayloadFromContract(contract, year)).toString(),
  });
  if (!response.ok) {
    throw new Error(
      `ISTAT demo ${contract.table}/${year} failed with status ${response.status}`,
    );
  }
  const raw = await response.text();
  let parsed: DemoIstatResponse;
  try {
    parsed = JSON.parse(raw) as DemoIstatResponse;
  } catch {
    throw new Error(
      `ISTAT demo ${contract.table}/${year} returned non-JSON payload`,
    );
  }
  if (!parsed.Status) {
    throw new Error(
      `ISTAT demo ${contract.table}/${year} returned Status=false: ${parsed.Messaggio ?? "unknown error"}`,
    );
  }
  return { raw, parsed };
}

async function ensureSeries(
  definition: FieldDefinition,
  granularity: BalanceGranularity,
) {
  const seriesKey = balanceSeriesKey(definition.field, granularity);
  const table = tableCode(granularity);
  const values = {
    title: `${definition.title} · ${granularity === "annual" ? "annuale" : "mensile"}`,
    description: `${definition.description} Serie ${granularity === "annual" ? "annuale" : "mensile"} comunale con release della fonte conservate separatamente.`,
    unit: "persone",
    geographyLevel: "municipality",
    referenceType: definition.referenceType,
    source: "ISTAT",
    sourceDataset: table,
    sourceUrl: sourceUrl(granularity),
    externalKey: `demo:${table}:${definition.field}:${LAMEZIA_ISTAT_CODE}`,
    updatedAt: new Date(),
  } as const;
  const [existing] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, seriesKey));
  if (existing) {
    const [updated] = await db
      .update(demographicSeriesTable)
      .set(values)
      .where(eq(demographicSeriesTable.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(demographicSeriesTable)
    .values({ seriesKey, ...values })
    .returning();
  return created;
}

function payloadHash(table: string, year: number, raw: string) {
  return createHash("sha256")
    .update(`${table}:${year}:`)
    .update(raw)
    .digest("hex");
}

function flags(status: DemographicSourceStatus) {
  if (status === "provisional") return ["source_provisional"];
  if (status === "estimated") return ["source_estimate"];
  if (status === "reconstructed") return ["source_reconstructed"];
  return [];
}

async function persistField(
  definition: FieldDefinition,
  granularity: BalanceGranularity,
  year: number,
  raw: string,
  response: DemoIstatResponse,
  rows: ReturnType<typeof extractBalanceRows>,
) {
  const points = rows
    .filter((row) => row.values[definition.field] !== undefined)
    .map((row) => ({
      period: row.period,
      value: row.values[definition.field]!,
      status: row.status,
    }));
  if (!points.length) return { release: false, observations: 0 };

  const series = await ensureSeries(definition, granularity);
  const table = tableCode(granularity);
  const sourceHash = payloadHash(table, year, raw);
  const [existing] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, series.id),
        eq(demographicReleasesTable.sourceHash, sourceHash),
      ),
    );
  if (existing) return { release: false, observations: 0 };

  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: series.id,
        sourceDataset: `${table}:${year}`,
        sourceUrl: sourceUrl(granularity),
        sourceHash,
        acquiredAt: new Date(),
        rawPayload: raw,
        metadata: {
          table,
          queryYear: year,
          granularity,
          caption: response.caption ?? null,
          note: response.nota ?? null,
          parserVersion: 3,
          contractMode: "self-describing-form-0",
          sexLayout: "row-or-column-total-preferred",
        },
      })
      .returning({ id: demographicReleasesTable.id });

    await tx.insert(demographicObservationsTable).values(
      points.map((point) => ({
        seriesId: series.id,
        releaseId: release.id,
        geographyCode: LAMEZIA_ISTAT_CODE,
        referencePeriod: point.period,
        referenceType: definition.referenceType,
        dimensions: { frequency: granularity },
        dimensionKey: canonicalDimensionKey({ frequency: granularity }),
        value: String(point.value),
        unit: "persone",
        sourceStatus: point.status,
        sourceObservationStatus: null,
        qualityFlags: flags(point.status),
      })),
    );
  });

  return { release: true, observations: points.length };
}

async function yearAlreadyPresent(
  granularity: BalanceGranularity,
  year: number,
) {
  const key = balanceSeriesKey("births", granularity);
  const [series] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, key));
  if (!series) return false;
  const [row] = await db
    .select({ id: demographicObservationsTable.id })
    .from(demographicObservationsTable)
    .where(
      and(
        eq(demographicObservationsTable.seriesId, series.id),
        granularity === "annual"
          ? eq(demographicObservationsTable.referencePeriod, String(year))
          : like(demographicObservationsTable.referencePeriod, `${year}-%`),
      ),
    )
    .limit(1);
  return Boolean(row);
}

async function feedStatus(
  granularity: BalanceGranularity,
  result: {
    status: "ok" | "error";
    observations: number;
    releases: number;
    error?: string;
  },
) {
  const source = `demographics:istat-balance-${granularity}`;
  const now = new Date();
  await db
    .insert(feedStatusTable)
    .values({
      source,
      label:
        granularity === "annual"
          ? "ISTAT – Bilancio demografico annuale (Lamezia Terme)"
          : "ISTAT – Bilancio demografico mensile (Lamezia Terme)",
      url: sourceUrl(granularity),
      status: result.status,
      error: result.error ?? null,
      itemsTotal: result.observations,
      itemsNew: result.releases,
      lastCheckedAt: now,
      lastUpdatedAt: result.releases > 0 ? now : undefined,
    })
    .onConflictDoUpdate({
      target: feedStatusTable.source,
      set: {
        status: result.status,
        error: result.error ?? null,
        itemsTotal: result.observations,
        itemsNew: result.releases,
        lastCheckedAt: now,
        ...(result.releases > 0 ? { lastUpdatedAt: now } : {}),
      },
    });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ingestGranularity(granularity: BalanceGranularity) {
  const contract = await fetchContract(granularity);
  const latestYear = contract.years[contract.years.length - 1];
  let requests = 0;
  let releases = 0;
  let observations = 0;
  const errors: string[] = [];

  for (const year of contract.years) {
    const already = await yearAlreadyPresent(granularity, year);
    if (already && year < latestYear - 1) continue;

    try {
      const fetched = await fetchYear(granularity, contract, year);
      requests++;
      const prepared = prepareBalanceResponse(fetched.parsed, granularity);
      const defaultStatus: DemographicSourceStatus =
        granularity === "monthly"
          ? "provisional"
          : year === latestYear
            ? "provisional"
            : "final";
      let rows = extractBalanceRows(
        prepared.response,
        year,
        granularity,
        defaultStatus,
      );
      if (granularity === "annual") {
        rows = refineAnnualStatus(
          rows,
          prepared.hasFinalAnnualStocks,
          defaultStatus,
        );
      }
      for (const definition of FIELDS) {
        const result = await persistField(
          definition,
          granularity,
          year,
          fetched.raw,
          prepared.response,
          rows,
        );
        if (result.release) releases++;
        observations += result.observations;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${year}: ${message}`);
      logger.error(
        { err, granularity, year },
        "ISTAT demographic balance ingestion failed",
      );
    }
    // opendemografia, costruito sullo stesso endpoint, raccomanda esplicitamente
    // richieste distanziate per evitare blocchi IP dell'infrastruttura ISTAT.
    await delay(1000);
  }

  await feedStatus(granularity, {
    status: errors.length ? "error" : "ok",
    observations,
    releases,
    error: errors.length ? errors.slice(0, 4).join("; ") : undefined,
  });
  return {
    years: contract.years,
    requests,
    releases,
    observations,
    errors,
  };
}

/**
 * Ingestione robusta della Fase B. Il contratto di POST viene letto dal form
 * HTML della tavola a ogni ciclo; non enumeriamo i comuni e non assumiamo campi
 * hidden non dichiarati dalla fonte. Il backfill storico avviene una sola volta,
 * mentre le due annualità più recenti vengono ricontrollate per conservare le
 * revisioni della fonte.
 */
export async function runSelfDescribingDemographicBalanceIngestion() {
  const annual = await ingestGranularity("annual");
  const monthly = await ingestGranularity("monthly");
  logger.info(
    {
      annualRequests: annual.requests,
      monthlyRequests: monthly.requests,
      annualReleases: annual.releases,
      monthlyReleases: monthly.releases,
      errors: annual.errors.length + monthly.errors.length,
    },
    "Self-describing demographic balance ingestion complete",
  );
  return { annual, monthly };
}
