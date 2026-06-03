---
name: RN class components fail JSX under React 19 types
description: Why react-native-svg/maps/expo-blur/NativeTabs trip tsc in lamezia-mobile and the wrapper-cast fix
---

In `artifacts/lamezia-mobile`, class components from `react-native-svg` (Svg/Line/Path/Rect/Circle), `react-native-maps` (MapView/Polygon/Marker) and `expo-blur` (BlurView) fail tsc with TS2786/TS2607 "cannot be used as a JSX component … missing properties from Component<any,any,any>: context,setState,forceUpdate,props,state". Root cause: their class instance types are not assignable to the JSX `ElementClass` under the resolved `@types/react` (~19.1.x) — e.g. rn-svg's `Shape extends Component<P>` carries an `[x: string]: unknown` index signature. This is the RN analog of the recharts-2.x-vs-React-19 break (see lamezia-recharts.md).

**Fix (typing only, zero runtime effect):** cast each class component to a function-component type using the library's OWN exported prop interface, then use the wrapper in JSX:
- `const Svg = SvgBase as unknown as React.FC<SvgProps>` (import `SvgProps`, `LineProps`, `PathProps`, `RectProps`, `CircleProps` from `react-native-svg`). Centralized in `components/svg.tsx`.
- `const MapView = MapViewBase as unknown as React.ForwardRefExoticComponent<MapViewProps & React.RefAttributes<MapViewBase>>` so the imperative `ref` (animateToRegion) still types; type the ref as the original class: `useRef<MapViewBase>()`. `Polygon`/`Marker` → `React.FC<MapPolygonProps>` / `React.FC<MapMarkerProps>`.
- `const BlurView = BlurViewBase as unknown as React.FC<BlurViewProps>` (from `expo-blur`).

**Do NOT** use `React.FC<React.ComponentProps<typeof SvgBase>>` — `ComponentProps` itself errors TS2344 because the class isn't a valid `JSXElementConstructor`. Use the exported prop interface directly.

**NativeTabs gotcha (expo-router/unstable-native-tabs):** `NativeTabsProps extends PropsWithChildren` but the no-arg `PropsWithChildren` (`unknown & {children?}`) loses `children` when an interface extends it, so a bare `<NativeTabs>{...}</NativeTabs>` (children as the ONLY prop) throws TS2559 "no properties in common". `<NativeTabs.Trigger>` is fine (it has a `name` prop in common). Fix: `const NativeTabsRoot = NativeTabs as unknown as React.FC<{children?: React.ReactNode}>` for the root only; keep `NativeTabs.Trigger` for children.

**Why:** keeps a working render on native + Expo web with no behavior change, while making `pnpm typecheck` (root) green end-to-end.
