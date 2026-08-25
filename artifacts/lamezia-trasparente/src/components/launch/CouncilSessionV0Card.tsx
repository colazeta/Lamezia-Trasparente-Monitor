import { Link } from "wouter";
import {
  AlertTriangle,
  CalendarClock,
  ExternalLink,
  FileText,
  Info,
  ListChecks,
  Newspaper,
  ShieldCheck,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  councilSessionV0DemoFixture,
  councilSessionV0ContextMediaAvailabilityLabels,
  councilSessionV0ContextMediaTypeLabels,
  councilSessionV0ContextRelationshipLabels,
  councilSessionV0FieldStatusLabels,
  councilSessionV0KindLabels,
  councilSessionV0StatusLabels,
  type CouncilSessionV0,
  type CouncilSessionV0Field,
  type CouncilSessionV0FieldStatus,
} from "@/data/councilSessionV0";

function formatDate(value: string | null) {
  if (!value) return "Data da verificare";
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(isDateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(
    "it-IT",
    isDateOnly
      ? { dateStyle: "long", timeZone: "UTC" }
      : { dateStyle: "long", timeStyle: "short" },
  ).format(date);
}

function formatPublishedDate(value: string | null) {
  if (!value) return "Data non disponibile";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeZone: "Europe/Rome",
  }).format(date);
}

function textValue(field: CouncilSessionV0Field<unknown>) {
  if (
    (field.key === "scheduledAt" || field.key === "lastCheckedAt") &&
    typeof field.value === "string"
  ) {
    return formatDate(field.value);
  }

  if (field.key === "sessionStatus" && typeof field.value === "string") {
    return (
      councilSessionV0StatusLabels[
        field.value as keyof typeof councilSessionV0StatusLabels
      ] ?? field.value
    );
  }

  if (typeof field.value === "string" && field.value.trim()) {
    return field.value;
  }

  return "Non disponibile";
}

function FieldValue({ field }: { field: CouncilSessionV0Field<unknown> }) {
  if (Array.isArray(field.value)) {
    if (field.value.length === 0) return <p>Non disponibile</p>;
    const listClass =
      "space-y-1.5 pl-5 text-sm leading-relaxed text-foreground";
    if (field.key === "agenda") {
      return (
        <ol className={`${listClass} list-decimal`}>
          {field.value.map((item, index) => (
            <li key={`${field.key}-${index}`}>{String(item)}</li>
          ))}
        </ol>
      );
    }
    return (
      <ul className={`${listClass} list-disc`}>
        {field.value.map((item, index) => (
          <li key={`${field.key}-${index}`}>{String(item)}</li>
        ))}
      </ul>
    );
  }

  if (field.key === "sourceLink" && field.sourceUrl && field.value) {
    return (
      <a
        href={field.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
      >
        {String(field.value)}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    );
  }

  return <p className="text-sm text-foreground">{textValue(field)}</p>;
}

const FIELD_BADGE_VARIANTS: Record<
  CouncilSessionV0FieldStatus,
  "success" | "warning" | "secondary" | "outline"
> = {
  verificato: "success",
  parziale: "warning",
  assente: "outline",
  da_verificare: "warning",
  fixture_dimostrativa: "outline",
};

export function CouncilSessionV0Notice({
  session,
  compact = false,
}: {
  session: CouncilSessionV0;
  compact?: boolean;
}) {
  if (session.isDemoFixture) {
    return (
      <div className="rounded-2xl border border-amber-300/50 bg-amber-50 p-4 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
        <div className="flex gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-1 text-sm leading-relaxed">
            <p className="font-semibold">Fallback dimostrativo dichiarato</p>
            <p>
              Questa scheda usa una fixture tecnica e non rappresenta una
              convocazione reale. Non va usata come fonte civica.
            </p>
            {!compact && (
              <p>
                I contenuti reali richiedono fonte originaria, stato del dato,
                limiti e data di controllo.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
      <div className="flex gap-3">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-brand"
          aria-hidden="true"
        />
        <div className="space-y-1 text-sm leading-relaxed">
          <p className="font-semibold text-foreground">
            Scheda collegata a fonte ufficiale
          </p>
          <p className="text-muted-foreground">
            I dati provengono dalla pubblicazione Albo{" "}
            {session.provenance?.publicationNumber}. La convocazione documenta
            una programmazione o un avviso: non prova, da sola, che la seduta si
            sia svolta.
          </p>
          {!compact && (
            <p className="text-muted-foreground">
              Ogni campo distingue ciò che è stato verificato, ciò che è
              parziale e ciò che non è stato rilevato nella fonte consultata.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CouncilSessionV0DemoNotice({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <CouncilSessionV0Notice
      session={councilSessionV0DemoFixture}
      compact={compact}
    />
  );
}

export function CouncilSessionV0SummaryCard({
  session,
}: {
  session: CouncilSessionV0;
}) {
  const isDemo = session.isDemoFixture;
  const sourceReviewLabel =
    session.provenance?.sourceReviewStatus ===
    "reviewed_against_official_attachment"
      ? "Allegato ufficiale controllato"
      : "Metadati ufficiali disponibili";
  const contextArticleCount = session.contextResearch.articles.length;
  const contextMediaCount = session.contextResearch.media.length;

  return (
    <Card
      className={
        isDemo
          ? "border-amber-300/50 bg-amber-50/70 p-5 dark:border-amber-500/40 dark:bg-amber-500/10"
          : "border-brand/25 bg-card p-5"
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant={isDemo ? "outline" : "success"}>
          {isDemo ? "Fixture dimostrativa" : sourceReviewLabel}
        </Badge>
        <Badge variant="secondary">
          {councilSessionV0KindLabels[session.kind]}
        </Badge>
      </div>
      <h3 className="font-display text-xl font-bold tracking-tight">
        {session.title.value ?? "Scheda seduta"}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {isDemo
          ? "Esempio tecnico privo di valore informativo reale."
          : session.provenance?.sourceReviewStatus === "official_metadata_only"
            ? "Avviso individuato nell'Albo; data, ora e ordine del giorno restano da verificare."
            : "Data, ora e ordine del giorno sono stati confrontati con l'allegato ufficiale archiviato."}
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-foreground">Data scheda</dt>
          <dd className="text-muted-foreground">
            {formatDate(session.scheduledAt.value)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Stato seduta</dt>
          <dd className="text-muted-foreground">
            {
              councilSessionV0StatusLabels[
                session.sessionStatus.value ?? "non_verificata"
              ]
            }
          </dd>
        </div>
      </dl>
      {!isDemo && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <Newspaper
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
            aria-hidden="true"
          />
          <span>
            {session.contextResearch.status === "reviewed_matches"
              ? [
                  contextArticleCount > 0
                    ? `${contextArticleCount} ${contextArticleCount === 1 ? "articolo contestuale revisionato" : "articoli contestuali revisionati"}`
                    : null,
                  contextMediaCount > 0
                    ? `${contextMediaCount} ${contextMediaCount === 1 ? "video revisionato" : "video revisionati"}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Ricerca di contesto revisionata"
              : session.contextResearch.status === "checked_no_match"
                ? "Ricerca di contesto eseguita: nessuna corrispondenza sufficientemente precisa"
                : "Ricerca di contesto da eseguire"}
          </span>
        </div>
      )}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="sm:w-auto">
          <Link href={`/convocazioni/${session.id}`}>
            {isDemo ? "Apri scheda demo" : "Apri scheda"}
          </Link>
        </Button>
        {session.sourceLink.sourceUrl ? (
          <Button asChild variant="outline" className="sm:w-auto">
            <a
              href={session.sourceLink.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Fonte ufficiale
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        ) : (
          <Button asChild variant="outline" className="sm:w-auto">
            <Link href="/fonti-dati">Fonti e limiti</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}

export function CouncilSessionV0DemoSummaryCard() {
  return <CouncilSessionV0SummaryCard session={councilSessionV0DemoFixture} />;
}

export function CouncilSessionV0Detail({
  session,
}: {
  session: CouncilSessionV0;
}) {
  const isDemo = session.isDemoFixture;
  const followUpDocuments = [
    session.liveStreaming,
    session.recording,
    session.minutesOrReport,
  ] as const;
  const availableFollowUpDocuments = followUpDocuments.filter(
    (field) => typeof field.value === "string" && field.value.trim().length > 0,
  );
  const technicalFields = [
    session.scheduledAt,
    session.agenda,
    ...followUpDocuments,
  ] as const;
  const agendaAvailable = (session.agenda.value?.length ?? 0) > 0;
  const displayTitle =
    session.scheduledAt.value && session.title.value
      ? session.title.value.split(" — seduta del ")[0]
      : (session.title.value ?? "Scheda seduta");
  const detailStatusLabel =
    session.sessionStatus.value === "programmata"
      ? "Programmata"
      : session.sessionStatus.value === "svolta"
        ? "Svolta"
        : session.sessionStatus.value === "rinviata"
          ? "Rinviata"
          : "Non verificato";
  const hasContextMedia = session.contextResearch.media.length > 0;
  const hasContextArticles = session.contextResearch.articles.length > 0;
  const contextItemCount =
    session.contextResearch.articles.length +
    session.contextResearch.media.length;
  const hasContextItems = contextItemCount > 0;
  const contextStatusLabel =
    session.contextResearch.status === "checked_no_match"
      ? "Nessun risultato"
      : session.contextResearch.status === "not_run"
        ? "Da controllare"
        : contextItemCount === 0
          ? "Ricerca eseguita"
          : contextItemCount === 1
            ? "1 collegamento"
            : `${contextItemCount} collegamenti`;

  return (
    <div className="space-y-4 md:space-y-5">
      <header className="overflow-hidden rounded-2xl border border-border bg-card">
        <span
          className={
            "block h-1.5 w-full " + (isDemo ? "bg-amber-500" : "bg-brand")
          }
        />
        <div className="p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {councilSessionV0KindLabels[session.kind]}
            </Badge>
            <Badge variant={isDemo ? "outline" : "success"}>
              {isDemo
                ? "Scheda demo"
                : session.provenance?.sourceReviewStatus ===
                    "reviewed_against_official_attachment"
                  ? "Allegato ufficiale controllato"
                  : "Metadati ufficiali"}
            </Badge>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_15rem] md:items-start">
            <div>
              <p className="flex items-center gap-2 text-base font-bold text-brand md:text-lg">
                <CalendarClock
                  className="h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                {formatDate(session.scheduledAt.value)}
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight md:text-4xl">
                {displayTitle}
              </h1>
            </div>

            <dl className="rounded-xl border border-border bg-muted/35 p-4">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Stato della seduta
                </dt>
                <dd className="mt-1 text-base font-bold text-foreground">
                  {detailStatusLabel}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
            <FieldValue field={session.sourceLink} />
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                aria-hidden="true"
              />
              {isDemo
                ? "Esempio tecnico: non descrive una seduta reale."
                : session.sessionStatus.value === "svolta" &&
                    session.sessionStatus.sourceStatus === "verificato"
                  ? "Una fonte istituzionale successiva conferma la seduta."
                  : "La convocazione non prova lo svolgimento della seduta."}
            </p>
          </div>
        </div>
      </header>

      <nav
        aria-label="Sezioni della scheda"
        className="sticky top-16 z-40 overflow-x-auto rounded-xl border border-border bg-background/95 p-1.5 shadow-sm backdrop-blur"
      >
        <div className="flex min-w-max gap-1 text-sm font-semibold">
          <a
            href="#ordine-del-giorno"
            className="rounded-lg px-3 py-2 text-brand hover:bg-brand/10"
          >
            Ordine del giorno
          </a>
          <a
            href="#contenuti-collegati"
            className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Articoli e video
          </a>
          <a
            href="#documenti-ufficiali"
            className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Documenti
          </a>
          <a
            href="#fonti-limiti-v0"
            className="rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Fonti
          </a>
        </div>
      </nav>

      <section
        id="ordine-del-giorno"
        aria-labelledby="session-agenda-title"
        className="scroll-mt-36"
      >
        <Card className="border-brand/25 p-5 shadow-sm md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2
                id="session-agenda-title"
                className="font-display text-2xl font-bold tracking-tight"
              >
                Ordine del giorno
              </h2>
            </div>
            <Badge
              variant={FIELD_BADGE_VARIANTS[session.agenda.sourceStatus]}
              className="whitespace-normal"
            >
              {session.agenda.sourceStatus === "verificato"
                ? "Verificato"
                : session.agenda.sourceStatus === "parziale"
                  ? "Parziale"
                  : session.agenda.sourceStatus === "fixture_dimostrativa"
                    ? "Dimostrativo"
                    : "Non disponibile"}
            </Badge>
          </div>
          {agendaAvailable ? (
            <div className="rounded-xl bg-muted/35 p-4 md:p-5">
              <FieldValue field={session.agenda} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ordine del giorno non disponibile.
            </p>
          )}
          {agendaAvailable && session.agenda.sourceUrl && (
            <a
              href={session.agenda.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              Consulta l&apos;ordine del giorno ufficiale
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </Card>
      </section>

      <section
        id="contenuti-collegati"
        aria-labelledby="session-context-title"
        className="scroll-mt-36 rounded-2xl border border-border bg-card p-5 md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
              <Newspaper className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2
              id="session-context-title"
              className="font-display text-xl font-bold tracking-tight"
            >
              Articoli e video
            </h2>
          </div>
          <Badge variant="outline" className="whitespace-normal">
            {contextStatusLabel}
          </Badge>
        </div>

        {hasContextItems ? (
          <div
            className={
              "mt-5 grid gap-6 " +
              (hasContextMedia && hasContextArticles
                ? "lg:grid-cols-2"
                : "grid-cols-1")
            }
          >
            {hasContextMedia && (
              <div aria-labelledby="session-media-title">
                <h3
                  id="session-media-title"
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground"
                >
                  <Video className="h-4 w-4 text-brand" aria-hidden="true" />
                  Video
                </h3>

                <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                  {session.contextResearch.media.map((media) => (
                    <li key={media.url} className="p-4">
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-start gap-1.5 font-semibold text-foreground hover:text-brand hover:underline"
                      >
                        {media.title}
                        <ExternalLink
                          className="mt-1 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {media.publisher} ·{" "}
                        {formatPublishedDate(media.publishedAt)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {
                          councilSessionV0ContextMediaTypeLabels[
                            media.mediaType
                          ]
                        }{" "}
                        ·{" "}
                        {
                          councilSessionV0ContextMediaAvailabilityLabels[
                            media.availability
                          ]
                        }
                      </p>
                      <details className="mt-2 text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-semibold text-brand">
                          Perché è collegato
                        </summary>
                        <p className="mt-2 leading-relaxed">
                          {media.relevanceNote}
                        </p>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasContextArticles && (
              <div aria-labelledby="session-articles-title">
                <h3
                  id="session-articles-title"
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground"
                >
                  <Newspaper
                    className="h-4 w-4 text-brand"
                    aria-hidden="true"
                  />
                  Articoli
                </h3>

                <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                  {session.contextResearch.articles.map((article) => (
                    <li key={article.url} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="whitespace-normal"
                        >
                          {
                            councilSessionV0ContextRelationshipLabels[
                              article.relationship
                            ]
                          }
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.publisher} ·{" "}
                          {formatPublishedDate(article.publishedAt)}
                        </span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-start gap-1.5 font-semibold leading-snug text-foreground hover:text-brand hover:underline"
                      >
                        {article.title}
                        <ExternalLink
                          className="mt-1 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                      <details className="mt-2 text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-semibold text-brand">
                          Perché è collegato
                        </summary>
                        <p className="mt-2 leading-relaxed">
                          {article.relevanceNote}
                        </p>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {session.contextResearch.status === "not_run"
              ? "Nessun contenuto ancora revisionato."
              : "Nessun articolo o video pertinente trovato."}
          </p>
        )}

        {hasContextItems && !hasContextMedia && (
          <p className="mt-3 text-xs text-muted-foreground">
            Nessun video verificabile trovato.
          </p>
        )}
        {hasContextItems && !hasContextArticles && (
          <p className="mt-3 text-xs text-muted-foreground">
            Nessun articolo pertinente trovato.
          </p>
        )}

        <div
          className={
            "flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-start sm:justify-between " +
            (hasContextItems ? "mt-5 border-t border-border pt-4" : "mt-3")
          }
        >
          {hasContextItems && (
            <p>Articoli e video non sostituiscono le fonti ufficiali.</p>
          )}
          <details className="shrink-0 sm:max-w-xl">
            <summary className="cursor-pointer font-semibold text-brand">
              Dettagli della ricerca
            </summary>
            <p className="mt-2 leading-relaxed">
              {session.contextResearch.searchNote}
            </p>
            {session.contextResearch.checkedAt && (
              <p className="mt-2">
                Controllata il {formatDate(session.contextResearch.checkedAt)}.
              </p>
            )}
          </details>
        </div>
      </section>

      <section
        id="documenti-ufficiali"
        aria-labelledby="session-documents-title"
        className={
          "scroll-mt-36 rounded-2xl border border-border bg-card " +
          (availableFollowUpDocuments.length > 0 ? "p-5 md:p-6" : "p-4")
        }
      >
        <div className="flex items-center gap-2.5">
          <span
            className={
              "flex items-center justify-center rounded-md bg-brand/10 text-brand " +
              (availableFollowUpDocuments.length > 0 ? "h-8 w-8" : "h-7 w-7")
            }
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="session-documents-title"
              className={
                "font-display font-bold tracking-tight " +
                (availableFollowUpDocuments.length > 0
                  ? "text-xl"
                  : "text-base")
              }
            >
              Documenti e registrazioni
            </h2>
            {availableFollowUpDocuments.length === 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Nessun documento successivo disponibile.
              </p>
            )}
          </div>
        </div>

        {availableFollowUpDocuments.length > 0 ? (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {availableFollowUpDocuments.map((field) => (
              <li
                key={field.key}
                className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-semibold text-foreground">
                  {field.label}
                </span>
                {field.sourceUrl ? (
                  <a
                    href={field.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                  >
                    {field.value}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {field.value}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <details
        id="fonti-limiti-v0"
        className="group scroll-mt-36 rounded-2xl border border-border bg-card"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2.5 p-4 font-display text-base font-semibold tracking-tight">
          <Info className="h-4 w-4 text-brand" aria-hidden="true" />
          Fonti, verifiche e limiti
          <span className="ml-auto text-sm font-normal text-muted-foreground group-open:hidden">
            Mostra dettagli
          </span>
          <span className="ml-auto hidden text-sm font-normal text-muted-foreground group-open:inline">
            Nascondi dettagli
          </span>
        </summary>

        <div className="border-t border-border p-5 md:p-6">
          {isDemo ? (
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>La fixture non contiene una fonte reale.</li>
              <li>Non certifica copertura storica né una seduta effettiva.</li>
              <li>Serve esclusivamente a verificare struttura e copy.</li>
            </ul>
          ) : (
            <dl className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="font-semibold text-foreground">
                  Pubblicazione Albo
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  {session.provenance?.publicationNumber}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Acquisita il</dt>
                <dd className="mt-1 text-muted-foreground">
                  {formatDate(session.provenance?.retrievedAt ?? null)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">
                  Ultimo controllo
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  {formatDate(session.lastCheckedAt.value)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">
                  Stato della fonte
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  {session.provenance?.sourceReviewStatus ===
                  "reviewed_against_official_attachment"
                    ? "Metadati e allegato ufficiale controllati"
                    : "Solo metadati ufficiali; allegato non disponibile nell'export"}
                </dd>
              </div>
            </dl>
          )}

          <div className="mt-5 border-t border-border pt-5">
            <h3 className="font-semibold text-foreground">Stato dei dati</h3>
            <div className="mt-3 divide-y divide-border rounded-xl border border-border">
              {technicalFields.map((field) => (
                <div key={field.key} className="p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {field.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {councilSessionV0FieldStatusLabels[field.sourceStatus]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {field.limit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {session.dataLimits.value && (
            <div className="mt-5 border-t border-border pt-5">
              <h3 className="font-semibold text-foreground">Limiti del dato</h3>
              <FieldValue field={session.dataLimits} />
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {session.provenance?.documentUrl && (
              <Button asChild variant="outline">
                <a
                  href={session.provenance.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Allegato ufficiale
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            )}
            {session.provenance?.archivedDocumentUrl && (
              <Button asChild variant="outline">
                <a
                  href={session.provenance.archivedDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Copia archiviata
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/metodologia">Leggi metodologia e cautele</Link>
            </Button>
          </div>
        </div>
      </details>
    </div>
  );
}

export function CouncilSessionV0DemoDetail({
  session = councilSessionV0DemoFixture,
}: {
  session?: CouncilSessionV0;
}) {
  return <CouncilSessionV0Detail session={session} />;
}
