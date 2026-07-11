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

## Page-level implementation pass

This second pass turns the shared architecture into page-specific product structure for the highest-priority public pages. The implementation is intentionally registry-driven: each priority route now has a typed `pageImplementation` blueprint rendered by `SectionScaffold` with primary object, page hierarchy, source/status/limits placement, useful controls, citizen action, remaining data dependency and launch posture.

| Priority page | Changes made | Remaining data dependency | Launch posture | Further work before public launch |
| --- | --- | --- | --- | --- |
| `/` | Added a home civic system map that explains what can be checked, what is partial, which sources are missing, which modules are demo, which structures are ingestion-ready and what a citizen can do. | Live counts and ingestion states must keep syncing with the registry and source health. | Public as orientation, not a completeness claim. | Refine counts once every ingestion has stable source dates. |
| `/convocazioni` | Added a seduta blueprint around upcoming/past sessions, organ, ODG, source publication, resoconto, votes and linked acts. | Stable links between sedute, resoconti, votes and delibere. | Public with caveats; demo route remains marked demo. | Add per-record source check date and stronger linked-act coverage. |
| `/delibere` | Added act-specific structure for type, date, subject, organ, publication source, attachments, status and related session. | Reliable relation among act, Albo publication, attachments and seduta. | Public with coverage caveats. | Add session links and source check dates when available. |
| `/albo` | Added publication-specific structure for number, category, dates, attachments and punctual/fallback source. | Import continuity, attachment retention and fallback classification. | Public with source and coverage limits. | Improve dedupe, category state and attachment lineage. |
| `/contratti` | Added procurement structure for procedure, CIG, supplier, amount, award date, CUP and source caveats. | Alignment across ANAC, municipal acts and attachments. | Public with completeness caveats. | Add source check date and determine links when verified. |
| `/incarichimetro` | Added signal-first structure for concentration and rotation indicators with methodological caveats. | Normalized assignments/contracts dataset and documented thresholds. | Public only as cautious signal, not accusation. | Document denominators, excluded cases and thresholds. |
| `/pnrr` | Added project structure for CUP, title, funding, implementation state, place, responsible office/source and last update. | Distinct project, location and municipal source metadata. | Experimental with explicit source checks. | Add source date for every CUP and verified office/act links. |
| `/organi` | Added institutional body structure for composition, mandate, source and last check. | Freshness tracking for official composition changes. | Public with role freshness caveat. | Add per-body verification dates. |
| `/amministratori` | Added public-role structure for mandate, organ, public documents and source limits. | Distinguish public mandatory data, absent data and non-pertinent data. | Public with minimization and freshness caveats. | Add document-level source status for CV/declarations. |
| `/monitoraggio` | Added monitor item structure for theme, source, verification state, linked acts, missing data and next action. | Moderation workflow, editorial states and linked official records. | Public as document hub with verification language. | Add public state-change audit trail. |
| `/criticita-pubbliche` | Added registry structure for initial source, state, office, linked acts, response and next action. | Moderation and document-link rules before broader publishing. | Public only as verification register, not allegations. | Add state-change log and publication policy. |
| `/segnalazioni` | Added submission structure for documented fact, source, moderation state and missing data. | Privacy, moderation, notification and anti-spam rules. | Not automatic publication; must remain moderated. | Finalize redaction and response policy. |
| `/fonti-dati` | Added source-registry structure for source owner, URL, type, frequency, connection state, limits and site usage. | Sync registry with ingestion and public route coverage. | Public as method anchor. | Add owner and source check date for every live source. |
| `/stato-monitoraggio` | Added source-health structure with checks, freshness, coverage, caution, priority, explicit status reasons, versioned evidence history and a 5/5 Open Data coverage contract. | The public register reflects repository evidence, not live runtime availability; multi-run history is limited to timestamps retained by each pipeline. | Public as technical status, not substantive judgment. | Retain a bounded multi-run history for every pipeline and connect runtime source checks when the production API is available. |
| `/metodologia` | Added method structure for definitions, indicator caveats, absences and verification rules. | Update when thresholds, datasets or workflows change. | Public and required before sensitive indicators. | Add examples for new indicators. |
| `/atlante-territoriale` | Added territorial-unit structure for ISTAT section, indicator, source, year, geometry limits and export readiness. | GeoJSON and indicator lineage as data evolves. | Public with cartographic/source limits visible. | Document CRS, transformations and indicator lineage. |
| `/legalita` | Added source-first legalita structure connecting themes, beni, timeline and Trame with caution notes. | Keep memory, public records and sensitive claims separated. | Public with prudent wording. | Add punctual references for any new sensitive content. |
| `/legalita/timeline` | Added event structure for date, title, source, place, verification status and context. | Publish events only with source and editorial verification. | Public only with source-first events. | Add source audit trail for each event. |
| `/legalita/trame-festival` | Added Trame card structure for event, idea, minute, source, transcript state and editorial verification. | Approved cards need complete attribution and review. | Public even when empty if the empty state explains no card is approved. | Add cards only after transcript, minute and source are verified. |

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
