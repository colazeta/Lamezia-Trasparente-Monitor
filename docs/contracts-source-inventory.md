# Contratti pubblici: source inventory

Questa inventory descrive le famiglie di fonte utili al modulo contratti/opere. Non equivale a una mappa di copertura completa: indica cosa puo essere collegato o ingerito, quali fasi puo sostenere e quali limiti devono restare visibili nella UI pubblica.

## Regola chiave CIG/CUP

- Il `CIG` segue l'asse procedura/contratto/lotto: gara, pubblicazione, affidamento e informazioni di contratto quando presenti nella fonte.
- Il `CUP` segue l'asse investimento/progetto/opera: programmazione, progetto, localizzazione dell'intervento e monitoraggio opera quando disponibili.
- CIG e CUP non sono intercambiabili. Per lavori pubblici il CIG non basta a ricostruire l'opera; il CUP non basta a ricostruire gara, affidamento e lotto.

## Manifesto delle fonti ufficiali

Il manifesto machine-readable e in `data/sources/contracts/contracts-source-manifest.json`. Descrive famiglie di fonte e il relativo stato tecnico; i record pubblici ANAC eventualmente acquisiti restano nello snapshot separato `data/public/contracts/anac-bdncp/latest.json`.

La discovery delle fonti resta separata dall'ingestione dei record per tre ragioni:

- prima si fissano URL ufficiali, identificativi, formati, update mode e limiti pubblici;
- poi si progettano parser separati per ANAC CIG annuali, delta/update, aggiudicazioni, layer OCDS/OCDS-style, OpenCUP e MOP;
- solo dopo una fonte strutturata, verificata e versionabile puo alimentare dati reali nella piattaforma.

La pipeline mensile CIG ora legge pacchetti ufficiali entro una finestra limitata e pubblica separatamente lo stato di connessione. La UI non presenta il manifesto o un mancato match come prova di completezza BDNCP o di assenza del contratto.

Il manifesto mantiene separati gli assi CIG e CUP:

- `CIG`: asse gara/procedura/lotto/contratto per BDNCP, PVL, dataset CIG, aggiudicazioni e operatori;
- `CUP`: asse progetto/investimento/opera per OpenCUP e MOP;
- fonti miste come OCDS-style o dataset locali possono contenerli entrambi, ma non li rendono intercambiabili.

## Discovery storica e verifica corrente

Lo spike del 2026-06-27 aveva lasciato il dataset annuale in verifica manuale. La verifica del 2026-09-01 ha censito le pagine ufficiali del dataset CIG annuale, degli aggiornamenti CIG e del layer OCDS 2026, oltre a una risorsa mensile CSV ZIP e a una risorsa bulk OCDS.

Stato corrente:

- `anac-open-data-cig-annual` e verificato come fonte, ma non viene scaricato;
- `anac-open-data-cig-delta` ha una pipeline operativa, limitata e con cache ultimo-dato-valido;
- `anac-ocds-bdncp` e verificato nel catalogo, ma resta fuori dalla pipeline corrente;
- la disponibilita di ogni pacchetto mensile viene controllata a ogni esecuzione e non e presunta.

Il report machine-readable dello spike e in `data/interim/contracts/source-discovery/anac-open-data-cig-annual.discovery.json`. Il report contiene solo metadata di discovery, probe HTTP e limiti; non contiene CIG reali, CUP reali, operatori, importi, date di affidamento o record di contratto.

Dettagli operativi, stati e comportamento degradato sono documentati in `docs/contracts-anac-bdncp-sync.md`.

## Ingestion dry-run

Il dry-run ANAC CIG esegue la pipeline tecnica senza superare il gate pubblico:

- legge il report di discovery `data/interim/contracts/source-discovery/anac-open-data-cig-annual.discovery.json`;
- esegue il parser solo sulla fixture sintetica `artifacts/lamezia-trasparente/src/test/fixtures/contracts/anac/anac-cig-fixture.json`;
- produce un report interim in `data/interim/contracts/ingestion/`;
- mantiene `production_ingestion_allowed: false`, `production_records_written: false`, `public_app_data_written: false` e `database_writes: false`.

Quel dry-run storico resta `blocked_by_source_discovery` perche legge il report interim del 2026-06-27. Dimostra soltanto il vecchio contratto fixture/parser e non alimenta la pipeline mensile operativa, che usa un file pubblico e un parser separati.

## Famiglie di fonte

| Fonte                                               | Identificativi primari                                                | Asse fonte                                                    | Fasi supportabili                                                                                                       | Update atteso                                                              | Stato attuale                                                        | Limiti e copy pubblica                                                                                                                             |
| --------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ANAC BDNCP / Piattaforma Contratti Pubblici         | CIG, procedure id, lot id, eventuali CUP collegati                    | procedure-centred, lot-centred, contract-centred              | gara/pubblicazione, affidamento; altre fasi solo se presenti nei record ufficiali disponibili                           | portale/dati aperti, modalita specifica da verificare per dataset          | link bridge; ingestion candidate                                     | Usare `ponte di ricerca` o `fonte ufficiale collegata` finche il record non e ingerito. Non dichiarare sync BDNCP completa.                        |
| ANAC Pubblicita a Valore Legale                     | CIG, publication id, procedure id                                     | publication-centred, procedure-centred                        | gara/pubblicazione, avvisi, esiti quando pubblicati                                                                     | portale ufficiale, frequenza da verificare                                 | link bridge                                                          | Usare come punto ufficiale di ricerca. Non dedurre affidamento/esecuzione se il contenuto non e ingerito.                                          |
| ANAC open data - dataset CIG annuali                | CIG, lot id, procedure id, stazione appaltante                        | procedure-centred, lot-centred                                | gara/pubblicazione; affidamento solo se campi di aggiudicazione sono presenti e significativi                           | full dump annuale o periodico, da verificare per pacchetto                 | parser skeleton per fixture JSON; ingestion candidate per dati reali | `fonte ufficiale ingerita` solo dopo parsing da file ufficiale stabile. CIG-only non completa esecuzione o collaudo.                               |
| ANAC open data - delta/update CIG                   | CIG, lot id, update id                                                | procedure-centred, delta-centred                              | aggiornamento di gara/pubblicazione e affidamento se i campi sono presenti                                              | pacchetti mensili, disponibilita verificata a ogni esecuzione              | implementato con finestra limitata e cache ultimo dato valido        | Un mancato match non prova assenza dalla BDNCP; lo stato fonte resta sempre visibile.                                                              |
| ANAC open data - aggiudicazioni/esiti               | CIG, lot id, award id, operator id                                    | award-centred, lot-centred                                    | affidamento; importi/operatori solo se presenti                                                                         | full/delta/periodic, da verificare                                         | ingestion candidate                                                  | Puo documentare affidamento; non documenta esecuzione, SAL, liquidazioni o collaudo.                                                               |
| ANAC open data - operatori/partecipanti             | operator id, codice fiscale/partita IVA dove pubblici, CIG/lot id     | operator-centred, lot-centred                                 | gara/pubblicazione, partecipazione, aggiudicazione se collegata                                                         | full/delta/periodic, da verificare                                         | ingestion candidate                                                  | Non trasformare partecipazione o ricorrenza in valutazione sostanziale. Copy: `dato derivato` o `fonte ufficiale ingerita` per campi parserizzati. |
| ANAC OCDS BDNCP / layer OCDS-style                  | OCID/procedure id, lot id, award id, contract id, CIG, CUP se esposto | OCDS release/package-centred; procedure, lot, award, contract | programmazione/gara/affidamento/contratto in base alle release disponibili; esecuzione solo se esplicitamente modellata | full/delta release packages, da verificare nel catalogo ufficiale corrente | ingestion candidate, non implemented                                 | Prima PR futura deve fissare schema e package ufficiali. Non usare `OCDS` come sinonimo di completezza lifecycle.                                  |
| OpenCUP                                             | CUP, project id, soggetto titolare, localizzazione progetto           | project/work-centred                                          | programmazione, progettazione/asse progetto, informazioni investimento                                                  | portale/dataset, modalita da verificare                                    | not implemented                                                      | Serve per asse opera/progetto. Copy: `CUP presente` o `CUP non rilevato nelle fonti disponibili`. Non sostituisce il CIG.                          |
| MOP / Monitoraggio Opere Pubbliche                  | CUP, opera/intervento id, amministrazione, localizzazione             | project/work-centred, execution-monitoring-centred            | programmazione, progettazione, esecuzione, avanzamento, collaudo/esito solo se fonte esplicita                          | BDAP/OpenBDAP o flussi periodici, da verificare                            | not implemented                                                      | Potenziale fonte per esecuzione/collaudo opere. Finche assente, le fasi restano `non documentate nelle fonti disponibili`.                         |
| Comune di Lamezia Terme Albo Pretorio               | publication id, progressivo, CIG/CUP citati, allegati                 | publication-centred, document-centred                         | affidamento, contratto, varianti, liquidazioni, collaudo quando gli atti citano CIG/CUP                                 | pubblicazione continuativa; raccolta locale gia presente                   | implemented per storyline locale                                     | Fonte locale collegata, non sostituisce ANAC/BDNCP. Allegati mancanti restano `dato derivato` o `da verificare`.                                   |
| Comune di Lamezia Terme Amministrazione Trasparente | publication/page id, CIG, CUP, atti, sezioni amministrative           | document-centred, publication-centred                         | gara/pubblicazione, affidamento e documenti correlati quando presenti                                                   | manual/periodic, dipende dalla sezione                                     | not implemented per parser contratti                                 | Da usare con URL e data acquisizione. Non inferire completezza da pagine mancanti.                                                                 |
| Dataset locali Lamezia Trasparente derivati         | internal id, CIG, CUP, publication id                                 | local/derived                                                 | lettura civica, filtri, collegamenti e sintesi                                                                          | manual/derived da pipeline locali                                          | implemented come dato locale/derivato                                | Copy: `dato derivato`, `limite informativo`, `da verificare`. Non e fonte ufficiale primaria.                                                      |

## Fasi e copertura

| Fonte                       | Programmazione           | Progettazione             | Gara/pubblicazione           | Affidamento                         | Esecuzione                    | Valutazione/collaudo/esito       |
| --------------------------- | ------------------------ | ------------------------- | ---------------------------- | ----------------------------------- | ----------------------------- | -------------------------------- |
| BDNCP/PCP                   | solo se record esplicito | solo se record esplicito  | si                           | si se campi presenti                | solo se fonte esplicita       | solo se fonte esplicita          |
| PVL                         | no                       | no                        | si                           | esiti se pubblicati                 | no                            | no                               |
| ANAC CIG/open data          | no                       | no                        | si                           | si se campi aggiudicazione presenti | no                            | no                               |
| ANAC OCDS/OCDS-style        | dipende dalle release    | dipende dalle release     | si                           | si                                  | solo se release esplicite     | solo se release esplicite        |
| OpenCUP                     | si                       | si per asse progetto      | no                           | no                                  | limitato/indiretto            | no                               |
| MOP                         | si                       | si                        | no                           | no                                  | si se avanzamento disponibile | si se collaudo/esito disponibile |
| Albo Pretorio               | no                       | possibile se atto tecnico | possibile se atto pubblicato | si                                  | si se atti/SAL/liquidazioni   | si se collaudo/CRE/esito         |
| Amministrazione Trasparente | possibile                | possibile                 | si                           | si se documenti presenti            | possibile                     | possibile                        |
| Dataset locale derivato     | no fonte primaria        | no fonte primaria         | lettura derivata             | lettura derivata                    | lettura derivata              | lettura derivata                 |

## Stato operativo

- Ogni CIG formalmente valido usa la vista ufficiale ANAC `dettaglio_cig`.
- La pipeline programmata consulta i pacchetti mensili CIG, seleziona soltanto i CIG correnti e conserva l'ultimo snapshot valido.
- L'endpoint `/api/contracts/anac-status` rende verificabili stato, freshness e copertura della finestra consultata.
- Il parser fixture-only storico resta un test separato e non alimenta lo snapshot pubblico.
- Annuale e OCDS sono censiti ma non ingeriti; OpenCUP, MOP e aggiudicazioni restano fuori perimetro.
