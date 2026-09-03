import airTrafficDataUrl from "./generated/lameziaAirTrafficMonthly.json?url";
import climateDataUrl from "./generated/lameziaClimateDaily.json?url";
import familiesChildrenDataUrl from "./generated/lameziaFamiliesChildren.json?url";
import foreignResidentsDataUrl from "./generated/lameziaForeignResidentsAgeSex.json?url";
import householdCompositionDataUrl from "../../../api-server/src/data/lameziaHouseholdComposition2023.json?url";
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
    url: householdCompositionDataUrl,
    downloadName: "lamezia-famiglie-componenti-2023.json",
    format: "JSON",
  },
  "lamezia-foreign-residents-age-sex": {
    url: foreignResidentsDataUrl,
    downloadName: "lamezia-stranieri-eta-sesso.json",
    format: "JSON",
  },
  "lamezia-families-children": {
    url: familiesChildrenDataUrl,
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
