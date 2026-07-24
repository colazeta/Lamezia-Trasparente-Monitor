import { describe, expect, it } from "vitest";

import { isProtectedAppPath } from "@/lib/authRouteMode";

describe("isProtectedAppPath", () => {
  it.each([
    "/redazione",
    "/redazione/temi",
    "/admin",
    "/admin/pareri",
    "/sign-in",
    "/sign-in/factor-one",
    "/sign-up",
    "/sign-up/verify-email-address",
  ])("loads the protected bootstrap for %s", (path) => {
    expect(isProtectedAppPath(path)).toBe(true);
  });

  it.each([
    "/",
    "/opendata",
    "/amministratori/32",
    "/redazione-civica",
    "/sign-informazioni",
  ])("keeps %s on the public bootstrap", (path) => {
    expect(isProtectedAppPath(path)).toBe(false);
  });

  it("ignores query strings and fragments when classifying routes", () => {
    expect(isProtectedAppPath("/redazione?tab=temi#editor")).toBe(true);
    expect(isProtectedAppPath("/opendata?dataset=sign-in")).toBe(false);
  });
});
