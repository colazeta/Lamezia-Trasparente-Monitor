# Catalogo production environment e secrets

Questo catalogo supporta la preparazione di un deployment di produzione portabile di **rendiamoLameziaTrasparente**. È documentale: non introduce provider, bucket, token o credenziali reali e non modifica runtime, API, database, workflow o file generati.

Replit resta documentato come ambiente di sviluppo assistito o fallback temporaneo. Il target primario di produzione deve essere trattato come una piattaforma portabile con build Node/Vite, API server Node.js, PostgreSQL managed, secret manager lato server e, quando completato, object storage gestito esterno.

## Regole di visibilità

- Le variabili con prefisso `VITE_` e `EXPO_PUBLIC_` sono pubbliche per definizione: possono finire nel bundle frontend o nell'app mobile e non devono contenere segreti.
- `BASE_URL`, `BASE_PATH`, `PORT` e `NODE_ENV` sono configurazioni operative, non segreti, ma vanno comunque gestite per ambiente.
- `DATABASE_URL`, token di ingestione, chiavi provider, secret Clerk e token GitHub sono **server-only**: non devono mai essere esposti a Vite, all'app mobile, a log pubblici o a pagine client.
- I valori di esempio in `.env.example` sono placeholder di sviluppo. In produzione usare il secret manager della piattaforma scelta e ruotare i valori sensibili quando cambiano persone, provider o perimetro di accesso.

## Frontend pubblico web (`artifacts/lamezia-trasparente`)

| Variabile | Required | Ambienti | Visibilità | Descrizione | Note sicurezza/rotazione |
|---|---:|---|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Opzionale se l'autenticazione redazionale non è abilitata; richiesta per login Clerk | production, preview, development | Public frontend env | Chiave pubblicabile Clerk usata dal provider React. | È pubblica, ma deve appartenere al progetto/ambiente corretto. Non sostituisce `CLERK_SECRET_KEY`. |
| `VITE_CLERK_PROXY_URL` | Opzionale | production, preview | Public frontend env | URL proxy Clerk quando si usa il proxy sul dominio applicativo. | È configurazione pubblica. Verificare dominio e path prima del deploy. |
| `BASE_PATH` | Opzionale | production, preview, development | Public build/runtime config | Base path Vite quando il sito è servito sotto un prefisso. | Non è un secret. Non cambiarlo insieme a routing/sitemap senza issue dedicata. |
| `BASE_URL` | Impostata da Vite | production, preview, development | Public frontend env | Base URL derivata dalla configurazione Vite e usata per path relativi. | Non impostare manualmente con segreti. |
| `PORT` | Opzionale in dev/preview | development, preview | Runtime config locale | Porta del dev/preview server Vite. | Non contiene segreti. In hosting statico di produzione può non essere usata. |
| `NODE_ENV` | Sì per build coerenti | production, preview, development | Build/runtime config | Abilita/disabilita plugin dev e comportamenti di build. | Usare `production` per build pubbliche. |
| `REPL_ID` | Solo Replit/dev | development | Config piattaforma locale | Abilita plugin di sviluppo Replit quando presente. | Non è target primario di produzione. Non usarla come requisito di deploy portabile. |

## API server (`artifacts/api-server`)

| Variabile | Required | Ambienti | Visibilità | Descrizione | Note sicurezza/rotazione |
|---|---:|---|---|---|---|
| `DATABASE_URL` | Sì | production, preview, development, CI con DB | Server-only secret | Stringa di connessione PostgreSQL usata da Drizzle, API server e migration runner. | Non esporre al frontend. Usare utente con permessi minimi compatibili e ruotare alla sostituzione del database o del personale autorizzato. |
| `PORT` | Sì, o assegnata dalla piattaforma | production, preview, development | Server runtime config | Porta HTTP dell'API server Express. | Non è un secret. Verificare health check e reverse proxy. |
| `NODE_ENV` | Sì | production, preview, development | Server runtime config | Distingue logging, auth fallback e proxy Clerk. | In produzione deve essere `production`; valori errati possono abilitare fallback di sviluppo. |
| `LOG_LEVEL` | Opzionale | production, preview, development | Server runtime config | Livello log Pino. | Evitare livelli troppo verbosi in produzione se includono dati operativi non necessari. |
| `PUBLIC_BASE_URL` | Raccomandata | production, preview, development | Config server pubblica | URL pubblico canonico usato per link email, feed e fallback applicativi. | Non è un secret. Deve puntare al dominio corretto e non avere slash finale. |
| `INGEST_API_TOKEN` | Richiesta per route di ingest/redazione protette | production, preview, development | Server-only secret | Token condiviso per proteggere route interne di ingestione quando usate da client o job autorizzati. | Non salvare in bundle frontend. Ruotare se esposto o quando cambia il perimetro degli operatori. |
| `EDITOR_EMAILS` | Opzionale; raccomandata per produzione redazionale | production, preview, development | Server-only config sensibile | Lista di email abilitate alle funzioni redazionali/interne. | Contiene dati personali operativi; limitarne la diffusione e rimuovere utenti non più autorizzati. |
| `CLERK_PUBLISHABLE_KEY` | Opzionale | production, preview | Server runtime config | Fallback server per risolvere la chiave pubblicabile Clerk in scenari multi-dominio. | È pubblicabile, ma tenerla coerente con l'ambiente Clerk. |
| `CLERK_SECRET_KEY` | Richiesta se si abilita il proxy Clerk in produzione | production, preview | Server-only secret | Secret Clerk usato dal proxy `/api/__clerk`. | Non esporre al frontend. Ruotare da dashboard/provider in caso di esposizione. |
| `OPS_ALERT_EMAIL` | Opzionale | production, preview, development | Server-only config | Destinatario alert operativi, ad esempio stato migrazioni. | Contiene contatto operativo; verificare consenso e aggiornamento. |
| `REPLIT_DEV_DOMAIN` | Solo sviluppo/fallback | development, temporary fallback | Config piattaforma | Fallback storico per costruire URL pubblici quando `PUBLIC_BASE_URL` manca. | Non usarla come fonte primaria in produzione portabile; impostare `PUBLIC_BASE_URL`. |

## Ingestion worker schedulato

Il repository contiene logiche di ingestione nell'API server e script di supporto; un worker schedulato separato deve riusare solo variabili server-side e non deve dipendere dal bundle frontend.

| Variabile | Required | Ambienti | Visibilità | Descrizione | Note sicurezza/rotazione |
|---|---:|---|---|---|---|
| `DATABASE_URL` | Sì se il worker scrive/legge dati | production, preview, development, CI con DB | Server-only secret | Connessione PostgreSQL condivisa con API/migrazioni. | Preferire credenziali dedicate al worker se la piattaforma lo consente. |
| `INGEST_API_TOKEN` | Sì se il worker chiama route protette invece di funzioni interne | production, preview, development | Server-only secret | Autorizza chiamate alle route `/api/ingest/*` e simili. | Ruotare separatamente dai token redazionali se possibile. |
| `ITALIADOMANI_LOC_CSV_URL` | Opzionale | production, preview, development | Server-only config | URL sorgente CSV localizzazioni PNRR. | Non è un secret; documentare provenienza e limiti della fonte quando configurata. |
| `ITALIADOMANI_PROJ_CSV_URL` | Opzionale | production, preview, development | Server-only config | URL sorgente CSV progetti PNRR. | Non è un secret; verificare disponibilità e formato prima di schedulare job. |
| `ANBSC_OPENDATA_URL` | Opzionale | production, preview, development | Server-only config | URL open data ANBSC per beni confiscati. | Non è un secret; trattare assenze o cambi formato come data gap, non come evidenza. |
| `ANBSC_TARGET_COMUNE` | Opzionale | production, preview, development | Server-only config | Comune target per filtrare i dati ANBSC. | Non è un secret; mantenere denominazione coerente con la fonte. |
| `LOG_LEVEL` | Opzionale | production, preview, development | Server runtime config | Livello log per job schedulati se condividono logger server. | Non loggare payload con token o dati personali non necessari. |

## Database PostgreSQL managed

| Variabile | Required | Ambienti | Visibilità | Descrizione | Note sicurezza/rotazione |
|---|---:|---|---|---|---|
| `DATABASE_URL` | Sì | production, preview, development, CI con DB | Server-only secret | DSN PostgreSQL usato da runtime, Drizzle config, migrazioni e baseline. | Deve restare fuori dal frontend. Conservare in secret manager, abilitare TLS se richiesto dal provider e ruotare credenziali in caso di esposizione. |
| `TEST_DATABASE_URL` | Solo test con DB reale | CI, development | Server-only secret | DSN per test Vitest che richiedono database isolato. | Non puntare a produzione. Usare database temporaneo o schema isolato. |

## Email e notifiche

| Variabile | Required | Ambienti | Visibilità | Descrizione | Note sicurezza/rotazione |
|---|---:|---|---|---|---|
| `RESEND_API_KEY` | Opzionale; richiesta per invio reale email | production, preview, development | Server-only secret | Chiave API Resend per email transazionali. Se assente, l'invio viene saltato e loggato. | Non esporre al frontend. Ruotare dal provider in caso di esposizione o cambio dominio. |
| `RESEND_FROM_EMAIL` | Raccomandata quando `RESEND_API_KEY` è impostata | production, preview, development | Server config | Mittente verificato per email transazionali. | Non è un secret; deve essere un dominio autorizzato presso il provider. |
| `OPS_ALERT_EMAIL` | Opzionale | production, preview, development | Server-only config | Destinatario alert operativi. | Limitare a mailbox controllate dal team operativo. |
| `REPLIT_CONNECTORS_HOSTNAME` | Solo Replit/fallback | development, temporary fallback | Server-only platform config | Host connector Replit usato per recuperare credenziali Resend se `RESEND_API_KEY` non è impostata. | Non è target primario di produzione; preferire secret esplicito su piattaforma portabile. |
| `REPL_IDENTITY` | Solo Replit/fallback | development, temporary fallback | Server-only platform secret | Token identità Replit per connector. | Trattare come secret di piattaforma. Non trasferire in ambienti non Replit. |
| `WEB_REPL_RENEWAL` | Solo Replit/fallback | development, temporary fallback | Server-only platform secret | Token Replit alternativo per connector. | Trattare come secret; non usare come requisito di produzione portabile. |

## Integrazioni AI già presenti

| Variabile | Required | Ambienti | Visibilità | Descrizione | Note sicurezza/rotazione |
|---|---:|---|---|---|---|
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Opzionale; richiesta per generazione brief/AI | production, preview, development | Server-only secret | Chiave per OpenAI o per proxy compatibile già referenziato dal codice. | Non esporre al frontend. Ruotare dal provider e verificare limiti di costo. |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Opzionale | production, preview, development | Server-only config | Endpoint base per OpenAI o proxy compatibile. | Non è di per sé un secret, ma può rivelare architettura interna; documentare provider e limiti se diverso da OpenAI diretto. |

## Object storage

Il codice attuale usa `PUBLIC_OBJECT_SEARCH_PATHS` e `PRIVATE_OBJECT_DIR` con client Google Cloud Storage configurato tramite sidecar Replit. Non risultano nel repository variabili S3/R2 (`S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `R2_BUCKET` o simili). Per un target portabile R2/S3-compatible serve una decisione architetturale separata e una modifica runtime dedicata; questo catalogo non la introduce.

| Variabile | Required | Ambienti | Visibilità | Descrizione | Note sicurezza/rotazione |
|---|---:|---|---|---|---|
| `PUBLIC_OBJECT_SEARCH_PATHS` | Richiesta per servire/cercare oggetti pubblici con l'implementazione attuale | production, preview, development | Server-only config | Lista separata da virgole di percorsi bucket/prefix per allegati o dataset pubblici. | Non contiene credenziali, ma rivela nomi bucket/prefix. Verificare policy pubbliche e cache. |
| `PRIVATE_OBJECT_DIR` | Richiesta per upload/oggetti privati con l'implementazione attuale | production, preview, development | Server-only config sensibile | Percorso bucket/prefix per oggetti privati e upload cittadini. | Non esporre al frontend. Verificare ACL, TTL URL firmati e separazione da oggetti pubblici. |
| `REPL_IDENTITY` | Solo implementazione Replit attuale/fallback | development, temporary fallback | Server-only platform secret | Identità usata dal sidecar Replit/GCS. | Trattare come secret. Non assumerla disponibile su target portabile. |
| `REPLIT_CONNECTORS_HOSTNAME` | Solo implementazione Replit attuale/fallback | development, temporary fallback | Server-only platform config | Host sidecar/connector Replit. | Non è un requisito di produzione portabile. |

## Configurazioni sviluppo, locali, CI e Replit

| Variabile | Required | Ambienti | Visibilità | Descrizione | Note sicurezza/rotazione |
|---|---:|---|---|---|---|
| `TEST_DATABASE_URL` | Opzionale | CI, development | Server-only secret | Database isolato per test. | Mai puntare al database di produzione. |
| `SOURCE_HEALTH_URL` | Opzionale | CI, development | CI/server config | URL controllato dallo script source-health. | Non è un secret se punta a pagina pubblica; evitare URL interni sensibili. |
| `SOURCE_HEALTH_AUDIT_PATH` | Opzionale | CI, development | CI/server config | Percorso file audit per source-health. | Non deve puntare ad aree generate o dati non previsti. |
| `SOURCE_HEALTH_WARNING_RUNS` | Opzionale | CI, development | CI/server config | Soglia warning source-health. | Non è un secret. |
| `GITHUB_REPOSITORY` | Automatica GitHub Actions | CI | CI config | Repository corrente per script GitHub. | Non è un secret. |
| `GITHUB_TOKEN` / `GH_TOKEN` | Opzionale per script GitHub | CI, development | Server-only secret | Token GitHub per interrogare API o commentare stato operativo. | Usare permessi minimi e non loggare. |
| `EXPO_PUBLIC_DOMAIN` | Opzionale | development, preview mobile | Public mobile env | Dominio API/sito usato dall'app mobile in sviluppo o preview. | Pubblico: non inserire token o credenziali. |
| `EXPO_PUBLIC_REPL_ID` | Solo Replit/dev mobile | development | Public mobile env | ID Replit pubblico usato dagli script mobile. | Non è secret, ma non deve diventare requisito di produzione. |
| `EXPO_NO_DEPENDENCY_VALIDATION` | Opzionale | development, CI mobile | Build config | Flag Expo usato dagli script di build mobile. | Non è un secret. |
| `BASE_PATH` | Opzionale | development, preview, CI | Build/runtime config | Prefisso di serving per web, mockup o mobile web. | Non è un secret. |
| `REPLIT_INTERNAL_APP_DOMAIN` | Solo Replit/dev mobile | development | Platform config | Dominio interno Replit usato come fallback dagli script mobile. | Non usare come URL canonico di produzione. |
| `REPLIT_DEV_DOMAIN` | Solo Replit/dev | development, temporary fallback | Platform config | Dominio `.replit.dev` usato da fallback storici. | In produzione portabile usare `PUBLIC_BASE_URL` e domini della piattaforma scelta. |
| `REPL_ID` | Solo Replit/dev | development | Platform config | Identificatore Repl per plugin e script dev. | Non è target primario di produzione. |
| `REPL_IDENTITY` / `WEB_REPL_RENEWAL` | Solo Replit/dev/fallback | development, temporary fallback | Server-only platform secrets | Token identità o rinnovo Replit usati da connector/sidecar. | Trattare come segreti e non portarli su piattaforme non Replit. |

## Variabili da non esporre mai al bundle frontend

Non impostare con prefissi pubblici (`VITE_`, `EXPO_PUBLIC_`) e non serializzare verso client:

- `DATABASE_URL`
- `TEST_DATABASE_URL`
- `INGEST_API_TOKEN`
- `EDITOR_EMAILS`
- `CLERK_SECRET_KEY`
- `RESEND_API_KEY`
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `GITHUB_TOKEN` / `GH_TOKEN`
- `REPL_IDENTITY`
- `WEB_REPL_RENEWAL`
- eventuali credenziali future per storage S3/R2-compatible

## Checklist pre-deploy

- [ ] Secret server-only configurati nel secret manager della piattaforma: `DATABASE_URL`, `INGEST_API_TOKEN`, eventuali `CLERK_SECRET_KEY`, `RESEND_API_KEY`, `AI_INTEGRATIONS_OPENAI_API_KEY`.
- [ ] Config pubbliche coerenti con il dominio: `PUBLIC_BASE_URL`, eventuali `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PROXY_URL`, `BASE_PATH`.
- [ ] Database PostgreSQL managed raggiungibile dal runtime; migrazioni Drizzle eseguite dal runner previsto e mai tramite `push` in produzione.
- [ ] Object storage configurato con percorsi pubblici/privati separati; per R2/S3-compatible aprire una modifica runtime dedicata prima di considerarlo supportato.
- [ ] Worker schedulato disaccoppiato dal bundle frontend e dotato solo dei secret server-side necessari.
- [ ] Email/alert verificati con mittente autorizzato oppure disabilitati in modo esplicito e monitorato.
- [ ] Health check/API URL verificati dopo build (`pnpm run build`) e prima dell'esposizione pubblica.
- [ ] Replit, se usato, documentato come sviluppo/fallback temporaneo, non come vincolo architetturale del target primario.
