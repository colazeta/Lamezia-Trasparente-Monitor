// Keep the previously verified archive intact while adding the 10 October reviewed batch.
// Importers continue to use this stable entry point; presentation remains separate.
export * from "./evidenceInterventionsArchiveBase";

import {
  EVIDENCE_INTERVENTIONS as PREVIOUS_EVIDENCE_INTERVENTIONS,
  EVIDENCE_AREA_LABELS,
  EVIDENCE_INTERVENTION_TYPE_LABELS,
} from "./evidenceInterventionsArchiveBase";
import type { EvidenceIntervention } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_10_10 } from "./evidenceInterventions20261010";
import { EVIDENCE_INTERVENTIONS_2026_10_10_UGANDA } from "./evidenceInterventions20261010Uganda";

export const EVIDENCE_INTERVENTIONS: readonly EvidenceIntervention[] = [
  ...PREVIOUS_EVIDENCE_INTERVENTIONS,
  ...EVIDENCE_INTERVENTIONS_2026_10_10,
  ...EVIDENCE_INTERVENTIONS_2026_10_10_UGANDA,
];

export function getEvidenceCountries() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.map((item) => item.country)))
    .sort((a, b) => a.localeCompare(b, "it"));
}

export function getEvidenceAreas() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.map((item) => item.primaryArea)))
    .sort((a, b) => EVIDENCE_AREA_LABELS[a].localeCompare(EVIDENCE_AREA_LABELS[b], "it"));
}

export function getEvidenceInterventionTypes() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.flatMap((item) => item.interventionTypes)))
    .sort((a, b) => EVIDENCE_INTERVENTION_TYPE_LABELS[a].localeCompare(EVIDENCE_INTERVENTION_TYPE_LABELS[b], "it"));
}

export function findEvidenceIntervention(id: string) {
  return EVIDENCE_INTERVENTIONS.find((item) => item.id === id) ?? null;
}
