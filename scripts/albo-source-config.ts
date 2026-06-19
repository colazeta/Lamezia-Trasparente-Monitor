export const ALBO_PRETORIO_LAMEZIA_SOURCE = {
  id: "albo-pretorio-lamezia-tinnvision",
  source: "Albo Pretorio Comune di Lamezia Terme",
  provider: "Tinnvision",
  ente: "00301390795",
  sourceUrl: "https://albo.tinnvision.cloud/?ente=00301390795",
  municipalLandingUrl: "https://www.comune.lamezia-terme.cz.it/",
  exportUrls: {
    xml: "https://albo.tinnvision.cloud/export/xml?wich=&ente=00301390795",
    csv: "https://albo.tinnvision.cloud/export/csv?wich=&ente=00301390795",
    print: "https://albo.tinnvision.cloud/export/print?wich=&ente=00301390795",
    html: "https://albo.tinnvision.cloud/?ente=00301390795",
  },
  knownLimits: [
    "Tranche A acquisisce l'elenco degli atti correnti esposto dalla fonte ufficiale, senza dichiarare completezza storica.",
    "Gli allegati e i PDF non sono scaricati o analizzati in Tranche A.",
    "Gli export Tinnvision possono non includere URL diretti agli allegati; il record pubblico rimanda alla fonte ufficiale.",
    "La classificazione privacy e' prudenziale e automatica; i casi sensibili richiedono revisione umana prima di esposizioni piu' ricche.",
  ],
} as const;

export type AlboPretorioLameziaSource = typeof ALBO_PRETORIO_LAMEZIA_SOURCE;
