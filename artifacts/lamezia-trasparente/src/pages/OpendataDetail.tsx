import { useState } from "react";
import { Link, useRoute } from "wouter";
import {
  useGetOpendataDataset,
  type OpendataResource,
} from "@workspace/api-client-react";
import {
  Database,
  ExternalLink,
  Download,
  ChevronLeft,
  Layers,
  Tag,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  ScrollText,
  Building2,
  Table2,
  ChevronDown,
  Share2,
  Braces,
  FileJson,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ResourceTable } from "@/components/opendata/ResourceTable";
import { apiUrl } from "@/lib/apiBaseUrl";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

export function OpendataDetail() {
  const [, params] = useRoute("/opendata/:id");
  const id = params?.id ? Number(params.id) : NaN;
  const { data: dataset, isLoading, isError } = useGetOpendataDataset(id);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <Link
        href="/opendata"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Torna al catalogo
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-40 w-full mt-6" />
        </div>
      ) : isError || !dataset ? (
        <Empty className="border border-dashed border-border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
              <Database className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle className="font-display">
              Dataset non trovato
            </EmptyTitle>
            <EmptyDescription>
              Il dataset richiesto non è disponibile. Torna al catalogo per
              consultare gli altri dataset pubblicati.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {dataset.category ? (
                <Badge variant="brand" className="shadow-none">
                  <Layers className="mr-1 h-3 w-3" />
                  {dataset.category}
                </Badge>
              ) : null}
              {dataset.theme ? (
                <Badge variant="outline" className="shadow-none">
                  <Tag className="mr-1 h-3 w-3" />
                  {dataset.theme}
                </Badge>
              ) : null}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              {dataset.title}
            </h1>
            {dataset.description ? (
              <p className="mt-3 whitespace-pre-line text-muted-foreground text-lg max-w-3xl">
                {dataset.description}
              </p>
            ) : null}
          </div>

          {/* Metadata + portal link */}
          <div className="mb-8 grid gap-4 rounded-xl border border-card-border bg-muted/30 p-5 sm:grid-cols-2">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 sm:col-span-2">
              <MetaRow
                label="Risorse"
                value={String(dataset.resourceCount)}
                icon={FileSpreadsheet}
              />
              <MetaRow
                label="Aggiornamento"
                value={formatDate(dataset.metadataModified)}
                icon={RefreshCw}
              />
              <MetaRow
                label="Frequenza"
                value={dataset.frequency}
                icon={Calendar}
              />
              <MetaRow
                label="Titolare"
                value={dataset.holderName}
                icon={Building2}
              />
              <MetaRow
                label="Licenza"
                value={dataset.licenseTitle ?? dataset.licenseId}
                icon={ScrollText}
              />
            </dl>
            {dataset.tags && dataset.tags.length > 0 ? (
              <div className="sm:col-span-2">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tag
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dataset.tags.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="text-[11px] shadow-none"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {dataset.portalUrl ? (
              <div className="sm:col-span-2 border-t border-border/60 pt-4">
                <a
                  href={dataset.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Scheda ufficiale sul portale Opendata
                </a>
              </div>
            ) : null}
          </div>

          {/* Interoperabilità: metadati DCAT-AP_IT e API CKAN */}
          <InteropLinks
            dcatUrl={apiUrl(`/api/opendata/datasets/${dataset.id}/dcat.jsonld`)}
            apiUrl={apiUrl(
              `/api/3/action/package_show?id=${encodeURIComponent(dataset.sourceId)}`,
            )}
          />

          {/* Resources */}
          <div className="mb-4 flex items-center gap-2">
            <Table2 className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-display font-bold tracking-tight">
              Risorse
            </h2>
          </div>
          <div className="space-y-4">
            {dataset.resources.map((r) => (
              <ResourceItem key={r.id} resource={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ResourceItem({ resource }: { resource: OpendataResource }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-bold text-foreground">
              {resource.name}
            </h3>
            {resource.format ? (
              <Badge
                variant="outline"
                className="font-mono text-[10px] shadow-none"
              >
                <FileSpreadsheet className="mr-1 h-3 w-3" />
                {resource.format.toUpperCase()}
              </Badge>
            ) : null}
            {resource.tabular ? (
              <Badge variant="brand" className="text-[10px] shadow-none">
                Anteprima disponibile
              </Badge>
            ) : null}
          </div>
          {resource.description ? (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {resource.description}
            </p>
          ) : null}
          {resource.lastModified ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Aggiornata il {formatDate(resource.lastModified)}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {resource.tabular ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <Table2 className="mr-1.5 h-4 w-4" />
              {open ? "Nascondi" : "Anteprima"}
              <ChevronDown
                className={`ml-1 h-4 w-4 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </Button>
          ) : null}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Scarica
            </Button>
          </a>
        </div>
      </div>

      {resource.tabular && open ? (
        <div className="border-t border-border/60 p-5">
          <ResourceTable resourceId={resource.id} />
        </div>
      ) : null}
    </div>
  );
}

function InteropLinks({
  dcatUrl,
  apiUrl,
}: {
  dcatUrl: string;
  apiUrl: string;
}) {
  return (
    <div className="mb-8 rounded-xl border border-card-border bg-muted/30 p-5">
      <div className="mb-1 flex items-center gap-2">
        <Share2 className="h-4 w-4 text-brand" />
        <h2 className="text-sm font-display font-bold tracking-tight">
          Interoperabilità e riuso
        </h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Metadati standard e API aperta per il riuso del dataset da parte di
        terzi (giornalisti, sviluppatori, altre PA).
      </p>
      <div className="flex flex-wrap gap-2">
        <a href={dcatUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <FileJson className="mr-1.5 h-4 w-4" />
            Metadati DCAT-AP_IT
            <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
          </Button>
        </a>
        <a href={apiUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <Braces className="mr-1.5 h-4 w-4" />
            API CKAN (package_show)
            <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
          </Button>
        </a>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
