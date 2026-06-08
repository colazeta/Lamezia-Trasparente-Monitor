export type SourcePriority = "critical" | "high" | "medium" | "low";
export type SourceKind =
  | "crawl"
  | "mapping"
  | "enrichment"
  | "geocoding"
  | "ai";

export type MonitoredSource = {
  source: string;
  label: string;
  url?: string;
  kind: SourceKind;
  priority: SourcePriority;
  expectedCadenceMinutes: number;
  staleAfterMinutes: number;
  completenessRule: string;
  requiredSignals?: string[];
};

export const MONITORED_SOURCES = [
  {
    source: "albo-lamezia",
    label: "Albo Pretorio – Amministrazione Trasparente",
    url: "https://albo.tinnvision.cloud/export/xml?wich=&ente=00301390795",
    kind: "crawl",
    priority: "critical",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 240,
    completenessRule:
      "Controllo operativo sul feed XML e sul numero di pubblicazioni lette; non misura la completezza assoluta degli atti pubblici.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "albo-attachments",
    label: "Arricchimento allegati Albo",
    kind: "enrichment",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 360,
    completenessRule:
      "Verifica che il passaggio di arricchimento allegati venga eseguito e produca segnali tecnici quando disponibili.",
  },
  {
    source: "document-markdown",
    label: "Estrazione markdown documenti",
    kind: "enrichment",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 360,
    completenessRule:
      "Verifica operativa dell'estrazione testo dai documenti già acquisiti, senza assumere copertura totale dei contenuti.",
  },
  {
    source: "attuazione-pnrr-lamezia",
    label: "Attuazione PNRR – Comune di Lamezia Terme",
    kind: "crawl",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 360,
    completenessRule:
      "Controllo tecnico sulla fonte comunale PNRR censita dal monitoraggio.",
  },
  {
    source: "italiadomani-pnrr-lamezia",
    label: "Censimento PNRR – Italia Domani",
    kind: "crawl",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 360,
    completenessRule:
      "Controllo operativo su Italia Domani/OpenPNRR per il perimetro comunale, con limiti della fonte esplicitati dallo stato runtime.",
  },
  {
    source: "anac-contratti-lamezia",
    label: "Contratti pubblici ANAC – Comune di Lamezia Terme",
    url: "https://dati.anticorruzione.it/superset/dashboard/appalti/",
    kind: "crawl",
    priority: "critical",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 360,
    completenessRule:
      "Controllo tecnico sul feed contratti e sui record letti; non sostituisce verifiche ufficiali sulla completezza amministrativa.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "anac-contracts-geocoding",
    label: "Geocoding contratti",
    kind: "geocoding",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica che il passaggio di geocoding dei contratti venga eseguito e segnali eventuali errori tecnici.",
  },
  {
    source: "opendata-lamezia",
    label: "Open data comunali",
    kind: "crawl",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Controllo operativo sui dataset open data rilevati dalla fonte configurata.",
  },
  {
    source: "performance:istat-popolazione",
    label: "Performance indicators – ISTAT popolazione",
    kind: "crawl",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Controllo tecnico sulla serie automatica usata dagli indicatori di performance.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "organi-sedute",
    label: "Organi e sedute",
    kind: "mapping",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica operativa del sync di organi/sedute basato sui dati disponibili nel sistema.",
  },
  {
    source: "fundamental-acts",
    label: "Atti fondamentali",
    kind: "mapping",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica del refresh dei suggerimenti di collegamento agli atti fondamentali.",
  },
  {
    source: "bandi",
    label: "Bandi e opportunità",
    kind: "mapping",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica del refresh dei candidati e dei riscontri sui bandi, senza claim di completezza sostantiva.",
  },
  {
    source: "anbsc-beni-confiscati-lamezia",
    label: "Beni confiscati – Open Data ANBSC",
    url: "https://www.anbsc.it/opendata/beni-immobili-destinati.csv",
    kind: "crawl",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Controllo operativo sul dataset ANBSC filtrato per territorio, con limiti della fonte nazionale.",
  },
  {
    source: "anbsc-beni-confiscati-geocoding",
    label: "Geocoding beni confiscati",
    kind: "geocoding",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica che il passaggio di geocoding dei beni confiscati venga eseguito e segnali eventuali errori tecnici.",
  },
  {
    source: "theme-counters",
    label: "Riconciliazione counter temi",
    kind: "mapping",
    priority: "low",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica tecnica della riconciliazione dei contatori tematici derivati.",
  },
  {
    source: "brief-generation",
    label: "Generazione brief AI",
    kind: "ai",
    priority: "low",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica operativa della generazione di sintesi automatiche, distinta dalla copertura degli atti.",
  },
] as const satisfies readonly MonitoredSource[];

export type MonitoredSourceId = (typeof MONITORED_SOURCES)[number]["source"];

export const MONITORED_SOURCE_BY_ID: ReadonlyMap<string, MonitoredSource> =
  new Map(MONITORED_SOURCES.map((source) => [source.source, source]));
