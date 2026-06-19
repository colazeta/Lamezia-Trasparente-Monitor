# AI civic product factory

Issue linkage: #543. This document defines a lightweight workflow for moving from a civic idea to a reviewable Lamezia Trasparente Monitor output without treating prototype work as a finished public product.

## 60-second workflow

| Step | Output | Owner | Gate |
| --- | --- | --- | --- |
| Civic idea | One-sentence public-interest problem | Giovanni or scouting | Required for sensitive topics |
| Product brief | User, use case and minimum public value | Giovanni or Codex | Required when public framing changes |
| Source map | Sources, missing data and verification level | Codex can draft | Required before public release |
| Issue breakdown | Small issues with acceptance criteria | Codex can draft | Required when scope expands |
| Codex task | Implementation or documentation prompt | Automation/Codex | Allowed for low-risk work |
| PR review | Pull request, diff and validation notes | PR reviewer | Required before merge |
| Human gate | Merge, edit, park or reject decision | Giovanni | Required for release |
| Release note | Public explanation and limits | Codex can draft | Required for public-facing changes |

## Mandatory issue fields

Every AI-assisted civic sprint must include:

- **Civic problem:** what public-interest problem the task helps clarify.
- **Target user:** citizen, journalist, association, administrator, editor or maintainer.
- **Source/evidence map:** official sources, public sources, demo data and unavailable data.
- **Missing data:** what cannot currently be verified.
- **Editorial risk:** none, low, medium or high, with reason.
- **Minimum output:** the smallest reviewable document, component, route, dataset or checklist.
- **Human gate:** `Giovanni decision point` or `no human decision needed`.
- **Acceptance criteria:** observable, testable and compatible with prototype boundaries.

## Agent vs human responsibilities

| Area | Codex/automation may do | Giovanni must decide |
| --- | --- | --- |
| Documentation | Draft playbooks, templates, checklists and issue breakdowns | Whether the operating model is adopted |
| UI scaffolding | Build neutral components, empty states and labels | Whether public copy is acceptable |
| Evidence | Map sources and mark gaps | Whether a claim is publishable |
| Data | Use declared demo/static data for prototypes | Whether to use demo data publicly |
| Public release | Prepare notes and validation summary | Merge, publish or park |

## Anti-overclaiming rules

- A prototype must say it is a prototype.
- Demo, partial and verified data must be labelled differently.
- Absence of data must not be presented as institutional failure.
- Every civic claim must carry a source, verification level, last update and known limit.
- Public copy must prefer evidence-bounded language: “the available sources show”, “not yet verified”, “source missing”, “candidate for accesso civico”.
- No ranking, accusation or reputational conclusion may be generated automatically.

## Worked example: documented civic resource page

**Civic problem:** citizens need a clear page that explains one public-interest topic with sources, missing data and next civic questions.

**Target user:** citizen, association, journalist or editor.

**Source/evidence map:** official pages, public notices, administrative acts and project documents. News reports can be used only as context, not as proof of administrative facts.

**Missing data:** current status, responsible office, update date, reusable structured data and evidence of implementation.

**Editorial risk:** medium if the topic is politically or reputationally sensitive.

**Minimum output:** a neutral prototype page or card model with source, status, last update, missing data and civic question.

**Human gate:** Giovanni decision point required before public release.

**Acceptance criteria:** no accusatory wording; facts sourced; missing data labelled; demo data declared; no unnecessary personal data.

## PR and release rule

A PR created from this factory must state either:

- `Giovanni decision point: ...`
- `No human decision needed: low-risk documentation/scaffolding only`

No PR may present a civic prototype as a finished product without an explicit status, source, verification and limits layer.
