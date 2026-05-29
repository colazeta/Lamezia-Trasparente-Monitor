import { useEffect, useState } from "react";
import { useListDelibere } from "@workspace/api-client-react";
import { Search, Gavel, Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlboLink } from "@/components/AlboLink";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "Tutte" },
  { value: "giunta", label: "Giunta" },
  { value: "consiglio", label: "Consiglio" },
] as const;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy", { locale: it });
}

export function Delibere() {
  const [tipo, setTipo] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: delibere, isLoading } = useListDelibere({
    tipo: tipo !== "all" ? tipo : undefined,
    q: debouncedSearch || undefined,
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
          <Gavel className="mr-2 h-4 w-4" />
          Organi collegiali
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          Elenco Delibere
        </h1>
        <p className="text-muted-foreground text-lg">
          Le deliberazioni della Giunta e del Consiglio Comunale, raccolte e
          rese consultabili in modo permanente.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTipo(t.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                tipo === t.value
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
            placeholder="Cerca per oggetto..."
            aria-label="Cerca delibere per oggetto"
            className="pl-9 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-5 rounded-xl border bg-card shadow-sm">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))
        ) : delibere && delibere.length > 0 ? (
          delibere.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-transparent shadow-none text-xs capitalize">
                    {d.subcategory ?? "delibera"}
                  </Badge>
                  {d.isNew && (
                    <Badge className="bg-primary text-primary-foreground border-transparent shadow-none text-xs">
                      NUOVO
                    </Badge>
                  )}
                  {d.numRegGen && (
                    <span className="font-mono text-xs text-muted-foreground">
                      N. {d.numRegGen}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(d.dataAtto ?? d.pubStart)}
                </div>
              </div>
              <h3 className="font-semibold text-foreground leading-snug">
                {d.oggetto}
              </h3>
              {d.provenienza && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {d.provenienza}
                </p>
              )}
              <div className="mt-3 border-t border-border/50 pt-3">
                <AlboLink />
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            Nessuna delibera trovata con questi criteri.
          </div>
        )}
      </div>
    </div>
  );
}
