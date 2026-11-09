import type { ProposalGeography } from "./proposalGeographyCore";

/** Ubicazione nominativa senza coordinate o perimetri non verificati. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261109: Record<string, ProposalGeography> = {
  "infermieristica-sede-ospedale-parco-agricolo-2026": {
    label: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    scope: "area",
    areas: ["intera_citta"],
    points: [],
    note:
      "Il presidio ospedaliero è indicato quale sede proposta nella nota di Piero Renda: https://cityonelamezia.it/2026/11/06/corso-di-laurea-in-infermieristica-la-sede-ideale-e-lospedale-giovanni-paolo-ii-renda/ . Il tag intera_citta consente il filtro generale ma non indica scope citywide; la proposta riguarda l'edificio ospedaliero. In assenza di una fonte cartografica verificata per l'ingresso o per il perimetro specifico, non si attribuiscono coordinate WGS84 né precisione fittizia.",
  },
};
