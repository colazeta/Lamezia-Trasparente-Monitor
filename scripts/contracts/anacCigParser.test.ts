import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { getLifecyclePhase } from "../../artifacts/lamezia-trasparente/src/lib/contractDossier";
import { parseAnacCigFixtureFile } from "./anacCigParser";
import { normaliseAnacCigRecord } from "./normaliseContractDossier";

const fixturePath = fileURLToPath(
  new URL(
    "../../artifacts/lamezia-trasparente/src/test/fixtures/contracts/anac/anac-cig-fixture.json",
    import.meta.url,
  ),
);

const options = {
  source_dataset_id: "test-anac-cig-json",
  source_dataset_label: "TEST ANAC CIG JSON fixture",
  source_downloaded_at: "2026-06-27T00:00:00.000Z",
  source_published_at: "2026-06-26",
  source_update_kind: "full" as const,
};

describe("ANAC CIG fixture parser", () => {
  it("reads local JSON fixture data only and normalises records", async () => {
    const results = await parseAnacCigFixtureFile(fixturePath, options);

    expect(results).toHaveLength(6);
    expect(results.filter((result) => result.status === "parsed")).toHaveLength(
      4,
    );
    expect(
      results.filter((result) => result.status === "needs_review"),
    ).toHaveLength(2);
  });

  it("rejects non-local fixture URLs", async () => {
    await expect(
      parseAnacCigFixtureFile("https://example.test/anac.json", options),
    ).rejects.toThrow("local fixture files only");
  });

  it("normalises CIG and CUP values conservatively", () => {
    const result = normaliseAnacCigRecord(
      {
        source_record_id: "lowercase-cig-cup",
        cig: " x123456789 ",
        cup: " h12b 1234-5678 9ab ",
        oggetto: "TEST fixture lavori",
      },
      options,
    );

    expect(result.status).toBe("parsed");
    if (result.status === "parsed") {
      expect(result.contract.cig).toBe("X123456789");
      expect(result.contract.cup).toBe("H12B123456789AB");
      expect(result.dossier.workAxis).toMatchObject({
        cupStatus: "present",
        cupValue: "H12B123456789AB",
      });
    }
  });

  it("returns needs_review for records without CIG", () => {
    const result = normaliseAnacCigRecord(
      { source_record_id: "missing-cig", oggetto: "TEST fixture senza CIG" },
      options,
    );

    expect(result).toMatchObject({
      status: "needs_review",
      reason: "CIG non rilevato nel record sorgente.",
      ingestionMetadata: {
        ingestion_status: "needs_mapping",
      },
    });
  });

  it("returns needs_review for malformed CIG values", () => {
    const result = normaliseAnacCigRecord(
      {
        source_record_id: "malformed-cig",
        cig: "1234567ABC",
        oggetto: "TEST fixture CIG malformato",
      },
      options,
    );

    expect(result).toMatchObject({
      status: "needs_review",
      reason: "CIG presente ma non coerente con i controlli formali locali.",
      ingestionMetadata: {
        ingestion_status: "needs_mapping",
      },
    });
  });

  it("does not mark execution or collaudo documented from a CIG-only record", () => {
    const result = normaliseAnacCigRecord(
      {
        source_record_id: "cig-only",
        cig: "1234567CE7",
        oggetto: "TEST fixture CIG only",
      },
      options,
    );

    expect(result.status).toBe("parsed");
    if (result.status === "parsed") {
      expect(getLifecyclePhase(result.dossier, "esecuzione").status).toBe(
        "missing",
      );
      expect(getLifecyclePhase(result.dossier, "valutazione").status).toBe(
        "missing",
      );
    }
  });

  it("maps award fields to affidamento documented only when source evidence exists", () => {
    const withoutAward = normaliseAnacCigRecord(
      {
        source_record_id: "without-award",
        cig: "1234567CE7",
        oggetto: "TEST fixture senza aggiudicazione",
      },
      options,
    );
    const withAward = normaliseAnacCigRecord(
      {
        source_record_id: "with-award",
        cig: "1234567CE7",
        oggetto: "TEST fixture con aggiudicazione",
        aggiudicazione: "TEST aggiudicazione documentata",
        data_aggiudicazione: "2026-04-01",
      },
      options,
    );

    expect(withoutAward.status).toBe("parsed");
    expect(withAward.status).toBe("parsed");
    if (withoutAward.status === "parsed" && withAward.status === "parsed") {
      expect(
        getLifecyclePhase(withoutAward.dossier, "affidamento").status,
      ).not.toBe("documented");
      expect(getLifecyclePhase(withAward.dossier, "affidamento").status).toBe(
        "documented",
      );
    }
  });

  it("represents missing CUP as an information limit instead of hiding it", () => {
    const result = normaliseAnacCigRecord(
      {
        source_record_id: "missing-cup",
        cig: "1234567CE7",
        oggetto: "TEST fixture lavori senza CUP",
      },
      options,
    );

    expect(result.status).toBe("parsed");
    if (result.status === "parsed") {
      expect(result.dossier.workAxis).toMatchObject({
        cupStatus: "missing",
        message: "CUP non rilevato nelle fonti disponibili.",
      });
      expect(result.dossier.publicLimits).toContain(
        "CUP non rilevato nelle fonti disponibili.",
      );
    }
  });

  it("attaches source evidence with ingestion metadata", () => {
    const result = normaliseAnacCigRecord(
      {
        source_record_id: "metadata",
        cig: "1234567CE7",
        oggetto: "TEST fixture metadata",
      },
      options,
    );

    expect(result.status).toBe("parsed");
    if (result.status === "parsed") {
      expect(result.dossier.evidence).toContainEqual(
        expect.objectContaining({
          sourceStatus: "official-ingested-source",
          ingestionMetadata: expect.objectContaining({
            source_dataset_id: "test-anac-cig-json",
            source_record_id: "metadata",
            parser_version: "anac-cig-fixture-v0",
            ingestion_status: "parsed",
          }),
        }),
      );
    }
  });

  it("does not expose official complete status without source evidence", () => {
    const result = normaliseAnacCigRecord(
      {
        source_record_id: "no-award-source",
        cig: "1234567CE7",
        oggetto: "TEST fixture senza campi aggiudicazione",
      },
      options,
    );

    expect(result.status).toBe("parsed");
    if (result.status === "parsed") {
      expect(result.dossier.lifecycleCompleteness).not.toBe("complete");
      expect(
        result.dossier.evidence.some(
          (evidence) =>
            evidence.sourceStatus === "official-ingested-source" &&
            evidence.phaseKey === "esecuzione",
        ),
      ).toBe(false);
    }
  });
});
