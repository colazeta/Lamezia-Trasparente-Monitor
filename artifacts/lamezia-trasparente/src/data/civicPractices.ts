export const CIVIC_PRACTICE_STATUS = [
  "segnalata",
  "da_verificare",
  "fonte_secondaria",
  "fonte_primaria",
  "replicabilita_valutata",
] as const;

export type CivicPracticeStatus = (typeof CIVIC_PRACTICE_STATUS)[number];

export const CIVIC_PRACTICE_AREAS = [
  "lavoro_dignitoso",
  "trasporto_sociale",
  "inclusione",
  "contrasto_caporalato",
  "beni_confiscati",
  "open_data",
  "partecipazione",
  "servizi_digitali",
  "ambiente",
  "welfare",
] as const;

export type CivicPracticeArea = (typeof CIVIC_PRACTICE_AREAS)[number];

export const CIVIC_PRACTICE_REPLICABILITY_LEVELS = [
  "bassa",
  "media",
  "alta",
  "da_valutare",
] as const;

export type CivicPracticeReplicabilityLevel =
  (typeof CIVIC_PRACTICE_REPLICABILITY_LEVELS)[number];

export type CivicPracticeSourceType =
  | "fonte_primaria"
  | "fonte_secondaria"
  | "social"
  | "screenshot"
  | "scouting_redazionale";

export type CivicPracticeSource = {
  label: string;
  url?: string;
  type: CivicPracticeSourceType;
  date?: string;
  note: string;
};

export type CivicPractice = {
  id: string;
  title: string;
  municipality: string;
  province?: string;
  region: string;
  area: readonly CivicPracticeArea[];
  summary: string;
  observedProblem: string;
  practiceDescription: string;
  publicActors: readonly string[];
  nonPublicActors?: readonly string[];
  sourceStatus: CivicPracticeStatus;
  sources: readonly CivicPracticeSource[];
  replicability: {
    level: CivicPracticeReplicabilityLevel;
    conditions: readonly string[];
    risks: readonly string[];
    questionsForLamezia: readonly string[];
  };
  relatedInternalRoutes: readonly string[];
  caveat: string;
  lastReviewedAt: string;
};

export const CIVIC_PRACTICE_STATUS_LABELS: Record<CivicPracticeStatus, string> = {
  segnalata: "Segnalata",
  da_verificare: "Da verificare",
  fonte_secondaria: "Fonte secondaria",
  fonte_primaria: "Fonte primaria",
  replicabilita_valutata: "Replicabilità valutata",
};

export const CIVIC_PRACTICE_AREA_LABELS: Record<CivicPracticeArea, string> = {
  lavoro_dignitoso: "Lavoro dignitoso",
  trasporto_sociale: "Trasporto sociale",
  inclusione: "Inclusione",
  contrasto_caporalato: "Contrasto al caporalato",
  beni_confiscati: "Beni confiscati",
  open_data: "Open data",
  partecipazione: "Partecipazione",
  servizi_digitali: "Servizi digitali",
  ambiente: "Ambiente",
  welfare: "Welfare",
};

export const CIVIC_PRACTICE_REPLICABILITY_LABELS: Record<
  CivicPracticeReplicabilityLevel,
  string
> = {
  bassa: "Bassa",
  media: "Media",
  alta: "Alta",
  da_valutare: "Da valutare",
};

export const CIVIC_PRACTICES = [
  {
    id: "cassano-ionio-navetta-lavoratori-migranti",
    title: "Navetta comunale gratuita per lavoratori migranti",
    municipality: "Cassano all’Ionio",
    province: "CS",
    region: "Calabria",
    area: [
      "lavoro_dignitoso",
      "trasporto_sociale",
      "inclusione",
      "contrasto_caporalato",
    ],
    summary:
      "Servizio di trasporto comunale segnalato come supporto gratuito ai lavoratori migranti diretti verso aziende agricole della zona.",
    observedProblem:
      "Dipendenza logistica dei lavoratori agricoli dal trasporto informale o intermediato, potenzialmente rilevante nei contesti di sfruttamento lavorativo.",
    practiceDescription:
      "Secondo lo scouting disponibile, una navetta del Comune accompagna gratuitamente i lavoratori verso le aziende agricole e li riporta a fine turno. La pratica resta da verificare con fonti primarie prima di essere trattata come modello consolidato.",
    publicActors: ["Comune di Cassano all’Ionio"],
    nonPublicActors: ["aziende agricole della zona", "associazioni locali da verificare"],
    sourceStatus: "fonte_secondaria",
    sources: [
      {
        label:
          "Il Post — contenuto social su iniziative in Calabria a supporto dei lavoratori migranti",
        type: "screenshot",
        note:
          "Fonte utile per scouting civico, basata su screenshot fornito in fase redazionale. Richiede verifica con atti, comunicati, pagine istituzionali o conferme del Comune prima di pubblicazione come scheda consolidata.",
      },
    ],
    replicability: {
      level: "da_valutare",
      conditions: [
        "mappatura del bisogno di trasporto verso luoghi di lavoro agricolo o stagionale",
        "presenza di aziende, associazioni, sindacati o enti disponibili a cooperare",
        "copertura assicurativa, responsabilità del servizio e tutela delle persone trasportate",
        "eventuale coinvolgimento di Prefettura, Regione, ambito sociale o terzo settore",
        "fonte di finanziamento e sostenibilità operativa nel tempo",
      ],
      risks: [
        "trasformare un caso segnalato da fonte secondaria in modello senza verifica primaria",
        "semplificare un problema complesso di lavoro, trasporto, vulnerabilità e sfruttamento",
        "esporre persone vulnerabili o dati sensibili non necessari al monitoraggio civico",
      ],
      questionsForLamezia: [
        "Esistono lavoratori agricoli, stagionali o vulnerabili con problemi documentati di trasporto verso i luoghi di lavoro?",
        "Il Comune ha mai attivato servizi analoghi, protocolli territoriali o interlocuzioni con aziende, Prefettura, Regione o terzo settore?",
        "Sono disponibili fondi sociali, regionali, PNRR o di ambito per un trasporto sociale mirato e non stigmatizzante?",
        "Esistono dati pubblici o segnalazioni verificabili sul bisogno logistico dei lavoratori stagionali nel territorio lametino?",
      ],
    },
    relatedInternalRoutes: [
      "/proposte-civiche",
      "/monitoraggio",
      "/accesso-civico",
      "/legalita",
      "/macchina-comunale",
    ],
    caveat:
      "La scheda descrive una pratica osservata altrove e non implica che il Comune di Lamezia Terme abbia obblighi, responsabilità o inadempienze analoghe.",
    lastReviewedAt: "2026-06-11",
  },
] as const satisfies readonly CivicPractice[];

export function getCivicPracticeAreas() {
  return Array.from(new Set(CIVIC_PRACTICES.flatMap((practice) => practice.area))).sort(
    (a, b) => CIVIC_PRACTICE_AREA_LABELS[a].localeCompare(CIVIC_PRACTICE_AREA_LABELS[b], "it"),
  );
}

export function getCivicPracticeMunicipalities() {
  return Array.from(new Set(CIVIC_PRACTICES.map((practice) => practice.municipality))).sort(
    (a, b) => a.localeCompare(b, "it"),
  );
}
