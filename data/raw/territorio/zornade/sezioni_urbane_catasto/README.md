# Zornade sezioni urbane catasto

## Source

- Source page: https://zornade.com/blog/sezioni-urbane-catasto-download-gratuito-pulite/
- Download catalog: https://zornade.com/data-downloads/
- Direct GeoPackage URL: https://wupqwfqjfpwrapgnogjv.supabase.co/storage/v1/object/public/parcel-data-access/sezioni/sezioni.gpkg
- Direct GeoJSON URL: https://wupqwfqjfpwrapgnogjv.supabase.co/storage/v1/object/public/parcel-data-access/sezioni/sezioni.geojson

## Provider and attribution

- Original provider stated by Zornade: Agenzia delle Entrate.
- Distributor/processor: Zornade.
- Licence stated by Zornade catalog: CC BY 4.0, with licence URL https://creativecommons.org/licenses/by/4.0/deed.it.
- Public reuse should preserve attribution to the Agenzia delle Entrate-derived cadastral source and to the Zornade distribution/processing path.

## Dataset type

This dataset contains cadastral urban sections (`sezioni urbane catastali`). It is an optional cadastral/accessory GIS layer for territorial context.

It is not an ISTAT census-section dataset and must not be used as the territorial basis for ISTAT census-section demographic, social, or statistical indicators.

## Format and repository policy

- Preferred open GIS format: GeoPackage (`sezioni.gpkg`).
- Source also exposes a GeoJSON sibling (`sezioni.geojson`) for web workflows.
- Source catalog advertises 12.5 MB for GeoPackage and 18.2 MB for GeoJSON, but HTTP headers on 2026-06-19 reported:
  - GeoPackage: 36,433,920 bytes.
  - GeoJSON: 64,622,270 bytes.
- Because the raw GeoPackage is a binary reproducible download and is larger than a lightweight fixture, it is intentionally ignored by Git.

## Download date

- Source inspected: 2026-06-19.
- Raw file is not committed. Recreate it with:

```bash
pnpm --filter @workspace/scripts run fetch:zornade-sezioni-urbane-catasto
```

To also prepare a web GeoJSON and attempt a Lamezia-only subset:

```bash
pnpm --filter @workspace/scripts run fetch:zornade-sezioni-urbane-catasto -- --extract-geojson --lamezia-subset
```

Generated raw GIS files remain local and ignored unless a future review explicitly decides to publish a curated subset.
