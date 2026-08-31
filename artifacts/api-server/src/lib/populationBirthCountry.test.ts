import { describe, expect, it } from "vitest";
import {
  buildRcsBirthPayload,
  parseRcsBirthFormContract,
  parseRcsBirthResponse,
  summarizeBirthCountry,
  type ParsedBirthCountryObservation,
} from "./populationBirthCountry";

function formFixture() {
  const countries = Array.from({ length: 120 }, (_, index) => {
    const code = 100 + index;
    const label = code === 100 ? "Italia" : code === 201 ? "Albania" : `Paese ${code}`;
    return `<option value="${code}">${label}</option>`;
  }).join("");
  return `
    <form id="form-1" action="RPCCerca.php" method="POST">
      <select name="a"><option value="2018">2018</option><option value="2025">2025</option></select>
      <select name="nascita"><option value="9999">Tutti i Paesi</option>${countries}<option value="995">Altri Paesi</option></select>
      <input type="hidden" name="hid-i" value="RCS">
      <input type="hidden" name="hid-a" value="2025">
      <input type="hidden" name="hid-l" value="it">
      <input type="hidden" name="hid-cat" value="RCS">
      <input type="hidden" name="hid-dati" value="dati-form-1">
      <input type="hidden" name="hid-tavola" value="tavola-form-1">
    </form>`;
}

function responseFixture(year: number) {
  const rows = [
    { denominazione: "Italia", maschi: 300, femmine: 300, totale: 600 },
    { denominazione: "Albania", maschi: 70, femmine: 80, totale: 150 },
    ...Array.from({ length: 10 }, (_, index) => ({
      denominazione: `Paese ${101 + index}`,
      maschi: 10,
      femmine: 10,
      totale: 20,
    })),
  ].map((row) => ({ anno: year, territorio: "Lamezia Terme", ...row }));
  return JSON.stringify({ Status: true, Messaggio: null, datatable: { data: rows } });
}

describe("populationBirthCountry source contract", () => {
  it("discovers form-1 and builds a Lamezia-only country-of-birth query", () => {
    const contract = parseRcsBirthFormContract(formFixture());
    expect(contract.years).toEqual([2018, 2025]);
    expect(contract.countryLabels["100"]).toBe("Italia");

    const payload = buildRcsBirthPayload(contract, 2025);
    expect(payload).toMatchObject({
      a: "2025",
      "hid-a": "2025",
      "hid-i": "RCS",
      "hid-dati": "dati-form-1",
      "hid-tavola": "tavola-form-1",
      nascita: "9999",
      ripartizione: "4",
      regione: "18",
      provincia: "079",
      comune: "079160",
    });
  });

  it("maps response labels to country codes and preserves the historical source status", () => {
    const contract = parseRcsBirthFormContract(formFixture());
    const current = parseRcsBirthResponse(responseFixture(2025), contract, 2025);
    expect(current.find((row) => row.birthCountry === "100" && row.sex === "total")).toMatchObject({
      value: 600,
      sourceStatus: "final",
    });
    expect(current.find((row) => row.birthCountry === "201" && row.sex === "female")?.value).toBe(80);

    const historical = parseRcsBirthResponse(responseFixture(2018), contract, 2018);
    expect(new Set(historical.map((row) => row.sourceStatus))).toEqual(new Set(["reconstructed"]));
    expect(historical.every((row) => row.qualityFlags.includes("source_reconstructed"))).toBe(true);
  });

  it("fails closed when the source returns a country label outside the declared domain", () => {
    const contract = parseRcsBirthFormContract(formFixture());
    const payload = JSON.stringify({
      Status: true,
      datatable: {
        data: [{ anno: 2025, denominazione: "Paese non dichiarato", maschi: 1, femmine: 1, totale: 2 }],
      },
    });
    expect(() => parseRcsBirthResponse(payload, contract, 2025)).toThrow(/unmapped country labels/i);
  });

  it("derives born-abroad counts from country of birth, independently of citizenship", () => {
    const rows: ParsedBirthCountryObservation[] = [
      ["100", "Italia", 300, 300, 600],
      ["201", "Albania", 80, 70, 150],
      ["235", "Romania", 50, 50, 100],
      ["401", "Algeria", 30, 20, 50],
      ["995", "Altri Paesi", 50, 50, 100],
    ].flatMap(([code, label, male, female, total]) =>
      ([
        { sex: "male", value: male },
        { sex: "female", value: female },
        { sex: "total", value: total },
      ] as const).map((item) => ({
        period: "2025",
        birthCountry: String(code),
        birthCountryLabel: String(label),
        sex: item.sex,
        value: Number(item.value),
        sourceStatus: "final" as const,
        rawStatus: null,
        qualityFlags: [],
      })),
    );

    const summary = summarizeBirthCountry(rows, "2025", 1000);
    expect(summary.counts).toMatchObject({
      population: 1000,
      bornInItaly: 600,
      bornAbroad: 400,
      bornAbroadShare: 40,
    });
    expect(summary.topBirthCountries[0]).toMatchObject({ name: "Albania", total: 150 });
    expect(summary.topBirthCountries.some((row) => row.code === "995")).toBe(false);
    expect(summary.quality.coverageDifference).toBe(0);
  });
});
