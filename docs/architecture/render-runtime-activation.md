# Attivazione operativa del backend Render

Specifica prima dell'implementazione. Issue #1106, collegata a #1096 e #1101.

## Diagnosi verificata

Il servizio `lamezia-trasparente-api` esegue il codice di main e verifica 21/21 migrazioni. Il 7 settembre 2026 `/api/healthz` risponde 200; `/api/healthz/migrations` e `/api/admin/database/catalog` rispondono 500. I log identificano la causa: manca la chiave segreta Clerk. Il workflow di importazione diretto fallisce invece perché GitHub non ha `DATABASE_URL`.

## Decisioni

1. Il controllo delle migrazioni resta una lettura operativa pubblica e viene registrato prima del middleware Clerk. Il catalogo e ogni altra operazione privata restano dietro l'autenticazione. Senza chiave Clerk il backend restituisce un 503 controllato; non crea sessioni anonime autorizzate.
2. CLI e server usano lo stesso runner dell'importatore già approvato. Il runner conserva manifest, confronto dei byte con Git, verifica degli hash delle migrazioni, transazioni, riconciliazione e gestione dei conflitti. Nessuna nuova migrazione.
3. Su Render la sincronizzazione parte solo con `SOURCE_SNAPSHOT_SYNC_ON_START=true`, dopo migrazioni e verifica schema riuscite. Riutilizza la connessione PostgreSQL del server e i cinque file del commit effettivamente distribuito. Non vengono copiate credenziali in GitHub.
4. `/api/healthz/source-snapshots` espone lo stato dell'ultima riconciliazione eseguita da quel processo: commit, data della verifica, hash, conteggi, stato delle fonti ed esito dei tentativi. Non restituisce payload, testo degli artefatti, credenziali o identificativi di utenti. La lettura del checkpoint non avvia scritture.
5. Il workflow GitHub diventa un verificatore: prepara il piano locale senza connessione, attende il deploy e confronta il checkpoint del backend con commit, hash e conteggi attesi. Stati disabilitato, in attesa, fallito o divergente non sono successi. La verifica giornaliera controlla la versione già riconciliata: non dichiara una nuova acquisizione dalla fonte ufficiale né una nuova scansione integrale dei dati quando il processo non è ripartito.
6. L'origine amministrativa è `https://lamezia-trasparente.pages.dev`. Il provider resta Clerk e l'autorizzazione resta legata a un solo ID utente verificato. L'attivazione della sessione del proprietario richiede la configurazione Clerk effettiva; nessuna email, intestazione o token ingestion sostituisce tale sessione.

## Validazione e ripristino

Test del runner condiviso, del confine tra readiness e autenticazione, della proiezione operativa senza dati privati e del confronto remoto (inclusi tentativi falliti e risultati mancanti). Typecheck, build e CI richiesti prima dell'integrazione. Dopo il deploy: readiness 200, richieste anonime all'admin respinte, checkpoint con cinque fonti e 260 record verificati, assenza di duplicati e workflow di verifica riuscito.

La sincronizzazione può essere sospesa impostando il flag a false e distribuendo nuovamente il servizio; i dati già registrati e le letture pubbliche restano disponibili nei rispettivi percorsi esistenti. In caso di conflitto non si sovrascrivono i valori PNRR. Un errore operativo richiede diagnosi e un nuovo avvio verificato, non un endpoint pubblico di scrittura.

## Evidenze prima del deploy

- `corepack pnpm run typecheck`: riuscito per l'intero workspace.
- `corepack pnpm run build`: riuscito per API, sito, mobile e worker; restano gli avvisi preesistenti di build su dimensione bundle e sourcemap.
- 30 test mirati riusciti: 11 su persistenza/runner, 16 su accesso admin/readiness/avvio e 3 sul verificatore remoto (incluse dodici varianti di evidenza divergente).
- Audit architetturale aggiornato: 70 tabelle in 45 moduli, senza modifiche allo schema.
- Piano locale senza connessione: cinque snapshot, 260 record e 30 progetti PNRR attesi; hash identici alla prima attivazione.

Le prove di deploy, risposta HTTP, connessione PostgreSQL e workflow effettivo vengono registrate nel [registro operativo dell'issue #1106](https://github.com/colazeta/Lamezia-Trasparente-Monitor/issues/1106). Una compilazione riuscita non costituisce prova dell'attivazione sul servizio.

## Accesso personale ancora da completare

La mancanza della chiave Clerk è stata osservata nel runtime reale. Il collegamento a Render permette di configurare e verificare il servizio, ma non fornisce la credenziale dell'istanza Clerk né un'identità utente verificata. Restano necessari `CLERK_SECRET_KEY` e la chiave pubblicabile della stessa istanza, il relativo `DATABASE_ADMIN_USER_ID` del proprietario e la configurazione del build frontend descritta in [database-console-validation.md](database-console-validation.md). Non inserire secret nella documentazione, nei commenti GitHub o nel bundle pubblico. Il collaudo finale richiede una sessione effettiva del proprietario e il rifiuto di un altro account.
