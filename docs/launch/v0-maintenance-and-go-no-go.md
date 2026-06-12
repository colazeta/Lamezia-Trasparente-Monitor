# v0 — manutenzione minima e checklist Go/No-Go

Issue di riferimento: #364. Contesto di lancio: #341.

Questo documento definisce un presidio minimo, manuale e verificabile per accompagnare la v0 di Lamezia Trasparente Monitor dopo la pubblicazione. È intenzionalmente prudente: non introduce nuove fonti, non certifica completezza dei dati e non sostituisce verifiche amministrative o legali.

## Che cos'è la v0

La v0 è una prima versione pubblica e documentale del progetto. Serve a rendere più leggibili alcune informazioni amministrative di interesse civico già disponibili o tracciate nel perimetro del progetto, con attenzione a:

- spiegare il contesto e i limiti delle informazioni mostrate;
- indicare quando un contenuto richiede verifica o aggiornamento;
- separare chiaramente dati, note metodologiche e prossimi approfondimenti;
- raccogliere feedback, segnalazioni di errore e bisogni informativi ricorrenti.

La v0 non è una certificazione ufficiale, non è un archivio completo degli atti comunali e non formula giudizi su responsabilità, correttezza amministrativa o qualità della gestione pubblica.

## Cosa non contiene

La v0 non deve promettere:

- copertura completa o aggiornata in tempo reale delle fonti;
- monitoraggio automatico stabile di tutti i siti o canali istituzionali;
- classifiche, punteggi, attribuzioni di colpa o valutazioni di performance;
- interpretazioni legali, giornalistiche o investigative;
- date garantite di aggiornamento, tempi di risposta o SLA.

Ogni sezione pubblica deve dichiarare se il contenuto è dimostrativo, in verifica, snapshot manuale o collegato a una fonte controllata.

## Limiti del dato e stato di verifica

Per ogni contenuto civico pubblicabile, la v0 deve mantenere almeno una delle seguenti indicazioni:

- fonte o percorso della fonte consultata;
- data o momento dell'ultimo controllo manuale, quando disponibile;
- stato del dato: verificato, parziale, dimostrativo, assente o da verificare;
- limite operativo: fonte non raggiunta, campo non pubblicato, formato non leggibile, dato non ancora normalizzato.

L'assenza di un'informazione pubblica non deve essere descritta come inadempienza, opacità o irregolarità. Deve restare una necessità di verifica o un limite della fonte osservata.

## Controllo fonti post-lancio

Dopo la pubblicazione della v0, il controllo fonti resta manuale finché non esiste una pipeline affidabile. La verifica minima consigliata è:

1. controllare che la pagina pubblica sia raggiungibile;
2. aprire la sezione v0 principale e verificare che il contenuto non sia vuoto;
3. controllare che fonti, limiti e stato di verifica siano visibili;
4. verificare che eventuali link a fonti esterne non siano descritti come certificati se non sono stati controllati;
5. annotare anomalie, link rotti o testo ambiguo nel ledger operativo.

Se una fonte istituzionale cambia struttura, non va improvvisato un adattamento pubblico: la sezione deve rimanere in stato parziale o da verificare finché la nuova fonte non è ricontrollata.

## Registro anomalie e feedback

Ogni anomalia ricevuta o osservata dopo il lancio va classificata con una priorità semplice:

- `P0`: pagina non raggiungibile, build rotta, contenuto potenzialmente fuorviante o rischio privacy/legal;
- `P1`: fonte primaria errata, link essenziale rotto, stato di verifica mancante;
- `P2`: miglioramento di chiarezza, accessibilità, navigazione o copy;
- `P3`: richiesta di nuova feature o ampliamento non necessario alla v0.

Le anomalie `P0` e `P1` devono essere trattate prima di nuove feature. Le richieste `P3` restano backlog finché la v0 non è stabile.

## Salvaguardie copy, privacy e metodo

Prima di rendere visibile o aggiornare una sezione pubblica, verificare che:

- non siano presenti dati personali non necessari;
- non siano usate formule accusatorie o suggestive;
- il testo distingua osservazione, dato disponibile e limite della fonte;
- eventuali esempi demo siano dichiarati come dimostrativi;
- non siano presenti riferimenti a configurazioni, token, path locali o dati interni.

Quando il dubbio riguarda privacy, profili personali, responsabilità o implicazioni legali, l'aggiornamento va parcheggiato per revisione umana.

## Checklist Go/No-Go manuale

La v0 è pubblicabile solo se tutti i punti minimi sono soddisfatti:

- [ ] il sito pubblico o il fallback statico è raggiungibile;
- [ ] la build usata per pubblicare è identificabile;
- [ ] la navigazione verso l'output civico minimo è comprensibile;
- [ ] almeno una scheda o pagina civica mostra contenuto utile, anche demo o fonte-centrico;
- [ ] fonti, limiti del dato e stato di verifica sono visibili;
- [ ] non ci sono promesse di completezza, aggiornamento automatico o copertura totale;
- [ ] non ci sono dati sensibili, segreti, token o riferimenti interni;
- [ ] esiste una procedura di rollback o fallback manuale;
- [ ] il ledger umano contiene le decisioni ancora aperte;
- [ ] le anomalie note sono classificate e non bloccano la pubblicazione prudente.

Se uno dei punti essenziali fallisce, il rilascio deve rimanere in stato `no-go` o `fallback-only`.

## Prossimi passi dopo la v0

Dopo una pubblicazione prudente, i passi successivi devono privilegiare stabilità e verificabilità:

- consolidare la scheda seduta/convocazione del Consiglio comunale;
- migliorare la navigazione tra fonti, limiti e contenuto civico;
- rendere esplicito il metodo di aggiornamento;
- ridurre il numero di decisioni manuali ricorrenti;
- distinguere in modo sempre più chiaro tra sezioni sperimentali, sezioni in verifica e sezioni pubbliche consolidate.

Questi passi non implicano una data di rilascio, una copertura garantita o un impegno di SLA. Ogni avanzamento deve restare subordinato alla verifica delle fonti, alla sostenibilità operativa e alle cautele metodologiche del progetto.
