# LameziaTrasparente — WebMCP Challenge 2026

Issue: #910

## Project idea

LameziaTrasparente is an existing civic-transparency platform for Lamezia Terme. The WebMCP extension makes a selected part of the public interface discoverable and operable by browser agents without creating a separate chatbot or a privileged automation channel.

The design principle is simple:

> The agent does not replace the transparency portal; it operates the transparency portal with the citizen.

The existing site remains the place where the user can inspect records, follow sources, read caveats and continue manually. WebMCP adds a browser-native tool layer on top of the same public-safe data.

## Baseline before the challenge extension

Before this extension the repository already contained:

- a public React/Vite civic interface;
- a read-only public REST API under `/api/public/v1`;
- a stateless MCP server under `/api/mcp` for machine-to-machine access;
- public sections for the Albo Pretorio, contracts, PNRR, performance and other civic datasets;
- public-safety projections and source-traceability safeguards on the API layer.

Those pre-existing capabilities are not presented as WebMCP work. The challenge contribution is the browser-side WebMCP layer introduced in the commits linked to issue #910.

## New WebMCP layer

The public application now feature-detects `document.modelContext`. When the browser exposes WebMCP, the application registers four imperative tools with `document.modelContext.registerTool()`.

Browsers without WebMCP support follow the existing application path unchanged.

### 1. `search_civic_documents`

Purpose: search public administrative records by keywords.

Behaviour:

1. calls the existing public-safe `/api/public/v1/documents` endpoint;
2. caps the returned page size;
3. navigates the citizen to `/albo` with the same text query;
4. returns a JSON result containing the API result, API path, UI path and a verification notice.

### 2. `filter_public_contracts`

Purpose: filter public contracts by text, procedure, amount and date range.

Behaviour:

1. calls `/api/public/v1/contracts` with explicit, schema-constrained filters;
2. navigates to `/contratti` with the selected filters encoded in the URL;
3. returns the public result and the user-visible route.

The tool description explicitly avoids treating indicators or filtering results as evidence of irregularity.

### 3. `explore_pnrr_projects`

Purpose: explore PNRR projects by text, mission or status.

Behaviour:

1. calls `/api/public/v1/pnrr`;
2. navigates to the PNRR public section with the requested filters encoded in the route;
3. preserves the platform's source and freshness caveats.

### 4. `inspect_civic_record`

Purpose: open an individual public record after an agent has identified it.

Supported resources:

- `document` → `/albo/{id}`;
- `contract` → `/contratti/{id}`;
- `pnrr` → `/pnrr/{CUP}`.

The tool reads only public endpoints. It cannot access the editorial area and cannot create, update, approve or delete records.

## Why WebMCP instead of only backend MCP

The existing MCP server is useful when an assistant needs machine-to-machine access to civic data. WebMCP addresses a different interaction boundary: the agent and the citizen share the live public website.

The browser-agent workflow therefore keeps two outputs together:

- a structured result for the agent;
- a public LameziaTrasparente route for the human.

This makes the action inspectable and reversible: after a tool call the citizen remains in the ordinary civic interface and can verify the source or alter the search manually.

## Safety and civic safeguards

All four tools are intentionally read-only.

Each tool is annotated with:

- `readOnlyHint: true`;
- `untrustedContentHint: true`.

Additional safeguards:

- input objects reject additional properties;
- free-text inputs have explicit maximum lengths;
- list results are capped at ten records per tool call;
- no authentication token is requested or forwarded;
- no `/redazione` or other internal route is exposed;
- results come from the existing public-safe API projection;
- tool descriptions use factual, non-accusatory language;
- every tool result reminds the agent to verify dates, legal effect and source documents before drawing conclusions.

## Demo flow

A short demo can show one continuous research task rather than four disconnected calls.

Suggested prompt:

> Cerca gli atti che parlano di manutenzione delle scuole. Apri la ricerca nel sito. Poi controlla i contratti sopra 100.000 euro relativi allo stesso tema nel 2026 e fammi vedere la sezione corrispondente. Infine cerca i progetti PNRR sulle scuole e apri una scheda rilevante.

Expected sequence:

1. `search_civic_documents({ q: "manutenzione scuole" })`;
2. citizen sees the Albo search route;
3. `filter_public_contracts({ q: "scuole", minAmount: 100000, from: "2026-01-01" })`;
4. citizen is moved to the contracts section while the agent receives the structured public result;
5. `explore_pnrr_projects({ q: "scuole" })`;
6. agent selects a CUP from the result;
7. `inspect_civic_record({ resource: "pnrr", id: "<CUP>" })` opens the project in the civic interface.

## Files introduced or changed for issue #910

- `artifacts/lamezia-trasparente/src/lib/webmcp.ts`
- `artifacts/lamezia-trasparente/src/lib/webmcp.test.ts`
- `artifacts/lamezia-trasparente/src/App.tsx`
- `docs/WEBMCP_CHALLENGE_2026.md`
- `LICENSE`

## Validation

Repository-level validation required before merge/submission:

```bash
pnpm run typecheck
pnpm run build
```

Focused frontend test:

```bash
pnpm --filter @workspace/lamezia-trasparente test -- src/lib/webmcp.test.ts
```

If CI uses a different workspace-filter convention, run the package's existing `vitest` script from `artifacts/lamezia-trasparente` instead.

## Current MVP boundary

This submission deliberately does not expose write actions. It also does not attempt to convert every LameziaTrasparente section into a WebMCP tool. The four-tool surface is small enough to review and demonstrate while covering three materially different civic datasets and one record-inspection workflow.

A later iteration can make additional page filters bidirectionally URL-synchronised and add performance/open-data exploration after the challenge baseline is stable.
