import type { ProposalGeography } from "./proposalGeographyCore";

/** Ambito di area vasta; nessun centroide o luogo puntuale non verificato. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261114: Record<string, ProposalGeography> = {
  "area-urbana-catanzaro-lamezia-governance-giovani-2026": {
  "label": "Area vasta Catanzaro–Lamezia Terme; ambito sovracomunale non perimetrato nella nota",
  "scope": "area",
  "areas": [
    "intera_citta"
  ],
  "points": [],
  "note": "La proposta interessa Lamezia e Catanzaro e ha portata sovracomunale: scope area e nessuna coordinata WGS84. Il tag intera_citta è solo fallback tecnico nel dizionario di macrozone disponibile, non identifica una proposta citywide né delimita l'area vasta. Fonte: comunicato del Movimento Giovanile del 9 novembre 2026."
}
};
