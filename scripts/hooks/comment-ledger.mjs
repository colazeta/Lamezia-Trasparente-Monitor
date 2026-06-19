#!/usr/bin/env node
import { readFileSync } from "node:fs";
import process from "node:process";

const reportPath = process.argv[2] || process.env.HOOK_REPORT_PATH || ".hook-reports/pr-guard.md";
const marker = process.env.COMMENT_MARKER || "<!-- ltm-hook-guard -->";
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER || process.env.GITHUB_PR_NUMBER;
const apiUrl = process.env.GITHUB_API_URL || "https://api.github.com";

function required(value, label) {
  if (!value) {
    throw new Error(`Missing ${label}.`);
  }
  return value;
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status} for ${path}: ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function main() {
  required(token, "GITHUB_TOKEN");
  required(repository, "GITHUB_REPOSITORY");
  required(prNumber, "PR_NUMBER");

  const body = readFileSync(reportPath, "utf8");
  if (!body.includes(marker)) {
    throw new Error(`Report does not include expected marker ${marker}.`);
  }

  const comments = await githubRequest(`/repos/${repository}/issues/${prNumber}/comments?per_page=100`);
  const existing = comments.find((comment) => comment.body?.includes(marker));

  if (existing) {
    await githubRequest(`/repos/${repository}/issues/comments/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ body }),
    });
    console.log(`Updated hook guard comment ${existing.id}.`);
  } else {
    await githubRequest(`/repos/${repository}/issues/${prNumber}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    console.log("Created hook guard comment.");
  }
}

main().catch((error) => {
  console.warn(error instanceof Error ? error.message : String(error));
  process.exitCode = 0;
});
