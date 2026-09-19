import { apiUrl } from "@/lib/apiBaseUrl";

import type {
  CanonicalHouseholdComposition2023,
  HouseholdComponentBucket,
} from "@workspace/api-client-react";
export type HouseholdComponentKey = HouseholdComponentBucket["key"];
export type HouseholdComponentSourceField =
  HouseholdComponentBucket["sourceField"];
export type LameziaHouseholdCompositionRecord = HouseholdComponentBucket;
export type CanonicalHouseholdComposition = CanonicalHouseholdComposition2023;
export type LameziaHouseholdCompositionDataset = Omit<
  CanonicalHouseholdComposition2023,
  "provenance"
>;

export function householdCompositionUrl(release?: string, download = false) {
  const query = new URLSearchParams();
  if (release) query.set("release", release);
  if (download) query.set("download", "1");
  return apiUrl(
    `/api/demographics/household-composition-2023${query.size ? `?${query}` : ""}`,
  );
}
export const LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL =
  householdCompositionUrl(undefined, true);
export function validateHouseholdComposition(
  input: unknown,
): CanonicalHouseholdComposition {
  const data = input as CanonicalHouseholdComposition;
  assertLameziaHouseholdCompositionDataset(data);
  const p = data.provenance;
  if (
    !p ||
    p.canonical !== true ||
    p.series_key !== "istat-households-by-components-2023" ||
    p.source_key !== "istat.lamezia.household-composition-2023" ||
    !/^[a-f0-9]{64}$/.test(p.release_hash) ||
    !Number.isFinite(Date.parse(p.acquired_at)) ||
    p.source_status !== "unknown" ||
    p.source_records !== 6 ||
    p.canonical_observations !== 6 ||
    p.extractor_version !== "istat-household-composition.v1"
  )
    throw new Error("Invalid canonical household provenance");
  return data;
}

export function assertLameziaHouseholdCompositionDataset(
  data: LameziaHouseholdCompositionDataset,
) {
  if (
    !data ||
    !data.verification ||
    !data.source ||
    !data.quality ||
    !data.indicators ||
    !data.municipality ||
    !Array.isArray(data.byComponents) ||
    !Number.isSafeInteger(data.totalHouseholds) ||
    data.totalHouseholds <= 0
  )
    throw new Error("Invalid household composition");
  const expectedKeys: HouseholdComponentKey[] = ["1", "2", "3", "4", "5", "6+"];
  const actualKeys = data.byComponents.map((record) => record.key);
  const verifiedAt = Date.parse(data.verification.verifiedAt);
  const sourceUpdatedAt = Date.parse(data.source.sourceUpdateDate);
  if (
    data.schemaVersion !== 1 ||
    data.referenceYear !== 2023 ||
    data.source.institution !== "ISTAT" ||
    data.source.pageUrl !==
      "https://www.istat.it/notizia/dati-per-sezioni-di-censimento/" ||
    data.source.downloadUrl !==
      "https://esploradati.istat.it/databrowser/DWL/PERMPOP/SUBCOM/Dati_regionali_2023.zip" ||
    data.source.referenceDate !== "2023-12-31" ||
    !/^[a-f0-9]{64}$/.test(data.source.archiveSha256) ||
    !/^[a-f0-9]{64}$/.test(data.source.workbookSha256) ||
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

  const componentSum = data.byComponents.reduce((sum, record, index) => {
    if (
      record.sourceField !== `PF${index + 3}` ||
      !Number.isSafeInteger(record.households) ||
      record.households < 0
    ) {
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
