import climateData from "./generated/lameziaClimateDaily.json";
import climateDataUrl from "./generated/lameziaClimateDaily.json?url";

export interface LameziaClimateNormalRange {
  p10: number | null;
  p90: number | null;
}

export interface LameziaClimateDailyRecord {
  date: string;
  year: number;
  month: number;
  dayOfYear: number;
  tMean: number | null;
  tMin: number | null;
  tMax: number | null;
  precipitation: number | null;
  normalTMean: number | null;
  anomalyTMean: number | null;
  normalRange: LameziaClimateNormalRange;
}

export interface LameziaClimateAnnualMetrics {
  year: number;
  days: number;
  averageTMean: number | null;
  meanAnomalyTMean: number | null;
  warmDaysOver30C: number;
  tropicalNights: number;
  precipitationTotal: number | null;
  latestDate: string | null;
}

export interface LameziaClimateDataset {
  schema_version: number;
  metadata: {
    source: string;
    source_url: string;
    source_documentation_url?: string;
    source_request_count?: number;
    source_query_strategy?: string;
    coordinates: {
      name: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };
    baseline_period: string;
    generated_at: string;
    latest_complete_date: string;
    licence_or_terms_note: string;
    caveat: string;
    leap_day_policy?: string;
  };
  daily: LameziaClimateDailyRecord[];
  annual: LameziaClimateAnnualMetrics[];
}

export const LAMEZIA_CLIMATE_DATA =
  climateData as LameziaClimateDataset;

export const LAMEZIA_CLIMATE_DATA_URL = climateDataUrl;

export const LAMEZIA_CLIMATE_YEARS = Array.from(
  new Set(LAMEZIA_CLIMATE_DATA.daily.map((record) => record.year)),
).sort((a, b) => a - b);

export const LAMEZIA_CLIMATE_LATEST_YEAR =
  LAMEZIA_CLIMATE_YEARS[LAMEZIA_CLIMATE_YEARS.length - 1] ?? 0;

export function getLameziaClimateRecordsForYear(year: number) {
  return LAMEZIA_CLIMATE_DATA.daily.filter((record) => record.year === year);
}

export function getLameziaClimateAnnualMetrics(year: number) {
  return (
    LAMEZIA_CLIMATE_DATA.annual.find((metric) => metric.year === year) ?? null
  );
}

export function getLatestLameziaClimateRecord() {
  return (
    LAMEZIA_CLIMATE_DATA.daily.find(
      (record) =>
        record.date === LAMEZIA_CLIMATE_DATA.metadata.latest_complete_date,
    ) ?? LAMEZIA_CLIMATE_DATA.daily[LAMEZIA_CLIMATE_DATA.daily.length - 1]
  );
}
