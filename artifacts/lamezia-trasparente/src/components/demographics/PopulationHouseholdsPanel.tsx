import { useEffect, useMemo, useState } from "react";
import { Home, Info, UsersRound } from "lucide-react";
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

type HouseholdResponse = {
  geography: { code: string; name: string; level: string };
  period: string;
  availablePeriods: string[];
  sourceStatus: SourceStatus;
  counts: {
    households: number;
    householdPopulation: number;
    averageHouseholdSize: number;
    totalPopulation: number | null;
    householdPopulationShare: number | null;
  };
  changeFromFirst: {
    firstPeriod: string;
    householdsAbsolute: number;
    householdsPercent: number | null;
    averageHouseholdSize: number;
  };
  history: Array<{
    period: string;
    households: number;
    householdPopulation: number;
    averageHouseholdSize: number;
    sourceStatus: SourceStatus;
    totalPopulation: number | null;
  }>;
  quality: {
    publishedAverageHouseholdSize: number | null;
    derivedAverageHouseholdSize: number;
    averageDifference: number | null;
    flags: string[];
  };
  composition: {
    schemaVersion: 1;
    referenceYear: 2023;
    municipality: { name: string; istatCode: string };
    totalHouseholds: number;
    byComponents: Array<{
      key: "1" | "2" | "3" | "4" | "5" | "6+";
      sourceField: "PF3" | "PF4" | "PF5" | "PF6" | "PF7" | "PF8";
      households: number;
      share: number;
    }>;
    indicators: {
      onePersonHouseholds: number;
      onePersonShare: number;
      fivePlusHouseholds: number;
      fivePlusShare: number;
    };
    quality: {
      includedRows: number;
      skippedFictitiousRows: number;
      incompleteRows: number;
      componentSum: number;
      reconciliationDifference: number;
      exactReconciliation: boolean;
    };
    source: {
      institution: string;
      dataset: string;
      referenceDate: string;
      sourceUpdateDate: string;
      pageUrl: string;
    };
  };
  source: {
    name: string;
    dataset: string;
    url: string;
    projection: string;
  };
  methodology: {
    household: string;
    referencePeriod: string;
    averageHouseholdSize: string;
    provenance: string;
    coverage: string;
    history: string;
    childrenDataset: string;
    composition: string;
    compositionQuality: string;
    familyRelationships: string;
  };
};

function formatInteger(value: number | null) {
  return value === null
    ? "—"
    : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(value);
}

function formatDecimal(value: number | null, digits = 2) {
  return value === null
    ? "—"
    : new Intl.NumberFormat("it-IT", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value);
}

function formatPercent(value: number | null) {
  return value === null
    ? "—"
    : `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatSourceDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
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

export function PopulationHouseholdsPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState("latest");
  const [data, setData] = useState<HouseholdResponse | null>(null);
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
        const response = await fetch(`/api/demographics/households${query}`);
        if (!response.ok) {
          throw new Error(`Households API returned ${response.status}`);
        }
        const payload = (await response.json()) as HouseholdResponse;
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

  const maxHouseholds = useMemo(
    () => Math.max(1, ...(data?.history.map((point) => point.households) ?? [1])),
    [data],
  );
  const maxCompositionShare = useMemo(
    () =>
      Math.max(
        1,
        ...(data?.composition.byComponents.map((item) => item.share) ?? [1]),
      ),
    [data],
  );

  if (isLoading && !data) {
    return (
      <section className="space-y-4" aria-label="Caricamento dati sulle famiglie">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          I dati annuali sulle famiglie non sono ancora disponibili nella
          proiezione demografica. Il pannello comparirà dopo il prossimo ciclo
          che abbia una release P02 completa con numero di famiglie e
          popolazione residente in famiglia.
        </CardContent>
      </Card>
    );
  }

  return (
    <section
      id="famiglie-lamezia"
      className="space-y-6"
      aria-labelledby="households-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <UsersRound className="h-3.5 w-3.5" />
            Famiglie
          </span>
          <h3
            className="mt-2 text-xl md:text-2xl font-display font-bold tracking-tight"
            id="households-title"
          >
            Come cambiano le famiglie
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Numero di famiglie, popolazione residente in famiglia e dimensione
            media. La serie usa gli stessi bilanci P02 già versionati
            nell'Osservatorio, senza una seconda copia della fonte.
          </p>
        </div>
        <label className="text-sm font-medium text-foreground">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
            Anno
          </span>
          <select
            aria-label="Anno dei dati sulle famiglie"
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
          31 dicembre {data.period}
        </Badge>
        <Badge variant="outline" className="shadow-none">
          {statusLabel(data.sourceStatus)}
        </Badge>
        <span>{data.source.name} · {data.source.dataset}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Famiglie"
          value={formatInteger(data.counts.households)}
          detail="unità familiari anagrafiche"
        />
        <MetricCard
          label="Componenti medi"
          value={formatDecimal(data.counts.averageHouseholdSize)}
          detail="residenti in famiglia / famiglie"
        />
        <MetricCard
          label="Residenti in famiglia"
          value={formatInteger(data.counts.householdPopulation)}
          detail="persone residenti in unità familiari"
        />
        <MetricCard
          label="Quota della popolazione"
          value={formatPercent(data.counts.householdPopulationShare)}
          detail="residenti in famiglia sul totale residente"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Numero di famiglie nel tempo</CardTitle>
            <CardDescription>
              Stock al 31 dicembre per le annualità P02 effettivamente presenti
              nell'archivio versionato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label="Serie storica del numero di famiglie a Lamezia Terme"
              className="flex h-48 items-end gap-1 border-b border-l border-border px-2 pt-4"
            >
              {data.history.map((point) => (
                <div
                  key={point.period}
                  className="group relative flex min-w-0 flex-1 items-end justify-center"
                  title={`${point.period}: ${formatInteger(point.households)} famiglie`}
                >
                  <div
                    className="w-full max-w-5 rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
                    style={{
                      height: `${Math.max(3, (point.households / maxHouseholds) * 100)}%`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{data.history[0]?.period}</span>
              <span>{data.history.at(-1)?.period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rispetto al primo anno disponibile</CardTitle>
            <CardDescription>
              Confronto descrittivo, non una spiegazione causale del cambiamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChangeRow
              label="Numero di famiglie"
              value={`${data.changeFromFirst.householdsAbsolute >= 0 ? "+" : ""}${formatInteger(
                data.changeFromFirst.householdsAbsolute,
              )}`}
              detail={
                data.changeFromFirst.householdsPercent === null
                  ? `dal ${data.changeFromFirst.firstPeriod}`
                  : `${data.changeFromFirst.householdsPercent >= 0 ? "+" : ""}${formatPercent(
                      data.changeFromFirst.householdsPercent,
                    )} dal ${data.changeFromFirst.firstPeriod}`
              }
            />
            <ChangeRow
              label="Dimensione media"
              value={`${data.changeFromFirst.averageHouseholdSize >= 0 ? "+" : ""}${formatDecimal(
                data.changeFromFirst.averageHouseholdSize,
              )}`}
              detail="componenti per famiglia"
            />
            <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
              <Home className="mb-2 h-4 w-4 text-primary" />
              La famiglia anagrafica può essere composta anche da una sola
              persona. Non coincide necessariamente con un nucleo familiare.
            </div>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="household-composition-title">
        <Card>
          <CardHeader>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="shadow-none">
                Censimento {data.composition.referenceYear}
              </Badge>
              <Badge variant="outline" className="shadow-none">
                fotografia distinta dallo storico P02
              </Badge>
            </div>
            <CardTitle id="household-composition-title">
              Composizione delle famiglie nel 2023
            </CardTitle>
            <CardDescription>
              Famiglie anagrafiche per numero di componenti, aggregate dalle
              sezioni censuarie di Lamezia Terme. Questa fotografia resta fissa
              anche quando si cambia l'anno nel selettore dello storico.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div
              role="list"
              aria-label="Distribuzione delle famiglie di Lamezia Terme per numero di componenti nel 2023"
              className="space-y-3"
            >
              {data.composition.byComponents.map((item) => {
                const label =
                  item.key === "1"
                    ? "1 componente"
                    : item.key === "6+"
                      ? "6 o più componenti"
                      : `${item.key} componenti`;
                return (
                  <div
                    key={item.key}
                    role="listitem"
                    aria-label={`${label}: ${formatInteger(item.households)} famiglie, ${formatPercent(item.share)}`}
                    className="grid grid-cols-[7rem_1fr_auto] items-center gap-2 sm:grid-cols-[8.5rem_1fr_auto] sm:gap-3"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {label}
                    </span>
                    <div
                      aria-hidden="true"
                      className="h-3 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-primary/75"
                        style={{
                          width: `${(item.share / maxCompositionShare) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="min-w-20 text-right text-sm tabular-nums text-muted-foreground sm:min-w-24">
                      {formatInteger(item.households)} ·{" "}
                      {formatPercent(item.share)}
                    </span>
                  </div>
                );
              })}
              <p className="pt-1 text-xs leading-5 text-muted-foreground">
                Quote arrotondate a un decimale; la quadratura è verificata sui
                conteggi interi.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <MetricCard
                  label="Famiglie unipersonali"
                  value={formatInteger(
                    data.composition.indicators.onePersonHouseholds,
                  )}
                  detail={`${formatPercent(data.composition.indicators.onePersonShare)} del totale censuario`}
                />
                <MetricCard
                  label="Famiglie con almeno 5 componenti"
                  value={formatInteger(
                    data.composition.indicators.fivePlusHouseholds,
                  )}
                  detail={`${formatPercent(data.composition.indicators.fivePlusShare)} del totale censuario`}
                />
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                <p>
                  Totale di controllo:{" "}
                  {formatInteger(data.composition.totalHouseholds)} famiglie;
                  PF3–PF8 = PF1, senza residui.
                </p>
                <p className="mt-2">{data.methodology.familyRelationships}</p>
                <a
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                  href={data.composition.source.pageUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Fonte ISTAT
                </a>
                <span className="ml-2 text-xs">
                  edizione aggiornata il{" "}
                  {formatSourceDate(data.composition.source.sourceUpdateDate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-dashed">
        <CardContent className="space-y-3 p-5 text-sm leading-6 text-muted-foreground">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Fonte e controlli</p>
              <p>{data.methodology.provenance}</p>
            </div>
          </div>
          <p>{data.methodology.averageHouseholdSize}</p>
          <p>{data.methodology.coverage}</p>
          <p>
            <strong className="font-medium text-foreground">
              Composizione 2023:
            </strong>{" "}
            {data.methodology.composition} {data.methodology.compositionQuality}
          </p>
          <p>
            <strong className="font-medium text-foreground">Famiglie per numero di figli:</strong>{" "}
            {data.methodology.childrenDataset}
          </p>
          {data.quality.averageDifference !== null ? (
            <p>
              Controllo della media pubblicata: {formatDecimal(
                data.quality.publishedAverageHouseholdSize,
                3,
              )} dalla fonte contro {formatDecimal(
                data.quality.derivedAverageHouseholdSize,
                3,
              )} ricalcolato; differenza {formatDecimal(
                data.quality.averageDifference,
                3,
              )}.
            </p>
          ) : null}
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

function ChangeRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <p className="shrink-0 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
