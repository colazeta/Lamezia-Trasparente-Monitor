import type { ProposalGeography } from "./proposalGeographyCore";

/** Ambiti locali normalizzati, senza coordinate non documentate. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261119: Record<string, ProposalGeography> = {
  "porto-turistico-marinella-cafarone-ginepri-cristiano-villella-2026": {
    "label": "Fascia costiera tra Marinella, Cafarone e Ginepri",
    "scope": "area",
    "areas": [
      "costa"
    ],
    "points": [],
    "note": "Il tratto proposto è un ambito indicativo, non un sito autorizzato o delimitato da un progetto. Non sono stati verificati perimetro né coordinate WGS84, pertanto nessun punto o centroide artificiale."
  },
  "torrente-canne-rifiuti-via-emilio-la-scala-cittadini-2026": {
    "label": "Via Emilio La Scala e prossimità del torrente Canne",
    "scope": "area",
    "areas": [
      "nicastro"
    ],
    "points": [],
    "note": "La fonte identifica la strada e il torrente, non il segmento univoco dei rifiuti segnalati. Il tag Nicastro serve soltanto all'indicizzazione territoriale approssimata e non costituisce perimetro ufficiale; nessuna coordinata WGS84 di deposito o alveo è verificata, nessun punto o centroide creato."
  }
};
