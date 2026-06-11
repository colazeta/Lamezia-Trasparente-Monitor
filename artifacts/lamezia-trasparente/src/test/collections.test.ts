import { describe, expect, it } from "vitest";

import { dedupeStable } from "@/lib/collections";

describe("dedupeStable", () => {
  it("returns an empty array for empty input", () => {
    expect(dedupeStable([])).toEqual([]);
  });

  it("preserves already unique primitive input", () => {
    const input = ["albo", "bandi", "delibere"];

    expect(dedupeStable(input)).toEqual(input);
  });

  it("deduplicates primitive values with SameValueZero semantics", () => {
    expect(dedupeStable([1, 2, 1, NaN, NaN, 0, -0, 3])).toEqual([
      1,
      2,
      NaN,
      0,
      3,
    ]);
  });

  it("deduplicates objects through a selector", () => {
    const first = { id: "a", label: "Prima occorrenza" };
    const duplicate = { id: "a", label: "Duplicato" };
    const second = { id: "b", label: "Seconda occorrenza" };

    expect(dedupeStable([first, duplicate, second], (item) => item.id)).toEqual([
      first,
      second,
    ]);
  });

  it("deduplicates missing and null selector keys deterministically", () => {
    type Item = { id?: string | null; label: string };
    const missingFirst: Item = { label: "chiave assente iniziale" };
    const missingDuplicate: Item = { label: "chiave assente duplicata" };
    const nullFirst: Item = { id: null, label: "chiave nulla iniziale" };
    const nullDuplicate: Item = { id: null, label: "chiave nulla duplicata" };
    const keyed: Item = { id: "atti", label: "chiave presente" };

    expect(
      dedupeStable(
        [missingFirst, missingDuplicate, nullFirst, nullDuplicate, keyed],
        (item) => item.id,
      ),
    ).toEqual([missingFirst, nullFirst, keyed]);
  });

  it("preserves the order of the first occurrence", () => {
    expect(dedupeStable(["b", "a", "b", "c", "a", "d"])).toEqual([
      "b",
      "a",
      "c",
      "d",
    ]);
  });

  it("does not mutate the original array", () => {
    const input = ["uno", "due", "uno"];
    const snapshot = [...input];

    const result = dedupeStable(input);

    expect(result).toEqual(["uno", "due"]);
    expect(input).toEqual(snapshot);
    expect(result).not.toBe(input);
  });
});
