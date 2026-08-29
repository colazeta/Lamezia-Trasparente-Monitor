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

export const SCOUTED_PROPOSAL_GEOGRAPHY: Record<string, ProposalGeography> = {
  "emodinamica-h24-vescio-2026": GIOVANNI_PAOLO_II,
  "emodinamica-h24-nucifero-2026": GIOVANNI_PAOLO_II,
};
