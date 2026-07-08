import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  "artifacts/lamezia-trasparente/src/data/generated/lameziaFamiliesChildren.json",
);
const CACHE_DIR = path.join(REPO_ROOT, "data/raw/comune-lamezia-opendata");

const DATAPORTAL_API_BASE_URL = "https://dataportal.maggioli.cloud";
const COMUNE_OPENDATA_PORTAL_URL =
  "https://opendata.comune.lamezia-terme.cz.it";
const COMUNE_OPENDATA_HOME_URL =
  "https://opendata.comune.lamezia-terme.cz.it/it";
const COD_ENTE = "188067-opendata";
const ORGANIZATION = "comune-di-lamezia-terme";
const DATASET_ID = "bbd58e2a-af9f-41cb-bd32-f56410863eb4";
const EXPECTED_RESOURCE_ID = "c29d86df-a1ad-48f7-a702-1c74abcf2946";
const EXPECTED_COLUMNS = ["Numero Figli", "Famiglie"];
const FAMILY_CHILDREN_COLUMNS = [
  "children_count_label",
  "children_count_min",
  "families",
  "share_of_total",
  "cumulative_families",
];
const USER_AGENT = "Lamezia-Trasparente-Monitor families children builder";

async function main() {
  const detail = await fetchDatasetDetail();
  const csvResource = findCsvResource(detail);
  const sourceCsvUrl = new URL(
    csvResource.url,
    COMUNE_OPENDATA_PORTAL_URL,
  ).toString();
  const csvText = await fetchText(sourceCsvUrl);
  const records = parseFamiliesChildrenCsv(csvText);

  if (records.length === 0) {
    throw new Error("No family children records were extracted.");
  }

  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(
    path.join(CACHE_DIR, "famiglie-per-numero-figli.csv"),
    csvText,
  );
  await writeFile(
    path.join(CACHE_DIR, "famiglie-per-numero-figli-detail.json"),
    `${JSON.stringify(detail, null, 2)}\n`,
  );

  const totalFamilies = records.reduce(
    (sum, record) => sum + record.families,
    0,
  );
  let cumulativeFamilies = 0;
  const enrichedRecords = records.map((record) => {
    cumulativeFamilies += record.families;
    return {
      ...record,
      share_of_total: roundFour(record.families / totalFamilies),
      cumulative_families: cumulativeFamilies,
    };
  });
  const oneChild = enrichedRecords.find(
    (record) => record.children_count_min === 1,
  );
  const twoChildren = enrichedRecords.find(
    (record) => record.children_count_min === 2,
  );
  const threeOrMore = enrichedRecords
    .filter((record) => record.children_count_min >= 3)
    .reduce((sum, record) => sum + record.families, 0);

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
      rows: enrichedRecords.length,
      total_families_with_children: totalFamilies,
      one_child_families: oneChild?.families ?? 0,
      two_children_families: twoChildren?.families ?? 0,
      three_or_more_children_families: threeOrMore,
      update_policy:
        "Aggiornamento settimanale dal Portale OpenData del Comune di Lamezia Terme quando la risorsa CSV pubblica cambia.",
      caveat:
        "Distribuzione aggregata pubblicata dal portale comunale. Il CSV non espone l'anno di riferimento e non include esplicitamente le famiglie senza figli; la scheda rappresenta la risorsa corrente acquisita.",
    },
    family_children_columns: FAMILY_CHILDREN_COLUMNS,
    family_children_rows: stringifyFamilyChildrenRows(enrichedRecords),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`);
  console.log(
    `Wrote ${enrichedRecords.length} family children records to ${path.relative(
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
      "Expected families by children count CSV resource was not found.",
    );
  }
  return resource;
}

function parseFamiliesChildrenCsv(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    throw new Error(
      "Families by children count CSV does not contain data rows.",
    );
  }
  const header = rows[0].map((value) => value.trim());
  if (EXPECTED_COLUMNS.some((column, index) => header[index] !== column)) {
    throw new Error(
      `Unexpected families by children count CSV header: ${header.join(", ")}`,
    );
  }

  return rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row) => {
      const label = String(row[0] ?? "").trim();
      return {
        children_count_label: label,
        children_count_min: parseChildrenCountMin(label),
        families: toInteger(row[1], "Famiglie"),
      };
    })
    .sort((a, b) => a.children_count_min - b.children_count_min);
}

function stringifyFamilyChildrenRows(records) {
  return records
    .map((record) =>
      [
        record.children_count_label,
        record.children_count_min,
        record.families,
        record.share_of_total,
        record.cumulative_families,
      ].join("|"),
    )
    .join("\n");
}

function parseChildrenCountMin(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  const match = normalized.match(/\d+/);
  if (!match) {
    throw new Error(`Invalid children count label: ${value}`);
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
