# Canonical public Albo and municipal PNRR edition

Delivery scope: #1655. This closes the public-read pilot for the three registered
municipal snapshots. It does not complete universal migration phases 17–19,
replace the national PNRR census, certify historical completeness, or make old
acquisition dates current.

## Single publication boundary

`lib/db/src/canonicalPublicSnapshot.ts` reads a repeatable-read, read-only
transaction. One SQL statement selects the latest successful releases, source
bytes and records, typed Albo/project rows and their evidence. It reconstructs
the existing reconciliation plans and requires matching canonical values,
selected field assertions, resolution outcomes, taxonomy classifications and
source coverage before selecting public fields. A failed proof produces no
partial edition and no database writes.

| Public content | Canonical authority | Public addressing |
| --- | --- | --- |
| Albo current/archive record | Publication version linked to its source record; separate publication, act and document identities | Existing stable `albo-*` public ID; distinct canonical publication UUIDv7 |
| Municipal PNRR sheet | Typed project, CUP identifier and current selected field evidence | Existing CUP route; distinct canonical project UUIDv7 |
| CUP qualification | Original source assertion and record, including earlier releases | `source_reported_format_checked`; no inference of external registry certification |
| PNRR Albo evidence | Registered PNRR evidence plus an authorised current/archive public Albo record | Existing public Albo ID |
| Presentation and OpenCUP corredo | Explicit allowlist over reconciled source evidence | Source labels, hashes and original acquisition dates remain visible |

The response includes schema and policy versions, all three source release IDs,
byte hashes, origin commits/paths, a reconciliation ledger and a deterministic
SHA-256 of canonical JSON `{albo, alboArchive, pnrr}`. Hashing orders object keys,
preserves array order and hashes UTF-8. It proves edition integrity; the server's
typed-value/evidence reconciliation proves canonical correspondence.

## Public policy and accounted differences

Only `publishable` and already minimised `metadata_only` Albo versions are
exported. Metadata-only rows expose no office, act type, document URL or archived
document. `publishable_with_minimisation`, excluded and unresolved source rows
remain internal. Unknown properties are discarded recursively. Raw artifact
bytes, source payloads and excluded record identifiers are never returned.

The initial verified production edition contains 219 Albo source records:
125 public current rows, 66 public archive rows, and 28 withheld source-version
rows. Of those 28, 26 were present in the preceding source-level public outputs
with minimisation; two were already excluded. These are record versions, not
28 distinct acts. Every retained allowlisted Albo value is checked against its
source representation. Thirty municipal projects retain their typed fields,
286 attachments and qualified CUP identities. Eleven Albo evidence rows are
public; one has no authorised canonical Albo record in these scoped editions
and remains in the source registry. The ledger reports zero unexplained
differences. `source_counts`/`source_coverage` preserve acquisition totals;
public counts describe the exported selection.

## Delivery and refresh

- Render serves `GET /api/public/v1/civic-snapshot` from the canonical reader.
  `X-Civic-Projection-Origin: canonical-database` identifies that transport.
  A failed proof returns safe JSON HTTP 503. The public OpenAPI discovery links
  the versioned JSON schema under `/semantic/civic-public-projection.schema.json`.
- The direct operator exporter is `pnpm --filter @workspace/db run
  export:public-civic ../../data/public/canonical/civic-snapshot.json` with
  `DATABASE_URL` supplied by the runtime. No credentials enter the export.
- `database-source-sync.yml` first verifies Render's source reconciliation
  against the current repository commit, then downloads that exact canonical
  public projection, validates its digest and matches all three current source
  byte hashes. It regenerates public support data and the architecture inventory
  and proposes a bounded PR through the existing checked refresh mechanism.
  One pending civic proposal is allowed; no direct main write is used.
- Vite validates and serializes the committed edition. The compatibility PNRR
  download and `/data/public/canonical/pnrr.json` contain the same public body.
  The Cloudflare worker validates and exposes the committed complete edition
  at the same public API path, marked `published-snapshot`.
- Albo, Delibere and PNRR choose one complete validated runtime edition or the
  complete retained edition. They do not merge legacy API rows or field values.
  Home uses the retained edition. Acquired dates are never rewritten as deployment
  dates, and neither transport is labelled as current acquisition.

`canonicalAlboSupport.json` is generated operational support bound to the edition
body hash. It carries only authorised IDs for acquisition deltas and preservation
metadata checked against authorised canonical document URLs and exact PDF bytes. A delta from a different
acquisition is omitted; removed-record descriptions and historical before-values
are omitted. It is not a second store of civic titles or semantic authority.

## Verification

PGlite executes all versioned PostgreSQL migrations and real registered source
imports. Tests prove repeatable reads without writes, selected-field and taxonomy
parity, historical CUP evidence after a new release, and rejection of corrupt
bytes, missing records/links, modified typed fields and invalid identifier
evidence. Browser tests verify complete-edition replacement and retained fallback
for HTTP failures, invalid digests and disallowed visibility. The static smoke
executes the emitted worker's GET/HEAD/write-rejection/corrupt-export cases and
checks existing route and bundle budgets. Build validation is database-free;
only the exporter/server prove database correspondence.

Legacy API endpoints and downstream procurement entity resolution remain for
their existing consumers. The archive follows the retained source's observation
range; this pilot does not reconstruct missing historical publications or close
the separate universal migration/freshness work.
