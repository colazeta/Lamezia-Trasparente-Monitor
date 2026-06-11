import { describe, expect, it } from "vitest";
import { classifyLinkSafety } from "@/lib/linkSafety";

describe("classifyLinkSafety", () => {
  it("returns deterministic metadata for empty input", () => {
    expect(
      classifyLinkSafety("  ", { origin: "https://example.org/base" }),
    ).toEqual({
      rawHref: "  ",
      href: "",
      kind: "empty",
      isExternal: false,
      isHttp: false,
      isValid: false,
      origin: "https://example.org",
      url: null,
    });
  });

  it("keeps hash anchors separate from relative URLs", () => {
    expect(classifyLinkSafety("#metodo").kind).toBe("anchor");
    expect(classifyLinkSafety("/metodologia#fonti").kind).toBe("relative");
  });

  it("classifies relative URLs without requiring an origin", () => {
    expect(classifyLinkSafety("/fonti-dati")).toMatchObject({
      kind: "relative",
      isExternal: false,
      isHttp: false,
      isValid: true,
      origin: null,
      url: null,
    });
    expect(classifyLinkSafety("../atti?anno=2026").kind).toBe("relative");
    expect(classifyLinkSafety("documenti/albo").kind).toBe("relative");
  });

  it("classifies same-origin HTTP and HTTPS URLs as internal", () => {
    expect(
      classifyLinkSafety("https://trasparente.example.it/albo", {
        origin: "https://trasparente.example.it",
      }),
    ).toMatchObject({
      kind: "internal",
      isExternal: false,
      isHttp: true,
      isValid: true,
      origin: "https://trasparente.example.it",
      url: "https://trasparente.example.it/albo",
    });
  });

  it("classifies external HTTP and HTTPS URLs against the optional origin", () => {
    expect(
      classifyLinkSafety("https://comune.example.it/albo", {
        origin: "https://trasparente.example.it",
      }),
    ).toMatchObject({
      kind: "external",
      isExternal: true,
      isHttp: true,
      isValid: true,
      origin: "https://trasparente.example.it",
      url: "https://comune.example.it/albo",
    });

    expect(classifyLinkSafety("http://comune.example.it/albo").kind).toBe(
      "external",
    );
  });

  it("classifies protocol-relative URLs as HTTP links", () => {
    expect(
      classifyLinkSafety("//trasparente.example.it/albo", {
        origin: "https://trasparente.example.it",
      }),
    ).toMatchObject({
      kind: "internal",
      isExternal: false,
      isHttp: true,
      url: "https://trasparente.example.it/albo",
    });

    expect(classifyLinkSafety("//comune.example.it/albo")).toMatchObject({
      kind: "external",
      isExternal: true,
      isHttp: true,
      url: "https://comune.example.it/albo",
    });
  });

  it("classifies mailto and tel schemes without marking them as external HTTP links", () => {
    expect(classifyLinkSafety("mailto:info@example.it")).toMatchObject({
      kind: "mailto",
      isExternal: false,
      isHttp: false,
      isValid: true,
      url: null,
    });
    expect(classifyLinkSafety("tel:+390000000000")).toMatchObject({
      kind: "tel",
      isExternal: false,
      isHttp: false,
      isValid: true,
      url: null,
    });
  });

  it("returns invalid for malformed or unsupported absolute URLs", () => {
    expect(classifyLinkSafety("https://")).toMatchObject({
      kind: "invalid",
      isExternal: false,
      isHttp: false,
      isValid: false,
      url: null,
    });
    expect(classifyLinkSafety("ftp://example.it/file").kind).toBe("invalid");
    expect(classifyLinkSafety("not a url").kind).toBe("invalid");
  });

  it("ignores unsupported origins while keeping classification deterministic", () => {
    expect(
      classifyLinkSafety("https://trasparente.example.it/albo", {
        origin: "nota-un-origin",
      }),
    ).toMatchObject({
      kind: "external",
      isExternal: true,
      origin: null,
      url: "https://trasparente.example.it/albo",
    });
  });
});
