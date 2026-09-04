import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  VERIFIED_LOCAL_ANAC_METADATA_SCHEMA,
  ingestVerifiedLocalAnacOperatorArchive,
  validateVerifiedLocalAnacArchiveMetadata,
} from "./anacOperatorLocalArchive";

const acquiredAt = "2026-09-02T19:30:00.000Z";
const generatedAt = "2026-09-04T06:45:00.000Z";
const officialParticipantsUrl =
  "https://dati.anticorruzione.it/opendata/download/dataset/partecipanti/filesystem/partecipanti_csv.zip";
const officialAwardeesUrl =
  "https://dati.anticorruzione.it/opendata/download/dataset/aggiudicatari/filesystem/aggiudicatari_csv.zip";
const participantZipBase64 =
  "UEsDBBQAAAAIAKA1JF1Tip84cwAAAH4AAAAQAAAAcGFydGVjaXBhbnRpLmNzdi3KUQrCMAwA0P+dwgsI6XS2kq+IDoTpx+YFSlZLYDSSVc8vgr+Px5KRdRZOvawcl4Qyp1LlKRyrfPSvl7UmU7SYRUualOVX7a2L4itatWxFm5Nrd/vu4MMRAYJzvoUuACINPW2mcUBw2xvdz/Sg8Uromy9QSwECFAMUAAAACACgNSRdU4qfOHMAAAB+AAAAEAAAAAAAAAAAAAAAgAEAAAAAcGFydGVjaXBhbnRpLmNzdlBLBQYAAAAAAQABAD4AAAChAAAAAAA=";

function participantMetadata() {
  return {
    schema_version: VERIFIED_LOCAL_ANAC_METADATA_SCHEMA,
    dataset: "participants" as const,
    official_archive_url: officialParticipantsUrl,
    acquired_at: acquiredAt,
    catalog_resource_id: "partecipanti-csv",
    catalog_metadata_url:
      "https://data.europa.eu/data/datasets/partecipanti-anac",
  };
}

async function writeFixtureArchive(directory: string): Promise<string> {
  const archivePath = path.join(directory, "partecipanti_csv.zip");
  await writeFile(archivePath, Buffer.from(participantZipBase64, "base64"));
  return archivePath;
}

async function writeMetadata(
  directory: string,
  value: unknown,
): Promise<string> {
  const metadataPath = path.join(directory, "archive.metadata.json");
  await writeFile(metadataPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return metadataPath;
}

describe("verified local ANAC operator archive ingestion", () => {
  it("ingests a valid official archive with explicit local provenance", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "anac-local-valid-"));
    try {
      const archivePath = await writeFixtureArchive(directory);
      const metadataPath = await writeMetadata(directory, participantMetadata());
      const outputPath = path.join(directory, "latest.json");
      const archiveBytes = Buffer.from(participantZipBase64, "base64");
      const expectedSha = createHash("sha256")
        .update(archiveBytes)
        .digest("hex");

      const snapshot = await ingestVerifiedLocalAnacOperatorArchive({
        dataset: "participants",
        archivePath,
        metadataPath,
        trackedCigs: ["B123456789", "A01D5289C5"],
        outputPath,
        generatedAt,
      });

      assert.equal(snapshot.schemaVersion, "anac-operators.v1");
      assert.equal(snapshot.dataset, "participants");
      assert.equal(snapshot.source.selection, "verified-local-archive");
      assert.equal(snapshot.source.archiveUrl, officialParticipantsUrl);
      assert.equal(snapshot.source.acquiredAt, acquiredAt);
      assert.equal(snapshot.source.archiveSha256, expectedSha);
      assert.equal(snapshot.source.archiveBytes, archiveBytes.byteLength);
      assert.equal(snapshot.source.csvEntry, "partecipanti.csv");
      assert.equal(snapshot.recordsScanned, 1);
      assert.equal(snapshot.matchedSourceRecords, 1);
      assert.equal(snapshot.records.length, 1);
      assert.equal(
        snapshot.records[0]?.operatorKey,
        "IT-CODICE-FISCALE:00811720580",
      );
      assert.deepEqual(snapshot.records[0]?.sourceRecordNumbers, [1]);
      assert.equal(snapshot.coverage.trackedCigs, 2);
      assert.equal(snapshot.coverage.cigsWithRecords, 1);

      assert.deepEqual(
        JSON.parse(await readFile(outputPath, "utf8")),
        snapshot,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("fails before reading the archive when the provenance dataset mismatches", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "anac-local-mismatch-"));
    try {
      const archivePath = await writeFixtureArchive(directory);
      const metadataPath = await writeMetadata(directory, participantMetadata());
      await assert.rejects(
        ingestVerifiedLocalAnacOperatorArchive({
          dataset: "awardees",
          archivePath,
          metadataPath,
          trackedCigs: ["B123456789"],
          outputPath: path.join(directory, "latest.json"),
          generatedAt,
        }),
        /metadata dataset mismatch/u,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("rejects incomplete or untrusted provenance metadata", () => {
    assert.throws(
      () =>
        validateVerifiedLocalAnacArchiveMetadata(
          {
            schema_version: VERIFIED_LOCAL_ANAC_METADATA_SCHEMA,
            dataset: "participants",
            official_archive_url: "https://example.org/partecipanti.zip",
            acquired_at: acquiredAt,
          },
          "participants",
        ),
      /official_archive_url/u,
    );
    assert.throws(
      () =>
        validateVerifiedLocalAnacArchiveMetadata(
          {
            schema_version: VERIFIED_LOCAL_ANAC_METADATA_SCHEMA,
            dataset: "participants",
            official_archive_url: officialParticipantsUrl,
          },
          "participants",
        ),
      /acquired_at/u,
    );
  });

  it("fails closed when the metadata sidecar is missing", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "anac-local-no-meta-"));
    try {
      const archivePath = await writeFixtureArchive(directory);
      await assert.rejects(
        ingestVerifiedLocalAnacOperatorArchive({
          dataset: "participants",
          archivePath,
          metadataPath: path.join(directory, "missing.metadata.json"),
          trackedCigs: ["B123456789"],
          outputPath: path.join(directory, "latest.json"),
          generatedAt,
        }),
        /Cannot read verified local ANAC metadata/u,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("rejects an archive whose CSV schema belongs to the other dataset", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "anac-local-wrong-dataset-"));
    try {
      const archivePath = await writeFixtureArchive(directory);
      const metadataPath = await writeMetadata(directory, {
        ...participantMetadata(),
        dataset: "awardees",
        official_archive_url: officialAwardeesUrl,
      });
      const outputPath = path.join(directory, "latest.json");
      await assert.rejects(
        ingestVerifiedLocalAnacOperatorArchive({
          dataset: "awardees",
          archivePath,
          metadataPath,
          trackedCigs: ["B123456789"],
          outputPath,
          generatedAt,
        }),
        /missing required columns/u,
      );
      await assert.rejects(readFile(outputPath, "utf8"), { code: "ENOENT" });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("rejects a non-ZIP local file before parsing or publication", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "anac-local-not-zip-"));
    try {
      const archivePath = path.join(directory, "partecipanti_csv.zip");
      await writeFile(archivePath, "not a zip archive", "utf8");
      const metadataPath = await writeMetadata(directory, participantMetadata());
      const outputPath = path.join(directory, "latest.json");
      await assert.rejects(
        ingestVerifiedLocalAnacOperatorArchive({
          dataset: "participants",
          archivePath,
          metadataPath,
          trackedCigs: ["B123456789"],
          outputPath,
          generatedAt,
        }),
        /not a ZIP archive/u,
      );
      await assert.rejects(readFile(outputPath, "utf8"), { code: "ENOENT" });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
