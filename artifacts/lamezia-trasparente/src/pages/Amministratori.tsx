import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useListOfficials } from "@workspace/api-client-react";
import { Search, Users, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "Tutti" },
  { value: "sindaco", label: "Sindaco" },
  { value: "assessore", label: "Assessori" },
  { value: "consigliere", label: "Consiglieri" },
  { value: "dirigente", label: "Dirigenti" },
  { value: "dipendente", label: "Dipendenti" },
] as const;

const ROLE_LABELS: Record<string, string> = {
  sindaco: "Sindaco",
  assessore: "Assessore",
  consigliere: "Consigliere",
  dirigente: "Dirigente",
  dipendente: "Dipendente",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export function Amministratori() {
  const [role, setRole] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: officials, isLoading } = useListOfficials({
    role: role !== "all" ? role : undefined,
    q: debouncedSearch || undefined,
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
          <Users className="mr-2 h-4 w-4" />
          Censimento dei soggetti pubblici
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          Amministratori e personale
        </h1>
        <p className="text-muted-foreground text-lg">
          Il registro dei soggetti pubblici del Comune di Lamezia Terme: sindaco,
          assessori, consiglieri, dirigenti e personale. Per ciascuno il
          curriculum, le attività, i compensi, le dichiarazioni e — per
          amministratori e consiglieri — il voto su ogni delibera.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="inline-flex flex-wrap rounded-lg border border-border bg-muted/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setRole(t.value)}
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-md transition-colors",
                role === t.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome..."
            aria-label="Cerca soggetti per nome"
            className="pl-9 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-5 rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))
        ) : officials && officials.length > 0 ? (
          officials.map((o) => (
            <Link
              key={o.id}
              href={`/amministratori/${o.id}`}
              className="group flex items-center gap-4 p-5 rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif font-bold text-primary">
                {initials(o.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {o.name}
                  </h3>
                  {o.status === "cessato" && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      cessato
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {o.roleTitle ?? ROLE_LABELS[o.role] ?? o.role}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge className="bg-primary/10 text-primary border-transparent shadow-none text-xs capitalize">
                    {ROLE_LABELS[o.role] ?? o.role}
                  </Badge>
                  {o.group && (
                    <span className="text-xs text-muted-foreground truncate">
                      {o.group}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))
        ) : (
          <div className="sm:col-span-2 py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            Nessun soggetto trovato con questi criteri.
          </div>
        )}
      </div>
    </div>
  );
}
