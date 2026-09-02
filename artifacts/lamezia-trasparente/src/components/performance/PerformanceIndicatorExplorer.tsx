import { useId, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  type PerformanceIndicator,
  type PerformanceCategoryWithIndicators,
} from "@workspace/api-client-react";
import {
  Building2,
  ChevronRight,
  Filter,
  Gauge,
  Layers,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatIndicatorValue,
  trendFromPair,
  type TrendTone,
} from "@/lib/performanceFormat";

export function PerformanceIndicatorExplorer({
  categories,
  isLoading,
}: {
  categories: PerformanceCategoryWithIndicators[] | undefined;
  isLoading: boolean;
}) {
  const [categoryId, setCategoryId] = useState<number | "all">("all");

  const visibleCategories = useMemo(() => {
    const withIndicators = (categories ?? []).filter(
      (category) => category.indicators.length > 0,
    );
    if (categoryId === "all") return withIndicators;
    return withIndicators.filter((category) => category.id === categoryId);
  }, [categories, categoryId]);

  return (
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
              .filter((category) => category.indicators.length > 0)
              .map((category) => (
                <CategoryChip
                  key={category.id}
                  label={category.name}
                  count={category.indicators.length}
                  active={categoryId === category.id}
                  onClick={() => setCategoryId(category.id)}
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
                      <Skeleton key={index} className="h-44 w-full rounded-xl" />
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
              Al momento non risultano indicatori pubblicati in questa sezione.
              L'assenza di dati non viene interpretata come zero.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
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

  const points = values.map((value, index) => {
    const x = pad + (index / (values.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (value - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`,
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

  const recentValues = (indicator.recentValues ?? []).map((value) => value.value);
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
              <span className="text-sm text-muted-foreground">{indicator.unit}</span>
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
