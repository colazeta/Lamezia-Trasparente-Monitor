// Specifica OpenAPI 3.1 dell'API pubblica read-only. È mantenuta a mano (e
// separata dalla openapi.yaml interna usata per la codegen del frontend) perché
// descrive una superficie distinta e stabile pensata per consumatori esterni:
// giornalisti, ricercatori e assistenti AI. Servita come JSON da
// GET /api/public/v1/openapi.json.

const pageParam = {
  name: "page",
  in: "query",
  description: "Numero di pagina (1-based).",
  schema: { type: "integer", minimum: 1, default: 1 },
} as const;

const pageSizeParam = {
  name: "pageSize",
  in: "query",
  description: "Elementi per pagina (max 100).",
  schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
} as const;

function paginated(itemRef: string) {
  return {
    type: "object",
    properties: {
      data: { type: "array", items: { $ref: itemRef } },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
    required: ["data", "pagination"],
  };
}

function jsonResponse(schema: unknown, description: string) {
  return {
    description,
    content: { "application/json": { schema } },
  };
}

export function buildPublicOpenApi(baseUrl: string): Record<string, unknown> {
  return {
    openapi: "3.1.0",
    info: {
      title: "rendiamoLameziaTrasparente — API pubblica",
      version: "1.0.0",
      description:
        "API pubblica, documentata e in sola lettura per interrogare i dati " +
        "civici della piattaforma: atti dell'Albo Pretorio (con testo pulito " +
        "in Markdown), contratti pubblici (ANAC), temi di monitoraggio, " +
        "indicatori di performance e progetti PNRR. Pensata per giornalisti, " +
        "ricercatori e assistenti AI. È disponibile anche un server compatibile " +
        "MCP sugli stessi dati all'endpoint POST /api/mcp.",
    },
    servers: [{ url: baseUrl, description: "Base dell'API pubblica" }],
    tags: [
      { name: "documents", description: "Atti dell'Albo Pretorio" },
      { name: "contracts", description: "Contratti pubblici (ANAC)" },
      { name: "themes", description: "Temi di monitoraggio civico" },
      { name: "performance", description: "Indicatori di performance" },
      { name: "pnrr", description: "Progetti PNRR (censimento Attuazione)" },
    ],
    paths: {
      "/documents": {
        get: {
          operationId: "listPublicDocuments",
          tags: ["documents"],
          summary: "Elenca gli atti dell'Albo Pretorio",
          description:
            "Restituisce gli atti pubblicati (delibere, determine, ordinanze, " +
            "convocazioni...) con filtri e paginazione.",
          parameters: [
            { name: "q", in: "query", description: "Ricerca testuale su oggetto e tipologia.", schema: { type: "string" } },
            { name: "category", in: "query", description: "Categoria: albo, delibera, convocazione, ordinanza.", schema: { type: "string" } },
            { name: "tipologia", in: "query", description: "Tipologia esatta dell'atto.", schema: { type: "string" } },
            { name: "from", in: "query", description: "Data inizio pubblicazione (ISO/YYYY-MM-DD).", schema: { type: "string", format: "date" } },
            { name: "to", in: "query", description: "Data fine pubblicazione (ISO/YYYY-MM-DD).", schema: { type: "string", format: "date" } },
            { name: "isPnrr", in: "query", description: "Solo atti collegati al PNRR.", schema: { type: "boolean" } },
            { name: "hasMarkdown", in: "query", description: "Solo atti con testo Markdown estratto.", schema: { type: "boolean" } },
            pageParam,
            pageSizeParam,
          ],
          responses: {
            "200": jsonResponse(
              paginated("#/components/schemas/Document"),
              "Pagina di atti",
            ),
          },
        },
      },
      "/documents/{id}": {
        get: {
          operationId: "getPublicDocument",
          tags: ["documents"],
          summary: "Dettaglio di un atto",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": jsonResponse({ $ref: "#/components/schemas/Document" }, "Atto"),
            "404": jsonResponse({ $ref: "#/components/schemas/Error" }, "Non trovato"),
          },
        },
      },
      "/documents/{id}/markdown": {
        get: {
          operationId: "getPublicDocumentMarkdown",
          tags: ["documents"],
          summary: "Testo pulito in Markdown di un atto",
          description:
            "Restituisce il testo estratto e ripulito dall'allegato PDF " +
            "principale. Con ?format=md restituisce direttamente text/markdown.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
            { name: "format", in: "query", description: "json (default) o md.", schema: { type: "string", enum: ["json", "md"] } },
          ],
          responses: {
            "200": {
              description: "Markdown dell'atto",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/DocumentMarkdown" } },
                "text/markdown": { schema: { type: "string" } },
              },
            },
            "404": jsonResponse({ $ref: "#/components/schemas/Error" }, "Markdown non disponibile"),
          },
        },
      },
      "/contracts": {
        get: {
          operationId: "listPublicContracts",
          tags: ["contracts"],
          summary: "Elenca i contratti pubblici",
          parameters: [
            { name: "q", in: "query", description: "Ricerca su titolo, descrizione, fornitore, CIG.", schema: { type: "string" } },
            { name: "supplier", in: "query", description: "Filtro per fornitore (parziale).", schema: { type: "string" } },
            { name: "procedureType", in: "query", description: "Tipo di procedura.", schema: { type: "string" } },
            { name: "macrotema", in: "query", description: "Ambito di spesa (macrotema).", schema: { type: "string" } },
            { name: "minAmount", in: "query", schema: { type: "number" } },
            { name: "maxAmount", in: "query", schema: { type: "number" } },
            { name: "from", in: "query", description: "Data aggiudicazione da.", schema: { type: "string", format: "date" } },
            { name: "to", in: "query", description: "Data aggiudicazione a.", schema: { type: "string", format: "date" } },
            { name: "themeId", in: "query", schema: { type: "integer" } },
            pageParam,
            pageSizeParam,
          ],
          responses: {
            "200": jsonResponse(
              paginated("#/components/schemas/Contract"),
              "Pagina di contratti",
            ),
          },
        },
      },
      "/contracts/{id}": {
        get: {
          operationId: "getPublicContract",
          tags: ["contracts"],
          summary: "Dettaglio di un contratto",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": jsonResponse({ $ref: "#/components/schemas/Contract" }, "Contratto"),
            "404": jsonResponse({ $ref: "#/components/schemas/Error" }, "Non trovato"),
          },
        },
      },
      "/themes": {
        get: {
          operationId: "listPublicThemes",
          tags: ["themes"],
          summary: "Elenca i temi di monitoraggio",
          parameters: [
            { name: "q", in: "query", description: "Ricerca per titolo.", schema: { type: "string" } },
            { name: "categoryId", in: "query", schema: { type: "integer" } },
            { name: "status", in: "query", description: "aperto, in_corso, monitoraggio, chiuso.", schema: { type: "string" } },
            pageParam,
            pageSizeParam,
          ],
          responses: {
            "200": jsonResponse(
              paginated("#/components/schemas/Theme"),
              "Pagina di temi",
            ),
          },
        },
      },
      "/themes/{id}": {
        get: {
          operationId: "getPublicTheme",
          tags: ["themes"],
          summary: "Dettaglio di un tema con i contratti collegati",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": jsonResponse({ $ref: "#/components/schemas/ThemeDetail" }, "Tema"),
            "404": jsonResponse({ $ref: "#/components/schemas/Error" }, "Non trovato"),
          },
        },
      },
      "/performance": {
        get: {
          operationId: "listPublicPerformance",
          tags: ["performance"],
          summary: "Categorie e indicatori di performance con ultimi valori",
          responses: {
            "200": jsonResponse(
              { type: "array", items: { $ref: "#/components/schemas/PerformanceCategory" } },
              "Categorie di performance",
            ),
          },
        },
      },
      "/pnrr": {
        get: {
          operationId: "listPublicPnrr",
          tags: ["pnrr"],
          summary: "Elenca i progetti PNRR del censimento Attuazione",
          parameters: [
            { name: "q", in: "query", description: "Ricerca su titolo, intervento, CUP.", schema: { type: "string" } },
            { name: "mission", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string" } },
            pageParam,
            pageSizeParam,
          ],
          responses: {
            "200": jsonResponse(
              paginated("#/components/schemas/PnrrProject"),
              "Pagina di progetti PNRR",
            ),
          },
        },
      },
    },
    components: {
      schemas: {
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            pageSize: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
          required: ["page", "pageSize", "total", "totalPages"],
        },
        Error: {
          type: "object",
          properties: { error: { type: "string" } },
          required: ["error"],
        },
        Attachment: {
          type: "object",
          properties: {
            name: { type: "string" },
            officialUrl: { type: "string", description: "Link diretto al portale ufficiale." },
            archivedUrl: { type: ["string", "null"], description: "Copia archiviata servita dalla piattaforma." },
            contentType: { type: ["string", "null"] },
            size: { type: ["integer", "null"] },
          },
        },
        Document: {
          type: "object",
          properties: {
            id: { type: "integer" },
            progressivo: { type: "string" },
            tipologia: { type: "string" },
            category: { type: "string" },
            subcategory: { type: ["string", "null"] },
            provenienza: { type: ["string", "null"] },
            oggetto: { type: "string" },
            dataAtto: { type: ["string", "null"], format: "date-time" },
            pubStart: { type: ["string", "null"], format: "date-time" },
            pubEnd: { type: ["string", "null"], format: "date-time" },
            numRegSet: { type: ["string", "null"] },
            numRegGen: { type: ["string", "null"] },
            cups: { type: "array", items: { type: "string" } },
            pnrrMission: { type: ["string", "null"] },
            isPnrr: { type: "boolean" },
            attachments: { type: "array", items: { $ref: "#/components/schemas/Attachment" } },
            hasMarkdown: { type: "boolean" },
            markdownSource: { type: ["string", "null"] },
            markdownExtractedAt: { type: ["string", "null"], format: "date-time" },
          },
        },
        DocumentMarkdown: {
          type: "object",
          properties: {
            id: { type: "integer" },
            progressivo: { type: "string" },
            oggetto: { type: "string" },
            markdownSource: { type: ["string", "null"] },
            markdownExtractedAt: { type: ["string", "null"], format: "date-time" },
            markdown: { type: "string" },
          },
        },
        Contract: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: ["string", "null"] },
            supplier: { type: ["string", "null"] },
            amount: { type: "number" },
            procedureType: { type: ["string", "null"] },
            status: { type: ["string", "null"] },
            awardDate: { type: "string", format: "date-time" },
            cig: { type: ["string", "null"] },
            cup: { type: ["string", "null"] },
            stazioneAppaltante: { type: ["string", "null"] },
            acquisitionTool: { type: ["string", "null"] },
            withoutTender: { type: ["boolean", "null"] },
            withoutMepa: { type: ["boolean", "null"] },
            anacUrl: { type: ["string", "null"] },
            themeId: { type: ["integer", "null"] },
            macrotema: { type: ["string", "null"] },
            latitude: { type: ["number", "null"] },
            longitude: { type: ["number", "null"] },
            geoQuartiere: { type: ["string", "null"] },
          },
        },
        Theme: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            slug: { type: "string" },
            summary: { type: "string" },
            categoryId: { type: "integer" },
            categoryName: { type: ["string", "null"] },
            status: { type: "string" },
            relevanceCount: { type: "integer" },
            shareCount: { type: "integer" },
            followerCount: { type: "integer" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ThemeDetail: {
          allOf: [
            { $ref: "#/components/schemas/Theme" },
            {
              type: "object",
              properties: {
                description: { type: "string" },
                contracts: { type: "array", items: { $ref: "#/components/schemas/Contract" } },
              },
            },
          ],
        },
        PerformanceValue: {
          type: "object",
          properties: {
            value: { type: "number" },
            period: { type: "string" },
          },
        },
        PerformanceIndicator: {
          type: "object",
          properties: {
            id: { type: "integer" },
            slug: { type: "string" },
            categoryId: { type: "integer" },
            title: { type: "string" },
            description: { type: ["string", "null"] },
            unit: { type: "string" },
            source: { type: ["string", "null"] },
            sourceUrl: { type: ["string", "null"] },
            polarity: { type: "string" },
            latestValue: { oneOf: [{ $ref: "#/components/schemas/PerformanceValue" }, { type: "null" }] },
            previousValue: { oneOf: [{ $ref: "#/components/schemas/PerformanceValue" }, { type: "null" }] },
          },
        },
        PerformanceCategory: {
          type: "object",
          properties: {
            id: { type: "integer" },
            slug: { type: "string" },
            name: { type: "string" },
            description: { type: ["string", "null"] },
            indicators: { type: "array", items: { $ref: "#/components/schemas/PerformanceIndicator" } },
          },
        },
        PnrrProject: {
          type: "object",
          properties: {
            id: { type: "integer" },
            sourceId: { type: "string" },
            url: { type: "string" },
            title: { type: "string" },
            cup: { type: ["string", "null"] },
            mission: { type: ["string", "null"] },
            component: { type: ["string", "null"] },
            investment: { type: ["string", "null"] },
            intervention: { type: ["string", "null"] },
            holder: { type: ["string", "null"] },
            attuatore: { type: ["string", "null"] },
            importoFinanziato: { type: ["number", "null"] },
            status: { type: ["string", "null"] },
            startDate: { type: ["string", "null"], format: "date-time" },
            endDate: { type: ["string", "null"], format: "date-time" },
            publishedAt: { type: ["string", "null"], format: "date-time" },
          },
        },
      },
    },
  };
}
