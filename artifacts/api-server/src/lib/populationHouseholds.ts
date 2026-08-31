import { createHash } from "node:crypto";
import {
  db,
  demographicObservationsTable,
  demographicReleasesTable,
  demographicSeriesTable,
  type DemographicSourceStatus,
} from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import {
  balanceSeriesKey,
} from "./demographicBalance";
import {
  canonicalDimensionKey,
  LAMEZIA_ISTAT_CODE,
} from "./demographics";
import { logger } from "./logger";
import {
  parseP02HouseholdPayload,
  summarizeHouseholdHistory,
  type HouseholdSourceStatus,
  type ParsedHouseholdPoint,
} from "./populationHouseholdsCore";

export const HOUSEHOLDS_COUNT_SERIES_KEY = "households-count-year-end";
export const HOUSEHOLD_POPULATION_SERIES_KEY =
  "population-in-households-year-end";

const SOURCE_URL = "https://demo.istat.it/app/?i=P02&l=it";
const PROJECTION_VERSION = 1;

type AnchorRelease = {
  releaseId: number;
  period: string;
  sourceStatus: HouseholdSourceStatus;
  qualityFlags: string[];
  sourceDataset: string;
  sourceHash: string;
  sourceVersion: string | null;
  releaseDate: Date | null;
  acquiredAt: Date;
  httpEtag: string | null;
  httpLastModified: string | null;
  rawPayload: string;
};

type CurrentPoint = {
  period: string;
  value: number;
  sourceStatus: HouseholdSourceStatus;
  qualityFlags: string[];
  acquiredAt: Date;
  releaseId: number;
  metadata: Record<string, string | number | boolean | null>;
};

function normalizeStatus(value: string): HouseholdSourceStatus {
  switch (value) {
    case "final":
    case "provisional":
    case "estimated":
    case "reconstructed":
    case "forecast":
    case "unknown":
      return value;
    default:
      return "unknown";
  }
}

function combinedStatus(values: HouseholdSourceStatus[]): HouseholdSourceStatus {
  const statuses = new Set(values);
  for (const status of [
    "provisional",
    "estimated",
    "reconstructed",
    "forecast",
    "unknown",
  ] as const) {
    if (statuses.has(status)) return status;
  }
  return statuses.size === 1 && statuses.has("final") ? "final" : "unknown";
}

function projectionHash(sourceHash: string, seriesKey: string) {
  return createHash("sha256")
    .update(`household-projection:v${PROJECTION_VERSION}:${seriesKey}:${sourceHash}`)
    .digest("hex");
}

async function ensureSeries(options: {
  seriesKey: string;
  title: string;
  description: string;
  unit: string;
  externalKey: string;
}) {
  const values = {
    title: options.title,
    description: options.description,
    unit: options.unit,
    geographyLevel: "municipality",
    referenceType: "stock",
    source: "ISTAT",
    sourceDataset: "P02",
    sourceUrl: SOURCE_URL,
    externalKey: options.externalKey,
    updatedAt: new Date(),
  } as const;
  const [existing] = await db
    .select({ id: demographicSeriesTable.id })
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

async function loadP02Anchors(): Promise<AnchorRelease[]> {
  const [birthSeries] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(
      eq(
        demographicSeriesTable.seriesKey,
        balanceSeriesKey("births", "annual"),
      ),
    );
  if (!birthSeries) return [];

  const rows = await db
    .select({
      releaseId: demographicReleasesTable.id,
      period: demographicObservationsTable.referencePeriod,
      sourceStatus: demographicObservationsTable.sourceStatus,
      qualityFlags: demographicObservationsTable.qualityFlags,
      sourceDataset: demographicReleasesTable.sourceDataset,
      sourceHash: demographicReleasesTable.sourceHash,
      sourceVersion: demographicReleasesTable.sourceVersion,
      releaseDate: demographicReleasesTable.releaseDate,
      acquiredAt: demographicReleasesTable.acquiredAt,
      httpEtag: demographicReleasesTable.httpEtag,
      httpLastModified: demographicReleasesTable.httpLastModified,
      rawPayload: demographicReleasesTable.rawPayload,
    })
    .from(demographicObservationsTable)
    .innerJoin(
      demographicReleasesTable,
      eq(demographicObservationsTable.releaseId, demographicReleasesTable.id),
    )
    .where(
      and(
        eq(demographicObservationsTable.seriesId, birthSeries.id),
        eq(demographicObservationsTable.geographyCode, LAMEZIA_ISTAT_CODE),
      ),
    )
    .orderBy(
      asc(demographicReleasesTable.acquiredAt),
      asc(demographicReleasesTable.id),
    );

  return rows
    .filter(
      (row) =>
        row.sourceDataset.startsWith("P02:") &&
        typeof row.rawPayload === "string" &&
        row.rawPayload.length > 0,
    )
    .map((row) => ({
      releaseId: row.releaseId,
      period: row.period,
      sourceStatus: normalizeStatus(row.sourceStatus),
      qualityFlags: row.qualityFlags as string[],
      sourceDataset: row.sourceDataset,
      sourceHash: row.sourceHash,
      sourceVersion: row.sourceVersion,
      releaseDate: row.releaseDate,
      acquiredAt: row.acquiredAt,
      httpEtag: row.httpEtag,
      httpLastModified: row.httpLastModified,
      rawPayload: row.rawPayload!,
    }));
}

async function persistProjection(options: {
  seriesId: number;
  seriesKey: string;
  unit: string;
  measure: string;
  value: number;
  anchor: AnchorRelease;
  parsed: ParsedHouseholdPoint;
}) {
  const sourceHash = projectionHash(options.anchor.sourceHash, options.seriesKey);
  const [existing] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, options.seriesId),
        eq(demographicReleasesTable.sourceHash, sourceHash),
      ),
    )
    .limit(1);
  if (existing) return false;

  const qualityFlags = [
    ...new Set([
      ...options.anchor.qualityFlags,
      ...options.parsed.qualityFlags,
      "projection_from_archived_source_release",
    ]),
  ];

  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: options.seriesId,
        sourceDataset: options.anchor.sourceDataset,
        sourceUrl: SOURCE_URL,
        sourceHash,
        sourceVersion: options.anchor.sourceVersion,
        releaseDate: options.anchor.releaseDate,
        acquiredAt: options.anchor.acquiredAt,
        httpEtag: options.anchor.httpEtag,
        httpLastModified: options.anchor.httpLastModified,
        rawPayload: null,
        metadata: {
          derivedFromReleaseId: options.anchor.releaseId,
          projectionVersion: PROJECTION_VERSION,
          sourceTable: "P02",
          sourcePeriod: options.anchor.period,
          sourcePublishedAverage:
            options.parsed.publishedAverageHouseholdSize,
          derivation:
            "household variables extracted from the immutable P02 raw payload already archived by the annual balance pipeline",
        },
      })
      .returning({ id: demographicReleasesTable.id });

    await tx.insert(demographicObservationsTable).values({
      seriesId: options.seriesId,
      releaseId: release.id,
      geographyCode: LAMEZIA_ISTAT_CODE,
      referencePeriod: options.anchor.period,
      referenceType: "stock",
      dimensions: { frequency: "annual", measure: options.measure },
      dimensionKey: canonicalDimensionKey({
        frequency: "annual",
        measure: options.measure,
      }),
      value: String(options.value),
      unit: options.unit,
      sourceStatus: options.parsed.sourceStatus,
      sourceObservationStatus: null,
      qualityFlags,
    });
  });
  return true;
}

export async function runPopulationHouseholdProjection() {
  const anchors = await loadP02Anchors();
  if (!anchors.length) {
    return { anchors: 0, releases: 0, observations: 0, errors: [] as string[] };
  }

  const householdSeries = await ensureSeries({
    seriesKey: HOUSEHOLDS_COUNT_SERIES_KEY,
    title: "Famiglie al 31 dicembre",
    description:
      "Numero di famiglie residenti a Lamezia Terme al 31 dicembre, estratto dalle release P02 già archiviate. Le revisioni della release sorgente restano distinguibili e non sovrascrivono lo storico.",
    unit: "famiglie",
    externalKey: `demo:P02:households:${LAMEZIA_ISTAT_CODE}`,
  });
  const populationSeries = await ensureSeries({
    seriesKey: HOUSEHOLD_POPULATION_SERIES_KEY,
    title: "Popolazione residente in famiglia al 31 dicembre",
    description:
      "Residenti di Lamezia Terme che vivono in famiglia al 31 dicembre, estratti dalle release P02 già archiviate. La popolazione in convivenza non viene inclusa in questa misura.",
    unit: "persone",
    externalKey: `demo:P02:household-population:${LAMEZIA_ISTAT_CODE}`,
  });

  let releases = 0;
  let observations = 0;
  const errors: string[] = [];
  for (const anchor of anchors) {
    try {
      const parsed = parseP02HouseholdPayload(
        anchor.rawPayload,
        anchor.period,
        anchor.sourceStatus,
      );
      const countInserted = await persistProjection({
        seriesId: householdSeries.id,
        seriesKey: HOUSEHOLDS_COUNT_SERIES_KEY,
        unit: "famiglie",
        measure: "households",
        value: parsed.households,
        anchor,
        parsed,
      });
      if (countInserted) {
        releases++;
        observations++;
      }
      const populationInserted = await persistProjection({
        seriesId: populationSeries.id,
        seriesKey: HOUSEHOLD_POPULATION_SERIES_KEY,
        unit: "persone",
        measure: "household_population",
        value: parsed.householdPopulation,
        anchor,
        parsed,
      });
      if (populationInserted) {
        releases++;
        observations++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${anchor.sourceDataset}: ${message}`);
      logger.error(
        { err, sourceDataset: anchor.sourceDataset, releaseId: anchor.releaseId },
        "Household projection from P02 failed",
      );
    }
  }

  logger.info(
    { anchors: anchors.length, releases, observations, errors: errors.length },
    "Household projection from archived P02 releases complete",
  );
  return { anchors: anchors.length, releases, observations, errors };
}

async function currentSeriesPoints(seriesKey: string): Promise<CurrentPoint[]> {
  const [series] = await db
    .select({ id: demographicSeriesTable.id })
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, seriesKey));
  if (!series) return [];

  const rows = await db
    .select({
      period: demographicObservationsTable.referencePeriod,
      value: demographicObservationsTable.value,
      sourceStatus: demographicObservationsTable.sourceStatus,
      qualityFlags: demographicObservationsTable.qualityFlags,
      acquiredAt: demographicReleasesTable.acquiredAt,
      releaseId: demographicReleasesTable.id,
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
    );

  const current = new Map<string, CurrentPoint>();
  for (const row of rows) {
    current.set(row.period, {
      period: row.period,
      value: Number(row.value),
      sourceStatus: normalizeStatus(row.sourceStatus),
      qualityFlags: row.qualityFlags as string[],
      acquiredAt: row.acquiredAt,
      releaseId: row.releaseId,
      metadata: row.metadata as Record<string, string | number | boolean | null>,
    });
  }
  return [...current.values()].sort((left, right) =>
    left.period.localeCompare(right.period),
  );
}

async function populationEndByPeriod() {
  const rows = await currentSeriesPoints(
    balanceSeriesKey("populationEnd", "annual"),
  );
  return new Map(rows.map((row) => [row.period, row.value]));
}

export async function getPopulationHouseholdSnapshot(period: string | null = null) {
  const householdPoints = await currentSeriesPoints(HOUSEHOLDS_COUNT_SERIES_KEY);
  const populationPoints = await currentSeriesPoints(
    HOUSEHOLD_POPULATION_SERIES_KEY,
  );
  const householdByPeriod = new Map(
    householdPoints.map((point) => [point.period, point]),
  );
  const populationByPeriod = new Map(
    populationPoints.map((point) => [point.period, point]),
  );
  const periods = [...householdByPeriod.keys()]
    .filter((item) => populationByPeriod.has(item))
    .sort();
  if (!periods.length) return null;
  const selectedPeriod =
    period && period !== "latest" ? period : periods[periods.length - 1];
  if (!periods.includes(selectedPeriod)) return null;

  const totalPopulation = await populationEndByPeriod();
  const combined: ParsedHouseholdPoint[] = periods.map((item) => {
    const households = householdByPeriod.get(item)!;
    const householdPopulation = populationByPeriod.get(item)!;
    const sourcePublishedAverage = households.metadata.sourcePublishedAverage;
    return {
      period: item,
      households: households.value,
      householdPopulation: householdPopulation.value,
      averageHouseholdSize:
        householdPopulation.value / Math.max(1, households.value),
      publishedAverageHouseholdSize:
        typeof sourcePublishedAverage === "number"
          ? sourcePublishedAverage
          : null,
      sourceStatus: combinedStatus([
        households.sourceStatus,
        householdPopulation.sourceStatus,
      ]),
      qualityFlags: [
        ...new Set([
          ...households.qualityFlags,
          ...householdPopulation.qualityFlags,
        ]),
      ],
    };
  });

  const summary = summarizeHouseholdHistory(
    combined,
    selectedPeriod,
    totalPopulation,
  );
  if (!summary) return null;
  return {
    ...summary,
    availablePeriods: periods,
    source: {
      name: "ISTAT",
      dataset: "P02",
      url: SOURCE_URL,
      projection:
        "Variabili estratte dalle stesse release P02 immutabili già archiviate per il bilancio demografico annuale.",
    },
  };
}
