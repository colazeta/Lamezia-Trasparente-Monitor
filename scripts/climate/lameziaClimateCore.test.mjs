import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  BASELINE_PERIOD_LABEL,
  CLIMATE_DATA_CAVEAT,
  buildAnnualClimateMetrics,
  buildClimateNormals,
  enrichClimateDailyRecords,
  getLatestCompleteLocalDate,
} from "./lameziaClimateCore.mjs";

test("calcola la normale climatica 1991-2020 per giorno dell'anno", () => {
  const normals = buildClimateNormals([
    climateRecord("1991-01-01", 10),
    climateRecord("1992-01-01", 14),
    climateRecord("2021-01-01", 50),
  ]);

  assert.equal(normals["01-01"].tMean, 12);
  assert.equal(normals["01-01"].sampleCount, 2);
});

test("calcola l'anomalia rispetto alla normale giornaliera", () => {
  const normals = buildClimateNormals([
    climateRecord("1991-07-15", 20),
    climateRecord("1992-07-15", 22),
  ]);
  const [record] = enrichClimateDailyRecords(
    [climateRecord("2024-07-15", 25)],
    normals,
  );

  assert.equal(record.normalTMean, 21);
  assert.equal(record.anomalyTMean, 4);
});

test("gestisce esplicitamente il 29 febbraio", () => {
  const normals = buildClimateNormals([
    climateRecord("1991-02-28", 10),
    climateRecord("1991-03-01", 12),
  ]);
  const [record] = enrichClimateDailyRecords(
    [climateRecord("1992-02-29", 15)],
    normals,
  );

  assert.equal(normals["02-29"].synthetic, true);
  assert.equal(record.dayOfYear, 60);
  assert.equal(record.normalTMean, 11);
  assert.equal(record.anomalyTMean, 4);
});

test("calcola l'ultimo giorno completo come giorno precedente in Europe/Rome", () => {
  assert.equal(
    getLatestCompleteLocalDate(new Date("2026-06-28T05:15:00Z"), {
      timeZone: "Europe/Rome",
    }),
    "2026-06-27",
  );
  assert.equal(
    getLatestCompleteLocalDate(new Date("2026-01-02T05:15:00Z"), {
      timeZone: "Europe/Rome",
    }),
    "2026-01-01",
  );
});

test("calcola metriche annuali da temperature e precipitazioni giornaliere", () => {
  const metrics = buildAnnualClimateMetrics([
    {
      ...climateRecord("2024-08-01", 27, {
        tMin: 21,
        tMax: 31,
        precipitation: 1.2,
      }),
      year: 2024,
      month: 8,
      dayOfYear: 214,
      normalTMean: 25,
      anomalyTMean: 2,
      normalRange: { p10: 23, p90: 28 },
    },
    {
      ...climateRecord("2024-08-02", 24, {
        tMin: 18,
        tMax: 29,
        precipitation: 4.8,
      }),
      year: 2024,
      month: 8,
      dayOfYear: 215,
      normalTMean: 25,
      anomalyTMean: -1,
      normalRange: { p10: 23, p90: 28 },
    },
  ]);

  assert.equal(metrics[0].days, 2);
  assert.equal(metrics[0].averageTMean, 25.5);
  assert.equal(metrics[0].meanAnomalyTMean, 0.5);
  assert.equal(metrics[0].warmDaysOver30C, 1);
  assert.equal(metrics[0].tropicalNights, 1);
  assert.equal(metrics[0].precipitationTotal, 6);
});

test("il JSON statico espone metadati e record giornalieri richiesti", async () => {
  const json = JSON.parse(
    await readFile(
      new URL(
        "../../artifacts/lamezia-trasparente/src/data/generated/lameziaClimateDaily.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );

  assert.equal(json.metadata.baseline_period, BASELINE_PERIOD_LABEL);
  assert.equal(json.metadata.caveat, CLIMATE_DATA_CAVEAT);
  assert.equal(typeof json.metadata.source, "string");
  assert.equal(typeof json.metadata.source_url, "string");
  assert.equal(typeof json.metadata.generated_at, "string");
  assert.equal(typeof json.metadata.latest_complete_date, "string");
  assert.match(json.metadata.source_update_mode, /^(incremental|full)$/);
  assert.equal(typeof json.metadata.source_archive_request_count, "number");
  assert.equal(typeof json.metadata.source_recent_request_count, "number");
  assert.ok(
    json.metadata.source_recent_url === null ||
      typeof json.metadata.source_recent_url === "string",
  );
  assert.equal(typeof json.metadata.requested_end_date, "string");
  assert.equal(typeof json.metadata.data_lag_days, "number");
  assert.equal(typeof json.metadata.update_policy, "string");
  assert.equal(typeof json.metadata.licence_or_terms_note, "string");
  assert.equal(typeof json.metadata.coordinates.latitude, "number");
  assert.equal(json.metadata.coordinates.timezone, "Europe/Rome");
  assert.ok(Array.isArray(json.daily));
  assert.ok(json.daily.length > 0);
  assert.deepEqual(Object.keys(json.daily[0].normalRange), ["p10", "p90"]);
  assert.equal(typeof json.daily[0].date, "string");
  assert.equal(typeof json.daily[0].dayOfYear, "number");
  assert.ok(Array.isArray(json.annual));
});

function climateRecord(
  date,
  tMean,
  { tMin = tMean - 1, tMax = tMean + 1, precipitation = 0 } = {},
) {
  return {
    date,
    tMean,
    tMin,
    tMax,
    precipitation,
  };
}
