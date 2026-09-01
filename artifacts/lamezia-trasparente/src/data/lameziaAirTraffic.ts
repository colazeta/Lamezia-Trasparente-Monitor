import airTrafficData from "./generated/lameziaAirTrafficMonthly.json";
import airTrafficDataUrl from "./generated/lameziaAirTrafficMonthly.json?url";
import airTrafficDelta from "./generated/lameziaAirTrafficMonthly.delta.json";

type LameziaAirTrafficMonthlyRow = [
  month: string,
  year: number,
  monthNumber: number,
  rank: number | null,
  movementsTotal: number | null,
  movementsTotalYoyPct: number | null,
  passengersNational: number | null,
  passengersInternational: number | null,
  passengersDirectTransits: number | null,
  passengersTotal: number | null,
  passengersTotalYoyPct: number | null,
  cargoTonsTotal: number | null,
  cargoTonsTotalYoyPct: number | null,
];

export interface LameziaAirTrafficMonthlyRecord {
  month: string;
  year: number;
  month_number: number;
  rank: number | null;
  movements: {
    total: number | null;
    total_yoy_pct: number | null;
  };
  passengers: {
    national: number | null;
    international: number | null;
    direct_transits: number | null;
    total: number | null;
    total_yoy_pct: number | null;
  };
  cargo_tons: {
    total: number | null;
    total_yoy_pct: number | null;
  };
}

export interface LameziaAirTrafficAnnualMetrics {
  year: number;
  months: number;
  passengers_total: number;
  movements_total: number;
  cargo_tons_total: number;
  international_passengers_total: number;
  international_passenger_share: number | null;
  busiest_month: string;
  busiest_month_passengers: number | null;
  latest_month: string;
}

export interface LameziaAirTrafficYearComparison {
  year: number;
  previous_year: number;
  months: number;
  latest_month: string;
  passengers_total: number;
  previous_passengers_total: number;
  passengers_yoy_pct: number | null;
  movements_total: number;
  previous_movements_total: number;
  movements_yoy_pct: number | null;
  cargo_tons_total: number;
  previous_cargo_tons_total: number;
  cargo_tons_yoy_pct: number | null;
}

export interface LameziaAirTrafficDataset {
  schema_version: number;
  metadata: {
    source: string;
    source_url: string;
    source_download_base_url: string;
    airport_name: string;
    airport_iata: string;
    airport_city: string;
    generated_at: string;
    first_month: string;
    latest_complete_month: string;
    months: number;
    update_policy: string;
    licence_or_terms_note: string;
    caveat: string;
    source_file_url_template: string;
    source_periods: string[];
    source_period_start?: string;
    source_period_end?: string;
  };
  monthly_columns: string[];
  monthly: LameziaAirTrafficMonthlyRecord[];
  annual: LameziaAirTrafficAnnualMetrics[];
}

interface RawLameziaAirTrafficDataset
  extends Omit<LameziaAirTrafficDataset, "annual" | "metadata" | "monthly"> {
  metadata: Omit<LameziaAirTrafficDataset["metadata"], "source_periods"> & {
    source_period_start: string;
    source_period_end: string;
  };
  monthly_rows: string;
}

interface RawLameziaAirTrafficDelta {
  schema_version: number;
  base_latest_month: string;
  latest_complete_month: string;
  generated_at: string;
  monthly_rows: string;
}

const rawAirTrafficData = airTrafficData as RawLameziaAirTrafficDataset;
const rawAirTrafficDelta = airTrafficDelta as RawLameziaAirTrafficDelta;
const mergedMonthlyRows = [
  rawAirTrafficData.monthly_rows,
  rawAirTrafficDelta.monthly_rows,
]
  .filter(Boolean)
  .join("\n");
const monthlyRecords = parseMonthlyRows(mergedMonthlyRows);

export const LAMEZIA_AIR_TRAFFIC_DATA: LameziaAirTrafficDataset = {
  ...rawAirTrafficData,
  metadata: {
    ...rawAirTrafficData.metadata,
    generated_at:
      rawAirTrafficDelta.generated_at || rawAirTrafficData.metadata.generated_at,
    latest_complete_month:
      rawAirTrafficDelta.latest_complete_month ||
      rawAirTrafficData.metadata.latest_complete_month,
    months: monthlyRecords.length,
    source_period_end:
      rawAirTrafficDelta.latest_complete_month ||
      rawAirTrafficData.metadata.source_period_end,
    source_periods: monthlyRecords.map((record) => record.month),
  },
  monthly: monthlyRecords,
  annual: buildAnnualMetrics(monthlyRecords),
};

const downloadableAirTrafficData = {
  ...rawAirTrafficData,
  metadata: {
    ...rawAirTrafficData.metadata,
    generated_at: LAMEZIA_AIR_TRAFFIC_DATA.metadata.generated_at,
    latest_complete_month:
      LAMEZIA_AIR_TRAFFIC_DATA.metadata.latest_complete_month,
    months: LAMEZIA_AIR_TRAFFIC_DATA.metadata.months,
    source_period_end: LAMEZIA_AIR_TRAFFIC_DATA.metadata.source_period_end,
  },
  monthly_rows: mergedMonthlyRows,
};

export const LAMEZIA_AIR_TRAFFIC_DATA_URL =
  typeof window === "undefined"
    ? airTrafficDataUrl
    : `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(downloadableAirTrafficData),
      )}`;

export const LAMEZIA_AIR_TRAFFIC_YEARS = Array.from(
  new Set(LAMEZIA_AIR_TRAFFIC_DATA.monthly.map((record) => record.year)),
).sort((a, b) => a - b);

export const LAMEZIA_AIR_TRAFFIC_LATEST_YEAR =
  LAMEZIA_AIR_TRAFFIC_YEARS[LAMEZIA_AIR_TRAFFIC_YEARS.length - 1] ?? 0;

export function getLameziaAirTrafficRecordsForYear(year: number) {
  return LAMEZIA_AIR_TRAFFIC_DATA.monthly.filter(
    (record) => record.year === year,
  );
}

export function getLameziaAirTrafficAnnualMetrics(year: number) {
  return (
    LAMEZIA_AIR_TRAFFIC_DATA.annual.find((metric) => metric.year === year) ??
    null
  );
}

export function getLameziaAirTrafficYearComparison(
  year: number,
): LameziaAirTrafficYearComparison | null {
  const currentRecords = getLameziaAirTrafficRecordsForYear(year);
  const previousRecordsByMonth = new Map(
    getLameziaAirTrafficRecordsForYear(year - 1).map((record) => [
      record.month_number,
      record,
    ]),
  );
  const comparablePairs = currentRecords.flatMap((current) => {
    const previous = previousRecordsByMonth.get(current.month_number);
    return previous ? [{ current, previous }] : [];
  });

  if (comparablePairs.length === 0) {
    return null;
  }

  const passengersTotal = sumComparisonPairs(
    comparablePairs,
    ({ current }) => current.passengers.total,
  );
  const previousPassengersTotal = sumComparisonPairs(
    comparablePairs,
    ({ previous }) => previous.passengers.total,
  );
  const movementsTotal = sumComparisonPairs(
    comparablePairs,
    ({ current }) => current.movements.total,
  );
  const previousMovementsTotal = sumComparisonPairs(
    comparablePairs,
    ({ previous }) => previous.movements.total,
  );
  const cargoTonsTotal = sumComparisonPairs(
    comparablePairs,
    ({ current }) => current.cargo_tons.total,
  );
  const previousCargoTonsTotal = sumComparisonPairs(
    comparablePairs,
    ({ previous }) => previous.cargo_tons.total,
  );

  return {
    year,
    previous_year: year - 1,
    months: comparablePairs.length,
    latest_month: comparablePairs[comparablePairs.length - 1].current.month,
    passengers_total: passengersTotal,
    previous_passengers_total: previousPassengersTotal,
    passengers_yoy_pct: calculateYearOverYearChange(
      passengersTotal,
      previousPassengersTotal,
    ),
    movements_total: movementsTotal,
    previous_movements_total: previousMovementsTotal,
    movements_yoy_pct: calculateYearOverYearChange(
      movementsTotal,
      previousMovementsTotal,
    ),
    cargo_tons_total: Number(cargoTonsTotal.toFixed(1)),
    previous_cargo_tons_total: Number(previousCargoTonsTotal.toFixed(1)),
    cargo_tons_yoy_pct: calculateYearOverYearChange(
      cargoTonsTotal,
      previousCargoTonsTotal,
    ),
  };
}

export function getLatestLameziaAirTrafficRecord() {
  return (
    LAMEZIA_AIR_TRAFFIC_DATA.monthly.find(
      (record) =>
        record.month === LAMEZIA_AIR_TRAFFIC_DATA.metadata.latest_complete_month,
    ) ??
    LAMEZIA_AIR_TRAFFIC_DATA.monthly[
      LAMEZIA_AIR_TRAFFIC_DATA.monthly.length - 1
    ]
  );
}

function expandLameziaAirTrafficMonthlyRow([
  month,
  year,
  monthNumber,
  rank,
  movementsTotal,
  movementsTotalYoyPct,
  passengersNational,
  passengersInternational,
  passengersDirectTransits,
  passengersTotal,
  passengersTotalYoyPct,
  cargoTonsTotal,
  cargoTonsTotalYoyPct,
]: LameziaAirTrafficMonthlyRow): LameziaAirTrafficMonthlyRecord {
  return {
    month,
    year,
    month_number: monthNumber,
    rank,
    movements: {
      total: movementsTotal,
      total_yoy_pct: movementsTotalYoyPct,
    },
    passengers: {
      national: passengersNational,
      international: passengersInternational,
      direct_transits: passengersDirectTransits,
      total: passengersTotal,
      total_yoy_pct: passengersTotalYoyPct,
    },
    cargo_tons: {
      total: cargoTonsTotal,
      total_yoy_pct: cargoTonsTotalYoyPct,
    },
  };
}

function parseMonthlyRows(rows: string) {
  return rows
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("|"))
    .map((row) =>
      expandLameziaAirTrafficMonthlyRow([
        row[0],
        toNullableNumber(row[1]) ?? 0,
        toNullableNumber(row[2]) ?? 0,
        toNullableNumber(row[3]),
        toNullableNumber(row[4]),
        toNullableNumber(row[5]),
        toNullableNumber(row[6]),
        toNullableNumber(row[7]),
        toNullableNumber(row[8]),
        toNullableNumber(row[9]),
        toNullableNumber(row[10]),
        toNullableNumber(row[11]),
        toNullableNumber(row[12]),
      ]),
    );
}

function toNullableNumber(value: string | undefined) {
  if (!value) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildAnnualMetrics(records: LameziaAirTrafficMonthlyRecord[]) {
  const recordsByYear = new Map<number, LameziaAirTrafficMonthlyRecord[]>();
  for (const record of records) {
    const yearRecords = recordsByYear.get(record.year) ?? [];
    yearRecords.push(record);
    recordsByYear.set(record.year, yearRecords);
  }

  return Array.from(recordsByYear.entries()).map(([year, recordsForYear]) => {
    const busiestMonth = recordsForYear.reduce((best, record) =>
      (record.passengers.total ?? 0) > (best.passengers.total ?? 0)
        ? record
        : best,
    );
    const passengersTotal = sumBy(
      recordsForYear,
      (record) => record.passengers.total,
    );
    const movementsTotal = sumBy(
      recordsForYear,
      (record) => record.movements.total,
    );
    const cargoTonsTotal = sumBy(
      recordsForYear,
      (record) => record.cargo_tons.total,
    );
    const internationalPassengers = sumBy(
      recordsForYear,
      (record) => record.passengers.international,
    );

    return {
      year,
      months: recordsForYear.length,
      passengers_total: passengersTotal,
      movements_total: movementsTotal,
      cargo_tons_total: Number(cargoTonsTotal.toFixed(1)),
      international_passengers_total: internationalPassengers,
      international_passenger_share:
        passengersTotal > 0
          ? Number((internationalPassengers / passengersTotal).toFixed(4))
          : null,
      busiest_month: busiestMonth.month,
      busiest_month_passengers: busiestMonth.passengers.total,
      latest_month: recordsForYear[recordsForYear.length - 1].month,
    };
  });
}

function sumBy(
  records: LameziaAirTrafficMonthlyRecord[],
  selector: (record: LameziaAirTrafficMonthlyRecord) => number | null,
) {
  return records.reduce((total, record) => total + (selector(record) ?? 0), 0);
}

function sumComparisonPairs(
  pairs: Array<{
    current: LameziaAirTrafficMonthlyRecord;
    previous: LameziaAirTrafficMonthlyRecord;
  }>,
  selector: (pair: {
    current: LameziaAirTrafficMonthlyRecord;
    previous: LameziaAirTrafficMonthlyRecord;
  }) => number | null,
) {
  return pairs.reduce((total, pair) => total + (selector(pair) ?? 0), 0);
}

function calculateYearOverYearChange(current: number, previous: number) {
  return previous === 0
    ? null
    : Number(((current - previous) / previous).toFixed(4));
}
