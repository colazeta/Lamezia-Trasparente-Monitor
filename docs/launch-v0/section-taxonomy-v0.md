# Tassonomia civica sezioni v0

Questa tassonomia materializza #523 nel perimetro della issue madre #522. Definisce le sezioni pubbliche minime della v0 come strumenti civici, non come menu tecnici. È collegata al contratto route in `artifacts/lamezia-trasparente/src/data/publicRoutes.ts` tramite `civicSectionId`.

La tassonomia non introduce nuove fonti, scraping, API, backend, database, worker, provider, DNS o segreti. Serve a mantenere stabile l'architettura informativa mentre dati reali e sincronizzatori verranno innestati progressivamente.

## Stati v0 usati nel copy pubblico

| Stato | Significato pubblico | Formula consigliata |
| --- | --- | --- |
| Pubblicabile v0 | La sezione può essere mostrata nella v0 con limiti espliciti. | `Sezione consultabile nella v0, con fonti e limiti dichiarati.` |
| Sperimentale | La struttura è utile per orientamento o demo, ma non va letta come copertura consolidata. | `Sezione sperimentale: contenuti e collegamenti sono in consolidamento.` |
| In preparazione | La sezione è prevista ma non ancora alimentata o verificata. | `La struttura è pronta; l'alimentazione dati sarà attivata dopo verifica.` |
| Riservata | Il percorso non è contenuto pubblico ordinario. | `Percorso riservato o non disponibile nella preview pubblica.` |
| Marker tecnico | Controllo tecnico di reachability, non contenuto civico. | `Controllo statico di disponibilità frontend, non verifica dati live.` |

## Sezioni minime

| ID civico | Route principali | Nome pubblico consigliato | Descrizione breve | Promessa civica | Stato v0 | Tipo contenuto | Fonte/limite principale | CTA primaria | Cosa manca ancora | Relazioni |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `home` | `/` | Lamezia Trasparente Monitor | Punto di ingresso alla v0, con percorsi, limiti e stato delle sezioni. | Far capire in 30-60 secondi cosa si può consultare e con quali cautele. | Pubblicabile v0 | Orientamento misto: testo, card, rimandi. | Non è fonte primaria; sintetizza contenuti e limiti delle sezioni. | Esplora le sezioni civiche | Rafforzare progressivamente card, stati e rimandi quando nuove fonti saranno collegate. | Rimanda a fonti dati, metodo, note legali, sedute, contratti e PNRR. |
| `council-sessions` | `/convocazioni`, `/convocazioni/demo-consiglio-comunale-v0` | Sedute e ordini del giorno del Consiglio | Calendario e schede delle convocazioni, con eventuali demo dichiarate. | Rendere leggibili tempi, oggetti e documenti delle sedute consiliari. | Pubblicabile v0 per indice; sperimentale per demo fixture. | Dati misti o fixture, secondo disponibilità. | Dipende da fonti istituzionali e dal loro aggiornamento; fixture non rappresentano sedute reali. | Consulta convocazioni e ordini del giorno | Collegamento stabile alle fonti e sincronizzazione verificata delle sedute reali. | Si collega a fonti dati, metodo e note legali; alimenta eventuali letture su atti e monitoraggio. |
| `contracts` | `/contratti` | Contratti pubblici sotto osservazione | Indice e lettura civica dei contratti pubblici disponibili nel perimetro dichiarato. | Aiutare a seguire importi, oggetti, operatori e documentazione come segnali documentali. | Pubblicabile v0 | Dati misti con limiti espliciti. | Copertura non esaustiva; dati mancanti non equivalgono a irregolarità. | Consulta i contratti | Consolidare fonti, aggiornamenti, normalizzazione e schede di dettaglio. | Richiede guida copy prudente, fonti dati, metodo e note legali. |
| `institutional-bodies` | `/organi`, `/amministratori` | Organi istituzionali e amministratori | Indice di Consiglio, Giunta, commissioni e profili collegati agli incarichi. | Rendere leggibile chi compone gli organi, quali composizioni sono storicizzate e quali fonti limitano la copertura. | Pubblicabile v0 | Dati misti con storico fonte-limitato. | Le composizioni storiche sono parziali quando la fonte non certifica l'intero organo o la cessazione. | Consulta organi e amministratori | Consolidare ulteriori amministrazioni precedenti solo da fonti ufficiali verificabili. | Si collega a convocazioni, fonti dati, metodo e note legali; alimenta profili e incarichi. |
| `pnrr-projects` | `/pnrr` | PNRR e progetti finanziati | Quadro informativo sui progetti e sullo stato delle informazioni PNRR. | Mostrare cosa è noto, cosa è da verificare e dove il dato dipende dalla fonte. | Sperimentale nella route contract corrente; da promuovere solo dopo verifica dati. | Dati misti e contenuti informativi. | Collegamenti e aggiornamenti vanno verificati sulle fonti richiamate. | Consulta lo stato PNRR | Stabilizzare perimetro fonti, aggiornamenti e stato dei progetti. | Si collega a fonti dati, metodo, note legali e detector readiness. |
| `data-sources` | `/fonti-dati` | Fonti e limiti dei dati | Registro narrativo delle fonti, frequenze, perimetri e limiti informativi. | Rendere trasparente da dove arrivano i dati e cosa non possono dimostrare. | Pubblicabile v0 | Manuale/documentale. | Le fonti possono essere incomplete, non aggiornate o non ancora collegate. | Leggi fonti e limiti | Mappatura più granulare per fonte, frequenza e stato tecnico di collegamento. | È il riferimento trasversale per tutte le sezioni data-driven. |
| `method` | `/metodologia` | Metodo del monitoraggio civico | Criteri, cautele e regole di lettura degli indicatori. | Spiegare come leggere segnali, pattern e dati mancanti senza trasformarli in conclusioni. | Pubblicabile v0 | Manuale/documentale. | Non sostituisce verifiche amministrative, giornalistiche, giuridiche o contabili. | Leggi il metodo | Integrazione con esempi reali quando le fonti saranno più mature. | Guida contratti, PNRR, sedute, detector e readiness. |
| `legal-notes` | `/note-legali` | Note legali e cautele d'uso | Avvertenze, limiti d'uso e cautele su responsabilità, fonti e interpretazioni. | Proteggere il progetto da promesse eccessive e letture improprie. | Pubblicabile v0 | Manuale/documentale. | Non produce valutazioni definitive su persone, uffici o condotte. | Leggi le cautele d'uso | Revisione legale umana prima di pubblicazioni più ampie o dati sensibili. | Lavora insieme a copy guide, fonti dati e metodologia. |
| `editorial-area` | `/redazione` | Area redazione | Percorso protetto, non contenuto pubblico ordinario. | Separare gestione interna e consultazione pubblica. | Riservata | Nessun contenuto pubblico ordinario. | Senza autenticazione deve mostrare indisponibilità protetta. | Torna alle sezioni pubbliche | Configurazione definitiva autenticazione/ruoli fuori da questa issue. | È esclusa dal sitemap pubblico ordinario. |
| `static-health` | `/healthz.json` | Marker statico v0 | File tecnico per smoke test della fallback statica. | Verificare reachability frontend, senza implicare disponibilità dati. | Marker tecnico | JSON statico. | Non verifica API, worker, provider live, DNS, segreti o completezza fonti. | Non applicabile | Eventuali controlli live separati e dichiarati. | Usato da smoke test e readiness, non dalla narrativa civica. |

## Regole di naming pubblico

- Preferire nomi descrittivi: `Sedute e ordini del giorno del Consiglio`, non solo `Convocazioni`.
- Usare `Contratti pubblici sotto osservazione` solo se la pagina mantiene copy prudente e non accusatorio.
- Per PNRR preferire `PNRR e progetti finanziati` o `Progetti e stato delle informazioni PNRR`, evitando di suggerire completezza.
- `Fonti dati`, `Metodologia` e `Note legali` devono restare sezioni di fiducia: spiegano limiti, perimetro e cautele.
- Le sezioni sperimentali devono dichiarare lo stato nel testo vicino al contenuto, non solo in documentazione tecnica.

## Regole di relazione con la route contract

1. Ogni route minima della v0 deve avere un `civicSectionId`.
2. Più route possono appartenere alla stessa sezione civica quando rappresentano indice, dettaglio o demo dello stesso ambito.
3. Le route riservate o tecniche devono restare nella contract per la readiness, ma non vanno presentate come contenuto civico ordinario.
4. La tassonomia orienta label, card e microcopy; non obbliga a cambiare layout, fonti o backend.

## Guardrail editoriali

- Non usare `anomalia`, `irregolarità`, `responsabilità`, `omissione`, `mancata trasparenza` come conclusioni del portale.
- Un dato assente va trattato come `dato non rilevato nella fonte consultata`, non come prova di mancanza sostanziale.
- Indicatori e pattern sono segnali documentali da verificare, non prove.
- Ogni sezione data-driven deve conservare fonte, limite, stato di verifica e perimetro.
- Le fixture devono essere dichiarate come contenuti dimostrativi.

## Copertura issue

- Copre #523 come fondamento di architettura informativa.
- Supporta #522 perché rende stabile la struttura narrativa della v0.
- Prepara #524, #525, #526 e #528 senza anticiparne scope: non riscrive homepage, card, empty states o detector oltre al collegamento minimo di route contract.
