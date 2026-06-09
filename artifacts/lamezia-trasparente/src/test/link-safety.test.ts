import { describe, expect, it } from "vitest";

import { classifyLinkSafety } from "../lib/linkSafety";

const origin = "https://www.comune.lamezia-terme.cz.it";

describe("classifyLinkSafety", () => {
  it("classifies empty or whitespace-only inputs deterministically", () => {
    expect(classifyLinkSafety("")).toEqual({
      kind: "empty",
      input: "",
      href: null,
      isExternal: false,
      isInternal: false,
      shouldOpenInNewTab: false,
      rel: null,
    });

    expect(classifyLinkSafety("   \n\t  ").kind).toBe("empty");
  });

  it("classifies hash anchors as internal same-page links", () => {
    expect(classifyLinkSafety(" #metodo ")).toEqual({
      kind: "anchor",
      input: "#metodo",
      href: "#metodo",
      isExternal: false,
      isInternal: true,
      shouldOpenInNewTab: false,
      rel: null,
    });
  });

  it("classifies relative links without consulting browser globals", () => {
    expect(classifyLinkSafety("/albo-pretorio?pagina=2")).toMatchObject({
      kind: "relative",
      href: "/albo-pretorio?pagina=2",
      isExternal: false,
      isInternal: true,
    });

    expect(classifyLinkSafety("../documenti/delibera.pdf")).toMatchObject({
      kind: "relative",
      href: "../documenti/delibera.pdf",
      isExternal: false,
      isInternal: true,
    });
  });

  it("classifies same-origin HTTP and HTTPS URLs as internal", () => {
    expect(classifyLinkSafety("https://www.comune.lamezia-terme.cz.it/amministrazione", origin)).toMatchObject({
      kind: "internal",
      href: "https://www.comune.lamezia-terme.cz.it/amministrazione",
      isExternal: false,
      isInternal: true,
      shouldOpenInNewTab: false,
      rel: null,
    });

    expect(
      classifyLinkSafety(
        "https://www.comune.lamezia-terme.cz.it/path",
        "https://www.comune.lamezia-terme.cz.it/ignored/path?x=1",
      ).kind,
    ).toBe("internal");
  });

  it("requires protocol, host and port to match before classifying absolute URLs as internal", () => {
    expect(classifyLinkSafety("http://www.comune.lamezia-terme.cz.it/amministrazione", origin)).toMatchObject({
      kind: "external",
      isExternal: true,
      shouldOpenInNewTab: true,
      rel: "noopener noreferrer",
    });

    expect(classifyLinkSafety("https://www.comune.lamezia-terme.cz.it:8443/amministrazione", origin).kind).toBe(
      "external",
    );
  });

  it("classifies other HTTP and HTTPS URLs as external", () => {
    expect(classifyLinkSafety("https://example.org/documento", origin)).toEqual({
      kind: "external",
      input: "https://example.org/documento",
      href: "https://example.org/documento",
      isExternal: true,
      isInternal: false,
      shouldOpenInNewTab: true,
      rel: "noopener noreferrer",
    });

    expect(classifyLinkSafety("https://www.comune.lamezia-terme.cz.it/senza-origin")).toMatchObject({
      kind: "external",
      isExternal: true,
    });
  });

  it("classifies protocol-relative URLs using the supplied origin protocol", () => {
    expect(classifyLinkSafety("//www.comune.lamezia-terme.cz.it/albo", origin)).toMatchObject({
      kind: "internal",
      href: "https://www.comune.lamezia-terme.cz.it/albo",
      isExternal: false,
    });

    expect(classifyLinkSafety("//example.org/albo", origin)).toMatchObject({
      kind: "external",
      href: "https://example.org/albo",
      isExternal: true,
      rel: "noopener noreferrer",
    });
  });

  it("classifies mailto and tel links without marking them as external web pages", () => {
    expect(classifyLinkSafety("mailto:urp@example.org")).toEqual({
      kind: "mailto",
      input: "mailto:urp@example.org",
      href: "mailto:urp@example.org",
      isExternal: false,
      isInternal: false,
      shouldOpenInNewTab: false,
      rel: null,
    });

    expect(classifyLinkSafety("tel:+390968000000")).toMatchObject({
      kind: "tel",
      href: "tel:+390968000000",
      isExternal: false,
      shouldOpenInNewTab: false,
    });
  });

  it("classifies malformed and unsupported URLs as invalid", () => {
    expect(classifyLinkSafety("https://")).toMatchObject({ kind: "invalid", href: null });
    expect(classifyLinkSafety("ftp://example.org/documento.pdf")).toMatchObject({ kind: "invalid", href: null });
    expect(classifyLinkSafety("C:\\documenti\\atto.pdf")).toMatchObject({ kind: "invalid", href: null });
    expect(classifyLinkSafety("/atti pubblici/delibera.pdf")).toMatchObject({ kind: "invalid", href: null });
    expect(classifyLinkSafety("<script>alert(1)</script>")).toMatchObject({ kind: "invalid", href: null });
  });

  it("falls back to external classification when the supplied origin is invalid", () => {
    expect(classifyLinkSafety("https://www.comune.lamezia-terme.cz.it/amministrazione", "notaurl")).toMatchObject({
      kind: "external",
      isExternal: true,
      shouldOpenInNewTab: true,
    });
  });
});
