import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  "artifacts/lamezia-trasparente/src/data/generated/lameziaDemographicTrend.json",
);
const CACHE_DIR = path.join(REPO_ROOT, "data/raw/comune-lamezia-opendata");

const DATAPORTAL_API_BASE_URL = "https://dataportal.maggioli.cloud";
const COMUNE_OPENDATA_PORTAL_URL =
  "https://opendata.comune.lamezia-terme.cz.it";
const COMUNE_OPENDATA_HOME_URL =
  "https://opendata.comune.lamezia-terme.cz.it/it";
const COD_ENTE = "188067-opendata";
const ORGANIZATION = "comune-di-lamezia-terme";
const DATASET_ID = "be119781-22b5-4883-ae4e-7f299546c2b7";
const EXPECTED_RESOURCE_ID = "634c5b42-1bd4-43bd-ac0a-6fb9ace5f3e9";
const EXPECTED_COLUMNS = ["Indice", "Anno", "Popolazione residente"];
const ANNUAL_COLUMNS = [
  "index",
  "year",
  "population_resident",
  "delta_abs",
  "delta_pct",
];
const USER_AGENT = "Lamezia-Trasparente-Monitor demographic data builder";

async function main() {
  const detail = await fetchDatasetDetail();
  const csvResource = findCsvResource(detail);
  const sourceCsvUrl = new URL(
    csvResource.url,
    COMUNE_OPENDATA_PORTAL_URL,
  ).toString();
  const csvText = await fetchText(sourceCsvUrl);
  const records = parseDemographicTrendCsv(csvText);

  if (records.length === 0) {
    throw new Error("No demographic trend records were extracted.");
  }

  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path.join(CACHE_DIR, "trend-demografico.csv"), csvText);
  await writeFile(
    path.join(CACHE_DIR, "trend-demografico-detail.json"),
    `${JSON.stringify(detail, null, 2)}\n`,
  );

  const latest = records[records.length - 1];
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
      first_year: records[0].year,
      latest_year: latest.year,
      rows: records.length,
      update_policy:
        "Aggiornamento settimanale dal Portale OpenData del Comune di Lamezia Terme quando la risorsa CSV pubblica cambia.",
      caveat:
        "Serie aggregata pubblicata dal portale comunale: rappresenta la popolazione residente indicata nel dataset OpenData, non una ricostruzione indipendente del dato ISTAT o censuario.",
    },
    annual_columns: ANNUAL_COLUMNS,
    annual_rows: stringifyAnnualRows(records),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`);
  console.log(
    `Wrote ${records.length} demographic trend records through ${latest.year} to ${path.relative(
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
    throw new Error("Expected demographic trend CSV resource was not found.");
  }
  return resource;
}

function parseDemographicTrendCsv(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    throw new Error("Demographic trend CSV does not contain data rows.");
  }
  const header = rows[0].map((value) => value.trim());
  if (EXPECTED_COLUMNS.some((column, index) => header[index] !== column)) {
    throw new Error(
      `Unexpected demographic trend CSV header: ${header.join(", ")}`,
    );
  }

  const records = rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row) => ({
      index: toInteger(row[0], "Indice"),
      year: toInteger(row[1], "Anno"),
      population_resident: toInteger(row[2], "Popolazione residente"),
    }))
    .sort((a, b) => a.year - b.year);

  for (let index = 0; index < records.length; index += 1) {
    const previous = records[index - 1];
    const current = records[index];
    if (previous && current.year <= previous.year) {
      throw new Error(`Demographic trend years are not strictly increasing.`);
    }
    current.delta_abs = previous
      ? current.population_resident - previous.population_resident
      : null;
    current.delta_pct =
      previous && previous.population_resident > 0
        ? roundFour(current.delta_abs / previous.population_resident)
        : null;
  }

  return records;
}

function stringifyAnnualRows(records) {
  return records
    .map((record) =>
      [
        record.index,
        record.year,
        record.population_resident,
        record.delta_abs ?? "",
        record.delta_pct ?? "",
      ].join("|"),
    )
    .join("\n");
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
