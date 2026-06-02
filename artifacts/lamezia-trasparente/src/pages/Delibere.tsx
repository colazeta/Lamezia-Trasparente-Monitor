import { useEffect, useState } from "react";
import { useListDelibere } from "@workspace/api-client-react";
import { Search, Gavel, Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
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
      <div className="mb-8">
        <span className="eyebrow text-primary">
          <Gavel className="h-3.5 w-3.5" />
          Organi collegiali
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Elenco Delibere
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
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
                "px-4 py-2 text-sm font-semibold rounded-md transition-colors",
                tipo === t.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover-elevate",
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
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-5 w-full" />
              </Card>
            ))
        ) : delibere && delibere.length > 0 ? (
          delibere.map((d) => (
            <Card
              key={d.id}
              className="group p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {d.subcategory ?? "delibera"}
                  </Badge>
                  {d.isNew && (
                    <Badge variant="brand" className="text-xs">
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
              <h3 className="font-display font-bold text-foreground leading-snug group-hover:text-brand transition-colors">
                {d.oggetto}
              </h3>
              {d.provenienza && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {d.provenienza}
                </p>
              )}
              <div className="mt-3 border-t border-border pt-3">
                <AlboLink />
              </div>
            </Card>
          ))
        ) : (
          <Empty className="border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Gavel />
              </EmptyMedia>
              <EmptyTitle>Nessuna delibera trovata</EmptyTitle>
              <EmptyDescription>
                Nessuna deliberazione corrisponde ai criteri selezionati. Prova a
                cambiare organo o a modificare la ricerca.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
