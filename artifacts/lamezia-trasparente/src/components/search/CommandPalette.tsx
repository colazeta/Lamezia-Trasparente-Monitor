import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { BookOpen, Clock, Home, Search } from "lucide-react";
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
const GROUPS = Array.from(new Set(ALL_ITEMS.map((item) => item.group)));

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
    .filter((item): item is PaletteItem => item != null);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Cerca una sezione o funzione..." />
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
      className="hidden items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
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
