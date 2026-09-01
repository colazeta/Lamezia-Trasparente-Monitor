import type { ProposalGeography } from "./proposalGeographyCore";

const GIOVANNI_PAOLO_II: ProposalGeography = {
  label: "Presidio ospedaliero Giovanni Paolo II",
  scope: "point",
  areas: ["sambiase"],
  points: [
    {
      id: "ospedale-giovanni-paolo-ii",
      label: "Presidio ospedaliero Giovanni Paolo II, via Senatore Arturo Perugini",
      latitude: 38.9583756,
      longitude: 16.3001498,
      area: "sambiase",
      precision: "exact_landmark",
      sourceLabel: "Regione Calabria — DGR 720/2023, tabella delle strutture ospedaliere",
      sourceUrl:
        "https://www.regione.calabria.it/wp-content/uploads/2023/12/dgr--720----del-15.12.2023-_.pdf",
    },
  ],
  note:
    "La coordinata è quella associata al P.O. Giovanni Paolo II nella tabella regionale delle strutture ospedaliere. Il tag Sambiase serve al filtro territoriale dell'archivio e non sostituisce una delimitazione amministrativa di quartiere.",
};

const LAMEZIA_CITYWIDE: ProposalGeography = {
  label: "Intero territorio comunale di Lamezia Terme",
  scope: "citywide",
  areas: ["intera_citta"],
  points: [
    {
      id: "lamezia-city-centroid",
      label: "Lamezia Terme — centroide di visualizzazione",
      latitude: 38.965,
      longitude: 16.31,
      area: "intera_citta",
      precision: "city_centroid",
      sourceLabel: "Centro mappa GIS del progetto",
    },
  ],
  note:
    "La coordinata è esclusivamente un centroide di visualizzazione e indicizzazione: non attribuisce alla proposta un luogo fisico specifico e non viene mostrata come pin locale sulla mappa pubblica.",
};

export const SCOUTED_PROPOSAL_GEOGRAPHY: Record<string, ProposalGeography> = {
  "emodinamica-h24-vescio-2026": GIOVANNI_PAOLO_II,
  "emodinamica-h24-nucifero-2026": GIOVANNI_PAOLO_II,
  "scuole-orario-ridotto-caldo-settembre-2026": LAMEZIA_CITYWIDE,
  "tutela-animali-regolamento-garante-sportello-2026": LAMEZIA_CITYWIDE,
};
