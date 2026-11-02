import type { ProposalGeography } from "./proposalGeographyCore";

/**
 * Le coordinate del presidio ospedaliero erano già validate nel repository.
 * Per il municipio è noto l'indirizzo ufficiale ma non un punto WGS84 verificato.
 */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261102: Record<string, ProposalGeography> = {
  "ospedale-ascensori-totem-ticket-malati-cronici-2026": {
    label: "Presidio ospedaliero Giovanni Paolo II — Lamezia Terme",
    scope: "point",
    areas: ["sambiase"],
    points: [
      {
        id: "ospedale-giovanni-paolo-ii-servizi-ascensori",
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
      "Coordinate WGS84 dello stesso presidio già documentate in proposalGeographyCore.ts e proposalGeographyScouting20261029.ts. Il punto indica l'ospedale, non il singolo ascensore o il totem: nessun accertamento tecnico sul guasto è implicato.",
  },
  "municipio-ascensore-accessibilita-lamezia-maltrattata-2026": {
    label: "Sede comunale — via Senatore Arturo Perugini 15/c, Lamezia Terme",
    scope: "area",
    areas: ["nicastro"],
    points: [],
    note:
      "La sede è identificata nell'informazione ufficiale del Comune (https://www.comune.lamezia-terme.cz.it/it/vivere/702722); la segnalazione è localizzata nell'edificio, ma non si assegnano coordinate WGS84 perché non verificate. Il riferimento territoriale Nicastro non è un perimetro catastale e non equivale a georeferenziazione.",
  },
};
