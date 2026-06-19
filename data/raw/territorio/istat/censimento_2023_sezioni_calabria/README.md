# ISTAT censimento 2023 per sezioni - Calabria

## Source

- Source page: https://www.istat.it/notizia/dati-per-sezioni-di-censimento/
- Direct ZIP URL: https://esploradati.istat.it/databrowser/DWL/PERMPOP/SUBCOM/Dati_regionali_2023.zip
- Source institution: ISTAT.
- Reference year: 2023, Censimento permanente della popolazione e delle abitazioni al 31-12-2023.
- Territorial level: sezione di censimento, using ISTAT Basi Territoriali 2021 as reference geography.
- Dataset type: official ISTAT census-section variables.

## Expected files

Place the full official ZIP here as:

```text
Dati_regionali_2023.zip
```

The ZIP index inspected on 2026-06-19 exposed the Calabria workbook as:

```text
Dati_regionali_2023/R18_Calabria_2023_sezioni.xlsx
```

The helper script can extract it locally as:

```text
R18_Calabria_2023_sezioni.xlsx
```

The expected municipal filter for Lamezia Terme is ISTAT code `079160`. The ETL detects the available section key and municipality fields, with expected candidates such as `PRO_COM`, `COD_COM`, `SEZ`, `SEZ21` or equivalent identifiers. If ISTAT changes the workbook schema, inspect the header row and pass an already-cleaned table only after documenting the change in this README.

## Licence and attribution

The ISTAT legal notes state that, unless otherwise indicated, site contents are under Creative Commons Attribution 4.0. Attribute any derived layer to ISTAT and retain links to the source page and direct download URL.

## Repository policy

Do not commit the raw ZIP or extracted workbook. The direct ZIP was checked on 2026-06-19 and reported `261,295,722` bytes. Keep only this README, scripts, metadata and intentionally reviewed lightweight derived outputs.

Use the repository helper from the repo root:

```bash
pnpm --filter @workspace/scripts run etl:istat-sezioni-censimento-lamezia -- --download --extract
```

To produce the processed Lamezia layer, provide or convert the official geometry GeoJSON and run:

```bash
pnpm --filter @workspace/scripts run etl:istat-sezioni-censimento-lamezia -- --extract --prepare --geometry-geojson <path-to-official-geometry.geojson>
```

## Known limits

ISTAT explicitly lists fictitious census sections: `888888x` for people without shelter or fixed abode and `999999x` for contested areas. The ETL excludes these by default from the web-ready Lamezia GeoJSON and records counts in metadata. This layer must not be confused with Zornade cadastral urban sections or used together with cadastral, OMI, CAP, fiscal or municipal-only datasets as if they were census-section indicators.
