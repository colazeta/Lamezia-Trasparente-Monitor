import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_demographic_balance_test";

async function helpers() {
  return import("./demographicBalance");
}

function annualResponse() {
  return {
    Status: true,
    caption: "Bilancio demografico 2025 - dati definitivi",
    nota: "",
    datatable: {
      columns: [
        { data: "sesso", title: "Sesso" },
        { data: "nati", title: "Movimento naturale - Nati vivi" },
        { data: "morti", title: "Movimento naturale - Morti" },
        { data: "int_in", title: "Iscritti da altri comuni" },
        { data: "int_out", title: "Cancellati per altri comuni" },
        { data: "ext_in", title: "Iscritti dall'estero" },
        { data: "ext_out", title: "Cancellati per l'estero" },
        { data: "other_in", title: "Iscritti per altri motivi" },
        { data: "other_out", title: "Cancellati per altri motivi" },
        { data: "adjustment", title: "Aggiustamento statistico" },
        { data: "pop_start", title: "Popolazione al 1 gennaio" },
        { data: "pop_end", title: "Popolazione al 31 dicembre" },
      ],
      data: [
        {
          sesso: "Maschi",
          nati: 250,
          morti: 320,
          int_in: 600,
          int_out: 680,
          ext_in: 210,
          ext_out: 100,
          other_in: 10,
          other_out: 20,
          adjustment: -15,
          pop_start: 33000,
          pop_end: 32945,
        },
        {
          sesso: "Femmine",
          nati: 240,
          morti: 340,
          int_in: 620,
          int_out: 700,
          ext_in: 190,
          ext_out: 90,
          other_in: 10,
          other_out: 20,
          adjustment: -15,
          pop_start: 35000,
          pop_end: 34905,
        },
        {
          sesso: "Totale",
          nati: 490,
          morti: 660,
          int_in: 1220,
          int_out: 1380,
          ext_in: 400,
          ext_out: 190,
          other_in: 20,
          other_out: 40,
          adjustment: -30,
          pop_start: 68000,
          pop_end: 67850,
        },
      ],
    },
  };
}

describe("ISTAT demo balance parsing", () => {
  it("discovers year options from the self-describing table page", async () => {
    const { parseAvailableYears } = await helpers();
    expect(
      parseAvailableYears(
        '<select name="a"><option value="2025">2025</option><option value="2024">2024</option></select>',
      ),
    ).toEqual([2024, 2025]);
  });

  it("builds the targeted Lamezia municipal payload", async () => {
    const { buildDemoPayload } = await helpers();
    expect(buildDemoPayload("P02", 2025)).toMatchObject({
      a: "2025",
      ripartizione: "4",
      regione: "18",
      provincia: "079",
      comune: "079160",
      "hid-i": "P02",
      "hid-dati": "dati-form-0",
      "hid-tavola": "tavola-form-0",
    });
  });

  it("selects the total-sex row and maps semantic column titles", async () => {
    const { extractBalanceRows } = await helpers();
    const rows = extractBalanceRows(annualResponse(), 2025, "annual", "final");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      period: "2025",
      status: "final",
      values: {
        births: 490,
        deaths: 660,
        internalIn: 1220,
        internalOut: 1380,
        foreignIn: 400,
        foreignOut: 190,
        otherIn: 20,
        otherOut: 40,
        statisticalAdjustment: -30,
        populationStart: 68000,
        populationEnd: 67850,
      },
    });
  });

  it("extracts one total observation per month", async () => {
    const { extractBalanceRows } = await helpers();
    const response = annualResponse();
    response.caption = "Bilancio mensile - dati provvisori";
    response.datatable.columns.unshift({ data: "mese", title: "Mese" });
    response.datatable.data = [
      { ...response.datatable.data[2], mese: "Gennaio" },
      { ...response.datatable.data[2], mese: "Febbraio" },
    ];
    const rows = extractBalanceRows(response, 2026, "monthly", "provisional");
    expect(rows.map((row) => [row.period, row.status])).toEqual([
      ["2026-01", "provisional"],
      ["2026-02", "provisional"],
    ]);
  });
});

describe("demographic balance reconciliation", () => {
  it("reconciles annual change without double-counting other reasons", async () => {
    const { reconcileBalancePoint } = await helpers();
    const point = reconcileBalancePoint({
      period: "2025",
      births: 100,
      deaths: 120,
      internalIn: 50,
      internalOut: 70,
      foreignIn: 40,
      foreignOut: 10,
      otherIn: 8,
      otherOut: 3,
      statisticalAdjustment: -5,
      coverageAdjustment: null,
      populationStart: 1000,
      populationEnd: 985,
      sourceStatus: "final",
      granularity: "annual",
    });
    // -20 natural -20 internal +30 foreign -5 adjustment = -15.
    expect(point.accountedChange).toBe(-15);
    expect(point.observedChange).toBe(-15);
    expect(point.residual).toBe(0);
    expect(point.reconciliation).toBe("exact");
  });

  it("does not include other-reason flows in provisional monthly population", async () => {
    const { reconcileBalancePoint } = await helpers();
    const point = reconcileBalancePoint({
      period: "2026-01",
      births: 40,
      deaths: 50,
      internalIn: 100,
      internalOut: 90,
      foreignIn: 20,
      foreignOut: 10,
      otherIn: 20,
      otherOut: 0,
      statisticalAdjustment: null,
      coverageAdjustment: null,
      populationStart: 1000,
      populationEnd: 1010,
      sourceStatus: "provisional",
      granularity: "monthly",
    });
    expect(point.otherBalance).toBe(20);
    expect(point.accountedChange).toBe(10);
    expect(point.reconciliation).toBe("exact");
  });
});
