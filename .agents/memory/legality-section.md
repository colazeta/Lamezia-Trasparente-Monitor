---
name: Legalità e Trasparenza section
description: How the lamezia-trasparente "Legalità e Trasparenza" monitoring section is structured (fully manual, no ingestion).
---

# Legalità e Trasparenza monitoring section

A **fully editorial** section of lamezia-trasparente: no automatic ingestion, no
calculated scores. All content is entered by the Redazione behind the shared
`requireIngestAuth` token gate (same `INGEST_API_TOKEN` as other admin pages).

**Why:** the task (Task #153) explicitly required manual-only content; do not add
any ingestion job, scheduler, or score computation that touches these tables.

## Data shape
- `legalityOverview` is a **singleton** (id=1); the overview PATCH does an upsert
  on id=1. There is one section-wide `overallJudgment`.
- `legalityAreas` (slug unique, title, description, finalJudgment, position) →
  `legalityRequirements` (status enum present/absent/partial/not_applicable,
  comment, jsonb `linkedActs` as `{label,url}[]`, position). FK requirements→areas
  is `onDelete: cascade`, so deleting an area removes its requirements in DB.

## API
- `GET /api/legality` is public and returns the **whole section in one call**:
  `{ overallJudgment, updatedAt, areas: [{...area, requirements: [...]}] }`.
- Writes are PATCH /legality/overview, POST/PATCH/DELETE /legality/areas,
  POST /legality/areas/:id/requirements, PATCH/DELETE /legality/requirements/:id.
- `linkedActs` are normalized server-side: blank label/url entries are dropped.
  Linked-act URLs can be internal site paths (e.g. `/albo`) or external URLs; the
  public page renders internal ones via wouter `Link`, external via anchor.

## How to apply
- New requirement defaults to status `absent` if none provided.
- Reordering in the admin is done by swapping `position` values of two adjacent
  items (two PATCH calls), then invalidating the section query.
- Mobile view of this section was intentionally deferred to a separate downstream
  task — don't build it into the web pages.
