import assert from "node:assert/strict";
import test from "node:test";

import {
  LegacySchemaCompatibilityError,
  validateLegacyConversationSchemaSnapshot,
  verifyLegacyConversationTables,
  type LegacyColumnSnapshot,
  type LegacyConstraintSnapshot,
} from "./legacySchemaCompatibility";

const columns: LegacyColumnSnapshot[] = [
  { tableName: "conversations", columnName: "id", dataType: "integer", isNullable: "NO", columnDefault: "nextval('conversations_id_seq'::regclass)" },
  { tableName: "conversations", columnName: "title", dataType: "text", isNullable: "NO", columnDefault: null },
  { tableName: "conversations", columnName: "created_at", dataType: "timestamp with time zone", isNullable: "NO", columnDefault: "now()" },
  { tableName: "messages", columnName: "id", dataType: "integer", isNullable: "NO", columnDefault: "nextval('messages_id_seq'::regclass)" },
  { tableName: "messages", columnName: "conversation_id", dataType: "integer", isNullable: "NO", columnDefault: null },
  { tableName: "messages", columnName: "role", dataType: "text", isNullable: "NO", columnDefault: null },
  { tableName: "messages", columnName: "content", dataType: "text", isNullable: "NO", columnDefault: null },
  { tableName: "messages", columnName: "created_at", dataType: "timestamp with time zone", isNullable: "NO", columnDefault: "CURRENT_TIMESTAMP" },
];

const constraints: LegacyConstraintSnapshot[] = [
  { tableName: "conversations", constraintType: "PRIMARY KEY", columnName: "id", foreignTableName: "conversations", foreignColumnName: "id", deleteRule: null },
  { tableName: "messages", constraintType: "PRIMARY KEY", columnName: "id", foreignTableName: "messages", foreignColumnName: "id", deleteRule: null },
  { tableName: "messages", constraintType: "FOREIGN KEY", columnName: "conversation_id", foreignTableName: "conversations", foreignColumnName: "id", deleteRule: "CASCADE" },
];

test("legacy conversation schema accepts the exact current physical contract", () => {
  assert.deepEqual(validateLegacyConversationSchemaSnapshot(columns, constraints), []);
});

test("legacy conversation schema rejects missing, extra and incompatible columns", () => {
  const broken = columns
    .filter((column) => column.columnName !== "content")
    .map((column) => column.columnName === "role" ? { ...column, isNullable: "YES" as const } : column);
  broken.push({ tableName: "messages", columnName: "legacy_extra", dataType: "text", isNullable: "YES", columnDefault: null });
  const problems = validateLegacyConversationSchemaSnapshot(broken, constraints);
  assert.ok(problems.includes("missing column messages.content"));
  assert.ok(problems.includes("unexpected column messages.legacy_extra"));
  assert.ok(problems.some((problem) => problem.includes("messages.role has nullable=YES")));
});

test("legacy conversation schema requires the cascade foreign key", () => {
  const problems = validateLegacyConversationSchemaSnapshot(
    columns,
    constraints.map((constraint) => constraint.constraintType === "FOREIGN KEY" ? { ...constraint, deleteRule: "NO ACTION" } : constraint),
  );
  assert.ok(problems.some((problem) => problem.includes("ON DELETE CASCADE")));
});

test("runtime verifier throws a typed compatibility error when introspection disagrees", async () => {
  let call = 0;
  const fakeClient = {
    async query() {
      call += 1;
      return call === 1
        ? { rows: columns.filter((column) => column.columnName !== "content") as unknown as Array<Record<string, unknown>> }
        : { rows: constraints as unknown as Array<Record<string, unknown>> };
    },
  };
  await assert.rejects(
    () => verifyLegacyConversationTables(fakeClient),
    (error: unknown) => error instanceof LegacySchemaCompatibilityError && error.problems.includes("missing column messages.content"),
  );
});
