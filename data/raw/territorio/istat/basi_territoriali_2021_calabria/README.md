# ISTAT basi territoriali 2021 - Calabria

## Source

- Source page: https://www.istat.it/notizia/basi-territoriali-e-variabili-censuarie/
- Direct regional ZIP URL: https://www.istat.it/storage/cartografia/basi_territoriali/2021/R18_21.zip
- Source institution: ISTAT.
- Reference year: 2021.
- Region: Calabria (`R18`).
- Territorial level: sezione di censimento.
- Dataset type: official ISTAT census-section geometry, not cadastral data.

## Expected files

Place the official ZIP here as:

```text
R18_21.zip
```

The ZIP index inspected on 2026-06-20 exposed these relevant entries:

```text
SHP/R18_21_WGS84.shp
SHP/R18_21_WGS84.dbf
SHP/R18_21_WGS84.shx
SHP/R18_21_WGS84.prj
TAB/SEZ_R18_21.csv
```

The expected municipal filter for Lamezia Terme is ISTAT code `079160`. The ETL detects the available section key and municipality fields, with expected candidates such as `PRO_COM` for the municipality and `SEZ21` or equivalent section identifiers for the census-section join.

## Licence and attribution

The ISTAT legal notes state that, unless otherwise indicated, site contents are under Creative Commons Attribution 4.0. Attribute the layer to ISTAT and retain links to the source page and direct download URL.

## Repository policy

Do not commit the raw ZIP or extracted shapefile components. The direct ZIP was checked on 2026-06-20 and reported `33,874,230` bytes. Keep only this README, scripts, metadata and lightweight derived outputs that have been intentionally reviewed.

Use the repository helper from the repo root:

```bash
pnpm --filter @workspace/scripts run etl:istat-sezioni-censimento-lamezia -- --download --extract
```

To also convert the official shapefile to web-ready GeoJSON and prepare the Lamezia output, run:

```bash
pnpm --filter @workspace/scripts run etl:istat-sezioni-censimento-lamezia -- --download --extract --convert-geometry --prepare
```

The helper tries `ogr2ogr` when available and otherwise uses the built-in ISTAT shapefile converter. You can still provide a reviewed GeoJSON converted from `SHP/R18_21_WGS84.shp` and pass it with `--geometry-geojson <path> --prepare`.

The public Atlante layer can then be materialized with:

```bash
pnpm --filter @workspace/scripts run materialize:istat-sezioni-censimento-lamezia
```

## Known limits

This folder is for official ISTAT census-section geometries only. Do not substitute the Zornade `sezioni urbane catastali` layer here: cadastral urban sections are an accessory cadastral layer and are not the basis for ISTAT census-section demographic, social, housing or territorial indicators.
