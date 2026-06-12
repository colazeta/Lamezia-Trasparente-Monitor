# Integrazione Cruscotto Italia

Issue di riferimento: `#430`  
Stato: pianificata  
Tipo: fonte federata nazionale

## Sintesi

Cruscotto Italia va integrato in Lamezia Trasparente come fonte federata nazionale e tracciabile, non come iframe o semplice link esterno.

La piattaforma ricompone per codice ISTAT comunale dataset pubblici già prodotti da fonti istituzionali. Per Lamezia Terme il codice ISTAT operativo è `079160`.

## Perché serve

L'integrazione ha tre funzioni:

1. **Arricchimento**: porta dentro il monitor locale dati nazionali che oggi non sono sempre ingestiti.
2. **Verifica**: permette confronto tra dato locale e dato federato.
3. **Contesto civico**: aiuta a leggere contratti, PNRR, opere, territorio, servizi e demografia dentro un quadro comunale più ampio.

## Architettura proposta

```txt
Cruscotto Italia / AgID
        │
        │ download ZIP comune / shard JSON / interrogazione MCP per audit
        ▼
cruscotto:import
        │
        ├── snapshot grezzo versionato
        ├── inventario fonti/licenze/cadenze
        └── normalizzazione minima per Lamezia Terme (`079160`)
                │
                ▼
federated_context data-access layer
        │
        ├── UI Dossier Comune
        ├── REST `/api/public/v1/context/cruscotto-italia`
        ├── MCP `get_federated_context`
        └── report diff locale vs federato
```

## Decisione primaria

Non usare iframe come integrazione principale.

Un link alla pagina pubblica di Cruscotto Italia può restare come rimando utile, ma l'integrazione di prodotto deve portare i dati nel modello informativo di Lamezia Trasparente, con metadati fonte, licenza, data di estrazione, granularità, caveat e collegamento alla fonte primaria.

## Produzione: cache locale read-only

Per le pagine pubbliche non dipendere da chiamate live a Cruscotto Italia.

Usare invece:

- import periodico;
- ultimo snapshot valido;
- fallback controllato;
- badge di freschezza;
- report di errore se la fonte federata non è aggiornata.

Il MCP pubblico di Cruscotto Italia resta utile per esplorazione, audit e prototipazione, non come dipendenza runtime per ogni page view.

## Modello dati minimo

```ts
type FederatedSource = {
  id: string;
  provider: "Cruscotto Italia";
  primarySource: string;
  section: string;
  licence: string;
  updateFrequency?: string;
  extractedAt?: string;
  upstreamUpdatedAt?: string;
  granularity: "comunale" | "provinciale" | "regionale" | "subcomunale" | "puntuale" | "mista";
  caveat?: string;
};

type FederatedSnapshot = {
  comuneIstat: "079160";
  importedAt: string;
  cruscottoVersion?: string;
  sources: FederatedSource[];
  rawStorageKey?: string;
};

type FederatedSectionSummary = {
  section: string;
  title: string;
  metrics: Array<{
    key: string;
    label: string;
    value: string | number | null;
    unit?: string;
    sourceId: string;
    quality?: "ok" | "partial" | "missing" | "non_comunale";
  }>;
};
```

## Sezioni candidate

| Sezione Cruscotto | Uso in Lamezia Trasparente | Priorità |
|---|---|---:|
| Demografia ISTAT | Dossier Comune, Atlante urbano, normalizzatori per indicatori | alta |
| Redditi e fisco MEF | Contesto socioeconomico | media |
| SIOPE MEF/RGS | Contesto finanziario e domande civiche | alta |
| ANAC contratti | Audit locale vs federato | alta |
| BDAP-MOP opere | Contesto opere pubbliche e monitoraggio civico | alta |
| PNRR ReGiS | Audit locale vs federato | alta |
| Scuole MIUR | Servizi territoriali e Atlante | media |
| Sanità territoriale | Servizi territoriali | media |
| RUNTS | Terzo settore, coprogettazioni, contesto benefici pubblici | media |
| ASIA UL | Tessuto economico | media |
| Pendolarismo ISTAT | Mobilità e contesto urbano | media |
| Sezioni censuarie ISTAT | Atlante urbano e audit #417/#427 | alta |
| Beni culturali MiC | Contesto patrimonio culturale | bassa/media |
| Patrimonio PA MEF | Beni pubblici, audit inventario | media |
| ANNCSU civici | Geocodifica, indirizzi, qualità localizzazioni | alta |
| Catasto INSPIRE | Layer puntuale/tecnico, non MVP leggero | bassa per MVP |

## Endpoint REST proposti

```http
GET /api/public/v1/context/cruscotto-italia
GET /api/public/v1/context/cruscotto-italia/sources
GET /api/public/v1/context/cruscotto-italia/sections/{section}
GET /api/public/v1/context/cruscotto-italia/diff
```

Regole:

- read-only;
- envelope coerente con API pubblica;
- date in RFC 3339;
- `page` e `pageSize` per liste;
- nessuna scrittura;
- campi di provenance sempre disponibili.

## Tool MCP proposti

```txt
get_federated_context
get_cruscotto_section
compare_local_with_cruscotto
list_federated_sources
```

Regole:

- stessi dati della REST;
- stesso data-access layer;
- output con caveat;
- `isError: true` per sezione o dato assente;
- nessuna inferenza accusatoria.

## Diff locale vs federato

Formato minimo:

```ts
type FederatedDiff = {
  domain: "contracts" | "pnrr" | "works" | "performance" | "assets";
  localPresent: boolean;
  federatedPresent: boolean;
  localUpdatedAt?: string;
  federatedUpdatedAt?: string;
  primarySource: string;
  federatingSource: "Cruscotto Italia";
  differences: Array<{
    field: string;
    localValue?: string | number | null;
    federatedValue?: string | number | null;
    severity: "info" | "verify" | "ignore";
    note: string;
  }>;
  recommendedAction: "ok" | "verify" | "integrate" | "ignore_with_reason";
};
```

## UI proposta

Aggiungere una sezione “Dati federati / Cruscotto Italia” dentro il Dossier Comune.

Ogni card deve mostrare:

- valore;
- unità;
- fonte primaria;
- fonte federatrice;
- data aggiornamento;
- granularità;
- caveat breve;
- link a dettaglio o diff quando disponibile.

## Test minimi

- parsing snapshot;
- metadati fonte obbligatori;
- import idempotente;
- assenza dati;
- granularità non comunale;
- licenze presenti;
- REST envelope;
- MCP `isError`;
- diff senza falsi positivi;
- UI con badge fonte/caveat.

## Criteri di accettazione MVP

- audit documentato per `079160`;
- cache locale read-only;
- almeno 6 KPI federati utili;
- fonte primaria e federatrice visibili per ogni KPI;
- almeno un dominio confrontato localmente;
- almeno un endpoint REST pubblico;
- almeno un tool MCP;
- nessuno score automatico;
- documentazione aggiornata in `docs/integrations/source-inventory.md`.
