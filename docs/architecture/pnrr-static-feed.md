# Feed statico PNRR di Lamezia Terme

## Obiettivo

La pagina pubblica `/pnrr` deve restare consultabile anche quando il servizio API
non è collegato alla pubblicazione statica Cloudflare. Il feed minimo usa soltanto
fonti ufficiali già pubbliche e conserva per ogni dato il collegamento puntuale
alla fonte.

Il perimetro non è presentato come censimento nazionale completo: descrive le
schede presenti nella sezione **Attuazione Misure PNRR** del Comune di Lamezia
Terme al momento dell'acquisizione. Un campo assente non viene trasformato in
zero e non dimostra assenza amministrativa, ritardo o criticità.

Il livello di pubblicazione è il singolo progetto identificato dal CUP. Missione,
componente e misura/investimento sono invece classificazioni gerarchiche
condivise: la loro ripetizione tra schede diverse non costituisce duplicazione
quando i CUP sono distinti. Il validatore rifiuta due schede comunali con lo
stesso CUP.

## Flusso di alimentazione

1. Il job giornaliero legge l'indice PNRR ufficiale del Comune e ricava gli URL
   puntuali delle schede progetto.
2. Ogni scheda viene acquisita integralmente prima di produrre un nuovo output.
   Il parser conserva titolo, Missione, Componente, investimento, intervento,
   soggetti, CUP, importo, eventuali date/stato e allegati esposti dalla pagina.
3. Per ogni CUP viene acquisita anche la scheda pubblica OpenCUP. Il corredo
   conserva denominazione e descrizione, anno della decisione, stato del CUP,
   costo e finanziamento pubblico previsti, titolare, localizzazione,
   classificazione, data di generazione, strumento di programmazione, eventuale
   CUP master/collegati e dati finanziari presenti. I campi OpenCUP restano in
   un oggetto separato e non sovrascrivono i valori comunali.
4. Gli allegati della scheda mantengono titolo, URL e ordine della fonte. Il
   titolo viene classificato in una fase documentale e può fornire una data o
   un anno soltanto quando questi sono espressi in modo esplicito. Il parser non
   legge il PDF e non usa la classificazione per dedurre avanzamento, ritardi o
   completamento del progetto.
5. I record pubblici dell'Albo Pretorio sono ammessi solo se hanno
   `public_visibility=publishable`, `privacy_risk=low` e provenienza ufficiale
   acquisita.
6. Un atto Albo viene collegato a una scheda progetto **soltanto** quando i due
   record condividono lo stesso CUP normalizzato. Un richiamo testuale al PNRR
   senza CUP resta un'evidenza non associata.
   Le evidenze già osservate restano nello storico descrittivo, ma ogni record
   ancora presente negli output correnti — inclusi quelli esclusi — viene
   rivalutato con la policy pubblica/privacy più recente.
7. Il dataset viene validato e scritto in
   `artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json`.
   Se una pagina non è acquisibile, il numero di schede scende sotto la soglia
   di sicurezza o una relazione non supera i controlli, il job fallisce senza
   sostituire l'ultima versione valida.
8. La pagina usa il feed comunale come base sempre disponibile. Se l'API PNRR è
   attiva, i record vengono arricchiti e uniti esclusivamente per CUP; le schede
   comunali non presenti nell'API restano consultabili.

## Archivio documentale delle schede

Gli allegati ufficiali non sono più presentati come un elenco indistinto. Ogni
scheda espone un archivio richiudibile, ordinato come la pagina comunale e
raggruppato secondo la tassonomia `pnrr-attachment-phase.v1`:

| Fase                           | Contenuti indicativi                                                        |
| ------------------------------ | --------------------------------------------------------------------------- |
| Programmazione e finanziamento | Avvisi, candidature, decreti di finanziamento, graduatorie e convenzioni    |
| Progettazione e autorizzazioni | Progetti, studi, indagini, conferenze di servizi, pareri e nomine tecniche  |
| Affidamenti e contratti        | Gare, decisioni a contrarre, affidamenti, aggiudicazioni e subappalti       |
| Esecuzione e spesa             | SAL, liquidazioni, anticipazioni, varianti e altri atti esecutivi/contabili |
| Collaudo e chiusura            | Collaudi, ultimazioni, regolare esecuzione e verifiche conclusive           |
| Altri documenti                | Titoli che non consentono una classificazione prudente                      |

La tassonomia è uno strumento di navigazione. Le fasi non sono mutuamente
esclusive sul piano amministrativo e l'assegnazione automatica usa soltanto il
titolo. Il dataset conserva inoltre `classification_basis`, `date_precision` e
`date_basis`, così l'interfaccia può distinguere una data completa da un semplice
anno presente nel nome del file.

## Provenienza e priorità

| Livello               | Fonte                                                                                                                | Uso                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Base pubblicabile     | [Comune di Lamezia Terme — Attuazione Misure PNRR](https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr) | Schede, CUP, importi e allegati comunali                             |
| Arricchimento CUP     | [OpenCUP — Sistema CUP](https://www.opencup.gov.it/portale/web/opencup/home)                                         | Anagrafica della decisione di investimento, localizzazione e classi  |
| Evidenza documentale  | Albo Pretorio del Comune, output pubblico sanificato                                                                 | Atti collegati con CUP identico                                      |
| Arricchimento runtime | API interna con Italia Domani/OpenPNRR e fonti comunali                                                              | Censimento e metadati aggiuntivi quando il servizio è disponibile    |
| Evoluzione prevista   | ReGiS/Italia Domani                                                                                                  | Riconciliazione del perimetro nazionale e degli stati di avanzamento |

La scheda comunale resta la fonte puntuale dei campi comunali. OpenCUP è una
seconda fonte ufficiale: costo previsto, finanziamento pubblico previsto e stato
del CUP sono mostrati con la propria etichetta anche quando non coincidono con
l'importo o lo stato comunale. Nessuna delle due fonti viene promossa
automaticamente a valore più aggiornato. Un eventuale valore runtime non cancella
i documenti comunali collegati; il merge mantiene gli identificatori API
necessari al monitoraggio civico soltanto per i record effettivamente presenti
nel database.

## Aggiornamento e controlli

- Esecuzione automatica giornaliera alle 05:45 UTC e avvio manuale disponibile.
- Tre tentativi HTTPS per ciascuna pagina, timeout per richiesta e concorrenza
  limitata.
- Soglia minima di schede, URL ufficiali obbligatori, CUP canonici e univoci,
  importi positivi e identificatori di fonte univoci.
- Verifica che la scheda OpenCUP confermi esattamente il CUP richiesto, che gli
  importi siano non negativi e che date, CUP master e conteggi siano coerenti.
- Se OpenCUP è temporaneamente indisponibile, conservazione dell'ultimo corredo
  valido per lo stesso CUP; la regressione di copertura oltre soglia blocca la
  scrittura.
- Verifica di tassonomia, ordine di fonte, precisione temporale e coerenza dei
  conteggi degli allegati.
- Verifica che ogni relazione progetto–atto condivida davvero il CUP.
- Rimozione del collegamento alla copia PDF locale quando il file non è più
  autorizzato dal manifest corrente o dalla allowlist revisionata; i metadati
  storici non rendono automaticamente servibile un allegato.
- Nessuna riscrittura se contenuti e relazioni non sono cambiati.
- Commit automatico solo sul branch `main`; le pull request eseguono i controlli
  senza scrivere sul repository.

## Limiti residui

- La data di pubblicazione della scheda non è trattata come data di aggiornamento
  o stato di avanzamento.
- L'inclusione nella sezione comunale identifica il perimetro del feed, non
  necessariamente l'ubicazione puntuale dell'intervento.
- Contratti, affidamenti e atti senza un CUP condiviso non vengono associati per
  somiglianza di titolo, importo o parole chiave.
- Lo storico degli atti inizia dalla prima materializzazione del feed e dagli
  archivi pubblici già presenti nel repository; gli snapshot precedenti non
  disponibili non vengono ricostruiti per inferenza.
- Gli allegati mantenuti nelle schede comunali possono documentare annualità
  precedenti alla prima materializzazione; ciò non li trasforma in uno storico
  completo delle pubblicazioni dell'Albo.
- I PDF presenti nell'albero di archivio ma non più referenziati dal manifest
  corrente o dalla allowlist revisionata non vengono recuperati, analizzati o
  pubblicati automaticamente. Servono una riconciliazione documentale e una
  revisione separata.
- La copertura nazionale e gli stati ReGiS/Italia Domani richiedono un successivo
  flusso di riconciliazione con pari garanzie di provenienza.
- Lo stato `ATTIVO` in OpenCUP riguarda il codice nel Sistema CUP: non è uno
  stato di avanzamento fisico o procedurale dei lavori.
- OpenCUP avverte che l'associazione di un intervento al PNRR può riflettere
  quanto indicato dal soggetto titolare in fase di generazione e non prova da
  sola l'ammissione definitiva al finanziamento.
- Le API REST OpenCUP richiedono registrazione e credenziali. Il flusso corrente
  acquisisce le schede pubbliche e non introduce segreti nel frontend o nel
  repository; i dati OpenCUP sono attribuiti al portale con licenza CC-BY.
