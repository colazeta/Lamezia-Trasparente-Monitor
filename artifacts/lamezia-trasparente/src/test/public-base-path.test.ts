import { describe, expect, it } from "vitest";

import { withPublicBasePath } from "@/lib/publicBasePath";

describe("withPublicBasePath", () => {
  it("keeps root deployments unchanged", () => {
    expect(withPublicBasePath("/opendata?dataset=famiglie", "/")).toBe(
      "/opendata?dataset=famiglie",
    );
  });

  it("preserves a configured deployment base path", () => {
    expect(withPublicBasePath("/opendata?dataset=famiglie", "/preview/")).toBe(
      "/preview/opendata?dataset=famiglie",
    );
  });
});
