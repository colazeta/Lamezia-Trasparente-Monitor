import type { ProposalGeography } from "./proposalGeographyCore";

/** Riferimento alla via, non a coordinate o confini di quartiere non verificati. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261108_B: Record<string, ProposalGeography> = {
  "via-guido-dorso-ripristino-cristiano-villella-2026": {
    label: "Via Guido Dorso, Lamezia Terme — carreggiata segnalata",
    scope: "area",
    areas: ["intera_citta"],
    points: [],
    note:
      "La nota del 7 novembre 2026 indica via Guido Dorso e l'area chiamata Lamezia Est: https://www.lametino.it/ultime/lamezia-via-guido-dorso-ridotta-a-un-colabrodo-consiglieri-cristiano-e-villella-presentano-interrogazione.html . Non fornisce un tratto univoco georeferenziabile, coordinate né perimetro ufficiale di quartiere. Il tag intera_citta è soltanto un fallback di filtro, non equivale a scope citywide: oggetto localizzato su una strada, senza coordinate WGS84.",
  },
};
