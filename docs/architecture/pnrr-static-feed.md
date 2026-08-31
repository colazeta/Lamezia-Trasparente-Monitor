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

## Flusso di alimentazione

1. Il job giornaliero legge l'indice PNRR ufficiale del Comune e ricava gli URL
   puntuali delle schede progetto.
2. Ogni scheda viene acquisita integralmente prima di produrre un nuovo output.
   Il parser conserva titolo, Missione, Componente, investimento, intervento,
   soggetti, CUP, importo, eventuali date/stato e allegati esposti dalla pagina.
3. I record pubblici dell'Albo Pretorio sono ammessi solo se hanno
   `public_visibility=publishable`, `privacy_risk=low` e provenienza ufficiale
   acquisita.
4. Un atto Albo viene collegato a una scheda progetto **soltanto** quando i due
   record condividono lo stesso CUP normalizzato. Un richiamo testuale al PNRR
   senza CUP resta un'evidenza non associata.
   Le evidenze già osservate restano nello storico descrittivo, ma ogni record
   ancora presente negli output correnti — inclusi quelli esclusi — viene
   rivalutato con la policy pubblica/privacy più recente.
5. Il dataset viene validato e scritto in
   `artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json`.
   Se una pagina non è acquisibile, il numero di schede scende sotto la soglia
   di sicurezza o una relazione non supera i controlli, il job fallisce senza
   sostituire l'ultima versione valida.
6. La pagina usa il feed comunale come base sempre disponibile. Se l'API PNRR è
   attiva, i record vengono arricchiti e uniti esclusivamente per CUP; le schede
   comunali non presenti nell'API restano consultabili.

## Provenienza e priorità

| Livello               | Fonte                                                                                                                | Uso                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Base pubblicabile     | [Comune di Lamezia Terme — Attuazione Misure PNRR](https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr) | Schede, CUP, importi e allegati comunali                             |
| Evidenza documentale  | Albo Pretorio del Comune, output pubblico sanificato                                                                 | Atti collegati con CUP identico                                      |
| Arricchimento runtime | API interna con Italia Domani/OpenPNRR e fonti comunali                                                              | Censimento e metadati aggiuntivi quando il servizio è disponibile    |
| Evoluzione prevista   | ReGiS/Italia Domani                                                                                                  | Riconciliazione del perimetro nazionale e degli stati di avanzamento |

La scheda comunale resta la fonte puntuale per i valori materializzati dal feed.
Un eventuale valore runtime non cancella i documenti comunali collegati; il merge
mantiene gli identificatori API necessari al monitoraggio civico soltanto per i
record effettivamente presenti nel database.

## Aggiornamento e controlli

- Esecuzione automatica giornaliera alle 05:45 UTC e avvio manuale disponibile.
- Tre tentativi HTTPS per ciascuna pagina, timeout per richiesta e concorrenza
  limitata.
- Soglia minima di schede, URL ufficiali obbligatori, CUP canonici, importi
  positivi e identificatori univoci.
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
- La copertura nazionale e gli stati ReGiS/Italia Domani richiedono un successivo
  flusso di riconciliazione con pari garanzie di provenienza.
