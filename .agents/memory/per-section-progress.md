---
name: Per-section reading progress (visited sections)
description: Client-only "remember where you left off" in web + mobile Guida; the async-load ordering trap.
---
The Guida/Centro Guida marks sections the user has navigated to as "explored",
persisted purely client-side (no server). Web reads localStorage synchronously at
init; mobile must read AsyncStorage asynchronously first.

**Mobile ordering trap (caused a rejected review):** AsyncStorage loads async, so the
route-tracking effect must NOT write until the stored list has loaded — otherwise the
first navigation persists `[currentPath]` and clobbers prior progress on every app
start. Gate the tracking/writing effect behind a "loaded" flag; never write from `[]`.
**Why:** the requirement is persistence across restarts; an eager write defeats it.
**How to apply:** any future client-persisted list hydrated from AsyncStorage needs the
same load-before-write gate (web's synchronous localStorage read sidesteps it).

Matching rule (shared, duplicated per platform): a section route counts as visited when
a stored path equals it OR starts with `route + "/"` (covers detail pages); root "/"
matches only exactly. Paths are normalized (query/hash stripped) before compare.
