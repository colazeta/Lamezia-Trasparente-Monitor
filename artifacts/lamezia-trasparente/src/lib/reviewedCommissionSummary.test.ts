import { describe, expect, it } from "vitest";

import { councilSessionV0ReviewedRecords } from "@/data/councilSessionV0Reviewed";
import { summarizeReviewedCommissions } from "@/lib/reviewedCommissionSummary";

describe("summarizeReviewedCommissions", () => {
  it("derives the public tranche counts from the reviewed records", () => {
    expect(summarizeReviewedCommissions(councilSessionV0ReviewedRecords)).toBe(
      "34 sedute di Commissione trascritte dagli allegati ufficiali: 2 della I, 4 della II, 5 della III, 13 della IV, 6 della V, 3 della VI e 1 congiunta III–IV",
    );
  });

  it("accepts future official Commission numbers and keeps unknown titles visible", () => {
    expect(
      summarizeReviewedCommissions([
        {
          kind: "commission",
          title: { value: "V Commissione consiliare permanente — seduta" },
        },
        {
          kind: "commission",
          title: { value: "Commissione speciale — seduta di prova" },
        },
      ]),
    ).toBe(
      "2 sedute di Commissione trascritte dagli allegati ufficiali: 1 della V e 1 di altro organo",
    );
  });
});
