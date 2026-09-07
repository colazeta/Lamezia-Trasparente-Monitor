import { describe, expect, it, vi } from "vitest";
import type { SnapshotImportReport } from "@workspace/db/source-snapshots";
import { createSnapshotStartupController } from "./sourceSnapshotStartup";

const report = (status: "verified" | "failed"): SnapshotImportReport => ({
  schemaVersion: "lt-source-import-report.v1",
  importerVersion: "test",
  repositoryCommit: "a".repeat(40),
  mode: "execute",
  generatedAt: "2026-09-07T12:00:00Z",
  completedAt: "2026-09-07T12:01:00Z",
  sources: [],
  results: [],
  pnrrExpected: 0,
  status,
});

describe("startup reconciliation boundary", () => {
  it("requires an explicit flag and successful schema verification before acquiring any database connection", async () => {
    for (const flag of [undefined, "false", "yes", " TRUE "]) {
      const execute = vi.fn(async () => report("verified"));
      const controller = createSnapshotStartupController(flag, execute);
      controller.getState();
      await controller.start(true);
      expect(execute).not.toHaveBeenCalled();
    }
    const execute = vi.fn(async () => report("verified"));
    const controller = createSnapshotStartupController("true", execute);
    expect(controller.getState().status).toBe("waiting_for_schema");
    expect(execute).not.toHaveBeenCalled();
    expect((await controller.start(false)).error).toBe(
      "DATABASE_SCHEMA_NOT_READY",
    );
    expect(execute).not.toHaveBeenCalled();
  });
  it("runs once per process even when startup is called concurrently; reads never retrigger writes", async () => {
    let complete!: (value: SnapshotImportReport) => void;
    const execute = vi.fn(
      () =>
        new Promise<SnapshotImportReport>((resolve) => {
          complete = resolve;
        }),
    );
    const controller = createSnapshotStartupController("true", execute);
    const first = controller.start(true);
    expect((await controller.start(true)).status).toBe("running");
    expect(controller.getState().status).toBe("running");
    complete(report("verified"));
    expect((await first).status).toBe("verified");
    await controller.start(true);
    expect(execute).toHaveBeenCalledTimes(1);
  });
  it("keeps partial failure unavailable and sanitises rejected connection errors", async () => {
    const partial = createSnapshotStartupController("true", async () =>
      report("failed"),
    );
    expect((await partial.start(true)).status).toBe("failed");
    const broken = createSnapshotStartupController("true", async () => {
      throw new Error("postgresql://private-credentials");
    });
    const state = await broken.start(true);
    expect(state.status).toBe("failed");
    expect(JSON.stringify(state)).not.toContain("private-credentials");
  });
});
