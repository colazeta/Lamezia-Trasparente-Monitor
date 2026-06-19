# Founder control panel

Issue linkage: #548. This document is the Giovanni-facing control panel for short review windows, especially from mobile. It does not authorise merge, approval, auto-merge or issue closure.

## Merge ora

| Item | Status | Why | Action |
| --- | --- | --- | --- |
| None from this lane | review-needed | P0 governance docs are newly materialized and need human review | Review the PR; merge only if the model is acceptable |

## Decisione editoriale richiesta

| Item | Decision | Risk | Default if no decision |
| --- | --- | --- | --- |
| #545 public-copy/prototype boundaries | Decide whether the first public surface can use declared demo/partial data while stronger source coverage is pending | medium | Keep #545 as launch-blocker |
| Public framing of LTM v0 | Confirm “osservatorio civico in costruzione” rather than complete archive/product | medium | Use prototype/status/source/verification/limits language |
| New civic feature proposals | Require a Giovanni decision point unless the PR states `no human decision needed` | medium | Park as needs-human-decision |

## Fonte mancante / verifica richiesta

| Item | Missing evidence | Owner | Next action |
| --- | --- | --- | --- |
| #545 section-level data status | Whether each major public section has status, source, verification level, last update, known limits and demo/partial/verified status | Codex + reviewer | Produce a small reusable pattern or checklist before launch |
| #547 source registry POC | Minimum source/evidence model and v0/v1 stack recommendation | Backlog/P1 | Do not start until P0 gates are materially satisfied or blocked-stable |
| Existing v0 UX materialization #522/#524/#525 | Complete PR/diff/bundle or explicit blocker | Materialization governor | Recover only complete materialization evidence |

## Codex può procedere autonomamente

| Item | Allowed autonomous work | Constraints |
| --- | --- | --- |
| #543 product factory | Documentation, issue template, example and PR body rule | No public-copy changes unless separately reviewed |
| #544 human gate ledger | Numeric ledger, comment template and update rule | Keep mobile-readable; avoid heavy governance |
| #548 control panel | Four-block decision surface and owner classification | Do not turn into complex admin infrastructure |
| #546 field-test loop | Prepare only after #545 has safe prototype boundaries | P1; no distraction from P0 |
| #547 backend/source registry POC | Documentation-only comparison after P0 | P1; no API/server/database implementation from this lane |

## Required owner labels for next action

Every future operational update should classify the next owner as exactly one of:

- `Giovanni`
- `Codex/materialization`
- `PR review`
- `backlog`

## Decision prompt format

```md
Decision needed from Giovanni: ...
Why now: ...
Risk if merged without decision: low / medium / high
Safe default if no answer: ...
Codex can continue autonomously on: ...
```

## Rule for new civic features

Every new civic feature issue or PR must declare one of:

- `Giovanni decision point: ...`
- `No human decision needed: ...`

If neither is present, classify the work as `needs-human-decision` before promotion or merge.
