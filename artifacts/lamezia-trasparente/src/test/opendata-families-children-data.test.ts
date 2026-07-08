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
    expect(metadata.rows).toBe(6);
    expect(metadata.rows).toBe(family_children.length);
    expect(metadata.caveat).toContain("non espone l'anno di riferimento");
  });

  it("matches the municipal CSV totals and derived shares", () => {
    expect(LAMEZIA_FAMILIES_CHILDREN_SUMMARY).toMatchObject({
      total: 13376,
      one_child: 6781,
      one_child_share: 0.507,
      two_children: 5231,
      two_children_share: 0.3911,
      three_or_more: 1364,
      three_or_more_share: 0.102,
    });
    expect(LAMEZIA_FAMILIES_CHILDREN_SUMMARY.largest_class).toMatchObject({
      children_count_label: "1",
      families: 6781,
    });
    expect(getLameziaFamiliesChildrenRecord(6)).toMatchObject({
      children_count_label: "6 o piu",
      families: 14,
      share_of_total: 0.001,
    });
  });
});
