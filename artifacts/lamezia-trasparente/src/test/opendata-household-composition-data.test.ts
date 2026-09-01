import { describe, expect, it } from "vitest";

import {
  LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA,
  LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL,
  assertLameziaHouseholdCompositionDataset,
  type LameziaHouseholdCompositionDataset,
} from "@/data/lameziaHouseholdComposition2023";

describe("Lamezia household composition 2023 Open Data", () => {
  it("reuses the canonical ISTAT profile with exact municipal reconciliation", () => {
    const data = LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA;

    expect(data).toMatchObject({
      schemaVersion: 1,
      referenceYear: 2023,
      municipality: { name: "Lamezia Terme", istatCode: "079160" },
      totalHouseholds: 27_591,
      indicators: {
        onePersonHouseholds: 8_713,
        onePersonShare: 31.6,
        fivePlusHouseholds: 1_603,
        fivePlusShare: 5.8,
      },
      quality: {
        includedRows: 246,
        skippedFictitiousRows: 1,
        incompleteRows: 0,
        componentSum: 27_591,
        reconciliationDifference: 0,
        exactReconciliation: true,
      },
      verification: {
        verifiedAt: "2026-09-01T18:11:15.000Z",
        method: "sha256-and-exact-reconciliation",
      },
    });
    expect(
      data.byComponents.map(({ key, households }) => ({ key, households })),
    ).toEqual([
      { key: "1", households: 8_713 },
      { key: "2", households: 7_197 },
      { key: "3", households: 5_369 },
      { key: "4", households: 4_709 },
      { key: "5", households: 1_263 },
      { key: "6+", households: 340 },
    ]);
    expect(data.source.institution).toBe("ISTAT");
    expect(data.source.sourceUpdateDate).toBe("2026-06-09");
    expect(Date.parse(data.verification.verifiedAt)).toBeGreaterThan(
      Date.parse(data.source.sourceUpdateDate),
    );
    expect(data.source.archiveSha256).toHaveLength(64);
    expect(LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL).toBeTruthy();
    expect(() => assertLameziaHouseholdCompositionDataset(data)).not.toThrow();
  });

  it("fails closed if the downloadable profile no longer reconciles", () => {
    const invalid = structuredClone(
      LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA,
    ) as LameziaHouseholdCompositionDataset;
    invalid.quality.componentSum -= 1;

    expect(() => assertLameziaHouseholdCompositionDataset(invalid)).toThrow(
      /publication gates/i,
    );
  });
});
