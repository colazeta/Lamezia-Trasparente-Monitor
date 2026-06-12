# v0 — manutenzione minima e checklist Go/No-Go

Issue di riferimento: #364. Contesto di lancio: #341.

Questo documento definisce un presidio minimo, manuale e verificabile per accompagnare la v0 di Lamezia Trasparente Monitor dopo la pubblicazione. È intenzionalmente prudente: non introduce nuove fonti, non certifica completezza dei dati e non sostituisce verifiche amministrative o legali.

## Che cos'è la v0

La v0 è una prima versione pubblica e documentale del progetto. Serve a rendere più leggibili alcune informazioni amministrative di interesse civico già disponibili o tracciate nel perimetro del progetto, con attenzione a:

- spiegare il contesto e i limiti delle informazioni mostrate;
- indicare quando un contenuto richiede verifica o aggiornamento;
- separare chiaramente dati, note metodologiche e prossimi approfondimenti;
- raccogliere feedback, segnalazioni di errore e bisogni informativi.

La v0 deve essere interpretata come uno strumento di monitoraggio civico e orientamento, non come una fonte esaustiva o conclusiva.

## Che cosa non contiene la v0

La v0 non contiene e non deve essere presentata come:

- un archivio completo di tutti gli atti, procedimenti o indicatori del Comune;
- una certificazione ufficiale della correttezza, completezza o tempestività delle fonti;
- una valutazione di responsabilità individuali o istituzionali;
- una prova di illeciti, favoritismi, infiltrazioni o intenzionalità;
- un sistema automatizzato con garanzie di aggiornamento continuo o tempi di risposta predefiniti;
- una promessa di copertura futura, calendario di lancio o SLA.

Eventuali indicatori, segnali, ricorrenze o data gap devono rimanere descritti come elementi che possono motivare verifica, chiarimento o monitoraggio ulteriore.

## Limiti del dato e stato di verifica

Prima e dopo la pubblicazione, ogni contenuto pubblico deve conservare il proprio contesto metodologico. In particolare:

- la presenza di un dato non implica che il quadro informativo sia completo;
- l'assenza di un dato può dipendere da aggiornamenti non ancora recepiti, differenze di pubblicazione, limiti tecnici o scelte di perimetro;
- i collegamenti alle fonti possono cambiare, interrompersi o richiedere verifica manuale;
- le informazioni derivate da fonti pubbliche devono essere lette insieme alle rispettive note, date di consultazione e limitazioni disponibili;
- i testi esplicativi devono evitare conclusioni non supportate dai documenti tracciati.

Quando una fonte, una pagina o un indicatore non è verificabile con ragionevole certezza, il contenuto deve essere classificato come `verifica richiesta` o escluso dalla promozione pubblica fino al chiarimento.

## Controllo fonti periodico

Il controllo fonti è manuale o semi-manuale finché non esiste un processo automatizzato approvato. La cadenza può essere definita dal team operativo in base alla disponibilità effettiva, senza promettere tempi pubblici garantiti.

Per ogni ciclo di controllo è opportuno registrare:

- data del controllo;
- area o pagina verificata;
- esito sintetico (`ok`, `verifica richiesta`, `dato non aggiornato`, `link non raggiungibile`, `fuori perimetro`);
- fonte o percorso interno consultato;
- eventuale issue o attività di follow-up;
- persona o ruolo che ha eseguito la verifica, quando applicabile.

Se un controllo evidenzia una possibile incoerenza, il contenuto deve essere trattato come data gap o trasparenza da verificare, non come evidenza di condotte improprie.

## Registro anomalie, feedback e triage

Le segnalazioni post-lancio devono essere gestite con un registro minimo, anche se inizialmente basato su issue GitHub o documento operativo equivalente. Ogni voce dovrebbe includere:

- identificativo della segnalazione;
- data di apertura;
- pagina, sezione o fonte interessata;
- descrizione prudente del problema osservato;
- classificazione iniziale (`bug`, `dato mancante`, `fonte non raggiungibile`, `testo da chiarire`, `accessibilità`, `richiesta informativa`, `fuori perimetro`);
- priorità operativa;
- stato (`aperta`, `in verifica`, `correzione proposta`, `chiusa`, `rinviata`);
- esito o motivazione della chiusura.

### Criteri minimi di priorità

Usare la priorità alta quando la segnalazione riguarda:

- errore che può cambiare il senso civico o metodologico di una pagina;
- link a fonte primaria non raggiungibile in una pagina pubblica centrale;
- testo che può essere letto come accusa, conclusione impropria o promessa non garantita;
- problema di accessibilità o fruibilità su una pagina essenziale;
- pubblicazione accidentale di informazioni non previste dal perimetro approvato.

Usare priorità media o bassa per miglioramenti editoriali, chiarimenti non bloccanti, richieste informative future o contenuti sperimentali non pubblicati.

## Checklist Go/No-Go manuale

La pubblicazione o promozione della v0 dovrebbe essere autorizzata solo dopo una verifica esplicita dei punti seguenti.

### Contenuto e tono

- [ ] Le pagine pubbliche spiegano che la v0 è una prima versione documentale e non esaustiva.
- [ ] Non sono presenti accuse, inferenze di intenzionalità o affermazioni su illeciti.
- [ ] Indicatori, segnali e ricorrenze sono accompagnati da caveat o note di verifica.
- [ ] Le priorità successive sono formulate senza date garantite o promesse di copertura.

### Fonti e tracciabilità

- [ ] Le fonti centrali disponibili sono raggiungibili o marcate come da verificare.
- [ ] I limiti del dato sono dichiarati nelle sezioni rilevanti.
- [ ] Non sono state introdotte nuove fonti esterne senza documentare origine, logica di aggiornamento, limitazioni e presupposti di uso pubblico.
- [ ] Eventuali data gap sono descritti come bisogni di verifica o monitoraggio, non come conclusioni.

### Operatività post-lancio

- [ ] Esiste un canale operativo per ricevere segnalazioni o aprire issue.
- [ ] È disponibile un registro minimo per anomalie, feedback e triage.
- [ ] È chiaro chi può decidere blocco, rinvio o pubblicazione di una correzione.
- [ ] Le verifiche tecniche richieste per il rilascio sono state eseguite o hanno un blocker documentato.

### Decisione

- [ ] `Go`: i punti bloccanti sono risolti o accettati esplicitamente con motivazione prudente.
- [ ] `No-Go`: almeno un punto bloccante resta aperto senza mitigazione sufficiente.
- [ ] La issue #341 resta aperta finché non esiste un Go/No-Go esplicito e verificabile.

## Prossimi passi senza date garantite

Dopo la v0, le attività possibili includono:

- consolidare il registro delle anomalie e dei feedback;
- migliorare la documentazione per fonti, limiti e criteri di promozione dei contenuti;
- valutare controlli automatici solo dove il perimetro e le fonti sono sufficientemente stabili;
- rafforzare accessibilità, metadati e leggibilità mobile delle pagine pubbliche;
- distinguere in modo sempre più chiaro tra sezioni sperimentali, sezioni in verifica e sezioni pubbliche consolidate.

Questi passi non implicano una data di rilascio, una copertura garantita o un impegno di SLA. Ogni avanzamento deve restare subordinato alla verifica delle fonti, alla sostenibilità operativa e alle cautele metodologiche del progetto.
