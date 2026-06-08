# Consolidamento backlog civico — issue sovrapposte

Documento di coordinamento per la PR collegata alla issue #52. Non introduce nuove feature: registra soltanto issue canoniche, issue correlate, sequenze di lavoro e regole conservative di triage per ridurre sovrapposizioni nel backlog.

## Criteri di consolidamento

- Una issue canonica raccoglie requisiti, criteri di accettazione e limiti metodologici di un'area funzionale.
- Le issue correlate restano consultabili, ma dovrebbero rimandare alla issue canonica prima di avviare implementazioni parallele.
- I requisiti non sovrapposti non vanno cancellati: vanno copiati o sintetizzati nella issue canonica con riferimento alla provenienza.
- Le implementazioni devono procedere per passaggi piccoli, verificabili e coerenti con le cautele civiche del progetto.

## Gruppi da consolidare

| Area                                                   | Issue canonica proposta | Issue da agganciare                                                                                               | Sequenza conservativa di lavoro                                                                                                                                                                                                              |
| ------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roadmap pubblica                                       | #40                     | #41, #42, #43                                                                                                     | 1. unificare obiettivi e criteri di accettazione in #40; 2. spostare in #40 eventuali task unici di #41-#43; 3. usare #41-#43 solo come refinement o chiuderle dopo conferma che non perdono contesto.                                       |
| Albo Monitor refinement                                | #32                     | #33, #34, #35                                                                                                     | 1. rendere #32 il perimetro funzionale principale; 2. portare in #32 vincoli su fonti, allegati, aggiornamento e copy prudente presenti solo nelle correlate; 3. lavorare eventuali sotto-task tecnici solo dopo allineamento del perimetro. |
| PNRR Tracker refinement                                | #36                     | #37, #38, #39                                                                                                     | 1. raccogliere in #36 requisiti su stato progetti, fonti, caveat e rappresentazione dei dati; 2. collegare #37-#39 come refinement; 3. implementare prima basi dati/API, poi UI e spiegazioni pubbliche.                                     |
| Registro criticità pubbliche / segnalazioni-disservizi | #28                     | future issue generiche su lamentele o disservizi                                                                  | #28 resta il riferimento per contenuto e repository delle segnalazioni; creare issue separate solo per refinement stretti, con rimando esplicito a #28.                                                                                      |
| Timeline mafia e antimafia                             | #69                     | future issue su cronologia e materiali storici                                                                    | #69 resta il riferimento funzionale; eventuali sotto-task devono conservare fonti, limiti e tono non accusatorio.                                                                                                                            |
| Promessometro amministrativo                           | #70                     | future issue su programma sotto verifica                                                                          | #70 resta il riferimento per promesse, stato di verifica e cautele metodologiche; evitare duplicati su singoli indicatori se non sono refinement puntuali.                                                                                   |
| Integrazione architetturale tra moduli civici          | #71                     | issue su hub, navigazione e collegamenti tra #28, #69, #70, Incarichimetro, FOIA, Delibere, Albo, PNRR e Legalità | #71 governa navigazione, hub e relazioni tra moduli; non assorbire lì requisiti di contenuto che appartengono alle issue canoniche di modulo.                                                                                                |

## Azioni consigliate sulle issue correlate

Per ogni issue correlata, aggiungere un commento o aggiornamento di descrizione con questo schema:

```text
Questa issue è collegata alla issue canonica #[numero].
Per evitare lavoro parallelo, i requisiti generali e i criteri di accettazione vanno consolidati in #[numero].
Questa issue resta utile solo per il seguente refinement specifico: [specificare oppure indicare "nessuno, chiudibile dopo verifica"].
```

Prima di chiudere o ridimensionare una issue correlata, verificare che tutti i requisiti specifici siano presenti nella issue canonica o siano stati esplicitamente esclusi con motivazione.

## Convenzione di triage proposta

1. Se una nuova issue riguarda contenuto, schema dati, fonti o criteri di accettazione di un singolo modulo, agganciarla alla issue canonica del modulo.
2. Se riguarda navigazione, hub, cross-link o relazioni tra più moduli, agganciarla alla issue #71.
3. Se riguarda copy prudente, note legali, caveat metodologici o cautele trasversali, agganciarla a #46 o #3 prima di aprire nuovi filoni.
4. Se contiene sia contenuto di modulo sia navigazione trasversale, separare il lavoro: modulo nella issue canonica, collegamenti in #71.
5. Se non è chiaro se una issue sia duplicata, non implementare: commentare con la possibile issue canonica, la parte davvero nuova e il blocco decisionale.

## Salvaguardie editoriali e metodologiche

- Il consolidamento non deve trasformare indicatori, ricorrenze o lacune informative in accuse o evidenze di responsabilità individuale.
- Le issue canoniche devono mantenere fonte, logica di aggiornamento, limiti dei dati e note di verifica richieste.
- Le issue correlate non devono perdere contesto utile: eventuali chiusure vanno fatte solo dopo aver preservato requisiti, caveat e riferimenti.
