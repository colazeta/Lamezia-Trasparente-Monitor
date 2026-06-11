import { describe, expect, it } from "vitest";

import {
  buildAlboDigestEntry,
  classifyAlboActType,
  classifyAlboCivicCategory,
  extractAlboIdentifierEvidence,
  type AlboPublication,
} from "./alboDigest";

const basePublication: AlboPublication = {
  id: "albo-2026-001",
  sourceUrl: "https://albo.example.test/pubblicazione/1",
  sourceLabel: "Pubblicazione Albo Pretorio",
  publishedAt: "2026-06-10",
  actType: null,
  sourceOffice: "Settore Affari Generali",
  subject: "Avviso pubblico",
};

describe("Albo digest classification", () => {
  it("classifies determine with contract identifiers as procurement-related digest entries", () => {
    const publication: AlboPublication = {
      ...basePublication,
      id: "det-001",
      actType: "Determinazione dirigenziale",
      subject:
        "Determina di affidamento servizio manutenzione - CIG X123456789",
    };

    const entry = buildAlboDigestEntry(publication);

    expect(classifyAlboActType(publication)).toBe("determinazione");
    expect(entry.civicCategory).toBe("contratti_affidamenti");
    expect(entry.identifierEvidence).toEqual([
      {
        type: "cig",
        value: "X123456789",
        original: "X123456789",
        status: "partial",
        note: "Riferimento rilevato con controllo locale di formato; richiede verifica sulla fonte o su registri ufficiali pertinenti.",
      },
    ]);
    expect(entry.source).toEqual({
      url: "https://albo.example.test/pubblicazione/1",
      label: "Pubblicazione Albo Pretorio",
    });
  });

  it("classifies delibere without inferring further completeness", () => {
    const publication: AlboPublication = {
      ...basePublication,
      actType: "Deliberazione di Giunta Comunale",
      subject: "Delibera di approvazione schema di convenzione",
    };

    expect(classifyAlboActType(publication)).toBe("deliberazione");
    expect(classifyAlboCivicCategory(publication)).toBe("delibere");
    expect(buildAlboDigestEntry(publication)).toMatchObject({
      status: "verified",
      sourceOffice: {
        name: "Settore Affari Generali",
        normalizedName: "settore affari generali",
      },
    });
  });

  it("prioritizes explicit PNRR wording and extracts CUP evidence when present", () => {
    const publication: AlboPublication = {
      ...basePublication,
      subject:
        "PNRR - lavori di riqualificazione edificio pubblico CUP H12B123456789AB",
      text: "Piano Nazionale di Ripresa e Resilienza, intervento finanziato secondo la fonte dell'atto.",
    };

    expect(classifyAlboCivicCategory(publication)).toBe("pnrr");
    expect(extractAlboIdentifierEvidence(publication)).toEqual([
      {
        type: "cup",
        value: "H12B123456789AB",
        original: "H12B123456789AB",
        status: "partial",
        note: "Riferimento rilevato con controllo locale di formato; richiede verifica sulla fonte o su registri ufficiali pertinenti.",
      },
    ]);
  });

  it("classifies convocazioni for council or commission meetings", () => {
    const publication: AlboPublication = {
      ...basePublication,
      actType: "Convocazione",
      subject: "Convocazione del Consiglio Comunale in seduta ordinaria",
    };

    expect(buildAlboDigestEntry(publication)).toMatchObject({
      actType: "convocazione",
      civicCategory: "convocazioni_commissioni_consiglio",
    });
  });

  it("classifies ordinanze deterministically", () => {
    const publication: AlboPublication = {
      ...basePublication,
      actType: "Ordinanza",
      subject: "Ordinanza temporanea di viabilità per lavori stradali",
    };

    expect(buildAlboDigestEntry(publication)).toMatchObject({
      actType: "ordinanza",
      civicCategory: "ordinanze",
    });
  });

  it("keeps uncategorized publications neutral and marks them as not found in monitored category rules", () => {
    const publication: AlboPublication = {
      ...basePublication,
      actType: "Pubblicazione",
      subject: "Comunicazione amministrativa generica",
    };

    expect(buildAlboDigestEntry(publication)).toMatchObject({
      actType: "altro",
      civicCategory: "altro_non_classificato",
      status: "not_found_in_monitored_sources",
      identifierEvidence: [],
    });
  });
});
