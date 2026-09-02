import pg from "pg";

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(2);
}

const expectedSource = "attuazione-pnrr-lamezia";
const pool = new Pool({ connectionString: databaseUrl });
try {
  const result = await pool.query(
    `select event_id, provider, watch_key, canonical_source_id, state,
            attempt_count, canonical_before_hash, canonical_after_hash, material_change
       from change_sentinel_events
      where canonical_source_id = $1
      order by received_at desc`,
    [expectedSource],
  );

  if (result.rowCount !== 1) {
    throw new Error(`Expected exactly one sentinel event, found ${result.rowCount}`);
  }
  const row = result.rows[0];
  if (
    row.provider !== "changedetection.io" ||
    row.watch_key !== "pnrr-index" ||
    row.canonical_source_id !== expectedSource ||
    row.state !== "received" ||
    row.attempt_count !== 0 ||
    row.canonical_before_hash !== null ||
    row.canonical_after_hash !== null ||
    row.material_change !== null
  ) {
    throw new Error("Sentinel event ledger did not preserve the expected receiver-only state");
  }

  process.stdout.write(
    JSON.stringify({
      status: "ok",
      provider: row.provider,
      watchKey: row.watch_key,
      sourceId: row.canonical_source_id,
      state: row.state,
      canonicalWorkExecuted: false,
      eventContentStored: false,
    }) + "\n",
  );
} finally {
  await pool.end();
}
