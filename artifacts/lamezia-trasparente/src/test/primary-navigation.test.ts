import { describe, expect, it } from "vitest";
import {
  PARTICIPATION_NAV_ITEMS,
  PRIMARY_NAV_GROUPS,
} from "@/components/layout/primaryNavigation";
import { COMMAND_PALETTE_GROUPS } from "@/components/layout/navSections";

const flattenHrefs = (groups: typeof PRIMARY_NAV_GROUPS) =>
  groups.flatMap((group) => group.items.map((item) => item.href));

describe("primary information architecture", () => {
  it("uses five user-oriented information domains", () => {
    expect(PRIMARY_NAV_GROUPS.map((group) => group.label)).toEqual([
      "Decisioni",
      "Spesa e progetti",
      "Comune e risultati",
      "Territorio e legalità",
      "Dati e fonti",
    ]);
  });

  it("keeps the main civic entry points in primary navigation", () => {
    const hrefs = flattenHrefs(PRIMARY_NAV_GROUPS);

    expect(hrefs).toContain("/convocazioni");
    expect(hrefs).toContain("/contratti");
    expect(hrefs).toContain("/performance");
    expect(hrefs).toContain("/atlante-territoriale");
    expect(hrefs).toContain("/legalita");
    expect(hrefs).toContain("/opendata");
  });

  it("treats participation as an action while preserving its destinations", () => {
    expect(PARTICIPATION_NAV_ITEMS.map((item) => item.href)).toEqual(
      expect.arrayContaining([
        "/segnalazioni",
        "/accesso-civico",
        "/proposte-civiche",
      ]),
    );
  });

  it("does not remove secondary sections from global search", () => {
    const commandHrefs = COMMAND_PALETTE_GROUPS.flatMap((group) =>
      group.items.map((item) => item.href),
    );

    expect(commandHrefs).toContain("/feeds");
    expect(commandHrefs).toContain("/sviluppatori");
    expect(commandHrefs).toContain("/domande");
    expect(commandHrefs).toContain("/temi");
  });
});
