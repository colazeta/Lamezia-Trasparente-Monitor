# LameziaTrasparente public MCP

LameziaTrasparente exposes a public **Model Context Protocol (MCP)** server for
AI clients that need structured, source-verifiable civic data about Lamezia
Terme.

The MCP server is a permanent platform surface. It is independent of the
browser-side WebMCP integration and of any hackathon or challenge.

## Endpoint

```text
https://<public-api-host>/api/mcp
```

Transport: **Streamable HTTP**, stateless.

Authentication: none. The endpoint exposes only the same public-safe projection
available through the public REST API. Editorial, administrative and raw
ingestion data are not reachable through MCP.

The server supports:

- MCP `2026-07-28` on the modern per-request protocol path;
- stateless compatibility for 2025-era MCP clients that still open with
  `initialize`.

A fresh MCP server instance is created for each request. No MCP session, result
or client credential is shared between requests.

## One public data core, three interfaces

LameziaTrasparente deliberately maintains three complementary interfaces over
the same public-safe data model:

1. **Web application** — the human interface for reading, filtering and
   verifying civic records.
2. **WebMCP** — browser-side tools that let an agent operate the visible website
   together with a citizen.
3. **Remote MCP** — this endpoint, for external MCP clients, research agents and
   other interoperable tools.

The MCP server does not maintain a separate hidden copy of the civic data. Tool
handlers reuse the same public projection and public data functions as the REST
API.

## Safety and interpretation contract

Every tool is read-only and is advertised with MCP annotations equivalent to:

```json
{
  "readOnlyHint": true,
  "destructiveHint": false,
  "idempotentHint": true,
  "openWorldHint": false
}
```

The server also publishes model-facing instructions with the following rules:

- missing, partial or stale data are documentation limitations, not evidence
  that an event or contract does not exist;
- amounts, procedure types, missing fields and monitoring indicators must not be
  treated as proof of illegality or wrongdoing;
- material conclusions, dates and legal effects should be checked against the
  returned provenance and public source documents;
- public-safety attestations remain fail-closed: material that has not passed the
  public projection is not made available merely because it exists internally.

Successful tool results keep a text representation for compatibility and also
publish `structuredContent` in this envelope:

```json
{
  "resource": "documents",
  "data": {},
  "verification": {
    "publicOnly": true,
    "sourceCheckRequired": true,
    "portal": "https://lamezia-trasparente.pages.dev"
  }
}
```

`resource` varies by tool. `data` contains the corresponding public result.

## Stable tool catalogue

The following tool names are the public compatibility contract. Renaming or
removing them is considered a breaking API change.

| Tool | Purpose |
| --- | --- |
| `search_documents` | Search and filter public administrative records. |
| `get_document` | Retrieve one public act by numeric id or stable `publicId`. |
| `get_document_markdown` | Retrieve public-safe extracted Markdown for an act. |
| `search_contracts` | Search and filter public procurement records. |
| `get_contract` | Retrieve one public contract. |
| `list_themes` | List civic monitoring themes. |
| `get_theme` | Retrieve one monitoring theme and linked public contracts. |
| `list_performance` | List municipal performance categories and indicators. |
| `list_pnrr` | Search and filter PNRR projects. |

List/search tools use the same filters and pagination semantics as their REST
counterparts. `pageSize` is capped at 100.

## Configure an MCP client

For a client that accepts Streamable HTTP server URLs, the configuration is
conceptually:

```json
{
  "mcpServers": {
    "lamezia-trasparente": {
      "url": "https://<public-api-host>/api/mcp",
      "transport": "streamable-http"
    }
  }
}
```

Replace `<public-api-host>` with the public API deployment host used by the
platform. No token is required.

## Modern protocol discovery

A conformant MCP `2026-07-28` request carries the protocol information both in
its request metadata and in the standard headers. A minimal discovery request
is:

```bash
curl -X POST "https://<public-api-host>/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2026-07-28" \
  -H "Mcp-Method: server/discover" \
  -d '{
    "jsonrpc":"2.0",
    "id":"discover-1",
    "method":"server/discover",
    "params":{"_meta":{
      "io.modelcontextprotocol/protocolVersion":"2026-07-28",
      "io.modelcontextprotocol/clientInfo":{"name":"demo","version":"1.0.0"},
      "io.modelcontextprotocol/clientCapabilities":{}
    }}
  }'
```

The result advertises the supported modern revisions, tool capability and the
server instructions. Modern tool requests use the same metadata envelope and
standard MCP headers.

## Legacy stateless clients

2025-era clients continue to work through the same endpoint. They can start with
an ordinary `initialize` request, for example:

```bash
curl -X POST "https://<public-api-host>/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"demo","version":"1.0.0"}}}'
```

Compatibility is deliberately **stateless**. Session-oriented legacy `GET` and
`DELETE` operations are not part of the public contract.

## Versioning policy

The MCP implementation has its own server version, currently `1.1.0`.

For future changes:

- adding an optional tool or field is normally additive;
- changing a tool name, removing a tool, making an optional input required or
  changing the meaning of an existing field is breaking;
- the text result should remain available while compatibility with older MCP
  clients is useful;
- protocol upgrades should preserve the legacy path for a documented transition
  period rather than silently cutting clients off.

## Development and verification

The implementation lives in:

```text
artifacts/api-server/src/lib/mcpServer.ts
artifacts/api-server/src/routes/mcp.ts
```

Protocol and public-safety tests live in:

```text
artifacts/api-server/src/routes/mcp.test.ts
```

Before merging MCP changes, run at least:

```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run test
```

The full monorepo CI remains authoritative before deployment.

## Related interfaces

- Public REST and OpenAPI: [`artifacts/api-server/PUBLIC_API.md`](../artifacts/api-server/PUBLIC_API.md)
- Browser WebMCP implementation: `artifacts/lamezia-trasparente/src/lib/webmcp.tsx`
- WebMCP challenge history: [`WEBMCP_CHALLENGE_2026.md`](WEBMCP_CHALLENGE_2026.md)
