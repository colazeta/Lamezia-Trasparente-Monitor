#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import process from "node:process";

const maxTextBytes = 1_000_000;
const strict = /^true$/i.test(process.env.STRICT_SOURCE_METADATA || "");

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function changedFiles() {
  const base = process.env.BASE_SHA || "origin/main";
  const head = process.env.HEAD_SHA || "HEAD";
  try {
    return git(["diff", "--name-only", `${base}...${head}`])
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function readText(file) {
  if (!existsSync(file)) return "";
  const stats = statSync(file);
  if (!stats.isFile() || stats.size > maxTextBytes) return "";
  const content = readFileSync(file, "utf8");
  return content.includes("\u0000") ? "" : content;
}

const sourceLikePath = /^(data|datasets|content|public\/data|docs\/(dossiers|scouting|sources|fonti|methodology)|artifacts\/lamezia-trasparente\/src\/(data|content|features|pages))/i;
const metadataTerms = /(source_url|source type|source_type|retrieved_at|verification_status|claim_type|legal_risk|limitations|limiti|fonti|caveat|methodolog)/i;

const files = changedFiles().filter((file) => sourceLikePath.test(file));
const missing = [];

for (const file of files) {
  const content = readText(file);
  if (content && !metadataTerms.test(content)) {
    missing.push(file);
  }
}

if (files.length === 0) {
  console.log("No civic source/content files detected in this change set.");
} else if (missing.length === 0) {
  console.log(`Source metadata terms detected for ${files.length} civic source/content file(s).`);
} else {
  console.log("Civic source/content files without obvious source-metadata terms:");
  for (const file of missing) console.log(`- ${file}`);
}

if (strict && missing.length > 0) {
  process.exitCode = 1;
}
