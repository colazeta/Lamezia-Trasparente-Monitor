import { buildPilotImportPlan } from "./ltcedsPilotImportCore";
import {
  runLtcedsMachineGate,
  loadLtcedsPilotFiles,
  buildLtcedsPilotDryRunReport,
  executeLtcedsPilotPlan,
} from "./ltcedsPilotImport";

// CLI only: never export this entrypoint from the database library.
async function main(): Promise<void> {
  const execute = process.argv.includes("--execute");
  const unknown = process.argv.slice(2).filter((arg) => arg !== "--execute");
  if (unknown.length)
    throw new Error(`Unknown arguments: ${unknown.join(", ")}`);

  runLtcedsMachineGate();
  const files = await loadLtcedsPilotFiles();
  const plan = buildPilotImportPlan({
    files,
    mode: execute ? "execute" : "dry-run",
    databaseState: execute ? "checked" : "unchecked",
  });

  if (!execute) {
    process.stdout.write(
      `${JSON.stringify(buildLtcedsPilotDryRunReport(plan), null, 2)}\n`,
    );
    return;
  }

  const { db, pool } = await import("./client");
  try {
    const report = await executeLtcedsPilotPlan(plan, db);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })}\n`,
  );
  process.exitCode = 1;
});
