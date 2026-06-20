# ISTAT sezioni censuarie - Lamezia Terme

## Registry entry

- Public label: Dato ufficiale ISTAT per sezione censuaria.
- Source institution: ISTAT.
- Source datasets:
  - Basi territoriali 2021, Calabria `R18_21.zip`.
  - Dati per sezioni di censimento, Censimento permanente 2023, `Dati_regionali_2023.zip`.
- Territorial level: sezione di censimento.
- Municipality: Lamezia Terme.
- ISTAT municipal code: `079160`.
- Verification status: official ISTAT GeoJSON materialized; population indicator validated from field `P1` for 246 sections out of 317.

## Intended use

This is the primary geography for demographic, social, housing and territorial indicators in the Atlante territoriale when each indicator has been reviewed against the ISTAT field dictionary.

The Zornade `sezioni urbane catastali` dataset remains a separate optional cadastral/accessory overlay. It must not be used as the base for ISTAT census-section indicators and must not be merged into this layer.

## Current repository state

- Raw ISTAT files are not committed because the official ZIPs are reproducible and heavy.
- The download and ETL helper lives in `scripts/territorio/istat-sezioni-censimento-lamezia.ts`.
- Processed output path: `data/processed/territorio/istat_sezioni_censimento_lamezia.geojson`.
- Generated metadata path: `data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json`.
- QA report path: `docs/data-sources/istat-sezioni-censimento-lamezia-qa.md`.
- Indicator dictionary path: `data/processed/territorio/istat_indicator_dictionary.json`.
- Current public coverage: 317 Lamezia census-section geometries, 246 with `P1` population value and 71 with null indicator values.

## Remaining gates before frontend use

- Validate detected join keys and indicator columns against the ISTAT workbook tracciato.
- Review the 71 geometries without joined 2023 values and keep them displayed as "dato non disponibile".
- Keep additional candidate indicators disabled until source field, numerator, denominator and caveats are documented.
- Review excluded or flagged fictitious sections whenever the raw variables file is refreshed.
