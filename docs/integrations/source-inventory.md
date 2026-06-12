# Inventario fonti e pipeline

Questo inventario è il registro operativo delle fonti che alimentano o alimenteranno Lamezia Trasparente.

Legenda stato:

- `active`: integrazione già presente o documentata nel progetto;
- `planned`: integrazione pianificata;
- `experimental`: integrazione da validare;
- `manual/editorial`: contenuto governato da redazione o moderazione;
- `federated`: fonte esterna che ricompone dati primari.

| Area | Fonte primaria / federata | Stato | Acquisizione | Persistenza | Superfici | Caveat principali |
|---|---|---:|---|---|---|---|
| Albo Pretorio | Portale Tinn Albo Pretorio Comune di Lamezia Terme | active | feed lista + detail API JSON per allegati | DB + object storage per copie archiviate | UI, REST `/documents`, MCP `search_documents` / `get_document` | allegati best-effort; `.p7m` non sempre elaborabili; conservare sempre `officialUrl` |
| Allegati Albo | Tinn detail/download allegati | active | chiamate per atto con header `Accept: application/json`; download binario | object storage + jsonb allegati | UI atto, REST dettaglio | fallback obbligatorio a link ufficiale |
| Contratti pubblici | Feed L.190/2012 Tinn + righe seed in formato ANAC | active | XML L.190; import solo record con CIG; seed per dati strutturati | tabella contratti | UI, REST `/contracts`, MCP `search_contracts` / `get_contract` | il feed contiene anche atti non contrattuali; non usare keyword generiche; CIG-only |
| PNRR | Italia Domani / ReGiS, censimento progetti Comune | active | CSV/dataset pubblico o override configurati | DB | UI, REST `/pnrr`, MCP `list_pnrr` | verificare sempre snapshot, data e ruolo del Comune |
| Performance | ISTAT SDMX + valori manuali | active | import SDMX CSV + manual override | DB | UI, REST `/performance`, MCP `list_performance` | non sovrascrivere valori manuali; ambienti isolati possono non raggiungere ISTAT |
| Temi di monitoraggio | Redazione + collegamenti a contratti/PNRR | manual/editorial | seed/manuale; associazioni CIG/CUP | DB | UI, REST `/themes`, MCP `list_themes` / `get_theme` | distinguere commento editoriale da dato fonte |
| Bandi | Catalogo avvisi pubblici + cross-match | active | fonte locale/manuale e match con albo/contratti/PNRR | DB | UI | stime e collegamenti devono essere dichiarati come tali |
| Beni confiscati | ANBSC Open Data | active | dataset pubblico filtrato per Comune | DB + mappa | UI, API dedicate | qualità indirizzi/geocodifica da verificare |
| OpenData locale | Dataset pubblicati dalla piattaforma | active | catalogazione interna | DB + endpoint JSON-LD | DCAT-AP_IT, CKAN Action API read-only, UI | mappare temi/frequenze solo se aderenti a vocabolari noti |
| API pubblica | Dati civici normalizzati | active | data-access layer condiviso | DB | REST `/api/public/v1` | read-only; envelope e paginazione uniformi |
| MCP Lamezia | Stessi dati della REST pubblica | active | data-access layer condiviso | DB | `/api/mcp` Streamable HTTP stateless | tool read-only; nessuna sessione persistente |
| Monitoraggio civico | Segnalazioni cittadine moderate | manual/editorial | upload e moderazione | DB + object storage | UI, sezioni contratto/PNRR | non equiparare segnalazione a fatto accertato |
| Legalità e trasparenza | Sezione editoriale manuale | manual/editorial | redazione | DB | UI/API dedicate | nessuno score automatico senza metodologia autonoma |
| Cruscotto Italia | AgID / Cruscotto Italia come fonte federata nazionale | planned/federated | cache locale per `079160`; eventuale ZIP/shard JSON o MCP per audit | snapshot grezzo + dati normalizzati federati | Dossier Comune, REST context, MCP federated tools | fonte federatrice, non fonte primaria unica; granularità mista |
| Atlante urbano | ISTAT Basi territoriali e variabili censuarie 2021 | planned | import riproducibile, filtro Comune, geometrie leggere | GeoJSON/object storage o DB | UI mappe, export, API GIS | denominatori piccoli; sezioni non residenziali; no score di rischio |
| Overlay trasparenza | Contratti, PNRR, beni confiscati, interventi su sezioni censuarie | planned | aggregazione spaziale offline o PostGIS se necessario | DB/GeoJSON | Atlante urbano fase 2 | distinguere geocodifica certa, approssimata e assente |

## Campi minimi di provenance

Ogni record importato o pubblicato dovrebbe poter esporre, direttamente o indirettamente:

```ts
type SourceProvenance = {
  sourceId: string;
  primarySource: string;
  federatingSource?: string;
  upstreamUrl?: string;
  officialUrl?: string;
  archivedUrl?: string;
  licence?: string;
  updateFrequency?: string;
  extractedAt?: string;
  upstreamUpdatedAt?: string;
  granularity: "comunale" | "provinciale" | "regionale" | "subcomunale" | "puntuale" | "mista" | "editoriale";
  qualityFlags?: string[];
  caveat?: string;
};
```

## Campi da evitare senza motivazione

- `riskScore`
- `legalitaScore`
- `alertScore`
- `anomalia`
- `sospetto`
- `irregolare`

Questi concetti richiedono metodologia autonoma, revisione e documentazione pubblica. Le integrazioni dati devono produrre fatti, contesto e differenze verificabili, non giudizi automatici.
