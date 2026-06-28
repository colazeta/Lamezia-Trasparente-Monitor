export const BASELINE_PERIOD_LABEL = "1991–2020";

export const DEFAULT_BASELINE_PERIOD = Object.freeze({
  startYear: 1991,
  endYear: 2020,
  label: BASELINE_PERIOD_LABEL,
});

export const DEFAULT_CLIMATE_UPDATE_TIMEZONE = "Europe/Rome";

export const CLIMATE_DATA_CAVEAT =
  "Dati di reanalisi meteorologica su griglia: utili per analisi civiche e tendenze locali, non sostituiscono misurazioni certificate di stazione né allerte meteo ufficiali.";

const DAY_MS = 24 * 60 * 60 * 1000;
const LEAP_DAY_KEY = "02-29";
const PRE_LEAP_DAY_KEY = "02-28";
const POST_LEAP_DAY_KEY = "03-01";

export function parseIsoDateParts(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error(`Invalid ISO date: ${date}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function getDayKey(date) {
  const { month, day } = parseIsoDateParts(date);
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getDayOfYear(date) {
  const { year, month, day } = parseIsoDateParts(date);
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / DAY_MS) + 1;
}

export function isLeapDay(date) {
  return getDayKey(date) === LEAP_DAY_KEY;
}

export function getLatestCompleteLocalDate(
  now = new Date(),
  { timeZone = DEFAULT_CLIMATE_UPDATE_TIMEZONE, lagDays = 1 } = {},
) {
  if (!Number.isInteger(lagDays) || lagDays < 0) {
    throw new Error(`Invalid climate data lag: ${lagDays}`);
  }

  const localParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(now)
    .reduce((parts, part) => {
      if (part.type !== "literal") {
        parts[part.type] = part.value;
      }
      return parts;
    }, {});

  const localDateAtNoonUtc = new Date(
    Date.UTC(
      Number(localParts.year),
      Number(localParts.month) - 1,
      Number(localParts.day),
      12,
    ),
  );
  localDateAtNoonUtc.setUTCDate(localDateAtNoonUtc.getUTCDate() - lagDays);
  return localDateAtNoonUtc.toISOString().slice(0, 10);
}

export function roundNumber(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function quantile(values, q) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return null;
  }

  if (sorted.length === 1) {
    return sorted[0];
  }

  const position = (sorted.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  const next = sorted[base + 1];

  return next === undefined
    ? sorted[base]
    : sorted[base] + rest * (next - sorted[base]);
}

export function buildClimateNormals(
  records,
  baselinePeriod = DEFAULT_BASELINE_PERIOD,
) {
  const grouped = new Map();

  for (const record of records) {
    const { year } = parseIsoDateParts(record.date);
    if (year < baselinePeriod.startYear || year > baselinePeriod.endYear) {
      continue;
    }

    if (!Number.isFinite(record.tMean)) {
      continue;
    }

    const dayKey = getDayKey(record.date);
    const values = grouped.get(dayKey) ?? [];
    values.push(record.tMean);
    grouped.set(dayKey, values);
  }

  const normals = {};
  for (const [dayKey, values] of grouped.entries()) {
    normals[dayKey] = summarizeNormal(values, { synthetic: false });
  }

  if (
    !normals[LEAP_DAY_KEY] &&
    normals[PRE_LEAP_DAY_KEY] &&
    normals[POST_LEAP_DAY_KEY]
  ) {
    normals[LEAP_DAY_KEY] = interpolateLeapDayNormal(
      normals[PRE_LEAP_DAY_KEY],
      normals[POST_LEAP_DAY_KEY],
    );
  }

  return normals;
}

export function enrichClimateDailyRecords(records, normals) {
  return records.map((record) => {
    const dayKey = getDayKey(record.date);
    const normal = normals[dayKey] ?? null;
    const normalTMean = normal?.tMean ?? null;
    const anomalyTMean =
      normalTMean === null || !Number.isFinite(record.tMean)
        ? null
        : roundNumber(record.tMean - normalTMean);

    const { year, month } = parseIsoDateParts(record.date);

    return {
      date: record.date,
      year,
      month,
      dayOfYear: getDayOfYear(record.date),
      tMean: roundNumber(record.tMean),
      tMin: roundNumber(record.tMin),
      tMax: roundNumber(record.tMax),
      precipitation: roundNumber(record.precipitation),
      normalTMean,
      anomalyTMean,
      normalRange: normal
        ? {
            p10: normal.p10,
            p90: normal.p90,
          }
        : {
            p10: null,
            p90: null,
          },
    };
  });
}

export function buildAnnualClimateMetrics(dailyRecords) {
  const byYear = new Map();

  for (const record of dailyRecords) {
    const records = byYear.get(record.year) ?? [];
    records.push(record);
    byYear.set(record.year, records);
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, records]) => ({
      year,
      days: records.length,
      averageTMean: averageRounded(records.map((record) => record.tMean)),
      meanAnomalyTMean: averageRounded(
        records.map((record) => record.anomalyTMean),
      ),
      warmDaysOver30C: records.filter((record) => record.tMax > 30).length,
      tropicalNights: records.filter((record) => record.tMin >= 20).length,
      precipitationTotal: sumRounded(
        records.map((record) => record.precipitation),
      ),
      latestDate: records[records.length - 1]?.date ?? null,
    }));
}

function summarizeNormal(values, { synthetic }) {
  const finiteValues = values.filter(Number.isFinite);
  const mean =
    finiteValues.reduce((total, value) => total + value, 0) /
    Math.max(finiteValues.length, 1);

  return {
    tMean: roundNumber(mean),
    p10: roundNumber(quantile(finiteValues, 0.1)),
    p90: roundNumber(quantile(finiteValues, 0.9)),
    sampleCount: finiteValues.length,
    synthetic,
  };
}

function interpolateLeapDayNormal(previous, next) {
  return {
    tMean: roundNumber((previous.tMean + next.tMean) / 2),
    p10: roundNumber((previous.p10 + next.p10) / 2),
    p90: roundNumber((previous.p90 + next.p90) / 2),
    sampleCount: 0,
    synthetic: true,
  };
}

function averageRounded(values) {
  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) {
    return null;
  }

  return roundNumber(
    finiteValues.reduce((total, value) => total + value, 0) /
      finiteValues.length,
  );
}

function sumRounded(values) {
  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) {
    return null;
  }

  return roundNumber(finiteValues.reduce((total, value) => total + value, 0));
}
