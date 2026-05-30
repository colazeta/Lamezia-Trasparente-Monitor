---
name: Cartographer build breakers across pages
description: Why a syntax error in one web page can take down the entire lamezia-trasparente preview
---

A Babel/parser syntax error in a single page file (observed: a duplicate
`Filter` import in `Contracts.tsx`) makes the Vite dev server return HTTP 500
for the whole app, so unrelated pages (e.g. a newly added `/pareri`) show the
error overlay too.

**Why:** the replit-cartographer Vite plugin transforms files app-wide; one
unparseable module aborts the transform and the server can't serve any route.

**How to apply:** if a brand-new page shows a 500 whose stack trace points at a
*different* file than the one you edited, the culprit is that other file. Fix the
real syntax error there (don't assume your new code is wrong), then re-screenshot.
