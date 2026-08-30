import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Archive,
  CalendarClock,
  Map,
  RefreshCw,
  ShieldCheck,
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

const SERIES_KEY = "population-resident-jan1";

type PopulationPoint = {
  id: number;
  period: string;
  value: number;
  unit: string;
  sourceStatus:
    | "final"
    | "provisional"
    | "estimated"
    | "reconstructed"
    | "forecast"
    | "unknown";
  sourceObservationStatus: string | null;
  qualityFlags: string[];
  releaseId: number;
  acquiredAt: string;
  releaseDate: string | null;
  revisionCount: number;
};

type PopulationHistoryResponse = {
  series: {
    seriesKey: string;
    title: string;
    description: string;
    unit: string;
    source: string;
    sourceDataset: string;
    sourceUrl: string | null;
  };
  geography: { code: string; name: string; level: string };
  current: PopulationPoint[];
  releases: Array<{
    id: number;
    sourceDataset: string;
    sourceHash: string;
    sourceVersion: string | null;
    releaseDate: string | null;
    acquiredAt: string;
    httpEtag: string | null;
    httpLastModified: string | null;
  }>;
  methodology: {
    versioning: string;
    referencePeriod: string;
    currentSelection: string;
    breaks: Array<{ period: string; type: string; note: string }>;
  };
};

async function fetchPopulationHistory(): Promise<PopulationHistoryResponse> {
  const response = await fetch(`/api/demographics/series/${SERIES_KEY}`);
  if (!response.ok) {
    throw new Error(`Demographic API returned ${response.status}`);
  }
  return response.json() as Promise<PopulationHistoryResponse>;
}

function formatPopulation(value: number) {
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(value);
}

function changeSince(points: PopulationPoint[], years: number) {
  if (points.length < 2) return null;
  const latest = points[points.length - 1];
  const latestYear = Number(latest.period.slice(0, 4));
  if (!Number.isFinite(latestYear)) return null;
  const target = latestYear - years;
  const baseline = [...points]
    .reverse()
    .find((point) => Number(point.period.slice(0, 4)) <= target);
  if (!baseline || baseline.value === 0) return null;
  return {
    absolute: latest.value - baseline.value,
    percent: ((latest.value - baseline.value) / baseline.value) * 100,
    baselinePeriod: baseline.period,
  };
}

function statusLabel(status: PopulationPoint["sourceStatus"]) {
  switch (status) {
    case "final":
      return "definitivo";
    case "provisional":
      return "provvisorio";
    case "estimated":
      return "stima";
    case "reconstructed":
      return "ricostruito";
    case "forecast":
      return "previsione";
    default:
      return "status non specificato";
  }
}

export function PopulationHistoryPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["demographics", SERIES_KEY],
    queryFn: fetchPopulationHistory,
    staleTime: 30 * 60 * 1000,
  });

  const points = data?.current ?? [];
  const latest = points.length ? points[points.length - 1] : null;
  const change5 = useMemo(() => changeSince(points, 5), [points]);
  const change10 = useMemo(() => changeSince(points, 10), [points]);
  const revisedPeriods = useMemo(
    () => points.filter((point) => point.revisionCount > 0),
    [points],
  );

  if (isLoading) {
    return (
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data || points.length === 0) {
    return (
      <Card className="mb-8 border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          L'archivio demografico versionato non contiene ancora una release. Il
          dato sintetico sopra resta disponibile; il pannello storico comparirà
          dopo il primo ciclo di acquisizione ISTAT con il nuovo modello.
        </CardContent>
      </Card>
    );
  }

  return (
    <section id="storico-versionato" className="mb-8 space-y-6">
      <div>
        <span className="eyebrow text-primary">
          <Archive className="h-3.5 w-3.5" />
          Archivio demografico
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-display font-bold tracking-tight">
          Lamezia nel tempo
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          La serie corrente e la storia delle pubblicazioni della fonte sono
          tenute separate. Se ISTAT rivede un'annualità, la nuova release non
          cancella quella acquisita in precedenza.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ultimo valore
            </p>
            <p className="mt-1 text-3xl font-display font-bold tabular-nums">
              {latest ? formatPopulation(latest.value) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {latest ? `1° gennaio ${latest.period}` : "Nessun dato"}
            </p>
          </CardContent>
        </Card>
        <ChangeCard label="Variazione 5 anni" change={change5} />
        <ChangeCard label="Variazione 10 anni" change={change10} />
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Release conservate
            </p>
            <p className="mt-1 text-3xl font-display font-bold tabular-nums">
              {data.releases.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {revisedPeriods.length > 0
                ? `${revisedPeriods.length} periodi con revisioni registrate`
                : "Nessuna revisione registrata finora"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="font-display">Popolazione residente</CardTitle>
          <CardDescription>
            Residenti al 1° gennaio · fonte {data.series.source} · dataset {data.series.sourceDataset}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  domain={["dataMin - 1000", "dataMax + 1000"]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={62}
                  tickFormatter={(value: number) => formatPopulation(value)}
                />
                <Tooltip
                  formatter={(value: number) => [formatPopulation(value), "Residenti"]}
                  labelFormatter={(label) => `1° gennaio ${label}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="hsl(var(--chart-1) / 0.14)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-base font-display">Ultimi rilevamenti</CardTitle>
            <CardDescription>
              Periodo di riferimento, status della fonte e revisioni conservate.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[...points].reverse().slice(0, 10).map((point) => (
                <div key={`${point.period}-${point.releaseId}`} className="grid grid-cols-[1fr_auto] gap-3 px-5 py-3 text-sm sm:grid-cols-[90px_1fr_auto]">
                  <span className="font-mono text-muted-foreground">{point.period}</span>
                  <div className="hidden items-center gap-2 sm:flex">
                    <Badge variant="outline" className="text-[10px] shadow-none">
                      {statusLabel(point.sourceStatus)}
                    </Badge>
                    {point.revisionCount > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {point.revisionCount} {point.revisionCount === 1 ? "revisione" : "revisioni"}
                      </span>
                    ) : null}
                  </div>
                  <span className="font-display font-bold tabular-nums">
                    {formatPopulation(point.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <ShieldCheck className="h-4 w-4 text-brand" />
                Come leggiamo il dato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{data.methodology.versioning}</p>
              <p>{data.methodology.referencePeriod}</p>
              {data.methodology.breaks.map((item) => (
                <p key={`${item.period}-${item.type}`}>
                  <strong className="text-foreground">Dal {item.period}:</strong>{" "}
                  {item.note}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Map className="mt-0.5 h-5 w-5 text-brand" />
                <div>
                  <h3 className="font-display font-bold">Dentro Lamezia</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    La serie comunale racconta il tempo. L'Atlante territoriale
                    mostra invece come la popolazione si distribuisce dentro la città.
                  </p>
                  <Link href="/atlante-territoriale">
                    <Button variant="outline" size="sm" className="mt-3">
                      Apri l'Atlante territoriale
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-5 text-sm">
              <CalendarClock className="mt-0.5 h-5 w-5 text-brand" />
              <div>
                <p className="font-medium text-foreground">Ultima acquisizione</p>
                <p className="mt-1 text-muted-foreground">
                  {data.releases[0]
                    ? new Intl.DateTimeFormat("it-IT", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(data.releases[0].acquiredAt))
                    : "—"}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Un controllo senza variazioni non crea una nuova release.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ChangeCard({
  label,
  change,
}: {
  label: string;
  change: ReturnType<typeof changeSince>;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {change ? (
          <>
            <p className="mt-1 text-2xl font-display font-bold tabular-nums">
              {change.percent > 0 ? "+" : ""}
              {change.percent.toLocaleString("it-IT", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {change.absolute > 0 ? "+" : ""}
              {formatPopulation(change.absolute)} residenti da {change.baselinePeriod}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Storico insufficiente</p>
        )}
      </CardContent>
    </Card>
  );
}
