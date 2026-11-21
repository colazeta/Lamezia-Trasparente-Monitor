import type { ProposalGeography } from "./proposalGeographyCore";

/** La richiesta copre tutti i nuclei cittadini, senza punti WGS84 verificati. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261121_MURACA: Record<string, ProposalGeography> = {
  "natale-2026-eventi-sambiase-isa-muraca": {
    label: "Sant'Eufemia, Nicastro e Sambiase (Piazza 5 Dicembre a Sambiase)",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note: "Il comunicato originale del 20 novembre 2026 (https://www.lameziaterme.it/natale-lamezia-isa-muraca-festa-per-tutti-anche-sambiase/) propone iniziative nei tre nuclei del comune con un riferimento a Piazza 5 Dicembre. La piazza è indicazione descrittiva e non un evento già localizzato con geometria ufficiale: citywide, nessuna coordinata WGS84.",
  },
};
