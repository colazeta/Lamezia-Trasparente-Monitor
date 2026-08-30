import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_demographic_contract_test";

async function ingestionHelpers() {
  return import("./demographicBalanceIngestion");
}

async function balanceHelpers() {
  return import("./demographicBalance");
}

const coreColumns = [
  { data: "sesso", title: "Sesso" },
  { data: "nati", title: "Nati vivi" },
  { data: "morti", title: "Morti" },
  { data: "int_in", title: "Iscritti da altri comuni" },
  { data: "int_out", title: "Cancellati per altri comuni" },
  { data: "ext_in", title: "Iscritti dall'estero" },
  { data: "ext_out", title: "Cancellati per l'estero" },
];

const coreRow = {
  sesso: "Totale",
  nati: 400,
  morti: 650,
  int_in: 1200,
  int_out: 1300,
  ext_in: 350,
  ext_out: 150,
};

describe("self-describing ISTAT form contract", () => {
  it("replays every hidden field declared by form-0, including optional query", async () => {
    const { parseDemoFormContract, buildPayloadFromContract } = await ingestionHelpers();
    const html = `
      <form id="form-0" action="RPCCerca.php" method="POST">
        <select name="a"><option value="2025">2025</option><option value="2024">2024</option></select>
        <input type="hidden" name="hid-i" value="P02">
        <input type="hidden" name="hid-a" value="2025">
        <input type="hidden" name="hid-l" value="it">
        <input type="hidden" name="hid-cat" value="P02_SPECIAL">
        <input type="hidden" name="hid-dati" value="dati-form-0">
        <input type="hidden" name="hid-tavola" value="tavola-form-0">
        <input type="hidden" name="query" value="0">
      </form>`;

    const contract = parseDemoFormContract(html, "P02");
    expect(contract.years).toEqual([2024, 2025]);
    expect(contract.fixedFields).toMatchObject({
      "hid-cat": "P02_SPECIAL",
      query: "0",
    });
    expect(buildPayloadFromContract(contract, 2024)).toMatchObject({
      a: "2024",
      "hid-a": "2024",
      "hid-cat": "P02_SPECIAL",
      query: "0",
      ripartizione: "4",
      regione: "18",
      provincia: "079",
      comune: "079160",
    });
  });

  it("fails loudly when the source no longer declares a required hidden field", async () => {
    const { parseDemoFormContract } = await ingestionHelpers();
    const html = `
      <form id="form-0">
        <select name="a"><option value="2026">2026</option></select>
        <input type="hidden" name="hid-i" value="D7B">
        <input type="hidden" name="hid-a" value="2026">
        <input type="hidden" name="hid-l" value="it">
        <input type="hidden" name="hid-cat" value="D7B">
        <input type="hidden" name="hid-dati" value="dati-form-0">
      </form>`;
    expect(() => parseDemoFormContract(html, "D7B")).toThrow(/hid-tavola/);
  });
});

describe("annual provisional/final semantics", () => {
  it("prefers censused start/end stocks and upgrades the release to final", async () => {
    const { prepareBalanceResponse, refineAnnualStatus } = await ingestionHelpers();
    const { extractBalanceRows } = await balanceHelpers();
    const source = {
      Status: true,
      caption: "Bilancio demografico",
      datatable: {
        columns: [
          ...coreColumns,
          { data: "pop_start_prov", title: "Popolazione al 1 gennaio" },
          { data: "pop_end_prov", title: "Popolazione al 31 dicembre" },
          { data: "pop_start_final", title: "Popolazione censita al 1 gennaio" },
          { data: "pop_end_final", title: "Popolazione censita al 31 dicembre" },
          { data: "adj", title: "Aggiustamento statistico" },
        ],
        data: [
          {
            ...coreRow,
            pop_start_prov: 68010,
            pop_end_prov: 67960,
            pop_start_final: 68000,
            pop_end_final: 67940,
            adj: -10,
          },
        ],
      },
    };

    const prepared = prepareBalanceResponse(source, "annual");
    expect(prepared.hasFinalAnnualStocks).toBe(true);
    let rows = extractBalanceRows(prepared.response, 2024, "annual", "provisional");
    rows = refineAnnualStatus(rows, prepared.hasFinalAnnualStocks, "provisional");
    expect(rows[0].status).toBe("final");
    expect(rows[0].values.populationStart).toBe(68000);
    expect(rows[0].values.populationEnd).toBe(67940);
    expect(rows[0].values.statisticalAdjustment).toBe(-10);
  });

  it("keeps the latest annual release provisional when only provisional stocks exist", async () => {
    const { prepareBalanceResponse, refineAnnualStatus } = await ingestionHelpers();
    const { extractBalanceRows } = await balanceHelpers();
    const source = {
      Status: true,
      caption: "Bilancio demografico",
      datatable: {
        columns: [
          ...coreColumns,
          { data: "pop_start", title: "Popolazione al 1 gennaio" },
          { data: "pop_end", title: "Popolazione al 31 dicembre" },
        ],
        data: [{ ...coreRow, pop_start: 68000, pop_end: 67950 }],
      },
    };

    const prepared = prepareBalanceResponse(source, "annual");
    expect(prepared.hasFinalAnnualStocks).toBe(false);
    let rows = extractBalanceRows(prepared.response, 2025, "annual", "provisional");
    rows = refineAnnualStatus(rows, prepared.hasFinalAnnualStocks, "provisional");
    expect(rows[0].status).toBe("provisional");
    expect(rows[0].values.populationEnd).toBe(67950);
    expect(rows[0].values.statisticalAdjustment).toBeUndefined();
  });
});
