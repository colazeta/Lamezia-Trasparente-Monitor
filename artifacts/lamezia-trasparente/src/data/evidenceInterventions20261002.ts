import type { EvidenceIntervention } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_10_02_GENEVA } from "./evidenceInterventions20261002Geneva";
import { EVIDENCE_INTERVENTIONS_2026_10_02_BID } from "./evidenceInterventions20261002Bid";
import { EVIDENCE_INTERVENTIONS_2026_10_02_AYRSHIRE } from "./evidenceInterventions20261002Ayrshire";

export const EVIDENCE_INTERVENTIONS_2026_10_02 = [
  ...EVIDENCE_INTERVENTIONS_2026_10_02_GENEVA,
  ...EVIDENCE_INTERVENTIONS_2026_10_02_BID,
  ...EVIDENCE_INTERVENTIONS_2026_10_02_AYRSHIRE,
] as const satisfies readonly EvidenceIntervention[];
