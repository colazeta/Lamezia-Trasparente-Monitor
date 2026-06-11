import { describe, expect, it } from "vitest";

import {
  CIVIC_OFFICES,
  findDuplicateCivicOfficeAliases,
  normalizeCivicOffice,
  normalizeCivicOfficeText,
} from "@/lib/civicOffices";

describe("normalizeCivicOfficeText", () => {
  it("normalizes accents, punctuation and repeated spaces", () => {
    expect(
      normalizeCivicOfficeText("  Urbanística / Edilizia--Privata  "),
    ).toBe("urbanistica edilizia privata");
  });
});

describe("normalizeCivicOffice", () => {
  it("matches known aliases without requiring exact casing or accents", () => {
    const result = normalizeCivicOffice(
      "Richiesta indirizzata all'UFFICIO BILANCIO per verifica documentale",
    );

    expect(result.status).toBe("known");
    if (result.status === "known") {
      expect(result.office.id).toBe("servizi-finanziari-ragioneria");
      expect(result.matchedAlias).toBe("ufficio bilancio");
    }
  });

  it("matches service-oriented aliases from existing aggregate labels", () => {
    const result = normalizeCivicOffice(
      "Nota su sportello edilizia e istruttoria pratica",
    );

    expect(result.status).toBe("known");
    if (result.status === "known") {
      expect(result.office.id).toBe("urbanistica-edilizia-privata");
    }
  });

  it("uses an explicit fallback for unrecognized free text", () => {
    const result = normalizeCivicOffice(
      "Richiesta generica senza ufficio chiaro",
    );

    expect(result).toMatchObject({
      status: "unknown",
      office: null,
      fallbackLabel: "Da verificare",
      reason: "no_strong_match",
    });
  });

  it("does not force weak or ambiguous matches", () => {
    const result = normalizeCivicOffice(
      "Testo con servizi finanziari e servizi sociali citati insieme",
    );

    expect(result).toMatchObject({
      status: "unknown",
      reason: "ambiguous_match",
    });
  });
});

describe("CIVIC_OFFICES", () => {
  it("keeps normalized aliases minimally deduplicated", () => {
    expect(findDuplicateCivicOfficeAliases()).toEqual([]);
  });

  it("keeps every record aggregated and explicitly free of personal data", () => {
    expect(CIVIC_OFFICES.length).toBeGreaterThan(0);
    for (const office of CIVIC_OFFICES) {
      expect(office.avoidsPersonalData).toBe(true);
      expect(`${office.label} ${office.aliases.join(" ")}`).not.toMatch(
        /\b(?:dott|dott\.|dr|dr\.|ing|ing\.|avv|avv\.|sig|sig\.|sig\.ra)\b/i,
      );
    }
  });
});
