import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAnacAwardsSnapshot, parseAnacAwardsCsv } from "./anacAwards";

describe("ANAC Aggiudicazioni enrichment", () => {
  it("maps num_imprese_offerenti without substituting admitted offers", () => {
    const csv = [
      "cig;num_imprese_offerenti;numero_offerte_ammesse;numero_offerte_escluse;data_aggiudicazione_definitiva;importo_aggiudicazione;esito",
      "B123456789;1;1;0;13/09/2024;10.400,00;AGGIUDICATA",
      "A01D5289C5;;4;1;14/09/2024;20.000,00;AGGIUDICATA",
    ].join("\n");
    const parsed = parseAnacAwardsCsv(csv, new Set(["B123456789", "A01D5289C5"]), {
      url: "https://dati.anticorruzione.it/opendata/download/dataset/aggiudicazioni/filesystem/aggiudicazioni_csv.zip",
      acquiredAt: "2026-09-02T18:00:00.000Z",
    });

    assert.equal(parsed.recordsScanned, 2);
    assert.equal(parsed.records[0]?.numberOfTenderers, null);
    assert.equal(parsed.records[0]?.admittedOffers, 4);
    assert.equal(parsed.records[1]?.numberOfTenderers, 1);
    assert.equal(parsed.records[1]?.awardAmount, 10400);
    assert.equal(parsed.records[1]?.awardDate, "2024-09-13");
  });

  it("rejects malformed tenderer counts instead of coercing them", () => {
    const parsed = parseAnacAwardsCsv(
      "cig,num_imprese_offerenti\nB123456789,1.5\nA01D5289C5,-1\n",
      new Set(["B123456789", "A01D5289C5"]),
      { url: "https://dati.anticorruzione.it/a.zip", acquiredAt: "2026-09-02T18:00:00.000Z" },
    );
    assert.deepEqual(parsed.records.map((record) => record.numberOfTenderers), [null, null]);
  });

  it("keeps the more complete row when a CIG is repeated", () => {
    const parsed = parseAnacAwardsCsv(
      [
        "cig;num_imprese_offerenti;numero_offerte_ammesse;esito",
        "B123456789;2;;",
        "B123456789;2;2;AGGIUDICATA",
      ].join("\n"),
      new Set(["B123456789"]),
      { url: "https://dati.anticorruzione.it/a.zip", acquiredAt: "2026-09-02T18:00:00.000Z" },
    );
    assert.equal(parsed.records.length, 1);
    assert.equal(parsed.records[0]?.admittedOffers, 2);
    assert.equal(parsed.records[0]?.outcome, "AGGIUDICATA");
  });

  it("materialises source provenance separately from the procurement feed", () => {
    const parsed = parseAnacAwardsCsv(
      "cig;num_imprese_offerenti\nB123456789;1\n",
      new Set(["B123456789"]),
      { url: "https://dati.anticorruzione.it/a.zip", acquiredAt: "2026-09-02T18:00:00.000Z" },
    );
    const snapshot = buildAnacAwardsSnapshot({
      generatedAt: "2026-09-02T18:00:00.000Z",
      trackedCigs: ["B123456789"],
      archiveUrl: "https://dati.anticorruzione.it/a.zip",
      parsed,
    });
    assert.equal(snapshot.source.id, "anac-open-data-aggiudicazioni");
    assert.equal(snapshot.records[0]?.sourceArchiveUrl, "https://dati.anticorruzione.it/a.zip");
  });
});
