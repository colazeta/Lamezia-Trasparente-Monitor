import type { ProposalGeography } from "./proposalGeographyCore";

/** Nessuna coordinata artificiale o inferred school site location. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261105_BACKFILL: Record<string, ProposalGeography> = {
  "turismo-imposta-soggiorno-trasparenza-acu-calabria-2026": {
    label: "Politica di accoglienza e tributi — intero territorio comunale di Lamezia Terme",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note: "Ambito comunale generale; il documento riguarda un'imposta eventuale e il confronto pubblico, non un luogo puntuale. Nessuna coordinata WGS84.",
  },
  "tutela-cane-kira-progetto-gestione-controllata-solla-2026": {
    label: "Lamezia Terme — luogo di provenienza di Kira non precisato",
    scope: "area",
    areas: ["intera_citta"],
    points: [],
    note: "La petizione indica il Comune di Lamezia Terme ma non identifica l'ubicazione del precedente territorio del cane. La località non è georeferenziabile; il tag comunale è un riferimento amministrativo generale, non un punto WGS84 e non implica che il rientro riguardi l'intera città.",
  },
  "scuola-perri-pitagora-orario-sei-giorni-di-spena-2026": {
    label: "Plessi scolastici dell'I.C. Perri Pitagora Don Milani a Lamezia Terme",
    scope: "area",
    areas: ["intera_citta"],
    points: [],
    note: "La petizione identifica l'istituto, non i singoli plessi o le classi interessate. L'area è localizzata genericamente nel Comune di Lamezia Terme; il tag intera_citta non rende il perimetro citywide. Non sono assegnati punti o coordinate WGS84. Fonte istituzionale: https://icperripitagoradonmilani.edu.it/orari-di-funzionamento-plessi-scolastici/",
  },
};
