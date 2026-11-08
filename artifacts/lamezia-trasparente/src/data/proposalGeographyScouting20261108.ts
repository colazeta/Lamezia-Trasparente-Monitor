import type { ProposalGeography } from "./proposalGeographyCore";

/** Plessi non identificati individualmente: nessuna coordinata presunta. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261108: Record<string, ProposalGeography> = {
  "scuola-perri-pitagora-don-milani-orario-sei-giorni-di-spena-2026": {
    label: "Plessi dell'Istituto Comprensivo Perri Pitagora Don Milani, Lamezia Terme",
    scope: "area",
    areas: ["intera_citta"],
    points: [],
    note:
      "La richiesta riguarda l'organizzazione delle lezioni per le classi interessate dell'istituto, non un unico edificio geograficamente identificato. Fonte: https://www.change.org/p/ripristino-dell-orario-scolastico-8-15-13-15-all-i-c-perri-pitagora-don-milani . Lo scope area con tag intera_citta indica localizzazione interna al Comune non precisata per singolo plesso e non equivale allo scope citywide; nessun punto o centroide WGS84 attribuito.",
  },
};
