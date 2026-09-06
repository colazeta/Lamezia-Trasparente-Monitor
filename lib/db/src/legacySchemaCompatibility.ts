import type { QueryClient } from "./baselineLogic";

export interface LegacyColumnSnapshot {
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: "YES" | "NO";
  columnDefault: string | null;
}

export interface LegacyConstraintSnapshot {
  tableName: string;
  constraintType: string;
  columnName: string | null;
  foreignTableName: string | null;
  foreignColumnName: string | null;
  deleteRule: string | null;
}

const EXPECTED_COLUMNS = new Map<string, {
  dataType: string;
  nullable: "YES" | "NO";
  defaultKind: "none" | "serial" | "now";
}>([
  ["conversations.id", { dataType: "integer", nullable: "NO", defaultKind: "serial" }],
  ["conversations.title", { dataType: "text", nullable: "NO", defaultKind: "none" }],
  ["conversations.created_at", { dataType: "timestamp with time zone", nullable: "NO", defaultKind: "now" }],
  ["messages.id", { dataType: "integer", nullable: "NO", defaultKind: "serial" }],
  ["messages.conversation_id", { dataType: "integer", nullable: "NO", defaultKind: "none" }],
  ["messages.role", { dataType: "text", nullable: "NO", defaultKind: "none" }],
  ["messages.content", { dataType: "text", nullable: "NO", defaultKind: "none" }],
  ["messages.created_at", { dataType: "timestamp with time zone", nullable: "NO", defaultKind: "now" }],
]);

function defaultMatches(kind: "none" | "serial" | "now", value: string | null): boolean {
  if (kind === "none") return value === null;
  if (kind === "serial") return typeof value === "string" && /nextval\(/iu.test(value);
  return typeof value === "string" && /(?:now\(\)|CURRENT_TIMESTAMP)/iu.test(value);
}

export function validateLegacyConversationSchemaSnapshot(
  columns: ReadonlyArray<LegacyColumnSnapshot>,
  constraints: ReadonlyArray<LegacyConstraintSnapshot>,
): string[] {
  const problems: string[] = [];
  const actualKeys = columns.map((column) => `${column.tableName}.${column.columnName}`).sort();
  const expectedKeys = [...EXPECTED_COLUMNS.keys()].sort();

  for (const key of expectedKeys.filter((candidate) => !actualKeys.includes(candidate))) {
    problems.push(`missing column ${key}`);
  }
  for (const key of actualKeys.filter((candidate) => !expectedKeys.includes(candidate))) {
    problems.push(`unexpected column ${key}`);
  }

  for (const column of columns) {
    const key = `${column.tableName}.${column.columnName}`;
    const expected = EXPECTED_COLUMNS.get(key);
    if (!expected) continue;
    if (column.dataType !== expected.dataType) {
      problems.push(`${key} has type ${column.dataType}, expected ${expected.dataType}`);
    }
    if (column.isNullable !== expected.nullable) {
      problems.push(`${key} has nullable=${column.isNullable}, expected ${expected.nullable}`);
    }
    if (!defaultMatches(expected.defaultKind, column.columnDefault)) {
      problems.push(`${key} has incompatible default ${String(column.columnDefault)}`);
    }
  }

  const hasPrimaryKey = (tableName: string) => constraints.some(
    (constraint) => constraint.tableName === tableName &&
      constraint.constraintType === "PRIMARY KEY" &&
      constraint.columnName === "id",
  );
  if (!hasPrimaryKey("conversations")) problems.push("conversations.id primary key is missing");
  if (!hasPrimaryKey("messages")) problems.push("messages.id primary key is missing");

  const hasExpectedForeignKey = constraints.some(
    (constraint) => constraint.tableName === "messages" &&
      constraint.constraintType === "FOREIGN KEY" &&
      constraint.columnName === "conversation_id" &&
      constraint.foreignTableName === "conversations" &&
      constraint.foreignColumnName === "id" &&
      constraint.deleteRule === "CASCADE",
  );
  if (!hasExpectedForeignKey) {
    problems.push("messages.conversation_id -> conversations.id ON DELETE CASCADE foreign key is missing");
  }

  return [...new Set(problems)].sort();
}

export class LegacySchemaCompatibilityError extends Error {
  constructor(readonly problems: string[]) {
    super(`Legacy schema compatibility verification failed: ${problems.join("; ")}`);
    this.name = "LegacySchemaCompatibilityError";
  }
}

export async function ensureLegacyConversationTables(client: QueryClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "conversations" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" text NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" serial PRIMARY KEY NOT NULL,
      "conversation_id" integer NOT NULL,
      "role" text NOT NULL,
      "content" text NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "messages_conversation_id_conversations_id_fk"
        FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id")
        ON DELETE cascade
    );
  `);
}

export async function verifyLegacyConversationTables(client: QueryClient): Promise<void> {
  const columnsResult = await client.query(`
    SELECT
      table_name AS "tableName",
      column_name AS "columnName",
      data_type AS "dataType",
      is_nullable AS "isNullable",
      column_default AS "columnDefault"
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('conversations', 'messages')
    ORDER BY table_name, ordinal_position;
  `);

  const constraintsResult = await client.query(`
    SELECT
      tc.table_name AS "tableName",
      tc.constraint_type AS "constraintType",
      kcu.column_name AS "columnName",
      ccu.table_name AS "foreignTableName",
      ccu.column_name AS "foreignColumnName",
      rc.delete_rule AS "deleteRule"
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_catalog = kcu.constraint_catalog
     AND tc.constraint_schema = kcu.constraint_schema
     AND tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_catalog = ccu.constraint_catalog
     AND tc.constraint_schema = ccu.constraint_schema
     AND tc.constraint_name = ccu.constraint_name
    LEFT JOIN information_schema.referential_constraints rc
      ON tc.constraint_catalog = rc.constraint_catalog
     AND tc.constraint_schema = rc.constraint_schema
     AND tc.constraint_name = rc.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name IN ('conversations', 'messages')
      AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY');
  `);

  const columns = columnsResult.rows as unknown as LegacyColumnSnapshot[];
  const constraints = constraintsResult.rows as unknown as LegacyConstraintSnapshot[];
  const problems = validateLegacyConversationSchemaSnapshot(columns, constraints);
  if (problems.length) throw new LegacySchemaCompatibilityError(problems);
}
