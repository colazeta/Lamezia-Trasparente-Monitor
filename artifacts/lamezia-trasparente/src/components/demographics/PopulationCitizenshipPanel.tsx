import { useEffect, useMemo, useState } from "react";
import { Globe2, Info, UsersRound } from "lucide-react";
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

type CitizenshipResponse = {
  geography: { code: string; name: string; level: string };
  period: string;
  availablePeriods: string[];
  sourceStatus: SourceStatus;
  counts: {
    population: number | null;
    foreign: number;
    italian: number | null;
    foreignShare: number | null;
  };
  foreignAgeBands: Array<{
    key: "0-14" | "15-64" | "65+";
    count: number;
    shareOfForeign: number | null;
  }>;
  history: Array<{
    period: string;
    population: number | null;
    foreign: number;
    foreignShare: number | null;
    sourceStatus: SourceStatus;
  }>;
  citizenshipDetail: {
    period: string;
    availablePeriods: string[];
    topCountries: Array<{
      code: string;
      name: string;
      total: number;
      male: number;
      female: number;
      shareOfForeign: number | null;
    }>;
    countryLeafTotal: number;
    foreignTotal: number | null;
    coverageDifference: number | null;
  } | null;
  source: {
    name: string;
    foreignDataset: string;
    citizenshipDataset: string;
    url: string;
  };
  methodology: {
    citizenship: string;
    referencePeriod: string;
    temporalBreak: string;
    countryDetail: string;
    coverage: string;
    birthplace: string;
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

export function PopulationCitizenshipPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState("latest");
  const [data, setData] = useState<CitizenshipResponse | null>(null);
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
        const response = await fetch(`/api/demographics/citizenship${query}`);
        if (!response.ok) {
          throw new Error(`Citizenship API returned ${response.status}`);
        }
        const payload = (await response.json()) as CitizenshipResponse;
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

  const historyMaxShare = useMemo(
    () =>
      Math.max(
        1,
        ...(data?.history.map((point) => point.foreignShare ?? 0) ?? [1]),
      ),
    [data],
  );

  if (isLoading && !data) {
    return (
      <section
        className="space-y-4"
        aria-label="Caricamento dati di cittadinanza"
      >
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          I dati di cittadinanza non sono ancora disponibili nell'archivio
          demografico versionato. Il pannello comparirà dopo il primo ciclo di
          acquisizione delle serie ISTAT dedicate.
        </CardContent>
      </Card>
    );
  }

  const band = (key: CitizenshipResponse["foreignAgeBands"][number]["key"]) =>
    data.foreignAgeBands.find((item) => item.key === key)!;
  const firstHistory = data.history[0] ?? null;
  const latestHistory = data.history.at(-1) ?? null;
  const shareDelta =
    firstHistory?.foreignShare !== null &&
    firstHistory?.foreignShare !== undefined &&
    latestHistory?.foreignShare !== null &&
    latestHistory?.foreignShare !== undefined
      ? latestHistory.foreignShare - firstHistory.foreignShare
      : null;

  return (
    <section id="cittadinanza" className="space-y-6" aria-labelledby="citizenship-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Globe2 className="h-3.5 w-3.5" />
            Cittadinanza
          </span>
          <h3
            className="mt-2 text-xl md:text-2xl font-display font-bold tracking-tight"
            id="citizenship-title"
          >
            Cittadinanza e presenza straniera
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Quanti residenti hanno cittadinanza non italiana, come è cambiata la
            loro presenza nel tempo e quali cittadinanze sono più rappresentate.
            Il paese di nascita è un'informazione diversa e non viene dedotto
            dalla cittadinanza.
          </p>
        </div>
        <label className="text-sm font-medium text-foreground">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
            Anno
          </span>
          <select
            aria-label="Anno dei dati di cittadinanza"
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
        <span>{data.source.name} · cittadinanza, non luogo di nascita</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Cittadini stranieri"
          value={formatPeople(data.counts.foreign)}
          detail="residenti con cittadinanza non italiana"
        />
        <MetricCard
          label="Incidenza"
          value={formatPercent(data.counts.foreignShare)}
          detail="sulla popolazione residente dello stesso anno"
        />
        <MetricCard
          label="Cittadini italiani"
          value={formatPeople(data.counts.italian)}
          detail="totale residenti meno cittadini stranieri"
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
              ? `incidenza rispetto al ${firstHistory.period}`
              : "serie storica non disponibile"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Stranieri 0–14"
          value={formatPercent(band("0-14").shareOfForeign)}
          detail={`${formatPeople(band("0-14").count)} persone`}
        />
        <MetricCard
          label="Stranieri 15–64"
          value={formatPercent(band("15-64").shareOfForeign)}
          detail={`${formatPeople(band("15-64").count)} persone`}
        />
        <MetricCard
          label="Stranieri 65+"
          value={formatPercent(band("65+").shareOfForeign)}
          detail={`${formatPeople(band("65+").count)} persone`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              Evoluzione dell'incidenza
            </CardTitle>
            <CardDescription>
              Quota di cittadini stranieri sulla popolazione residente · 1° gennaio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2" role="img" aria-label="Serie storica dell'incidenza dei cittadini stranieri a Lamezia Terme">
              {data.history.map((point) => (
                <div
                  className="grid grid-cols-[3rem_1fr_4rem] items-center gap-3 text-xs"
                  key={point.period}
                >
                  <span className="tabular-nums text-muted-foreground">
                    {point.period}
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((point.foreignShare ?? 0) / historyMaxShare) * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-right tabular-nums font-medium">
                    {formatPercent(point.foreignShare)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              Principali cittadinanze
            </CardTitle>
            <CardDescription>
              {data.citizenshipDetail
                ? `Dettaglio disponibile per il ${data.citizenshipDetail.period}`
                : "Il dettaglio per paese non è disponibile per l'anno selezionato"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.citizenshipDetail ? (
              <div className="space-y-3">
                {data.citizenshipDetail.topCountries.map((country, index) => (
                  <div
                    className="grid grid-cols-[1.5rem_1fr_auto] items-baseline gap-2 text-sm"
                    key={country.code}
                  >
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {index + 1}
                    </span>
                    <span>{country.name}</span>
                    <span className="text-right tabular-nums font-medium">
                      {formatPeople(country.total)} · {formatPercent(country.shareOfForeign)}
                    </span>
                  </div>
                ))}
                <p className="border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                  Controllo di copertura paesi: differenza rispetto al totale
                  stranieri {formatPeople(data.citizenshipDetail.coverageDifference)}.
                  Una differenza non viene redistribuita artificialmente.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                La serie storica dell'incidenza resta disponibile; il dettaglio
                per singolo paese è pubblicato nel layer corrente dal 2019.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex gap-3 p-5 text-sm leading-6 text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="space-y-2">
            <p>{data.methodology.citizenship}</p>
            <p>{data.methodology.temporalBreak}</p>
            <p>{data.methodology.coverage}</p>
            <p>
              <strong className="font-medium text-foreground">Luogo di nascita:</strong>{" "}
              {data.methodology.birthplace}
            </p>
          </div>
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
        <p className="mt-1 text-2xl font-display font-bold tabular-nums">
          {value}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
