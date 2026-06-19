import {
  ShieldAlert,
  BarChart3,
  FileText,
  ClipboardList,
  FileSearch,
  Megaphone,
  Gavel,
  CalendarClock,
  Landmark,
  Users,
  Network,
  Building2,
  ShieldCheck,
  Database,
  Gauge,
  ScrollText,
  Scale,
  HandCoins,
  ShieldOff,
  Telescope,
  BookOpenCheck,
  Archive,
  Rss,
  Code2,
  BookOpen,
  CircleDotDashed,
  Scale3D,
  MapPinned,
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
    label: "Atti e trasparenza",
    items: [
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
        href: "/delibere",
        label: "Delibere",
        description: "Decisioni di Giunta e Consiglio con voti e allegati.",
        icon: Gavel,
      },
      {
        href: "/convocazioni",
        label: "Sedute",
        description:
          "Agenda di Consiglio e commissioni con avvisi, ordini del giorno e limiti della fonte consultata.",
        icon: CalendarClock,
      },
      {
        href: "/pareri",
        label: "Pareri",
        description:
          "Controlli e pareri dei revisori e degli organi di vigilanza.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Legalità",
    items: [
      {
        href: "/legalita",
        label: "Legalità",
        description:
          "Impegni, prevenzione della corruzione e obblighi di trasparenza.",
        icon: Scale,
      },
      {
        href: "/beni-confiscati",
        label: "Beni confiscati",
        description:
          "Patrimoni confiscati e percorsi di riuso sociale documentati con cautele e fonti.",
        icon: ShieldOff,
      },
    ],
  },
  {
    label: "Spesa e contratti",
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
          "Concentrazione, ricorrenza e rotazione negli incarichi esterni.",
        icon: ClipboardList,
      },
      {
        href: "/bandi",
        label: "Bandi",
        description: "Contributi, fondi e opportunità di finanziamento.",
        icon: HandCoins,
      },
      {
        href: "/pnrr",
        label: "PNRR",
        description:
          "Schede PNRR e collegamenti disponibili, da leggere con stato di verifica e fonte richiamata.",
        icon: Landmark,
      },
    ],
  },
  {
    label: "Organi e persone",
    items: [
      {
        href: "/organi",
        label: "Organi istituzionali",
        description: "Consiglio, Giunta e commissioni del Comune.",
        icon: Building2,
      },
      {
        href: "/amministratori",
        label: "Amministratori",
        description: "Sindaco, assessori e consiglieri in carica.",
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
    label: "Monitoraggio civico",
    items: [
      {
        href: "/monitoraggio",
        label: "Monitor civico",
        description:
          "Hub documentale per collegare segnalazioni, atti, PNRR, incarichi e accesso civico come elementi da verificare.",
        icon: Telescope,
      },
      {
        href: "/stato-monitoraggio",
        label: "Stato monitoraggio",
        description:
          "Copertura e freschezza delle fonti censite, da leggere come controllo operativo e non come valutazione sostanziale.",
        icon: Gauge,
      },
      {
        href: "/promessometro",
        label: "Promessometro",
        description:
          "Collega promesse programmatiche, atti e stati documentali senza scoring politico.",
        icon: BookOpenCheck,
      },
      {
        href: "/roadmap",
        label: "Roadmap",
        description:
          "Stato pubblico, limiti e priorità prudenti dei moduli civici.",
        icon: CircleDotDashed,
      },
    ],
  },
  {
    label: "Partecipazione",
    items: [
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
    ],
  },
  {
    label: "Dati e analisi",
    items: [
      {
        href: "/performance",
        label: "Performance",
        description: "Indicatori e obiettivi di rendimento dell'ente.",
        icon: Gauge,
      },
      {
        href: "/statistiche",
        label: "Statistiche",
        description: "Numeri e grafici che sintetizzano i dati pubblici.",
        icon: BarChart3,
      },
      {
        href: "/atlante-territoriale",
        label: "Atlante territoriale",
        description:
          "Mappa di Lamezia Terme per sezioni censuarie ISTAT, con fonti e limiti sempre visibili.",
        icon: MapPinned,
      },
      {
        href: "/opendata",
        label: "Open Data",
        description: "Dataset scaricabili in formato aperto e riutilizzabile.",
        icon: Database,
      },
      {
        href: "/fonti-dati",
        label: "Fonti dati",
        description:
          "Quali fonti alimentano la versione pubblica, con stato del collegamento, frequenza attesa e limiti informativi.",
        icon: BookOpen,
      },
      {
        href: "/metodologia",
        label: "Metodologia",
        description:
          "Come leggere dati, indicatori e assenze informative come segnali documentali da verificare.",
        icon: FileSearch,
      },
      {
        href: "/note-legali",
        label: "Note legali",
        description:
          "Avvertenze per consultare la piattaforma senza dedurre responsabilità o completezza dai dati pubblicati.",
        icon: Scale3D,
      },
    ],
  },
  {
    label: "Strumenti",
    items: [
      {
        href: "/feeds",
        label: "Feed",
        description: "Iscriviti agli aggiornamenti via RSS ed email.",
        icon: Rss,
      },
      {
        href: "/sviluppatori",
        label: "API",
        description: "Accedi ai dati tramite API pubbliche e documentazione.",
        icon: Code2,
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
  return Boolean(item.v0Status && item.v0Status !== "pubblicabile");
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
