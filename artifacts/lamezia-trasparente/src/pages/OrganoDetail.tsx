import { useRoute, Link } from "wouter";
import { useGetOrgano, getGetOrganoQueryKey } from "@workspace/api-client-react";
import {
  ArrowLeft,
  Landmark,
  Users,
  CalendarClock,
  Calendar,
  ChevronRight,
  History,
  Info,
  ExternalLink,
} from "lucide-react";
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

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
) {
  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
  if (startDate) return `dal ${formatDate(startDate)}`;
  if (endDate) return `fino al ${formatDate(endDate)}`;
  return "Periodo da documentare";
}

function missingCompositionText(type: string) {
  if (type === "commissione") {
    return [
      "Non risultano componenti correnti registrati per questa commissione.",
      "Le eventuali composizioni storiche disponibili restano consultabili",
      "nella sezione dei mandati e delle fonti.",
    ].join(" ");
  }
  return "Non risultano componenti registrati per questo organo.";
}

export function OrganoDetail() {
  const [, params] = useRoute("/organi/:slug");
  const slug = params?.slug ?? "";

  const {
    data: organo,
    isLoading,
    isError,
  } = useGetOrgano(slug, {
    query: {
      enabled: Boolean(slug),
      queryKey: getGetOrganoQueryKey(slug),
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link
        href="/organi"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna agli organi
      </Link>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : isError || !organo ? (
        <Empty className="border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Landmark />
            </EmptyMedia>
            <EmptyTitle className="font-display">Organo non trovato</EmptyTitle>
            <EmptyDescription>
              L'organo richiesto non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <header className="mb-10 overflow-hidden rounded-2xl border border-border bg-muted/30">
            <span className="block h-1.5 w-full bg-brand" />
            <div className="p-6 md:p-8 space-y-4">
              <span className="eyebrow text-primary">
                <Landmark className="h-3.5 w-3.5" />
                Organo del Comune
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight leading-tight">
                {organo.name}
              </h1>
              {organo.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {organo.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {organo.memberCount} component
                  {organo.memberCount === 1 ? "e" : "i"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <History className="h-4 w-4" />
                  {organo.historyCount} rig
                  {organo.historyCount === 1 ? "a" : "he"} storic
                  {organo.historyCount === 1 ? "a" : "he"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" />
                  {organo.sedutaCount} sedut{organo.sedutaCount === 1 ? "a" : "e"}
                </span>
              </div>
            </div>
          </header>

          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
              <Users className="h-4 w-4" />
            </span>
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
              Composizione
            </h2>
          </div>

          {organo.members.length > 0 ? (
            <ul data-tour="organi-members" className="mb-10 grid gap-3 sm:grid-cols-2">
              {organo.members.map((m) => (
                <li key={m.officialId}>
                  <Link
                    href={`/amministratori/${m.officialId}`}
                    className="block"
                  >
                    <Card className="group flex items-center justify-between gap-3 p-4 transition-all hover:shadow-md hover:border-brand/40">
                      <div className="min-w-0">
                        <p className="font-display font-bold text-foreground leading-snug truncate group-hover:text-brand transition-colors">
                          {m.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {m.membershipRole ?? m.roleTitle ?? m.role}
                        </p>
                        {m.group && (
                          <p className="text-xs text-muted-foreground truncate">
                            {m.group}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {m.status === "cessato" && (
                          <Badge variant="outline" className="text-[10px]">
                            Cessato
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty className="mb-10 border bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle className="font-display">
                  Composizione non disponibile
                </EmptyTitle>
                <EmptyDescription>
                  {missingCompositionText(organo.type)}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
              <History className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                Storico composizioni
              </h2>
              <p className="text-sm text-muted-foreground">
                Mandati, incarichi e avvicendamenti collegati ai profili
                anagrafici disponibili.
              </p>
            </div>
          </div>

          {organo.terms.length > 0 ? (
            <div className="mb-10 space-y-4">
              {organo.terms.map((term) => (
                <Card
                  key={`${term.label}-${term.startDate ?? "na"}-${term.endDate ?? "na"}`}
                  className="p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-bold">
                          {term.label}
                        </h3>
                        <Badge
                          variant={
                            term.status === "current" ? "brand" : "outline"
                          }
                          className="capitalize"
                        >
                          {term.status === "current" ? "Corrente" : "Storico"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDateRange(term.startDate, term.endDate)} ·{" "}
                        {term.members.length} component
                        {term.members.length === 1 ? "e" : "i"}
                      </p>
                    </div>
                    {term.sourceUrl ? (
                      <a
                        href={term.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Fonte
                      </a>
                    ) : term.sourceLabel ? (
                      <span className="text-sm text-muted-foreground">
                        {term.sourceLabel}
                      </span>
                    ) : null}
                  </div>

                  {term.notes && (
                    <div className="mt-3 flex gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p>{term.notes}</p>
                    </div>
                  )}

                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {term.members.map((member) => (
                      <li key={`${member.officialId}-${member.membershipRole}`}>
                        <Link
                          href={`/amministratori/${member.officialId}`}
                          className="group block rounded-lg border border-border/70 p-3 transition-colors hover:border-brand/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground group-hover:text-brand">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.membershipRole ??
                                  member.roleTitle ??
                                  member.role}
                              </p>
                              {member.group && (
                                <p className="text-xs text-muted-foreground">
                                  {member.group}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          ) : (
            <Empty className="mb-10 border bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History />
                </EmptyMedia>
                <EmptyTitle className="font-display">
                  Storico non ancora caricato
                </EmptyTitle>
                <EmptyDescription>
                  La struttura è pronta per mandati precedenti e avvicendamenti,
                  ma non risultano righe storiche per questo organo.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
              <CalendarClock className="h-4 w-4" />
            </span>
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
              Sedute
            </h2>
          </div>

          {organo.sedute.length > 0 ? (
            <div className="space-y-3">
              {organo.sedute.map((s) => (
                <Link
                  key={s.id}
                  href={`/convocazioni/${s.publicationId}`}
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
                        Vedi seduta
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Empty className="border bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarClock />
                </EmptyMedia>
                <EmptyTitle className="font-display">
                  Nessuna seduta registrata
                </EmptyTitle>
                <EmptyDescription>
                  Non risultano sedute pubblicate per questo organo.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </>
      )}
    </div>
  );
}
