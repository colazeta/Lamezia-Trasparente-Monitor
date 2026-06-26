export const ISTAT_PA_DIMENSION_IDS = [
  "formazione",
  "organizzazione",
  "digitalizzazione",
  "cybersecurity",
  "servizi",
  "sostenibilita",
  "innovazione-sociale",
  "ai-pa",
] as const;

export type IstatPaDimensionId = (typeof ISTAT_PA_DIMENSION_IDS)[number];

export type IstatPaIconName =
  | "book-open-check"
  | "bot"
  | "building"
  | "database"
  | "leaf"
  | "network"
  | "shield-check"
  | "users";

export type IstatPaRouteLink = {
  href: string;
  label: string;
};

export type IstatPaDimension = {
  id: IstatPaDimensionId;
  label: string;
  shortLabel: string;
  description: string;
  localEvidence: readonly string[];
  routes: readonly IstatPaRouteLink[];
  iconName: IstatPaIconName;
};

export type IstatActTag = {
  label: string;
  dimensionId: IstatPaDimensionId;
};

export const ISTAT_PA_SOURCE = {
  id: "istat-censimento-istituzioni-pubbliche",
  name: "ISTAT — Censimento permanente delle istituzioni pubbliche",
  href: "https://www.istat.it/statistiche-per-temi/censimenti/istituzioni-pubbliche/",
  sourceKind: "fonte statistica ufficiale di contesto",
  civicUse:
    "griglia nazionale per orientare domande civiche su capacità amministrativa, trasformazione digitale, servizi pubblici e qualità delle fonti locali",
  caveat:
    "La fonte ISTAT non prova automaticamente condizioni specifiche del Comune di Lamezia Terme: ogni lettura locale richiede dati disaggregati, tavole territoriali pertinenti o riscontri in fonti comunali ufficiali.",
} as const;

export const ISTAT_PA_DIMENSIONS = [
  {
    id: "formazione",
    label: "Formazione del personale",
    shortLabel: "Formazione",
    description:
      "Competenze, aggiornamento professionale e capacità amministrativa interna.",
    localEvidence: ["PIAO", "piano della formazione", "atti su competenze digitali"],
    routes: [
      { href: "/atti-fondamentali", label: "Atti fondamentali" },
      { href: "/macchina-comunale", label: "Macchina comunale" },
      { href: "/accesso-civico", label: "Accesso civico" },
    ],
    iconName: "book-open-check",
  },
  {
    id: "organizzazione",
    label: "Organizzazione e lavoro pubblico",
    shortLabel: "Organizzazione",
    description:
      "Assetti organizzativi, lavoro agile, fabbisogni, copertura degli uffici e capacità di presidio dei servizi.",
    localEvidence: ["PIAO", "piano dei fabbisogni", "dotazione organica", "atti organizzativi"],
    routes: [
      { href: "/macchina-comunale", label: "Macchina comunale" },
      { href: "/atti-fondamentali", label: "Atti fondamentali" },
      { href: "/performance", label: "Performance" },
    ],
    iconName: "building",
  },
  {
    id: "digitalizzazione",
    label: "Digitalizzazione",
    shortLabel: "Digitale",
    description:
      "Servizi digitali, interoperabilità, dati aperti, infrastrutture e processi online.",
    localEvidence: ["portale open data", "servizi online", "contratti ICT", "obiettivi PIAO"],
    routes: [
      { href: "/opendata", label: "Open data" },
      { href: "/sviluppatori", label: "API e sviluppatori" },
      { href: "/contratti", label: "Contratti ICT" },
    ],
    iconName: "database",
  },
  {
    id: "cybersecurity",
    label: "Sicurezza informatica",
    shortLabel: "Cybersecurity",
    description:
      "Misure organizzative, contratti, policy e documenti pubblici sulla sicurezza ICT.",
    localEvidence: ["atti ICT", "contratti di manutenzione rete", "misure organizzative pubbliche"],
    routes: [
      { href: "/contratti", label: "Contratti" },
      { href: "/atti-fondamentali", label: "Atti fondamentali" },
      { href: "/accesso-civico", label: "Accesso civico" },
    ],
    iconName: "shield-check",
  },
  {
    id: "servizi",
    label: "Servizi finali ai cittadini",
    shortLabel: "Servizi",
    description:
      "Tracce pubbliche su qualità, accessibilità, tempi e canali dei servizi erogati alla cittadinanza.",
    localEvidence: ["indicatori di performance", "carte dei servizi", "dataset su servizi", "segnalazioni civiche"],
    routes: [
      { href: "/performance", label: "Performance" },
      { href: "/opendata", label: "Open data" },
      { href: "/segnalazioni", label: "Segnalazioni" },
    ],
    iconName: "users",
  },
  {
    id: "sostenibilita",
    label: "Gestione ecosostenibile",
    shortLabel: "Sostenibilità",
    description:
      "Atti, dati e contratti su ambiente, energia, rifiuti, acquisti verdi e gestione sostenibile.",
    localEvidence: ["dataset ambientali", "contratti energia/rifiuti", "progetti PNRR", "atti di programmazione"],
    routes: [
      { href: "/opendata", label: "Open data" },
      { href: "/contratti", label: "Contratti" },
      { href: "/pnrr", label: "PNRR" },
    ],
    iconName: "leaf",
  },
  {
    id: "innovazione-sociale",
    label: "Innovazione sociale",
    shortLabel: "Innovazione sociale",
    description:
      "Co-progettazioni, patti, partenariati, avvisi e iniziative con valore pubblico e sociale.",
    localEvidence: ["bandi", "avvisi", "archivio proposte", "atti di co-progettazione"],
    routes: [
      { href: "/contratti", label: "Contratti pubblici" },
      { href: "/proposte-civiche", label: "Proposte civiche" },
      { href: "/monitoraggio", label: "Monitor civico" },
    ],
    iconName: "network",
  },
  {
    id: "ai-pa",
    label: "Intelligenza artificiale nella PA",
    shortLabel: "IA nella PA",
    description:
      "Eventuali policy, atti o informative sull’uso di strumenti automatizzati o IA da parte dell’ente.",
    localEvidence: ["policy comunali", "informative", "atti su strumenti automatizzati", "cautele metodologiche"],
    routes: [
      { href: "/metodologia", label: "Metodologia" },
      { href: "/note-legali", label: "Note legali" },
      { href: "/fonti-dati", label: "Fonti dati" },
    ],
    iconName: "bot",
  },
] as const satisfies readonly IstatPaDimension[];

function assertCompleteIstatPaDimensionMap(
  dimensionById: Partial<Record<IstatPaDimensionId, IstatPaDimension>>,
): asserts dimensionById is Record<IstatPaDimensionId, IstatPaDimension> {
  for (const dimensionId of ISTAT_PA_DIMENSION_IDS) {
    if (!dimensionById[dimensionId]) {
      throw new Error(`Missing ISTAT PA dimension: ${dimensionId}`);
    }
  }
}

function buildIstatPaDimensionMap(
  dimensions: readonly IstatPaDimension[],
): Record<IstatPaDimensionId, IstatPaDimension> {
  const dimensionById: Partial<Record<IstatPaDimensionId, IstatPaDimension>> = {};

  for (const dimension of dimensions) {
    dimensionById[dimension.id] = dimension;
  }

  assertCompleteIstatPaDimensionMap(dimensionById);

  return dimensionById;
}

export const ISTAT_PA_DIMENSION_BY_ID = buildIstatPaDimensionMap(ISTAT_PA_DIMENSIONS);

export const ISTAT_PA_READING_RULES = [
  "ISTAT suggerisce dimensioni da osservare, non conclusioni sul Comune.",
  "Le fonti comunali documentano eventuali risposte locali.",
  "L’assenza di un dato pubblico è un bisogno di verifica, non una prova negativa.",
] as const;

export const ISTAT_PA_OPEN_DATA_SEARCH_HINTS = [
  { dimensionId: "digitalizzazione", query: "digitale servizi online interoperabilità" },
  { dimensionId: "servizi", query: "servizi cittadini tempi qualità" },
  { dimensionId: "sostenibilita", query: "ambiente rifiuti energia sostenibilità" },
  { dimensionId: "cybersecurity", query: "sicurezza informatica ICT" },
  { dimensionId: "ai-pa", query: "intelligenza artificiale algoritmi automazione" },
] as const satisfies readonly {
  dimensionId: IstatPaDimensionId;
  query: string;
}[];

const PIAO_TAGS = [
  { label: "Formazione", dimensionId: "formazione" },
  { label: "Organizzazione", dimensionId: "organizzazione" },
  { label: "Digitale", dimensionId: "digitalizzazione" },
] as const satisfies readonly IstatActTag[];

const DUP_TAGS = [
  { label: "Programmazione", dimensionId: "organizzazione" },
  { label: "Servizi", dimensionId: "servizi" },
] as const satisfies readonly IstatActTag[];

const BILANCIO_TAGS = [
  { label: "Risorse", dimensionId: "organizzazione" },
  { label: "Servizi", dimensionId: "servizi" },
] as const satisfies readonly IstatActTag[];

const RENDICONTO_TAGS = [
  { label: "Risorse", dimensionId: "organizzazione" },
  { label: "Servizi", dimensionId: "servizi" },
] as const satisfies readonly IstatActTag[];

const REGOLAMENTI_TAGS = [
  { label: "Organizzazione", dimensionId: "organizzazione" },
  { label: "Trasparenza", dimensionId: "digitalizzazione" },
] as const satisfies readonly IstatActTag[];

const PIANO_OPERE_TAGS = [
  { label: "Sostenibilità", dimensionId: "sostenibilita" },
  { label: "Servizi", dimensionId: "servizi" },
] as const satisfies readonly IstatActTag[];

const ISTAT_ACT_TAGS_BY_SLUG: Record<string, readonly IstatActTag[]> = {
  piao: PIAO_TAGS,
  dup: DUP_TAGS,
  bilancio: BILANCIO_TAGS,
  rendiconto: RENDICONTO_TAGS,
  regolamenti: REGOLAMENTI_TAGS,
  "piano-opere-pubbliche": PIANO_OPERE_TAGS,
};

export function getIstatActTags(
  slug: string | null | undefined,
): readonly IstatActTag[] {
  if (!slug) return [];
  const normalized = slug.toLowerCase();
  const direct = ISTAT_ACT_TAGS_BY_SLUG[normalized];
  if (direct) return direct;

  if (normalized.includes("piao")) return PIAO_TAGS;
  if (normalized.includes("dup")) return DUP_TAGS;
  if (normalized.includes("bilancio")) return BILANCIO_TAGS;
  if (normalized.includes("rendiconto")) return RENDICONTO_TAGS;
  if (normalized.includes("regol")) return REGOLAMENTI_TAGS;
  if (normalized.includes("opera") || normalized.includes("opere")) {
    return PIANO_OPERE_TAGS;
  }

  return [];
}
