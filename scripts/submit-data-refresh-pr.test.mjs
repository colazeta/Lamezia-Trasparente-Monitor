import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./submit-data-refresh-pr.sh", import.meta.url));

test("refresh proposes a branch and dispatches checks without changing protected main", () => {
  const root = mkdtempSync(path.join(tmpdir(), "lamezia-refresh-"));
  try {
    const cwd = path.join(root, "work");
    const bin = path.join(root, "bin");
    mkdirSync(cwd); mkdirSync(bin);
    const git = (...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    git("init", "--bare", path.join(root, "remote.git"));
    git("init", "-b", "main");
    git("config", "user.name", "Test"); git("config", "user.email", "test@example.invalid");
    writeFileSync(path.join(cwd, "snapshot.json"), "{}\n");
    git("add", "."); git("commit", "-m", "baseline");
    git("remote", "add", "origin", path.join(root, "remote.git"));
    git("push", "origin", "main");
    const base = git("rev-parse", "main");
    const log = path.join(root, "calls");
    writeFileSync(path.join(bin, "gh"), '#!/bin/sh\nprintf "%s\\n" "$*" >> "$TEST_GH_LOG"\nif [ "$1 $2" = "pr create" ]; then echo "https://github.com/test/project/pull/123"; fi\n', { mode: 0o755 });
    const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, TEST_GH_LOG: log, GH_TOKEN: "fixture", GITHUB_REPOSITORY: "test/project", GITHUB_RUN_ID: "42", GITHUB_RUN_ATTEMPT: "1" };
    // No-op runs must not open a PR or dispatch checks.
    execFileSync("bash", [script, "albo", "Refresh", "snapshot.json"], { cwd, env });
    writeFileSync(path.join(cwd, "snapshot.json"), '{"updated":true}\n');
    execFileSync("bash", [script, "albo", "Refresh", "snapshot.json"], { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    assert.equal(git("rev-parse", "main"), base);
    assert.match(git("ls-remote", "origin", "refs/heads/main"), new RegExp(`^${base}\\s`));
    assert.equal(git("branch", "--show-current"), "data/refresh-albo-42-1");
    const calls = readFileSync(log, "utf8").trim().split("\n");
    assert.equal(calls.length, 5);
    assert.match(calls[0], /pr list.*data\/refresh-albo-/);
    assert.match(calls[1], /pr create.*--base main.*--head data\/refresh-albo-42-1/);
    assert.match(calls[2], /workflow run ci.yml.*--ref data\/refresh-albo-42-1/);
    assert.match(calls[3], /workflow run hook-guard.yml.*pr_number=123/);
    assert.match(calls[4], /workflow run v0-static-fallback-smoke.yml/);
    git("switch", "main");
    writeFileSync(path.join(cwd, "snapshot.json"), '{"another":true}\n');
    writeFileSync(path.join(bin, "gh"), '#!/bin/sh\necho "https://github.com/test/project/pull/123"\n', { mode: 0o755 });
    const pending = execFileSync("bash", [script, "albo", "Refresh", "snapshot.json"], { cwd, env, encoding: "utf8" });
    assert.match(pending, /No new PR/);
    assert.equal(git("branch", "--show-current"), "main");
    assert.equal(git("rev-parse", "HEAD"), base);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
