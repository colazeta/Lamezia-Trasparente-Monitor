export const RCS_LAMEZIA_ISTAT_CODE = "079160";
export const ITALY_BIRTH_COUNTRY_CODE = "100";
export const OTHER_COUNTRIES_CODE = "995";

export type BirthCountrySourceStatus =
  | "final"
  | "provisional"
  | "estimated"
  | "reconstructed"
  | "forecast"
  | "unknown";

export type BirthCountrySex = "male" | "female" | "total";

export type RcsBirthFormContract = {
  years: number[];
  fixedFields: Record<string, string>;
  countryLabels: Record<string, string>;
};

export type ParsedBirthCountryObservation = {
  period: string;
  birthCountry: string;
  birthCountryLabel: string;
  sex: BirthCountrySex;
  value: number;
  // Parser output uses known values, while persisted observations are read back
  // through Drizzle as plain strings. The public summary normalizes that DB
  // boundary back to the closed status vocabulary below.
  sourceStatus: string;
  rawStatus: string | null;
  qualityFlags: string[];
  sourceDataset?: string;
};

export type PopulationBirthCountrySummary = {
  period: string;
  sourceStatus: BirthCountrySourceStatus;
  counts: {
    population: number;
    bornInItaly: number;
    bornAbroad: number;
    bornAbroadShare: number | null;
    male: number;
    female: number;
  };
  topBirthCountries: Array<{
    code: string;
    name: string;
    total: number;
    male: number;
    female: number;
    shareOfBornAbroad: number | null;
  }>;
  quality: {
    sourceCountryTotal: number;
    independentPopulation: number | null;
    coverageDifference: number | null;
  };
  sourceDataset: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, "\u00a0")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function attribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function cleanHtmlText(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLabel(value: string) {
  return cleanHtmlText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’`]/g, "'")
    .toLocaleLowerCase("it-IT")
    .replace(/\s+/g, " ")
    .trim();
}

function isCountryCode(value: string) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 100 && numeric < 9999;
}

export function parseRcsBirthFormContract(html: string): RcsBirthFormContract {
  const formMatch = html.match(
    /<form\b[^>]*id=["']form-1["'][^>]*>([\s\S]*?)<\/form>/i,
  );
  if (!formMatch) {
    throw new Error(
      "ISTAT RCS schema changed: form-1 (paese di nascita) not found",
    );
  }
  const form = formMatch[1];

  const fixedFields: Record<string, string> = {};
  for (const match of form.matchAll(/<input\b[^>]*>/gi)) {
    const tag = match[0];
    if ((attribute(tag, "type") ?? "").toLowerCase() !== "hidden") continue;
    const name = attribute(tag, "name");
    if (!name) continue;
    fixedFields[name] = attribute(tag, "value") ?? "";
  }

  for (const required of [
    "hid-i",
    "hid-a",
    "hid-l",
    "hid-cat",
    "hid-dati",
    "hid-tavola",
  ]) {
    if (!(required in fixedFields)) {
      throw new Error(`ISTAT RCS schema changed: hidden field ${required} missing`);
    }
  }
  if (
    fixedFields["hid-i"] !== "RCS" ||
    fixedFields["hid-cat"] !== "RCS" ||
    fixedFields["hid-dati"] !== "dati-form-1" ||
    fixedFields["hid-tavola"] !== "tavola-form-1"
  ) {
    throw new Error(
      "ISTAT RCS schema changed: form-1 hidden contract is unexpected",
    );
  }

  const yearSelect = form.match(
    /<select\b[^>]*name=["']a["'][^>]*>([\s\S]*?)<\/select>/i,
  );
  if (!yearSelect) {
    throw new Error("ISTAT RCS schema changed: year selector missing");
  }
  const years = [
    ...yearSelect[1].matchAll(
      /<option\b[^>]*value=["']?(\d{4})["']?[^>]*>/gi,
    ),
  ]
    .map((match) => Number(match[1]))
    .filter(Number.isInteger);
  const uniqueYears = [...new Set(years)].sort((left, right) => left - right);
  if (!uniqueYears.length) {
    throw new Error("ISTAT RCS schema changed: no years declared");
  }

  const countrySelect = form.match(
    /<select\b[^>]*name=["']nascita["'][^>]*>([\s\S]*?)<\/select>/i,
  );
  if (!countrySelect) {
    throw new Error(
      "ISTAT RCS schema changed: country-of-birth selector missing",
    );
  }
  const countryLabels: Record<string, string> = {};
  for (const match of countrySelect[1].matchAll(
    /<option\b([^>]*)>([\s\S]*?)<\/option>/gi,
  )) {
    const tag = `<option ${match[1]}>`;
    const value = attribute(tag, "value") ?? "";
    if (!isCountryCode(value)) continue;
    const label = cleanHtmlText(match[2]);
    if (label) countryLabels[value] = label;
  }
  if (
    !countryLabels[ITALY_BIRTH_COUNTRY_CODE] ||
    Object.keys(countryLabels).length < 100
  ) {
    throw new Error(
      `ISTAT RCS schema changed: country-of-birth domain incomplete (${Object.keys(countryLabels).length} country codes)`,
    );
  }

  return { years: uniqueYears, fixedFields, countryLabels };
}

export function buildRcsBirthPayload(
  contract: RcsBirthFormContract,
  year: number,
  geographyCode = RCS_LAMEZIA_ISTAT_CODE,
): Record<string, string> {
  if (!contract.years.includes(year)) {
    throw new Error(`ISTAT RCS: year ${year} is not declared by form-1`);
  }
  return {
    ...contract.fixedFields,
    a: String(year),
    "hid-a": String(year),
    nascita: "9999",
    ripartizione: "4",
    regione: "18",
    provincia: "079",
    comune: geographyCode,
  };
}

function numericRowValue(
  row: Record<string, unknown>,
  key: string,
): number | null {
  const raw = row[key];
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const normalized = raw.replace(/\./g, "").replace(",", ".").trim();
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

export function parseRcsBirthResponse(
  payload: string,
  contract: RcsBirthFormContract,
  expectedYear: number,
): ParsedBirthCountryObservation[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("ISTAT RCS response is not valid JSON");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("ISTAT RCS response has an invalid root object");
  }
  const root = parsed as Record<string, unknown>;
  if (root.Status !== true) {
    throw new Error(
      `ISTAT RCS query failed: ${
        typeof root.Messaggio === "string"
          ? root.Messaggio
          : "unknown source error"
      }`,
    );
  }
  const datatable = root.datatable;
  if (!datatable || typeof datatable !== "object") {
    throw new Error("ISTAT RCS response missing datatable");
  }
  const data = (datatable as Record<string, unknown>).data;
  if (!Array.isArray(data)) {
    throw new Error("ISTAT RCS response missing datatable.data");
  }

  const codeByLabel = new Map(
    Object.entries(contract.countryLabels).map(([code, label]) => [
      normalizeLabel(label),
      code,
    ]),
  );
  const out: ParsedBirthCountryObservation[] = [];
  const unknownLabels = new Set<string>();
  const sourceStatus: BirthCountrySourceStatus =
    expectedYear <= 2018 ? "reconstructed" : "final";
  const qualityFlags = expectedYear <= 2018 ? ["source_reconstructed"] : [];

  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rowYear = Number(row.anno ?? expectedYear);
    if (rowYear !== expectedYear) continue;
    const label =
      typeof row.denominazione === "string" ? row.denominazione.trim() : "";
    if (!label) continue;
    const birthCountry = codeByLabel.get(normalizeLabel(label));
    if (!birthCountry) {
      unknownLabels.add(label);
      continue;
    }

    const values: Array<[BirthCountrySex, number | null]> = [
      ["male", numericRowValue(row, "maschi")],
      ["female", numericRowValue(row, "femmine")],
      ["total", numericRowValue(row, "totale")],
    ];
    for (const [sex, value] of values) {
      if (value === null) continue;
      out.push({
        period: String(expectedYear),
        birthCountry,
        birthCountryLabel: contract.countryLabels[birthCountry] ?? label,
        sex,
        value,
        sourceStatus,
        rawStatus: null,
        qualityFlags: [...qualityFlags],
      });
    }
  }

  if (unknownLabels.size) {
    throw new Error(
      `ISTAT RCS response contains unmapped country labels: ${[...unknownLabels]
        .slice(0, 5)
        .join(", ")}`,
    );
  }
  validateBirthCountryObservations(out, String(expectedYear));
  return out.sort(
    (left, right) =>
      left.birthCountry.localeCompare(right.birthCountry) ||
      left.sex.localeCompare(right.sex),
  );
}

export function validateBirthCountryObservations(
  observations: ParsedBirthCountryObservation[],
  label: string,
): void {
  if (!observations.length) {
    throw new Error(`${label}: no valid birth-country observations`);
  }
  const italy = observations.filter(
    (row) => row.birthCountry === ITALY_BIRTH_COUNTRY_CODE,
  );
  for (const sex of ["male", "female", "total"] as const) {
    if (!italy.some((row) => row.sex === sex)) {
      throw new Error(`${label}: Italy row missing for sex=${sex}`);
    }
  }
  const totalCountries = new Set(
    observations
      .filter((row) => row.sex === "total")
      .map((row) => row.birthCountry),
  );
  if (totalCountries.size < 10) {
    throw new Error(
      `${label}: implausibly small country domain (${totalCountries.size})`,
    );
  }
  const identities = new Set<string>();
  for (const row of observations) {
    const identity = `${row.birthCountry}|${row.sex}`;
    if (identities.has(identity)) {
      throw new Error(`${label}: duplicate ${identity}`);
    }
    identities.add(identity);
  }
}

export function datasetForBirthCountryYear(year: number) {
  return `RCS_birth_${year}`;
}

function round(value: number | null, digits = 1): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function statusForRows(
  rows: ParsedBirthCountryObservation[],
): BirthCountrySourceStatus {
  const statuses = new Set(rows.map((row) => row.sourceStatus));
  for (const status of [
    "provisional",
    "estimated",
    "reconstructed",
    "forecast",
    "unknown",
  ] as const) {
    if (statuses.has(status)) return status;
  }
  if (statuses.size === 1 && statuses.has("final")) return "final";
  return "unknown";
}

function valueFor(
  rows: ParsedBirthCountryObservation[],
  code: string,
  sex: BirthCountrySex,
): number {
  return (
    rows.find((row) => row.birthCountry === code && row.sex === sex)?.value ?? 0
  );
}

export function summarizeBirthCountry(
  rows: ParsedBirthCountryObservation[],
  period: string,
  independentPopulation: number | null = null,
): PopulationBirthCountrySummary {
  const selected = rows.filter((row) => row.period === period);
  if (!selected.length) {
    throw new Error(`No country-of-birth observations for ${period}`);
  }
  const totalRows = selected.filter((row) => row.sex === "total");
  const sourceCountryTotal = totalRows.reduce((sum, row) => sum + row.value, 0);
  const bornInItaly = valueFor(selected, ITALY_BIRTH_COUNTRY_CODE, "total");
  const bornAbroad = Math.max(0, sourceCountryTotal - bornInItaly);
  const population = independentPopulation ?? sourceCountryTotal;
  const male = selected
    .filter((row) => row.sex === "male")
    .reduce((sum, row) => sum + row.value, 0);
  const female = selected
    .filter((row) => row.sex === "female")
    .reduce((sum, row) => sum + row.value, 0);

  const topBirthCountries = totalRows
    .filter(
      (row) =>
        row.birthCountry !== ITALY_BIRTH_COUNTRY_CODE &&
        row.birthCountry !== OTHER_COUNTRIES_CODE,
    )
    .map((row) => ({
      code: row.birthCountry,
      name: row.birthCountryLabel,
      total: row.value,
      male: valueFor(selected, row.birthCountry, "male"),
      female: valueFor(selected, row.birthCountry, "female"),
      shareOfBornAbroad:
        bornAbroad > 0 ? round((row.value / bornAbroad) * 100) : null,
    }))
    .sort(
      (left, right) =>
        right.total - left.total || left.name.localeCompare(right.name),
    )
    .slice(0, 10);

  const datasets = [
    ...new Set(
      selected
        .map((row) => row.sourceDataset)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  return {
    period,
    sourceStatus: statusForRows(selected),
    counts: {
      population,
      bornInItaly,
      bornAbroad,
      bornAbroadShare:
        population > 0 ? round((bornAbroad / population) * 100) : null,
      male,
      female,
    },
    topBirthCountries,
    quality: {
      sourceCountryTotal,
      independentPopulation,
      coverageDifference:
        independentPopulation === null
          ? null
          : sourceCountryTotal - independentPopulation,
    },
    sourceDataset: datasets.length
      ? datasets.join(" + ")
      : datasetForBirthCountryYear(Number(period)),
  };
}
