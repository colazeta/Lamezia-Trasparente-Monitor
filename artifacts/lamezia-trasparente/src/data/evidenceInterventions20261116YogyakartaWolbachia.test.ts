import { describe, expect, it } from "vitest";
import {
  EVIDENCE_THEMATIC_AREAS,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_IMPLEMENTABILITY,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_16_YOGYAKARTA_WOLBACHIA } from "./evidenceInterventions20261116YogyakartaWolbachia";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("Yogyakarta AWED Wolbachia dengue cluster RCT — 2026-11-16", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_16_YOGYAKARTA_WOLBACHIA[0];

  it("maintains canonical 34-field schema, controlled taxonomies and unique stable ID", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_16_YOGYAKARTA_WOLBACHIA).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
  });

  it("preserves the original trial comparator and denominators, avoiding population-wide extrapolation", () => {
    expect(record.primaryArea).toBe("salute_pubblica_locale");
    expect(record.evaluationMethod).toContain("12 cluster");
    expect(record.comparator).toContain("usual care");
    expect(record.effectSize).toContain("77,1%");
    expect(record.effectSize).toContain("86,2%");
    expect(record.effectSize).toContain("67/2.905");
    expect(record.results).toContain("test-negative");
    expect(record.evidenceStrength).toBe("forte");
  });

  it("keeps vector-species, West Nile and Italian governance caveats explicit", () => {
    expect(record.limitations.join(" ")).toContain("Culex pipiens");
    expect(record.transferabilityItaly).toContain("non è direttamente trasferibile");
    expect(record.lameziaAdaptation).toContain("ASP");
    expect(record.lameziaAdaptation).toContain("non presentare la riduzione del 77%");
    expect(record.unintendedEffects).toContain("contaminazione");
    expect(record.implementability).toBe("strutturale");
  });

  it("preserves original direct-source verification, non-trial cost status and revision history", () => {
    expect(record.primarySource.url).toContain("worldmosquitoprogram.org");
    expect(record.evaluationStudies.some(s => s.doi === "10.1056/NEJMoa2030243")).toBe(true);
    expect(record.evaluationStudies.some(s => s.url.includes("ecdc.europa.eu"))).toBe(true);
    expect(record.costsRequirements).toContain("non costo osservato");
    expect(record.lastVerifiedAt).toBe("2026-11-16");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });
});
