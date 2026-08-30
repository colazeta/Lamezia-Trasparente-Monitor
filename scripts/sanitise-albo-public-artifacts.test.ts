import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { sanitiseAlboPublicArtifacts } from "./sanitise-albo-public-artifacts";
import { classifyAlboRecordCategory } from "./albo-classification-dictionary";
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
  const archiveDocumentUrl =
    "https://albo.tinnvision.cloud/allegati/2026_4302_2_P?ente=00301390795";
  const archiveRecord = {
    id: "albo-2026-4302",
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    retrieved_at: "2026-06-18T10:00:00.000Z",
    publication_number: "2026/4302",
    publication_start: "2026-06-18",
    publication_end: "2026-07-03",
    office: "SERVIZI DEMOGRAFICI",
    act_type: "DELIBERAZIONE DI GIUNTA",
    act_number: "42",
    act_date: "2026-06-17",
    content_hash: "f".repeat(64),
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
    classification: classifyAlboRecordCategory({
      office: "SERVIZI DEMOGRAFICI",
      act_type: "DELIBERAZIONE DI GIUNTA",
      subject: "PUBBLICAZIONE DI MATRIMONIO DI ROSSI MARIO",
    }),
    known_limits: [],
    subject: "PUBBLICAZIONE DI MATRIMONIO DI ROSSI MARIO",
    document_url: archiveDocumentUrl,
    public_note: null,
    deliberation_body: "giunta",
    presentation: {
      display_title: "Pubblicazione di matrimonio di Rossi Mario",
      action_id: null,
      action_label: null,
      search_text: "pubblicazione di matrimonio di rossi mario",
      standardisation: {
        profile_id: "legacy-test",
        profile_version: "1",
        input_field: "subject",
      },
    },
    first_observed_at: "2026-06-18T10:00:00.000Z",
    last_observed_at: "2026-06-18T10:00:00.000Z",
    archived_document: {
      id: "albo-2026-4302",
      publication_number: "2026/4302",
      source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
      source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
      retrieved_at: "2026-06-18T10:00:00.000Z",
      document_url: archiveDocumentUrl,
      public_visibility: "publishable",
      privacy_risk: "low",
      verification_status: "official_source_acquired",
      preservation_status: "archived",
      reason: "eligible_low_risk_publishable_pdf",
      storage_path: orphanStoragePath,
      sha256: orphanDigest,
      size_bytes: 28,
      content_type: "application/pdf",
    },
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
        id: archiveRecord.id,
        document_url: archiveDocumentUrl,
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
        id: archiveRecord.id,
        document_url: archiveDocumentUrl,
        preservation_status: "archived",
        reason: "eligible_low_risk_publishable_pdf",
      },
    ],
  });
  await writeJson(path.join(publicDir, "delibere-archive.json"), {
    generated_at: archiveRecord.retrieved_at,
    source: archiveRecord.source,
    source_url: archiveRecord.source_url,
    verification_status: archiveRecord.verification_status,
    coverage: {
      first_observed_at: archiveRecord.first_observed_at,
      last_observed_at: archiveRecord.last_observed_at,
      first_act_date: archiveRecord.act_date,
      last_act_date: archiveRecord.act_date,
    },
    counts: {
      total: 1,
      giunta: 1,
      consiglio: 0,
      altro: 0,
      publishable: 1,
      minimised: 0,
      metadata_only: 0,
      archived_documents: 1,
    },
    known_limits: [],
    items: [archiveRecord],
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
    const archivePath = path.join(publicDir, "delibere-archive.json");
    const validArchive = await readFile(archivePath, "utf8");
    await writeJson(archivePath, { items: [{ id: "malformed" }] });
    await assert.rejects(
      sanitiseAlboPublicArtifacts(outDir),
      /Invalid deliberations archive/i,
    );
    await assert.doesNotReject(readFile(documentPath));
    await assert.doesNotReject(readFile(orphanDocumentPath));
    await writeFile(archivePath, validArchive, "utf8");

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
    const archive = JSON.parse(outputs[3] ?? "{}") as {
      items: Array<Record<string, unknown>>;
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
    assert.equal(archive.items[0]?.public_visibility, "metadata_only");
    assert.equal(archive.items[0]?.archived_document, null);
    assert.match(String(archive.items[0]?.subject), /Metadato minimo/i);
    assert.match(
      String(
        (archive.items[0]?.presentation as Record<string, unknown> | undefined)
          ?.display_title,
      ),
      /Metadato minimo/i,
    );
    assert.doesNotMatch(serialised, /PERSONA FITTIZIA/i);
    assert.doesNotMatch(serialised, /2026_4301_2_P/i);
    assert.doesNotMatch(serialised, /ROSSI MARIO/i);
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
      "delibere-archive.json",
      "status.json",
      "run-latest.md",
    ].map((file) => readFile(path.join(publicDir, file), "utf8")),
  );
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
