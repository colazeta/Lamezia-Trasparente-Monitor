import type { AnacArchiveCandidate } from "./anacBdncpSyncCore";

export const ANAC_CKAN_PACKAGE_SHOW_URL =
  "https://dati.anticorruzione.it/opendata/api/3/action/package_show";

const MONTHS: Record<string, string> = {
  gennaio: "01",
  febbraio: "02",
  marzo: "03",
  aprile: "04",
  maggio: "05",
  giugno: "06",
  luglio: "07",
  agosto: "08",
  settembre: "09",
  ottobre: "10",
  novembre: "11",
  dicembre: "12",
};

export function buildAnacCigPackageIds(
  referenceDate: Date,
  lookbackMonths: number,
): string[] {
  const periods = buildPeriods(referenceDate, lookbackMonths);
  return Array.from(new Set(periods.map((period) => period.slice(0, 4))))
    .map((year) => `cig-${year}`)
    .sort((a, b) => b.localeCompare(a));
}

export function selectAnacCigArchiveCandidates(
  payload: unknown,
  referenceDate: Date,
  lookbackMonths: number,
): AnacArchiveCandidate[] {
  const periods = buildPeriods(referenceDate, lookbackMonths);
  const target = new Set(periods);
  const candidates = new Map<string, { candidate: AnacArchiveCandidate; score: number }>();

  for (const resource of extractResources(payload)) {
    const url = stringValue(resource.url);
    if (!url || !isOfficialAnacHttpsUrl(url) || !isZipUrl(url)) continue;

    const name = stringValue(resource.name) ?? "";
    const description = stringValue(resource.description) ?? "";
    const format = stringValue(resource.format) ?? "";
    const period = inferResourcePeriod(`${name} ${description} ${url}`);
    if (!period || !target.has(period)) continue;

    const score = scoreCsvArchive(name, format, url);
    if (score === 0) continue;
    const previous = candidates.get(period);
    if (!previous || score > previous.score) {
      candidates.set(period, {
        candidate: { period, url },
        score,
      });
    }
  }

  return periods
    .map((period) => candidates.get(period)?.candidate ?? null)
    .filter((candidate): candidate is AnacArchiveCandidate => candidate !== null);
}

function extractResources(value: unknown): Record<string, unknown>[] {
  if (!isRecord(value) || value.success !== true || !isRecord(value.result)) {
    return [];
  }
  const resources = value.result.resources;
  if (!Array.isArray(resources)) return [];
  return resources.filter(isRecord);
}

function inferResourcePeriod(value: string): string | null {
  const numeric = /(?:^|\D)(20\d{2})[-_/]?((?:0?[1-9])|(?:1[0-2]))(?:[-_/]?(?:0?[1-9]|[12]\d|3[01]))?(?:\D|$)/u.exec(
    value,
  );
  if (numeric) {
    return `${numeric[1]}-${numeric[2].padStart(2, "0")}`;
  }

  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase();
  for (const [month, monthNumber] of Object.entries(MONTHS)) {
    const monthFirst = new RegExp(`${month}[^0-9]{0,20}(20\\d{2})`, "u").exec(
      normalized,
    );
    if (monthFirst) return `${monthFirst[1]}-${monthNumber}`;
    const yearFirst = new RegExp(`(20\\d{2})[^a-z]{0,20}${month}`, "u").exec(
      normalized,
    );
    if (yearFirst) return `${yearFirst[1]}-${monthNumber}`;
  }
  return null;
}

function scoreCsvArchive(name: string, format: string, url: string): number {
  const combined = `${name} ${format} ${url}`.toLowerCase();
  let score = 0;
  if (combined.includes("csv")) score += 3;
  if (format.toLowerCase().includes("zip")) score += 2;
  if (/cig/iu.test(combined)) score += 1;
  return score;
}

function isZipUrl(value: string): boolean {
  try {
    return /\.zip$/iu.test(new URL(value).pathname);
  } catch {
    return false;
  }
}

function isOfficialAnacHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "anticorruzione.it" ||
        url.hostname.endsWith(".anticorruzione.it"))
    );
  } catch {
    return false;
  }
}

function buildPeriods(referenceDate: Date, lookbackMonths: number): string[] {
  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error("A valid reference date is required");
  }
  if (
    !Number.isInteger(lookbackMonths) ||
    lookbackMonths < 1 ||
    lookbackMonths > 60
  ) {
    throw new Error("lookbackMonths must be an integer between 1 and 60");
  }

  return Array.from({ length: lookbackMonths }, (_, index) => {
    const month = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth() - index,
        1,
      ),
    );
    return `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
