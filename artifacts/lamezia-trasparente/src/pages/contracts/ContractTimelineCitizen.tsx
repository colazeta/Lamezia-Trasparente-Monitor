import { type ComponentType } from "react";
import type {
  Contract,
  LifecyclePhase,
  StorylineEvent,
  StorylineIndicators,
} from "@workspace/api-client-react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Circle,
  Clock,
  FileCheck,
  FileSearch,
  FileSignature,
  Gavel,
  GitBranch,
  History,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { AlboLink } from "@/components/AlboLink";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
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
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : format(date, "dd MMMM yyyy", { locale: it });
}

const PHASE_META: Record<
  LifecyclePhase,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  affidamento: { label: "Affidamento", icon: Gavel },
  contratto: { label: "Contratto", icon: FileSignature },
  variante: { label: "Variante", icon: GitBranch },
  liquidazione: { label: "Liquidazione", icon: Banknote },
  collaudo: { label: "Collaudo / chiusura", icon: CheckCircle2 },
  altro: { label: "Altro atto", icon: Circle },
};

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
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-sm"
      data-tour="contract-timeline"
    >
      <div className="border-b border-primary/15 bg-primary/5 p-5 sm:p-6 md:p-8">
        <span className="eyebrow text-primary"><History className="h-3.5 w-3.5" />Cronologia</span>
        <h2 id="contract-timeline-title" className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
          La storia del contratto, atto per atto
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Gli atti collegati sono ordinati nel tempo per mostrare come il
          contratto evolve. Se una fase non compare, significa soltanto che non
          è documentata nel materiale collegato disponibile.
        </p>
        {summary.total > 0 ? (
          <dl className="mt-5 grid gap-2.5 sm:grid-cols-3">
            <TimelineMetric label="Atti collegati" value={String(summary.total)} />
            <TimelineMetric label="Primo atto" value={formatDate(summary.firstDate)} />
            <TimelineMetric label="Ultimo atto" value={formatDate(summary.lastDate)} />
          </dl>
        ) : null}
      </div>

      <div className="p-5 sm:p-6 md:p-8">
        {orderedTimeline.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon"><History className="h-6 w-6" /></EmptyMedia>
              <EmptyTitle>Nessun atto collegato</EmptyTitle>
              <EmptyDescription>
                Non risultano ancora atti collegabili a questo contratto nel
                perimetro disponibile. Questo limite documentale non è una
                valutazione sullo svolgimento del contratto.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol aria-label={`Cronologia di ${title}`} data-testid="contract-timeline-events">
            {orderedTimeline.map((event, index) => (
              <TimelineItem key={event.publicationId} event={event} index={index} total={orderedTimeline.length} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function TimelineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-background/85 px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display font-bold text-foreground">{value}</dd>
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
  const retrievable = event.attachments.length > 0;
  const isLast = index === total - 1;

  return (
    <li className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0 sm:grid-cols-[8rem_3rem_minmax(0,1fr)] sm:gap-4" data-testid="timeline-event">
      <time dateTime={event.date ?? undefined} className="hidden pt-2 text-right sm:block">
        <span className="block font-display text-sm font-bold leading-snug text-foreground">{formatDate(event.date)}</span>
        <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted-foreground">{index + 1} di {total}</span>
      </time>

      <div className="relative flex justify-center">
        {!isLast ? <span aria-hidden="true" className="absolute bottom-[-1.25rem] top-12 w-px bg-primary/20" /> : null}
        <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <article className="min-w-0 rounded-2xl border border-card-border bg-background p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3 sm:hidden">
          <time dateTime={event.date ?? undefined} className="font-display text-sm font-bold">{formatDate(event.date)}</time>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{index + 1} di {total}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] shadow-none">{meta.label}</Badge>
          <Badge
            variant="outline"
            className={retrievable
              ? "border-emerald-300/70 bg-emerald-50 text-[10px] text-emerald-800 shadow-none dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "text-[10px] font-normal text-muted-foreground shadow-none"}
          >
            {retrievable ? <FileCheck className="mr-1 h-3 w-3" /> : <FileSearch className="mr-1 h-3 w-3" />}
            {retrievable ? "Documento disponibile" : "Solo riferimento"}
          </Badge>
        </div>
        <div className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{event.tipologia}</div>
        <h3 className="mt-1 font-display text-base font-semibold leading-snug text-foreground">{event.oggetto}</h3>
        {event.estimatedAmount != null ? (
          <div className="mt-2 text-sm font-medium text-foreground">
            Importo citato: {formatEuro(event.estimatedAmount)}{" "}
            <span className="text-xs font-normal text-muted-foreground">(stima automatica)</span>
          </div>
        ) : null}
        {retrievable ? (
          <AlboLink attachments={event.attachments} className="mt-3" />
        ) : (
          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Il riferimento è noto, ma il documento non è ancora reperibile online nel materiale collegato.
          </p>
        )}
      </article>
    </li>
  );
}

export function ProgressSection({
  contract,
  indicators,
}: {
  contract: Contract;
  indicators: StorylineIndicators;
}) {
  const hasAnyIndicator =
    indicators.daysToFirstLiquidazione != null ||
    indicators.liquidatedAmount != null ||
    indicators.extraAmount != null;
  if (!hasAnyIndicator) return null;

  return (
    <section aria-labelledby="contract-progress-title">
      <div className="mb-4">
        <span className="eyebrow text-primary">Avanzamento</span>
        <h2 id="contract-progress-title" className="mt-1 font-display text-2xl font-bold tracking-tight">Dove siamo</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <IndicatorCard
          icon={Clock}
          label="Alla prima liquidazione"
          value={indicators.daysToFirstLiquidazione != null ? `${indicators.daysToFirstLiquidazione} gg` : "—"}
        />
        <IndicatorCard
          icon={Banknote}
          label="Importo liquidato"
          value={indicators.liquidatedAmount != null ? formatEuro(indicators.liquidatedAmount, true) : "—"}
          sub={indicators.liquidatedAmountIsEstimate ? "stima automatica" : undefined}
        />
        <IndicatorCard
          icon={TrendingUp}
          label="Aumento di costo rilevato"
          value={indicators.extraAmount != null ? formatEuro(indicators.extraAmount, true) : "—"}
          sub={indicators.costOverrunPct != null ? `${indicators.costOverrunPct >= 0 ? "+" : ""}${indicators.costOverrunPct.toFixed(1)}%${indicators.extraAmountIsEstimate ? " · stima" : ""}` : undefined}
          highlight={indicators.extraAmount != null && indicators.extraAmount > 0}
        />
      </div>

      {indicators.liquidatedAmount != null && contract.amount > 0 ? (
        <FundProgress awarded={contract.amount} liquidated={indicators.liquidatedAmount} isEstimate={Boolean(indicators.liquidatedAmountIsEstimate)} />
      ) : null}

      {indicators.extraAmountIsEstimate || indicators.liquidatedAmountIsEstimate ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          I valori indicati come stima sono ricavati automaticamente dal testo degli atti e possono differire dai valori ufficiali.
        </p>
      ) : null}
    </section>
  );
}

function FundProgress({
  awarded,
  liquidated,
  isEstimate,
}: {
  awarded: number;
  liquidated: number;
  isEstimate: boolean;
}) {
  const displayPct = Math.round((liquidated / awarded) * 100);
  const barPct = Math.max(0, Math.min(100, displayPct));
  return (
    <div className="mt-4 rounded-2xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">Pagamenti rispetto all’importo del contratto</span>
        <span className="font-display text-sm font-bold tabular-nums text-foreground">{displayPct}%</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${barPct}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <span>Liquidato{isEstimate ? " (stima)" : ""}: {formatEuro(liquidated)}</span>
        <span>Importo contratto: {formatEuro(awarded)}</span>
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
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-sm ${highlight ? "border-amber-400/50" : "border-card-border"}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${highlight ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 font-display text-xl font-bold tracking-tight tabular-nums text-foreground">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function orderTimelineEvents(timeline: readonly StorylineEvent[]) {
  return timeline
    .map((event, sourceIndex) => ({ event, sourceIndex }))
    .sort((left, right) => {
      const leftTime = dateTimestamp(left.event.date);
      const rightTime = dateTimestamp(right.event.date);
      if (leftTime == null && rightTime == null) return left.sourceIndex - right.sourceIndex;
      if (leftTime == null) return 1;
      if (rightTime == null) return -1;
      return leftTime - rightTime || left.sourceIndex - right.sourceIndex;
    })
    .map(({ event }) => event);
}

function buildTimelineSummary(timeline: readonly StorylineEvent[], indicators: StorylineIndicators) {
  const datedEvents = timeline.filter((event) => dateTimestamp(event.date) != null);
  const firstDate = isValidDate(indicators.firstEvidenceDate) ? indicators.firstEvidenceDate : (datedEvents[0]?.date ?? null);
  const lastDate = isValidDate(indicators.lastEvidenceDate) ? indicators.lastEvidenceDate : (datedEvents[datedEvents.length - 1]?.date ?? null);
  return { total: timeline.length, firstDate, lastDate };
}

function dateTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function isValidDate(value: string | null | undefined) {
  return dateTimestamp(value) != null;
}
