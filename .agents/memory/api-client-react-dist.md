---
name: api-client-react stale dist
description: Why generated API types can mismatch the source schema and how to fix it
---

The `@workspace/api-client-react` package's `package.json` exports `./src/index.ts`,
but consuming artifacts (e.g. the Expo mobile app) resolve its types through the
project-reference declaration output in `lib/api-client-react/dist/*.d.ts`. That dist
is **not** rebuilt automatically when the generated source schema changes.

**Symptom:** `tsc` reports properties "do not exist" on a generated type (e.g.
`PnrrProject.url`) or a return type is wrong, even though `src/generated/api.schemas.ts`
clearly has them. The source is newer than the compiled dist.

**Fix:** rebuild the package declarations:
`cd lib/api-client-react && npx tsc -p tsconfig.json` (it is `emitDeclarationOnly`).

**Why:** the package has no `build` npm script; dist was emitted manually, so any
backend OpenAPI/codegen update leaves dist stale until someone reruns tsc.

**Also note:** some list hooks return wrapper objects, not bare arrays — e.g.
`useListPnrrProjects()` returns `PnrrCensus` (`{ projects, uncensored }`), and
`useGetFeedStatus()` returns a single `FeedStatus`, not an array. Generated
single-resource query hooks (`useGetSeduta`, `useGetOfficial`) require a `queryKey`
if you pass a `query` options object, so prefer calling them without options.
