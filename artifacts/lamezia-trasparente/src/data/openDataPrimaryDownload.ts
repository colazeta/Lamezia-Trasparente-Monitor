import { municipalDemographicUrl } from "./municipalDemographics";
import airTrafficDataUrl from "./generated/lameziaAirTrafficMonthly.json?url";
import climateDataUrl from "./generated/lameziaClimateDaily.json?url";
import { householdCompositionUrl } from "./lameziaHouseholdComposition2023";
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
    url: climateDataUrl,
    downloadName: "lamezia-clima-giornaliero.json",
    format: "JSON",
  },
  "lamezia-air-traffic-monthly": {
    url: airTrafficDataUrl,
    downloadName: "lamezia-traffico-aeroportuale-mensile.json",
    format: "JSON",
  },
  "lamezia-demographic-trend": {
    url: "/api/demographics/series/population-resident-jan1",
    downloadName: "lamezia-popolazione-residente.json",
    format: "API",
  },
  "lamezia-household-composition-2023": {
    url: householdCompositionUrl(undefined, true),
    downloadName: "lamezia-famiglie-componenti-2023.json",
    format: "JSON",
  },
  "lamezia-foreign-residents-age-sex": {
    url: municipalDemographicUrl("foreign-age-sex", undefined, true),
    downloadName: "lamezia-stranieri-eta-sesso.json",
    format: "JSON",
  },
  "lamezia-families-children": {
    url: municipalDemographicUrl("families-children", undefined, true),
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
