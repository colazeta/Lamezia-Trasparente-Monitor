import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type ToolInput = Record<string, unknown>;

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (input: ToolInput) => Promise<unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
};

export type WebMcpModelContext = {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ) => Promise<void> | void;
};

export type WebMcpActivity = {
  tool: string;
  label: string;
  uiPath: string;
  resultCount: number | null;
};

type ToolDependencies = {
  navigate: (path: string) => void;
  fetchImpl?: typeof fetch;
  onActivity?: (activity: WebMcpActivity) => void;
};

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  untrustedContentHint: true,
} as const;

const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 10;

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function resultCountFrom(result: unknown) {
  const record = asRecord(result);
  if (!record) return null;

  const pagination = asRecord(record.pagination);
  if (pagination && typeof pagination.total === "number") {
    return pagination.total;
  }

  if (Array.isArray(record.data)) return record.data.length;
  if (Array.isArray(record.projects)) return record.projects.length;
  return null;
}

function pageSizeFrom(value: unknown) {
  const numeric = typeof value === "number" ? Math.trunc(value) : DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(1, numeric || DEFAULT_PAGE_SIZE));
}

function setIfPresent(params: URLSearchParams, key: string, value: unknown) {
  const text = asString(value);
  if (text) params.set(key, text);
}

function setNumberIfPresent(
  params: URLSearchParams,
  key: string,
  value: unknown,
) {
  const numeric = asOptionalNumber(value);
  if (numeric !== null) params.set(key, String(numeric));
}

function withQuery(path: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

async function fetchPublicJson(
  path: string,
  params: URLSearchParams,
  fetchImpl: typeof fetch,
) {
  const response = await fetchImpl(withQuery(path, params), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Public API request failed with status ${response.status}`);
  }

  return response.json();
}

function resultPayload(
  tool: string,
  uiPath: string,
  apiPath: string,
  result: unknown,
) {
  return JSON.stringify({
    ok: true,
    tool,
    uiPath,
    apiPath,
    note:
      "Read-only civic data. Verify dates, legal effect and source documents on the linked public interface before drawing conclusions.",
    result,
  });
}

function reportActivity(
  onActivity: ToolDependencies["onActivity"],
  activity: Omit<WebMcpActivity, "resultCount">,
  result: unknown,
) {
  onActivity?.({
    ...activity,
    resultCount: resultCountFrom(result),
  });
}

export function createWebMcpTools({
  navigate,
  fetchImpl = fetch,
  onActivity,
}: ToolDependencies): WebMcpTool[] {
  return [
    {
      name: "search_civic_documents",
      title: "Cerca atti civici",
      description:
        "Cerca negli atti pubblici indicizzati da LameziaTrasparente. Usa questo tool per trovare documenti amministrativi per parole chiave e mostrare la stessa ricerca nell'interfaccia pubblica. I risultati sono informativi e devono essere verificati sulla fonte ufficiale.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          q: {
            type: "string",
            maxLength: 200,
            description: "Parole chiave da cercare nell'oggetto o nella tipologia dell'atto.",
          },
          pageSize: {
            type: "integer",
            minimum: 1,
            maximum: MAX_PAGE_SIZE,
            default: DEFAULT_PAGE_SIZE,
          },
        },
      },
      annotations: READ_ONLY_ANNOTATIONS,
      execute: async (input) => {
        const apiParams = new URLSearchParams();
        setIfPresent(apiParams, "q", input.q);
        apiParams.set("pageSize", String(pageSizeFrom(input.pageSize)));

        const uiParams = new URLSearchParams();
        setIfPresent(uiParams, "q", input.q);
        const uiPath = withQuery("/albo", uiParams);
        const apiPath = withQuery("/api/public/v1/documents", apiParams);
        const result = await fetchPublicJson(
          "/api/public/v1/documents",
          apiParams,
          fetchImpl,
        );

        reportActivity(
          onActivity,
          { tool: "search_civic_documents", label: "Ricerca atti", uiPath },
          result,
        );
        navigate(uiPath);
        return resultPayload("search_civic_documents", uiPath, apiPath, result);
      },
    },
    {
      name: "filter_public_contracts",
      title: "Filtra contratti pubblici",
      description:
        "Filtra i contratti pubblici disponibili in LameziaTrasparente per testo, procedura, importo o periodo e porta l'utente alla stessa vista filtrata. Gli indicatori non costituiscono prova di irregolarità.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          q: {
            type: "string",
            maxLength: 200,
            description: "Testo, CIG, fornitore o oggetto da cercare.",
          },
          procedureType: { type: "string", maxLength: 120 },
          minAmount: { type: "number", minimum: 0 },
          maxAmount: { type: "number", minimum: 0 },
          from: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            maxLength: 10,
          },
          to: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            maxLength: 10,
          },
          pageSize: {
            type: "integer",
            minimum: 1,
            maximum: MAX_PAGE_SIZE,
            default: DEFAULT_PAGE_SIZE,
          },
        },
      },
      annotations: READ_ONLY_ANNOTATIONS,
      execute: async (input) => {
        const apiParams = new URLSearchParams();
        setIfPresent(apiParams, "q", input.q);
        setIfPresent(apiParams, "procedureType", input.procedureType);
        setNumberIfPresent(apiParams, "minAmount", input.minAmount);
        setNumberIfPresent(apiParams, "maxAmount", input.maxAmount);
        setIfPresent(apiParams, "from", input.from);
        setIfPresent(apiParams, "to", input.to);
        apiParams.set("pageSize", String(pageSizeFrom(input.pageSize)));

        const uiParams = new URLSearchParams(apiParams);
        uiParams.delete("pageSize");
        const uiPath = withQuery("/contratti", uiParams);
        const apiPath = withQuery("/api/public/v1/contracts", apiParams);
        const result = await fetchPublicJson(
          "/api/public/v1/contracts",
          apiParams,
          fetchImpl,
        );

        reportActivity(
          onActivity,
          { tool: "filter_public_contracts", label: "Filtro contratti", uiPath },
          result,
        );
        navigate(uiPath);
        return resultPayload("filter_public_contracts", uiPath, apiPath, result);
      },
    },
    {
      name: "explore_pnrr_projects",
      title: "Esplora progetti PNRR",
      description:
        "Cerca e filtra i progetti PNRR censiti da LameziaTrasparente per testo, missione o stato e mostra la stessa selezione nella pagina PNRR. Le informazioni vanno lette insieme alle fonti e alle note di aggiornamento.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          q: { type: "string", maxLength: 200 },
          mission: { type: "string", maxLength: 160 },
          status: { type: "string", maxLength: 120 },
          pageSize: {
            type: "integer",
            minimum: 1,
            maximum: MAX_PAGE_SIZE,
            default: DEFAULT_PAGE_SIZE,
          },
        },
      },
      annotations: READ_ONLY_ANNOTATIONS,
      execute: async (input) => {
        const apiParams = new URLSearchParams();
        setIfPresent(apiParams, "q", input.q);
        setIfPresent(apiParams, "mission", input.mission);
        setIfPresent(apiParams, "status", input.status);
        apiParams.set("pageSize", String(pageSizeFrom(input.pageSize)));

        const uiParams = new URLSearchParams(apiParams);
        uiParams.delete("pageSize");
        const uiPath = withQuery("/pnrr", uiParams);
        const apiPath = withQuery("/api/public/v1/pnrr", apiParams);
        const result = await fetchPublicJson(
          "/api/public/v1/pnrr",
          apiParams,
          fetchImpl,
        );

        reportActivity(
          onActivity,
          { tool: "explore_pnrr_projects", label: "Esplorazione PNRR", uiPath },
          result,
        );
        navigate(uiPath);
        return resultPayload("explore_pnrr_projects", uiPath, apiPath, result);
      },
    },
    {
      name: "inspect_civic_record",
      title: "Apri una scheda civica",
      description:
        "Apre e restituisce una singola scheda pubblica già esposta da LameziaTrasparente. Usa `document` per un atto, `contract` per un contratto e `pnrr` per un progetto identificato dal CUP.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["resource", "id"],
        properties: {
          resource: {
            type: "string",
            enum: ["document", "contract", "pnrr"],
          },
          id: {
            type: "string",
            minLength: 1,
            maxLength: 128,
          },
        },
      },
      annotations: READ_ONLY_ANNOTATIONS,
      execute: async (input) => {
        const resource = asString(input.resource);
        const id = asString(input.id);
        if (!id || !["document", "contract", "pnrr"].includes(resource)) {
          throw new Error("A valid resource and id are required");
        }

        if (resource === "document") {
          const encoded = encodeURIComponent(id);
          const apiPath = `/api/public/v1/documents/${encoded}`;
          const result = await fetchPublicJson(apiPath, new URLSearchParams(), fetchImpl);
          const uiPath = `/albo/${encoded}`;
          onActivity?.({
            tool: "inspect_civic_record",
            label: "Scheda atto",
            uiPath,
            resultCount: 1,
          });
          navigate(uiPath);
          return resultPayload("inspect_civic_record", uiPath, apiPath, result);
        }

        if (resource === "contract") {
          const encoded = encodeURIComponent(id);
          const apiPath = `/api/public/v1/contracts/${encoded}`;
          const result = await fetchPublicJson(apiPath, new URLSearchParams(), fetchImpl);
          const uiPath = `/contratti/${encoded}`;
          onActivity?.({
            tool: "inspect_civic_record",
            label: "Scheda contratto",
            uiPath,
            resultCount: 1,
          });
          navigate(uiPath);
          return resultPayload("inspect_civic_record", uiPath, apiPath, result);
        }

        const cup = id.replace(/[^a-z0-9]/gi, "").toUpperCase();
        if (!cup) throw new Error("A valid CUP is required for PNRR records");
        const apiParams = new URLSearchParams({
          q: cup,
          pageSize: String(DEFAULT_PAGE_SIZE),
        });
        const apiPath = withQuery("/api/public/v1/pnrr", apiParams);
        const result = await fetchPublicJson(
          "/api/public/v1/pnrr",
          apiParams,
          fetchImpl,
        );
        const uiPath = `/pnrr/${encodeURIComponent(cup)}`;
        onActivity?.({
          tool: "inspect_civic_record",
          label: "Scheda progetto PNRR",
          uiPath,
          resultCount: 1,
        });
        navigate(uiPath);
        return resultPayload("inspect_civic_record", uiPath, apiPath, result);
      },
    },
  ];
}

export async function registerWebMcpTools(
  modelContext: WebMcpModelContext,
  dependencies: ToolDependencies,
  signal?: AbortSignal,
) {
  const tools = createWebMcpTools(dependencies);
  await Promise.all(
    tools.map((tool) =>
      Promise.resolve(modelContext.registerTool(tool, { signal })),
    ),
  );
}

function getModelContext() {
  if (typeof document === "undefined") return null;
  const candidate = (
    document as Document & { modelContext?: WebMcpModelContext }
  ).modelContext;
  return candidate && typeof candidate.registerTool === "function"
    ? candidate
    : null;
}

export function WebMcpBridge() {
  const [, navigate] = useLocation();
  const [activity, setActivity] = useState<WebMcpActivity | null>(null);

  useEffect(() => {
    const modelContext = getModelContext();
    if (!modelContext) return undefined;

    const controller = new AbortController();
    void registerWebMcpTools(
      modelContext,
      { navigate, onActivity: setActivity },
      controller.signal,
    ).catch((error) => {
      if (!controller.signal.aborted) {
        console.warn("WebMCP tool registration failed", error);
      }
    });

    return () => controller.abort();
  }, [navigate]);

  if (!activity) return null;

  return (
    <aside
      className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-2xl rounded-xl border border-border bg-card/95 p-4 text-card-foreground shadow-lg backdrop-blur sm:left-auto sm:w-[30rem]"
      aria-live="polite"
      aria-label="Attività WebMCP"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Assistente WebMCP · sola lettura
          </p>
          <p className="mt-1 text-sm font-semibold">{activity.label}</p>
          <p className="mt-1 break-all text-xs leading-5 text-muted-foreground">
            Vista aperta: {activity.uiPath}
            {activity.resultCount !== null
              ? ` · ${activity.resultCount} record disponibili`
              : ""}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Verifica sempre date, fonte e valore legale dei documenti nella
            scheda pubblica.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActivity(null)}
          className="shrink-0 rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          aria-label="Chiudi avviso WebMCP"
        >
          Chiudi
        </button>
      </div>
    </aside>
  );
}
