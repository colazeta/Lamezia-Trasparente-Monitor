---
name: Bandi section
description: How the lamezia-trasparente "Bandi e finanziamenti" grants section is structured and its participation/lost-resources logic.
---

# Bandi (grants/funding) section

Public catalog of grants the comune is eligible for, with auto-detected participation and lost-resources estimate. Mirrors Atti Fondamentali / Legalità conventions.

## Data model
- `bandiTable` (curated bandi) + `bandoMatchesTable` (participation links to ingested content).
- Match targets: `publication` (albo), `contract` (ANAC), `pnrr`.
- `source`: `manual` (published) vs `suggested` (auto-proposed candidate, hidden from public until confirmed).

## Derived fields (computed in api-server lib, not stored)
- **esito**: `vinto` (confirmed contract/pnrr match), `partecipato` (confirmed publication match), `non-partecipato` (concluso + no confirmed evidence), `da-verificare` (pending/unconfirmed or still open).
- **lostAmount / risorsePerse**: `importoMedioAggiudicato ?? 0`, only counted for `concluso` + `non-partecipato`. **Why:** spec mandates the estimate use *only* importo medio aggiudicato; do NOT fall back to importoStanziato (it changes the metric's meaning and overstates losses).

## Endpoints
- Public: list (filters status/settore/esito/ente), `/summary`, `/:slug` detail — return only `manual` bandi + confirmed matches.
- Admin (requireIngestAuth): CRUD by **slug**, confirm-suggestion (slug), confirm/dismiss match (integer matchId), list-admin returns all incl. suggested + all matches.

## Frontend
- Public: `Bandi.tsx` (catalog + summary cards + filters), `BandoDetail.tsx`.
- Admin: `AdminBandi.tsx` (TokenGate pattern, sessionStorage `lt_ingest_token`).
- numeric amounts come back as strings; `lostAmount`/`risorsePerseTotale` as numbers.

**Why:** keeps suggestions non-destructive and editorial-gated, consistent with atti/legalità; participation is inferred from already-ingested data via keyword/CUP/CIG cross-match.
