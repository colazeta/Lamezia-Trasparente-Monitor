# API pubblica — rendiamoLameziaTrasparente

API pubblica, documentata e **in sola lettura** per interrogare i dati civici
della piattaforma di trasparenza di Lamezia Terme: atti dell'Albo Pretorio (con
testo pulito in Markdown), contratti pubblici (ANAC), temi di monitoraggio,
indicatori di performance e progetti PNRR.

È pensata per giornalisti, ricercatori, sviluppatori civici e assistenti AI. Non
richiede autenticazione: espone solo dati già pubblici. Tutte le operazioni di
scrittura restano sui canali interni protetti e non fanno parte di questa API.

Sono disponibili due superfici sugli **stessi dati**:

1. **REST** con paginazione e filtri, montata su `/api/public/v1`.
2. **MCP** (Model Context Protocol) per assistenti AI, su `/api/mcp`.

## Base URL

```
https://<host>/api/public/v1
```

L'indice della API (discovery) è disponibile alla radice e descrive risorse,
documentazione ed endpoint MCP:

```
GET /api/public/v1/
```

La specifica **OpenAPI 3.1** completa è auto-ospitata:

```
GET /api/public/v1/openapi.json
```

## Paginazione

Tutti gli endpoint di elenco accettano:

| Parametro  | Tipo    | Default | Note           |
| ---------- | ------- | ------- | -------------- |
| `page`     | integer | `1`     | Pagina 1-based |
| `pageSize` | integer | `20`    | Massimo `100`  |

e restituiscono una busta uniforme:

```json
{
  "data": [
    /* ... */
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 242, "totalPages": 13 }
}
```

## Endpoint REST

### Atti (Albo Pretorio)

- `GET /documents` — elenco con filtri:
  - `q` — ricerca testuale su oggetto e tipologia
  - `category` — `albo`, `delibera`, `convocazione`, `ordinanza`
  - `tipologia` — tipologia esatta dell'atto
  - `from`, `to` — intervallo di pubblicazione (`YYYY-MM-DD`)
  - `isPnrr` — solo atti collegati al PNRR (`true`/`false`)
  - `hasMarkdown` — solo atti con testo Markdown estratto (`true`/`false`)
- `GET /documents/{id}` — dettaglio di un atto (metadati + allegati)
- `GET /documents/{id}/markdown` — testo pulito in Markdown estratto
  dall'allegato PDF principale.
  - Default: JSON `{ id, progressivo, oggetto, markdownSource, markdownExtractedAt, markdown }`
  - Con `?format=md`: risposta diretta `text/markdown`

Ogni allegato espone sia il link al portale ufficiale (`officialUrl`) sia, quando
disponibile, la copia archiviata sulla piattaforma (`archivedUrl`).

### Contratti pubblici (ANAC)

- `GET /contracts` — elenco con filtri:
  - `q` — ricerca su titolo, descrizione, fornitore, CIG
  - `supplier` — filtro per fornitore (parziale)
  - `procedureType` — tipo di procedura
  - `macrotema` — ambito di spesa
  - `minAmount`, `maxAmount` — intervallo di importo (euro)
  - `from`, `to` — intervallo data di aggiudicazione (`YYYY-MM-DD`)
  - `themeId` — contratti collegati a un tema
- `GET /contracts/{id}` — dettaglio di un contratto

### Temi di monitoraggio

- `GET /themes` — elenco con filtri `q`, `categoryId`, `status`
  (`aperto`, `in_corso`, `monitoraggio`, `chiuso`)
- `GET /themes/{id}` — dettaglio con descrizione estesa e contratti collegati

### Performance

- `GET /performance` — categorie e indicatori, ciascun indicatore con
  `latestValue` e `previousValue` (valore + periodo)

### PNRR

- `GET /pnrr` — elenco progetti del censimento Attuazione, con filtri `q`,
  `mission`, `status`

## Esempi (curl)

```bash
# Ultimi atti con testo estratto
curl "https://<host>/api/public/v1/documents?hasMarkdown=true&pageSize=5"

# Markdown di un atto come testo
curl "https://<host>/api/public/v1/documents/242/markdown?format=md"

# Contratti sopra i 100.000 € aggiudicati nel 2026
curl "https://<host>/api/public/v1/contracts?minAmount=100000&from=2026-01-01"

# Specifica OpenAPI
curl "https://<host>/api/public/v1/openapi.json"
```

## Catalogo OpenData (DCAT-AP_IT e CKAN)

Il catalogo OpenData locale è esposto in sola lettura su endpoint separati dalla
REST civica `/api/public/v1`. Non richiede autenticazione e mantiene envelope o
formati compatibili con gli standard indicati.

### Metadati DCAT-AP_IT

- `GET /api/opendata/catalog.jsonld` — catalogo completo in JSON-LD
  (`application/ld+json`).
- `GET /api/opendata/datasets/{id}/dcat.jsonld` — metadati JSON-LD di un
  singolo dataset. `{id}` è l'identificativo numerico del dataset nel catalogo
  locale.

### API CKAN compatibile (Action API)

- `GET /api/3/action/package_list` — elenco degli slug dei dataset.
- `GET /api/3/action/package_search?q=bilancio&rows=10` — ricerca con envelope
  CKAN `{ help, success, result }`; supporta `q`, `fq=groups:...`, `groups`,
  `rows` e `start`.
- `GET /api/3/action/package_show?id={sourceId|slug|id}` — dettaglio dataset
  per `sourceId`, slug o id numerico; è disponibile anche il parametro
  `name_or_id`.
- `GET /api/3/action/group_list` — elenco dei gruppi/categorie.
- `GET /api/3/action/resource_show?id={resourceId}` — dettaglio di una risorsa
  con id numerico restituito dal dettaglio del dataset.

Esempi:

```bash
# Catalogo DCAT-AP_IT completo
curl -H "Accept: application/ld+json" "https://<host>/api/opendata/catalog.jsonld"

# Ricerca CKAN compatibile
curl -H "Accept: application/json" "https://<host>/api/3/action/package_search?q=bilancio&rows=10"

# Dettaglio dataset: sostituire il placeholder con un sourceId, slug o id numerico
curl -H "Accept: application/json" "https://<host>/api/3/action/package_show?id={sourceId|slug|id}"
```

## Server MCP (per assistenti AI)

La piattaforma espone un server compatibile **MCP** sugli stessi dati, su
trasporto **Streamable HTTP** in modalità _stateless_ (nessuna sessione
persistente: ogni richiesta è autosufficiente). Non servono API key o header
`Authorization`; i client devono inviare `Content-Type` e `Accept` coerenti con
il trasporto MCP.

```
POST /api/mcp
Content-Type: application/json
Accept: application/json, text/event-stream
```

### Tool disponibili (sola lettura)

| Tool                    | Descrizione                                              |
| ----------------------- | -------------------------------------------------------- |
| `search_documents`      | Cerca/filtra gli atti (stessi filtri di `/documents`)    |
| `get_document`          | Dettaglio di un atto per `id`                            |
| `get_document_markdown` | Testo Markdown di un atto per `id`                       |
| `search_contracts`      | Cerca/filtra i contratti (stessi filtri di `/contracts`) |
| `get_contract`          | Dettaglio di un contratto per `id`                       |
| `list_themes`           | Elenca i temi di monitoraggio                            |
| `get_theme`             | Dettaglio di un tema con i contratti collegati           |
| `list_performance`      | Categorie e indicatori di performance                    |
| `list_pnrr`             | Elenca i progetti PNRR                                   |

I tool di elenco restituiscono la stessa busta paginata della REST. I tool di
dettaglio restituiscono un risultato con `isError: true` quando l'entità non
esiste.

### Esempi (curl)

```bash
# 1) Handshake initialize (senza sessione persistente)
curl -X POST "https://<host>/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"demo","version":"1.0"}}}'

# 2) Elenca i tool con gli stessi header richiesti
curl -X POST "https://<host>/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# 3) Chiama un tool con gli stessi header richiesti
curl -X POST "https://<host>/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_documents","arguments":{"hasMarkdown":true,"pageSize":3}}}'
```

### Configurazione in un client MCP

```json
{
  "mcpServers": {
    "lamezia-trasparente": {
      "url": "https://<host>/api/mcp",
      "transport": "streamable-http"
    }
  }
}
```

## Estrazione del testo (Markdown)

Per gli atti con un allegato PDF non firmato, la piattaforma estrae in modo
best-effort il testo e lo ripulisce in Markdown, con un'intestazione di metadati
(tipologia, progressivo, date, provenienza, link alla fonte) seguita dal corpo
del documento. Il testo è disponibile via `GET /documents/{id}/markdown` e via il
tool MCP `get_document_markdown`. Gli allegati firmati `.p7m` non vengono
elaborati.
