---
name: Expo typed-routes staleness
description: tsc reports false route-type errors for newly added expo-router screens until the dev server regenerates types
---

When adding new screens to the Expo artifact (`artifacts/lamezia-mobile`, expo-router file-based routing under `app/`), `tsc --noEmit` reports errors like `Argument of type '/organi/...' is not assignable to parameter of type ...` for `router.push(...)` and `<Stack.Screen name>`/`href` values.

**Why:** expo-router generates the typed-routes manifest (`.expo/types/router.d.ts`) only when the dev server runs. Until then the new route literals aren't in the union type, so static typecheck flags them as invalid.

**How to apply:** After adding routes, restart the `artifacts/lamezia-mobile: expo` workflow (runs the dev server → regenerates types), wait a few seconds, then re-run `tsc`. The route errors clear. Don't waste time "fixing" the route strings — they are correct.

Note: `app/(tabs)/_layout.tsx` has long-standing pre-existing tsc errors (NativeTabs `NativeTabsProps`, `BlurView` not a valid JSX component) unrelated to route work — ignore those.
