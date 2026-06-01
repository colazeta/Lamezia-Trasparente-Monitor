---
name: Contract auto-geocoding fallback & review
description: How auto-geocoding always produces a best-guess and how the admin triage queue consumes geoVerify
---

The ANAC contract geocoding pass (`geocode.ts` `geocodeContractText` → `anacContracts.ts` `runContractsGeocoding`) ALWAYS returns a best-guess position; it no longer returns null for placeless acts. Confidence cascade: recognized street/odonimo (approximate=false → geoVerify=false, public-ready) → civic POI/toponym (approximate=true) → frazione/contrada centroid (approximate=true) → comune-center fallback (approximate=true, empty geoAddress).

**Why:** ~43/44 contracts were unplaceable admin acts; manual placement was 100% manual. A pre-filled draggable marker (even a low-confidence comune-center guess) lets editors confirm/correct instead of starting from a blank map.

**How to apply:**
- Everything except a matched street is stored with `geoVerify=true` so it is NOT treated as confirmed.
- The admin triage queue (`AdminAppalti.tsx`) defines `needsReview = !hasLocation || geoVerify`. The "Rivedi in sequenza" / "Da rivedere" filter and progress bar count CONFIRMED = has coords AND !geoVerify. If you add new auto-sources, keep them out of the "confirmed" bucket unless an editor has saved them (the save path sets geoVerify=false).
- `LocationEditor` already pre-centers on stored coords and shows a "suggerita automaticamente" banner when `contract.geoVerify`.
- Each contract is geocoded only once (query filters `geoSource IS NULL`), so re-running ingestion won't re-hit Nominatim for the same act.
- `geocodeContractText` accepts a `cup` arg but CUP codes carry no geocodable text today; candidates come from title/description. Wire a CUP→location dictionary here if one becomes available.
