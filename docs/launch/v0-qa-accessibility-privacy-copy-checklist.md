# Checklist v0 — QA, accessibilità, privacy e copy prudente

Issue di riferimento: #363
Classificazione: `launch-enabler`, `quality-enabler`
Ambito: checklist manuale documentale per la pubblicazione v0

## 1. Scopo v0 e principio “pubblicabile ma prudente”

Questa checklist supporta una verifica manuale prima della pubblicazione v0 di Lamezia Trasparente Monitor. Lo scopo non è certificare la completezza del servizio, né sostituire audit legali, privacy o accessibilità formali.

La v0 può essere considerata “pubblicabile ma prudente” solo se:

- il percorso principale è comprensibile da desktop e mobile;
- le informazioni sono presentate come materiale civico documentale, non come valutazioni definitive;
- i limiti dei dati, delle fonti e delle fixture sono visibili o comunque non nascosti;
- non vengono introdotti claim non verificati, promesse di completezza o formulazioni accusatorie;
- eventuali problemi residui sono annotati e accettati consapevolmente prima della pubblicazione.

Questa checklist è operativa e verificabile manualmente. Non produce una certificazione WCAG, non costituisce parere legale e non attesta conformità privacy.

## 2. Checklist manuale desktop/mobile del percorso principale v0

Compilare la checklist usando almeno un browser desktop e un dispositivo o viewport mobile. Annotare data, ambiente e persona che esegue la verifica.

### Desktop

- [ ] La homepage o pagina di ingresso v0 si carica senza errori visibili.
- [ ] Il percorso principale v0 è raggiungibile senza passaggi tecnici o ambigui.
- [ ] Le pagine principali non mostrano stati vuoti non spiegati, errori non gestiti o contenuti provvisori non dichiarati.
- [ ] I link essenziali del percorso v0 portano alla destinazione attesa o mostrano un messaggio comprensibile.
- [ ] Titoli, sezioni e call to action descrivono chiaramente dove si trova l’utente.
- [ ] Le informazioni su fonte, aggiornamento, limiti o natura dimostrativa dei dati sono raggiungibili quando rilevanti.
- [ ] Il layout resta leggibile senza sovrapposizioni, tagli di testo o controlli inutilizzabili.

### Mobile

- [ ] Il percorso principale v0 è utilizzabile su schermo stretto senza zoom obbligatorio.
- [ ] Menu, link e controlli essenziali sono raggiungibili e attivabili.
- [ ] I testi principali restano leggibili e non vengono nascosti da elementi fissi o overlay.
- [ ] Tabelle, card o liste non impediscono la comprensione delle informazioni essenziali.
- [ ] Gli stati di caricamento, errore o assenza dati sono comprensibili anche da mobile.
- [ ] Non emergono differenze sostanziali tra desktop e mobile che possano confondere un utente non esperto.

### Esito percorso principale

- [ ] Percorso validato su desktop.
- [ ] Percorso validato su mobile.
- [ ] Problemi residui annotati con severità, pagina, passaggi per riprodurre e decisione Go/No-Go.

## 3. Checklist accessibilità di base

Questa sezione è una verifica manuale di base. Non è una certificazione WCAG e non sostituisce un audit specialistico.

- [ ] I testi principali sono leggibili per dimensione, interlinea e spaziatura.
- [ ] Il contrasto percepito tra testo e sfondo appare sufficiente e, dove possibile, viene verificato manualmente con uno strumento dedicato.
- [ ] Il focus da tastiera è visibile sugli elementi interattivi principali.
- [ ] La navigazione da tastiera consente di raggiungere e attivare link, pulsanti e controlli essenziali del percorso v0.
- [ ] L’ordine del focus segue una sequenza comprensibile e non intrappola l’utente.
- [ ] Immagini informative, icone con significato autonomo o grafici essenziali hanno alternative testuali o spiegazioni equivalenti dove necessarie.
- [ ] I contenuti non dipendono solo dal colore per comunicare stato, categoria o priorità.
- [ ] I messaggi di errore o assenza dati sono testuali, comprensibili e non solo visivi.

## 4. Checklist privacy e minimizzazione

Questa sezione verifica prudenza e minimizzazione in modo operativo. Non costituisce valutazione legale, DPIA o attestazione di conformità normativa.

- [ ] La v0 non espone dati personali non necessari alla finalità civica dichiarata.
- [ ] Eventuali nomi, ruoli o riferimenti personali presenti sono necessari, contestualizzati e collegati a fonti pubbliche o fixture dichiarate.
- [ ] Non sono visibili dati non revisionati, campi tecnici, identificativi interni o informazioni eccedenti rispetto al contesto pubblico.
- [ ] Le fonti pubbliche, le fixture o la natura dimostrativa dei dati sono dichiarate dove rilevante.
- [ ] Non vengono presentati dati incompleti come ufficiali, esaustivi o aggiornati senza caveat.
- [ ] Non sono introdotte nuove fonti esterne senza una nota su origine, logica di aggiornamento, limiti e presupposti di uso pubblico.
- [ ] Screenshot, esempi e contenuti dimostrativi non includono dati personali non necessari.

## 5. Checklist copy prudente

Il copy deve restare civico, neutro, documentale e non accusatorio.

- [ ] Il testo descrive indicatori, segnali, pattern, ricorrenze, gap informativi o bisogni di verifica senza trasformarli in prove di illecito.
- [ ] Non compaiono formulazioni che suggeriscono corruzione, favoritismo, infiltrazione mafiosa, responsabilità individuale o intenzionalità senza documentazione e contesto appropriati.
- [ ] Non sono presenti claim non verificati, assoluti o promesse di completezza.
- [ ] I limiti del dato sono espliciti quando una pagina o sezione potrebbe essere interpretata come esaustiva.
- [ ] Le fonti e la natura documentale delle informazioni sono richiamate dove necessario.
- [ ] Il tono evita enfasi giornalistica, sensazionalismo o linguaggio accusatorio.
- [ ] Le call to action invitano alla consultazione, verifica o approfondimento, non alla conclusione su responsabilità o condotte.

## 6. Blocker Go/No-Go

Bloccare la pubblicazione v0 e richiedere una decisione esplicita se emerge uno dei seguenti casi:

- un percorso essenziale non è raggiungibile o produce errore bloccante;
- una pagina pubblica centrale è vuota, ambigua o priva di contesto minimo;
- un link essenziale del percorso v0 è rotto e impedisce la comprensione del servizio;
- il copy può essere letto come accusa, prova di illecito o attribuzione di responsabilità;
- dati personali non necessari o non revisionati risultano esposti;
- fixture, esempi o dati incompleti appaiono come ufficiali, completi o aggiornati senza caveat;
- la navigazione da tastiera non consente di usare parti essenziali del percorso v0;
- il contrasto o la leggibilità impediscono la fruizione delle informazioni principali;
- una limitazione nota non è documentata e può indurre l’utente a conclusioni errate.

Se un blocker viene confermato, registrare: pagina o area, descrizione, severità, impatto per l’utente, decisione richiesta e responsabile della decisione.

## 7. Human Decision Ledger

Le seguenti decisioni devono restare a Giovanni o a una persona esplicitamente delegata. Non devono essere assunte automaticamente da questa checklist.

| Decisione | Opzioni possibili | Evidenza minima da raccogliere | Decisione di Giovanni |
| --- | --- | --- | --- |
| Pubblicare la v0 nonostante limitazioni minori | Go / Go con note / No-Go | Elenco limitazioni, impatto utente, workaround | |
| Accettare caveat su dati incompleti o fixture | Accetta / Richiede modifica / Blocca | Pagina interessata, testo del caveat, rischio di ambiguità | |
| Mantenere o modificare copy sensibile | Mantiene / Riformula / Rimuove | Frase esatta, contesto, motivo della sensibilità | |
| Esporre un dato personale collegato a fonte pubblica | Espone / Oscura / Rimanda | Necessità civica, fonte, minimizzazione applicata | |
| Considerare risolto un problema di accessibilità base | Risolto / Accettato temporaneamente / Blocca | Test eseguito, impatto, eventuale follow-up | |
| Procedere alla pubblicazione | Go / No-Go | Checklist compilata, blocker aperti, follow-up necessari | |

## 8. Validazione non invasiva

Comandi consigliati solo se applicabili al contesto di lavoro e senza modificare codice o configurazioni per farli passare:

```bash
git diff --check
```

Opzionale come controllo esterno, se l’ambiente dispone delle dipendenze e il progetto è già installato:

```bash
pnpm run typecheck
```

Annotare sempre il risultato del comando, l’ambiente in cui è stato eseguito e ogni limitazione riscontrata. Per questa checklist docs-only, eventuali fallimenti del typecheck non devono essere corretti modificando codice applicativo fuori scope.
