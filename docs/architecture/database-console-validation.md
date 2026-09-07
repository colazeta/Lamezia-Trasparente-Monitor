# Verifiche e attivazione della console database

Issue #1096. Percorso applicativo: `/admin/database`. La PR consegna codice, contratto API, documentazione e una migrazione proposta. **La console non è stata pubblicata né associata a un account di produzione durante questo assessment.**

## Verifiche eseguite

| Verifica | Risultato |
|---|---|
| `corepack pnpm run typecheck` | Superato nell'intero workspace |
| `corepack pnpm run build` | Superato, incluso il typecheck iniziale, il frontend, l'API, l'app mobile e il worker; rimangono avvisi del bundler su sourcemap, direttive dei componenti e dimensioni dei bundle |
| `corepack pnpm --filter @workspace/api-server exec vitest run --configLoader runner src/lib/databaseAdmin.test.ts` | 11 test superati |
| `corepack pnpm --filter @workspace/lamezia-trasparente exec vitest run --configLoader runner src/test/admin-database.test.tsx` | 3 test superati |
| `corepack pnpm test` | Arrestato dal runner `tsx` prima dei test DB: `listen EPERM` sul socket IPC temporaneo. Non è riportato come suite superata |
| Test DB con `node --import tsx --test` | Gli stessi sei file indicati nello script DB: 28 test superati, senza il processo IPC di `tsx` |
| `corepack pnpm --filter @workspace/db exec node --import tsx ./src/checkMigrations.ts` | Superato |
| Inventario architetturale | Rigenerato: 64 tabelle, 44 moduli Drizzle; inclusa la nuova migrazione |
| Generazione Drizzle sullo snapshot corrente | Nessun cambiamento ulteriore da generare; nessuna migrazione aggiuntiva creata |
| SQL del catalogo e audit fisico su Neon | Eseguiti sul database identificato; 64 conteggi esatti e 55 verifiche delle FK dichiarate |
| Migrazione su copia isolata PostgreSQL 18.6 | Blocco dei casi ambigui, rollback, conversione consentita, flag e sintesi preservati, ripetibilità, default false e rifiuto dei NULL verificati; copia eliminata dopo le prove |

Comando alternativo effettivamente usato per i test DB:

```bash
corepack pnpm --filter @workspace/db exec node --import tsx --test \
  ./src/crimeEvents.test.ts \
  ./src/ltcedsPilotImportCore.test.ts \
  ./src/crimeMonitorIngestionCore.test.ts \
  ./src/schemaMigrationConvergence.test.ts \
  ./src/legacySchemaCompatibility.test.ts \
  ./src/canonicalIdentity.test.ts
```

I test API sostituiscono la verifica Clerk con sessioni di prova e il pool con un doppio controllabile. Dimostrano il comportamento del controllo di accesso e delle query, non il collegamento tra un account reale, Clerk e il runtime pubblicato. I test UI verificano caricamento, rifiuto dell'accesso, richieste autenticate senza cache, metadati e pulizia della cache in ambiente DOM. Non sostituiscono una verifica visuale e un login reale nel browser.

Le prove SQL della migrazione sono state eseguite come transazione sul ramo temporaneo. Non sono una prova dell'intero workflow di distribuzione o del popolamento dello storico delle migrazioni in produzione. I risultati sono in [migration-validation.json](audits/2026-09-07/migration-validation.json).

## Attivazione sul runtime pubblicato

1. Identificare il servizio API effettivamente usato da Cloudflare Pages e verificare che `DATABASE_URL` punti al database previsto. Registrare commit del servizio, origine API e identificazione del database senza copiare credenziali nei log o nella documentazione.
2. Associare l'ID del solo account Clerk del proprietario, ricavato dall'istanza di produzione, a `DATABASE_ADMIN_USER_ID` sul server. Non usare un indirizzo email, un ID GitHub o l'intera allowlist degli editor. Configurare `DATABASE_ADMIN_ORIGIN` con l'origine HTTPS esatta del frontend, senza percorso né slash finale.
3. Verificare `CLERK_SECRET_KEY` e la configurazione Clerk server già prevista dal progetto. Sul build Pages configurare `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE_URL` e, soltanto se usato dall'architettura corrente, `VITE_CLERK_PROXY_URL`. L'ID proprietario, la chiave segreta Clerk e la connessione PostgreSQL restano variabili server.
4. Applicare la nuova migrazione attraverso il percorso di migrazione già previsto dal progetto. Prima dell'esecuzione contare le sintesi con `brief_manual IS NULL AND brief IS NOT NULL`: se presenti, ricostruirne esplicitamente l'origine prima di riprovare. Non eliminare la guardia della migrazione per sbloccare il rilascio.
5. Dopo la distribuzione aprire `/admin/database`: account proprietario → catalogo e dati; anonimo → nessun dato; altro account anche editor → nessun dato. Verificare rifiuto delle origini diverse, logout, ritorno con navigazione indietro e revoca dell'accesso. Verificare anche le risposte 200/401/403 degli endpoint, oltre all'aspetto delle pagine.
6. Confermare `Cache-Control: private, no-store`, corrispondenza della sessione all'origine e nessuna memorizzazione persistente dei dati della console. Provare a 390 px e desktop catalogo, tabelle larghe, filtri, scheda record e navigazione da tastiera.
7. Rilevare un nuovo audit sul runtime confermato. Registrare l'hash della migrazione, confrontare la colonna corretta e usare questo risultato come nuova baseline per il backfill dei domini.

## Uso del gestionale

Il catalogo iniziale elenca le tabelle fisiche; i numeri del planner sono etichettati come stime e possono essere assenti. Selezionando una tabella si ottiene il conteggio esatto e una pagina di record. Le schede **Struttura**, **Relazioni** e **Indici** mostrano i metadati PostgreSQL; le relazioni permettono di aprire la tabella destinazione. **Apri** visualizza il record individuato dalla sua chiave primaria completa.

La ricerca sceglie una colonna e un contenuto; l'intestazione ordina i risultati. Il gestionale distingue `NULL`, stringa vuota, assenza di record, errore e contenuto troncato. I limiti sono espliciti: 50 righe per pagina nell'interfaccia, 1.000 pagine prima di richiedere un filtro, 2.048 caratteri nelle anteprime e 65.536 nella scheda. I campi individuati come credenziali restano oscurati.

La console usa una grafica Windows anni Novanta: desktop verde petrolio, finestre grigie, bordi in rilievo, titolo blu e tabelle compatte. La consultazione è in sola lettura. La correzione dei dati avviene attraverso i flussi di dominio e le migrazioni versionate.

Per disattivare l'accesso basta rimuovere la configurazione del proprietario sul server e ridistribuire il servizio: il controllo rifiuta le richieste in assenza di configurazione valida. Questo non cancella record. Dopo l'attivazione, le prove di revoca e del percorso di pubblicazione devono restare parte della verifica operativa.
