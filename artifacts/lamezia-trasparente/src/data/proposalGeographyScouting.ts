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

const QUARTIERE_BELLA: ProposalGeography = {
  label: "Quartiere Bella, con riferimento a via Lazio",
  scope: "area",
  areas: ["nicastro"],
  points: [
    {
      id: "quartiere-bella-via-lazio",
      label: "Via Lazio, quartiere Bella — punto stradale rappresentativo",
      latitude: 38.97358,
      longitude: 16.30704,
      area: "nicastro",
      precision: "street_approximate",
      sourceLabel: "Impresa Italia — Via Lazio 76, Lamezia Terme",
      sourceUrl:
        "https://www.impresaitalia.info/kk03796787/careri-rosa-angela/lamezia-terme.aspx",
    },
  ],
  note:
    "Il punto è un riferimento verificabile lungo via Lazio, indicata dalla fonte della proposta come principale arteria del quartiere; non delimita il quartiere Bella e non localizza ogni intervento richiesto. Il tag Nicastro è usato come classificazione territoriale del quartiere, distinta dalla precisione della coordinata.",
};

const PALASPARTI: ProposalGeography = {
  label: "Palazzetto dello Sport Alfio Sparti, Sambiase",
  scope: "point",
  areas: ["sambiase"],
  points: [
    {
      id: "palasparti-alfio-sparti",
      label: "Palazzetto dello Sport Alfio Sparti",
      latitude: 38.96492,
      longitude: 16.2959,
      area: "sambiase",
      precision: "exact_landmark",
      sourceLabel: "OpenStreetMap / Mapcarta — Palazzetto dello Sport Alfio Sparti",
      sourceUrl: "https://mapcarta.com/W303144181",
    },
  ],
  note:
    "Il Comune identifica ufficialmente l'impianto all'indirizzo Via Giovanni De Sensi 21. Le coordinate WGS84 corrispondono al poligono OpenStreetMap del Palazzetto dello Sport Alfio Sparti (way 303144181); il tag Sambiase è coerente con la localizzazione territoriale dell'impianto.",
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
  "quartiere-bella-manutenzione-masi-2026": QUARTIERE_BELLA,
  "quartiere-bella-pulizia-mtl-2026": QUARTIERE_BELLA,
  "palasparti-riapertura-manutenzione-mtl-2026": PALASPARTI,
  "fna-disabilita-gravissima-bando-futuro-nazionale-2026": LAMEZIA_CITYWIDE,
  "sanita-pubblica-petizione-presidio-malerba-2026": LAMEZIA_CITYWIDE,
};
