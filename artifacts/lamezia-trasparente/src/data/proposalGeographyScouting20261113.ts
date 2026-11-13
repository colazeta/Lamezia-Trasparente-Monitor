import type { ProposalGeography } from "./proposalGeographyCore";

/** Luoghi nominati; WGS84 non inferito, scope area. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261113: Record<string, ProposalGeography> = {
  "capizzaglie-un-passo-oltre-riattivazione-cristiano-villella-2026": {
    "label": "Area dell'ex scuola Barbuto, via Dunant, quartiere Capizzaglie",
    "scope": "area",
    "areas": [
      "intera_citta"
    ],
    "points": [],
    "note": "Area nominata in fonte, senza perimetro o coordinate WGS84 ufficialmente verificate. Il tag intera_citta è solo fallback tecnico del vocabolario macrozone, non significa che l'intervento sia citywide; scope area e geolocalizzazione non disponibile."
  },
  "rambaldi-de-fazio-secondo-accesso-nuovo-cdu-2026": {
    "label": "Polo Tecnologico Professionale Rambaldi-De Fazio; secondo collegamento ancora da individuare",
    "scope": "area",
    "areas": [
      "intera_citta"
    ],
    "points": [],
    "note": "La proposta riguarda un accesso scolastico localizzato, ma non definisce il tracciato. Il tag macroarea resta non specificato nel dizionario LT e usa intera_citta come fallback; scope area senza punto né coordinate WGS84 arbitrarie."
  }
};
