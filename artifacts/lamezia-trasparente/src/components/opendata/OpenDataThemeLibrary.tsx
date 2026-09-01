import {
  CheckCircle2,
  CloudSun,
  Database,
  ExternalLink,
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
  const totalDatasets = publishedThemes.reduce(
    (total, theme) => total + theme.datasets.length,
    0,
  );

  return (
    <section aria-labelledby="opendata-theme-library-title" className="mb-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="opendata-theme-library-title"
            className="font-display text-2xl font-bold text-foreground"
          >
            Esplora i dati
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scegli un tema oppure mostra tutto.
          </p>
        </div>
        <Badge variant="outline" className="shadow-none">
          {totalDatasets} dataset
        </Badge>
      </div>

      <div
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
        role="group"
        aria-label="Filtri per tema Open Data"
      >
        <ThemeFilterButton
          count={totalDatasets}
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
