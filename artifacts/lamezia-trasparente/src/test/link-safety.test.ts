import { describe, expect, it } from "vitest";

import { classifyLinkSafety } from "@/lib/linkSafety";

const siteOrigin = "https://trasparente.lamezia.test";

describe("classifyLinkSafety", () => {
  it("normalizes empty input without producing navigable metadata", () => {
    expect(classifyLinkSafety(undefined)).toMatchObject({
      kind: "empty",
      href: "",
      normalizedHref: null,
      isExternal: false,
      shouldOpenInNewTab: false,
      rel: null,
      reason: "empty-input",
    });

    expect(classifyLinkSafety("   ").kind).toBe("empty");
  });

  it("classifies hash anchors as local anchors", () => {
    expect(classifyLinkSafety("#contenuto", siteOrigin)).toEqual({
      kind: "anchor",
      href: "#contenuto",
      normalizedHref: "#contenuto",
      protocol: null,
      origin: null,
      isExternal: false,
      shouldOpenInNewTab: false,
      rel: null,
      reason: null,
    });
  });

  it("classifies relative links without requiring browser globals", () => {
    expect(classifyLinkSafety("/albo?anno=2026", siteOrigin)).toMatchObject({
      kind: "relative",
      normalizedHref: "/albo?anno=2026",
      isExternal: false,
    });

    expect(classifyLinkSafety("../fonti-dati", siteOrigin).kind).toBe(
      "relative",
    );
  });

  it("classifies same-origin HTTP(S) URLs as internal", () => {
    expect(
      classifyLinkSafety(
        "https://trasparente.lamezia.test/metodologia#fonti",
        `${siteOrigin}/percorso`,
      ),
    ).toMatchObject({
      kind: "internal",
      normalizedHref: "https://trasparente.lamezia.test/metodologia#fonti",
      protocol: "https:",
      origin: siteOrigin,
      isExternal: false,
      shouldOpenInNewTab: false,
      rel: null,
    });
  });

  it("classifies different-origin HTTP(S) URLs as external link metadata", () => {
    expect(
      classifyLinkSafety("https://example.org/dataset.csv", siteOrigin),
    ).toMatchObject({
      kind: "external",
      normalizedHref: "https://example.org/dataset.csv",
      protocol: "https:",
      origin: "https://example.org",
      isExternal: true,
      shouldOpenInNewTab: true,
      rel: "noopener noreferrer",
      reason: null,
    });
  });

  it("treats absolute HTTP(S) URLs as external when no valid origin is provided", () => {
    expect(classifyLinkSafety("http://example.org", null)).toMatchObject({
      kind: "external",
      origin: "http://example.org",
      isExternal: true,
    });

    expect(
      classifyLinkSafety("https://trasparente.lamezia.test", "nota-un-origin"),
    ).toMatchObject({
      kind: "external",
      origin: siteOrigin,
      isExternal: true,
    });
  });

  it("resolves protocol-relative URLs only when a valid HTTP(S) origin is supplied", () => {
    expect(classifyLinkSafety("//example.org/path", siteOrigin)).toMatchObject({
      kind: "external",
      normalizedHref: "https://example.org/path",
      protocol: "https:",
      origin: "https://example.org",
      isExternal: true,
    });

    expect(classifyLinkSafety("//trasparente.lamezia.test/path", siteOrigin)).toMatchObject({
      kind: "internal",
      normalizedHref: "https://trasparente.lamezia.test/path",
      isExternal: false,
    });

    expect(classifyLinkSafety("//example.org/path")).toMatchObject({
      kind: "invalid",
      normalizedHref: null,
      reason: "protocol-relative-url-requires-http-origin",
    });
  });

  it("keeps mailto and tel links separate from external web links", () => {
    expect(classifyLinkSafety("mailto:info@example.org", siteOrigin)).toMatchObject({
      kind: "mailto",
      protocol: "mailto:",
      isExternal: false,
      shouldOpenInNewTab: false,
    });

    expect(classifyLinkSafety("tel:+3900000000", siteOrigin)).toMatchObject({
      kind: "tel",
      protocol: "tel:",
      isExternal: false,
      shouldOpenInNewTab: false,
    });
  });

  it("returns deterministic invalid metadata for unsupported or malformed inputs", () => {
    expect(classifyLinkSafety("javascript:alert(1)", siteOrigin)).toMatchObject({
      kind: "invalid",
      normalizedHref: null,
      protocol: "javascript:",
      isExternal: false,
      reason: "unsupported-protocol",
    });

    expect(classifyLinkSafety("https://", siteOrigin)).toMatchObject({
      kind: "invalid",
      normalizedHref: null,
      protocol: "https:",
      reason: "invalid-url",
    });

    expect(classifyLinkSafety("non è un url", siteOrigin)).toMatchObject({
      kind: "invalid",
      normalizedHref: null,
      reason: "invalid-relative-url",
    });
  });
});
