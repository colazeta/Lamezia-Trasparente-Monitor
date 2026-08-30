import {
  db,
  demographicObservationsTable,
  demographicReleasesTable,
  demographicSeriesTable,
  type DemographicSourceStatus,
} from "@workspace/db";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  type BalanceField,
  type BalanceGranularity,
  balanceSeriesKey,
} from "./demographicBalance";
import {
  getCurrentPopulationPoints,
  LAMEZIA_ISTAT_CODE,
} from "./demographics";

type CurrentSeriesPoint = {
  period: string;
  value: number;
  sourceStatus: DemographicSourceStatus;
  releaseId: number;
  acquiredAt: Date;
};

const FIELDS: BalanceField[] = [
  "births",
  "deaths",
  "internalIn",
  "internalOut",
  "foreignIn",
  "foreignOut",
  "otherIn",
  "otherOut",
  "statisticalAdjustment",
  "coverageAdjustment",
  "populationStart",
  "populationEnd",
];

async function currentPointsForKeys(
  keys: string[],
): Promise<Map<string, CurrentSeriesPoint[]>> {
  const series = await db
    .select({
      id: demographicSeriesTable.id,
      seriesKey: demographicSeriesTable.seriesKey,
    })
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
        inArray(
          demographicObservationsTable.seriesId,
          series.map((item) => item.id),
        ),
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
      [...byPeriod.values()].sort((left, right) =>
        left.period.localeCompare(right.period),
      ),
    ]),
  );
}

function valueAt(
  series: Map<string, CurrentSeriesPoint[]>,
  field: BalanceField,
  granularity: BalanceGranularity,
  period: string,
): CurrentSeriesPoint | null {
  return (
    series
      .get(balanceSeriesKey(field, granularity))
      ?.find((point) => point.period === period) ?? null
  );
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

function sumRequired(values: Array<number | null>): number | null {
  if (values.some((value) => value === null)) return null;
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function conservativeStatus(
  statuses: DemographicSourceStatus[],
): DemographicSourceStatus {
  if (statuses.includes("provisional")) return "provisional";
  if (statuses.includes("estimated")) return "estimated";
  if (statuses.includes("reconstructed")) return "reconstructed";
  if (statuses.includes("unknown")) return "unknown";
  if (statuses.includes("forecast")) return "forecast";
  return statuses[0] ?? "unknown";
}

/**
 * Riconcilia una release secondo il suo status, non soltanto secondo la
 * frequenza. Per i dati provvisori ISTAT le poste "altri motivi" sono diffuse
 * ma non partecipano al calcolo della popolazione di fine periodo; nel bilancio
 * definitivo l'aggiustamento statistico le incorpora insieme alla copertura
 * censuaria.
 */
export function reconcileChangeDriverPoint(input: {
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
}): ChangeDriverPoint {
  const naturalBalance = subtract(input.births, input.deaths);
  const internalBalance = subtract(input.internalIn, input.internalOut);
  const foreignBalance = subtract(input.foreignIn, input.foreignOut);
  const otherBalance = subtract(input.otherIn, input.otherOut);
  const observedChange = subtract(input.populationEnd, input.populationStart);

  const coreChange = sumRequired([
    naturalBalance,
    internalBalance,
    foreignBalance,
  ]);
  let accountedChange = coreChange;
  if (input.sourceStatus === "final" && coreChange !== null) {
    const closingAdjustment = input.statisticalAdjustment ?? otherBalance;
    accountedChange =
      closingAdjustment === null ? null : coreChange + closingAdjustment;
  }

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

export async function getReconciledChangeDrivers(
  granularity: BalanceGranularity,
): Promise<ChangeDriverPoint[]> {
  const keys = FIELDS.map((field) => balanceSeriesKey(field, granularity));
  const series = await currentPointsForKeys(keys);
  const periods = new Set<string>();
  for (const points of series.values()) {
    for (const point of points) periods.add(point.period);
  }

  const population =
    granularity === "annual" ? await getCurrentPopulationPoints() : [];
  const populationByYear = new Map(
    population.map((point) => [point.period, point.value]),
  );

  return [...periods]
    .sort()
    .map((period) => {
      const get = (field: BalanceField) =>
        valueAt(series, field, granularity, period);
      const available = FIELDS.map(get).filter(
        (point): point is CurrentSeriesPoint => Boolean(point),
      );
      const year = period.slice(0, 4);
      let populationStart = get("populationStart")?.value ?? null;
      let populationEnd = get("populationEnd")?.value ?? null;
      if (granularity === "annual") {
        populationStart ??= populationByYear.get(year) ?? null;
        populationEnd ??= populationByYear.get(String(Number(year) + 1)) ?? null;
      }

      return reconcileChangeDriverPoint({
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
        sourceStatus: conservativeStatus(
          available.map((point) => point.sourceStatus),
        ),
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

export function summarizeReconciledChangeDrivers(
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
    point.sourceStatus === "final"
      ? point.statisticalAdjustment ?? point.otherBalance
      : 0,
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
    (item): item is readonly [typeof item[0], number] =>
      typeof item[1] === "number",
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
    exactPeriods: selected.filter((point) => point.reconciliation === "exact")
      .length,
    narrative: dominant
      ? `Nel periodo selezionato la componente cumulata di maggiore ampiezza è il ${labels[dominant[0]]} (${dominant[1] >= 0 ? "+" : ""}${Math.round(dominant[1]).toLocaleString("it-IT")} persone). La frase è descrittiva e deriva esclusivamente dalla scomposizione contabile dei dati ISTAT.`
      : null,
  };
}
