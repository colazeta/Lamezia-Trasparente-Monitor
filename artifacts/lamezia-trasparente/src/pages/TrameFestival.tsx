import type { ReactNode } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { CivicMonitorReturn } from "@/components/CivicMonitorReturn";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  getPublishedTrameFestivalCards,
  trameFestivalMethodology,
  trameFestivalQualityCriteria,
  type TramePublicCard,
} from "@/content/trameFestival";

const CONTENT_TYPE_LABELS: Record<TramePublicCard["content_type"], string> = {
  proposta: "Proposta",
  analisi_del_contesto: "Analisi del contesto",
  diagnosi: "Diagnosi",
  policy_suggestion: "Policy suggestion",
  memoria_civica: "Memoria civica",
  benchmark: "Benchmark",
  indicatore_potenziale: "Indicatore potenziale",
  accesso_civico_potenziale: "Accesso civico potenziale",
};

const TRANSCRIPT_STATUS_LABELS: Record<TramePublicCard["transcript_status"], string> = {
  not_started: "Transcript non avviato",
  auto_available: "Transcript automatico disponibile",
  downloaded: "Transcript scaricato",
  normalised: "Transcript normalizzato",
  review_required: "Revisione richiesta",
  human_verified: "Verificato umanamente",
  blocked: "Accesso transcript bloccato",
};

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function TrameFestival() {
  const publicCards = getPublishedTrameFestivalCards();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <Link
        href="/legalita"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Torna a Legalita
      </Link>

      <header className="mb-8 max-w-4xl space-y-4">
        <span className="eyebrow text-primary">
          <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Raccolta selettiva
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Trame - Festival
        </h1>
        <p className="text-lg text-muted-foreground">
          {trameFestivalMethodology.subtitle}
        </p>
      </header>

      <section className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="border-brand/30 bg-brand/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold">
                Metodo pubblico
              </h2>
              <dl className="grid gap-3 text-sm md:grid-cols-2">
                <MethodItem label="Fonte principale">
                  {trameFestivalMethodology.primarySource}
                </MethodItem>
                <MethodItem label="Criterio di selezione">
                  {trameFestivalMethodology.selectionCriteria}
                </MethodItem>
                <MethodItem label="Stato trascrizioni">
                  {trameFestivalMethodology.transcriptState}
                </MethodItem>
                <MethodItem label="Ultimo aggiornamento">
                  {formatDate(trameFestivalMethodology.lastUpdated)}
                </MethodItem>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold">
                Limiti della versione pubblica
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {trameFestivalMethodology.knownLimits}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {trameFestivalMethodology.internalRepository}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section aria-labelledby="trame-public-cards" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-primary">
              <Scale className="h-3.5 w-3.5" aria-hidden="true" />
              Schede pubbliche
            </span>
            <h2
              id="trame-public-cards"
              className="mt-2 font-display text-2xl font-bold tracking-tight"
            >
              Idee, proposte e analisi approvate
            </h2>
          </div>
          <Badge variant="outline" className="w-fit border-border bg-muted text-muted-foreground">
            {publicCards.length === 0
              ? "Nessuna scheda approvata"
              : `${publicCards.length} schede pubbliche`}
          </Badge>
        </div>

        {publicCards.length > 0 ? (
          <div className="grid gap-4">
            {publicCards.map((card) => (
              <TramePublicCardView key={card.card_id} card={card} />
            ))}
          </div>
        ) : (
          <Empty className="border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
                <BookOpenCheck className="h-6 w-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Nessuna scheda pubblica approvata</EmptyTitle>
              <EmptyDescription>
                La raccolta e in fase di revisione. Le idee e le analisi
                saranno pubblicate solo quando saranno attribuite a un
                interlocutore, collegate al minuto del video e sottoposte a
                controllo redazionale.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <section className="mt-10" aria-labelledby="trame-quality-filter">
        <h2
          id="trame-quality-filter"
          className="font-display text-xl font-bold tracking-tight"
        >
          Filtro editoriale prima della pubblicazione
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Formule generiche come "serve piu legalita", "bisogna fare rete" o
          "la cultura e importante" restano escluse se non sono accompagnate da
          analisi concreta, meccanismo causale, proposta operativa o riferimento
          territoriale verificabile.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {trameFestivalQualityCriteria.map((criterion) => (
            <Card key={criterion} className="p-4">
              <div className="flex gap-3">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <p className="text-sm text-muted-foreground">{criterion}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <CivicMonitorReturn context="La sezione Trame collega memoria civica, legalita, proposta pubblica e accesso civico solo dopo verifica puntuale di fonti, minuti video e cautele redazionali." />
    </div>
  );
}

function MethodItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{label}</dt>
      <dd className="mt-1 text-muted-foreground">{children}</dd>
    </div>
  );
}

function TramePublicCardView({ card }: { card: TramePublicCard }) {
  return (
    <Card className="overflow-hidden p-0">
      <article className="border-l-4 border-brand p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{CONTENT_TYPE_LABELS[card.content_type]}</Badge>
          <Badge variant="outline" className="border-brand/30 bg-brand/5 text-brand">
            {card.editorial_priority}
          </Badge>
          <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
            {card.verification_status}
          </Badge>
        </div>

        <h3 className="font-display text-xl font-bold tracking-tight">
          {card.card_title}
        </h3>

        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <MethodItem label="Interlocutore">
            {card.speaker_name}, {card.speaker_role}
          </MethodItem>
          <MethodItem label="Evento">
            {card.event_title}, Trame Festival {card.edition_year}
          </MethodItem>
          <MethodItem label="Data">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(card.event_date)}
            </span>
          </MethodItem>
          <MethodItem label="Fonte">
            <a
              href={card.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              {card.source_label}, minuto {card.video_minute}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </MethodItem>
          <MethodItem label="Stato trascrizione">
            {TRANSCRIPT_STATUS_LABELS[card.transcript_status]}
          </MethodItem>
          <MethodItem label="Rilevanza territoriale">
            {card.territorial_relevance}
          </MethodItem>
        </dl>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <TextBlock title="Contenuto espresso">
            {card.content_summary}
          </TextBlock>
          <TextBlock title="Rilevanza per Lamezia">
            {card.relevance_for_lamezia}
          </TextBlock>
          <TextBlock title="Possibile traduzione civica">
            {card.possible_civic_translation}
          </TextBlock>
        </div>

        {card.editorial_note.trim() ? (
          <p className="mt-4 border-l-2 border-border pl-3 text-sm leading-relaxed text-muted-foreground">
            {card.editorial_note}
          </p>
        ) : null}
      </article>
    </Card>
  );
}

function TextBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
