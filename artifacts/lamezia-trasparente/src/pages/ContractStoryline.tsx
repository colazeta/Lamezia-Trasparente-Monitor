import { useRoute, Link } from "wouter";
import {
  useGetContractStoryline,
  getGetContractStorylineQueryKey,
  useListPublications,
  type StorylineEvent,
  type StorylineIndicators,
  type LifecyclePhase,
  type StorylineStatus,
  type Publication,
  type Contract,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  ExternalLink,
  Euro,
  Building2,
  Gavel,
  Calendar,
  Landmark,
  FileText,
  Gavel as GavelIcon,
  FileSignature,
  GitBranch,
  Banknote,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Telescope,
  ShoppingCart,
  Layers,
  MapPin,
  FileCheck,
  FileSearch,
  History,
  ShieldAlert,
  Paperclip,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlboLink } from "@/components/AlboLink";
import { MonitoringReportsSection } from "@/components/MonitoringReportsSection";
import {
  ContractEvidencePanel,
  ContractIdentifiersCard,
  ContractLifecycleRail,
  ContractPublicLimitsBox,
  ContractWorkAxisCard,
} from "@/components/contracts";
import { quartiereLabel } from "@/lib/gis";
import { MACROTEMA_LABELS } from "@/lib/macrotema";
import { buildContractDossier } from "@/lib/contractDossier";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

function formatEuro(value: number, compact = false): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

const PHASE_META: Record<
  LifecyclePhase,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  affidamento: { label: "Affidamento", icon: GavelIcon },
  contratto: { label: "Contratto", icon: FileSignature },
  variante: { label: "Variante", icon: GitBranch },
  liquidazione: { label: "Liquidazione", icon: Banknote },
  collaudo: { label: "Collaudo / chiusura", icon: CheckCircle2 },
  altro: { label: "Altro atto", icon: Circle },
};

// Ordine canonico del ciclo di vita di una spesa, usato per lo stepper.
const LIFECYCLE_ORDER: LifecyclePhase[] = [
  "affidamento",
  "contratto",
  "variante",
  "liquidazione",
  "collaudo",
];

const STATUS_META: Record<
  StorylineStatus,
  { label: string; className: string }
> = {
  liquidato: {
    label: "Liquidato",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  in_corso: {
    label: "In documentazione",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  nessuna_liquidazione: {
    label: "Nessuna liquidazione registrata",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
};

export function ContractStoryline() {
  const [, params] = useRoute("/contratti/:id");
  const id = params?.id ? Number(params.id) : NaN;

  const { data, isLoading, isError } = useGetContractStoryline(id, {
    query: {
      enabled: !Number.isNaN(id),
      queryKey: getGetContractStorylineQueryKey(id),
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link
        href="/contratti"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna ai fascicoli
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : isError || !data ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Fascicolo non trovato</EmptyTitle>
            <EmptyDescription>
              Il fascicolo richiesto non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <StorylineContent
          contract={data.contract}
          timeline={data.timeline}
          indicators={data.indicators}
        />
      )}
    </div>
  );
}

function StorylineContent({
  contract,
  timeline,
  indicators,
}: {
  contract: Contract;
  timeline: StorylineEvent[];
  indicators: StorylineIndicators;
}) {
  const status = STATUS_META[indicators.status];
  const macrotemaLabel = contract.macrotema
    ? (MACROTEMA_LABELS[contract.macrotema] ?? null)
    : null;
  const locationLabel = contract.geoAddress
    ? contract.geoAddress
    : contract.geoQuartiere
      ? quartiereLabel(contract.geoQuartiere)
      : null;
  const dossier = buildContractDossier({ contract, timeline, indicators });
  const primaryOfficialLink = dossier.officialLinks[0] ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header
        data-tour="contract-detail"
        className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {contract.cig ? (
            <Badge variant="brand" className="font-mono text-xs shadow-none">
              CIG {contract.cig}
            </Badge>
          ) : null}
          {contract.cup ? (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              CUP {contract.cup}
            </Badge>
          ) : null}
          {contract.withoutTender ? (
            <Badge className="border-transparent bg-amber-100 text-amber-800 text-xs shadow-none dark:bg-amber-500/20 dark:text-amber-300">
              Affidamento diretto dichiarato
            </Badge>
          ) : null}
          {contract.withoutMepa ? (
            <Badge className="border-transparent bg-amber-100 text-amber-800 text-xs shadow-none dark:bg-amber-500/20 dark:text-amber-300">
              Fuori MePA dichiarato
            </Badge>
          ) : null}
          <Badge className={`text-xs shadow-none ${status.className}`}>
            {status.label}
          </Badge>
        </div>
        <h1 className="mt-3 font-display text-2xl md:text-3xl font-bold tracking-tight leading-snug">
          {contract.title}
        </h1>
        {contract.description ? (
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {contract.description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href="#timeline-contratto"
            className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/20"
          >
            <History className="h-4 w-4" />
            Leggi la timeline
          </a>
          {primaryOfficialLink ? (
            <a
              href={primaryOfficialLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Apri fonte ufficiale / ricerca
            </a>
          ) : null}
          <Link
            href={`/monitoraggio/nuovo?contractId=${contract.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/20"
            data-testid="link-monitora-contratto"
          >
            <Telescope className="h-4 w-4" />
            Monitora questo progetto
          </Link>
        </div>
      </header>

      <ContractTimeline
        title={contract.title}
        timeline={timeline}
        indicators={indicators}
      />

      <ContractLifecycleRail dossier={dossier} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ContractIdentifiersCard dossier={dossier} />
        <ContractWorkAxisCard dossier={dossier} />
      </div>

      <ContractEvidencePanel dossier={dossier} />

      <ContractPublicLimitsBox limits={dossier.publicLimits} />

      {/* Dati del fascicolo */}
      <section>
        <h2 className="mb-1 font-display text-xl font-bold tracking-tight">
          Dati del fascicolo
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          I dati identificativi rilevati nelle fonti pubbliche disponibili,
          senza colmare automaticamente i campi assenti.
        </p>
        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-sm">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 text-sm">
            <MetaRow
              icon={Euro}
              label="Importo rilevato"
              value={
                contract.amount > 0
                  ? formatEuro(contract.amount)
                  : "Non disponibile"
              }
            />
            <MetaRow
              icon={Building2}
              label="Beneficiario"
              value={contract.supplier}
            />
            <MetaRow
              icon={Gavel}
              label="Modalità di scelta"
              value={contract.procedureType}
            />
            <MetaRow
              icon={ShoppingCart}
              label="Strumento di acquisizione"
              value={contract.acquisitionTool}
            />
            <MetaRow
              icon={Landmark}
              label="Stazione appaltante"
              value={contract.stazioneAppaltante ?? "Comune di Lamezia Terme"}
            />
            <MetaRow
              icon={Calendar}
              label="Data di riferimento"
              value={formatDate(contract.awardDate)}
            />
            <MetaRow
              icon={Layers}
              label="Ambito di spesa"
              value={macrotemaLabel}
            />
            <MetaRow
              icon={MapPin}
              label="Localizzazione"
              value={locationLabel}
            />
          </dl>
        </div>
      </section>

      <MonitoringReportsSection
        subjectType="contract"
        contractId={contract.id}
      />

      {/* Indicators */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Indicatori di avanzamento
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <IndicatorCard
            icon={Clock}
            label="Giorni alla 1ª liquidazione"
            value={
              indicators.daysToFirstLiquidazione != null
                ? `${indicators.daysToFirstLiquidazione} gg`
                : "—"
            }
            sub="dal primo atto collegato"
          />
          <IndicatorCard
            icon={Banknote}
            label="Importo liquidato"
            value={
              indicators.liquidatedAmount != null
                ? formatEuro(indicators.liquidatedAmount, true)
                : "—"
            }
            sub={indicators.liquidatedAmountIsEstimate ? "stima" : undefined}
          />
          <IndicatorCard
            icon={TrendingUp}
            label="Aumento di costo"
            value={
              indicators.extraAmount != null
                ? `+${formatEuro(indicators.extraAmount, true)}`
                : "Nessuno"
            }
            sub={
              indicators.costOverrunPct != null
                ? `+${indicators.costOverrunPct.toFixed(1)}% · stima`
                : undefined
            }
            highlight={
              indicators.extraAmount != null && indicators.extraAmount > 0
            }
          />
        </div>

        {indicators.liquidatedAmount != null && contract.amount > 0 ? (
          <FundProgress
            awarded={contract.amount}
            liquidated={indicators.liquidatedAmount}
          />
        ) : null}

        {indicators.extraAmountIsEstimate ||
        indicators.liquidatedAmountIsEstimate ? (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Gli importi contrassegnati come "stima" sono dedotti in modo
            automatico dal testo degli atti dell'Albo Pretorio e possono
            differire dai valori ufficiali.
          </p>
        ) : null}
      </section>

      {/* Documenti dell'Albo collegati */}
      {contract.cig ? <AlboDocumentsSection cig={contract.cig} /> : null}
    </div>
  );
}

export function ContractTimeline({
  title,
  timeline,
  indicators,
}: {
  title: string;
  timeline: StorylineEvent[];
  indicators: StorylineIndicators;
}) {
  const orderedTimeline = orderTimelineEvents(timeline);
  const summary = buildTimelineSummary(orderedTimeline, indicators);

  return (
    <section
      id="timeline-contratto"
      aria-labelledby="contract-timeline-title"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-brand/30 bg-card shadow-md"
      data-tour="contract-timeline"
    >
      <div className="border-b border-brand/20 bg-gradient-to-br from-brand/15 via-brand/5 to-background p-5 sm:p-6 md:p-8">
        <span className="eyebrow text-brand">
          <History className="h-3.5 w-3.5" />
          Timeline documentale
        </span>
        <h2
          id="contract-timeline-title"
          className="mt-2 max-w-2xl font-display text-2xl font-bold tracking-tight md:text-3xl"
        >
          La storia documentale del contratto
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Gli atti dell'Albo Pretorio collegati tramite CIG o CUP, ordinati nel
          tempo. La timeline mostra ciò che è documentato nelle fonti
          disponibili: eventuali intervalli o fasi assenti non indicano che il
          relativo passaggio non sia avvenuto.
        </p>

        {summary.total > 0 ? (
          <dl className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <TimelineMetric
              label="Atti collegati"
              value={String(summary.total)}
            />
            {summary.total === 1 ? (
              <>
                <TimelineMetric
                  label="Data dell'atto"
                  value={formatDate(summary.firstDate)}
                />
                <TimelineMetric
                  label="Fasi con atti"
                  value={`${summary.representedPhases}/${LIFECYCLE_ORDER.length}`}
                />
                <TimelineMetric
                  label="Documenti reperibili"
                  value={`${summary.retrievable}/${summary.total}`}
                />
              </>
            ) : (
              <>
                <TimelineMetric
                  label="Primo atto"
                  value={formatDate(summary.firstDate)}
                />
                <TimelineMetric
                  label="Ultimo atto"
                  value={formatDate(summary.lastDate)}
                />
                <TimelineMetric
                  label="Arco documentale"
                  value={summary.spanLabel}
                />
              </>
            )}
          </dl>
        ) : null}
      </div>

      <div className="p-5 sm:p-6 md:p-8">
        {orderedTimeline.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Nessun atto collegato</EmptyTitle>
              <EmptyDescription>
                Non sono state trovate pubblicazioni dell'Albo Pretorio
                collegabili a questo fascicolo tramite CIG o CUP. Questo è un
                limite della documentazione disponibile, non una valutazione
                sullo svolgimento del contratto.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <PhaseStepper indicators={indicators} />
            <AttiLegend timeline={orderedTimeline} />
            <ol
              aria-label={`Cronologia documentale di ${title}`}
              className="mt-6"
              data-testid="contract-timeline-events"
            >
              {orderedTimeline.map((event, index) => (
                <TimelineItem
                  key={event.publicationId}
                  event={event}
                  index={index}
                  total={orderedTimeline.length}
                />
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}

function TimelineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand/20 bg-background/85 px-3 py-3 shadow-sm sm:px-4">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-sm font-bold leading-snug text-foreground sm:text-base">
        {value}
      </dd>
    </div>
  );
}

function orderTimelineEvents(timeline: readonly StorylineEvent[]) {
  return timeline
    .map((event, sourceIndex) => ({ event, sourceIndex }))
    .sort((left, right) => {
      const leftTime = dateTimestamp(left.event.date);
      const rightTime = dateTimestamp(right.event.date);

      if (leftTime == null && rightTime == null) {
        return left.sourceIndex - right.sourceIndex;
      }
      if (leftTime == null) return 1;
      if (rightTime == null) return -1;

      return leftTime - rightTime || left.sourceIndex - right.sourceIndex;
    })
    .map(({ event }) => event);
}

function buildTimelineSummary(
  timeline: readonly StorylineEvent[],
  indicators: StorylineIndicators,
) {
  const datedEvents = timeline.filter(
    (event) => dateTimestamp(event.date) != null,
  );
  const firstDate = isValidDate(indicators.firstEvidenceDate)
    ? indicators.firstEvidenceDate
    : (datedEvents[0]?.date ?? null);
  const lastDate = isValidDate(indicators.lastEvidenceDate)
    ? indicators.lastEvidenceDate
    : (datedEvents[datedEvents.length - 1]?.date ?? null);
  const firstTime = dateTimestamp(firstDate);
  const lastTime = dateTimestamp(lastDate);

  let spanLabel = "Non calcolabile";
  if (firstTime != null && lastTime != null) {
    const days = Math.max(
      0,
      Math.round((lastTime - firstTime) / (24 * 60 * 60 * 1000)),
    );
    spanLabel =
      days === 0
        ? "Stesso giorno"
        : `${days} ${days === 1 ? "giorno" : "giorni"}`;
  }

  return {
    total: timeline.length,
    retrievable: timeline.filter((event) => event.attachments.length > 0)
      .length,
    representedPhases: new Set(
      timeline
        .map((event) => event.phase)
        .filter((phase) => LIFECYCLE_ORDER.includes(phase)),
    ).size,
    firstDate,
    lastDate,
    spanLabel,
  };
}

function dateTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function isValidDate(value: string | null | undefined) {
  return dateTimestamp(value) != null;
}

// Elenco compatto delle pubblicazioni dell'Albo Pretorio che citano il CIG,
// con collegamento diretto alla scheda di dettaglio di ciascun atto.
function AlboDocumentsSection({ cig }: { cig: string }) {
  const { data, isLoading, isError } = useListPublications({ q: cig });
  const publications = data ?? [];

  return (
    <section>
      <h2 className="mb-1 font-display text-xl font-bold tracking-tight">
        Documenti dell'Albo
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Gli atti dell'Albo Pretorio che citano il CIG di questo fascicolo. Apri
        ciascuna scheda per leggere il testo completo e gli allegati.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-card-border bg-card p-4 shadow-sm"
              >
                <Skeleton className="mb-3 h-4 w-32" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
        </div>
      ) : isError ? (
        <Empty className="rounded-2xl border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Ricerca Albo aggiuntiva non disponibile</EmptyTitle>
            <EmptyDescription>
              Il documento ufficiale già associato al fascicolo resta
              consultabile nella cronistoria qui sopra.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : publications.length === 0 ? (
        <Empty className="rounded-2xl border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nessun documento collegato</EmptyTitle>
            <EmptyDescription>
              Non abbiamo trovato atti dell'Albo Pretorio che citano questo CIG.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {publications.map((p) => (
            <AlboDocumentItem key={p.id} publication={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AlboDocumentItem({ publication: p }: { publication: Publication }) {
  const attachmentsCount = p.attachments?.length ?? 0;
  return (
    <li>
      <Link href={`/albo/${p.publicId}`} className="block">
        <div className="group rounded-xl border border-card-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[10px] shadow-none">
                {p.tipologia}
              </Badge>
              {p.numRegGen ? (
                <span className="font-mono text-xs text-muted-foreground">
                  Reg. gen. {p.numRegGen}
                </span>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(p.pubStart)}
            </span>
          </div>
          <h3 className="mt-2 font-display font-semibold leading-snug text-foreground transition-colors group-hover:text-brand">
            {p.oggetto}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-2">
            {attachmentsCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs text-brand">
                <Paperclip className="h-3.5 w-3.5" />
                {attachmentsCount}{" "}
                {attachmentsCount === 1 ? "documento" : "documenti"}
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors group-hover:text-brand">
              Vedi dettaglio
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

// Stepper orizzontale che evidenzia le fasi del ciclo di vita raggiunte.
function PhaseStepper({ indicators }: { indicators: StorylineIndicators }) {
  return (
    <div className="mb-4 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Fasi presenti nella cronistoria
      </div>
      <ol
        aria-label="Fasi rappresentate dagli atti collegati"
        className="grid grid-cols-5 gap-1.5"
      >
        {LIFECYCLE_ORDER.map((phase) => {
          const meta = PHASE_META[phase];
          const Icon = meta.icon;
          const count = indicators.phaseCounts?.[phase] ?? 0;
          const reached = count > 0;
          return (
            <li
              key={phase}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  reached
                    ? "border-brand/30 bg-brand/10 text-brand"
                    : "border-border bg-background text-muted-foreground/50"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-[11px] leading-tight ${
                  reached
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {meta.label}
              </span>
              {reached ? (
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {count} {count === 1 ? "atto" : "atti"}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground/60">—</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Riepilogo "atti noti vs reperibili" sopra la timeline.
function AttiLegend({ timeline }: { timeline: StorylineEvent[] }) {
  const total = timeline.length;
  const reperibili = timeline.filter((e) => e.attachments.length > 0).length;
  const noti = total - reperibili;
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-card-border bg-muted/30 px-4 py-3 text-xs">
      <span className="font-medium text-foreground">
        {total} {total === 1 ? "atto collegato" : "atti collegati"}
      </span>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <FileCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        {reperibili} {reperibili === 1 ? "reperibile" : "reperibili"} (con
        documento)
      </span>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <FileSearch className="h-3.5 w-3.5" />
        {noti} {noti === 1 ? "noto" : "noti"} (solo riferimento)
      </span>
    </div>
  );
}

function TimelineItem({
  event,
  index,
  total,
}: {
  event: StorylineEvent;
  index: number;
  total: number;
}) {
  const meta = PHASE_META[event.phase] ?? PHASE_META.altro;
  const Icon = meta.icon;
  const reperibile = event.attachments.length > 0;
  const isLast = index === total - 1;
  return (
    <li
      className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0 sm:grid-cols-[8rem_3rem_minmax(0,1fr)] sm:gap-4"
      data-testid="timeline-event"
    >
      <time
        dateTime={event.date ?? undefined}
        className="hidden pt-2 text-right sm:block"
      >
        <span className="block font-display text-sm font-bold leading-snug text-foreground">
          {formatDate(event.date)}
        </span>
        <span className="mt-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Atto {index + 1} di {total}
        </span>
      </time>

      <div className="relative flex justify-center">
        {!isLast ? (
          <span
            aria-hidden="true"
            className="absolute bottom-[-1.25rem] top-12 w-px bg-brand/25"
          />
        ) : null}
        <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <article className="min-w-0 rounded-xl border border-card-border bg-background p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3 sm:hidden">
          <time
            dateTime={event.date ?? undefined}
            className="font-display text-sm font-bold text-foreground"
          >
            {formatDate(event.date)}
          </time>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Atto {index + 1} di {total}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] shadow-none">
            {meta.label}
          </Badge>
          {reperibile ? (
            <Badge className="border-transparent bg-emerald-100 text-emerald-800 text-[10px] shadow-none dark:bg-emerald-500/20 dark:text-emerald-300">
              <FileCheck className="mr-1 h-3 w-3" />
              Atto reperibile
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] font-normal shadow-none text-muted-foreground"
            >
              <FileSearch className="mr-1 h-3 w-3" />
              Atto noto
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[10px] font-normal shadow-none text-muted-foreground"
          >
            via {event.matchedBy.toUpperCase()}
          </Badge>
        </div>
        <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
          {event.tipologia}
        </div>
        <h3 className="mt-1 font-display text-base font-semibold leading-snug text-foreground">
          {event.oggetto}
        </h3>
        {event.estimatedAmount != null ? (
          <div className="mt-2 text-sm font-medium text-foreground">
            Importo citato: {formatEuro(event.estimatedAmount)}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (stima)
            </span>
          </div>
        ) : null}
        {reperibile ? (
          <AlboLink attachments={event.attachments} className="mt-3" />
        ) : (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            Documento non ancora reperibile online: atto noto dal riferimento
            nell'Albo Pretorio.
          </p>
        )}
      </article>
    </li>
  );
}

// Barra di avanzamento dell'importo liquidato rispetto all'aggiudicato.
function FundProgress({
  awarded,
  liquidated,
}: {
  awarded: number;
  liquidated: number;
}) {
  const pct = Math.min(100, Math.round((liquidated / awarded) * 100));
  return (
    <div className="mt-4 rounded-xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="eyebrow text-muted-foreground">
          Avanzamento dei pagamenti
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {pct}%
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Liquidato (stima):{" "}
          <span className="font-medium text-foreground">
            {formatEuro(liquidated)}
          </span>
        </span>
        <span>
          Aggiudicato:{" "}
          <span className="font-medium text-foreground">
            {formatEuro(awarded)}
          </span>
        </span>
      </div>
    </div>
  );
}

function IndicatorCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 shadow-sm ${
        highlight ? "border-amber-400/50" : "border-card-border"
      }`}
    >
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
          highlight
            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-xl md:text-2xl font-display font-bold tracking-tight tabular-nums text-foreground">
        {value}
      </div>
      <div className="mt-1 eyebrow text-muted-foreground">{label}</div>
      {sub ? (
        <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
