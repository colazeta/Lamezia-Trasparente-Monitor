import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_15_ALLEGHENY_TRANSIT } from "./evidenceInterventions20261115AlleghenyTransit";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];
describe("Allegheny County Discounted Fares Pilot RCT — 2026-11-15", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_15_ALLEGHENY_TRANSIT[0];
  it("has all 34 fields, exactly one canonical ID and controlled vocabularies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_15_ALLEGHENY_TRANSIT).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
  });
  it("distinguishes the randomized free-fare pilot from permanent half-fare policy", () => {
    expect(record.primaryArea).toBe("mobilita_spazio_pubblico");
    expect(record.evaluationMethod).toContain("Randomized controlled trial");
    expect(record.effectSize).toContain("+43%");
    expect(record.results).toContain("Nessun incremento rilevabile di occupazione");
    expect(record.interventionStatus).toContain("NON è stato generalizzato");
    expect(record.limitations.join(" ")).toContain("GPS");
  });
  it("preserves source traceability and unfavourable/null outcomes", () => {
    expect(record.primarySource.url).toContain("analytics.alleghenycounty.us");
    expect(record.evaluationStudies.some(study => study.url.endsWith("Discounted-Fares-Report_2025_ACDHS.pdf"))).toBe(true);
    expect(record.evaluationStudies.some(study => study.url === "https://discountedfares.alleghenycounty.us/")).toBe(true);
    expect(record.unintendedEffects).toContain("bici");
    expect(record.evidenceStrength).toBe("forte");
    expect(record.lastVerifiedAt).toBe("2026-11-15");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });
});
