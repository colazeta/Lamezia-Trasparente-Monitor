import {
  Building2,
  CheckCircle2,
  CloudSun,
  Database,
  ExternalLink,
  FileText,
  Handshake,
  Landmark,
  Library,
  Plane,
  RefreshCw,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  LAMEZIA_OPEN_DATA_SERIES,
  LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY,
  type LameziaOpenDataSeriesStatusItem,
} from "@/data/lameziaOpenDataSeriesStatus";
import {
  OPEN_DATA_THEME_LIBRARY,
  type OpenDataThemeCategory,
} from "@/data/opendataThemeCategories";

const THEME_ICONS: Record<string, ReactNode> = {
  "climate-territory": <CloudSun className="h-4 w-4" />,
  "mobility-connections": <Plane className="h-4 w-4" />,
  "population-society": <Users className="h-4 w-4" />,
  "contracts-spending": <Landmark className="h-4 w-4" />,
  "administration-acts": <FileText className="h-4 w-4" />,
  "assets-confiscated-property": <Building2 className="h-4 w-4" />,
  "participation-access": <Handshake className="h-4 w-4" />,
};

const sourceDateFormat = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Rome",
});

interface OpenDataThemeLibraryProps {
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string | null) => void;
}

export function OpenDataThemeLibrary({
  selectedThemeId,
  onSelectTheme,
}: OpenDataThemeLibraryProps) {
  const totalDatasets = OPEN_DATA_THEME_LIBRARY.reduce(
    (total, theme) => total + theme.datasets.length,
    0,
  );

  return (
    <>
      <SeriesFreshnessBoard />

      <section aria-labelledby="opendata-theme-library-title" className="mb-5">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-primary">
              <Library className="h-3.5 w-3.5" />
              Esplora
            </span>
            <h2
              id="opendata-theme-library-title"
              className="mt-2 text-2xl font-display font-bold text-foreground"
            >
              Esplora per categoria
            </h2>
          </div>
          <Badge variant="outline" className="w-fit shadow-none">
            {totalDatasets === 1 ? "1 dataset" : `${totalDatasets} dataset`}
          </Badge>
        </div>

        <div
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
          role="group"
          aria-label="Filtri per categoria tematica OpenData"
        >
          <ThemeFilterButton
            count={totalDatasets}
            icon={<Database className="h-4 w-4" />}
            isSelected={selectedThemeId === null}
            label="Tutti"
            accessibleLabel="Tutti i dataset"
            onSelect={() => onSelectTheme(null)}
          />
          {OPEN_DATA_THEME_LIBRARY.map((theme) => (
            <ThemeFilterButton
              accessibleLabel={theme.label}
              count={theme.datasets.length}
              icon={THEME_ICONS[theme.id] ?? <Database className="h-4 w-4" />}
              isSelected={selectedThemeId === theme.id}
              key={theme.id}
              label={theme.shortLabel}
              onSelect={() => onSelectTheme(theme.id)}
              statusLabel={theme.statusLabel}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function SeriesFreshnessBoard() {
  return (
    <section
      aria-labelledby="opendata-series-status-title"
      className="mb-7 rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <span className="eyebrow text-primary">
            <RefreshCw className="h-3.5 w-3.5" />
            Serie monitorate
          </span>
          <h2
            id="opendata-series-status-title"
            className="mt-2 text-2xl font-display font-bold text-foreground md:text-3xl"
          >
            Dati disponibili e aggiornamento
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
            Ogni serie indica l'ultima osservazione acquisita dalla fonte e la
            sua cadenza di pubblicazione. Il monitor controlla ogni giorno se
            la fonte ha reso disponibili dati nuovi, senza anticiparne i tempi
            di rilascio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
          <Badge variant="outline" className="shadow-none">
            <Database className="mr-1.5 h-3.5 w-3.5" />
            {LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY.total} serie
          </Badge>
          <Badge variant="success" className="shadow-none">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Controllo automatico giornaliero
          </Badge>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {LAMEZIA_OPEN_DATA_SERIES.map((series) => (
          <SeriesStatusCard key={series.id} series={series} />
        ))}
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        "Ultimo dato" descrive l'ultima osservazione disponibile nella fonte,
        non un dato in tempo reale. Quando la fonte non pubblica un anno di
        riferimento, il monitor lo dichiara invece di attribuirgliene uno.
      </p>
    </section>
  );
}

function SeriesStatusCard({
  series,
}: {
  series: LameziaOpenDataSeriesStatusItem;
}) {
  const sourceModified = series.source_modified_at
    ? sourceDateFormat.format(new Date(series.source_modified_at))
    : null;
  const detailHref = `/opendata?tema=${encodeURIComponent(
    series.theme_id,
  )}&dataset=${encodeURIComponent(series.id)}`;

  return (
    <article className="flex min-h-64 flex-col rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="success" className="shadow-none">
          <RefreshCw className="mr-1 h-3 w-3" />
          {series.automation_status_label}
        </Badge>
        <span className="text-xs font-medium text-muted-foreground">
          {series.monitoring_cadence_label}
        </span>
      </div>

      <h3 className="mt-3 font-display text-base font-bold leading-snug text-foreground">
        {series.label}
      </h3>

      <div className="mt-4 rounded-lg bg-muted/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Ultimo dato
        </p>
        <p className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">
          {series.latest_observation_label}
        </p>
        {series.latest_observation_note ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {series.latest_observation_note}
          </p>
        ) : null}
      </div>

      <dl className="mt-3 space-y-1 text-xs leading-5 text-muted-foreground">
        <div className="flex justify-between gap-3">
          <dt>Cadenza</dt>
          <dd className="text-right font-medium text-foreground">
            {series.source_cadence_label.replace("Fonte ", "")}
          </dd>
        </div>
        {sourceModified ? (
          <div className="flex justify-between gap-3">
            <dt>Fonte aggiornata</dt>
            <dd className="text-right font-medium text-foreground">
              {sourceModified}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-sm">
        <a
          className="font-semibold text-primary hover:underline"
          href={detailHref}
        >
          Apri serie
        </a>
        <a
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
          href={series.source_url}
          rel="noreferrer"
          target="_blank"
        >
          Fonte ufficiale
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function ThemeFilterButton({
  accessibleLabel,
  count,
  icon,
  isSelected,
  label,
  onSelect,
  statusLabel,
}: {
  accessibleLabel?: string;
  count: number;
  icon: ReactNode;
  isSelected: boolean;
  label: string;
  onSelect: () => void;
  statusLabel?: OpenDataThemeCategory["statusLabel"];
}) {
  return (
    <button
      aria-label={`${accessibleLabel ?? label}: ${count} dataset${
        statusLabel ? `, ${statusLabel}` : ""
      }`}
      aria-pressed={isSelected}
      className={`inline-flex min-h-14 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
      }`}
      onClick={onSelect}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
            isSelected
              ? "bg-primary-foreground/15"
              : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </span>
      <Badge
        variant={isSelected ? "secondary" : "outline"}
        className="shrink-0 shadow-none"
      >
        {count}
      </Badge>
      {statusLabel ? <span className="sr-only">, {statusLabel}</span> : null}
    </button>
  );
}
