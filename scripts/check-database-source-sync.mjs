import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import {
  compareSnapshotCheckpoint,
  validateSnapshotPlan,
} from "./lib/sourceSnapshotVerification.mjs";

// Fixed production origin: no database credentials and no caller-supplied URL.
const endpoint =
  "https://lamezia-trasparente-api.onrender.com/api/healthz/source-snapshots";
const args = process.argv.slice(2);
const options = new Map();
for (let i = 0; i < args.length; i += 2) {
  if (
    !["--plan", "--output", "--timeout-seconds"].includes(args[i]) ||
    !args[i + 1] ||
    args[i + 1].startsWith("--") ||
    options.has(args[i])
  )
    throw new Error("INVALID_ARGUMENTS");
  options.set(args[i], args[i + 1]);
}
if (!options.has("--plan") || !options.has("--output"))
  throw new Error("PLAN_AND_OUTPUT_REQUIRED");
const timeout = Number(options.get("--timeout-seconds") ?? 720);
if (!Number.isInteger(timeout) || timeout < 1 || timeout > 720)
  throw new Error("INVALID_TIMEOUT");
const plan = JSON.parse(await readFile(options.get("--plan"), "utf8"));
validateSnapshotPlan(plan);
const deadline = Date.now() + timeout * 1000;
let attempts = 0;
let result = { ok: false, errors: ["CHECKPOINT_UNAVAILABLE"] };
while (Date.now() < deadline) {
  attempts++;
  try {
    const response = await fetch(endpoint, {
      redirect: "error",
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(
        Math.max(1, Math.min(20000, deadline - Date.now())),
      ),
    });
    if (!response.ok) {
      await response.body?.cancel();
      result = { ok: false, errors: ["CHECKPOINT_NOT_READY"] };
    } else {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of response.body) {
        bytes += chunk.byteLength;
        if (bytes > 65536) throw new Error("CHECKPOINT_TOO_LARGE");
        chunks.push(chunk);
      }
      result = compareSnapshotCheckpoint(
        plan,
        JSON.parse(Buffer.concat(chunks).toString("utf8")),
      );
    }
  } catch {
    result = { ok: false, errors: ["CHECKPOINT_UNAVAILABLE_OR_INVALID"] };
  }
  if (result.ok) break;
  const remaining = deadline - Date.now();
  if (remaining > 0) await delay(Math.min(15000, remaining));
}
const report = {
  schemaVersion: "lt-source-sync-verification.v1",
  status: result.ok ? "verified" : "failed",
  verifiedAt: new Date().toISOString(),
  verificationBasis: "process_startup_checkpoint",
  endpoint,
  repositoryCommit: plan.repositoryCommit,
  sources: plan.sources.length,
  records: plan.sources.reduce((sum, source) => sum + source.records, 0),
  pnrrExpected: plan.pnrrExpected,
  attempts,
  errors: result.errors,
};
await writeFile(
  options.get("--output"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (!result.ok) process.exitCode = 1;
