#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const workflowDir = ".github/workflows";
const expectedRunner = "ubuntu-latest";
const violations = [];

function readWorkflowFiles() {
  if (!existsSync(workflowDir)) return [];
  return readdirSync(workflowDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ya?ml)$/i.test(entry.name))
    .map((entry) => path.join(workflowDir, entry.name));
}

function indent(line) {
  return line.length - line.trimStart().length;
}

function clean(value) {
  return value
    .replace(/#.*/, "")
    .trim()
    .replace(/^['\"]|['\"]$/g, "")
    .trim();
}

function parseInline(value) {
  const trimmed = clean(value);
  if (!trimmed) return { values: [], display: "empty" };
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return {
      values: trimmed
        .slice(1, -1)
        .split(",")
        .map(clean)
        .filter(Boolean),
      display: trimmed,
    };
  }
  return { values: [trimmed], display: trimmed };
}

function parseBlock(lines, startIndex, parentIndent) {
  const values = [];
  const display = [];
  let nextIndex = startIndex + 1;

  for (; nextIndex < lines.length; nextIndex += 1) {
    const line = lines[nextIndex];
    const trimmed = clean(line.trim());
    if (!trimmed) continue;
    if (indent(line) <= parentIndent) break;

    display.push(trimmed);
    if (trimmed.startsWith("-")) {
      const value = clean(trimmed.slice(1));
      if (value) values.push(value);
    } else {
      values.push(trimmed);
    }
  }

  return { values, display: display.join(" | ") || "empty multiline runs-on", nextIndex };
}

function validate(file, lineNumber, parsed) {
  if (parsed.values.length === 1 && parsed.values[0] === expectedRunner) return;
  violations.push(
    `${file}:${lineNumber} uses unsupported runs-on value ${JSON.stringify(parsed.display)}; use only ${expectedRunner}.`,
  );
}

for (const file of readWorkflowFiles()) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s*)runs-on\s*:\s*(.*)$/);
    if (!match) continue;

    const parsed = match[2].trim()
      ? parseInline(match[2])
      : parseBlock(lines, index, match[1].length);

    validate(file, index + 1, parsed);

    if (!match[2].trim()) index = Math.max(index, parsed.nextIndex - 1);
  }
}

if (violations.length > 0) {
  console.error("Zero-cost automation policy violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Zero-cost automation policy passed: executable workflows use ubuntu-latest only.");
}
