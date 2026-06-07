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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PUBLIC_API_BASE = "/api/public/v1";
const OPENAPI_URL = `${PUBLIC_API_BASE}/openapi.json`;
const MCP_ENDPOINT = "/api/mcp";

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

function absoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

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
        <Check className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
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
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
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
    return `${PUBLIC_API_BASE}${p}${query.length ? `?${query.join("&")}` : ""}`;
  }, [endpoint, values]);

  const fullUrl = absoluteUrl(builtPath);

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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
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
              <AlertCircle className="h-4 w-4 shrink-0" />
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

type CkanEndpoint = {
  title: string;
  example: string;
  description: string;
  params?: string;
};

const DCAT_ENDPOINTS: CkanEndpoint[] = [
  {
    title: "Catalogo DCAT-AP_IT",
    example: "/api/opendata/catalog.jsonld",
    description:
      "L'intero catalogo come metadati standard DCAT-AP_IT in formato JSON-LD, pronto per la federazione con dati.gov.it.",
  },
  {
    title: "Dataset DCAT-AP_IT",
    example: "/api/opendata/datasets/{id}/dcat.jsonld",
    description:
      "I metadati DCAT-AP_IT di un singolo dataset. {id} può essere lo slug o l'identificativo del dataset.",
  },
];

const CKAN_ENDPOINTS: CkanEndpoint[] = [
  {
    title: "package_list",
    example: "/api/3/action/package_list",
    description: "Elenco degli identificativi di tutti i dataset.",
  },
  {
    title: "package_search",
    example: "/api/3/action/package_search?q=bilancio&rows=10",
    description:
      "Ricerca dei dataset con envelope CKAN {help, success, result}.",
    params: "q · fq=groups:… · groups · rows · start",
  },
  {
    title: "package_show",
    example: "/api/3/action/package_show?id=",
    description:
      "Dettaglio di un dataset risolto per sourceId, slug o id numerico.",
    params: "id",
  },
  {
    title: "group_list",
    example: "/api/3/action/group_list",
    description: "Elenco dei gruppi tematici del catalogo.",
  },
  {
    title: "resource_show",
    example: "/api/3/action/resource_show?id=",
    description: "Dettaglio di una singola risorsa (file) di un dataset.",
    params: "id",
  },
];

type TransparencyDataset = {
  name: string;
  coverage:
    | "API pubblica + MCP"
    | "Sito/API di servizio"
    | "Sito o documentazione"
    | "Da valutare";
  dataKind:
    | "Dato ufficiale"
    | "Dato derivato"
    | "Dato arricchito"
    | "Dato misto";
  source: string;
  update: string;
  fields: string;
  access: string;
  limits: string;
};

const TRANSPARENCY_DATASETS: TransparencyDataset[] = [
  {
    name: "Atti e documenti dell'Albo Pretorio",
    coverage: "API pubblica + MCP",
    dataKind: "Dato misto",
    source:
      "Metadati e allegati provenienti da pubblicazioni amministrative; link alla fonte ufficiale quando disponibile.",
    update:
      "Segue le acquisizioni del portale; la pagina non introduce garanzie su completezza o tempestività.",
    fields:
      "id, progressivo, tipologia, categoria, provenienza, oggetto, date, registri, CUP, indicatori PNRR, allegati e stato del testo Markdown.",
    access:
      "REST: /api/public/v1/documents, /documents/{id}, /documents/{id}/markdown. MCP: search_documents, get_document, get_document_markdown.",
    limits:
      "Il Markdown è un arricchimento tecnico disponibile solo per alcuni allegati; i file firmati o non testuali possono richiedere verifica sulla fonte ufficiale.",
  },
  {
    name: "Contratti pubblici",
    coverage: "API pubblica + MCP",
    dataKind: "Dato misto",
    source:
      "Contratti censiti a partire da dati ANAC e collegamenti interni a temi di monitoraggio quando presenti.",
    update:
      "Aggiornamento legato alle procedure di importazione; eventuali scostamenti vanno verificati sulla fonte ufficiale.",
    fields:
      "id, titolo, descrizione, fornitore, importo, procedura, stato, CIG, CUP, stazione appaltante, link ANAC, tema, macrotema e coordinate se presenti.",
    access:
      "REST: /api/public/v1/contracts, /contracts/{id}. MCP: search_contracts, get_contract.",
    limits:
      "Macrotemi, collegamenti a temi e coordinate sono livelli derivati o arricchiti e non sostituiscono la documentazione di gara.",
  },
  {
    name: "Temi di monitoraggio",
    coverage: "API pubblica + MCP",
    dataKind: "Dato derivato",
    source:
      "Schede redazionali del portale costruite per raggruppare documenti e contratti pubblici rilevanti per la consultazione civica.",
    update:
      "Aggiornamento redazionale; non rappresenta una classificazione ufficiale dell'ente.",
    fields:
      "id, titolo, slug, sintesi, categoria, stato, contatori civici, data aggiornamento e contratti collegati nel dettaglio.",
    access:
      "REST: /api/public/v1/themes, /themes/{id}. MCP: list_themes, get_theme.",
    limits:
      "I collegamenti sono segnali di navigazione e monitoraggio, non valutazioni di responsabilità o irregolarità.",
  },
  {
    name: "Indicatori di performance",
    coverage: "API pubblica + MCP",
    dataKind: "Dato misto",
    source:
      "Categorie e indicatori con fonte dichiarata nei campi esposti dall'API quando disponibile.",
    update:
      "Dipende dalla disponibilità delle serie e dagli aggiornamenti importati; usare periodo e fonte per interpretare ogni valore.",
    fields:
      "categoria, indicatore, descrizione, unità, fonte, URL fonte, polarità, ultimo valore e valore precedente con periodo.",
    access: "REST: /api/public/v1/performance. MCP: list_performance.",
    limits:
      "Gli indicatori descrivono segnali e andamenti: non sono prove di qualità amministrativa né graduatorie ufficiali.",
  },
  {
    name: "Progetti PNRR",
    coverage: "API pubblica + MCP",
    dataKind: "Dato ufficiale",
    source:
      "Censimento Attuazione citato nella documentazione API, con link sorgente del progetto quando presente.",
    update:
      "Segue la disponibilità del censimento acquisito; stati e importi richiedono confronto con la scheda ufficiale più recente.",
    fields:
      "id, identificativo sorgente, URL, titolo, CUP, missione, componente, investimento, intervento, titolare, attuatore, importo, stato e date.",
    access: "REST: /api/public/v1/pnrr. MCP: list_pnrr.",
    limits:
      "La presenza in API facilita il riuso ma non certifica avanzamento, rendicontazione o completamento del progetto.",
  },
  {
    name: "Catalogo open data comunale",
    coverage: "Sito/API di servizio",
    dataKind: "Dato ufficiale",
    source:
      "Schede e risorse del catalogo open data comunale, ri-esposte come metadati DCAT-AP_IT e API compatibile CKAN.",
    update:
      "Dipende dagli snapshot e dai metadati del catalogo monitorato; ogni dataset può avere periodicità diversa.",
    fields:
      "titolo, descrizione, tema, categoria, titolare, licenza, frequenza, date metadato, risorse e URL del portale.",
    access:
      "Sito/API di servizio: /opendata, /api/opendata/catalog.jsonld, /api/3/action/package_search e endpoint CKAN/DCAT elencati sotto.",
    limits:
      "Non è incluso nella REST /api/public/v1 né nel MCP v0; le trasformazioni locali vanno confrontate con la scheda ufficiale del dataset.",
  },
  {
    name: "Feed e stato aggiornamenti",
    coverage: "Sito o documentazione",
    dataKind: "Dato derivato",
    source:
      "Sezioni pubbliche del sito dedicate a feed, avvisi e stato delle acquisizioni.",
    update:
      "Mostra informazioni di servizio quando disponibili; non costituisce uno SLA di aggiornamento.",
    fields:
      "stato fonte, conteggi, ultime acquisizioni o link a feed secondo la sezione consultata.",
    access:
      "Pagina pubblica: /feeds. Non documentato come risorsa /api/public/v1 o tool MCP v0.",
    limits:
      "Da usare come supporto alla verifica operativa, non come attestazione di completezza dei dati.",
  },
  {
    name: "Accesso civico, segnalazioni, beni confiscati, bandi e organi",
    coverage: "Da valutare",
    dataKind: "Dato misto",
    source:
      "Contenuti o sezioni citati nel perimetro informativo del sito, con sensibilità e granularità differenti.",
    update:
      "Non viene definita qui una frequenza unica; eventuale esposizione API richiede valutazione puntuale.",
    fields:
      "Variabili a seconda della sezione: richieste, schede, documenti, scadenze, soggetti pubblici o riferimenti amministrativi.",
    access:
      "Non esposti nella REST pubblica /api/public/v1 né nel MCP v0 sulla base della documentazione presente.",
    limits:
      "Possibile esclusione o rinvio per privacy, qualità dati, carico applicativo o prudenza civica; non vengono aggiunti nuovi endpoint in questa issue.",
  },
];

const REST_EXAMPLE = `curl "https://<host>/api/public/v1/documents?hasMarkdown=true&pageSize=5"`;

const MCP_EXAMPLE = `curl -X POST "https://<host>/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`;

function CoverageBadge({ value }: { value: TransparencyDataset["coverage"] }) {
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
            {dataset.name}
          </h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {dataset.dataKind}
          </p>
        </div>
        <CoverageBadge value={dataset.coverage} />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-foreground">Fonte</dt>
          <dd className="mt-1 text-muted-foreground">{dataset.source}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Aggiornamento</dt>
          <dd className="mt-1 text-muted-foreground">{dataset.update}</dd>
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
          <dd className="mt-1 text-muted-foreground">{dataset.limits}</dd>
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
      <UrlBox url={absoluteUrl(ep.example)} />
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
          <Code2 className="h-3.5 w-3.5" />
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
            <FileJson className="h-4 w-4 text-primary" />
            Specifica OpenAPI
          </div>
          <p className="text-xs text-muted-foreground">
            Definizione OpenAPI 3.1 leggibile dalle macchine.
          </p>
          <UrlBox url={absoluteUrl(OPENAPI_URL)} />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-card-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Braces className="h-4 w-4 text-primary" />
            Base dell'API
          </div>
          <p className="text-xs text-muted-foreground">
            Gli endpoint REST pubblici documentati sono relativi a questo
            indirizzo.
          </p>
          <UrlBox url={absoluteUrl(PUBLIC_API_BASE)} />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-card-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bot className="h-4 w-4 text-primary" />
            Server MCP
          </div>
          <p className="text-xs text-muted-foreground">
            Endpoint compatibile MCP per assistenti AI (POST).
          </p>
          <UrlBox url={absoluteUrl(MCP_ENDPOINT)} />
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
            <TransparencyDatasetCard key={dataset.name} dataset={dataset} />
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
              Chiamata generica al server MCP per elencare i tool disponibili,
              senza dipendenze da provider esterni.
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
            <AlertCircle className="h-4 w-4 shrink-0" />
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
          i portali nazionali.
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
