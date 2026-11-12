import type { ProposalGeography } from "./proposalGeographyCore";

/** Nessuna area puntuale accertata: citywide non georeferenziato. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261112: Record<string, ProposalGeography> = {
  "nuovo-cimitero-monumentale-studio-de-biase-2026": {
    label: "Intero territorio comunale; nuovo cimitero senza area individuata",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note: "La parte sud è soltanto una possibile localizzazione indicata dal promotore da comparare con altre. Nessun sito o perimetro ufficiale è accertato; citywide senza coordinate WGS84.",
  },
  "microforesta-urbana-lamezia-respira-vescio-scaramuzzino-2026": {
    label: "Spazi pubblici cittadini candidabili a microforesta, ancora da individuare",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note: "La proposta prevede una ricognizione, non nomina un'area selezionata. Indicazioni su quartieri poco alberati non consentono geocodifica. Citywide senza coordinate WGS84.",
  },
  "reu-verifica-adeguamento-v-commissione-vescio-2026": {
    label: "Regolamento edilizio urbanistico con possibile applicazione nell'intero Comune",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note: "L'oggetto è un regolamento comunale, non un intervento in un luogo fisico puntuale: nessuna coordinata WGS84 attribuita.",
  },
};
