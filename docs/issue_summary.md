# Issue/commento di riepilogo

## File creati

- Struttura `data/raw/`, `data/interim/`, `data/processed/`, `data/geo/`, `sources/`, `scripts/`, `docs/`.
- Registro fonti in `sources/sources.yml`.
- CSV processed con intestazioni coerenti.
- Script di download, parsing, normalizzazione, validazione e collegamento geometrie.
- Documentazione metodologica, dizionario dati, limiti noti, schema GeoJSON/shapefile futuro e bozza accesso civico.

## Fonti censite

- Comune di Lamezia Terme: pagina Elezioni, pagina comunali 2025, pagina rinnovazione parziale 2021.
- Maggioli collegato dal Comune: Elezioni Trasparenti 2025, XML Raccolta dati 2025, XSL tecnico.
- Allegati comunali collegati: stradario elettorale, ubicazione seggi/decreto/manifesto 2021.
- Eligendo / Ministero dell'Interno: archivio storico come fonte di validazione.

## Fonti scaricate correttamente

- Scaricate e archiviate con checksum: 28.
- Non raggiungibili: 0.
- Pending discovery per assenza di URL ufficiale nei link-seme: 3 documenti 2019.

## Dati gia' estraibili

- 2025 candidati sindaco: 3.
- 2025 liste: 14.
- 2025 candidati consiglieri: 330.
- 2025 sezioni: 78.
- 2025 voti sindaco per sezione: 234 righe.
- 2025 voti lista per sezione: 1.092 righe.
- 2025 preferenze consiglieri per lista/sezione: 25.740 righe.
- QA totals: elettori, votanti, voti sindaco, voti lista, schede bianche e nulle coincidono con i totali Maggioli XML.

## Dati mancanti

- Modelli comunali 2019 300/I-AR, 300/I-bis-AR, 301-AR, 302-305-AR o equivalenti.
- Storico sezionale completo 1993-2015.
- Endpoint/file Eligendo specifici per validare ogni tornata.
- Geometrie sezionali: non create e non simulate.

## Decisioni metodologiche

- Il 2021 non e' modellato come nuova elezione ordinaria: resta collegato a `comunali_lamezia_2019` come rinnovazione parziale delle sezioni 2, 44, 73 e 78.
- Le sezioni sono storicizzate: stesso numero non significa stesso perimetro.
- Nessuna geometria viene creata o simulata in questa fase.
- Fonti non istituzionali escluse dai processed CSV.

## Prossima azione consigliata

Usare `docs/accesso_civico_missing_data.md` per richiedere i modelli mancanti, poi aggiungere endpoint o file Eligendo specifici per la validazione storica.

## Decisioni richieste a Giovanni

- Confermare se normalizzare sempre il codice ISTAT comunale a sei cifre (`079160`) quando le fonti tecniche Maggioli espongono `79160`.
- Decidere se chiedere subito via accesso civico i modelli 2019 e lo storico 1993-2015.
