---
name: Public API + MCP server
description: The AI-ready read-only public API and MCP server surfaces (api-server)
---

The api-server exposes two **read-only** public surfaces over the same data via a
shared data-access layer `src/lib/publicData.ts` (mappers + filters + pagination).
Both must stay in sync — change `publicData.ts` once, not in two places.

**REST** — router `src/routes/public.ts`, mounted at `/api/public/v1` (in
`routes/index.ts`). Uniform envelope `{ data, pagination: {page,pageSize,total,totalPages} }`;
pageSize default 20, max 100. Self-hosted OpenAPI 3.1 at `/openapi.json` built by
`src/lib/publicOpenapi.ts` (hand-maintained, **separate** from the internal
`lib/api-spec` openapi.yaml/codegen — never merge them). Index/discovery at `/`.

**MCP** — `src/lib/mcpServer.ts` (tools) + `src/routes/mcp.ts` (transport),
mounted at `/api/mcp` directly on the app (NOT under `/api/public`). Streamable
HTTP, **stateless** (`sessionIdGenerator: undefined`, `enableJsonResponse: true`):
a fresh `McpServer`+transport per POST, closed on `res.close`. GET/DELETE → 405.

**Why stateless:** runs behind the Replit/site proxy; no shared session state
keeps it robust and lets each request stand alone.

**How to apply:** clients must send `Accept: application/json, text/event-stream`.
Detail tools return `{ isError: true }` (not HTTP 404) for missing entities.
Docs live in `artifacts/api-server/PUBLIC_API.md`.
