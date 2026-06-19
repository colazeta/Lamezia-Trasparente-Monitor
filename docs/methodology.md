# Methodology

## Gerarchia delle fonti

La fonte primaria e' il Comune di Lamezia Terme. Le pagine comunali, gli allegati pubblicati dal Comune e gli endpoint Maggioli collegati esplicitamente dalle pagine comunali sono trattati come base primaria.

Eligendo / Ministero dell'Interno e' fonte istituzionale di validazione e completamento. Non sovrascrive automaticamente i dati comunali: ogni differenza deve essere annotata e verificata.

Fonti giornalistiche, blog, Wikipedia, aggregatori privati e siti non istituzionali sono esclusi dai CSV processed.

## Maggioli collegato al Comune

Per il 2025 la pagina comunale "Elezioni comunali del 25 e 26 maggio 2025" collega:

- Elezioni Trasparenti Maggioli;
- Raccolta dati Maggioli in XML.

Questi endpoint sono quindi censiti come fonti comunali collegate, con publisher `Maggioli / Comune di Lamezia Terme`.

## Estrazione

Il flusso operativo e':

1. `scripts/download_sources.py` legge `sources/sources.yml`, scarica solo fonti istituzionali o collegate ufficialmente, salva i raw file e calcola checksum SHA256.
2. `scripts/parse_comune_sources.py` estrae inventari HTML, testo PDF controllabile e tabelle XML Maggioli in `data/interim/extracted_tables/`.
3. `scripts/normalise_electoral_data.py` normalizza nomi e identificativi stabili senza inventare record mancanti.
4. `scripts/validate_totals.py` confronta somme sezionali e totali ufficiali disponibili.
5. `scripts/link_sections_to_geometry.py` controlla soltanto lo schema del futuro layer geografico.

OCR cieco non e' ammesso. Se un PDF non contiene testo estraibile, deve produrre una nota QA prima di ogni ulteriore lavorazione.

## Validazione

Ogni record derivato da fonte deve contenere `source_doc_id`.

Ogni estrazione sezionale automatica deve contenere `validation_status`.

Per il 2025, i totali Maggioli XML sono confrontati con:

- somma elettori e votanti sezionali;
- somma voti validi ai candidati sindaco;
- somma voti di lista;
- schede bianche e nulle quando presenti.

Eligendo resta stato `pending` finche' non sono registrati endpoint o file specifici della tornata.

## Trattamento del 2021

La rinnovazione del 3-4 ottobre 2021 riguarda solo le sezioni 2, 44, 73 e 78. Non e' una nuova elezione comunale ordinaria.

Modello adottato:

- `election_id`: `comunali_lamezia_2019`;
- `event_id` concettuale: `comunali_lamezia_2021_rinnovazione_sezioni_2_44_73_78`;
- `ordinary_or_special`: `rinnovazione_parziale` quando si rappresenta l'evento in una tabella eventi futura;
- sezioni interessate: 2, 44, 73, 78.

In questa fase non viene creato un nuovo `election_id` 2021 nei processed CSV.

## Sezioni elettorali storicizzate

Le sezioni elettorali sono versionate nel tempo. Lo stesso numero di sezione non implica stesso perimetro, stessa sede o stessa composizione territoriale tra tornate diverse.

Il futuro shapefile/GeoJSON andra' in `data/geo/` e dovra' rispettare `data/geo/electoral_sections_schema.md`.
