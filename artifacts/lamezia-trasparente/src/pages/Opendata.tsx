import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  useListOpendataDatasets,
  useGetOpendataFeedStatus,
  type OpendataDataset,
} from "@workspace/api-client-react";
import {
  Search,
  Filter,
  Database,
  ExternalLink,
  RefreshCw,
  Landmark,
  FileSpreadsheet,
  Layers,
  Tag,
  ChevronRight,
  X,
  FileJson,
  Braces,
  Code2,
  Sparkles,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClimateTerritoryDatasetCard } from "@/components/opendata/ClimateTerritoryDatasetCard";
import { OpenDataDashboard } from "@/components/opendata/OpenDataDashboard";
import { OpenDataThemeLibrary } from "@/components/opendata/OpenDataThemeLibrary";
import {
  DEFAULT_OPEN_DATA_THEME_ID,
  OPEN_DATA_THEME_LIBRARY,
  type OpenDataThemeCategory,
  type OpenDataThemeDataset,
} from "@/data/opendataThemeCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { formatPublicTimeField } from "@/lib/time";

const PORTAL_URL = "https://opendata.comune.lamezia-terme.cz.it";

const LAST_VISIT_KEY = "opendata:lastVisit";

function readLastVisit(): number | null {
  try {
    const v = localStorage.getItem(LAST_VISIT_KEY);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function Opendata() {
  const [selectedThemeId, setSelectedThemeId] = useState(
    DEFAULT_OPEN_DATA_THEME_ID,
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Snapshot of the previous visit time, captured once on mount. Datasets whose
  // content changed after this moment get an "Aggiornato" badge. The current
  // visit time is written back to localStorage so the next visit compares fresh.
  const [lastVisit] = useState<number | null>(readLastVisit);

  useEffect(() => {
    try {
      localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    } catch {
      // Ignore storage failures (private mode, disabled storage, etc.).
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (debouncedSearch) f.search = debouncedSearch;
    if (category !== "all") f.category = category;
    return f;
  }, [debouncedSearch, category]);

  const { data: datasetResponse, isLoading } = useListOpendataDatasets(filters);
  const datasets: OpendataDataset[] = Array.isArray(datasetResponse)
    ? datasetResponse
    : [];
  const { data: feedStatus } = useGetOpendataFeedStatus();

  // Derive the full category list from an unfiltered fetch so the dropdown is
  // stable regardless of the current search/category selection.
  const { data: allDatasetResponse } = useListOpendataDatasets({});
  const allDatasets: OpendataDataset[] = Array.isArray(allDatasetResponse)
    ? allDatasetResponse
    : [];
  const categories = useMemo(() => {
    const set = new Set<string>();
    allDatasets.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allDatasets]);

  const hasActiveFilters = Boolean(debouncedSearch) || category !== "all";

  const isUpdatedSinceLastVisit = (dataset: OpendataDataset) => {
    if (lastVisit === null || !dataset.lastChangedAt) return false;
    const changed = new Date(dataset.lastChangedAt).getTime();
    return Number.isFinite(changed) && changed > lastVisit;
  };

  const updatedCount = datasets.filter(isUpdatedSinceLastVisit).length;

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
  };

  const selectedTheme =
    OPEN_DATA_THEME_LIBRARY.find((theme) => theme.id === selectedThemeId) ??
    OPEN_DATA_THEME_LIBRARY[0];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <span className="eyebrow text-primary">
          <Database className="h-3.5 w-3.5" />
          Dati aperti del Comune
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Opendata
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Scegli un tema civico, consulta i dataset disponibili e apri grafici
          o download solo come passaggio successivo.
        </p>
      </div>

      <OpenDataThemeLibrary
        onSelectTheme={setSelectedThemeId}
        selectedThemeId={selectedTheme.id}
      />

      <section
        aria-labelledby="opendata-selected-theme-title"
        className="mb-8"
      >
        <div className="mb-4">
          <span className="eyebrow text-primary">
            <Layers className="h-3.5 w-3.5" />
            Categoria tematica selezionata
          </span>
          <h2
            className="mt-2 text-2xl font-display font-bold text-foreground"
            id="opendata-selected-theme-title"
          >
            {selectedTheme.label}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {selectedTheme.description}
          </p>
        </div>

        <ThemeDatasetShelf theme={selectedTheme} />

        {selectedTheme.id === DEFAULT_OPEN_DATA_THEME_ID ? (
          <div className="mt-6">
            <div className="mb-4">
              <span className="eyebrow text-primary">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Visualizzazione secondaria
              </span>
              <h3 className="mt-2 text-xl font-display font-bold text-foreground">
                Grafico e scheda del dataset selezionato
              </h3>
            </div>
            <ClimateTerritoryDatasetCard />
          </div>
        ) : (
          <ThemePreparationPanel theme={selectedTheme} />
        )}
      </section>

      <details className="mb-8 rounded-xl border border-card-border bg-muted/20">
        <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
          Altre visualizzazioni
        </summary>
        <div className="border-t border-border p-4">
          <OpenDataDashboard />
        </div>
      </details>

      {/* Last updated + portal link */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-card-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 text-brand" />
          <span>
            Ultimo aggiornamento:{" "}
            <span className="font-medium text-foreground">
              {formatPublicTimeField(
                feedStatus?.lastUpdatedAt,
                "dd MMM yyyy, HH:mm",
              )}
            </span>
            {feedStatus?.itemsTotal ? (
              <> · {feedStatus.itemsTotal} dataset monitorati</>
            ) : null}
          </span>
        </div>
        <a
          href={feedStatus?.url || PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Landmark className="h-4 w-4" />
          Portale Opendata del Comune
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Interoperabilità: catalogo DCAT-AP_IT + API CKAN per l'intero catalogo */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-card-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Catalogo interoperabile.
          </span>{" "}
          Metadati standard DCAT-AP_IT e API aperta in stile CKAN per il riuso
          e la federazione con dati.gov.it.
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/opendata/catalog.jsonld"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <FileJson className="mr-1.5 h-4 w-4" />
              Catalogo DCAT-AP_IT
              <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
            </Button>
          </a>
          <a
            href="/api/3/action/package_search"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <Braces className="mr-1.5 h-4 w-4" />
              API CKAN
              <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
            </Button>
          </a>
          <Link href="/sviluppatori">
            <Button variant="outline" size="sm">
              <Code2 className="mr-1.5 h-4 w-4" />
              API e sviluppatori
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-3 rounded-xl border border-border bg-muted/40 p-4 shadow-sm md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca dataset per titolo, descrizione, tema..."
            className="pl-9 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full md:w-64">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className="h-11 bg-background"
                aria-label="Filtra per categoria"
              >
                <div className="flex items-center gap-2 truncate">
                  <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {category === "all" ? "Tutte le categorie" : category}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              aria-label="Azzera filtri"
              className="h-11 w-11 shrink-0 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Result count */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {!isLoading ? (
          <>
            <span>
              <span className="font-display font-bold text-foreground tabular-nums">
                {datasets.length}
              </span>{" "}
              dataset
            </span>
            {updatedCount > 0 ? (
              <Badge variant="success" className="text-[11px] shadow-none">
                <Sparkles className="mr-1 h-3 w-3" />
                {updatedCount} aggiornati dall'ultima visita
              </Badge>
            ) : null}
          </>
        ) : (
          "—"
        )}
      </div>

      {/* Catalog grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-card-border bg-card p-5 shadow-sm"
              >
                <Skeleton className="h-5 w-20 mb-3" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
        </div>
      ) : datasets.length > 0 ? (
        <div data-tour="opendata-catalog" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <DatasetCard
              key={d.id}
              dataset={d}
              isUpdated={isUpdatedSinceLastVisit(d)}
            />
          ))}
        </div>
      ) : (
        <Empty className="border border-dashed border-border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
              <Database className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle className="font-display">
              Nessun dataset trovato
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Nessun dataset corrisponde ai filtri attuali. Prova a modificare la ricerca o ad azzerare i filtri."
                : "Al momento non risultano dataset nel catalogo. Continueremo a monitorare il portale Opendata del Comune."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

function ThemeDatasetShelf({ theme }: { theme: OpenDataThemeCategory }) {
  if (theme.datasets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
        <Badge variant="outline" className="shadow-none">
          Dataset in preparazione
        </Badge>
        <h3 className="mt-3 font-display text-lg font-bold text-foreground">
          Nessun dataset pubblicato in questa categoria tematica
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          La categoria resta disponibile nella libreria per ordinare future
          pubblicazioni, ma non espone ancora una scheda dataset-first con
          download o visualizzazione.
        </p>
      </div>
    );
  }

  return (
    <div
      aria-labelledby="opendata-theme-datasets-title"
      className="rounded-xl border border-card-border bg-card p-5 shadow-sm"
    >
      <div className="mb-4">
        <h3
          className="font-display text-xl font-bold text-foreground"
          id="opendata-theme-datasets-title"
        >
          Dataset pubblicati nel tema
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          La scelta del dato viene prima della sua rappresentazione grafica.
        </p>
      </div>
      <div className="grid gap-3">
        {theme.datasets.map((dataset) => (
          <ThemeDatasetCard dataset={dataset} key={dataset.id} />
        ))}
      </div>
    </div>
  );
}

function ThemeDatasetCard({ dataset }: { dataset: OpenDataThemeDataset }) {
  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" className="shadow-none">
              {dataset.statusLabel}
            </Badge>
            <Badge variant="outline" className="shadow-none">
              {dataset.dataType}
            </Badge>
          </div>
          <h4 className="mt-3 font-display text-lg font-bold text-foreground">
            {dataset.label}
          </h4>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {dataset.description}
          </p>
        </div>
        {dataset.href ? (
          <a
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/30 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
            href={dataset.href}
          >
            Vai alla visualizzazione
            <ChevronRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-md border border-border bg-muted/20 p-3">
          <dt className="text-xs font-medium text-muted-foreground">Fonte</dt>
          <dd className="mt-1 leading-6 text-foreground">
            {dataset.sourceLabel}
          </dd>
        </div>
        <div className="rounded-md border border-border bg-muted/20 p-3">
          <dt className="text-xs font-medium text-muted-foreground">
            Aggiornamento
          </dt>
          <dd className="mt-1 leading-6 text-foreground">
            {dataset.updateCadence}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function ThemePreparationPanel({ theme }: { theme: OpenDataThemeCategory }) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Nessuna visualizzazione pubblicata per questo tema
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Il tema e gia presente nella libreria per ordinare i dataset futuri.
            La pagina non mostra grafici finche non esiste almeno un dataset
            pubblicato e documentato per questa categoria.
          </p>
        </div>
        <Badge variant="outline" className="w-fit shadow-none">
          {theme.statusLabel}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <dt className="text-xs font-medium text-muted-foreground">
            Domanda civica
          </dt>
          <dd className="mt-1 leading-6 text-foreground">
            {theme.civicQuestion}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <dt className="text-xs font-medium text-muted-foreground">
            Tipi di dato previsti
          </dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {theme.dataTypes.map((dataType) => (
              <span
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                key={dataType}
              >
                {dataType}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function DatasetCard({
  dataset,
  isUpdated = false,
}: {
  dataset: OpendataDataset;
  isUpdated?: boolean;
}) {
  const formats = useMemo(() => {
    const set = new Set<string>();
    (dataset.resources ?? []).forEach((r) => {
      if (r.format) set.add(r.format.toUpperCase());
    });
    return Array.from(set).sort();
  }, [dataset.resources]);

  return (
    <Link
      href={`/opendata/${dataset.id}`}
      data-tour="opendata-preview"
      className="group flex flex-col rounded-xl border border-card-border bg-card p-5 shadow-sm transition-colors hover-elevate hover:border-brand/40"
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {isUpdated ? (
          <Badge variant="success" className="text-[11px] shadow-none">
            <Sparkles className="mr-1 h-3 w-3" />
            Aggiornato
          </Badge>
        ) : null}
        {dataset.category ? (
          <Badge variant="brand" className="text-[11px] shadow-none">
            <Layers className="mr-1 h-3 w-3" />
            {dataset.category}
          </Badge>
        ) : null}
        {dataset.theme ? (
          <Badge variant="outline" className="text-[11px] shadow-none">
            <Tag className="mr-1 h-3 w-3" />
            {dataset.theme}
          </Badge>
        ) : null}
      </div>

      <h3 className="font-display font-bold leading-snug text-foreground line-clamp-2">
        {dataset.title}
      </h3>
      {dataset.description ? (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {dataset.description}
        </p>
      ) : null}

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {formats.map((f) => (
            <Badge
              key={f}
              variant="outline"
              className="font-mono text-[10px] shadow-none"
            >
              <FileSpreadsheet className="mr-1 h-3 w-3" />
              {f}
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="font-display font-bold tabular-nums text-foreground">
              {dataset.resourceCount}
            </span>{" "}
            {dataset.resourceCount === 1 ? "risorsa" : "risorse"}
            {dataset.metadataModified ? (
              <> · agg. {formatPublicTimeField(dataset.metadataModified)}</>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-0.5 font-medium text-primary group-hover:underline">
            Apri
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
