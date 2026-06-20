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

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  v0Status?: V0RouteStatus;
  v0StatusLabel?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const RAW_NAV_GROUPS: NavSection[] = [
  {
    label: "Cosa decide il Comune",
    items: [
      {
        href: "/convocazioni",
        label: "Sedute e ordini del giorno",
        description:
          "Agenda di Consiglio e commissioni con avvisi, documenti, fonte e campi da verificare.",
        icon: CalendarClock,
      },
      {
        href: "/delibere",
        label: "Delibere",
        description:
          "Decisioni di Giunta e Consiglio con documenti, allegati e limiti della fonte.",
        icon: Gavel,
      },
      {
        href: "/albo",
        label: "Albo Pretorio",
        description:
          "Archivio permanente e navigabile degli atti pubblicati dal Comune.",
        icon: ShieldAlert,
      },
      {
        href: "/atti-fondamentali",
        label: "Atti fondamentali",
        description: "Statuto, regolamenti e documenti che governano l'ente.",
        icon: ScrollText,
      },
      {
        href: "/pareri",
        label: "Pareri e vigilanza",
        description:
          "Controlli e pareri dei revisori e degli organi di vigilanza.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Chi partecipa e come vota",
    items: [
      {
        href: "/organi",
        label: "Organi istituzionali",
        description:
          "Consiglio, Giunta, commissioni e composizione con fonte e ultimo controllo.",
        icon: Building2,
      },
      {
        href: "/amministratori",
        label: "Amministratori",
        description:
          "Sindaco, assessori e consiglieri con ruoli pubblici e dati da verificare.",
        icon: Users,
      },
      {
        href: "/macchina-comunale",
        label: "Macchina comunale",
        description:
          "Capacità amministrativa, organico, scoperture e stato delle fonti.",
        icon: Network,
      },
    ],
  },
  {
    label: "Cosa viene finanziato e realizzato",
    items: [
      {
        href: "/pnrr",
        label: "PNRR",
        description:
          "Progetti finanziati, luoghi, CUP e collegamenti da verificare sulle fonti.",
        icon: Landmark,
      },
      {
        href: "/bandi",
        label: "Bandi e avvisi",
        description:
          "Contributi, fondi, avvisi e opportunità con stato, fonte e scadenze da verificare.",
        icon: HandCoins,
      },
      {
        href: "/performance",
        label: "Performance",
        description:
          "Indicatori amministrativi come segnali documentali, non giudizi automatici.",
        icon: Gauge,
      },
      {
        href: "/performance/confronta",
        label: "Confronto performance",
        description:
          "Confronta indicatori solo quando fonte, periodo e metodo sono dichiarati.",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Come vengono spesi soldi e incarichi",
    items: [
      {
        href: "/contratti",
        label: "Contratti",
        description:
          "Gare, affidamenti e fornitori leggibili come schede documentali, senza promettere copertura completa.",
        icon: FileText,
      },
      {
        href: "/incarichimetro",
        label: "Incarichimetro",
        description:
          "Concentrazione, ricorrenza e rotazione negli incarichi come segnali da verificare.",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Cosa succede nei luoghi della città",
    items: [
      {
        href: "/beni-confiscati",
        label: "Beni confiscati",
        description:
          "Patrimoni confiscati, geografie e riuso sociale con cautele e fonti.",
        icon: ShieldOff,
      },
      {
        href: "/monitoraggio",
        label: "Monitor civico",
        description:
          "Hub documentale per collegare segnalazioni, atti, PNRR, incarichi e accesso civico come elementi da verificare.",
        icon: Telescope,
      },
      {
        href: "/criticita-pubbliche",
        label: "Criticità pubbliche",
        description:
          "Registro di criticità documentali con fonte, stato di verifica e dati mancanti.",
        icon: ShieldAlert,
      },
    ],
  },
  {
    label: "Memoria civica e antimafia",
    items: [
      {
        href: "/legalita",
        label: "Legalità",
        description:
          "Percorsi su legalità, prevenzione, riuso civico e fonti pubbliche con linguaggio prudente.",
        icon: Scale,
      },
      {
        href: "/legalita/timeline",
        label: "Timeline legalità",
        description:
          "Memoria civica e antimafia con eventi pubblicabili solo dopo verifica fonte.",
        icon: Archive,
      },
      {
        href: "/legalita/trame-festival",
        label: "Trame - Festival",
        description:
          "Idee e analisi da Trame pubblicabili solo con fonte, minuto video e verifica redazionale.",
        icon: BookOpenCheck,
      },
    ],
  },
  {
    label: "Partecipazione e proposte",
    items: [
      {
        href: "/domande",
        label: "Domande civiche",
        description:
          "Percorsi guidati dalle domande concrete dei cittadini verso dati e fonti.",
        icon: BookOpenCheck,
      },
      {
        href: "/temi",
        label: "Temi",
        description: "Esplora gli argomenti che attraversano i dati pubblici.",
        icon: FileSearch,
      },
      {
        href: "/archivio-proposte",
        label: "Archivio proposte",
        description:
          "Memoria documentale neutra delle proposte pubbliche di valore civico.",
        icon: Archive,
      },
      {
        href: "/promessometro",
        label: "Promessometro",
        description:
          "Collega promesse programmatiche, atti e stati documentali senza scoring politico.",
        icon: BookOpenCheck,
      },
      {
        href: "/accesso-civico",
        label: "Accesso civico",
        description: "Richiedi documenti e dati con l'accesso civico (FOIA).",
        icon: FileSearch,
      },
      {
        href: "/segnalazioni",
        label: "Segnalazioni",
        description:
          "Segnala una trasparenza da verificare o un disservizio documentato, distinguendo fatti e interpretazioni.",
        icon: Megaphone,
      },
      {
        href: "/monitoraggio/nuovo",
        label: "Nuova segnalazione",
        description:
          "Proponi un elemento di monitoraggio con fatti, fonti e dati mancanti distinti.",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "Stato delle fonti e del monitoraggio",
    items: [
      {
        href: "/fonti-dati",
        label: "Fonti dati",
        description:
          "Quali fonti alimentano la versione pubblica, con stato del collegamento, frequenza attesa e limiti informativi.",
        icon: BookOpen,
      },
      {
        href: "/stato-monitoraggio",
        label: "Stato monitoraggio",
        description:
          "Copertura e freschezza delle fonti censite, da leggere come controllo operativo.",
        icon: Gauge,
      },
      {
        href: "/opendata",
        label: "Open Data",
        description: "Dataset scaricabili in formato aperto e riutilizzabile.",
        icon: Database,
      },
      {
        href: "/statistiche",
        label: "Statistiche",
        description:
          "Numeri e grafici che sintetizzano il perimetro dati disponibile, non fonti complete.",
        icon: BarChart3,
      },
      {
        href: "/atlante-territoriale",
        label: "Atlante territoriale",
        description:
          "Mappa per sezioni censuarie ISTAT con indicatori, fonte, anno e limiti sempre visibili.",
        icon: MapPinned,
      },
      {
        href: "/feeds",
        label: "Feed",
        description:
          "Canali di aggiornamento del monitor, con frequenza e limiti dichiarati.",
        icon: Rss,
      },
      {
        href: "/iscrizioni",
        label: "Iscrizioni",
        description:
          "Preferenze per aggiornamenti civici quando i canali saranno configurati.",
        icon: Rss,
      },
      {
        href: "/sviluppatori",
        label: "API",
        description:
          "Accedi ai dati tramite API pubbliche, dataset e documentazione tecnica.",
        icon: Code2,
      },
      {
        href: "/metodologia",
        label: "Metodologia",
        description:
          "Come leggere dati, indicatori e assenze informative come segnali documentali da verificare.",
        icon: FileSearch,
      },
      {
        href: "/roadmap",
        label: "Roadmap",
        description:
          "Stato pubblico, limiti e priorità prudenti dei moduli civici.",
        icon: CircleDotDashed,
      },
      {
        href: "/note-legali",
        label: "Note legali",
        description:
          "Avvertenze per consultare la piattaforma senza dedurre responsabilità o completezza dai dati pubblicati.",
        icon: Scale3D,
      },
      {
        href: "/guida",
        label: "Guida",
        description:
          "Percorso pratico per usare sezioni, stati e fonti senza perdere le cautele.",
        icon: BookOpen,
      },
      {
        href: "/chi-siamo",
        label: "Chi siamo",
        description:
          "Natura civica del progetto, limiti e rapporto con le fonti ufficiali.",
        icon: Users,
      },
      {
        href: "/contatti",
        label: "Contatti",
        description:
          "Canali per proporre correzioni, richieste e contributi verificabili.",
        icon: Megaphone,
      },
    ],
  },
];

export const NAV_GROUPS: NavSection[] = RAW_NAV_GROUPS.map((group) => ({
  ...group,
  items: group.items.map((item) => {
    const contract = getPublicV0RouteContract(item.href);
    return contract
      ? {
          ...item,
          v0Status: contract.status,
          v0StatusLabel: V0_ROUTE_STATUS_LABELS[contract.status],
        }
      : item;
  }),
}));

export function isSectionActive(href: string, location: string): boolean {
  return location === href || (href !== "/" && location.startsWith(`${href}/`));
}

export function isNavItemUnavailable(item: NavItem): boolean {
  return Boolean(
    item.v0Status && !["pubblicabile", "sperimentale"].includes(item.v0Status),
  );
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
