# Assessment di armonizzazione concettuale

Issue #1115, 7 settembre 2026. Evidenze: schema e codice della baseline `0d561894b78c47c82ee4c1fae2d650e2cf8a9739`, conteggi PostgreSQL eseguiti in sola lettura durante questa revisione, [query e snapshot riproducibili](audit/conceptual-2026-09-07.ipynb). Il traffico di acquisizione può far variare i conteggi successivi.

## Giudizio

Il backend ha una fondazione utile, ma **struttura presente, dati persistiti e ontologia pubblicata non coincidono**. Il problema principale non è il numero delle tabelle: è la commistione tra entità, rappresentazioni per fonte, relazioni e contenuti editoriali. Sono state classificate tutte le 70 tabelle e tutti i 63 percorsi espliciti del router, con la pagina statica `/semantic/`, raccolti in 25 famiglie di contenuti; restano da completare la canonicalizzazione e l’importazione dei singoli domini.

## Dati verificati

| Controllo | Risultato | Interpretazione |
| --- | --- | --- |
| Tabelle ispezionate | 70 | Perimetro delle tabelle applicative `public` registrate |
| Tabelle con almeno una riga | 12 | Non equivale a 12 domini completi |
| Tabelle vuote | 58 | Lo schema non dimostra l’importazione dei contenuti visibili |
| Record Attuazione PNRR | 30 | Rappresentazione specifica della fonte |
| CUP non vuoti distinti, dopo trim e maiuscole | 30 | Nessuna ripetizione in questa tabella nello snapshot; non è una validazione del CUP presso la fonte |
| Gruppi CUP ripetuti / record senza CUP | 0 / 0 | Non prova assenza di duplicati in ogni fonte o contenuto del sito |
| `canonical_subjects` / `legacy_subject_map` | 0 / 0 | L’identità comune non è ancora popolata |
| Fonti / artefatti / release nel registro snapshot | 5 / 5 / 5 | Perimetro circoscritto al manifest corrente |
| Record di fonte nel registro | 260 | Granularità diverse: non sommare a progetti o eventi |

Le altre tabelle popolate sono `crime_events` (24), `crime_sources` (86), `crime_event_sources` (342), `crime_event_locations` (33), `crime_event_offences` (40), `source_acquisition_runs` (45), `source_endpoints` (5). La proiezione `crime_public_events` risulta vuota: la presenza degli eventi interni non certifica il popolamento della proiezione pubblica.

## Ridondanze apparenti e reali

| Caso | Decisione |
| --- | --- |
| Due tabelle PNRR | Conservare entrambe come rappresentazioni di fonte; introdurre successivamente progetto canonico e collegamenti documentati. Non risultano righe da eliminare sulla sola base di questo controllo. |
| `publications`, `acts`, `fundamental_acts` | Distinguere pubblicazione, atto e selezione editoriale. Non trattarle come tre copie dello stesso archivio. |
| Persona e appartenenza all’organo | Separare identità, incarico e intervallo temporale; la sovrapposizione di attributi richiede una migrazione di dominio. |
| Registro fonti, catalogo open data, fonti degli eventi | Ruoli diversi: provenienza generale, descrizione del dataset ed evidenza specifica. Collegarli preservando granularità e revisione. |
| Demografia, performance, metriche dei temi | Condividere il pattern indicatore/serie/release/osservazione, mantenendo dimensioni e significato delle misure. |
| Segnalazioni e schede di monitoraggio | Separare contributo ricevuto e valutazione curata; creare un collegamento quando documentato. |
| Temi e categorie | Tenere separate le tassonomie, con corrispondenze versionate. Un’etichetta uguale non basta a unificarle. |

## Contenuti fuori dal modello persistito o dal profilo RDF

La [matrice delle sezioni](conceptual-catalog.md#contenuti-del-sito-e-copertura) rende visibili i percorsi, i file e le tabelle coinvolte. I principali casi sono:

- Atlante e geometrie, Trame, proposte civiche, interventi valutati, programma e capacità comunale: contenuti in file, senza una tabella dedicata per ogni oggetto.
- Open data, profili istituzionali e diversi archivi: percorsi misti API/file; l’esistenza delle tabelle non attesta la loro popolazione.
- Albo e ANAC: snapshot nel registro fonti; conservare un JSON non equivale a materializzare ogni atto, documento o contratto.
- PNRR: proiezione per fonte popolata, ma identità canonica condivisa ancora assente.
- Proposte civiche: esiste già una classificazione nel profilo PA; manca la corrispondente entità persistita e un’esportazione RDF completa. Non si tratta di assenza totale di semantica.

`ontology.ttl` 1.2.0 dichiara otto classi OWL locali, incluse due classi tecniche del profilo. Il riuso di vocabolari esterni è un riferimento o un allineamento dove dichiarato; non prova che persone, organi, luoghi, beni e valutazioni siano interamente modellati o esportati. La pagina informativa del profilo riportava ancora 1.1.0: viene allineata alla versione già pubblicata e collegata al modello concettuale.

## Intervento realizzato e sequenza residua

La revisione introduce un solo registro condiviso tra modello, mapping delle tabelle, copertura del sito e gerarchia del gestionale. L’Archivio interno aggiunge definizioni, granularità, relazioni con stato di implementazione, decisioni sulle sovrapposizioni e ricerca per concetto. Il menu pubblico mantiene i cinque ingressi principali e raggruppa le destinazioni per oggetto. I controlli automatici impediscono nuove omissioni strutturali nel registro.

La sequenza operativa prosegue nel [piano di migrazione esistente](../../architecture/migration-plan.v1.json), senza creare un secondo piano incompatibile:

| Priorità | Lavoro residuo | Criterio di completamento |
| --- | --- | --- |
| 1 | Progetto canonico e ponti dalle fonti PNRR | Ogni record collegato o esplicitamente irrisolto; nessuna divergenza sovrascritta; confronto dei campi e delle letture API prima del passaggio |
| 2 | Atti, documenti e pubblicazioni; appalti | Identità distinta per oggetto e fonte; documenti/allegati tracciati; record Albo-only e ANAC-only riconciliati; compatibilità delle API |
| 3 | Persone, organi e incarichi; serie statistiche | Storia dei ruoli preservata; osservazioni identificate da serie, periodo e release; confronto con i file sorgenti |
| 4 | Contenuti oggi solo in file e tassonomie | Ownership, fonte, versione e granularità di ogni collezione; import idempotente dove utile; contenuti editoriali esplicitamente tali |
| 5 | Proiezioni RDF e dismissione legacy | Fixture per i domini coperti, validazione delle forme e parity delle esportazioni; dismissione soltanto dopo cessazione delle scritture legacy |

## Limiti dell’assessment

Questa revisione controlla granularità, mapping e conteggi, non certifica che ogni informazione disponibile all’esterno sia acquisita. Non riconcilia ogni campo di ogni file con PostgreSQL e non costituisce un benchmark di prestazioni. Non sono state eseguite fusioni, cancellazioni o migrazioni di dati. La struttura è più leggibile e verificabile; il completamento della persistenza e della risoluzione resta misurabile per dominio.

L’accesso all’archivio conserva l’autorizzazione server per il proprietario e la consultazione in sola lettura. Il frontend non riceve le credenziali del database. I nuovi percorsi di navigazione sono verificati con test di componenti e build; non viene dichiarato un collaudo visuale con la sessione personale del proprietario.
