import { execFileSync } from "node:child_process";

const number = process.env.PR_NUMBER;
const repository = process.env.GITHUB_REPOSITORY;
if (!/^\d+$/.test(number ?? "") || !repository) {
  throw new Error("A numeric PR_NUMBER and GITHUB_REPOSITORY are required.");
}
const pr = JSON.parse(execFileSync("gh", ["api", `repos/${repository}/pulls/${number}`], { encoding: "utf8" }));
const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (pr.state !== "open" || pr.base.ref !== "main" || pr.head.repo.full_name !== repository || pr.head.sha !== head) {
  throw new Error("Dispatched guard must check the exact open, same-repository PR head targeting main.");
}
execFileSync(process.execPath, ["scripts/hooks/pr-guard.mjs"], {
  stdio: "inherit",
  env: { ...process.env, BASE_SHA: pr.base.sha, HEAD_SHA: pr.head.sha, PR_TITLE: pr.title, PR_BODY: pr.body ?? "" },
});
