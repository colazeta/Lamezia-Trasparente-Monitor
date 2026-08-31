import { createHash } from "node:crypto";
import {
  db,
  demographicObservationsTable,
  demographicReleasesTable,
  demographicSeriesTable,
  feedStatusTable,
} from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import {
  canonicalDimensionKey,
  LAMEZIA_ISTAT_CODE,
  POPULATION_SERIES_KEY,
} from "./demographics";
import { logger } from "./logger";
import {
  buildRcsBirthPayload,
  datasetForBirthCountryYear,
  parseRcsBirthFormContract,
  parseRcsBirthResponse,
  summarizeBirthCountry,
  type BirthCountrySex,
  type ParsedBirthCountryObservation,
  type PopulationBirthCountrySummary,
  type RcsBirthFormContract,
} from "./populationBirthCountryCore";

export {
  buildRcsBirthPayload,
  parseRcsBirthFormContract,
  parseRcsBirthResponse,
  summarizeBirthCountry,
  validateBirthCountryObservations,
} from "./populationBirthCountryCore";
export type {
  BirthCountrySex,
  ParsedBirthCountryObservation,
  PopulationBirthCountrySummary,
  RcsBirthFormContract,
} from "./populationBirthCountryCore";

export const BIRTH_COUNTRY_SERIES_KEY = "population-birth-country-jan1";

const RCS_PAGE_URL = "https://demo.istat.it/app/?i=RCS&l=it";
const RCS_SEARCH_URL = "https://demo.istat.it/app/RPCCerca.php";
const RCS_BULK_URL = "https://demo.istat.it/data/rcs/Dati_RCS.zip";
const FEED_SOURCE = "demographics:istat-birth-country";
const FEED_LABEL = "ISTAT – Popolazione per paese di nascita (Lamezia Terme)";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";
const BACKFILL_YEARS_PER_RUN = 3;

type CurrentBirthCountryPoint = ParsedBirthCountryObservation & {
  releaseId: number;
  acquiredAt: Date;
  sourceDataset: string;
};

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function parseHttpDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeBirthCountrySourceStatus(
  value: string,
): ParsedBirthCountryObservation["sourceStatus"] {
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

  const sourceDataset = datasetForBirthCountryYear(options.year);
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
          methodologyBreakAt: 2019,
          sourceStatus: options.year <= 2018 ? "reconstructed" : "final",
          bulkSource: RCS_BULK_URL,
          observationCount: options.observations.length,
          countryDomainSize: new Set(
            options.observations.map((row) => row.birthCountry),
          ).size,
          parserVersion: 3,
        },
      })
      .returning({ id: demographicReleasesTable.id });

    await tx.insert(demographicObservationsTable).values(
      options.observations.map((row) => {
        const identityDimensions = {
          birthCountry: row.birthCountry,
          sex: row.sex,
        };
        const dimensions = {
          ...identityDimensions,
          birthCountryLabel: row.birthCountryLabel,
        };
        return {
          seriesId: options.seriesId,
          releaseId: release.id,
          geographyCode: LAMEZIA_ISTAT_CODE,
          referencePeriod: row.period,
          referenceType: "stock" as const,
          dimensions,
          dimensionKey: canonicalDimensionKey(identityDimensions),
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
  const body = new URLSearchParams(
    buildRcsBirthPayload(contract, year, LAMEZIA_ISTAT_CODE),
  );
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
    const birthCountryLabel = dimensions.birthCountryLabel;
    const sex = dimensions.sex as BirthCountrySex | undefined;
    if (!birthCountry || !birthCountryLabel || !sex) continue;

    current.set(`${row.period}|${row.dimensionKey}`, {
      period: row.period,
      birthCountry,
      birthCountryLabel,
      sex,
      value: Number(row.value),
      sourceStatus: normalizeBirthCountrySourceStatus(row.sourceStatus),
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

export type PopulationBirthCountrySnapshot = PopulationBirthCountrySummary & {
  availablePeriods: string[];
  history: Array<{
    period: string;
    population: number;
    bornInItaly: number;
    bornAbroad: number;
    bornAbroadShare: number | null;
    sourceStatus: ParsedBirthCountryObservation["sourceStatus"];
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