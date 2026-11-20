import type { ProposalGeography } from "./proposalGeographyCore";

/** Area aeroportuale nominata, senza riferimenti puntuali alla misura tariffaria. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261120_NUCIFERO: Record<string, ProposalGeography> = {
  "aeroporto-caro-voli-accordi-nucifero-2026": {
    label: "Sistema aeroportuale calabrese, con riferimento allo scalo di Lamezia Terme",
    scope: "area",
    areas: ["sant_eufemia"],
    points: [],
    note: "La proposta cita espressamente lo scalo di Lamezia Terme a Sant'Eufemia, oltre agli altri aeroporti calabresi. Il tag Sant'Eufemia localizza il riferimento lametino, non delimita la portata regionale dell'iniziativa. Nessun punto WGS84 è attribuito a una misura tariffaria diffusa e non localizzabile.",
  },
};
