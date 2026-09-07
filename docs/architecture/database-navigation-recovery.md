# Database console navigation repair

Issue #1112 records the specification before implementation; follows #1106.

## Cause and evidence

The owner reported a blank dark screen after selecting a table. The catalog SQL
aggregated `pg_attribute.attname`, whose PostgreSQL type is `name`, into `name[]`.
The installed `pg` driver leaves OID 1003 as a string (`{id}`), while the declared
API contract requires arrays. The table component calls `relation.columns.join`
while constructing its children, even before the relationships tab is selected.
That exception unmounted the interface because no local error boundary existed.

A read-only production catalog query confirmed `name[]` for the original
projection and `text[]` for the corrected projection, across 61 foreign keys.
The new API regression test fails on the original SQL (`{id}` versus `["id"]`)
and passes with the correction, using the installed driver's type parser.

## Repair

Cast source and target column identifiers to `text` inside the ordered catalog
arrays. PostgreSQL still preserves composite-key ordering and identifier content;
the driver decodes both arrays without manual string splitting. No schema or
record mutation is needed.

Wrap each selected table pane in a keyed rendering error boundary. A failed pane
shows a recovery message and a button back to the catalog while preserving the
toolbar, logout and table selector. Selecting another table resets the boundary.
No error payload, record content or credentials are added to telemetry.

## Verification and limits

Tests cover API array serialisation, owner access boundaries, populated table
navigation, record details, structure and relationship tabs, related-table
navigation, and recovery from the original malformed relationship shape.
Previous fixtures had no foreign keys and did not exercise this failure.

The browser inspection session has no owner login, so it can verify only the
sign-in boundary. The owner's authenticated browser remains the final live
interaction check. Required repository CI and deployment checks are recorded in
the linked PR. Authentication, redaction, read-only transactions, source data and
legal/methodological safeguards are unchanged.
