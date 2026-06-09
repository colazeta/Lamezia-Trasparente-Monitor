import { describe, expect, it } from "vitest";
import {
  LOCAL_PUBLIC_SITE_URL,
  normalizePublicSiteOrigin,
  resolvePublicSiteOrigin,
  toAbsolutePublicUrl,
} from "../lib/publicSiteUrl";

describe("public site URL configuration", () => {
  it("normalizes a configured public site URL to a stable origin", () => {
    expect(normalizePublicSiteOrigin("https://example.org/")).toBe(
      "https://example.org",
    );
    expect(normalizePublicSiteOrigin("https://example.org/path?q=1")).toBe(
      "https://example.org",
    );
  });

  it("falls back to the browser origin when no VITE_PUBLIC_SITE_URL is set", () => {
    expect(
      resolvePublicSiteOrigin({
        configuredSiteUrl: undefined,
        browserOrigin: "https://browser.example.test",
      }),
    ).toBe("https://browser.example.test");
  });

  it("uses the documented local fallback outside browser/runtime configuration", () => {
    expect(
      resolvePublicSiteOrigin({
        configuredSiteUrl: undefined,
        browserOrigin: undefined,
      }),
    ).toBe(LOCAL_PUBLIC_SITE_URL);
    expect(normalizePublicSiteOrigin("nota-url-valida")).toBe(
      LOCAL_PUBLIC_SITE_URL,
    );
  });

  it("builds canonical and social URLs from the same configured base", () => {
    const publicOrigin = normalizePublicSiteOrigin("https://civic.example/");

    expect(toAbsolutePublicUrl("/metodologia", publicOrigin)).toBe(
      "https://civic.example/metodologia",
    );
    expect(toAbsolutePublicUrl("opengraph.jpg", publicOrigin)).toBe(
      "https://civic.example/opengraph.jpg",
    );
  });
});
