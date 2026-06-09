import { describe, expect, it } from "vitest";
import { isSectionActive, NAV_GROUPS } from "../components/layout/navSections";

describe("isSectionActive", () => {
  it("keeps exact section matches active", () => {
    expect(isSectionActive("/albo", "/albo")).toBe(true);
  });

  it("keeps hierarchical child routes active", () => {
    expect(isSectionActive("/albo", "/albo/atto-123")).toBe(true);
  });

  it("does not activate sections for non-hierarchical prefix matches", () => {
    expect(isSectionActive("/albo", "/albo-extra")).toBe(false);
  });

  it("preserves root-only matching for the homepage", () => {
    expect(isSectionActive("/", "/")).toBe(true);
    expect(isSectionActive("/", "/albo")).toBe(false);
  });
});

describe("NAV_GROUPS invariants", () => {
  const navItems = NAV_GROUPS.flatMap((group) => group.items);

  it("uses only internal relative hrefs", () => {
    for (const item of navItems) {
      expect(item.href).toMatch(/^\/[^/]/);
      expect(item.href).not.toContain("://");
    }
  });

  it("keeps nav hrefs unique", () => {
    const hrefs = navItems.map((item) => item.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("keeps labels and descriptions populated", () => {
    for (const group of NAV_GROUPS) {
      expect(group.label.trim()).not.toBe("");

      for (const item of group.items) {
        expect(item.label.trim()).not.toBe("");
        expect(item.description.trim()).not.toBe("");
      }
    }
  });
});
