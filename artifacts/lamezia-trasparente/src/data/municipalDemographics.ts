import { apiUrl } from "@/lib/apiBaseUrl";
import type { MunicipalDemographicSnapshot } from "@workspace/api-client-react";
import {
  createFamiliesChildrenDataset,
  type RawLameziaFamiliesChildrenDataset,
} from "./lameziaFamiliesChildren";
import {
  createForeignResidentsDataset,
  type RawLameziaForeignResidentsDataset,
} from "./lameziaForeignResidents";
import {
  createDemographicTrendDataset,
  type RawLameziaDemographicTrendDataset,
} from "./lameziaDemographicTrend";
export type MunicipalDatasetKey =
  | "population"
  | "foreign-age-sex"
  | "families-children";
export type MunicipalSnapshot = MunicipalDemographicSnapshot & {
  metadata: MunicipalDemographicSnapshot["metadata"] & {
    source: string;
    source_url: string;
    source_catalog_url: string;
    source_csv_url: string;
    generated_at: string;
    resource_last_modified: string;
    update_policy: string;
    caveat: string;
    frequency: string;
    license_title: string;
    dataset_title: string;
    rows: number;
  };
};
export function municipalDemographicUrl(
  key: MunicipalDatasetKey,
  releaseHash?: string,
  download = false,
) {
  const q = new URLSearchParams();
  if (releaseHash) q.set("release", releaseHash);
  if (download) q.set("download", "1");
  return apiUrl(`/api/demographics/municipal/${key}${q.size ? `?${q}` : ""}`);
}
export function validateMunicipalSnapshot(
  input: unknown,
  key: MunicipalDatasetKey,
): MunicipalSnapshot {
  if (!input || typeof input !== "object")
    throw new Error("Risposta demografica non valida");
  const d = input as MunicipalSnapshot,
    p = d.provenance;
  const series = {
    population: "municipal-population-resident-annual",
    "foreign-age-sex": "municipal-foreign-residents-age-sex",
    "families-children": "municipal-families-by-children",
  };
  if (
    d.schema_version !== 1 ||
    !d.metadata ||
    p?.canonical !== true ||
    p.schema_version !== "lt-municipal-demographic-public.v1" ||
    p.extractor_version !== "municipal-demographics.v1" ||
    p.source_status !== "unknown" ||
    p.source_key !== `lamezia.demographics.${key}` ||
    p.series_key !== series[key] ||
    !/^[a-f0-9]{64}$/.test(p.release_hash) ||
    p.reference_day_unspecified !== true ||
    p.reference_period_unspecified !== (key === "families-children")
  )
    throw new Error("Proiezione canonica demografica non verificabile");
  for (const field of [
    "source",
    "source_url",
    "source_catalog_url",
    "source_csv_url",
    "generated_at",
    "resource_last_modified",
    "update_policy",
    "caveat",
    "frequency",
    "license_title",
    "dataset_title",
  ])
    if (typeof d.metadata[field] !== "string")
      throw new Error("Metadati demografici incompleti");
  for (const field of [
    "source_url",
    "source_catalog_url",
    "source_csv_url",
  ] as const)
    if (new URL(d.metadata[field]).protocol !== "https:")
      throw new Error("URL della fonte non valido");
  if (
    p.source_generated_at !== d.metadata.generated_at ||
    !Number.isFinite(Date.parse(p.acquired_at)) ||
    !Number.isFinite(Date.parse(p.source_generated_at))
  )
    throw new Error("Provenienza demografica incoerente");
  const count =
    key === "families-children"
      ? createFamiliesChildrenDataset(
          d as unknown as RawLameziaFamiliesChildrenDataset,
        ).family_children.length
      : key === "foreign-age-sex"
        ? createForeignResidentsDataset(
            d as unknown as RawLameziaForeignResidentsDataset,
          ).age.length
        : createDemographicTrendDataset(
            d as unknown as RawLameziaDemographicTrendDataset,
          ).annual.length;
  if (
    !Number.isInteger(d.metadata.rows) ||
    d.metadata.rows <= 0 ||
    count !== d.metadata.rows ||
    p.source_records !== count ||
    p.canonical_observations !== count * (key === "foreign-age-sex" ? 2 : 1)
  )
    throw new Error("Copertura demografica incoerente");
  return d;
}
