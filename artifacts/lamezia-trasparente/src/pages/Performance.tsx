import { useMemo } from "react";
import { Link } from "wouter";
import {
  useListPerformanceCategories,
  useListPerformanceFeedStatus,
} from "@workspace/api-client-react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { PerformanceIndicatorExplorer } from "@/components/performance/PerformanceIndicatorExplorer";
import { PerformanceObjectiveRegistryPanel } from "@/components/performance/PerformanceObjectiveRegistryPanel";
import { PerformanceProcessChainPanel } from "@/components/performance/PerformanceProcessChainPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { getPerformanceRegistryStats } from "@/data/performanceObjectiveRegistry";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : format(date, "dd MMM yyyy, HH:mm", { locale: it });
}

function coveragePercentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function Performance() {
  const { data: categories, isLoading } = useListPerformanceCategories();
  const { data: feedStatus } = useListPerformanceFeedStatus();
  const registryStats = getPerformanceRegistryStats();

  const lastUpdatedAt = useMemo(() => {
    const times = (feedStatus ?? [])
      .map((feed) => feed.lastUpdatedAt)
      .filter((time): time is string => Boolean(time))
      .map((time) => new Date(time).getTime())
      .filter((time) => !Number.isNaN(time));
    if (!times.length) return null;
    return new Date(Math.max(...times)).toISOString();
  }, [feedStatus]);

  const allIndicators = useMemo(
    () => (categories ?? []).flatMap((category) => category.indicators),
    [categories],
  );

  const coverage = useMemo(() => {
    const total = allIndicators.length;
    const withLatestValue = allIndicators.filter(
      (indicator) =>
        indicator.latestValue !== null && indicator.latestValue !== undefined,
    ).length;
    const withPeriod = allIndicators.filter((indicator) =>
      Boolean(indicator.latestValue?.period),
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

  const objectiveState: EvidenceState =
    registryStats.objectiveRecords > 0
      ? "available"
      : registryStats.objectiveDefinitionSources > 0
        ? "partial"
        : "to-acquire";

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
              verificare, distinguendo i dati di contesto dalla catena
              documentale tra obiettivi, target, risultati ed evidenze.
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-muted/30 p-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 text-brand" />
              Ultimo aggiornamento indicatori
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
                La catena documentale della performance
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                La catena combina due corpus distinti: gli indicatori già
                pubblicati e il nuovo registro delle fonti amministrative. Un
                passaggio è disponibile solo quando esiste evidenza verificata
                per quel livello; la sola esistenza del documento non completa
                automaticamente obiettivi o target.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-6">
          <EvidenceStep
            icon={Target}
            label="Obiettivo"
            detail={
              registryStats.objectiveRecords > 0
                ? `${registryStats.objectiveRecords} obiettivi verificati`
                : `${registryStats.objectiveDefinitionSources} fonti pertinenti censite · estrazione pending`
            }
            state={objectiveState}
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
            detail={
              registryStats.withTarget > 0
                ? `${registryStats.withTarget} obiettivi con target verificato`
                : "Da acquisire da obiettivi verificati"
            }
            state={registryStats.withTarget > 0 ? "available" : "to-acquire"}
          />
          <EvidenceStep
            icon={CheckCircle2}
            label="Risultato"
            detail={
              registryStats.withResult > 0
                ? `${registryStats.withResult} risultati collegati`
                : "Da collegare a obiettivi verificati"
            }
            state={registryStats.withResult > 0 ? "available" : "to-acquire"}
          />
          <EvidenceStep
            icon={FileText}
            label="Evidenza"
            detail={
              registryStats.withEvidence > 0
                ? `${registryStats.withEvidence} obiettivi con evidenza`
                : `${coverage.withSource} indicatori con fonte · evidenze obiettivo da acquisire`
            }
            state={
              registryStats.withEvidence > 0
                ? "available"
                : coverage.withSource > 0
                  ? "partial"
                  : "to-acquire"
            }
          />
          <EvidenceStep
            icon={ShieldCheck}
            label="Validazione OIV"
            detail={
              registryStats.withOivValidation > 0
                ? `${registryStats.withOivValidation} validazioni collegate`
                : `${registryStats.validationSources} presidio OIV censito · validazioni annuali da acquisire`
            }
            state={
              registryStats.withOivValidation > 0 ? "available" : "to-acquire"
            }
          />
        </div>

        <div className="grid gap-4 bg-muted/20 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div>
            <p className="font-display font-bold">Regola di lettura</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Un indicatore territoriale o di contesto può essere informativo,
              ma non dimostra da solo il raggiungimento di un obiettivo del
              Comune. Allo stesso modo, una pagina istituzionale OIV documenta
              il presidio di valutazione, non una specifica validazione annuale.
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

      <PerformanceObjectiveRegistryPanel />
      <PerformanceProcessChainPanel />

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
              Quanto è leggibile il corpus degli indicatori?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Queste barre riguardano esclusivamente il corpus degli indicatori.
              La copertura documentale di obiettivi e validazioni è mostrata
              separatamente nel registro delle fonti.
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

      <PerformanceIndicatorExplorer
        categories={categories}
        isLoading={isLoading}
      />
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
