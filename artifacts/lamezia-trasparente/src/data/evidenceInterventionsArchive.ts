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
import { EVIDENCE_INTERVENTIONS_2026_09_05_SPECIAL } from "./evidenceInterventions20260905Special";
import { EVIDENCE_INTERVENTIONS_2026_09_06 } from "./evidenceInterventions20260906";
import { EVIDENCE_INTERVENTIONS_2026_09_07 } from "./evidenceInterventions20260907";
import { EVIDENCE_INTERVENTIONS_2026_09_08 } from "./evidenceInterventions20260908";
import { EVIDENCE_INTERVENTIONS_2026_09_09 } from "./evidenceInterventions20260909";
import { EVIDENCE_INTERVENTIONS_2026_09_10 } from "./evidenceInterventions20260910";
import { EVIDENCE_INTERVENTIONS_2026_09_11 } from "./evidenceInterventions20260911";
import { EVIDENCE_INTERVENTIONS_2026_09_12 } from "./evidenceInterventions20260912";
import { EVIDENCE_INTERVENTIONS_2026_09_13 } from "./evidenceInterventions20260913";
import { EVIDENCE_INTERVENTIONS_2026_09_14 } from "./evidenceInterventions20260914";
import { EVIDENCE_INTERVENTIONS_2026_09_14_EUROPE } from "./evidenceInterventions20260914Europe";
import { EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT } from "./evidenceInterventions20260914Supplement";
import { EVIDENCE_INTERVENTIONS_2026_09_15 } from "./evidenceInterventions20260915";
import { EVIDENCE_INTERVENTIONS_2026_09_16 } from "./evidenceInterventions20260916";
import { EVIDENCE_INTERVENTIONS_2026_09_17 } from "./evidenceInterventions20260917";
import { EVIDENCE_INTERVENTIONS_2026_09_18 } from "./evidenceInterventions20260918";
import { EVIDENCE_INTERVENTIONS_2026_09_19 } from "./evidenceInterventions20260919";
import { applyEvidenceInterventionUpdates20260914 } from "./evidenceInterventionUpdates20260914";

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

const EVIDENCE_INTERVENTIONS_BEFORE_2026_09_14_UPDATES: readonly EvidenceIntervention[] = [
  ...BASE_EVIDENCE_INTERVENTIONS,
  ...EVIDENCE_INTERVENTIONS_DAILY,
  ...EVIDENCE_INTERVENTIONS_2026_08_31,
  ...EVIDENCE_INTERVENTIONS_2026_09_01,
  ...EVIDENCE_INTERVENTIONS_2026_09_02,
  ...EVIDENCE_INTERVENTIONS_2026_09_03,
  ...EVIDENCE_INTERVENTIONS_2026_09_04,
  ...EVIDENCE_INTERVENTIONS_2026_09_05,
  ...EVIDENCE_INTERVENTIONS_2026_09_05_SPECIAL,
  ...EVIDENCE_INTERVENTIONS_2026_09_06,
  ...EVIDENCE_INTERVENTIONS_2026_09_07,
  ...EVIDENCE_INTERVENTIONS_2026_09_08,
  ...EVIDENCE_INTERVENTIONS_2026_09_09,
  ...EVIDENCE_INTERVENTIONS_2026_09_10,
  ...EVIDENCE_INTERVENTIONS_2026_09_11,
  ...EVIDENCE_INTERVENTIONS_2026_09_12,
  ...EVIDENCE_INTERVENTIONS_2026_09_13,
  ...EVIDENCE_INTERVENTIONS_2026_09_14,
  ...EVIDENCE_INTERVENTIONS_2026_09_14_EUROPE,
  ...EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT,
  ...EVIDENCE_INTERVENTIONS_2026_09_15,
  ...EVIDENCE_INTERVENTIONS_2026_09_16,
  ...EVIDENCE_INTERVENTIONS_2026_09_17,
  ...EVIDENCE_INTERVENTIONS_2026_09_18,
  ...EVIDENCE_INTERVENTIONS_2026_09_19,
];

export const EVIDENCE_INTERVENTIONS: readonly EvidenceIntervention[] =
  EVIDENCE_INTERVENTIONS_BEFORE_2026_09_14_UPDATES.map(applyEvidenceInterventionUpdates20260914);

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
