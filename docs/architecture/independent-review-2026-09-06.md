# Independent architecture review — 6 September 2026

Status: **independent adversarial review of the Phase 0–1 foundation and the schema-convergence tranche**.  
Scope: PR #1050, PR #1054, the Data Architecture Contract, domain registry, migration plan, architecture inventory/gate, migration baseline/runtime logic and the existing disposable-Postgres migration tests.

## Executive verdict

The direction is sound and materially stronger than the previous page/pipeline-specific architecture. The strongest choices should be preserved: provenance-first modelling, explicit separation between civic facts and application/editorial state, typed relational domain models, fail-closed public projections, source-scoped completeness claims, and additive strangler migration.

The review nevertheless found several places where the implementation initially made a stronger claim than the evidence supported. In particular, a deterministic inventory is not by itself a complete architecture gate if new Drizzle syntax can evade the scanner; migration-chain presence is not the same as physical compatibility of a legacy database; and the previous push-bootstrap logic could infer too much from the presence of one sentinel table.

**Decision:** Phase 0–1 is accepted as the architectural foundation, but Phase 2 must not introduce canonical identity until the hardening gates in this review are green. The hardening tranche is corrective, not a redesign of the overall programme.

## What is strong and should remain unchanged

1. **Database before interface.** The website, API and research exports are projections of the civic knowledge system, not independent stores.
2. **Provenance-first semantics.** Source, acquisition/release, source record/artifact, assertion, resolution, canonical object, classification and public projection are distinct concerns.
3. **No forced graph/EAV architecture.** Typed relational tables and foreign keys remain the primary domain model; a cross-domain identity/relation layer complements rather than replaces them.
4. **Public safety is a physical/logical boundary.** LTCEDS demonstrates the right pattern: internal canonical state and public read model are distinct, and public clients do not reconstruct sensitive state ad hoc.
5. **Completeness is scoped.** Coverage must be stated against a declared source universe and time boundary rather than asserted globally.
6. **Unknowns are data.** `unknown`, `not_available`, `not_applicable`, `insufficient_evidence`, `ambiguous` and `review_required` must not collapse into null/zero or silent exclusion.
7. **Migration is additive and reconciled.** Backfill, dual-write where necessary, reconcile, switch reads, freeze legacy writes, then retire only after equivalence proof.
8. **Structural and operational drift are separated.** Table/module/layer ownership belongs in the versioned architecture baseline; routine data-file counts and bytes are operational metrics.

## Findings and actions

### IR-01 — HIGH — schema-to-migration drift was visible but initially re-baselineable

The first inventory correctly discovered `conversations` and `messages` outside the versioned migration chain. PR #1054 closed that fresh-database gap. However, if schema-to-migration drift remained only a field in `current-data-inventory.json`, a future developer could add an unmigrated table and simply accept a new non-empty baseline.

**Required invariant:** after #1054, `schemaTablesNotCreatedInVersionedMigrations` must remain empty. CI must fail before baseline comparison when it becomes non-empty.

**Hardening:** implemented in the architecture gate with a negative test.

### IR-02 — HIGH — scanner coverage depended on a narrow source-code syntax

The initial scanner recognized literal `pgTable("name", ...)` declarations and exact `export * from "./module";` statements. A future `pgSchema`, `pgTableCreator`, alias import, dynamic table name or unexported schema file could therefore make the inventory incomplete without necessarily failing ownership validation.

**Required invariant:** unsupported schema-construction styles fail closed until the scanner explicitly supports them; schema files and exports reconcile in both directions.

**Hardening:** direct schema-file discovery, unsupported-construction detection, export reconciliation and tests.

### IR-03 — HIGH — registry values were recorded but not semantically validated

The registry enumerates allowed namespaces/statuses and migration phases, but the first gate mainly checked module/table ownership. A typo such as an invented namespace or nonexistent phase could therefore be structurally registered while still being semantically invalid.

**Required invariant:** unique modules/layers, allowed namespace/status, valid phase references, required notes/context and valid migration-plan references.

**Hardening:** registry and migration-plan semantic validators, including cycle and unknown-module checks.

### IR-04 — HIGH — push-bootstrap baseline could overstate migration state

`isSchemaBootstrapped()` uses the presence of the original `categories` table to identify a database created by the former `drizzle-kit push` workflow. The previous path could then record the complete *current* migration journal as applied. Existing disposable-Postgres tests proved this is safe for `pushSchema(currentSchema)`, but did not prove it for an older or partial push schema.

This is an epistemic error: **one old table proves that a schema exists; it does not prove that every later migration is represented.**

**Required invariant:** before a push database is baselined, all application tables created by the current migration chain must already exist after only explicitly bounded additive compatibility repairs. If a migration-created table is missing, baseline must abort and migration tracking must remain untouched.

**Hardening:** migration-chain table-presence proof before baseline plus disposable-Postgres negative coverage.

**Residual limitation:** table presence is a structural floor, not a proof that every column/index/constraint introduced historically is identical. Known compatibility-sensitive structures require explicit verifiers, and a future universal schema fingerprint should supersede ad hoc checks.

### IR-05 — HIGH — `CREATE TABLE IF NOT EXISTS` did not prove legacy table equivalence

PR #1054 correctly made fresh databases reproduce `conversations` and `messages`, but an already-existing table with the same name would make `CREATE TABLE IF NOT EXISTS` a no-op. It could still have missing columns, wrong nullability/defaults, or a wrong FK deletion rule.

**Required invariant:** legacy copies are introspected and compared fail-closed against the expected current physical contract before a migration baseline is recorded.

**Hardening:** explicit column/PK/FK verifier for `conversations/messages`, including `ON DELETE CASCADE`, with pure tests and disposable-Postgres negative coverage.

### IR-06 — MEDIUM/HIGH — migration error semantics conflated atomic DDL with post-flight repair

The prior `runMigrations()` wrapped both Drizzle `migrate()` and a later compatibility repair in the same `MigrationError`. If the post-flight repair failed *after* Drizzle committed, the error could incorrectly state that all pending migrations rolled back atomically.

**Required invariant:** only the Drizzle migration transaction may produce an atomic-rollback `MigrationError`. Post-migration compatibility failures must explicitly state that migrations may already be committed and block startup under a distinct error type.

**Hardening:** separate `SchemaCompatibilityError` and narrowed migration catch.

### IR-07 — HIGH — Phase 2 identity semantics risked collapsing Entity and Event

The contract correctly states that `Entity` and `Event` are distinct primitives, but the original Phase 2 shorthand `core.entities` could be interpreted as the universal address space for everything. That either excludes events from cross-domain global identity or semantically mislabels events as entities.

**Required design:** introduce an identity spine such as:

```text
canonical_subjects
  subject_id UUIDv7 PK
  subject_kind = entity | event
  domain_type

legacy_subject_map
  legacy_namespace
  legacy_type
  legacy_id
  subject_id
  resolution_method
  resolution_status
```

Typed domain tables remain authoritative for what an entity or event *is*. The subject spine exists only for global addressability, cross-domain relations and migration mapping. It is not an EAV store and does not erase the Entity/Event distinction.

**Phase 2 gate:** no canonical-identity migration should merge until this distinction is normative in the migration plan/contract.

### IR-08 — MEDIUM — canonical resolution chain must not force every source record into an entity/event

A provenance chain that visually ends in `canonical entity or event` can be misread as requiring resolution even where the evidence does not justify one.

**Required outcomes:** every source record/assertion gets an explicit resolution result, which may be `resolved`, `unresolved`, `not_applicable`, `no_canonical_target`, `insufficient_evidence` or `review_required`. Preservation and classification do not depend on successful entity resolution.

### IR-09 — MEDIUM — phase numbers are identifiers, not chronological promises

For example, procurement Phase 8 depends on party Phase 10. Execution order is therefore defined by prerequisites, not numeric order. Documentation and automation must use the dependency graph rather than assuming `0..22` is a strict sequence.

### IR-10 — LOW/MEDIUM — module-level registry status may eventually be too coarse

Some modules contain tables with different long-term roles. `redazione` is a likely example: editorial configuration remains bounded application state, while civic override provenance converges on a universal ledger. Table-level overrides should be introduced only where a real mixed-ownership case appears; the current module-level registry is sufficient for the foundation.

## Acceptance gates before Phase 2

Phase 2 may start only when the hardening PR demonstrates all of the following on one head commit:

- architecture inventory current and deterministic;
- zero schema-to-migration gaps;
- schema files/exports and registry ownership reconcile;
- unsupported Drizzle constructs fail closed;
- registry/migration-plan/journal semantic validation passes;
- fresh migration path remains green;
- current push-bootstrap path remains green;
- deliberately stale push-bootstrap path fails before baseline tracking is written;
- deliberately malformed legacy conversation schema fails before baseline;
- migration and post-commit compatibility errors are semantically distinct;
- canonical identity is defined as a subject/addressability spine preserving typed Entity/Event semantics.

## Residual risks intentionally deferred

- Full database schema fingerprinting (all historical columns, indexes, constraints and extensions) should replace incremental legacy verifiers if long-lived push-era databases remain operational.
- PostgreSQL named schemas (`core`, `source`, `taxonomy`, etc.) remain a logical-model question; the present repository does not require a physical-schema migration merely for naming aesthetics.
- PostGIS remains an explicit decision gate for the future shared geography layer.
- Completeness of civic content is a source-coverage problem and cannot be certified merely by schema completeness.

## Review conclusion

The foundation is worth keeping. The independent review does **not** recommend a rollback to domain-specific pipelines; it recommends making the new universal rules as strict in executable code as they already are in the conceptual design. After these hardening gates are green, the architecture is ready for an additive canonical-identity tranche without changing current public behavior.
