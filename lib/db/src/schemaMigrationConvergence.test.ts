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

test("schema convergence migration remains tracked by the Drizzle journal", () => {
  const entry = journal.entries.find(
    (candidate: { tag?: string }) =>
      candidate.tag === "0017_conversations_messages_convergence",
  );
  assert.ok(entry, "0017 convergence migration must remain in the journal");
  assert.equal(entry.idx, 17);
  assert.equal(entry.breakpoints, true);

  const duplicateEntries = journal.entries.filter(
    (candidate: { tag?: string }) =>
      candidate.tag === "0017_conversations_messages_convergence",
  );
  assert.equal(duplicateEntries.length, 1);
});
