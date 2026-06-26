import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import {
  useGetPerformanceIndicator,
  useListPerformanceCategories,
} from "@workspace/api-client-react";
import {
  Gauge,
  ChevronLeft,
  Building2,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  CalendarRange,
  AlertTriangle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  computeTrend,
  formatIndicatorValue,
  latestValue,
} from "@/lib/performanceFormat";

export function PerformanceDetail() {
  const [, params] = useRoute("/performance/:id");
  const id = params?.id ?? "";
  const {
    data: indicator,
    isLoading,
    isError,
  } = useGetPerformanceIndicator(id);
  const { data: categories } = useListPerformanceCategories();

  const categoryName = useMemo(() => {
    if (!indicator) return null;
    return (
      (categories ?? []).find((c) => c.id === indicator.categoryId)?.name ?? null
    );
  }, [categories, indicator]);

  const chartData = useMemo(
    () =>
      (indicator?.values ?? []).map((v) => ({
        period: v.period,
        value: v.value,
      })),
    [indicator],
  );

  const latest = latestValue(indicator?.values ?? []);
  const trend = computeTrend(
    indicator?.values ?? [],
    indicator?.polarity ?? "neutral",
  );

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;
  const trendColor =
    trend?.tone === "good"
      ? "text-success"
      : trend?.tone === "bad"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/performance"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Torna agli indicatori
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError || !indicator ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-2xl md:text-3xl font-display font-bold tracking-tight">
            Indicatore non trovato
          </h1>
          <p className="mb-6 text-muted-foreground">
            L'indicatore richiesto non esiste o è stato rimosso.
          </p>
          <Link href="/performance">
            <Button variant="brand">Torna agli indicatori</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="eyebrow text-primary">
                <Gauge className="h-3.5 w-3.5" />
                Performance del Comune
              </span>
              {categoryName ? (
                <Badge variant="brand" className="text-[11px] shadow-none">
                  <Layers className="mr-1 h-3 w-3" />
                  {categoryName}
                </Badge>
              ) : null}
              {indicator.updateMode === "automatic" ? (
                <Badge variant="outline" className="text-[11px] shadow-none">
                  Aggiornamento automatico
                </Badge>
              ) : null}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              {indicator.title}
            </h1>
            {indicator.description ? (
              <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                {indicator.description}
              </p>
            ) : null}
          </div>

          {/* KPI summary */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="relative overflow-hidden border-brand/40 bg-brand/5">
              <span className="absolute left-0 top-0 h-full w-1 bg-brand" />
              <CardContent className="p-6">
                <p className="eyebrow text-muted-foreground">Valore attuale</p>
                {latest ? (
                  <>
                    <p className="mt-1 text-3xl font-display font-bold tabular-nums text-brand">
                      {formatIndicatorValue(latest.value)}
                      <span className="ml-1.5 text-base font-sans font-normal text-muted-foreground">
                        {indicator.unit}
                      </span>
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Periodo {latest.period}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nessun dato disponibile
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="eyebrow text-muted-foreground">
                  Variazione recente
                </p>
                {trend ? (
                  <p
                    className={`mt-1 inline-flex items-center gap-1.5 text-2xl font-display font-bold tabular-nums ${trendColor}`}
                  >
                    <TrendIcon className="h-5 w-5" />
                    {trend.percent !== null
                      ? `${trend.percent > 0 ? "+" : ""}${formatIndicatorValue(
                          trend.percent,
                        )}%`
                      : `${trend.delta > 0 ? "+" : ""}${formatIndicatorValue(
                          trend.delta,
                        )}`}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Storico insufficiente
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  rispetto al periodo precedente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="eyebrow text-muted-foreground">Fonte</p>
                <p className="mt-1 font-medium text-foreground">
                  {indicator.source}
                </p>
                {indicator.sourceUrl ? (
                  <a
                    href={indicator.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Vai alla fonte
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    {indicator.unit}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Time series chart */}
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="flex items-center gap-2 font-display font-bold tracking-tight">
                <CalendarRange className="h-5 w-5 text-brand" />
                Serie storica
              </CardTitle>
              <CardDescription>
                Andamento di “{indicator.title}” nel tempo
                {indicator.unit ? ` (${indicator.unit})` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {chartData.length > 1 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="performanceSeries"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--chart-1))"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--chart-1))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="period"
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          fontSize: "0.8rem",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [
                          `${formatIndicatorValue(value)} ${indicator.unit}`.trim(),
                          indicator.title,
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        fill="url(#performanceSeries)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : chartData.length === 1 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  È disponibile un solo rilevamento ({chartData[0].period}):{" "}
                  <span className="font-medium text-foreground">
                    {formatIndicatorValue(chartData[0].value)} {indicator.unit}
                  </span>
                  . La serie storica apparirà quando ci saranno più periodi.
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nessun valore registrato per questo indicatore.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data table */}
          {indicator.values.length > 0 ? (
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/40">
                <CardTitle className="text-base font-display font-bold tracking-tight">
                  Tutti i rilevamenti
                </CardTitle>
                <CardDescription>
                  {indicator.values.length}{" "}
                  {indicator.values.length === 1 ? "periodo" : "periodi"}{" "}
                  registrati
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[...indicator.values].reverse().map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
                    >
                      <span className="font-mono text-muted-foreground">
                        {v.period}
                      </span>
                      {v.note ? (
                        <span className="hidden flex-1 truncate px-4 text-xs text-muted-foreground sm:block">
                          {v.note}
                        </span>
                      ) : null}
                      <span className="font-display font-bold tabular-nums text-foreground">
                        {formatIndicatorValue(v.value)}
                        <span className="ml-1 text-xs font-sans font-normal text-muted-foreground">
                          {indicator.unit}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
