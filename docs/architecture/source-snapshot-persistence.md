# Persistenza degli snapshot civici

Specifica prima dell'implementazione. Issue #1101; assessment #1096; programma #1055.

## Decisione e confine

Il primo popolamento registra i cinque snapshot versionati già disponibili: Albo corrente, archivio delibere, PNRR, ANAC per CIG e ANAC per amministrazione. Sono artefatti prodotti dal progetto, alcuni minimizzati o arricchiti: non vengono presentati come acquisizioni nuove o copie integrali delle fonti ufficiali. Gli upstream dichiarati restano nei metadati e nei payload originari.

Questa tranche realizza una parte delle fasi 3–4. Il modello delle asserzioni, la risoluzione canonica dei domini, il passaggio delle pagine pubbliche al DB e il censimento di tutti gli altri flussi restano espliciti. In particolare non si riempie `contracts` inventando importi, fornitori o date richiesti dal vecchio schema ma assenti dagli input.

## Modello logico e fisico

Sei tabelle nel contesto `source`, fisicamente con prefisso `public.source_` come transizione compatibile con il registro architetturale e il catalogo esistenti:

| Tabella | Responsabilità |
|---|---|
| `source_sources` | Identità e classificazione dello snapshot del progetto; upstream dichiarati |
| `source_endpoints` | Percorso stabile del file associato alla fonte |
| `source_artifacts` | Hash SHA-256 dei byte, dimensione, tipo, commit e locator immutabile |
| `source_releases` | Versione dell'artefatto, metadati completi, collezioni, stato e data dichiarati dal produttore |
| `source_records` | Record in ordine di origine, chiave nativa quando presente, hash canonico e payload completo |
| `source_acquisition_runs` | Tentativo di importazione dal repository, esito, conteggi e verifica; distinto dallo stato dell'upstream |

Gli ID sono UUIDv7; le unicità naturali rendono l'import ripetibile. Le FK composte impediscono di collegare release o tentativi a un endpoint diverso da quello dell'artefatto. I record sono identificati anche dalla posizione nella collezione: eventuali chiavi native duplicate non causano una perdita silenziosa. La loro presenza resta misurabile prima della futura risoluzione.

Il JSON sorgente è scomposto soltanto nelle collezioni registrate dal manifest. Tutti gli altri campi, incluse copertura, limiti, esclusioni e stati di acquisizione, restano nei metadati. Ricomponendo metadati e collezioni ordinate si deve ottenere lo stesso valore JSON dell'input. Per questi cinque JSON di dimensioni limitate si conserva anche il testo UTF-8 originale nel database, con vincoli PostgreSQL che verificano hash SHA-256 e dimensione dei byte; il permalink Git identifica inoltre la versione nel repository. Il limite per artefatto è 4 MiB. File grandi e binari richiedono un adattatore di storage distinto: non vengono caricati da questo importatore. La serializzazione canonica dei record usa un hash distinto.

## Scrittura e riconciliazione

Il piano è preparabile senza connessione. Nessun file fuori dal manifest è letto o inviato al database. L'esecuzione richiede una scelta esplicita e una connessione server. I tentativi iniziati sono registrati prima della transazione dei dati; un errore comporta rollback dei dati e registrazione dell'esito fallito. Un'interruzione della connessione può lasciare un tentativo `running`, che non vale come successo.

Per una release già presente si rileggono e confrontano i payload, gli ordini, le chiavi e gli hash; non basta un conteggio. Un cambiamento dell'input crea una nuova release e conserva la precedente. Non sono previsti cancellazioni, SQL arbitrario, sostituzione degli override editoriali o eliminazione di record assenti dall'ultima finestra fonte.

Le 30 schede comunali PNRR possono alimentare la tabella di compatibilità esistente attraverso la loro chiave fonte. Le righe assenti sono inserite; quelle già presenti sono confrontate sui campi mappati. Una divergenza richiede riconciliazione e non viene sovrascritta automaticamente. Tutti i campi ulteriori restano nel record registrato; CUP, fonte e identità di progetto non vengono confusi. Questa operazione non dichiara completa la fase 9.

## Accettazione

- Ricostruzione JSON completa e verificata dopo lettura PostgreSQL.
- Nessun record perso, incluse esclusioni Albo ed evidenze PNRR; stato ANAC degradato/pending conservato anche con zero record.
- Ripetizione senza duplicati di artefatti, release, record o schede PNRR; nuovo tentativo operativo registrato.
- Nuova versione senza cancellazione della precedente.
- Hash errato, FK incoerenti e conflitti con valori PNRR esistenti rilevati.
- Esito di rollback verificato su copia PostgreSQL isolata.
- Connessione mancante o migrazioni pendenti producono un errore visibile nel workflow.
- Nessuna modifica alla pubblicabilità dei dati o alle letture del sito senza una successiva prova di equivalenza.
