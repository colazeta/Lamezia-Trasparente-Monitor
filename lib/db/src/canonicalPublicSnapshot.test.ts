import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Pool } from "pg";
import { sourceSnapshotManifest } from "./sourceSnapshotManifest";
import {
  planSourceSnapshot,
  persistSourceSnapshot,
} from "./sourceSnapshotPersistence";
import { reconcileCanonicalAlbo } from "./canonicalAlbo";
import { reconcileCanonicalPnrr } from "./canonicalPnrr";
import {
  readCanonicalPublicSnapshot,
  projectCanonicalPublicSnapshot,
  type CanonicalPublicBundle,
} from "./canonicalPublicSnapshot";
import { canonicalPublicSnapshotSql } from "./canonicalPublicSnapshotSql";

test("canonical public snapshot: real PostgreSQL evidence, parity, read-only repeatability and fail-closed projection", async (t) => {
  const db = new PGlite();
  const client = {
    query: async (sql: string, values: unknown[] = []) =>
      db.query<Record<string, unknown>>(sql, values),
    release: () => {},
  };
  const pool = { connect: async () => client } as unknown as Pick<
    Pool,
    "connect"
  >;
  try {
    const migrations = new URL("../migrations/", import.meta.url);
    const journal = JSON.parse(
      await readFile(new URL("meta/_journal.json", migrations), "utf8"),
    );
    for (const e of journal.entries)
      await db.exec(
        await readFile(new URL(`${e.tag}.sql`, migrations), "utf8"),
      );
    for (const s of sourceSnapshotManifest.filter(
      (s) =>
        s.key.startsWith("lamezia.albo.") || s.key === "lamezia.pnrr.municipal",
    ))
      await persistSourceSnapshot(
        client,
        planSourceSnapshot(
          s,
          await readFile(new URL(`../../../${s.path}`, import.meta.url)),
          "a".repeat(40),
        ),
        { reconcilePnrr: true },
      );
    await reconcileCanonicalAlbo(pool);
    await reconcileCanonicalPnrr(pool);
    const before = (
      await db.query("SELECT count(*)::integer n FROM core_assertions")
    ).rows;
    const result = await readCanonicalPublicSnapshot(pool);
    assert.equal(result.reconciliation.unexplained_differences, 0);
    assert.equal(result.pnrr.projects.length, 30);
    assert.equal(result.albo.items.length, 125);
    assert.equal(result.alboArchive.items.length, 66);
    assert.deepEqual(await readCanonicalPublicSnapshot(pool), result);
    assert.deepEqual(
      (await db.query("SELECT count(*)::integer n FROM core_assertions")).rows,
      before,
    );
    const original = (
      await db.query<{ bundle: CanonicalPublicBundle }>(
        canonicalPublicSnapshotSql,
      )
    ).rows[0].bundle;
    await t.test(
      "every restriction is counted and raw/private fields never appear",
      () => {
        assert.equal(result.reconciliation.withheld_albo_records, 28);
        assert.ok(!JSON.stringify(result).includes('"content_text"'));
        assert.ok(!JSON.stringify(result).includes('"payload"'));
        assert.ok(
          result.albo.items.every(
            (r: any) => r.public_visibility !== "publishable_with_minimisation",
          ),
        );
        for (const r of result.albo.items.filter(
          (r: any) => r.public_visibility === "metadata_only",
        ))
          assert.equal(r.document_url, null);
      },
    );
    for (const [name, mutate] of [
      [
        "typed title corruption",
        (b: CanonicalPublicBundle) => {
          b.projects[0].title = "corrupted";
        },
      ],
      [
        "missing canonical publication version",
        (b: CanonicalPublicBundle) => {
          b.versions.pop();
        },
      ],
      [
        "wrong selected field evidence",
        (b: CanonicalPublicBundle) => {
          b.fields[0].source_record_id = b.records[0].id;
        },
      ],
      [
        "missing release record",
        (b: CanonicalPublicBundle) => {
          b.records.pop();
        },
      ],
      [
        "source byte corruption",
        (b: CanonicalPublicBundle) => {
          b.releases[0].content_text += " ";
        },
      ],
      [
        "missing act evidence",
        (b: CanonicalPublicBundle) => {
          b.actLinks.pop();
        },
      ],
      [
        "wrong classification",
        (b: CanonicalPublicBundle) => {
          b.classifications[0].concept_code = "wrong";
        },
      ],
      [
        "wrong CUP evidence property",
        (b: CanonicalPublicBundle) => {
          b.identifiers[0].evidence_property = "project.title";
        },
      ],
    ] as const)
      await t.test(name, () => {
        const b = structuredClone(original);
        mutate(b);
        assert.throws(() => projectCanonicalPublicSnapshot(b));
      });
    await t.test(
      "a new release keeps historical CUP evidence and updates selected field evidence",
      async () => {
        const source = sourceSnapshotManifest.find(
          (s) => s.key === "lamezia.pnrr.municipal",
        )!;
        const raw = await readFile(
          new URL(`../../../${source.path}`, import.meta.url),
          "utf8",
        );
        await persistSourceSnapshot(
          client,
          planSourceSnapshot(source, Buffer.from(raw + "\n"), "b".repeat(40)),
          { reconcilePnrr: true },
        );
        await reconcileCanonicalPnrr(pool);
        const next = await readCanonicalPublicSnapshot(pool);
        assert.equal(next.pnrr.projects.length, 30);
        assert.notEqual(
          next.sources.find((s) => s.source_key === source.key)!.release_id,
          result.sources.find((s) => s.source_key === source.key)!.release_id,
        );
        assert.equal(
          next.pnrr.projects[0].canonical.project_id,
          result.pnrr.projects[0].canonical.project_id,
        );
        const bundle = (
          await db.query<{ bundle: CanonicalPublicBundle }>(
            canonicalPublicSnapshotSql,
          )
        ).rows[0].bundle;
        assert.ok(
          bundle.identifiers.some(
            (i) => !bundle.records.some((r) => r.id === i.source_record_id),
          ),
        );
        assert.equal(next.reconciliation.unexplained_differences, 0);
      },
    );
    await t.test(
      "database reader rejects drift without returning a partial snapshot",
      async () => {
        await db.exec("UPDATE project_projects SET title='unexplained edit'");
        await assert.rejects(
          () => readCanonicalPublicSnapshot(pool),
          /PUBLIC_PROJECTION_CANONICAL_DRIFT/,
        );
        assert.equal(
          (
            await db.query<{ n: number }>(
              "SELECT count(*)::integer n FROM project_projects",
            )
          ).rows[0].n,
          30,
        );
      },
    );
  } finally {
    await db.close();
  }
});
