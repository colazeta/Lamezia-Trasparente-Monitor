---
name: Strict calendar-date validation
description: Why date parsing for imports must round-trip-check instead of trusting new Date()/isNaN
---
Any import/parse path that turns a user date string into a real date must reject
impossible calendar dates, not just `isNaN`-invalid ones.

**Why:** `new Date("2024-02-31")` (or `new Date(Date.UTC(y, 1, 31))`) does NOT
throw or return Invalid Date — JS auto-normalizes it to 2 Mar 2024. Returning the
original "2024-02-31" string (or the shifted Date) silently imports wrong data and
poisons dedup keys. A code review blocked the Accesso Civico register import over
exactly this.

**How to apply:** Parse the y/m/d components, build `new Date(Date.UTC(y, m-1, d))`,
then verify `getUTCFullYear/Month/Date` match the inputs; reject on mismatch (catches
31/02, 29/02 on non-leap years, out-of-range month/day). Do this on BOTH sides: the
frontend parser (`normalizeDate`) AND the server import route (`parseStrictDate`),
because the API accepts direct non-UI clients too.
