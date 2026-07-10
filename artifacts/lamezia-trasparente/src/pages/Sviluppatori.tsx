import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Code2,
  Play,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  Braces,
  FileJson,
  Bot,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Database,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { absoluteApiUrl, apiUrl } from "@/lib/apiBaseUrl";
import { cn } from "@/lib/utils";
import {
  CKAN_ENDPOINTS,
  DCAT_ENDPOINTS,
  MCP_EXAMPLE,
  REST_EXAMPLE,
  TRANSPARENCY_DATASETS,
  type CkanEndpoint,
  type TransparencyDataset,
} from "@/data/apiTransparency";

const PUBLIC_API_BASE = "/api/public/v1";
const OPENAPI_URL = apiUrl(`${PUBLIC_API_BASE}/openapi.json`);
const MCP_ENDPOINT = apiUrl("/api/mcp");

type OpenApiParam = {
  name: string;
  in: "query" | "path";
  description?: string;
  required?: boolean;
  schema?: { type?: string | string[]; enum?: string[]; default?: unknown };
};

type Endpoint = {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: OpenApiParam[];
};

type OpenApiSpec = {
  info?: { title?: string; version?: string; description?: string };
  tags?: { name: string; description?: string }[];
  paths?: Record<
    string,
    Record<
      string,
      {
        operationId?: string;
        summary?: string;
        description?: string;
        tags?: string[];
        parameters?: OpenApiParam[];
      }
    >
  >;
};

function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => setCopied(false));
  };
  return [copied, copy];
}

function CopyButton({ text }: { text: string }) {
  const [copied, copy] = useCopy();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => copy(text)}
      aria-label={copied ? "Copiato" : "Copia"}
      className="h-7 w-7 shrink-0 text-muted-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}

function UrlBox({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
        {url}
      </code>
      <CopyButton text={url} />
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground"
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Apri in una nuova scheda"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </Button>
    </div>
  );
}

function CodeExample({ label, code }: { label: string; code: string }) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-primary/10 text-primary border-primary/20",
  POST: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
};

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const method = endpoint.method.toUpperCase();

  const builtPath = useMemo(() => {
    let p = endpoint.path;
    for (const param of endpoint.parameters) {
      if (param.in === "path") {
        const v = values[param.name]?.trim();
        p = p.replace(
          `{${param.name}}`,
          v ? encodeURIComponent(v) : `{${param.name}}`,
        );
      }
    }
    const query = endpoint.parameters
      .filter((param) => param.in === "query" && values[param.name]?.trim())
      .map(
        (param) =>
          `${encodeURIComponent(param.name)}=${encodeURIComponent(values[param.name].trim())}`,
      );
    return apiUrl(
      `${PUBLIC_API_BASE}${p}${query.length ? `?${query.join("&")}` : ""}`,
    );
  }, [endpoint, values]);

  const fullUrl = absoluteApiUrl(builtPath);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setStatus(null);
    try {
      const res = await fetch(builtPath, {
        method,
        headers: { Accept: "application/json" },
      });
      setStatus(res.status);
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Richiesta non riuscita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover-elevate"
        aria-expanded={open}
      >
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 font-mono text-[11px] shadow-none",
            METHOD_STYLES[method] ?? "",
          )}
        >
          {method}
        </Badge>
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
          {endpoint.path}
        </code>
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          {endpoint.summary}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {endpoint.summary && (
            <p className="text-sm font-medium text-foreground sm:hidden">
              {endpoint.summary}
            </p>
          )}
          {endpoint.description && (
            <p className="text-sm text-muted-foreground">
              {endpoint.description}
            </p>
          )}

          {endpoint.parameters.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Parametri
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {endpoint.parameters.map((param) => {
                  const type = Array.isArray(param.schema?.type)
                    ? param.schema?.type.join(" | ")
                    : param.schema?.type;
                  return (
                    <label key={param.name} className="block space-y-1">
                      <span className="flex items-center gap-1.5 text-xs">
                        <code className="font-mono font-semibold text-foreground">
                          {param.name}
                        </code>
                        <span className="text-muted-foreground">
                          {param.in}
                          {type ? ` · ${type}` : ""}
                        </span>
                        {param.required && (
                          <span className="text-brand">obbligatorio</span>
                        )}
                      </span>
                      <Input
                        value={values[param.name] ?? ""}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [param.name]: e.target.value,
                          }))
                        }
                        placeholder={
                          param.schema?.enum
                            ? param.schema.enum.join(" | ")
                            : (param.description ?? "")
                        }
                        className="h-9 font-mono text-xs"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <UrlBox url={fullUrl} />

          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={run} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              Esegui
            </Button>
            {status !== null && (
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[11px] shadow-none",
                  status >= 200 && status < 300
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-destructive/20 bg-destructive/10 text-destructive",
                )}
              >
                HTTP {status}
              </Badge>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {response !== null && (
            <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground">
              {response}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function CoverageBadge({
  value,
}: {
  value: TransparencyDataset["coverageStatus"];
}) {
  const style =
    value === "API pubblica + MCP"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : value === "Sito/API di servizio"
        ? "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400"
        : value === "Sito o documentazione"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "border-muted-foreground/20 bg-muted/60 text-muted-foreground";

  return (
    <Badge variant="outline" className={cn("w-fit shadow-none", style)}>
      {value}
    </Badge>
  );
}

function TransparencyDatasetCard({
  dataset,
}: {
  dataset: TransparencyDataset;
}) {
  return (
    <article className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-base font-bold tracking-tight text-foreground">
            {dataset.datasetName}
          </h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {dataset.dataKindLabel}
          </p>
        </div>
        <CoverageBadge value={dataset.coverageStatus} />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-foreground">Fonte</dt>
          <dd className="mt-1 text-muted-foreground">{dataset.sourceNote}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Aggiornamento</dt>
          <dd className="mt-1 text-muted-foreground">
            {dataset.updateCadenceNote}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Campi principali</dt>
          <dd className="mt-1 text-muted-foreground">{dataset.fields}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Accesso documentato</dt>
          <dd className="mt-1 text-muted-foreground">{dataset.access}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-foreground">Limiti noti</dt>
          <dd className="mt-1 text-muted-foreground">{dataset.knownLimits}</dd>
        </div>
      </dl>
    </article>
  );
}

function CkanCard({ ep }: { ep: CkanEndpoint }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <code className="font-mono text-sm font-semibold text-foreground">
          {ep.title}
        </code>
        {ep.params && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {ep.params}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{ep.description}</p>
      <UrlBox url={absoluteApiUrl(ep.example)} />
    </div>
  );
}

export function Sviluppatori() {
  const [spec, setSpec] = useState<OpenApiSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(OPENAPI_URL, { headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: OpenApiSpec) => {
        if (active) {
          setSpec(data);
          setLoadError(false);
        }
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const endpoints = useMemo<Endpoint[]>(() => {
    if (!spec?.paths) return [];
    const list: Endpoint[] = [];
    for (const [path, methods] of Object.entries(spec.paths)) {
      if (!methods || typeof methods !== "object") continue;
      for (const [method, op] of Object.entries(methods)) {
        // L'API pubblica è in sola lettura: esponiamo solo gli endpoint GET.
        if (method.toLowerCase() !== "get") continue;
        if (!op || typeof op !== "object") continue;
        list.push({
          path,
          method,
          operationId: op.operationId,
          summary: op.summary,
          description: op.description,
          tags: op.tags ?? ["altro"],
          parameters: op.parameters ?? [],
        });
      }
    }
    return list;
  }, [spec]);

  const grouped = useMemo(() => {
    const tagOrder = (spec?.tags ?? []).map((t) => t.name);
    const map = new Map<string, Endpoint[]>();
    for (const ep of endpoints) {
      const tag = ep.tags[0] ?? "altro";
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(ep);
    }
    const tagDesc = new Map(
      (spec?.tags ?? []).map((t) => [t.name, t.description] as const),
    );
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        const ia = tagOrder.indexOf(a);
        const ib = tagOrder.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      })
      .map(([tag, eps]) => ({
        tag,
        description: tagDesc.get(tag),
        endpoints: eps,
      }));
  }, [endpoints, spec]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header */}
      <div data-tour="api-intro" className="mb-6">
        <span className="eyebrow text-primary">
          <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
          Per sviluppatori, giornalisti e ricercatori
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          API e riuso dei dati
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
          Alcune risorse civiche documentate dalla piattaforma sono
          interrogabili tramite superfici pubbliche di lettura: REST, MCP e
          catalogo open data. Questa pagina chiarisce copertura, limiti e
          differenze tra dati ufficiali, derivati e arricchiti senza presentare
          il catalogo come completo.
        </p>
      </div>

      {/* Quick links */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-xl border border-card-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileJson className="h-4 w-4 text-primary" aria-hidden="true" />
            Specifica OpenAPI
          </div>
          <p className="text-xs text-muted-foreground">
            Definizione OpenAPI 3.1 leggibile dalle macchine.
          </p>
          <UrlBox url={absoluteApiUrl(OPENAPI_URL)} />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-card-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Braces className="h-4 w-4 text-primary" aria-hidden="true" />
            Base dell'API
          </div>
          <p className="text-xs text-muted-foreground">
            Gli endpoint REST pubblici documentati sono relativi a questo
            indirizzo.
          </p>
          <UrlBox url={absoluteApiUrl(PUBLIC_API_BASE)} />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-card-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
            Server MCP
          </div>
          <p className="text-xs text-muted-foreground">
            Endpoint compatibile MCP per assistenti AI (POST).
          </p>
          <UrlBox url={absoluteApiUrl(MCP_ENDPOINT)} />
        </div>
      </div>

      {/* API / dataset transparency */}
      <section className="mb-12 rounded-2xl border border-card-border bg-muted/20 p-5 md:p-6">
        <div className="mb-5">
          <span className="eyebrow text-primary">API Transparency Hub</span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
            Copertura API pubblica e dataset
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            La tabella distingue le risorse esposte nella REST pubblica
            <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">
              /api/public/v1
            </code>
            e nel server MCP dalle sezioni disponibili solo nel sito o tramite
            API di servizio. Le informazioni riusano la documentazione API, la
            specifica OpenAPI e le pagine pubbliche esistenti: non aggiungono
            promesse su completezza, freschezza o copertura.
          </p>
          <p className="mt-2 max-w-3xl text-xs text-muted-foreground">
            Nota di manutenzione: il catalogo ripetibile è centralizzato in
            <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
              src/data/apiTransparency.ts
            </code>
            e un controllo Vitest verifica gli endpoint e i tool principali
            rispetto a PUBLIC_API.md.
          </p>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Dato ufficiale
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Informazione proveniente da una fonte pubblica istituzionale o da
              una banca dati indicata dalla documentazione. Va comunque
              verificata sulla fonte quando serve valore ufficiale.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Dato derivato
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Organizzazione, raggruppamento o indicatore creato dal portale per
              facilitare consultazione e monitoraggio civico. Non è una
              classificazione ufficiale dell'ente.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Dato arricchito
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Metadati tecnici, testo Markdown, collegamenti tematici o
              coordinate aggiunti per ricerca e accessibilità. Richiedono
              controllo sul documento originale in caso di dubbio.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Link
            href="/fonti-dati"
            className="font-medium text-primary hover:underline"
          >
            Fonti dati
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/metodologia"
            className="font-medium text-primary hover:underline"
          >
            Metodologia
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/note-legali"
            className="font-medium text-primary hover:underline"
          >
            Note legali
          </Link>
        </div>

        <div className="grid gap-4">
          {TRANSPARENCY_DATASETS.map((dataset) => (
            <TransparencyDatasetCard
              key={dataset.datasetName}
              dataset={dataset}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <h3 className="font-display text-base font-bold tracking-tight">
              Esempio REST minimale
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Richiesta in sola lettura verso un elenco documentato della REST
              pubblica.
            </p>
            <pre className="mt-3 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground">
              {REST_EXAMPLE}
            </pre>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <h3 className="font-display text-base font-bold tracking-tight">
              Esempio MCP minimale
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Chiamata generica al server MCP per elencare i tool disponibili.
              L'endpoint è stateless: non richiede Authorization, ma l'esempio
              include gli header Content-Type e Accept richiesti dal trasporto.
            </p>
            <pre className="mt-3 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground">
              {MCP_EXAMPLE}
            </pre>
          </div>
        </div>
      </section>

      {/* Interactive explorer */}
      <section className="mb-12">
        <h2 className="mb-1 font-display text-xl font-bold tracking-tight">
          Esploratore API
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {spec?.info?.description ??
            "Espandi un endpoint, compila i parametri e premi «Esegui» per vedere la risposta live."}
        </p>

        {loading ? (
          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
          </div>
        ) : loadError ? (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Impossibile caricare la specifica dell'API. Riprova più tardi oppure
            consulta la specifica grezza.
          </div>
        ) : (
          <div data-tour="api-docs" className="space-y-8">
            {grouped.map((group) => (
              <div key={group.tag}>
                <div className="mb-3">
                  <h3 className="font-display text-base font-bold capitalize tracking-tight text-foreground">
                    {group.tag}
                  </h3>
                  {group.description && (
                    <p className="text-xs text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {group.endpoints.map((ep) => (
                    <EndpointCard
                      key={`${ep.method}-${ep.path}`}
                      endpoint={ep}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DCAT-AP_IT / CKAN section */}
      <section className="mb-8">
        <h2 className="mb-1 font-display text-xl font-bold tracking-tight">
          Catalogo Opendata: DCAT-AP_IT e API CKAN
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Il catalogo dei dataset è esposto con metadati standard DCAT-AP_IT e
          un'API di lettura compatibile CKAN, per il riuso e la federazione con
          i portali nazionali. Gli esempi con parentesi graffe richiedono la
          sostituzione del placeholder con valori restituiti dal catalogo.
        </p>

        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Metadati DCAT-AP_IT (JSON-LD)
        </h3>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {DCAT_ENDPOINTS.map((ep) => (
            <CkanCard key={ep.example} ep={ep} />
          ))}
        </div>

        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          API CKAN (Action API)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {CKAN_ENDPOINTS.map((ep) => (
            <CkanCard key={ep.example} ep={ep} />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="rounded-xl border border-card-border bg-muted/30 p-4 text-sm text-muted-foreground">
        I dati sono raccolti da fonti pubbliche e offerti per il riuso. Cerchi
        aggiornamenti automatici? Consulta la pagina{" "}
        <Link
          href="/feeds"
          className="font-medium text-primary hover:underline"
        >
          Feed e abbonamenti
        </Link>
        .
      </div>
    </div>
  );
}
