import { describe, expect, it } from "vitest";
import {
  LAMEZIA_FAMILIES_CHILDREN_DATA,
  LAMEZIA_FAMILIES_CHILDREN_SUMMARY,
  getLameziaFamiliesChildrenRecord,
} from "../data/lameziaFamiliesChildren";

function roundFour(value: number) {
  return Number(value.toFixed(4));
}

describe("Lamezia families by children count OpenData dataset", () => {
  it("keeps the generated distribution source traceable", () => {
    const { family_children, metadata } = LAMEZIA_FAMILIES_CHILDREN_DATA;

    expect(metadata.source).toContain("Comune di Lamezia Terme");
    expect(metadata.organization).toBe("comune-di-lamezia-terme");
    expect(metadata.holder_identifier).toBe("c_m208");
    expect(metadata.license_title).toContain("CC BY 4.0");
    expect(metadata.source_csv_url).toContain("famiglie-per-numero-figli.csv");
    expect(metadata.resource_hash).toMatch(/^[a-f0-9]{32}$/);

    const resourceModifiedAt = Date.parse(metadata.resource_last_modified);
    const generatedAt = Date.parse(metadata.generated_at);
    expect(Number.isFinite(resourceModifiedAt)).toBe(true);
    expect(Number.isFinite(generatedAt)).toBe(true);
    expect(resourceModifiedAt).toBeLessThanOrEqual(generatedAt);

    expect(metadata.rows).toBe(6);
    expect(metadata.rows).toBe(family_children.length);
    expect(metadata.caveat).toContain("non espone l'anno di riferimento");
  });

  it("keeps metadata totals, shares and cumulative values consistent with the rows", () => {
    const { family_children, metadata } = LAMEZIA_FAMILIES_CHILDREN_DATA;
    const total = family_children.reduce((sum, record) => sum + record.families, 0);
    const oneChild = getLameziaFamiliesChildrenRecord(1);
    const twoChildren = getLameziaFamiliesChildrenRecord(2);
    const threeOrMore = family_children
      .filter((record) => record.children_count_min >= 3)
      .reduce((sum, record) => sum + record.families, 0);

    expect(total).toBe(metadata.total_families_with_children);
    expect(oneChild?.families).toBe(metadata.one_child_families);
    expect(twoChildren?.families).toBe(metadata.two_children_families);
    expect(threeOrMore).toBe(metadata.three_or_more_children_families);

    let cumulative = 0;
    for (const record of family_children) {
      cumulative += record.families;
      expect(record.cumulative_families).toBe(cumulative);
      expect(record.share_of_total).toBe(roundFour(record.families / total));
    }
    expect(cumulative).toBe(total);

    expect(LAMEZIA_FAMILIES_CHILDREN_SUMMARY).toMatchObject({
      total,
      one_child: oneChild?.families ?? 0,
      one_child_share: oneChild ? roundFour(oneChild.families / total) : 0,
      two_children: twoChildren?.families ?? 0,
      two_children_share: twoChildren ? roundFour(twoChildren.families / total) : 0,
      three_or_more: threeOrMore,
      three_or_more_share: roundFour(threeOrMore / total),
    });

    const largestClass = family_children.reduce((best, record) =>
      record.families > best.families ? record : best,
    );
    expect(LAMEZIA_FAMILIES_CHILDREN_SUMMARY.largest_class).toEqual(largestClass);
    expect(getLameziaFamiliesChildrenRecord(6)?.children_count_label).toBe(
      "6 o piu",
    );
  });
});
