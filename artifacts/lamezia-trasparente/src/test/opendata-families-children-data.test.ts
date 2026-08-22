import { describe, expect, it } from "vitest";
import {
  LAMEZIA_FAMILIES_CHILDREN_DATA,
  LAMEZIA_FAMILIES_CHILDREN_SUMMARY,
  getLameziaFamiliesChildrenRecord,
} from "../data/lameziaFamiliesChildren";

describe("Lamezia families by children count OpenData dataset", () => {
  it("keeps the generated distribution source traceable", () => {
    const { family_children, metadata } = LAMEZIA_FAMILIES_CHILDREN_DATA;

    expect(metadata.source).toContain("Comune di Lamezia Terme");
    expect(metadata.organization).toBe("comune-di-lamezia-terme");
    expect(metadata.holder_identifier).toBe("c_m208");
    expect(metadata.license_title).toContain("CC BY 4.0");
    expect(metadata.source_csv_url).toContain("famiglie-per-numero-figli.csv");
    expect(metadata.resource_hash).toBe("cb37454bc549a8692ef91ac4974da886");
    expect(metadata.resource_last_modified).toBe("2026-08-14T16:07:32.000Z");
    expect(metadata.rows).toBe(6);
    expect(metadata.rows).toBe(family_children.length);
    expect(metadata.caveat).toContain("non espone l'anno di riferimento");
  });

  it("matches the municipal CSV totals and derived shares", () => {
    expect(LAMEZIA_FAMILIES_CHILDREN_SUMMARY).toMatchObject({
      total: 13357,
      one_child: 6765,
      one_child_share: 0.5065,
      two_children: 5226,
      two_children_share: 0.3913,
      three_or_more: 1366,
      three_or_more_share: 0.1023,
    });
    expect(LAMEZIA_FAMILIES_CHILDREN_SUMMARY.largest_class).toMatchObject({
      children_count_label: "1",
      families: 6765,
    });
    expect(getLameziaFamiliesChildrenRecord(6)).toMatchObject({
      children_count_label: "6 o piu",
      families: 14,
      share_of_total: 0.001,
    });
  });
});
