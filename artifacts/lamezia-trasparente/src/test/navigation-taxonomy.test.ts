import { describe, expect, it } from "vitest";
import {
  ALL_NAV_GROUPS,
  COMMAND_PALETTE_GROUPS,
  NAV_GROUPS,
} from "@/components/layout/navSections";

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
