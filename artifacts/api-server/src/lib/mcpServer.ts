import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod4";
import {
  listDocuments,
  getDocument,
  getDocumentMarkdown,
  listContracts,
  getContract,
  listThemes,
  getTheme,
  listPerformance,
  listPnrr,
} from "./publicData";

const PUBLIC_SITE_URL = "https://lamezia-trasparente.pages.dev";

const SERVER_INSTRUCTIONS =
  "LameziaTrasparente exposes read-only civic transparency data for Lamezia Terme. " +
  "Use search/list tools before detail tools when the exact identifier is unknown. " +
  "Treat missing, partial or stale data as a documentation limitation, never as evidence that an event, contract or irregularity does not exist. " +
  "Do not infer illegality or wrongdoing from amounts, procedure types, missing fields or monitoring indicators. " +
  "For legal effect, dates and material conclusions, verify the public source links and provenance returned by the records.";

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const paginationFields = {
  page: z.number().int().min(1).optional().describe("Numero di pagina (1-based)."),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Elementi per pagina (max 100)."),
};

const publicResultSchema = z.object({
  resource: z.string(),
  data: z.unknown(),
  verification: z.object({
    publicOnly: z.literal(true),
    sourceCheckRequired: z.literal(true),
    portal: z.url(),
  }),
});

type PublicResult = z.infer<typeof publicResultSchema>;

function structured(resource: string, payload: unknown): PublicResult {
  return {
    resource,
    data: payload,
    verification: {
      publicOnly: true,
      sourceCheckRequired: true,
      portal: PUBLIC_SITE_URL,
    },
  };
}

// Keep the legacy text rendering unchanged while adding a stable structured
// envelope for clients that understand modern MCP structuredContent.
function json(resource: string, payload: unknown) {
  const structuredContent = structured(resource, payload);
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(payload, null, 2) },
    ],
    structuredContent,
  };
}

function notFound(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "lamezia-trasparente-public",
      title: "LameziaTrasparente Public MCP",
      version: "1.1.0",
      description:
        "Read-only, source-verifiable civic transparency data for Lamezia Terme.",
      websiteUrl: PUBLIC_SITE_URL,
    },
    {
      instructions: SERVER_INSTRUCTIONS,
    },
  );

  server.registerTool(
    "search_documents",
    {
      title: "Cerca atti dell'Albo Pretorio",
      description:
        "Cerca e filtra gli atti pubblicati (delibere, determine, ordinanze, " +
        "convocazioni). Restituisce risultati paginati con metadati e allegati.",
      inputSchema: z.object({
        q: z
          .string()
          .max(300)
          .optional()
          .describe("Ricerca testuale su oggetto e tipologia."),
        category: z
          .string()
          .max(80)
          .optional()
          .describe("Categoria: albo, delibera, convocazione, ordinanza."),
        tipologia: z
          .string()
          .max(160)
          .optional()
          .describe("Tipologia esatta dell'atto."),
        from: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("Pubblicati dal (YYYY-MM-DD)."),
        to: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("Pubblicati fino al (YYYY-MM-DD)."),
        isPnrr: z.boolean().optional().describe("Solo atti collegati al PNRR."),
        hasMarkdown: z
          .boolean()
          .optional()
          .describe("Solo atti con testo Markdown estratto."),
        ...paginationFields,
      }),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async (args) => json("documents", await listDocuments(args)),
  );

  server.registerTool(
    "get_document",
    {
      title: "Dettaglio di un atto",
      description:
        "Restituisce i metadati e gli allegati di un singolo atto per id numerico o publicId stabile.",
      inputSchema: z.object({
        id: z
          .union([z.number().int(), z.string().min(1).max(180)])
          .describe("Id numerico o publicId stabile dell'atto."),
      }),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ id }) => {
      const doc = await getDocument(id);
      return doc ? json("document", doc) : notFound("Atto non trovato");
    },
  );

  server.registerTool(
    "get_document_markdown",
    {
      title: "Testo Markdown di un atto",
      description:
        "Restituisce il testo pulito in Markdown estratto dall'allegato PDF " +
        "principale di un atto. Utile per leggere o riassumere il contenuto.",
      inputSchema: z.object({
        id: z
          .union([z.number().int(), z.string().min(1).max(180)])
          .describe("Id numerico o publicId stabile dell'atto."),
      }),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ id }) => {
      const result = await getDocumentMarkdown(id);
      return result
        ? json("document_markdown", result)
        : notFound("Testo Markdown non disponibile per questo atto");
    },
  );

  server.registerTool(
    "search_contracts",
    {
      title: "Cerca contratti pubblici",
      description:
        "Cerca e filtra i contratti pubblici (fonte ANAC) per fornitore, " +
        "importo, procedura, periodo o tema. Risultati paginati. I filtri e gli " +
        "indicatori non costituiscono prova di irregolarità.",
      inputSchema: z.object({
        q: z
          .string()
          .max(300)
          .optional()
          .describe("Ricerca su titolo, descrizione, fornitore, CIG."),
        supplier: z
          .string()
          .max(220)
          .optional()
          .describe("Filtro per fornitore (parziale)."),
        procedureType: z
          .string()
          .max(160)
          .optional()
          .describe("Tipo di procedura."),
        macrotema: z
          .string()
          .max(160)
          .optional()
          .describe("Ambito di spesa (macrotema)."),
        minAmount: z.number().min(0).optional().describe("Importo minimo (euro)."),
        maxAmount: z.number().min(0).optional().describe("Importo massimo (euro)."),
        from: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("Aggiudicati dal (YYYY-MM-DD)."),
        to: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("Aggiudicati fino al (YYYY-MM-DD)."),
        themeId: z.number().int().optional().describe("Id del tema collegato."),
        ...paginationFields,
      }),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async (args) => json("contracts", await listContracts(args)),
  );

  server.registerTool(
    "get_contract",
    {
      title: "Dettaglio di un contratto",
      description: "Restituisce i dettagli pubblici di un singolo contratto per id.",
      inputSchema: z.object({
        id: z.number().int().describe("Id del contratto."),
      }),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ id }) => {
      const contract = await getContract(id);
      return contract
        ? json("contract", contract)
        : notFound("Contratto non trovato");
    },
  );

  server.registerTool(
    "list_themes",
    {
      title: "Elenca i temi di monitoraggio",
      description:
        "Elenca i temi di monitoraggio civico, con filtri per categoria, " +
        "stato e ricerca testuale. Risultati paginati.",
      inputSchema: z.object({
        q: z.string().max(300).optional().describe("Ricerca per titolo."),
        categoryId: z.number().int().optional().describe("Id della categoria."),
        status: z
          .string()
          .max(80)
          .optional()
          .describe("Stato: aperto, in_corso, monitoraggio, chiuso."),
        ...paginationFields,
      }),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async (args) => json("themes", await listThemes(args)),
  );

  server.registerTool(
    "get_theme",
    {
      title: "Dettaglio di un tema",
      description:
        "Restituisce un tema di monitoraggio con la descrizione estesa e i contratti collegati.",
      inputSchema: z.object({
        id: z.number().int().describe("Id del tema."),
      }),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ id }) => {
      const theme = await getTheme(id);
      return theme ? json("theme", theme) : notFound("Tema non trovato");
    },
  );

  server.registerTool(
    "list_performance",
    {
      title: "Indicatori di performance",
      description:
        "Restituisce le categorie e gli indicatori di performance del Comune " +
        "con l'ultimo valore e quello precedente per ciascun indicatore.",
      inputSchema: z.object({}),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async () => json("performance", await listPerformance()),
  );

  server.registerTool(
    "list_pnrr",
    {
      title: "Progetti PNRR",
      description:
        "Elenca i progetti PNRR del censimento Attuazione, con filtri per " +
        "missione, stato e ricerca testuale. Risultati paginati.",
      inputSchema: z.object({
        q: z
          .string()
          .max(300)
          .optional()
          .describe("Ricerca su titolo, intervento, CUP."),
        mission: z.string().max(180).optional().describe("Missione PNRR."),
        status: z.string().max(120).optional().describe("Stato del progetto."),
        ...paginationFields,
      }),
      outputSchema: publicResultSchema,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async (args) => json("pnrr", await listPnrr(args)),
  );

  return server;
}
