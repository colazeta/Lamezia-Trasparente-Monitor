import type { ProposalGeography } from "./proposalGeographyCore";

/** Source-confirmed geographic scope; no unverified WGS84 points. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261013: Record<
  string,
  ProposalGeography
> = {
  "viabilita-manutenzione-vie-vescio-2026": {
    label: "Viabilità di Sambiase e Nicastro, con criticità segnalate anche a Casturi, Calia, Zangarona e Gabella",
    scope: "area",
    areas: ["sambiase", "nicastro"],
    points: [],
    note: "Sono documentate strade in diverse aree del territorio. Tag territoriali non esaustivi: nessuna coordinata viene attribuita senza verifica cartografica.",
  },
  "regolamento-servizio-taxi-usb-2026": {
    label: "Servizio taxi — intero territorio comunale",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note: "Misura regolamentare generale, senza luogo puntuale o coordinate.",
  },
  "sant-eufemia-studio-autonomia-comunale-2026": {
    label: "Sant'Eufemia Lamezia — territorio oggetto dello studio prospettato",
    scope: "area",
    areas: ["sant_eufemia"],
    points: [],
    note: "Confini dell'eventuale nuovo Comune ancora da studiare: nessun perimetro o punto georeferenziato inferito.",
  },
};
