import { createHash } from "node:crypto";
import {
  db,
  demographicSeriesTable,
  demographicReleasesTable,
  demographicObservationsTable,
  performanceIndicatorsTable,
  performanceIndicatorValuesTable,
  feedStatusTable,
  type DemographicSourceStatus,
} from "@workspace/db";
import { and, asc, desc, eq } from "drizzle-orm";
import { logger } from "./logger";

export const LAMEZIA_ISTAT_CODE = "079160";
export const POPULATION_SERIES_KEY = "population-resident-jan1";
export const POPULATION_EXTERNAL_KEY =
  `istat:22_289:A.${LAMEZIA_ISTAT_CODE}.JAN.9.TOTAL.99`;

// Manteniamo questo source id per compatibilità con la pagina stato fonti della
// sezione Performance. L'archivio canonico, però, è demographic_*.
const POPULATION_FEED_SOURCE = "performance:istat-popolazione";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";

export type DemographicSeriesConfig = {
  seriesKey: string;
  title: string;
  description: string;
  unit: string;
  geographyLevel: "municipality";
  referenceType: "stock" | "flow";
  source: string;
  sourceDataset: string;
  sourceUrl: string;
  externalKey: string;
  dataflow: string;
  key: string;
  defaultStatus: DemographicSourceStatus;
  feedSource: string;
  feedLabel: string;
};

export const POPULATION_SERIES: DemographicSeriesConfig = {
  seriesKey: POPULATION_SERIES_KEY,
  title: "Popolazione residente al 1° gennaio",
  description:
    "Popolazione residente nel Comune di Lamezia Terme al 1° gennaio. Le release ISTAT sono conservate separatamente per rendere visibili eventuali revisioni dello stesso periodo.",
  unit: "abitanti",
  geographyLevel: "municipality",
  referenceType: "stock",
  source: "ISTAT",
  sourceDataset: "22_289",
  sourceUrl: "https://esploradati.istat.it",
  externalKey: POPULATION_EXTERNAL_KEY,
  dataflow: "IT1,22_289,1.0",
  key: `A.${LAMEZIA_ISTAT_CODE}.JAN.9.TOTAL.99`,
  defaultStatus: "final",
  feedSource: POPULATION_FEED_SOURCE,
  feedLabel: "ISTAT – Popolazione residente (Lamezia Terme)",
};

export type ParsedSdmxObservation = {
  period: string;
  value: number;
  rawStatus: string | null;
  sourceStatus: DemographicSourceStatus;
  qualityFlags: string[];
};

// Parser CSV minimale ma corretto per campi quotati e virgole interne. Il
// precedente parser usava split(","), che non è sicuro per un CSV SDMX reale.
export function parseCsvRow(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === "," && !quoted) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

export function mapSdmxStatus(
  rawStatus: string | null | undefined,
  defaultStatus: DemographicSourceStatus = "unknown",
): { status: DemographicSourceStatus; qualityFlags: string[] } {
  const code = rawStatus?.trim().toLowerCase() ?? "";
  if (!code) return { status: defaultStatus, qualityFlags: [] };
  if (code === "e") {
    return { status: "estimated", qualityFlags: ["source_estimate"] };
  }
  if (code === "p") {
    return { status: "provisional", qualityFlags: ["source_provisional"] };
  }
  return {
    status: "unknown",
    qualityFlags: [`source_status:${code}`],
  };
}

export function parseSdmxCsv(
  csv: string,
  defaultStatus: DemographicSourceStatus,
): ParsedSdmxObservation[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvRow(lines[0]).map((value) => value.trim());
  const periodIdx = header.indexOf("TIME_PERIOD");
  const valueIdx = header.indexOf("OBS_VALUE");
  const statusIdx = header.indexOf("OBS_STATUS");
  if (periodIdx === -1 || valueIdx === -1) return [];

  const out: ParsedSdmxObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const period = cols[periodIdx]?.trim();
    const rawValue = cols[valueIdx]?.trim();
    if (!period || !rawValue) continue;

    const value = Number(rawValue);
    if (!Number.isFinite(value)) continue;

    const rawStatus =
      statusIdx >= 0 && cols[statusIdx]?.trim()
        ? cols[statusIdx].trim()
        : null;
    const mapped = mapSdmxStatus(rawStatus, defaultStatus);
    out.push({
      period,
      value,
      rawStatus,
      sourceStatus: mapped.status,
      qualityFlags: mapped.qualityFlags,
    });
  }
  return out;
}

export function canonicalDimensionKey(
  dimensions: Record<string, string>,
): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(dimensions).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  );
}

function sourceHash(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

function istatUrl(config: DemographicSeriesConfig): string {
  // Nessun filtro temporale: la chiave seleziona una sola serie comunale e il
  // payload resta piccolo. In questo modo il primo import acquisisce la massima
  // profondità storica esposta dal dataflow, senza codificare un anno iniziale
  // arbitrario nel software.
  return `https://esploradati.istat.it/SDMXWS/rest/data/${config.dataflow}/${config.key}`;
}

function parseHttpDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function ensureSeries(config: DemographicSeriesConfig) {
  const [existing] = await db
    .select()
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, config.seriesKey));

  const values = {
    title: config.title,
    description: config.description,
    unit: config.unit,
    geographyLevel: config.geographyLevel,
    referenceType: config.referenceType,
    source: config.source,
    sourceDataset: config.sourceDataset,
    sourceUrl: config.sourceUrl,
    externalKey: config.externalKey,
    updatedAt: new Date(),
  };

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
    .values({ seriesKey: config.seriesKey, ...values })
    .returning();
  return created;
}

async function latestRelease(seriesId: number) {
  const [release] = await db
    .select()
    .from(demographicReleasesTable)
    .where(eq(demographicReleasesTable.seriesId, seriesId))
    .orderBy(desc(demographicReleasesTable.acquiredAt), desc(demographicReleasesTable.id))
    .limit(1);
  return release;
}

async function recordFeedStatus(
  config: DemographicSeriesConfig,
  outcome:
    | { status: "ok"; total: number; inserted: number; changed: boolean }
    | { status: "error"; error: string },
): Promise<void> {
  const now = new Date();
  const url = istatUrl(config);

  if (outcome.status === "ok") {
    await db
      .insert(feedStatusTable)
      .values({
        source: config.feedSource,
        label: config.feedLabel,
        url,
        status: "ok",
        error: null,
        itemsTotal: outcome.total,
        itemsNew: outcome.inserted,
        lastCheckedAt: now,
        lastUpdatedAt: outcome.changed ? now : undefined,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: {
          label: config.feedLabel,
          url,
          status: "ok",
          error: null,
          itemsTotal: outcome.total,
          itemsNew: outcome.inserted,
          lastCheckedAt: now,
          ...(outcome.changed ? { lastUpdatedAt: now } : {}),
        },
      });
    return;
  }

  await db
    .insert(feedStatusTable)
    .values({
      source: config.feedSource,
      label: config.feedLabel,
      url,
      status: "error",
      error: outcome.error,
      lastCheckedAt: now,
    })
    .onConflictDoUpdate({
      target: feedStatusTable.source,
      set: {
        label: config.feedLabel,
        url,
        status: "error",
        error: outcome.error,
        lastCheckedAt: now,
      },
    });
}

export type CurrentDemographicPoint = {
  period: string;
  value: number;
  sourceStatus: DemographicSourceStatus;
  sourceObservationStatus: string | null;
  releaseId: number;
  acquiredAt: Date;
};

export function selectCurrentPoints(
  rows: Array<{
    period: string;
    value: number;
    sourceStatus: DemographicSourceStatus;
    sourceObservationStatus: string | null;
    releaseId: number;
    acquiredAt: Date;
  }>,
): CurrentDemographicPoint[] {
  const current = new Map<string, CurrentDemographicPoint>();
  for (const row of rows) {
    current.set(row.period, row);
  }
  return [...current.values()].sort((left, right) =>
    left.period.localeCompare(right.period),
  );
}

export async function getCurrentPopulationPoints(): Promise<
  CurrentDemographicPoint[]
> {
  const [series] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, POPULATION_SERIES_KEY));
  if (!series) return [];

  const rows = await db
    .select({
      period: demographicObservationsTable.referencePeriod,
      value: demographicObservationsTable.value,
      sourceStatus: demographicObservationsTable.sourceStatus,
      sourceObservationStatus:
        demographicObservationsTable.sourceObservationStatus,
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
        eq(demographicObservationsTable.seriesId, series.id),
        eq(demographicObservationsTable.geographyCode, LAMEZIA_ISTAT_CODE),
        eq(demographicObservationsTable.dimensionKey, "{}"),
      ),
    )
    .orderBy(
      asc(demographicReleasesTable.acquiredAt),
      asc(demographicReleasesTable.id),
      asc(demographicObservationsTable.referencePeriod),
    );

  return selectCurrentPoints(
    rows.map((row) => ({
      ...row,
      value: Number(row.value),
      sourceStatus: row.sourceStatus as DemographicSourceStatus,
    })),
  );
}

// Mantiene funzionante l'API/UX Performance esistente: la tabella legacy
// continua a contenere soltanto la vista corrente per periodo. La storia delle
// revisioni non vive più qui, ma nell'archivio demografico append-only.
export async function syncPopulationPerformanceProjection(): Promise<number> {
  const [indicator] = await db
    .select({ id: performanceIndicatorsTable.id })
    .from(performanceIndicatorsTable)
    .where(eq(performanceIndicatorsTable.externalKey, POPULATION_EXTERNAL_KEY));
  if (!indicator) return 0;

  const points = await getCurrentPopulationPoints();
  let changed = 0;
  await db.transaction(async (tx) => {
    for (const point of points) {
      const [existing] = await tx
        .select({
          id: performanceIndicatorValuesTable.id,
          manual: performanceIndicatorValuesTable.manual,
          value: performanceIndicatorValuesTable.value,
        })
        .from(performanceIndicatorValuesTable)
        .where(
          and(
            eq(performanceIndicatorValuesTable.indicatorId, indicator.id),
            eq(performanceIndicatorValuesTable.period, point.period),
          ),
        );

      if (existing?.manual) continue;
      const nextValue = String(point.value);
      const note =
        "Vista corrente dall'archivio demografico versionato; le eventuali revisioni ISTAT dello stesso periodo sono conservate separatamente.";

      if (existing) {
        if (Number(existing.value) !== point.value) changed++;
        await tx
          .update(performanceIndicatorValuesTable)
          .set({
            value: nextValue,
            source: "ISTAT",
            note,
            updatedAt: new Date(),
          })
          .where(eq(performanceIndicatorValuesTable.id, existing.id));
      } else {
        await tx.insert(performanceIndicatorValuesTable).values({
          indicatorId: indicator.id,
          period: point.period,
          value: nextValue,
          source: "ISTAT",
          note,
          manual: false,
        });
        changed++;
      }
    }
  });
  return changed;
}

export async function ingestDemographicSeries(
  config: DemographicSeriesConfig,
): Promise<{ total: number; inserted: number; changed: boolean }> {
  const series = await ensureSeries(config);
  const previous = await latestRelease(series.id);
  const url = istatUrl(config);

  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.sdmx.data+csv;version=1.0.0",
  };
  if (previous?.httpEtag) headers["If-None-Match"] = previous.httpEtag;
  if (previous?.httpLastModified) {
    headers["If-Modified-Since"] = previous.httpLastModified;
  }

  const response = await fetch(url, { headers });
  if (response.status === 304) {
    const total = previous
      ? await db
          .select({ id: demographicObservationsTable.id })
          .from(demographicObservationsTable)
          .where(eq(demographicObservationsTable.releaseId, previous.id))
          .then((rows) => rows.length)
      : 0;
    await recordFeedStatus(config, {
      status: "ok",
      total,
      inserted: 0,
      changed: false,
    });
    return { total, inserted: 0, changed: false };
  }
  if (!response.ok) {
    throw new Error(`Fetch ISTAT failed with status ${response.status}`);
  }

  const payload = await response.text();
  const hash = sourceHash(payload);
  const observations = parseSdmxCsv(payload, config.defaultStatus);
  if (observations.length === 0) {
    throw new Error("Nessuna osservazione valida nel CSV SDMX ISTAT");
  }

  const [sameRelease] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, series.id),
        eq(demographicReleasesTable.sourceHash, hash),
      ),
    );
  if (sameRelease) {
    await recordFeedStatus(config, {
      status: "ok",
      total: observations.length,
      inserted: 0,
      changed: false,
    });
    return { total: observations.length, inserted: 0, changed: false };
  }

  const etag = response.headers.get("etag");
  const lastModified = response.headers.get("last-modified");
  const now = new Date();

  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: series.id,
        sourceDataset: config.sourceDataset,
        sourceUrl: url,
        sourceHash: hash,
        sourceVersion: etag,
        releaseDate: parseHttpDate(lastModified),
        acquiredAt: now,
        httpEtag: etag,
        httpLastModified: lastModified,
        rawPayload: payload,
        metadata: {
          contentType: response.headers.get("content-type"),
          observationCount: observations.length,
        },
      })
      .returning({ id: demographicReleasesTable.id });

    await tx.insert(demographicObservationsTable).values(
      observations.map((observation) => ({
        seriesId: series.id,
        releaseId: release.id,
        geographyCode: LAMEZIA_ISTAT_CODE,
        referencePeriod: observation.period,
        referenceType: config.referenceType,
        dimensions: {},
        dimensionKey: canonicalDimensionKey({}),
        value: String(observation.value),
        unit: config.unit,
        sourceStatus: observation.sourceStatus,
        sourceObservationStatus: observation.rawStatus,
        qualityFlags: observation.qualityFlags,
      })),
    );
  });

  await recordFeedStatus(config, {
    status: "ok",
    total: observations.length,
    inserted: observations.length,
    changed: true,
  });

  return {
    total: observations.length,
    inserted: observations.length,
    changed: true,
  };
}

export async function runDemographicIngestion(): Promise<{
  total: number;
  inserted: number;
  projectionChanges: number;
}> {
  try {
    const result = await ingestDemographicSeries(POPULATION_SERIES);
    const projectionChanges = await syncPopulationPerformanceProjection();
    logger.info(
      {
        source: POPULATION_SERIES.feedSource,
        total: result.total,
        inserted: result.inserted,
        projectionChanges,
      },
      "Demographic ingestion complete",
    );
    return { ...result, projectionChanges };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    logger.error({ err }, "Demographic ingestion failed");
    await recordFeedStatus(POPULATION_SERIES, {
      status: "error",
      error: message,
    });
    throw err;
  }
}
