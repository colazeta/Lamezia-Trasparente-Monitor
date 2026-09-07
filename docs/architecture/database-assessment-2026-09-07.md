# Assessment del database di Lamezia Trasparente

**Aggiornamento operativo:** [primo popolamento verificato in produzione e collegamenti ancora da attivare](database-activation-2026-09-07.md). L'assessment seguente conserva la baseline originale delle 17:47:58 UTC.

**Giudizio: la base relazionale è consistente nelle strutture principali, ma il database esaminato non è ancora un archivio completo dei dati gestiti dal progetto. La migrazione verso un archivio canonico è iniziata; il popolamento e la riconciliazione sono la priorità.**

Issue #1096, collegata al programma #1055. Codice esaminato: `51f393ce587a82c7b93475e3df40f2d787314a66`. Rilevazione principale: **7 settembre 2026, 17:47:58 UTC**. Progetto Neon `lamezia-trasparente`, ramo `production`, database `neondb`, PostgreSQL **18.6**.

Questa identificazione è verificata sul provider. Non equivale alla prova che il processo API pubblicato stia usando proprio questa connessione: le richieste al precedente hostname API sono scadute e Cloudflare Pages ha restituito al client di audit HTTP 403, codice 1010. Queste risposte non provano un disservizio per gli utenti. Il deployment correntemente documentato nel repository è `https://lamezia-trasparente.pages.dev`; il precedente dominio `lameziatrasparente.it` ha restituito una pagina WordPress e non è stato assunto come runtime di questa applicazione.

## Evidenze e valutazione

| Dimensione | Risultato verificato | Valutazione |
|---|---|---|
| Tabelle e colonne | 64 tabelle applicative, 670 colonne; tutte le tabelle nello schema fisico `public` | Inventario del codice e presenza fisica convergono |
| Migrazioni | 19 migrazioni registrate; tutti i 19 hash e timestamp corrispondono ai file del commit esaminato | Catena registrata verificata; non prova da sola equivalenza completa dello schema |
| Popolamento | **59 tabelle vuote**; soltanto cinque tabelle LTCEDS popolate | Il database non contiene gran parte delle informazioni presenti nei file del progetto |
| Tipi e nullabilità | Nessuna differenza di tipo tra le 670 colonne confrontate; una differenza di nullabilità in `publications.brief_manual`, anche senza il default previsto; nessuna differenza nelle colonne delle PK o nelle destinazioni/colonne delle FK confrontate | Correzione mirata necessaria |
| Integrità referenziale | 55 FK dichiarate; zero righe orfane nelle verifiche delle relazioni dichiarate | Esito positivo, ma largamente su tabelle vuote; non copre relazioni semantiche nei JSON o nei testi |
| Vincoli e indici | 64 PK, 26 vincoli UNIQUE, 64 CHECK, 457 NOT NULL; 198 indici; nessun indice invalido rilevato | Non sono stati confrontati integralmente tutti i default/vincoli/indici con un database creato da zero |
| Indici sulle FK | 11 FK senza indice non parziale con le colonne referenzianti in posizione iniziale | Candidati da valutare sui flussi di lettura/scrittura; non 11 rallentamenti dimostrati |
| Prestazioni | Database circa 12 MB; nessuna sessione bloccata rilevata; sole estensioni PL/pgSQL, senza `pg_stat_statements` | Non esiste un benchmark rappresentativo che consenta di dire «tutto ottimizzato» |
| Ripristino | Finestra di storico del progetto configurata a 21.600 secondi, cioè 6 ore | È una configurazione osservata; un ripristino end-to-end non è stato provato |

I cinque insiemi popolati sono: `crime_events` **19**, `crime_sources` **62**, `crime_event_sources` **257**, `crime_event_offences` **29**, `crime_event_locations` **26**. Sono unità differenti, da non sommare come eventi. `crime_public_events`, `canonical_subjects` e `legacy_subject_map` sono vuote. Non si può dedurre che i 19 eventi siano pronti per la pubblicazione: la proiezione pubblica richiede i suoi controlli editoriali e geografici.

## Completezza: confronto dei percorsi

Un file presente, un workflow verde e una tabella creata attestano tre cose diverse. Nel confronto seguente i conteggi dei file identificano il contenuto di quegli specifici artefatti, non l'universo delle informazioni disponibili presso le fonti esterne.

| Dominio | Evidenza nel repository / percorso di produzione | Stato del database | Azione necessaria |
|---|---|---|---|
| Albo | `data/public/albo/latest.json`: 138 elementi; `albo-ingestion.yml` aggiorna artefatti | `publications`: 0; `acts`: 0 | Registro fonte e record acquisiti; backfill idempotente; confronto per identificatore e hash, inclusi esclusi e motivi |
| Delibere | `delibere-archive.json`: 79 elementi | Stesse tabelle documentali vuote | Riconciliare archivio e finestra corrente, senza sommare indiscriminatamente i due insiemi |
| Contratti | Vite costruisce il corpus canonico e la proiezione contratti a partire dagli snapshot Albo/ANAC | `contracts`: 0 | Persistenza di procedure, contratti ed eventi; CIG come identificatore, eventi senza CIG mantenuti irrisolti |
| ANAC/BDNCP | Snapshot con 0 record, stato `degraded`, `source-unavailable`; 12 archivi tentati e indisponibili | Nessuna riga corrispondente nella tabella contratti | Ripristinare acquisizione e registro dei tentativi; non interpretare lo zero come assenza di appalti |
| ANAC per stazione appaltante | Snapshot `pending`, 0 record; data segnaposto 1970 | Nessun censimento autonomo completato dimostrato | Acquisizione indipendente per amministrazione e periodo prima di misurare la copertura |
| PNRR | JSON generato con 30 progetti e 11 evidenze Albo | `attuazione_pnrr_projects`: 0; `italiadomani_projects`: 0 | Una identità progetto; CUP e asserzioni di ciascuna fonte separati; preservare divergenze |
| Serie demografiche | Moduli e snapshot su popolazione, famiglie, cittadinanza e altri profili | `demographic_series`, `demographic_releases`, `demographic_observations`: 0 | Registrare serie, release, dimensioni, osservazioni e revisioni; non confondere celle con osservazioni |
| Traffico aereo | Metadati: 319 mesi; base e delta nei JSON generati | Nessuna serie statistica corrispondente popolata | Riutilizzare il modello serie/release/osservazione, con unità di misura e revisioni |
| Clima | 13.029 record giornalieri nel JSON; aggregazioni annuali separate | Nessuna serie statistica corrispondente popolata | Persistenza e controlli temporali; distinguere dati di reanalisi e misurazioni ufficiali |
| Catalogo open data | API e processi per dataset, risorse e snapshot esistono nel codice | Le tre tabelle sono vuote | Provare esecuzione e destinazione effettiva dei processi; registrare errori e periodo coperto |
| Organi, amministratori e sedute | Snapshot istituzionali, moduli TypeScript e pagine; funzioni di sincronizzazione presenti | `organi`, `organi_members`, `officials`, `sedute`, report/interventi/voti: 0 | Separare persona, carica, mandato e partecipazione; backfill con intervalli e documenti fonte |
| Beni confiscati e geografia | Pilot curato, GeoJSON e manifesti territoriali | `confiscated_assets`: 0 | Importare soltanto fatti verificati; collegare artefatti geografici e precisione pubblicabile |
| Eventi criminali LTCEDS | Artefatti, modello normativo, compiler e importatori | Cinque tabelle popolate; pubblico e cluster vuoti | Riconciliare ogni input con risultato/errore; pubblicazione solo dopo le attestazioni richieste |
| Atti fondamentali, pareri, bandi | Endpoint e pannelli editoriali esistenti | Tabelle vuote | Definire per ciascuno universo, fonte e stato di attivazione; lo zero non è una prova di completezza |
| Accesso civico e monitoraggio | Workflow applicativi e relazioni ai domini | Tabelle delle richieste e dei report vuote | Distinguere «nessuna richiesta» da «servizio non attivato/non collegato» |
| Indicatori di performance | Catalogo e contenuti nel progetto | Categorie/indicatori/valori nel DB: 0 | Separare definizioni, osservazioni misurate e contenuti dimostrativi |
| Redazione, temi e configurazioni | Pannello, testi e configurazioni in codice | Tabelle applicative/editoriali vuote | Valutare quali contenuti devono essere gestiti dal DB e quali sono configurazione versionata intenzionale |
| Conversazioni, messaggi e analytics | Tabelle e codice applicativo | Tabelle vuote | Registrare servizio attivo/inattivo; non popolare con dati sintetici per eliminare lo zero |
| Documenti, media, Docling e WhisperX | Artefatti e flussi specializzati nei file | Registro universale di fonti/artefatti ancora pianificato | Metadati, hash e locator nel DB; byte originali in storage appropriato, senza obbligo di memorizzarli in una colonna |
| Proposte, cronologie e materiale di riferimento | Moduli editoriali e dataset di riferimento, inclusi file dichiarati demo | Nessun registro universale delle asserzioni disponibile | Distinguere fatti civici, testi editoriali, riferimenti e fixture; mai importare demo come dati ufficiali |

L'inventario [table-flow-references.json](audits/2026-09-07/table-flow-references.json) assegna **tutte le 64 tabelle** a dominio e fase di migrazione e conserva i riferimenti statici al codice. È una mappa dei punti da verificare, non una prova di esecuzione dei flussi. Gli hash dei sette artefatti conteggiati sono nell'evidenza JSON.

Un rilievo operativo specifico: `crime-event-ingestion.yml` si chiama **Crime event validation** e invoca l'importatore senza `--execute`; il comando è quindi una validazione/dry-run. Il suo successo non dimostra una scrittura nel database. Lo stesso principio vale per i workflow che aggiornano soltanto file.

## Correzioni materializzate in questa PR

1. **Console privata `/admin/database`.** Catalogo effettivo, tabelle, filtro per colonna, ordinamento, paginazione, scheda record, tipi, nullabilità, PK/FK, vincoli e indici. Un solo ID Clerk e una sola origine verificati sul server; nessun privilegio derivato dal ruolo editor. Tutte le query passano da transazioni in sola lettura con timeout. Valori di credenziali oscurati per nome di campo, limiti dei contenuti espliciti, nessun SQL arbitrario. Il catalogo distingue stime assenti, conteggi effettivi ed errori.
2. **Rilevatore riproducibile.** `pnpm --filter @workspace/db run audit:live --output <percorso>` legge catalogo, conteggi, hash delle migrazioni, tipi, FK orfane, statistiche e indici candidati. Richiede una connessione configurata. In questa sessione il collegamento TCP diretto era indisponibile: il catalogo SQL della console, conteggi e controlli referenziali sono stati eseguiti tramite il connettore Neon in una singola istruzione e trasformati localmente con lo stesso codice.
3. **Convergenza di `brief_manual`.** Migrazione versionata proposta: aggiunge `DEFAULT false` e `NOT NULL`. Converte i NULL soltanto quando anche la sintesi è assente. Se esiste una sintesi con origine manuale sconosciuta, si ferma prima del backfill: nessuna attribuzione automatica di origine e nessun rischio di renderla sovrascrivibile. Verificati su un ramo isolato il blocco prudenziale, il rollback, la conversione, la conservazione dei valori manuali, il default e la ripetizione. Il ramo di prova è stato eliminato; la produzione non è stata migrata. [Evidenze della migrazione](audits/2026-09-07/migration-validation.json).
4. **Generazione delle migrazioni.** Corretto il percorso `out` di Drizzle Kit: la configurazione assoluta produceva un errore di risoluzione degli snapshot, anche per una migrazione custom. Il percorso resta relativo alla directory di esecuzione e continua a puntare a `lib/db/migrations`. Inoltre lo snapshot Drizzle precedente descriveva soltanto 42 tabelle: lo snapshot corrente è stato rigenerato dal modello a 64 tabelle. Le proposte automatiche di DDL relative alle vecchie differenze non sono state applicate; la migrazione custom contiene soltanto la correzione verificata. Dopo la rigenerazione, Drizzle non propone ulteriori cambiamenti rispetto al codice.
5. **Configurazione del frontend.** Il workflow Pages passa anche le variabili pubbliche Clerk quando sono configurate. In loro assenza l'area riservata resta disattivata. Le credenziali server non entrano nel bundle.

## Disegno e priorità di completamento

Il [modello concettuale e logico](database-model.md) distingue esistente e destinazione. Il [dizionario fisico](audits/2026-09-07/database-dictionary.md) documenta tutte le colonne, i vincoli e gli indici rilevati. Il [JSON di audit](audits/2026-09-07/database-audit.json) conserva l'evidenza verificabile; non contiene i valori dei record applicativi. [Verifiche e procedura di attivazione](database-console-validation.md) distinguono i risultati ottenuti dalle verifiche ancora da eseguire sul runtime pubblicato.

| Priorità | Intervento | Criterio di completamento |
|---|---|---|
| P0 | Verificare e registrare il collegamento frontend → API → database; associare il solo account proprietario alla console | Commit del runtime, origine API e identità del database verificati; prove autenticate 200/401/403 e revoca dell'accesso |
| P0 | Applicare la convergenza fisica attraverso il workflow delle migrazioni dopo verifica e revisione | Default e NOT NULL corrispondenti; eventuali sintesi ambigue risolte esplicitamente; hash della nuova migrazione registrato |
| P1 | Fasi 3–6 del programma esistente: fonti, acquisizioni, artefatti, asserzioni e tassonomie | Ogni record fonte ha identità, hash/versione e risultato; errori e stati irrisolti sono conteggiabili |
| P1 | Albo, contratti e PNRR: backfill e doppia scrittura temporanea | Differenze tra insiemi di identificatori spiegate; nessuna perdita di documenti, date, valori o attestazioni |
| P1 | Organi e statistiche | Conteggi e valori riconciliati per fonte, release, periodo e dimensioni; storia conservata |
| P1 | Proiezioni pubbliche e export derivati dal DB | Equivalenza dimostrata prima di cambiare le letture; nessuna fonte semantica concorrente nel build |
| P2 | Prestazioni e privilegi | Piani su volumi rappresentativi, percentili di latenza e budget; ruoli distinti per migrazioni, ingestione e lettura; indici introdotti sulla base di quei risultati |
| P2 | Recuperabilità e controlli continui | Ripristino provato; obiettivi RPO/RTO dichiarati; ledger dei flussi con ultima riuscita, copertura, anomalie e responsabile |

La migrazione deve continuare per dominio: introdurre il modello → importare/riconciliare → confrontare le letture → cambiare il percorso pubblico → congelare il legacy. Le prime tre fasi indicate come complete nel programma attestano la fondazione architetturale e le strutture di identità, non l'avvenuto backfill dei dati.

## Limiti dell'ottimizzazione e della sicurezza verificata

Non aggiungo undici indici soltanto perché mancano sulle FK: con queste dimensioni e tabelle in gran parte vuote non sarebbe una dimostrazione di miglioramento. Le FK non creano automaticamente indici sulle colonne referenzianti e la loro opportunità dipende dalle operazioni effettive. Le statistiche del planner sono stime, aggiornate da ANALYZE/autovacuum. [Documentazione PostgreSQL sui vincoli](https://www.postgresql.org/docs/18/ddl-constraints.html), [ANALYZE](https://www.postgresql.org/docs/current/sql-analyze.html).

L'assenza di RLS non rende automaticamente pubbliche le tabelle: l'accesso dipende anche da ruoli, grant e API. In questo audit non è stato verificato quale ruolo usi il processo API remoto. La console aggiunge un controllo applicativo sul soggetto della sessione firmata e sull'origine, distinto dall'allowlist redazionale. [Clerk: getAuth](https://clerk.com/docs/reference/express/get-auth).

Restano non certificati: universo completo delle fonti esterne, esecuzione di tutti i flussi di produzione, equivalenza integrale dello schema ricreato da zero, benchmark sotto carico, ripristino da backup e login reale del proprietario nell'ambiente pubblicato. Il report rende queste lacune esplicite; i controlli passati non le assorbono.
