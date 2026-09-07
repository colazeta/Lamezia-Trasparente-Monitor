import { is } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import type { Pool, PoolClient } from "pg";
import * as schema from "./schema";

export class InspectionInputError extends Error {}

export type InspectionColumn = {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  ordinal: number;
  primaryKey: boolean;
  redacted: boolean;
};
export type InspectionRelation = {
  name: string;
  columns: string[];
  targetSchema: string;
  targetTable: string;
  targetColumns: string[];
  definition: string;
  validated: boolean;
};
export type InspectionTable = {
  name: string;
  schema: string;
  estimatedRows: number | null;
  bytes: number;
  rls: boolean;
  registered: boolean;
  columns: InspectionColumn[];
  relations: InspectionRelation[];
  indexes: { name: string; definition: string; valid: boolean }[];
  constraints: {
    name: string;
    type: string;
    definition: string;
    validated: boolean;
  }[];
  issues: string[];
};
export type InspectionCatalog = {
  capturedAt: string;
  database: string;
  version: string;
  bytes: number;
  migrationCount: number | null;
  tables: InspectionTable[];
  missingTables: string[];
};
export type InspectionRow = {
  values: Record<string, string | null>;
  truncated: string[];
};
export type InspectionPage = {
  table: string;
  capturedAt: string;
  rows: InspectionRow[];
  total: number;
  page: number;
  pageSize: number;
};

const registered = new Map(
  Object.values(schema)
    .filter((value) => is(value, PgTable))
    .map((table) => {
      const config = getTableConfig(table);
      return [config.name, config] as const;
    }),
);

export function quoteInspectionIdentifier(value: string): string {
  if (!/^[a-z_][a-z0-9_]*$/.test(value))
    throw new InspectionInputError("Identificatore non valido");
  return `"${value}"`;
}
export function isCredentialColumn(name: string): boolean {
  return /password|secret|token|credential|api_key|private_key/i.test(name);
}

/** No connection is ever handed back to the pool with an open transaction. */
export async function withInspectionTransaction<T>(
  pool: Pick<Pool, "connect">,
  read: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    await client.query("SET LOCAL statement_timeout = '3000ms'");
    await client.query("SET LOCAL lock_timeout = '500ms'");
    await client.query(
      "SET LOCAL idle_in_transaction_session_timeout = '10000ms'",
    );
    await client.query("SET LOCAL search_path = pg_catalog");
    const result = await read(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      discard = true;
    }
    throw error;
  } finally {
    client.release(discard);
  }
}

export async function readInspectionCatalog(
  client: Pick<PoolClient, "query">,
): Promise<InspectionCatalog> {
  const meta = (
    await client.query(`SELECT current_database() AS database, current_setting('server_version') AS version,
    pg_database_size(current_database())::float8 AS bytes, transaction_timestamp() AS captured_at,
    to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS has_migrations`)
  ).rows[0];
  const tables = (
    await client.query(`SELECT c.relname AS name, n.nspname AS schema,
    CASE WHEN c.reltuples < 0 THEN NULL ELSE c.reltuples::float8 END AS "estimatedRows",
    pg_total_relation_size(c.oid)::float8 AS bytes, c.relrowsecurity AS rls
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.relname`)
  ).rows;
  const columns = (
    await client.query(`SELECT c.relname AS table_name, a.attname AS name,
    format_type(a.atttypid,a.atttypmod) AS type, NOT a.attnotnull AS nullable,
    pg_get_expr(d.adbin,d.adrelid) AS default, a.attnum AS ordinal,
    EXISTS(SELECT 1 FROM pg_constraint k WHERE k.conrelid=c.oid AND k.contype='p' AND a.attnum=ANY(k.conkey)) AS "primaryKey"
    FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum
    WHERE n.nspname='public' AND c.relkind IN ('r','p') AND a.attnum>0 AND NOT a.attisdropped
    ORDER BY c.relname,a.attnum`)
  ).rows;
  // Cast catalog identifiers to text before aggregation: pg does not decode
  // name[] (OID 1003), whereas text[] becomes the JSON arrays used by the UI.
  const constraints = (
    await client.query(`SELECT c.relname AS table_name, k.conname AS name, k.contype AS type,
    pg_get_constraintdef(k.oid) AS definition, k.convalidated AS validated,
    ARRAY(SELECT a.attname::text FROM unnest(k.conkey) WITH ORDINALITY u(id,ord)
      JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=u.id ORDER BY u.ord) AS columns,
    fn.nspname AS "targetSchema", fc.relname AS "targetTable",
    ARRAY(SELECT a.attname::text FROM unnest(k.confkey) WITH ORDINALITY u(id,ord)
      JOIN pg_attribute a ON a.attrelid=fc.oid AND a.attnum=u.id ORDER BY u.ord) AS "targetColumns"
    FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    LEFT JOIN pg_class fc ON fc.oid=k.confrelid LEFT JOIN pg_namespace fn ON fn.oid=fc.relnamespace
    WHERE n.nspname='public' ORDER BY c.relname,k.conname`)
  ).rows;
  const indexes = (
    await client.query(`SELECT t.relname AS table_name,i.relname AS name,
    pg_get_indexdef(i.oid) AS definition,x.indisvalid AS valid
    FROM pg_index x JOIN pg_class i ON i.oid=x.indexrelid JOIN pg_class t ON t.oid=x.indrelid
    JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' ORDER BY t.relname,i.relname`)
  ).rows;
  const migrationCount = meta.has_migrations
    ? Number(
        (
          await client.query(
            "SELECT count(*) AS count FROM drizzle.__drizzle_migrations",
          )
        ).rows[0].count,
      )
    : null;
  return {
    capturedAt: new Date(meta.captured_at).toISOString(),
    database: meta.database,
    version: meta.version,
    bytes: meta.bytes,
    migrationCount,
    missingTables: [...registered.keys()].filter(
      (name) => !tables.some((table) => table.name === name),
    ),
    tables: tables.map((table) => {
      const actualColumns = columns
        .filter((column) => column.table_name === table.name)
        .map(({ table_name: _, ...column }) => ({
          ...column,
          redacted: isCredentialColumn(column.name),
        })) as InspectionColumn[];
      const expected = registered.get(table.name);
      const issues = !expected
        ? ["Tabella non registrata: consultazione disabilitata"]
        : [];
      for (const column of expected?.columns ?? []) {
        const actual = actualColumns.find((item) => item.name === column.name);
        if (!actual) issues.push(`Colonna prevista assente: ${column.name}`);
        else if (actual.nullable === column.notNull)
          issues.push(`Nullabilità diversa dallo schema: ${column.name}`);
      }
      for (const column of actualColumns) {
        if (
          expected &&
          !expected.columns.some((item) => item.name === column.name)
        )
          issues.push(`Colonna non prevista: ${column.name}`);
      }
      return {
        ...table,
        registered: Boolean(expected),
        columns: actualColumns,
        issues,
        constraints: constraints.filter(
          (item) => item.table_name === table.name,
        ),
        relations: constraints.filter(
          (item) => item.table_name === table.name && item.type === "f",
        ),
        indexes: indexes.filter((item) => item.table_name === table.name),
      } as InspectionTable;
    }),
  };
}

export function inspectionTable(
  catalog: InspectionCatalog,
  name: string,
): InspectionTable {
  const table = catalog.tables.find(
    (item) => item.name === name && item.schema === "public" && item.registered,
  );
  if (!table || !registered.has(name))
    throw new InspectionInputError("Tabella non disponibile");
  return table;
}

export type InspectionReadOptions = {
  page?: number;
  pageSize?: number;
  column?: string;
  value?: string;
  match?: "contains" | "equals";
  sort?: string;
  direction?: "asc" | "desc";
  key?: Record<string, string>;
};

/** SQL names originate in the registry/catalog; request values remain parameters. */
export function buildInspectionRead(
  table: InspectionTable,
  options: InspectionReadOptions = {},
) {
  if (!registered.has(table.name) || table.schema !== "public")
    throw new InspectionInputError("Tabella non disponibile");
  const page = options.page ?? 1,
    pageSize = options.pageSize ?? 50;
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 1000 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  )
    throw new InspectionInputError("Pagina o dimensione non valida");
  if (options.direction && !["asc", "desc"].includes(options.direction))
    throw new InspectionInputError("Ordinamento non valido");
  if (options.match && !["contains", "equals"].includes(options.match))
    throw new InspectionInputError("Filtro non valido");
  const readable = table.columns.filter((column) => !column.redacted);
  const primary = readable
    .filter((column) => column.primaryKey)
    .map((column) => column.name);
  if (!primary.length)
    throw new InspectionInputError(
      "Chiave primaria assente: lettura stabile non disponibile",
    );
  const columnByName = (name: string) => {
    if (!readable.some((column) => column.name === name))
      throw new InspectionInputError("Colonna non disponibile");
    return quoteInspectionIdentifier(name);
  };
  const values: unknown[] = [],
    predicates: string[] = [];
  if (options.key) {
    if (
      Object.keys(options.key).length !== primary.length ||
      !primary.every(
        (key) =>
          typeof options.key?.[key] === "string" &&
          options.key[key].length <= 512,
      )
    )
      throw new InspectionInputError("Chiave primaria non valida");
    for (const key of primary) {
      values.push(options.key[key]);
      predicates.push(`${columnByName(key)} = $${values.length}`);
    }
  } else if (options.column) {
    const column = columnByName(options.column);
    if (typeof options.value !== "string" || options.value.length > 200)
      throw new InspectionInputError("Valore del filtro non valido");
    values.push(
      options.match === "equals"
        ? options.value
        : `%${options.value.replace(/[\\%_]/g, "\\$&")}%`,
    );
    predicates.push(
      options.match === "equals"
        ? `${column} = $1`
        : `${column}::text ILIKE $1 ESCAPE '\\'`,
    );
  } else if (options.value)
    throw new InspectionInputError("Selezionare la colonna da cercare");
  const where = predicates.length ? ` WHERE ${predicates.join(" AND ")}` : "";
  const order = [...new Set([options.sort ?? primary[0], ...primary])]
    .map(
      (name) =>
        `${columnByName(name)} ${options.direction === "desc" ? "DESC" : "ASC"} NULLS LAST`,
    )
    .join(", ");
  const cellLimit = options.key ? 65536 : 2048;
  const projection = table.columns
    .map((column) =>
      column.redacted
        ? `'[oscurato]'::text AS ${quoteInspectionIdentifier(column.name)}`
        : `left(${quoteInspectionIdentifier(column.name)}::text, ${cellLimit + 1}) AS ${quoteInspectionIdentifier(column.name)}`,
    )
    .join(", ");
  const from = `public.${quoteInspectionIdentifier(table.name)}`;
  const count = {
    text: `SELECT count(*)::float8 AS count FROM ${from}${where}`,
    values: [...values],
  };
  values.push(
    options.key ? 1 : pageSize,
    options.key ? 0 : (page - 1) * pageSize,
  );
  return {
    text: `SELECT ${projection} FROM ${from}${where} ORDER BY ${order} LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
    count,
    page: options.key ? 1 : page,
    pageSize: options.key ? 1 : pageSize,
    cellLimit,
  };
}

export async function readInspectionRows(
  client: Pick<PoolClient, "query">,
  table: InspectionTable,
  options: InspectionReadOptions,
): Promise<InspectionPage> {
  const read = buildInspectionRead(table, options);
  const total = Number(
    (await client.query(read.count.text, read.count.values)).rows[0].count,
  );
  const result = await client.query(read.text, read.values);
  return {
    table: table.name,
    capturedAt: new Date().toISOString(),
    page: read.page,
    pageSize: read.pageSize,
    total,
    rows: result.rows.map((record) => {
      const truncated: string[] = [],
        values: Record<string, string | null> = {};
      for (const [key, value] of Object.entries(record)) {
        if (typeof value === "string" && value.length > read.cellLimit)
          truncated.push(key);
        values[key] =
          typeof value === "string" ? value.slice(0, read.cellLimit) : null;
      }
      return { values, truncated };
    }),
  };
}
