import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPendingAnacBdncpSnapshot,
  type AnacBdncpRecord,
} from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import {
  AnacCsvMatcher,
  buildAnacCigArchiveCandidates,
  mergeAnacSyncAttempt,
  parseAnacCigCsv,
} from "./anacBdncpSyncCore";

describe("ANAC/BDNCP sync core", () => {
  it("builds deterministic official monthly archive URLs newest first", () => {
    assert.deepEqual(
      buildAnacCigArchiveCandidates(new Date("2026-01-15T10:00:00Z"), 3),
      [
        {
          period: "2026-01",
          url: "https://dati.anticorruzione.it/opendata/download/dataset/cig/filesystem/20260101-cig_csv.zip",
        },
        {
          period: "2025-12",
          url: "https://dati.anticorruzione.it/opendata/download/dataset/cig/filesystem/20251201-cig_csv.zip",
        },
        {
          period: "2025-11",
          url: "https://dati.anticorruzione.it/opendata/download/dataset/cig/filesystem/20251101-cig_csv.zip",
        },
      ],
    );
  });

  it("maps tracked CIG rows including Cardinal-relevant source fields", () => {
    const csv = [
      "CIG;oggetto_lotto;denominazione_amministrazione_appaltante;codice_ausa;cf_amministrazione_appaltante;importo_lotto;cod_tipo_scelta_contraente;tipo_scelta_contraente;data_pubblicazione;data_scadenza_offerta;cod_cpv;descrizione_cpv;flag_prevalente;cod_esito;esito;data_comunicazione_esito;numero_gara",
      'B123456789;"Servizio; civico";Comune di Lamezia Terme;0000247922;00301390795;1.234,56;1;PROCEDURA APERTA;2026-08-01;31/08/2026;72000000-5;Servizi informatici;1;1;AGGIUDICATA;2026-09-01;G-10',
      "A01D5289C5;Altro lotto;Altra amministrazione;0000000001;00000000001;900,00;1;PROCEDURA APERTA;2026-08-02;2026-08-30;45000000-7;Lavori;1;;;;G-11",
    ].join("\r\n");
    const result = parseAnacCigCsv(csv, new Set(["B123456789"]), {
      url: "https://dati.anticorruzione.it/archive.zip",
      period: "2026-08",
      acquiredAt: "2026-09-01T12:00:00.000Z",
    });

    assert.equal(result.recordsScanned, 2);
    assert.deepEqual(result.records, [
      {
        cig: "B123456789",
        title: "Servizio; civico",
        contractingAuthority: "Comune di Lamezia Terme",
        contractingAuthorityCode: "0000247922",
        contractingAuthorityTaxId: "00301390795",
        tenderAmount: 1234.56,
        procedureType: "PROCEDURA APERTA",
        procedureCode: "1",
        publicationDate: "2026-08-01",
        submissionDeadline: "2026-08-31",
        cpvCode: "72000000-5",
        cpvDescription: "Servizi informatici",
        cpvIsPrimary: true,
        outcomeCode: "1",
        outcome: "AGGIUDICATA",
        outcomeDate: "2026-09-01",
        recordId: "G-10",
        sourceArchiveUrl: "https://dati.anticorruzione.it/archive.zip",
        sourcePeriod: "2026-08",
        acquiredAt: "2026-09-01T12:00:00.000Z",
      },
    ]);
  });

  it("preserves the prevalent CPV when a CIG spans several CPV rows", () => {
    const csv = [
      "cig;cod_cpv;descrizione_cpv;flag_prevalente;data_pubblicazione;data_scadenza_offerta",
      "B123456789;72000000-5;Servizi informatici;1;2026-08-01;2026-08-31",
      "B123456789;30200000-1;Apparecchiature informatiche;0;2026-08-01;2026-08-31",
    ].join("\n");

    const result = parseAnacCigCsv(csv, new Set(["B123456789"]), {
      url: "https://dati.anticorruzione.it/archive.zip",
      period: "2026-08",
      acquiredAt: "2026-09-01T12:00:00.000Z",
    });

    assert.equal(result.records.length, 1);
    assert.equal(result.records[0]?.cpvCode, "72000000-5");
    assert.equal(result.records[0]?.cpvIsPrimary, true);
    assert.equal(result.records[0]?.submissionDeadline, "2026-08-31");
  });

  it("parses escaped quotes and embedded newlines across stream chunks", () => {
    const matcher = new AnacCsvMatcher(new Set(["B123456789"]), {
      url: "https://dati.anticorruzione.it/archive.zip",
      period: "2026-08",
      acquiredAt: "2026-09-01T12:00:00.000Z",
    });
    matcher.push('cig,oggetto_lotto,importo_lotto\nB123456789,"Linea "');
    matcher.push('"uno""\nlinea due",42.50\n');
    const result = matcher.finish();

    assert.equal(result.records[0]?.title, 'Linea "uno" linea due');
    assert.equal(result.records[0]?.tenderAmount, 42.5);
  });

  it("keeps the last known good record when the official source is unavailable", () => {
    const previous = createPendingAnacBdncpSnapshot("2026-08-31T12:00:00.000Z");
    const cachedRecord = record("B123456789", "2026-08-31T12:00:00.000Z");
    previous.status = "current";
    previous.lastAttemptAt = previous.generatedAt;
    previous.lastSuccessAt = previous.generatedAt;
    previous.records = [cachedRecord];

    const next = mergeAnacSyncAttempt({
      previous,
      trackedCigs: ["B123456789"],
      attemptedAt: "2026-09-01T12:00:00.000Z",
      lookbackMonths: 12,
      attemptedArchives: 12,
      unavailableArchives: 12,
      successfulArchives: [],
      failureCategory: "source-unavailable",
    });

    assert.equal(next.status, "stale");
    assert.equal(next.lastSuccessAt, "2026-08-31T12:00:00.000Z");
    assert.deepEqual(next.records, [cachedRecord]);
  });

  it("keeps the newest monthly record when a CIG appears in several packages", () => {
    const previous = createPendingAnacBdncpSnapshot();
    const older = {
      ...record("B123456789", "2026-09-01T12:00:00.000Z"),
      title: "Versione luglio",
      sourcePeriod: "2026-07",
    };
    const newer = {
      ...record("B123456789", "2026-09-01T12:00:00.000Z"),
      title: "Versione agosto",
      sourcePeriod: "2026-08",
    };

    const next = mergeAnacSyncAttempt({
      previous,
      trackedCigs: ["B123456789"],
      attemptedAt: "2026-09-01T12:00:00.000Z",
      lookbackMonths: 12,
      attemptedArchives: 2,
      unavailableArchives: 0,
      successfulArchives: [
        {
          period: "2026-08",
          url: "https://dati.anticorruzione.it/august.zip",
          retrievedAt: "2026-09-01T12:00:00.000Z",
          recordsScanned: 1,
          records: [newer],
        },
        {
          period: "2026-07",
          url: "https://dati.anticorruzione.it/july.zip",
          retrievedAt: "2026-09-01T12:00:00.000Z",
          recordsScanned: 1,
          records: [older],
        },
      ],
      failureCategory: null,
    });

    assert.equal(next.records[0]?.title, "Versione agosto");
  });

  it("distinguishes a first failed attempt from an empty official result", () => {
    const previous = createPendingAnacBdncpSnapshot();
    const failed = mergeAnacSyncAttempt({
      previous,
      trackedCigs: ["B123456789"],
      attemptedAt: "2026-09-01T12:00:00.000Z",
      lookbackMonths: 12,
      attemptedArchives: 12,
      unavailableArchives: 12,
      successfulArchives: [],
      failureCategory: "no-published-archive",
    });
    const emptyButSuccessful = mergeAnacSyncAttempt({
      previous,
      trackedCigs: ["B123456789"],
      attemptedAt: "2026-09-01T12:00:00.000Z",
      lookbackMonths: 12,
      attemptedArchives: 1,
      unavailableArchives: 0,
      successfulArchives: [
        {
          period: "2026-08",
          url: "https://dati.anticorruzione.it/archive.zip",
          retrievedAt: "2026-09-01T12:00:00.000Z",
          recordsScanned: 10,
          records: [],
        },
      ],
      failureCategory: null,
    });

    assert.equal(failed.status, "degraded");
    assert.equal(failed.lastSuccessAt, null);
    assert.equal(emptyButSuccessful.status, "current");
    assert.equal(emptyButSuccessful.lastSuccessAt, "2026-09-01T12:00:00.000Z");
    assert.deepEqual(emptyButSuccessful.records, []);
  });
});

function record(cig: string, acquiredAt: string): AnacBdncpRecord {
  return {
    cig,
    title: "Record in cache",
    contractingAuthority: "Comune di Lamezia Terme",
    contractingAuthorityCode: "0000247922",
    contractingAuthorityTaxId: "00301390795",
    tenderAmount: 100,
    procedureType: null,
    procedureCode: null,
    publicationDate: null,
    submissionDeadline: null,
    cpvCode: null,
    cpvDescription: null,
    cpvIsPrimary: null,
    outcomeCode: null,
    outcome: null,
    outcomeDate: null,
    recordId: null,
    sourceArchiveUrl: "https://dati.anticorruzione.it/archive.zip",
    sourcePeriod: "2026-08",
    acquiredAt,
  };
}
