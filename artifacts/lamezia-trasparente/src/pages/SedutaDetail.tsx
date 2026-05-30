import { useRoute, Link } from "wouter";
import { useGetSeduta, getGetSedutaQueryKey } from "@workspace/api-client-react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  MessageSquare,
  User,
  Building2,
  Vote,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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

const VOTE_VARIANTS: Record<
  string,
  "success" | "destructive" | "warning" | "outline"
> = {
  favorevole: "success",
  contrario: "destructive",
  astenuto: "warning",
  assente: "outline",
};

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
        <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : isError || !seduta ? (
        <Empty className="border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle className="font-display">Seduta non trovata</EmptyTitle>
            <EmptyDescription>
              La convocazione richiesta non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <header className="mb-10 overflow-hidden rounded-2xl border border-border bg-muted/30">
            <span className="block h-1.5 w-full bg-brand" />
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="eyebrow text-brand">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(seduta.dataAtto ?? seduta.pubStart)}
                </span>
                {seduta.organo ? (
                  <Link href={`/organi/${seduta.organo.slug}`}>
                    <Badge
                      variant="secondary"
                      className="uppercase tracking-wide gap-1.5 hover:bg-secondary/80 transition-colors"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      {seduta.organo.name}
                    </Badge>
                  </Link>
                ) : (
                  seduta.subcategory && (
                    <Badge
                      variant="secondary"
                      className="uppercase tracking-wide"
                    >
                      {seduta.subcategory === "consiglio"
                        ? "Consiglio Comunale"
                        : seduta.subcategory === "commissione"
                          ? "Commissione"
                          : seduta.subcategory}
                    </Badge>
                  )
                )}
                {seduta.isNew && <Badge variant="brand">Nuovo</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight leading-tight">
                {seduta.oggetto}
              </h1>
              {seduta.provenienza && (
                <p className="text-sm text-muted-foreground">
                  {seduta.provenienza}
                </p>
              )}
              <div className="pt-1">
                <AlboLink />
              </div>
            </div>
          </header>

          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
              <MessageSquare className="h-4 w-4" />
            </span>
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
              Resoconto stenografico
            </h2>
          </div>

          {seduta.summary && (
            <div className="mb-6 rounded-xl border border-border bg-card p-4 md:p-5 text-sm text-foreground/90 whitespace-pre-line">
              {seduta.summary}
            </div>
          )}

          {seduta.interventions.length > 0 ? (
            <ol className="relative space-y-6 border-l-2 border-border pl-6">
              {seduta.interventions.map((intervento) => (
                <li key={intervento.id} className="relative">
                  <span className="absolute -left-[2.05rem] flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-brand/10 text-brand">
                    <User className="h-4 w-4" />
                  </span>
                  <div className="rounded-xl border border-border bg-card p-4 md:p-5 shadow-sm transition-all hover-elevate">
                    <div className="mb-2 flex flex-wrap items-baseline gap-2">
                      <span className="font-display font-bold text-foreground">
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
            <Empty className="border bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle className="font-display">
                  Resoconto non disponibile
                </EmptyTitle>
                <EmptyDescription>
                  Il resoconto stenografico non è ancora stato pubblicato per
                  questa seduta.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {seduta.votes.length > 0 && (
            <>
              <div className="mt-10 mb-6 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Vote className="h-4 w-4" />
                </span>
                <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                  Esito delle votazioni
                </h2>
              </div>
              <ul className="space-y-2">
                {seduta.votes.map((v) => (
                  <li key={v.officialId}>
                    <Link
                      href={`/amministratori/${v.officialId}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-brand/40"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {v.name}
                      </span>
                      <Badge
                        variant={VOTE_VARIANTS[v.vote] ?? "outline"}
                        className="capitalize shrink-0"
                      >
                        {v.vote}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
