import { useRoute, Link } from "wouter";
import {
  useGetOfficial,
  getGetOfficialQueryKey,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  CalendarClock,
  Briefcase,
  Euro,
  FileText,
  Vote,
  User,
  ExternalLink,
  Building2,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

const ROLE_LABELS: Record<string, string> = {
  sindaco: "Sindaco",
  assessore: "Assessore",
  consigliere: "Consigliere",
  dirigente: "Dirigente",
  dipendente: "Dipendente",
};

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

function formatAmount(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-6 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
      {children}
    </div>
  );
}

export function AmministratoreDetail() {
  const [, params] = useRoute("/amministratori/:id");
  const id = params?.id ? Number(params.id) : NaN;

  const {
    data: official,
    isLoading,
    isError,
  } = useGetOfficial(id, {
    query: {
      enabled: !Number.isNaN(id),
      queryKey: getGetOfficialQueryKey(id),
    },
  });

  const showVotes =
    official?.role === "consigliere" || official?.role === "assessore" ||
    official?.role === "sindaco";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link
        href="/amministratori"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna agli amministratori
      </Link>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      ) : isError || !official ? (
        <Empty className="border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle className="font-display">Soggetto non trovato</EmptyTitle>
            <EmptyDescription>
              Il profilo richiesto non esiste o è stato rimosso dal registro.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <header className="mb-8 overflow-hidden rounded-2xl border border-border bg-muted/30">
            <span className="block h-1.5 w-full bg-brand" />
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 p-6 md:p-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand/10 font-display text-xl font-bold text-brand">
                {initials(official.name)}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" className="capitalize">
                    {ROLE_LABELS[official.role] ?? official.role}
                  </Badge>
                  {official.status === "cessato" && (
                    <Badge variant="outline">Cessato</Badge>
                  )}
                  {official.group && (
                    <span className="text-sm text-muted-foreground">
                      {official.group}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                  {official.name}
                </h1>
                {official.roleTitle && (
                  <p className="text-lg text-muted-foreground">
                    {official.roleTitle}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1 font-mono">
                  <CalendarClock className="h-4 w-4" />
                  Incarico dal {formatDate(official.appointmentDate)}
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-5">
            {official.organi.length > 0 && (
              <Section icon={Building2} title="Appartenenza agli organi">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {official.organi.map((o) => (
                    <li key={o.id}>
                      <Link href={`/organi/${o.slug}`} className="block">
                        <div className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-brand/40">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate group-hover:text-brand transition-colors">
                              {o.name}
                            </p>
                            {o.membershipRole && (
                              <p className="text-xs text-muted-foreground truncate">
                                {o.membershipRole}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section icon={User} title="Curriculum">
              {official.biography ? (
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                  {official.biography}
                </p>
              ) : (
                <EmptyState>
                  Nessun curriculum disponibile per questo soggetto.
                </EmptyState>
              )}
            </Section>

            <Section icon={Briefcase} title="Attività svolte presso l'ente">
              {official.activities.length > 0 ? (
                <ul className="space-y-3">
                  {official.activities.map((a) => (
                    <li
                      key={a.id}
                      className="border-l-2 border-primary/30 pl-4 py-0.5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {a.title}
                        </span>
                        {a.date && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatDate(a.date)}
                          </span>
                        )}
                      </div>
                      {a.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {a.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>Nessuna attività registrata.</EmptyState>
              )}
            </Section>

            <Section icon={Euro} title="Compensi percepiti dall'ente">
              {official.remunerations.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {official.remunerations.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {r.type}
                          <span className="ml-2 font-mono text-xs text-muted-foreground">
                            {r.year}
                          </span>
                        </div>
                        {r.note && (
                          <p className="text-xs text-muted-foreground">
                            {r.note}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-semibold text-primary">
                        {formatAmount(r.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>Nessun compenso registrato.</EmptyState>
              )}
            </Section>

            <Section icon={FileText} title="Dichiarazioni">
              {official.declarations.length > 0 ? (
                <ul className="space-y-3">
                  {official.declarations.map((d) => (
                    <li
                      key={d.id}
                      className="rounded-lg border border-border/60 p-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {d.title}
                        </span>
                        {d.date && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatDate(d.date)}
                          </span>
                        )}
                      </div>
                      {d.content && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {d.content}
                        </p>
                      )}
                      {d.url && (
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Apri documento
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>Nessuna dichiarazione pubblicata.</EmptyState>
              )}
            </Section>

            {showVotes && (
              <Section icon={Vote} title="Come ha votato sulle delibere">
                {official.votes.length > 0 ? (
                  <ul className="space-y-2">
                    {official.votes.map((v) => (
                      <li
                        key={v.publicationId}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {v.oggetto}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {v.subcategory && (
                              <span className="capitalize">{v.subcategory}</span>
                            )}
                            {v.numRegGen && <span>N. {v.numRegGen}</span>}
                            {v.dataAtto && <span>{formatDate(v.dataAtto)}</span>}
                          </div>
                        </div>
                        <Badge
                          variant={VOTE_VARIANTS[v.vote] ?? "outline"}
                          className="capitalize shrink-0"
                        >
                          {v.vote}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState>
                    Nessun voto registrato per questo soggetto.
                  </EmptyState>
                )}
              </Section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
