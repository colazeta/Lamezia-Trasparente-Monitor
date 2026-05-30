import { useState } from "react";
import { Link } from "wouter";
import { useListConvocazioni } from "@workspace/api-client-react";
import { CalendarClock, Users, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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
      <div className="mb-8">
        <span className="eyebrow text-brand">
          <CalendarClock className="h-3.5 w-3.5" />
          Sedute e ordini del giorno
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Convocazioni
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
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
                "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors",
                tipo === t.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover-elevate",
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
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-5 w-full" />
              </Card>
            ))
        ) : convocazioni && convocazioni.length > 0 ? (
          convocazioni.map((c) => (
            <Link
              key={c.id}
              href={`/convocazioni/${c.id}`}
              className="block"
            >
              <Card className="group p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                    <Calendar className="h-4 w-4" />
                    {formatDate(c.dataAtto ?? c.pubStart)}
                  </div>
                  {c.isNew && (
                    <Badge variant="brand" className="text-xs">
                      NUOVO
                    </Badge>
                  )}
                </div>
                <h3 className="font-display font-bold text-foreground leading-snug mb-1 group-hover:text-brand transition-colors">
                  {c.oggetto}
                </h3>
                {c.provenienza && (
                  <p className="text-xs text-muted-foreground">{c.provenienza}</p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-brand transition-colors">
                    Vedi resoconto stenografico
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Empty className="border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClock />
              </EmptyMedia>
              <EmptyTitle>Nessuna convocazione disponibile</EmptyTitle>
              <EmptyDescription>
                Al momento non risultano convocazioni in questa sezione. Prova a
                consultare l'altro organo o a tornare più tardi.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
