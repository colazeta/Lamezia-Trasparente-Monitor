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

The public application feature-detects `document.modelContext`. When the browser exposes WebMCP, the application registers four imperative tools with `document.modelContext.registerTool()`.

Browsers without WebMCP support follow the existing application path unchanged.

After a successful tool call, the live site also displays an accessible **WebMCP activity panel**. It identifies the read-only action, the public route opened for the citizen and, where the public API exposes it, the number of matching records. The panel keeps agent activity visible in the same interface instead of hiding browser actions from the user.

### 1. `search_civic_documents`

Purpose: search public administrative records by keywords.

Behaviour:

1. calls the existing public-safe `/api/public/v1/documents` endpoint;
2. caps the returned page size;
3. navigates the citizen to `/albo` with the same text query;
4. returns a JSON result containing the API result, API path, UI path and a verification notice;
5. surfaces the action in the WebMCP activity panel.

### 2. `filter_public_contracts`

Purpose: filter public contracts by text, procedure, amount and date range.

Behaviour:

1. calls `/api/public/v1/contracts` with explicit, schema-constrained filters;
2. navigates to `/contratti` with the selected filters encoded in the URL;
3. returns the public result and the user-visible route;
4. surfaces the action and result count in the WebMCP activity panel when available.

The tool description explicitly avoids treating indicators or filtering results as evidence of irregularity.

### 3. `explore_pnrr_projects`

Purpose: explore PNRR projects by text, mission or status.

Behaviour:

1. calls `/api/public/v1/pnrr`;
2. navigates to the PNRR public section with the requested filters encoded in the route;
3. preserves the platform's source and freshness caveats;
4. surfaces the action in the shared UI.

### 4. `inspect_civic_record`

Purpose: open an individual public record after an agent has identified it.

Supported resources:

- `document` → `/albo/{id}`;
- `contract` → `/contratti/{id}`;
- `pnrr` → `/pnrr/{CUP}`.

The tool reads only public endpoints. It cannot access the editorial area and cannot create, update, approve or delete records.

## Why WebMCP instead of only backend MCP

The existing MCP server is useful when an assistant needs machine-to-machine access to civic data. WebMCP addresses a different interaction boundary: the agent and the citizen share the live public website.

The browser-agent workflow therefore keeps three outputs together:

- a structured result for the agent;
- a public LameziaTrasparente route for the human;
- a visible activity acknowledgement inside the live interface.

This makes the action inspectable and reversible: after a tool call the citizen remains in the ordinary civic interface, can see what the agent did, verify the source and alter the search manually.

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
- every tool result and the visible activity panel remind the user to verify dates, legal effect and source documents before drawing conclusions.

## Demo flow

A short demo should show one continuous research task rather than four disconnected calls.

Suggested English prompt for the challenge recording:

> Find the public records about school maintenance and open the same search in the site. Then check contracts above €100,000 on the same topic in 2026 and show me the corresponding civic view. Finally, find PNRR projects concerning schools and open one relevant project record.

Expected sequence:

1. `search_civic_documents({ q: "manutenzione scuole" })`;
2. the citizen sees the Albo search route and the read-only WebMCP activity panel;
3. `filter_public_contracts({ q: "scuole", minAmount: 100000, from: "2026-01-01" })`;
4. the citizen is moved to the contracts section while the agent receives the structured public result;
5. `explore_pnrr_projects({ q: "scuole" })`;
6. the agent selects a CUP from the result;
7. `inspect_civic_record({ resource: "pnrr", id: "<CUP>" })` opens the project in the civic interface.

## Suggested video structure

Keep the public demo under three minutes and focus on the interaction boundary rather than explaining the whole platform.

- **0:00–0:25 — problem:** public administrative information is open but fragmented and difficult to traverse across records, contracts and projects.
- **0:25–0:45 — baseline:** briefly show LameziaTrasparente and state that REST/MCP access existed before the challenge.
- **0:45–2:15 — WebMCP demo:** execute the continuous prompt above and show the page navigation plus the visible activity panel after each tool call.
- **2:15–2:40 — architecture:** browser WebMCP → existing public-safe API → user-visible civic route; backend MCP remains a separate machine-to-machine surface.
- **2:40–2:55 — safeguards:** read-only tools, source verification, no editorial/admin actions, non-accusatory civic framing.

## Suggested submission description

**LameziaTrasparente WebMCP turns an existing civic-transparency portal into a shared workspace for citizens and browser agents. Instead of adding a separate chatbot, the site exposes narrow read-only WebMCP tools for administrative records, public contracts and PNRR projects. Each call uses the existing public-safe API, returns structured data to the agent, moves the live site to the corresponding civic view and visibly records the agent action for the citizen. The result is an inspectable human-agent workflow in which automation accelerates navigation without replacing source verification or the public interface.**

## Files introduced or changed for issue #910

- `artifacts/lamezia-trasparente/src/lib/webmcp.tsx`
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

The repository CI also runs the stable workspace test suites after typecheck and build.

## Current MVP boundary

This submission deliberately does not expose write actions. It also does not attempt to convert every LameziaTrasparente section into a WebMCP tool. The four-tool surface is small enough to review and demonstrate while covering three materially different civic datasets and one record-inspection workflow.

The Albo already hydrates its text query from the URL. Contract and PNRR tool calls encode their filters into the public route and execute the requested public API query, but every existing page control is not yet bidirectionally hydrated from those URL parameters. That is a transparent follow-up rather than hidden state or privileged automation.

A later iteration can complete bidirectional URL synchronisation and add performance/open-data exploration after the challenge baseline is stable.
