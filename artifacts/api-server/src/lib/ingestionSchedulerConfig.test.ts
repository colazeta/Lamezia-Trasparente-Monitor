import { describe, expect, it } from "vitest";
import { resolveEmbeddedIngestionSchedulerConfig } from "./ingestionSchedulerConfig";

describe("resolveEmbeddedIngestionSchedulerConfig", () => {
  it("keeps the embedded scheduler disabled by default", () => {
    expect(resolveEmbeddedIngestionSchedulerConfig({}).enabled).toBe(false);
  });

  it("enables the embedded scheduler for explicit local mode", () => {
    const config = resolveEmbeddedIngestionSchedulerConfig({
      INGESTION_SCHEDULER_MODE: "local",
    });

    expect(config).toMatchObject({ enabled: true, mode: "local" });
  });

  it("enables the embedded scheduler for explicit legacy mode", () => {
    const config = resolveEmbeddedIngestionSchedulerConfig({
      INGESTION_SCHEDULER_MODE: "legacy",
    });

    expect(config).toMatchObject({ enabled: true, mode: "legacy" });
  });

  it("treats unsupported values as disabled", () => {
    const config = resolveEmbeddedIngestionSchedulerConfig({
      INGESTION_SCHEDULER_MODE: "production",
    });

    expect(config).toMatchObject({ enabled: false, mode: "disabled" });
  });
});
