import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrations = path.resolve(here, "..", "migrations");
const sql = readFileSync(
  path.join(migrations, "0017_conversations_messages_convergence.sql"),
  "utf8",
);
const journal = JSON.parse(
  readFileSync(path.join(migrations, "meta", "_journal.json"), "utf8"),
);

test("legacy application tables are reproducible without breaking push-bootstrapped databases", () => {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS "conversations"/);
  assert.match(sql, /"title" text NOT NULL/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS "messages"/);
  assert.match(sql, /"conversation_id" integer NOT NULL/);
  assert.match(
    sql,
    /FOREIGN KEY \("conversation_id"\) REFERENCES "conversations"\("id"\)[\s\S]*ON DELETE cascade/,
  );
});

test("schema convergence migration is tracked by the Drizzle journal", () => {
  const last = journal.entries.at(-1);
  assert.equal(last?.idx, 17);
  assert.equal(last?.tag, "0017_conversations_messages_convergence");
  assert.equal(last?.breakpoints, true);
});
