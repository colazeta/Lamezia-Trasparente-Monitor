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
import { cn } from "@/lib/utils";

const PUBLIC_API_BASE = "/api/public/v1";
const OPENAPI_URL = `${PUBLIC_API_BASE}/openapi.json`;
const MCP_ENDPOINT = "/api/mcp";

type DatasetTransparencyItem = {
  name: string;
  dataKind: string;
  description: string;
  provenance: string;
  updateFrequency: string;
  fields: string[];
  endpoints: string[];
  mcpTools: string[];
  limitations: string;
};

const DATASET_TRANSPARENCY: DatasetTransparencyItem[] = [
  {
    name: "Atti dell'Albo Pretorio e pubblicazioni collegate",
    dataKind: "Dato ufficiale con estrazioni documentali best-effort",
    description:
      "Schede di pubblicazione amministrativa con metadati, allegati e, quando disponibile, testo Markdown estratto dall'allegato principale.",
    provenance:
      "Registro Albo Pretorio e documenti pubblicati dal Comune; la documentazione dell'API pubblica indica link ufficiale e copia archiviata degli allegati quando disponibili.",
    updateFrequency:
      "Dipende dal feed pubblico e dalla disponibilità degli allegati; la documentazione non consente di assumere completezza o freschezza per ogni categoria.",
    fields: [
      "id/progressivo",
      "oggetto",
      "tipologia e categoria",
      "date di pubblicazione",
      "allegati e URL ufficiali",
      "markdownSource/markdownExtractedAt dove presenti",
    ],
    endpoints: [
      "GET /documents",
      "GET /documents/{id}",
      "GET /documents/{id}/markdown",
    ],
    mcpTools: ["search_documents", "get_document", "get_document_markdown"],
    limitations:
      "L'estrazione Markdown riguarda gli atti con PDF non firmato ed è best-effort; gli allegati firmati .p7m non sono elaborati. Ogni lettura deve restare collegata al documento originale.",
  },
  {
    name: "Contratti pubblici",
    dataKind: "Dato ufficiale normalizzato e arricchito",
    description:
      "Elenco e dettagli dei contratti pubblici consultabili per testo, fornitore, procedura, importi, periodo e collegamenti tematici.",
    provenance:
      "Dati ANAC indicati nella documentazione di progetto, con normalizzazioni editoriali come macrotema o geolocalizzazione quando presenti.",
    updateFrequency:
      "Legata al feed ANAC e agli eventuali arricchimenti editoriali; lo stato puntuale va verificato dagli endpoint di feed/status o dalle fonti ufficiali.",
    fields: [
      "id e CIG",
      "titolo/descrizione",
      "fornitore",
      "tipo procedura",
      "importo",
      "data aggiudicazione",
      "macrotema e collegamenti",
    ],
    endpoints: ["GET /contracts", "GET /contracts/{id}"],
    mcpTools: ["search_contracts", "get_contract"],
    limitations:
      "Importi, procedure e collegamenti devono essere verificati rispetto alla scheda ANAC o agli atti collegati. Le categorie civiche sono supporti di lettura, non valutazioni di regolarità.",
  },
  {
    name: "Temi di monitoraggio",
    dataKind: "Dato derivato/editoriale",
    description:
      "Raccolte tematiche che collegano descrizioni, stato del tema e contratti pertinenti per rendere più leggibili filoni amministrativi ricorrenti.",
    provenance:
      "Contenuti e collegamenti redazionali interni basati sui dati civici disponibili nella piattaforma.",
    updateFrequency:
      "Aggiornamento redazionale; non esiste nel repository una periodicità automatica garantita per ogni tema.",
    fields: [
      "id",
      "titolo",
      "categoria",
      "stato",
      "descrizione",
      "contratti collegati",
    ],
    endpoints: ["GET /themes", "GET /themes/{id}"],
    mcpTools: ["list_themes", "get_theme"],
    limitations:
      "I temi servono a orientare la consultazione. Non rappresentano giudizi su responsabilità, intenzioni o irregolarità e possono non includere ogni documento pertinente.",
  },
  {
    name: "Indicatori di performance",
    dataKind: "Dato ufficiale o derivato con valore indicativo",
    description:
      "Categorie e indicatori con valore più recente e precedente, pensati per seguire serie amministrative e andamenti documentati.",
    provenance:
      "Catalogo e valori di performance definiti nello schema e nelle fonti applicative del progetto; alcuni valori possono richiedere aggiornamento manuale o feed dedicati.",
    updateFrequency:
      "Variabile per indicatore e fonte; usare le note dell'indicatore o gli endpoint di stato quando disponibili prima di assumere un aggiornamento recente.",
    fields: [
      "categoria",
      "indicatore",
      "periodo",
      "latestValue",
      "previousValue",
      "unità/descrizione",
    ],
    endpoints: ["GET /performance"],
    mcpTools: ["list_performance"],
    limitations:
      "Gli indicatori sono segnali di monitoraggio e non prove di qualità amministrativa, responsabilità individuale o completezza documentale.",
  },
  {
    name: "Catalogo open data e risorse tabellari",
    dataKind: "Metadati ufficiali con parsing tecnico dove possibile",
    description:
      "Catalogo dei dataset comunali con metadati DCAT-AP_IT, API compatibile CKAN e lettura tabellare di risorse CSV/JSON quando il parsing riesce.",
    provenance:
      "Catalogo open data del Comune di Lamezia Terme e risorse associate, come descritto nelle sezioni pubbliche Fonti dati e API sviluppatori.",
    updateFrequency:
      "Dipende dalla pubblicazione nel catalogo comunale e dalle importazioni applicative; le snapshot indicano disponibilità storica della risorsa, non una garanzia di completezza.",
    fields: [
      "id/slug dataset",
      "titolo",
      "gruppo/categoria",
      "risorse",
      "formato",
      "colonne e righe parse dove disponibili",
      "snapshot storiche",
    ],
    endpoints: [
      "GET /api/opendata/catalog.jsonld",
      "GET /api/3/action/package_search",
      "GET /api/3/action/package_show",
      "GET /opendata/resources/{id}/content",
    ],
    mcpTools: [],
    limitations:
      "Non tutti i formati sono tabellari o parseabili automaticamente. Il catalogo descrive risorse pubblicate, ma l'uso analitico richiede controllo dei metadati, del file originale e della data della snapshot.",
  },
  {
    name: "Progetti PNRR",
    dataKind: "Dato ufficiale censito e filtrabile",
    description:
      "Elenco dei progetti collegati al censimento Attuazione/Italia Domani per il Comune, con filtri per testo, missione e stato.",
    provenance:
      "Censimento Attuazione/Italia Domani citato dalla documentazione del repository e dalle rotte PNRR.",
    updateFrequency:
      "Dipende dagli aggiornamenti della fonte nazionale e dall'importazione nel progetto; non è dichiarata una copertura completa in questa pagina.",
    fields: [
      "id",
      "titolo",
      "missione",
      "stato",
      "CUP o riferimenti progettuali dove presenti",
    ],
    endpoints: ["GET /pnrr"],
    mcpTools: ["list_pnrr"],
    limitations:
      "Lo stato dei progetti e i collegamenti con atti o contratti devono essere verificati sulla fonte ufficiale e sui documenti amministrativi disponibili.",
  },
];

const REST_EXAMPLE = `curl "https://<host>/api/public/v1/documents?hasMarkdown=true&pageSize=5"`;

const MCP_EXAMPLE = `curl -X POST "https://<host>/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_documents","arguments":{"hasMarkdown":true,"pageSize":3}}}'`;

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
        p = p.replace(`{${param.name}}`, v ? encodeURIComponent(v) : `{${param.name}}`);
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
            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
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
                          setValues((v) => ({ ...v, [param.name]: e.target.value }))
                        }
                        placeholder={
                          param.schema?.enum
                            ? param.schema.enum.join(" | ")
                            : param.description ?? ""
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
      .map(([tag, eps]) => ({ tag, description: tagDesc.get(tag), endpoints: eps }));
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
          La piattaforma espone alcune risorse civiche tramite API pubbliche in
          sola lettura. Questa pagina descrive cosa è consultabile, quali
          cautele applicare e come provare gli endpoint documentati.
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
            Tutti gli endpoint REST sono relativi a questo indirizzo.
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

      {/* Dataset transparency hub */}
      <section
        aria-labelledby="trasparenza-dataset-api"
        className="mb-12 space-y-6"
      >
        <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow text-primary">
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                Copertura documentata
              </span>
              <h2
                id="trasparenza-dataset-api"
                className="mt-2 font-display text-2xl font-bold tracking-tight"
              >
                API e dataset: cosa viene esposto e con quali limiti
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Le schede seguenti riassumono solo le risorse indicate dalla
                documentazione pubblica dell'API, dal contratto applicativo e
                dalle pagine fonti/metodologia già presenti nel repository. Non
                sono una certificazione di completezza, freschezza o copertura
                integrale dei dati comunali.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link
                href="/fonti-dati"
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 font-medium text-primary hover:bg-primary/15"
              >
                Fonti dati
              </Link>
              <Link
                href="/metodologia"
                className="rounded-full border border-border bg-muted/50 px-3 py-1.5 font-medium text-foreground hover:bg-muted"
              >
                Metodologia
              </Link>
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed">
              I dati ufficiali sono informazioni pubblicate da enti o registri
              istituzionali; i dati derivati o arricchiti includono estrazioni,
              normalizzazioni, categorie e collegamenti editoriali. Questi
              elementi aiutano la consultazione, ma richiedono sempre verifica
              sulla fonte originale prima di analisi o riuso pubblico.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {DATASET_TRANSPARENCY.map((dataset) => (
            <article
              key={dataset.name}
              className="rounded-2xl border border-card-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold">
                    {dataset.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {dataset.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="w-fit border-primary/20 bg-primary/10 text-primary shadow-none"
                >
                  {dataset.dataKind}
                </Badge>
              </div>

              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-foreground">
                    Provenienza del dato
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {dataset.provenance}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">
                    Aggiornamento indicato
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {dataset.updateFrequency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">
                    Campi principali esposti
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {dataset.fields.map((field) => (
                      <span
                        key={field}
                        className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {field}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">
                    Endpoint e tool MCP
                  </dt>
                  <dd className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {dataset.endpoints.map((endpoint) => (
                        <code
                          key={endpoint}
                          className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] text-foreground"
                        >
                          {endpoint}
                        </code>
                      ))}
                    </div>
                    {dataset.mcpTools.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dataset.mcpTools.map((tool) => (
                          <code
                            key={tool}
                            className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"
                          >
                            MCP: {tool}
                          </code>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Nessun tool MCP dedicato indicato nella documentazione
                        pubblica esistente.
                      </p>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Limiti noti e cautele
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {dataset.limitations}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CodeExample label="Esempio REST minimale" code={REST_EXAMPLE} />
          <CodeExample label="Esempio MCP minimale" code={MCP_EXAMPLE} />
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
        <Link href="/feeds" className="font-medium text-primary hover:underline">
          Feed e abbonamenti
        </Link>
        .
      </div>
    </div>
  );
}
