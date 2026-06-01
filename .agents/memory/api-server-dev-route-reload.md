---
name: api-server dev route reload
description: New routes in api-server don't take effect until the workflow is restarted in the isolated env
---

The api-server dev server (in the isolated parallel environment) does not reliably
hot-reload newly added Express routes. A freshly added endpoint can return 404
("Cannot GET ...") even though the route exists in source and tsc passes.

**Why:** the running dev process was started before the route was added and didn't
pick up the new handler; only existing routes are served.

**How to apply:** after adding/removing an endpoint, restart the
`artifacts/api-server: API Server` workflow before testing via curl/proxy. If a
brand-new endpoint 404s, suspect a stale dev process first, not a routing bug.
