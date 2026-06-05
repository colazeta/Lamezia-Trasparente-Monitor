---
name: Redazione editorial panel
description: Architecture decisions for the /redazione editor panel — auth, blocks, site-strings, migrations, routing.
---

## Auth — dual middleware approach
- `requireEditorAuth` AND `requireIngestAuth` both accept: (1) INGEST_API_TOKEN bearer
  (server-to-server), (2) Clerk session whose email is in EDITOR_EMAILS allowlist.
- Both fail closed in production when EDITOR_EMAILS is empty (403).
- In development with no EDITOR_EMAILS, accept any authenticated Clerk user.
- Email read from `auth.sessionClaims?.email` (included by default in Clerk JWTs).
- **Why:** upgrading requireIngestAuth (not just requireEditorAuth) means all
  existing editorial routes (themes, questions, officials, storage, etc.) work from
  the panel without touching every route file.

## Frontend allowlist gate
- `GET /api/redazione/whoami` returns `{ editor: boolean, email: string|null }`.
- Redazione.tsx calls whoami after user is confirmed signed-in and shows an
  "Accesso non autorizzato" screen (with Esci button) if editor is false.
- This prevents non-allowlisted users from hitting 403s inside the panel.

## URL-based section routing
- Section state lives in `?s=<sectionId>` URL search param (wouter v3 useSearch).
- Navigate via `navigate(\`${basePath}/redazione?s=${id}\`)`.
- Deep links like `/redazione?s=temi` open the correct section.
- **Why:** local useState breaks deep links and browser back/forward for panel sections.

## Public vs editor data partitioning
- `GET /redazione/pages/:pageSlug/blocks` (public): filters status=published AND enabled=true.
- `GET /redazione/site-strings` (public): checks allowlist (not just auth.userId)
  before returning full rows; non-allowlisted get key→publishedValue map only.
- Helper guide: async merge of helper_overrides from DB into sections by id key;
  degrades gracefully if DB unreachable.

## Block renderer fallback pattern
- Home.tsx calls usePublishedBlocks("home") → GET /api/redazione/pages/home/blocks.
- If any published blocks exist, renders them before the static layout.
- If none (empty array), static layout is the fallback (no conditional removal).
- Block renderers: hero, cta_banner, quick_links, rich_text.

## Site strings hook
- src/hooks/useSiteStrings.ts — useQuery wrapping the public endpoint.
- Returns `getString(key, defaultValue)` for component consumption.
- Namespace-scoped or all-strings depending on optional namespace arg.

## Migrations
- Tables page_blocks, site_strings, helper_overrides added via drizzle push,
  then migration 0007_redazione_tables.sql committed (CREATE TABLE IF NOT EXISTS).
- Journal `when` must exceed the previous entry's timestamp (ordered monotonically).
- **Why:** push-only tables break fresh-env deployments; runMigrations() is the
  production path. Migration timestamp ordering is validated by databaseMigrationSafety test.

## Design tokens in Clerk appearance
- Clerk variables support hsl(var(--...)) CSS custom property strings.
- Elements classNames must use semantic Tailwind: bg-card, text-foreground,
  text-brand-foreground, bg-foreground/40 (for overlays), not bg-white/bg-black.
