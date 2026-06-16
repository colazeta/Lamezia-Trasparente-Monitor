#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const REPORT_PATH = process.env.PR_GUARD_REPORT || ".hook-reports/pr-guard.md";
const STATUS_PATH = process.env.PR_GUARD_STATUS || ".hook-reports/pr-guard-status.json";
const MAX_TEXT_BYTES = 1_000_000;

const blockers = [];
const warnings = [];
const notes = [];

function runGit(args) {
  return execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function changedFiles() {
  const baseSha = process.env.BASE_SHA?.trim();
  const headSha = process.env.HEAD_SHA?.trim() || "HEAD";

  const attempts = [];
  if (baseSha) attempts.push([baseSha, headSha]);
  attempts.push(["origin/main", "HEAD"], ["main", "HEAD"]);

  for (const [base, head] of attempts) {
    try {
      return splitLines(runGit(["diff", "--name-only", `${base}...${head}`]));
    } catch {
      // Try the next strategy.
    }
  }

  warnings.push("Unable to determine changed files from git diff; metadata checks were limited.");
  return [];
}

function readTextFile(relativePath) {
  const absolutePath = path.resolve(relativePath);
  if (!existsSync(absolutePath)) return null;

  let stats;
  try {
    stats = statSync(absolutePath);
  } catch {
    return null;
  }

  if (!stats.isFile() || stats.size > MAX_TEXT_BYTES) return null;

  let content;
  try {
    content = readFileSync(absolutePath, "utf8");
  } catch {
    return null;
  }

  if (content.includes("\u0000")) return null;
  return content;
}

function listWorkflowFiles() {
  const workflowDir = path.resolve(".github/workflows");
  if (!existsSync(workflowDir)) return [];

  return readdirSync(workflowDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ya?ml)$/i.test(entry.name))
    .map((entry) => path.join(".github/workflows", entry.name));
}

function checkConflictMarkers(files) {
  const markerPattern = /^(<<<<<<<|=======|>>>>>>>)(?: .*)?$/m;
  for (const file of files) {
    const content = readTextFile(file);
    if (content && markerPattern.test(content)) {
      blockers.push(`Conflict marker found in \`${file}\`.`);
    }
  }
}

function checkSecrets(files) {
  const secretPatterns = [
    {
      name: "GitHub token",
      pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/,
    },
    {
      name: "OpenAI-style API key",
      pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/,
    },
    {
      name: "AWS access key id",
      pattern: /\bAKIA[0-9A-Z]{16}\b/,
    },
    {
      name: "private key block",
      pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
    },
  ];

  for (const file of files) {
    const content = readTextFile(file);
    if (!content) continue;

    for (const { name, pattern } of secretPatterns) {
      if (pattern.test(content)) {
        blockers.push(`Possible ${name} committed in \`${file}\`.`);
      }
    }
  }
}

function normaliseRunsOn(value) {
  return value
    .replace(/#.*/, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function checkZeroCostWorkflowPolicy() {
  const workflowFiles = listWorkflowFiles();

  for (const file of workflowFiles) {
    const content = readTextFile(file);
    if (!content) continue;

    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      const match = line.match(/^\s*runs-on:\s*(.+?)\s*$/);
      if (!match) return;

      const value = normaliseRunsOn(match[1]);
      if (value !== "ubuntu-latest") {
        blockers.push(
          `Zero-cost runner policy violation in \`${file}:${index + 1}\`: \`runs-on: ${value}\`. Use \`ubuntu-latest\` only.`,
        );
      }
    });

    if (/larger runner|gpu runner|self-hosted/i.test(content)) {
      warnings.push(
        `\`${file}\` mentions larger, GPU or self-hosted runners. Confirm this is documentation only or remove it from executable workflow logic.`,
      );
    }

    if (/cron:\s*["']?\*\/(?:[1-5]?\d)\s+\*\s+\*\s+\*\s+\*/.test(content) || /cron:\s*["']?\*\s+\*\s+\*\s+\*\s+\*/.test(content)) {
      warnings.push(
        `\`${file}\` appears to contain a high-frequency schedule. Keep scheduled workflows hourly or slower unless Giovanni explicitly approves.`,
      );
    }
  }

  notes.push(`Zero-cost workflow policy checked across ${workflowFiles.length} workflow file(s).`);
}

function getPullRequestMetadata() {
  let eventPullRequest = {};
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && existsSync(eventPath)) {
    try {
      eventPullRequest = JSON.parse(readFileSync(eventPath, "utf8")).pull_request || {};
    } catch {
      warnings.push("Unable to parse GITHUB_EVENT_PATH for pull-request metadata.");
    }
  }

  return {
    title: process.env.PR_TITLE || eventPullRequest.title || "",
    body: process.env.PR_BODY || eventPullRequest.body || "",
  };
}

function checkPullRequestBody(files) {
  const { title, body } = getPullRequestMetadata();
  const combined = `${title}\n${body}`;

  if (!/(close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#\d+|#\d+/i.test(combined)) {
    warnings.push("PR does not clearly reference an issue number.");
  }

  if (!/Human Decision Ledger/i.test(body)) {
    warnings.push("PR body does not contain a `Human Decision Ledger` section.");
  }

  if (!/(source\/limitations|source limitations|fonti|limiti|methodological caveat|civic safeguard)/i.test(body)) {
    warnings.push("PR body does not document the source/limitations or civic-safeguard check.");
  }

  if (!/(zero-cost|ubuntu-latest|no paid runner|paid runner)/i.test(body)) {
    warnings.push("PR body does not explicitly confirm the zero-cost automation check.");
  }

  const civicContentFiles = files.filter((file) =>
    /^(data|datasets|content|public\/data|docs\/(dossiers|scouting|sources|fonti|methodology)|artifacts\/lamezia-trasparente\/src\/(data|content|features|pages)|lib\/api-spec|scripts\/(source|civic|registr|check-source))/i.test(
      file,
    ),
  );

  if (civicContentFiles.length > 0) {
    notes.push(`Potential civic-content/source-impact files: ${civicContentFiles.map((file) => `\`${file}\``).join(", ")}.`);

    if (!/(retrieved_at|source_url|verification_status|claim_type|limitations|fonti|limiti|caveat)/i.test(body)) {
      warnings.push(
        "This PR appears to touch civic content, data, API/source logic or methodology, but the PR body does not record source metadata, limitations or verification status.",
      );
    }
  }
}

function writeReport(files) {
  const outcome = blockers.length > 0 ? "BLOCKED" : warnings.length > 0 ? "PASSED WITH WARNINGS" : "PASSED";
  const humanAction =
    blockers.length > 0
      ? "Do not merge until the blockers below are resolved."
      : warnings.length > 0
        ? "Review warnings before merge; the hook is advisory for these items in the v0 phase."
        : "No hook-specific blocker detected; proceed with ordinary review.";

  const changedFileList =
    files.length > 0 ? files.map((file) => `- \`${file}\``).join("\n") : "- No changed files detected by the hook.";

  const section = (title, values) =>
    values.length > 0 ? `\n### ${title}\n${values.map((value) => `- ${value}`).join("\n")}\n` : "";

  const report = `<!-- ltm-hook-guard -->
## Hook guard — Lamezia Trasparente Monitor

**Status:** ${outcome}  
**Cost posture:** zero-spend policy checked; executable workflows must use standard \`ubuntu-latest\` runners only.  
**Human action:** ${humanAction}

### Changed files inspected
${changedFileList}
${section("Blockers", blockers)}${section("Warnings", warnings)}${section("Notes", notes)}
### Human Decision Ledger

- **Decision:** ${blockers.length > 0 ? "NON MERGIARE" : warnings.length > 0 ? "REVIEW MANUALE" : "MERGE POSSIBILE DOPO REVIEW ORDINARIA"}
- **Reason:** ${blockers.length > 0 ? "Critical repository, secret, conflict-marker or zero-cost-policy blocker detected." : warnings.length > 0 ? "No hard blocker, but metadata/checklist warnings remain." : "No hook-specific blocker detected."}
- **Validation:** this hook checks PR metadata, changed-file hygiene, secret patterns, conflict markers, civic source/limitations signalling and workflow runner policy.
- **Residual risk:** this hook does not certify factual accuracy, legal safety, deploy success, or completeness of civic data.
`;

  mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, report);
  writeFileSync(
    STATUS_PATH,
    JSON.stringify(
      {
        status: outcome,
        blocker_count: blockers.length,
        warning_count: warnings.length,
        changed_files: files,
      },
      null,
      2,
    ),
  );

  console.log(report);
}

const files = changedFiles();
checkConflictMarkers(files);
checkSecrets(files);
checkZeroCostWorkflowPolicy();
checkPullRequestBody(files);
writeReport(files);

if (blockers.length > 0) {
  process.exitCode = 1;
}
