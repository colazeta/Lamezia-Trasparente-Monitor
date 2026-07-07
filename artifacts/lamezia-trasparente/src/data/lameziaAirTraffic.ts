import airTrafficData from "./generated/lameziaAirTrafficMonthly.json";
import airTrafficDataUrl from "./generated/lameziaAirTrafficMonthly.json?url";

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

const rawAirTrafficData = airTrafficData as RawLameziaAirTrafficDataset;
const monthlyRecords = parseMonthlyRows(rawAirTrafficData.monthly_rows);

export const LAMEZIA_AIR_TRAFFIC_DATA: LameziaAirTrafficDataset = {
  ...rawAirTrafficData,
  metadata: {
    ...rawAirTrafficData.metadata,
    source_periods: monthlyRecords.map((record) => record.month),
  },
  monthly: monthlyRecords,
  annual: buildAnnualMetrics(monthlyRecords),
};

export const LAMEZIA_AIR_TRAFFIC_DATA_URL = airTrafficDataUrl;

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
