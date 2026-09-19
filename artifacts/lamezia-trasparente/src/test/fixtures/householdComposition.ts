import source from "../../../../api-server/src/data/lameziaHouseholdComposition2023.json";
import type { CanonicalHouseholdComposition2023 } from "@workspace/api-client-react";
export const HOUSEHOLD_FIXTURE = {
  ...source,
  provenance: {
    canonical: true,
    series_key: "istat-households-by-components-2023",
    source_key: "istat.lamezia.household-composition-2023",
    release_hash: "b".repeat(64),
    acquired_at: "2026-09-19T14:00:00.000Z",
    source_status: "unknown",
    source_records: 6,
    canonical_observations: 6,
    extractor_version: "istat-household-composition.v1",
  },
} as CanonicalHouseholdComposition2023;
