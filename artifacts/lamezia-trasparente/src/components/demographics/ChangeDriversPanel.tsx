import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownUp,
  Baby,
  CheckCircle2,
  CircleHelp,
  Globe2,
  Scale,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Granularity = "annual" | "monthly";
type SummaryWindow = "last5" | "last10" | "full";
type SourceStatus =
  | "final"
  | "provisional"
  | "estimated"
  | "reconstructed"
  | "forecast"
  | "unknown";

type ChangeDriverPoint = {
  period: string;
  births: number | null;
  deaths: number | null;
  naturalBalance: number | null;
  internalIn: number | null;
  internalOut: number | null;
  internalBalance: number | null;
  foreignIn: number | null;
  foreignOut: number | null;
  foreignBalance: number | null;
  otherIn: number | null;
  otherOut: number | null;
  otherBalance: number | null;
  statisticalAdjustment: number | null;
  coverageAdjustment: number | null;
  populationStart: number | null;
  populationEnd: number | null;
  observedChange: number | null;
  accountedChange: number | null;
  residual: number | null;
  reconciliation: "exact" | "partial" | "mismatch";
  sourceStatus: SourceStatus;
};

type Summary = {
  from: string | null;
  to: string | null;
  periods: number;
  observedChange: number | null;
  naturalBalance: number | null;
  internalBalance: number | null;
  foreignBalance: number | null;
  adjustment: number | null;
  dominantComponent: "natural" | "internal" | "foreign" | "adjustment" | null;
  exactPeriods: number;
  narrative: string | null;
};

type ChangeDriversResponse = {
  geography: { code: string; name: string; level: string };
  granularity: Granularity;
  source: { name: string; dataset: string; url: string };
  current: ChangeDriverPoint[];
  summaries: { last5: Summary; last10: Summary; full: Summary };
  methodology: {
    identities: {
      naturalBalance: string;
      internalBalance: string;
      foreignBalance: string;
      otherBalance: string;
    };
    annualReconciliation: string;
    monthlyReconciliation: string;
    temporalBreak: string;
    reconciliationStatus: string;
    narrative: string;
  };
};

async function fetchDrivers(granularity: Granularity): Promise<ChangeDriversResponse> {
  const response = await fetch(
    `/api/demographics/change-drivers?granularity=${granularity}`,
  );
  if (!response.ok) {
    throw new Error(`Demographic change-drivers API returned ${response.status}`);
  }
  return response.json() as Promise<ChangeDriversResponse>;
}

function formatSigned(value: number | null) {
  if (value === null) return "—";
  const formatted = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  }).format(value);
  return value > 0 ? `+${formatted}` : formatted;
}

function statusLabel(status: SourceStatus) {
  switch (status) {
    case "final":
      return "definitivo";
    case "provisional":
      return "provvisorio";
    case "estimated":
      return "stima";
    case "reconstructed":
      return "ricostruito";
    default:
      return "status non specificato";
  }
}

function windowLabel(window: SummaryWindow, summary: Summary) {
  if (window === "last5") return "ultimi 5 anni";
  if (window === "last10") return "ultimi 10 anni";
  if (summary.from && summary.to) return `${summary.from}–${summary.to}`;
  return "intero periodo disponibile";
}

function reconciliationMeta(status: ChangeDriverPoint["reconciliation"]) {
  if (status === "exact") {
    return { label: "Quadratura esatta", Icon: CheckCircle2, className: "text-success" };
  }
  if (status === "mismatch") {
    return { label: "Da verificare", Icon: TriangleAlert, className: "text-destructive" };
  }
  return { label: "Quadratura parziale", Icon: CircleHelp, className: "text-muted-foreground" };
}

export function ChangeDriversPanel() {
  const [granularity, setGranularity] = useState<Granularity>("annual");
  const [summaryWindow, setSummaryWindow] = useState<SummaryWindow>("last5");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["demographics", "change-drivers", granularity],
    queryFn: () => fetchDrivers(granularity),
    staleTime: 30 * 60 * 1000,
  });

  const visiblePoints = useMemo(() => {
    const points = data?.current ?? [];
    if (granularity === "monthly") return points.slice(-24);
    if (summaryWindow === "last5") return points.slice(-5);
    if (summaryWindow === "last10") return points.slice(-10);
    return points;
  }, [data, granularity, summaryWindow]);

  const chartData = useMemo(
    () =>
      visiblePoints.map((point) => ({
        ...point,
        adjustment:
          point.statisticalAdjustment ??
          (point.sourceStatus === "provisional" ? 0 : point.otherBalance),
      })),
    [visiblePoints],
  );

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </section>
    );
  }

  if (isError || !data || data.current.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Il bilancio demografico versionato non è ancora disponibile. Il
          pannello “Perché cambia Lamezia” comparirà dopo il primo ciclo di
          acquisizione delle poste ISTAT annuali e mensili.
        </CardContent>
      </Card>
    );
  }

  const latest = data.current[data.current.length - 1];
  const latestReconciliation = reconciliationMeta(latest.reconciliation);
  const ReconciliationIcon = latestReconciliation.Icon;
  const summary =
    granularity === "annual" ? data.summaries[summaryWindow] : data.summaries.full;
  const selectedWindowLabel =
    granularity === "annual"
      ? windowLabel(summaryWindow, summary)
      : "periodo mensile disponibile";

  return (
    <section id="perche-cambia" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Scale className="h-3.5 w-3.5" />
            Bilancio demografico
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-display font-bold tracking-tight">
            Perché cambia Lamezia
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            La variazione della popolazione viene scomposta nelle sue poste:
            saldo naturale, mobilità con gli altri comuni, mobilità con l'estero
            e, quando pertinente, aggiustamento statistico. Ogni barra conserva
            il segno: sopra lo zero compensa la perdita, sotto lo zero la amplia.
          </p>
        </div>
        <div className="flex gap-2" aria-label="Granularità del bilancio demografico">
          <Button
            type="button"
            size="sm"
            variant={granularity === "annual" ? "brand" : "outline"}
            onClick={() => setGranularity("annual")}
            aria-pressed={granularity === "annual"}
          >
            Annuale
          </Button>
          <Button
            type="button"
            size="sm"
            variant={granularity === "monthly" ? "brand" : "outline"}
            onClick={() => setGranularity("monthly")}
            aria-pressed={granularity === "monthly"}
          >
            Mensile
          </Button>
        </div>
      </div>

      {granularity === "annual" ? (
        <div className="flex flex-wrap items-center gap-2" aria-label="Finestra temporale del bilancio demografico">
          <span className="mr-1 text-sm text-muted-foreground">Periodo:</span>
          {(
            [
              ["last5", "5 anni"],
              ["last10", "10 anni"],
              ["full", "Tutto"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={summaryWindow === value ? "brand" : "outline"}
              onClick={() => setSummaryWindow(value)}
              aria-pressed={summaryWindow === value}
              className="h-8 rounded-full"
            >
              {label}
            </Button>
          ))}
          <span className="text-xs text-muted-foreground">
            {summary.from && summary.to
              ? `${summary.from}–${summary.to} · ${summary.periods} annualità`
              : "periodo non disponibile"}
          </span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DriverCard
          icon={Baby}
          label={`Saldo naturale · ${selectedWindowLabel}`}
          value={summary.naturalBalance}
          detail="nati − morti"
        />
        <DriverCard
          icon={ArrowDownUp}
          label={`Mobilità interna · ${selectedWindowLabel}`}
          value={summary.internalBalance}
          detail="da/verso altri comuni"
        />
        <DriverCard
          icon={Globe2}
          label={`Mobilità estera · ${selectedWindowLabel}`}
          value={summary.foreignBalance}
          detail="da/verso l'estero"
        />
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ultimo periodo
            </p>
            <p className="mt-1 text-xl font-display font-bold tabular-nums">
              {formatSigned(latest.observedChange)}
            </p>
            <div className={`mt-2 flex items-center gap-1.5 text-xs ${latestReconciliation.className}`}>
              <ReconciliationIcon className="h-3.5 w-3.5" />
              {latestReconciliation.label}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {latest.period} · {statusLabel(latest.sourceStatus)}
            </p>
          </CardContent>
        </Card>
      </div>

      {summary.narrative ? (
        <Card className="border-brand/30 bg-brand/5">
          <CardContent className="p-5 text-sm leading-relaxed text-foreground">
            {summary.narrative}
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="font-display">Componenti della variazione</CardTitle>
          <CardDescription>
            {granularity === "annual"
              ? `${selectedWindowLabel} · persone`
              : "Ultimi 24 mesi disponibili · persone"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={granularity === "annual" ? 20 : 28}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={58}
                />
                <ReferenceLine y={0} stroke="hsl(var(--foreground) / 0.35)" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${formatSigned(value)} persone`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                  }}
                />
                <Bar
                  dataKey="naturalBalance"
                  name="Saldo naturale"
                  stackId="drivers"
                  fill="hsl(var(--chart-1))"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="internalBalance"
                  name="Mobilità interna"
                  stackId="drivers"
                  fill="hsl(var(--chart-2))"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="foreignBalance"
                  name="Mobilità estera"
                  stackId="drivers"
                  fill="hsl(var(--chart-3))"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="adjustment"
                  name="Aggiustamento / altre poste"
                  stackId="drivers"
                  fill="hsl(var(--chart-4))"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-base font-display">Quadratura delle poste</CardTitle>
            <CardDescription>
              Variazione osservata e somma delle componenti disponibili.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[...visiblePoints].reverse().slice(0, 12).map((point) => {
                const meta = reconciliationMeta(point.reconciliation);
                const Icon = meta.Icon;
                return (
                  <div
                    key={point.period}
                    className="grid grid-cols-[82px_1fr_auto] items-center gap-3 px-5 py-3 text-sm"
                  >
                    <span className="font-mono text-muted-foreground">{point.period}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs ${meta.className}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                      {point.residual !== null && Math.abs(point.residual) > 0.5
                        ? ` · residuo ${formatSigned(point.residual)}`
                        : ""}
                    </span>
                    <span className="font-display font-bold tabular-nums">
                      {formatSigned(point.observedChange)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Come viene calcolato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Saldo naturale:</strong> {data.methodology.identities.naturalBalance}.</p>
            <p><strong className="text-foreground">Mobilità interna:</strong> {data.methodology.identities.internalBalance}.</p>
            <p><strong className="text-foreground">Mobilità estera:</strong> {data.methodology.identities.foreignBalance}.</p>
            <p>
              {granularity === "annual"
                ? data.methodology.annualReconciliation
                : data.methodology.monthlyReconciliation}
            </p>
            <p>{data.methodology.temporalBreak}</p>
            <Badge variant="outline" className="shadow-none">
              Fonte {data.source.name} · {data.source.dataset}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function DriverCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Baby;
  label: string;
  value: number | null;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4 text-brand" />
          <p className="text-[11px] font-medium uppercase tracking-wide">{label}</p>
        </div>
        <p className="mt-2 text-2xl font-display font-bold tabular-nums">
          {formatSigned(value)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
