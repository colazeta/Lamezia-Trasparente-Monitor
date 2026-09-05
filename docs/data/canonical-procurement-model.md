# Canonical procurement model

Lamezia Trasparente treats the website as a projection of a canonical data corpus, not as the primary data store.

## Invariants

1. Every official, publishable Albo record in the current public source window is materialised in the canonical public corpus and receives an explicit taxonomy result.
2. Procurement classification does not depend on the presence of a CIG.
3. A procurement-related act without a contract identifier is retained as an unresolved procurement event. It is never silently dropped and never converted into a fictitious contract.
4. A canonical contract entity is created from an exact contract identity. In the current implementation that identity is a CIG; all Albo events linked to that CIG are aggregated into the same lifecycle.
5. When an act contains both an agreement/framework CIG and an explicit `CIG CONTRATTO SPECIFICO`, the specific-contract CIG is the contract identity and the agreement CIG remains a related identifier.
6. Coverage is measured and exported. The number of classified procurement events, resolved events, unresolved events, canonical contracts and event-to-contract links must reconcile through explicit invariants.
7. Source facts and derived classifications remain distinguishable. ANAC/BDNCP enrichment must not silently overwrite facts extracted from the Comune's public acts.
8. Public projection rules remain fail-closed: records that are not `publishable` and `official_source_acquired` do not enter the public canonical corpus.

## Public artifacts

- `data/processed/canonical/lamezia-public-corpus-current.json`: taxonomised canonical public Albo corpus.
- `data/processed/contracts/lamezia-contracts-current.json`: canonical procurement projection, including procurement events, canonical contract entities, unresolved events, UI-compatible contracts and lifecycle storylines.

## Current coverage boundary

The current artifacts describe the public Albo window acquired by the platform. They do not yet claim complete historical procurement coverage or independent exhaustive BDNCP discovery by contracting authority. Those are separate acquisition layers and must be measured rather than inferred.
