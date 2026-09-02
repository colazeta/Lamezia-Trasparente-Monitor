import { useId, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  useListPerformanceCategories,
  useListPerformanceFeedStatus,
  type PerformanceIndicator,
  type PerformanceCategoryWithIndicators,
} from "@workspace/api-client-react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  Filter,
  Gauge,
  Layers,
  Minus,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  formatIndicatorValue,
  trendFromPair,
  type TrendTone,
} from "@/lib/performanceFormat";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy, HH:mm", { locale: it });
}

function coveragePercentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function Performance() {
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const { data: categories, isLoading } = useListPerformanceCategories();
  const { data: feedStatus } = useListPerformanceFeedStatus();

  const lastUpdatedAt = useMemo(() => {
    const times = (feedStatus ?? [])
      .map((f) => f.lastUpdatedAt)
      .filter((t): t is string => Boolean(t))
      .map((t) => new Date(t).getTime())
      .filter((t) => !Number.isNaN(t));
    if (!times.length) return null;
    return new Date(Math.max(...times)).toISOString();
  }, [feedStatus]);

  const visibleCategories = useMemo(() => {
    const withIndicators = (categories ?? []).filter(
      (c) => c.indicators.length > 0,
    );
    if (categoryId === "all") return withIndicators;
    return withIndicators.filter((c) => c.id === categoryId);
  }, [categories, categoryId]);

  const allIndicators = useMemo(
    () => (categories ?? []).flatMap((category) => category.indicators),
    [categories],
  );

  const coverage = useMemo(() => {
    const total = allIndicators.length;
    const withLatestValue = allIndicators.filter(
      (indicator) => indicator.latestValue !== null && indicator.latestValue !== undefined,
    ).length;
    const withPeriod = allIndicators.filter(
      (indicator) => Boolean(indicator.latestValue?.period),
    ).length;
    const withRecentSeries = allIndicators.filter(
      (indicator) => (indicator.recentValues ?? []).length >= 2,
    ).length;
    const withSource = allIndicators.filter(
      (indicator) =>
        typeof indicator.source === "string" && indicator.source.trim().length > 0,
    ).length;

    return {
      total,
      withLatestValue,
      withPeriod,
      withRecentSeries,
      withSource,
    };
  }, [allIndicators]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <span className="eyebrow text-primary">
          <Gauge className="h-3.5 w-3.5" />
          Performance amministrativa
        </span>
        <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight md:text-4xl">
              Dai dati pubblicati ai risultati verificabili
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
              Questa sezione non assegna un voto al Comune. Organizza gli
              indicatori disponibili e rende esplicito quanto è possibile
              verificare, distinguendo i dati di contesto dalla futura catena
              completa tra obiettivi, target, risultati ed evidenze.
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-muted/30 p-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 text-brand" />
              Ultimo aggiornamento
            </div>
            <div className="mt-1 font-medium text-foreground">
              {formatDateTime(lastUpdatedAt)}
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="performance-observable-heading" className="mb-10">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Cosa sappiamo oggi
            </p>
            <h2
              id="performance-observable-heading"
              className="mt-1 text-2xl font-display font-bold tracking-tight"
            >
              Copertura osservabile
            </h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            I conteggi sono calcolati sul corpus effettivamente restituito dalla
            sezione. Non rappresentano una valutazione della qualità
            amministrativa.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={Database}
              value={coverage.total}
              label="Indicatori censiti"
              note="Corpus disponibile"
            />
            <MetricCard
              icon={CheckCircle2}
              value={coverage.withLatestValue}
              label="Con valore pubblicato"
              note={`${coveragePercentage(coverage.withLatestValue, coverage.total)}% del corpus`}
            />
            <MetricCard
              icon={TrendingUp}
              value={coverage.withRecentSeries}
              label="Con serie recente"
              note={`${coveragePercentage(coverage.withRecentSeries, coverage.total)}% del corpus`}
            />
            <MetricCard
              icon={FileText}
              value={coverage.withSource}
              label="Con fonte dichiarata"
              note={`${coveragePercentage(coverage.withSource, coverage.total)}% del corpus`}
            />
          </div>
        )}
      </section>

      <section
        aria-labelledby="performance-chain-heading"
        className="mb-10 overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm"
      >
        <div className="border-b border-border p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand/10 p-2 text-brand">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                Dal piano al risultato
              </p>
              <h2
                id="performance-chain-heading"
                className="mt-1 text-2xl font-display font-bold tracking-tight"
              >
                La catena che vogliamo rendere verificabile
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Gli indicatori sono già osservabili. Per parlare propriamente di
                performance amministrativa servono anche obiettivo, target,
                risultato, prova documentale e validazione. I passaggi non ancora
                acquisiti sono mostrati come tali, senza completarli per inferenza.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-6">
          <EvidenceStep
            icon={Target}
            label="Obiettivo"
            detail="PIAO / DUP / PEG"
            state="to-acquire"
          />
          <EvidenceStep
            icon={Gauge}
            label="Indicatore"
            detail={`${coverage.total} censiti`}
            state={coverage.total > 0 ? "available" : "to-acquire"}
          />
          <EvidenceStep
            icon={Target}
            label="Target"
            detail="Da acquisire"
            state="to-acquire"
          />
          <EvidenceStep
            icon={CheckCircle2}
            label="Risultato"
            detail="Da collegare all'obiettivo"
            state="to-acquire"
          />
          <EvidenceStep
            icon={FileText}
            label="Evidenza"
            detail={`${coverage.withSource} indicatori con fonte`}
            state={coverage.withSource > 0 ? "partial" : "to-acquire"}
          />
          <EvidenceStep
            icon={ShieldCheck}
            label="Validazione OIV"
            detail="Da acquisire"
            state="to-acquire"
          />
        </div>

        <div className="grid gap-4 bg-muted/20 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div>
            <p className="font-display font-bold">Regola di lettura</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Un indicatore territoriale o di contesto può essere informativo,
              ma non dimostra da solo il raggiungimento di un obiettivo del
              Comune. Il giudizio ufficiale e la verificabilità documentale
              resteranno due piani distinti.
            </p>
          </div>
          <Link
            href="/metodologia"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Leggi la metodologia
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="measurement-coverage-heading" className="mb-10">
        <div className="grid gap-6 rounded-2xl border border-card-border bg-muted/20 p-5 md:grid-cols-[0.8fr_1.2fr] md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Qualità della misurazione
            </p>
            <h2
              id="measurement-coverage-heading"
              className="mt-1 text-2xl font-display font-bold tracking-tight"
            >
              Quanto è leggibile il corpus?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Misuriamo la copertura dei campi disponibili, non la performance
              del Comune. Una barra bassa indica un'informazione mancante nel
              corpus, non un risultato amministrativo negativo.
            </p>
          </div>
          <div className="space-y-4">
            <CoverageBar
              label="Valore più recente"
              value={coverage.withLatestValue}
              total={coverage.total}
            />
            <CoverageBar
              label="Periodo di riferimento"
              value={coverage.withPeriod}
              total={coverage.total}
            />
            <CoverageBar
              label="Serie recente"
              value={coverage.withRecentSeries}
              total={coverage.total}
            />
            <CoverageBar
              label="Fonte dichiarata"
              value={coverage.withSource}
              total={coverage.total}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="indicator-explorer-heading">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Esplora
            </p>
            <h2
              id="indicator-explorer-heading"
              className="mt-1 text-2xl font-display font-bold tracking-tight"
            >
              Indicatori disponibili
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Apri una scheda per leggere serie storica, fonte e metodologia
              disponibili per il singolo indicatore.
            </p>
          </div>

          {isLoading ? (
            <Skeleton className="h-9 w-72 rounded-full" />
          ) : categories && categories.length > 0 ? (
            <div
              data-tour="performance-categories"
              className="flex flex-wrap items-center gap-2"
            >
              <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Categoria:
              </span>
              <CategoryChip
                label="Tutte"
                active={categoryId === "all"}
                onClick={() => setCategoryId("all")}
              />
              {categories
                .filter((c) => c.indicators.length > 0)
                .map((c) => (
                  <CategoryChip
                    key={c.id}
                    label={c.name}
                    count={c.indicators.length}
                    active={categoryId === c.id}
                    onClick={() => setCategoryId(c.id)}
                  />
                ))}
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-10">
            {Array(2)
              .fill(0)
              .map((_, sectionIndex) => (
                <div key={sectionIndex}>
                  <Skeleton className="mb-4 h-6 w-48" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-44 w-full rounded-xl"
                        />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        ) : visibleCategories.length > 0 ? (
          <div data-tour="performance-indicator" className="space-y-12">
            {visibleCategories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <Empty className="border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
                <Gauge className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle className="font-display">
                Nessun indicatore disponibile
              </EmptyTitle>
              <EmptyDescription>
                Al momento non risultano indicatori pubblicati in questa
                sezione. L'assenza di dati non viene interpretata come zero.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  note,
}: {
  icon: typeof Gauge;
  value: number;
  label: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-3xl font-display font-bold tabular-nums">
            {value}
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">{label}</div>
        </div>
        <div className="rounded-lg bg-brand/10 p-2 text-brand">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{note}</div>
    </div>
  );
}

type EvidenceState = "available" | "partial" | "to-acquire";

function EvidenceStep({
  icon: Icon,
  label,
  detail,
  state,
}: {
  icon: typeof Gauge;
  label: string;
  detail: string;
  state: EvidenceState;
}) {
  const stateLabel =
    state === "available"
      ? "Disponibile"
      : state === "partial"
        ? "Parziale"
        : "Da acquisire";

  return (
    <div className="bg-card p-4 md:min-h-36">
      <div className="flex items-center justify-between gap-2">
        <Icon
          className={
            state === "available"
              ? "h-4 w-4 text-success"
              : state === "partial"
                ? "h-4 w-4 text-brand"
                : "h-4 w-4 text-muted-foreground"
          }
        />
        <span
          className={
            state === "available"
              ? "text-[10px] font-semibold uppercase tracking-wide text-success"
              : state === "partial"
                ? "text-[10px] font-semibold uppercase tracking-wide text-brand"
                : "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          }
        >
          {stateLabel}
        </span>
      </div>
      <div className="mt-5 font-display font-bold">{label}</div>
      <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {detail}
      </div>
    </div>
  );
}

function CoverageBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = coveragePercentage(value, total);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value}/{total || 0} · {percentage}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "brand" : "outline"}
      onClick={onClick}
      aria-pressed={active}
      className="h-9 rounded-full"
    >
      {label}
      {count !== undefined ? (
        <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
      ) : null}
    </Button>
  );
}

function CategorySection({
  category,
}: {
  category: PerformanceCategoryWithIndicators;
}) {
  return (
    <section>
      <div className="mb-4 border-l-2 border-brand pl-3">
        <h3 className="flex items-center gap-2 text-xl font-display font-bold tracking-tight">
          <Layers className="h-5 w-5 text-brand" />
          {category.name}
        </h3>
        {category.description ? (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.indicators.map((indicator) => (
          <IndicatorCard key={indicator.id} indicator={indicator} />
        ))}
      </div>
    </section>
  );
}

/**
 * Sparkline compatto disegnato in SVG dalla breve finestra recente di valori
 * (più vecchio → più recente) allegata inline dall'endpoint categorie. Non
 * richiede librerie di charting né una richiesta di dettaglio per card.
 */
function Sparkline({
  values,
  tone,
  className,
}: {
  values: number[];
  tone: TrendTone;
  className?: string;
}) {
  if (values.length < 2) return null;

  const width = 96;
  const height = 32;
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(
      ([x, y], i) =>
        `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(
    2,
  )},${height - pad} L${points[0][0].toFixed(2)},${height - pad} Z`;

  const stroke =
    tone === "good"
      ? "hsl(var(--success))"
      : tone === "bad"
        ? "hsl(var(--destructive))"
        : "hsl(var(--muted-foreground))";
  const last = points[points.length - 1];
  const gradientId = useId();

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Andamento recente dell'indicatore"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2} fill={stroke} />
    </svg>
  );
}

function IndicatorCard({ indicator }: { indicator: PerformanceIndicator }) {
  const latest = indicator.latestValue ?? null;
  const trend = latest
    ? trendFromPair(
        latest.value,
        indicator.previousValue?.value,
        indicator.polarity,
      )
    : null;

  const recentValues = (indicator.recentValues ?? []).map((v) => v.value);

  const trendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;
  const TrendIcon = trendIcon;
  const trendColor =
    trend?.tone === "good"
      ? "text-success"
      : trend?.tone === "bad"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Link
      href={`/performance/${indicator.id}`}
      className="group flex flex-col rounded-xl border border-card-border bg-card p-5 shadow-sm transition-colors hover-elevate hover:border-brand/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="line-clamp-2 font-display font-bold leading-snug text-foreground">
          {indicator.title}
        </h4>
        {indicator.updateMode === "automatic" ? (
          <Badge variant="outline" className="shrink-0 text-[10px] shadow-none">
            Auto
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          {latest ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-display font-bold tabular-nums text-foreground">
                {formatIndicatorValue(latest.value)}
              </span>
              <span className="text-sm text-muted-foreground">
                {indicator.unit}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Nessun dato disponibile
            </span>
          )}
          {latest ? (
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{latest.period}</span>
              {trend ? (
                <span className={`inline-flex items-center gap-0.5 ${trendColor}`}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {trend.percent !== null
                    ? `${trend.percent > 0 ? "+" : ""}${formatIndicatorValue(
                        trend.percent,
                      )}%`
                    : `${trend.delta > 0 ? "+" : ""}${formatIndicatorValue(
                        trend.delta,
                      )}`}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        {recentValues.length >= 2 ? (
          <Sparkline
            values={recentValues}
            tone={trend?.tone ?? "neutral"}
            className="h-8 w-24 shrink-0 self-center"
          />
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{indicator.source}</span>
        </span>
        <span className="inline-flex items-center gap-0.5 font-medium text-primary group-hover:underline">
          Dettaglio
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
