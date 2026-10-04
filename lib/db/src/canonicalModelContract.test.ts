import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { PgTable, type AnyPgColumn } from "drizzle-orm/pg-core";
import * as schema from "./schema";

const model = JSON.parse(
  await readFile(
    new URL(
      "../../../architecture/data-domain-registry.v1.json",
      import.meta.url,
    ),
    "utf8",
  ),
).conceptualCatalog;
const tables = Object.values(schema).filter((value) => is(value, PgTable));

test("the semantic model owns every actual runtime table at the same grain", () => {
  assert.deepEqual(
    tables.map(getTableName).sort(),
    Object.keys(model.tables).sort(),
  );
  for (const table of tables) {
    const binding = model.tables[getTableName(table)];
    const concept = model.concepts.find(
      (c: { id: string }) => c.id === binding.concept,
    );
    assert.ok(concept, `unmapped runtime table ${getTableName(table)}`);
    assert.ok(binding.grain);
    assert.equal(
      Boolean(concept.rdfClass),
      concept.semanticCoverage !== "outside",
    );
  }
});

test("RDF qualified identities agree with the actual database subject kind and domain", () => {
  let qualified = 0;
  for (const table of tables) {
    const concept = model.concepts.find(
      (c: { id: string }) => c.id === model.tables[getTableName(table)].concept,
    );
    const policy = concept.rdfValidation;
    const columns: Record<string, AnyPgColumn> = getTableColumns(table);
    // Compatibility/source tables can own the same concept without being its canonical identity.
    if (!columns.subjectKind || !columns.domainType || !policy?.subjectKind)
      continue;
    assert.equal(
      columns.subjectKind.default,
      policy.subjectKind,
      getTableName(table),
    );
    assert.equal(
      columns.domainType.default,
      policy.domainType,
      getTableName(table),
    );
    assert.equal(columns.id.columnType, "PgUUID", getTableName(table));
    assert.equal(columns.id.primary, true, getTableName(table));
    qualified++;
  }
  assert.equal(qualified, 7);
});
