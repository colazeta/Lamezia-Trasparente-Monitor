import type { ProposalGeography } from "./proposalGeographyCore";

/** Ambiti documentati; citywide e area senza coordinate arbitrarie. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261118: Record<string, ProposalGeography> = {
  "luminarie-frazioni-contrade-raso-2026": {
    "label": "Frazioni, località e contrade di Lamezia Terme",
    "scope": "citywide",
    "areas": [
      "intera_citta"
    ],
    "points": [],
    "note": "La richiesta è diffusa sull'intero Comune; l'elenco editoriale di contrade non costituisce un set di coordinate WGS84. Citywide rimane non georeferenziata e non riceve punti o centroidi."
  },
  "via-gramsci-palermo-completamento-viario-cristiano-villella-2026": {
    "label": "Area fra via Gramsci e via Palermo, Sambiase",
    "scope": "area",
    "areas": [
      "sambiase"
    ],
    "points": [],
    "note": "La fonte indica le due vie e un tracciato intermedio senza identificazione catastale, segmento stradale univoco o coordinate WGS84 verificate. Nessun punto arbitrario; il tag Sambiase è territoriale e non un perimetro ufficiale del tracciato."
  },
  "coordinamento-sport-impianti-associazioni-2026": {
    "label": "Impianti sportivi pubblici di Lamezia Terme",
    "scope": "citywide",
    "areas": [
      "intera_citta"
    ],
    "points": [],
    "note": "La proposta riguarda l'insieme degli impianti pubblici e delle palestre scolastiche, non un elenco verificato di siti. Scope citywide non georeferenziato: non sono generate coordinate WGS84 per un ambito cittadino."
  },
  "teatro-costabile-cronoprogramma-progetto-civico-2026": {
    "label": "Teatro Politeama Franco Costabile, Sambiase",
    "scope": "area",
    "areas": [
      "sambiase"
    ],
    "points": [],
    "note": "Il teatro è indicato nominalmente, ma non è stata verificata una coordinata WGS84 riferibile in modo affidabile all'immobile. Il tag Sambiase è descrittivo; non è creato un punto con coordinate presunte."
  }
};
