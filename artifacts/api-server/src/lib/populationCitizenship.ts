import { createHash } from "node:crypto";
import {
  db,
  demographicObservationsTable,
  demographicReleasesTable,
  demographicSeriesTable,
  feedStatusTable,
  type DemographicSourceStatus,
} from "@workspace/db";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  canonicalDimensionKey,
  LAMEZIA_ISTAT_CODE,
  mapSdmxStatus,
  parseCsvRow,
} from "./demographics";
import {
  POPULATION_STRUCTURE_SERIES_KEY,
  parseStructureAge,
  parseStructureSex,
  type StructureAge,
  type StructureSex,
} from "./populationStructure";
import { logger } from "./logger";

export const FOREIGN_STRUCTURE_SERIES_KEY = "population-foreign-citizens-jan1";
export const CITIZENSHIP_COUNTRY_SERIES_KEY =
  "population-foreign-citizenship-country-jan1";

const CURRENT_FOREIGN_DATAFLOW_ID = "29_7_DF_DCIS_POPSTRRES1_20";
const CURRENT_FOREIGN_DATAFLOW = `IT1,${CURRENT_FOREIGN_DATAFLOW_ID},1.0`;
const CURRENT_COUNTRY_DATAFLOW_ID = "29_317_DF_DCIS_POPSTRCIT1_20";
const CURRENT_COUNTRY_DATAFLOW = `IT1,${CURRENT_COUNTRY_DATAFLOW_ID},1.0`;
const RECONSTRUCTED_DATAFLOW_ID = "164_164_DF_DCIS_RICPOPRES2011_21";
const RECONSTRUCTED_DATAFLOW = `IT1,${RECONSTRUCTED_DATAFLOW_ID},1.0`;
const ISTAT_SDMX_BASE = "https://esploradati.istat.it/SDMXWS/rest/data";
const ISTAT_SOURCE_URL = "https://esploradati.istat.it";
const FEED_SOURCE = "demographics:istat-population-citizenship";
const FEED_LABEL = "ISTAT – Cittadinanza e popolazione straniera (Lamezia Terme)";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";

export type ParsedForeignObservation = {
  period: string;
  age: StructureAge;
  sex: StructureSex;
  value: number;
  sourceStatus: DemographicSourceStatus;
  rawStatus: string | null;
  qualityFlags: string[];
};

export type ParsedCitizenshipObservation = {
  period: string;
  citizenship: string;
  sex: StructureSex;
  value: number;
  sourceStatus: DemographicSourceStatus;
  rawStatus: string | null;
  qualityFlags: string[];
};

type ForeignSource = "current" | "reconstructed";

export function currentForeignStructureSdmxKey(): string {
  // 29_7 Calabria: FREQ.REF_AREA.DATA_TYPE.SEX.AGE.
  // AGE vuota mantiene tutte le singole età; 1+2+9 acquisisce entrambi i
  // sessi e il totale senza espandere altri comuni.
  return `A.${LAMEZIA_ISTAT_CODE}.JAN.1+2+9.`;
}

export function reconstructedForeignStructureSdmxKey(): string {
  // Ricostruzione: FREQ.REF_AREA.DATA_TYPE.AGE.SEX.CITIZENSHIP.
  // FRG identifica la popolazione con cittadinanza straniera.
  return `A.${LAMEZIA_ISTAT_CODE}.JAN..1+2+9.FRG`;
}

export function currentCitizenshipCountriesSdmxKey(): string {
  // 29_317 Calabria: FREQ.REF_AREA.DATA_TYPE.SEX.CITIZENSHIP.
  // La cittadinanza vuota chiede tutti i valori: il parser conserva anche le
  // aggregazioni della fonte, mentre l'API distingue i singoli paesi.
  return `A.${LAMEZIA_ISTAT_CODE}.FJAN.1+2+9.`;
}

export function currentForeignStructureSdmxUrl(): string {
  return `${ISTAT_SDMX_BASE}/${CURRENT_FOREIGN_DATAFLOW}/${currentForeignStructureSdmxKey()}?startPeriod=2019`;
}

export function reconstructedForeignStructureSdmxUrl(): string {
  return `${ISTAT_SDMX_BASE}/${RECONSTRUCTED_DATAFLOW}/${reconstructedForeignStructureSdmxKey()}?startPeriod=2002&endPeriod=2018`;
}

export function currentCitizenshipCountriesSdmxUrl(): string {
  return `${ISTAT_SDMX_BASE}/${CURRENT_COUNTRY_DATAFLOW}/${currentCitizenshipCountriesSdmxKey()}?startPeriod=2019`;
}

export function parseForeignStructureCsv(
  csv: string,
  source: ForeignSource,
): ParsedForeignObservation[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const header = parseCsvRow(lines[0]).map((value) => value.trim());
  const ageIdx = header.indexOf("AGE");
  const sexIdx = header.indexOf("SEX");
  const periodIdx = header.indexOf("TIME_PERIOD");
  const valueIdx = header.indexOf("OBS_VALUE");
  const statusIdx = header.indexOf("OBS_STATUS");
  const dataTypeIdx = header.indexOf("DATA_TYPE");
  const refAreaIdx = header.indexOf("REF_AREA");
  const citizenshipIdx = header.indexOf("CITIZENSHIP");
  if (ageIdx < 0 || sexIdx < 0 || periodIdx < 0 || valueIdx < 0) {
    throw new Error(
      "ISTAT foreign population CSV privo di AGE, SEX, TIME_PERIOD o OBS_VALUE",
    );
  }

  const out: ParsedForeignObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (refAreaIdx >= 0 && cols[refAreaIdx]?.trim() !== LAMEZIA_ISTAT_CODE) continue;
    if (dataTypeIdx >= 0 && cols[dataTypeIdx]?.trim() !== "JAN") continue;
    if (
      source === "reconstructed" &&
      citizenshipIdx >= 0 &&
      cols[citizenshipIdx]?.trim() !== "FRG"
    ) {
      continue;
    }

    const period = cols[periodIdx]?.trim();
    const year = Number(period?.slice(0, 4));
    if (!period || !Number.isInteger(year)) continue;
    if (source === "current" && year < 2019) continue;
    if (source === "reconstructed" && (year < 2002 || year > 2018)) continue;

    const age = parseStructureAge(cols[ageIdx] ?? "");
    const sex = parseStructureSex(cols[sexIdx] ?? "");
    const value = Number(cols[valueIdx]?.trim());
    if (!age || !sex || !Number.isFinite(value)) continue;
    const rawStatus =
      statusIdx >= 0 && cols[statusIdx]?.trim() ? cols[statusIdx].trim() : null;

    if (source === "reconstructed") {
      const mapped = mapSdmxStatus(rawStatus, "reconstructed");
      out.push({
        period,
        age,
        sex,
        value,
        sourceStatus: "reconstructed",
        rawStatus,
        qualityFlags: [
          ...new Set(["source_reconstructed", ...mapped.qualityFlags]),
        ],
      });
    } else {
      const mapped = mapSdmxStatus(rawStatus, "final");
      out.push({
        period,
        age,
        sex,
        value,
        sourceStatus: mapped.status,
        rawStatus,
        qualityFlags: mapped.qualityFlags,
      });
    }
  }
  return out.sort(
    (left, right) =>
      left.period.localeCompare(right.period) ||
      left.sex.localeCompare(right.sex) ||
      ageSortValue(left.age) - ageSortValue(right.age),
  );
}

export function parseCitizenshipCountriesCsv(
  csv: string,
): ParsedCitizenshipObservation[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const header = parseCsvRow(lines[0]).map((value) => value.trim());
  const citizenshipIdx = header.indexOf("CITIZENSHIP");
  const sexIdx = header.indexOf("SEX");
  const periodIdx = header.indexOf("TIME_PERIOD");
  const valueIdx = header.indexOf("OBS_VALUE");
  const statusIdx = header.indexOf("OBS_STATUS");
  const dataTypeIdx = header.indexOf("DATA_TYPE");
  const refAreaIdx = header.indexOf("REF_AREA");
  if (citizenshipIdx < 0 || sexIdx < 0 || periodIdx < 0 || valueIdx < 0) {
    throw new Error(
      "ISTAT citizenship CSV privo di CITIZENSHIP, SEX, TIME_PERIOD o OBS_VALUE",
    );
  }

  const out: ParsedCitizenshipObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (refAreaIdx >= 0 && cols[refAreaIdx]?.trim() !== LAMEZIA_ISTAT_CODE) continue;
    if (dataTypeIdx >= 0 && cols[dataTypeIdx]?.trim() !== "FJAN") continue;
    const period = cols[periodIdx]?.trim();
    const year = Number(period?.slice(0, 4));
    if (!period || !Number.isInteger(year) || year < 2019) continue;
    const citizenship = cols[citizenshipIdx]?.trim().toUpperCase();
    const sex = parseStructureSex(cols[sexIdx] ?? "");
    const value = Number(cols[valueIdx]?.trim());
    if (!citizenship || !sex || !Number.isFinite(value)) continue;
    const rawStatus =
      statusIdx >= 0 && cols[statusIdx]?.trim() ? cols[statusIdx].trim() : null;
    const mapped = mapSdmxStatus(rawStatus, "final");
    out.push({
      period,
      citizenship,
      sex,
      value,
      sourceStatus: mapped.status,
      rawStatus,
      qualityFlags: mapped.qualityFlags,
    });
  }
  return out.sort(
    (left, right) =>
      left.period.localeCompare(right.period) ||
      left.citizenship.localeCompare(right.citizenship) ||
      left.sex.localeCompare(right.sex),
  );
}

function ageSortValue(age: StructureAge): number {
  if (age === "TOTAL") return 1001;
  if (age === "100+") return 100;
  return Number(age);
}

export function validateForeignStructure(
  observations: ParsedForeignObservation[],
  label: string,
): void {
  if (!observations.length) throw new Error(`${label}: nessuna osservazione valida`);
  for (const period of [...new Set(observations.map((row) => row.period))]) {
    const selected = observations.filter((row) => row.period === period);
    for (const sex of ["male", "female"] as const) {
      const ages = new Set(
        selected
          .filter((row) => row.sex === sex && row.age !== "TOTAL")
          .map((row) => row.age),
      );
      if (ages.size < 100) {
        throw new Error(
          `${label}/${period}/${sex}: copertura età stranieri incompleta (${ages.size} classi)`,
        );
      }
    }
  }
}

export function validateCitizenshipCountries(
  observations: ParsedCitizenshipObservation[],
  label: string,
): void {
  if (!observations.length) throw new Error(`${label}: nessuna osservazione valida`);
  for (const period of [...new Set(observations.map((row) => row.period))]) {
    const totalSexRows = observations.filter(
      (row) => row.period === period && row.sex === "total",
    );
    if (!totalSexRows.length) {
      throw new Error(`${label}/${period}: manca il sesso totale`);
    }
  }
}

function payloadHash(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

function parseHttpDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function ensureSeries(options: {
  seriesKey: string;
  title: string;
  description: string;
  sourceDataset: string;
  externalKey: string;
}) {
  const values = {
    title: options.title,
    description: options.description,
    unit: "persone",
    geographyLevel: "municipality",
    referenceType: "stock",
    source: "ISTAT",
    sourceDataset: options.sourceDataset,
    sourceUrl: ISTAT_SOURCE_URL,
    externalKey: options.externalKey,
    updatedAt: new Date(),
  } as const;
  const [existing] = await db
    .select()
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, options.seriesKey));
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
    .values({ seriesKey: options.seriesKey, ...values })
    .returning();
  return created;
}

async function latestReleaseForDataset(seriesId: number, sourceDataset: string) {
  const [release] = await db
    .select()
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, seriesId),
        eq(demographicReleasesTable.sourceDataset, sourceDataset),
      ),
    )
    .orderBy(desc(demographicReleasesTable.acquiredAt), desc(demographicReleasesTable.id))
    .limit(1);
  return release;
}

async function hasDatasetRelease(seriesId: number, sourceDataset: string) {
  return Boolean(await latestReleaseForDataset(seriesId, sourceDataset));
}

async function persistRelease<T extends ParsedForeignObservation | ParsedCitizenshipObservation>(
  options: {
    seriesId: number;
    sourceDataset: string;
    sourceUrl: string;
    payload: string;
    response: Response;
    observations: T[];
    dimensions: (row: T) => Record<string, string>;
    metadata: Record<string, unknown>;
  },
) {
  const hash = payloadHash(options.payload);
  const [sameRelease] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, options.seriesId),
        eq(demographicReleasesTable.sourceHash, hash),
      ),
    )
    .limit(1);
  if (sameRelease) return { inserted: 0, changed: false };

  const now = new Date();
  const etag = options.response.headers.get("etag");
  const lastModified = options.response.headers.get("last-modified");
  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: options.seriesId,
        sourceDataset: options.sourceDataset,
        sourceUrl: options.sourceUrl,
        sourceHash: hash,
        sourceVersion: etag,
        releaseDate: parseHttpDate(lastModified),
        acquiredAt: now,
        httpEtag: etag,
        httpLastModified: lastModified,
        rawPayload: options.payload,
        metadata: {
          ...options.metadata,
          observationCount: options.observations.length,
          contentType: options.response.headers.get("content-type"),
          parserVersion: 1,
        },
      })
      .returning({ id: demographicReleasesTable.id });

    await tx.insert(demographicObservationsTable).values(
      options.observations.map((row) => {
        const dimensions = options.dimensions(row);
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

async function fetchForeignSource(options: {
  source: ForeignSource;
  dataflowId: string;
  url: string;
  seriesId: number;
  conditional: boolean;
}) {
  const previous = options.conditional
    ? await latestReleaseForDataset(options.seriesId, options.dataflowId)
    : null;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.sdmx.data+csv;version=1.0.0",
  };
  if (previous?.httpEtag) headers["If-None-Match"] = previous.httpEtag;
  if (previous?.httpLastModified) headers["If-Modified-Since"] = previous.httpLastModified;
  const response = await fetch(options.url, { headers });
  if (response.status === 304) return { requests: 1, inserted: 0, changed: false };
  if (!response.ok) {
    throw new Error(`ISTAT ${options.dataflowId} failed with status ${response.status}`);
  }
  const payload = await response.text();
  const observations = parseForeignStructureCsv(payload, options.source);
  validateForeignStructure(observations, options.dataflowId);
  const persisted = await persistRelease({
    seriesId: options.seriesId,
    sourceDataset: options.dataflowId,
    sourceUrl: options.url,
    payload,
    response,
    observations,
    dimensions: (row) => ({ age: row.age, sex: row.sex }),
    metadata:
      options.source === "reconstructed"
        ? {
            acquisitionMode: "single-sdmx-query",
            periodStart: 2002,
            periodEnd: 2018,
            citizenship: "FRG",
            sourceStatus: "reconstructed",
            methodologyBreakAt: 2019,
          }
        : {
            acquisitionMode: "single-sdmx-query",
            periodStart: 2019,
            populationConcept: "foreign-citizens",
            methodologyBreakAt: 2019,
          },
  });
  return { requests: 1, ...persisted };
}

async function fetchCountrySource(seriesId: number) {
  const previous = await latestReleaseForDataset(seriesId, CURRENT_COUNTRY_DATAFLOW_ID);
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.sdmx.data+csv;version=1.0.0",
  };
  if (previous?.httpEtag) headers["If-None-Match"] = previous.httpEtag;
  if (previous?.httpLastModified) headers["If-Modified-Since"] = previous.httpLastModified;
  const url = currentCitizenshipCountriesSdmxUrl();
  const response = await fetch(url, { headers });
  if (response.status === 304) return { requests: 1, inserted: 0, changed: false };
  if (!response.ok) {
    throw new Error(`ISTAT ${CURRENT_COUNTRY_DATAFLOW_ID} failed with status ${response.status}`);
  }
  const payload = await response.text();
  const observations = parseCitizenshipCountriesCsv(payload);
  validateCitizenshipCountries(observations, CURRENT_COUNTRY_DATAFLOW_ID);
  const persisted = await persistRelease({
    seriesId,
    sourceDataset: CURRENT_COUNTRY_DATAFLOW_ID,
    sourceUrl: url,
    payload,
    response,
    observations,
    dimensions: (row) => ({ citizenship: row.citizenship, sex: row.sex }),
    metadata: {
      acquisitionMode: "single-sdmx-query",
      periodStart: 2019,
      populationConcept: "foreign-citizens-by-citizenship",
      note: "Il dataflow contiene sia singoli paesi sia aggregazioni geopolitiche; l'API non somma le aggregazioni.",
    },
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
      url: currentForeignStructureSdmxUrl(),
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
        url: currentForeignStructureSdmxUrl(),
        status: outcome.status,
        error: outcome.error ?? null,
        itemsTotal: outcome.observations ?? 0,
        itemsNew: outcome.releases ?? 0,
        lastCheckedAt: now,
        ...((outcome.releases ?? 0) > 0 ? { lastUpdatedAt: now } : {}),
      },
    });
}

export async function runPopulationCitizenshipIngestion() {
  const foreignSeries = await ensureSeries({
    seriesKey: FOREIGN_STRUCTURE_SERIES_KEY,
    title: "Popolazione con cittadinanza straniera per età e sesso al 1° gennaio",
    description:
      "Residenti di Lamezia Terme con cittadinanza non italiana per singola età e sesso. Il tratto 2002–2018 è ricostruito; dal 2019 la fonte è la popolazione straniera del Censimento permanente.",
    sourceDataset: `${RECONSTRUCTED_DATAFLOW_ID} + ${CURRENT_FOREIGN_DATAFLOW_ID}`,
    externalKey: `istat:foreign-citizens-structure:${LAMEZIA_ISTAT_CODE}`,
  });
  const countrySeries = await ensureSeries({
    seriesKey: CITIZENSHIP_COUNTRY_SERIES_KEY,
    title: "Popolazione straniera per singola cittadinanza al 1° gennaio",
    description:
      "Residenti di Lamezia Terme con cittadinanza straniera distinti per singolo paese di cittadinanza e sesso. Le aggregazioni geopolitiche presenti nella fonte restano distinguibili dai paesi.",
    sourceDataset: CURRENT_COUNTRY_DATAFLOW_ID,
    externalKey: `istat:foreign-citizenship-country:${LAMEZIA_ISTAT_CODE}`,
  });

  let requests = 0;
  let releases = 0;
  let observations = 0;
  try {
    const hadCountryRelease = await hasDatasetRelease(
      countrySeries.id,
      CURRENT_COUNTRY_DATAFLOW_ID,
    );
    const currentForeign = await fetchForeignSource({
      source: "current",
      dataflowId: CURRENT_FOREIGN_DATAFLOW_ID,
      url: currentForeignStructureSdmxUrl(),
      seriesId: foreignSeries.id,
      conditional: true,
    });
    requests += currentForeign.requests;
    if (currentForeign.changed) releases++;
    observations += currentForeign.inserted;

    const countries = await fetchCountrySource(countrySeries.id);
    requests += countries.requests;
    if (countries.changed) releases++;
    observations += countries.inserted;

    // Sul primo ciclo del modulo privilegiamo il dato corrente e rinviamo di
    // un ciclo il backfill storico: insieme alle query popolazione/struttura già
    // esistenti questo mantiene il cold start entro il limite ISTAT di 5 query
    // SDMX/minuto/IP. Dal ciclo successivo il backfill è one-shot e poi no-op.
    const historicalPresent = await hasDatasetRelease(
      foreignSeries.id,
      RECONSTRUCTED_DATAFLOW_ID,
    );
    if (hadCountryRelease && !historicalPresent) {
      const historical = await fetchForeignSource({
        source: "reconstructed",
        dataflowId: RECONSTRUCTED_DATAFLOW_ID,
        url: reconstructedForeignStructureSdmxUrl(),
        seriesId: foreignSeries.id,
        conditional: false,
      });
      requests += historical.requests;
      if (historical.changed) releases++;
      observations += historical.inserted;
    }

    await recordFeedStatus({ status: "ok", observations, releases });
    logger.info(
      { requests, releases, observations, historicalDeferred: !hadCountryRelease && !historicalPresent },
      "ISTAT population citizenship ingestion complete",
    );
    return {
      requests,
      releases,
      observations,
      historicalDeferred: !hadCountryRelease && !historicalPresent,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await recordFeedStatus({ status: "error", error: message });
    logger.error({ err }, "ISTAT population citizenship ingestion failed");
    throw err;
  }
}

type CurrentForeignPoint = ParsedForeignObservation & {
  releaseId: number;
  acquiredAt: Date;
  sourceDataset: string;
};

type CurrentCountryPoint = ParsedCitizenshipObservation & {
  releaseId: number;
  acquiredAt: Date;
  sourceDataset: string;
};

async function getCurrentForeignPoints(): Promise<CurrentForeignPoint[]> {
  return getCurrentPoints(FOREIGN_STRUCTURE_SERIES_KEY, (row) => {
    const dimensions = row.dimensions as Record<string, string>;
    const age = dimensions.age as StructureAge | undefined;
    const sex = dimensions.sex as StructureSex | undefined;
    if (!age || !sex) return null;
    return {
      period: row.period,
      age,
      sex,
      value: Number(row.value),
      sourceStatus: row.sourceStatus as DemographicSourceStatus,
      rawStatus: row.sourceObservationStatus,
      qualityFlags: row.qualityFlags as string[],
      releaseId: row.releaseId,
      acquiredAt: row.acquiredAt,
      sourceDataset: row.sourceDataset,
    } satisfies CurrentForeignPoint;
  });
}

async function getCurrentCountryPoints(): Promise<CurrentCountryPoint[]> {
  return getCurrentPoints(CITIZENSHIP_COUNTRY_SERIES_KEY, (row) => {
    const dimensions = row.dimensions as Record<string, string>;
    const citizenship = dimensions.citizenship;
    const sex = dimensions.sex as StructureSex | undefined;
    if (!citizenship || !sex) return null;
    return {
      period: row.period,
      citizenship,
      sex,
      value: Number(row.value),
      sourceStatus: row.sourceStatus as DemographicSourceStatus,
      rawStatus: row.sourceObservationStatus,
      qualityFlags: row.qualityFlags as string[],
      releaseId: row.releaseId,
      acquiredAt: row.acquiredAt,
      sourceDataset: row.sourceDataset,
    } satisfies CurrentCountryPoint;
  });
}

type StoredRow = {
  period: string;
  value: string;
  dimensions: unknown;
  sourceStatus: string;
  sourceObservationStatus: string | null;
  qualityFlags: unknown;
  dimensionKey: string;
  releaseId: number;
  acquiredAt: Date;
  sourceDataset: string;
};

async function getCurrentPoints<T>(
  seriesKey: string,
  convert: (row: StoredRow) => T | null,
): Promise<T[]> {
  const [series] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, seriesKey));
  if (!series) return [];
  const rows = await db
    .select({
      period: demographicObservationsTable.referencePeriod,
      value: demographicObservationsTable.value,
      dimensions: demographicObservationsTable.dimensions,
      sourceStatus: demographicObservationsTable.sourceStatus,
      sourceObservationStatus: demographicObservationsTable.sourceObservationStatus,
      qualityFlags: demographicObservationsTable.qualityFlags,
      dimensionKey: demographicObservationsTable.dimensionKey,
      releaseId: demographicReleasesTable.id,
      acquiredAt: demographicReleasesTable.acquiredAt,
      sourceDataset: demographicReleasesTable.sourceDataset,
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
  const current = new Map<string, T>();
  for (const row of rows) {
    const point = convert(row as StoredRow);
    if (!point) continue;
    current.set(`${row.period}|${row.dimensionKey}`, point);
  }
  return [...current.values()];
}

async function getPopulationTotalsByPeriod(): Promise<Map<string, number>> {
  const [series] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, POPULATION_STRUCTURE_SERIES_KEY));
  if (!series) return new Map();
  const rows = await db
    .select({
      period: demographicObservationsTable.referencePeriod,
      value: demographicObservationsTable.value,
      dimensions: demographicObservationsTable.dimensions,
      dimensionKey: demographicObservationsTable.dimensionKey,
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
    .orderBy(asc(demographicReleasesTable.acquiredAt), asc(demographicReleasesTable.id));
  const totals = new Map<string, number>();
  for (const row of rows) {
    const dimensions = row.dimensions as Record<string, string>;
    if (dimensions.age === "TOTAL" && dimensions.sex === "total") {
      totals.set(row.period, Number(row.value));
    }
  }
  return totals;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number | null, digits = 1): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function ageNumber(age: StructureAge): number | null {
  if (age === "TOTAL") return null;
  if (age === "100+") return 100;
  const value = Number(age);
  return Number.isFinite(value) ? value : null;
}

function foreignTotal(rows: ParsedForeignObservation[]) {
  const direct = rows.find((row) => row.sex === "total" && row.age === "TOTAL")?.value;
  if (direct !== undefined) return direct;
  const totalByAge = rows.filter((row) => row.sex === "total" && row.age !== "TOTAL");
  if (totalByAge.length) return sum(totalByAge.map((row) => row.value));
  return sum(rows.filter((row) => row.sex === "male" && row.age !== "TOTAL").map((row) => row.value)) +
    sum(rows.filter((row) => row.sex === "female" && row.age !== "TOTAL").map((row) => row.value));
}

function sumForeignAgeRange(rows: ParsedForeignObservation[], from: number, to: number | null) {
  const totalRows = rows.filter((row) => row.sex === "total" && row.age !== "TOTAL");
  const sourceRows = totalRows.length
    ? totalRows
    : rows.filter((row) => row.sex !== "total" && row.age !== "TOTAL");
  return sum(
    sourceRows
      .filter((row) => {
        const age = ageNumber(row.age);
        return age !== null && age >= from && (to === null || age <= to);
      })
      .map((row) => row.value),
  );
}

function statusForRows(rows: Array<{ sourceStatus: DemographicSourceStatus }>) {
  const statuses = new Set(rows.map((row) => row.sourceStatus));
  for (const status of ["provisional", "estimated", "reconstructed", "unknown"] as const) {
    if (statuses.has(status)) return status;
  }
  return "final" as const;
}

const NON_COUNTRY_CODES = new Set(["EU", "EZ", "UN", "TOTAL", "FRG", "ITL"]);

export function countryName(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  if (normalized === "XK") return "Kosovo";
  if (!/^[A-Z]{2}$/.test(normalized) || NON_COUNTRY_CODES.has(normalized)) return null;
  try {
    const name = new Intl.DisplayNames(["it"], { type: "region" }).of(normalized);
    return name && name !== normalized ? name : null;
  } catch {
    return null;
  }
}

function countryCounts(rows: CurrentCountryPoint[]) {
  const grouped = new Map<string, { male: number; female: number; total: number | null }>();
  for (const row of rows) {
    if (!countryName(row.citizenship)) continue;
    const current = grouped.get(row.citizenship) ?? { male: 0, female: 0, total: null };
    if (row.sex === "male") current.male = row.value;
    if (row.sex === "female") current.female = row.value;
    if (row.sex === "total") current.total = row.value;
    grouped.set(row.citizenship, current);
  }
  return [...grouped.entries()].map(([code, counts]) => ({
    code,
    name: countryName(code) ?? code,
    male: counts.male,
    female: counts.female,
    total: counts.total ?? counts.male + counts.female,
  }));
}

export type PopulationCitizenshipSnapshot = {
  period: string;
  availablePeriods: string[];
  sourceStatus: DemographicSourceStatus;
  counts: {
    population: number | null;
    foreign: number;
    italian: number | null;
    foreignShare: number | null;
  };
  foreignAgeBands: Array<{
    key: "0-14" | "15-64" | "65+";
    count: number;
    shareOfForeign: number | null;
  }>;
  history: Array<{
    period: string;
    population: number | null;
    foreign: number;
    foreignShare: number | null;
    sourceStatus: DemographicSourceStatus;
  }>;
  citizenshipDetail: {
    period: string;
    availablePeriods: string[];
    topCountries: Array<{
      code: string;
      name: string;
      total: number;
      male: number;
      female: number;
      shareOfForeign: number | null;
    }>;
    countryLeafTotal: number;
    foreignTotal: number | null;
    coverageDifference: number | null;
  } | null;
  source: {
    name: "ISTAT";
    foreignDataset: string;
    citizenshipDataset: string;
    url: string;
  };
};

export async function getPopulationCitizenshipSnapshot(
  requestedPeriod?: string | null,
): Promise<PopulationCitizenshipSnapshot | null> {
  const foreignPoints = await getCurrentForeignPoints();
  const countryPoints = await getCurrentCountryPoints();
  const populationTotals = await getPopulationTotalsByPeriod();
  const availablePeriods = [...new Set(foreignPoints.map((row) => row.period))].sort();
  if (!availablePeriods.length) return null;
  const period =
    requestedPeriod && requestedPeriod !== "latest" && availablePeriods.includes(requestedPeriod)
      ? requestedPeriod
      : availablePeriods[availablePeriods.length - 1];
  const selected = foreignPoints.filter((row) => row.period === period);
  const foreign = foreignTotal(selected);
  const population = populationTotals.get(period) ?? null;
  const italian = population === null ? null : population - foreign;
  const share = population && population > 0 ? round((foreign / population) * 100) : null;
  const foreignShare = (count: number) => (foreign > 0 ? round((count / foreign) * 100) : null);

  const history = availablePeriods.map((historyPeriod) => {
    const rows = foreignPoints.filter((row) => row.period === historyPeriod);
    const foreignCount = foreignTotal(rows);
    const populationCount = populationTotals.get(historyPeriod) ?? null;
    return {
      period: historyPeriod,
      population: populationCount,
      foreign: foreignCount,
      foreignShare:
        populationCount && populationCount > 0
          ? round((foreignCount / populationCount) * 100)
          : null,
      sourceStatus: statusForRows(rows),
    };
  });

  const countryAvailablePeriods = [...new Set(countryPoints.map((row) => row.period))].sort();
  const eligibleCountryPeriods = countryAvailablePeriods.filter((item) => item <= period);
  const countryPeriod = eligibleCountryPeriods.at(-1) ?? null;
  let citizenshipDetail: PopulationCitizenshipSnapshot["citizenshipDetail"] = null;
  if (countryPeriod) {
    const countryRows = countryPoints.filter((row) => row.period === countryPeriod);
    const countries = countryCounts(countryRows).filter((row) => row.total > 0);
    const countryLeafTotal = sum(countries.map((row) => row.total));
    const foreignRowsForCountryPeriod = foreignPoints.filter((row) => row.period === countryPeriod);
    const foreignTotalForCountryPeriod = foreignRowsForCountryPeriod.length
      ? foreignTotal(foreignRowsForCountryPeriod)
      : null;
    citizenshipDetail = {
      period: countryPeriod,
      availablePeriods: countryAvailablePeriods,
      topCountries: countries
        .sort((left, right) => right.total - left.total || left.name.localeCompare(right.name, "it"))
        .slice(0, 10)
        .map((row) => ({
          ...row,
          shareOfForeign:
            foreignTotalForCountryPeriod && foreignTotalForCountryPeriod > 0
              ? round((row.total / foreignTotalForCountryPeriod) * 100)
              : null,
        })),
      countryLeafTotal,
      foreignTotal: foreignTotalForCountryPeriod,
      coverageDifference:
        foreignTotalForCountryPeriod === null
          ? null
          : foreignTotalForCountryPeriod - countryLeafTotal,
    };
  }

  return {
    period,
    availablePeriods,
    sourceStatus: statusForRows(selected),
    counts: { population, foreign, italian, foreignShare: share },
    foreignAgeBands: [
      {
        key: "0-14",
        count: sumForeignAgeRange(selected, 0, 14),
        shareOfForeign: foreignShare(sumForeignAgeRange(selected, 0, 14)),
      },
      {
        key: "15-64",
        count: sumForeignAgeRange(selected, 15, 64),
        shareOfForeign: foreignShare(sumForeignAgeRange(selected, 15, 64)),
      },
      {
        key: "65+",
        count: sumForeignAgeRange(selected, 65, null),
        shareOfForeign: foreignShare(sumForeignAgeRange(selected, 65, null)),
      },
    ],
    history,
    citizenshipDetail,
    source: {
      name: "ISTAT",
      foreignDataset:
        period < "2019" ? RECONSTRUCTED_DATAFLOW_ID : CURRENT_FOREIGN_DATAFLOW_ID,
      citizenshipDataset: CURRENT_COUNTRY_DATAFLOW_ID,
      url: ISTAT_SOURCE_URL,
    },
  };
}
