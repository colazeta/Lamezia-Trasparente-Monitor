# Navigazione minima v0 per la pubblicazione

Issue di riferimento: #360. Parent release readiness: #341.

Dipendenze del release train:

- #359 deve stabilizzare il primo output civico e le relative superfici UI prima che questo percorso possa essere presentato come verificabile.
- #360 usa questo documento come checklist docs-only per decidere se la PR UI successiva può rendere pubblico il percorso minimo.
- #361 deve rimanere allineata con gli stati e i limiti descritti qui, senza anticipare contenuti, dati o promesse non ancora verificati.

Questo documento non introduce nuove pagine, dati, fonti live, componenti, route o copy applicativo. Serve solo a rendere verificabile il percorso pubblico minimo: Home -> primo output civico -> scheda seduta o convocazione -> fonti e limiti.

## Obiettivo v0

La v0 deve permettere a una persona non esperta di capire rapidamente:

1. qual è il percorso principale da seguire;
2. quale contenuto è già pubblicabile;
3. quale contenuto è sperimentale, in preparazione o non pronto;
4. quali fonti sostengono le informazioni mostrate;
5. quali limiti impediscono di trattare il sito come archivio completo o certificazione amministrativa.

Il criterio non è completezza della piattaforma. Il criterio è pubblicabilità prudente di un percorso minimo, verificabile e mantenibile.

## Stati ammessi nella navigazione v0

| Stato | Significato operativo | Uso consentito in v0 |
| --- | --- | --- |
| `pubblicabile` | Percorso essenziale presente, comprensibile, senza link rotti e con fonti o limiti espliciti. | Può essere esposto come parte del percorso principale. |
| `sperimentale` | Funzione o contenuto utile ma non ancora consolidato. | Può essere mostrato solo se il copy segnala chiaramente la natura sperimentale. |
| `in preparazione` | Area prevista ma non ancora pronta per l'uso pubblico. | Può comparire solo come nota di roadmap, senza CTA primaria. |
| `non pronto` | Area vuota, fragile, priva di fonti o con rischio di ambiguità. | Non deve essere presentata come disponibile o completa. |

## Percorso utente primario

Il percorso minimo pubblicabile è:

1. Home.
2. Primo output civico.
3. Scheda seduta o convocazione del Consiglio comunale.
4. Fonti, limiti del dato e stato di verifica.

Ogni passaggio deve rispondere a una domanda semplice.

### 1. Home

Domanda utente: "Che cosa posso verificare oggi?"

Requisiti minimi:

- indicare che la v0 è prudente e parziale;
- indirizzare verso un solo percorso principale;
- non promettere copertura completa degli atti, delle sedute o delle convocazioni;
- evitare giudizi politici, amministrativi o personali;
- distinguere chiaramente tra contenuti pubblicabili e contenuti in preparazione.

CTA minima consigliata:

- "Consulta il primo percorso verificabile";
- "Leggi fonti e limiti del dato".

Non usare CTA come:

- "Scopri tutta la trasparenza del Comune";
- "Verifica ogni seduta";
- "Controlla chi non partecipa";
- "Trova irregolarità".

### 2. Primo output civico

Domanda utente: "Qual è l'informazione civica iniziale su cui posso orientarmi?"

Requisiti minimi:

- presentare un output limitato e dichiarato;
- collegare l'output alla scheda seduta o convocazione;
- indicare se il contenuto è demo, parziale, manuale, sperimentale o in attesa di verifica;
- non introdurre dati live non verificati;
- non usare ranking, punteggi o inferenze su comportamenti individuali.

Stato ammesso prima del merge di #359/#396: `in preparazione` o `sperimentale`, non `pubblicabile`.

### 3. Scheda seduta o convocazione

Domanda utente: "Che cosa so della seduta o convocazione e da dove lo so?"

Requisiti minimi:

- titolo comprensibile;
- data o riferimento temporale se disponibile;
- fonte primaria o nota esplicita di assenza fonte primaria;
- stato di verifica;
- limiti del dato;
- link di ritorno al percorso principale;
- nessuna inferenza non documentata.

La scheda è pubblicabile solo se non lascia intendere che il sito sostituisca albo pretorio, sezione amministrazione trasparente, atti ufficiali o comunicazioni istituzionali.

### 4. Fonti, limiti e stato di verifica

Domanda utente: "Quanto posso fidarmi di ciò che vedo?"

Requisiti minimi:

- spiegare la fonte usata;
- indicare quando la fonte non è disponibile o non è stata ancora verificata;
- distinguere dato, nota redazionale e stato del lavoro;
- chiarire che la v0 non certifica completezza o aggiornamento continuativo;
- indicare una procedura minima per segnalare errori o aggiornamenti.

Questa parte deve restare allineata con #361.

## Navigazione secondaria consentita

La v0 può mostrare navigazione secondaria solo se non distrae dal percorso principale.

Consentito:

- link a metodologia;
- link a fonti e limiti;
- link a documentazione di manutenzione;
- link a feedback o segnalazione errore, se già disponibile;
- pagina 404 con ritorno alla Home e al percorso principale.

Non consentito come percorso pubblico primario:

- aree senza contenuto;
- pagine demo presentate come definitive;
- sezioni con dati non verificati;
- percorsi che richiedono infrastruttura non ancora pronta;
- feature backlog presentate come già operative.

## Gestione pagina 404

La 404 deve essere semplice e non colpevolizzante.

Requisiti minimi:

- messaggio: pagina non trovata o contenuto non disponibile;
- link alla Home;
- link al percorso principale, se esiste;
- nessun riferimento a errore dell'utente;
- nessuna promessa di recupero automatico del contenuto.

La 404 è una stop condition se non permette di rientrare nel percorso principale.

## Smoke checklist desktop e mobile

Controlli manuali minimi prima di dichiarare #360 pronto per la PR UI successiva:

1. Da desktop, la Home espone un solo percorso principale verso il primo output civico.
2. Da mobile, la CTA principale è visibile senza dover attraversare sezioni sperimentali.
3. Ogni link del percorso Home -> output -> scheda -> fonti/limiti funziona o è esplicitamente non pronto.
4. La scheda seduta o convocazione non contiene claim di completezza, certificazione o copertura totale.
5. Le fonti e i limiti sono raggiungibili dalla scheda senza ambiguità.
6. La navigazione secondaria non presenta backlog, demo o aree vuote come contenuti completi.
7. La pagina 404 consente il ritorno alla Home e non crea un vicolo cieco.
8. Il testo resta leggibile su viewport mobile senza dipendere da tabelle larghe o elementi hover-only.
9. Le aree `sperimentale`, `in preparazione` e `non pronto` sono distinguibili anche senza colore.
10. Nessuna pagina del percorso introduce dati personali, scraping nuovo o fonti live non verificate.

## Stop conditions

Non pubblicare la navigazione minima se si verifica anche una sola delle seguenti condizioni:

- link rotto nel percorso principale;
- scheda seduta o convocazione vuota;
- fonti assenti senza nota esplicita;
- limiti del dato non visibili;
- claim di completezza, copertura totale o certificazione;
- contenuto demo presentato come definitivo;
- area sperimentale usata come CTA primaria senza avviso;
- pagina 404 senza ritorno alla Home;
- copy con giudizi politici, amministrativi, personali o accusatori;
- dipendenza da API, worker, dominio o deploy non ancora pronti senza fallback statico.

## Criteri di readiness per revisione umana

#360 può essere considerata pronta per una PR UI successiva solo se:

- #359/#396 ha definito un primo output civico materializzabile;
- #361 ha una formulazione coerente su fonti, limiti e stato di verifica;
- gli stati ammessi sono applicabili senza introdurre ambiguità;
- il percorso principale è descrivibile in una frase;
- le stop conditions sono state controllate su desktop e mobile;
- gli elementi non pronti non sono presentati come completi;
- il copy pubblico resta prudente, documentale e non accusatorio.

## Handoff

Questo file è un artefatto docs-only. Non autorizza merge, pubblicazione o modifica UI. La decisione successiva è una PR separata, piccola e verificabile, che traduca questa checklist in navigazione pubblica solo dopo il consolidamento di #359, #361 e degli altri blocker del release train v0.
