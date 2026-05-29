import { useRoute, Link } from "wouter";
import { useGetSeduta, getGetSedutaQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Calendar, FileText, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlboLink } from "@/components/AlboLink";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

export function SedutaDetail() {
  const [, params] = useRoute("/convocazioni/:id");
  const id = params?.id ? Number(params.id) : NaN;

  const { data: seduta, isLoading, isError } = useGetSeduta(id, {
    query: {
      enabled: !Number.isNaN(id),
      queryKey: getGetSedutaQueryKey(id),
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link
        href="/convocazioni"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alle convocazioni
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : isError || !seduta ? (
        <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          Seduta non trovata.
        </div>
      ) : (
        <>
          <div className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Calendar className="h-4 w-4" />
                {formatDate(seduta.dataAtto ?? seduta.pubStart)}
              </div>
              {seduta.subcategory && (
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary text-xs uppercase tracking-wide"
                >
                  {seduta.subcategory === "consiglio"
                    ? "Consiglio Comunale"
                    : seduta.subcategory === "commissione"
                      ? "Commissione"
                      : seduta.subcategory}
                </Badge>
              )}
              {seduta.isNew && (
                <Badge className="bg-primary text-primary-foreground border-transparent shadow-none text-xs">
                  NUOVO
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight leading-snug">
              {seduta.oggetto}
            </h1>
            {seduta.provenienza && (
              <p className="text-sm text-muted-foreground">
                {seduta.provenienza}
              </p>
            )}
            <div className="pt-2">
              <AlboLink />
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-serif font-semibold">
              Resoconto stenografico
            </h2>
          </div>

          {seduta.summary && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/90 whitespace-pre-line">
              {seduta.summary}
            </div>
          )}

          {seduta.interventions.length > 0 ? (
            <ol className="relative space-y-6 border-l border-border/60 pl-6">
              {seduta.interventions.map((intervento) => (
                <li key={intervento.id} className="relative">
                  <span className="absolute -left-[1.92rem] flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-background text-primary">
                    <User className="h-4 w-4" />
                  </span>
                  <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="mb-2 flex flex-wrap items-baseline gap-2">
                      <span className="font-semibold text-foreground">
                        {intervento.speakerName}
                      </span>
                      {intervento.speakerRole && (
                        <span className="text-xs text-muted-foreground">
                          {intervento.speakerRole}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {intervento.content}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <FileText className="mx-auto mb-3 h-8 w-8 opacity-40" />
              Resoconto non ancora disponibile per questa seduta.
            </div>
          )}
        </>
      )}
    </div>
  );
}
