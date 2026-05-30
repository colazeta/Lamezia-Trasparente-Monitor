---
name: Object storage template TS quirk
description: Strict-TS pitfall when copying the object-storage skill templates into api-server
---

When copying `objectStorage.ts` from the object-storage skill into an api-server that
uses strict TypeScript, `await response.json()` is typed `unknown` and fails the build
where the code reads `.signed_url`. Cast the parsed body, e.g.
`const { signed_url } = (await response.json()) as { signed_url: string }`.

**Why:** The skill template assumes loose TS; this repo's api-server is strict.
**How to apply:** Whenever provisioning object storage / signed-URL uploads in
`artifacts/api-server`, expect to patch the `response.json()` cast after copying templates.
