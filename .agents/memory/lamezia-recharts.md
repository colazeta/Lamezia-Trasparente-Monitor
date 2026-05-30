---
name: Lamezia recharts gotchas
description: Pitfalls when adding recharts charts to the lamezia-trasparente web app
---

# Recharts in artifacts/lamezia-trasparente

- **Chart color CSS variables are HSL component triplets**, not full colors. In `src/index.css` they are defined like `--chart-1: 219 89% 50%`. Reference them as `hsl(var(--chart-1))` (or `var(--color-chart-1)`). Using raw `var(--chart-1)` resolves to an invalid color and renders **black**.
  **How to apply:** any `fill`/`stroke`/Cell color or `ChartConfig.color` must wrap with `hsl(...)`.

- **Pie/donut charts need `isAnimationActive={false}`.** Without it the Pie sectors do not draw on first paint (bars/lines are unaffected). Also set explicit `cx="50%" cy="50%"`.

- **The web app does not pass `tsc`** and is not typechecked in merge validation. The template ships pre-existing recharts-vs-React-types breakage in `src/components/ui/chart.tsx` (recharts components "cannot be used as a JSX component", TS2786/TS2607) and `src/components/ui/input-otp.tsx`. Any raw recharts JSX you add inherits the same TS2786/TS2322 noise.
  **Why:** Vite builds with esbuild (no typecheck); merge validation only runs `typecheck:libs` (the `lib/*` packages), not the artifact apps.
  **How to apply:** don't chase these recharts JSX type errors — verify behavior via the running app/screenshot instead. Still fix your own real errors (implicit-any, wrong types).
