import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  useGetOpendataFeedStatus,
  useListOpendataDatasets,
  type OpendataDataset,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Braces,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  Landmark,
  Search,
} from "lucide-react";

import { OpenDataThemeLibrary } from "@/components/opendata/OpenDataThemeLibrary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LAMEZIA_OPEN_DATA_SERIES_BY_ID } from "@/data/lameziaOpenDataSeriesStatus";
import {
  OPEN_DATA_THEME_LIBRARY,
  type OpenDataThemeCategory,
  type OpenDataThemeDataset,
} from "@/data/opendataThemeCategories";
import { apiUrl } from "@/lib/apiBaseUrl";
import { formatPublicTimeField } from "@/lib/time";

const PORTAL_URL = "https://opendata.comune.lamezia-terme.cz.it";

const AirTrafficDatasetCard = lazy(async () => ({
  default: (await import("@/components/opendata/AirTrafficDatasetCard"))
    .AirTrafficDatasetCard,
}));
const ClimateTerritoryDatasetCard = lazy(async () => ({
  default: (await import("@/components/opendata/ClimateTerritoryDatasetCard"))
    .ClimateTerritoryDatasetCard,
}));
const DemographicTrendDatasetCard = lazy(async () => ({
  default: (await import("@/components/opendata/DemographicTrendDatasetCard"))
    .DemographicTrendDatasetCard,
}));
const FamiliesChildrenDatasetCard = lazy(async () => ({
  default: (await import("@/components/opendata/FamiliesChildrenDatasetCard"))
    .FamiliesChildrenDatasetCard,
}));
const ForeignResidentsDatasetCard = lazy(async () => ({
  default: (await import("@/components/opendata/ForeignResidentsDatasetCard"))
    .ForeignResidentsDatasetCard,
}));

type OpenDataArchiveItem = {
  theme: OpenDataThemeCategory;
  dataset: OpenDataThemeDataset;
};

type OpenDataArchiveSelection = {
  themeId: string | null;
  datasetId: string | null;
};

function getArchiveItems(): OpenDataArchiveItem[] {
  return OPEN_DATA_THEME_LIBRARY.flatMap((theme) =>
    theme.datasets.map((dataset) => ({ theme, dataset })),
  );
}

function readOpenDataArchiveSelection(): OpenDataArchiveSelection {
  if (typeof window === "undefined") {
    return { themeId: null, datasetId: null };
  }

  const params = new URLSearchParams(window.location.search);
  const requestedDatasetId = params.get("dataset");
  const requestedThemeId = params.get("tema");
  const archiveItems = getArchiveItems();
  const datasetMatch = archiveItems.find(
    (item) => item.dataset.id === requestedDatasetId,
  );

  if (datasetMatch) {
    return {
      themeId: datasetMatch.theme.id,
      datasetId: datasetMatch.dataset.id,
    };
  }

  const themeMatch = OPEN_DATA_THEME_LIBRARY.find(
    (theme) => theme.id === requestedThemeId,
  );
  return {
    themeId: themeMatch?.id ?? null,
    datasetId: null,
  };
}

function writeOpenDataArchiveSelection(
  themeId: string | null,
  datasetId: string | null,
) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (themeId) url.searchParams.set("tema", themeId);
  else url.searchParams.delete("tema");
  if (datasetId) url.searchParams.set("dataset", datasetId);
  else url.searchParams.delete("dataset");

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function Opendata() {
  const [initialSelection] = useState(readOpenDataArchiveSelection);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(
    initialSelection.themeId,
  );
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    initialSelection.datasetId,
  );
  const [catalogSearch, setCatalogSearch] = useState("");
  const [debouncedCatalogSearch, setDebouncedCatalogSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedCatalogSearch(catalogSearch.trim()),
      250,
    );
    return () => window.clearTimeout(timeout);
  }, [catalogSearch]);

  const archiveItems = useMemo(getArchiveItems, []);
  const selectedArchiveItem =
    archiveItems.find((item) => item.dataset.id === selectedDatasetId) ?? null;
  const selectedTheme = selectedThemeId
    ? OPEN_DATA_THEME_LIBRARY.find((theme) => theme.id === selectedThemeId) ??
      null
    : null;
  const visibleArchiveItems = selectedThemeId
    ? archiveItems.filter((item) => item.theme.id === selectedThemeId)
    : archiveItems;

  const catalogFilters = useMemo(
    () =>
      debouncedCatalogSearch
        ? { search: debouncedCatalogSearch }
        : ({} as Record<string, string>),
    [debouncedCatalogSearch],
  );
  const { data: catalogResponse, isLoading: isCatalogLoading } =
    useListOpendataDatasets(catalogFilters);
  const catalogDatasets: OpendataDataset[] = Array.isArray(catalogResponse)
    ? catalogResponse
    : [];
  const { data: feedStatus } = useGetOpendataFeedStatus();

  const selectTheme = (themeId: string | null) => {
    setSelectedThemeId(themeId);
    setSelectedDatasetId(null);
    writeOpenDataArchiveSelection(themeId, null);
  };

  const selectDataset = (datasetId: string) => {
    const item = archiveItems.find((entry) => entry.dataset.id === datasetId);
    if (!item) return;
    setSelectedThemeId(item.theme.id);
    setSelectedDatasetId(item.dataset.id);
    writeOpenDataArchiveSelection(item.theme.id, item.dataset.id);
  };

  const closeDataset = () => {
    setSelectedDatasetId(null);
    writeOpenDataArchiveSelection(selectedThemeId, null);
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="mb-6">
        <span className="eyebrow text-primary">
          <Database className="h-3.5 w-3.5" />
          Dati pubblici
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Open Data
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground md:text-lg">
          Esplora dati su popolazione, clima e mobilità.
        </p>
      </header>

      {selectedArchiveItem ? (
        <DatasetDetailView item={selectedArchiveItem} onBack={closeDataset} />
      ) : (
        <>
          <OpenDataThemeLibrary
            onSelectTheme={selectTheme}
            selectedThemeId={selectedThemeId}
          />

          <CuratedDatasetList
            items={visibleArchiveItems}
            onOpenDataset={selectDataset}
            onResetTheme={() => selectTheme(null)}
            selectedTheme={selectedTheme}
          />

          <MunicipalCatalog
            datasets={catalogDatasets}
            feedStatus={feedStatus}
            isLoading={isCatalogLoading}
            onSearch={setCatalogSearch}
            search={catalogSearch}
          />
        </>
      )}
    </main>
  );
}

function CuratedDatasetList({
  items,
  onOpenDataset,
  onResetTheme,
  selectedTheme,
}: {
  items: OpenDataArchiveItem[];
  onOpenDataset: (datasetId: string) => void;
  onResetTheme: () => void;
  selectedTheme: OpenDataThemeCategory | null;
}) {
  if (items.length === 0) {
    return (
      <section className="mb-8 rounded-xl border border-dashed border-border bg-muted/20 p-5">
        <h2 className="font-display text-lg font-bold text-foreground">
          Nessun dataset pubblicato in questo tema
        </h2>
        <Button className="mt-3" onClick={onResetTheme} variant="outline">
          Mostra i dataset disponibili
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="opendata-datasets-title" className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          className="font-display text-xl font-bold text-foreground"
          id="opendata-datasets-title"
        >
          Dataset
        </h2>
        <span className="text-sm text-muted-foreground">
          {selectedTheme?.shortLabel ?? "Tutti"} · {items.length}
        </span>
      </div>

      <ul
        className="divide-y divide-border overflow-hidden rounded-xl border border-card-border bg-card"
        role="list"
      >
        {items.map((item) => {
          const status = LAMEZIA_OPEN_DATA_SERIES_BY_ID.get(item.dataset.id);
          return (
            <li key={item.dataset.id}>
              <button
                aria-label={`Apri scheda dataset ${item.dataset.label}`}
                className="group grid w-full gap-3 p-4 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:grid-cols-[1fr_auto] sm:items-center"
                onClick={() => onOpenDataset(item.dataset.id)}
                type="button"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileSpreadsheet className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                      {item.dataset.label}
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>{item.theme.shortLabel}</span>
                      {status ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            Ultimo dato: {status.latest_observation_label}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
                <span className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground sm:w-auto">
                  Apri
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DatasetDetailView({
  item,
  onBack,
}: {
  item: OpenDataArchiveItem;
  onBack: () => void;
}) {
  const status = LAMEZIA_OPEN_DATA_SERIES_BY_ID.get(item.dataset.id);

  return (
    <section aria-labelledby="opendata-dataset-detail-title" className="space-y-5">
      <Button onClick={onBack} type="button" variant="ghost">
        <ArrowLeft className="h-4 w-4" />
        Torna ai dataset
      </Button>

      <header className="border-b border-border pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {item.theme.shortLabel}
        </p>
        <h2
          className="mt-1 font-display text-2xl font-bold text-foreground"
          id="opendata-dataset-detail-title"
        >
          {item.dataset.label}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {item.dataset.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{item.dataset.sourceLabel}</span>
          {status ? (
            <span>Ultimo dato: {status.latest_observation_label}</span>
          ) : null}
          <span>{item.dataset.updateCadence}</span>
        </div>
      </header>

      <Suspense
        fallback={
          <div
            className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-card p-6 text-sm font-semibold text-muted-foreground"
            role="status"
          >
            Caricamento dataset…
          </div>
        }
      >
        {item.dataset.detailKind === "climate-daily" ? (
          <ClimateTerritoryDatasetCard />
        ) : item.dataset.detailKind === "air-traffic-monthly" ? (
          <AirTrafficDatasetCard />
        ) : item.dataset.detailKind === "demographic-trend" ? (
          <DemographicTrendDatasetCard />
        ) : item.dataset.detailKind === "foreign-residents-age-sex" ? (
          <ForeignResidentsDatasetCard />
        ) : item.dataset.detailKind === "families-children" ? (
          <FamiliesChildrenDatasetCard />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
            Visualizzazione non ancora disponibile per questo dataset.
          </div>
        )}
      </Suspense>
    </section>
  );
}

function MunicipalCatalog({
  datasets,
  feedStatus,
  isLoading,
  onSearch,
  search,
}: {
  datasets: OpendataDataset[];
  feedStatus: { lastUpdatedAt?: string | null; itemsTotal?: number | null; url?: string | null } | undefined;
  isLoading: boolean;
  onSearch: (value: string) => void;
  search: string;
}) {
  return (
    <details className="rounded-xl border border-border bg-muted/15">
      <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
        Catalogo completo del Comune
      </summary>
      <div className="border-t border-border p-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Ultima sincronizzazione:{" "}
            <strong className="font-semibold text-foreground">
              {formatPublicTimeField(
                feedStatus?.lastUpdatedAt,
                "dd MMM yyyy, HH:mm",
              )}
            </strong>
            {feedStatus?.itemsTotal ? ` · ${feedStatus.itemsTotal} dataset` : ""}
          </span>
          <a
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            href={feedStatus?.url || PORTAL_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Landmark className="h-4 w-4" />
            Portale comunale
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <label className="relative mt-4 block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <span className="sr-only">Cerca nel catalogo comunale</span>
          <Input
            className="h-10 bg-background pl-9"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Cerca nel catalogo"
            type="search"
            value={search}
          />
        </label>

        {isLoading ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-20 rounded-lg" key={index} />
            ))}
          </div>
        ) : datasets.length > 0 ? (
          <div data-tour="opendata-catalog" className="mt-4 grid gap-2 sm:grid-cols-2">
            {datasets.map((dataset) => (
              <CatalogDatasetLink dataset={dataset} key={dataset.id} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Nessun dataset corrisponde alla ricerca.
          </p>
        )}

        <details className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-foreground">
            API e riuso dei dati
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={apiUrl("/api/opendata/catalog.jsonld")}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button size="sm" variant="outline">
                <FileJson className="h-4 w-4" />
                DCAT-AP_IT
              </Button>
            </a>
            <a
              href={apiUrl("/api/3/action/package_search")}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button size="sm" variant="outline">
                <Braces className="h-4 w-4" />
                API CKAN
              </Button>
            </a>
            <Link href="/sviluppatori">
              <Button size="sm" variant="outline">
                <Code2 className="h-4 w-4" />
                Sviluppatori
              </Button>
            </Link>
          </div>
        </details>
      </div>
    </details>
  );
}

function CatalogDatasetLink({ dataset }: { dataset: OpendataDataset }) {
  return (
    <Link
      className="group rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
      data-tour="opendata-preview"
      href={`/opendata/${dataset.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-foreground">
            {dataset.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dataset.category || dataset.theme || "Dataset comunale"}
            {dataset.metadataModified
              ? ` · ${formatPublicTimeField(dataset.metadataModified)}`
              : ""}
          </p>
        </div>
        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      </div>
    </Link>
  );
}
