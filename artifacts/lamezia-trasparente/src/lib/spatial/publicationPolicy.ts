import type { SpatialLayerId } from "./layerRegistry";

export type AtlasPublicationEligibility =
  | "eligible"
  | "conditional"
  | "planned";

export type SpatialLayerPublicationDecision = {
  eligibility: AtlasPublicationEligibility;
  reason: string;
};

/**
 * Publication is default-deny at the type level: every SpatialLayerId must have
 * an explicit decision before the frontend can treat it as Atlas-ready.
 */
export const SPATIAL_LAYER_PUBLICATION_POLICY = {
  "municipal-boundary": {
    eligibility: "eligible",
    reason: "Canonical municipal reference geometry already used by the Atlas.",
  },
  "census-sections": {
    eligibility: "eligible",
    reason: "Official ISTAT census geometries with explicit provenance and limitations.",
  },
  "confiscated-assets": {
    eligibility: "conditional",
    reason:
      "Only records admitted by the backend fail-closed geolocation publication policy are exposed.",
  },
  "public-works": {
    eligibility: "planned",
    reason: "No canonical intervention geometry feed is active yet.",
  },
  "pnrr-projects": {
    eligibility: "planned",
    reason: "Current project records do not yet expose canonical territorial geometry.",
  },
  "public-assets": {
    eligibility: "planned",
    reason: "No canonical public-asset geometry feed is active yet.",
  },
  "schools-services": {
    eligibility: "planned",
    reason: "No canonical schools/services geometry feed is active yet.",
  },
  "cultural-assets": {
    eligibility: "planned",
    reason: "No canonical cultural-assets geometry feed is active yet.",
  },
  "localised-contract-interventions": {
    eligibility: "planned",
    reason:
      "Contract coordinates must not be published as intervention sites until their spatial meaning is demonstrated.",
  },
} satisfies Record<SpatialLayerId, SpatialLayerPublicationDecision>;

export type NonPublicSpatialDatasetDisposition =
  | "internal_support"
  | "review_only";

export type NonPublicSpatialDataset = {
  id: string;
  title: string;
  artifacts: readonly string[];
  disposition: NonPublicSpatialDatasetDisposition;
  atlasEligible: false;
  geometryStatus?: "candidate_inferred";
  reason: string;
};

/**
 * Spatial artifacts that exist in the repository but are deliberately outside
 * the public Atlas contract. Their existence must never be interpreted as
 * publication readiness.
 */
export const NON_PUBLIC_SPATIAL_DATASETS = [
  {
    id: "anncsu-civics-2025",
    title: "Civici ANNCSU 2025",
    artifacts: [
      "data/processed/geo/anncsu_lamezia_civics_2025.csv",
      "data/processed/geo/anncsu_lamezia_civics_2025.gpkg",
    ],
    disposition: "internal_support",
    atlasEligible: false,
    reason:
      "Authoritative address substrate, but point coordinates require QA and are not themselves a public Atlas theme.",
  },
  {
    id: "anncsu-civics-electoral-assignment-2025",
    title: "Civici ANNCSU con sezione elettorale derivata 2025",
    artifacts: [
      "data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025.csv",
      "data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025.gpkg",
    ],
    disposition: "internal_support",
    atlasEligible: false,
    reason:
      "Electoral-section assignment is derived from street-register rules and remains incomplete; unresolved records require review.",
  },
  {
    id: "electoral-sections-candidate-2025",
    title: "Geometrie candidate delle sezioni elettorali 2025",
    artifacts: [
      "data/processed/geo/electoral_sections_candidate_2025_v1.gpkg",
      "data/processed/geo/electoral_sections_candidate_2025_v2.gpkg",
      "data/processed/geo/electoral_sections_candidate_2025_v3_census.gpkg",
    ],
    disposition: "review_only",
    atlasEligible: false,
    geometryStatus: "candidate_inferred",
    reason:
      "These are inferred analytical geometries, not official electoral boundaries; current QA requires manual review before any publication decision.",
  },
] as const satisfies readonly NonPublicSpatialDataset[];

export function isAtlasLayerPublicationEligible(id: SpatialLayerId): boolean {
  const eligibility = SPATIAL_LAYER_PUBLICATION_POLICY[id].eligibility;
  return eligibility === "eligible" || eligibility === "conditional";
}
