import type { Pool } from "pg";
import {
  buildCanonicalPnrrPlan,
  type PnrrRegistryRecord,
  type ExistingProjectIdentifier,
  PNRR_RESOLVER_VERSION,
} from "./canonicalPnrrPlan";
import {
  canonicalPnrrRecordsSql,
  canonicalPnrrIdentifiersSql,
  canonicalPnrrStatements,
} from "./canonicalPnrrSql";

export async function reconcileCanonicalPnrr(pool: Pick<Pool, "connect">) {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = '30000ms'");
    await client.query("SET LOCAL lock_timeout = '5000ms'");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtextextended('lt.canonical.pnrr.v1', 0))",
    );
    const records = (
      await client.query<PnrrRegistryRecord>(canonicalPnrrRecordsSql)
    ).rows;
    if (!records.some((r) => r.collection_key === "projects"))
      throw new Error("PNRR_SOURCE_SNAPSHOT_REQUIRED");
    const existing = (
      await client.query<ExistingProjectIdentifier>(canonicalPnrrIdentifiersSql)
    ).rows;
    const plan = buildCanonicalPnrrPlan(records, existing);
    for (const statement of canonicalPnrrStatements(plan))
      await client.query(statement.text, statement.values);
    await client.query("COMMIT");
    return {
      status: "verified" as const,
      resolverVersion: PNRR_RESOLVER_VERSION,
      ...plan.summary,
    };
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
