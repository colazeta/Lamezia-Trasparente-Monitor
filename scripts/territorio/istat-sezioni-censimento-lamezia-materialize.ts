#!/usr/bin/env tsx
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

type DatasetRow = Record<string, string>;

interface DetectedColumns {
  municipality?: string;
  section?: string;
  municipalityName?: string;
}

interface JoinParts {
  municipalityCode?: string;
  sectionSuffix?: string;
  joinKey?: string;
  displaySectionId?: string;
}

interface GeoJsonFeature {
  type: "Feature";
  properties?: Record<string, unknown> | null;
  geometry?: unknown;
}

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

type GeoJsonPosition = [number, number];

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..", "..");
const LAMEZIA_COMUNE = "Lamezia Terme";
const LAMEZIA_ISTAT_CODE = "079160";
const geometryGeoJsonDefault = path.join(
  repoRoot,
  "data/raw/territorio/istat/basi_territoriali_2021_calabria/R18_21_WGS84_lamezia.geojson",
);
const variablesXlsxDefault = path.join(
  repoRoot,
  "data/raw/territorio/istat/censimento_2023_sezioni_calabria/R18_Calabria_2023_sezioni.xlsx",
);
const processedDirDefault = path.join(repoRoot, "data/processed/territorio");
const processedGeoJsonName = "istat_sezioni_censimento_lamezia.geojson";
const processedMetadataName = "istat_sezioni_censimento_lamezia.metadata.json";
const processedDictionaryName = "istat_indicator_dictionary.json";
const geometryZipUrl =
  "https://www.istat.it/storage/cartografia/basi_territoriali/2021/R18_21.zip";
const variablesZipUrl =
  "https://esploradati.istat.it/databrowser/DWL/PERMPOP/SUBCOM/Dati_regionali_2023.zip";
const preferredMunicipalAliases = new Set([
  "procom",
  "procomt",
  "procom2021",
  "codiceistatcomune",
  "istatcomune",
  "codistat",
]);
const municipalAliases = new Set([
  ...preferredMunicipalAliases,
  "codcom",
  "codcomune",
  "codicecomune",
]);
const sectionAliases = new Set([
  "sez",
  "sez21",
  "sez21id",
  "sezione",
  "sezione2021",
  "sezionecensimento",
  "codsez",
  "codsezione",
  "codicesezione",
  "idsezione",
]);
const municipalityNameAliases = new Set([
  "comune",
  "dencom",
  "denominazionecomune",
  "nomecomune",
  "comune2021",
]);
const populationTotalSourceColumn = "P1";
const populationTotalProperty = "popolazione_totale";
const webGeometryPrecision = 5;
const webGeometrySimplifyTolerance = 0.0003;

type EnabledIndicatorSpec = {
  id: string;
  label: string;
  category: string;
  sourceFields: string[];
  publicField: string;
  unit: "persone" | "percentuale" | "famiglie" | "abitazioni" | "automobili";
  numerator: string | string[];
  denominator: string | null;
  formula: string;
  interpretation: string;
  caveats: string[];
};

const sourceFieldDefinitions: Record<string, string> = {
  P1: "Popolazione residente - totale",
  P14: "Popolazione residente - eta' < 5 anni",
  P15: "Popolazione residente - eta' 5 - 9 anni",
  P16: "Popolazione residente - eta' 10 - 14 anni",
  P27: "Popolazione residente - eta' 65 - 69 anni",
  P28: "Popolazione residente - eta' 70 - 74 anni",
  P29: "Popolazione residente - eta' > 74 anni",
  ST1: "Stranieri e apolidi residenti in Italia - totale",
  PF1: "Famiglie residenti - totale",
  A8: "Abitazioni totali",
  NA1: "Automobili di proprieta'",
  P83: "Popolazione residente - totale di 9 anni e piu'",
  P90: "Popolazione residente - totale di 9 anni e piu' con titoli terziari di primo o secondo livello",
  P101: "Popolazione residente - totale occupati di 15-64 anni",
};

const enabledIndicatorSpecs: EnabledIndicatorSpec[] = [
  {
    id: "popolazione-residente",
    label: "Popolazione residente",
    category: "popolazione",
    sourceFields: ["P1"],
    publicField: populationTotalProperty,
    unit: "persone",
    numerator: "P1",
    denominator: null,
    formula: "P1",
    interpretation: "Numero di persone residenti nella sezione censuaria.",
    caveats: [
      "Le sezioni senza aggancio alle variabili ISTAT 2023 restano null.",
    ],
  },
  {
    id: "quota-0-14",
    label: "Quota 0-14 anni",
    category: "eta",
    sourceFields: ["P14", "P15", "P16", "P1"],
    publicField: "quota_0_14",
    unit: "percentuale",
    numerator: ["P14", "P15", "P16"],
    denominator: "P1",
    formula: "(P14 + P15 + P16) / P1 * 100",
    interpretation:
      "Quota di popolazione residente fino a 14 anni sul totale dei residenti.",
    caveats: [
      "Non e' una quota minori <18: il tracciato pubblica classi quinquennali e non isola 15-17 anni.",
      "Se P1 e' zero o mancante, la percentuale resta null.",
    ],
  },
  {
    id: "quota-anziani",
    label: "Quota 65 anni e piu'",
    category: "eta",
    sourceFields: ["P27", "P28", "P29", "P1"],
    publicField: "quota_65_piu",
    unit: "percentuale",
    numerator: ["P27", "P28", "P29"],
    denominator: "P1",
    formula: "(P27 + P28 + P29) / P1 * 100",
    interpretation:
      "Quota di popolazione residente di 65 anni e piu' sul totale dei residenti.",
    caveats: ["Se P1 e' zero o mancante, la percentuale resta null."],
  },
  {
    id: "quota-stranieri",
    label: "Quota residenti stranieri",
    category: "cittadinanza",
    sourceFields: ["ST1", "P1"],
    publicField: "quota_stranieri",
    unit: "percentuale",
    numerator: "ST1",
    denominator: "P1",
    formula: "ST1 / P1 * 100",
    interpretation:
      "Quota di stranieri e apolidi residenti sul totale della popolazione residente.",
    caveats: ["Se P1 e' zero o mancante, la percentuale resta null."],
  },
  {
    id: "famiglie",
    label: "Famiglie residenti",
    category: "famiglie",
    sourceFields: ["PF1"],
    publicField: "famiglie_totale",
    unit: "famiglie",
    numerator: "PF1",
    denominator: null,
    formula: "PF1",
    interpretation: "Numero di famiglie residenti nella sezione censuaria.",
    caveats: ["Non sostituisce dati catastali o anagrafici comunali."],
  },
  {
    id: "abitazioni",
    label: "Abitazioni totali",
    category: "abitazioni",
    sourceFields: ["A8"],
    publicField: "abitazioni_totali",
    unit: "abitazioni",
    numerator: "A8",
    denominator: null,
    formula: "A8",
    interpretation:
      "Numero totale di abitazioni secondo il tracciato ISTAT per sezione.",
    caveats: [
      "Non e' un dato catastale e non va letto come unita' immobiliare catastale.",
    ],
  },
  {
    id: "automobili",
    label: "Automobili",
    category: "mobilita-auto",
    sourceFields: ["NA1"],
    publicField: "automobili_totale",
    unit: "automobili",
    numerator: "NA1",
    denominator: null,
    formula: "NA1",
    interpretation:
      "Numero di automobili di proprieta' rilevate nel tracciato ISTAT.",
    caveats: ["Non introduce dati ACI, fiscali o altre fonti non ISTAT."],
  },
  {
    id: "quota-titoli-terziari",
    label: "Quota titoli terziari",
    category: "istruzione",
    sourceFields: ["P90", "P83"],
    publicField: "quota_titoli_terziari",
    unit: "percentuale",
    numerator: "P90",
    denominator: "P83",
    formula: "P90 / P83 * 100",
    interpretation:
      "Quota di residenti di 9 anni e piu' con titolo terziario sul totale dei residenti di 9 anni e piu'.",
    caveats: [
      "Il denominatore non e' P1 ma la popolazione residente di 9 anni e piu'.",
    ],
  },
  {
    id: "occupati-15-64",
    label: "Occupati 15-64 anni",
    category: "lavoro",
    sourceFields: ["P101"],
    publicField: "occupati_15_64",
    unit: "persone",
    numerator: "P101",
    denominator: null,
    formula: "P101",
    interpretation: "Numero di residenti occupati tra 15 e 64 anni.",
    caveats: ["E' un conteggio, non un tasso di occupazione."],
  },
];

const requiredIndicatorSourceFields = [
  ...new Set(
    enabledIndicatorSpecs.flatMap((indicator) => indicator.sourceFields),
  ),
];

function repoRelativePath(filePath: string): string {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function parseArgs(argv: string[]) {
  const options = {
    geometryGeoJsonPath: geometryGeoJsonDefault,
    variablesXlsxPath: variablesXlsxDefault,
    processedDir: processedDirDefault,
    includeFictitious: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--geometry-geojson") {
      if (!next) throw new Error("--geometry-geojson requires a path");
      options.geometryGeoJsonPath = path.resolve(next);
      index += 1;
    } else if (arg === "--variables-xlsx") {
      if (!next) throw new Error("--variables-xlsx requires a path");
      options.variablesXlsxPath = path.resolve(next);
      index += 1;
    } else if (arg === "--processed-dir") {
      if (!next) throw new Error("--processed-dir requires a path");
      options.processedDir = path.resolve(next);
      index += 1;
    } else if (arg === "--include-fictitious") {
      options.includeFictitious = true;
    } else if (arg === "--help") {
      console.log(
        [
          "Usage: tsx scripts/territorio/istat-sezioni-censimento-lamezia-materialize.ts [options]",
          "",
          "Options:",
          "  --geometry-geojson <path>  Official ISTAT Lamezia GeoJSON converted from R18_21.zip",
          "  --variables-xlsx <path>    Official ISTAT Calabria 2023 census-section workbook",
          "  --processed-dir <path>     Output directory",
          "  --include-fictitious       Keep ISTAT fictitious sections 888888x and 999999x",
        ].join("\n"),
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

async function verifyFile(filePath: string): Promise<void> {
  const file = await stat(filePath);
  if (!file.isFile() || file.size === 0)
    throw new Error(`Expected a non-empty file at ${filePath}`);
}

async function runCommand(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${command} ${args.join(" ")} failed${stderr.trim() ? `\n${stderr.trim()}` : ""}`,
          ),
        );
    });
  });
}

function decodeXml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseAttributes(rawAttributes: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /([\w:.-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawAttributes)) !== null)
    attributes[match[1]] = decodeXml(match[2]);
  return attributes;
}

function parseSharedStrings(xml: string): string[] {
  const values: string[] = [];
  const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let siMatch: RegExpExecArray | null;
  while ((siMatch = siRegex.exec(xml)) !== null) {
    const parts: string[] = [];
    const textRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let textMatch: RegExpExecArray | null;
    while ((textMatch = textRegex.exec(siMatch[1])) !== null)
      parts.push(decodeXml(textMatch[1]));
    values.push(parts.join(""));
  }
  return values;
}

function columnIndexFromCellRef(
  cellRef: string | undefined,
  fallback: number,
): number {
  const letters = cellRef?.match(/[A-Z]+/)?.[0];
  if (!letters) return fallback;
  let index = 0;
  for (const letter of letters)
    index = index * 26 + (letter.charCodeAt(0) - 64);
  return index - 1;
}

function parseCellValue(
  body: string,
  cellType: string | undefined,
  sharedStrings: string[],
): string {
  if (cellType === "inlineStr") {
    const parts: string[] = [];
    const textRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let textMatch: RegExpExecArray | null;
    while ((textMatch = textRegex.exec(body)) !== null)
      parts.push(decodeXml(textMatch[1]));
    return parts.join("");
  }
  const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
  if (value === undefined) return "";
  return cellType === "s"
    ? (sharedStrings[Number.parseInt(value, 10)] ?? "")
    : decodeXml(value);
}

function parseWorksheetRows(xml: string, sharedStrings: string[]): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(xml)) !== null) {
    const cells: string[] = [];
    const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
    let cellMatch: RegExpExecArray | null;
    let fallbackIndex = 0;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      const attrs = parseAttributes(cellMatch[1]);
      const columnIndex = columnIndexFromCellRef(attrs.r, fallbackIndex);
      cells[columnIndex] = parseCellValue(cellMatch[2], attrs.t, sharedStrings);
      fallbackIndex = columnIndex + 1;
    }
    rows.push(cells.map((cell) => cell ?? ""));
  }
  return rows;
}

async function readXlsxRows(xlsxPath: string): Promise<string[][]> {
  const tempDir = await mkdtemp(path.join(tmpdir(), "istat-xlsx-"));
  try {
    await runCommand("tar", ["-xf", xlsxPath, "-C", tempDir]);
    const workbookXml = await readFile(
      path.join(tempDir, "xl/workbook.xml"),
      "utf8",
    );
    const relsXml = await readFile(
      path.join(tempDir, "xl/_rels/workbook.xml.rels"),
      "utf8",
    );
    const relId = parseAttributes(
      workbookXml.match(/<sheet\b([^>]*)\/?>/)?.[1] ?? "",
    )["r:id"];
    if (!relId)
      throw new Error("No worksheet relationship found in workbook.xml");
    const relRegex = /<Relationship\b([^>]*)\/?>/g;
    let target = "";
    let relMatch: RegExpExecArray | null;
    while ((relMatch = relRegex.exec(relsXml)) !== null) {
      const attrs = parseAttributes(relMatch[1]);
      if (attrs.Id === relId) target = attrs.Target;
    }
    if (!target)
      throw new Error(`Worksheet relationship ${relId} was not found`);
    const sharedPath = path.join(tempDir, "xl/sharedStrings.xml");
    const sharedStrings = await readFile(sharedPath, "utf8")
      .then(parseSharedStrings)
      .catch(() => []);
    return parseWorksheetRows(
      await readFile(
        path.join(tempDir, "xl", target.replace(/^\/xl\//, "")),
        "utf8",
      ),
      sharedStrings,
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function findColumn(
  headers: string[],
  aliases: Set<string>,
): string | undefined {
  const exact = headers.find((header) => aliases.has(normalizeHeader(header)));
  if (exact) return exact;
  return headers.find((header) =>
    [...aliases].some((alias) => normalizeHeader(header).includes(alias)),
  );
}

export function detectColumns(headers: string[]): DetectedColumns {
  return {
    municipality:
      findColumn(headers, preferredMunicipalAliases) ??
      findColumn(headers, municipalAliases),
    section: findColumn(headers, sectionAliases),
    municipalityName: findColumn(headers, municipalityNameAliases),
  };
}

export function normalizeMunicipalityCode(value: unknown): string | undefined {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  return digits.padStart(6, "0").slice(-6);
}

function digitsOnly(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function normalizeSectionSuffix(
  value: unknown,
  municipalityCode?: string,
): string | undefined {
  const digits = digitsOnly(value);
  if (!digits) return undefined;
  const municipalityWithoutLeadingZero = municipalityCode?.replace(/^0+/, "");
  const suffix =
    municipalityCode &&
    digits.startsWith(municipalityCode) &&
    digits.length > municipalityCode.length
      ? digits.slice(municipalityCode.length)
      : municipalityWithoutLeadingZero &&
          digits.startsWith(municipalityWithoutLeadingZero) &&
          digits.length > municipalityWithoutLeadingZero.length
        ? digits.slice(municipalityWithoutLeadingZero.length)
        : digits;
  return suffix.replace(/^0+/, "") || "0";
}

export function classifyFictitiousSection(
  sectionValue: unknown,
  municipalityCode?: string,
): "senza_dimora" | "zona_in_contestazione" | undefined {
  const suffix = normalizeSectionSuffix(sectionValue, municipalityCode);
  if (!suffix) return undefined;
  if (/^888888\d$/.test(suffix)) return "senza_dimora";
  if (/^999999\d$/.test(suffix)) return "zona_in_contestazione";
  return undefined;
}

function valueLooksLikeLamezia(value: unknown): boolean {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes("lamezia terme");
}

export function buildJoinParts(
  row: DatasetRow,
  columns: DetectedColumns,
): JoinParts {
  const sectionValue = columns.section ? row[columns.section] : undefined;
  const municipalityCode =
    (columns.municipality
      ? normalizeMunicipalityCode(row[columns.municipality])
      : undefined) ??
    (digitsOnly(sectionValue).startsWith(LAMEZIA_ISTAT_CODE)
      ? LAMEZIA_ISTAT_CODE
      : undefined);
  const sectionSuffix = normalizeSectionSuffix(sectionValue, municipalityCode);
  return {
    municipalityCode,
    sectionSuffix,
    joinKey:
      municipalityCode && sectionSuffix
        ? `${municipalityCode}|${sectionSuffix}`
        : undefined,
    displaySectionId:
      municipalityCode && sectionSuffix
        ? `${municipalityCode}${sectionSuffix.padStart(7, "0")}`
        : undefined,
  };
}

function rowLooksLikeLamezia(
  row: DatasetRow,
  columns: DetectedColumns,
): boolean {
  const parts = buildJoinParts(row, columns);
  if (parts.municipalityCode === LAMEZIA_ISTAT_CODE) return true;
  if (
    columns.municipalityName &&
    valueLooksLikeLamezia(row[columns.municipalityName])
  )
    return true;
  return Object.values(row).some(valueLooksLikeLamezia);
}

function rowsToRecords(rows: string[][]): {
  headers: string[];
  records: DatasetRow[];
} {
  const headerIndex = rows.findIndex((row) => {
    const columns = detectColumns(row.map((cell) => cell.trim()));
    return Boolean(columns.section && (columns.municipality || row.length > 5));
  });
  const rawHeaders = rows[Math.max(headerIndex, 0)].map(
    (header, index) => header.trim() || `col_${index + 1}`,
  );
  const headers = rawHeaders.map((header, index) =>
    rawHeaders.indexOf(header) === index ? header : `${header}_${index + 1}`,
  );
  const records = rows
    .slice(Math.max(headerIndex, 0) + 1)
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) =>
      Object.fromEntries(
        headers.map((header, index) => [header, row[index]?.trim() ?? ""]),
      ),
    );
  return { headers, records };
}

function isIdentifierColumn(header: string, columns: DetectedColumns): boolean {
  if (
    header === columns.municipality ||
    header === columns.section ||
    header === columns.municipalityName
  )
    return true;
  const normalized = normalizeHeader(header);
  return (
    municipalAliases.has(normalized) ||
    sectionAliases.has(normalized) ||
    municipalityNameAliases.has(normalized) ||
    normalized.includes("regione") ||
    normalized.includes("provincia")
  );
}

export function chooseIndicatorColumns(
  headers: string[],
  rows: DatasetRow[],
  columns: DetectedColumns,
  maxIndicators: number,
): string[] {
  const sampledRows = rows.slice(0, 50);
  const candidates = headers.filter(
    (header) =>
      !isIdentifierColumn(header, columns) &&
      sampledRows.some((row) => row[header]?.trim()),
  );
  const preferred = candidates.filter((header) =>
    /^[A-Z]{1,4}\d+[A-Z0-9_]*$/.test(header.trim()),
  );
  return [
    ...preferred,
    ...candidates.filter((header) => !preferred.includes(header)),
  ].slice(0, maxIndicators);
}

function parseIndicatorValue(value: string): string | number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^[+-]?\d+(?:[.,]\d+)?$/.test(trimmed)
    ? Number(trimmed.replace(",", "."))
    : trimmed;
}

function parseNumericIndicatorValue(value: string | undefined): number | null {
  const parsed = parseIndicatorValue(value ?? "");
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

function roundIndicator(value: number): number {
  return Number(value.toFixed(2));
}

function getSourceValue(
  variables: DatasetRow | undefined,
  sourceColumnByField: Map<string, string>,
  sourceField: string,
): number | null {
  const column = sourceColumnByField.get(sourceField);
  return column ? parseNumericIndicatorValue(variables?.[column]) : null;
}

function sumSourceValues(
  variables: DatasetRow | undefined,
  sourceColumnByField: Map<string, string>,
  sourceFields: string[],
): number | null {
  let sum = 0;
  for (const sourceField of sourceFields) {
    const value = getSourceValue(variables, sourceColumnByField, sourceField);
    if (value === null) return null;
    sum += value;
  }
  return sum;
}

function percentage(
  numerator: number | null,
  denominator: number | null,
): number | null {
  if (numerator === null || denominator === null || denominator <= 0)
    return null;
  return roundIndicator((numerator / denominator) * 100);
}

function buildPublicIndicators(
  variables: DatasetRow | undefined,
  sourceColumnByField: Map<string, string>,
): Record<string, number | null> {
  const p1 = getSourceValue(variables, sourceColumnByField, "P1");
  const p0To14 = sumSourceValues(variables, sourceColumnByField, [
    "P14",
    "P15",
    "P16",
  ]);
  const p65Plus = sumSourceValues(variables, sourceColumnByField, [
    "P27",
    "P28",
    "P29",
  ]);
  const stranieri = getSourceValue(variables, sourceColumnByField, "ST1");
  const famiglie = getSourceValue(variables, sourceColumnByField, "PF1");
  const abitazioni = getSourceValue(variables, sourceColumnByField, "A8");
  const automobili = getSourceValue(variables, sourceColumnByField, "NA1");
  const popolazione9Piu = getSourceValue(variables, sourceColumnByField, "P83");
  const titoliTerziari = getSourceValue(variables, sourceColumnByField, "P90");
  const occupati = getSourceValue(variables, sourceColumnByField, "P101");

  return {
    p1,
    [populationTotalProperty]: p1,
    p14: getSourceValue(variables, sourceColumnByField, "P14"),
    p15: getSourceValue(variables, sourceColumnByField, "P15"),
    p16: getSourceValue(variables, sourceColumnByField, "P16"),
    p27: getSourceValue(variables, sourceColumnByField, "P27"),
    p28: getSourceValue(variables, sourceColumnByField, "P28"),
    p29: getSourceValue(variables, sourceColumnByField, "P29"),
    st1: stranieri,
    pf1: famiglie,
    a8: abitazioni,
    na1: automobili,
    p83: popolazione9Piu,
    p90: titoliTerziari,
    p101: occupati,
    popolazione_0_14: p0To14,
    quota_0_14: percentage(p0To14, p1),
    popolazione_65_piu: p65Plus,
    quota_65_piu: percentage(p65Plus, p1),
    stranieri_totale: stranieri,
    quota_stranieri: percentage(stranieri, p1),
    famiglie_totale: famiglie,
    abitazioni_totali: abitazioni,
    automobili_totale: automobili,
    popolazione_9_piu: popolazione9Piu,
    titoli_terziari: titoliTerziari,
    quota_titoli_terziari: percentage(titoliTerziari, popolazione9Piu),
    occupati_15_64: occupati,
  };
}

function buildIndicatorCoverage(
  outputFeatures: GeoJsonFeature[],
): Record<
  string,
  { availableCount: number; nullCount: number; zeroCount: number }
> {
  const coverage: Record<
    string,
    { availableCount: number; nullCount: number; zeroCount: number }
  > = {};
  for (const indicator of enabledIndicatorSpecs) {
    coverage[indicator.id] = { availableCount: 0, nullCount: 0, zeroCount: 0 };
  }

  for (const feature of outputFeatures) {
    const indicators = (feature.properties?.indicators_istat_2023 ??
      {}) as Record<string, unknown>;
    for (const indicator of enabledIndicatorSpecs) {
      const value = indicators[indicator.publicField];
      if (typeof value === "number" && Number.isFinite(value)) {
        coverage[indicator.id].availableCount += 1;
        if (value === 0) coverage[indicator.id].zeroCount += 1;
      } else {
        coverage[indicator.id].nullCount += 1;
      }
    }
  }

  return coverage;
}

function safePropertyName(header: string): string {
  return normalizeHeader(header) || "indicatore";
}

function roundWebPosition(position: GeoJsonPosition): GeoJsonPosition {
  return [
    Number(position[0].toFixed(webGeometryPrecision)),
    Number(position[1].toFixed(webGeometryPrecision)),
  ];
}

function squaredSegmentDistance(
  point: GeoJsonPosition,
  start: GeoJsonPosition,
  end: GeoJsonPosition,
): number {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = end;
    else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyWebRing(points: GeoJsonPosition[]): GeoJsonPosition[] {
  if (points.length <= 4) return points.map(roundWebPosition);
  const closed =
    points[0][0] === points[points.length - 1][0] &&
    points[0][1] === points[points.length - 1][1];
  const source = closed ? points.slice(0, -1) : points;
  const keep = new Uint8Array(source.length);
  keep[0] = 1;
  keep[source.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, source.length - 1]];
  const tolerance = webGeometrySimplifyTolerance * webGeometrySimplifyTolerance;
  while (stack.length > 0) {
    const [first, last] = stack.pop() as [number, number];
    let maxDistance = tolerance;
    let index = 0;
    for (let current = first + 1; current < last; current += 1) {
      const distance = squaredSegmentDistance(
        source[current],
        source[first],
        source[last],
      );
      if (distance > maxDistance) {
        index = current;
        maxDistance = distance;
      }
    }
    if (index > 0) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  const simplified = source
    .filter((_, index) => keep[index] === 1)
    .map(roundWebPosition);
  if (closed) simplified.push(simplified[0]);
  return simplified.length >= 4 ? simplified : points.map(roundWebPosition);
}

function simplifyGeometryForWeb(geometry: unknown): unknown {
  const candidate = geometry as { type?: string; coordinates?: unknown };
  if (candidate?.type === "Polygon" && Array.isArray(candidate.coordinates)) {
    return {
      type: "Polygon",
      coordinates: (candidate.coordinates as GeoJsonPosition[][]).map(
        simplifyWebRing,
      ),
    };
  }
  if (
    candidate?.type === "MultiPolygon" &&
    Array.isArray(candidate.coordinates)
  ) {
    return {
      type: "MultiPolygon",
      coordinates: (candidate.coordinates as GeoJsonPosition[][][]).map(
        (polygon) => polygon.map(simplifyWebRing),
      ),
    };
  }
  return geometry;
}

function isFeatureCollection(
  value: unknown,
): value is GeoJsonFeatureCollection {
  return Boolean(
    value &&
    typeof value === "object" &&
    (value as GeoJsonFeatureCollection).type === "FeatureCollection" &&
    Array.isArray((value as GeoJsonFeatureCollection).features),
  );
}

function featureProperties(feature: GeoJsonFeature): DatasetRow {
  return Object.fromEntries(
    Object.entries(feature.properties ?? {}).map(([key, value]) => [
      key,
      String(value ?? ""),
    ]),
  );
}

export async function materialize(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(argv);
  await verifyFile(options.geometryGeoJsonPath);
  await verifyFile(options.variablesXlsxPath);

  const variableRows = rowsToRecords(
    await readXlsxRows(options.variablesXlsxPath),
  );
  const variableColumns = detectColumns(variableRows.headers);
  if (!variableColumns.section)
    throw new Error("Could not identify ISTAT 2023 census-section key");
  const lameziaVariableRows = variableRows.records.filter((row) =>
    rowLooksLikeLamezia(row, variableColumns),
  );
  const sourceColumnByField = new Map(
    requiredIndicatorSourceFields.flatMap((sourceField) => {
      const column = variableRows.headers.find(
        (header) => safePropertyName(header) === sourceField.toLowerCase(),
      );
      return column ? [[sourceField, column] as const] : [];
    }),
  );
  const missingRequiredSourceFields = requiredIndicatorSourceFields.filter(
    (sourceField) => !sourceColumnByField.has(sourceField),
  );
  const indicatorColumns = requiredIndicatorSourceFields
    .map((sourceField) => sourceColumnByField.get(sourceField))
    .filter((column): column is string => Boolean(column));
  const variableMap = new Map<string, DatasetRow>();
  let variableFictitiousRows = 0;
  for (const row of lameziaVariableRows) {
    const parts = buildJoinParts(row, variableColumns);
    const fictitiousType = classifyFictitiousSection(
      variableColumns.section
        ? row[variableColumns.section]
        : parts.sectionSuffix,
      parts.municipalityCode,
    );
    if (fictitiousType) variableFictitiousRows += 1;
    if (parts.joinKey && (!fictitiousType || options.includeFictitious))
      variableMap.set(parts.joinKey, row);
  }

  const parsedGeoJson: unknown = JSON.parse(
    await readFile(options.geometryGeoJsonPath, "utf8"),
  );
  if (!isFeatureCollection(parsedGeoJson))
    throw new Error("Expected a GeoJSON FeatureCollection for ISTAT geometry");
  const geometryHeaders = Object.keys(
    parsedGeoJson.features.find((feature) => feature.properties)?.properties ??
      {},
  );
  const geometryColumns = detectColumns(geometryHeaders);
  if (!geometryColumns.section)
    throw new Error("Could not identify ISTAT geometry census-section key");

  const outputFeatures: GeoJsonFeature[] = [];
  let matchedVariables = 0;
  let missingVariables = 0;
  let skippedNonLamezia = 0;
  let skippedFictitious = 0;
  for (const feature of parsedGeoJson.features) {
    const sourceProperties = featureProperties(feature);
    if (!rowLooksLikeLamezia(sourceProperties, geometryColumns)) {
      skippedNonLamezia += 1;
      continue;
    }
    const parts = buildJoinParts(sourceProperties, geometryColumns);
    const sectionValue = geometryColumns.section
      ? sourceProperties[geometryColumns.section]
      : parts.sectionSuffix;
    const fictitiousType = classifyFictitiousSection(
      sectionValue,
      parts.municipalityCode,
    );
    if (fictitiousType && !options.includeFictitious) {
      skippedFictitious += 1;
      continue;
    }
    const variables = parts.joinKey
      ? variableMap.get(parts.joinKey)
      : undefined;
    if (variables) matchedVariables += 1;
    else missingVariables += 1;
    const indicators = buildPublicIndicators(variables, sourceColumnByField);
    outputFeatures.push({
      type: "Feature",
      geometry: simplifyGeometryForWeb(feature.geometry),
      properties: {
        sezione_censimento_id: parts.displaySectionId ?? sectionValue ?? null,
        istat_municipal_code: LAMEZIA_ISTAT_CODE,
        municipality: LAMEZIA_COMUNE,
        matched_istat_2023_variables: Boolean(variables),
        indicators_istat_2023: indicators,
      },
    });
  }
  if (outputFeatures.length === 0)
    throw new Error("No Lamezia Terme census-section features were produced");

  await mkdir(options.processedDir, { recursive: true });
  const processedGeoJsonPath = path.join(
    options.processedDir,
    processedGeoJsonName,
  );
  const processedMetadataPath = path.join(
    options.processedDir,
    processedMetadataName,
  );
  const processedDictionaryPath = path.join(
    options.processedDir,
    processedDictionaryName,
  );
  const processingDate = new Date().toISOString();
  const indicatorCoverage = buildIndicatorCoverage(outputFeatures);
  const enabledIndicators = enabledIndicatorSpecs.map((indicator) => ({
    id: indicator.id,
    label: indicator.label,
    category: indicator.category,
    sourceFields: indicator.sourceFields,
    publicField: indicator.publicField,
    unit: indicator.unit,
    formula: indicator.formula,
  }));
  const publicMetadata = {
    datasetStatus: "official",
    publicLabel: "Dato ufficiale ISTAT per sezione censuaria",
    sourceInstitution: "ISTAT",
    sourceDataset:
      "Basi territoriali 2021 e dati per sezioni di censimento 2023",
    sourceYear: "geometrie 2021, indicatori 2023",
    territorialLevel: "sezione di censimento",
    municipality: LAMEZIA_COMUNE,
    istatMunicipalCode: LAMEZIA_ISTAT_CODE,
    processingDate,
    verificationStatus:
      missingRequiredSourceFields.length === 0
        ? `Processato da fonti ufficiali ISTAT; ${enabledIndicatorSpecs.length} indicatori pubblici validati contro il tracciato 2023 per ${matchedVariables} sezioni su ${outputFeatures.length}.`
        : `Processato da fonti ufficiali ISTAT; campi mancanti nel workbook: ${missingRequiredSourceFields.join(", ")}.`,
    knownLimits: [
      "Le sezioni fittizie ISTAT 888888x e 999999x sono escluse dall'output pubblico predefinito.",
      `Il file ISTAT 2023 aggancia variabili a ${matchedVariables} sezioni su ${outputFeatures.length}; le sezioni rimanenti restano geometrie ufficiali senza valore indicatore.`,
      `Le geometrie pubbliche sono generalizzate per la mappa web con precisione ${webGeometryPrecision} decimali e tolleranza ${webGeometrySimplifyTolerance} gradi; i raw ISTAT restano la fonte di dettaglio.`,
      "La quota 0-14 anni non e' una quota minori <18: il tracciato ISTAT non isola 15-17 anni.",
      "Le percentuali restano null quando il denominatore e' nullo, zero o mancante.",
      "Le sezioni urbane catastali Zornade non sono sezioni censuarie e non sono usate come base di questa mappa.",
    ],
  };
  await writeFile(
    `${processedGeoJsonPath}.tmp`,
    JSON.stringify({
      type: "FeatureCollection",
      metadata: publicMetadata,
      features: outputFeatures,
    }),
    "utf8",
  );
  await rename(`${processedGeoJsonPath}.tmp`, processedGeoJsonPath);

  const metadata = {
    id: "istat-sezioni-censimento-lamezia",
    ...publicMetadata,
    source: "ISTAT",
    sourceDatasetDetails: {
      geometries: "Basi territoriali 2021 - Calabria, sezioni di censimento",
      variables:
        "Dati per sezioni di censimento - Censimento permanente della popolazione e delle abitazioni 2023",
    },
    sourceYearDetails: { geometries: 2021, variables: 2023 },
    sourcePages: {
      geometries:
        "https://www.istat.it/notizia/basi-territoriali-e-variabili-censuarie/",
      variables: "https://www.istat.it/notizia/dati-per-sezioni-di-censimento/",
      legalNotes: "https://www.istat.it/note-legali/",
    },
    downloadUrls: { geometryZipUrl, variablesZipUrl },
    licence: "CC BY 4.0 unless otherwise indicated by ISTAT",
    publicMapRole: "primary census-section base for Atlante territoriale",
    warning:
      "Non usare per indicatori censuari ISTAT dati catastali, OMI, CAP, fiscali o comunali non nativi delle sezioni censuarie.",
    inputs: {
      geometryGeoJsonPath: repoRelativePath(options.geometryGeoJsonPath),
      variablesXlsxPath: repoRelativePath(options.variablesXlsxPath),
      geometrySourceUrl: geometryZipUrl,
      variablesSourceUrl: variablesZipUrl,
    },
    counts: {
      outputFeatures: outputFeatures.length,
      matchedVariables,
      missingVariables,
      skippedNonLamezia,
      skippedFictitious,
      variableRowsForLamezia: lameziaVariableRows.length,
      variableFictitiousRows,
    },
    webGeometry: {
      precisionDecimals: webGeometryPrecision,
      simplifyToleranceDegrees: webGeometrySimplifyTolerance,
    },
    indicatorColumns,
    missingRequiredSourceFields,
    enabledIndicators,
    qa: {
      reportPath: "docs/data-sources/istat-sezioni-censimento-lamezia-qa.md",
      indicatorDictionaryPath: repoRelativePath(processedDictionaryPath),
      indicatorCoverage,
      populationValueCoverage: {
        totalFeatures: outputFeatures.length,
        availableCount:
          indicatorCoverage["popolazione-residente"]?.availableCount ?? 0,
        availableShare: roundIndicator(
          (indicatorCoverage["popolazione-residente"]?.availableCount ?? 0) /
            outputFeatures.length,
        ),
        nullCount:
          indicatorCoverage["popolazione-residente"]?.nullCount ??
          outputFeatures.length,
        nullShare: roundIndicator(
          (indicatorCoverage["popolazione-residente"]?.nullCount ??
            outputFeatures.length) / outputFeatures.length,
        ),
        zeroCount: indicatorCoverage["popolazione-residente"]?.zeroCount ?? 0,
      },
    },
    outputPath: repoRelativePath(processedGeoJsonPath),
  };
  await writeFile(
    `${processedMetadataPath}.tmp`,
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );
  await rename(`${processedMetadataPath}.tmp`, processedMetadataPath);

  const dictionary = {
    $schema:
      "https://lamezia-trasparente.local/schemas/istat_indicator_dictionary.schema.json",
    id: "istat-atlante-indicator-dictionary-lamezia",
    sourceInstitution: "ISTAT",
    sourceDataset:
      "Dati per sezioni di censimento - Censimento permanente della popolazione e delle abitazioni 2023",
    sourceYear: "2023",
    territorialLevel: "sezione di censimento",
    municipality: LAMEZIA_COMUNE,
    istatMunicipalCode: LAMEZIA_ISTAT_CODE,
    generatedFrom: repoRelativePath(processedGeoJsonPath),
    metadataPath: repoRelativePath(processedMetadataPath),
    qaReportPath: "docs/data-sources/istat-sezioni-censimento-lamezia-qa.md",
    lastUpdated: processingDate.slice(0, 10),
    verificationStatus:
      "Indicatori pubblici abilitati solo se derivati da campi presenti nel tracciato ufficiale ISTAT 2023.",
    indicators: enabledIndicatorSpecs.map((indicator) => ({
      id: indicator.id,
      istatSourceField: indicator.sourceFields.join(" + "),
      istatSourceDefinitions: Object.fromEntries(
        indicator.sourceFields.map((field) => [
          field,
          sourceFieldDefinitions[field] ?? field,
        ]),
      ),
      publicField: indicator.publicField,
      publicLabel: indicator.label,
      category: indicator.category,
      unitOfMeasure: indicator.unit,
      numerator: indicator.numerator,
      denominator: indicator.denominator,
      formula: indicator.formula,
      enabled: missingRequiredSourceFields.length === 0,
      status:
        missingRequiredSourceFields.length === 0
          ? "enabled"
          : "missing-source-fields",
      sourceYear: "2023",
      territorialLevel: "sezione di censimento",
      missingnessCount:
        indicatorCoverage[indicator.id]?.nullCount ?? outputFeatures.length,
      publicInterpretation: indicator.interpretation,
      knownCaveats: [
        ...indicator.caveats,
        "I valori null non sono zero e sono mostrati come dato non disponibile.",
        "Le sezioni censuarie non coincidono con sezioni urbane catastali, CAP, OMI o altre zonizzazioni non censuarie.",
      ],
    })),
    disabledCandidates: [
      {
        id: "quota-minori",
        publicLabel: "Quota minori (<18)",
        category: "eta",
        enabled: false,
        status: "not-directly-available",
        reason:
          "Il tracciato ISTAT 2023 disponibile espone classi quinquennali e non isola 15-17 anni.",
      },
    ],
  };
  await writeFile(
    `${processedDictionaryPath}.tmp`,
    `${JSON.stringify(dictionary, null, 2)}\n`,
    "utf8",
  );
  await rename(`${processedDictionaryPath}.tmp`, processedDictionaryPath);
  await verifyFile(processedGeoJsonPath);
  await verifyFile(processedMetadataPath);
  await verifyFile(processedDictionaryPath);
}

if (path.resolve(process.argv[1] ?? "") === scriptPath) {
  materialize().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
