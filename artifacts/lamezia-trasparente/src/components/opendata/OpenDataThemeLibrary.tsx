import {
  Building2,
  CloudSun,
  Database,
  FileText,
  Handshake,
  Landmark,
  Library,
  Plane,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  OPEN_DATA_THEME_LIBRARY,
  type OpenDataThemeCategory,
} from "@/data/opendataThemeCategories";

const THEME_ICONS: Record<string, ReactNode> = {
  "climate-territory": <CloudSun className="h-4 w-4" />,
  "mobility-connections": <Plane className="h-4 w-4" />,
  "contracts-spending": <Landmark className="h-4 w-4" />,
  "administration-acts": <FileText className="h-4 w-4" />,
  "assets-confiscated-property": <Building2 className="h-4 w-4" />,
  "participation-access": <Handshake className="h-4 w-4" />,
};

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
    <section aria-labelledby="opendata-theme-library-title" className="mb-5">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Library className="h-3.5 w-3.5" />
            Passaggio 1
          </span>
          <h2
            id="opendata-theme-library-title"
            className="mt-2 text-2xl font-display font-bold text-foreground"
          >
            Scegli categoria
          </h2>
        </div>
        <Badge variant="outline" className="w-fit shadow-none">
          {totalDatasets === 1 ? "1 dataset" : `${totalDatasets} dataset`}
        </Badge>
      </div>

      <div
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7"
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
