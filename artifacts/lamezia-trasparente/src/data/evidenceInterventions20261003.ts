import type { EvidenceIntervention } from "./evidenceInterventions";
import { EVIDENCE_2026_10_03_WATER } from "./evidenceInterventions20261003Water";

export const EVIDENCE_INTERVENTIONS_2026_10_03 = [
  ...EVIDENCE_2026_10_03_WATER,
] as const satisfies readonly EvidenceIntervention[];
