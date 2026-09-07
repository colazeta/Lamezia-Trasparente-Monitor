# Console database e audit operativo

Issue: #1096. Baseline esaminata: `51f393ce587a82c7b93475e3df40f2d787314a66`.

## Decisioni prima dell'implementazione

- Conservare PostgreSQL, Drizzle, Express, React/Vite, Clerk e il contratto architetturale v1 esistenti.
- Separare l'inventario del codice dalla rilevazione fisica e dai conteggi effettivi. `reltuples = -1` significa stima non disponibile, mai zero righe.
- Rendere ispezionabili le tabelle applicative esportate da Drizzle; segnalare tabelle e colonne inattese senza rendere interrogabili gli schemi di sistema.
- Proteggere ogni endpoint con una sessione Clerk verificata, un unico `DATABASE_ADMIN_USER_ID` e l'origine esatta `DATABASE_ADMIN_ORIGIN`. Nessuna eredità dall'allowlist editor, nessun token ingestion e nessuna eccezione di sviluppo.
- Consultazione: catalogo, ricerca per colonna, paginazione, dettaglio per chiave primaria, colonne, chiavi esterne, indici e migrazioni registrate. Nessun editor SQL o modifica dei record.
- Query in transazioni PostgreSQL `REPEATABLE READ READ ONLY`, timeout e limiti espliciti. Identificatori derivati dal catalogo e dal registro Drizzle; valori parametrizzati. Al massimo due letture concorrenti per processo.
- Nessuna persistenza dei dati della console nel browser; risposte `private, no-store`, cache React Query legata all'identità e rimossa al logout. Campi che possono contenere credenziali oscurati anche al proprietario.
- Aspetto: gestionale Windows anni Novanta, sfondo verde petrolio, finestre grigie con bordi in rilievo, barra del titolo blu, tabelle dense e navigazione da tastiera. Font leggibili e pannelli adattabili agli schermi stretti.

## Criteri di verifica

I test devono dimostrare il rifiuto di anonimi, altri account, origini non consentite, configurazione mancante, nomi tabella/colonna non ammessi e query fuori limite; devono verificare rollback/rilascio della connessione, ordinamento stabile e distinzione tra `NULL`, stringa vuota e valori troncati. Il report deve contenere evidenze datate e limiti del confronto, senza trasformare l'esistenza di una tabella o di un file in una prova di completezza.

## Attivazione

Il codice viene consegnato in una PR. Il proprietario deve essere associato a un ID Clerk verificato nell'istanza di produzione e l'API deve essere raggiungibile dall'origine configurata. Una chiave mancante mantiene la console chiusa. La pubblicazione della console non autorizza a rendere pubblici i record interni né sostituisce il backfill e la riconciliazione dei flussi.
