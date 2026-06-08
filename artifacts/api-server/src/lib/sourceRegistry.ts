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

export const MONITORED_SOURCES: readonly MonitoredSource[] = [
  {
    source: "albo-lamezia",
    label: "Albo Pretorio – Amministrazione Trasparente",
    url: "https://albo.tinnvision.cloud/export/xml?wich=&ente=00301390795",
    kind: "crawl",
    priority: "critical",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 360,
    completenessRule:
      "Verifica tecnica del feed Albo: ultimo controllo, presenza di record letti e nuovi inserimenti quando disponibili.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "albo-attachments-enrichment",
    label: "Arricchimento allegati Albo",
    kind: "enrichment",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica operativa del passaggio di arricchimento allegati, senza stimare la completezza sostantiva dei documenti.",
  },
  {
    source: "document-markdown-extraction",
    label: "Estrazione markdown documenti",
    kind: "enrichment",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica operativa dell'estrazione testo per i documenti disponibili nel monitoraggio.",
  },
  {
    source: "attuazione-pnrr-lamezia",
    label: "Attuazione PNRR – Comune di Lamezia Terme",
    kind: "crawl",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica tecnica dei progetti PNRR pubblicati nella fonte monitorata e dei record elaborati.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "italiadomani-pnrr-lamezia",
    label: "Italia Domani – PNRR Lamezia Terme",
    kind: "crawl",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica tecnica dell'ultima lettura Italia Domani per il territorio monitorato.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "anac-contratti-lamezia",
    label: "Contratti pubblici ANAC – Lamezia Terme",
    kind: "crawl",
    priority: "high",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 720,
    completenessRule:
      "Verifica tecnica dei contratti ANAC acquisiti per la fonte configurata.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "anac-contracts-geocoding",
    label: "Geocoding contratti ANAC",
    kind: "geocoding",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica operativa del passaggio di geocodifica per contratti con informazioni territoriali utilizzabili.",
  },
  {
    source: "opendata-lamezia",
    label: "Open data comunale",
    kind: "crawl",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica tecnica dei dataset open data letti dalla fonte configurata.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "performance:istat-popolazione",
    label: "Performance indicators – ISTAT popolazione",
    kind: "crawl",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica tecnica della serie automatica usata per indicatori di performance.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "organi-sedute-sync",
    label: "Organi e sedute",
    kind: "mapping",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica operativa del sync organi/sedute basato sui dati già disponibili nel progetto.",
  },
  {
    source: "fundamental-acts-suggestions",
    label: "Atti fondamentali – suggerimenti",
    kind: "mapping",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica operativa del mapping verso atti fondamentali, con esito tecnico del passaggio.",
  },
  {
    source: "bandi-suggestions",
    label: "Bandi – suggerimenti",
    kind: "mapping",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica operativa del mapping bandi, senza qualificare l'assenza di risultati come incompletezza sostantiva.",
  },
  {
    source: "anbsc-beni-confiscati-lamezia",
    label: "Beni confiscati – Open Data ANBSC",
    url: "https://www.anbsc.it/opendata/beni-immobili-destinati.csv",
    kind: "crawl",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica tecnica dei record ANBSC letti e filtrati per il territorio configurato.",
    requiredSignals: ["itemsTotal"],
  },
  {
    source: "confiscated-assets-geocoding",
    label: "Geocoding beni confiscati",
    kind: "geocoding",
    priority: "medium",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica operativa della geocodifica beni confiscati quando sono disponibili dati territoriali sufficienti.",
  },
  {
    source: "theme-counters-reconciliation",
    label: "Riconciliazione contatori temi",
    kind: "mapping",
    priority: "low",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica operativa della riconciliazione dei contatori tematici derivati da dati interni.",
  },
  {
    source: "ai-brief-generation",
    label: "Generazione brief AI",
    kind: "ai",
    priority: "low",
    expectedCadenceMinutes: 180,
    staleAfterMinutes: 1440,
    completenessRule:
      "Verifica operativa della generazione sintesi, distinta dalla qualità o completezza sostantiva dei contenuti.",
  },
] as const;

const REGISTRY_BY_SOURCE = new Map(
  MONITORED_SOURCES.map((entry) => [entry.source, entry]),
);

export function getMonitoredSource(
  source: string,
): MonitoredSource | undefined {
  return REGISTRY_BY_SOURCE.get(source);
}
