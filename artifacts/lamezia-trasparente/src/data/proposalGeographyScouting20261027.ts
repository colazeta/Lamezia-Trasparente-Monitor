import type { ProposalGeography } from "./proposalGeographyCore";

/** Citywide finance and municipal staff proposal: no coordinates by design. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261027: Record<string, ProposalGeography> = {
  "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026": {
    label: "Intero territorio comunale di Lamezia Terme",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note:
      "La proposta riguarda la gestione delle risorse dell'Amministrazione comunale e i servizi rivolti alla comunità. Fonte: City One, 26 ottobre 2026. Nessun punto geografico attribuito; citywide non è georeferenziato.",
  },
  "via-della-vittoria-manutenzione-deflusso-cristiano-villella-2026": {
    label: "Via della Vittoria, Nicastro, Lamezia Terme",
    scope: "area",
    areas: ["nicastro"],
    points: [],
    note:
      "La fonte originale City One del 26 ottobre 2026 identifica via della Vittoria nel centro di Nicastro, ma non documenta l'estensione precisa del tratto, l'ubicazione del canale o coordinate WGS84. Tag territoriale Nicastro normalizzato, senza georeferenziazione puntuale.",
  },
};
