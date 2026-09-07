import { pool } from "@workspace/db";
import {
  executeSourceSnapshotImport,
  prepareSourceSnapshotImport,
} from "@workspace/db/source-snapshots";
import { createSnapshotStartupController } from "./sourceSnapshotStartup";

// Render checks out the repository at the process working directory. The runner
// verifies each manifest file against Git HEAD before any database write.
export const sourceSnapshotStartup = createSnapshotStartupController(
  process.env.SOURCE_SNAPSHOT_SYNC_ON_START,
  async () =>
    executeSourceSnapshotImport(
      pool,
      await prepareSourceSnapshotImport(process.cwd()),
    ),
);
