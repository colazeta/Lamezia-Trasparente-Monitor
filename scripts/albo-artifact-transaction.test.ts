import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  alboArtifactTransactionJournalPath,
  promoteAlboArtifactBatch,
  recoverAlboArtifactTransaction,
} from "./albo-artifact-transaction";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

test("rolls back every promoted target after a mid-promotion error", async () => {
  const outDir = await mkdtemp(
    path.join(tmpdir(), "albo-transaction-promote-"),
  );
  const first = path.join(outDir, "public", "first.json");
  const second = path.join(outDir, "public", "second.json");
  const revoked = path.join(outDir, "public", "old.pdf");
  await mkdir(path.dirname(first), { recursive: true });
  await Promise.all([
    writeFile(first, "old-first"),
    writeFile(second, "old-second"),
    writeFile(revoked, "old-revocation"),
  ]);

  try {
    await assert.rejects(
      promoteAlboArtifactBatch(
        [
          { target: first, contents: "new-first" },
          { target: second, contents: "new-second" },
        ],
        [revoked],
        {
          outDir,
          hooks: {
            afterMutation(event) {
              if (event.type === "promoted" && event.index === 0) {
                throw new Error("injected after first promotion");
              }
            },
          },
        },
      ),
      /injected after first promotion/,
    );
    assert.equal(await readFile(first, "utf8"), "old-first");
    assert.equal(await readFile(second, "utf8"), "old-second");
    assert.equal(await readFile(revoked, "utf8"), "old-revocation");
    await assert.rejects(readFile(alboArtifactTransactionJournalPath(outDir)), {
      code: "ENOENT",
    });
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("restores quarantined revocations when a later revocation step fails", async () => {
  const outDir = await mkdtemp(path.join(tmpdir(), "albo-transaction-revoke-"));
  const target = path.join(outDir, "public", "manifest.json");
  const revoked = path.join(outDir, "public", "old.pdf");
  await mkdir(path.dirname(target), { recursive: true });
  await Promise.all([
    writeFile(target, "old-manifest"),
    writeFile(revoked, "old-pdf"),
  ]);

  try {
    await assert.rejects(
      promoteAlboArtifactBatch(
        [{ target, contents: "new-manifest" }],
        [revoked],
        {
          outDir,
          hooks: {
            afterMutation(event) {
              if (event.type === "revoked") {
                throw new Error("injected after revocation");
              }
            },
          },
        },
      ),
      /injected after revocation/,
    );
    assert.equal(await readFile(target, "utf8"), "old-manifest");
    assert.equal(await readFile(revoked, "utf8"), "old-pdf");
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("aggregates rollback errors, attempts the remaining targets, and recovers", async () => {
  const outDir = await mkdtemp(
    path.join(tmpdir(), "albo-transaction-rollback-"),
  );
  const first = path.join(outDir, "public", "first.json");
  const second = path.join(outDir, "public", "second.json");
  await mkdir(path.dirname(first), { recursive: true });
  await Promise.all([
    writeFile(first, "old-first"),
    writeFile(second, "old-second"),
  ]);

  try {
    await assert.rejects(
      promoteAlboArtifactBatch(
        [
          { target: first, contents: "new-first" },
          { target: second, contents: "new-second" },
        ],
        [],
        {
          outDir,
          hooks: {
            afterMutation(event) {
              if (event.type === "promoted" && event.index === 0) {
                throw new Error("injected promotion failure");
              }
            },
            beforeRollbackMutation(event) {
              if (event.type === "rollback_write" && event.index === 0) {
                throw new Error("injected rollback failure");
              }
            },
          },
        },
      ),
      (error: unknown) =>
        error instanceof AggregateError && error.errors.length >= 2,
    );
    assert.equal(await readFile(second, "utf8"), "old-second");
    assert.equal(await readFile(first, "utf8"), "new-first");

    const journalPath = alboArtifactTransactionJournalPath(outDir);
    const journal = JSON.parse(await readFile(journalPath, "utf8")) as {
      owner_pid: number;
    };
    journal.owner_pid = 2_147_483_647;
    await writeFile(journalPath, `${JSON.stringify(journal, null, 2)}\n`);
    await recoverAlboArtifactTransaction(outDir);
    assert.equal(await readFile(first, "utf8"), "old-first");
    assert.equal(await readFile(second, "utf8"), "old-second");
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("startup recovery rolls back a process that exits mid-promotion", async () => {
  const outDir = await mkdtemp(path.join(tmpdir(), "albo-transaction-crash-"));
  const first = path.join(outDir, "public", "first.json");
  const second = path.join(outDir, "public", "second.json");
  await mkdir(path.dirname(first), { recursive: true });
  await Promise.all([
    writeFile(first, "old-first"),
    writeFile(second, "old-second"),
  ]);

  try {
    const moduleUrl = pathToFileURL(
      path.join(SCRIPT_DIR, "albo-artifact-transaction.ts"),
    ).href;
    const childSource = `
      import { promoteAlboArtifactBatch } from ${JSON.stringify(moduleUrl)};
      await promoteAlboArtifactBatch(
        ${JSON.stringify([
          { target: first, contents: "new-first" },
          { target: second, contents: "new-second" },
        ])},
        [],
        {
          outDir: ${JSON.stringify(outDir)},
          hooks: {
            afterMutation(event) {
              if (event.type === "promoted" && event.index === 0) process.exit(73);
            }
          }
        }
      );
    `;
    const exitCode = await runChild(childSource);
    assert.equal(exitCode, 73);
    assert.equal(await readFile(first, "utf8"), "new-first");

    await recoverAlboArtifactTransaction(outDir);
    assert.equal(await readFile(first, "utf8"), "old-first");
    assert.equal(await readFile(second, "utf8"), "old-second");
    await assert.rejects(readFile(alboArtifactTransactionJournalPath(outDir)), {
      code: "ENOENT",
    });
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("startup recovery preserves a transaction durably marked committed", async () => {
  const outDir = await mkdtemp(
    path.join(tmpdir(), "albo-transaction-committed-"),
  );
  const target = path.join(outDir, "public", "manifest.json");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, "old-manifest");

  try {
    const moduleUrl = pathToFileURL(
      path.join(SCRIPT_DIR, "albo-artifact-transaction.ts"),
    ).href;
    const childSource = `
      import { promoteAlboArtifactBatch } from ${JSON.stringify(moduleUrl)};
      await promoteAlboArtifactBatch(
        [{ target: ${JSON.stringify(target)}, contents: "new-manifest" }],
        [],
        {
          outDir: ${JSON.stringify(outDir)},
          hooks: {
            afterMutation(event) {
              if (event.type === "committed") process.exit(74);
            }
          }
        }
      );
    `;
    const exitCode = await runChild(childSource, 74);
    assert.equal(exitCode, 74);
    assert.equal(await readFile(target, "utf8"), "new-manifest");

    await recoverAlboArtifactTransaction(outDir);
    assert.equal(await readFile(target, "utf8"), "new-manifest");
    await assert.rejects(readFile(alboArtifactTransactionJournalPath(outDir)), {
      code: "ENOENT",
    });
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("post-commit cleanup failure does not turn publication into failure", async () => {
  const outDir = await mkdtemp(
    path.join(tmpdir(), "albo-transaction-cleanup-"),
  );
  const target = path.join(outDir, "public", "manifest.json");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, "old-manifest");

  try {
    const result = await promoteAlboArtifactBatch(
      [{ target, contents: "new-manifest" }],
      [],
      {
        outDir,
        hooks: {
          beforeCleanup() {
            throw new Error("injected cleanup failure");
          },
        },
      },
    );
    assert.deepEqual(result, { committed: true, cleanup_pending: true });
    assert.equal(await readFile(target, "utf8"), "new-manifest");
    await readFile(alboArtifactTransactionJournalPath(outDir), "utf8");

    await recoverAlboArtifactTransaction(outDir);
    assert.equal(await readFile(target, "utf8"), "new-manifest");
    await assert.rejects(readFile(alboArtifactTransactionJournalPath(outDir)), {
      code: "ENOENT",
    });
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

function runChild(source: string, expectedCode = 73): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "--eval", source],
      { cwd: SCRIPT_DIR, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === expectedCode) resolve(code);
      else reject(new Error(`Crash fixture exited ${code}: ${stderr}`));
    });
  });
}
