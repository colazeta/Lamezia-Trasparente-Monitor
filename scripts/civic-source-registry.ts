import { ALBO_PRETORIO_LAMEZIA_SOURCE } from "./albo-source-config";

export const CIVIC_SOURCE_TYPES = [
  "institutional_website",
  "albo_pretorio",
  "transparent_administration",
  "pnrr_portal",
  "open_data",
  "participatory_democracy",
  "service_reports",
  "verified_internal_static",
] as const;

export type CivicSourceType = (typeof CIVIC_SOURCE_TYPES)[number];

export const SOURCE_HEALTH_STATUSES = [
  "healthy",
  "degraded",
  "unreachable",
  "empty",
  "not_configured",
  "needs_review",
] as const;

export type SourceHealthStatus = (typeof SOURCE_HEALTH_STATUSES)[number];

export type SourceChannelKind = "url" | "internal_static" | "manual_check";

export interface SourceChannel {
  kind: SourceChannelKind;
  label: string;
  url?: string;
}

export interface SourceCoverageArea {
  jurisdiction: "Comune di Lamezia Terme" | "internal_verified_context";
  topics: string[];
  period?: {
    from?: string;
    to?: string;
  };
  completeness?: "explicitly_complete" | "partial" | "unknown";
  notes: string[];
}

export interface SourcePollingPolicy {
  cadence:
    | "manual"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "on_demand"
    | "not_configured";
  nextCheckHint?: string;
  requiresLiveNetwork: boolean;
}

export interface SourceLimitationNote {
  code: string;
  note: string;
  severity: "info" | "monitoring_need" | "data_gap";
}

export interface CivicSourceRegistryEntry {
  id: string;
  name: string;
  type: CivicSourceType;
  channel: SourceChannel;
  coverage: SourceCoverageArea;
  pollingPolicy: SourcePollingPolicy;
  lastCheckedAt: string | null;
  healthStatus: SourceHealthStatus;
  limitations: SourceLimitationNote[];
  verifiedStaticSource?: boolean;
}

export interface CivicSourceHealthReportItem {
  id: string;
  name: string;
  healthStatus: SourceHealthStatus;
  coverageSummary: string;
  limitationCount: number;
  requiresVerification: boolean;
}

export interface CivicSourceHealthReport {
  totalSources: number;
  statusCounts: Record<SourceHealthStatus, number>;
  items: CivicSourceHealthReportItem[];
  sourcesRequiringVerification: CivicSourceHealthReportItem[];
  completeCoverageSourceIds: string[];
  summary: string;
}

const STATUS_VERIFICATION_FLAGS: Record<SourceHealthStatus, boolean> = {
  healthy: false,
  degraded: true,
  unreachable: true,
  empty: true,
  not_configured: true,
  needs_review: true,
};

const DEFAULT_STATUS_COUNTS = SOURCE_HEALTH_STATUSES.reduce(
  (counts, status) => ({ ...counts, [status]: 0 }),
  {} as Record<SourceHealthStatus, number>,
);

export const INITIAL_CIVIC_SOURCE_REGISTRY: CivicSourceRegistryEntry[] = [
  {
    id: "comune-istituzionale",
    name: "Sito istituzionale del Comune",
    type: "institutional_website",
    channel: {
      kind: "url",
      label: "Canale web istituzionale",
      url: "https://www.comune.lamezia-terme.cz.it/",
    },
    coverage: {
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["comunicazioni istituzionali", "servizi comunali"],
      completeness: "unknown",
      notes: [
        "Copertura da verificare rispetto alle sezioni pubblicate e agli aggiornamenti disponibili.",
      ],
    },
    pollingPolicy: {
      cadence: "daily",
      requiresLiveNetwork: true,
    },
    lastCheckedAt: "2026-06-01T08:00:00.000Z",
    healthStatus: "healthy",
    limitations: [
      {
        code: "coverage-not-declared-complete",
        note: "La presenza di pagine raggiungibili non implica completezza del contenuto pubblicato.",
        severity: "info",
      },
    ],
  },
  {
    id: "albo-pretorio",
    name: "Albo Pretorio Comune di Lamezia Terme / Tinnvision",
    type: "albo_pretorio",
    channel: {
      kind: "url",
      label: "Canale Albo Pretorio Tinnvision",
      url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    },
    coverage: {
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["atti in pubblicazione", "avvisi", "determine", "delibere"],
      completeness: "partial",
      notes: [
        "Copertura parziale: il connettore Albo acquisisce il solo elenco corrente Tinnvision e non certifica l'esaustivita' storica degli atti.",
      ],
    },
    pollingPolicy: {
      cadence: "hourly",
      nextCheckHint:
        "GitHub Actions controlla la finestra 08:00-20:00 Europe/Rome con cron UTC e guardia TZ=Europe/Rome.",
      requiresLiveNetwork: true,
    },
    lastCheckedAt: "2026-06-01T08:00:00.000Z",
    healthStatus: "degraded",
    limitations: [
      {
        code: "partial-coverage",
        note: "Sono possibili differenze fra elenco monitorato, allegati e storico disponibile sul canale ufficiale.",
        severity: "monitoring_need",
      },
      {
        code: "tinnvision-current-export",
        note: ALBO_PRETORIO_LAMEZIA_SOURCE.knownLimits[0],
        severity: "monitoring_need",
      },
      {
        code: "pdf-not-parsed-tranche-b",
        note: ALBO_PRETORIO_LAMEZIA_SOURCE.knownLimits[1],
        severity: "info",
      },
    ],
  },
  {
    id: "amministrazione-trasparente",
    name: "Amministrazione Trasparente",
    type: "transparent_administration",
    channel: {
      kind: "url",
      label: "Sezione Amministrazione Trasparente",
      url: "https://www.comune.lamezia-terme.cz.it/amministrazione-trasparente/",
    },
    coverage: {
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["obblighi di pubblicazione", "documenti amministrativi"],
      completeness: "unknown",
      notes: [
        "Le sottosezioni possono avere tempi di aggiornamento diversi e richiedono verifica metodologica.",
      ],
    },
    pollingPolicy: {
      cadence: "weekly",
      requiresLiveNetwork: true,
    },
    lastCheckedAt: "2026-06-01T08:00:00.000Z",
    healthStatus: "needs_review",
    limitations: [
      {
        code: "section-review-needed",
        note: "Serve una verifica per mappare sottosezioni, allegati e data di ultimo aggiornamento.",
        severity: "monitoring_need",
      },
    ],
  },
  {
    id: "pnrr-portale",
    name: "Portale PNRR",
    type: "pnrr_portal",
    channel: {
      kind: "url",
      label: "Canale PNRR pubblico",
      url: "https://www.comune.lamezia-terme.cz.it/pnrr/",
    },
    coverage: {
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["progetti PNRR", "attuazione"],
      completeness: "unknown",
      notes: [
        "La copertura dipende dalla pubblicazione del canale ufficiale e non viene considerata completa senza dichiarazione esplicita.",
      ],
    },
    pollingPolicy: {
      cadence: "weekly",
      requiresLiveNetwork: true,
    },
    lastCheckedAt: "2026-06-01T08:00:00.000Z",
    healthStatus: "unreachable",
    limitations: [
      {
        code: "technical-reachability",
        note: "Lo stato segnala una verifica tecnica necessaria sulla raggiungibilità del canale, non una valutazione sostanziale dei progetti.",
        severity: "monitoring_need",
      },
    ],
  },
  {
    id: "open-data",
    name: "Open Data",
    type: "open_data",
    channel: {
      kind: "url",
      label: "Catalogo o pagina Open Data",
      url: "https://www.comune.lamezia-terme.cz.it/open-data/",
    },
    coverage: {
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["dataset pubblici", "risorse tabellari"],
      completeness: "unknown",
      notes: [
        "Un catalogo vuoto o non popolato è registrato come dato tecnico da verificare.",
      ],
    },
    pollingPolicy: {
      cadence: "monthly",
      requiresLiveNetwork: true,
    },
    lastCheckedAt: "2026-06-01T08:00:00.000Z",
    healthStatus: "empty",
    limitations: [
      {
        code: "empty-source",
        note: "L'assenza di risorse rilevate indica un data gap o una configurazione da verificare, non una conclusione sulla disponibilità complessiva dei dati.",
        severity: "data_gap",
      },
    ],
  },
  {
    id: "consiglicloud-partecipazione",
    name: "ConsigliCloud e democrazia partecipativa",
    type: "participatory_democracy",
    channel: {
      kind: "url",
      label: "Canale sedute e partecipazione",
      url: "https://www.consiglicloud.it/",
    },
    coverage: {
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["sedute", "partecipazione civica"],
      completeness: "partial",
      notes: [
        "Copertura parziale perché il canale può rappresentare solo alcune fasi o documenti della partecipazione.",
      ],
    },
    pollingPolicy: {
      cadence: "weekly",
      requiresLiveNetwork: true,
    },
    lastCheckedAt: "2026-06-01T08:00:00.000Z",
    healthStatus: "healthy",
    limitations: [
      {
        code: "external-platform-scope",
        note: "La piattaforma esterna può avere perimetro, formati e aggiornamenti distinti dal sito comunale.",
        severity: "info",
      },
    ],
  },
  {
    id: "segnalazioni-disservizi",
    name: "Segnalazioni disservizi",
    type: "service_reports",
    channel: {
      kind: "manual_check",
      label: "Canale da configurare",
    },
    coverage: {
      jurisdiction: "Comune di Lamezia Terme",
      topics: ["segnalazioni", "disservizi"],
      completeness: "unknown",
      notes: [
        "Fonte censita per preparare il monitoraggio; il canale operativo richiede conferma prima dell'uso.",
      ],
    },
    pollingPolicy: {
      cadence: "not_configured",
      requiresLiveNetwork: false,
    },
    lastCheckedAt: null,
    healthStatus: "not_configured",
    limitations: [
      {
        code: "channel-not-configured",
        note: "Non sono presenti credenziali o endpoint configurati; nessun controllo automatico viene eseguito.",
        severity: "monitoring_need",
      },
    ],
  },
  {
    id: "fonti-statiche-verificate",
    name: "Fonti statiche interne già verificate",
    type: "verified_internal_static",
    channel: {
      kind: "internal_static",
      label: "Archivio tecnico interno verificato",
    },
    coverage: {
      jurisdiction: "internal_verified_context",
      topics: ["fixture tecniche", "dati dimostrativi verificati"],
      completeness: "explicitly_complete",
      notes: [
        "Completezza dichiarata solo per il piccolo perimetro statico interno già verificato, non per le fonti pubbliche esterne.",
      ],
    },
    pollingPolicy: {
      cadence: "manual",
      requiresLiveNetwork: false,
    },
    lastCheckedAt: "2026-06-01T08:00:00.000Z",
    healthStatus: "healthy",
    verifiedStaticSource: true,
    limitations: [
      {
        code: "internal-static-only",
        note: "La completezza riguarda esclusivamente il bundle statico interno indicato e non estende alcuna affermazione alle fonti ufficiali.",
        severity: "info",
      },
    ],
  },
];

export function summarizeCivicSourceHealth(
  entries: readonly CivicSourceRegistryEntry[],
): CivicSourceHealthReport {
  const statusCounts = { ...DEFAULT_STATUS_COUNTS };
  const items = entries.map((entry) => {
    statusCounts[entry.healthStatus] += 1;

    return {
      id: entry.id,
      name: entry.name,
      healthStatus: entry.healthStatus,
      coverageSummary: describeCoverage(entry.coverage),
      limitationCount: entry.limitations.length,
      requiresVerification: STATUS_VERIFICATION_FLAGS[entry.healthStatus],
    } satisfies CivicSourceHealthReportItem;
  });

  const sourcesRequiringVerification = items.filter(
    (item) => item.requiresVerification,
  );
  const completeCoverageSourceIds = entries
    .filter((entry) => entry.coverage.completeness === "explicitly_complete")
    .map((entry) => entry.id);

  return {
    totalSources: entries.length,
    statusCounts,
    items,
    sourcesRequiringVerification,
    completeCoverageSourceIds,
    summary: buildReportSummary(
      entries.length,
      sourcesRequiringVerification.length,
    ),
  };
}

export function describeCoverage(coverage: SourceCoverageArea): string {
  const topics =
    coverage.topics.length > 0
      ? coverage.topics.join(", ")
      : "ambiti non indicati";
  const completeness = coverage.completeness ?? "unknown";

  if (completeness === "explicitly_complete") {
    return `Copertura dichiarata completa per il perimetro indicato: ${topics}.`;
  }

  if (completeness === "partial") {
    return `Copertura parziale o da integrare per: ${topics}.`;
  }

  return `Copertura non dichiarata completa; verifica richiesta per: ${topics}.`;
}

export function validateCivicSourceRegistry(
  entries: readonly CivicSourceRegistryEntry[],
): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries) {
    if (seenIds.has(entry.id)) {
      errors.push(`Fonte duplicata: ${entry.id}`);
    }
    seenIds.add(entry.id);

    if (entry.channel.kind === "url" && !entry.channel.url) {
      errors.push(`Fonte ${entry.id}: URL mancante per canale web.`);
    }

    if (entry.coverage.completeness !== "explicitly_complete") {
      const unsafeCompleteNotes = [
        ...entry.coverage.notes,
        ...entry.limitations.map((limitation) => limitation.note),
      ].filter(isUnsafeCompletenessClaim);

      if (unsafeCompleteNotes.length > 0) {
        errors.push(
          `Fonte ${entry.id}: evitare affermazioni di completezza senza dichiarazione esplicita.`,
        );
      }
    }
  }

  return errors;
}

function isUnsafeCompletenessClaim(note: string): boolean {
  const normalized = note.toLowerCase();
  const cautiousQualifiers = [
    "non implica completezza",
    "non viene considerata completa",
    "senza dichiarazione esplicita",
    "non per le fonti ufficiali",
    "non estende alcuna affermazione",
  ];

  if (cautiousQualifiers.some((qualifier) => normalized.includes(qualifier))) {
    return false;
  }

  return /\b(archivio|copertura|registro|fonte|dataset|dati|contenuto|elenco)\s+complet[aoei]?\b/i.test(
    note,
  );
}

function buildReportSummary(
  totalSources: number,
  verificationCount: number,
): string {
  if (totalSources === 0) {
    return "Nessuna fonte censita nel registro tecnico.";
  }

  if (verificationCount === 0) {
    return "Fonti censite senza segnali tecnici aperti nel registro; restano validi limiti e caveat dichiarati.";
  }

  return `${verificationCount} fonte/i richiedono verifica tecnica o metodologica; il report indica esigenze di monitoraggio e non valutazioni sostanziali sugli atti.`;
}
