# Dataset geografici processati

Questa directory contiene artefatti geografici utili alla normalizzazione territoriale e alla ricerca, ma **la presenza di un file qui non implica che il dato sia pubblicabile nell’Atlante territoriale**.

La pubblicazione nell’Atlante è governata separatamente dal registry e dalla policy in `artifacts/lamezia-trasparente/src/lib/spatial/`.

## Civici ANNCSU 2025

Artefatti:

- `anncsu_lamezia_civics_2025.csv`
- `anncsu_lamezia_civics_2025.gpkg`

Ruolo: **infrastruttura territoriale interna**.

L’ANNCSU è la fonte nazionale di riferimento per stradari e indirizzari. Nel progetto questi dati sono usati come substrato per normalizzare/localizzare indirizzi e per analisi territoriali. Le coordinate puntuali non vanno però interpretate automaticamente come geometrie prive di errore o come tema autonomo da pubblicare nell’Atlante.

Il QA locale identifica anche coordinate sospette. Il report di riferimento è:

- `data/interim/qa/anncsu_coordinate_quality_report_2025.md`
- `data/interim/qa/anncsu_coordinate_corruption_diagnostic_report_2025.md`

Le anomalie diagnosticate risultano già presenti nel dato sorgente e non introdotte dalla pipeline locale.

## Civici ANNCSU con sezione elettorale derivata

Artefatti:

- `anncsu_lamezia_civics_with_electoral_section_2025.csv`
- `anncsu_lamezia_civics_with_electoral_section_2025.gpkg`

Ruolo: **infrastruttura analitica interna**.

L’associazione civico → sezione elettorale è derivata dalle regole dello Stradario elettorale comunale. Non usa la semplice vicinanza geografica. Una sezione viene assegnata deterministicamente solo quando le regole testuali strada/civico producono un esito univoco.

QA 2025:

- civici totali: 22.757;
- assegnazioni deterministiche: 14.503 (63,73%);
- casi non risolti / da revisionare: 8.254.

Report di riferimento: `data/interim/qa/anncsu_electoral_assignment_report_2025.md`.

Questi dati non sono quindi un layer pubblico di sezioni elettorali.

## Geometrie candidate delle sezioni elettorali 2025

Artefatti correnti:

- `electoral_sections_candidate_2025_v1.gpkg`
- `electoral_sections_candidate_2025_v2.gpkg`
- `electoral_sections_candidate_2025_v3_census.gpkg`

Ruolo: **review-only / analisi GIS**.

Queste geometrie sono ricostruzioni inferite; **non sono confini elettorali ufficiali**.

- V1/V2 costruiscono geometrie candidate a partire dai civici assegnati mediante tassellazione spaziale e dissoluzione per sezione.
- V3 usa le sezioni di censimento ISTAT come substrato geometrico e assegna una cella quando l’evidenza dei civici supera le soglie definite dallo script di generazione.
- Gli output conservano esplicitamente `geometry_status = candidate_inferred`, indicatori di confidenza e flag di revisione.

Il QA V1/V2 li qualifica come materiale per revisione in QGIS e non per il frontend. Anche V3 non supera il gate di pubblicazione: nel controllo post-merge 28 sezioni su 29 richiedono revisione, 19 hanno confidenza bassa, 116 celle censuarie risultano in conflitto e 138 senza evidenza.

Report di riferimento:

- `data/interim/qa/electoral_sections_candidate_polygon_report_2025.md`
- `data/interim/qa/electoral_sections_candidate_v3_census_report_2025.md`
- `data/interim/qa/electoral_sections_v3_post_merge_check.md`

## Regola di pubblicazione

Nessuno degli artefatti elettorali sopra elencati deve essere presentato come confine ufficiale o attivato come layer pubblico dell’Atlante senza una decisione esplicita e tracciabile.

La promozione richiede almeno uno dei seguenti percorsi:

1. acquisizione di una geometria ufficiale con provenienza e licenza verificabili; oppure
2. validazione documentata di una geometria derivata, con metodo, QA, copertura, limiti e stato di verifica sufficienti per la pubblicazione.

In entrambi i casi devono essere aggiornati insieme:

- la fonte canonica del dato;
- la policy di pubblicazione spaziale;
- il layer registry dell’Atlante;
- i test di integrazione;
- la documentazione delle limitazioni.

Fino ad allora la regola è **default deny**: dato disponibile non significa dato pubblicabile.
