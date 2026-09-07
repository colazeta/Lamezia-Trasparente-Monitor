import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import { is } from "drizzle-orm";
import { PgTable, getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import {
  quoteInspectionIdentifier,
  readInspectionCatalog,
  withInspectionTransaction,
} from "./inspection";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const outputArg = process.argv.indexOf("--output");
if (
  !process.env.DATABASE_URL ||
  outputArg === -1 ||
  !process.argv[outputArg + 1]
) {
  throw new Error(
    "DATABASE_URL and --output <audit.json> are required; use a read-only database role where available.",
  );
}
const output = path.resolve(process.argv[outputArg + 1]);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 10000,
});
const normaliseType = (value: string) =>
  value
    .toLowerCase()
    .replace(/\bserial\b/g, "integer")
    .replace(/\bbigserial\b/g, "bigint")
    .replace(/\bvarchar\b/g, "character varying")
    .replace(/^timestamp$/, "timestamp without time zone")
    .replace(/\s+/g, "");

try {
  const audit = await withInspectionTransaction(pool, async (client) => {
    const catalog = await readInspectionCatalog(client);
    const counts: { table: string; rows: number }[] = [];
    for (const table of catalog.tables) {
      const result = await client.query(
        `SELECT count(*)::float8 AS count FROM public.${quoteInspectionIdentifier(table.name)}`,
      );
      counts.push({ table: table.name, rows: result.rows[0].count });
    }
    const migrations =
      catalog.migrationCount === null
        ? []
        : (
            await client.query(
              "SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at",
            )
          ).rows;
    const extensions = (
      await client.query(
        "SELECT extname AS name, extversion AS version FROM pg_extension ORDER BY extname",
      )
    ).rows;
    const statistics = (
      await client.query(`SELECT relname AS table, n_live_tup::float8 AS estimated_live, n_dead_tup::float8 AS estimated_dead,
      last_autoanalyze, last_analyze, last_autovacuum, seq_scan::float8 AS sequential_scans, idx_scan::float8 AS index_scans
      FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY relname`)
    ).rows;
    const foreignKeysWithoutIndex = (
      await client.query(`SELECT c.conrelid::regclass::text AS table, c.conname AS constraint,
      pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c
      WHERE c.contype='f' AND c.connamespace='public'::regnamespace AND NOT EXISTS (
        SELECT 1 FROM pg_index i WHERE i.indrelid=c.conrelid AND i.indisvalid AND i.indisready AND i.indpred IS NULL AND i.indexprs IS NULL
        AND c.conkey @> (i.indkey::smallint[])[0:cardinality(c.conkey)-1]
        AND c.conkey <@ (i.indkey::smallint[])[0:cardinality(c.conkey)-1]) ORDER BY 1,2`)
    ).rows;
    const orphans: { table: string; constraint: string; rows: number }[] = [];
    for (const table of catalog.tables)
      for (const relation of table.relations) {
        if (relation.targetSchema !== "public") continue;
        const notNull = relation.columns
          .map((c) => `s.${quoteInspectionIdentifier(c)} IS NOT NULL`)
          .join(" AND ");
        const joins = relation.columns
          .map(
            (c, i) =>
              `s.${quoteInspectionIdentifier(c)} = t.${quoteInspectionIdentifier(relation.targetColumns[i])}`,
          )
          .join(" AND ");
        const result =
          await client.query(`SELECT count(*)::float8 AS count FROM public.${quoteInspectionIdentifier(table.name)} s WHERE ${notNull}
        AND NOT EXISTS(SELECT 1 FROM public.${quoteInspectionIdentifier(relation.targetTable)} t WHERE ${joins})`);
        orphans.push({
          table: table.name,
          constraint: relation.name,
          rows: result.rows[0].count,
        });
      }
    return {
      catalog,
      counts,
      migrations,
      extensions,
      statistics,
      foreignKeysWithoutIndex,
      orphans,
    };
  });
  const journal = JSON.parse(
    await readFile(
      path.join(root, "lib/db/migrations/meta/_journal.json"),
      "utf8",
    ),
  );
  const migrationFiles = await Promise.all(
    journal.entries.map(async (entry: { tag: string; when: number }) => {
      const bytes = await readFile(
        path.join(root, "lib/db/migrations", `${entry.tag}.sql`),
      );
      const hash = createHash("sha256").update(bytes).digest("hex");
      return {
        tag: entry.tag,
        hash,
        recorded: audit.migrations.some(
          (m) => m.hash === hash && Number(m.created_at) === entry.when,
        ),
      };
    }),
  );
  const columnDifferences: {
    table: string;
    column: string;
    expected: string;
    actual: string;
  }[] = [];
  for (const value of Object.values(schema))
    if (is(value, PgTable)) {
      const expected = getTableConfig(value);
      const actual = audit.catalog.tables.find((t) => t.name === expected.name);
      for (const c of expected.columns) {
        const observed = actual?.columns.find((a) => a.name === c.name);
        if (
          observed &&
          normaliseType(c.getSQLType()) !== normaliseType(observed.type)
        ) {
          columnDifferences.push({
            table: expected.name,
            column: c.name,
            expected: c.getSQLType(),
            actual: observed.type,
          });
        }
      }
    }
  const files = [
    ["albo", "data/public/albo/latest.json", "items"],
    ["delibere_archive", "data/public/albo/delibere-archive.json", "items"],
    [
      "pnrr",
      "artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json",
      "projects",
    ],
    [
      "climate",
      "artifacts/lamezia-trasparente/src/data/generated/lameziaClimateDaily.json",
      "daily",
    ],
    [
      "air_traffic",
      "artifacts/lamezia-trasparente/src/data/generated/lameziaAirTrafficMonthly.metadata.json",
      "record_count",
    ],
    ["anac_bdncp", "data/public/contracts/anac-bdncp/latest.json", "records"],
    [
      "anac_authority",
      "data/public/contracts/anac-authority/latest.json",
      "records",
    ],
  ];
  const artifacts = await Promise.all(
    files.map(async ([id, file, field]) => {
      const bytes = await readFile(path.join(root, file));
      const data = JSON.parse(bytes.toString());
      return {
        id,
        file,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        count: Array.isArray(data[field])
          ? data[field].length
          : Number(data[field]),
        countField: field,
        sourceStatus: data.status ?? data.verification_status ?? null,
        generatedAt:
          data.generated_at ??
          data.generatedAt ??
          data.metadata?.generated_at ??
          null,
      };
    }),
  );
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(
    output,
    JSON.stringify(
      {
        schemaVersion: "lt-database-audit.v1",
        repositoryCommit: execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: root,
          encoding: "utf8",
        }).trim(),
        scope:
          "One consistent read-only database snapshot; repository artifact counts are separate universes, not an exhaustive source census. No application record values are exported.",
        ...audit,
        migrationFiles,
        columnDifferences,
        artifacts,
        limitations: [
          "Full constraint/default/index equivalence with a freshly migrated database is not asserted.",
          "Runtime deployment identity, backup restoration and workload latency require separate evidence.",
          "Foreign-key checks cover declared public-schema relationships; semantic links in JSON/text require domain reconciliation.",
        ],
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Audit written: ${output}; ${audit.counts.length} tables; ${audit.counts.filter((c) => c.rows === 0).length} empty.`,
  );
} finally {
  await pool.end();
}
