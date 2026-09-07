import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import {
  prepareSourceSnapshotImport,
  executeSourceSnapshotImport,
} from "./sourceSnapshotRunner";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const args = process.argv.slice(2);
const execute = args.includes("--execute");
const outputIndex = args.indexOf("--output");
const output = outputIndex === -1 ? null : args[outputIndex + 1];
const permitted = new Set(["--execute", "--output"]);
for (let i = 0; i < args.length; i++) {
  if (!permitted.has(args[i])) throw new Error("UNSUPPORTED_ARGUMENT");
  if (args[i] === "--output") {
    if (!args[++i] || args[i].startsWith("--"))
      throw new Error("OUTPUT_PATH_REQUIRED");
  }
}
const prepared = await prepareSourceSnapshotImport(root);
let report = prepared.report;
if (execute) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 10000,
  });
  try {
    report = await executeSourceSnapshotImport(pool, prepared);
  } finally {
    await pool.end();
  }
}
if (output) {
  const target = path.resolve(output);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report, null, 2));
if (report.status === "failed") process.exitCode = 1;
