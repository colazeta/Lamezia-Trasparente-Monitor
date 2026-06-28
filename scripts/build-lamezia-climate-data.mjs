import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BASELINE_PERIOD_LABEL,
  CLIMATE_DATA_CAVEAT,
  DEFAULT_CLIMATE_UPDATE_TIMEZONE,
  DEFAULT_BASELINE_PERIOD,
  buildAnnualClimateMetrics,
  buildClimateNormals,
  enrichClimateDailyRecords,
  getLatestCompleteLocalDate,
} from "./climate/lameziaClimateCore.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(
  repoRoot,
  "artifacts/lamezia-trasparente/src/data/generated/lameziaClimateDaily.json",
);

const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const OPEN_METEO_RECENT_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_DOCS_URL = "https://open-meteo.com/en/docs/historical-weather-api";
const OPEN_METEO_RECENT_DOCS_URL = "https://open-meteo.com/en/docs";
const OPEN_METEO_TERMS_URL = "https://open-meteo.com/en/terms";
const OPEN_METEO_MODEL = "era5_seamless";
const DATA_LAG_DAYS = Number.parseInt(
  process.env.LAMEZIA_CLIMATE_LAG_DAYS ?? "1",
  10,
);
if (!Number.isInteger(DATA_LAG_DAYS) || DATA_LAG_DAYS < 0) {
  throw new Error(`Invalid LAMEZIA_CLIMATE_LAG_DAYS: ${DATA_LAG_DAYS}`);
}

const COORDINATES = {
  name: "Lamezia Terme",
  latitude: 38.9629,
  longitude: 16.3092,
  timezone: DEFAULT_CLIMATE_UPDATE_TIMEZONE,
};
const UPDATE_POLICY =
  "Aggiornamento giornaliero pianificato al mattino presto (Europe/Rome): la pipeline richiede il giorno precedente e pubblica il JSON statico solo se la fonte restituisce nuovi dati completi.";

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
  process.env.LAMEZIA_CLIMATE_END_DATE ??
  getLatestCompleteLocalDate(new Date(), {
    timeZone: COORDINATES.timezone,
    lagDays: DATA_LAG_DAYS,
  });

const sourceUrl = buildOpenMeteoUrl(startDate, requestedEndDate);
const existingRecords = await readExistingRawRecords(outputPath);
const canUseExistingRecords =
  process.env.LAMEZIA_CLIMATE_FULL_REFRESH !== "1" &&
  existingRecords.length > 0 &&
  existingRecords[0].date <= startDate;
const baseRecords = canUseExistingRecords
  ? existingRecords.filter(
      (record) => record.date >= startDate && record.date <= requestedEndDate,
    )
  : [];
const latestBaseDate = baseRecords[baseRecords.length - 1]?.date ?? null;
const fetchStartDate =
  canUseExistingRecords && latestBaseDate
    ? nextIsoDate(latestBaseDate)
    : startDate;
const chunks =
  fetchStartDate <= requestedEndDate
    ? buildMonthChunks(fetchStartDate, requestedEndDate)
    : [];
const fetchStats = { archiveRequests: 0, recentRequests: 0 };
const fetchedRecords = [];

for (const chunk of chunks) {
  fetchedRecords.push(
    ...(await fetchDailyRecordsForRange(chunk.start, chunk.end, fetchStats)),
  );
}

const archiveRecords = mergeDailyRecords(baseRecords, fetchedRecords);
const latestArchiveDate =
  archiveRecords[archiveRecords.length - 1]?.date ?? null;
const recentFetchStartDate =
  latestArchiveDate && latestArchiveDate < requestedEndDate
    ? nextIsoDate(latestArchiveDate)
    : null;
const recentSourceUrl = recentFetchStartDate
  ? buildOpenMeteoRecentUrl(recentFetchStartDate, requestedEndDate)
  : null;
const recentRecords = recentFetchStartDate
  ? await fetchRecentDailyRecordsForRange(
      recentFetchStartDate,
      requestedEndDate,
      fetchStats,
    )
  : [];

const rawRecords = mergeDailyRecords(archiveRecords, recentRecords);
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
    source:
      "Open-Meteo Historical Weather API (ERA5 seamless) e Open-Meteo past-days per aggiornamento recente",
    source_url: sourceUrl,
    source_recent_url: recentSourceUrl,
    source_documentation_url: OPEN_METEO_DOCS_URL,
    source_recent_documentation_url: OPEN_METEO_RECENT_DOCS_URL,
    source_request_count: fetchStats.archiveRequests + fetchStats.recentRequests,
    source_archive_request_count: fetchStats.archiveRequests,
    source_recent_request_count: fetchStats.recentRequests,
    source_query_strategy:
      "La pipeline riusa il JSON statico esistente, interroga l'API storica per i giorni mancanti e colma il tratto più recente con il parametro past-days della Forecast API quando ERA5-Seamless non ha ancora pubblicato il giorno precedente. Con LAMEZIA_CLIMATE_FULL_REFRESH=1 ricostruisce l'intera serie. Le richieste storiche sono mensili e vengono suddivise automaticamente se ricevono timeout o errori temporanei.",
    source_update_mode: canUseExistingRecords ? "incremental" : "full",
    source_fetch_start_date: chunks[0]?.start ?? null,
    source_recent_fetch_start_date: recentFetchStartDate,
    requested_end_date: requestedEndDate,
    data_lag_days: DATA_LAG_DAYS,
    coordinates: COORDINATES,
    baseline_period: BASELINE_PERIOD_LABEL,
    generated_at: new Date().toISOString(),
    latest_complete_date: latestCompleteDate,
    update_policy: UPDATE_POLICY,
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

function buildOpenMeteoRecentUrl(start, end) {
  const url = new URL(OPEN_METEO_RECENT_URL);
  url.searchParams.set("latitude", String(COORDINATES.latitude));
  url.searchParams.set("longitude", String(COORDINATES.longitude));
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("daily", dailyVariables.join(","));
  url.searchParams.set("timezone", COORDINATES.timezone);
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("precipitation_unit", "mm");
  return url.toString();
}

async function readExistingRawRecords(filePath) {
  try {
    const dataset = JSON.parse(await readFile(filePath, "utf8"));
    if (!Array.isArray(dataset.daily)) {
      return [];
    }

    return dataset.daily
      .map(toRawRecordFromExisting)
      .filter(isCompleteRawRecord)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function toRawRecordFromExisting(record) {
  return {
    date: record.date,
    tMean: numericValue(record.tMean),
    tMin: numericValue(record.tMin),
    tMax: numericValue(record.tMax),
    precipitation: numericValue(record.precipitation),
  };
}

function isCompleteRawRecord(record) {
  return (
    typeof record.date === "string" &&
    Number.isFinite(record.tMean) &&
    Number.isFinite(record.tMin) &&
    Number.isFinite(record.tMax)
  );
}

function mergeDailyRecords(...recordSets) {
  const byDate = new Map();
  for (const records of recordSets) {
    for (const record of records) {
      if (isCompleteRawRecord(record)) {
        byDate.set(record.date, record);
      }
    }
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function nextIsoDate(date) {
  const parsed = Date.parse(`${date}T00:00:00Z`);
  return new Date(parsed + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
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
    fetchStats.archiveRequests += 1;
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

async function fetchRecentDailyRecordsForRange(start, end, fetchStats) {
  const url = buildOpenMeteoRecentUrl(start, end);
  const payload = await fetchOpenMeteoJson(url);
  fetchStats.recentRequests += 1;
  return toDailyRecords(payload.daily);
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
