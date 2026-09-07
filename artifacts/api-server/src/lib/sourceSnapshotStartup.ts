import {
  publicSnapshotImportReport,
  snapshotImportError,
  type SnapshotImportReport,
} from "@workspace/db/source-snapshots";

type StartupState = {
  status: "disabled" | "waiting_for_schema" | "running" | "verified" | "failed";
  verificationBasis: "process_startup";
  report?: ReturnType<typeof publicSnapshotImportReport>;
  error?: string;
};

/** A read of this checkpoint never starts an import or acquires a connection. */
export function createSnapshotStartupController(
  configured: string | undefined,
  execute: () => Promise<SnapshotImportReport>,
) {
  let state: StartupState = {
    status: configured === "true" ? "waiting_for_schema" : "disabled",
    verificationBasis: "process_startup",
  };
  if (configured && !["true", "false"].includes(configured)) {
    state = {
      ...state,
      status: "failed",
      error: "INVALID_SNAPSHOT_STARTUP_CONFIG",
    };
  }
  return {
    getState: () => state,
    async start(schemaReady: boolean) {
      // Idempotent at process level, including concurrent readiness callers.
      if (state.status !== "waiting_for_schema") return state;
      if (!schemaReady) {
        state = {
          ...state,
          status: "failed",
          error: "DATABASE_SCHEMA_NOT_READY",
        };
        return state;
      }
      state = { ...state, status: "running" };
      try {
        const report = await execute();
        state = {
          verificationBasis: "process_startup",
          status: report.status === "verified" ? "verified" : "failed",
          report: publicSnapshotImportReport(report),
        };
      } catch (error) {
        state = {
          verificationBasis: "process_startup",
          status: "failed",
          error: snapshotImportError(error),
        };
      }
      return state;
    },
  };
}
