---
name: react-native-maps on Expo web
description: Why react-native-maps breaks the Expo web bundle and how to ship a working map on both web and native
---

react-native-maps@1.18.0 (the only Expo Go-compatible pin) is NOT actually
web-polyfilled despite the expo skill claiming so — on web it statically imports
`react-native/Libraries/Utilities/codegenNativeCommands`, which metro rejects
("Importing native-only module ... on web"), and that one failure 500s the entire
web bundle.

**Fix:** split into a platform-specific component file. Keep the
react-native-maps version as `Component.tsx` (native) and add `Component.web.tsx`
that renders a real map via `react-leaflet` + `leaflet` (match the web artifact's
react-leaflet major — 5.x for React 19; 4.x demands React 18 and warns). Metro
picks the `.web.tsx` on web and `.tsx` on native automatically.

**Why:** Want a working interactive map on BOTH the Expo web preview (how the user
sees the mobile app) and real devices, without stubbing the map to nothing on web.

**How to apply / gotcha:** metro's platform-extension resolution (`.web.tsx`) is
NOT applied when the import goes through the `@/*` tsconfig path alias — it resolves
straight to `.tsx`. Import the platform-split component with a RELATIVE path
(`../../components/Component`), not `@/components/Component`. After the change,
clear metro caches (`/tmp/metro-file-map-*`, `artifacts/<app>/.expo`) and restart
the expo workflow, then verify with a screenshot (the bundle compiles lazily on
first request, and the workflow log keeps showing the OLD failure line until a
fresh request recompiles).
