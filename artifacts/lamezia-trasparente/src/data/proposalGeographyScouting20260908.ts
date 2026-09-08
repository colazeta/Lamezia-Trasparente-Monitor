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

const PARCO_VIA_DEGLI_ITALI: ProposalGeography = {
  label: "Parco giochi di via degli Itali, Capizzaglie",
  scope: "area",
  areas: ["nicastro", "sambiase"],
  points: [
    {
      id: "via-degli-itali-capizzaglie-riferimento",
      label: "Via degli Itali, Capizzaglie — punto stradale rappresentativo",
      latitude: 38.948849,
      longitude: 16.3055,
      area: "sambiase",
      precision: "street_approximate",
      sourceLabel: "ItaliaMappe — Via degli Itali, Lamezia Terme",
      sourceUrl: "https://www.italiamappe.it/stradario/lamezia-terme/via-degli-itali/",
    },
  ],
  note:
    "La fonte della proposta identifica il parco nel quartiere Capizzaglie, ma non fornisce coordinate del manufatto. Il punto WGS84 è quindi un riferimento verificabile della via e non la posizione esatta del parco. Capizzaglie appartiene al tessuto urbano interposto tra Nicastro e Sambiase: i due tag sono mantenuti come macro-aree di filtro senza attribuire al quartiere un confine amministrativo non verificato.",
};

export const SCOUTED_PROPOSAL_GEOGRAPHY_20260908: Record<
  string,
  ProposalGeography
> = {
  "emodinamica-h24-reclutamento-muraca-2026": GIOVANNI_PAOLO_II,
  "parco-via-degli-itali-manutenzione-branca-2026": PARCO_VIA_DEGLI_ITALI,
};
