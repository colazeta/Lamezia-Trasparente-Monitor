import { useState } from "react";
import { useListConvocazioni } from "@workspace/api-client-react";
import { CalendarClock, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlboLink } from "@/components/AlboLink";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "consiglio", label: "Consiglio Comunale", icon: Users },
  { value: "commissione", label: "Commissioni", icon: Users },
] as const;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

export function Convocazioni() {
  const [tipo, setTipo] = useState<"consiglio" | "commissione">("consiglio");

  const { data: convocazioni, isLoading } = useListConvocazioni({ tipo });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
          <CalendarClock className="mr-2 h-4 w-4" />
          Sedute e ordini del giorno
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          Convocazioni
        </h1>
        <p className="text-muted-foreground text-lg">
          Le convocazioni del Consiglio Comunale e delle Commissioni Consiliari,
          con data e argomenti all'ordine del giorno.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1 mb-8">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setTipo(t.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                tipo === t.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-5 rounded-xl border bg-card shadow-sm">
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))
        ) : convocazioni && convocazioni.length > 0 ? (
          convocazioni.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Calendar className="h-4 w-4" />
                  {formatDate(c.dataAtto ?? c.pubStart)}
                </div>
                {c.isNew && (
                  <Badge className="bg-primary text-primary-foreground border-transparent shadow-none text-xs">
                    NUOVO
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-foreground leading-snug mb-1">
                {c.oggetto}
              </h3>
              {c.provenienza && (
                <p className="text-xs text-muted-foreground">{c.provenienza}</p>
              )}
              <div className="mt-3 border-t border-border/50 pt-3">
                <AlboLink />
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            Nessuna convocazione disponibile in questa sezione.
          </div>
        )}
      </div>
    </div>
  );
}
