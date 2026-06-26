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
  HandCoins,
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
    label: "Cosa decide il Comune",
    description:
      "Atti, sedute e documenti che spiegano decisioni e pubblicazioni ufficiali.",
    items: [
      {
        href: "/convocazioni",
        label: "Sedute e ordini del giorno",
        description:
          "Agenda di Consiglio e commissioni con avvisi, documenti, fonte e campi da verificare.",
        icon: CalendarClock,
        state: "available",
        keywords: "convocazioni sedute consiglio commissioni ordine del giorno",
      },
      {
        href: "/delibere",
        label: "Delibere e atti",
        description:
          "Decisioni di Giunta e Consiglio con documenti, allegati e limiti della fonte.",
        icon: Gavel,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "delibere atti giunta consiglio decisioni",
      },
      {
        href: "/albo",
        label: "Albo Pretorio",
        description:
          "Archivio permanente e navigabile degli atti pubblicati dal Comune.",
        icon: ShieldAlert,
        state: "available",
        keywords: "albo pretorio pubblicazioni atti ufficiali",
      },
      {
        href: "/atti-fondamentali",
        label: "Atti fondamentali",
        description: "Statuto, regolamenti e documenti che governano l'ente.",
        icon: ScrollText,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "statuto regolamenti atti fondamentali",
      },
      {
        href: "/pareri",
        label: "Pareri e vigilanza",
        description:
          "Voce specialistica tenuta fuori dalla navigazione primaria e leggibile dentro l'area atti.",
        icon: ShieldCheck,
        state: "hidden",
        canonicalHref: "/delibere",
        keywords: "pareri vigilanza revisori controllo",
      },
    ],
  },
  {
    label: "Chi governa e come vota",
    description:
      "Ruoli pubblici, organi dell'ente, macchina amministrativa e dati elettorali.",
    items: [
      {
        href: "/organi",
        label: "Organi istituzionali",
        description:
          "Consiglio, Giunta, commissioni e composizione con fonte e ultimo controllo.",
        icon: Building2,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "organi istituzionali consiglio giunta commissioni",
      },
      {
        href: "/amministratori",
        label: "Amministratori",
        description:
          "Sindaco, assessori e consiglieri con ruoli pubblici e dati da verificare.",
        icon: Users,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "sindaco assessori consiglieri amministratori",
      },
      {
        href: "/macchina-comunale",
        label: "Macchina comunale",
        description:
          "Capacita amministrativa, organico, scoperture e stato delle fonti.",
        icon: Network,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "macchina comunale organico personale uffici",
      },
      {
        href: "/elezioni-voti",
        label: "Elezioni e voti",
        description:
          "Percorso previsto per risultati, sezioni, preferenze e verifiche elettorali.",
        icon: BarChart3,
        state: "planned",
        hasUsefulPage: false,
        keywords: "elezioni voti preferenze sezioni elettorali",
      },
    ],
  },
  {
    label: "Cosa viene finanziato e realizzato",
    description:
      "Contratti, progetti, incarichi e indicatori da leggere con fonte e metodo.",
    items: [
      {
        href: "/contratti",
        label: "Contratti pubblici",
        description:
          "Gare, affidamenti e fornitori leggibili come schede documentali, senza promettere copertura completa.",
        icon: FileText,
        state: "available",
        keywords: "contratti appalti gare affidamenti fornitori cig",
      },
      {
        href: "/pnrr",
        label: "PNRR",
        description:
          "Progetti finanziati, luoghi, CUP e collegamenti da verificare sulle fonti.",
        icon: Landmark,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "pnrr cup progetti finanziamenti cantieri",
      },
      {
        href: "/incarichimetro",
        label: "Incarichi e consulenze",
        description:
          "Incarichi, consulenze, ricorrenze e rotazioni come segnali documentali da verificare.",
        icon: ClipboardList,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "incarichi consulenze incarichimetro ricorrenza rotazione operatori",
      },
      {
        href: "/performance",
        label: "Performance",
        description:
          "Indicatori amministrativi come segnali documentali, non giudizi automatici.",
        icon: Gauge,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "performance indicatori kpi qualita vita",
      },
      {
        href: "/bandi",
        label: "Bandi e avvisi",
        description:
          "Voce legacy confluita nella lettura piu ampia dei contratti pubblici.",
        icon: HandCoins,
        state: "hidden",
        canonicalHref: "/contratti",
        keywords: "bandi avvisi finanziamenti contributi",
      },
      {
        href: "/performance/confronta",
        label: "Confronto performance",
        description:
          "Voce legacy confluita nella sezione Performance per evitare un doppione primario.",
        icon: BarChart3,
        state: "hidden",
        canonicalHref: "/performance",
        keywords: "confronto performance indicatori",
      },
    ],
  },
  {
    label: "Criticità e luoghi della città",
    description:
      "Elementi civici da verificare e leggere senza trasformare segnali in accuse.",
    items: [
      {
        href: "/criticita-pubbliche",
        label: "Criticità pubbliche",
        description:
          "Registro di criticita documentali con fonte, stato di verifica e dati mancanti.",
        icon: ShieldAlert,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "criticita pubbliche segnalazioni verifiche fonti",
      },
      {
        href: "/monitoraggio",
        label: "Monitor civico",
        description:
          "Hub legacy tenuto raggiungibile ma non mostrato come macro-sezione primaria.",
        icon: Telescope,
        state: "hidden",
        canonicalHref: "/criticita-pubbliche",
        keywords: "monitoraggio civico monithon verifiche",
      },
    ],
  },
  {
    label: "Memoria civica e antimafia",
    description:
      "Memoria pubblica, beni confiscati e percorsi culturali con disciplina di fonte.",
    items: [
      {
        href: "/beni-confiscati",
        label: "Beni confiscati",
        description:
          "Patrimoni confiscati, geografie e riuso sociale con cautele e fonti.",
        icon: ShieldOff,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "beni confiscati anbsc riuso sociale antimafia",
      },
      {
        href: "/legalita",
        label: "Legalità e memoria",
        description:
          "Percorsi su legalita, prevenzione, riuso civico e fonti pubbliche con linguaggio prudente.",
        icon: Scale,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "legalita memoria antimafia trasparenza",
      },
      {
        href: "/legalita/trame-festival",
        label: "Trame - Festival",
        description:
          "Idee e analisi da Trame pubblicabili solo con fonte, minuto video e verifica redazionale.",
        icon: BookOpenCheck,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "trame festival legalita antimafia cultura",
      },
      {
        href: "/legalita/timeline",
        label: "Timeline legalità",
        description:
          "Voce legacy confluita in Legalita e memoria per ridurre la frammentazione.",
        icon: Archive,
        state: "hidden",
        canonicalHref: "/legalita",
        keywords: "timeline legalita memoria civica",
      },
    ],
  },
  {
    label: "Partecipazione e proposte",
    description:
      "Proposte, accesso civico e segnalazioni come azioni civiche verificabili.",
    items: [
      {
        href: "/proposte-civiche",
        label: "Proposte civiche",
        description:
          "Proposte pubbliche e pratiche replicabili raccolte con stato, fonte e limiti.",
        icon: Archive,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "proposte civiche demi archivio proposte pratiche replicabili",
      },
      {
        href: "/accesso-civico",
        label: "Accesso civico",
        description: "Richiedi documenti e dati con l'accesso civico (FOIA).",
        icon: FileSearch,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "accesso civico foia richiesta documenti dati",
      },
      {
        href: "/segnalazioni",
        label: "Segnalazioni",
        description:
          "Segnala un dato da verificare o consulta criticita pubbliche distinguendo fatti e interpretazioni.",
        icon: Megaphone,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "segnalazioni criticita nuova segnalazione fonte verifica",
      },
      {
        href: "/domande",
        label: "Domande civiche",
        description:
          "Percorso di orientamento mantenuto fuori dalle macro-sezioni primarie.",
        icon: BookOpenCheck,
        state: "hidden",
        canonicalHref: "/proposte-civiche",
        keywords: "domande civiche orientamento",
      },
      {
        href: "/temi",
        label: "Temi",
        description: "Indice tematico mantenuto come supporto, non come sezione primaria.",
        icon: FileSearch,
        state: "hidden",
        keywords: "temi argomenti categorie",
      },
      {
        href: "/archivio-proposte",
        label: "Archivio proposte",
        description:
          "Nome legacy della sezione Proposte civiche.",
        icon: Archive,
        state: "hidden",
        canonicalHref: "/proposte-civiche",
        keywords: "archivio proposte proposte civiche",
      },
      {
        href: "/monitoraggio/nuovo",
        label: "Nuova segnalazione",
        description:
          "Azione legacy accorpata dentro Segnalazioni.",
        icon: Megaphone,
        state: "hidden",
        canonicalHref: "/segnalazioni",
        keywords: "nuova segnalazione crea report",
      },
    ],
  },
  {
    label: "Dati pubblici e territorio",
    description:
      "Dati territoriali, open data e dataset futuri senza confonderli con sezioni civiche gia complete.",
    items: [
      {
        href: "/atlante-territoriale",
        label: "Atlante territoriale",
        description:
          "Mappa per sezioni censuarie ISTAT con indicatori, fonte, anno e limiti sempre visibili.",
        icon: MapPinned,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "atlante territoriale mappa istat sezioni censuarie",
      },
      {
        href: "/opendata",
        label: "Open data",
        description: "Catalogo di risorse aperte e riutilizzabili quando disponibili.",
        icon: Database,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "open data dati aperti dataset csv",
      },
      {
        href: "/dati-elettorali",
        label: "Dati elettorali",
        description:
          "Percorso previsto per dati elettorali pubblici verificati e scaricabili.",
        icon: BarChart3,
        state: "planned",
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
        hasUsefulPage: false,
        keywords: "dataset scaricabili download csv json",
      },
      {
        href: "/statistiche",
        label: "Statistiche",
        description:
          "Sintesi numeriche mantenute come supporto, non come macro-area autonoma.",
        icon: BarChart3,
        state: "hidden",
        canonicalHref: "/opendata",
        keywords: "statistiche grafici numeri",
      },
      {
        href: "/sviluppatori",
        label: "API",
        description:
          "Voce tecnica da collocare nel footer o nella documentazione, non tra le sezioni civiche primarie.",
        icon: Code2,
        state: "hidden",
        canonicalHref: "/opendata",
        keywords: "api sviluppatori json endpoint",
      },
    ],
  },
  {
    label: "Stato delle fonti e monitoraggio",
    description:
      "Metodo, roadmap e strumenti di monitoraggio letti come stato del progetto, non come sezioni civiche equivalenti.",
    items: [
      {
        href: "/stato-monitoraggio",
        label: "Stato delle fonti",
        description:
          "Copertura e freschezza delle fonti censite, da leggere come controllo operativo.",
        icon: Gauge,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "stato fonti monitoraggio copertura freschezza",
      },
      {
        href: "/metodologia",
        label: "Metodologia",
        description:
          "Come leggere dati, indicatori e assenze informative come segnali documentali da verificare.",
        icon: BookOpen,
        state: "available",
        keywords: "metodologia metodo cautele indicatori",
      },
      {
        href: "/promessometro",
        label: "Promessometro",
        description:
          "Collega promesse programmatiche, atti e stati documentali senza scoring politico.",
        icon: BookOpenCheck,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "promessometro programma promesse atti",
      },
      {
        href: "/roadmap",
        label: "Roadmap",
        description:
          "Stato pubblico, limiti e priorita prudenti dei moduli civici.",
        icon: CircleDotDashed,
        state: "in_progress",
        hasUsefulPage: true,
        keywords: "roadmap sviluppo moduli priorita",
      },
      {
        href: "/incarichimetro",
        label: "Incarichimetro",
        description:
          "Nome tecnico del modulo Incarichi e consulenze, tenuto come keyword e non come seconda card.",
        icon: ClipboardList,
        state: "hidden",
        canonicalHref: "/incarichimetro",
        keywords: "incarichimetro incarichi consulenze",
      },
      {
        href: "/fonti-dati",
        label: "Fonti dati",
        description:
          "Pagina tecnica di supporto raggiungibile dal footer e dalla documentazione.",
        icon: BookOpen,
        state: "hidden",
        canonicalHref: "/stato-monitoraggio",
        keywords: "fonti dati qualita dati limiti",
      },
      {
        href: "/feeds",
        label: "Feed",
        description: "Canali tecnici di aggiornamento fuori dalle sezioni civiche primarie.",
        icon: Rss,
        state: "hidden",
        keywords: "feed rss atom aggiornamenti",
      },
      {
        href: "/iscrizioni",
        label: "Iscrizioni",
        description:
          "Preferenze per aggiornamenti civici quando i canali saranno configurati.",
        icon: Rss,
        state: "hidden",
        keywords: "iscrizioni newsletter notifiche",
      },
      {
        href: "/note-legali",
        label: "Note legali",
        description:
          "Avvertenze da mantenere nel footer tecnico e nelle pagine di metodo.",
        icon: Scale3D,
        state: "hidden",
        canonicalHref: "/metodologia",
        keywords: "note legali cautele responsabilita",
      },
      {
        href: "/guida",
        label: "Guida",
        description:
          "Supporto d'uso del sito, non macro-area civica primaria.",
        icon: BookOpen,
        state: "hidden",
        keywords: "guida aiuto centro guida",
      },
      {
        href: "/chi-siamo",
        label: "Chi siamo",
        description:
          "Pagina istituzionale del progetto, non macro-area civica primaria.",
        icon: Users,
        state: "hidden",
        keywords: "chi siamo progetto civico",
      },
      {
        href: "/contatti",
        label: "Contatti",
        description:
          "Canali di contatto da mantenere nel footer.",
        icon: Megaphone,
        state: "hidden",
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

export const NAV_GROUPS: NavSection[] = ALL_NAV_GROUPS.map((group) => ({
  ...group,
  items: group.items.filter((item) => item.state !== "hidden"),
})).filter((group) => group.items.length > 0);

export const COMMAND_PALETTE_GROUPS: NavSection[] = NAV_GROUPS.map((group) => ({
  ...group,
  items: group.items.filter((item) => isNavItemNavigable(item)),
})).filter((group) => group.items.length > 0);

export function isSectionActive(href: string, location: string): boolean {
  return location === href || (href !== "/" && location.startsWith(`${href}/`));
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
 * Finds the section whose list page exactly matches the current location.
 * Detail pages provide their own back-navigation, so the breadcrumb header
 * is intentionally limited to the list pages themselves.
 */
export function findSectionByPath(location: string): ActiveSection | null {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href === location) {
        return { group, item };
      }
    }
  }
  return null;
}
