---
name: Opendata frontend (lamezia-trasparente)
description: How the Opendata catalog/detail/tabular-viewer pages are structured and their non-obvious constraints.
---

The Opendata section lives at `/opendata` (catalog) and `/opendata/:id` (detail).
Pages: `pages/Opendata.tsx`, `pages/OpendataDetail.tsx`; the generic tabular
viewer is `components/opendata/ResourceTable.tsx`.

- **Auto-chart heuristic** (`pickChart` in ResourceTable): y-axis = first numeric
  column; x-axis = first date column (→ line chart) else first string column
  (→ bar chart) else a second numeric column. Needs ≥2 plottable points; caps at
  50 points so large tables stay readable. Charts are client-side only (no
  analytics endpoint), built from the `/opendata/resources/:id/content` rows.
- **recharts + tsc**: `tsc --noEmit` on this web app reports ~12 pre-existing
  "X cannot be used as a JSX component" errors on recharts (XAxis/YAxis/Bar/Line)
  in Contracts.tsx and now ResourceTable.tsx. This is a known broken-types issue,
  NOT a real bug — vitest (116 tests) and the running app are fine. Don't chase it.
- **Test harness**: any new page must be registered in `src/test/pages-harness.tsx`
  in BOTH the `QUERY_HOOKS` mock list (every `use*` hook the page calls) and the
  `PAGES` array, or the render test fails with "No X export is defined on the mock".
