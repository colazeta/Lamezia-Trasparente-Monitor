import { createHash } from "node:crypto";
import {
  db,
  demographicObservationsTable,
  demographicReleasesTable,
  demographicSeriesTable,
  feedStatusTable,
  type DemographicSourceStatus,
} from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import {
  canonicalDimensionKey,
  LAMEZIA_ISTAT_CODE,
  POPULATION_SERIES_KEY,
} from "./demographics";
import { logger } from "./logger";

export const BIRTH_COUNTRY_SERIES_KEY = "population-birth-country-jan1";

const RCS_PAGE_URL = "https://demo.istat.it/app/?i=RCS&l=it";
const RCS_SEARCH_URL = "https://demo.istat.it/app/RPCCerca.php";
const RCS_BULK_URL = "https://demo.istat.it/data/rcs/Dati_RCS.zip";
const FEED_SOURCE = "demographics:istat-birth-country";
const FEED_LABEL = "ISTAT – Popolazione per paese di nascita (Lamezia Terme)";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";
const BACKFILL_YEARS_PER_RUN = 3;
const ITALY_BIRTH_COUNTRY_CODE = "100";
const OTHER_COUNTRIES_CODE = "995";

export type BirthCountrySex = "male" | "female" | "total";

export type RcsBirthFormContract = {
  years: number[];
  fixedFields: Record<string, string>;
  countryLabels: Record<string, string>;
};

export type ParsedBirthCountryObservation = {
  period: string;
  birthCountry: string;
  birthCountryLabel: string;
  sex: BirthCountrySex;
  value: number;
  sourceStatus: DemographicSourceStatus;
  rawStatus: string | null;
  qualityFlags: string[];
};

type CurrentBirthCountryPoint = ParsedBirthCountryObservation & {
  releaseId: number;
  acquiredAt: Date;
  sourceDataset: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, "\u00a0")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function attribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function cleanHtmlText(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLabel(value: string) {
  return cleanHtmlText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’`]/g, "'")
    .toLocaleLowerCase("it-IT")
    .replace(/\s+/g, " ")
    .trim();
}

function isCountryCode(value: string) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 100 && numeric < 9999;
}

export function parseRcsBirthFormContract(html: string): RcsBirthFormContract {
  const formMatch = html.match(
    /<form\b[^>]*id=["']form-1["'][^>]*>([\s\S]*?)<\/form>/i,
  );
  if (!formMatch) {
    throw new Error("ISTAT RCS schema changed: form-1 (paese di nascita) not found");
  }
  const form = formMatch[1];

  const fixedFields: Record<string, string> = {};
  for (const match of form.matchAll(/<input\b[^>]*>/gi)) {
    const tag = match[0];
    if ((attribute(tag, "type") ?? "").toLowerCase() !== "hidden") continue;
    const name = attribute(tag, "name");
    if (!name) continue;
    fixedFields[name] = attribute(tag, "value") ?? "";
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
      throw new Error(`ISTAT RCS schema changed: hidden field ${required} missing`);
    }
  }
  if (
    fixedFields["hid-i"] !== "RCS" ||
    fixedFields["hid-cat"] !== "RCS" ||
    fixedFields["hid-dati"] !== "dati-form-1" ||
    fixedFields["hid-tavola"] !== "tavola-form-1"
  ) {
    throw new Error("ISTAT RCS schema changed: form-1 hidden contract is unexpected");
  }

  const yearSelect = form.match(
    /<select\b[^>]*name=["']a["'][^>]*>([\s\S]*?)<\/select>/i,
  );
  if (!yearSelect) throw new Error("ISTAT RCS schema changed: year selector missing");
  const years = [
    ...yearSelect[1].matchAll(
      /<option\b[^>]*value=["']?(\d{4})["']?[^>]*>/gi,
    ),
  ]
    .map((match) => Number(match[1]))
    .filter(Number.isInteger);
  const uniqueYears = [...new Set(years)].sort((left, right) => left - right);
  if (!uniqueYears.length) throw new Error("ISTAT RCS schema changed: no years declared");

  const countrySelect = form.match(
    /<select\b[^>]*name=["']nascita["'][^>]*>([\s\S]*?)<\/select>/i,
  );
  if (!countrySelect) {
    throw new Error("ISTAT RCS schema changed: country-of-birth selector missing");
  }
  const countryLabels: Record<string, string> = {};
  for (const match of countrySelect[1].matchAll(
    /<option\b([^>]*)>([\s\S]*?)<\/option>/gi,
  )) {
    const tag = `<option ${match[1]}>`;
    const value = attribute(tag, "value") ?? "";
    if (!isCountryCode(value)) continue;
    const label = cleanHtmlText(match[2]);
    if (label) countryLabels[value] = label;
  }
  if (
    !countryLabels[ITALY_BIRTH_COUNTRY_CODE] ||
    Object.keys(countryLabels).length < 100
  ) {
    throw new Error(
      `ISTAT RCS schema changed: country-of-birth domain incomplete (${Object.keys(countryLabels).length} country codes)`,
    );
  }

  return { years: uniqueYears, fixedFields, countryLabels };
}

export function buildRcsBirthPayload(
  contract: RcsBirthFormContract,
  year: number,
): Record<string, string> {
  if (!contract.years.includes(year)) {
    throw new Error(`ISTAT RCS: year ${year} is not declared by form-1`);
  }
  return {
    ...contract.fixedFields,
    a: String(year),
    "hid-a": String(year),
    nascita: "9999",
    ripartizione: "4",
    regione: "18",
    provincia: "079",
    comune: LAMEZIA_ISTAT_CODE,
  };
}

function numericRowValue(row: Record<string, unknown>, key: string): number | null {
  const raw = row[key];
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const normalized = raw.replace(/\./g, "").replace(",", ".").trim();
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

export function parseRcsBirthResponse(
  payload: string,
  contract: RcsBirthFormContract,
  expectedYear: number,
): ParsedBirthCountryObservation[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("ISTAT RCS response is not valid JSON");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("ISTAT RCS response has an invalid root object");
  }
  const root = parsed as Record<string, unknown>;
  if (root.Status !== true) {
    throw new Error(
      `ISTAT RCS query failed: ${typeof root.Messaggio === "string" ? root.Messaggio : "unknown source error"}`,
    );
  }
  const datatable = root.datatable;
  if (!datatable || typeof datatable !== "object") {
    throw new Error("ISTAT RCS response missing datatable");
  }
  const data = (datatable as Record<string, unknown>).data;
  if (!Array.isArray(data)) throw new Error("ISTAT RCS response missing datatable.data");

  const codeByLabel = new Map(
    Object.entries(contract.countryLabels).map(([code, label]) => [
      normalizeLabel(label),
      code,
    ]),
  );
  const out: ParsedBirthCountryObservation[] = [];
  const unknownLabels = new Set<string>();
  const sourceStatus: DemographicSourceStatus =
    expectedYear <= 2018 ? "reconstructed" : "final";
  const qualityFlags = expectedYear <= 2018 ? ["source_reconstructed"] : [];

  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rowYear = Number(row.anno ?? expectedYear);
    if (rowYear !== expectedYear) continue;
    const label =
      typeof row.denominazione === "string" ? row.denominazione.trim() : "";
    if (!label) continue;
    const birthCountry = codeByLabel.get(normalizeLabel(label));
    if (!birthCountry) {
      unknownLabels.add(label);
      continue;
    }

    const values: Array<[BirthCountrySex, number | null]> = [
      ["male", numericRowValue(row, "maschi")],
      ["female", numericRowValue(row, "femmine")],
      ["total", numericRowValue(row, "totale")],
    ];
    for (const [sex, value] of values) {
      if (value === null) continue;
      out.push({
        period: String(expectedYear),
        birthCountry,
        birthCountryLabel: contract.countryLabels[birthCountry] ?? label,
        sex,
        value,
        sourceStatus,
        rawStatus: null,
        qualityFlags: [...qualityFlags],
      });
    }
  }

  if (unknownLabels.size) {
    throw new Error(
      `ISTAT RCS response contains unmapped country labels: ${[...unknownLabels]
        .slice(0, 5)
        .join(", ")}`,
    );
  }
  validateBirthCountryObservations(out, String(expectedYear));
  return out.sort(
    (left, right) =>
      left.birthCountry.localeCompare(right.birthCountry) ||
      left.sex.localeCompare(right.sex),
  );
}

export function validateBirthCountryObservations(
  observations: ParsedBirthCountryObservation[],
  label: string,
): void {
  if (!observations.length) {
    throw new Error(`${label}: no valid birth-country observations`);
  }
  const italy = observations.filter(
    (row) => row.birthCountry === ITALY_BIRTH_COUNTRY_CODE,
  );
  for (const sex of ["male", "female", "total"] as const) {
    if (!italy.some((row) => row.sex === sex)) {
      throw new Error(`${label}: Italy row missing for sex=${sex}`);
    }
  }
  const totalCountries = new Set(
    observations
      .filter((row) => row.sex === "total")
      .map((row) => row.birthCountry),
  );
  if (totalCountries.size < 10) {
    throw new Error(`${label}: implausibly small country domain (${totalCountries.size})`);
  }
  const identities = new Set<string>();
  for (const row of observations) {
    const identity = `${row.birthCountry}|${row.sex}`;
    if (identities.has(identity)) throw new Error(`${label}: duplicate ${identity}`);
    identities.add(identity);
  }
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function parseHttpDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function datasetForYear(year: number) {
  return `RCS_birth_${year}`;
}

async function ensureSeries() {
  const values = {
    title: "Popolazione residente per paese di nascita al 1° gennaio",
    description:
      "Residenti di Lamezia Terme distinti per singolo paese di nascita e sesso. Il paese di nascita è mantenuto distinto dalla cittadinanza; il tratto 2002–2018 proviene dalla ricostruzione intercensuaria ISTAT e dal 2019 la fonte è censuaria.",
    unit: "persone",
    geographyLevel: "municipality",
    referenceType: "stock",
    source: "ISTAT",
    sourceDataset: "RCS – paese di nascita",
    sourceUrl: RCS_PAGE_URL,
    externalKey: `istat:rcs:birth-country:${LAMEZIA_ISTAT_CODE}`,
    updatedAt: new Date(),
  } as const;
  const [existing] = await db
    .select()
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, BIRTH_COUNTRY_SERIES_KEY));
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
    .values({ seriesKey: BIRTH_COUNTRY_SERIES_KEY, ...values })
    .returning();
  return created;
}

async function persistedYearReleases(seriesId: number) {
  const releases = await db
    .select({
      sourceDataset: demographicReleasesTable.sourceDataset,
      acquiredAt: demographicReleasesTable.acquiredAt,
    })
    .from(demographicReleasesTable)
    .where(eq(demographicReleasesTable.seriesId, seriesId))
    .orderBy(asc(demographicReleasesTable.acquiredAt));
  const out = new Map<number, Date>();
  for (const release of releases) {
    const match = /^RCS_birth_(\d{4})$/.exec(release.sourceDataset);
    if (!match) continue;
    const year = Number(match[1]);
    if (Number.isInteger(year)) out.set(year, release.acquiredAt);
  }
  return out;
}

async function persistYear(options: {
  seriesId: number;
  year: number;
  payload: string;
  response: Response;
  observations: ParsedBirthCountryObservation[];
}) {
  const sourceHash = hash(options.payload);
  const [sameRelease] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, options.seriesId),
        eq(demographicReleasesTable.sourceHash, sourceHash),
      ),
    )
    .limit(1);
  if (sameRelease) return { inserted: 0, changed: false };

  const labels = Object.fromEntries(
    options.observations
      .filter((row) => row.sex === "total")
      .map((row) => [row.birthCountry, row.birthCountryLabel]),
  );
  const sourceDataset = datasetForYear(options.year);
  const now = new Date();
  const etag = options.response.headers.get("etag");
  const lastModified = options.response.headers.get("last-modified");

  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: options.seriesId,
        sourceDataset,
        sourceUrl: `${RCS_PAGE_URL}&a=${options.year}`,
        sourceHash,
        sourceVersion: etag,
        releaseDate: parseHttpDate(lastModified),
        acquiredAt: now,
        httpEtag: etag,
        httpLastModified: lastModified,
        rawPayload: options.payload,
        metadata: {
          acquisitionMode: "demo-rpccerca-form-1",
          queryForm: 1,
          period: options.year,
          countrySelector: "9999",
          countryLabels: labels,
          methodologyBreakAt: 2019,
          sourceStatus: options.year <= 2018 ? "reconstructed" : "final",
          bulkSource: RCS_BULK_URL,
          observationCount: options.observations.length,
          parserVersion: 1,
        },
      })
      .returning({ id: demographicReleasesTable.id });

    await tx.insert(demographicObservationsTable).values(
      options.observations.map((row) => {
        const dimensions = { birthCountry: row.birthCountry, sex: row.sex };
        return {
          seriesId: options.seriesId,
          releaseId: release.id,
          geographyCode: LAMEZIA_ISTAT_CODE,
          referencePeriod: row.period,
          referenceType: "stock" as const,
          dimensions,
          dimensionKey: canonicalDimensionKey(dimensions),
          value: String(row.value),
          unit: "persone",
          sourceStatus: row.sourceStatus,
          sourceObservationStatus: row.rawStatus,
          qualityFlags: row.qualityFlags,
        };
      }),
    );
  });
  return { inserted: options.observations.length, changed: true };
}

async function fetchContract() {
  const response = await fetch(RCS_PAGE_URL, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
  });
  if (!response.ok) {
    throw new Error(`ISTAT RCS page failed with status ${response.status}`);
  }
  const html = await response.text();
  return { contract: parseRcsBirthFormContract(html), requests: 1 };
}

async function fetchYear(
  seriesId: number,
  contract: RcsBirthFormContract,
  year: number,
) {
  const body = new URLSearchParams(buildRcsBirthPayload(contract, year));
  const response = await fetch(RCS_SEARCH_URL, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
  });
  if (!response.ok) {
    throw new Error(`ISTAT RCS birth ${year} failed with status ${response.status}`);
  }
  const payload = await response.text();
  const observations = parseRcsBirthResponse(payload, contract, year);
  const persisted = await persistYear({
    seriesId,
    year,
    payload,
    response,
    observations,
  });
  return { requests: 1, ...persisted };
}

async function recordFeedStatus(outcome: {
  status: "ok" | "error";
  observations?: number;
  releases?: number;
  error?: string;
}) {
  const now = new Date();
  await db
    .insert(feedStatusTable)
    .values({
      source: FEED_SOURCE,
      label: FEED_LABEL,
      url: RCS_PAGE_URL,
      status: outcome.status,
      error: outcome.error ?? null,
      itemsTotal: outcome.observations ?? 0,
      itemsNew: outcome.releases ?? 0,
      lastCheckedAt: now,
      lastUpdatedAt: (outcome.releases ?? 0) > 0 ? now : undefined,
    })
    .onConflictDoUpdate({
      target: feedStatusTable.source,
      set: {
        label: FEED_LABEL,
        url: RCS_PAGE_URL,
        status: outcome.status,
        error: outcome.error ?? null,
        itemsTotal: outcome.observations ?? 0,
        itemsNew: outcome.releases ?? 0,
        lastCheckedAt: now,
        ...((outcome.releases ?? 0) > 0 ? { lastUpdatedAt: now } : {}),
      },
    });
}

export async function runPopulationBirthCountryIngestion() {
  const series = await ensureSeries();
  let requests = 0;
  let releases = 0;
  let observations = 0;
  try {
    const contractResult = await fetchContract();
    requests += contractResult.requests;
    const contract = contractResult.contract;
    const latestYear = contract.years.at(-1);
    if (!latestYear) throw new Error("ISTAT RCS declares no current year");

    const coverage = await persistedYearReleases(series.id);
    const missingBefore = contract.years.filter((year) => !coverage.has(year));
    const targets = new Set<number>([latestYear]);
    for (const year of missingBefore
      .filter((year) => year !== latestYear)
      .slice(0, BACKFILL_YEARS_PER_RUN)) {
      targets.add(year);
    }

    // Dopo il backfill completo, oltre all'ultimo anno ricontrolliamo a rotazione
    // l'annualità storica acquisita meno di recente. In questo modo eventuali
    // revisioni della fonte entrano come nuove release senza martellare Demo.
    if (missingBefore.length === 0) {
      const stale = [...coverage.entries()]
        .filter(([year]) => year !== latestYear)
        .sort((left, right) => left[1].getTime() - right[1].getTime())[0];
      if (stale) targets.add(stale[0]);
    }

    for (const year of [...targets].sort((left, right) => left - right)) {
      const result = await fetchYear(series.id, contract, year);
      requests += result.requests;
      if (result.changed) releases++;
      observations += result.inserted;
    }

    const coverageAfter = await persistedYearReleases(series.id);
    const remainingBackfill = contract.years.filter(
      (year) => !coverageAfter.has(year),
    ).length;
    await recordFeedStatus({ status: "ok", observations, releases });
    logger.info(
      {
        requests,
        releases,
        observations,
        remainingBackfill,
        years: [...targets],
      },
      "ISTAT country-of-birth ingestion complete",
    );
    return { requests, releases, observations, remainingBackfill };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await recordFeedStatus({ status: "error", error: message });
    logger.error({ err }, "ISTAT country-of-birth ingestion failed");
    throw err;
  }
}

function labelsFromMetadata(metadata: unknown): Record<string, string> {
  if (!metadata || typeof metadata !== "object") return {};
  const labels = (metadata as Record<string, unknown>).countryLabels;
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) return {};
  return Object.fromEntries(
    Object.entries(labels as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

async function getCurrentBirthCountryPoints(): Promise<CurrentBirthCountryPoint[]> {
  const [series] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, BIRTH_COUNTRY_SERIES_KEY));
  if (!series) return [];

  const rows = await db
    .select({
      period: demographicObservationsTable.referencePeriod,
      value: demographicObservationsTable.value,
      dimensions: demographicObservationsTable.dimensions,
      dimensionKey: demographicObservationsTable.dimensionKey,
      sourceStatus: demographicObservationsTable.sourceStatus,
      sourceObservationStatus:
        demographicObservationsTable.sourceObservationStatus,
      qualityFlags: demographicObservationsTable.qualityFlags,
      releaseId: demographicReleasesTable.id,
      acquiredAt: demographicReleasesTable.acquiredAt,
      sourceDataset: demographicReleasesTable.sourceDataset,
      metadata: demographicReleasesTable.metadata,
    })
    .from(demographicObservationsTable)
    .innerJoin(
      demographicReleasesTable,
      eq(demographicObservationsTable.releaseId, demographicReleasesTable.id),
    )
    .where(
      and(
        eq(demographicObservationsTable.seriesId, series.id),
        eq(demographicObservationsTable.geographyCode, LAMEZIA_ISTAT_CODE),
      ),
    )
    .orderBy(
      asc(demographicReleasesTable.acquiredAt),
      asc(demographicReleasesTable.id),
      asc(demographicObservationsTable.referencePeriod),
    );

  const current = new Map<string, CurrentBirthCountryPoint>();
  for (const row of rows) {
    const dimensions = row.dimensions as Record<string, string>;
    const birthCountry = dimensions.birthCountry;
    const sex = dimensions.sex as BirthCountrySex | undefined;
    if (!birthCountry || !sex) continue;
    const labels = labelsFromMetadata(row.metadata);
    current.set(`${row.period}|${row.dimensionKey}`, {
      period: row.period,
      birthCountry,
      birthCountryLabel: labels[birthCountry] ?? birthCountry,
      sex,
      value: Number(row.value),
      sourceStatus: row.sourceStatus as DemographicSourceStatus,
      rawStatus: row.sourceObservationStatus,
      qualityFlags: row.qualityFlags as string[],
      releaseId: row.releaseId,
      acquiredAt: row.acquiredAt,
      sourceDataset: row.sourceDataset,
    });
  }
  return [...current.values()].sort(
    (left, right) =>
      left.period.localeCompare(right.period) ||
      left.birthCountry.localeCompare(right.birthCountry) ||
      left.sex.localeCompare(right.sex),
  );
}

async function getIndependentPopulationByPeriod() {
  const [series] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, POPULATION_SERIES_KEY));
  if (!series) return new Map<string, number>();
  const rows = await db
    .select({
      period: demographicObservationsTable.referencePeriod,
      value: demographicObservationsTable.value,
      acquiredAt: demographicReleasesTable.acquiredAt,
      releaseId: demographicReleasesTable.id,
    })
    .from(demographicObservationsTable)
    .innerJoin(
      demographicReleasesTable,
      eq(demographicObservationsTable.releaseId, demographicReleasesTable.id),
    )
    .where(
      and(
        eq(demographicObservationsTable.seriesId, series.id),
        eq(demographicObservationsTable.geographyCode, LAMEZIA_ISTAT_CODE),
      ),
    )
    .orderBy(
      asc(demographicReleasesTable.acquiredAt),
      asc(demographicReleasesTable.id),
    );
  const current = new Map<string, number>();
  for (const row of rows) current.set(row.period, Number(row.value));
  return current;
}

function round(value: number | null, digits = 1): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function statusForRows(
  rows: ParsedBirthCountryObservation[],
): DemographicSourceStatus {
  const statuses = new Set(rows.map((row) => row.sourceStatus));
  for (const status of [
    "provisional",
    "estimated",
    "reconstructed",
    "unknown",
  ] as const) {
    if (statuses.has(status)) return status;
  }
  return "final";
}

function valueFor(
  rows: ParsedBirthCountryObservation[],
  code: string,
  sex: BirthCountrySex,
): number {
  return (
    rows.find((row) => row.birthCountry === code && row.sex === sex)?.value ?? 0
  );
}

export type PopulationBirthCountrySummary = {
  period: string;
  sourceStatus: DemographicSourceStatus;
  counts: {
    population: number;
    bornInItaly: number;
    bornAbroad: number;
    bornAbroadShare: number | null;
    male: number;
    female: number;
  };
  topBirthCountries: Array<{
    code: string;
    name: string;
    total: number;
    male: number;
    female: number;
    shareOfBornAbroad: number | null;
  }>;
  quality: {
    sourceCountryTotal: number;
    independentPopulation: number | null;
    coverageDifference: number | null;
  };
  sourceDataset: string;
};

export function summarizeBirthCountry(
  rows: ParsedBirthCountryObservation[],
  period: string,
  independentPopulation: number | null = null,
): PopulationBirthCountrySummary {
  const selected = rows.filter((row) => row.period === period);
  if (!selected.length) {
    throw new Error(`No country-of-birth observations for ${period}`);
  }
  const totalRows = selected.filter((row) => row.sex === "total");
  const sourceCountryTotal = totalRows.reduce((sum, row) => sum + row.value, 0);
  const bornInItaly = valueFor(selected, ITALY_BIRTH_COUNTRY_CODE, "total");
  const bornAbroad = Math.max(0, sourceCountryTotal - bornInItaly);
  const population = independentPopulation ?? sourceCountryTotal;
  const male = selected
    .filter((row) => row.sex === "male")
    .reduce((sum, row) => sum + row.value, 0);
  const female = selected
    .filter((row) => row.sex === "female")
    .reduce((sum, row) => sum + row.value, 0);
  const topBirthCountries = totalRows
    .filter(
      (row) =>
        row.birthCountry !== ITALY_BIRTH_COUNTRY_CODE &&
        row.birthCountry !== OTHER_COUNTRIES_CODE,
    )
    .map((row) => ({
      code: row.birthCountry,
      name: row.birthCountryLabel,
      total: row.value,
      male: valueFor(selected, row.birthCountry, "male"),
      female: valueFor(selected, row.birthCountry, "female"),
      shareOfBornAbroad:
        bornAbroad > 0 ? round((row.value / bornAbroad) * 100) : null,
    }))
    .sort(
      (left, right) =>
        right.total - left.total || left.name.localeCompare(right.name),
    )
    .slice(0, 10);
  const datasets = [
    ...new Set(
      (selected as CurrentBirthCountryPoint[])
        .map((row) => row.sourceDataset)
        .filter(Boolean),
    ),
  ];

  return {
    period,
    sourceStatus: statusForRows(selected),
    counts: {
      population,
      bornInItaly,
      bornAbroad,
      bornAbroadShare:
        population > 0 ? round((bornAbroad / population) * 100) : null,
      male,
      female,
    },
    topBirthCountries,
    quality: {
      sourceCountryTotal,
      independentPopulation,
      coverageDifference:
        independentPopulation === null
          ? null
          : sourceCountryTotal - independentPopulation,
    },
    sourceDataset: datasets.length
      ? datasets.join(" + ")
      : datasetForYear(Number(period)),
  };
}

export type PopulationBirthCountrySnapshot = PopulationBirthCountrySummary & {
  availablePeriods: string[];
  history: Array<{
    period: string;
    population: number;
    bornInItaly: number;
    bornAbroad: number;
    bornAbroadShare: number | null;
    sourceStatus: DemographicSourceStatus;
    coverageDifference: number | null;
  }>;
  source: {
    name: string;
    dataset: string;
    url: string;
    bulkUrl: string;
  };
};

export async function getPopulationBirthCountrySnapshot(
  requestedPeriod?: string | null,
): Promise<PopulationBirthCountrySnapshot | null> {
  const points = await getCurrentBirthCountryPoints();
  const availablePeriods = [
    ...new Set(points.map((point) => point.period)),
  ].sort();
  if (!availablePeriods.length) return null;
  const period =
    requestedPeriod &&
    requestedPeriod !== "latest" &&
    availablePeriods.includes(requestedPeriod)
      ? requestedPeriod
      : availablePeriods[availablePeriods.length - 1];
  const populations = await getIndependentPopulationByPeriod();
  const selected = summarizeBirthCountry(
    points,
    period,
    populations.get(period) ?? null,
  );
  const history = availablePeriods.map((item) => {
    const summary = summarizeBirthCountry(
      points,
      item,
      populations.get(item) ?? null,
    );
    return {
      period: item,
      population: summary.counts.population,
      bornInItaly: summary.counts.bornInItaly,
      bornAbroad: summary.counts.bornAbroad,
      bornAbroadShare: summary.counts.bornAbroadShare,
      sourceStatus: summary.sourceStatus,
      coverageDifference: summary.quality.coverageDifference,
    };
  });
  return {
    ...selected,
    availablePeriods,
    history,
    source: {
      name: "ISTAT",
      dataset: "RCS – Paese di nascita",
      url: RCS_PAGE_URL,
      bulkUrl: RCS_BULK_URL,
    },
  };
}
