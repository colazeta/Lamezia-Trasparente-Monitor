---
name: Lamezia recharts gotchas
description: Pitfalls when adding recharts charts to the lamezia-trasparente web app
---

# Recharts in artifacts/lamezia-trasparente

- **Chart color CSS variables are HSL component triplets**, not full colors. In `src/index.css` they are defined like `--chart-1: 219 89% 50%`. Reference them as `hsl(var(--chart-1))` (or `var(--color-chart-1)`). Using raw `var(--chart-1)` resolves to an invalid color and renders **black**.
  **How to apply:** any `fill`/`stroke`/Cell color or `ChartConfig.color` must wrap with `hsl(...)`.

- **Pie/donut charts need `isAnimationActive={false}`.** Without it the Pie sectors do not draw on first paint (bars/lines are unaffected). Also set explicit `cx="50%" cy="50%"`.

- **Never pass `yAxisId={undefined}` to a `Line`/`Area`.** Recharts throws "Invariant failed: Specifying a(n) yAxisId requires a corresponding yAxisId" because the series looks up axis id `undefined` while a no-id `YAxis` registers as `0`. For single- vs dual-axis charts, give EVERY axis and series an explicit matching id (e.g. `"left"`/`"right"`), not a conditional `undefined`.

- **The web app DOES pass `tsc` now** (recharts upgraded 2.x → `^3.8.1`). The old TS2786/TS2607 "cannot be used as a JSX component" breakage was a recharts-2.x-vs-React-19-types incompatibility; recharts 3.x fixed it, and `chart.tsx` was adapted to the 3.x Legend/Tooltip API. So raw recharts JSX you add no longer inherits TS2786/TS2322 noise — fix any chart type error you see, it's real.
  **Why:** Vite builds with esbuild (no typecheck), so the dev/preview won't catch type errors; `pnpm typecheck` at root runs `typecheck:libs` then each artifact's `typecheck`.
  **How to apply:** before typechecking the artifact, the `@workspace/api-client-react` **dist must be built** (`tsc --build` / `typecheck:libs`), else TS6305 "output not built from source" cascades into bogus implicit-any (TS7006) across every page that imports a generated hook — see `api-client-react-dist.md`. With dist built, `tsc -p tsconfig.json --noEmit` is clean (0 errors). NOTE: the **mobile** app (`lamezia-mobile`) still fails tsc on react-native-svg / react-native-maps JSX element types — separate, pre-existing, unrelated to the web charts.
