import { PUBLIC_INDEXABLE_ROUTES } from "./publicRoutes";

export type SectionStatus =
  | "demo"
  | "partial"
  | "verified"
  | "needs-source"
  | "under-construction";
export type SectionDataStatus = "demo" | "partial" | "missing" | "verified";
export type SectionLaunchReadiness =
  | "launch-ready"
  | "launch-ready-with-caveats"
  | "not-launch-ready";
export type SectionSourceType =
  | "primary"
  | "secondary"
  | "manual"
  | "mixed"
  | "technical";

export interface SectionArchitecture {
  path: `/${string}`;
  group: string;
  title: string;
  publicExplanation: string;
  helpsUnderstand: readonly string[];
  status: SectionStatus;
  lastUpdated: string;
  civicQuestion: string;
  dataReadiness: {
    expectedSource: string;
    sourceType: SectionSourceType;
    updateFrequency: string;
    verificationLevel: string;
    knownLimits: string;
    ingestionStatus: string;
    dataStatus: SectionDataStatus;
  };
  primaryContent: string;
  filters: readonly string[];
  emptyState: { title: string; description: string; whyItMatters: string };
  related: readonly { href: `/${string}`; label: string; reason: string }[];
  launchReadiness: SectionLaunchReadiness;
  auditNotes: {
    currentPurpose: string;
    structuralWeaknesses: string;
    necessaryUiBlocks: string;
    missingEmptyStates: string;
    missingSourceIndicators: string;
    missingFilters: string;
    missingCrossLinks: string;
    mobileReadability: string;
  };
}

export const SECTION_STATUS_LABELS: Record<SectionStatus, string> = {
  demo: "Demo dichiarata",
  partial: "Dati parziali",
  verified: "Verificato",
  "needs-source": "Fonte da collegare",
  "under-construction": "In costruzione",
};
export const SECTION_DATA_STATUS_LABELS: Record<SectionDataStatus, string> = {
  demo: "Demo/prototipo",
  partial: "Parziale",
  missing: "Assente",
  verified: "Verificato",
};
export const SECTION_SOURCE_TYPE_LABELS: Record<SectionSourceType, string> = {
  primary: "Fonte primaria",
  secondary: "Fonte secondaria",
  manual: "Contenuto manuale",
  mixed: "Fonti miste",
  technical: "Dato tecnico",
};
export const SECTION_LAUNCH_READINESS_LABELS: Record<
  SectionLaunchReadiness,
  string
> = {
  "launch-ready": "Pubblicabile",
  "launch-ready-with-caveats": "Pubblicabile con cautele",
  "not-launch-ready": "Non pubblicabile come dato reale",
};

type PublicPath =
  | (typeof PUBLIC_INDEXABLE_ROUTES)[number]["path"]
  | "/atlante-territoriale";

const sourceCheck =
  "Ogni dato va riscontrato sulla fonte richiamata prima di essere usato come informazione ufficiale.";
const noFakeData =
  "La sezione non deve mostrare numeri o conclusioni se la fonte non restituisce dati.";

const GROUPS = {
  orient: "Orientamento civico",
  decide: "Cosa decide il Comune",
  people: "Chi partecipa e come vota",
  money: "Come vengono spesi soldi e incarichi",
  works: "Cosa viene finanziato e realizzato",
  places: "Cosa succede nei luoghi della citta",
  memory: "Memoria civica e antimafia",
  civic: "Partecipazione e proposte",
  state: "Stato delle fonti e del monitoraggio",
} as const;

const sourceFamilies: Record<SectionSourceType, string> = {
  primary: "Albo, atti, allegati, sedute e fonti istituzionali primarie.",
  secondary: "Fonti secondarie da collegare a record e documenti primari.",
  manual: "Contenuti redazionali, route pubbliche, metodologia e note interne.",
  mixed: "Fonti primarie, dataset pubblici, note redazionali e record collegati.",
  technical: "Dataset, feed, health check, API e documentazione tecnica.",
};

const titleOverrides: Partial<Record<PublicPath, string>> = {
  "/": "Lamezia Trasparente Monitor",
  "/pnrr": "PNRR",
  "/opendata": "Open data",
  "/fonti-dati": "Fonti dati",
  "/stato-monitoraggio": "Stato monitoraggio",
  "/note-legali": "Note legali",
  "/chi-siamo": "Chi siamo",
  "/accesso-civico": "Accesso civico",
  "/atlante-territoriale": "Atlante territoriale",
  "/criticita-pubbliche": "Criticita pubbliche",
  "/atti-fondamentali": "Atti fondamentali",
  "/beni-confiscati": "Beni confiscati",
  "/legalita": "Legalita",
  "/legalita/timeline": "Timeline legalita",
  "/legalita/trame-festival": "Trame - Festival",
  "/convocazioni/demo-consiglio-comunale-v0": "Demo convocazione",
  "/performance/confronta": "Confronta performance",
};

const demoPaths = new Set<PublicPath>([
  "/convocazioni/demo-consiglio-comunale-v0",
  "/promessometro",
  "/macchina-comunale",
]);
const missingPaths = new Set<PublicPath>([
  "/monitoraggio/nuovo",
  "/contatti",
  "/iscrizioni",
  "/feeds",
]);
const launchReadyPaths = new Set<PublicPath>([
  "/fonti-dati",
  "/metodologia",
  "/note-legali",
]);

const relatedDefaults: readonly PublicPath[] = [
  "/fonti-dati",
  "/metodologia",
  "/guida",
];

function titleFor(path: PublicPath) {
  if (titleOverrides[path]) return titleOverrides[path]!;
  const last = path.split("/").filter(Boolean).at(-1) ?? "home";
  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function groupFor(path: PublicPath) {
  if (path === "/" || ["/domande", "/temi", "/statistiche"].includes(path)) {
    return GROUPS.orient;
  }
  if (/^\/(convocazioni|delibere|albo|atti-fondamentali|pareri)/.test(path)) {
    return GROUPS.decide;
  }
  if (/^\/(organi|amministratori)/.test(path)) return GROUPS.people;
  if (/^\/(contratti|incarichimetro)/.test(path)) return GROUPS.money;
  if (/^\/(pnrr|bandi|performance|macchina-comunale)/.test(path)) {
    return GROUPS.works;
  }
  if (path === "/atlante-territoriale") return GROUPS.places;
  if (/^\/(beni-confiscati|legalita)/.test(path)) return GROUPS.memory;
  if (
    /^\/(accesso-civico|monitoraggio|promessometro|archivio-proposte|criticita-pubbliche|segnalazioni|iscrizioni)/.test(
      path,
    )
  ) {
    return GROUPS.civic;
  }
  return GROUPS.state;
}

function sourceTypeFor(path: PublicPath): SectionSourceType {
  if (/^\/(albo|atti-fondamentali|convocazioni|delibere|organi|amministratori|pareri)/.test(path)) {
    return "primary";
  }
  if (/^\/(opendata|feeds|sviluppatori|stato-monitoraggio|statistiche|iscrizioni|atlante-territoriale)/.test(path)) {
    return "technical";
  }
  if (/^\/(domande|guida|metodologia|note-legali|chi-siamo|contatti|accesso-civico|roadmap)/.test(path)) {
    return "manual";
  }
  return "mixed";
}

function statusFor(path: PublicPath): SectionStatus {
  if (demoPaths.has(path)) return "demo";
  if (path === "/feeds" || path === "/contatti") return "needs-source";
  if (path === "/monitoraggio/nuovo" || path === "/iscrizioni") {
    return "under-construction";
  }
  return "partial";
}

function dataStatusFor(path: PublicPath): SectionDataStatus {
  if (demoPaths.has(path)) return "demo";
  if (missingPaths.has(path)) return "missing";
  return "partial";
}

function readinessFor(path: PublicPath): SectionLaunchReadiness {
  if (demoPaths.has(path) || missingPaths.has(path)) return "not-launch-ready";
  if (launchReadyPaths.has(path)) return "launch-ready";
  return "launch-ready-with-caveats";
}

function filtersFor(group: string, path: PublicPath) {
  if (path === "/") return ["Sezione", "Fonte", "Stato"];
  if (group === GROUPS.money) {
    return ["Data", "Procedura", "Importo", "Operatore", "Fonte"];
  }
  if (group === GROUPS.people) return ["Ruolo", "Organo", "Mandato", "Fonte"];
  if (group === GROUPS.memory) return ["Anno", "Luogo", "Fonte", "Verifica"];
  if (group === GROUPS.places) return ["Luogo", "Indicatore", "Fonte", "Verifica"];
  if (group === GROUPS.state) return ["Modulo", "Fonte", "Stato", "Frequenza"];
  return ["Tema", "Fonte", "Stato verifica"];
}

function relatedFor(path: PublicPath) {
  const local: Partial<Record<PublicPath, readonly PublicPath[]>> = {
    "/convocazioni": ["/delibere", "/organi", "/fonti-dati"],
    "/contratti": ["/incarichimetro", "/pnrr", "/fonti-dati"],
    "/beni-confiscati": ["/legalita", "/legalita/timeline", "/fonti-dati"],
    "/legalita/trame-festival": ["/legalita", "/legalita/timeline", "/fonti-dati"],
    "/monitoraggio": ["/segnalazioni", "/accesso-civico", "/criticita-pubbliche"],
    "/atlante-territoriale": ["/fonti-dati", "/opendata", "/metodologia"],
    "/fonti-dati": ["/stato-monitoraggio", "/metodologia", "/opendata"],
  };
  return (local[path] ?? relatedDefaults).filter((href) => href !== path);
}

function buildSection(route: (typeof PUBLIC_INDEXABLE_ROUTES)[number]) {
  const path: PublicPath = route.path;
  const title = titleFor(path);
  const group = groupFor(path);
  const sourceType = sourceTypeFor(path);
  const dataStatus = dataStatusFor(path);
  const filters = filtersFor(group, path);
  const related = relatedFor(path);

  return {
    path,
    group,
    title,
    publicExplanation: `${route.rationale} La sezione dichiara fonte, stato dei dati, limiti e prossimi passi prima di mostrare o interpretare record.`,
    helpsUnderstand: [
      "quale bisogno civico affronta la sezione",
      "quali fonti e campi sono disponibili o mancanti",
      "quali cautele servono prima di riusare i dati",
    ],
    status: statusFor(path),
    lastUpdated: "Da allineare a ogni rilascio pubblico o aggiornamento fonte",
    civicQuestion: `Quale fonte aiuta a leggere ${title} e quali limiti restano da verificare?`,
    dataReadiness: {
      expectedSource: sourceFamilies[sourceType],
      sourceType,
      updateFrequency:
        sourceType === "technical"
          ? "Quando cambiano integrazioni, health check o dataset pubblici."
          : "Quando cambiano fonti, route o contenuti redazionali.",
      verificationLevel:
        dataStatus === "demo"
          ? "Demo dichiarata: non rappresenta un dato pubblico reale."
          : "Parziale: ogni record va riscontrato sulla fonte richiamata.",
      knownLimits:
        "Copertura, aggiornamento e campi disponibili possono essere incompleti; il monitor non sostituisce la fonte ufficiale.",
      ingestionStatus:
        dataStatus === "missing"
          ? "Fonte o servizio da collegare prima dell'uso pubblico pieno."
          : dataStatus === "demo"
            ? "Fixture o struttura dimostrativa separata dai dati reali."
            : "Struttura pronta, alimentazione e verifica da consolidare.",
      dataStatus,
    },
    primaryContent: `${route.rationale} Deve mostrare scopo, fonte, stato, limiti, filtri e collegamenti correlati.`,
    filters,
    emptyState: {
      title:
        dataStatus === "demo"
          ? "Dati reali non pubblicati"
          : dataStatus === "missing"
            ? "Fonte non ancora collegata"
            : "Nessun record disponibile",
      description:
        "Quando non ci sono dati, la sezione dichiara il vuoto, indica la fonte prevista e rinvia a metodo o fonti.",
      whyItMatters:
        "Un vuoto informativo dichiarato e piu trasparente di numeri dimostrativi o conclusioni non verificabili.",
    },
    related: related.map((href) => ({
      href,
      label: titleFor(href),
      reason: "aiuta a verificare fonte, metodo o contesto civico",
    })),
    launchReadiness: readinessFor(path),
    auditNotes: {
      currentPurpose: route.rationale,
      structuralWeaknesses:
        "La pagina puo sembrare completa se non espone fonte, stato, limiti e dati mancanti.",
      necessaryUiBlocks:
        "Scaffold civico, badge stato, fonte attesa, limiti, filtri, empty state e collegamenti correlati.",
      missingEmptyStates:
        "Stato vuoto per fonte assente, record mancanti, demo o servizio non attivo.",
      missingSourceIndicators:
        "Fonte prevista, tipo fonte, ultimo controllo, livello verifica e stato ingestion.",
      missingFilters: filters.join(", "),
      missingCrossLinks: related.map(titleFor).join(", "),
      mobileReadability:
        "Tabelle dense devono degradare in schede o liste leggibili con fonte e stato vicini ai campi principali.",
    },
  } satisfies SectionArchitecture;
}

export const SECTION_ARCHITECTURES: readonly SectionArchitecture[] =
  PUBLIC_INDEXABLE_ROUTES.map(buildSection);

export const SECTION_ARCHITECTURE_BY_PATH: ReadonlyMap<
  string,
  SectionArchitecture
> = new Map(SECTION_ARCHITECTURES.map((entry) => [entry.path, entry]));

export function getSectionArchitecture(path: string) {
  return SECTION_ARCHITECTURE_BY_PATH.get(path) ?? null;
}

export function findSectionArchitecture(path: string) {
  const exact = getSectionArchitecture(path);
  if (exact) return exact;

  const normalized = path.split("?")[0]?.replace(/\/+$/, "") || "/";
  return (
    [...SECTION_ARCHITECTURES]
      .filter(
        (entry) =>
          entry.path !== "/" && normalized.startsWith(`${entry.path}/`),
      )
      .sort((left, right) => right.path.length - left.path.length)[0] ?? null
  );
}

export function getRelatedSectionArchitectures(section: SectionArchitecture) {
  return section.related
    .map((related) => ({
      ...related,
      section: getSectionArchitecture(related.href),
    }))
    .filter((related) => related.section !== null);
}

export function getLaunchReadySections() {
  return SECTION_ARCHITECTURES.filter(
    (section) => section.launchReadiness !== "not-launch-ready",
  );
}

export function assertEveryPublicSectionHasSafeguards() {
  return SECTION_ARCHITECTURES.every((section) => {
    const readiness = section.dataReadiness;
    return Boolean(
      section.civicQuestion &&
        readiness.expectedSource &&
        readiness.verificationLevel &&
        readiness.knownLimits &&
        readiness.ingestionStatus &&
        section.emptyState.description &&
        section.related.length > 0,
    );
  });
}

export const SECTION_ARCHITECTURE_GUARDRAILS = {
  sourceCheck,
  noFakeData,
} as const;
