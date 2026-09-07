import { isDeepStrictEqual } from "node:util";

const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const count = (value) => Number.isSafeInteger(value) && value >= 0;
const hash = (value) =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const date = (value) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

function sourceMap(sources) {
  if (!Array.isArray(sources) || sources.length !== 5) return null;
  const result = new Map();
  for (const source of sources) {
    if (
      !record(source) ||
      typeof source.source !== "string" ||
      result.has(source.source)
    )
      return null;
    result.set(source.source, source);
  }
  return result;
}

export function validateSnapshotPlan(plan) {
  if (
    !record(plan) ||
    plan.schemaVersion !== "lt-source-import-report.v1" ||
    plan.mode !== "plan" ||
    plan.status !== "planned" ||
    typeof plan.importerVersion !== "string" ||
    !/^[a-f0-9]{40}$/.test(plan.repositoryCommit ?? "") ||
    !count(plan.pnrrExpected)
  )
    throw new Error("INVALID_LOCAL_PLAN");
  const sources = sourceMap(plan.sources);
  if (!sources?.has("lamezia.pnrr.municipal"))
    throw new Error("INVALID_LOCAL_PLAN");
  for (const source of sources.values()) {
    if (
      !hash(source.byteHash) ||
      !count(source.bytes) ||
      !count(source.records) ||
      !record(source.collections) ||
      !Object.values(source.collections).every(count) ||
      Object.values(source.collections).reduce((a, b) => a + b, 0) !==
        source.records
    )
      throw new Error("INVALID_LOCAL_PLAN");
  }
  return sources;
}

/** Compare actual reconciliation evidence, never just the HTTP or top-level status. */
export function compareSnapshotCheckpoint(plan, checkpoint) {
  const expected = validateSnapshotPlan(plan);
  const errors = new Set();
  if (
    !record(checkpoint) ||
    checkpoint.status !== "verified" ||
    checkpoint.verificationBasis !== "process_startup"
  )
    return { ok: false, errors: ["CHECKPOINT_NOT_VERIFIED"] };
  const report = checkpoint.report;
  if (
    !record(report) ||
    report.schemaVersion !== plan.schemaVersion ||
    report.mode !== "execute" ||
    report.status !== "verified" ||
    report.error ||
    report.connectionOrMigrationError
  )
    return { ok: false, errors: ["REPORT_NOT_VERIFIED"] };
  if (report.repositoryCommit !== plan.repositoryCommit)
    errors.add("DEPLOY_COMMIT_MISMATCH");
  if (report.importerVersion !== plan.importerVersion)
    errors.add("IMPORTER_VERSION_MISMATCH");
  if (
    !date(report.generatedAt) ||
    !date(report.completedAt) ||
    Date.parse(report.completedAt) < Date.parse(report.generatedAt)
  )
    errors.add("INVALID_VERIFICATION_TIME");
  if (report.pnrrExpected !== plan.pnrrExpected)
    errors.add("PNRR_COUNT_MISMATCH");
  const actual = sourceMap(report.sources);
  const results = sourceMap(report.results);
  if (!actual || !results)
    return { ok: false, errors: [...errors, "MISSING_OR_DUPLICATE_SOURCES"] };
  for (const [key, source] of expected) {
    const remote = actual.get(key);
    const result = results.get(key);
    if (!remote || !result) {
      errors.add("MISSING_OR_DUPLICATE_SOURCES");
      continue;
    }
    for (const field of [
      "byteHash",
      "bytes",
      "records",
      "sourceStatus",
      "sourceTimestampRaw",
      "collections",
    ])
      if (!isDeepStrictEqual(remote[field], source[field]))
        errors.add("SOURCE_METADATA_MISMATCH");
    if (
      result.status !== "succeeded" ||
      result.byteHash !== source.byteHash ||
      result.records !== source.records ||
      result.verified !== source.records ||
      !count(result.inserted) ||
      result.inserted > source.records
    )
      errors.add("SOURCE_RECONCILIATION_MISMATCH");
    if (
      key === "lamezia.pnrr.municipal" &&
      (!record(result.legacy) ||
        result.legacy.matched !== plan.pnrrExpected ||
        !count(result.legacy.inserted) ||
        result.legacy.inserted > plan.pnrrExpected)
    )
      errors.add("PNRR_RECONCILIATION_MISMATCH");
  }
  return { ok: errors.size === 0, errors: [...errors] };
}
