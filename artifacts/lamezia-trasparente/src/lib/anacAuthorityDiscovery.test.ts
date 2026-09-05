import { describe, expect, it } from "vitest";

import {
  anacAuthorityHistoricalCoverage,
  createPendingAnacAuthorityDiscoverySnapshot,
} from "./anacAuthorityDiscovery";

describe("ANAC authority historical coverage", () => {
  it("does not require the open reference year to complete the historical backfill", () => {
    const snapshot = createPendingAnacAuthorityDiscoverySnapshot(
      "2026-09-06T00:00:00.000Z",
    );
    snapshot.status = "current";
    snapshot.lastAttemptAt = snapshot.generatedAt;
    snapshot.lastSuccessAt = snapshot.generatedAt;
    snapshot.requestedYears = [2024, 2025, 2026];
    snapshot.completedYears = [2024, 2025];

    expect(anacAuthorityHistoricalCoverage(snapshot)).toMatchObject({
      requestedYears: 2,
      completedYears: 2,
      missingYears: [],
      historicalBackfillComplete: true,
    });
  });

  it("keeps a closed missing year explicit", () => {
    const snapshot = createPendingAnacAuthorityDiscoverySnapshot(
      "2026-09-06T00:00:00.000Z",
    );
    snapshot.status = "current";
    snapshot.lastAttemptAt = snapshot.generatedAt;
    snapshot.lastSuccessAt = snapshot.generatedAt;
    snapshot.requestedYears = [2024, 2025, 2026];
    snapshot.completedYears = [2025];

    expect(anacAuthorityHistoricalCoverage(snapshot)).toMatchObject({
      requestedYears: 2,
      completedYears: 1,
      missingYears: [2024],
      historicalBackfillComplete: false,
    });
  });
});
