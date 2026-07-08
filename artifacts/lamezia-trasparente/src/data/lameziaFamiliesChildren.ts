import familiesChildrenData from "./generated/lameziaFamiliesChildren.json";
import familiesChildrenDataUrl from "./generated/lameziaFamiliesChildren.json?url";

type LameziaFamiliesChildrenRow = [
  childrenCountLabel: string,
  childrenCountMin: number,
  families: number,
  shareOfTotal: number,
  cumulativeFamilies: number,
];

export interface LameziaFamiliesChildrenRecord {
  children_count_label: string;
  children_count_min: number;
  families: number;
  share_of_total: number;
  cumulative_families: number;
}

export interface LameziaFamiliesChildrenDataset {
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
    rows: number;
    total_families_with_children: number;
    one_child_families: number;
    two_children_families: number;
    three_or_more_children_families: number;
    update_policy: string;
    caveat: string;
  };
  family_children_columns: string[];
  family_children: LameziaFamiliesChildrenRecord[];
}

interface RawLameziaFamiliesChildrenDataset extends Omit<
  LameziaFamiliesChildrenDataset,
  "family_children"
> {
  family_children_rows: string;
}

const rawFamiliesChildrenData =
  familiesChildrenData as RawLameziaFamiliesChildrenDataset;
const familyChildrenRecords = parseFamilyChildrenRows(
  rawFamiliesChildrenData.family_children_rows,
);

export const LAMEZIA_FAMILIES_CHILDREN_DATA: LameziaFamiliesChildrenDataset = {
  ...rawFamiliesChildrenData,
  family_children: familyChildrenRecords,
};

export const LAMEZIA_FAMILIES_CHILDREN_DATA_URL = familiesChildrenDataUrl;

export const LAMEZIA_FAMILIES_CHILDREN_SUMMARY = buildFamiliesChildrenSummary(
  familyChildrenRecords,
);

export function getLameziaFamiliesChildrenRecord(childrenCountMin: number) {
  return (
    LAMEZIA_FAMILIES_CHILDREN_DATA.family_children.find(
      (record) => record.children_count_min === childrenCountMin,
    ) ?? null
  );
}

function expandFamilyChildrenRow([
  childrenCountLabel,
  childrenCountMin,
  families,
  shareOfTotal,
  cumulativeFamilies,
]: LameziaFamiliesChildrenRow): LameziaFamiliesChildrenRecord {
  return {
    children_count_label: childrenCountLabel,
    children_count_min: childrenCountMin,
    families,
    share_of_total: shareOfTotal,
    cumulative_families: cumulativeFamilies,
  };
}

function parseFamilyChildrenRows(rows: string) {
  return rows
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("|"))
    .map((row) =>
      expandFamilyChildrenRow([
        toRequiredString(row[0]),
        toRequiredNumber(row[1]),
        toRequiredNumber(row[2]),
        toRequiredNumber(row[3]),
        toRequiredNumber(row[4]),
      ]),
    );
}

function toRequiredString(value: string | undefined) {
  if (!value) {
    throw new Error("Invalid empty children count label in families row");
  }
  return value;
}

function toRequiredNumber(value: string | undefined) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Invalid numeric value in families row: ${value}`);
  }
  return number;
}

function buildFamiliesChildrenSummary(
  records: LameziaFamiliesChildrenRecord[],
) {
  const total = records.reduce((sum, record) => sum + record.families, 0);
  const oneChild = records.find((record) => record.children_count_min === 1);
  const twoChildren = records.find((record) => record.children_count_min === 2);
  const threeOrMore = records
    .filter((record) => record.children_count_min >= 3)
    .reduce((sum, record) => sum + record.families, 0);
  const largestClass = records.reduce(
    (best, record) => (record.families > best.families ? record : best),
    records[0],
  );

  return {
    total,
    one_child: oneChild?.families ?? 0,
    one_child_share:
      total > 0 && oneChild ? roundFour(oneChild.families / total) : 0,
    two_children: twoChildren?.families ?? 0,
    two_children_share:
      total > 0 && twoChildren ? roundFour(twoChildren.families / total) : 0,
    three_or_more: threeOrMore,
    three_or_more_share: total > 0 ? roundFour(threeOrMore / total) : 0,
    largest_class: largestClass,
  };
}

function roundFour(value: number) {
  return Number(value.toFixed(4));
}
