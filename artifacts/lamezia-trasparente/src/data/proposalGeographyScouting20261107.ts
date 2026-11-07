import type { ProposalGeography } from "./proposalGeographyCore";

/** Geografia normalizzata: nessuna coordinata priva di fonte WGS84 puntuale. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261107: Record<string, ProposalGeography> = {
  "cimitero-nicastro-loculi-verifiche-familiari-2026": {
    label: "Un'ala non individuata del cimitero di Nicastro",
    scope: "area",
    areas: ["nicastro"],
    points: [],
    note:
      "La segnalazione del 6 novembre 2026 indica un'ala del cimitero di Nicastro senza localizzarne gli elementi: https://www.lametino.it/ultimora/lamezia-infiltrazioni-e-cedimenti-al-cimitero-lallarme-dei-familiari-dei-defunti.html . Lo scope area e il tag Nicastro non equivalgono a georeferenziazione di loculi: nessuna coordinata WGS84 attribuita.",
  },
  "decentramento-tre-municipi-casa-di-vetro-2026": {
    label: "Proposta di decentramento su Nicastro, Sambiase e Sant'Eufemia — intero Comune",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "La proposta del 14 giugno 2026 riguarda l'assetto istituzionale dell'intero Comune e le sue tre componenti storiche: https://www.corrieredilamezia.it/attualita/2026_06_14/lamezia-la-casa-di-vetro-propone-di-istituire-tre-municipi-territoriali_63734/ . Citywide significa ambito comunale non georeferenziato, senza coordinate.",
  },
  "regolamento-cerimoniale-casa-di-vetro-2026": {
    label: "Cerimoniale istituzionale — intero territorio comunale",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "Il Regolamento Cerimoniale richiesto il 18 luglio riguarda l'Amministrazione comunale senza luoghi specifici: https://www.lametino.it/ultime/lamezia-ruberto-la-casa-di-vetro-la-citta-merita-un-regolamento-cerimoniale.html . Nessuna coordinata WGS84.",
  },
};
