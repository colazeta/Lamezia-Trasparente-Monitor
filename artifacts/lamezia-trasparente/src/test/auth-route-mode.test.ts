import { describe, expect, it } from "vitest";

import { isProtectedAppPath } from "@/lib/authRouteMode";

describe("isProtectedAppPath", () => {
  it.each([
    "/",
    "/opendata",
    "/amministratori/32",
    "/redazione-civica",
    "/administrator",
    "/sign-informazioni",
  ])("keeps %s on the public application shell", (path) => {
    expect(isProtectedAppPath(path)).toBe(false);
  });

  it.each([
    "/redazione",
    "/redazione/curatore",
    "/admin",
    "/admin/pareri?tab=aperti",
    "/sign-in",
    "/sign-in/factor-one#challenge",
    "/sign-up",
    "/sign-up/verify",
  ])("routes %s through the Clerk boundary", (path) => {
    expect(isProtectedAppPath(path)).toBe(true);
  });
});
