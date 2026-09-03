import { describe, expect, it } from "vitest";
import {
  ALL_NAV_GROUPS,
  COMMAND_PALETTE_GROUPS,
  NAV_GROUPS,
} from "@/components/layout/navSections";
import {
  findPrimaryNavGroupByPath,
  findPrimaryNavItemByPath,
} from "@/components/layout/navState";

const EXPECTED_PRIMARY_GROUPS = [
  "Atti",
  "Comune",
  "Spesa",
  "Territorio",
  "Legalità",
  "Dati",
  "Partecipa",
];

function hrefs(groups: typeof NAV_GROUPS) {
  return groups.flatMap((group) => group.items.map((item) => item.href));
}

function primaryGroupLabel(path: string) {
  return findPrimaryNavGroupByPath(path)?.label ?? null;
}

function primaryItemHref(path: string) {
  return findPrimaryNavItemByPath(path)?.href ?? null;
}

describe("public navigation taxonomy", () => {
  it("exposes exactly the seven user-facing macro-areas", () => {
    expect(NAV_GROUPS.map((group) => group.label)).toEqual(
      EXPECTED_PRIMARY_GROUPS,
    );
  });

  it("keeps planned and hidden destinations out of the main menu", () => {
    const menuItems = NAV_GROUPS.flatMap((group) => group.items);

    expect(
      menuItems.every(
        (item) =>
          item.state !== "planned" &&
          item.state !== "hidden" &&
          item.visibility !== "hidden" &&
          item.visibility !== "search_only",
      ),
    ).toBe(true);
  });

  it("keeps technical and support pages searchable without promoting them", () => {
    const menuHrefs = new Set(hrefs(NAV_GROUPS));
    const searchHrefs = new Set(hrefs(COMMAND_PALETTE_GROUPS));

    for (const href of [
      "/sviluppatori",
      "/feeds",
      "/guida",
      "/roadmap",
      "/note-legali",
      "/chi-siamo",
      "/contatti",
    ]) {
      expect(menuHrefs.has(href)).toBe(false);
      expect(searchHrefs.has(href)).toBe(true);
    }
  });

  it("does not expose duplicate destinations in the primary menu", () => {
    const menuHrefs = hrefs(NAV_GROUPS);
    expect(new Set(menuHrefs).size).toBe(menuHrefs.length);
  });

  it("retains planned and legacy entries in the full inventory", () => {
    const allHrefs = new Set(hrefs(ALL_NAV_GROUPS));

    expect(allHrefs.has("/elezioni-voti")).toBe(true);
    expect(allHrefs.has("/dataset-scaricabili")).toBe(true);
    expect(allHrefs.has("/bandi")).toBe(true);
    expect(allHrefs.has("/archivio-proposte")).toBe(true);
  });
});

describe("active primary navigation area", () => {
  it("resolves primary pages and their detail routes", () => {
    expect(primaryGroupLabel("/contratti")).toBe("Spesa");
    expect(primaryGroupLabel("/contratti/CIG-123")).toBe("Spesa");
    expect(primaryGroupLabel("/legalita/trame-festival")).toBe("Legalità");
    expect(primaryGroupLabel("/albo")).toBe("Atti");
    expect(primaryGroupLabel("/albo/")).toBe("Atti");
  });

  it("keeps search-only pages anchored to their conceptual macro-area", () => {
    expect(primaryGroupLabel("/pareri")).toBe("Atti");
    expect(primaryGroupLabel("/statistiche")).toBe("Dati");
    expect(primaryGroupLabel("/sviluppatori")).toBe("Dati");
    expect(primaryGroupLabel("/feeds")).toBe("Dati");
    expect(primaryGroupLabel("/iscrizioni")).toBe("Partecipa");
  });

  it("resolves legacy aliases through their canonical destination", () => {
    expect(primaryGroupLabel("/performance/confronta")).toBe("Comune");
    expect(primaryGroupLabel("/monitoraggio/nuovo")).toBe("Partecipa");
    expect(primaryGroupLabel("/archivio-proposte")).toBe("Partecipa");
  });

  it("does not force project-support pages into a civic macro-area", () => {
    expect(primaryGroupLabel("/guida")).toBeNull();
    expect(primaryGroupLabel("/roadmap")).toBeNull();
    expect(primaryGroupLabel("/note-legali")).toBeNull();
    expect(primaryGroupLabel("/unknown-route")).toBeNull();
  });
});

describe("active primary navigation destination", () => {
  it("selects exactly the most specific visible destination", () => {
    expect(primaryItemHref("/legalita")).toBe("/legalita");
    expect(primaryItemHref("/legalita/trame-festival")).toBe(
      "/legalita/trame-festival",
    );
    expect(primaryItemHref("/contratti/CIG-123")).toBe("/contratti");
    expect(primaryItemHref("/albo")).toBe("/albo/");
  });

  it("maps canonical legacy routes to the visible destination", () => {
    expect(primaryItemHref("/performance/confronta")).toBe("/performance");
    expect(primaryItemHref("/monitoraggio/nuovo")).toBe("/segnalazioni");
  });

  it("keeps search-only routes from falsely highlighting a visible child", () => {
    expect(primaryItemHref("/sviluppatori")).toBeNull();
    expect(primaryItemHref("/pareri")).toBeNull();
  });
});
