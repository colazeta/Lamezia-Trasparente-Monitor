import publicAlboStatus from "../../../../data/public/albo/status.json";

export type AlboStatusCounts = {
  acquired: number;
  new: number;
  changed: number;
  removed: number;
  unchanged: number;
  publishable: number;
  minimised: number;
  metadata_only: number;
  excluded: number;
};

export type AlboOperationalStatus = {
  source: string;
  source_url: string;
  last_update: string | null;
  method: string | null;
  counts: AlboStatusCounts;
  warnings: string[];
  next_scheduled_check: string | null;
  verification_status: "verification_required" | "official_source_acquired" | "normalised_automatically";
  known_limits: string[];
  official_albo_disclaimer: string;
};

function isVerificationStatus(
  value: string,
): value is AlboOperationalStatus["verification_status"] {
  return (
    value === "verification_required" ||
    value === "official_source_acquired" ||
    value === "normalised_automatically"
  );
}

export const ALBO_OPERATIONAL_STATUS: AlboOperationalStatus = {
  source: publicAlboStatus.source,
  source_url: publicAlboStatus.source_url,
  last_update: publicAlboStatus.last_update,
  method: publicAlboStatus.method,
  counts: publicAlboStatus.counts,
  warnings: publicAlboStatus.warnings,
  next_scheduled_check: publicAlboStatus.next_scheduled_check,
  verification_status: isVerificationStatus(publicAlboStatus.verification_status)
    ? publicAlboStatus.verification_status
    : "verification_required",
  known_limits: publicAlboStatus.known_limits,
  official_albo_disclaimer: publicAlboStatus.official_albo_disclaimer,
};

export const ALBO_VERIFICATION_LABELS: Record<
  AlboOperationalStatus["verification_status"],
  string
> = {
  verification_required: "Verifica richiesta",
  official_source_acquired: "Fonte ufficiale acquisita",
  normalised_automatically: "Normalizzato automaticamente",
};
