import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_16_BALTIMORE_SMOKE_ALARMS } from "./evidenceInterventions20261116BaltimoreSmokeAlarms";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("Baltimore fire-department home-visit RCT — 2026-11-16", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_16_BALTIMORE_SMOKE_ALARMS[0];

  it("has complete canonical schema, controlled vocabularies, and no duplicate in archive", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_16_BALTIMORE_SMOKE_ALARMS).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
  });

  it("uses active standard home visits as comparator and preserves the small-cluster caveat", () => {
    expect(record.primaryArea).toBe("salute_pubblica_locale");
    expect(record.evaluationMethod).toContain("Cluster randomized trial");
    expect(record.evaluationMethod).toContain("sei census tracts");
    expect(record.comparator).toContain("programma");
    expect(record.effectSize).toContain("75% vs 62%");
    expect(record.effectSize).toContain("84% vs 78%");
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.limitations.join(" ")).toContain("12 tratti");
  });

  it("distinguishes short-term positive implementation results, null follow-up, and modelled mortality", () => {
    expect(record.results).toContain("nessuna");
    expect(record.results).toContain("6 mesi");
    expect(record.costsRequirements).toContain("284.501 USD");
    expect(record.costsRequirements).toContain("NON costi");
    expect(record.evaluationStudies.some(s => s.doi === "10.1097/BCR.0b013e3182685b3a")).toBe(true);
    expect(record.evaluationStudies.some(s => s.doi === "10.1136/injuryprev-2013-040885")).toBe(true);
    expect(record.primarySource.url).toBe("https://www.baltimorecity.gov/fire/request-a-smoke-alarm");
    expect(record.lastVerifiedAt).toBe("2026-11-16");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });
});
