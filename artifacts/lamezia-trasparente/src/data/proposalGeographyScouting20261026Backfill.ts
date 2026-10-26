import type { ProposalGeography } from "./proposalGeographyCore";

/** Areas only; no coordinate is inferred from named streets or the citywide plan. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261026_BACKFILL: Record<string, ProposalGeography> = {
  "piano-comunale-amianto-m5s-lamezia-2026": {
    label: "Intero territorio comunale di Lamezia Terme",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "Il comunicato del Gruppo territoriale M5S riguarda l'intero Comune; non identifica manufatti accertati o ubicazioni puntuali. Fonte: il Lametino, 13 ottobre 2026. Citywide non è georeferenziato.",
  },
  "controlli-velocita-bizantini-savutano-branca-2026": {
    label: "Via dei Bizantini e via Savutano, Lamezia Terme",
    scope: "area",
    areas: ["sambiase"],
    points: [],
    note:
      "Le due strade sono identificate nella nota del consigliere pubblicata da City One il 16 ottobre 2026; il tag Sambiase è usato come area territoriale del sistema, senza pretendere una delimitazione esatta. Coordinate WGS84 e tratti puntuali non verificati, quindi nessuna georeferenziazione.",
  },
};
