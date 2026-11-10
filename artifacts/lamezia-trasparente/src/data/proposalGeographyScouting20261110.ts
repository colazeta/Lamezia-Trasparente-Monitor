import type { ProposalGeography } from "./proposalGeographyCore";

/** Stesso immobile della proposta Lidia Vescio, identificato nella fonte OSM/Mapcarta. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261110: Record<string, ProposalGeography> = {
  "ex-cinema-grandinetti-gestione-salvatore-vescio-2026": {
    label: "Ex Cinema Grandinetti, via Vittorio Veneto, Sambiase",
    scope: "point",
    areas: ["sambiase"],
    points: [
      {
        id: "ex-cinema-grandinetti",
        label: "Ex Cinema Grandinetti (ex teatro Grandinetti su OSM)",
        latitude: 38.96586,
        longitude: 16.27891,
        area: "sambiase",
        precision: "exact_landmark",
        sourceLabel: "OpenStreetMap / Mapcarta — way 596701561",
        sourceUrl: "https://mapcarta.com/W596701561",
      },
    ],
    note:
      "L'indirizzo dell'immobile e il quartiere risultano dalla nota di Salvatore Vescio: https://www.lametino.it/ultime/lamezia-vescio-passi-avanti-per-restituire-alla-citta-ex-cinema-teatro-grandinetti-di-sambiase.html . Il punto WGS84 e la precisione sono verificati sull'originale OpenStreetMap/Mapcarta https://mapcarta.com/W596701561 ed erano già usati dal record storico sulla bonifica dello stesso ex cinema. È distinto dal Teatro Grandinetti in via Colonnello Cassoli.",
  },
};
