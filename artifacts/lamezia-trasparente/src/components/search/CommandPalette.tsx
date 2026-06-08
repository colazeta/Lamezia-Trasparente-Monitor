import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ShieldAlert,
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
  HandCoins,
  ShieldOff,
  Telescope,
  Rss,
  Code2,
  Database,
  Gauge,
  BarChart3,
  ScrollText,
  Scale,
  HelpCircle,
  Home,
  Search,
  Clock,
  BookOpen,
  BookOpenCheck,
  Scale3D,
  Info,
  Mail,
  MailQuestion,
  CircleDotDashed,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  group: string;
  keywords?: string;
}

const ALL_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, group: "Navigazione" },
  { href: "/domande", label: "Domande & Risposte", icon: HelpCircle, group: "Navigazione" },
  { href: "/guida", label: "Centro Guida", icon: BookOpen, group: "Navigazione", keywords: "tour assistente aiuto guida storia progetto" },
  { href: "/chi-siamo", label: "Chi siamo", icon: Info, group: "Navigazione", keywords: "progetto indipendente natura civica governance fonti comune" },
  { href: "/contatti", label: "Contatti", icon: Mail, group: "Navigazione", keywords: "contatti segnalazioni accesso civico canale redazionale" },

  { href: "/albo", label: "Albo Pretorio", icon: ShieldAlert, group: "Trasparenza & Atti", keywords: "pubblicazioni atti ufficiali" },
  { href: "/atti-fondamentali", label: "Atti Fondamentali", icon: ScrollText, group: "Trasparenza & Atti", keywords: "statuto regolamenti" },
  { href: "/delibere", label: "Delibere", icon: Gavel, group: "Trasparenza & Atti", keywords: "consiglio giunta votazione" },
  { href: "/convocazioni", label: "Convocazioni", icon: CalendarClock, group: "Trasparenza & Atti", keywords: "sedute agenda calendario" },
  { href: "/pareri", label: "Pareri di Vigilanza", icon: ShieldCheck, group: "Trasparenza & Atti", keywords: "revisori controllo" },
  { href: "/legalita", label: "Legalità e Trasparenza", icon: Scale, group: "Trasparenza & Atti", keywords: "anticorruzione trasparenza" },

  { href: "/contratti", label: "Contratti & Appalti", icon: FileText, group: "Spesa & Contratti", keywords: "gare fornitori cig" },
  { href: "/incarichimetro", label: "Incarichimetro", icon: ClipboardList, group: "Spesa & Contratti", keywords: "incarichi consulenze ricorrenza rotazione operatori beneficiari cig cup" },
  { href: "/bandi", label: "Bandi e Finanziamenti", icon: HandCoins, group: "Spesa & Contratti", keywords: "contributi fondi europei" },
  { href: "/pnrr", label: "PNRR", icon: Landmark, group: "Spesa & Contratti", keywords: "piano ripresa resilienza cup" },
  { href: "/beni-confiscati", label: "Beni Confiscati", icon: ShieldOff, group: "Spesa & Contratti", keywords: "anbsc mafia patrimonio" },

  { href: "/organi", label: "Organi Istituzionali", icon: Building2, group: "Organi & Persone", keywords: "consiglio giunta commissioni" },
  { href: "/amministratori", label: "Amministratori", icon: Users, group: "Organi & Persone", keywords: "sindaco assessori consiglieri" },

  { href: "/temi", label: "Temi", icon: FileSearch, group: "Partecipazione", keywords: "argomenti categorie" },
  { href: "/monitoraggio", label: "Monitoraggio Civico", icon: Telescope, group: "Partecipazione", keywords: "monithon cantieri lavori" },
  { href: "/promessometro", label: "Promessometro", icon: BookOpenCheck, group: "Partecipazione", keywords: "programma promesse atti indirizzo attuazione stato documentale" },
  { href: "/accesso-civico", label: "Accesso Civico", icon: FileSearch, group: "Partecipazione", keywords: "foia istanza richiesta" },
  { href: "/segnalazioni", label: "Segnalazioni", icon: Megaphone, group: "Partecipazione", keywords: "segnale civico verifica accesso civico richiesta formale" },

  { href: "/performance", label: "Performance", icon: Gauge, group: "Dati & Analisi", keywords: "indicatori kpi misurazione" },
  { href: "/statistiche", label: "Statistiche", icon: BarChart3, group: "Dati & Analisi", keywords: "grafici numeri dati" },
  { href: "/opendata", label: "Open Data", icon: Database, group: "Dati & Analisi", keywords: "dataset csv download" },
  { href: "/fonti-dati", label: "Fonti dati", icon: BookOpen, group: "Dati & Analisi", keywords: "fonti ufficiali estratti arricchiti limiti aggiornamento" },
  { href: "/metodologia", label: "Metodologia", icon: FileSearch, group: "Dati & Analisi", keywords: "metodo indicatori cautela verifiche" },
  { href: "/roadmap", label: "Roadmap", icon: CircleDotDashed, group: "Dati & Analisi", keywords: "stato moduli priorità limiti pianificato sviluppo sperimentale" },
  { href: "/note-legali", label: "Note legali", icon: Scale3D, group: "Dati & Analisi", keywords: "cautele indicatori interpretazione legalità" },

  { href: "/feeds", label: "Feed e Abbonamenti", icon: Rss, group: "Strumenti", keywords: "rss atom notifiche" },
  { href: "/sviluppatori", label: "API e Sviluppatori", icon: Code2, group: "Strumenti", keywords: "json rest endpoint" },
  { href: "/iscrizioni", label: "Centro Iscrizioni", icon: Rss, group: "Strumenti", keywords: "email newsletter" },
];

const GROUPS = [
  "Navigazione",
  "Trasparenza & Atti",
  "Spesa & Contratti",
  "Organi & Persone",
  "Partecipazione",
  "Dati & Analisi",
  "Strumenti",
];

const RECENTS_STORAGE_KEY = "lt-command-palette-recents";
const RECENTS_MAX = 5;
const RECENTS_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface RecentEntry {
  href: string;
  visitedAt: number;
}

function readRecents(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    const valid = parsed
      .filter(
        (e): e is RecentEntry =>
          e != null &&
          typeof e.href === "string" &&
          typeof e.visitedAt === "number" &&
          now - e.visitedAt <= RECENTS_MAX_AGE_MS,
      )
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .slice(0, RECENTS_MAX);
    if (valid.length !== parsed.length) {
      try {
        window.localStorage.setItem(
          RECENTS_STORAGE_KEY,
          JSON.stringify(valid),
        );
      } catch {
        // ignore storage errors (private mode, quota, etc.)
      }
    }
    return valid;
  } catch {
    return [];
  }
}

function recordRecent(href: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = readRecents().filter((e) => e.href !== href);
    const updated = [{ href, visitedAt: Date.now() }, ...existing].slice(
      0,
      RECENTS_MAX,
    );
    window.localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, navigate] = useLocation();
  const [recents, setRecents] = useState<RecentEntry[]>([]);

  useEffect(() => {
    if (open) setRecents(readRecents());
  }, [open]);

  const runCommand = useCallback(
    (href: string) => {
      recordRecent(href);
      onOpenChange(false);
      navigate(href);
    },
    [navigate, onOpenChange],
  );

  const recentItems = recents
    .map((entry) => ALL_ITEMS.find((item) => item.href === entry.href))
    .filter((item): item is NavItem => item != null);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Cerca una sezione o funzione…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>Nessun risultato trovato.</CommandEmpty>
        {recentItems.length > 0 && (
          <CommandGroup heading="Recenti">
            {recentItems.map((item) => (
              <CommandItem
                key={`recent-${item.href}`}
                value={`recenti ${item.label} ${item.keywords ?? ""}`}
                onSelect={() => runCommand(item.href)}
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {GROUPS.map((group, i) => {
          const items = ALL_ITEMS.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              {(i > 0 || recentItems.length > 0) && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.href}
                      value={`${item.label} ${item.keywords ?? ""} ${group}`}
                      onSelect={() => runCommand(item.href)}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Cerca (Ctrl+K)"
      className="hidden md:flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Cerca…</span>
      <kbd className="ml-1 hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium lg:flex">
        <span>Ctrl</span>
        <span>K</span>
      </kbd>
    </button>
  );
}
