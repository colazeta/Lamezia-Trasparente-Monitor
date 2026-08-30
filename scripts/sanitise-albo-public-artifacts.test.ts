import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { sanitiseAlboPublicArtifacts } from "./sanitise-albo-public-artifacts";
import { ALBO_PRETORIO_LAMEZIA_SOURCE } from "./albo-source-config";

test("sanitises committed public artifacts and is idempotent", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-public-sanitiser-"));
  const outDir = path.join(tmp, "data");
  const publicDir = path.join(outDir, "public", "albo");
  const digest = "c".repeat(64);
  const storagePath = `data/public/albo/documents/2026/${digest}.pdf`;
  const documentPath = path.join(
    outDir,
    "public",
    "albo",
    "documents",
    "2026",
    `${digest}.pdf`,
  );
  const orphanDigest = "e".repeat(64);
  const orphanStoragePath = `data/public/albo/documents/2026/${orphanDigest}.pdf`;
  const orphanDocumentPath = path.join(
    outDir,
    "public",
    "albo",
    "documents",
    "2026",
    `${orphanDigest}.pdf`,
  );
  const documentUrl =
    "https://albo.tinnvision.cloud/allegati/2026_4301_2_P?ente=00301390795";
  const record = {
    id: "albo-2026-4301",
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    retrieved_at: "2026-06-18T10:00:00.000Z",
    publication_number: "2026/4301",
    publication_start: "2026-06-18",
    publication_end: "2026-07-03",
    office: "UFFICIO NOTIFICHE",
    act_type: "ART.143 CPC (CODICE PROCEDURA CIVILE)",
    act_number: null,
    act_date: null,
    content_hash: "d".repeat(64),
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
    known_limits: [],
    subject:
      "AFFISSIONE ALL'ALBO NEI CONFRONTI DI PERSONA FITTIZIA ART. 143 C.P.C.",
    document_url: documentUrl,
    public_note: null,
  };
  const counts = {
    acquired: 1,
    new: 1,
    changed: 0,
    removed: 0,
    unchanged: 0,
    publishable: 1,
    minimised: 0,
    metadata_only: 0,
    excluded: 0,
  };

  await mkdir(path.dirname(documentPath), { recursive: true });
  await writeFile(documentPath, "previously archived", "utf8");
  await writeFile(orphanDocumentPath, "orphaned manifest document", "utf8");
  await writeJson(path.join(publicDir, "latest.json"), {
    retrieved_at: record.retrieved_at,
    counts,
    known_limits: [],
    items: [record],
    excluded: [],
  });
  await writeJson(path.join(publicDir, "diff-latest.json"), {
    counts,
    known_limits: [],
    diff: {
      new: [record],
      changed: [{ before: record, after: record }],
      removed: [record],
      unchanged: [record],
    },
  });
  await writeJson(path.join(publicDir, "documents-manifest.json"), {
    policy: {},
    counts: { revoked: 0 },
    documents: [
      {
        id: record.id,
        document_url: documentUrl,
        storage_path: storagePath,
      },
      {
        id: "albo-2026-9999",
        document_url: "https://albo.tinnvision.cloud/allegati/orphan.pdf",
        storage_path: orphanStoragePath,
      },
    ],
    decisions: [
      {
        id: record.id,
        document_url: documentUrl,
        preservation_status: "archived",
        reason: "eligible_low_risk_publishable_pdf",
      },
      {
        id: "albo-2026-9999",
        document_url: "https://albo.tinnvision.cloud/allegati/orphan.pdf",
        preservation_status: "archived",
        reason: "eligible_low_risk_publishable_pdf",
      },
    ],
  });
  await writeJson(path.join(publicDir, "status.json"), {
    counts,
    known_limits: [],
  });
  await writeFile(
    path.join(publicDir, "run-latest.md"),
    [
      "Atti acquisiti: 1",
      "Nuovi atti: 1",
      "Modificati: 0",
      "Rimossi/non piu' presenti: 0",
      "Invariati: 0",
      "Pubblicabili: 1",
      "Minimizzati: 0",
      "Solo metadato: 0",
      "Esclusi dal public layer: 0",
    ].join("\n"),
    "utf8",
  );

  try {
    const first = await sanitiseAlboPublicArtifacts(outDir);
    const firstOutputs = await readOutputs(publicDir);
    const second = await sanitiseAlboPublicArtifacts(outDir);
    const outputs = await readOutputs(publicDir);
    const serialised = outputs.join("\n");
    const latest = JSON.parse(outputs[0] ?? "{}") as {
      counts: Record<string, number>;
      items: Array<Record<string, unknown>>;
    };
    const manifest = JSON.parse(outputs[2] ?? "{}") as {
      counts: Record<string, number>;
      documents: unknown[];
      decisions: Array<Record<string, unknown>>;
    };

    assert.equal(first.revoked_documents.length, 2);
    assert.equal(second.revoked_documents.length, 0);
    assert.deepEqual(outputs, firstOutputs);
    assert.equal(latest.items[0]?.public_visibility, "metadata_only");
    assert.equal(latest.counts.publishable, 0);
    assert.equal(latest.counts.metadata_only, 1);
    assert.equal(manifest.documents.length, 0);
    assert.equal(manifest.decisions[0]?.reason, "privacy_excluded");
    assert.equal(manifest.counts.revoked, 2);
    assert.doesNotMatch(serialised, /PERSONA FITTIZIA/i);
    assert.doesNotMatch(serialised, /2026_4301_2_P/i);
    await assert.rejects(readFile(documentPath));
    await assert.rejects(readFile(orphanDocumentPath));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

function readOutputs(publicDir: string): Promise<string[]> {
  return Promise.all(
    [
      "latest.json",
      "diff-latest.json",
      "documents-manifest.json",
      "status.json",
      "run-latest.md",
    ].map((file) => readFile(path.join(publicDir, file), "utf8")),
  );
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
