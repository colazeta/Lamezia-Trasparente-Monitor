import { LAMEZIA_AIR_TRAFFIC_DATA_URL } from "@/data/lameziaAirTraffic";
import { LAMEZIA_CLIMATE_DATA_URL } from "@/data/lameziaClimate";
import { LAMEZIA_FAMILIES_CHILDREN_DATA_URL } from "@/data/lameziaFamiliesChildren";
import { LAMEZIA_FOREIGN_RESIDENTS_DATA_URL } from "@/data/lameziaForeignResidents";
import { LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL } from "@/data/lameziaHouseholdComposition2023";
import type {
  OpenDataDatasetFormat,
  OpenDataThemeDataset,
} from "@/data/openDataDatasetRegistry";

export interface OpenDataPrimaryDownload {
  url: string;
  downloadName: string;
  format: OpenDataDatasetFormat;
}

const SPECIALIST_DOWNLOADS: Record<string, OpenDataPrimaryDownload> = {
  "lamezia-climate-daily": {
    url: LAMEZIA_CLIMATE_DATA_URL,
    downloadName: "lamezia-clima-giornaliero.json",
    format: "JSON",
  },
  "lamezia-air-traffic-monthly": {
    url: LAMEZIA_AIR_TRAFFIC_DATA_URL,
    downloadName: "lamezia-traffico-aeroportuale-mensile.json",
    format: "JSON",
  },
  "lamezia-demographic-trend": {
    url: "/api/demographics/series/population-resident-jan1",
    downloadName: "lamezia-popolazione-residente.json",
    format: "API",
  },
  "lamezia-household-composition-2023": {
    url: LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL,
    downloadName: "lamezia-famiglie-componenti-2023.json",
    format: "JSON",
  },
  "lamezia-foreign-residents-age-sex": {
    url: LAMEZIA_FOREIGN_RESIDENTS_DATA_URL,
    downloadName: "lamezia-stranieri-eta-sesso.json",
    format: "JSON",
  },
  "lamezia-families-children": {
    url: LAMEZIA_FAMILIES_CHILDREN_DATA_URL,
    downloadName: "lamezia-famiglie-numero-figli.json",
    format: "JSON",
  },
};

export function getOpenDataPrimaryDownload(
  dataset: OpenDataThemeDataset,
): OpenDataPrimaryDownload | null {
  const distribution = dataset.distributions?.[0];
  if (distribution) {
    return {
      url: distribution.url,
      downloadName:
        distribution.downloadName ??
        `${dataset.id}.${extensionFor(distribution.format)}`,
      format: distribution.format,
    };
  }

  return SPECIALIST_DOWNLOADS[dataset.id] ?? null;
}

function extensionFor(format: OpenDataDatasetFormat) {
  if (format === "GeoJSON") return "geojson";
  if (format === "CSV") return "csv";
  return "json";
}
