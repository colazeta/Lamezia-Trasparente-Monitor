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
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const PORTAL_URL = "https://opendata.comune.lamezia-terme.cz.it";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy, HH:mm", { locale: it });
}

export function Opendata() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");

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

  const { data: datasets, isLoading } = useListOpendataDatasets(filters);
  const { data: feedStatus } = useGetOpendataFeedStatus();

  // Derive the full category list from an unfiltered fetch so the dropdown is
  // stable regardless of the current search/category selection.
  const { data: allDatasets } = useListOpendataDatasets({});
  const categories = useMemo(() => {
    const set = new Set<string>();
    (allDatasets ?? []).forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allDatasets]);

  const hasActiveFilters = Boolean(debouncedSearch) || category !== "all";

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
  };

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
          Il catalogo dei dataset pubblicati dal{" "}
          <span className="font-medium text-foreground">
            Comune di Lamezia Terme
          </span>{" "}
          sul portale Opendata ufficiale. Esplora, cerca e consulta i dati
          aperti — con anteprima tabellare e grafici automatici per i file
          CSV e JSON, e download diretto delle risorse originali.
        </p>
      </div>

      {/* Last updated + portal link */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-card-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 text-brand" />
          <span>
            Ultimo aggiornamento:{" "}
            <span className="font-medium text-foreground">
              {formatDateTime(feedStatus?.lastUpdatedAt)}
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
      <div className="mb-4 text-sm text-muted-foreground">
        {datasets ? (
          <>
            <span className="font-display font-bold text-foreground tabular-nums">
              {datasets.length}
            </span>{" "}
            {datasets.length === 1 ? "dataset" : "dataset"}
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
      ) : datasets && datasets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <DatasetCard key={d.id} dataset={d} />
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

function DatasetCard({ dataset }: { dataset: OpendataDataset }) {
  const formats = useMemo(() => {
    const set = new Set<string>();
    dataset.resources.forEach((r) => {
      if (r.format) set.add(r.format.toUpperCase());
    });
    return Array.from(set).sort();
  }, [dataset.resources]);

  return (
    <Link
      href={`/opendata/${dataset.id}`}
      className="group flex flex-col rounded-xl border border-card-border bg-card p-5 shadow-sm transition-colors hover-elevate hover:border-brand/40"
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
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
              <> · agg. {formatDate(dataset.metadataModified)}</>
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
