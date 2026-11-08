import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  BookOpen,
  Calendar,
  Clock,
  Database,
  Home,
  Landmark,
  LoaderCircle,
  Search,
  UserRound,
} from "lucide-react";
import {
  COMMAND_PALETTE_GROUPS,
  getNavItemStateLabel,
  type NavItem,
} from "@/components/layout/navSections";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { CivicSearchResult } from "@/lib/civicSearchIndex";

interface PaletteItem {
  href: string;
  label: string;
  icon: React.ElementType;
  group: string;
  keywords?: string;
  statusLabel?: string;
}

const SUPPORT_ITEMS: PaletteItem[] = [
  { href: "/", label: "Home", icon: Home, group: "Navigazione" },
  {
    href: "/guida",
    label: "Centro guida",
    icon: BookOpen,
    group: "Navigazione",
    keywords: "guida aiuto metodo uso sito",
  },
];

function toPaletteItem(item: NavItem, group: string): PaletteItem {
  return {
    href: item.href,
    label: item.label,
    icon: item.icon,
    group,
    keywords: item.keywords,
    statusLabel:
      item.state === "available" ? undefined : getNavItemStateLabel(item),
  };
}

const SECTION_ITEMS: PaletteItem[] = COMMAND_PALETTE_GROUPS.flatMap((group) =>
  group.items.map((item) => toPaletteItem(item, group.label)),
);

const ALL_ITEMS: PaletteItem[] = [...SUPPORT_ITEMS, ...SECTION_ITEMS];
const QUICK_ITEMS = ["/convocazioni", "/contratti", "/organi"]
  .map((href) => SECTION_ITEMS.find((item) => item.href === href))
  .filter((item): item is PaletteItem => item !== undefined);
const GROUPS = Array.from(new Set(ALL_ITEMS.map((item) => item.group)));

const RECENTS_STORAGE_KEY = "lt-command-palette-recents";
const RECENTS_MAX = 5;
const RECENTS_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_CIVIC_QUERY_LENGTH = 2;
const CIVIC_SEARCH_LIMIT = 12;

const CIVIC_RESULT_ICONS: Record<CivicSearchResult["kind"], React.ElementType> =
  {
    seduta: Calendar,
    dataset: Database,
    organo: Landmark,
    persona: UserRound,
  };

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
        window.localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(valid));
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

type CivicSearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "ready"; query: string; results: CivicSearchResult[] }
  | { status: "error"; query: string };

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, navigate] = useLocation();
  const [recents, setRecents] = useState<RecentEntry[]>([]);
  const [query, setQuery] = useState("");
  const [civicSearch, setCivicSearch] = useState<CivicSearchState>({
    status: "idle",
  });
  const normalizedQuery = query.trim();
  // An effect starts the search, but render already rejects the previous query's results.
  const currentSearch: CivicSearchState =
    !open || normalizedQuery.length < MIN_CIVIC_QUERY_LENGTH
      ? { status: "idle" }
      : civicSearch.status !== "idle" && civicSearch.query === normalizedQuery
        ? civicSearch
        : { status: "loading", query: normalizedQuery };
  const civicSearchStatus = currentSearch.status;
  const civicResults =
    currentSearch.status === "ready" ? currentSearch.results : [];

  useEffect(() => {
    if (open) {
      setRecents(readRecents());
      return;
    }

    setQuery("");
    setCivicSearch({ status: "idle" });
  }, [open]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!open || normalizedQuery.length < MIN_CIVIC_QUERY_LENGTH) {
      setCivicSearch({ status: "idle" });
      return;
    }

    let active = true;
    setCivicSearch({ status: "loading", query: normalizedQuery });

    const timeout = window.setTimeout(() => {
      import("@/lib/civicSearchIndex")
        .then(({ searchCivicIndex }) => {
          if (!active) return;
          setCivicSearch({
            status: "ready",
            query: normalizedQuery,
            results: searchCivicIndex(normalizedQuery, CIVIC_SEARCH_LIMIT),
          });
        })
        .catch(() => {
          if (!active) return;
          setCivicSearch({ status: "error", query: normalizedQuery });
        });
    }, 120);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [open, query]);

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
    .filter((item): item is PaletteItem => item != null);
  const hasCivicQuery = query.trim().length >= MIN_CIVIC_QUERY_LENGTH;
  const civicLiveMessage =
    civicSearchStatus === "loading"
      ? "Ricerca nei dati pubblici in corso"
      : civicSearchStatus === "ready"
        ? `${civicResults.length} risultati nei dati pubblici`
        : civicSearchStatus === "error"
          ? "Ricerca nei dati pubblici non disponibile"
          : "";

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Ricerca globale</DialogTitle>
      <DialogDescription className="sr-only">
        Cerca nelle sedute pubblicate, nelle sezioni, negli organi, nei profili
        istituzionali e nei dataset. La ricerca non copre tutti i documenti
        ufficiali.
      </DialogDescription>
      <CommandInput
        onValueChange={setQuery}
        placeholder="Cerca un tema, una seduta, una persona..."
        value={query}
      />
      <p aria-live="polite" className="sr-only">
        {civicLiveMessage}
      </p>
      <CommandList className="max-h-[420px]">
        {!hasCivicQuery ? (
          <CommandEmpty>
            {query.trim().length === 1
              ? "Scrivi almeno due caratteri per cercare nei dati pubblici."
              : "Nessun risultato trovato."}
          </CommandEmpty>
        ) : null}
        {hasCivicQuery ? (
          <CommandGroup
            className="border-b border-border pb-2"
            forceMount
            heading="Sedute, dati e profili pubblici"
          >
            {civicSearchStatus === "loading" ? (
              <CommandItem disabled forceMount value="ricerca dati in corso">
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">
                  Ricerca nell'indice civico...
                </span>
              </CommandItem>
            ) : null}
            {civicSearchStatus === "error" ? (
              <CommandItem
                disabled
                forceMount
                value="ricerca dati non disponibile"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Indice dati non disponibile. La ricerca nelle sezioni resta
                  attiva.
                </span>
              </CommandItem>
            ) : null}
            {civicSearchStatus === "ready" && civicResults.length === 0 ? (
              <CommandItem
                disabled
                forceMount
                value="nessun dato pubblico trovato"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Nessuna corrispondenza nell’indice: prova meno parole o
                  consulta gli archivi.
                </span>
              </CommandItem>
            ) : null}
            {civicResults.map((result) => {
              const Icon = CIVIC_RESULT_ICONS[result.kind];
              return (
                <CommandItem
                  forceMount
                  key={result.id}
                  onSelect={() => runCommand(result.href)}
                  value={`${result.label} ${result.detail} ${result.keywords}`}
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block whitespace-normal font-medium">
                        {result.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {result.detail}
                      </span>
                    </span>
                    <span className="max-w-[35%] shrink-0 whitespace-normal pt-0.5 text-[10px] font-semibold text-muted-foreground">
                      {result.statusLabel}
                    </span>
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
        {hasCivicQuery &&
        civicSearchStatus === "ready" &&
        civicResults.length === 0 ? (
          <CommandGroup heading="Continua la ricerca" forceMount>
            <CommandItem
              forceMount
              value="consulta archivio sedute"
              onSelect={() => runCommand("/convocazioni")}
            >
              <Calendar className="h-4 w-4" />
              Consulta tutte le sedute e gli ordini del giorno
            </CommandItem>
            <CommandItem
              forceMount
              value="consulta albo civico"
              onSelect={() => runCommand("/albo")}
            >
              <Search className="h-4 w-4" />
              Cerca un atto nell’Albo civico
            </CommandItem>
          </CommandGroup>
        ) : null}
        {recentItems.length > 0 && (
          <CommandGroup heading="Recenti">
            {recentItems.map((item) => (
              <CommandItem
                key={`recent-${item.href}`}
                value={`recenti ${item.label} ${item.keywords ?? ""}`}
                onSelect={() => runCommand(item.href)}
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  {item.statusLabel ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.statusLabel}
                    </span>
                  ) : null}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {!query.trim() ? (
          <CommandGroup heading="Da dove vuoi partire?">
            {QUICK_ITEMS.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => runCommand(item.href)}
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {query.trim()
          ? GROUPS.map((group, i) => {
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
                          <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                            <span className="truncate">{item.label}</span>
                            {item.statusLabel ? (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {item.statusLabel}
                              </span>
                            ) : null}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </div>
              );
            })
          : null}
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
      className="hidden items-center gap-2 rounded-md border border-card-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-muted/45 hover:text-foreground md:flex"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Cerca...</span>
      <kbd className="ml-1 hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium lg:flex">
        <span>Ctrl</span>
        <span>K</span>
      </kbd>
    </button>
  );
}
