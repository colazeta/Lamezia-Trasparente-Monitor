import { describe, expect, it } from "vitest";

import {
  BDNCP_APPALTI_URL,
  bdncpUrlForCig,
  buildBdncpSearchBridge,
  buildBdncpSearchUrl,
  preferredBdncpUrl,
} from "./bdncp";

describe("bdncp search bridge", () => {
  it("builds a search URL only from a formally valid CIG", () => {
    expect(bdncpUrlForCig("1234567CE7")).toBe(
      `${BDNCP_APPALTI_URL}?cig=1234567CE7`,
    );
  });

  it("normalizes lowercase CIG input with spaces and simple hyphens", () => {
    expect(bdncpUrlForCig(" 1234-567 ce7 ")).toBe(
      `${BDNCP_APPALTI_URL}?cig=1234567CE7`,
    );
  });

  it("rejects invalid CIG values without producing a direct-record URL", () => {
    expect(bdncpUrlForCig("1234567ABC")).toBeNull();
    expect(buildBdncpSearchBridge("1234567ABC")).toMatchObject({
      kind: "link-search-bridge",
      status: "fallback-search",
      formallyValidCig: false,
      publicClaim: "collegamento parziale",
    });
  });

  it("handles empty CIG input as a missing identifier", () => {
    expect(bdncpUrlForCig(" ")).toBeNull();
    expect(buildBdncpSearchBridge(" ")).toMatchObject({
      status: "missing-cig",
      normalizedCig: null,
      formallyValidCig: false,
    });
  });

  it("returns the BDNCP entry point as fallback search when a CIG cannot be used", () => {
    expect(buildBdncpSearchUrl("not-a-cig")).toBe(BDNCP_APPALTI_URL);
  });

  it("keeps official ANAC URLs but ignores non-official explicit URLs", () => {
    expect(
      preferredBdncpUrl(
        "https://pubblicitalegale.anticorruzione.it/ricerca",
        "1234567CE7",
      ),
    ).toBe("https://pubblicitalegale.anticorruzione.it/ricerca");

    expect(preferredBdncpUrl("https://example.test/scheda", "1234567CE7")).toBe(
      `${BDNCP_APPALTI_URL}?cig=1234567CE7`,
    );
  });
});
