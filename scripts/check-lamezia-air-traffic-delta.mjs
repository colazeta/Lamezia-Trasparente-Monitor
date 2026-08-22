import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const GENERATED_DIR = path.join(
  REPO_ROOT,
  "artifacts/lamezia-trasparente/src/data/generated",
);

async function main() {
  const [base, delta, metadata] = await Promise.all([
    readJson("lameziaAirTrafficMonthly.json"),
    readJson("lameziaAirTrafficMonthly.delta.json"),
    readJson("lameziaAirTrafficMonthly.metadata.json"),
  ]);

  const baseRows = parseRows(base.monthly_rows);
  const deltaRows = parseRows(delta.monthly_rows);
  const baseLatest = base.metadata?.latest_complete_month;

  if (!baseLatest || delta.base_latest_month !== baseLatest) {
    throw new Error(
      `Airport delta base mismatch: snapshot=${baseLatest ?? "missing"}, delta=${delta.base_latest_month ?? "missing"}.`,
    );
  }

  const baseMonths = baseRows.map(firstColumn);
  const deltaMonths = deltaRows.map(firstColumn);
  const allMonths = [...baseMonths, ...deltaMonths];

  if (new Set(allMonths).size !== allMonths.length) {
    throw new Error("Airport snapshot and delta contain duplicate months.");
  }

  if (!isStrictlyIncreasing(allMonths)) {
    throw new Error("Airport snapshot plus delta months are not strictly increasing.");
  }

  if (deltaMonths.some((month) => month <= baseLatest)) {
    throw new Error("Airport delta contains a month already covered by the snapshot.");
  }

  const expectedLatest = deltaMonths.at(-1) ?? baseLatest;
  if (delta.latest_complete_month !== expectedLatest) {
    throw new Error(
      `Airport delta latest month mismatch: rows=${expectedLatest}, metadata=${delta.latest_complete_month}.`,
    );
  }
  if (metadata.latest_data_point !== expectedLatest) {
    throw new Error(
      `Airport public metadata latest month mismatch: expected=${expectedLatest}, metadata=${metadata.latest_data_point}.`,
    );
  }

  const expectedCount = baseRows.length + deltaRows.length;
  if (metadata.record_count !== expectedCount) {
    throw new Error(
      `Airport record count mismatch: expected=${expectedCount}, metadata=${metadata.record_count}.`,
    );
  }

  console.log(
    `Airport snapshot/delta integrity OK: ${baseRows.length} snapshot + ${deltaRows.length} delta = ${expectedCount} months through ${expectedLatest}.`,
  );
}

function parseRows(value) {
  return String(value ?? "")
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean);
}

function firstColumn(row) {
  const month = row.split("|", 1)[0];
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error(`Invalid airport month key: ${month}`);
  }
  return month;
}

function isStrictlyIncreasing(values) {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index] <= values[index - 1]) return false;
  }
  return true;
}

async function readJson(fileName) {
  return JSON.parse(await readFile(path.join(GENERATED_DIR, fileName), "utf8"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
