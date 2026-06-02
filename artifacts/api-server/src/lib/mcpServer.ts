import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, type ZodRawShape } from "zod";
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

// Server compatibile MCP che espone, in sola lettura, gli stessi dati e filtri
// dell'API pubblica REST. È pensato per assistenti AI: ogni tool corrisponde a
// una risorsa o ricerca della piattaforma. Nessuna operazione di scrittura.

const paginationShape = {
  page: z.number().int().min(1).optional().describe("Numero di pagina (1-based)."),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Elementi per pagina (max 100)."),
} satisfies ZodRawShape;

function json(payload: unknown) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(payload, null, 2) },
    ],
  };
}

function notFound(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

// Crea una nuova istanza del server con tutti i tool registrati. Ne creiamo una
// per richiesta (modalità stateless), così non c'è stato condiviso tra client.
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "lamezia-trasparente-public",
    version: "1.0.0",
  });

  server.registerTool(
    "search_documents",
    {
      title: "Cerca atti dell'Albo Pretorio",
      description:
        "Cerca e filtra gli atti pubblicati (delibere, determine, ordinanze, " +
        "convocazioni). Restituisce risultati paginati con metadati e allegati.",
      inputSchema: {
        q: z.string().optional().describe("Ricerca testuale su oggetto e tipologia."),
        category: z
          .string()
          .optional()
          .describe("Categoria: albo, delibera, convocazione, ordinanza."),
        tipologia: z.string().optional().describe("Tipologia esatta dell'atto."),
        from: z.string().optional().describe("Pubblicati dal (YYYY-MM-DD)."),
        to: z.string().optional().describe("Pubblicati fino al (YYYY-MM-DD)."),
        isPnrr: z.boolean().optional().describe("Solo atti collegati al PNRR."),
        hasMarkdown: z
          .boolean()
          .optional()
          .describe("Solo atti con testo Markdown estratto."),
        ...paginationShape,
      },
    },
    async (args) => json(await listDocuments(args)),
  );

  server.registerTool(
    "get_document",
    {
      title: "Dettaglio di un atto",
      description: "Restituisce i metadati e gli allegati di un singolo atto per id.",
      inputSchema: { id: z.number().int().describe("Id dell'atto.") },
    },
    async ({ id }) => {
      const doc = await getDocument(id);
      return doc ? json(doc) : notFound("Atto non trovato");
    },
  );

  server.registerTool(
    "get_document_markdown",
    {
      title: "Testo Markdown di un atto",
      description:
        "Restituisce il testo pulito in Markdown estratto dall'allegato PDF " +
        "principale di un atto. Utile per leggere o riassumere il contenuto.",
      inputSchema: { id: z.number().int().describe("Id dell'atto.") },
    },
    async ({ id }) => {
      const result = await getDocumentMarkdown(id);
      return result
        ? json(result)
        : notFound("Testo Markdown non disponibile per questo atto");
    },
  );

  server.registerTool(
    "search_contracts",
    {
      title: "Cerca contratti pubblici",
      description:
        "Cerca e filtra i contratti pubblici (fonte ANAC) per fornitore, " +
        "importo, procedura, periodo o tema. Risultati paginati.",
      inputSchema: {
        q: z
          .string()
          .optional()
          .describe("Ricerca su titolo, descrizione, fornitore, CIG."),
        supplier: z.string().optional().describe("Filtro per fornitore (parziale)."),
        procedureType: z.string().optional().describe("Tipo di procedura."),
        macrotema: z.string().optional().describe("Ambito di spesa (macrotema)."),
        minAmount: z.number().optional().describe("Importo minimo (euro)."),
        maxAmount: z.number().optional().describe("Importo massimo (euro)."),
        from: z.string().optional().describe("Aggiudicati dal (YYYY-MM-DD)."),
        to: z.string().optional().describe("Aggiudicati fino al (YYYY-MM-DD)."),
        themeId: z.number().int().optional().describe("Id del tema collegato."),
        ...paginationShape,
      },
    },
    async (args) => json(await listContracts(args)),
  );

  server.registerTool(
    "get_contract",
    {
      title: "Dettaglio di un contratto",
      description: "Restituisce i dettagli di un singolo contratto per id.",
      inputSchema: { id: z.number().int().describe("Id del contratto.") },
    },
    async ({ id }) => {
      const contract = await getContract(id);
      return contract ? json(contract) : notFound("Contratto non trovato");
    },
  );

  server.registerTool(
    "list_themes",
    {
      title: "Elenca i temi di monitoraggio",
      description:
        "Elenca i temi di monitoraggio civico, con filtri per categoria, " +
        "stato e ricerca testuale. Risultati paginati.",
      inputSchema: {
        q: z.string().optional().describe("Ricerca per titolo."),
        categoryId: z.number().int().optional().describe("Id della categoria."),
        status: z
          .string()
          .optional()
          .describe("Stato: aperto, in_corso, monitoraggio, chiuso."),
        ...paginationShape,
      },
    },
    async (args) => json(await listThemes(args)),
  );

  server.registerTool(
    "get_theme",
    {
      title: "Dettaglio di un tema",
      description:
        "Restituisce un tema con la descrizione estesa e i contratti collegati.",
      inputSchema: { id: z.number().int().describe("Id del tema.") },
    },
    async ({ id }) => {
      const theme = await getTheme(id);
      return theme ? json(theme) : notFound("Tema non trovato");
    },
  );

  server.registerTool(
    "list_performance",
    {
      title: "Indicatori di performance",
      description:
        "Restituisce le categorie e gli indicatori di performance del Comune " +
        "con l'ultimo valore e quello precedente per ciascun indicatore.",
      inputSchema: {},
    },
    async () => json(await listPerformance()),
  );

  server.registerTool(
    "list_pnrr",
    {
      title: "Progetti PNRR",
      description:
        "Elenca i progetti PNRR del censimento Attuazione, con filtri per " +
        "missione, stato e ricerca testuale. Risultati paginati.",
      inputSchema: {
        q: z.string().optional().describe("Ricerca su titolo, intervento, CUP."),
        mission: z.string().optional().describe("Missione PNRR."),
        status: z.string().optional().describe("Stato del progetto."),
        ...paginationShape,
      },
    },
    async (args) => json(await listPnrr(args)),
  );

  return server;
}
