/**
 * /redazione — Unified editorial panel for the site's team.
 * Google login via Clerk, email allowlist enforced server-side + client-side.
 * Section routing via URL search param ?s=<sectionId> for deep-link support.
 */
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import {
  LayoutDashboard,
  Layers,
  FileText,
  History,
  HelpCircle,
  Megaphone,
  Type,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Globe,
  ShieldX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { RedazioneBacheca } from "./redazione/RedazioneBacheca";
import { RedazioneTemi } from "./redazione/RedazioneTemi";
import { RedazioneCronistoria } from "./redazione/RedazioneCronistoria";
import { RedazioneDomande } from "./redazione/RedazioneDomande";
import { RedazioneSegnalazioni } from "./redazione/RedazioneSegnalazioni";
import { RedazioneTesti } from "./redazione/RedazioneTesti";
import { RedazionePagine } from "./redazione/RedazionePagine";
import { useState } from "react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

type Section =
  | "bacheca"
  | "pagine"
  | "temi"
  | "cronistoria"
  | "domande"
  | "segnalazioni"
  | "testi";

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType; description: string }[] = [
  { id: "bacheca", label: "Bacheca", icon: LayoutDashboard, description: "Stato fonti e avvisi" },
  { id: "pagine", label: "Pagine & Zone", icon: Layers, description: "Costruttore a blocchi" },
  { id: "temi", label: "Temi", icon: FileText, description: "Crea e gestisci i temi" },
  { id: "cronistoria", label: "Cronistoria", icon: History, description: "Aggiornamenti narrativi" },
  { id: "domande", label: "Domande", icon: HelpCircle, description: "Cosa puoi scoprire?" },
  { id: "segnalazioni", label: "Segnalazioni", icon: Megaphone, description: "Modera le segnalazioni" },
  { id: "testi", label: "Testi del sito", icon: Type, description: "Micro-copy editoriale" },
];

const SECTION_MAP: Record<Section, React.ComponentType> = {
  bacheca: RedazioneBacheca,
  pagine: RedazionePagine,
  temi: RedazioneTemi,
  cronistoria: RedazioneCronistoria,
  domande: RedazioneDomande,
  segnalazioni: RedazioneSegnalazioni,
  testi: RedazioneTesti,
};

function useWhoami(enabled: boolean) {
  return useQuery<{ editor: boolean; email: string | null }>({
    queryKey: ["redazione-whoami"],
    queryFn: async () => {
      const res = await fetch(`${basePath}/api/redazione/whoami`);
      return res.json();
    },
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}

export function Redazione() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const searchParams = new URLSearchParams(search);
  const rawSection = searchParams.get("s") as Section | null;
  const section: Section =
    rawSection && NAV_ITEMS.some((i) => i.id === rawSection) ? rawSection : "bacheca";

  const { data: whoami, isLoading: whoamiLoading } = useWhoami(!!user);

  function navigateTo(id: Section) {
    navigate(`${basePath}/redazione?s=${id}`);
    setSidebarOpen(false);
  }

  if (!isLoaded || whoamiLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    window.location.href = `${basePath}/sign-in`;
    return null;
  }

  if (whoami && !whoami.editor) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="h-8 w-8" />
        </div>
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold">Accesso non autorizzato</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Il tuo account ({whoami.email ?? user.primaryEmailAddress?.emailAddress}) non è nella
            lista degli editor autorizzati. Contatta l'amministratore del sito.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>
    );
  }

  const SectionComponent = SECTION_MAP[section];

  return (
    <div className="flex min-h-[100dvh] bg-muted/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <a href={basePath || "/"} className="flex items-center gap-2">
            <Logo textClassName="text-sm leading-none" />
          </a>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-brand">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Editor"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/60">Modalità editore</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "bg-brand/10 text-brand font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="truncate font-medium">{item.label}</div>
                  {!active && (
                    <div className="truncate text-[10px] text-sidebar-foreground/50">
                      {item.description}
                    </div>
                  )}
                </div>
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-brand" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            asChild
          >
            <a href={basePath || "/"}>
              <Globe className="h-4 w-4" />
              Vedi il sito
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-red-500"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
          >
            <LogOut className="h-4 w-4" />
            Esci
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/85 backdrop-blur px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Redazione
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {NAV_ITEMS.find((i) => i.id === section)?.label}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <SectionComponent />
        </main>
      </div>
    </div>
  );
}
