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
  getCouncilSessionV0PublicFieldNote,
  type CouncilSessionV0,
  type CouncilSessionV0Field,
  type CouncilSessionV0FieldStatus,
} from "@/data/councilSessionV0";

function formatDate(value: string | null) {
  if (!value) return "Data da verificare";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
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

function V0StatusBadge({ field }: { field: CouncilSessionV0Field<unknown> }) {
  return (
    <Badge
      variant={FIELD_BADGE_VARIANTS[field.sourceStatus]}
      className="whitespace-normal text-left"
    >
      {councilSessionV0FieldStatusLabels[field.sourceStatus]}
    </Badge>
  );
}

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

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="overflow-hidden rounded-2xl border border-border bg-card">
        <span
          className={
            "block h-1.5 w-full " + (isDemo ? "bg-amber-500" : "bg-brand")
          }
        />
        <div className="p-5 md:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant={isDemo ? "outline" : "success"}>
              {isDemo
                ? "Scheda demo"
                : session.provenance?.sourceReviewStatus ===
                    "reviewed_against_official_attachment"
                  ? "Allegato ufficiale controllato"
                  : "Metadati ufficiali"}
            </Badge>
            <Badge variant="secondary">
              {councilSessionV0KindLabels[session.kind]}
            </Badge>
          </div>

          <h1 className="max-w-4xl font-display text-3xl font-bold tracking-tight md:text-4xl">
            {session.title.value ?? "Scheda seduta"}
          </h1>

          <dl className="mt-6 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Data e ora
              </dt>
              <dd className="mt-1 font-semibold text-foreground">
                {formatDate(session.scheduledAt.value)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Stato
              </dt>
              <dd className="mt-1 font-semibold text-foreground">
                {
                  councilSessionV0StatusLabels[
                    session.sessionStatus.value ?? "non_verificata"
                  ]
                }
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Fonte primaria
              </dt>
              <dd className="mt-1">
                <FieldValue field={session.sourceLink} />
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <CouncilSessionV0Notice session={session} compact />

      <section aria-labelledby="session-agenda-title">
        <Card className="p-5 md:p-6">
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
            <V0StatusBadge field={session.agenda} />
          </div>
          <FieldValue field={session.agenda} />
          <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            {getCouncilSessionV0PublicFieldNote(session.agenda)}
          </p>
          {session.agenda.sourceUrl && (
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

      {session.contextResearch.media.length > 0 && (
        <section
          aria-labelledby="session-media-title"
          className="space-y-4 rounded-2xl border border-border bg-muted/20 p-5 md:p-6"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
              <Video className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2
              id="session-media-title"
              className="font-display text-2xl font-bold tracking-tight"
            >
              Diretta e video
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Copertura audiovisiva pubblicata da testate o canali esterni. Non
            equivale allo streaming istituzionale e non certifica completezza,
            svolgimento o risultati della seduta.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {session.contextResearch.media.map((media) => (
              <article
                key={media.url}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="whitespace-normal">
                    {councilSessionV0ContextMediaTypeLabels[media.mediaType]}
                  </Badge>
                  <Badge variant="outline" className="whitespace-normal">
                    {
                      councilSessionV0ContextMediaAvailabilityLabels[
                        media.availability
                      ]
                    }
                  </Badge>
                  <Badge variant="outline" className="whitespace-normal">
                    {
                      councilSessionV0ContextRelationshipLabels[
                        media.relationship
                      ]
                    }
                  </Badge>
                </div>
                <h3 className="font-display text-lg font-bold leading-snug">
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 text-foreground hover:text-brand hover:underline"
                  >
                    {media.title}
                    <ExternalLink
                      className="mt-1 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {media.publisher} · {formatPublishedDate(media.publishedAt)}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {media.relevanceNote}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section
        aria-labelledby="session-context-title"
        className="space-y-4 rounded-2xl border border-border bg-muted/20 p-5 md:p-6"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
            <Newspaper className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2
            id="session-context-title"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Articoli e contesto
          </h2>
        </div>

        <p className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          {session.contextResearch.searchNote}
        </p>

        {session.contextResearch.articles.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {session.contextResearch.articles.map((article) => (
              <article
                key={article.url}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="whitespace-normal">
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
                <h3 className="font-display text-lg font-bold leading-snug">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 text-foreground hover:text-brand hover:underline"
                  >
                    {article.title}
                    <ExternalLink
                      className="mt-1 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {article.relevanceNote}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
            {session.contextResearch.status === "checked_no_match"
              ? "Ricerca eseguita: nessun articolo collegabile con sufficiente precisione. Il risultato negativo descrive soltanto il controllo effettuato."
              : session.contextResearch.status === "reviewed_matches" &&
                  session.contextResearch.media.length > 0
                ? "Nessun articolo collegabile con sufficiente precisione; i contenuti audiovisivi revisionati sono presentati nella sezione precedente."
                : "Ricerca di contesto non eseguita per questa scheda."}
          </p>
        )}

        <p className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm leading-relaxed text-muted-foreground">
          Articoli e video aiutano a leggere il dibattito pubblico, ma non
          sostituiscono l&apos;Albo e non completano i campi ufficiali.
        </p>

        {session.contextResearch.checkedAt && (
          <p className="text-xs text-muted-foreground">
            Ricerca contestuale controllata il{" "}
            {formatDate(session.contextResearch.checkedAt)}.
          </p>
        )}
      </section>

      <section aria-labelledby="session-documents-title" className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2
            id="session-documents-title"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Documenti e registrazioni ufficiali
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {followUpDocuments.map((field) => (
            <Card key={field.key} className="p-4">
              <h3 className="text-sm font-semibold text-foreground">
                {field.label}
              </h3>
              <div className="mt-2">
                <FieldValue field={field} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {councilSessionV0FieldStatusLabels[field.sourceStatus]}
              </p>
            </Card>
          ))}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Questo blocco riguarda esclusivamente fonti istituzionali. Eventuali
          dirette o video delle testate sono presentati separatamente nella
          copertura editoriale.
        </p>
      </section>

      <details
        id="fonti-limiti-v0"
        className="group rounded-2xl border border-border bg-card"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2.5 p-5 font-display text-xl font-bold tracking-tight md:p-6">
          <Info className="h-5 w-5 text-brand" aria-hidden="true" />
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

          {session.dataLimits.value && (
            <div className="mt-5 border-t border-border pt-5">
              <h3 className="font-semibold text-foreground">Limiti del dato</h3>
              <FieldValue field={session.dataLimits} />
            </div>
          )}

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Un campo assente o parziale descrive la copertura delle fonti
            monitorate. Non è una valutazione sull&apos;ente, sulla regolarità
            degli atti o sulla disponibilità complessiva della documentazione.
          </p>

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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/convocazioni">
            <CalendarClock className="mr-2 h-4 w-4" aria-hidden="true" />
            Torna alle convocazioni
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Torna alla Home</Link>
        </Button>
      </div>
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
