# Architettura di Lamezia Trasparente

Stato: documento architetturale operativo.  
Ambito: componenti, integrazioni dati, superfici pubbliche, governance tecnica.

## Scopo

Lamezia Trasparente è una piattaforma civica di trasparenza per il Comune di Lamezia Terme. Aggrega, normalizza e rende interrogabili dati pubblici relativi ad Albo Pretorio, contratti pubblici, PNRR, performance, bandi, beni confiscati, open data, monitoraggio civico e fonti federate nazionali.

Il principio architetturale è semplice: ogni informazione deve restare collegata alla fonte, alla data di acquisizione, alla granularità e ai caveat metodologici. La piattaforma non deve trasformare differenze tra fonti in accuse, anomalie o giudizi automatici.

## Vista logica

```txt
Fonti pubbliche / fonti locali / redazione / cittadini
        │
        ▼
Acquisizione dati
- ingestion worker schedulato
- ingestion integrata nell'API server quando abilitata
- import manuali controllati
- cache federate esterne
        │
        ▼
Normalizzazione e qualità
- parsing
- validazione
- idempotenza
- deduplicazione
- provenance
- caveat metodologici
        │
        ▼
Persistenza
- PostgreSQL / Drizzle
- object storage per allegati e copie archiviate
- snapshot grezzi per audit quando necessario
        │
        ▼
Data-access layer
- mapper
- filtri
- paginazione
- controlli di visibilità
- modelli pubblici stabili
        │
        ├──────────────► REST pubblica read-only
        ├──────────────► MCP read-only per assistenti AI
        ├──────────────► UI web React/Vite
        ├──────────────► mobile Expo
        └──────────────► catalogo OpenData DCAT-AP_IT / CKAN compatibile
```

## Componenti principali

| Componente | Ruolo | Regola architetturale |
|---|---|---|
| Frontend web | Navigazione pubblica, mappe, schede, export | Statico; non contiene segreti, credenziali DB o logica server-only |
| API server | REST, MCP, health, route pubbliche/interne | Espone dati, applica migrazioni, usa data-access layer condivisi |
| Ingestion worker | Esegue cicli schedulati di acquisizione | Non duplica i crawler: riusa la pipeline server quando possibile |
| PostgreSQL | Fonte persistente normalizzata | Schema governato da Drizzle e migrazioni |
| Object storage | Allegati, archivi, snapshot, export | Conserva copie con provenance e fallback alla fonte ufficiale |
| OpenAPI | Contratto API interna/client | Fonte di verità per client generati, dove applicabile |
| API pubblica + MCP | Accesso read-only per riuso e assistenti AI | Devono restare sincronizzati usando lo stesso data-access layer |
| Catalogo OpenData | Federazione e riuso | DCAT-AP_IT JSON-LD e CKAN Action API read-only |

## Classi di integrazione

### 1. Ingestion diretta da fonte istituzionale

Usata quando esiste una fonte pubblica leggibile automaticamente: feed Albo Pretorio, dataset PNRR, dataset ISTAT, ANBSC, dati ANAC o L.190. Le regole minime sono fonte ufficiale conservata, parsing idempotente, aggiornamento non distruttivo, provenance obbligatoria e fallimenti isolati.

### 2. Enrichment e archiviazione documentale

Usata per allegati, PDF, testo Markdown, copie archiviate e metadati derivati. La copia archiviata non sostituisce il link ufficiale: lo affianca. L'estrazione del testo è best-effort e va dichiarata come tale.

### 3. Dataset seed/manuale con incremento live

Usata quando la fonte live è incompleta o non strutturata ma esiste una base controllata. I dati seed, manuali e live devono restare distinguibili. L'import automatico non deve sovrascrivere scelte redazionali o correzioni manuali.

### 4. Fonte federata nazionale

Usata quando una piattaforma esterna ricompone fonti primarie ufficiali per comune, come Cruscotto Italia. La fonte federatrice non diventa fonte primaria unica: vanno conservate fonte originaria, fonte federatrice, licenza, granularità, data e caveat.

### 5. Redazione e monitoraggio civico

Usata per contenuti editoriali, requisiti, monitoraggio civico e segnalazioni. Le segnalazioni cittadine non sono fatti accertati; i testi editoriali non sono dati fonte; gli score compositi richiedono metodologia autonoma.

## Regole non negoziabili

1. Ogni dato pubblico deve poter risalire alla fonte.
2. Ogni integrazione deve dichiarare granularità, frequenza, licenza e qualità.
3. REST pubblica e MCP devono essere read-only.
4. REST e MCP devono usare lo stesso data-access layer quando interrogano gli stessi dati.
5. Le ingestion devono essere idempotenti.
6. Le pipeline non devono distruggere dati manuali o seed senza migrazione esplicita.
7. Gli allegati archiviati non sostituiscono il link ufficiale.
8. Le mappe e gli indicatori territoriali devono mostrare caveat su denominatori, geocodifica e sezioni non residenziali.
9. Gli output AI o MCP devono essere presentati come assistenza all'interrogazione, non come accertamento.
10. Ogni nuova integrazione deve aggiornare l'inventario fonti.

## Source of truth documentali

| Ambito | Documento o path |
|---|---|
| Architettura generale | `docs/architecture.md` |
| Integrazioni | `docs/integrations/README.md` |
| Inventario fonti | `docs/integrations/source-inventory.md` |
| Cruscotto Italia | `docs/integrations/cruscotto-italia.md` |
| Best practice AgID | `docs/agid-interoperability-checklist.md` |
| API pubblica REST + MCP | `artifacts/api-server/PUBLIC_API.md` |
| Deploy frontend | `docs/frontend-deployment.md` |
| Deploy backend | `docs/backend-deployment.md` |

## Definition of done per una nuova integrazione

Una nuova integrazione non è completa finché non esistono fonte primaria, licenza, frequenza attesa, proprietario del dato, granularità, formato sorgente, importer o modalità di acquisizione, strategia di retry/cache, schema normalizzato, campi di provenance, endpoint o UI che la espongono, test minimi, caveat metodologici e voce nell'inventario fonti.
