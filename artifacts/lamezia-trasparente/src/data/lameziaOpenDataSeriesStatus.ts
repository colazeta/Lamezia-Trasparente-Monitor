import openDataSeriesStatus from "./generated/lameziaOpenDataSeriesStatus.json";

export type OpenDataSeriesSourceCadence =
  | "daily"
  | "weekly"
  | "monthly"
  | "release-driven";
export type OpenDataSeriesMonitoringCadence = "daily";
export type OpenDataSeriesAutomationStatus = "active";

export interface LameziaOpenDataSeriesStatusItem {
  id: string;
  theme_id: string;
  label: string;
  source: string;
  source_url: string;
  latest_observation: string | null;
  latest_observation_label: string;
  latest_observation_note: string | null;
  source_modified_at: string | null;
  materialised_at: string | null;
  cadence: OpenDataSeriesSourceCadence;
  cadence_label: string;
  source_cadence: OpenDataSeriesSourceCadence;
  source_cadence_label: string;
  monitoring_cadence: OpenDataSeriesMonitoringCadence;
  monitoring_cadence_label: string;
  automation_status: OpenDataSeriesAutomationStatus;
  automation_status_label: string;
  update_policy: string;
}

export interface LameziaOpenDataSeriesStatusManifest {
  schema_version: number;
  series: LameziaOpenDataSeriesStatusItem[];
}

export const LAMEZIA_OPEN_DATA_SERIES_STATUS =
  openDataSeriesStatus as LameziaOpenDataSeriesStatusManifest;

export const LAMEZIA_OPEN_DATA_SERIES =
  LAMEZIA_OPEN_DATA_SERIES_STATUS.series;

export const LAMEZIA_OPEN_DATA_SERIES_BY_ID = new Map(
  LAMEZIA_OPEN_DATA_SERIES.map((series) => [series.id, series]),
);

export const LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY = {
  total: LAMEZIA_OPEN_DATA_SERIES.length,
  automated: LAMEZIA_OPEN_DATA_SERIES.filter(
    (series) => series.automation_status === "active",
  ).length,
  monitoredDaily: LAMEZIA_OPEN_DATA_SERIES.filter(
    (series) => series.monitoring_cadence === "daily",
  ).length,
};
