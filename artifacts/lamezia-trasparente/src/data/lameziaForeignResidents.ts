export type LameziaForeignResidentsAgeGroup = "0-14" | "15-64" | "65+";

type LameziaForeignResidentsAgeRow = [
  year: number,
  ageClass: string,
  male: number,
  female: number,
  total: number,
  shareOfYear: number,
  ageGroup: LameziaForeignResidentsAgeGroup,
];

export interface LameziaForeignResidentsAgeRecord {
  year: number;
  age_class: string;
  male: number;
  female: number;
  total: number;
  share_of_year: number;
  age_group: LameziaForeignResidentsAgeGroup;
}

export interface LameziaForeignResidentsDataset {
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
    years: number[];
    rows: number;
    latest_total: number;
    latest_male_total: number;
    latest_female_total: number;
    latest_children_total: number;
    latest_working_age_total: number;
    latest_senior_total: number;
    update_policy: string;
    caveat: string;
  };
  age_columns: string[];
  age: LameziaForeignResidentsAgeRecord[];
}

export interface RawLameziaForeignResidentsDataset extends Omit<
  LameziaForeignResidentsDataset,
  "age"
> {
  age_rows: string;
}

export function createForeignResidentsDataset(
  input: RawLameziaForeignResidentsDataset,
): LameziaForeignResidentsDataset {
  return { ...input, age: parseAgeRows(input.age_rows) };
}
export function getLameziaForeignResidentsAgeRecord(
  dataset: LameziaForeignResidentsDataset,
  ageClass: string,
  year = dataset.metadata.latest_year,
) {
  return (
    dataset.age.find(
      (record) => record.year === year && record.age_class === ageClass,
    ) ?? null
  );
}

function expandAgeRow([
  year,
  ageClass,
  male,
  female,
  total,
  shareOfYear,
  ageGroup,
]: LameziaForeignResidentsAgeRow): LameziaForeignResidentsAgeRecord {
  return {
    year,
    age_class: ageClass,
    male,
    female,
    total,
    share_of_year: shareOfYear,
    age_group: ageGroup,
  };
}

function parseAgeRows(rows: string) {
  return rows
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("|"))
    .map((row) =>
      expandAgeRow([
        toRequiredNumber(row[0]),
        toRequiredString(row[1]),
        toRequiredNumber(row[2]),
        toRequiredNumber(row[3]),
        toRequiredNumber(row[4]),
        toRequiredNumber(row[5]),
        toAgeGroup(row[6]),
      ]),
    );
}

function toRequiredString(value: string | undefined) {
  if (!value) {
    throw new Error("Invalid empty age class in foreign residents row");
  }
  return value;
}

function toRequiredNumber(value: string | undefined) {
  const number = Number(value);
  if (value === undefined || value.trim() === "" || !Number.isFinite(number)) {
    throw new Error(`Invalid numeric value in foreign residents row: ${value}`);
  }
  return number;
}

function toAgeGroup(
  value: string | undefined,
): LameziaForeignResidentsAgeGroup {
  if (value === "0-14" || value === "15-64" || value === "65+") {
    return value;
  }
  throw new Error(`Invalid age group in foreign residents row: ${value}`);
}

export function buildForeignResidentsSummary(
  records: LameziaForeignResidentsAgeRecord[],
) {
  const totals = records.reduce(
    (summary, record) => ({
      total: summary.total + record.total,
      male: summary.male + record.male,
      female: summary.female + record.female,
      children:
        summary.children + (record.age_group === "0-14" ? record.total : 0),
      workingAge:
        summary.workingAge + (record.age_group === "15-64" ? record.total : 0),
      senior: summary.senior + (record.age_group === "65+" ? record.total : 0),
    }),
    {
      total: 0,
      male: 0,
      female: 0,
      children: 0,
      workingAge: 0,
      senior: 0,
    },
  );
  const largestAgeClass = records.reduce(
    (best, record) => (record.total > best.total ? record : best),
    records[0],
  );

  return {
    ...totals,
    male_share: totals.total > 0 ? roundFour(totals.male / totals.total) : 0,
    female_share:
      totals.total > 0 ? roundFour(totals.female / totals.total) : 0,
    children_share:
      totals.total > 0 ? roundFour(totals.children / totals.total) : 0,
    working_age_share:
      totals.total > 0 ? roundFour(totals.workingAge / totals.total) : 0,
    senior_share:
      totals.total > 0 ? roundFour(totals.senior / totals.total) : 0,
    largest_age_class: largestAgeClass,
  };
}

function roundFour(value: number) {
  return Number(value.toFixed(4));
}
