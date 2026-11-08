import { afterEach, describe, expect, it, vi } from "vitest";

import { HOME_PRIMARY_GATEWAYS, openGlobalSearch } from "../pages/Home";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Home IA v2", () => {
  it("offers only three entry points on the home", () => {
    expect(HOME_PRIMARY_GATEWAYS.map((gateway) => gateway.title)).toEqual([
      "Sedute e decisioni",
      "Spesa pubblica",
      "Amministratori",
    ]);
    expect(HOME_PRIMARY_GATEWAYS.map((gateway) => gateway.href)).toEqual([
      "/convocazioni",
      "/contratti",
      "/organi",
    ]);
  });

  it("opens the existing global-search keyboard channel instead of creating a second search", () => {
    const listener = vi.fn();
    document.addEventListener("keydown", listener);

    openGlobalSearch();

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as KeyboardEvent;
    expect(event.key).toBe("/");

    document.removeEventListener("keydown", listener);
  });
});
