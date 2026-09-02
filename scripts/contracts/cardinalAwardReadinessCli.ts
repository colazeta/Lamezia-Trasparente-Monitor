import { readFile } from "node:fs/promises";
import path from "node:path";
import { validateAnacBdncpSyncSnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import type { AnacAwardsSnapshot } from "./anacAwards";
import { buildAwardAwareCardinalReadinessReport } from "./cardinalAwardReadiness";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const procurementPath = path.join(repoRoot, "data/public/contracts/anac-bdncp/latest.json");
const awardsPath = path.join(repoRoot, "data/public/contracts/anac-awards/latest.json");

const procurement = validateAnacBdncpSyncSnapshot(
  JSON.parse(await readFile(procurementPath, "utf8")) as unknown,
);
const awards = JSON.parse(await readFile(awardsPath, "utf8")) as AnacAwardsSnapshot;
const report = buildAwardAwareCardinalReadinessReport(procurement, awards);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
