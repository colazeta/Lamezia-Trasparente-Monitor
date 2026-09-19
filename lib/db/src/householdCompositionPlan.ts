import type { SnapshotSource } from "./sourceSnapshotManifest";
import type { MunicipalObservation } from "./municipalDemographicPlan";

export const HOUSEHOLD_COMPOSITION_KEY =
  "istat.lamezia.household-composition-2023";
export const HOUSEHOLD_COMPOSITION_SERIES =
  "istat-households-by-components-2023";
export const HOUSEHOLD_COMPOSITION_EXTRACTOR = "istat-household-composition.v1";
export const householdCompositionSource: SnapshotSource = {
  key: HOUSEHOLD_COMPOSITION_KEY,
  title: "Famiglie per numero di componenti — ISTAT, censimento 2023",
  path: "artifacts/api-server/src/data/lameziaHouseholdComposition2023.json",
  role: "derived_dataset",
  upstreamUrls: [
    "https://www.istat.it/notizia/dati-per-sezioni-di-censimento/",
    "https://esploradati.istat.it/databrowser/DWL/PERMPOP/SUBCOM/Dati_regionali_2023.zip",
  ],
  collections: { byComponents: "key" },
};

function ensure(value: unknown): asserts value {
  if (!value) throw new Error("HOUSEHOLD_COMPOSITION_INVALID_SOURCE");
}
const count = (n: unknown): n is number =>
  typeof n === "number" && Number.isSafeInteger(n) && n >= 0 && n < 1e14;
const round = (n: number) => Number(n.toFixed(1));
function date(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

/** Six municipal aggregates, not the 246 upstream sections. No P02/children inference. */
export function planHouseholdComposition(input: any) {
  ensure(
    input &&
      input.schemaVersion === 1 &&
      input.referenceYear === 2023 &&
      input.municipality?.istatCode === "079160" &&
      input.municipality.name === "Lamezia Terme",
  );
  const s = input.source,
    q = input.quality,
    v = input.verification;
  ensure(
    s &&
      q &&
      v &&
      s.institution === "ISTAT" &&
      s.referenceDate === "2023-12-31" &&
      s.pageUrl === householdCompositionSource.upstreamUrls[0] &&
      s.downloadUrl === householdCompositionSource.upstreamUrls[1] &&
      s.archiveFile === "Dati_regionali_2023.zip" &&
      s.archiveMember ===
        "Dati_regionali_2023/R18_Calabria_2023_sezioni.xlsx" &&
      s.workbookFile === "R18_Calabria_2023_sezioni.xlsx" &&
      s.territorialLevel === "sezione di censimento" &&
      typeof s.dataset === "string" &&
      s.dataset.length > 0 &&
      typeof s.licence === "string" &&
      s.licence.length > 0 &&
      [s.archiveSha256, s.workbookSha256].every(
        (h) => typeof h === "string" && /^[a-f0-9]{64}$/.test(h),
      ) &&
      date(s.sourceUpdateDate) &&
      s.sourceUpdateDate >= s.referenceDate &&
      v.method === "sha256-and-exact-reconciliation" &&
      typeof v.verifiedAt === "string" &&
      Number.isFinite(Date.parse(v.verifiedAt)) &&
      new Date(v.verifiedAt).toISOString() === v.verifiedAt &&
      Date.parse(v.verifiedAt) >= Date.parse(s.sourceUpdateDate),
  );
  ensure(
    count(input.totalHouseholds) &&
      input.totalHouseholds > 0 &&
      count(q.includedRows) &&
      q.includedRows > 0 &&
      count(q.skippedFictitiousRows) &&
      q.incompleteRows === 0 &&
      q.exactReconciliation === true &&
      q.reconciliationDifference === 0 &&
      Array.isArray(input.byComponents) &&
      input.byComponents.length === 6,
  );
  const records: {
    key: string;
    sourceField: string;
    households: number;
    share: number;
  }[] = input.byComponents.map((r: any, index: number) => {
    ensure(
      r &&
        r.key === ["1", "2", "3", "4", "5", "6+"][index] &&
        r.sourceField === `PF${index + 3}` &&
        count(r.households) &&
        r.share === round((r.households / input.totalHouseholds) * 100),
    );
    return {
      key: r.key as string,
      sourceField: r.sourceField as string,
      households: r.households as number,
      share: r.share as number,
    };
  });
  const total = records.reduce(
    (n: number, r: (typeof records)[number]) => n + r.households,
    0,
  );
  const one = records[0].households,
    five = records[4].households + records[5].households;
  ensure(
    total === input.totalHouseholds &&
      q.componentSum === total &&
      input.indicators &&
      input.indicators.onePersonHouseholds === one &&
      input.indicators.onePersonShare === round((one / total) * 100) &&
      input.indicators.fivePlusHouseholds === five &&
      input.indicators.fivePlusShare === round((five / total) * 100),
  );
  // Explicit public allowlist: retained evidence may contain other ingestion metadata.
  const data = {
    schemaVersion: 1 as const,
    referenceYear: 2023 as const,
    municipality: { name: "Lamezia Terme", istatCode: "079160" },
    totalHouseholds: total,
    byComponents: records,
    indicators: {
      onePersonHouseholds: one,
      onePersonShare: round((one / total) * 100),
      fivePlusHouseholds: five,
      fivePlusShare: round((five / total) * 100),
    },
    quality: {
      includedRows: Number(q.includedRows),
      skippedFictitiousRows: Number(q.skippedFictitiousRows),
      incompleteRows: 0,
      componentSum: total,
      reconciliationDifference: 0,
      exactReconciliation: true,
    },
    verification: {
      verifiedAt: String(v.verifiedAt),
      method: "sha256-and-exact-reconciliation" as const,
    },
    source: Object.fromEntries(
      [
        "institution",
        "dataset",
        "territorialLevel",
        "referenceDate",
        "sourceUpdateDate",
        "pageUrl",
        "downloadUrl",
        "archiveFile",
        "archiveMember",
        "workbookFile",
        "archiveSha256",
        "workbookSha256",
        "licence",
      ].map((k) => [k, String(s[k])]),
    ),
  };
  const observations: MunicipalObservation[] = records.map(
    (r: (typeof records)[number]) => ({
      reference_period: "2023-12-31",
      dimensions: { components: r.key },
      dimension_key: JSON.stringify({ components: r.key }),
      value: String(r.households),
      source_native_key: r.key,
      quality_flags: [
        "recovered_from_repository_derived_dataset",
        "census_sections_aggregated",
        "source_status_unspecified",
      ],
    }),
  );
  return {
    data,
    records: input.byComponents as Record<string, unknown>[],
    observations,
    definition: {
      seriesKey: HOUSEHOLD_COMPOSITION_SERIES,
      title: householdCompositionSource.title,
      unit: "famiglie",
      datasetId: "ISTAT:PERMPOP:SUBCOM:2023:PF3-PF8",
      collection: "byComponents",
    },
    expanded: input,
  };
}

export function householdCompositionReleaseMetadata(
  input: unknown,
  sourceReleaseId: string,
) {
  const { data } = planHouseholdComposition(input);
  return {
    extractor_version: HOUSEHOLD_COMPOSITION_EXTRACTOR,
    source_registry_release_id: sourceReleaseId,
    source_collection: "byComponents",
    source_native_key_field: "key",
    source_verified_at: data.verification.verifiedAt,
    source_update_date: data.source.sourceUpdateDate,
    reference_day: "2023-12-31",
    reference_period_unspecified: false,
    evidence_kind: "repository_derived_dataset",
    archive_sha256: data.source.archiveSha256,
    workbook_sha256: data.source.workbookSha256,
    upstream_included_sections: data.quality.includedRows,
    limitation:
      "La dimensione della famiglia anagrafica non identifica figli, coppie o parentela. Fotografia censuaria distinta dalla serie P02 e dalla fonte comunale per numero di figli.",
  };
}
