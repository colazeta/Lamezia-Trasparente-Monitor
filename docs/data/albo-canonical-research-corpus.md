# Corpus canonico Albo Pretorio per uso di ricerca

Lamezia Trasparente tratta il sito pubblico come una proiezione dei dati, non come il luogo in cui nasce il modello informativo. Il primo contratto machine-readable di questo principio e' `albo-research-corpus.v1`, materializzato in `data/public/research/albo-canonical-current.json` e distribuito anche nel build Cloudflare.

## Obiettivo

Ogni record presente nello snapshot pubblico dell'Albo riceve una decisione tassonomica esplicita. Un record non scompare perche' non possiede un CIG o perche' non alimenta una pagina del sito. Gli esiti `not_applicable`, `unknown` e `review_required` sono informazione e vengono conservati nel corpus insieme agli esiti positivi.

Il corpus v1 e' deliberatamente limitato alla boundary `public_safe_snapshot`: non aumenta la visibilita' di atti minimizzati, metadata-only o esclusi e non recupera contenuti che la pipeline privacy ha trattenuto.

## Livelli mantenuti separati

Ogni record canonico distingue:

- `source_record`: campi public-safe conservati dalla fonte;
- `provenance`: fonte, URL, timestamp, hash, stato di verifica, visibilita' e rischio privacy;
- `taxonomy.existing`: classificazioni gia' presenti nell'Albo (settore, categoria, area tematica, azione di presentazione);
- `taxonomy.procurement`: classificazione procurement deterministica e versionata;
- `identifiers`: CIG e CUP estratti con metodo e provenance dichiarati nella tassonomia;
- `research_status`: decisione tassonomica e dettaglio della boundary sorgente.

La tassonomia procurement v1 (`municipal-procurement-lifecycle-it`, versione `2026-09-05.1`) separa tipo di documento, azioni amministrative, rilevanza procurement e fase del ciclo di vita. Il CIG e' un identificatore utile all'entity resolution, non il requisito per entrare nella tassonomia.

## Coverage ledger

`coverage` rende la completezza osservabile. Tra le metriche conservate:

- record dichiarati dalla fonte e record materializzati;
- riconciliazione dello snapshot;
- copertura della tassonomia;
- record public-safe eleggibili alle proiezioni;
- procurement `confirmed`, `possible`, `none`, `unknown` e `review_required`;
- record con CIG/CUP;
- candidati procurement pubblici;
- candidati con CIG;
- candidati procurement unresolved senza CIG;
- candidati procurement presenti nel corpus ma non eleggibili alla proiezione pubblica;
- distribuzioni per tipo documento, azione e fase procurement.

Una pipeline research-grade non puo' quindi confondere `0 record trovati` con `record non analizzati`: il secondo stato deve essere esplicito.

## Derivazione della sezione Contratti

La proiezione `lamezia-contracts-current.v2` parte dal corpus canonico. Gli atti `confirmed` o `possible` vengono prima identificati come candidati procurement. Solo dopo, i record con CIG possono essere materializzati nell'attuale entita' API `Contract`; quelli senza CIG restano in `unresolvedProcurementCandidates` e sono conteggiati nel coverage ledger.

Gli atti con lo stesso CIG vengono raggruppati in un solo contratto canonico e alimentano una storyline multi-evento. Una liquidazione o un SAL non crea quindi automaticamente un nuovo contratto solo perche' e' una nuova pubblicazione.

## Limiti della v1

Questa v1 non dichiara ancora completezza storica o completezza BDNCP. Restano necessari, in passaggi successivi:

1. corpus interno/raw precedente alla proiezione public-safe, mantenendo una netta separazione dalla pubblicazione;
2. estrazione strutturata e attestata da PDF/allegati pubblicabili, senza usare OCR come scorciatoia quando esiste testo nativo;
3. schema DB/API canonico per documenti, eventi, procedure, lotti, contratti, operatori, progetti e pagamenti;
4. discovery ANAC/BDNCP indipendente per stazione appaltante (CF `00301390795`), non limitata ai CIG gia' osservati nell'Albo;
5. backfill storico e snapshot versionati;
6. entity resolution deterministica e, dove necessario, probabilistica con confidence e revisione;
7. export di ricerca stabili (ad esempio Parquet/DuckDB) con data dictionary e versioni riproducibili.

Fino al completamento di questi passaggi, le metriche di coverage devono accompagnare ogni claim di completezza.
