# Managed PostgreSQL transition checklist

Questa checklist supporta l'issue #245, collegata all'epic infrastrutturale #238. È una guida operativa prudente per preparare il passaggio a un servizio PostgreSQL gestito senza introdurre automazioni distruttive, senza modificare schema o migrazioni e senza esporre credenziali.

La checklist non sostituisce una runbook approvata dal team operativo. Ogni passaggio va adattato al provider scelto, agli ambienti disponibili e alle finestre di manutenzione concordate.

## Perimetro della checklist

- [ ] Usare questa pagina solo come supporto documentale per la preparazione della migrazione a managed PostgreSQL.
- [ ] Non modificare migrazioni, schema, seed, baseline dati, runtime API, worker, client generati, workflow CI o secret in questa issue.
- [ ] Non assumere un provider unico: verificare requisiti equivalenti per il servizio gestito selezionato.
- [ ] Non pubblicare stringhe di connessione, password, token, host privati, dump o log contenenti dati sensibili.
- [ ] Trattare ogni controllo come conferma tecnica o segnale di verifica, non come prova di correttezza definitiva della piattaforma.

## Prerequisiti non segreti da verificare

- [ ] Ambiente target identificato: `staging`, `production` o altro nome operativo già in uso dal team.
- [ ] Finestra di manutenzione o cutover concordata, con referente tecnico disponibile per API, worker e database.
- [ ] Versione PostgreSQL target compatibile con quella attesa dall'applicazione e dalle migrazioni già presenti nel repository.
- [ ] Estensioni PostgreSQL eventualmente richieste dal database esistente verificate in modo documentato e non distruttivo.
- [ ] Limiti di connessione, storage, backup retention, replica e maintenance window del servizio gestito compresi prima del cutover.
- [ ] Rete e allowlist verificate senza annotare indirizzi sensibili nel repository o nei commenti pubblici.
- [ ] Accesso amministrativo minimo necessario assegnato a operatori autorizzati, con separazione tra account personali e credenziali applicative.
- [ ] Piano di comunicazione interno pronto per segnalare inizio, esito, stop o rollback della finestra.

## Variabili e concetti da controllare senza esporre secret

- [ ] `DATABASE_URL` esiste nel secret manager dell'ambiente target ed è server-only.
- [ ] La stringa di connessione usa database, utente, host, porta e opzioni SSL coerenti con il servizio gestito, senza copiarne il valore in issue, PR, log o screenshot.
- [ ] Eventuali variabili di test o staging restano separate dalla produzione e non puntano accidentalmente al database produttivo.
- [ ] API server, migration runner e worker usano la stessa sorgente di configurazione prevista per l'ambiente selezionato.
- [ ] Nessuna variabile database viene esposta tramite prefissi pubblici come `VITE_` o `EXPO_PUBLIC_`.
- [ ] I log applicativi e di piattaforma sono configurati per evitare la stampa di stringhe di connessione o payload sensibili.
- [ ] Le policy di rotazione credenziali sono chiare per cutover, rollback e dismissione del vecchio database.

## Backup e punto di rollback

- [ ] Backup verificato del database sorgente completato prima di qualsiasi attività di cutover.
- [ ] Metodo di restore testato o documentato in ambiente non produttivo, con tempi attesi e limiti noti.
- [ ] Snapshot o backup del database gestito target creato dopo l'import iniziale e prima dell'esposizione applicativa.
- [ ] Punto di rollback esplicito definito: vecchia `DATABASE_URL`, database sorgente non modificato oltre la finestra concordata, e criterio per tornare al servizio precedente.
- [ ] Finestra massima di osservazione post-cutover concordata prima di dismettere o rendere non recuperabile il database precedente.
- [ ] Operatore responsabile del rollback identificato prima dell'inizio della finestra.

## Dry-run e validazione in staging

- [ ] Eseguire un dry-run su staging o ambiente equivalente prima della produzione.
- [ ] Ripristinare un backup recente o dataset rappresentativo nel database gestito di staging, rispettando le regole interne su dati personali e minimizzazione.
- [ ] Applicare solo le migrazioni già previste dal repository, senza creare nuove migrazioni per questa issue.
- [ ] Verificare che API server e worker si avviino con la configurazione staging senza errori di connessione.
- [ ] Eseguire controlli applicativi mirati su endpoint di lettura, endpoint protetti e job schedulati, senza modificare dati produttivi.
- [ ] Confrontare conteggi e campioni non sensibili tra sorgente e target per individuare data gap o differenze da verificare.
- [ ] Documentare eventuali discrepanze come elementi di verifica richiesti, non come incidenti conclusivi.

## Preparazione del cutover

- [ ] Bloccare o mettere in pausa le scritture non essenziali secondo la procedura operativa approvata.
- [ ] Confermare che non siano in corso migrazioni, ingest massivi o job amministrativi sul database sorgente.
- [ ] Eseguire ultimo backup o snapshot prima del cambio di puntamento.
- [ ] Aggiornare `DATABASE_URL` solo nel secret manager o nella configurazione server-side dell'ambiente target.
- [ ] Riavviare o ridistribuire solo i servizi necessari a leggere il nuovo secret, seguendo la procedura della piattaforma.
- [ ] Conservare il database sorgente in sola lettura o in stato recuperabile fino al termine della finestra di osservazione.

## Controlli post-cutover API e worker

- [ ] API server avviato correttamente e health check raggiungibile dall'ambiente previsto.
- [ ] Endpoint pubblici principali rispondono con dati attesi e senza errori database ricorrenti.
- [ ] Endpoint interni o protetti rispondono solo con autorizzazione valida e non espongono dettagli di connessione.
- [ ] Worker di ingestione o job schedulati confermati in esecuzione, in pausa o disabilitati secondo il piano della finestra.
- [ ] Log monitorati per timeout, errori SSL, saturazione connessioni, pool exhaustion o query lente ricorrenti.
- [ ] Metriche di connessione e storage del servizio gestito coerenti con i limiti attesi.
- [ ] Campioni non sensibili di lettura applicativa confrontati con il comportamento pre-cutover.
- [ ] Alert o contatti operativi confermati, se già previsti dall'ambiente.

## Condizioni di stop

Interrompere il cutover e non procedere alla produzione se una delle condizioni seguenti è presente:

- [ ] Backup sorgente assente, non verificato o non recuperabile.
- [ ] Restore o import di staging non completato con esito comprensibile.
- [ ] Differenze di schema, migrazioni pendenti o data gap non spiegati prima della finestra.
- [ ] `DATABASE_URL` o altri secret compaiono in log, commenti, screenshot o output condivisi.
- [ ] API server o worker non riescono a connettersi al database gestito in staging.
- [ ] Requisiti di rete, SSL, permessi o limiti di connessione non sono chiari.
- [ ] Manca un responsabile disponibile per rollback durante tutta la finestra.

## Condizioni di rollback

Avviare il rollback se, dopo il cutover, si verifica una delle condizioni seguenti e non c'è una mitigazione rapida e sicura:

- [ ] API pubbliche principali non disponibili o instabili oltre la soglia operativa concordata.
- [ ] Errori database ricorrenti impediscono letture o scritture previste.
- [ ] Worker critici accumulano fallimenti ripetuti o producono data gap non spiegati.
- [ ] Saturazione connessioni, storage o limiti provider compromette la stabilità del servizio.
- [ ] Si rileva esposizione accidentale di secret o configurazioni sensibili.
- [ ] Il confronto post-cutover evidenzia discrepanze materiali non spiegate.

Rollback minimo atteso:

- [ ] Ripristinare la precedente configurazione server-side di `DATABASE_URL` dal secret manager, senza pubblicarne il valore.
- [ ] Riavviare o ridistribuire i servizi necessari a rileggere la configurazione precedente.
- [ ] Verificare health check API, endpoint principali e stato worker sul database sorgente.
- [ ] Conservare log e note operative utili alla diagnosi, rimuovendo o oscurando eventuali secret prima della condivisione.
- [ ] Registrare le verifiche richieste prima di pianificare un nuovo tentativo.

## Cosa non fare in questa issue

- [ ] Non aggiungere script di migrazione, automazioni di cutover o workflow CI/CD.
- [ ] Non cambiare schema database, migrazioni, seed, baseline o dati di produzione.
- [ ] Non modificare runtime API, worker, storage abstraction, UI o client generati.
- [ ] Non introdurre nuove dipendenze, package script o lockfile changes.
- [ ] Non inserire provider hard-coded come unica opzione operativa.
- [ ] Non committare secret, dump, screenshot con credenziali, endpoint privati o log sensibili.
- [ ] Non presentare questa checklist come conferma che la migrazione sia già stata eseguita.
