import { describe, expect, it } from "vitest";
import { navigationSubgroups } from "../components/layout/conceptualNavigation";

import {
  COMMAND_PALETTE_GROUPS,
  NAV_GROUPS,
} from "../components/layout/navSections";
import {
  PARTICIPATION_ACTIONS,
  PRIMARY_NAV_GROUPS,
} from "../components/layout/primaryNavigation";

describe("primary navigation v2", () => {
  it("groups every public destination without hiding or duplicating links", () => {
    for (const group of PRIMARY_NAV_GROUPS) {
      const subgroups = navigationSubgroups(group.items);
      expect(subgroups.some((s) => s.label === "Altri percorsi")).toBe(false);
      expect(
        subgroups
          .flatMap((s) => s.items)
          .map((i) => i.href)
          .sort(),
      ).toEqual(group.items.map((i) => i.href).sort());
    }
    expect(
      navigationSubgroups(PRIMARY_NAV_GROUPS[1].items).map((s) => s.label),
    ).toEqual(["Appalti", "Progetti"]);
  });
  it("projects the internal taxonomy onto five user-facing domains", () => {
    expect(PRIMARY_NAV_GROUPS.map((group) => group.label)).toEqual([
      "Decisioni",
      "Spesa e progetti",
      "Comune e risultati",
      "Territorio e legalità",
      "Dati e fonti",
    ]);
  });

  it("keeps every non-participation primary item in exactly one primary domain", () => {
    const legacyPrimaryItems = NAV_GROUPS.filter(
      (group) => group.label !== "Partecipa",
    ).flatMap((group) => group.items);
    const projectedItems = PRIMARY_NAV_GROUPS.flatMap((group) => group.items);
    const projectedHrefs = projectedItems.map((item) => item.href);

    expect(new Set(projectedHrefs).size).toBe(projectedHrefs.length);
    expect(new Set(projectedHrefs)).toEqual(
      new Set(legacyPrimaryItems.map((item) => item.href)),
    );
  });

  it("treats participation as persistent actions, not a sixth information domain", () => {
    expect(PARTICIPATION_ACTIONS.map((item) => item.href)).toEqual([
      "/segnalazioni",
      "/accesso-civico",
      "/proposte-civiche",
    ]);

    const projectedHrefs = PRIMARY_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => item.href),
    );
    for (const action of PARTICIPATION_ACTIONS) {
      expect(projectedHrefs).not.toContain(action.href);
    }
  });

  it("does not reduce command-palette coverage", () => {
    const commandPaletteHrefs = COMMAND_PALETTE_GROUPS.flatMap((group) =>
      group.items.map((item) => item.href),
    );

    for (const href of [
      "/segnalazioni",
      "/accesso-civico",
      "/proposte-civiche",
      "/statistiche",
      "/sviluppatori",
      "/feeds",
      "/domande",
      "/temi",
    ]) {
      expect(commandPaletteHrefs).toContain(href);
    }
  });
});
