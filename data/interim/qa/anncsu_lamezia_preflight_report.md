# ANNCSU Lamezia preflight report

Date: 2026-06-20

Scope: raw geographic source preflight for joining ANNCSU civic points to 2025 electoral street rules.

## Raw files

| source | path | exists | bytes | sha256 |
| --- | --- | --- | --- | --- |
| ANNCSU indirizzario Calabria | data/raw/geo/indirizzarioCalabria20260602.zip | yes | 16347385 | adcf9272b5e74cd2575606efcb3805c977ac2c952c0da480720f5fbc6586f66c |
| ANNCSU stradario Calabria | data/raw/geo/stradarioCalabria20260602.zip | yes | 748484 | 01c6bf2312823d1728bf96f76f4ca340fce53849658c263100c70a68f8b751fd |
| Comune Lamezia stradario elettorale PDF | data/raw/geo/Stradario_elettorale.pdf | yes | 131401 | a8cb26a5116f9cd7217749662f711518843a349d378cf651fd4a46bc01483056 |

## ZIP inspection

| zip | internal_csv | delimiter | encoding | columns | total_rows | lamezia_rows | extract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| data/raw/geo/indirizzarioCalabria20260602.zip | INDIR_CALA_20260602.csv | ; | utf-8-sig | 19 | 1407437 | 22757 | data/raw/geo/anncsu_lamezia_indirizzario_20260602.csv |
| data/raw/geo/stradarioCalabria20260602.zip | STRAD_CALA_20260602.csv | ; | utf-8-sig | 10 | 71073 | 1320 | data/raw/geo/anncsu_lamezia_stradario_20260602.csv |

## Columns

### INDIR_CALA_20260602.csv

`CODICE_COMUNE`, `CODICE_ISTAT`, `PROGRESSIVO_NAZIONALE`, `CODICE_COMUNALE`, `ODONIMO`, `LOCALITA'`, `DIZIONE_LINGUA1`, `DIZIONE_LINGUA2`, `PROGRESSIVO_ACCESSO`, `CODICE_COMUNALE_ACCESSO`, `CIVICO`, `ESPONENTE`, `SPECIFICITA`, `METRICO`, `PROGRESSIVO_SNC`, `COORD_X_COMUNE`, `COORD_Y_COMUNE`, `QUOTA`, `METODO`

### STRAD_CALA_20260602.csv

`CODICE_COMUNE`, `CODICE_ISTAT`, `PROGRESSIVO_NAZIONALE`, `CODICE_COMUNALE`, `ODONIMO`, `LOCALITA'`, `TOTALE_ACCESSI`, `DIZIONE_LINGUA1`, `DIZIONE_LINGUA2`, `unnamed_10`

Blank or duplicate source headers were normalised in the extract for CSV readability.

## Methodological notes

- `indirizzarioCalabria20260602.zip` is treated as the primary source for georeferenced civic access points.
- `stradarioCalabria20260602.zip` is treated as a support source for odonym normalization and coverage checks.
- `Stradario_elettorale.pdf` is treated as the normative source for electoral section assignment.
- No assignment by geographic proximity is performed in this preflight step.
- No polygons, shapefiles, UI, maps, or electoral result values are created or modified.
