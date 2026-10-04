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
import { generateCanonicalUuidV7 } from "./canonicalIdentity";

const root = new URL("../../../", import.meta.url);
test("PostgreSQL migrations, real-source reconciliation, idempotence, provenance and rollback", async (t) => {
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
    const migrations = new URL("../migrations/", import.meta.url),
      journal = JSON.parse(
        await readFile(new URL("meta/_journal.json", migrations), "utf8"),
      );
    for (const e of journal.entries)
      await db.exec(
        await readFile(new URL(`${e.tag}.sql`, migrations), "utf8"),
      );
    const sources = sourceSnapshotManifest.filter((s) =>
      s.key.startsWith("lamezia.albo."),
    );
    let sourceRecords = 0;
    for (const s of sources) {
      const plan = planSourceSnapshot(
        s,
        await readFile(new URL(s.path, root)),
        "a".repeat(40),
      );
      sourceRecords += plan.records.length;
      await persistSourceSnapshot(client, plan);
    }
    let first: Awaited<ReturnType<typeof reconcileCanonicalAlbo>>;
    await t.test(
      "every acquired record receives a version, classification and resolution outcome",
      async () => {
        first = await reconcileCanonicalAlbo(pool);
        assert.equal(first.sourceRecords, sourceRecords);
        assert.equal(first.versions, sourceRecords);
        assert.equal(first.classifications, sourceRecords * 3);
        const rows = await db.query<{ n: number }>(
          "SELECT count(*)::integer AS n FROM source_records r LEFT JOIN document_publication_versions v ON v.source_record_id=r.id WHERE v.source_record_id IS NULL",
        );
        assert.equal(rows.rows[0].n, 0);
        assert.equal(
          (
            await db.query<{ n: number }>(
              "SELECT count(*)::integer AS n FROM procurement_contracts",
            )
          ).rows[0].n,
          0,
        );
      },
    );
    const identities = await db.query(
      "SELECT * FROM canonical_subjects ORDER BY subject_id",
    );
    const assertions = await db.query<{ n: number }>(
      "SELECT count(*)::integer AS n FROM core_assertions",
    );
    await t.test(
      "a repeated import preserves identity and all immutable evidence",
      async () => {
        const second = await reconcileCanonicalAlbo(pool);
        assert.deepEqual(second, first);
        assert.deepEqual(
          (
            await db.query(
              "SELECT * FROM canonical_subjects ORDER BY subject_id",
            )
          ).rows,
          identities.rows,
        );
        assert.deepEqual(
          (await db.query("SELECT count(*)::integer AS n FROM core_assertions"))
            .rows,
          assertions.rows,
        );
      },
    );
    await t.test(
      "a new source version preserves the previous publication title and identity",
      async () => {
        const source = sources.find((s) => s.key === "lamezia.albo.current")!;
        const x = JSON.parse(
          await readFile(new URL(source.path, root), "utf8"),
        );
        const r = x.items.find(
          (v: Record<string, unknown>) =>
            v.public_visibility === "publishable" && v.privacy_risk === "low",
        );
        const old = r.subject;
        r.subject = "Titolo revisionato nella fonte";
        const newPlan = planSourceSnapshot(
          source,
          Buffer.from(JSON.stringify(x)),
          "b".repeat(40),
        );
        await persistSourceSnapshot(client, newPlan);
        await reconcileCanonicalAlbo(pool);
        const rows = (
          await db.query<{ title: string; publication_id: string }>(
            "SELECT v.title,v.publication_id FROM document_publication_versions v JOIN document_publications p ON p.id=v.publication_id WHERE p.publication_number=$1 AND v.title IS NOT NULL",
            [r.publication_number],
          )
        ).rows;
        assert.ok(rows.some((v) => v.title === old));
        assert.ok(rows.some((v) => v.title === r.subject));
        assert.equal(new Set(rows.map((v) => v.publication_id)).size, 1);
      },
    );
    await t.test(
      "an unexplained persisted edit is rejected and the transaction rolls back",
      async () => {
        const ids = (
          await db.query<{ source_record_id: string }>(
            "SELECT source_record_id FROM document_publication_versions WHERE title='Titolo revisionato nella fonte'",
          )
        ).rows[0];
        await db.query(
          "UPDATE document_publication_versions SET title='unexplained edit' WHERE source_record_id=$1",
          [ids.source_record_id],
        );
        const archive = sources.find((s) => s.key === "lamezia.albo.delibere")!;
        const data = JSON.parse(
          await readFile(new URL(archive.path, root), "utf8"),
        );
        data.test_revision = "rollback proof";
        await persistSourceSnapshot(
          client,
          planSourceSnapshot(
            archive,
            Buffer.from(JSON.stringify(data)),
            "c".repeat(40),
          ),
        );
        const before = (
          await db.query("SELECT * FROM core_assertions ORDER BY id")
        ).rows;
        await assert.rejects(
          () => reconcileCanonicalAlbo(pool),
          /ALBO_VERSIONS_CONFLICT/,
        );
        assert.deepEqual(
          (await db.query("SELECT * FROM core_assertions ORDER BY id")).rows,
          before,
        );
        await db.query(
          "UPDATE document_publication_versions SET title='Titolo revisionato nella fonte' WHERE source_record_id=$1",
          [ids.source_record_id],
        );
      },
    );
    await t.test(
      "database rejects privacy expansion, cross-facet concepts and wrong subject kinds",
      async () => {
        const row = (
          await db.query<{ source_record_id: string }>(
            "SELECT source_record_id FROM document_publication_versions WHERE public_visibility <> 'publishable' LIMIT 1",
          )
        ).rows[0];
        await assert.rejects(
          () =>
            db.query(
              "UPDATE document_publication_versions SET title='withheld title' WHERE source_record_id=$1",
              [row.source_record_id],
            ),
          /document_versions_private_title/,
        );
        await assert.rejects(
          () =>
            db.query(
              "UPDATE taxonomy_classifications SET concept_code='procurement_relevance.confirmed' WHERE facet='document_type' AND status='classified'",
            ),
          /taxonomy_classifications_concept_fk/,
        );
        const id = generateCanonicalUuidV7();
        await db.query(
          "INSERT INTO canonical_subjects(subject_id,subject_kind,domain_type) VALUES ($1,'entity','party.person')",
          [id],
        );
        await assert.rejects(
          () =>
            db.query(
              "INSERT INTO document_publications(id,register_key,publication_number) VALUES ($1,'it.00301390795.albo','2026/999999')",
              [id],
            ),
          /document_publication_typed_subject_fk/,
        );
      },
    );
    await t.test(
      "source JSON/hash remains retrievable without moving private evidence to public output",
      async () => {
        const rows = (
          await db.query<{ content_text: string }>(
            "SELECT content_text FROM source_artifacts",
          )
        ).rows;
        assert.equal(rows.length, 4);
        for (const row of rows)
          assert.ok(JSON.parse(row.content_text).items.length > 0);
        assert.ok((await reconcileCanonicalAlbo(pool)).withheldRecords > 0);
      },
    );
    console.log(
      JSON.stringify({
        engine: "PostgreSQL (PGlite)",
        scope: "registered current/archive Albo public projections",
        sourceFiles: sources.map((s) => s.path),
        checkpoint: await reconcileCanonicalAlbo(pool),
      }),
    );
  } finally {
    await db.close();
  }
});
