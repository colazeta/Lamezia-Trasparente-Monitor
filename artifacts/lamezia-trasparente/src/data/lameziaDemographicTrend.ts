import demographicTrendData from "./generated/lameziaDemographicTrend.json";
import demographicTrendDataUrl from "./generated/lameziaDemographicTrend.json?url";

type LameziaDemographicTrendAnnualRow = [
  index: number,
  year: number,
  populationResident: number,
  deltaAbs: number | null,
  deltaPct: number | null,
];

export interface LameziaDemographicTrendAnnualRecord {
  index: number;
  year: number;
  population_resident: number;
  delta_abs: number | null;
  delta_pct: number | null;
}

export interface LameziaDemographicTrendDataset {
  schema_version: number;
  metadata: {
    source: string;
    source_url: string;
    source_catalog_url: string;
    source_api_url: string;
    source_csv_url: string;
    source_catalog_homepage: string | null;
    source_catalog_description: string | null;
    organization: string;
    cod_ente: string;
    dataset_id: string;
    dataset_name: string;
    dataset_title: string;
    resource_id: string;
    resource_name: string;
    resource_hash: string;
    holder_name: string;
    holder_identifier: string;
    publisher_name: string;
    publisher_identifier: string;
    license_title: string;
    license_id: string;
    license_type: string | null;
    frequency: string;
    metadata_created: string;
    metadata_modified: string;
    resource_last_modified: string;
    generated_at: string;
    first_year: number;
    latest_year: number;
    rows: number;
    update_policy: string;
    caveat: string;
  };
  annual_columns: string[];
  annual: LameziaDemographicTrendAnnualRecord[];
}

interface RawLameziaDemographicTrendDataset
  extends Omit<LameziaDemographicTrendDataset, "annual"> {
  annual_rows: string;
}

const rawDemographicTrendData =
  demographicTrendData as RawLameziaDemographicTrendDataset;
const annualRecords = parseAnnualRows(rawDemographicTrendData.annual_rows);

export const LAMEZIA_DEMOGRAPHIC_TREND_DATA: LameziaDemographicTrendDataset = {
  ...rawDemographicTrendData,
  annual: annualRecords,
};

export const LAMEZIA_DEMOGRAPHIC_TREND_DATA_URL = demographicTrendDataUrl;

export const LAMEZIA_DEMOGRAPHIC_TREND_YEARS =
  LAMEZIA_DEMOGRAPHIC_TREND_DATA.annual.map((record) => record.year);

export const LAMEZIA_DEMOGRAPHIC_TREND_LATEST_YEAR =
  LAMEZIA_DEMOGRAPHIC_TREND_DATA.metadata.latest_year;

export const LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY =
  buildDemographicTrendSummary(LAMEZIA_DEMOGRAPHIC_TREND_DATA.annual);

export function getLameziaDemographicTrendRecord(year: number) {
  return (
    LAMEZIA_DEMOGRAPHIC_TREND_DATA.annual.find(
      (record) => record.year === year,
    ) ?? null
  );
}

function expandAnnualRow([
  index,
  year,
  populationResident,
  deltaAbs,
  deltaPct,
]: LameziaDemographicTrendAnnualRow): LameziaDemographicTrendAnnualRecord {
  return {
    index,
    year,
    population_resident: populationResident,
    delta_abs: deltaAbs,
    delta_pct: deltaPct,
  };
}

function parseAnnualRows(rows: string) {
  return rows
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("|"))
    .map((row) =>
      expandAnnualRow([
        toRequiredNumber(row[0]),
        toRequiredNumber(row[1]),
        toRequiredNumber(row[2]),
        toNullableNumber(row[3]),
        toNullableNumber(row[4]),
      ]),
    );
}

function toRequiredNumber(value: string | undefined) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Invalid numeric value in demographic trend row: ${value}`);
  }
  return number;
}

function toNullableNumber(value: string | undefined) {
  if (!value) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildDemographicTrendSummary(
  records: LameziaDemographicTrendAnnualRecord[],
) {
  const first = records[0] ?? null;
  const latest = records[records.length - 1] ?? null;
  const previous = records[records.length - 2] ?? null;
  const peak = records.reduce(
    (best, record) =>
      record.population_resident > best.population_resident ? record : best,
    records[0],
  );
  const minimum = records.reduce(
    (best, record) =>
      record.population_resident < best.population_resident ? record : best,
    records[0],
  );

  return {
    first,
    latest,
    previous,
    peak,
    minimum,
    change_since_first_abs:
      first && latest ? latest.population_resident - first.population_resident : null,
    change_since_first_pct:
      first && latest && first.population_resident > 0
        ? roundFour(
            (latest.population_resident - first.population_resident) /
              first.population_resident,
          )
        : null,
    change_since_peak_abs:
      peak && latest ? latest.population_resident - peak.population_resident : null,
    change_since_peak_pct:
      peak && latest && peak.population_resident > 0
        ? roundFour(
            (latest.population_resident - peak.population_resident) /
              peak.population_resident,
          )
        : null,
    latest_year_delta_abs: latest?.delta_abs ?? null,
    latest_year_delta_pct: latest?.delta_pct ?? null,
  };
}

function roundFour(value: number) {
  return Number(value.toFixed(4));
}
