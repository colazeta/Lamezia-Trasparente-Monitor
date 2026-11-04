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
    mkdirSync(path.join(cwd, "data/public/albo"), { recursive: true });
    const snapshotPath = "data/public/albo/latest.json";
    writeFileSync(path.join(cwd, snapshotPath), "{}\n");
    git("add", "."); git("commit", "-m", "baseline");
    git("remote", "add", "origin", path.join(root, "remote.git"));
    git("push", "origin", "main");
    const base = git("rev-parse", "main");
    const log = path.join(root, "calls");
    writeFileSync(path.join(bin, "gh"), '#!/bin/sh\nprintf "%s\\n" "$*" >> "$TEST_GH_LOG"\nif [ "$1 $2" = "pr create" ]; then echo "https://github.com/test/project/pull/123"; fi\n', { mode: 0o755 });
    const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, TEST_GH_LOG: log, GH_TOKEN: "fixture", GITHUB_REPOSITORY: "test/project", GITHUB_RUN_ID: "42", GITHUB_RUN_ATTEMPT: "1" };
    // No-op runs must not open a PR or dispatch checks.
    execFileSync("bash", [script, "albo", "Refresh", snapshotPath], { cwd, env });
    writeFileSync(path.join(cwd, snapshotPath), '{"updated":true}\n');
    execFileSync("bash", [script, "albo", "Refresh", snapshotPath], { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    assert.equal(git("rev-parse", "main"), base);
    assert.match(git("ls-remote", "origin", "refs/heads/main"), new RegExp(`^${base}\\s`));
    assert.equal(git("branch", "--show-current"), "data/refresh-albo-42-1");
    const calls = readFileSync(log, "utf8").trim().split("\n");
    assert.equal(calls.length, 6);
    assert.match(calls[0], /pr list.*data\/refresh-albo-/);
    assert.match(calls[1], /pr create.*--base main.*--head data\/refresh-albo-42-1/);
    assert.match(calls[2], /workflow run ci.yml.*--ref data\/refresh-albo-42-1/);
    assert.match(calls[3], /workflow run hook-guard.yml.*pr_number=123/);
    assert.match(calls[4], /workflow run v0-static-fallback-smoke.yml/);
    assert.match(calls[5], /pr merge 123.*--auto --squash/);
    assert.throws(() => execFileSync("bash", [script, "albo", "Refresh", ".github/workflows/ci.yml"], { cwd, env, stdio: "pipe" }));
    git("switch", "main");
    writeFileSync(path.join(cwd, snapshotPath), '{"another":true}\n');
    writeFileSync(path.join(bin, "gh"), '#!/bin/sh\necho "https://github.com/test/project/pull/123"\n', { mode: 0o755 });
    const pending = execFileSync("bash", [script, "albo", "Refresh", snapshotPath], { cwd, env, encoding: "utf8" });
    assert.match(pending, /No new PR/);
    assert.equal(git("branch", "--show-current"), "main");
    assert.equal(git("rev-parse", "HEAD"), base);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("blocked PR creation preserves one orphan branch and a retry recovers it without another commit", () => {
  const root=mkdtempSync(path.join(tmpdir(),"lamezia-blocked-refresh-"));
  try {
    const cwd=path.join(root,"work"),bin=path.join(root,"bin");mkdirSync(cwd);mkdirSync(bin);
    const git=(...args)=>execFileSync("git",args,{cwd,encoding:"utf8",stdio:"pipe"}).trim();
    git("init","--bare",path.join(root,"remote.git"));git("init","-b","main");
    git("config","user.name","Test");git("config","user.email","test@example.invalid");
    const snapshot="artifacts/lamezia-trasparente/src/data/generated/lameziaClimateDaily.json";
    mkdirSync(path.dirname(path.join(cwd,snapshot)),{recursive:true});writeFileSync(path.join(cwd,snapshot),"{}\n");
    git("add",".");git("commit","-m","baseline");git("remote","add","origin",path.join(root,"remote.git"));git("push","origin","main");
    const base=git("rev-parse","HEAD"),summary=path.join(root,"summary");
    writeFileSync(path.join(bin,"gh"),'#!/bin/sh\ncase "$*" in\n *"--state all"*) echo 0;;\n "pr create"*) echo "GitHub Actions is not permitted to create pull requests" >&2; exit 1;;\nesac\n',{mode:0o755});
    const env={...process.env,PATH:`${bin}:${process.env.PATH}`,GH_TOKEN:"fixture",GITHUB_REPOSITORY:"test/project",GITHUB_RUN_ID:"100",GITHUB_STEP_SUMMARY:summary};
    writeFileSync(path.join(cwd,snapshot),'{"first":true}\n');
    assert.throws(()=>execFileSync("bash",[script,"climate","Refresh",snapshot],{cwd,env,stdio:"pipe"}));
    const preserved=git("ls-remote","--heads","origin","refs/heads/data/refresh-climate-*");
    assert.equal(preserved.split("\n").length,1);const head=preserved.split(/\s+/)[0];
    git("switch","main");writeFileSync(path.join(cwd,snapshot),'{"second":true}\n');
    assert.throws(()=>execFileSync("bash",[script,"climate","Refresh",snapshot],{cwd,env:{...env,GITHUB_RUN_ID:"101"},stdio:"pipe"}));
    assert.equal(git("ls-remote","--heads","origin","refs/heads/data/refresh-climate-*"),preserved);
    assert.equal(git("rev-parse","HEAD"),base);assert.equal(git("rev-parse","data/refresh-climate-100-1"),head);
    assert.match(readFileSync(summary,"utf8"),/Refresh delivery blocked/);
    // Once policy is repaired the same branch can be proposed and checked.
    writeFileSync(path.join(bin,"gh"),'#!/bin/sh\ncase "$*" in\n *"--state all"*) echo 0;;\n "pr create"*) echo "https://github.com/test/project/pull/123";;\nesac\n',{mode:0o755});
    const result=execFileSync("bash",[script,"climate","Refresh",snapshot],{cwd,env:{...env,GITHUB_RUN_ID:"102"},encoding:"utf8",stdio:["ignore","pipe","pipe"]});
    assert.match(result,/Recovering preserved climate proposal/);
    assert.equal(git("ls-remote","--heads","origin","refs/heads/data/refresh-climate-*"),preserved);
  } finally {rmSync(root,{recursive:true,force:true});}
});
