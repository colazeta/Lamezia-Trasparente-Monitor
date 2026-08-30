import { createHash } from "node:crypto";
import {
  db,
  demographicSeriesTable,
  demographicReleasesTable,
  demographicObservationsTable,
  feedStatusTable,
  type DemographicReferenceType,
  type DemographicSourceStatus,
} from "@workspace/db";
import { and, asc, desc, eq, inArray, like } from "drizzle-orm";
import { logger } from "./logger";
import {
  canonicalDimensionKey,
  getCurrentPopulationPoints,
  LAMEZIA_ISTAT_CODE,
} from "./demographics";

const DEMO_APP_URL = "https://demo.istat.it/app/";
const DEMO_SEARCH_URL = "https://demo.istat.it/app/RPCCerca.php";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";
const LAMEZIA_REGION_CODE = "18";
const LAMEZIA_PROVINCE_CODE = "079";
const LAMEZIA_MACROAREA_CODE = "4";

export type BalanceGranularity = "annual" | "monthly";
export type BalanceField =
  | "births"
  | "deaths"
  | "internalIn"
  | "internalOut"
  | "foreignIn"
  | "foreignOut"
  | "otherIn"
  | "otherOut"
  | "statisticalAdjustment"
  | "coverageAdjustment"
  | "populationStart"
  | "populationEnd";

type DemoColumn = { data: string; title: string };
type DemoRow = Record<string, unknown>;

export type DemoIstatResponse = {
  Status: boolean;
  Messaggio?: string | null;
  type?: string;
  caption?: string | null;
  nota?: string | null;
  datatable?: {
    data?: DemoRow[];
    columns?: DemoColumn[];
  };
};

type FieldDefinition = {
  field: BalanceField;
  seriesStem: string;
  title: string;
  description: string;
  referenceType: DemographicReferenceType;
  aliases: string[];
  excludes?: string[];
};

const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    field: "births",
    seriesStem: "births",
    title: "Nati vivi",
    description: "Nati vivi residenti nel periodo di riferimento.",
    referenceType: "flow",
    aliases: ["nati vivi", "nati"],
    excludes: ["saldo"],
  },
  {
    field: "deaths",
    seriesStem: "deaths",
    title: "Morti",
    description: "Decessi di residenti nel periodo di riferimento.",
    referenceType: "flow",
    aliases: ["morti", "decessi"],
    excludes: ["saldo"],
  },
  {
    field: "internalIn",
    seriesStem: "registrations-from-other-municipalities",
    title: "Iscritti da altri comuni",
    description: "Iscrizioni anagrafiche provenienti da altri comuni italiani.",
    referenceType: "flow",
    aliases: [
      "iscritti da altri comuni",
      "iscritti da altro comune",
      "immigrati da altri comuni",
      "immigrati da altro comune",
    ],
  },
  {
    field: "internalOut",
    seriesStem: "cancellations-to-other-municipalities",
    title: "Cancellati verso altri comuni",
    description: "Cancellazioni anagrafiche verso altri comuni italiani.",
    referenceType: "flow",
    aliases: [
      "cancellati per altri comuni",
      "cancellati per altro comune",
      "emigrati per altri comuni",
      "emigrati per altro comune",
    ],
  },
  {
    field: "foreignIn",
    seriesStem: "registrations-from-abroad",
    title: "Iscritti dall'estero",
    description: "Iscrizioni anagrafiche di persone provenienti dall'estero.",
    referenceType: "flow",
    aliases: ["iscritti dall estero", "immigrati dall estero"],
  },
  {
    field: "foreignOut",
    seriesStem: "cancellations-to-abroad",
    title: "Cancellati per l'estero",
    description: "Cancellazioni anagrafiche di residenti diretti all'estero.",
    referenceType: "flow",
    aliases: ["cancellati per l estero", "emigrati per l estero"],
  },
  {
    field: "otherIn",
    seriesStem: "registrations-other-reasons",
    title: "Iscritti per altri motivi",
    description: "Iscrizioni anagrafiche per motivi diversi dai trasferimenti di residenza ordinari.",
    referenceType: "flow",
    aliases: ["iscritti per altri motivi", "iscritti per altro motivo"],
  },
  {
    field: "otherOut",
    seriesStem: "cancellations-other-reasons",
    title: "Cancellati per altri motivi",
    description: "Cancellazioni anagrafiche per motivi diversi dai trasferimenti di residenza ordinari.",
    referenceType: "flow",
    aliases: ["cancellati per altri motivi", "cancellati per altro motivo"],
  },
  {
    field: "statisticalAdjustment",
    seriesStem: "statistical-adjustment",
    title: "Aggiustamento statistico",
    description: "Posta di aggiustamento statistico del bilancio demografico definitivo ISTAT.",
    referenceType: "flow",
    aliases: ["aggiustamento statistico"],
  },
  {
    field: "coverageAdjustment",
    seriesStem: "census-coverage-balance",
    title: "Saldo di sovra e sotto copertura censuaria",
    description: "Saldo delle operazioni di sovra e sotto copertura censuaria quando diffuso dalla fonte.",
    referenceType: "flow",
    aliases: [
      "saldo di sovra e sotto copertura censuaria",
      "saldo sovra e sotto copertura censuaria",
      "sovra e sotto copertura",
    ],
  },
  {
    field: "populationStart",
    seriesStem: "population-start-period",
    title: "Popolazione a inizio periodo",
    description: "Popolazione residente conteggiata all'inizio del periodo di riferimento.",
    referenceType: "stock",
    aliases: [
      "popolazione al 1 gennaio",
      "popolazione inizio periodo",
      "popolazione a inizio periodo",
      "popolazione iniziale",
    ],
  },
  {
    field: "populationEnd",
    seriesStem: "population-end-period",
    title: "Popolazione a fine periodo",
    description: "Popolazione residente conteggiata alla fine del periodo di riferimento.",
    referenceType: "stock",
    aliases: [
      "popolazione al 31 dicembre",
      "popolazione fine periodo",
      "popolazione a fine periodo",
      "popolazione finale",
    ],
  },
];

const CORE_FIELDS: BalanceField[] = [
  "births",
  "deaths",
  "internalIn",
  "internalOut",
  "foreignIn",
  "foreignOut",
];

const MONTHS: Record<string, number> = {
  gennaio: 1,
  febbraio: 2,
  marzo: 3,
  aprile: 4,
  maggio: 5,
  giugno: 6,
  luglio: 7,
  agosto: 8,
  settembre: 9,
  ottobre: 10,
  novembre: 11,
  dicembre: 12,
};

function datasetCode(granularity: BalanceGranularity) {
  return granularity === "annual" ? "P02" : "D7B";
}

function sourcePage(granularity: BalanceGranularity) {
  return `${DEMO_APP_URL}?i=${datasetCode(granularity)}&l=it`;
}

function feedSource(granularity: BalanceGranularity) {
  return `demographics:istat-balance-${granularity}`;
}

function feedLabel(granularity: BalanceGranularity) {
  return granularity === "annual"
    ? "ISTAT – Bilancio demografico annuale (Lamezia Terme)"
    : "ISTAT – Bilancio demografico mensile (Lamezia Terme)";
}

export function balanceSeriesKey(
  field: BalanceField,
  granularity: BalanceGranularity,
): string {
  const definition = FIELD_DEFINITIONS.find((item) => item.field === field);
  if (!definition) throw new Error(`Unknown demographic balance field: ${field}`);
  return `${definition.seriesStem}-${granularity}`;
}

export function normalizeDemoLabel(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseAvailableYears(html: string): number[] {
  const match = html.match(
    /<select[^>]*name=["']a["'][^>]*>([\s\S]*?)<\/select>/i,
  );
  if (!match) return [];
  const years = [...match[1].matchAll(/<option[^>]*value=["']?(\d{4})["']?[^>]*>/gi)]
    .map((item) => Number(item[1]))
    .filter((year) => Number.isInteger(year));
  return [...new Set(years)].sort((left, right) => left - right);
}

function columnText(column: DemoColumn) {
  return normalizeDemoLabel(`${column.title} ${column.data}`);
}

function findColumn(
  columns: DemoColumn[],
  aliases: string[],
  excludes: string[] = [],
): DemoColumn | null {
  const normalizedAliases = aliases.map(normalizeDemoLabel);
  const normalizedExcludes = excludes.map(normalizeDemoLabel);
  return (
    columns.find((column) => {
      const text = columnText(column);
      if (normalizedExcludes.some((value) => text.includes(value))) return false;
      return normalizedAliases.some(
        (alias) => text === alias || text.includes(alias),
      );
    }) ?? null
  );
}

function findSexColumn(columns: DemoColumn[]) {
  return findColumn(columns, ["sesso", "sex"]);
}

function findMonthColumn(columns: DemoColumn[]) {
  return findColumn(columns, ["mese", "month"]);
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-" || trimmed === "..") return null;
  const normalized = trimmed
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function monthNumber(value: unknown): number | null {
  if (typeof value === "number" && value >= 1 && value <= 12) return value;
  const normalized = normalizeDemoLabel(String(value ?? ""));
  const numeric = Number(normalized);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 12) return numeric;
  return MONTHS[normalized] ?? null;
}

function isTotalSex(value: unknown): boolean {
  const normalized = normalizeDemoLabel(String(value ?? ""));
  return (
    normalized === "totale" ||
    normalized === "total" ||
    normalized === "t" ||
    normalized === "9" ||
    normalized === "maschi e femmine" ||
    normalized === "mf"
  );
}

function pickTotalRow(rows: DemoRow[], sexColumn: DemoColumn | null): DemoRow {
  if (rows.length === 1) return rows[0];
  if (sexColumn) {
    const total = rows.find((row) => isTotalSex(row[sexColumn.data]));
    if (total) return total;
  }
  const explicitTotal = rows.find((row) =>
    Object.values(row).some((value) => isTotalSex(value)),
  );
  if (explicitTotal) return explicitTotal;
  throw new Error(
    `ISTAT schema ambiguous: ${rows.length} rows for one period and no total-sex row`,
  );
}

function statusFromResponse(
  response: DemoIstatResponse,
  fallback: DemographicSourceStatus,
): DemographicSourceStatus {
  const text = normalizeDemoLabel(`${response.caption ?? ""} ${response.nota ?? ""}`);
  if (text.includes("provvisor")) return "provisional";
  if (text.includes("ricostru")) return "reconstructed";
  if (text.includes("stima") || text.includes("stimato")) return "estimated";
  if (text.includes("definitiv")) return "final";
  return fallback;
}

export type ExtractedBalanceRow = {
  period: string;
  status: DemographicSourceStatus;
  values: Partial<Record<BalanceField, number>>;
};

export function extractBalanceRows(
  response: DemoIstatResponse,
  year: number,
  granularity: BalanceGranularity,
  defaultStatus: DemographicSourceStatus,
): ExtractedBalanceRow[] {
  if (!response.Status) {
    throw new Error(response.Messaggio || "ISTAT demo returned Status=false");
  }
  const columns = response.datatable?.columns ?? [];
  const rows = response.datatable?.data ?? [];
  if (!columns.length || !rows.length) {
    throw new Error("ISTAT demo response has no datatable rows/columns");
  }

  const fieldColumns = new Map<BalanceField, DemoColumn>();
  for (const definition of FIELD_DEFINITIONS) {
    const column = findColumn(
      columns,
      definition.aliases,
      definition.excludes,
    );
    if (column) fieldColumns.set(definition.field, column);
  }

  const missingCore = CORE_FIELDS.filter((field) => !fieldColumns.has(field));
  if (missingCore.length) {
    throw new Error(
      `ISTAT balance schema changed: missing core fields ${missingCore.join(", ")}; columns=${columns
        .map((column) => column.title)
        .join(" | ")}`,
    );
  }

  const sexColumn = findSexColumn(columns);
  const monthColumn = granularity === "monthly" ? findMonthColumn(columns) : null;
  if (granularity === "monthly" && !monthColumn) {
    throw new Error(
      `ISTAT monthly balance schema changed: month column not found; columns=${columns
        .map((column) => column.title)
        .join(" | ")}`,
    );
  }

  const groups = new Map<string, DemoRow[]>();
  for (const row of rows) {
    let period = String(year);
    if (granularity === "monthly") {
      const month = monthNumber(row[monthColumn!.data]);
      if (!month) continue;
      period = `${year}-${String(month).padStart(2, "0")}`;
    }
    const group = groups.get(period) ?? [];
    group.push(row);
    groups.set(period, group);
  }

  const status = statusFromResponse(response, defaultStatus);
  return [...groups.entries()]
    .map(([period, group]) => {
      const row = pickTotalRow(group, sexColumn);
      const values: Partial<Record<BalanceField, number>> = {};
      for (const [field, column] of fieldColumns) {
        const value = numberValue(row[column.data]);
        if (value !== null) values[field] = value;
      }
      return { period, status, values };
    })
    .filter((row) => CORE_FIELDS.every((field) => row.values[field] !== undefined))
    .sort((left, right) => left.period.localeCompare(right.period));
}

export function buildDemoPayload(
  table: "P02" | "D7B",
  year: number,
): Record<string, string> {
  return {
    a: String(year),
    ripartizione: LAMEZIA_MACROAREA_CODE,
    regione: LAMEZIA_REGION_CODE,
    provincia: LAMEZIA_PROVINCE_CODE,
    comune: LAMEZIA_ISTAT_CODE,
    "hid-i": table,
    "hid-a": String(year),
    "hid-l": "it",
    "hid-cat": table,
    "hid-dati": "dati-form-0",
    "hid-tavola": "tavola-form-0",
  };
}

async function discoverYears(
  granularity: BalanceGranularity,
): Promise<number[]> {
  const code = datasetCode(granularity);
  const response = await fetch(`${DEMO_APP_URL}?i=${code}&l=it`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`ISTAT demo year discovery failed with status ${response.status}`);
  }
  const years = parseAvailableYears(await response.text());
  if (!years.length) {
    throw new Error(`ISTAT demo ${code}: no years found in self-describing table page`);
  }
  return years;
}

async function fetchDemoYear(
  granularity: BalanceGranularity,
  year: number,
): Promise<{ raw: string; parsed: DemoIstatResponse }> {
  const table = datasetCode(granularity);
  const response = await fetch(DEMO_SEARCH_URL, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams(buildDemoPayload(table, year)).toString(),
  });
  if (!response.ok) {
    throw new Error(`ISTAT demo ${table}/${year} failed with status ${response.status}`);
  }
  const raw = await response.text();
  let parsed: DemoIstatResponse;
  try {
    parsed = JSON.parse(raw) as DemoIstatResponse;
  } catch {
    throw new Error(`ISTAT demo ${table}/${year} returned non-JSON payload`);
  }
  if (!parsed.Status) {
    throw new Error(
      `ISTAT demo ${table}/${year} returned Status=false: ${parsed.Messaggio ?? "unknown error"}`,
    );
  }
  return { raw, parsed };
}

async function ensureBalanceSeries(
  definition: FieldDefinition,
  granularity: BalanceGranularity,
) {
  const seriesKey = balanceSeriesKey(definition.field, granularity);
  const sourceDataset = datasetCode(granularity);
  const values = {
    title: `${definition.title} · ${granularity === "annual" ? "annuale" : "mensile"}`,
    description: `${definition.description} Serie ${granularity === "annual" ? "annuale" : "mensile"} comunale, con release della fonte conservate separatamente.`,
    unit: "persone",
    geographyLevel: "municipality",
    referenceType: definition.referenceType,
    source: "ISTAT",
    sourceDataset,
    sourceUrl: sourcePage(granularity),
    externalKey: `demo:${sourceDataset}:${definition.field}:079160`,
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select()
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

function hashPayload(table: string, year: number, payload: string) {
  return createHash("sha256")
    .update(`${table}:${year}:`)
    .update(payload)
    .digest("hex");
}

function qualityFlags(status: DemographicSourceStatus): string[] {
  if (status === "provisional") return ["source_provisional"];
  if (status === "reconstructed") return ["source_reconstructed"];
  if (status === "estimated") return ["source_estimate"];
  return [];
}

async function persistFieldRelease(
  definition: FieldDefinition,
  granularity: BalanceGranularity,
  year: number,
  rawPayload: string,
  response: DemoIstatResponse,
  extracted: ExtractedBalanceRow[],
): Promise<{ releaseInserted: boolean; observationsInserted: number }> {
  const points = extracted
    .filter((row) => row.values[definition.field] !== undefined)
    .map((row) => ({
      period: row.period,
      value: row.values[definition.field]!,
      status: row.status,
    }));
  if (!points.length) return { releaseInserted: false, observationsInserted: 0 };

  const series = await ensureBalanceSeries(definition, granularity);
  const table = datasetCode(granularity);
  const hash = hashPayload(table, year, rawPayload);
  const [existing] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, series.id),
        eq(demographicReleasesTable.sourceHash, hash),
      ),
    );
  if (existing) return { releaseInserted: false, observationsInserted: 0 };

  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: series.id,
        sourceDataset: `${table}:${year}`,
        sourceUrl: sourcePage(granularity),
        sourceHash: hash,
        acquiredAt: new Date(),
        rawPayload,
        metadata: {
          table,
          queryYear: year,
          granularity,
          caption: response.caption ?? null,
          note: response.nota ?? null,
          parserVersion: 1,
          sharedPayloadHash: createHash("sha256").update(rawPayload).digest("hex"),
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
        qualityFlags: qualityFlags(point.status),
      })),
    );
  });

  return { releaseInserted: true, observationsInserted: points.length };
}

async function hasYearData(
  granularity: BalanceGranularity,
  year: number,
): Promise<boolean> {
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

async function recordBalanceFeedStatus(
  granularity: BalanceGranularity,
  outcome: {
    status: "ok" | "error";
    observations: number;
    releases: number;
    requests: number;
    error?: string;
  },
) {
  const now = new Date();
  await db
    .insert(feedStatusTable)
    .values({
      source: feedSource(granularity),
      label: feedLabel(granularity),
      url: sourcePage(granularity),
      status: outcome.status,
      error: outcome.error ?? null,
      itemsTotal: outcome.observations,
      itemsNew: outcome.releases,
      lastCheckedAt: now,
      lastUpdatedAt: outcome.releases > 0 ? now : undefined,
    })
    .onConflictDoUpdate({
      target: feedStatusTable.source,
      set: {
        label: feedLabel(granularity),
        url: sourcePage(granularity),
        status: outcome.status,
        error: outcome.error ?? null,
        itemsTotal: outcome.observations,
        itemsNew: outcome.releases,
        lastCheckedAt: now,
        ...(outcome.releases > 0 ? { lastUpdatedAt: now } : {}),
      },
    });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ingestGranularity(
  granularity: BalanceGranularity,
  latestAnnualYear: number | null,
): Promise<{
  years: number[];
  requests: number;
  releases: number;
  observations: number;
  errors: string[];
}> {
  const years = await discoverYears(granularity);
  const latest = years[years.length - 1];
  let requests = 0;
  let releases = 0;
  let observations = 0;
  const errors: string[] = [];

  for (const year of years) {
    // Backfill storico una sola volta; nelle esecuzioni periodiche ricontrolliamo
    // solo le ultime due annualità, dove revisioni/consolidamenti sono plausibili.
    const historicalAlreadyPresent = await hasYearData(granularity, year);
    const refreshFloor = latest - 1;
    if (historicalAlreadyPresent && year < refreshFloor) continue;

    try {
      const payload = await fetchDemoYear(granularity, year);
      requests++;
      const fallbackStatus: DemographicSourceStatus =
        granularity === "annual"
          ? "final"
          : latestAnnualYear !== null && year <= latestAnnualYear
            ? "final"
            : "provisional";
      const extracted = extractBalanceRows(
        payload.parsed,
        year,
        granularity,
        fallbackStatus,
      );
      for (const definition of FIELD_DEFINITIONS) {
        const result = await persistFieldRelease(
          definition,
          granularity,
          year,
          payload.raw,
          payload.parsed,
          extracted,
        );
        if (result.releaseInserted) releases++;
        observations += result.observationsInserted;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${year}: ${message}`);
      logger.error(
        { err, granularity, year },
        "ISTAT demographic balance year ingestion failed",
      );
    }

    // Il portale demo.istat.it applica limiti d'uso: il backfill comunale resta
    // mirato e seriale, con una breve pausa tra richieste annuali.
    await delay(300);
  }

  await recordBalanceFeedStatus(granularity, {
    status: errors.length ? "error" : "ok",
    observations,
    releases,
    requests,
    error: errors.length ? errors.slice(0, 4).join("; ") : undefined,
  });

  return { years, requests, releases, observations, errors };
}

export async function runDemographicBalanceIngestion() {
  const annualYears = await discoverYears("annual");
  const latestAnnualYear = annualYears.length
    ? annualYears[annualYears.length - 1]
    : null;
  const annual = await ingestGranularity("annual", latestAnnualYear);
  const monthly = await ingestGranularity("monthly", latestAnnualYear);

  logger.info(
    {
      annualRequests: annual.requests,
      annualReleases: annual.releases,
      monthlyRequests: monthly.requests,
      monthlyReleases: monthly.releases,
      errors: [...annual.errors, ...monthly.errors].length,
    },
    "Demographic balance ingestion complete",
  );
  return { annual, monthly };
}

type CurrentSeriesPoint = {
  period: string;
  value: number;
  sourceStatus: DemographicSourceStatus;
  releaseId: number;
  acquiredAt: Date;
};

async function currentPointsForKeys(
  keys: string[],
): Promise<Map<string, CurrentSeriesPoint[]>> {
  const series = await db
    .select({ id: demographicSeriesTable.id, seriesKey: demographicSeriesTable.seriesKey })
    .from(demographicSeriesTable)
    .where(inArray(demographicSeriesTable.seriesKey, keys));
  if (!series.length) return new Map();

  const keyById = new Map(series.map((item) => [item.id, item.seriesKey]));
  const rows = await db
    .select({
      seriesId: demographicObservationsTable.seriesId,
      period: demographicObservationsTable.referencePeriod,
      value: demographicObservationsTable.value,
      sourceStatus: demographicObservationsTable.sourceStatus,
      releaseId: demographicReleasesTable.id,
      acquiredAt: demographicReleasesTable.acquiredAt,
    })
    .from(demographicObservationsTable)
    .innerJoin(
      demographicReleasesTable,
      eq(demographicObservationsTable.releaseId, demographicReleasesTable.id),
    )
    .where(
      and(
        inArray(demographicObservationsTable.seriesId, series.map((item) => item.id)),
        eq(demographicObservationsTable.geographyCode, LAMEZIA_ISTAT_CODE),
      ),
    )
    .orderBy(
      asc(demographicReleasesTable.acquiredAt),
      asc(demographicReleasesTable.id),
      asc(demographicObservationsTable.referencePeriod),
    );

  const current = new Map<string, Map<string, CurrentSeriesPoint>>();
  for (const row of rows) {
    const key = keyById.get(row.seriesId);
    if (!key) continue;
    const byPeriod = current.get(key) ?? new Map<string, CurrentSeriesPoint>();
    byPeriod.set(row.period, {
      period: row.period,
      value: Number(row.value),
      sourceStatus: row.sourceStatus as DemographicSourceStatus,
      releaseId: row.releaseId,
      acquiredAt: row.acquiredAt,
    });
    current.set(key, byPeriod);
  }

  return new Map(
    [...current.entries()].map(([key, byPeriod]) => [
      key,
      [...byPeriod.values()].sort((left, right) => left.period.localeCompare(right.period)),
    ]),
  );
}

function valueAt(
  series: Map<string, CurrentSeriesPoint[]>,
  field: BalanceField,
  granularity: BalanceGranularity,
  period: string,
): CurrentSeriesPoint | null {
  const key = balanceSeriesKey(field, granularity);
  return series.get(key)?.find((point) => point.period === period) ?? null;
}

export type ChangeDriverPoint = {
  period: string;
  births: number | null;
  deaths: number | null;
  naturalBalance: number | null;
  internalIn: number | null;
  internalOut: number | null;
  internalBalance: number | null;
  foreignIn: number | null;
  foreignOut: number | null;
  foreignBalance: number | null;
  otherIn: number | null;
  otherOut: number | null;
  otherBalance: number | null;
  statisticalAdjustment: number | null;
  coverageAdjustment: number | null;
  populationStart: number | null;
  populationEnd: number | null;
  observedChange: number | null;
  accountedChange: number | null;
  residual: number | null;
  reconciliation: "exact" | "partial" | "mismatch";
  sourceStatus: DemographicSourceStatus;
};

function subtract(left: number | null, right: number | null) {
  return left === null || right === null ? null : left - right;
}

function sumPresent(values: Array<number | null>): number | null {
  return values.some((value) => value === null)
    ? null
    : values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function leastFinalStatus(statuses: DemographicSourceStatus[]): DemographicSourceStatus {
  if (statuses.includes("provisional")) return "provisional";
  if (statuses.includes("estimated")) return "estimated";
  if (statuses.includes("reconstructed")) return "reconstructed";
  if (statuses.includes("unknown")) return "unknown";
  return statuses[0] ?? "unknown";
}

export function reconcileBalancePoint(input: {
  period: string;
  births: number | null;
  deaths: number | null;
  internalIn: number | null;
  internalOut: number | null;
  foreignIn: number | null;
  foreignOut: number | null;
  otherIn: number | null;
  otherOut: number | null;
  statisticalAdjustment: number | null;
  coverageAdjustment: number | null;
  populationStart: number | null;
  populationEnd: number | null;
  sourceStatus: DemographicSourceStatus;
  granularity: BalanceGranularity;
}): ChangeDriverPoint {
  const naturalBalance = subtract(input.births, input.deaths);
  const internalBalance = subtract(input.internalIn, input.internalOut);
  const foreignBalance = subtract(input.foreignIn, input.foreignOut);
  const otherBalance = subtract(input.otherIn, input.otherOut);
  const observedChange = subtract(input.populationEnd, input.populationStart);

  // Nel bilancio annuale definitivo l'aggiustamento statistico incorpora anche
  // il saldo per altri motivi. Nel mensile provvisorio, invece, popolazione
  // iniziale/finale è costruita sui flussi naturale + interno + estero e non
  // incorpora ancora le altre poste/censimento.
  const closingComponent =
    input.granularity === "annual"
      ? input.statisticalAdjustment ?? otherBalance
      : input.sourceStatus === "final"
        ? input.statisticalAdjustment ?? otherBalance
        : 0;
  const accountedChange = sumPresent([
    naturalBalance,
    internalBalance,
    foreignBalance,
    closingComponent,
  ]);
  const residual =
    observedChange === null || accountedChange === null
      ? null
      : observedChange - accountedChange;
  const reconciliation =
    residual === null
      ? "partial"
      : Math.abs(residual) <= 0.5
        ? "exact"
        : "mismatch";

  return {
    period: input.period,
    births: input.births,
    deaths: input.deaths,
    naturalBalance,
    internalIn: input.internalIn,
    internalOut: input.internalOut,
    internalBalance,
    foreignIn: input.foreignIn,
    foreignOut: input.foreignOut,
    foreignBalance,
    otherIn: input.otherIn,
    otherOut: input.otherOut,
    otherBalance,
    statisticalAdjustment: input.statisticalAdjustment,
    coverageAdjustment: input.coverageAdjustment,
    populationStart: input.populationStart,
    populationEnd: input.populationEnd,
    observedChange,
    accountedChange,
    residual,
    reconciliation,
    sourceStatus: input.sourceStatus,
  };
}

export async function getChangeDrivers(
  granularity: BalanceGranularity,
): Promise<ChangeDriverPoint[]> {
  const keys = FIELD_DEFINITIONS.map((definition) =>
    balanceSeriesKey(definition.field, granularity),
  );
  const series = await currentPointsForKeys(keys);
  const periods = new Set<string>();
  for (const points of series.values()) {
    for (const point of points) periods.add(point.period);
  }

  const population =
    granularity === "annual" ? await getCurrentPopulationPoints() : [];
  const populationByYear = new Map(population.map((point) => [point.period, point.value]));

  return [...periods]
    .sort()
    .map((period) => {
      const get = (field: BalanceField) =>
        valueAt(series, field, granularity, period);
      const points = FIELD_DEFINITIONS.map((definition) => get(definition.field)).filter(
        (point): point is CurrentSeriesPoint => Boolean(point),
      );
      const statuses = points.map((point) => point.sourceStatus);
      const year = period.slice(0, 4);
      let populationStart = get("populationStart")?.value ?? null;
      let populationEnd = get("populationEnd")?.value ?? null;
      if (granularity === "annual") {
        populationStart ??= populationByYear.get(year) ?? null;
        populationEnd ??= populationByYear.get(String(Number(year) + 1)) ?? null;
      }

      return reconcileBalancePoint({
        period,
        births: get("births")?.value ?? null,
        deaths: get("deaths")?.value ?? null,
        internalIn: get("internalIn")?.value ?? null,
        internalOut: get("internalOut")?.value ?? null,
        foreignIn: get("foreignIn")?.value ?? null,
        foreignOut: get("foreignOut")?.value ?? null,
        otherIn: get("otherIn")?.value ?? null,
        otherOut: get("otherOut")?.value ?? null,
        statisticalAdjustment: get("statisticalAdjustment")?.value ?? null,
        coverageAdjustment: get("coverageAdjustment")?.value ?? null,
        populationStart,
        populationEnd,
        sourceStatus: leastFinalStatus(statuses),
        granularity,
      });
    });
}

export type ChangeDriversSummary = {
  from: string | null;
  to: string | null;
  periods: number;
  observedChange: number | null;
  naturalBalance: number | null;
  internalBalance: number | null;
  foreignBalance: number | null;
  adjustment: number | null;
  dominantComponent: "natural" | "internal" | "foreign" | "adjustment" | null;
  exactPeriods: number;
  narrative: string | null;
};

export function summarizeChangeDrivers(
  points: ChangeDriverPoint[],
  window = 5,
): ChangeDriversSummary {
  const selected = points.slice(-window);
  const sum = (key: keyof ChangeDriverPoint): number | null => {
    const values = selected.map((point) => point[key]);
    if (values.some((value) => typeof value !== "number")) return null;
    return values.reduce<number>((total, value) => total + (value as number), 0);
  };
  const naturalBalance = sum("naturalBalance");
  const internalBalance = sum("internalBalance");
  const foreignBalance = sum("foreignBalance");
  const observedChange = sum("observedChange");
  const adjustments = selected.map((point) =>
    point.statisticalAdjustment ?? point.otherBalance,
  );
  const adjustment = adjustments.some((value) => value === null)
    ? null
    : adjustments.reduce<number>((total, value) => total + (value ?? 0), 0);

  const candidates = [
    ["natural", naturalBalance],
    ["internal", internalBalance],
    ["foreign", foreignBalance],
    ["adjustment", adjustment],
  ] as const;
  const available = candidates.filter(
    (item): item is readonly [typeof item[0], number] => typeof item[1] === "number",
  );
  const dominant = available.sort(
    (left, right) => Math.abs(right[1]) - Math.abs(left[1]),
  )[0];
  const labels = {
    natural: "saldo naturale",
    internal: "mobilità con gli altri comuni italiani",
    foreign: "mobilità con l'estero",
    adjustment: "aggiustamento statistico e altre poste",
  } as const;
  const narrative = dominant
    ? `Nel periodo selezionato la componente cumulata di maggiore ampiezza è il ${labels[dominant[0]]} (${dominant[1] >= 0 ? "+" : ""}${Math.round(dominant[1]).toLocaleString("it-IT")} persone). La frase è descrittiva e deriva esclusivamente dalla scomposizione contabile dei dati ISTAT.`
    : null;

  return {
    from: selected[0]?.period ?? null,
    to: selected[selected.length - 1]?.period ?? null,
    periods: selected.length,
    observedChange,
    naturalBalance,
    internalBalance,
    foreignBalance,
    adjustment,
    dominantComponent: dominant?.[0] ?? null,
    exactPeriods: selected.filter((point) => point.reconciliation === "exact").length,
    narrative,
  };
}
