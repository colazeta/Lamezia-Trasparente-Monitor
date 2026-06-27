import { describe, expect, it } from "vitest";
import {
  ALL_NAV_GROUPS,
  COMMAND_PALETTE_GROUPS,
  NAV_GROUPS,
  isNavItemNavigable,
  isSectionActive,
} from "../components/layout/navSections";

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
      expect(group.description.trim()).not.toBe("");

      for (const item of group.items) {
        expect(item.label.trim()).not.toBe("");
        expect(item.description.trim()).not.toBe("");
        expect(item.state).toMatch(/^(available|in_progress|planned)$/);
      }
    }
  });

  it("keeps the primary civic macro-areas explicit and ordered", () => {
    expect(NAV_GROUPS.map((group) => group.label)).toEqual([
      "Cosa decide il Comune",
      "Chi governa e come vota",
      "Cosa viene finanziato e realizzato",
      "Criticità e luoghi della città",
      "Memoria civica e antimafia",
      "Partecipazione e proposte",
      "Dati pubblici e territorio",
      "Stato delle fonti e monitoraggio",
    ]);
  });

  it("keeps hidden legacy sections out of the primary nav", () => {
    const allItems = ALL_NAV_GROUPS.flatMap((group) => group.items);
    const visibleHrefs = navItems.map((item) => item.href);

    expect(
      allItems.filter((item) => item.state === "hidden").map((item) => item.href),
    ).toEqual(
      expect.arrayContaining([
        "/bandi",
        "/archivio-proposte",
        "/monitoraggio/nuovo",
        "/legalita/timeline",
        "/performance/confronta",
      ]),
    );
    expect(visibleHrefs).not.toEqual(expect.arrayContaining([
      "/bandi",
      "/archivio-proposte",
      "/monitoraggio/nuovo",
      "/legalita/timeline",
      "/performance/confronta",
    ]));
  });

  it("keeps the criticita row useful without promoting new-report actions", () => {
    const criticitaGroup = NAV_GROUPS.find((group) =>
      group.label.startsWith("Criticit"),
    );
    const visibleHrefs = navItems.map((item) => item.href);
    const newReport = ALL_NAV_GROUPS.flatMap((group) => group.items).find(
      (item) => item.href === "/monitoraggio/nuovo",
    );

    expect(criticitaGroup?.items.map((item) => item.href)).toEqual([
      "/criticita-pubbliche",
      "/monitoraggio",
      "/segnalazioni",
    ]);
    expect(criticitaGroup?.items.map((item) => item.label)).toEqual([
      "Criticità pubbliche",
      "Monitor civico",
      "Segnalazioni / luoghi",
    ]);
    expect(visibleHrefs).not.toContain("/monitoraggio/nuovo");
    expect(newReport?.state).toBe("hidden");
    expect(newReport?.canonicalHref).toBe("/segnalazioni");
  });

  it("keeps planned sections visible but not navigable or searchable", () => {
    const planned = navItems.filter((item) => item.state === "planned");
    const commandPaletteHrefs = COMMAND_PALETTE_GROUPS.flatMap((group) =>
      group.items.map((item) => item.href),
    );

    expect(planned.map((item) => item.href)).toEqual(
      expect.arrayContaining([
        "/elezioni-voti",
        "/dati-elettorali",
        "/dataset-scaricabili",
      ]),
    );
    for (const item of planned) {
      expect(isNavItemNavigable(item)).toBe(false);
      expect(commandPaletteHrefs).not.toContain(item.href);
    }
  });
});
