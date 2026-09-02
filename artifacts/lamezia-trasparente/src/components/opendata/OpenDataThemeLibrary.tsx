import {
  CalendarDays,
  CheckCircle2,
  CloudSun,
  Database,
  ExternalLink,
  FileJson,
  Plane,
  RefreshCw,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  LAMEZIA_OPEN_DATA_SERIES,
  LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY,
} from "@/data/lameziaOpenDataSeriesStatus";
import {
  buildOpenDataCatalogStatistics,
  type OpenDataCatalogDistributionItem,
} from "@/data/openDataDatasetRegistry";
import {
  OPEN_DATA_THEME_LIBRARY,
  type OpenDataThemeCategory,
} from "@/data/opendataThemeCategories";

const THEME_ICONS: Record<string, ReactNode> = {
  "climate-territory": <CloudSun className="h-4 w-4" />,
  "mobility-connections": <Plane className="h-4 w-4" />,
  "population-society": <Users className="h-4 w-4" />,
};

interface OpenDataThemeLibraryProps {
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string | null) => void;
}

export function OpenDataThemeLibrary({
  selectedThemeId,
  onSelectTheme,
}: OpenDataThemeLibraryProps) {
  const publishedThemes = [...OPEN_DATA_THEME_LIBRARY]
    .filter((theme) => theme.datasets.length > 0)
    .sort((a, b) => b.datasets.length - a.datasets.length);
  const catalogStats = buildOpenDataCatalogStatistics();

  return (
    <section aria-labelledby="opendata-theme-library-title" className="mb-6">
      <div className="mb-5 rounded-xl border border-card-border bg-card p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-primary">
              <Database className="h-3.5 w-3.5" />
              Catalogo in numeri
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
              Una vista unica sui dataset pubblicati
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              I conteggi derivano dal registry canonico: grafici, confronti e
              altre viste analitiche non aumentano artificialmente il numero dei
              dataset.
            </p>
          </div>
          <Badge variant="outline" className="w-fit shadow-none">
            {catalogStats.documentedStatusDatasets}/{catalogStats.totalDatasets}{" "}
            con stato documentato
          </Badge>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <CatalogStat
            icon={<Database className="h-4 w-4" />}
            label="Dataset"
            value={catalogStats.totalDatasets}
          />
          <CatalogStat
            icon={<FileJson className="h-4 w-4" />}
            label="Famiglie"
            value={catalogStats.totalFamilies}
          />
          <CatalogStat
            icon={<Users className="h-4 w-4" />}
            label="Temi"
            value={catalogStats.publishedThemes}
          />
          <CatalogStat
            icon={<ExternalLink className="h-4 w-4" />}
            label="Fonti"
            value={catalogStats.totalSources}
          />
          <CatalogStat
            icon={<CalendarDays className="h-4 w-4" />}
            label="Copertura"
            value={catalogStats.temporalCoverage.label}
          />
          <CatalogStat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Metadati"
            value={`${catalogStats.metadataCompletenessPct}%`}
          />
        </dl>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            {catalogStats.automatedDatasets} dataset con aggiornamento automatico
          </span>
          <span>
            {catalogStats.recentlyUpdated.length} aggiornati negli ultimi{" "}
            {catalogStats.recentWindowDays} giorni
          </span>
          <span>
            {catalogStats.missingMetadataFields} campi metadata ancora da
            completare
          </span>
        </div>

        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-primary marker:hidden hover:underline">
            Vedi distribuzione per tema, fonte e formato
          </summary>
          <div className="mt-3 grid gap-5 md:grid-cols-3">
            <DistributionBlock
              items={catalogStats.byTheme}
              title="Per tema"
              total={catalogStats.totalDatasets}
            />
            <DistributionBlock
              items={catalogStats.bySource}
              title="Per fonte"
              total={catalogStats.totalDatasets}
            />
            <DistributionBlock
              items={catalogStats.byFormat}
              title="Per formato"
              total={catalogStats.totalDatasets}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            La completezza misura i metadati strutturali del registry. Un campo
            non documentato resta esplicitamente mancante: non viene riempito con
            valori presunti.
          </p>
        </details>
      </div>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="opendata-theme-library-title"
            className="font-display text-2xl font-bold text-foreground"
          >
            Esplora i dati
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scegli un tema oppure mostra tutto. Dataset della stessa famiglia
            restano collegati senza trasformare ogni vista in una nuova voce.
          </p>
        </div>
        <Badge variant="outline" className="shadow-none">
          {catalogStats.totalDatasets} dataset · {catalogStats.totalFamilies}{" "}
          famiglie
        </Badge>
      </div>

      <div
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
        role="group"
        aria-label="Filtri per tema Open Data"
      >
        <ThemeFilterButton
          count={catalogStats.totalDatasets}
          icon={<Database className="h-4 w-4" />}
          isSelected={selectedThemeId === null}
          label="Tutti"
          accessibleLabel="Tutti i dataset"
          onSelect={() => onSelectTheme(null)}
        />
        {publishedThemes.map((theme) => (
          <ThemeFilterButton
            accessibleLabel={theme.label}
            count={theme.datasets.length}
            icon={THEME_ICONS[theme.id] ?? <Database className="h-4 w-4" />}
            isSelected={selectedThemeId === theme.id}
            key={theme.id}
            label={theme.shortLabel}
            onSelect={() => onSelectTheme(theme.id)}
          />
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-border/70 bg-muted/25 px-3 py-2.5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-foreground">
                {LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY.total} dataset con
                stato documentato
              </strong>{" "}
              · {LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY.automated} aggiornati
              automaticamente
            </span>
          </p>
          <details className="group">
            <summary className="cursor-pointer list-none font-semibold text-primary marker:hidden hover:underline">
              Aggiornamento e fonti
            </summary>
            <div className="mt-3 grid gap-2 border-t border-border/70 pt-3 sm:grid-cols-2 lg:grid-cols-3">
              {LAMEZIA_OPEN_DATA_SERIES.map((series) => (
                <div
                  className="rounded-md border border-border/70 bg-background px-3 py-2"
                  key={series.id}
                >
                  <p className="text-xs font-semibold text-foreground">
                    {series.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ultimo dato: {series.latest_observation_label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {series.source_cadence_label} ·{" "}
                    {series.automation_status_label}
                  </p>
                  <a
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    href={series.source_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Fonte ufficiale
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              “Ultimo dato” indica l’ultima osservazione disponibile nella fonte,
              non un dato in tempo reale. Se la fonte non pubblica un periodo di
              riferimento, il monitor non lo attribuisce.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}

function CatalogStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

function DistributionBlock({
  items,
  title,
  total,
}: {
  items: OpenDataCatalogDistributionItem[];
  title: string;
  total: number;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <li key={item.id}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-foreground">{item.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {item.count}
                </span>
              </div>
              <div
                aria-label={`${item.label}: ${item.count} dataset`}
                aria-valuemax={total}
                aria-valuemin={0}
                aria-valuenow={item.count}
                className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ThemeFilterButton({
  accessibleLabel,
  count,
  icon,
  isSelected,
  label,
  onSelect,
}: {
  accessibleLabel?: string;
  count: number;
  icon: ReactNode;
  isSelected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      aria-label={`${accessibleLabel ?? label}: ${count} dataset`}
      aria-pressed={isSelected}
      className={`inline-flex min-h-12 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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
      <span
        className={`text-xs tabular-nums ${
          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
