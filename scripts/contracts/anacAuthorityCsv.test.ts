import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  mergeAuthorityRecords,
  parseAnacAuthorityCsv,
} from "./anacAuthorityCsv";

const source = {
  url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2026/filesystem/20260901-cig_csv.zip",
  period: "2026-09",
  acquiredAt: "2026-09-06T00:00:00.000Z",
};

describe("ANAC authority CSV discovery", () => {
  it("selects every formal CIG belonging to the target contracting authority", () => {
    const csv = [
      "cig;oggetto_lotto;cf_amministrazione_appaltante;denominazione_amministrazione_appaltante;importo_lotto;tipo_scelta_contraente;data_pubblicazione;cod_cpv;flag_prevalente",
      'B123456789;Servizio "A";00301390795;Comune di Lamezia Terme;1.234,56;AFFIDAMENTO DIRETTO;05/09/2026;72000000-5;S',
      "A01D5289C5;Lavori; 00301390795 ;Comune di Lamezia Terme;50000;PROCEDURA APERTA;2026-09-04;45000000-7;1",
      "C000000001;Altro ente;01234567890;Altro Comune;100;AFFIDAMENTO DIRETTO;2026-09-03;;;",
    ].join("\n");

    const result = parseAnacAuthorityCsv(csv, "00301390795", source);

    assert.equal(result.recordsScanned, 3);
    assert.deepEqual(
      result.records.map((record) => record.cig),
      ["A01D5289C5", "B123456789"],
    );
    assert.equal(result.records[1].contractingAuthorityTaxId, "00301390795");
    assert.equal(result.records[1].tenderAmount, 1234.56);
    assert.equal(result.records[1].publicationDate, "2026-09-05");
    assert.equal(result.records[1].cpvIsPrimary, true);
  });

  it("fails closed when the authority-tax-id column is absent", () => {
    assert.throws(
      () =>
        parseAnacAuthorityCsv(
          "cig;oggetto\nB123456789;Servizio",
          "00301390795",
          source,
        ),
      /tax-id column/u,
    );
  });

  it("merges repeated CIG evidence while preferring the newer source period", () => {
    const oldRecord = parseAnacAuthorityCsv(
      "cig;oggetto;cf_amministrazione_appaltante;importo_lotto\nB123456789;Titolo vecchio;00301390795;100",
      "00301390795",
      { ...source, period: "2026-08" },
    ).records[0];
    const newRecord = parseAnacAuthorityCsv(
      "cig;oggetto;cf_amministrazione_appaltante;tipo_scelta_contraente\nB123456789;Titolo nuovo;00301390795;PROCEDURA APERTA",
      "00301390795",
      source,
    ).records[0];

    const merged = mergeAuthorityRecords(oldRecord, newRecord);
    assert.equal(merged.title, "Titolo nuovo");
    assert.equal(merged.tenderAmount, 100);
    assert.equal(merged.procedureType, "PROCEDURA APERTA");
    assert.equal(merged.sourcePeriod, "2026-09");
  });
});
