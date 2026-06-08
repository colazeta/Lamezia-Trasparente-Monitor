export type SourceHealthStatus = "ok" | "warning" | "stale" | "error" | "missing";
export type SourceHealthType = "crawl" | "mapping" | "enrichment" | "geocoding" | "ai";
export type SourceHealthPriority = "alta" | "media" | "bassa";

export type SourceHealthItem = {
  id: string;
  name: string;
  sourceType: SourceHealthType;
  priority: SourceHealthPriority;
  status: SourceHealthStatus;
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
  coverageScore: number;
  freshnessScore: number;
  cautionNote: string;
};

export type SourceHealthPayload = {
  generatedAt: string;
  coverageScore: number;
  freshnessScore: number;
  sources: SourceHealthItem[];
  methodologyNote: string;
};

export const SOURCE_STATUS_LABELS: Record<SourceHealthStatus, string> = {
  ok: "Fonte aggiornata all'ultimo controllo",
  warning: "Verifica tecnica consigliata",
  stale: "Fonte non aggiornata entro la soglia attesa",
  error: "Controllo tecnico non riuscito",
  missing: "Fonte censita ma non ancora tracciata nel runtime",
};

export const SOURCE_TYPE_LABELS: Record<SourceHealthType, string> = {
  crawl: "Crawl",
  mapping: "Mapping",
  enrichment: "Arricchimento",
  geocoding: "Geocoding",
  ai: "AI assistita",
};

export const SOURCE_PRIORITY_LABELS: Record<SourceHealthPriority, string> = {
  alta: "Alta",
  media: "Media",
  bassa: "Bassa",
};

/**
 * Mock tipizzato compatibile con il futuro payload pubblico di GET /healthz/sources.
 * Quando la issue 121 renderà disponibile l'endpoint, questa costante potrà essere sostituita
 * da una chiamata API mantenendo invariata la struttura usata dalla pagina.
 */
export const MOCK_SOURCE_HEALTH: SourceHealthPayload = {
  generatedAt: "2026-06-08T08:30:00.000Z",
  coverageScore: 74,
  freshnessScore: 68,
  methodologyNote:
    "Il monitoraggio misura la copertura operativa delle fonti censite e la freschezza dei controlli tecnici. Non misura la completezza assoluta degli atti pubblici e non sostituisce la verifica sui documenti originali.",
  sources: [
    {
      id: "albo-pretorio-crawl",
      name: "Albo pretorio — elenco pubblicazioni",
      sourceType: "crawl",
      priority: "alta",
      status: "ok",
      lastCheckedAt: "2026-06-08T07:45:00.000Z",
      lastUpdatedAt: "2026-06-08T06:20:00.000Z",
      coverageScore: 92,
      freshnessScore: 88,
      cautionNote:
        "La disponibilità degli allegati e dei metadati può variare per singola pubblicazione; ogni scheda va verificata sulla fonte ufficiale.",
    },
    {
      id: "opendata-feed",
      name: "Catalogo open data comunale",
      sourceType: "mapping",
      priority: "alta",
      status: "warning",
      lastCheckedAt: "2026-06-08T07:20:00.000Z",
      lastUpdatedAt: "2026-06-05T16:10:00.000Z",
      coverageScore: 78,
      freshnessScore: 64,
      cautionNote:
        "Alcune risorse dichiarate nel catalogo possono avere frequenze diverse o metadati non uniformi; il controllo segnala solo esigenze di verifica.",
    },
    {
      id: "bandi-avvisi-crawl",
      name: "Bandi e avvisi pubblici",
      sourceType: "crawl",
      priority: "media",
      status: "stale",
      lastCheckedAt: "2026-06-07T18:30:00.000Z",
      lastUpdatedAt: "2026-05-29T09:00:00.000Z",
      coverageScore: 61,
      freshnessScore: 42,
      cautionNote:
        "L'assenza di novità nel controllo automatico non equivale ad assenza di atti: richiede confronto con la sezione istituzionale aggiornata.",
    },
    {
      id: "beni-confiscati-geocoding",
      name: "Beni confiscati — qualità localizzazioni",
      sourceType: "geocoding",
      priority: "media",
      status: "ok",
      lastCheckedAt: "2026-06-08T06:10:00.000Z",
      lastUpdatedAt: "2026-06-02T14:30:00.000Z",
      coverageScore: 83,
      freshnessScore: 77,
      cautionNote:
        "Le coordinate sono arricchimenti tecnici e possono essere approssimative; stato e destinazione richiedono sempre fonte documentale.",
    },
    {
      id: "atti-fondamentali-enrichment",
      name: "Atti fondamentali — normalizzazione documenti",
      sourceType: "enrichment",
      priority: "alta",
      status: "error",
      lastCheckedAt: "2026-06-08T05:40:00.000Z",
      lastUpdatedAt: "2026-06-01T11:50:00.000Z",
      coverageScore: 56,
      freshnessScore: 38,
      cautionNote:
        "Il controllo tecnico non riuscito riguarda il processo di arricchimento interno; non consente conclusioni sulla pubblicazione istituzionale.",
    },
    {
      id: "ai-briefs-source-audit",
      name: "Sintesi AI — tracciabilità fonti",
      sourceType: "ai",
      priority: "bassa",
      status: "missing",
      lastCheckedAt: null,
      lastUpdatedAt: null,
      coverageScore: 0,
      freshnessScore: 0,
      cautionNote:
        "La fonte è censita per audit futuro ma non è ancora collegata al runtime pubblico; eventuali sintesi restano da trattare come supporto redazionale verificabile.",
    },
  ],
};
