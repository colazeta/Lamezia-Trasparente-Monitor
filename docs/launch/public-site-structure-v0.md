# Struttura pubblica v0 di Lamezia Trasparente Monitor

Questo documento definisce una struttura pubblica semplice e spiegabile per la v0 del sito. Non introduce nuove funzionalità e non sostituisce la roadmap tecnica: serve a ordinare la narrazione pubblica, la home, la guida e la navigazione.

## Obiettivo della v0

La v0 deve permettere a un cittadino non tecnico di capire rapidamente:

1. che cosa può consultare oggi;
2. quali informazioni sono collegate a fonti pubbliche;
3. quali sezioni sono ancora sperimentali;
4. quali limiti hanno dati, indicatori e ricostruzioni;
5. come usare il sito senza interpretare segnali documentali come accuse o conclusioni definitive.

## Principio di lettura

Lamezia Trasparente Monitor non è il sito ufficiale del Comune e non certifica adempimenti, responsabilità o violazioni. È un monitor civico documentale: organizza fonti pubbliche, evidenzia dati disponibili o mancanti nelle fonti consultate e aiuta a formulare domande verificabili.

Ogni pagina pubblica dovrebbe quindi rispondere, in modo visibile, a cinque domande:

- Qual è l’oggetto della pagina?
- Da quali fonti deriva l’informazione?
- Quando è stata controllata o aggiornata?
- Che cosa non è ancora garantito?
- Quale azione civica prudente può fare l’utente?

## Cinque aree pubbliche

### 1. Cosa succede nel Comune

Area dedicata agli atti e alla vita istituzionale.

Sezioni candidate:

- Convocazioni.
- Delibere.
- Albo Pretorio.
- Atti fondamentali.
- Pareri e vigilanza.

Messaggio pubblico: “Qui puoi orientarti tra atti, sedute e documenti istituzionali, sempre con rinvio alle fonti disponibili.”

### 2. Come vengono spesi i soldi

Area dedicata a spesa, contratti, incarichi e progetti finanziati.

Sezioni candidate:

- Contratti e appalti.
- Incarichimetro.
- PNRR.
- Bandi e finanziamenti.
- Beni confiscati.

Messaggio pubblico: “Qui puoi leggere contratti, progetti e incarichi come dati documentali, non come giudizi automatici.”

### 3. Chi decide e come funziona la macchina comunale

Area dedicata a organi, amministratori e capacità amministrativa.

Sezioni candidate:

- Organi istituzionali.
- Amministratori.
- Macchina comunale.

Messaggio pubblico: “Qui puoi capire chi compone gli organi pubblici e quali informazioni sono disponibili sul funzionamento amministrativo.”

### 4. Cosa può fare il cittadino

Area dedicata alla partecipazione e all’azione civica prudente.

Sezioni candidate:

- Domande civiche.
- Monitor civico.
- Segnalazioni e criticità pubbliche.
- Accesso civico.
- Archivio proposte.
- Promessometro.

Messaggio pubblico: “Qui puoi trasformare dati mancanti, proposte e criticità documentate in domande civiche verificabili.”

### 5. Come leggere i dati

Area metodologica e di trasparenza del monitoraggio.

Sezioni candidate:

- Fonti dati.
- Stato del monitoraggio.
- Metodologia.
- Roadmap.
- Guida.
- Note legali.
- Chi siamo.
- Contatti.

Messaggio pubblico: “Qui trovi le regole di lettura, i limiti del progetto e lo stato effettivo del monitoraggio.”

## Home v0 consigliata

La home dovrebbe evitare l’effetto catalogo e aprire con tre blocchi:

1. **Che cos’è** — un monitor civico documentale su atti, spesa, amministrazione e partecipazione.
2. **Cosa puoi fare oggi** — consultare il primo percorso v0 pubblicabile e leggere fonti/limiti.
3. **Cosa è ancora in costruzione** — moduli sperimentali, dati incompleti, automazioni non ancora produttive.

Sotto questi blocchi, la home dovrebbe mostrare le cinque aree pubbliche come percorso guidato.

## Regole per la navigazione

La navigazione principale deve privilegiare percorsi comprensibili rispetto alla completezza tecnica.

Regole operative:

- massimo cinque macro-aree pubbliche;
- le sezioni sperimentali devono essere riconoscibili come tali;
- ogni voce deve avere una descrizione in linguaggio comune;
- le pagine non alimentate o dimostrative devono dichiararlo;
- la guida deve spiegare il percorso consigliato per un primo utente.

## Gate prima del lancio pubblico

Prima di dichiarare la v0 pubblicabile, verificare:

- CI verde su `main`;
- fallback statico o deploy pubblico raggiungibile;
- health check statico/documentato;
- routing diretto e reload sulle pagine principali;
- assenza di pagina bianca su Home, Convocazioni, Contratti, PNRR, Fonti dati e Metodologia;
- presenza di fonti, limiti e stato di verifica nei contenuti v0;
- copy prudente e non accusatorio;
- nessun dato personale non necessario;
- distinzione tra dati reali, fixture e moduli sperimentali.

## Priorità immediata

La priorità non è aggiungere nuove sezioni, ma rendere spiegabile ciò che già esiste. Dopo il ripristino della CI e la verifica del fallback statico, il prossimo intervento dovrebbe essere una piccola PR di information architecture su home, guida e navigazione, fondata su questa struttura a cinque aree.
