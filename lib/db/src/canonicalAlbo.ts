import type { Pool } from "pg";
import {
  buildCanonicalAlboPlan,
  ALBO_RESOLVER_VERSION,
  type AlboRegistryRecord,
  type ExistingAlboIdentity,
} from "./canonicalAlboPlan";
import {
  canonicalAlboRecordsSql,
  canonicalAlboIdentitiesSql,
  canonicalAlboStatements,
} from "./canonicalAlboSql";

export async function reconcileCanonicalAlbo(pool: Pick<Pool, "connect">) {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
    await client.query("SET LOCAL statement_timeout = '30000ms'");
    await client.query("SET LOCAL lock_timeout = '5000ms'");
    for (const key of [
      "lt.canonical.albo.v1",
      "lt-source:lamezia.albo.current",
      "lt-source:lamezia.albo.delibere",
    ])
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        [key],
      );
    const records = (
      await client.query<AlboRegistryRecord>(canonicalAlboRecordsSql)
    ).rows;
    if (!records.length) throw new Error("ALBO_SOURCE_SNAPSHOT_REQUIRED");
    const existing = (
      await client.query<ExistingAlboIdentity>(canonicalAlboIdentitiesSql)
    ).rows.map((x) => ({
      ...x,
      key: x.kind === "act" ? JSON.stringify(JSON.parse(x.key)) : x.key,
    }));
    const plan = buildCanonicalAlboPlan(records, existing);
    for (const s of canonicalAlboStatements(plan))
      await client.query(s.text, s.values);
    await client.query("COMMIT");
    return {
      status: "verified" as const,
      resolverVersion: ALBO_RESOLVER_VERSION,
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
