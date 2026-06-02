---
name: Monitoraggio civico (Report di Monitoraggio Civico)
description: Monithon-inspired citizen monitoring reports feature in lamezia-trasparente
---

Citizens write structured 3-phase civic monitoring reports (1. Analisi desk, 2. Valutazione di efficacia, 3. Impatto/risultati) on a funded project: a contract (CIG) or a PNRR project (CUP).

**Key constraints/decisions:**
- Public create endpoint defaults status to `in_revisione`; only `pubblicato` reports show on public list/detail and in the per-project section. Moderation (publish/reject/back-to-review/delete) is admin-only behind `requireIngestAuth` (503 if INGEST_API_TOKEN unset in isolated env, 401 if wrong).
- Public upload endpoint `/monitoring-reports/uploads/request-url` is UNAUTHENTICATED but limited (15MB, images+docs) and attachments are sanitized server-side to only accept urls starting `/api/storage/`.
- Subject info (subjectTitle/cig/cup) is resolved+denormalized server-side at create from the contract/pnrr id; client only sends the id.
- `PnrrProject` schema gained a non-breaking integer `id` (also mapped in publications `/pnrr/projects`) so the form/section can target a project by id.
- Bidirectional linking: `src/components/MonitoringReportsSection.tsx` renders published reports + "Monitora questo progetto" launch button; embedded in ContractStoryline (header) and Pnrr (accordion). Form reads `?contractId=` / `?pnrrProjectId=`.

**Why:** mirrors existing atti-fondamentali/legalità/bandi source+manual+moderation precedence; keeps citizen submissions gated by editorial review before public visibility.

**How to apply:** new public-submission features should follow this same shape (unauth create→in_revisione, admin moderation behind requireIngestAuth, server-side denormalization of subject, storage-url-only attachments).
