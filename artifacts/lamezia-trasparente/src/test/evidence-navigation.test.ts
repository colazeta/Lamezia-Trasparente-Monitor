import { describe, expect, it } from "vitest";

import { NAV_GROUPS } from "@/components/layout/navSections";
import { PUBLIC_INDEXABLE_PATHS } from "@/data/publicRoutes";

describe("evidence archive navigation", () => {
  it("exposes the archive from the main navigation", () => {
    const items = NAV_GROUPS.flatMap((group) => group.items);
    const item = items.find((entry) => entry.href === "/interventi-locali");

    expect(item?.label).toBe("Interventi evidence-based");
    expect(item?.state).toBe("available");
  });

  it("keeps the archive in the public indexable inventory", () => {
    expect(PUBLIC_INDEXABLE_PATHS).toContain("/interventi-locali");
  });
});
