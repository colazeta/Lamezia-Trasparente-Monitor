import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAnacOperatorsSnapshot } from "./anacOperators";
import {
  canonicalOperatorArchiveUrl,
  selectAnacOperatorArchive,
} from "./anacOperatorSource";
import {
  AnacOperatorsCsvMatcher,
  parseAnacOperatorsCsv,
} from "./anacOperatorsStreaming";

const acquiredAt = "2026-09-02T20:00:00.000Z";
const source = {
  url: "https://dati.anticorruzione.it/opendata/download/dataset/partecipanti/filesystem/partecipanti_csv.zip",
  acquiredAt,
};

const participantHeader =
  "cig;codiceFiscale;identificativoFiscaleEstero;ragioneSociale;ruolo;partrgrno";
const awardeeHeader =
  "cig;codiceFiscale;identificativoFiscaleEstero;ragioneSociale;ruolo;aggrgrno";

describe("ANAC operator identity ingestion", () => {
  it("uses a valid Italian fiscal identifier as the canonical operator key", () => {
    const parsed = parseAnacOperatorsCsv(
      `${participantHeader}\nB123456789;00811720580;;ALFA SRL;01-MANDATARIA;7\n`,
      "participants",
      new Set(["B123456789"]),
      source,
    );
    assert.equal(parsed.records.length, 1);
    assert.equal(parsed.records[0]?.operatorKey, "IT-CODICE-FISCALE:00811720580");
    assert.equal(parsed.records[0]?.operatorKeyScheme, "IT-CODICE-FISCALE");
    assert.equal(parsed.records[0]?.groupId, "7");
    assert.equal(parsed.records[0]?.relation, "participant");
  });

  it("uses the source-backed foreign identifier when no valid Italian identifier exists", () => {
    const parsed = parseAnacOperatorsCsv(
      `${participantHeader}\nB123456789;;DE 123 456;BETA GMBH;02-MANDANTE;7\n`,
      "participants",
      new Set(["B123456789"]),
      source,
    );
    assert.equal(
      parsed.records[0]?.operatorKey,
      "ANAC-FOREIGN-FISCAL-ID:DE 123 456",
    );
    assert.equal(
      parsed.records[0]?.operatorKeyScheme,
      "ANAC-FOREIGN-FISCAL-ID",
    );
  });

  it("never promotes a company name alone to canonical identity", () => {
    const parsed = parseAnacOperatorsCsv(
      `${participantHeader}\nB123456789;;;GAMMA SRL;;;\n`,
      "participants",
      new Set(["B123456789"]),
      source,
    );
    assert.equal(parsed.records[0]?.name, "GAMMA SRL");
    assert.equal(parsed.records[0]?.operatorKey, null);
    assert.equal(parsed.records[0]?.operatorKeyScheme, null);
  });

  it("folds only exact duplicates and preserves every logical source record number", () => {
    const row = "B123456789;00811720580;;ALFA SRL;01-MANDATARIA;7";
    const parsed = parseAnacOperatorsCsv(
      [participantHeader, row, row].join("\n"),
      "participants",
      new Set(["B123456789"]),
      source,
    );
    assert.equal(parsed.matchedSourceRecords, 2);
    assert.equal(parsed.records.length, 1);
    assert.deepEqual(parsed.records[0]?.sourceRecordNumbers, [1, 2]);
  });

  it("keeps the same operator as separate relations across different CIGs", () => {
    const parsed = parseAnacOperatorsCsv(
      [
        participantHeader,
        "B123456789;00811720580;;ALFA SRL;;;",
        "A01D5289C5;00811720580;;ALFA SRL;;;",
      ].join("\n"),
      "participants",
      new Set(["B123456789", "A01D5289C5"]),
      source,
    );
    assert.equal(parsed.records.length, 2);
    assert.equal(parsed.records[0]?.operatorKey, parsed.records[1]?.operatorKey);
    assert.notEqual(parsed.records[0]?.cig, parsed.records[1]?.cig);
  });

  it("preserves multiple members and roles inside the same participant group", () => {
    const parsed = parseAnacOperatorsCsv(
      [
        participantHeader,
        "B123456789;00811720580;;ALFA SRL;01-MANDATARIA;11",
        "B123456789;12345678901;;BETA SRL;02-MANDANTE;11",
      ].join("\n"),
      "participants",
      new Set(["B123456789"]),
      source,
    );
    assert.equal(parsed.records.length, 2);
    assert.deepEqual(
      parsed.records.map((record) => [record.groupId, record.role]),
      [
        ["11", "01-MANDATARIA"],
        ["11", "02-MANDANTE"],
      ],
    );
  });

  it("keeps participant and awardee snapshots semantically separate", () => {
    const participants = parseAnacOperatorsCsv(
      `${participantHeader}\nB123456789;00811720580;;ALFA SRL;;;\n`,
      "participants",
      new Set(["B123456789"]),
      source,
    );
    const awardees = parseAnacOperatorsCsv(
      `${awardeeHeader}\nB123456789;00811720580;;ALFA SRL;01-MANDATARIA;3\n`,
      "awardees",
      new Set(["B123456789"]),
      { ...source, url: canonicalOperatorArchiveUrl("awardees") },
    );
    const commonSource = {
      archiveSha256: "a".repeat(64),
      archiveBytes: 100,
      csvEntry: "source.csv",
      acquiredAt,
      selection: "ckan" as const,
    };
    const participantSnapshot = buildAnacOperatorsSnapshot({
      dataset: "participants",
      generatedAt: acquiredAt,
      trackedCigs: ["B123456789"],
      parsed: participants,
      source: { ...commonSource, archiveUrl: source.url },
    });
    const awardeeSnapshot = buildAnacOperatorsSnapshot({
      dataset: "awardees",
      generatedAt: acquiredAt,
      trackedCigs: ["B123456789"],
      parsed: awardees,
      source: {
        ...commonSource,
        archiveUrl: canonicalOperatorArchiveUrl("awardees"),
      },
    });
    assert.equal(participantSnapshot.source.id, "anac-open-data-partecipanti");
    assert.equal(awardeeSnapshot.source.id, "anac-open-data-aggiudicatari");
    assert.equal(participantSnapshot.records[0]?.relation, "participant");
    assert.equal(awardeeSnapshot.records[0]?.relation, "awardee");
  });

  it("fails closed when the dataset-specific group or identity columns are missing", () => {
    assert.throws(
      () =>
        parseAnacOperatorsCsv(
          "cig;codiceFiscale;ragioneSociale\nB123456789;00811720580;ALFA SRL\n",
          "participants",
          new Set(["B123456789"]),
          source,
        ),
      /missing required columns/u,
    );
  });

  it("selects only an official ZIP belonging to the requested dataset", () => {
    const official = canonicalOperatorArchiveUrl("participants");
    const payload = {
      success: true,
      result: {
        resources: [
          { url: "https://example.org/partecipanti_csv.zip", name: "partecipanti csv", format: "CSV" },
          { url: canonicalOperatorArchiveUrl("awardees"), name: "aggiudicatari csv", format: "CSV" },
          { url: official, name: "partecipanti csv", format: "CSV" },
        ],
      },
    };
    assert.equal(selectAnacOperatorArchive(payload, "participants"), official);
  });

  it("parses quoted fields across stream chunks without loading the full CSV", () => {
    const matcher = new AnacOperatorsCsvMatcher(
      "participants",
      new Set(["B123456789"]),
      source,
    );
    const csv = `${participantHeader}\nB123456789;00811720580;;"ALFA\nSRL";01-MANDATARIA;4\n`;
    matcher.push(csv.slice(0, 41));
    matcher.push(csv.slice(41, 73));
    matcher.push(csv.slice(73));
    const parsed = matcher.finish();
    assert.equal(parsed.records[0]?.name, "ALFA SRL");
    assert.deepEqual(parsed.records[0]?.sourceRecordNumbers, [1]);
  });
});
