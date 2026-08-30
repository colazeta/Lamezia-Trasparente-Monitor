import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_sex_layout_test";

async function ingestionHelpers() {
  return import("./demographicBalanceIngestion");
}

async function balanceHelpers() {
  return import("./demographicBalance");
}

describe("ISTAT balance sex layout", () => {
  it("selects Totale rather than Maschi/Femmine when sex is encoded in columns", async () => {
    const { prepareBalanceResponse } = await ingestionHelpers();
    const { extractBalanceRows } = await balanceHelpers();
    const response = {
      Status: true,
      datatable: {
        columns: [
          { data: "nati_m", title: "Nati - Maschi" },
          { data: "nati_f", title: "Nati - Femmine" },
          { data: "nati_t", title: "Nati - Totale" },
          { data: "morti_m", title: "Morti - Maschi" },
          { data: "morti_f", title: "Morti - Femmine" },
          { data: "morti_t", title: "Morti - Totale" },
          { data: "iin_m", title: "Iscritti da altri comuni - Maschi" },
          { data: "iin_f", title: "Iscritti da altri comuni - Femmine" },
          { data: "iin_t", title: "Iscritti da altri comuni - Totale" },
          { data: "iout_m", title: "Cancellati per altri comuni - Maschi" },
          { data: "iout_f", title: "Cancellati per altri comuni - Femmine" },
          { data: "iout_t", title: "Cancellati per altri comuni - Totale" },
          { data: "ein_m", title: "Iscritti dall'estero - Maschi" },
          { data: "ein_f", title: "Iscritti dall'estero - Femmine" },
          { data: "ein_t", title: "Iscritti dall'estero - Totale" },
          { data: "eout_m", title: "Cancellati per l'estero - Maschi" },
          { data: "eout_f", title: "Cancellati per l'estero - Femmine" },
          { data: "eout_t", title: "Cancellati per l'estero - Totale" },
        ],
        data: [
          {
            nati_m: 210,
            nati_f: 190,
            nati_t: 400,
            morti_m: 310,
            morti_f: 340,
            morti_t: 650,
            iin_m: 580,
            iin_f: 620,
            iin_t: 1200,
            iout_m: 640,
            iout_f: 660,
            iout_t: 1300,
            ein_m: 180,
            ein_f: 170,
            ein_t: 350,
            eout_m: 80,
            eout_f: 70,
            eout_t: 150,
          },
        ],
      },
    };

    const prepared = prepareBalanceResponse(response, "annual");
    const rows = extractBalanceRows(prepared.response, 2025, "annual", "provisional");
    expect(rows).toHaveLength(1);
    expect(rows[0].values).toMatchObject({
      births: 400,
      deaths: 650,
      internalIn: 1200,
      internalOut: 1300,
      foreignIn: 350,
      foreignOut: 150,
    });
  });

  it("can use undeclared technical total keys while still requiring semantic core fields", async () => {
    const { prepareBalanceResponse } = await ingestionHelpers();
    const { extractBalanceRows } = await balanceHelpers();
    const response = {
      Status: true,
      datatable: {
        columns: [],
        data: [
          {
            nati_m: 210,
            nati_t: 400,
            morti_m: 310,
            morti_t: 650,
            iscritti_da_altri_comuni_m: 580,
            iscritti_da_altri_comuni_t: 1200,
            cancellati_per_altri_comuni_m: 640,
            cancellati_per_altri_comuni_t: 1300,
            iscritti_dall_estero_m: 180,
            iscritti_dall_estero_t: 350,
            cancellati_per_l_estero_m: 80,
            cancellati_per_l_estero_t: 150,
          },
        ],
      },
    };

    const prepared = prepareBalanceResponse(response, "annual");
    const rows = extractBalanceRows(prepared.response, 2025, "annual", "provisional");
    expect(rows[0].values.births).toBe(400);
    expect(rows[0].values.deaths).toBe(650);
    expect(rows[0].values.internalIn).toBe(1200);
    expect(rows[0].values.foreignOut).toBe(150);
  });
});
