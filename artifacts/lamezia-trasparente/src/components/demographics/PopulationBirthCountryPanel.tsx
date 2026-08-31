import { useEffect, useMemo, useState } from "react";
import { MapPinned, Info } from "lucide-react";
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

type BirthCountryResponse = {
  geography: { code: string; name: string; level: string };
  period: string;
  availablePeriods: string[];
  sourceStatus: SourceStatus;
  counts: {
    population: number;
    bornInItaly: number;
    bornAbroad: number;
    bornAbroadShare: number | null;
    male: number;
    female: number;
  };
  topBirthCountries: Array<{
    code: string;
    name: string;
    total: number;
    male: number;
    female: number;
    shareOfBornAbroad: number | null;
  }>;
  quality: {
    sourceCountryTotal: number;
    independentPopulation: number | null;
    coverageDifference: number | null;
  };
  history: Array<{
    period: string;
    population: number;
    bornInItaly: number;
    bornAbroad: number;
    bornAbroadShare: number | null;
    sourceStatus: SourceStatus;
    coverageDifference: number | null;
  }>;
  source: {
    name: string;
    dataset: string;
    url: string;
    bulkUrl: string;
  };
  methodology: {
    birthplace: string;
    referencePeriod: string;
    temporalBreak: string;
    countryDetail: string;
    coverage: string;
    citizenshipCross: string;
  };
};

function formatPeople(value: number | null) {
  return value === null
    ? "—"
    : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number | null) {
  return value === null
    ? "—"
    : `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(value)}%`;
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

export function PopulationBirthCountryPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState("latest");
  const [data, setData] = useState<BirthCountryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const query =
          selectedPeriod === "latest"
            ? ""
            : `?period=${encodeURIComponent(selectedPeriod)}`;
        const response = await fetch(`/api/demographics/birthplace${query}`);
        if (!response.ok) {
          throw new Error(`Birthplace API returned ${response.status}`);
        }
        const payload = (await response.json()) as BirthCountryResponse;
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

  const maxHistoryShare = useMemo(
    () =>
      Math.max(
        1,
        ...(data?.history.map((point) => point.bornAbroadShare ?? 0) ?? [1]),
      ),
    [data],
  );

  if (isLoading && !data) {
    return (
      <section className="space-y-4" aria-label="Caricamento dati sul paese di nascita">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          I dati sul paese di nascita non sono ancora disponibili nell'archivio
          demografico versionato. Il pannello comparirà dopo il primo ciclo di
          acquisizione della tavola ISTAT RCS dedicata.
        </CardContent>
      </Card>
    );
  }

  const firstHistory = data.history[0] ?? null;
  const selectedHistory =
    data.history.find((point) => point.period === data.period) ??
    data.history.at(-1) ??
    null;
  const shareDelta =
    firstHistory?.bornAbroadShare !== null &&
    firstHistory?.bornAbroadShare !== undefined &&
    selectedHistory?.bornAbroadShare !== null &&
    selectedHistory?.bornAbroadShare !== undefined
      ? selectedHistory.bornAbroadShare - firstHistory.bornAbroadShare
      : null;

  return (
    <section
      id="paese-nascita"
      className="space-y-6"
      aria-labelledby="birth-country-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <MapPinned className="h-3.5 w-3.5" />
            Paese di nascita
          </span>
          <h3
            className="mt-2 text-xl md:text-2xl font-display font-bold tracking-tight"
            id="birth-country-title"
          >
            Dove sono nati i residenti
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Quanti residenti sono nati in Italia o all'estero e quali paesi di
            nascita sono più rappresentati. Il luogo di nascita è distinto dalla
            cittadinanza e non descrive automaticamente etnia, identità o
            provenienza migratoria recente.
          </p>
        </div>
        <label className="text-sm font-medium text-foreground">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
            Anno
          </span>
          <select
            aria-label="Anno dei dati sul paese di nascita"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => setSelectedPeriod(event.target.value)}
            value={selectedPeriod}
          >
            <option value="latest">
              Ultimo disponibile · {data.availablePeriods.at(-1)}
            </option>
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
        <span>{data.source.name} · paese di nascita, non cittadinanza</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Nati all'estero"
          value={formatPeople(data.counts.bornAbroad)}
          detail="residenti nati fuori dall'Italia"
        />
        <MetricCard
          label="Incidenza"
          value={formatPercent(data.counts.bornAbroadShare)}
          detail="sulla popolazione residente dello stesso anno"
        />
        <MetricCard
          label="Nati in Italia"
          value={formatPeople(data.counts.bornInItaly)}
          detail="categoria Italia nella fonte per paese di nascita"
        />
        <MetricCard
          label="Variazione dal primo anno"
          value={
            shareDelta === null
              ? "—"
              : `${shareDelta >= 0 ? "+" : ""}${new Intl.NumberFormat("it-IT", {
                  maximumFractionDigits: 1,
                }).format(shareDelta)} p.p.`
          }
          detail={
            firstHistory
              ? `incidenza ${data.period} rispetto al ${firstHistory.period}`
              : "serie storica non disponibile"
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Incidenza dei residenti nati all'estero</CardTitle>
            <CardDescription>
              Quota sulla popolazione residente dello stesso anno. La cesura
              2018/2019 resta metodologicamente esplicita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label="Serie storica della quota di residenti nati all'estero a Lamezia Terme"
              className="flex h-48 items-end gap-1 border-b border-l border-border px-2 pt-4"
            >
              {data.history.map((point) => {
                const share = point.bornAbroadShare ?? 0;
                return (
                  <div
                    key={point.period}
                    className="group relative flex min-w-0 flex-1 items-end justify-center"
                    title={`${point.period}: ${formatPercent(point.bornAbroadShare)}`}
                  >
                    <div
                      className="w-full max-w-5 rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
                      style={{ height: `${Math.max(2, (share / maxHistoryShare) * 100)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{data.history[0]?.period}</span>
              <span>{data.history.at(-1)?.period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principali paesi di nascita</CardTitle>
            <CardDescription>
              Residenti nati all'estero nel {data.period}; “Altri Paesi” resta
              nel totale ma non entra nella graduatoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topBirthCountries.length ? (
              data.topBirthCountries.map((country, index) => (
                <div key={country.code} className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <span className="mr-2 text-xs text-muted-foreground">{index + 1}.</span>
                    <span className="font-medium text-foreground">{country.name}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-semibold tabular-nums">{formatPeople(country.total)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercent(country.shareOfBornAbroad)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Dettaglio per paese non disponibile.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="space-y-3 p-5 text-sm leading-6 text-muted-foreground">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Controllo di copertura</p>
              <p>
                Somma per paese di nascita: {formatPeople(data.quality.sourceCountryTotal)} ·
                popolazione indipendente: {formatPeople(data.quality.independentPopulation)} ·
                differenza: {formatPeople(data.quality.coverageDifference)}.
                Una differenza non nulla resta visibile e non viene redistribuita.
              </p>
            </div>
          </div>
          <p>{data.methodology.birthplace}</p>
          <p>{data.methodology.temporalBreak}</p>
          <p>{data.methodology.citizenshipCross}</p>
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-display font-bold tabular-nums text-foreground">
          {value}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
