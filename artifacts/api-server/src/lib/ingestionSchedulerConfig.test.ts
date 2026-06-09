import { describe, expect, it } from "vitest";
import { resolveIngestionSchedulerConfig } from "./ingestionSchedulerConfig";

describe("resolveIngestionSchedulerConfig", () => {
  it("keeps the embedded scheduler disabled by default", () => {
    expect(resolveIngestionSchedulerConfig({})).toEqual({
      enabled: false,
      mode: "disabled",
    });
  });

  it.each(["disabled", "off", "false", "0", ""])(
    "treats %s as an explicit disabled mode",
    (value) => {
      expect(
        resolveIngestionSchedulerConfig({ INGESTION_SCHEDULER_MODE: value }),
      ).toEqual({ enabled: false, mode: "disabled" });
    },
  );

  it.each([
    ["local", "local"],
    ["development", "development"],
    ["dev", "development"],
    ["legacy", "legacy"],
  ] as const)("enables the scheduler for %s mode", (value, mode) => {
    expect(
      resolveIngestionSchedulerConfig({ INGESTION_SCHEDULER_MODE: value }),
    ).toEqual({ enabled: true, mode });
  });

  it("falls back to disabled for unknown modes", () => {
    expect(
      resolveIngestionSchedulerConfig({ INGESTION_SCHEDULER_MODE: "prod" }),
    ).toEqual({ enabled: false, mode: "disabled" });
  });
});
