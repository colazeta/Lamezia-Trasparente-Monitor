# Checklist interoperabilità AgID per Lamezia Trasparente

Questa checklist traduce nel contesto del progetto le buone pratiche AgID sul modello di interoperabilità, sugli e-service e sulle API.

Riferimenti operativi:

- Linee Guida sull'interoperabilità tecnica delle Pubbliche Amministrazioni, repository `italia/lg-modellointeroperabilita-docs`.
- Documento operativo “Pattern sicurezza”.
- Documento operativo “Raccomandazioni di implementazione”.
- Cataloghi e profili dati pubblici: DCAT-AP_IT, CKAN-style API, vocabolari e ontologie nazionali quando applicabili.

## 1. API-first e confini di dominio

- [ ] Ogni servizio dati esposto pubblicamente deve avere un'interfaccia documentata.
- [ ] Il frontend non deve incorporare segreti, credenziali o logica di ingestion.
- [ ] API server, frontend statico e ingestion worker devono restare unità di deploy distinte.
- [ ] Le integrazioni interne devono essere progettate come servizi riusabili, non come logica sparsa nelle pagine.

Applicazione a Lamezia Trasparente:

- `lib/api-spec/openapi.yaml` resta fonte di verità per il contratto API interna/codegen.
- `artifacts/api-server/PUBLIC_API.md` documenta la superficie pubblica REST + MCP.
- `docs/integrations/README.md` documenta il ciclo fonte → pipeline → pubblicazione.

## 2. E-service, ruoli e responsabilità

Per ogni integrazione dichiarare:

- erogatore della fonte;
- fruitore;
- eventuale fonte federatrice;
- owner interno;
- responsabilità sui caveat;
- canale di pubblicazione.

Esempio:

```txt
Fonte primaria: Ministero / Autorità / Comune
Fonte federatrice: Cruscotto Italia, se presente
Fruitore: Lamezia Trasparente
Pubblico finale: cittadini, giornalisti, ricercatori, assistenti AI
```

## 3. Progettazione resource-oriented

Per le API REST pubbliche:

- [ ] usare risorse, non verbi procedurali inutili;
- [ ] usare metodi HTTP coerenti;
- [ ] mantenere le superfici pubbliche read-only salvo decisione motivata;
- [ ] paginare gli elenchi;
- [ ] usare path descrittivi;
- [ ] evitare endpoint duplicati che restituiscono la stessa cosa con semantica diversa.

Esempi coerenti:

```http
GET /api/public/v1/documents
GET /api/public/v1/contracts
GET /api/public/v1/pnrr
GET /api/public/v1/context/cruscotto-italia/sources
```

## 4. Descrittori e documentazione

Ogni endpoint o tool MCP deve avere:

- scopo;
- parametri;
- risposta;
- errori;
- fonte dati;
- caveat;
- esempi.

Per le API pubbliche aggiornare:

- `artifacts/api-server/PUBLIC_API.md`;
- eventuale OpenAPI pubblica auto-ospitata;
- `docs/integrations/source-inventory.md`.

## 5. Qualità del servizio

Per ogni fonte e servizio pubblico considerare:

- disponibilità;
- accessibilità;
- prestazioni;
- affidabilità;
- scalabilità;
- sicurezza;
- stato aggiornamento.

Implementazioni consigliate:

- `GET /api/healthz`;
- `GET /api/healthz/migrations`;
- endpoint o report su freshness delle fonti;
- log strutturati;
- retry/backoff per ingestion;
- ultimo snapshot valido per fonti federate;
- fallimento isolato della singola fonte, non blocco globale quando possibile.

## 6. Logging

I log devono aiutare audit e recovery, senza esporre segreti.

Campi minimi consigliati:

```ts
type IntegrationLogEvent = {
  timestamp: string;
  sourceId: string;
  operation: string;
  outcome: "success" | "partial" | "failed" | "skipped";
  recordsRead?: number;
  recordsWritten?: number;
  recordsSkipped?: number;
  requestId?: string;
  errorCode?: string;
  errorMessage?: string;
};
```

Regole:

- non loggare password, token, chiavi private o Authorization header;
- loggare esito e sourceId;
- separare errore fonte, errore parsing, errore schema, errore rete;
- conservare informazioni sufficienti a riprodurre il problema.

## 7. Formati dati

Regole da applicare alle API e ai dataset pubblici:

- usare `application/json` per JSON;
- usare `application/ld+json` per DCAT-AP_IT;
- usare `application/problem+json` se si adotta un formato errore standard;
- date in RFC 3339;
- durate in secondi o ISO 8601;
- importi con valuta esplicita quando necessario;
- UTF-8;
- evitare media type custom non necessari.

## 8. Naming

Regole:

- usare nomi auto-descrittivi;
- evitare acronimi non universali;
- non mescolare `snake_case` e `camelCase` nello stesso contratto;
- per API JSON TypeScript-facing preferire `camelCase`;
- mantenere i nomi raw upstream solo dentro snapshot o campi esplicitamente raw.

Esempio:

```json
{
  "primarySource": "ANAC",
  "federatingSource": "Cruscotto Italia",
  "extractedAt": "2026-06-12T10:00:00Z",
  "updateFrequency": "monthly"
}
```

## 9. Sicurezza

- [ ] pubblico read-only senza credenziali quando espone solo dati già pubblici;
- [ ] scritture e moderazione dietro autenticazione/autorizzazione;
- [ ] token ingest solo server-side;
- [ ] nessun segreto nel frontend;
- [ ] permessi minimi sul DB;
- [ ] object storage con percorsi pubblici/privati separati;
- [ ] fallback controllati, non silenziosi;
- [ ] CORS consapevole nel deploy.

## 10. Semantica, metadati e riuso

Ogni dataset riusabile deve dichiarare:

- titolo;
- descrizione;
- fonte;
- licenza;
- data aggiornamento;
- frequenza;
- tema;
- formato;
- URL download/API;
- qualità e caveat.

Per OpenData mantenere:

- DCAT-AP_IT JSON-LD;
- CKAN Action API compatibile read-only;
- mapping a vocabolari noti quando possibile;
- niente valori inventati se il mapping non esiste.

## 11. Dati federati

Per fonti come Cruscotto Italia:

- distinguere fonte primaria da fonte federatrice;
- mantenere link alla fonte primaria;
- indicare granularità;
- indicare frequenza;
- indicare data estrazione;
- non correggere silenziosamente la fonte;
- mostrare caveat nella UI e nell'API;
- usare cache locale per produzione.

## 12. MCP e assistenti AI

Regole aggiuntive:

- tool read-only;
- descrizioni chiare;
- niente operazioni distruttive;
- stessi dati della REST quando il dominio è lo stesso;
- output con fonti e caveat;
- errori espliciti;
- nessuna accusa o anomalia automatica;
- nessun dato personale non necessario.

## 13. Indicatori, mappe e score

- [ ] dichiarare numeratore e denominatore;
- [ ] indicare unità;
- [ ] gestire denominatori piccoli;
- [ ] distinguere zero, null e non disponibile;
- [ ] evitare colori o testi che suggeriscono colpa o rischio senza metodologia;
- [ ] separare indicatori descrittivi da indicatori valutativi;
- [ ] pubblicare metodologia prima di qualunque indice composito.

## 14. Definition of done per integrazione

Una integrazione è pronta solo se:

- [ ] è nell'inventario fonti;
- [ ] ha fonte, licenza, granularità e cadenza;
- [ ] ha importer idempotente o procedura manuale documentata;
- [ ] ha test minimi;
- [ ] ha caveat;
- [ ] aggiorna API/MCP/UI/documentazione se esposta;
- [ ] non espone segreti;
- [ ] non sovrascrive manualità;
- [ ] ha criterio di rollback o recovery;
- [ ] ha almeno un controllo di freshness o audit.
