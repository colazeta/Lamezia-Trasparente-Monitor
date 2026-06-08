import { useListFundamentalActs } from "@workspace/api-client-react";
import { FileText, ScrollText, Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { AlboLink } from "@/components/AlboLink";
import { formatPublicTimeField } from "@/lib/time";

export function AttiFondamentali() {
  const { data: acts, isLoading } = useListFundamentalActs();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-brand">
          <ScrollText className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Documenti di programmazione
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Atti fondamentali
        </h1>
        <p className="text-muted-foreground">
          I principali documenti di programmazione e regolamentazione del
          Comune: PIAO, DUP, bilanci, rendiconto, statuto, regolamenti e piano
          delle opere pubbliche. Per ogni atto è mostrata l'ultima versione
          disponibile, con il documento consultabile (copia archiviata o link
          ufficiale).
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : acts && acts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {acts.map((act) => (
            <Card
              key={act.id}
              className="flex flex-col gap-3 p-5"
              data-testid={`card-atto-${act.slug}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <h2 className="font-display text-base font-semibold leading-tight">
                    {act.title?.trim() ? act.title : act.label}
                  </h2>
                  {act.title?.trim() && (
                    <p className="text-xs text-muted-foreground">{act.label}</p>
                  )}
                </div>
              </div>

              {act.description?.trim() && (
                <p className="text-sm text-muted-foreground">
                  {act.description}
                </p>
              )}

              <div className="mt-auto flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Agg. {formatPublicTimeField(act.updatedAt)}
                  </Badge>
                  {act.source === "auto" && (
                    <Badge variant="secondary" className="text-[10px]">
                      Da Albo / Pubblicazioni
                    </Badge>
                  )}
                </div>
                <AlboLink attachments={act.attachments} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Info className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nessun atto pubblicato</EmptyTitle>
            <EmptyDescription>
              Al momento non ci sono atti fondamentali pubblicati. Torna a
              trovarci più avanti.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
