# Architettura delle integrazioni dati

Questo documento spiega come le varie fonti alimentano Lamezia Trasparente e quali regole devono rispettare le integrazioni esistenti e future.

## Obiettivo

Evitare che il progetto diventi una collezione disordinata di scraper, route e pagine. Ogni integrazione deve essere leggibile lungo una catena completa:

```txt
Fonte → acquisizione → normalizzazione → persistenza → data-access → API/MCP/UI → audit → caveat
```

## Ciclo di vita di una integrazione

### 1. Inventario fonte

Prima di scrivere codice, censire:

- nome fonte;
- ente titolare;
- URL ufficiale;
- formato;
- licenza;
- frequenza di aggiornamento;
- copertura territoriale;
- granularità;
- eventuali limitazioni tecniche;
- eventuali caveat metodologici.

La fonte va registrata in `docs/integrations/source-inventory.md`.

### 2. Acquisizione

L'acquisizione può avvenire tramite endpoint API, CSV/JSON/XML/XLSX pubblici, feed specifici, download bulk, import manuale controllato, cache locale da fonte federata o contributo redazionale/civico.

Ogni importer deve essere idempotente. A parità di fonte e identificativo, rieseguire la pipeline non deve duplicare righe né perdere arricchimenti manuali.

### 3. Snapshot grezzo

Per fonti sensibili, fragili o federate, conservare uno snapshot grezzo o un riferimento riproducibile:

```ts
type RawSnapshot = {
  sourceId: string;
  fetchedAt: string;
  upstreamUrl: string;
  storageKey?: string;
  checksum?: string;
  licence?: string;
};
```

Non tutte le fonti richiedono snapshot permanente, ma la decisione deve essere esplicita.

### 4. Normalizzazione

La normalizzazione deve convertire formati e date, validare identificativi, associare il codice ISTAT comunale quando disponibile, separare dato grezzo da dato interpretato, assegnare quality flag e conservare riferimenti alla fonte ufficiale.

Per JSON pubblici usare campi `camelCase`, salvo quando si espone intenzionalmente il raw upstream.

### 5. Persistenza

Usare PostgreSQL/Drizzle per dati interrogabili e object storage per allegati, copie archiviate, snapshot, export e payload federati pesanti.

Le migrazioni sono l'unico meccanismo sicuro per la produzione. In dev si può usare `push`, ma non va trattato come pratica di produzione.

### 6. Data-access layer

Quando REST e MCP espongono lo stesso dominio, devono condividere un data-access layer.

Pattern corretto:

```txt
routes/public.ts      ┐
mcpServer.ts          ├── publicData.ts ── database / storage / mapper
routes/frontend.ts    ┘
```

Pattern da evitare:

```txt
REST query SQL A
MCP query SQL B
UI query SQL C
```

La duplicazione crea divergenze semantiche.

### 7. Pubblicazione

Le superfici pubbliche devono essere read-only, paginabili dove esiste elenco, documentate, stabili nei nomi e chiare su fonte e aggiornamento.

Superfici attese:

- UI web;
- API REST;
- MCP;
- OpenData/DCAT/CKAN quando il dataset è riusabile;
- export quando utile.

### 8. Audit e health

Ogni fonte dovrebbe esporre almeno ultimo aggiornamento riuscito, ultimo errore, conteggio record importati, conteggio record scartati, data upstream se disponibile, note su copertura e qualità.

Gli endpoint di health non devono nascondere il problema: devono distinguere disponibilità del processo, stato migrazioni e freschezza delle fonti.

## Template obbligatorio per documentare una integrazione

Ogni nuova fonte dovrebbe avere una sezione o file con questa struttura:

```md
# Nome integrazione

## Stato
planned | active | experimental | deprecated

## Fonte primaria
- Ente:
- URL:
- Licenza:
- Frequenza:
- Granularità:

## Scopo nel prodotto
Perché serve e quali domande aiuta a rispondere.

## Acquisizione
Formato, endpoint, credenziali se pubbliche/private, limiti, retry, cache.

## Normalizzazione
Campi principali, identificativi, mapping, quality flag.

## Persistenza
Tabelle, object storage, snapshot, migrazioni.

## Superfici
UI, REST, MCP, OpenData, export.

## Caveat
Limiti di copertura, dati assenti, granularità non comunale, geocodifica incerta.

## Test
Parsing, idempotenza, null, errori fonte, envelope API, autorizzazioni.

## Runbook
Comandi, job schedulati, recovery, stop conditions.
```

## Pattern specifici già presenti

### Albo Pretorio

- fonte Tinn;
- feed lista;
- detail API per allegati;
- archiviazione best-effort su object storage;
- fallback al link ufficiale.

### Contratti pubblici

- feed L.190/2012;
- ingestion solo CIG;
- seed controllati per analytics strutturate;
- enrichment conservativo da oggetto testuale;
- distinzione tra righe seed e righe live.

### API pubblica + MCP

- due superfici sugli stessi dati;
- REST paginata;
- MCP stateless;
- tool read-only;
- detail tool con `isError: true` quando l'entità non esiste.

### OpenData

- DCAT-AP_IT JSON-LD;
- CKAN Action API read-only;
- endpoint separati dalla REST civica;
- pensato per federazione e riuso.

### Cruscotto Italia

- fonte federata nazionale;
- non sostituisce le ingestion locali;
- utile per contesto, audit e confronto;
- va cacheata localmente per uso produttivo.

## Regole per evitare integrazioni fragili

- Non dipendere da una chiamata live esterna per rendere una pagina principale.
- Non mescolare dati comunali, provinciali e regionali senza badge di granularità.
- Non convertire differenze tra fonti in anomalie o accuse.
- Non trattare un dato assente come zero.
- Non sovrascrivere campi manuali con import automatici.
- Non pubblicare endpoint privi di documentazione.
- Non aggiungere tool MCP che fanno scritture.
- Non esporre segreti nel frontend.
