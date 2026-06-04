import { describe, it, expect } from "vitest";
import {
  parseAccessoCivicoImport,
  parseDelimited,
  normalizeDate,
} from "./accessoCivicoImport";

describe("normalizeDate", () => {
  it("keeps ISO dates", () => {
    expect(normalizeDate("2024-03-15")).toBe("2024-03-15");
    expect(normalizeDate("2024-03-15T10:00:00Z")).toBe("2024-03-15");
  });

  it("converts dd/mm/yyyy", () => {
    expect(normalizeDate("15/03/2024")).toBe("2024-03-15");
    expect(normalizeDate("5/3/2024")).toBe("2024-03-05");
  });

  it("converts dd-mm-yyyy and dd.mm.yyyy", () => {
    expect(normalizeDate("15-03-2024")).toBe("2024-03-15");
    expect(normalizeDate("15.03.2024")).toBe("2024-03-15");
  });

  it("returns null for empty or invalid", () => {
    expect(normalizeDate("")).toBeNull();
    expect(normalizeDate("not-a-date")).toBeNull();
  });

  it("rejects impossible calendar dates instead of normalizing them", () => {
    expect(normalizeDate("31/02/2024")).toBeNull();
    expect(normalizeDate("2024-02-31")).toBeNull();
    expect(normalizeDate("29/02/2023")).toBeNull();
    expect(normalizeDate("2023-02-29")).toBeNull();
    expect(normalizeDate("32/01/2024")).toBeNull();
    expect(normalizeDate("15/13/2024")).toBeNull();
    expect(normalizeDate("2024-13-01")).toBeNull();
  });

  it("accepts a valid leap day", () => {
    expect(normalizeDate("29/02/2024")).toBe("2024-02-29");
    expect(normalizeDate("2024-02-29")).toBe("2024-02-29");
  });
});

describe("parseDelimited", () => {
  it("detects semicolon delimiter", () => {
    const rows = parseDelimited("a;b;c\n1;2;3");
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with embedded delimiters", () => {
    const rows = parseDelimited('oggetto,note\n"Accesso, atti","riga 1"');
    expect(rows[1][0]).toBe("Accesso, atti");
    expect(rows[1][1]).toBe("riga 1");
  });

  it("skips fully empty lines", () => {
    const rows = parseDelimited("a,b\n\n1,2\n");
    expect(rows).toHaveLength(2);
  });
});

describe("parseAccessoCivicoImport", () => {
  it("errors when oggetto column is missing", () => {
    const result = parseAccessoCivicoImport("foo,bar\n1,2");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.rows).toHaveLength(0);
  });

  it("maps Italian headers and normalizes values", () => {
    const csv = [
      "Oggetto;Tipo;Ente;Data presentazione;Esito;Note esito;Fonte",
      "Copia delibere;documentale;Comune;15/03/2024;Accolta;Concessa;https://x.it",
    ].join("\n");
    const result = parseAccessoCivicoImport(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    const row = result.rows[0];
    expect(row.oggetto).toBe("Copia delibere");
    expect(row.tipo).toBe("documentale");
    expect(row.ente).toBe("Comune");
    expect(row.requestDate).toBe("2024-03-15");
    expect(row.stato).toBe("accolta");
    expect(row.esitoNote).toBe("Concessa");
    expect(row.fonteUrl).toBe("https://x.it");
  });

  it("maps outcome synonyms to stato enum", () => {
    const csv = [
      "oggetto,stato",
      "a,respinta",
      "b,in corso",
      "c,accoglimento",
    ].join("\n");
    const result = parseAccessoCivicoImport(csv);
    expect(result.rows.map((r) => r.stato)).toEqual([
      "rifiutata",
      "in-attesa",
      "accolta",
    ]);
  });

  it("reports unmapped headers and surfaces oggetto-less rows as invalid", () => {
    const csv = ["oggetto,colonnasconosciuta", "valido,x", ",y"].join("\n");
    const result = parseAccessoCivicoImport(csv);
    expect(result.unmappedHeaders).toContain("colonnasconosciuta");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].oggetto).toBe("valido");
    // The oggetto-less row must be reported, not silently dropped.
    expect(result.invalidRows).toHaveLength(1);
    expect(result.invalidRows[0].riga).toBe(2);
    expect(result.invalidRows[0].motivi.join(" ")).toMatch(/oggetto/i);
  });

  it("flags rows with an invalid date instead of importing them blank", () => {
    const csv = [
      "oggetto,data presentazione",
      "valido,15/03/2024",
      "rotto,data-non-valida",
    ].join("\n");
    const result = parseAccessoCivicoImport(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].oggetto).toBe("valido");
    expect(result.invalidRows).toHaveLength(1);
    expect(result.invalidRows[0].oggetto).toBe("rotto");
    expect(result.invalidRows[0].motivi.join(" ")).toMatch(/data/i);
  });

  it("returns an empty invalidRows array on a clean file", () => {
    const csv = ["oggetto", "a", "b"].join("\n");
    const result = parseAccessoCivicoImport(csv);
    expect(result.invalidRows).toEqual([]);
    expect(result.rows).toHaveLength(2);
  });
});
