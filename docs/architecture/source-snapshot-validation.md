# Verifica della persistenza degli snapshot

Issue #1101, collegata all'assessment #1096. Verifica del 7 settembre 2026.

## Risultato e perimetro

Le prove sono state eseguite su una copia Neon isolata della produzione, PostgreSQL 18.6. Non sono una dichiarazione di popolamento della produzione o di completezza degli universi ufficiali. I cinque input sono file già versionati nel repository al commit `e4a2f80e0bb7e420c19a4461987e7dd815c8d119`.

| Snapshot del progetto | Record conservati | Dettaglio |
|---|---:|---|
| Albo corrente | 140 | 138 elementi e 2 esclusioni |
| Archivio delibere | 79 | Elementi nell'ordine originale |
| PNRR | 41 | 30 schede e 11 evidenze Albo |
| ANAC per CIG | 0 | Metadati e stato degradato conservati |
| ANAC per amministrazione | 0 | Metadati e stato pending conservati |
| Totale | 260 | Osservazioni di fonte; non 260 atti distinti |

Sono inoltre state inserite 30 righe in `attuazione_pnrr_projects`, confrontando tutti i 16 campi mappati, inclusi valori nulli e allegati. Le tabelle canoniche di dominio non vengono dichiarate complete.

## Prove PostgreSQL

- Applicazione degli SQL esatti delle migrazioni 0019 e 0020: riuscita sulla copia. Nessuna modifica distruttiva; i file storici non sono stati riscritti.
- Primo import: 5 fonti, artefatti e release, 260 record, 30 schede PNRR. I payload sono confrontati dopo lettura con le rispettive posizioni del JSON originale, conservato integralmente con vincoli su hash e dimensione. Sono verificati anche metadati, collezioni, chiavi, hash canonici, stato e data dichiarati.
- Secondo import con nuovi identificativi di tentativo: ancora 5 artefatti/release, 260 record e 30 schede PNRR. Tutti e cinque i nuovi tentativi hanno zero inserimenti.
- Conflitto PNRR indotto sulla copia: `PNRR_EXISTING_VALUE_CONFLICT`, rollback della transazione dei dati, valore preesistente preservato, tentativo fallito. La fixture è stata ripristinata dal payload registrato.
- Due versioni sintetiche di una stessa fonte: entrambe le release e i record con la medesima chiave nativa restano presenti, con i rispettivi valori 1 e 2.
- Terza versione sintetica interrotta dopo gli inserimenti: errore intenzionale e rollback effettivo dei nuovi artefatto, release e record; i tre conteggi restano pari a 2.
- Alterazione dell'hash dell'artefatto: rifiutata dal CHECK PostgreSQL.
- Associazione di una release a un endpoint diverso dall'artefatto: rifiutata dalla FK composta.

Il trasporto SQL della prova usa il connettore Neon, con gli statement prodotti dalle stesse funzioni dell'importatore e parametri serializzati con escaping SQL. Le query di riconciliazione sono trasformate in guardie che sollevano errore nella medesima transazione. L'orchestrazione dei tentativi segue il codice; il caso fallito è registrato separatamente, come nel relativo catch. Non è una prova dell'intero CLI tramite TCP, né dell'esecuzione del workflow GitHub. La copia non viene usata come ambiente applicativo.

## Verifiche del codice

- `corepack pnpm run typecheck` e `corepack pnpm run build`: superati nell'intero workspace.
- `corepack pnpm --filter @workspace/db exec node --import tsx --test src/sourceSnapshotPersistence.test.ts`: 8 test superati, compresa ricostruzione, duplicati nativi, input invalidi, parametrizzazione, precisione PNRR e rollback.
- `corepack pnpm run architecture:audit`: superato, 70 tabelle in 45 moduli.
- `corepack pnpm --filter @workspace/db exec node --import tsx src/checkMigrations.ts`: superato.
- `corepack pnpm run hook:zero-cost`: superato.
- Generazione Drizzle nativa di migrazione, journal e snapshot; nessuna modifica manuale dei file generati.

## Attivazione e operatività

Il comando `corepack pnpm --filter @workspace/db run import:source-snapshots` produce soltanto il piano. L'opzione `--execute` richiede la connessione server `DATABASE_URL` e tutte le migrazioni registrate, confrontando hash e timestamp del journal. L'importatore rifiuta file locali diversi dai byte presenti nel commit dichiarato.

Il workflow `database-source-sync.yml` prepara l'esecuzione su main dopo variazioni dei cinque input, una volta al giorno e su richiesta. Non esegue migrazioni. Senza connessione configurata o con migrazioni pendenti fallisce esplicitamente. L'attivazione della schedulazione non può essere dichiarata riuscita prima di osservare un'esecuzione verificata. Il report operativo contiene metadati e conteggi, senza credenziali o valori dei record.

Per il rollback applicativo si può sospendere il workflow: le letture pubbliche non dipendono ancora dalle nuove tabelle. Non si cancellano artefatti o record per annullare una versione. Un errore di mappatura richiede una nuova versione dell'importatore e una decisione esplicita di riconciliazione; un conflitto PNRR non autorizza una sovrascrittura automatica.

Restano fuori da questa tranche gli altri flussi del repository, la normalizzazione completa dei domini, le asserzioni, la deduplicazione canonica, il passaggio delle letture pubbliche al database, i benchmark di carico e l'attivazione dell'accesso personale alla console.
