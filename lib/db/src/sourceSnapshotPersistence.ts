import { createHash } from "node:crypto";
import { generateCanonicalUuidV7 } from "./canonicalIdentity";
import type { SnapshotSource } from "./sourceSnapshotManifest";

export const SNAPSHOT_IMPORTER_VERSION = "source-snapshot-import.v1";
export type JsonObject = Record<string, unknown>;
export type SnapshotRecord = {
  id: string;
  collection_key: string;
  ordinal: number;
  native_key: string | null;
  record_hash: string;
  payload: JsonObject;
};
export type SnapshotPlan = {
  source: SnapshotSource;
  commit: string;
  runId: string;
  sourceId: string;
  endpointId: string;
  artifactId: string;
  releaseId: string;
  byteHash: string;
  byteSize: number;
  contentText: string;
  metadata: JsonObject;
  collections: Record<string, number>;
  sourceStatus: string | null;
  sourceTimestampRaw: string | null;
  records: SnapshotRecord[];
};
export type SnapshotStatement = { text: string; values: unknown[] };
export type SnapshotQueryClient = {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>;
};

const object = (value: unknown): value is JsonObject =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
export function canonicalSnapshotJson(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return JSON.stringify(value);
  if (typeof value === "number") {
    if (
      !Number.isFinite(value) ||
      (Number.isInteger(value) && !Number.isSafeInteger(value))
    )
      throw new Error("UNSUPPORTED_JSON_NUMBER");
    return JSON.stringify(value);
  }
  if (Array.isArray(value))
    return `[${value.map(canonicalSnapshotJson).join(",")}]`;
  if (object(value))
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) => `${JSON.stringify(key)}:${canonicalSnapshotJson(value[key])}`,
      )
      .join(",")}}`;
  throw new Error("UNSUPPORTED_JSON_VALUE");
}
export const snapshotHash = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");

export function planSourceSnapshot(
  source: SnapshotSource,
  bytes: Uint8Array,
  commit: string,
): SnapshotPlan {
  if (!/^[0-9a-f]{40}$/.test(commit))
    throw new Error("INVALID_REPOSITORY_COMMIT");
  if (
    !/^[a-z][a-z0-9.-]+$/.test(source.key) ||
    source.path.startsWith("/") ||
    source.path.split("/").includes("..")
  )
    throw new Error("INVALID_SOURCE_MANIFEST");
  if (bytes.byteLength === 0 || bytes.byteLength > 4 * 1024 * 1024)
    throw new Error("SNAPSHOT_SIZE_LIMIT");
  const contentText = new TextDecoder("utf-8", {
    fatal: true,
    ignoreBOM: true,
  }).decode(bytes);
  const input: unknown = JSON.parse(contentText);
  if (!object(input)) throw new Error("SNAPSHOT_OBJECT_REQUIRED");
  canonicalSnapshotJson(input);
  const metadata = { ...input },
    collections: Record<string, number> = {},
    records: SnapshotRecord[] = [];
  for (const [collection, keyField] of Object.entries(source.collections)) {
    const values = input[collection];
    if (!Array.isArray(values))
      throw new Error(`MISSING_COLLECTION:${collection}`);
    collections[collection] = values.length;
    for (let ordinal = 0; ordinal < values.length; ordinal++) {
      const payload: unknown = values[ordinal];
      if (!object(payload))
        throw new Error(`INVALID_RECORD:${collection}:${ordinal}`);
      const key = payload[keyField];
      records.push({
        id: generateCanonicalUuidV7(),
        collection_key: collection,
        ordinal,
        native_key:
          typeof key === "string" || typeof key === "number"
            ? String(key)
            : null,
        record_hash: snapshotHash(canonicalSnapshotJson(payload)),
        payload,
      });
    }
    delete metadata[collection];
  }
  const nested = object(input.metadata) ? input.metadata : {};
  const state = input.status ?? input.verification_status ?? nested.source_type;
  const date =
    input.generated_at ?? input.generatedAt ?? nested.materialized_at;
  return {
    source,
    commit,
    runId: generateCanonicalUuidV7(),
    sourceId: generateCanonicalUuidV7(),
    endpointId: generateCanonicalUuidV7(),
    artifactId: generateCanonicalUuidV7(),
    releaseId: generateCanonicalUuidV7(),
    byteHash: snapshotHash(bytes),
    byteSize: bytes.byteLength,
    contentText,
    metadata,
    collections,
    records,
    sourceStatus: typeof state === "string" ? state : null,
    sourceTimestampRaw: typeof date === "string" ? date : null,
  };
}

const endpoint = `SELECT e.id FROM public.source_endpoints e JOIN public.source_sources s ON s.id=e.source_id WHERE s.source_key=$1 AND e.repository_path=$2`;
const release = `SELECT r.id FROM public.source_releases r JOIN public.source_artifacts a ON a.id=r.artifact_id WHERE r.endpoint_id=(${endpoint}) AND a.byte_hash=$3`;
const identityValues = (p: SnapshotPlan) => [p.source.key, p.source.path];
const releaseValues = (p: SnapshotPlan) => [...identityValues(p), p.byteHash];

/** Persist an attempt independently of the data transaction so failures remain visible. */
export function snapshotStartStatements(p: SnapshotPlan): SnapshotStatement[] {
  return [
    {
      text: `INSERT INTO public.source_sources (id,source_key,title,kind,upstream_urls) VALUES ($1,$2,$3,'repository_snapshot',$4::jsonb) ON CONFLICT(source_key) DO NOTHING`,
      values: [
        p.sourceId,
        p.source.key,
        p.source.title,
        JSON.stringify(p.source.upstreamUrls),
      ],
    },
    {
      text: `INSERT INTO public.source_endpoints(id,source_id,repository_path) SELECT $1,id,$3 FROM public.source_sources WHERE source_key=$2 ON CONFLICT(source_id,repository_path) DO NOTHING`,
      values: [p.endpointId, p.source.key, p.source.path],
    },
    {
      text: `INSERT INTO public.source_acquisition_runs(id,endpoint_id,status,kind,repository_commit,records_expected) VALUES ($3,(${endpoint}),'running','repository_import',$4,$5)`,
      values: [...identityValues(p), p.runId, p.commit, p.records.length],
    },
  ];
}

export function snapshotDataStatements(p: SnapshotPlan): SnapshotStatement[] {
  const locator = `https://raw.githubusercontent.com/colazeta/Lamezia-Trasparente-Monitor/${p.commit}/${p.source.path}`;
  const statements: SnapshotStatement[] = [
    {
      text: `SELECT pg_advisory_xact_lock(hashtextextended($1,0))`,
      values: [`lt-source:${p.source.key}`],
    },
    {
      text: `INSERT INTO public.source_artifacts(id,endpoint_id,byte_hash,byte_size,media_type,content_role,repository_commit,locator,content_text)
      VALUES ($4,(${endpoint}),$3,$5,'application/json',$6,$7,$8,$9) ON CONFLICT(endpoint_id,byte_hash) DO NOTHING`,
      values: [
        ...releaseValues(p),
        p.artifactId,
        p.byteSize,
        p.source.role,
        p.commit,
        locator,
        p.contentText,
      ],
    },
    {
      text: `INSERT INTO public.source_releases(id,endpoint_id,artifact_id,metadata,collections,source_status,source_timestamp_raw,importer_version)
      SELECT $4,a.endpoint_id,a.id,$5::jsonb,$6::jsonb,$7,$8,$9 FROM public.source_artifacts a WHERE a.endpoint_id=(${endpoint}) AND a.byte_hash=$3 ON CONFLICT(artifact_id) DO NOTHING`,
      values: [
        ...releaseValues(p),
        p.releaseId,
        JSON.stringify(p.metadata),
        JSON.stringify(p.collections),
        p.sourceStatus,
        p.sourceTimestampRaw,
        SNAPSHOT_IMPORTER_VERSION,
      ],
    },
  ];
  for (let offset = 0; offset < p.records.length; offset += 50)
    statements.push({
      text: `WITH inserted AS (INSERT INTO public.source_records(id,release_id,collection_key,ordinal,native_key,record_hash,payload)
      SELECT x.id,(${release}),x.collection_key,x.ordinal,x.native_key,x.record_hash,x.payload
      FROM jsonb_to_recordset($4::jsonb) AS x(id uuid,collection_key text,ordinal integer,native_key text,record_hash text,payload jsonb)
      ON CONFLICT(release_id,collection_key,ordinal) DO NOTHING RETURNING id) SELECT count(*)::integer AS inserted FROM inserted`,
      values: [
        ...releaseValues(p),
        JSON.stringify(p.records.slice(offset, offset + 50)),
      ],
    });
  return statements;
}

/** The database compares every field, key and position, as well as the exact original text. */
export function snapshotVerificationStatement(
  p: SnapshotPlan,
): SnapshotStatement {
  const expected = p.records.map(
    ({ collection_key, ordinal, native_key, record_hash }) => ({
      collection_key,
      ordinal,
      native_key,
      record_hash,
    }),
  );
  return {
    text: `WITH artifact AS MATERIALIZED (
      SELECT id,byte_size,content_role,content_text::jsonb AS document FROM public.source_artifacts
      WHERE endpoint_id=(${endpoint}) AND byte_hash=$3)
      SELECT r.id AS release_id,
      (SELECT count(*)::integer FROM public.source_records WHERE release_id=r.id) AS records,
      (a.byte_size=$4 AND a.content_role=$5 AND r.collections=$6::jsonb
       AND r.metadata=(a.document - ARRAY(SELECT jsonb_object_keys($6::jsonb)))
       AND r.source_status IS NOT DISTINCT FROM $7::text AND r.source_timestamp_raw IS NOT DISTINCT FROM $8::text
       AND r.importer_version=$9 AND NOT EXISTS (
         SELECT 1 FROM (SELECT * FROM public.source_records WHERE release_id=r.id) actual
         FULL JOIN jsonb_to_recordset($10::jsonb) expected(collection_key text,ordinal integer,native_key text,record_hash text)
           ON actual.collection_key=expected.collection_key AND actual.ordinal=expected.ordinal
         WHERE actual.collection_key IS NULL OR expected.collection_key IS NULL
           OR actual.native_key IS DISTINCT FROM expected.native_key OR actual.record_hash IS DISTINCT FROM expected.record_hash
           OR actual.payload IS DISTINCT FROM (a.document -> expected.collection_key -> expected.ordinal))) AS verified
      FROM public.source_releases r JOIN artifact a ON a.id=r.artifact_id`,
    values: [
      ...releaseValues(p),
      p.byteSize,
      p.source.role,
      JSON.stringify(p.collections),
      p.sourceStatus,
      p.sourceTimestampRaw,
      SNAPSHOT_IMPORTER_VERSION,
      JSON.stringify(expected),
    ],
  };
}

export function snapshotCompleteStatement(
  p: SnapshotPlan,
  inserted: number,
): SnapshotStatement {
  return {
    text: `UPDATE public.source_acquisition_runs SET release_id=(${release}),status='succeeded',completed_at=clock_timestamp(),records_inserted=$5,records_verified=$6 WHERE id=$4 AND status='running' RETURNING id`,
    values: [...releaseValues(p), p.runId, inserted, p.records.length],
  };
}

export async function executeSnapshotStatements(
  client: SnapshotQueryClient,
  statements: SnapshotStatement[],
) {
  const results: Record<string, unknown>[][] = [];
  for (const statement of statements)
    results.push((await client.query(statement.text, statement.values)).rows);
  return results;
}

export async function persistSourceSnapshot(
  client: SnapshotQueryClient,
  p: SnapshotPlan,
  options: { reconcilePnrr?: boolean } = {},
) {
  await client.query("BEGIN");
  try {
    await executeSnapshotStatements(client, snapshotStartStatements(p));
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  let inserted = 0;
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = '15000ms'");
    await client.query("SET LOCAL lock_timeout = '3000ms'");
    await client.query(
      "SET LOCAL idle_in_transaction_session_timeout = '30000ms'",
    );
    const results = await executeSnapshotStatements(
      client,
      snapshotDataStatements(p),
    );
    inserted = results.reduce(
      (sum, rows) => sum + Number(rows[0]?.inserted ?? 0),
      0,
    );
    const verify = snapshotVerificationStatement(p);
    const verified = (await client.query(verify.text, verify.values)).rows[0];
    if (verified?.verified !== true || verified.records !== p.records.length)
      throw new Error("SNAPSHOT_RECONCILIATION_FAILED");
    let legacy: { inserted: number; matched: number } | null = null;
    if (options.reconcilePnrr && p.source.key === "lamezia.pnrr.municipal") {
      const { reconcilePnrrSnapshot } = await import("./sourceSnapshotPnrr");
      legacy = await reconcilePnrrSnapshot(client, p);
    }
    const complete = snapshotCompleteStatement(p, inserted);
    if ((await client.query(complete.text, complete.values)).rows.length !== 1)
      throw new Error("RUN_COMPLETION_FAILED");
    await client.query("COMMIT");
    return {
      source: p.source.key,
      runId: p.runId,
      releaseId: String(verified.release_id),
      byteHash: p.byteHash,
      records: p.records.length,
      inserted,
      verified: p.records.length,
      sourceStatus: p.sourceStatus,
      legacy,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    const code =
      error instanceof Error && /^[A-Z_]{3,80}$/.test(error.message)
        ? error.message
        : "PERSISTENCE_FAILED";
    await client.query(
      "UPDATE public.source_acquisition_runs SET status='failed',completed_at=clock_timestamp(),error_code=$2 WHERE id=$1 AND status='running'",
      [p.runId, code],
    );
    throw new Error(code);
  }
}
