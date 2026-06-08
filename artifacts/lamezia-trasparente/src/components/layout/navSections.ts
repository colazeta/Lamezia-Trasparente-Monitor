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
  Building2,
  ShieldCheck,
  Database,
  Gauge,
  ScrollText,
  Scale,
  HandCoins,
  ShieldOff,
  Telescope,
  Rss,
  Code2,
  BookOpen,
  CircleDotDashed,
  Scale3D,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavSection[] = [
  {
    label: "Trasparenza & Atti",
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
        label: "Atti Fondamentali",
        description:
          "Statuto, regolamenti e documenti che governano l'ente.",
        icon: ScrollText,
      },
      {
        href: "/delibere",
        label: "Delibere",
        description:
          "Decisioni di Giunta e Consiglio con voti e allegati.",
        icon: Gavel,
      },
      {
        href: "/convocazioni",
        label: "Convocazioni",
        description:
          "Calendario delle sedute degli organi istituzionali.",
        icon: CalendarClock,
      },
      {
        href: "/pareri",
        label: "Pareri di Vigilanza",
        description:
          "Controlli e pareri dei revisori e degli organi di vigilanza.",
        icon: ShieldCheck,
      },
      {
        href: "/legalita",
        label: "Legalità e Trasparenza",
        description:
          "Impegni e misure contro la corruzione e per la trasparenza.",
        icon: Scale,
      },
    ],
  },
  {
    label: "Spesa & Contratti",
    items: [
      {
        href: "/contratti",
        label: "Contratti & Appalti",
        description: "Gare, affidamenti e fornitori del Comune.",
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
        label: "Bandi e Finanziamenti",
        description:
          "Contributi, fondi e opportunità di finanziamento.",
        icon: HandCoins,
      },
      {
        href: "/pnrr",
        label: "PNRR",
        description:
          "Progetti e fondi del Piano Nazionale di Ripresa e Resilienza.",
        icon: Landmark,
      },
      {
        href: "/beni-confiscati",
        label: "Beni Confiscati",
        description:
          "Patrimoni sottratti alla criminalità e riassegnati alla collettività.",
        icon: ShieldOff,
      },
    ],
  },
  {
    label: "Organi & Persone",
    items: [
      {
        href: "/organi",
        label: "Organi Istituzionali",
        description: "Consiglio, Giunta e commissioni del Comune.",
        icon: Building2,
      },
      {
        href: "/amministratori",
        label: "Amministratori",
        description: "Sindaco, assessori e consiglieri in carica.",
        icon: Users,
      },
    ],
  },
  {
    label: "Partecipazione",
    items: [
      {
        href: "/temi",
        label: "Temi",
        description:
          "Esplora gli argomenti che attraversano i dati pubblici.",
        icon: FileSearch,
      },
      {
        href: "/monitoraggio",
        label: "Monitoraggio Civico",
        description:
          "Segui e racconta lo stato di opere e finanziamenti.",
        icon: Telescope,
      },
      {
        href: "/accesso-civico",
        label: "Accesso Civico",
        description:
          "Richiedi documenti e dati con l'accesso civico (FOIA).",
        icon: FileSearch,
      },
      {
        href: "/segnalazioni",
        label: "Segnalazioni",
        description: "Segnala anomalie, sprechi o disservizi.",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "Dati & Analisi",
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
        description:
          "Numeri e grafici che sintetizzano i dati pubblici.",
        icon: BarChart3,
      },
      {
        href: "/opendata",
        label: "Open Data",
        description:
          "Dataset scaricabili in formato aperto e riutilizzabile.",
        icon: Database,
      },
      {
        href: "/fonti-dati",
        label: "Fonti dati",
        description:
          "Origine, stato, frequenza e limiti delle fonti monitorate.",
        icon: BookOpen,
      },
      {
        href: "/metodologia",
        label: "Metodologia",
        description:
          "Metodo di raccolta, trattamento e lettura prudente degli indicatori.",
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
          "Cautele interpretative e uso responsabile dei dati civici.",
        icon: Scale3D,
      },
    ],
  },
  {
    label: "Strumenti",
    items: [
      {
        href: "/feeds",
        label: "Feed e Abbonamenti",
        description: "Iscriviti agli aggiornamenti via RSS ed email.",
        icon: Rss,
      },
      {
        href: "/sviluppatori",
        label: "API e Sviluppatori",
        description:
          "Accedi ai dati tramite API pubbliche e documentazione.",
        icon: Code2,
      },
    ],
  },
];

export function isSectionActive(href: string, location: string): boolean {
  return location === href || (href !== "/" && location.startsWith(href));
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
