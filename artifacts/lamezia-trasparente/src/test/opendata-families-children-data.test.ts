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
    expect(metadata.resource_hash).toBe("fc64d4ab6c54d4c305a696f4196f5ef8");
    expect(metadata.resource_last_modified).toBe("2026-08-22T16:07:18.000Z");
    expect(metadata.rows).toBe(6);
    expect(metadata.rows).toBe(family_children.length);
    expect(metadata.caveat).toContain("non espone l'anno di riferimento");
  });

  it("matches the municipal CSV totals and derived shares", () => {
    expect(LAMEZIA_FAMILIES_CHILDREN_SUMMARY).toMatchObject({
      total: 13358,
      one_child: 6764,
      one_child_share: 0.5064,
      two_children: 5228,
      two_children_share: 0.3914,
      three_or_more: 1366,
      three_or_more_share: 0.1023,
    });
    expect(LAMEZIA_FAMILIES_CHILDREN_SUMMARY.largest_class).toMatchObject({
      children_count_label: "1",
      families: 6764,
    });
    expect(getLameziaFamiliesChildrenRecord(6)).toMatchObject({
      children_count_label: "6 o piu",
      families: 14,
      share_of_total: 0.001,
    });
  });
});
