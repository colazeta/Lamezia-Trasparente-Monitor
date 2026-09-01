import householdCompositionData from "../../../api-server/src/data/lameziaHouseholdComposition2023.json";
import householdCompositionDataUrl from "../../../api-server/src/data/lameziaHouseholdComposition2023.json?url";

export type HouseholdComponentKey = "1" | "2" | "3" | "4" | "5" | "6+";
export type HouseholdComponentSourceField =
  | "PF3"
  | "PF4"
  | "PF5"
  | "PF6"
  | "PF7"
  | "PF8";

export interface LameziaHouseholdCompositionRecord {
  key: HouseholdComponentKey;
  sourceField: HouseholdComponentSourceField;
  households: number;
  share: number;
}

/** Canonical source metadata, quality gates and methodological limitations. */
export interface LameziaHouseholdCompositionDataset {
  schemaVersion: 1;
  referenceYear: number;
  municipality: {
    name: string;
    istatCode: string;
  };
  totalHouseholds: number;
  byComponents: LameziaHouseholdCompositionRecord[];
  indicators: {
    onePersonHouseholds: number;
    onePersonShare: number;
    fivePlusHouseholds: number;
    fivePlusShare: number;
  };
  quality: {
    includedRows: number;
    skippedFictitiousRows: number;
    incompleteRows: number;
    componentSum: number;
    reconciliationDifference: number;
    exactReconciliation: boolean;
  };
  verification: {
    verifiedAt: string;
    method: "sha256-and-exact-reconciliation";
  };
  source: {
    institution: string;
    dataset: string;
    territorialLevel: string;
    referenceDate: string;
    sourceUpdateDate: string;
    pageUrl: string;
    downloadUrl: string;
    archiveFile: string;
    archiveMember: string;
    workbookFile: string;
    archiveSha256: string;
    workbookSha256: string;
    licence: string;
  };
}

export const LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA =
  householdCompositionData as LameziaHouseholdCompositionDataset;

export const LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL =
  householdCompositionDataUrl;

export function assertLameziaHouseholdCompositionDataset(
  data: LameziaHouseholdCompositionDataset,
) {
  const expectedKeys: HouseholdComponentKey[] = ["1", "2", "3", "4", "5", "6+"];
  const actualKeys = data.byComponents.map((record) => record.key);
  const verifiedAt = Date.parse(data.verification.verifiedAt);
  const sourceUpdatedAt = Date.parse(data.source.sourceUpdateDate);
  if (
    data.schemaVersion !== 1 ||
    data.referenceYear !== 2023 ||
    data.municipality.istatCode !== "079160" ||
    actualKeys.join("|") !== expectedKeys.join("|") ||
    data.verification.method !== "sha256-and-exact-reconciliation" ||
    !Number.isFinite(verifiedAt) ||
    !Number.isFinite(sourceUpdatedAt) ||
    verifiedAt < sourceUpdatedAt
  ) {
    throw new Error(
      "Invalid Lamezia household-composition identity, classes or verification metadata",
    );
  }

  const componentSum = data.byComponents.reduce((sum, record) => {
    if (!Number.isInteger(record.households) || record.households < 0) {
      throw new Error(`Invalid household count for class ${record.key}`);
    }
    const expectedShare = roundOne(
      (record.households / data.totalHouseholds) * 100,
    );
    if (record.share !== expectedShare) {
      throw new Error(`Invalid household share for class ${record.key}`);
    }
    return sum + record.households;
  }, 0);

  const onePerson = data.byComponents[0]?.households ?? 0;
  const fivePlus = data.byComponents
    .filter((record) => record.key === "5" || record.key === "6+")
    .reduce((sum, record) => sum + record.households, 0);

  if (
    componentSum !== data.totalHouseholds ||
    data.quality.componentSum !== componentSum ||
    data.quality.reconciliationDifference !== 0 ||
    !data.quality.exactReconciliation ||
    data.quality.incompleteRows !== 0 ||
    data.indicators.onePersonHouseholds !== onePerson ||
    data.indicators.onePersonShare !==
      roundOne((onePerson / data.totalHouseholds) * 100) ||
    data.indicators.fivePlusHouseholds !== fivePlus ||
    data.indicators.fivePlusShare !==
      roundOne((fivePlus / data.totalHouseholds) * 100)
  ) {
    throw new Error("Household composition does not pass publication gates");
  }
}

function roundOne(value: number) {
  return Number(value.toFixed(1));
}

assertLameziaHouseholdCompositionDataset(
  LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA,
);
