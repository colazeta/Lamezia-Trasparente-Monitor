import { describe, it, expect } from "vitest";
import { parseNumber, isNumeric, inferColumns } from "./opendata";

describe("parseNumber", () => {
  it("interpreta i decimali all'italiana (virgola)", () => {
    expect(parseNumber("2,35")).toBe(2.35);
    expect(parseNumber("0,5")).toBe(0.5);
    expect(parseNumber("-2,35")).toBe(-2.35);
    expect(parseNumber("1234,56")).toBe(1234.56);
  });

  it("interpreta le migliaia all'italiana (punto come separatore)", () => {
    expect(parseNumber("1.234")).toBe(1234);
    expect(parseNumber("1.234.567")).toBe(1234567);
    expect(parseNumber("+1.000")).toBe(1000);
  });

  it("interpreta i numeri misti all'italiana (punto migliaia, virgola decimale)", () => {
    expect(parseNumber("1.234,56")).toBe(1234.56);
    expect(parseNumber("1.234.567,89")).toBe(1234567.89);
  });

  it("interpreta i decimali all'inglese (punto)", () => {
    expect(parseNumber("2.35")).toBe(2.35);
    expect(parseNumber("1.23")).toBe(1.23);
    expect(parseNumber("12.34")).toBe(12.34);
  });

  it("interpreta le migliaia all'inglese (virgola come separatore)", () => {
    expect(parseNumber("1,234")).toBe(1234);
    expect(parseNumber("1,234,567")).toBe(1234567);
  });

  it("interpreta i numeri misti all'inglese (virgola migliaia, punto decimale)", () => {
    expect(parseNumber("1,234.56")).toBe(1234.56);
    expect(parseNumber("1,234,567.89")).toBe(1234567.89);
  });

  it("interpreta gli interi", () => {
    expect(parseNumber("42")).toBe(42);
    expect(parseNumber("0")).toBe(0);
    expect(parseNumber("-7")).toBe(-7);
    expect(parseNumber("+7")).toBe(7);
  });

  it("ignora gli spazi attorno al valore", () => {
    expect(parseNumber("  2,35  ")).toBe(2.35);
    expect(parseNumber(" 1.234 ")).toBe(1234);
  });

  it("restituisce null per valori non numerici", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("   ")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("12abc")).toBeNull();
    expect(parseNumber("12,34,56,78x")).toBeNull();
    expect(parseNumber("€ 1.234,56")).toBeNull();
    expect(parseNumber("1 234")).toBeNull();
    expect(parseNumber("12/01/2024")).toBeNull();
    expect(parseNumber("N/A")).toBeNull();
  });
});

describe("isNumeric", () => {
  it("riconosce i valori numerici nei due formati", () => {
    expect(isNumeric("1.234,56")).toBe(true);
    expect(isNumeric("1,234.56")).toBe(true);
    expect(isNumeric("42")).toBe(true);
  });

  it("rifiuta i valori non numerici", () => {
    expect(isNumeric("")).toBe(false);
    expect(isNumeric("abc")).toBe(false);
    expect(isNumeric("2024-01-15")).toBe(false);
  });
});

describe("inferColumns", () => {
  it("classifica le colonne come number, date o string", () => {
    const headers = ["importo", "data", "descrizione"];
    const sample = [
      ["1.234,56", "2024-01-15", "Servizio A"],
      ["2,35", "2024-02-20", "Servizio B"],
      ["1000", "2024-03-01", "Servizio C"],
    ];
    expect(inferColumns(headers, sample)).toEqual([
      { name: "importo", type: "number" },
      { name: "data", type: "date" },
      { name: "descrizione", type: "string" },
    ]);
  });

  it("riconosce le date in formato gg/mm/aaaa e con orario", () => {
    const headers = ["data_iso", "data_it", "data_ora"];
    const sample = [
      ["2024-01-15", "15/01/2024", "2024-01-15T10:30"],
      ["2024-02-20", "20/02/2024", "2024-02-20 08:00"],
    ];
    expect(inferColumns(headers, sample)).toEqual([
      { name: "data_iso", type: "date" },
      { name: "data_it", type: "date" },
      { name: "data_ora", type: "date" },
    ]);
  });

  it("ignora le celle vuote quando deduce il tipo", () => {
    const headers = ["importo"];
    const sample = [["1.234,56"], [""], ["2,35"], ["   "]];
    expect(inferColumns(headers, sample)).toEqual([
      { name: "importo", type: "number" },
    ]);
  });

  it("usa string quando una colonna mescola numeri e testo", () => {
    const headers = ["valore"];
    const sample = [["1.234,56"], ["non disponibile"], ["2,35"]];
    expect(inferColumns(headers, sample)).toEqual([
      { name: "valore", type: "string" },
    ]);
  });

  it("classifica come string una colonna interamente vuota", () => {
    const headers = ["note"];
    const sample = [[""], ["   "], [""]];
    expect(inferColumns(headers, sample)).toEqual([
      { name: "note", type: "string" },
    ]);
  });
});
