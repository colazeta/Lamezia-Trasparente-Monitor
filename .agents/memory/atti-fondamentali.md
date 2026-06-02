---
name: Atti fondamentali section
description: How the lamezia-trasparente "Atti fondamentali" public/admin section decides what is shown and how population works.
---

The "Atti fondamentali" feature (PIAO, DUP, DEFR, Bilancio, Rendiconto, Statuto, Regolamenti, Piano opere) is one row per act *type* in `fundamental_acts` (merged type+entry, extensible).

- **Public page** (`/atti-fondamentali`) lists ONLY acts that have a published current version — i.e. `source != 'none'`. An act type with no manual file/link and no confirmed publication is intentionally hidden from the public list, even though it exists in the table. So an empty public page with seeded types is correct, not a bug.
- **source** is `none | manual | auto`. Manual wins: set when a manual file or official URL is present. Clearing both reverts to `auto` (if a publication is linked) else `none`. Auto-match never overwrites manual.
- **Admin** (`/admin/atti-fondamentali`, ingest-token gate like AdminCronistoria) manages all types, uploads file/link, and confirms the auto-suggested most-recent matching Albo/publication (by keywords). Confirm sets linkedPublication, source=auto, clears manual.

**Why:** spec requires "latest version only" and that unpopulated act types not appear publicly; redazione confirms/overrides suggestions and manual must never be clobbered.
