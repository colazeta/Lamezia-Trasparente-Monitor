import { readFile } from "node:fs/promises";
import path from "node:path";

import { validateAnacBdncpSyncSnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import { buildCardinalReadinessReport } from "./cardinalReadiness";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const defaultSnapshotPath = path.join(
  repoRoot,
  "data/public/contracts/anac-bdncp/latest.json",
);

const snapshotPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : defaultSnapshotPath;

const snapshot = validateAnacBdncpSyncSnapshot(
  JSON.parse(await readFile(snapshotPath, "utf8")) as unknown,
);
const report = buildCardinalReadinessReport(snapshot);

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
