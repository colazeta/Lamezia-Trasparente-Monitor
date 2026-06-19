# Data Dictionary

## elections.csv

Grana: una tornata elettorale comunale ordinaria o una consultazione modellata come evento collegato nelle note.

Chiave logica: `election_id`.

| Campo | Tipo atteso | Descrizione |
| --- | --- | --- |
| election_id | string | Identificativo stabile, es. `comunali_lamezia_2025`. |
| year | integer | Anno della consultazione. |
| election_type | string | Tipo, es. `comunali`. |
| election_date_first_round | date | Data primo turno in formato ISO. |
| election_date_second_round | date | Data eventuale ballottaggio. |
| municipality_name | string | Nome del Comune. |
| municipality_istat_code | string | Codice ISTAT comunale normalizzato. |
| province | string | Provincia. |
| region | string | Regione. |
| ordinary_or_special | string | `ordinaria`, `ballottaggio`, `rinnovazione_parziale` o altro valore documentato. |
| notes | string | Note metodologiche. |
| primary_source_status | string | Stato della fonte comunale primaria. |
| eligendo_validation_status | string | Stato del confronto con Eligendo. |

## source_documents.csv

Grana: un documento o endpoint ufficiale.

Chiave logica: `source_doc_id`.

Ogni record derivato da una fonte deve rinviare a questo file tramite `source_doc_id`.

## mayor_candidates.csv

Grana: candidato sindaco per elezione e turno.

Chiave logica: `mayor_candidate_id`.

Relazioni: `election_id` verso `elections.csv`; `source_doc_id` verso `source_documents.csv`.

## lists.csv

Grana: lista elettorale per elezione.

Chiave logica: `list_id`.

Relazioni: `mayor_candidate_id` verso `mayor_candidates.csv`; `source_doc_id` verso `source_documents.csv`.

## council_candidates.csv

Grana: candidato consigliere in una lista.

Chiave logica: `council_candidate_id`.

Relazioni: `list_id` verso `lists.csv`; `source_doc_id` verso `source_documents.csv`.

## sections.csv

Grana: anagrafica sezionale osservata in una fonte per una elezione.

Chiave logica: `election_id` + `section_number`.

Nota: non rappresenta geometrie e non garantisce comparabilita' territoriale tra anni.

## turnout_section.csv

Grana: sezione elettorale, elezione e turno.

Chiave logica: `election_id` + `round` + `section_number`.

Contiene elettori, votanti, voti validi, schede bianche, nulle e contestate quando disponibili.

## votes_mayor_section.csv

Grana: voto a candidato sindaco per sezione.

Chiave logica: `election_id` + `round` + `section_number` + `mayor_candidate_id`.

## votes_list_section.csv

Grana: voto di lista per sezione.

Chiave logica: `election_id` + `round` + `section_number` + `list_id`.

## preferences_section.csv

Grana: preferenze per candidato consigliere, lista e sezione.

Chiave logica: `election_id` + `section_number` + `list_id` + `council_candidate_id`.

Le preferenze devono essere validate separatamente dai voti di lista, perche' le regole di espressione e somma possono differire.
