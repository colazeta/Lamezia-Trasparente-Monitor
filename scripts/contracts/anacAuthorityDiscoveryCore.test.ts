import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createPendingAnacAuthorityDiscoverySnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacAuthorityDiscovery";
import type { AnacBdncpRecord } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import {
  buildRequestedYears,
  mergeAuthorityDiscoveryAttempt,
  periodsToProcess,
  selectHistoricalYearsForRun,
} from "./anacAuthorityDiscoveryCore";

const taxId = "00301390795";

describe("ANAC authority discovery core", () => {
  it("builds the full requested historical range and backfills newest incomplete years first", () => {
    const requested = buildRequestedYears(
      new Date("2026-09-06T00:00:00Z"),
      2022,
    );
    assert.deepEqual(requested, [2022, 2023, 2024, 2025, 2026]);
    assert.deepEqual(
      selectHistoricalYearsForRun(requested, [2024], 2026, 2),
      [2025, 2023],
    );
  });

  it("refreshes recent current-year periods without rescanning closed completed periods", () => {
    assert.deepEqual(
      periodsToProcess({
        catalogPeriods: [
          "2026-05",
          "2026-06",
          "2026-07",
          "2026-08",
          "2026-09",
        ],
        completedPeriods: ["2026-05", "2026-06", "2026-07", "2026-08"],
        currentPeriod: "2026-09",
        refreshCurrentMonths: 2,
      }),
      ["2026-08", "2026-09"],
    );
  });

  it("marks a historical year complete only when every catalogued period has succeeded", () => {
    const previous = createPendingAnacAuthorityDiscoverySnapshot(
      "2026-09-01T00:00:00.000Z",
      taxId,
    );
    const catalogPeriodsByYear = new Map<number, string[]>([
      [2025, ["2025-01", "2025-02"]],
    ]);
    const first = mergeAuthorityDiscoveryAttempt({
      previous,
      attemptedAt: "2026-09-06T00:00:00.000Z",
      requestedYears: [2025, 2026],
      targetTaxId: taxId,
      targetLabel: "Comune di Lamezia Terme",
      successfulArchives: [archive("2025-01", record("B123456789", "2025-01"))],
      catalogPeriodsByYear,
      attemptedResources: 1,
      failedResources: 0,
      failureCategory: null,
      currentYear: 2026,
    });
    assert.deepEqual(first.completedYears, []);
    assert.deepEqual(first.completedPeriods, ["2025-01"]);

    const second = mergeAuthorityDiscoveryAttempt({
      previous: first,
      attemptedAt: "2026-09-07T00:00:00.000Z",
      requestedYears: [2025, 2026],
      targetTaxId: taxId,
      targetLabel: "Comune di Lamezia Terme",
      successfulArchives: [archive("2025-02", record("A01D5289C5", "2025-02"))],
      catalogPeriodsByYear,
      attemptedResources: 1,
      failedResources: 0,
      failureCategory: null,
      currentYear: 2026,
    });
    assert.deepEqual(second.completedYears, [2025]);
    assert.deepEqual(second.completedPeriods, ["2025-01", "2025-02"]);
    assert.deepEqual(
      second.records.map((item) => item.cig),
      ["A01D5289C5", "B123456789"],
    );
  });

  it("preserves last-known-good coverage when a later attempt fails", () => {
    const previous = mergeAuthorityDiscoveryAttempt({
      previous: createPendingAnacAuthorityDiscoverySnapshot(
        "2026-09-01T00:00:00.000Z",
        taxId,
      ),
      attemptedAt: "2026-09-06T00:00:00.000Z",
      requestedYears: [2025, 2026],
      targetTaxId: taxId,
      targetLabel: "Comune di Lamezia Terme",
      successfulArchives: [archive("2025-01", record("B123456789", "2025-01"))],
      catalogPeriodsByYear: new Map([[2025, ["2025-01"]]]),
      attemptedResources: 1,
      failedResources: 0,
      failureCategory: null,
      currentYear: 2026,
    });

    const failed = mergeAuthorityDiscoveryAttempt({
      previous,
      attemptedAt: "2026-09-07T00:00:00.000Z",
      requestedYears: [2025, 2026],
      targetTaxId: taxId,
      targetLabel: "Comune di Lamezia Terme",
      successfulArchives: [],
      catalogPeriodsByYear: new Map(),
      attemptedResources: 1,
      failedResources: 1,
      failureCategory: "source-unavailable",
      currentYear: 2026,
    });

    assert.equal(failed.status, "stale");
    assert.equal(failed.lastSuccessAt, "2026-09-06T00:00:00.000Z");
    assert.equal(failed.records.length, 1);
    assert.equal(failed.failureCategory, "source-unavailable");
  });
});

function archive(period: string, item: AnacBdncpRecord) {
  return {
    period,
    year: Number(period.slice(0, 4)),
    url: `https://dati.anticorruzione.it/opendata/download/dataset/cig-${period.slice(0, 4)}/filesystem/${period.replace("-", "")}01-cig_csv.zip`,
    retrievedAt: "2026-09-06T00:00:00.000Z",
    recordsScanned: 100,
    records: [item],
  };
}

function record(cig: string, period: string): AnacBdncpRecord {
  return {
    cig,
    title: `Contratto ${cig}`,
    contractingAuthority: "Comune di Lamezia Terme",
    contractingAuthorityCode: null,
    contractingAuthorityTaxId: taxId,
    tenderAmount: 100,
    procedureType: null,
    procedureCode: null,
    publicationDate: `${period}-01`,
    submissionDeadline: null,
    cpvCode: null,
    cpvDescription: null,
    cpvIsPrimary: null,
    outcomeCode: null,
    outcome: null,
    outcomeDate: null,
    recordId: null,
    sourceArchiveUrl: `https://dati.anticorruzione.it/opendata/download/dataset/cig-${period.slice(0, 4)}/filesystem/${period.replace("-", "")}01-cig_csv.zip`,
    sourcePeriod: period,
    acquiredAt: "2026-09-06T00:00:00.000Z",
  };
}
