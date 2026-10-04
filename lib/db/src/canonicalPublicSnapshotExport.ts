import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { execFileSync } from "node:child_process";
import { Pool } from "pg";
import { readCanonicalPublicSnapshot } from "./canonicalPublicSnapshot";

// DATABASE_URL is supplied by the operator's runtime, never a command argument.
// --stdin-connection is for hidden tool input; it never writes credentials.
const output = process.argv[2];
if (!output) throw new Error("PUBLIC_EXPORT_OUTPUT_REQUIRED");
let connection = process.env.DATABASE_URL;
if (process.argv.includes("--stdin-connection")) {
  process.stdout.write("Ready for connection on stdin (input is hidden).\n");
  if (process.stdin.isTTY)
    execFileSync("stty", ["-echo"], { stdio: ["inherit", "ignore", "ignore"] });
  const input = createInterface({ input: process.stdin });
  try {
    connection = (
      await new Promise<string>((resolve) => input.once("line", resolve))
    ).trim();
  } finally {
    input.close();
    process.stdin.pause();
    if (process.stdin.isTTY)
      execFileSync("stty", ["echo"], {
        stdio: ["inherit", "ignore", "ignore"],
      });
  }
}
if (!connection) throw new Error("PUBLIC_EXPORT_CONNECTION_REQUIRED");
const pool = new Pool({
  connectionString: connection,
  connectionTimeoutMillis: 15000,
});
try {
  const snapshot = await readCanonicalPublicSnapshot(pool);
  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({ body_hash: snapshot.body_hash, ...snapshot.reconciliation })}\n`,
  );
} finally {
  await pool.end();
}
