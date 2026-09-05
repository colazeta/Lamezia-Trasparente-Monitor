import {
  EVIDENCE_AREA_LABELS,
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_IMPLEMENTABILITY_LABELS,
  EVIDENCE_INTERVENTIONS as BASE_EVIDENCE_INTERVENTIONS,
  EVIDENCE_INTERVENTION_TYPE_LABELS,
  EVIDENCE_STRENGTHS,
  EVIDENCE_STRENGTH_LABELS,
  type EvidenceImplementability,
  type EvidenceIntervention,
  type EvidenceInterventionType,
  type EvidenceStrength,
  type EvidenceThematicArea,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_DAILY } from "./evidenceInterventionsDaily";
import { EVIDENCE_INTERVENTIONS_2026_08_31 } from "./evidenceInterventions20260831";
import { EVIDENCE_INTERVENTIONS_2026_09_01 } from "./evidenceInterventions20260901";
import { EVIDENCE_INTERVENTIONS_2026_09_02 } from "./evidenceInterventions20260902";
import { EVIDENCE_INTERVENTIONS_2026_09_03 } from "./evidenceInterventions20260903";
import { EVIDENCE_INTERVENTIONS_2026_09_04 } from "./evidenceInterventions20260904";
import { EVIDENCE_INTERVENTIONS_2026_09_05 } from "./evidenceInterventions20260905";

export {
  EVIDENCE_AREA_LABELS,
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_IMPLEMENTABILITY_LABELS,
  EVIDENCE_INTERVENTION_TYPE_LABELS,
  EVIDENCE_STRENGTHS,
  EVIDENCE_STRENGTH_LABELS,
};

export type {
  EvidenceImplementability,
  EvidenceIntervention,
  EvidenceInterventionType,
  EvidenceStrength,
  EvidenceThematicArea,
};

export const EVIDENCE_INTERVENTIONS: readonly EvidenceIntervention[] = [
  ...BASE_EVIDENCE_INTERVENTIONS,
  ...EVIDENCE_INTERVENTIONS_DAILY,
  ...EVIDENCE_INTERVENTIONS_2026_08_31,
  ...EVIDENCE_INTERVENTIONS_2026_09_01,
  ...EVIDENCE_INTERVENTIONS_2026_09_02,
  ...EVIDENCE_INTERVENTIONS_2026_09_03,
  ...EVIDENCE_INTERVENTIONS_2026_09_04,
  ...EVIDENCE_INTERVENTIONS_2026_09_05,
];

export function getEvidenceCountries() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.map((item) => item.country))).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}

export function getEvidenceAreas() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.map((item) => item.primaryArea))).sort((a, b) =>
    EVIDENCE_AREA_LABELS[a].localeCompare(EVIDENCE_AREA_LABELS[b], "it"),
  );
}

export function getEvidenceInterventionTypes() {
  return Array.from(new Set(EVIDENCE_INTERVENTIONS.flatMap((item) => item.interventionTypes))).sort(
    (a, b) => EVIDENCE_INTERVENTION_TYPE_LABELS[a].localeCompare(EVIDENCE_INTERVENTION_TYPE_LABELS[b], "it"),
  );
}

export function findEvidenceIntervention(id: string) {
  return EVIDENCE_INTERVENTIONS.find((item) => item.id === id) ?? null;
}
