import { describe, expect, it } from "vitest";

import {
  assessCivicNodeEvidence,
  assessCivicRelationEvidence,
  canShowCivicRelationAsVerified,
  strongestCivicEvidenceSourceType,
  type CivicEvidenceInput,
} from "../lib/civicGraphEvidence";

describe("civic graph evidence assessment", () => {
  it("does not treat a nominal vote without a punctual source as verified", () => {
    const assessment = assessCivicRelationEvidence(
      {
        verificationStatus: "verified",
        sources: [{ type: "missing", label: "Fonte non disponibile" }],
        quality: "missing_document",
      },
      "nominal_vote",
    );

    expect(assessment.canShowAsVerified).toBe(false);
    expect(assessment.effectiveStatus).toBe("missing_source");
    expect(assessment.requiresExplicitStatus).toBe(true);
    expect(assessment.reasonCodes).toEqual(
      expect.arrayContaining([
        "missing_source",
        "primary_source_required",
        "punctual_source_required",
      ]),
    );
  });

  it("allows an attributed intervention with a punctual primary source to be shown as verified", () => {
    const assessment = assessCivicRelationEvidence(
      {
        verificationStatus: "verified",
        sources: [
          {
            type: "primary",
            id: "synthetic-session-transcript-001",
            label: "Verbale sintetico di seduta",
          },
        ],
        quality: "direct_document",
      },
      "attributed_statement",
    );

    expect(assessment).toMatchObject({
      canShowAsVerified: true,
      effectiveStatus: "verified",
      strongestSourceType: "primary",
      requiresExplicitStatus: false,
    });
    expect(assessment.reasonCodes).toContain("verified_primary_source");
  });

  it("marks a signed proposal with only a secondary source as partial", () => {
    const assessment = assessCivicRelationEvidence(
      {
        verificationStatus: "verified",
        sources: [{ type: "secondary", id: "synthetic-secondary-summary-001" }],
        quality: "partial_document",
      },
      "signed_proposal",
    );

    expect(assessment.canShowAsVerified).toBe(false);
    expect(assessment.effectiveStatus).toBe("partial");
    expect(assessment.strongestSourceType).toBe("secondary");
    expect(assessment.reasonCodes).toEqual(
      expect.arrayContaining([
        "secondary_source_partial",
        "primary_source_required",
      ]),
    );
  });

  it("keeps a node without source visible only with an explicit unverified status", () => {
    const assessment = assessCivicNodeEvidence({
      verificationStatus: "to_verify",
      sources: [{ type: "missing" }],
      quality: "missing_document",
    });

    expect(assessment.canShowAsVerified).toBe(false);
    expect(assessment.requiresExplicitStatus).toBe(true);
    expect(assessment.effectiveStatus).toBe("missing_source");
    expect(assessment.reasonCodes).toEqual(
      expect.arrayContaining([
        "missing_source",
        "explicit_unverified_status_required",
      ]),
    );
  });

  it("distinguishes corrected or superseded relations from current verified relations", () => {
    const corrected = assessCivicRelationEvidence(
      {
        verificationStatus: "corrected",
        correctedById: "synthetic-relation-current",
        sources: [{ type: "primary", id: "synthetic-correction-note" }],
      },
      "standard",
    );
    const current = assessCivicRelationEvidence(
      {
        verificationStatus: "verified",
        sources: [{ type: "primary", id: "synthetic-current-note" }],
      },
      "standard",
    );

    expect(corrected.canShowAsVerified).toBe(false);
    expect(corrected.effectiveStatus).toBe("corrected");
    expect(corrected.reasonCodes).toContain("corrected_or_superseded");
    expect(current.canShowAsVerified).toBe(true);
    expect(current.effectiveStatus).toBe("verified");
  });

  it("records automated parsing as a partial documentary signal unless reliability is high", () => {
    const assessment = assessCivicRelationEvidence(
      {
        verificationStatus: "verified",
        automatedReliability: "medium",
        sources: [{ type: "primary", id: "synthetic-parsed-document" }],
        quality: "automated_parse",
      },
      "attendance",
    );

    expect(assessment.canShowAsVerified).toBe(false);
    expect(assessment.effectiveStatus).toBe("partial");
    expect(assessment.reasonCodes).toContain("automated_parse_partial");
  });

  it("prefers primary sources over secondary and internal sources without mutating input", () => {
    const input: CivicEvidenceInput = Object.freeze({
      verificationStatus: "verified",
      sources: Object.freeze([
        Object.freeze({
          type: "internal" as const,
          id: "synthetic-internal-note",
        }),
        Object.freeze({
          type: "secondary" as const,
          id: "synthetic-secondary-note",
        }),
        Object.freeze({
          type: "primary" as const,
          id: "synthetic-primary-note",
        }),
      ]),
      quality: "corroborated_document",
    });
    const before = structuredClone(input);

    expect(strongestCivicEvidenceSourceType(input.sources)).toBe("primary");
    expect(canShowCivicRelationAsVerified(input, "standard")).toBe(true);
    expect(input).toEqual(before);
  });
});
