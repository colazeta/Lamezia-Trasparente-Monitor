import {
  Archive,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CircleDotDashed,
  ClipboardList,
  Code2,
  Database,
  FileSearch,
  FileText,
  Gauge,
  Gavel,
  Landmark,
  MapPinned,
  Megaphone,
  Network,
  Rss,
  Scale,
  Scale3D,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Telescope,
  Users,
} from "lucide-react";
import {
  getPublicV0RouteContract,
  V0_ROUTE_STATUS_LABELS,
  type V0RouteStatus,
} from "@/data/publicRoutes";

export type SectionAvailabilityState =
  | "available"
  | "in_progress"
  | "planned"
  | "hidden";

export type NavItemVisibility =
  | "primary"
  | "secondary"
  | "search_only"
  | "hidden";

export const SECTION_STATE_LABELS: Record<
  SectionAvailabilityState,
  string
> = {
  available: "Disponibile",
  in_progress: "In lavorazione",
  planned: "In arrivo",
  hidden: "Nascosta",
};

export const SECTION_STATE_SHORT_LABELS: Record<
  SectionAvailabilityState,
  string
> = {
  available: "Disponibile",
  in_progress: "In lavorazione",
  planned: "Prevista",
  hidden: "Nascosta",
};

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  state: SectionAvailabilityState;
  visibility: NavItemVisibility;
  /** In-progress sections stay navigable only when the page has useful content. */
  hasUsefulPage?: boolean;
  keywords?: string;
  canonicalHref?: string;
  v0Status?: V0RouteStatus;
  v0StatusLabel?: string;
}

export interface NavSection {
  label: string;
  description: string;
  items: NavItem[];
}

const RAW_NAV_GROUPS: NavSection[] = [
  {
    label: "Atti",
    description:
      "Decisioni, sedute e documenti ufficiali del Comune, organizzati per consultazione civica.",
    items: [
      {
        href: "/convocazioni",
        label: "Sedute e ordini del giorno",
        description:
          "Consiglio e commissioni: agenda, avvisi, documenti e stato delle fonti.",
        icon: CalendarClock,
        state: "available",
        visibility: "primary",
        keywords: "convocazioni sedute consiglio commissioni ordine del giorno",
      },
      {
        href: "/delibere",
        label: "Delibere e atti",
        description:
          "Decisioni di Giunta e Consiglio con documenti, allegati e rinvio alle fonti.",
        icon: Gavel,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "delibere atti giunta consiglio decisioni",
      },
      {
        href: "/albo/",
        label: "Albo Pretorio",
        description:
          "Archivio navigabile degli atti pubblicati dal Comune e dei relativi documenti.",
        icon: ShieldAlert,
        state: "available",
        visibility: "primary",
        keywords: "albo pretorio pubblicazioni atti ufficiali",
      },
      {
        href: "/atti-fondamentali",
        label: "Atti fondamentali",
        description:
          "Statuto, regolamenti e documenti essenziali che disciplinano e programmano l'ente.",
        icon: ScrollText,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "statuto regolamenti atti fondamentali programmazione",
      },
      {
        href: "/pareri",
        label: "Pareri e vigilanza",
        description:
          "Pareri, documenti di controllo e vigilanza disponibili nelle fonti pubbliche.",
        icon: ShieldCheck,
        state: "in_progress",
        visibility: "search_only",
        hasUsefulPage: true,
        keywords: "pareri vigilanza revisori controllo",
      },
    ],
  },
  {
    label: "Comune",
    description:
      "Persone, organi, capacità amministrativa e risultati dell'organizzazione comunale.",
    items: [
      {
        href: "/organi",
        label: "Organi istituzionali",
        description:
          "Consiglio, Giunta e commissioni con composizione, ruoli e fonti disponibili.",
        icon: Building2,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "organi istituzionali consiglio giunta commissioni",
      },
      {
        href: "/amministratori",
        label: "Amministratori",
        description:
          "Sindaco, assessori e consiglieri con ruoli pubblici e informazioni documentate.",
        icon: Users,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "sindaco assessori consiglieri amministratori",
      },
      {
        href: "/macchina-comunale",
        label: "Macchina comunale",
        description:
          "Organico, capacità amministrativa, scoperture e stato delle fonti disponibili.",
        icon: Network,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "macchina comunale organico personale uffici capacita amministrativa",
      },
      {
        href: "/performance",
        label: "Performance",
        description:
          "Indicatori amministrativi e confronti da leggere come segnali, non come giudizi automatici.",
        icon: Gauge,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "performance indicatori kpi risultati amministrativi",
      },
      {
        href: "/promessometro",
        label: "Promessometro",
        description:
          "Collega impegni programmatici, atti e stati documentali senza scoring politico.",
        icon: BookOpenCheck,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "promessometro programma promesse impegni atti",
      },
      {
        href: "/elezioni-voti",
        label: "Elezioni e voti",
        description:
          "Percorso previsto per risultati, sezioni, preferenze e verifiche elettorali.",
        icon: BarChart3,
        state: "planned",
        visibility: "hidden",
        hasUsefulPage: false,
        keywords: "elezioni voti preferenze sezioni elettorali",
      },
    ],
  },
  {
    label: "Spesa",
    description:
      "Contratti, progetti finanziati e incarichi: dove vanno risorse pubbliche e affidamenti.",
    items: [
      {
        href: "/contratti",
        label: "Contratti pubblici",
        description:
          "Gare, affidamenti, CIG, importi e fornitori con fonti e limiti di copertura espliciti.",
        icon: FileText,
        state: "available",
        visibility: "primary",
        keywords: "contratti appalti gare affidamenti fornitori cig spesa",
      },
      {
        href: "/pnrr",
        label: "PNRR",
        description:
          "Progetti, CUP, finanziamenti, luoghi e informazioni disponibili sullo stato degli interventi.",
        icon: Landmark,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "pnrr cup progetti finanziamenti cantieri",
      },
      {
        href: "/incarichimetro",
        label: "Incarichi e consulenze",
        description:
          "Incarichi, consulenze e ricorrenze come elementi documentali da approfondire.",
        icon: ClipboardList,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "incarichi consulenze incarichimetro ricorrenza rotazione operatori",
      },
      {
        href: "/bandi",
        label: "Bandi e avvisi",
        description:
          "Voce legacy confluita nella lettura più ampia dei contratti pubblici.",
        icon: FileText,
        state: "hidden",
        visibility: "hidden",
        canonicalHref: "/contratti",
        keywords: "bandi avvisi finanziamenti contributi",
      },
      {
        href: "/performance/confronta",
        label: "Confronto performance",
        description:
          "Voce legacy confluita nella sezione Performance.",
        icon: BarChart3,
        state: "hidden",
        visibility: "hidden",
        canonicalHref: "/performance",
        keywords: "confronto performance indicatori",
      },
    ],
  },
  {
    label: "Territorio",
    description:
      "Mappe, criticità documentali e percorsi di monitoraggio collegati ai luoghi della città.",
    items: [
      {
        href: "/atlante-territoriale",
        label: "Atlante territoriale",
        description:
          "Mappa per sezioni censuarie ISTAT con indicatori, fonte, anno e limiti di lettura.",
        icon: MapPinned,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "atlante territoriale mappa istat sezioni censuarie territorio",
      },
      {
        href: "/criticita-pubbliche",
        label: "Criticità pubbliche",
        description:
          "Registro di criticità documentali con fonte, stato di verifica e dati mancanti.",
        icon: ShieldAlert,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "criticita pubbliche segnalazioni verifiche fonti territorio",
      },
      {
        href: "/monitoraggio",
        label: "Monitor civico",
        description:
          "Percorsi di verifica civica collegati a criticità, atti, progetti e luoghi.",
        icon: Telescope,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "monitoraggio civico monithon verifiche territorio",
      },
      {
        href: "/segnalazioni-luoghi",
        label: "Segnalazioni e luoghi",
        description:
          "Vista prevista per collegare segnalazioni, luoghi e stato di verifica territoriale.",
        icon: MapPinned,
        state: "planned",
        visibility: "hidden",
        hasUsefulPage: false,
        keywords: "segnalazioni luoghi mappa territorio criticita",
      },
    ],
  },
  {
    label: "Legalità",
    description:
      "Memoria civica, beni confiscati e percorsi antimafia costruiti con disciplina di fonte.",
    items: [
      {
        href: "/legalita",
        label: "Legalità e memoria",
        description:
          "Percorsi documentati su legalità, prevenzione, memoria e fonti pubbliche.",
        icon: Scale,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "legalita memoria antimafia trasparenza storia",
      },
      {
        href: "/beni-confiscati",
        label: "Beni confiscati",
        description:
          "Patrimoni confiscati, geografie e riuso sociale con cautele e rinvio alle fonti.",
        icon: ShieldOff,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "beni confiscati anbsc riuso sociale antimafia",
      },
      {
        href: "/legalita/trame-festival",
        label: "Trame – Festival",
        description:
          "Idee e analisi dal festival pubblicate solo con fonte e verifica redazionale.",
        icon: BookOpenCheck,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "trame festival legalita antimafia cultura",
      },
      {
        href: "/legalita/timeline",
        label: "Timeline legalità",
        description:
          "Voce legacy confluita nella sezione Legalità e memoria.",
        icon: Archive,
        state: "hidden",
        visibility: "hidden",
        canonicalHref: "/legalita",
        keywords: "timeline legalita memoria civica",
      },
    ],
  },
  {
    label: "Dati",
    description:
      "Dataset, fonti, copertura e metodo per capire cosa sappiamo e con quali limiti.",
    items: [
      {
        href: "/opendata",
        label: "Open data",
        description:
          "Catalogo dei dataset e delle risorse aperte disponibili per consultazione e riuso.",
        icon: Database,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "open data dati aperti dataset csv",
      },
      {
        href: "/fonti-dati",
        label: "Fonti dati",
        description:
          "Indice delle fonti pubbliche con stato del collegamento, frequenze attese e limiti.",
        icon: BookOpen,
        state: "available",
        visibility: "primary",
        keywords: "fonti dati qualita copertura aggiornamento",
      },
      {
        href: "/stato-monitoraggio",
        label: "Stato delle fonti",
        description:
          "Copertura e freschezza delle fonti censite, lette come controllo operativo.",
        icon: Gauge,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "stato fonti monitoraggio copertura freschezza",
      },
      {
        href: "/metodologia",
        label: "Metodologia",
        description:
          "Criteri e cautele per leggere dati, indicatori, ricorrenze e assenze informative.",
        icon: BookOpen,
        state: "available",
        visibility: "primary",
        keywords: "metodologia metodo cautele indicatori",
      },
      {
        href: "/statistiche",
        label: "Statistiche",
        description:
          "Sintesi numeriche di supporto per orientare consultazione e approfondimento.",
        icon: BarChart3,
        state: "in_progress",
        visibility: "search_only",
        hasUsefulPage: true,
        keywords: "statistiche grafici numeri",
      },
      {
        href: "/sviluppatori",
        label: "API e sviluppatori",
        description:
          "Informazioni tecniche per consultare API, endpoint e risorse aperte del progetto.",
        icon: Code2,
        state: "in_progress",
        visibility: "search_only",
        hasUsefulPage: true,
        keywords: "api sviluppatori json endpoint",
      },
      {
        href: "/feeds",
        label: "Feed e aggiornamenti",
        description:
          "Canali tecnici per seguire pubblicazioni e aggiornamenti del monitoraggio civico.",
        icon: Rss,
        state: "in_progress",
        visibility: "search_only",
        hasUsefulPage: true,
        keywords: "feed rss atom aggiornamenti",
      },
      {
        href: "/dati-elettorali",
        label: "Dati elettorali",
        description:
          "Percorso previsto per dati elettorali pubblici verificati e scaricabili.",
        icon: BarChart3,
        state: "planned",
        visibility: "hidden",
        hasUsefulPage: false,
        keywords: "dati elettorali voti preferenze",
      },
      {
        href: "/dataset-scaricabili",
        label: "Dataset scaricabili",
        description:
          "Raccolta prevista per export consolidati e documentati.",
        icon: Database,
        state: "planned",
        visibility: "hidden",
        hasUsefulPage: false,
        keywords: "dataset scaricabili download csv json",
      },
    ],
  },
  {
    label: "Partecipa",
    description:
      "Segnalazioni, accesso ai documenti e proposte: strumenti concreti di partecipazione civica.",
    items: [
      {
        href: "/segnalazioni",
        label: "Segnalazioni",
        description:
          "Segnala un dato da verificare o consulta criticità distinguendo fatti e interpretazioni.",
        icon: Megaphone,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "segnalazioni criticita nuova segnalazione fonte verifica",
      },
      {
        href: "/accesso-civico",
        label: "Accesso civico",
        description:
          "Orientamento per richiedere documenti e dati attraverso gli strumenti di accesso civico.",
        icon: FileSearch,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "accesso civico foia richiesta documenti dati",
      },
      {
        href: "/proposte-civiche",
        label: "Proposte civiche",
        description:
          "Proposte pubbliche e pratiche replicabili raccolte con stato, fonte e limiti.",
        icon: Archive,
        state: "in_progress",
        visibility: "primary",
        hasUsefulPage: true,
        keywords: "proposte civiche archivio proposte pratiche replicabili",
      },
      {
        href: "/iscrizioni",
        label: "Iscrizioni agli aggiornamenti",
        description:
          "Preferenze per ricevere aggiornamenti civici quando i canali sono configurati.",
        icon: Rss,
        state: "in_progress",
        visibility: "search_only",
        hasUsefulPage: true,
        keywords: "iscrizioni newsletter notifiche aggiornamenti",
      },
      {
        href: "/domande",
        label: "Domande civiche",
        description:
          "Percorso di orientamento tra atti, dati e strumenti del monitoraggio civico.",
        icon: BookOpenCheck,
        state: "in_progress",
        visibility: "search_only",
        hasUsefulPage: true,
        keywords: "domande civiche orientamento",
      },
      {
        href: "/temi",
        label: "Temi",
        description:
          "Indice tematico trasversale usato come supporto alla navigazione e alla ricerca.",
        icon: FileSearch,
        state: "in_progress",
        visibility: "search_only",
        hasUsefulPage: true,
        keywords: "temi argomenti categorie",
      },
      {
        href: "/archivio-proposte",
        label: "Archivio proposte",
        description:
          "Nome legacy della sezione Proposte civiche.",
        icon: Archive,
        state: "hidden",
        visibility: "hidden",
        canonicalHref: "/proposte-civiche",
        keywords: "archivio proposte proposte civiche",
      },
      {
        href: "/monitoraggio/nuovo",
        label: "Nuova segnalazione",
        description:
          "Azione legacy accorpata nella sezione Segnalazioni.",
        icon: Megaphone,
        state: "hidden",
        visibility: "hidden",
        canonicalHref: "/segnalazioni",
        keywords: "nuova segnalazione crea report",
      },
    ],
  },
  {
    label: "Progetto e supporto",
    description:
      "Documentazione del progetto, assistenza, canali di contatto e informazioni tecniche.",
    items: [
      {
        href: "/guida",
        label: "Guida",
        description: "Guida pratica per orientarsi tra sezioni, fonti e strumenti.",
        icon: BookOpen,
        state: "available",
        visibility: "search_only",
        keywords: "guida aiuto centro guida",
      },
      {
        href: "/roadmap",
        label: "Roadmap",
        description:
          "Stato pubblico, limiti e priorità prudenti dei moduli civici.",
        icon: CircleDotDashed,
        state: "in_progress",
        visibility: "search_only",
        hasUsefulPage: true,
        keywords: "roadmap sviluppo moduli priorita",
      },
      {
        href: "/note-legali",
        label: "Note legali",
        description:
          "Avvertenze e limiti d'uso delle informazioni pubblicate dal progetto.",
        icon: Scale3D,
        state: "available",
        visibility: "search_only",
        keywords: "note legali cautele responsabilita",
      },
      {
        href: "/chi-siamo",
        label: "Chi siamo",
        description:
          "Obiettivi, natura civica e approccio documentale di Lamezia Trasparente.",
        icon: Users,
        state: "available",
        visibility: "search_only",
        keywords: "chi siamo progetto civico",
      },
      {
        href: "/contatti",
        label: "Contatti",
        description: "Canali di contatto relativi al progetto e al monitoraggio civico.",
        icon: Megaphone,
        state: "available",
        visibility: "search_only",
        keywords: "contatti email canali",
      },
    ],
  },
];

function withRouteContract(item: NavItem): NavItem {
  const contract = getPublicV0RouteContract(item.href);
  return contract
    ? {
        ...item,
        v0Status: contract.status,
        v0StatusLabel: V0_ROUTE_STATUS_LABELS[contract.status],
      }
    : item;
}

export const ALL_NAV_GROUPS: NavSection[] = RAW_NAV_GROUPS.map((group) => ({
  ...group,
  items: group.items.map(withRouteContract),
}));

const MENU_VISIBILITIES = new Set<NavItemVisibility>([
  "primary",
  "secondary",
]);

export const NAV_GROUPS: NavSection[] = ALL_NAV_GROUPS.map((group) => ({
  ...group,
  items: group.items.filter(
    (item) => MENU_VISIBILITIES.has(item.visibility) && isNavItemNavigable(item),
  ),
})).filter((group) => group.items.length > 0);

export const COMMAND_PALETTE_GROUPS: NavSection[] = ALL_NAV_GROUPS.map(
  (group) => ({
    ...group,
    items: group.items.filter(
      (item) => item.visibility !== "hidden" && isNavItemNavigable(item),
    ),
  }),
).filter((group) => group.items.length > 0);

export function isSectionActive(href: string, location: string): boolean {
  const normalizedHref = normalizeSectionPath(href);
  const normalizedLocation = normalizeSectionPath(location);
  return (
    normalizedLocation === normalizedHref ||
    (normalizedHref !== "/" &&
      normalizedLocation.startsWith(`${normalizedHref}/`))
  );
}

function normalizeSectionPath(path: string): string {
  if (path === "/") return path;
  return path.replace(/\/+$/, "") || "/";
}

export function isNavItemNavigable(item: NavItem): boolean {
  return (
    item.state === "available" ||
    (item.state === "in_progress" && item.hasUsefulPage !== false)
  );
}

export function isNavItemUnavailable(item: NavItem): boolean {
  return !isNavItemNavigable(item);
}

export function isNavItemMuted(item: NavItem): boolean {
  return item.state !== "available";
}

export function getNavItemStateLabel(item: NavItem): string {
  return SECTION_STATE_SHORT_LABELS[item.state];
}

export function getCanonicalNavHref(item: NavItem): string {
  return item.canonicalHref ?? item.href;
}

export interface ActiveSection {
  group: NavSection;
  item: NavItem;
}

/**
 * Finds the navigable section whose list page exactly matches the location.
 * Search-only pages remain resolvable without being promoted to the main menu.
 */
export function findSectionByPath(location: string): ActiveSection | null {
  for (const group of COMMAND_PALETTE_GROUPS) {
    for (const item of group.items) {
      if (normalizeSectionPath(item.href) === normalizeSectionPath(location)) {
        return { group, item };
      }
    }
  }
  return null;
}
