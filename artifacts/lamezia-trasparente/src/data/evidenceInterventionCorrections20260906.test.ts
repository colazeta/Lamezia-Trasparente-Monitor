import { describe, expect, it } from "vitest";

import { findEvidenceIntervention } from "./evidenceInterventionsArchive";

describe("evidence corrections 2026-09-06", () => {
  it("keeps the Los Angeles grading record but downgrades the contested health claim", () => {
    const item = findEvidenceIntervention("los-angeles-restaurant-hygiene-grade-cards");

    expect(item).not.toBeNull();
    expect(item?.evidenceStrength).toBe("moderata");
    expect(item?.results.toLowerCase()).toContain("non viene invece più presentata come stabilita");
    expect(item?.effectSize.toLowerCase()).toContain("non sono mantenute come effect size causale");
    expect(item?.evaluationStudies.some((study) => study.doi === "10.1257/pol.20180230")).toBe(true);
    expect(item?.evaluationStudies.some((study) => study.doi === "10.1257/pol.20180543")).toBe(true);
    expect(item?.limitations.join(" ").toLowerCase()).toContain("outbreak di salmonella");
    expect(item?.revisionHistory.at(-1)?.date).toBe("2026-09-06");
    expect(item?.revisionHistory.at(-1)?.note.toLowerCase()).toContain("rivalutazione aej 2019");
  });
});
