import { describe, expect, it } from "vitest";

import {
  parseAlboReaderState,
  updateAlboReaderSearch,
} from "@/lib/alboReaderState";

describe("Albo reader URL state", () => {
  it("round-trips every shareable reader control", () => {
    const search = updateAlboReaderSearch("", {
      q: "mobilità urbana",
      sector: "lavori_pubblici",
      actType: "deliberazione",
      page: 3,
      selectedActId: "albo-2026-42",
    });

    expect(parseAlboReaderState(search)).toEqual({
      q: "mobilità urbana",
      sector: "lavori_pubblici",
      actType: "deliberazione",
      page: 3,
      selectedActId: "albo-2026-42",
    });
  });

  it("omits defaults and rejects invalid page numbers", () => {
    expect(
      updateAlboReaderSearch("?q=atto&pagina=4&atto=albo-1", {
        q: "",
        sector: "all",
        actType: "all",
        page: 1,
        selectedActId: null,
      }),
    ).toBe("");

    expect(parseAlboReaderState("?pagina=-2").page).toBe(1);
    expect(parseAlboReaderState("?pagina=test").page).toBe(1);
  });
});
