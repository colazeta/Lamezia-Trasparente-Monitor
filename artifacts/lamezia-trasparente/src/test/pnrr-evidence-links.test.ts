import { describe, expect, it } from "vitest";

import {
  checkPnrrEvidencePublishability,
  classifyPnrrEvidenceSource,
  countPnrrEvidenceLinks,
  getPnrrEvidenceNonPublishableReasons,
  getPnrrEvidenceTechnicalLabel,
  listNonPublishablePnrrEvidenceLinks,
  normalizePnrrEvidenceUrl,
  type PnrrEvidenceLink,
} from "../lib/pnrrEvidenceLinks";

const baseEvidenceLink: PnrrEvidenceLink = {
  id: "evidence-1",
  pnrrProjectId: "pnrr-project-1",
  kind: "scheda_puntuale",
  url: "https://example.test/pnrr/project-1",
  relationStatus: "puntuale",
  evidenceStatus: "verificato",
};

function buildEvidenceLink(
  overrides: Partial<PnrrEvidenceLink> = {},
): PnrrEvidenceLink {
  return {
    ...baseEvidenceLink,
    ...overrides,
  };
}

describe("normalizePnrrEvidenceUrl", () => {
  it("normalizes allowed http, https and demo URLs without fetching them", () => {
    expect(normalizePnrrEvidenceUrl(" http://example.test/path ")).toEqual({
      originalUrl: " http://example.test/path ",
      normalizedUrl: "http://example.test/path",
      protocol: "http:",
      isAllowed: true,
      reason: null,
    });
    expect(normalizePnrrEvidenceUrl("https://example.test/path?q=1")).toEqual({
      originalUrl: "https://example.test/path?q=1",
      normalizedUrl: "https://example.test/path?q=1",
      protocol: "https:",
      isAllowed: true,
      reason: null,
    });
    expect(normalizePnrrEvidenceUrl("demo://pnrr/project-1")).toEqual({
      originalUrl: "demo://pnrr/project-1",
      normalizedUrl: "demo://pnrr/project-1",
      protocol: "demo:",
      isAllowed: true,
      reason: null,
    });
  });

  it("blocks operational or unsafe protocols", () => {
    expect(normalizePnrrEvidenceUrl("mailto:info@example.test")).toMatchObject({
      normalizedUrl: null,
      protocol: "mailto:",
      isAllowed: false,
      reason: "unsupported_protocol",
    });
    expect(normalizePnrrEvidenceUrl("javascript:alert(1)")).toMatchObject({
      normalizedUrl: null,
      protocol: "javascript:",
      isAllowed: false,
      reason: "unsupported_protocol",
    });
    expect(normalizePnrrEvidenceUrl("file:///tmp/evidence.pdf")).toMatchObject({
      normalizedUrl: null,
      protocol: "file:",
      isAllowed: false,
      reason: "unsupported_protocol",
    });
  });

  it("reports missing and malformed URLs with neutral technical reasons", () => {
    expect(normalizePnrrEvidenceUrl(undefined)).toEqual({
      originalUrl: undefined,
      normalizedUrl: null,
      protocol: null,
      isAllowed: false,
      reason: "missing",
    });
    expect(normalizePnrrEvidenceUrl("   ")).toEqual({
      originalUrl: "   ",
      normalizedUrl: null,
      protocol: null,
      isAllowed: false,
      reason: "missing",
    });
    expect(normalizePnrrEvidenceUrl("not an absolute URL")).toEqual({
      originalUrl: "not an absolute URL",
      normalizedUrl: null,
      protocol: null,
      isAllowed: false,
      reason: "malformed",
    });
  });
});

describe("classifyPnrrEvidenceSource", () => {
  it("distinguishes punctual, general, linked and unavailable evidence cautiously", () => {
    expect(classifyPnrrEvidenceSource(buildEvidenceLink())).toBe(
      "fonte_puntuale",
    );
    expect(
      classifyPnrrEvidenceSource(
        buildEvidenceLink({ kind: "fonte_generale", relationStatus: "generale" }),
      ),
    ).toBe("fonte_generale");
    expect(
      classifyPnrrEvidenceSource(
        buildEvidenceLink({
          kind: "contratto_collegato",
          relationStatus: "collegato",
        }),
      ),
    ).toBe("fonte_collegata");
    expect(
      classifyPnrrEvidenceSource(
        buildEvidenceLink({
          kind: "localizzazione_non_disponibile",
          relationStatus: "non_disponibile",
          evidenceStatus: "non_disponibile",
        }),
      ),
    ).toBe("fonte_non_disponibile");
  });

  it("keeps unverified evidence in a verification-required class", () => {
    expect(
      classifyPnrrEvidenceSource(
        buildEvidenceLink({
          kind: "da_verificare",
          relationStatus: "da_verificare",
          evidenceStatus: "da_verificare",
        }),
      ),
    ).toBe("da_verificare");
  });
});

describe("countPnrrEvidenceLinks", () => {
  it("counts links by kind and status deterministically without mutating input", () => {
    const links = Object.freeze([
      Object.freeze(buildEvidenceLink()),
      Object.freeze(
        buildEvidenceLink({
          id: "evidence-2",
          kind: "fonte_generale",
          relationStatus: "generale",
          evidenceStatus: "da_verificare",
        }),
      ),
      Object.freeze(
        buildEvidenceLink({
          id: "evidence-3",
          kind: "atto_albo_collegato",
          relationStatus: "collegato",
          evidenceStatus: "verificato",
        }),
      ),
    ] satisfies readonly Readonly<PnrrEvidenceLink>[]);

    const firstCounts = countPnrrEvidenceLinks(links);
    const secondCounts = countPnrrEvidenceLinks(links);

    expect(firstCounts).toEqual(secondCounts);
    expect(firstCounts.total).toBe(3);
    expect(firstCounts.byKind).toMatchObject({
      scheda_puntuale: 1,
      fonte_generale: 1,
      atto_albo_collegato: 1,
      da_verificare: 0,
    });
    expect(firstCounts.byRelationStatus).toMatchObject({
      puntuale: 1,
      generale: 1,
      collegato: 1,
      da_verificare: 0,
    });
    expect(firstCounts.byEvidenceStatus).toMatchObject({
      verificato: 2,
      da_verificare: 1,
      non_disponibile: 0,
    });
    expect(links[0]).toEqual(baseEvidenceLink);
  });
});

describe("technical labels", () => {
  it("returns neutral labels without accusatory wording", () => {
    const label = getPnrrEvidenceTechnicalLabel(
      buildEvidenceLink({
        kind: "fonte_generale",
        relationStatus: "generale",
        evidenceStatus: "da_verificare",
      }),
    );

    expect(label).toBe("Fonte generale non puntuale — Fonte generale non puntuale");
    expect(label.toLowerCase()).not.toMatch(
      /corruzione|illecito|mafia|favoritismo|colpevole|anomalia/,
    );
  });
});

describe("publishability checks", () => {
  it("detects evidence links that should not be published as direct evidence", () => {
    expect(
      getPnrrEvidenceNonPublishableReasons(
        buildEvidenceLink({ id: " ", url: "javascript:alert(1)" }),
      ),
    ).toEqual(["id_mancante", "protocollo_non_ammesso"]);

    expect(
      checkPnrrEvidencePublishability(
        buildEvidenceLink({ evidenceStatus: "da_verificare" }),
      ),
    ).toEqual({
      linkId: "evidence-1",
      isPublishable: false,
      reasons: ["evidenza_da_verificare"],
    });

    expect(
      checkPnrrEvidencePublishability(buildEvidenceLink({ url: undefined })),
    ).toEqual({
      linkId: "evidence-1",
      isPublishable: false,
      reasons: ["url_non_indicato"],
    });
  });

  it("lists only non-publishable checks while preserving link identifiers", () => {
    const checks = listNonPublishablePnrrEvidenceLinks([
      buildEvidenceLink({ id: "ok", url: "demo://pnrr/project-1" }),
      buildEvidenceLink({ id: "needs-check", evidenceStatus: "da_verificare" }),
      buildEvidenceLink({ id: "bad-protocol", url: "file:///tmp/source.pdf" }),
    ]);

    expect(checks).toEqual([
      {
        linkId: "needs-check",
        isPublishable: false,
        reasons: ["evidenza_da_verificare"],
      },
      {
        linkId: "bad-protocol",
        isPublishable: false,
        reasons: ["protocollo_non_ammesso"],
      },
    ]);
  });
});
