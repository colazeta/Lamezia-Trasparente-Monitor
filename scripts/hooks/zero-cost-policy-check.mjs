#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const workflowDir = ".github/workflows";
const violations = [];

function readWorkflowFiles() {
  if (!existsSync(workflowDir)) return [];
  return readdirSync(workflowDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ya?ml)$/i.test(entry.name))
    .map((entry) => path.join(workflowDir, entry.name));
}

for (const file of readWorkflowFiles()) {
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const match = line.match(/^\s*runs-on:\s*(.+?)\s*$/);
    if (!match) return;

    const value = match[1].replace(/#.*/, "").replace(/^["']|["']$/g, "").trim();
    if (value !== "ubuntu-latest") {
      violations.push(`${file}:${index + 1} uses runs-on: ${value}; use ubuntu-latest only.`);
    }
  });
}

if (violations.length > 0) {
  console.error("Zero-cost automation policy violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Zero-cost automation policy passed: executable workflows use ubuntu-latest only.");
}
