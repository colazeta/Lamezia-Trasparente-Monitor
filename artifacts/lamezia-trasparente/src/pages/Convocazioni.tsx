import { useMemo } from "react";
import { Link } from "wouter";
import { useListSedute } from "@workspace/api-client-react";
import type { Seduta } from "@workspace/api-client-react";
import { CalendarClock, Calendar, ChevronRight, Building2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

const UNGROUPED = "Altre sedute";

function groupByOrgano(sedute: Seduta[]) {
  const groups = new Map<string, { name: string; slug: string | null; items: Seduta[] }>();
  for (const s of sedute) {
    const key = s.organo ? s.organo.slug : UNGROUPED;
    const name = s.organo ? s.organo.name : UNGROUPED;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(s);
    } else {
      groups.set(key, { name, slug: s.organo?.slug ?? null, items: [s] });
    }
  }
  return Array.from(groups.values());
}

export function Convocazioni() {
  const { data: sedute, isLoading } = useListSedute();

  const groups = useMemo(() => groupByOrgano(sedute ?? []), [sedute]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8">
        <span className="eyebrow text-primary">
          <CalendarClock className="h-3.5 w-3.5" />
          Sedute e ordini del giorno
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Convocazioni
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Le sedute del Consiglio Comunale e delle Commissioni Consiliari,
          raggruppate per organo, con data e argomenti all'ordine del giorno.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-5 w-full" />
              </Card>
            ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.slug ?? g.name}>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Building2 className="h-4 w-4" />
                </span>
                {g.slug ? (
                  <Link
                    href={`/organi/${g.slug}`}
                    className="text-xl md:text-2xl font-display font-bold tracking-tight hover:text-brand transition-colors"
                  >
                    {g.name}
                  </Link>
                ) : (
                  <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                    {g.name}
                  </h2>
                )}
              </div>

              <div className="space-y-3">
                {g.items.map((s) => (
                  <Link
                    key={s.id}
                    href={
                      s.publicationId != null
                        ? `/convocazioni/${s.publicationId}`
                        : "#"
                    }
                    className="block"
                  >
                    <Card className="group p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40">
                      <div className="flex items-center gap-2 text-sm font-semibold text-brand mb-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(s.date)}
                      </div>
                      {s.agenda && (
                        <h3 className="font-display font-bold text-foreground leading-snug group-hover:text-brand transition-colors">
                          {s.agenda}
                        </h3>
                      )}
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-brand transition-colors">
                          Vedi resoconto stenografico
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Empty className="border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>Nessuna convocazione disponibile</EmptyTitle>
            <EmptyDescription>
              Al momento non risultano convocazioni pubblicate. Torna più tardi
              per aggiornamenti.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
