import { describe, expect, it } from "vitest";

import { parseExplicitAmount } from "./contractsSource";

describe("contract source primitives", () => {
  it("parses explicit monetary amounts without treating unrelated percentages as money", () => {
    expect(parseExplicitAmount("Importo complessivo: 12.345,67 euro")).toBe(
      12345.67,
    );
    expect(parseExplicitAmount("Ritenuta per infortuni 0,5%")) .toBe(0);
  });
});
