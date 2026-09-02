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
  points: [],
  note:
    "Ambito cittadino non georeferenziato: la proposta riguarda genericamente l’intero territorio comunale e non riceve coordinate artificiali.",
};

const AEROPORTO_LAMEZIA: ProposalGeography = {
  label: "Aeroporto Internazionale di Lamezia Terme, Sant’Eufemia",
  scope: "area",
  areas: ["sant_eufemia"],
  points: [
    {
      id: "aeroporto-lamezia-enac",
      label: "Aeroporto Internazionale di Lamezia Terme — riferimento aeroportuale ENAC",
      latitude: 38.9083333,
      longitude: 16.2416667,
      area: "sant_eufemia",
      precision: "area_centroid",
      sourceLabel: "ENAC — scheda Aeroporto Lamezia Terme, coordinate geografiche",
      sourceUrl:
        "https://www.enac.gov.it/app/uploads/2024/04/96-103_lamezia.pdf",
    },
  ],
  note:
    "Le coordinate ENAC identificano il riferimento geografico del sedime aeroportuale e non un terminale o un singolo manufatto. Per questo il punto è qualificato come rappresentativo dell'area aeroportuale. Le misure proposte includono anche connessioni ferroviarie e territoriali di scala regionale.",
};

export const SCOUTED_PROPOSAL_GEOGRAPHY: Record<string, ProposalGeography> = {
  "emodinamica-h24-vescio-2026": GIOVANNI_PAOLO_II,
  "emodinamica-h24-nucifero-2026": GIOVANNI_PAOLO_II,
  "scuole-orario-ridotto-caldo-settembre-2026": LAMEZIA_CITYWIDE,
  "tutela-animali-regolamento-garante-sportello-2026": LAMEZIA_CITYWIDE,
  "scuole-posticipo-apertura-petizione-2026": LAMEZIA_CITYWIDE,
  "ospedale-organici-continuita-chirurgica-pd-2026": GIOVANNI_PAOLO_II,
  "prevenzione-maltempo-manutenzione-de-sensi-2026": LAMEZIA_CITYWIDE,
  "aeroporto-intermodalita-rilancio-taverna-2026": AEROPORTO_LAMEZIA,
};
