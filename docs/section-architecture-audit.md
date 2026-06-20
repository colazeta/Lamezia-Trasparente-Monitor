# Public Section Architecture Audit

This audit supports a cautious public v0 for Lamezia Trasparente Monitor. Every public section should tell visitors what civic question it answers, which sources are expected, what is partial or missing, and what to do when no records are available. It must not present indicators, recurrences, maps, empty states or demo records as proof of wrongdoing or complete official data.

The implementation lives in:

- `artifacts/lamezia-trasparente/src/data/sectionArchitecture.ts`
- `artifacts/lamezia-trasparente/src/components/civic-section/SectionScaffold.tsx`
- `artifacts/lamezia-trasparente/src/components/layout/navSections.ts`

## Shared Structure

Each public route now has a typed architecture record with:

- civic group and user-facing title;
- public explanation and civic question;
- status, data status and launch readiness;
- expected source, source type, update cadence, verification note, known limits and ingestion state;
- primary content expectation, filters, empty-state copy and related routes;
- audit notes for missing sources, filters, cross-links, empty states and mobile readability.

`SectionScaffold` renders the common public wrapper for list/index pages: breadcrumbs, status badges, source/data readiness, civic question, "Aiuta a capire", empty-state guidance and related navigation.

## Route Matrix

| Routes | Civic job | Main risk | Required structure |
| --- | --- | --- | --- |
| `/`, `/domande`, `/temi`, `/statistiche`, `/chi-siamo` | Orient visitors through the monitor. | Catalog pages can imply completeness. | Purpose copy, status, source limits, related paths, no-data guidance. |
| `/convocazioni`, `/convocazioni/demo-consiglio-comunale-v0`, `/delibere`, `/albo`, `/atti-fondamentali`, `/pareri` | Explain council, acts and decisions. | Demo or partial records can look official. | Source badge, document links, organ/date filters, demo badge where needed. |
| `/organi`, `/amministratori` | Show public roles and bodies. | Roles can become stale. | Mandate/source fields, last-check language, body/person filters. |
| `/contratti`, `/incarichimetro` | Read procurement and assignment patterns. | Recurrence language can sound accusatory. | Method caveat, CIG/operator filters, source/amount limits, cautious indicator labels. |
| `/pnrr`, `/bandi`, `/performance`, `/performance/confronta`, `/macchina-comunale` | Follow projects, funds and administrative capacity. | Metrics can be mistaken for judgement or real staffing data. | Launch status, source coverage, comparison caveats, demo marker where applicable. |
| `/beni-confiscati`, `/legalita`, `/legalita/timeline`, `/legalita/trame-festival` | Preserve civic memory and antimafia context. | Sensitive records need strict source discipline. | Source-first copy, location accuracy, legal notes, minute/source attribution, no unsourced event publication. |
| `/atlante-territoriale` | Read territorial indicators by place. | Maps can imply precision or official completeness before source checks. | ISTAT/source badge, territorial level, demo/official state, indicator filters, map empty state. |
| `/monitoraggio`, `/monitoraggio/nuovo`, `/criticita-pubbliche`, `/segnalazioni`, `/archivio-proposte`, `/promessometro`, `/accesso-civico` | Turn civic questions into verifiable records. | Submissions can look like accusations or automatic publication. | Moderation/readiness state, signal-vs-verification language, source checklist. |
| `/fonti-dati`, `/stato-monitoraggio`, `/opendata`, `/feeds`, `/sviluppatori`, `/metodologia`, `/roadmap`, `/note-legali`, `/guida`, `/contatti`, `/iscrizioni` | Explain sources, method, roadmap and channels. | Technical health can be confused with verified content. | Source registry, method/legal caveats, channel readiness, clear not-ready states. |

## Launch Readiness

Launch-ready with caveats:

- core navigation, method, source registry and public index pages;
- sections that can safely show partial source-aware records or empty states;
- sensitive sections only when source, state and limitations are visible.

Not launch-ready as real data:

- declared demo modules such as `promessometro`, `macchina-comunale` and the demo council session;
- submission or channel flows that need moderation, privacy or verified contact setup;
- any page where the source is missing and the UI cannot yet explain that absence.

## UI and Data Readiness Requirements

Before a section shows real records, it needs:

1. source name or source family near the primary fields;
2. state label such as partial, demo, source missing or under construction;
3. empty state that explains whether data is absent, not connected or not publishable;
4. filters matching the main public task, not internal implementation details;
5. related navigation to method, sources, legal notes or adjacent civic sections;
6. mobile layout where source and status stay close to each record.

## Follow-ups

- Connect route-specific datasets to the registry as ingestion becomes stable.
- Add per-record source check dates where live data exists.
- Convert dense tables to mobile cards where the table cannot carry source/state labels.
- Decide launch posture for contacts, subscriptions and submission workflows after verified channels and moderation rules are available.
