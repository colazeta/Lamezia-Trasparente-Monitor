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
- Verification status: source identified, ETL foundation prepared, not yet human-validated against the official ISTAT files in this repository.

## Intended use

This is the primary geography for future demographic, social, housing and territorial indicators in the Atlante territoriale when the official ISTAT files have been downloaded locally, processed and reviewed.

The Zornade `sezioni urbane catastali` dataset remains a separate optional cadastral/accessory overlay. It must not be used as the base for ISTAT census-section indicators and must not be merged into this layer.

## Current repository state

- Raw ISTAT files are not committed because the official ZIPs are reproducible and heavy.
- The download and ETL helper lives in `scripts/territorio/istat-sezioni-censimento-lamezia.ts`.
- Future processed output path: `data/processed/territorio/istat_sezioni_censimento_lamezia.geojson`.
- Future generated metadata path: `data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json`.

## Remaining gates before frontend use

- Download the official ISTAT ZIPs locally or provide reviewed local copies.
- Run the ETL with a GDAL/ogr2ogr conversion path or provide a reviewed GeoJSON extracted from the official shapefile.
- Validate detected join keys and indicator columns against the ISTAT workbook tracciato.
- Review excluded or flagged fictitious sections.
- Only after review, wire the layer as the main census-section base for the Atlante territoriale.
