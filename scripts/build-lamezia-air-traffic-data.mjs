import { inflateRawSync } from "node:zlib";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  "artifacts/lamezia-trasparente/src/data/generated/lameziaAirTrafficMonthly.json",
);
const CACHE_DIR = path.join(
  REPO_ROOT,
  "data/raw/air-traffic/assaeroporti",
);

const START_YEAR = 2000;
const AIRPORT_NAME = "Lamezia Terme";
const SOURCE_PORTAL_URL = "https://assaeroporti.com/dati-di-traffico/";
const SOURCE_DOWNLOAD_BASE_URL =
  "https://data-upload.assaeroporti.com/download-export";
const USER_AGENT = "Lamezia-Trasparente-Monitor data builder";
const MONTHLY_COLUMNS = [
  "month",
  "year",
  "month_number",
  "rank",
  "movements_total",
  "movements_total_yoy_pct",
  "passengers_national",
  "passengers_international",
  "passengers_direct_transits",
  "passengers_total",
  "passengers_total_yoy_pct",
  "cargo_tons_total",
  "cargo_tons_total_yoy_pct",
];

async function main() {
  const latestPeriod = await getLatestAvailablePeriod();
  await mkdir(CACHE_DIR, { recursive: true });

  const records = [];
  const sourceFiles = [];
  const periods = buildPeriodList(START_YEAR, latestPeriod);

  for (const period of periods) {
    const workbook = await getWorkbook(period);
    if (!workbook) {
      continue;
    }

    const record = extractLameziaRecord(workbook, period);
    if (record) {
      records.push(record);
      sourceFiles.push({
        period: period.id,
        url: sourceUrlForPeriod(period),
      });
    }
  }

  if (records.length === 0) {
    throw new Error("No Lamezia Terme air traffic records were extracted.");
  }

  const latestRecord = records[records.length - 1];
  const generatedAt = new Date().toISOString();

  const dataset = {
    schema_version: 3,
    metadata: {
      source: "Assaeroporti - Dati di traffico aeroportuale",
      source_url: SOURCE_PORTAL_URL,
      source_download_base_url: SOURCE_DOWNLOAD_BASE_URL,
      airport_name: AIRPORT_NAME,
      airport_iata: "SUF",
      airport_city: "Lamezia Terme",
      generated_at: generatedAt,
      first_month: records[0].month,
      latest_complete_month: latestRecord.month,
      months: records.length,
      update_policy:
        "Aggiornamento mensile quando Assaeroporti pubblica un nuovo file Excel di traffico aeroportuale.",
      licence_or_terms_note:
        "Dato riusato da file pubblici Assaeroporti; verificare le condizioni del sito sorgente prima di redistribuzioni esterne.",
      caveat:
        "La fonte misura traffico aeroportuale mensile dello scalo, non soli arrivi a Lamezia Terme: passeggeri e movimenti sono conteggi complessivi di aeroporto secondo le tabelle Assaeroporti.",
      source_file_url_template:
        "https://data-upload.assaeroporti.com/download-export/{year}/{month}",
      source_period_start: sourceFiles[0].period,
      source_period_end: sourceFiles[sourceFiles.length - 1].period,
    },
    monthly_columns: MONTHLY_COLUMNS,
    monthly_rows: stringifyMonthlyRows(records),
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(dataset)}\n`);
  console.log(
    `Wrote ${records.length} monthly air traffic records through ${latestRecord.month} to ${path.relative(
      REPO_ROOT,
      OUTPUT_PATH,
    )}`,
  );
}

function compactMonthlyRecords(records) {
  return records.map((record) => [
    record.month,
    record.year,
    record.month_number,
    record.rank,
    record.movements.total,
    record.movements.total_yoy_pct,
    record.passengers.national,
    record.passengers.international,
    record.passengers.direct_transits,
    record.passengers.total,
    record.passengers.total_yoy_pct,
    record.cargo_tons.total,
    record.cargo_tons.total_yoy_pct,
  ]);
}

function stringifyMonthlyRows(records) {
  return compactMonthlyRecords(records)
    .map((row) => row.map((value) => value ?? "").join("|"))
    .join("\n");
}

async function getLatestAvailablePeriod() {
  const html = await fetchText(SOURCE_PORTAL_URL);
  const match = html.match(/download-export\/(\d{4})\/(\d{1,2})/);
  if (!match) {
    throw new Error("Unable to find latest Assaeroporti export link.");
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    id: `${match[1]}-${match[2].padStart(2, "0")}`,
  };
}

function buildPeriodList(startYear, latestPeriod) {
  const periods = [];
  for (let year = startYear; year <= latestPeriod.year; year += 1) {
    const maxMonth = year === latestPeriod.year ? latestPeriod.month : 12;
    for (let month = 1; month <= maxMonth; month += 1) {
      periods.push({
        year,
        month,
        id: `${year}-${String(month).padStart(2, "0")}`,
      });
    }
  }
  return periods;
}

async function getWorkbook(period) {
  const cachePath = path.join(CACHE_DIR, `${period.id}.xlsx`);
  const cached = await readCachedWorkbook(cachePath);
  if (cached) {
    return parseWorkbook(cached);
  }

  const url = sourceUrlForPeriod(period);
  try {
    const body = await fetchBinary(url);
    if (body.length < 1000) {
      console.warn(`Skipping ${period.id}: response too small`);
      return null;
    }
    await writeFile(cachePath, body);
    return parseWorkbook(body);
  } catch (error) {
    console.warn(`Skipping ${period.id}: ${error.message}`);
    return null;
  }
}

async function readCachedWorkbook(cachePath) {
  try {
    const fileStat = await stat(cachePath);
    if (fileStat.size > 1000) {
      return readFile(cachePath);
    }
  } catch {
    return null;
  }
  return null;
}

function sourceUrlForPeriod(period) {
  return `${SOURCE_DOWNLOAD_BASE_URL}/${period.year}/${period.month}`;
}

function extractLameziaRecord(workbook, period) {
  const totals = findAirportRow(workbook, "Totali Mese");
  const movements = findAirportRow(workbook, "Movimenti Mese");
  const passengers = findAirportRow(workbook, "Passeggeri Mese");
  const cargo = findAirportRow(workbook, "Cargo Mese");

  if (!totals || !movements || !passengers || !cargo) {
    return null;
  }

  return {
    month: period.id,
    year: period.year,
    month_number: period.month,
    rank: toNumber(totals[0]),
    movements: {
      total: toNumber(movements[12]),
      total_yoy_pct: toPercent(movements[13]),
    },
    passengers: {
      national: toNumber(passengers[2]),
      international: toNumber(passengers[4]),
      direct_transits: toNumber(passengers[8]),
      total: toNumber(passengers[14]),
      total_yoy_pct: toPercent(passengers[15]),
    },
    cargo_tons: {
      total: toNumber(cargo[10]),
      total_yoy_pct: toPercent(cargo[11]),
    },
  };
}

function findAirportRow(workbook, sheetName) {
  const rows = workbook.sheets.get(sheetName);
  if (!rows) {
    return null;
  }

  return (
    rows.find((row) =>
      row.some((value) => typeof value === "string" && value === AIRPORT_NAME),
    ) ?? null
  );
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".")
    .toLowerCase();
  if (!normalized || normalized === "n/a") {
    return null;
  }
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function toPercent(value) {
  const number = toNumber(value);
  return number === null ? null : roundFour(number / 100);
}

function roundFour(value) {
  return Number(value.toFixed(4));
}

function parseWorkbook(buffer) {
  const entries = readZipEntries(buffer);
  const sharedStrings = parseSharedStrings(
    entries.get("xl/sharedStrings.xml") ?? "",
  );
  const sheetMap = parseWorkbookSheetMap(
    entries.get("xl/workbook.xml") ?? "",
    entries.get("xl/_rels/workbook.xml.rels") ?? "",
  );
  const sheets = new Map();

  for (const [sheetName, sheetPath] of sheetMap.entries()) {
    const xml = entries.get(sheetPath);
    if (xml) {
      sheets.set(sheetName, parseSheetRows(xml, sharedStrings));
    }
  }

  return { sheets };
}

function readZipEntries(buffer) {
  const entries = new Map();
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  let offset = centralDirectoryOffset;
  const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize;

  while (offset < centralDirectoryEnd) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Invalid XLSX central directory.");
    }

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer
      .subarray(offset + 46, offset + 46 + nameLength)
      .toString("utf8");

    const dataStart = getLocalFileDataStart(buffer, localHeaderOffset);
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    const content =
      compressionMethod === 0
        ? compressed
        : compressionMethod === 8
          ? inflateRawSync(compressed)
          : null;

    if (content) {
      entries.set(name, content.toString("utf8"));
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(buffer) {
  const minOffset = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }
  throw new Error("Invalid XLSX file: end of central directory not found.");
}

function getLocalFileDataStart(buffer, offset) {
  if (buffer.readUInt32LE(offset) !== 0x04034b50) {
    throw new Error("Invalid XLSX local file header.");
  }
  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  return offset + 30 + nameLength + extraLength;
}

function parseSharedStrings(xml) {
  if (!xml) {
    return [];
  }
  return Array.from(xml.matchAll(/<si\b[\s\S]*?<\/si>/g), ([si]) =>
    Array.from(si.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g), ([, value]) =>
      decodeXml(value),
    ).join(""),
  );
}

function parseWorkbookSheetMap(workbookXml, relsXml) {
  const relationships = new Map();
  for (const [, id, target] of relsXml.matchAll(
    /<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g,
  )) {
    relationships.set(id, `xl/${target.replace(/^\/?xl\//, "")}`);
  }

  const sheets = new Map();
  for (const [, name, id] of workbookXml.matchAll(
    /<sheet\b[^>]*name="([^"]+)"[^>]*(?:r:id|id)="([^"]+)"/g,
  )) {
    const target = relationships.get(id);
    if (target) {
      sheets.set(decodeXml(name), target);
    }
  }

  return sheets;
}

function parseSheetRows(xml, sharedStrings) {
  const rows = [];
  for (const [, rowXml] of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const match of rowXml.matchAll(
      /<c\b([^>]*)\/>|<c\b([^>]*)>([\s\S]*?)<\/c>/g,
    )) {
      const attributes = match[1] ?? match[2] ?? "";
      const cellRef = attributes.match(/\br="([A-Z]+)\d+"/)?.[1];
      if (!cellRef) {
        continue;
      }
      row[columnRefToIndex(cellRef)] = parseCellValue(
        attributes,
        match[3] ?? "",
        sharedStrings,
      );
    }
    rows.push(row);
  }
  return rows;
}

function parseCellValue(attributes, cellXml, sharedStrings) {
  if (/\bt="s"/.test(attributes)) {
    const index = Number((cellXml.match(/<v>([\s\S]*?)<\/v>/) ?? [])[1]);
    return sharedStrings[index] ?? "";
  }
  if (/\bt="inlineStr"/.test(attributes)) {
    return Array.from(
      cellXml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g),
      ([, value]) => decodeXml(value),
    ).join("");
  }

  const value = (cellXml.match(/<v>([\s\S]*?)<\/v>/) ?? [])[1];
  if (value === undefined) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : decodeXml(value);
}

function columnRefToIndex(ref) {
  let index = 0;
  for (const char of ref) {
    index = index * 26 + (char.charCodeAt(0) - 64);
  }
  return index - 1;
}

function decodeXml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function fetchText(url) {
  return fetchUrl(url, "utf8");
}

function fetchBinary(url) {
  return fetchUrl(url, null);
}

function fetchUrl(url, encoding) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
      },
      (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();
          fetchUrl(new URL(response.headers.location, url).toString(), encoding)
            .then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks);
          resolve(encoding ? body.toString(encoding) : body);
        });
      },
    );
    request.on("error", reject);
    request.end();
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
