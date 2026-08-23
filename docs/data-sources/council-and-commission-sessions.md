# Sedute di Consiglio e Commissioni — identificazione fonte-centrica v0

Issue linkage: #740. Il metodo avvia una tranche verificabile e non dichiara copertura storica completa.

## Obiettivo e separazione degli stati

Il monitor distingue quattro passaggi che non sono equivalenti:

1. **avviso individuato** nell'Albo Pretorio;
2. **calendario e ordine del giorno controllati** su un allegato ufficiale;
3. **articoli di contesto revisionati**, collegati alla seduta o ai temi in agenda con un grado di relazione dichiarato;
4. **seduta svolta** documentata da una fonte istituzionale successiva.

Il passaggio 1 non autorizza inferenze sui passaggi 2 e 4; il passaggio 3 non sostituisce nessuno stato ufficiale. In particolare, `publication_start` e `publication_end` descrivono la finestra di pubblicazione nell'Albo e non vengono mai riutilizzati come data della seduta.

## Flusso v0

| Passaggio        | Implementazione                                                    | Gate                                                                                                                 |
| ---------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Acquisizione     | Pipeline Albo esistente (`pnpm albo:fetch`)                        | Fonte ufficiale acquisita                                                                                            |
| Identificazione  | `identifyInstitutionalSessionCandidates(...)`                      | Tipo atto esatto, record pubblicabile, rischio privacy basso, URL Albo ufficiale, hash e data di acquisizione validi |
| Candidato        | `council` o `commission`, con calendario e ordine del giorno vuoti | Nessuna estrazione automatica dal titolo o dalla finestra Albo                                                       |
| Arricchimento    | Confronto con allegato ufficiale e copia archiviata                | Revisione editoriale campo per campo; hash conservati                                                                |
| Ricerca contesto | Ricerca web per organo, data verificata e temi distintivi          | Sempre richiesta per un nuovo candidato; relazione e limiti revisionati, nessun riempimento dei campi ufficiali      |
| Pubblicazione    | Scheda v0 con stato, fonte e limite per ogni campo                 | Review umana del PR prima del merge                                                                                  |

I tipi atto riconosciuti in questa tranche sono:

- `CONVOCAZIONE CONSIGLIO COMUNALE` → `council`;
- `CONVOCAZIONI COMMISSIONI CONSILIARI` → `commission`.

Varianti, refusi o tipi atto più generici non vengono inclusi automaticamente: richiedono prima un caso fonte e un aggiornamento testato del dizionario.

## Prime fonti materializzate

Snapshot Albo di riferimento: commit `5c861b94256c9c659630d8ad19b2f27279d1721b`, acquisito l'11 agosto 2026 dalla [fonte ufficiale Tinnvision](https://albo.tinnvision.cloud/?ente=00301390795).

| Pubblicazione | Tipo               | Scheda                                             | Stato fonte                                                                      |
| ------------- | ------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| `2026/2673`   | Consiglio comunale | Avviso di seduta, senza data/ora/ordine del giorno | Solo metadati ufficiali; l'export non espone l'allegato                          |
| `2026/2648`   | II Commissione     | Seduta del 10 agosto 2026 alle 09:30               | Data, ora e due punti all'ordine del giorno confrontati con l'allegato ufficiale |
| `2026/2648`   | II Commissione     | Seduta dell'11 agosto 2026 alle 09:30              | Stessa convocazione e stesso ordine del giorno della riga precedente             |

Per `2026/2648`:

- [allegato ufficiale](https://albo.tinnvision.cloud/allegati/2026_2648_2_P?ente=00301390795);
- copia archiviata: `data/public/albo/documents/2026/842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304.pdf`;
- SHA-256 della copia archiviata: `842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304`;
- SHA-256 del PDF incorporato nella copia: `3069388db15c43fdbf3cc980195f9c88ded602a6e9f8f89f358a006ce789096c`.

La copia esterna è un PDF Portfolio con un PDF incorporato. Il testo della scheda sintetizza soltanto data, ora e i due punti dell'ordine del giorno; non pubblica l'elenco dei componenti né altri dati personali non necessari.

## Gerarchia delle fonti

1. Metadati e allegati dell'Albo Pretorio ufficiale.
2. Sezione istituzionale degli organi di governo, verbali e registrazioni ufficiali.
3. Altri canali ufficiali esplicitamente riferiti alla stessa seduta.
4. Fonti giornalistiche o social solo come segnale di ricerca o confronto, mai come sostituto automatico della fonte primaria per i campi centrali.

Per unificare due fonti istituzionali sulla stessa seduta servono almeno pubblicazione, organo e data; in caso di dubbio il campo resta `da_verificare`. I collegamenti giornalistici, che non unificano né completano i dati ufficiali, seguono invece le relazioni graduate descritte sotto.

## Ricerca contestuale: stampa, dirette e video

Ogni candidato prodotto da `identifyInstitutionalSessionCandidates(...)` porta un piano `contextSearch` con stato `required`. La ricerca viene eseguita una prima volta sui metadati disponibili e ripetuta dopo il controllo dell'allegato, quando data e ordine del giorno consentono interrogazioni più precise.

La ricerca combina, senza considerarli equivalenti:

- organo e denominazione della seduta;
- data esatta, solo se ricavata da una fonte istituzionale;
- frasi o riferimenti distintivi dell'ordine del giorno;
- numero di pubblicazione Albo come chiave aggiuntiva;
- una finestra temporale vicina alla seduta oppure, se la data manca, alla pubblicazione. Quest'ultima serve soltanto a cercare e non diventa la data della seduta.

La ricerca comprende sia articoli sia copertura audiovisiva. Controlla i canali istituzionali e, come fonti editoriali separate, City One, LameziaInforma, LameziaTermeNews, il Lametino e altre testate locali pertinenti, incluse eventuali pagine YouTube o Facebook indicizzate. Per intercettare dirette annunciate all'ultimo momento e replay successivi, il controllo viene ripetuto nel passaggio più vicino a 24 ore prima, poco prima dell'orario programmato, durante o subito dopo la seduta, 24 ore dopo e alla chiusura della finestra di sette giorni.

Ogni risultato revisionato riceve una delle relazioni seguenti:

| Relazione               | Requisito editoriale                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `same_session`          | Stesso organo e data esatta, più almeno un riscontro distintivo come ordine del giorno o numero della convocazione, senza contraddizioni |
| `possible_same_session` | Elementi compatibili ma insufficienti per stabilire che l'articolo descriva proprio la seduta                                            |
| `agenda_item`           | Collegamento preciso con un tema in agenda, senza elementi sufficienti per collegare l'articolo alla riunione                            |

I contenuti audiovisivi hanno inoltre un tipo dichiarato:

| Tipo             | Significato                                        |
| ---------------- | -------------------------------------------------- |
| `live_stream`    | Diretta editoriale annunciata o osservata          |
| `full_recording` | Registrazione editoriale presentata come integrale |
| `excerpt`        | Estratto o clip della seduta                       |
| `interview`      | Intervista collegata alla seduta o a un suo punto  |

Lo stato del collegamento è registrato come `scheduled`, `live`, `replay_available` o `unavailable` al momento del controllo. Una diretta o registrazione di City One, LameziaInforma, LameziaTermeNews o di un'altra testata resta copertura editoriale: non valorizza i campi istituzionali `liveStreaming` o `recording`. La scheda dà priorità a data e ordine del giorno; una categoria vuota non occupa una colonna dedicata ed è indicata con una sola riga. Gli elenchi usano link esterni attribuiti, senza player automatici o autoplay; motivazioni e note di ricerca restano richiudibili.

Le regole non permettono di usare la stampa o la copertura audiovisiva editoriale per completare data, ora, ordine del giorno, stato, presenze, votazioni o verbali. Un articolo non dimostra che una seduta sia stata convocata, svolta o rinviata. I titoli restano attribuiti alla testata; la nota di rilevanza del monitor descrive soltanto perché il collegamento è stato proposto.

Se la ricerca è stata eseguita senza risultati abbastanza precisi, lo stato è `checked_no_match`. Questo documenta il controllo compiuto e non dimostra che non esistano articoli pertinenti.

### Contesto revisionato il 23 agosto 2026

| Pubblicazione / seduta                     | Articolo                                                                                                                                                                                                                                                                                                             | Relazione               | Limite del collegamento                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `2026/2673` Consiglio                      | [Convocato Consiglio Comunale di Lamezia Terme in prossimità del ferragosto](https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/) — City One, 10 agosto 2026                                                                                                   | `possible_same_session` | Riporta data, orari e 33 punti compatibili; non completa i campi ufficiali privi di allegato               |
| `2026/2673` Consiglio                      | [Consiglio comunale prima di Ferragosto con soliti stilemi politici e qualche fuoriprogramma estivo](https://www.lameziainforma.it/istituzione/2026/08/13/consiglio-comunale-prima-di-ferragosto-con-soliti-stilemi-politici-e-qualche-fuoriprogramma-estivo/68880/) — LameziaInforma, 13 agosto 2026                | `possible_same_session` | L'organo, la giornata di pubblicazione e i temi sono compatibili; manca l'allegato ufficiale dell'avviso   |
| `2026/2673` Consiglio                      | [Question time politico evaso in consiglio comunale](https://www.lameziainforma.it/politica/2026/08/13/question-time-politico-evaso-in-consiglio-comunale/68885/) — LameziaInforma, 13 agosto 2026                                                                                                                   | `possible_same_session` | Resoconto contestuale della stessa giornata; non è una fonte ufficiale della convocazione                  |
| `2026/2648` II Commissione, 10 e 11 agosto | [Approvato in giunta l'assestamento generale di bilancio e salvaguardia degli equilibri per l'esercizio 2026](https://www.lameziainforma.it/istituzione/2026/08/06/approvato-in-giunta-lassestamento-generale-di-bilancio-e-salvaguardia-degli-equilibri-per-lesercizio-2026/68773/) — LameziaInforma, 6 agosto 2026 | `agenda_item`           | Approfondisce l'assestamento indicato in agenda; non documenta le riunioni della Commissione               |
| `2026/2648` II Commissione, 10 e 11 agosto | [LAMEZIA \| Bilancio, la maggioranza si sfalda in Giunta: tre assessori assenti. Muraca: «È sfiducia al sindaco»](https://lanovitaonline.it/lamezia-bilancio-la-maggioranza-si-sfalda-in-giunta-tre-assessori-assenti-muraca-e-sfiducia-al-sindaco/) — La Novità Online, 8 agosto 2026                               | `agenda_item`           | Riporta una posizione politica sul tema dell'assestamento; non verifica attività o esiti della Commissione |

Non sono emersi articoli che nominino con sufficiente precisione le sedute della II Commissione del 10 o 11 agosto. Per questo i due risultati sono presentati soltanto come contesto sui temi in agenda.

La homepage di City One indicizza anche il richiamo “Consiglio Comunale 13 Agosto 2026 - Video”. Il controllo del 23 agosto non ha però restituito una pagina stabile e verificabile per quel contenuto: il segnale resta annotato nella ricerca, ma non viene pubblicato come elemento `media` e non valorizza la registrazione ufficiale.

## Procedura di aggiornamento

1. Eseguire l'acquisizione Albo e conservare l'output pubblico source-safe.
2. Calcolare i candidati con `identifyInstitutionalSessionCandidates`.
3. Deduplicare per `id` Albo e `contentHash`; un hash cambiato riapre la revisione.
4. Se manca l'allegato, pubblicare al massimo una scheda metadata-only.
5. Se l'allegato è presente, confrontare manualmente organo, date, orari e ordine del giorno; conservare hash, data del controllo e limiti.
6. Eseguire la ricerca contestuale su articoli, dirette, registrazioni, estratti e interviste; ripeterla con data, orario e termini distintivi prima, durante e dopo la seduta, classificare ogni collegamento e conservare anche l'esito negativo.
7. Cercare separatamente eventuali registrazioni, verbali e resoconti istituzionali; “non rilevato” non significa “inesistente”.
8. Sottoporre il diff e le schede alla review umana prima del merge.

## Limiti residui

- L'export corrente dell'Albo non è un archivio storico completo.
- Il detector non esegue OCR e non interpreta PDF.
- Le schede revisionate sono curate in codice e non sono ancora materializzate automaticamente nella tabella `sedute`.
- La ricerca contestuale richiede revisione editoriale: articoli e video vengono materializzati soltanto in una PR revisionabile, con relazione, tipo, stato del collegamento e limiti espliciti.
- La convocazione non dimostra svolgimento, presenze, votazioni o esiti.
- Streaming, registrazioni, verbali e resoconti richiedono monitoraggi distinti.
