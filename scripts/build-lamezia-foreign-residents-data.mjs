import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  "artifacts/lamezia-trasparente/src/data/generated/lameziaForeignResidentsAgeSex.json",
);
const CACHE_DIR = path.join(REPO_ROOT, "data/raw/comune-lamezia-opendata");

const DATAPORTAL_API_BASE_URL = "https://dataportal.maggioli.cloud";
const COMUNE_OPENDATA_PORTAL_URL =
  "https://opendata.comune.lamezia-terme.cz.it";
const COMUNE_OPENDATA_HOME_URL =
  "https://opendata.comune.lamezia-terme.cz.it/it";
const COD_ENTE = "188067-opendata";
const ORGANIZATION = "comune-di-lamezia-terme";
const DATASET_ID = "fc9889e0-ea84-44b1-a95d-9c6c1fa7e115";
const EXPECTED_RESOURCE_ID = "55ffccd6-5ed9-4633-a592-53dab719620b";
const EXPECTED_COLUMNS = [
  "Anno",
  "Codice Provincia",
  "Provincia",
  "Codice Comune",
  "Comune",
  "Classe d'eta'",
  "Maschi",
  "Femmine",
];
const AGE_COLUMNS = [
  "year",
  "age_class",
  "male",
  "female",
  "total",
  "share_of_year",
  "age_group",
];
const USER_AGENT = "Lamezia-Trasparente-Monitor foreign residents builder";

async function main() {
  const detail = await fetchDatasetDetail();
  const csvResource = findCsvResource(detail);
  const sourceCsvUrl = new URL(
    csvResource.url,
    COMUNE_OPENDATA_PORTAL_URL,
  ).toString();
  const csvText = await fetchText(sourceCsvUrl);
  const records = parseForeignResidentsCsv(csvText);

  if (records.length === 0) {
    throw new Error("No foreign resident records were extracted.");
  }

  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path.join(CACHE_DIR, "stranieri-sesso-eta.csv"), csvText);
  await writeFile(
    path.join(CACHE_DIR, "stranieri-sesso-eta-detail.json"),
    `${JSON.stringify(detail, null, 2)}\n`,
  );

  const years = [...new Set(records.map((record) => record.year))].sort(
    (a, b) => a - b,
  );
  const latestYear = years[years.length - 1];
  const latestRecords = records.filter((record) => record.year === latestYear);
  const latestSummary = summarizeYear(latestRecords);

  const dataset = {
    schema_version: 1,
    metadata: {
      source: "Comune di Lamezia Terme - Portale OpenData",
      source_url: COMUNE_OPENDATA_HOME_URL,
      source_catalog_url: `${COMUNE_OPENDATA_HOME_URL}/page/catalogo`,
      source_api_url: buildDatasetDetailUrl(),
      source_csv_url: sourceCsvUrl,
      source_catalog_homepage:
        getExtraValue(detail, "source_catalog_homepage") ?? null,
      source_catalog_description:
        getExtraValue(detail, "source_catalog_description") ?? null,
      organization: ORGANIZATION,
      cod_ente: COD_ENTE,
      dataset_id: detail.id,
      dataset_name: detail.name,
      dataset_title: detail.title,
      resource_id: csvResource.id,
      resource_name: csvResource.name,
      resource_hash: csvResource.hash,
      holder_name: detail.holderName,
      holder_identifier: detail.holderIdentifier,
      publisher_name: detail.publisherName,
      publisher_identifier: detail.publisherIdentifier,
      license_title: detail.licenseTitle,
      license_id: detail.licenseId,
      license_type: csvResource.licenseType ?? null,
      frequency: detail.frequency,
      metadata_created: detail.metadataCreated,
      metadata_modified: detail.metadataModified,
      resource_last_modified: csvResource.lastModified,
      generated_at: new Date().toISOString(),
      first_year: years[0],
      latest_year: latestYear,
      years,
      rows: records.length,
      latest_total: latestSummary.total,
      latest_male_total: latestSummary.male,
      latest_female_total: latestSummary.female,
      latest_children_total: latestSummary.children,
      latest_working_age_total: latestSummary.workingAge,
      latest_senior_total: latestSummary.senior,
      update_policy:
        "Aggiornamento settimanale dal Portale OpenData del Comune di Lamezia Terme quando la risorsa CSV pubblica cambia.",
      caveat:
        "Distribuzione aggregata per sesso e classi d'eta pubblicata dal portale comunale: non contiene elenchi nominativi e non sostituisce una validazione statistica indipendente.",
    },
    age_columns: AGE_COLUMNS,
    age_rows: stringifyAgeRows(records),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`);
  console.log(
    `Wrote ${records.length} foreign resident age-sex records through ${latestYear} to ${path.relative(
      REPO_ROOT,
      OUTPUT_PATH,
    )}`,
  );
}

function buildDatasetDetailUrl() {
  const url = new URL(
    `/api/v1/mgg-od/datasets/detail/${DATASET_ID}`,
    DATAPORTAL_API_BASE_URL,
  );
  url.searchParams.set("cod-ente", COD_ENTE);
  url.searchParams.set("organizations", ORGANIZATION);
  return url.toString();
}

async function fetchDatasetDetail() {
  const detail = await fetchJson(buildDatasetDetailUrl());
  if (detail.id !== DATASET_ID) {
    throw new Error(`Unexpected dataset id: ${detail.id}`);
  }
  if (detail.organization?.name !== ORGANIZATION) {
    throw new Error(`Unexpected organization: ${detail.organization?.name}`);
  }
  if (detail.holderIdentifier !== "c_m208") {
    throw new Error(`Unexpected holder identifier: ${detail.holderIdentifier}`);
  }
  return detail;
}

function findCsvResource(detail) {
  const resource = (detail.resources ?? []).find(
    (item) =>
      item.id === EXPECTED_RESOURCE_ID &&
      item.format?.toUpperCase() === "CSV" &&
      typeof item.url === "string",
  );
  if (!resource) {
    throw new Error(
      "Expected foreign residents age-sex CSV resource was not found.",
    );
  }
  return resource;
}

function parseForeignResidentsCsv(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    throw new Error("Foreign residents CSV does not contain data rows.");
  }
  const header = rows[0].map((value) => value.trim());
  if (EXPECTED_COLUMNS.some((column, index) => header[index] !== column)) {
    throw new Error(
      `Unexpected foreign residents CSV header: ${header.join(", ")}`,
    );
  }

  const records = rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row) => {
      const year = toInteger(row[0], "Anno");
      const provinceCode = toInteger(row[1], "Codice Provincia");
      const municipalityCode = toInteger(row[3], "Codice Comune");
      const ageClass = String(row[5] ?? "").trim();
      if (provinceCode !== 79 || municipalityCode !== 79160) {
        throw new Error(
          `Unexpected territorial codes for age class ${ageClass}: ${provinceCode}/${municipalityCode}`,
        );
      }
      return {
        year,
        age_class: ageClass,
        male: toInteger(row[6], "Maschi"),
        female: toInteger(row[7], "Femmine"),
      };
    })
    .map((record) => ({
      ...record,
      total: record.male + record.female,
      age_group: classifyAgeGroup(record.age_class),
    }))
    .sort(
      (a, b) =>
        a.year - b.year ||
        ageSortValue(a.age_class) - ageSortValue(b.age_class),
    );

  const totalsByYear = new Map();
  for (const record of records) {
    totalsByYear.set(
      record.year,
      (totalsByYear.get(record.year) ?? 0) + record.total,
    );
  }

  return records.map((record) => ({
    ...record,
    share_of_year: roundFour(record.total / totalsByYear.get(record.year)),
  }));
}

function stringifyAgeRows(records) {
  return records
    .map((record) =>
      [
        record.year,
        record.age_class,
        record.male,
        record.female,
        record.total,
        record.share_of_year,
        record.age_group,
      ].join("|"),
    )
    .join("\n");
}

function summarizeYear(records) {
  return records.reduce(
    (summary, record) => ({
      total: summary.total + record.total,
      male: summary.male + record.male,
      female: summary.female + record.female,
      children:
        summary.children + (record.age_group === "0-14" ? record.total : 0),
      workingAge:
        summary.workingAge + (record.age_group === "15-64" ? record.total : 0),
      senior: summary.senior + (record.age_group === "65+" ? record.total : 0),
    }),
    {
      total: 0,
      male: 0,
      female: 0,
      children: 0,
      workingAge: 0,
      senior: 0,
    },
  );
}

function classifyAgeGroup(ageClass) {
  const start = ageSortValue(ageClass);
  if (start < 15) {
    return "0-14";
  }
  if (start < 65) {
    return "15-64";
  }
  return "65+";
}

function ageSortValue(ageClass) {
  const match = String(ageClass).match(/\d+/);
  if (!match) {
    throw new Error(`Invalid age class: ${ageClass}`);
  }
  return Number(match[0]);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function toInteger(value, label) {
  const normalized = String(value ?? "").trim();
  const number = Number(normalized);
  if (!Number.isInteger(number)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return number;
}

function roundFour(value) {
  return Number(value.toFixed(4));
}

function getExtraValue(detail, key) {
  return detail.extras?.find((extra) => extra.key === key)?.value;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Request failed for ${url}: ${response.status} ${response.statusText} ${text.slice(
        0,
        200,
      )}`,
    );
  }
  return JSON.parse(text);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/csv,*/*",
      "User-Agent": USER_AGENT,
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Request failed for ${url}: ${response.status} ${response.statusText} ${text.slice(
        0,
        200,
      )}`,
    );
  }
  return text;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
