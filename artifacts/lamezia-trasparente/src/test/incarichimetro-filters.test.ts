import { describe, expect, it } from "vitest";

import {
  buildContractRecord,
  buildOperatorAggregates,
  buildPublicationRecord,
  DEFAULT_INCARICHIMETRO_FILTERS,
  extractCig,
  extractCup,
  extractOperator,
  filterMonitoredRecords,
  hasIncaricoKeyword,
} from "@/lib/incarichimetroFilters";

describe("incarichimetroFilters", () => {
  it("riconosce solo testi pertinenti agli incarichi", () => {
    expect(hasIncaricoKeyword("Affidamento incarico legale esterno")).toBe(true);
    expect(hasIncaricoKeyword("Ordinanza su viabilità temporanea")).toBe(false);
  });

  it("estrae CIG e CUP da testo libero con formato prudente", () => {
    const text = "SMART CIG Z123456789 - CUP H11B22000370004";

    expect(extractCig(text)).toBe("Z123456789");
    expect(extractCup(text)).toBe("H11B22000370004");
    expect(extractCig("CIG incompleto ABC")).toBeNull();
    expect(extractCup("nessun codice progetto indicato")).toBeNull();
  });

  it("estrae l'operatore solo quando una formula testuale lo rende plausibile", () => {
    expect(
      extractOperator(
        "Affidamento diretto alla ditta Studio Beta Srl per servizio professionale",
      ),
    ).toBe("Studio Beta Srl");
    expect(extractOperator("Determina per supporto al rup senza beneficiario nel testo")).toBeNull();
  });

  it("costruisce record contratto con flags descrittivi e fonte ufficiale", () => {
    const record = buildContractRecord({
      id: "42",
      title: "Affidamento incarico tecnico",
      description: "Supporto al rup",
      procedureType: "affidamento diretto",
      withoutTender: true,
      cig: null,
      cup: "H11B22000370004",
      supplier: "Studio Alpha",
      amount: 12000,
      awardDate: "2025-01-10",
    });

    expect(record).not.toBeNull();
    expect(record?.source).toBe("Contratti ANAC");
    expect(record?.sourceStatus).toBe("ufficiale");
    expect(record?.signals).toMatchObject({
      hasCig: false,
      hasCup: true,
      hasDirectProcedureSignal: true,
      hasComparativeProcedureSignal: false,
    });
    expect(record?.flags).toContain("CIG non presente nel dato");
    expect(record?.flags).toContain("Possibile affidamento diretto");
  });

  it("costruisce record albo con estrazioni e stato da verificare quando l'operatore manca", () => {
    const record = buildPublicationRecord({
      id: "albo-7",
      oggetto: "Determina per incarico di consulenza",
      brief: "CIG A123456789 CUP H11B22000370004",
      tipologia: "Determina",
      provenienza: "Settore tecnico",
      dataAtto: "2025-02-03",
    });

    expect(record).not.toBeNull();
    expect(record?.source).toBe("Albo Pretorio");
    expect(record?.cig).toBe("A123456789");
    expect(record?.cup).toBe("H11B22000370004");
    expect(record?.sourceStatus).toBe("da verificare");
    expect(record?.flags).toContain("Operatore da verificare nell'atto");
  });

  it("filtra record e aggrega per operatore sul sottoinsieme filtrato", () => {
    const anac = buildContractRecord({
      id: "1",
      title: "Affidamento incarico legale",
      procedureType: "affidamento diretto",
      withoutTender: true,
      supplier: "Studio Alpha",
      amount: 1000,
      cig: null,
      cup: null,
    });
    const albo = buildPublicationRecord({
      id: "2",
      oggetto: "Avviso pubblico per incarico tecnico",
      brief: "Professionista Studio Alpha con CIG B123456789",
      cups: ["H11B22000370004"],
    });
    const nonPertinente = buildContractRecord({
      id: "3",
      title: "Fornitura materiale ordinario",
      supplier: "Impresa Gamma",
      amount: 500,
    });

    expect(nonPertinente).toBeNull();
    const records = [anac, albo].filter((record) => record !== null);

    const directWithoutCig = filterMonitoredRecords(records, {
      ...DEFAULT_INCARICHIMETRO_FILTERS,
      directProcedure: "present",
      cig: "missing",
    });

    expect(directWithoutCig).toHaveLength(1);
    expect(directWithoutCig[0]?.source).toBe("Contratti ANAC");

    const aggregates = buildOperatorAggregates(records);
    expect(aggregates[0]).toMatchObject({
      operator: "Studio Alpha",
      records: 2,
      totalAmount: 1000,
      directCount: 1,
      missingCigCount: 1,
    });
  });
});
