import { describe, expect, it } from "vitest";

import {
  findParticipationNavItemByPath,
  findPrimaryNavGroupByPath,
  findPrimaryNavItemByPath,
  isParticipationPath,
} from "../components/layout/navState";

function primaryState(path: string) {
  return {
    group: findPrimaryNavGroupByPath(path)?.label ?? null,
    item: findPrimaryNavItemByPath(path)?.href ?? null,
  };
}

describe("navigation state resolution", () => {
  it("prefers the most-specific visible destination on nested routes", () => {
    expect(primaryState("/legalita/trame-festival")).toEqual({
      group: "Territorio e legalità",
      item: "/legalita/trame-festival",
    });
  });

  it("normalizes trailing slashes", () => {
    expect(primaryState("/albo")).toEqual({
      group: "Decisioni",
      item: "/albo/",
    });
    expect(primaryState("/albo/")).toEqual({
      group: "Decisioni",
      item: "/albo/",
    });
  });

  it("resolves hidden legacy aliases through their canonical destinations", () => {
    expect(primaryState("/bandi")).toEqual({
      group: "Spesa e progetti",
      item: "/contratti",
    });
    expect(primaryState("/performance/confronta")).toEqual({
      group: "Comune e risultati",
      item: "/performance",
    });
    expect(primaryState("/legalita/timeline")).toEqual({
      group: "Territorio e legalità",
      item: "/legalita",
    });
  });

  it("activates a five-domain context for search-only routes without inventing a child highlight", () => {
    expect(primaryState("/sviluppatori")).toEqual({
      group: "Dati e fonti",
      item: null,
    });
    expect(primaryState("/pareri")).toEqual({
      group: "Decisioni",
      item: null,
    });
  });

  it("resolves participation aliases separately from the five information domains", () => {
    expect(isParticipationPath("/monitoraggio/nuovo")).toBe(true);
    expect(findPrimaryNavGroupByPath("/monitoraggio/nuovo")).toBeNull();
    expect(findParticipationNavItemByPath("/monitoraggio/nuovo")?.href).toBe(
      "/segnalazioni",
    );
  });

  it("keeps search-only participation routes active without selecting a visible action", () => {
    expect(isParticipationPath("/iscrizioni")).toBe(true);
    expect(findParticipationNavItemByPath("/iscrizioni")).toBeNull();
  });

  it("ignores query strings and fragments when resolving navigation state", () => {
    expect(primaryState("/contratti/42?tab=fonti#documenti")).toEqual({
      group: "Spesa e progetti",
      item: "/contratti",
    });
  });
});
