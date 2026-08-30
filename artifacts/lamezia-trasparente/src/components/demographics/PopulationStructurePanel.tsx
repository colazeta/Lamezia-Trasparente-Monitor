import { useEffect, useMemo, useState } from "react";
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
  Baby,
  Gauge,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type SourceStatus =
  | "final"
  | "provisional"
  | "estimated"
  | "reconstructed"
  | "forecast"
  | "unknown";

type StructureResponse = {
  geography: { code: string; name: string; level: string };
  period: string;
  availablePeriods: string[];
  sourceStatus: SourceStatus;
  source: { name: string; dataset: string; url: string };
  counts: { total: number; male: number; female: number };
  bands: Array<{
    key: "0-14" | "15-64" | "65+" | "80+";
    count: number;
    share: number | null;
  }>;
  indicators: {
    ageingIndex: number | null;
    structuralDependency: number | null;
    elderlyDependency: number | null;
    youthDependency: number | null;
  };
  pyramid: Array<{
    ageGroup: string;
    from: number;
    to: number | null;
    male: number;
    female: number;
    total: number;
  }>;
  quality: {
    sexReconciliationDifference: number;
    ageReconciliationDifference: number;
    exactSexReconciliation: boolean;
    exactAgeReconciliation: boolean;
  };
  methodology: {
    referencePeriod: string;
    ageBands: string;
    ageingIndex: string;
    structuralDependency: string;
    elderlyDependency: string;
    youthDependency: string;
    pyramid: string;
    temporalBreak: string;
    quality: string;
  };
};

function formatPeople(value: number) {
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number | null) {
  return value === null
    ? "—"
    : `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatIndex(value: number | null) {
  return value === null
    ? "—"
    : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(value);
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
    case "forecast":
      return "previsione";
    default:
      return "status non specificato";
  }
}

export function PopulationStructurePanel() {
  const [selectedPeriod, setSelectedPeriod] = useState("latest");
  const [data, setData] = useState<StructureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const query = selectedPeriod === "latest"
          ? ""
          : `?period=${encodeURIComponent(selectedPeriod)}`;
        const response = await fetch(`/api/demographics/structure${query}`);
        if (!response.ok) throw new Error(`Demographic structure API returned ${response.status}`);
        const payload = (await response.json()) as StructureResponse;
        if (active) setData(payload);
      } catch {
        if (active) setIsError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [selectedPeriod]);

  const chartData = useMemo(
    () =>
      [...(data?.pyramid ?? [])]
        .reverse()
        .map((row) => ({
          ...row,
          maleMirror: -row.male,
        })),
    [data],
  );

  if (isLoading && !data) {
    return (
      <section className="space-y-4" aria-label="Caricamento struttura demografica">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          La struttura per età e sesso non è ancora disponibile nell'archivio
          demografico versionato. Il pannello comparirà dopo il primo ciclo di
          acquisizione ISTAT della nuova serie.
        </CardContent>
      </Card>
    );
  }

  const band = (key: StructureResponse["bands"][number]["key"]) =>
    data.bands.find((item) => item.key === key)!;

  return (
    <section id="chi-vive" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Users className="h-3.5 w-3.5" />
            Struttura demografica
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-display font-bold tracking-tight">
            Chi vive a Lamezia
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            La popolazione residente viene letta per singola età e sesso. Le
            classi sintetiche e gli indici sono calcolati direttamente sulle
            osservazioni ISTAT, senza stimare età mancanti o trasformare la
            classe aperta 100+ in un'età convenzionale.
          </p>
        </div>
        <label className="text-sm font-medium text-foreground">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
            Anno
          </span>
          <select
            aria-label="Anno della struttura demografica"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => setSelectedPeriod(event.target.value)}
            value={selectedPeriod}
          >
            <option value="latest">Ultimo disponibile · {data.availablePeriods.at(-1)}</option>
            {[...data.availablePeriods].reverse().map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="shadow-none">
          1° gennaio {data.period}
        </Badge>
        <Badge variant="outline" className="shadow-none">
          {statusLabel(data.sourceStatus)}
        </Badge>
        <span>
          {formatPeople(data.counts.total)} residenti · {data.source.name}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BandCard label="0–14 anni" count={band("0-14").count} share={band("0-14").share} />
        <BandCard label="15–64 anni" count={band("15-64").count} share={band("15-64").share} />
        <BandCard label="65 anni e più" count={band("65+").count} share={band("65+").share} />
        <BandCard label="80 anni e più" count={band("80+").count} share={band("80+").share} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="font-display">Piramide della popolazione</CardTitle>
          <CardDescription>
            Classi quinquennali · uomini a sinistra, donne a destra · 1° gennaio {data.period}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div
            className="h-[34rem] w-full"
            role="img"
            aria-label={`Piramide della popolazione di Lamezia Terme al 1° gennaio ${data.period}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value: number) => formatPeople(Math.abs(value))}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="ageGroup"
                  width={54}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine x={0} stroke="hsl(var(--foreground) / 0.35)" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${formatPeople(Math.abs(value))} persone`,
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
                  dataKey="maleMirror"
                  name="Uomini"
                  fill="hsl(var(--chart-1))"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="female"
                  name="Donne"
                  fill="hsl(var(--chart-2))"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndexCard
          label="Indice di vecchiaia"
          value={data.indicators.ageingIndex}
          detail="65+ ogni 100 residenti 0–14"
        />
        <IndexCard
          label="Dipendenza strutturale"
          value={data.indicators.structuralDependency}
          detail="0–14 e 65+ ogni 100 residenti 15–64"
        />
        <IndexCard
          label="Dipendenza anziani"
          value={data.indicators.elderlyDependency}
          detail="65+ ogni 100 residenti 15–64"
        />
        <IndexCard
          label="Dipendenza giovani"
          value={data.indicators.youthDependency}
          detail="0–14 ogni 100 residenti 15–64"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Controlli di quadratura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Maschi + femmine rispetto al totale: {data.quality.exactSexReconciliation ? "quadratura esatta" : `differenza ${formatPeople(data.quality.sexReconciliationDifference)}`}.
            </p>
            <p>
              Somma delle singole età rispetto al totale: {data.quality.exactAgeReconciliation ? "quadratura esatta" : `differenza ${formatPeople(data.quality.ageReconciliationDifference)}`}.
            </p>
            <p>{data.methodology.quality}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Baby className="h-4 w-4 text-primary" />
              Come leggere gli indici
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{data.methodology.ageBands}</p>
            <p>{data.methodology.pyramid}</p>
            <p className="flex items-start gap-2">
              <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{data.methodology.temporalBreak}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function BandCard({
  label,
  count,
  share,
}: {
  label: string;
  count: number;
  share: number | null;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-display font-bold tabular-nums">
          {formatPercent(share)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatPeople(count)} persone
        </p>
      </CardContent>
    </Card>
  );
}

function IndexCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | null;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-display font-bold tabular-nums">
          {formatIndex(value)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
