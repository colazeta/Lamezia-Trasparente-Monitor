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
import { logger } from "./logger";

export const POPULATION_STRUCTURE_SERIES_KEY = "population-structure-jan1";

const CURRENT_DATAFLOW_ID = "22_289";
const CURRENT_DATAFLOW = `IT1,${CURRENT_DATAFLOW_ID},1.0`;
const RECONSTRUCTED_DATAFLOW_ID = "164_164_DF_DCIS_RICPOPRES2011_21";
const RECONSTRUCTED_DATAFLOW = `IT1,${RECONSTRUCTED_DATAFLOW_ID},1.0`;
const ISTAT_SDMX_BASE = "https://esploradati.istat.it/SDMXWS/rest/data";
const ISTAT_SOURCE_URL = "https://esploradati.istat.it";
const FEED_SOURCE = "demographics:istat-population-structure";
const FEED_LABEL = "ISTAT – Struttura per età e sesso (Lamezia Terme)";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";

export type StructureSex = "male" | "female" | "total";
export type StructureAge = `${number}` | "100+" | "TOTAL";

export type ParsedStructureObservation = {
  period: string;
  age: StructureAge;
  sex: StructureSex;
  value: number;
  sourceStatus: DemographicSourceStatus;
  rawStatus: string | null;
  qualityFlags: string[];
};

type StructureSource = "current" | "reconstructed";

export function currentStructureSdmxKey(): string {
  // Dimension order in 22_289:
  // FREQ.REF_AREA.DATA_TYPE.SEX.AGE.MARITAL_STATUS.
  // Empty AGE means all single ages; 99 keeps civil status at total.
  return `A.${LAMEZIA_ISTAT_CODE}.JAN.1+2+9..99`;
}

export function reconstructedStructureSdmxKey(): string {
  // Dimension order in the reconstruction:
  // FREQ.REF_AREA.DATA_TYPE.AGE.SEX.CITIZENSHIP.
  // Empty AGE means all ages; TOTAL excludes citizenship-specific splits.
  return `A.${LAMEZIA_ISTAT_CODE}.JAN..1+2+9.TOTAL`;
}

export function currentStructureSdmxUrl(): string {
  return `${ISTAT_SDMX_BASE}/${CURRENT_DATAFLOW}/${currentStructureSdmxKey()}`;
}

export function reconstructedStructureSdmxUrl(): string {
  return `${ISTAT_SDMX_BASE}/${RECONSTRUCTED_DATAFLOW}/${reconstructedStructureSdmxKey()}?startPeriod=2002&endPeriod=2018`;
}

export function parseStructureSex(raw: string): StructureSex | null {
  const value = raw.trim().toUpperCase();
  if (value === "1" || value === "M" || value === "MALE" || value === "MASCHI") {
    return "male";
  }
  if (value === "2" || value === "F" || value === "FEMALE" || value === "FEMMINE") {
    return "female";
  }
  if (
    value === "9" ||
    value === "T" ||
    value === "TOTAL" ||
    value === "TOTALE" ||
    value === "MF"
  ) {
    return "total";
  }
  return null;
}

export function parseStructureAge(raw: string): StructureAge | null {
  const value = raw.trim().toUpperCase();
  if (value === "TOTAL" || value === "TOTALE") return "TOTAL";
  if (
    value === "Y_GE100" ||
    value === "Y100+" ||
    value === "100+" ||
    value === "100 E PIU" ||
    value === "100 E PIÙ"
  ) {
    return "100+";
  }
  const coded = value.match(/^Y(\d{1,3})$/);
  const plain = value.match(/^(\d{1,3})$/);
  const parsed = Number(coded?.[1] ?? plain?.[1]);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  if (parsed >= 100) return "100+";
  return String(parsed) as StructureAge;
}

export function parsePopulationStructureCsv(
  csv: string,
  source: StructureSource,
): ParsedStructureObservation[] {
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
  const maritalIdx = header.indexOf("MARITAL_STATUS");
  const citizenshipIdx = header.indexOf("CITIZENSHIP");

  if (ageIdx < 0 || sexIdx < 0 || periodIdx < 0 || valueIdx < 0) {
    throw new Error(
      "ISTAT structure CSV privo di AGE, SEX, TIME_PERIOD o OBS_VALUE",
    );
  }

  const out: ParsedStructureObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (refAreaIdx >= 0 && cols[refAreaIdx]?.trim() !== LAMEZIA_ISTAT_CODE) continue;
    if (dataTypeIdx >= 0 && cols[dataTypeIdx]?.trim() !== "JAN") continue;
    if (source === "current" && maritalIdx >= 0 && cols[maritalIdx]?.trim() !== "99") {
      continue;
    }
    if (
      source === "reconstructed" &&
      citizenshipIdx >= 0 &&
      cols[citizenshipIdx]?.trim() !== "TOTAL"
    ) {
      continue;
    }

    const period = cols[periodIdx]?.trim();
    const year = Number(period?.slice(0, 4));
    if (!period || !Number.isInteger(year)) continue;
    if (source === "current" && year < 2019) continue;
    if (source === "reconstructed" && (year < 2002 || year > 2018)) continue;

    const sex = parseStructureSex(cols[sexIdx] ?? "");
    const age = parseStructureAge(cols[ageIdx] ?? "");
    const value = Number(cols[valueIdx]?.trim());
    if (!sex || !age || !Number.isFinite(value)) continue;

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

function ageSortValue(age: StructureAge): number {
  if (age === "TOTAL") return 1001;
  if (age === "100+") return 100;
  return Number(age);
}

export function validatePopulationStructure(
  observations: ParsedStructureObservation[],
  label: string,
): void {
  if (!observations.length) throw new Error(`${label}: nessuna osservazione valida`);
  const periods = [...new Set(observations.map((point) => point.period))];
  for (const period of periods) {
    const periodRows = observations.filter((point) => point.period === period);
    for (const sex of ["male", "female"] as const) {
      const singleAges = new Set(
        periodRows
          .filter((point) => point.sex === sex && point.age !== "TOTAL")
          .map((point) => point.age),
      );
      if (singleAges.size < 100) {
        throw new Error(
          `${label}/${period}/${sex}: copertura età incompleta (${singleAges.size} classi)`,
        );
      }
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

async function ensureStructureSeries() {
  const values = {
    title: "Struttura della popolazione per età e sesso al 1° gennaio",
    description:
      "Popolazione residente di Lamezia Terme per singola età e sesso. Il tratto 2002–2018 è una ricostruzione statistica; dal 2019 la serie usa la popolazione residente del Censimento permanente. Le release restano versionate.",
    unit: "persone",
    geographyLevel: "municipality",
    referenceType: "stock",
    source: "ISTAT",
    sourceDataset: `${RECONSTRUCTED_DATAFLOW_ID} + ${CURRENT_DATAFLOW_ID}`,
    sourceUrl: ISTAT_SOURCE_URL,
    externalKey: `istat:population-structure:${LAMEZIA_ISTAT_CODE}`,
    updatedAt: new Date(),
  } as const;

  const [existing] = await db
    .select()
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, POPULATION_STRUCTURE_SERIES_KEY));
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
    .values({ seriesKey: POPULATION_STRUCTURE_SERIES_KEY, ...values })
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
  const release = await latestReleaseForDataset(seriesId, sourceDataset);
  return Boolean(release);
}

async function persistStructureRelease(options: {
  seriesId: number;
  sourceDataset: string;
  sourceUrl: string;
  payload: string;
  response: Response;
  observations: ParsedStructureObservation[];
  metadata: Record<string, unknown>;
}) {
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
      options.observations.map((point) => {
        const dimensions = { age: point.age, sex: point.sex };
        return {
          seriesId: options.seriesId,
          releaseId: release.id,
          geographyCode: LAMEZIA_ISTAT_CODE,
          referencePeriod: point.period,
          referenceType: "stock" as const,
          dimensions,
          dimensionKey: canonicalDimensionKey(dimensions),
          value: String(point.value),
          unit: "persone",
          sourceStatus: point.sourceStatus,
          sourceObservationStatus: point.rawStatus,
          qualityFlags: point.qualityFlags,
        };
      }),
    );
  });

  return { inserted: options.observations.length, changed: true };
}

async function fetchStructureSource(options: {
  source: StructureSource;
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
    throw new Error(
      `ISTAT population structure ${options.dataflowId} failed with status ${response.status}`,
    );
  }

  const payload = await response.text();
  const observations = parsePopulationStructureCsv(payload, options.source);
  validatePopulationStructure(observations, options.dataflowId);
  const persisted = await persistStructureRelease({
    seriesId: options.seriesId,
    sourceDataset: options.dataflowId,
    sourceUrl: options.url,
    payload,
    response,
    observations,
    metadata:
      options.source === "reconstructed"
        ? {
            acquisitionMode: "single-sdmx-query",
            periodStart: 2002,
            periodEnd: 2018,
            sourceStatus: "reconstructed",
            territorialClassification: 2019,
            methodologyBreakAt: 2019,
          }
        : {
            acquisitionMode: "single-sdmx-query",
            periodStart: 2019,
            sourceStatus: "source-observation-status",
            methodologyBreakAt: 2019,
          },
  });
  return { requests: 1, ...persisted };
}

async function recordFeedStatus(outcome: {
  status: "ok" | "error";
  observations?: number;
  releases?: number;
  requests?: number;
  error?: string;
}) {
  const now = new Date();
  await db
    .insert(feedStatusTable)
    .values({
      source: FEED_SOURCE,
      label: FEED_LABEL,
      url: currentStructureSdmxUrl(),
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
        url: currentStructureSdmxUrl(),
        status: outcome.status,
        error: outcome.error ?? null,
        itemsTotal: outcome.observations ?? 0,
        itemsNew: outcome.releases ?? 0,
        lastCheckedAt: now,
        ...((outcome.releases ?? 0) > 0 ? { lastUpdatedAt: now } : {}),
      },
    });
}

export async function runPopulationStructureIngestion() {
  const series = await ensureStructureSeries();
  let requests = 0;
  let releases = 0;
  let observations = 0;

  try {
    const current = await fetchStructureSource({
      source: "current",
      dataflowId: CURRENT_DATAFLOW_ID,
      url: currentStructureSdmxUrl(),
      seriesId: series.id,
      conditional: true,
    });
    requests += current.requests;
    if (current.changed) releases++;
    observations += current.inserted;

    // La ricostruzione 2002–2018 è acquisita una sola volta. Non viene
    // interrogata nei cicli ordinari dopo che una release completa è presente.
    if (!(await hasDatasetRelease(series.id, RECONSTRUCTED_DATAFLOW_ID))) {
      const historical = await fetchStructureSource({
        source: "reconstructed",
        dataflowId: RECONSTRUCTED_DATAFLOW_ID,
        url: reconstructedStructureSdmxUrl(),
        seriesId: series.id,
        conditional: false,
      });
      requests += historical.requests;
      if (historical.changed) releases++;
      observations += historical.inserted;
    }

    await recordFeedStatus({
      status: "ok",
      observations,
      releases,
      requests,
    });
    logger.info(
      { requests, releases, observations },
      "ISTAT population structure ingestion complete",
    );
    return { requests, releases, observations };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await recordFeedStatus({ status: "error", error: message });
    logger.error({ err }, "ISTAT population structure ingestion failed");
    throw err;
  }
}

export type CurrentStructurePoint = ParsedStructureObservation & {
  releaseId: number;
  acquiredAt: Date;
  sourceDataset: string;
};

async function getCurrentStructurePoints(): Promise<CurrentStructurePoint[]> {
  const [series] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, POPULATION_STRUCTURE_SERIES_KEY));
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

  const current = new Map<string, CurrentStructurePoint>();
  for (const row of rows) {
    const dimensions = row.dimensions as Record<string, string>;
    const sex = dimensions.sex as StructureSex | undefined;
    const age = dimensions.age as StructureAge | undefined;
    if (!sex || !age) continue;
    const identity = `${row.period}|${row.dimensionKey}`;
    current.set(identity, {
      period: row.period,
      value: Number(row.value),
      age,
      sex,
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
      left.sex.localeCompare(right.sex) ||
      ageSortValue(left.age) - ageSortValue(right.age),
  );
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number | null, digits = 1): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function statusForRows(rows: ParsedStructureObservation[]): DemographicSourceStatus {
  const statuses = new Set(rows.map((row) => row.sourceStatus));
  for (const status of ["provisional", "estimated", "reconstructed", "unknown"] as const) {
    if (statuses.has(status)) return status;
  }
  return "final";
}

function ageNumber(age: StructureAge): number | null {
  if (age === "TOTAL") return null;
  if (age === "100+") return 100;
  const value = Number(age);
  return Number.isFinite(value) ? value : null;
}

function valueForAgeSex(
  rows: ParsedStructureObservation[],
  age: StructureAge,
  sex: StructureSex,
): number | null {
  return rows.find((row) => row.age === age && row.sex === sex)?.value ?? null;
}

function countForAge(
  rows: ParsedStructureObservation[],
  age: StructureAge,
): number | null {
  const direct = valueForAgeSex(rows, age, "total");
  if (direct !== null) return direct;
  const male = valueForAgeSex(rows, age, "male");
  const female = valueForAgeSex(rows, age, "female");
  return male !== null && female !== null ? male + female : null;
}

function sumAgeRange(
  rows: ParsedStructureObservation[],
  from: number,
  to: number | null,
): number {
  return sum(
    rows
      .filter((row) => row.sex === "total" && row.age !== "TOTAL")
      .filter((row) => {
        const age = ageNumber(row.age);
        if (age === null || age < from) return false;
        return to === null || age <= to;
      })
      .map((row) => row.value),
  );
}

export type PopulationStructureSnapshot = {
  period: string;
  availablePeriods: string[];
  sourceStatus: DemographicSourceStatus;
  source: { name: string; dataset: string; url: string };
  counts: { total: number; male: number; female: number };
  bands: Array<{ key: "0-14" | "15-64" | "65+" | "80+"; count: number; share: number | null }>;
  indicators: {
    ageingIndex: number | null;
    structuralDependency: number | null;
    elderlyDependency: number | null;
    youthDependency: number | null;
  };
  pyramid: Array<{ ageGroup: string; from: number; to: number | null; male: number; female: number; total: number }>;
  quality: {
    sexReconciliationDifference: number;
    ageReconciliationDifference: number;
    exactSexReconciliation: boolean;
    exactAgeReconciliation: boolean;
  };
};

export function summarizePopulationStructure(
  rows: ParsedStructureObservation[],
  period: string,
  availablePeriods: string[] = [period],
): PopulationStructureSnapshot {
  const selected = rows.filter((row) => row.period === period);
  if (!selected.length) throw new Error(`Nessuna struttura demografica per ${period}`);

  const male =
    valueForAgeSex(selected, "TOTAL", "male") ??
    sum(selected.filter((row) => row.sex === "male" && row.age !== "TOTAL").map((row) => row.value));
  const female =
    valueForAgeSex(selected, "TOTAL", "female") ??
    sum(selected.filter((row) => row.sex === "female" && row.age !== "TOTAL").map((row) => row.value));
  const total = valueForAgeSex(selected, "TOTAL", "total") ?? male + female;
  const ageTotal = sum(
    selected
      .filter((row) => row.sex === "total" && row.age !== "TOTAL")
      .map((row) => row.value),
  );

  const young = sumAgeRange(selected, 0, 14);
  const working = sumAgeRange(selected, 15, 64);
  const elderly = sumAgeRange(selected, 65, null);
  const eightyPlus = sumAgeRange(selected, 80, null);
  const share = (count: number) => (total > 0 ? round((count / total) * 100) : null);
  const ratio = (numerator: number, denominator: number) =>
    denominator > 0 ? round((numerator / denominator) * 100) : null;

  const pyramid: PopulationStructureSnapshot["pyramid"] = [];
  for (let from = 0; from <= 95; from += 5) {
    const to = from + 4;
    let groupMale = 0;
    let groupFemale = 0;
    for (let age = from; age <= to; age++) {
      const label = String(age) as StructureAge;
      groupMale += valueForAgeSex(selected, label, "male") ?? 0;
      groupFemale += valueForAgeSex(selected, label, "female") ?? 0;
    }
    pyramid.push({
      ageGroup: `${from}–${to}`,
      from,
      to,
      male: groupMale,
      female: groupFemale,
      total: groupMale + groupFemale,
    });
  }
  const hundredMale = valueForAgeSex(selected, "100+", "male") ?? 0;
  const hundredFemale = valueForAgeSex(selected, "100+", "female") ?? 0;
  pyramid.push({
    ageGroup: "100+",
    from: 100,
    to: null,
    male: hundredMale,
    female: hundredFemale,
    total: hundredMale + hundredFemale,
  });

  const datasets = [...new Set((selected as CurrentStructurePoint[]).map((row) => row.sourceDataset).filter(Boolean))];
  const dataset = datasets.length ? datasets.join(" + ") : period < "2019" ? RECONSTRUCTED_DATAFLOW_ID : CURRENT_DATAFLOW_ID;

  return {
    period,
    availablePeriods,
    sourceStatus: statusForRows(selected),
    source: { name: "ISTAT", dataset, url: ISTAT_SOURCE_URL },
    counts: { total, male, female },
    bands: [
      { key: "0-14", count: young, share: share(young) },
      { key: "15-64", count: working, share: share(working) },
      { key: "65+", count: elderly, share: share(elderly) },
      { key: "80+", count: eightyPlus, share: share(eightyPlus) },
    ],
    indicators: {
      ageingIndex: ratio(elderly, young),
      structuralDependency: ratio(young + elderly, working),
      elderlyDependency: ratio(elderly, working),
      youthDependency: ratio(young, working),
    },
    pyramid,
    quality: {
      sexReconciliationDifference: total - (male + female),
      ageReconciliationDifference: total - ageTotal,
      exactSexReconciliation: Math.abs(total - (male + female)) <= 0.5,
      exactAgeReconciliation: Math.abs(total - ageTotal) <= 0.5,
    },
  };
}

export async function getPopulationStructureSnapshot(
  requestedPeriod?: string | null,
): Promise<PopulationStructureSnapshot | null> {
  const points = await getCurrentStructurePoints();
  const availablePeriods = [...new Set(points.map((point) => point.period))].sort();
  if (!availablePeriods.length) return null;
  const period =
    requestedPeriod && requestedPeriod !== "latest" && availablePeriods.includes(requestedPeriod)
      ? requestedPeriod
      : availablePeriods[availablePeriods.length - 1];
  return summarizePopulationStructure(points, period, availablePeriods);
}
