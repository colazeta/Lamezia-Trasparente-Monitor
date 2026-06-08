import { describe, expect, it } from "vitest";

import {
  calculateIndicativeDeadline,
  formatFoiaDate,
  matchesFoiaDeadlineFilter,
  type FoiaRegisterEntry,
} from "./accessoCivicoRegister";

describe("calculateIndicativeDeadline", () => {
  it("keeps FOIA deadlines as date-only values without timezone shifts", () => {
    expect(calculateIndicativeDeadline("2024-03-01", 30)).toBe("2024-03-31");
    expect(calculateIndicativeDeadline("2024-10-26", 30)).toBe("2024-11-25");
  });

  it("returns undefined for invalid date-only values", () => {
    expect(calculateIndicativeDeadline("not-a-date", 30)).toBeUndefined();
    expect(calculateIndicativeDeadline("2024-02-31", 30)).toBeUndefined();
  });
});

describe("formatFoiaDate", () => {
  it("formats valid date-only values", () => {
    expect(formatFoiaDate("2024-03-31")).toBe("31/03/2024");
  });

  it("leaves invalid values visible for verification", () => {
    expect(formatFoiaDate("not-a-date")).toBe("not-a-date");
  });
});

describe("matchesFoiaDeadlineFilter", () => {
  const entry = (estimatedDeadline?: string): FoiaRegisterEntry => ({
    publicFields: {
      requestId: "FOIA-TEST",
      creationDate: "2024-03-01",
      subject: "Test richiesta accesso civico",
      requestType: "generalizzato",
      recipientOffice: "Ufficio competente",
      sourceModule: "atti",
      status: "inviata",
      outcome: "In attesa di riscontro.",
      estimatedDeadline,
    },
  });

  it("classifies upcoming and overdue date-only deadlines", () => {
    expect(matchesFoiaDeadlineFilter(entry("2024-03-31"), "upcoming", "2024-03-20")).toBe(true);
    expect(matchesFoiaDeadlineFilter(entry("2024-03-31"), "overdue", "2024-04-01")).toBe(true);
  });
});
