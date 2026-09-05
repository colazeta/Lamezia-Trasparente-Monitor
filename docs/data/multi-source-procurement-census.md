# Multi-source procurement census

The contracts view is a projection of a procurement census assembled from independent public sources. It must not be interpreted as a direct mirror of one website or feed.

## Source roles

### Canonical Albo corpus

The public Albo corpus supplies administrative acts and lifecycle evidence. Procurement relevance is classified independently of whether the subject contains a CIG. Acts without a usable CIG remain `unresolvedEvents`; they are not dropped and are not heuristically attached to an ANAC contract.

### ANAC tracked-CIG verification

The existing ANAC/BDNCP sync verifies and enriches CIGs already known to the canonical local corpus. This layer answers whether a known local CIG is represented in the ANAC resources actually consulted. It is not discovery.

### ANAC authority discovery

The authority census independently scans official annual/monthly ANAC CIG resources and selects rows whose contracting-authority tax id is `00301390795`. It can therefore discover CIGs that are absent from the current Albo window.

The authority snapshot has its own ledger:

- `requestedYears`: historical years the census intends to cover;
- `completedYears`: closed historical years for which every catalogued resource has been acquired;
- `completedPeriods`: individual ANAC periods already acquired;
- `consultedArchives`: source URL, period, rows scanned and matches;
- `records`: unique CIG records for the target authority;
- explicit freshness and failure state.

Current-year periods are refreshed because ANAC resources can change. Historical years are consumed incrementally so the workflow remains bounded and auditable.

## Reconciliation

For every build, the contract projection computes three disjoint CIG sets:

- `overlapCigs`: present in both the canonical local corpus and independent ANAC authority discovery;
- `alboOnlyCigs`: present locally but not in the authority snapshot currently acquired;
- `anacOnlyCigs`: independently discovered in ANAC but absent from the canonical local corpus.

Their union is the current multi-source contract set. The build fails its quality gates if these sets do not reconcile exactly.

An `anacOnly` record is intentionally conservative. It is identified as an ANAC/BDNCP procedure whose local lifecycle still needs reconstruction. ANAC tender amount and procedure metadata may be retained as source facts, but they do not overwrite a local amount or establish payments, execution or award value. Supplier data are not inferred from the CIG dataset.

## Historical completeness

Completeness is never inferred from an empty result. The census may claim the requested ANAC historical backfill is complete only when its period ledger proves that all catalogued resources for every closed requested year were acquired successfully.

This still does not mean that the complete municipal contract dossier has been reconstructed. Further independent layers include:

1. Comune di Lamezia Terme Amministrazione Trasparente / Tinnvision historical procurement pages;
2. public-safe attachments and document text;
3. ANAC award/outcome and OCDS lifecycle sources;
4. local acts that cannot yet be resolved to a CIG.

## Tinnvision next layer

The official procurement discovery surfaces are registered in `data/sources/contracts/tinnvision-procurement-discovery.json`. The parser must traverse publication years and pagination, preserve source record identifiers, collect official detail/attachment links, and pass all public document material through the existing fail-closed public-safety policy before text extraction or publication.
