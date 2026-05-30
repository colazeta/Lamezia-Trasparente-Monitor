import { useRoute, Link } from "wouter";
import { useGetOrgano, getGetOrganoQueryKey } from "@workspace/api-client-react";
import {
  ArrowLeft,
  Landmark,
  Users,
  CalendarClock,
  Calendar,
  ChevronRight,
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
              <span className="eyebrow text-brand">
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
            <ul className="mb-10 grid gap-3 sm:grid-cols-2">
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
                  Non risultano componenti registrati per questo organo.
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
