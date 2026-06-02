---
name: RSS/Atom feeds (AlboPOP)
description: How the public RSS feeds are built and the link conventions that must stay consistent.
---

Public RSS 2.0 feeds (with `<atom:link rel="self">` for autodiscovery + W3C
validation) live in `artifacts/api-server/src/lib/feeds.ts` (builder) and
`artifacts/api-server/src/routes/feeds.ts` (endpoints):
`/api/feeds/albo.xml`, `/feeds/delibere.xml`, `/feeds/contratti.xml`,
`/feeds/temi/:id.xml`.

**Rule:** feed *item* links and the channel link point to the public SITE
(`siteUrl(...)` → e.g. `/contratti/:id`, `/temi/:id`), NOT to the API. Only the
self-link uses `feedUrl(...)` (the `/api/feeds/...` URL).
**Why:** RSS readers open item links directly; they must land on navigable web
pages, not JSON/XML endpoints.
**How to apply:** any new feed reuses `getPublicBaseUrl()` (PUBLIC_BASE_URL →
REPLIT_DEV_DOMAIN → relative), `siteUrl`/`feedUrl`, `toPlainText` for
descriptions, RSS content-type `application/rss+xml; charset=utf-8`.

Web autodiscovery: `FeedSubscribeButton`
(`artifacts/lamezia-trasparente/src/components/FeedSubscribeButton.tsx`) renders
the "Abbonati al feed" button AND injects a `<link rel="alternate"
type="application/rss+xml">` into `document.head` (cleaned up on unmount). Used
on Albo, Contracts, ThemeDetail pages.
