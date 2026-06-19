# Schema futuro layer sezioni elettorali

Questo file definisce lo schema minimo atteso per il futuro shapefile/GeoJSON delle sezioni elettorali di Lamezia Terme. Le geometrie non sono create in questa fase e non devono essere simulate.

Campi minimi:

| Campo | Tipo atteso | Descrizione |
| --- | --- | --- |
| section_geo_id | string | Identificativo stabile della geometria sezionale. |
| section_number | integer/string | Numero della sezione elettorale riportato nelle fonti. |
| municipality_istat_code | string | Codice ISTAT comunale normalizzato. |
| valid_from_year | integer | Primo anno per cui il perimetro e' valido. |
| valid_to_year | integer/string | Ultimo anno di validita' o valore aperto se vigente. |
| geometry_source | string | Fonte e metodo di digitalizzazione della geometria. |
| geometry_confidence | string | Livello di confidenza: high, medium, low. |
| notes | string | Note su incertezze, cambi sede, variazioni di perimetro. |

Chiavi di collegamento previste:

- municipality_istat_code
- section_number
- valid_from_year
- valid_to_year
- eventuale section_geo_id

Principio operativo: una sezione con lo stesso numero in anni diversi non e' automaticamente lo stesso territorio.
