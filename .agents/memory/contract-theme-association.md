---
name: Contract↔theme association (Appalti filter)
description: How public contracts get linked to civic themes so the "Filtra per tema" filter has data
---

The "Filtra per tema" filter on the Appalti Pubblici page filters by `contract.themeId`
(backend `themeId` query param on `/contracts` and `/contracts/analytics`). The UI and
backend filtering always worked; the real gap was that nothing ever *set* `themeId`.

Three population paths now exist:
- **Seed**: links a curated set of contracts to themes by CIG (themes embed relevant CUPs
  in their descriptions for the ANAC path below).
- **ANAC ingestion**: resolves `themeId` from the contract's CUP via a CUP→theme map built
  from (a) CUPs cited in theme summary/description text and (b) CUPs of contracts already
  linked to a theme. On **insert** it sets the resolved themeId; on **update** it only sets
  themeId when resolved — never clobbers a manual/seed link with null.
- (No editor endpoint yet — separate task.)

**Why:** themes are project-scoped civic initiatives; a CUP identifies the public project,
so CUP is the natural join key between an ANAC contract and a theme. CIG is per-lot and only
used for the curated seed links.

**How to apply:** when adding theme→contract associations, prefer CUP matching; keep ANAC
update logic non-destructive (only set themeId when newly resolved). "Where applicable" is
expected — many ANAC contracts have no matching theme and correctly stay unlinked.
