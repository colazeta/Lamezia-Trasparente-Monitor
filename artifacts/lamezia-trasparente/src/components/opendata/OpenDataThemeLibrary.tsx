import {
  ArrowRight,
  Building2,
  Check,
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
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export function OpenDataThemeLibrary({
  selectedThemeId,
  onSelectTheme,
}: OpenDataThemeLibraryProps) {
  return (
    <section aria-labelledby="opendata-theme-library-title" className="mb-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Library className="h-3.5 w-3.5" />
            Libreria tematica
          </span>
          <h2
            id="opendata-theme-library-title"
            className="mt-2 text-2xl font-display font-bold text-foreground"
          >
            Categorie tematiche dei dati
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Prima si sceglie il tema civico, poi il dataset disponibile e solo
          dopo l'eventuale visualizzazione o download.
        </p>
      </div>

      <div
        className="grid gap-3 md:grid-cols-2"
        role="list"
        aria-label="Categorie tematiche OpenData"
      >
        {OPEN_DATA_THEME_LIBRARY.map((theme) => (
          <ThemeCard
            isSelected={selectedThemeId === theme.id}
            key={theme.id}
            onSelect={() => onSelectTheme(theme.id)}
            theme={theme}
          />
        ))}
      </div>
    </section>
  );
}

function ThemeCard({
  isSelected,
  onSelect,
  theme,
}: {
  isSelected: boolean;
  onSelect: () => void;
  theme: OpenDataThemeCategory;
}) {
  const isPublished = theme.status === "published";
  const datasetCount = theme.datasets.length;

  return (
    <article
      className={`rounded-lg border p-4 transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/40"
      }`}
      role="listitem"
    >
      <button
        aria-pressed={isSelected}
        className="flex w-full flex-col gap-3 text-left"
        onClick={onSelect}
        type="button"
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ${
              isSelected
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-primary/10 text-primary ring-primary/20"
            }`}
          >
            {THEME_ICONS[theme.id] ?? <Database className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={isPublished ? "success" : "outline"}
                className="shadow-none"
              >
                {theme.statusLabel}
              </Badge>
              <Badge variant="outline" className="shadow-none">
                {datasetCount === 1
                  ? "1 dataset"
                  : `${datasetCount} dataset pubblicati`}
              </Badge>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-foreground">
              {theme.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {theme.description}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold ${
            isSelected ? "bg-primary text-primary-foreground" : "text-primary"
          }`}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4" />
              Tema selezionato
            </>
          ) : (
            <>
              Seleziona tema
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </span>
      </button>

      <details className="mt-3 rounded-md border border-border bg-muted/20">
        <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-foreground marker:hidden">
          Domande e riuso
        </summary>
        <div className="space-y-3 border-t border-border p-3 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Domanda civica
            </p>
            <p className="mt-1 leading-6 text-foreground">
              {theme.civicQuestion}
            </p>
          </div>
          <TokenList label="Tipi di dato nel tema" values={theme.dataTypes} />
          <TokenList label="Riuso civico" values={theme.civicUses} />
        </div>
      </details>
    </article>
  );
}

function TokenList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
