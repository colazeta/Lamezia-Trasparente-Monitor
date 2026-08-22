# Sedute di Consiglio e Commissioni — identificazione fonte-centrica v0

Issue linkage: #740. Il metodo avvia una tranche verificabile e non dichiara copertura storica completa.

## Obiettivo e separazione degli stati

Il monitor distingue tre passaggi che non sono equivalenti:

1. **avviso individuato** nell'Albo Pretorio;
2. **calendario e ordine del giorno controllati** su un allegato ufficiale;
3. **seduta svolta** documentata da una fonte successiva.

Il passaggio 1 non autorizza inferenze sui passaggi 2 e 3. In particolare, `publication_start` e `publication_end` descrivono la finestra di pubblicazione nell'Albo e non vengono mai riutilizzati come data della seduta.

## Flusso v0

| Passaggio       | Implementazione                                                    | Gate                                                                                                                 |
| --------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Acquisizione    | Pipeline Albo esistente (`pnpm albo:fetch`)                        | Fonte ufficiale acquisita                                                                                            |
| Identificazione | `identifyInstitutionalSessionCandidates(...)`                      | Tipo atto esatto, record pubblicabile, rischio privacy basso, URL Albo ufficiale, hash e data di acquisizione validi |
| Candidato       | `council` o `commission`, con calendario e ordine del giorno vuoti | Nessuna estrazione automatica dal titolo o dalla finestra Albo                                                       |
| Arricchimento   | Confronto con allegato ufficiale e copia archiviata                | Revisione editoriale campo per campo; hash conservati                                                                |
| Pubblicazione   | Scheda v0 con stato, fonte e limite per ogni campo                 | Review umana del PR prima del merge                                                                                  |

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

Ogni collegamento fra fonti deve usare almeno pubblicazione, organo e data; in caso di dubbio il campo resta `da_verificare`.

## Procedura di aggiornamento

1. Eseguire l'acquisizione Albo e conservare l'output pubblico source-safe.
2. Calcolare i candidati con `identifyInstitutionalSessionCandidates`.
3. Deduplicare per `id` Albo e `contentHash`; un hash cambiato riapre la revisione.
4. Se manca l'allegato, pubblicare al massimo una scheda metadata-only.
5. Se l'allegato è presente, confrontare manualmente organo, date, orari e ordine del giorno; conservare hash, data del controllo e limiti.
6. Cercare separatamente eventuali registrazioni, verbali e resoconti; “non rilevato” non significa “inesistente”.
7. Sottoporre il diff e le schede alla review umana prima del merge.

## Limiti residui

- L'export corrente dell'Albo non è un archivio storico completo.
- Il detector non esegue OCR e non interpreta PDF.
- Le schede revisionate sono curate in codice e non sono ancora materializzate automaticamente nella tabella `sedute`.
- La convocazione non dimostra svolgimento, presenze, votazioni o esiti.
- Streaming, registrazioni, verbali e resoconti richiedono monitoraggi distinti.
