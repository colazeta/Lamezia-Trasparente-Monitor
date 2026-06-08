export type CkanEndpoint = {
  title: string;
  example: string;
  description: string;
  params?: string;
};

export type TransparencySourceType =
  | "ufficiale"
  | "derivata"
  | "redazionale"
  | "seed/demo";

export type TransparencyCoverageStatus =
  | "API pubblica + MCP"
  | "Sito/API di servizio"
  | "Sito o documentazione"
  | "Da valutare";

export type TransparencyDataKind =
  | "Dato ufficiale"
  | "Dato derivato"
  | "Dato arricchito"
  | "Dato misto";

export type TransparencyDataset = {
  datasetName: string;
  coverageStatus: TransparencyCoverageStatus;
  dataKindLabel: TransparencyDataKind;
  sourceType: TransparencySourceType;
  sourceUrl?: string;
  sourceNote: string;
  updateCadenceNote: string;
  fields: string;
  access: string;
  knownLimits: string;
  reuseExamples: string[];
  relatedBenchmarkIds?: string[];
};

export const PUBLIC_API_DOC_PATH = "artifacts/api-server/PUBLIC_API.md";

export const PUBLIC_API_DOCUMENTED_REST_ENDPOINTS = [
  "/documents",
  "/documents/{id}",
  "/documents/{id}/markdown",
  "/contracts",
  "/contracts/{id}",
  "/themes",
  "/themes/{id}",
  "/performance",
  "/pnrr",
] as const;

export const PUBLIC_API_DOCUMENTED_MCP_TOOLS = [
  "search_documents",
  "get_document",
  "get_document_markdown",
  "search_contracts",
  "get_contract",
  "list_themes",
  "get_theme",
  "list_performance",
  "list_pnrr",
] as const;

export const OPENDATA_DOCUMENTED_ENDPOINTS = [
  "/api/opendata/catalog.jsonld",
  "/api/opendata/datasets/{id}/dcat.jsonld",
  "/api/3/action/package_list",
  "/api/3/action/package_search",
  "/api/3/action/package_show",
  "/api/3/action/group_list",
  "/api/3/action/resource_show",
] as const;

export const DCAT_ENDPOINTS: CkanEndpoint[] = [
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
      "I metadati DCAT-AP_IT di un singolo dataset. {id} è l'identificativo numerico esposto dal catalogo locale.",
    params: "id numerico del dataset",
  },
];

export const CKAN_ENDPOINTS: CkanEndpoint[] = [
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
    example: "/api/3/action/package_show?id={sourceId|slug|id}",
    description:
      "Dettaglio di un dataset risolto per sourceId, slug o id numerico. Sostituisci il placeholder con un valore restituito da package_list o package_search.",
    params: "id · name_or_id",
  },
  {
    title: "group_list",
    example: "/api/3/action/group_list",
    description: "Elenco dei gruppi tematici del catalogo.",
  },
  {
    title: "resource_show",
    example: "/api/3/action/resource_show?id={resourceId}",
    description:
      "Dettaglio di una singola risorsa (file) di un dataset. Usa l'id numerico di una risorsa restituita da package_show.",
    params: "id numerico della risorsa",
  },
];

export const TRANSPARENCY_DATASETS: TransparencyDataset[] = [
  {
    datasetName: "Atti e documenti dell'Albo Pretorio",
    coverageStatus: "API pubblica + MCP",
    dataKindLabel: "Dato misto",
    sourceType: "ufficiale",
    sourceNote:
      "Metadati e allegati provenienti da pubblicazioni amministrative; link alla fonte ufficiale quando disponibile.",
    updateCadenceNote:
      "Segue le acquisizioni del portale; la pagina non introduce garanzie su completezza o tempestività.",
    fields:
      "id, progressivo, tipologia, categoria, provenienza, oggetto, date, registri, CUP, indicatori PNRR, allegati e stato del testo Markdown.",
    access:
      "REST: /api/public/v1/documents, /documents/{id}, /documents/{id}/markdown. MCP: search_documents, get_document, get_document_markdown.",
    knownLimits:
      "Il Markdown è un arricchimento tecnico disponibile solo per alcuni allegati; i file firmati o non testuali possono richiedere verifica sulla fonte ufficiale.",
    reuseExamples: [
      "ricerca testuale e per periodo degli atti pubblicati",
      "verifica puntuale del testo estratto rispetto all'allegato originale",
    ],
  },
  {
    datasetName: "Contratti pubblici",
    coverageStatus: "API pubblica + MCP",
    dataKindLabel: "Dato misto",
    sourceType: "ufficiale",
    sourceNote:
      "Contratti censiti a partire da dati ANAC e collegamenti interni a temi di monitoraggio quando presenti.",
    updateCadenceNote:
      "Aggiornamento legato alle procedure di importazione; eventuali scostamenti vanno verificati sulla fonte ufficiale.",
    fields:
      "id, titolo, descrizione, fornitore, importo, procedura, stato, CIG, CUP, stazione appaltante, link ANAC, tema, macrotema e coordinate se presenti.",
    access:
      "REST: /api/public/v1/contracts, /contracts/{id}. MCP: search_contracts, get_contract.",
    knownLimits:
      "Macrotemi, collegamenti a temi e coordinate sono livelli derivati o arricchiti e non sostituiscono la documentazione di gara.",
    reuseExamples: [
      "filtri per fornitore, procedura, importi e intervalli temporali",
      "collegamento prudente tra contratti e temi di monitoraggio",
    ],
  },
  {
    datasetName: "Temi di monitoraggio",
    coverageStatus: "API pubblica + MCP",
    dataKindLabel: "Dato derivato",
    sourceType: "redazionale",
    sourceNote:
      "Schede redazionali del portale costruite per raggruppare documenti e contratti pubblici rilevanti per la consultazione civica.",
    updateCadenceNote:
      "Aggiornamento redazionale; non rappresenta una classificazione ufficiale dell'ente.",
    fields:
      "id, titolo, slug, sintesi, categoria, stato, contatori civici, data aggiornamento e contratti collegati nel dettaglio.",
    access:
      "REST: /api/public/v1/themes, /themes/{id}. MCP: list_themes, get_theme.",
    knownLimits:
      "I collegamenti sono segnali di navigazione e monitoraggio, non valutazioni di responsabilità o irregolarità.",
    reuseExamples: [
      "navigazione per filoni amministrativi ricorrenti",
      "lettura contestuale dei contratti collegati a una scheda civica",
    ],
  },
  {
    datasetName: "Indicatori di performance",
    coverageStatus: "API pubblica + MCP",
    dataKindLabel: "Dato misto",
    sourceType: "derivata",
    sourceNote:
      "Categorie e indicatori con fonte dichiarata nei campi esposti dall'API quando disponibile.",
    updateCadenceNote:
      "Dipende dalla disponibilità delle serie e dagli aggiornamenti importati; usare periodo e fonte per interpretare ogni valore.",
    fields:
      "categoria, indicatore, descrizione, unità, fonte, URL fonte, polarità, ultimo valore e valore precedente con periodo.",
    access: "REST: /api/public/v1/performance. MCP: list_performance.",
    knownLimits:
      "Gli indicatori descrivono segnali e andamenti: non sono prove di qualità amministrativa né graduatorie ufficiali.",
    reuseExamples: [
      "consultazione dell'ultimo valore e del valore precedente",
      "lettura degli indicatori insieme a periodo, fonte e note disponibili",
    ],
  },
  {
    datasetName: "Progetti PNRR",
    coverageStatus: "API pubblica + MCP",
    dataKindLabel: "Dato ufficiale",
    sourceType: "ufficiale",
    sourceNote:
      "Censimento Attuazione citato nella documentazione API, con link sorgente del progetto quando presente.",
    updateCadenceNote:
      "Segue la disponibilità del censimento acquisito; stati e importi richiedono confronto con la scheda ufficiale più recente.",
    fields:
      "id, identificativo sorgente, URL, titolo, CUP, missione, componente, investimento, intervento, titolare, attuatore, importo, stato e date.",
    access: "REST: /api/public/v1/pnrr. MCP: list_pnrr.",
    knownLimits:
      "La presenza in API facilita il riuso ma non certifica avanzamento, rendicontazione o completamento del progetto.",
    reuseExamples: [
      "filtri per testo, missione o stato",
      "controllo dei riferimenti progettuali rispetto alla fonte ufficiale",
    ],
  },
  {
    datasetName: "Catalogo open data comunale",
    coverageStatus: "Sito/API di servizio",
    dataKindLabel: "Dato ufficiale",
    sourceType: "ufficiale",
    sourceNote:
      "Schede e risorse del catalogo open data comunale, ri-esposte come metadati DCAT-AP_IT e API compatibile CKAN.",
    updateCadenceNote:
      "Dipende dagli snapshot e dai metadati del catalogo monitorato; ogni dataset può avere periodicità diversa.",
    fields:
      "titolo, descrizione, tema, categoria, titolare, licenza, frequenza, date metadato, risorse e URL del portale.",
    access:
      "Sito/API di servizio: /opendata, /api/opendata/catalog.jsonld, /api/3/action/package_search e endpoint CKAN/DCAT elencati sotto.",
    knownLimits:
      "Non è incluso nella REST /api/public/v1 né nel MCP v0; le trasformazioni locali vanno confrontate con la scheda ufficiale del dataset.",
    reuseExamples: [
      "riuso dei metadati DCAT-AP_IT",
      "ricerca CKAN delle risorse tabellari disponibili",
    ],
  },
  {
    datasetName: "Feed e stato aggiornamenti",
    coverageStatus: "Sito o documentazione",
    dataKindLabel: "Dato derivato",
    sourceType: "derivata",
    sourceNote:
      "Sezioni pubbliche del sito dedicate a feed, avvisi e stato delle acquisizioni.",
    updateCadenceNote:
      "Mostra informazioni di servizio quando disponibili; non costituisce uno SLA di aggiornamento.",
    fields:
      "stato fonte, conteggi, ultime acquisizioni o link a feed secondo la sezione consultata.",
    access:
      "Pagina pubblica: /feeds. Non documentato come risorsa /api/public/v1 o tool MCP v0.",
    knownLimits:
      "Da usare come supporto alla verifica operativa, non come attestazione di completezza dei dati.",
    reuseExamples: [
      "verifica operativa dello stato delle acquisizioni quando presente",
      "supporto alla consultazione delle fonti monitorate",
    ],
  },
  {
    datasetName:
      "Accesso civico, segnalazioni, beni confiscati, bandi e organi",
    coverageStatus: "Da valutare",
    dataKindLabel: "Dato misto",
    sourceType: "redazionale",
    sourceNote:
      "Contenuti o sezioni citati nel perimetro informativo del sito, con sensibilità e granularità differenti.",
    updateCadenceNote:
      "Non viene definita qui una frequenza unica; eventuale esposizione API richiede valutazione puntuale.",
    fields:
      "Variabili a seconda della sezione: richieste, schede, documenti, scadenze, soggetti pubblici o riferimenti amministrativi.",
    access:
      "Non esposti nella REST pubblica /api/public/v1 né nel MCP v0 sulla base della documentazione presente.",
    knownLimits:
      "Possibile esclusione o rinvio per privacy, qualità dati, carico applicativo o prudenza civica; non vengono aggiunti nuovi endpoint in questa issue.",
    reuseExamples: [
      "inventario prudente delle aree da valutare prima di eventuali esposizioni future",
    ],
  },
];

export const REST_EXAMPLE = `curl "https://<host>/api/public/v1/documents?hasMarkdown=true&pageSize=5"`;

export const MCP_EXAMPLE = `curl -X POST "https://<host>/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`;
