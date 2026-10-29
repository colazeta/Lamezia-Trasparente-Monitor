import type { ProposalGeography } from "./proposalGeographyCore";

/**
 * Cafaldo: perimetro di quartiere non georeferenziato.
 * Ospedale: WGS84 già documentate nel repository tramite DGR Calabria 720/2023.
 */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261029: Record<string, ProposalGeography> = {
  "cafaldo-rifacimento-strade-cristiano-villella-2026": {
    label: "Rione Cafaldo — sei vie del quartiere di Sambiase",
    scope: "area",
    areas: ["sambiase"],
    points: [],
    note:
      "Il Lametino del 28 ottobre 2026 identifica espressamente il rione Cafaldo a Sambiase e le sei vie interessate. Non sono state individuate coordinate verificabili del perimetro o dei tratti stradali oggetto della richiesta: nessun punto WGS84 è inferito.",
  },
  "polo-oncologico-regionale-lamezia-natrella-2026": {
    label: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    scope: "point",
    areas: ["sambiase"],
    points: [
      {
        id: "ospedale-giovanni-paolo-ii-polo-oncologico",
        label: "Presidio ospedaliero Giovanni Paolo II, via Senatore Arturo Perugini",
        latitude: 38.9583756,
        longitude: 16.3001498,
        area: "sambiase",
        precision: "exact_landmark",
        sourceLabel: "Regione Calabria — DGR 720/2023, tabella delle strutture ospedaliere",
        sourceUrl: "https://www.regione.calabria.it/wp-content/uploads/2023/12/dgr--720----del-15.12.2023-_.pdf",
      },
    ],
    note:
      "Coordinate WGS84 già documentate per lo stesso presidio nel registro geografico del progetto. Il punto rappresenta l'ospedale, non la sede di un Polo Oncologico istituito: la proposta non implica alcuna localizzazione di nuovi reparti.",
  },
};
