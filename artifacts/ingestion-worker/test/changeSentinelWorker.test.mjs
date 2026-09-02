import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const workerPath = fileURLToPath(
  new URL("../dist/changeSentinelWorker.mjs", import.meta.url),
);

function runDisabledWorker() {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.DATABASE_URL;
    delete env.CHANGE_SENTINEL_TRIGGER_ENABLED;

    const child = spawn(process.execPath, [workerPath], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("disabled sentinel worker does not require DATABASE_URL or execute canonical work", async () => {
  const result = await runDisabledWorker();
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /trigger worker disabled/u);
  assert.doesNotMatch(result.stdout + result.stderr, /DATABASE_URL must be set/u);
});
