# Zornade sezioni urbane catasto

## Source

- Source page: https://zornade.com/blog/sezioni-urbane-catasto-download-gratuito-pulite/
- Download catalog: https://zornade.com/data-downloads/
- Attribution guidance: https://app.zornade.com/attribuzioni
- Terms: https://zornade.com/terms
- Direct GeoPackage URL: https://wupqwfqjfpwrapgnogjv.supabase.co/storage/v1/object/public/parcel-data-access/sezioni/sezioni.gpkg
- Direct GeoJSON URL: https://wupqwfqjfpwrapgnogjv.supabase.co/storage/v1/object/public/parcel-data-access/sezioni/sezioni.geojson

## Provider, licence and attribution

This repository distinguishes the downloadable dataset licence from the separate attribution rule that applies when data are obtained through the Zornade API.

### Downloadable dataset

- Original data source stated by Zornade: Agenzia delle Entrate.
- Cleaned/optimised version and distributor: Zornade.
- Licence stated by the Zornade download catalogue: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/deed.it.
- For any public use of this downloaded dataset, keep visible attribution to both the underlying source and the cleaned Zornade version. Recommended wording:
  - `Fonte: Agenzia delle Entrate; versione pulita e ottimizzata: Zornade`
  - link `Zornade` to https://zornade.com.

### Zornade API

Zornade notified API users on 2026-09-18 of an attribution update. For any present or future API integration:

1. Read the attribution metadata returned by each response instead of hard-coding a single source licence.
2. Render every applicable source attribution from `meta.licenses`. These source attributions remain mandatory for free and commercial API licences.
3. Check `meta.zornade_attribution_required`.
4. When it is `true` (free API key), visibly render the exact Zornade attribution supplied by `meta.zornade_attribution`, currently:
   - `Dati elaborati da Zornade`
   - link to https://zornade.com.
5. A commercial Zornade licence may remove only the Zornade attribution when `meta.zornade_attribution_required` is `false`; it does not remove the underlying data-source attributions.
6. API raw-data redistribution, mass extraction, or reconstruction of a competing database must not be implemented unless the applicable terms explicitly permit it.

## Publication gate

The Zornade cadastral layer is currently **not wired into the public map**. This is intentional.

Any future PR that exposes Zornade-derived data publicly must, before enabling the layer:

- identify whether the data came from the downloadable dataset or the API;
- preserve the applicable source/licence attribution;
- if an API free key is involved, render the linked `Dati elaborati da Zornade` attribution;
- keep attribution visible at the point where the data are displayed (a source panel or map attribution control is acceptable if visible and reachable in the normal view);
- update `data/processed/territorio/zornade_sezioni_urbane_catasto.layer.json`;
- set `publicationGate.visibleAttributionImplemented` to `true` only after the public UI has been verified.

The repository test `scripts/territorio/zornade-licensing.test.ts` is deliberately fail-closed: the current layer remains blocked from public use until attribution implementation is explicitly verified.

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

## Source checks

- Dataset/download source inspected: 2026-09-20.
- API attribution requirements rechecked: 2026-09-20.
- Raw file is not committed. Recreate it with:

```bash
pnpm --filter @workspace/scripts run fetch:zornade-sezioni-urbane-catasto
```

To also prepare a web GeoJSON and attempt a Lamezia-only subset:

```bash
pnpm --filter @workspace/scripts run fetch:zornade-sezioni-urbane-catasto -- --extract-geojson --lamezia-subset
```

Generated raw GIS files remain local and ignored unless a future review explicitly decides to publish a curated subset.
