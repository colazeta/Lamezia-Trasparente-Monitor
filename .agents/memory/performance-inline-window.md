---
name: Performance categories inline window
description: How /performance/categories ships latest/previous/recentValues inline and where the web sparkline reads from.
---

The `GET /performance/categories` handler avoids an N+1 per-card detail fetch by
selecting all indicator values ordered by `(indicatorId, period asc)` once and
deriving, in a single pass: `latestValue`, `previousValue`, and `recentValues`
(a short window — last 6 periods, oldest→newest). All three are attached inline
to each indicator in the response.

**Why:** the list page must render trend + sparkline from one request. The full
historical series stays in the per-indicator detail endpoint.

**How to apply:**
- API: `artifacts/api-server/src/routes/performance.ts` (categories handler) —
  the recent window is built in the same loop as latest/previous.
- Spec: `recentValues` is `array<PerformanceLatestValue>` on `PerformanceIndicator`
  in `lib/api-spec/openapi.yaml`; regenerate `lib/api-client-react` + `lib/api-zod`
  via `pnpm --filter @workspace/api-spec run codegen`.
- Web: `artifacts/lamezia-trasparente/src/pages/Performance.tsx` has a
  dependency-free inline SVG `Sparkline` in `IndicatorCard`; stroke uses
  `hsl(var(--success|--destructive|--muted-foreground))` (raw theme vars are HSL
  triplets, so wrap in `hsl()`).
- Testing in the isolated env: the `performance_indicator_values` table is
  usually empty (ISTAT ingestion can't reach the source here), so cards show "no
  data". Seed a few rows via SQL to verify, then delete them.
