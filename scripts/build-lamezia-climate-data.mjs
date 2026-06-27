import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BASELINE_PERIOD_LABEL,
  CLIMATE_DATA_CAVEAT,
  DEFAULT_BASELINE_PERIOD,
  buildAnnualClimateMetrics,
  buildClimateNormals,
  enrichClimateDailyRecords,
} from "./climate/lameziaClimateCore.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(
  repoRoot,
  "artifacts/lamezia-trasparente/src/data/generated/lameziaClimateDaily.json",
);

const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const OPEN_METEO_DOCS_URL = "https://open-meteo.com/en/docs/historical-weather-api";
const OPEN_METEO_TERMS_URL = "https://open-meteo.com/en/terms";
const OPEN_METEO_MODEL = "era5_seamless";
const DATA_LAG_DAYS = 5;
const COORDINATES = {
  name: "Lamezia Terme",
  latitude: 38.9629,
  longitude: 16.3092,
  timezone: "Europe/Rome",
};

const dailyVariables = [
  "temperature_2m_mean",
  "temperature_2m_min",
  "temperature_2m_max",
  "precipitation_sum",
];

const startDate =
  process.env.LAMEZIA_CLIMATE_START_DATE ??
  `${DEFAULT_BASELINE_PERIOD.startYear}-01-01`;
const requestedEndDate =
  process.env.LAMEZIA_CLIMATE_END_DATE ?? getLatestCompleteDate();

const sourceUrl = buildOpenMeteoUrl(startDate, requestedEndDate);
const chunks = buildMonthChunks(startDate, requestedEndDate);
const fetchStats = { successfulRequests: 0 };
const rawRecords = [];

for (const chunk of chunks) {
  rawRecords.push(
    ...(await fetchDailyRecordsForRange(chunk.start, chunk.end, fetchStats)),
  );
}

if (rawRecords.length === 0) {
  throw new Error("Open-Meteo response did not contain daily climate records.");
}

const normals = buildClimateNormals(rawRecords);
const daily = enrichClimateDailyRecords(rawRecords, normals);
const annual = buildAnnualClimateMetrics(daily);
const latestCompleteDate = daily[daily.length - 1]?.date ?? requestedEndDate;

const generated = {
  schema_version: 1,
  metadata: {
    source: "Open-Meteo Historical Weather API (ERA5 seamless)",
    source_url: sourceUrl,
    source_documentation_url: OPEN_METEO_DOCS_URL,
    source_request_count: fetchStats.successfulRequests,
    source_query_strategy:
      "Lo script interroga l'API per mese e suddivide automaticamente gli intervalli che ricevono timeout o errori temporanei.",
    coordinates: COORDINATES,
    baseline_period: BASELINE_PERIOD_LABEL,
    generated_at: new Date().toISOString(),
    latest_complete_date: latestCompleteDate,
    licence_or_terms_note: `Dati recuperati da Open-Meteo; verificare i termini aggiornati su ${OPEN_METEO_TERMS_URL}.`,
    caveat: CLIMATE_DATA_CAVEAT,
    leap_day_policy:
      "Il 29 febbraio usa i valori disponibili nel periodo 1991–2020; se assenti, lo script interpola la normale tra 28 febbraio e 1 marzo.",
  },
  daily,
  annual,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, stringifyClimateDataset(generated), "utf8");

console.log(
  `Wrote ${daily.length} daily climate records through ${latestCompleteDate} to ${path.relative(
    repoRoot,
    outputPath,
  )}`,
);

function buildOpenMeteoUrl(start, end) {
  const url = new URL(OPEN_METEO_ARCHIVE_URL);
  url.searchParams.set("latitude", String(COORDINATES.latitude));
  url.searchParams.set("longitude", String(COORDINATES.longitude));
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("daily", dailyVariables.join(","));
  url.searchParams.set("timezone", COORDINATES.timezone);
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("precipitation_unit", "mm");
  url.searchParams.set("models", OPEN_METEO_MODEL);
  return url.toString();
}

function buildMonthChunks(start, end) {
  const startDateParts = parseDateForChunks(start);
  const endDateParts = parseDateForChunks(end);
  const chunks = [];

  let year = startDateParts.year;
  let month = startDateParts.month;
  while (
    year < endDateParts.year ||
    (year === endDateParts.year && month <= endDateParts.month)
  ) {
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const monthEnd = lastDayOfMonth(year, month);
    const chunkStart =
      year === startDateParts.year && month === startDateParts.month
        ? start
        : monthStart;
    const chunkEnd =
      year === endDateParts.year && month === endDateParts.month
        ? end
        : monthEnd;
    chunks.push({ start: chunkStart, end: chunkEnd });

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return chunks;
}

function parseDateForChunks(date) {
  return {
    year: Number(date.slice(0, 4)),
    month: Number(date.slice(5, 7)),
  };
}

function lastDayOfMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

async function fetchOpenMeteoJson(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Lamezia-Trasparente-Monitor climate data builder",
        },
      });
      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          `Open-Meteo request failed for ${url}: ${response.status} ${response.statusText} ${text.slice(
            0,
            200,
          )}`,
        );
      }

      try {
        return JSON.parse(text);
      } catch (error) {
        throw new Error(
          `Open-Meteo returned non-JSON content for ${url}: ${text.slice(
            0,
            200,
          )}`,
          { cause: error },
        );
      }
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await delay(500 * attempt);
      }
    }
  }

  throw lastError;
}

async function fetchDailyRecordsForRange(start, end, fetchStats) {
  const url = buildOpenMeteoUrl(start, end);

  try {
    const payload = await fetchOpenMeteoJson(url);
    fetchStats.successfulRequests += 1;
    return toDailyRecords(payload.daily);
  } catch (error) {
    if (start >= end) {
      throw error;
    }

    const [first, second] = splitDateRange(start, end);
    return [
      ...(await fetchDailyRecordsForRange(first.start, first.end, fetchStats)),
      ...(await fetchDailyRecordsForRange(
        second.start,
        second.end,
        fetchStats,
      )),
    ];
  }
}

function splitDateRange(start, end) {
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  const midTime =
    startTime + Math.floor((endTime - startTime) / (2 * 24 * 60 * 60 * 1000)) *
      24 *
      60 *
      60 *
      1000;
  const firstEnd = new Date(midTime).toISOString().slice(0, 10);
  const secondStart = new Date(midTime + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return [
    { start, end: firstEnd },
    { start: secondStart, end },
  ];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLatestCompleteDate(now = new Date()) {
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  date.setUTCDate(date.getUTCDate() - DATA_LAG_DAYS);
  return date.toISOString().slice(0, 10);
}

function toDailyRecords(daily) {
  if (!daily || !Array.isArray(daily.time)) {
    return [];
  }

  return daily.time
    .map((date, index) => ({
      date,
      tMean: numericValue(daily.temperature_2m_mean?.[index]),
      tMin: numericValue(daily.temperature_2m_min?.[index]),
      tMax: numericValue(daily.temperature_2m_max?.[index]),
      precipitation: numericValue(daily.precipitation_sum?.[index]),
    }))
    .filter(
      (record) =>
        Number.isFinite(record.tMean) &&
        Number.isFinite(record.tMin) &&
        Number.isFinite(record.tMax),
    );
}

function numericValue(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringifyClimateDataset(dataset) {
  const metadataJson = JSON.stringify(dataset.metadata, null, 2)
    .split("\n")
    .map((line, index) => (index === 0 ? line : `  ${line}`))
    .join("\n");

  return [
    "{",
    `  "schema_version": ${dataset.schema_version},`,
    `  "metadata": ${metadataJson},`,
    `${stringifyCompactArray("daily", dataset.daily)},`,
    stringifyCompactArray("annual", dataset.annual),
    "}",
    "",
  ].join("\n");
}

function stringifyCompactArray(name, records) {
  if (records.length === 0) {
    return `  "${name}": []`;
  }

  return [
    `  "${name}": [`,
    records.map((record) => `    ${JSON.stringify(record)}`).join(",\n"),
    "  ]",
  ].join("\n");
}
