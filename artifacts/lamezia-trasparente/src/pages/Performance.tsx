import { useId, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  useListPerformanceCategories,
  useListPerformanceFeedStatus,
  type PerformanceIndicator,
  type PerformanceCategoryWithIndicators,
} from "@workspace/api-client-react";
import {
  Gauge,
  Filter,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Building2,
  Layers,
  GitCompare,
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

  const totalIndicators = useMemo(
    () =>
      (categories ?? []).reduce((sum, c) => sum + c.indicators.length, 0),
    [categories],
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Gauge className="h-3.5 w-3.5" />
            Le prestazioni del Comune
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
            Performance del Comune
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
            Gli indicatori che misurano l'andamento del{" "}
            <span className="font-medium text-foreground">
              Comune di Lamezia Terme
            </span>{" "}
            nel tempo — incluse le dimensioni dell'indice Qualità della Vita del
            Sole 24 Ore e altri parametri rilevanti. Esplora ogni indicatore e
            analizzane la serie storica.
          </p>
        </div>
        <Link href="/performance/confronta" className="shrink-0">
          <Button variant="outline" className="gap-2">
            <GitCompare className="h-4 w-4" />
            Confronta indicatori
          </Button>
        </Link>
      </div>

      {/* Last updated */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-card-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 text-brand" />
          <span>
            Ultimo aggiornamento:{" "}
            <span className="font-medium text-foreground">
              {formatDateTime(lastUpdatedAt)}
            </span>
            {totalIndicators ? (
              <> · {totalIndicators} indicatori monitorati</>
            ) : null}
          </span>
        </div>
      </div>

      {/* Category filter */}
      {isLoading ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full" />
            ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="mb-8 flex flex-wrap items-center gap-2">
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

      {/* Body */}
      {isLoading ? (
        <div className="space-y-10">
          {Array(2)
            .fill(0)
            .map((_, s) => (
              <div key={s}>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-44 w-full rounded-xl" />
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : visibleCategories.length > 0 ? (
        <div className="space-y-12">
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
              Al momento non risultano indicatori di performance pubblicati.
              Torna a trovarci: la sezione viene aggiornata regolarmente.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
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
        <h2 className="flex items-center gap-2 text-xl font-display font-bold tracking-tight">
          <Layers className="h-5 w-5 text-brand" />
          {category.name}
        </h2>
        {category.description ? (
          <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
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
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
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
        <h3 className="font-display font-bold leading-snug text-foreground line-clamp-2">
          {indicator.title}
        </h3>
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

      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
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
