import {
  Building2,
  CloudSun,
  Database,
  FileText,
  Handshake,
  Landmark,
  Library,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  OPEN_DATA_THEME_LIBRARY,
  type OpenDataThemeCategory,
} from "@/data/opendataThemeCategories";

const THEME_ICONS: Record<string, ReactNode> = {
  "climate-territory": <CloudSun className="h-4 w-4" />,
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
    <section aria-labelledby="opendata-theme-library-title" className="mb-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Library className="h-3.5 w-3.5" />
            Archivio OpenData
          </span>
          <h2
            id="opendata-theme-library-title"
            className="mt-2 text-2xl font-display font-bold text-foreground"
          >
            Categorie tematiche dei dati
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Le categorie filtrano l'archivio. Il grafico o la scheda completa si
          aprono solo dopo la scelta di un dataset.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filtri per categoria tematica OpenData"
      >
        <ThemeFilterButton
          count={totalDatasets}
          icon={<Database className="h-4 w-4" />}
          isSelected={selectedThemeId === null}
          label="Tutti i dataset"
          onSelect={() => onSelectTheme(null)}
        />
        {OPEN_DATA_THEME_LIBRARY.map((theme) => (
          <ThemeFilterButton
            count={theme.datasets.length}
            icon={THEME_ICONS[theme.id] ?? <Database className="h-4 w-4" />}
            isSelected={selectedThemeId === theme.id}
            key={theme.id}
            label={theme.label}
            onSelect={() => onSelectTheme(theme.id)}
            statusLabel={theme.statusLabel}
          />
        ))}
      </div>
    </section>
  );
}

function ThemeFilterButton({
  count,
  icon,
  isSelected,
  label,
  onSelect,
  statusLabel,
}: {
  count: number;
  icon: ReactNode;
  isSelected: boolean;
  label: string;
  onSelect: () => void;
  statusLabel?: OpenDataThemeCategory["statusLabel"];
}) {
  return (
    <button
      aria-pressed={isSelected}
      className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50"
      }`}
      onClick={onSelect}
      type="button"
    >
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
          isSelected ? "bg-primary-foreground/15" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
      <Badge
        variant={isSelected ? "secondary" : "outline"}
        className="ml-1 shadow-none"
      >
        {count}
      </Badge>
      {statusLabel ? <span className="sr-only">, {statusLabel}</span> : null}
    </button>
  );
}
