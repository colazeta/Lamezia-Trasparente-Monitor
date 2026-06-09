import { describe, expect, it } from "vitest";
import {
  BENI_CONFISCATI_CATEGORIES,
  BENI_CONFISCATI_CATEGORY_LABELS,
  BENI_CONFISCATI_DEMO_ADMIN_STATUSES,
  BENI_CONFISCATI_DEMO_ADMIN_STATUS_LABELS,
  BENI_CONFISCATI_DEMO_NOTICE,
  beniConfiscatiDemoItems,
  type BeneConfiscatoDemoItem,
} from "@/data/beniConfiscatiDemo";
import {
  areAllBeniConfiscatiDemoOnly,
  countBeniConfiscatiByAdministrativeStatus,
  countBeniConfiscatiByCategory,
  createBeneConfiscatoPreview,
  findMissingBeneConfiscatoFields,
} from "@/lib/beniConfiscatiMetrics";

const forbiddenLexicon = [
  "corruzione",
  "favoritismo",
  "infiltrazione",
  "mafia",
  "mafioso",
  "illecito",
  "colpevole",
  "responsabile di",
  "appartenenza",
  "contiguità",
];

const serialize = (value: unknown) => JSON.stringify(value).toLowerCase();

describe("beniConfiscatiDemoItems", () => {
  it("exports the expected prudent taxonomies", () => {
    expect(BENI_CONFISCATI_CATEGORIES).toEqual([
      "immobile",
      "terreno",
      "attivita_economica",
      "bene_mobile_registrato",
      "altro",
    ]);
    expect(BENI_CONFISCATI_DEMO_ADMIN_STATUSES).toEqual([
      "da_verificare",
      "assegnazione_demo",
      "riuso_civico_demo",
      "informazione_parziale",
      "non_applicabile",
    ]);
    expect(Object.keys(BENI_CONFISCATI_CATEGORY_LABELS)).toEqual([
      ...BENI_CONFISCATI_CATEGORIES,
    ]);
    expect(Object.keys(BENI_CONFISCATI_DEMO_ADMIN_STATUS_LABELS)).toEqual([
      ...BENI_CONFISCATI_DEMO_ADMIN_STATUSES,
    ]);
  });

  it("keeps the dataset explicitly fictional and separated from real sources", () => {
    expect(BENI_CONFISCATI_DEMO_NOTICE.toLowerCase()).toContain("fittizio");
    expect(beniConfiscatiDemoItems.length).toBeGreaterThan(0);
    expect(areAllBeniConfiscatiDemoOnly(beniConfiscatiDemoItems)).toBe(true);

    for (const item of beniConfiscatiDemoItems) {
      expect(item.id.startsWith("demo-bene-")).toBe(true);
      expect(item.demoOnly).toBe(true);
      expect(item.sourceContext.realSourceUsed).toBe(false);
      expect(findMissingBeneConfiscatoFields(item)).toEqual([]);
    }
  });

  it("does not contain direct real-world identifiers in demo records", () => {
    const text = serialize(beniConfiscatiDemoItems);

    expect(text).not.toMatch(/\bvia\b|piazza|corso|viale/);
    expect(text).not.toMatch(/particella|foglio|subalterno/);
    expect(text).not.toMatch(/protocollo|procedimento|determina|ordinanza/);
    expect(text).not.toMatch(/[a-z]{2}\d{6}/);
    expect(text).not.toMatch(/\d{2}\.\d{2,}/);
  });

  it("uses cautious, non-accusatory wording", () => {
    const text = serialize({ BENI_CONFISCATI_DEMO_NOTICE, beniConfiscatiDemoItems });

    for (const term of forbiddenLexicon) {
      expect(text).not.toContain(term);
    }
    expect(text).toContain("verifica");
    expect(text).toContain("fittizio");
  });
});

describe("beni confiscati demo helpers", () => {
  it("counts records by category and administrative status", () => {
    expect(countBeniConfiscatiByCategory(beniConfiscatiDemoItems)).toEqual({
      immobile: 1,
      terreno: 1,
      attivita_economica: 1,
      bene_mobile_registrato: 1,
      altro: 1,
    });
    expect(
      countBeniConfiscatiByAdministrativeStatus(beniConfiscatiDemoItems),
    ).toEqual({
      da_verificare: 1,
      assegnazione_demo: 1,
      riuso_civico_demo: 1,
      informazione_parziale: 1,
      non_applicabile: 1,
    });
  });

  it("reports missing fields and rejects records that are not demo-only", () => {
    const incompleteRecord: Partial<BeneConfiscatoDemoItem> = {
      id: "demo-bene-incompleto",
      title: "Scheda incompleta",
      category: "altro",
      administrativeStatus: "da_verificare",
      genericTerritorialContext: "Contesto generico",
      dataQualityStatus: "campi_parziali",
      knownLimitations: [],
      possibleCivicUses: ["Test"],
      cautionNotes: [],
    };

    expect(findMissingBeneConfiscatoFields(incompleteRecord)).toEqual([
      "sourceContext",
      "knownLimitations",
      "cautionNotes",
      "demoOnly",
    ]);
    expect(areAllBeniConfiscatiDemoOnly([incompleteRecord])).toBe(false);
  });

  it("creates a prudent preview for future cards without runtime integration", () => {
    const preview = createBeneConfiscatoPreview(beniConfiscatiDemoItems[0]);
    const previewText = serialize(preview);

    expect(preview.title).toBe("Spazio civico dimostrativo");
    expect(previewText).toContain("scheda fittizia solo demo");
    expect(previewText).toContain("contesto dimostrativo");
    for (const term of forbiddenLexicon) {
      expect(previewText).not.toContain(term);
    }
  });
});
