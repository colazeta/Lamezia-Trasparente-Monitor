#!/usr/bin/env tsx
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
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
const geometryZipUrl = "https://www.istat.it/storage/cartografia/basi_territoriali/2021/R18_21.zip";
const variablesZipUrl = "https://esploradati.istat.it/databrowser/DWL/PERMPOP/SUBCOM/Dati_regionali_2023.zip";
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
      console.log([
        "Usage: tsx scripts/territorio/istat-sezioni-censimento-lamezia-materialize.ts [options]",
        "",
        "Options:",
        "  --geometry-geojson <path>  Official ISTAT Lamezia GeoJSON converted from R18_21.zip",
        "  --variables-xlsx <path>    Official ISTAT Calabria 2023 census-section workbook",
        "  --processed-dir <path>     Output directory",
        "  --include-fictitious       Keep ISTAT fictitious sections 888888x and 999999x",
      ].join("\n"));
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

async function verifyFile(filePath: string): Promise<void> {
  const file = await stat(filePath);
  if (!file.isFile() || file.size === 0) throw new Error(`Expected a non-empty file at ${filePath}`);
}

async function runCommand(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8"); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed${stderr.trim() ? `\n${stderr.trim()}` : ""}`));
    });
  });
}

function decodeXml(value: string): string {
  return value.replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function parseAttributes(rawAttributes: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /([\w:.-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawAttributes)) !== null) attributes[match[1]] = decodeXml(match[2]);
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
    while ((textMatch = textRegex.exec(siMatch[1])) !== null) parts.push(decodeXml(textMatch[1]));
    values.push(parts.join(""));
  }
  return values;
}

function columnIndexFromCellRef(cellRef: string | undefined, fallback: number): number {
  const letters = cellRef?.match(/[A-Z]+/)?.[0];
  if (!letters) return fallback;
  let index = 0;
  for (const letter of letters) index = index * 26 + (letter.charCodeAt(0) - 64);
  return index - 1;
}

function parseCellValue(body: string, cellType: string | undefined, sharedStrings: string[]): string {
  if (cellType === "inlineStr") {
    const parts: string[] = [];
    const textRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let textMatch: RegExpExecArray | null;
    while ((textMatch = textRegex.exec(body)) !== null) parts.push(decodeXml(textMatch[1]));
    return parts.join("");
  }
  const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
  if (value === undefined) return "";
  return cellType === "s" ? sharedStrings[Number.parseInt(value, 10)] ?? "" : decodeXml(value);
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
    const workbookXml = await readFile(path.join(tempDir, "xl/workbook.xml"), "utf8");
    const relsXml = await readFile(path.join(tempDir, "xl/_rels/workbook.xml.rels"), "utf8");
    const relId = parseAttributes(workbookXml.match(/<sheet\b([^>]*)\/?>/)?.[1] ?? "")["r:id"];
    if (!relId) throw new Error("No worksheet relationship found in workbook.xml");
    const relRegex = /<Relationship\b([^>]*)\/?>/g;
    let target = "";
    let relMatch: RegExpExecArray | null;
    while ((relMatch = relRegex.exec(relsXml)) !== null) {
      const attrs = parseAttributes(relMatch[1]);
      if (attrs.Id === relId) target = attrs.Target;
    }
    if (!target) throw new Error(`Worksheet relationship ${relId} was not found`);
    const sharedPath = path.join(tempDir, "xl/sharedStrings.xml");
    const sharedStrings = await readFile(sharedPath, "utf8").then(parseSharedStrings).catch(() => []);
    return parseWorksheetRows(await readFile(path.join(tempDir, "xl", target.replace(/^\/xl\//, "")), "utf8"), sharedStrings);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function normalizeHeader(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function findColumn(headers: string[], aliases: Set<string>): string | undefined {
  const exact = headers.find((header) => aliases.has(normalizeHeader(header)));
  if (exact) return exact;
  return headers.find((header) => [...aliases].some((alias) => normalizeHeader(header).includes(alias)));
}

export function detectColumns(headers: string[]): DetectedColumns {
  return {
    municipality: findColumn(headers, preferredMunicipalAliases) ?? findColumn(headers, municipalAliases),
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

export function normalizeSectionSuffix(value: unknown, municipalityCode?: string): string | undefined {
  const digits = digitsOnly(value);
  if (!digits) return undefined;
  const municipalityWithoutLeadingZero = municipalityCode?.replace(/^0+/, "");
  const suffix =
    municipalityCode && digits.startsWith(municipalityCode) && digits.length > municipalityCode.length ? digits.slice(municipalityCode.length) :
    municipalityWithoutLeadingZero && digits.startsWith(municipalityWithoutLeadingZero) && digits.length > municipalityWithoutLeadingZero.length ? digits.slice(municipalityWithoutLeadingZero.length) :
    digits;
  return suffix.replace(/^0+/, "") || "0";
}

export function classifyFictitiousSection(sectionValue: unknown, municipalityCode?: string): "senza_dimora" | "zona_in_contestazione" | undefined {
  const suffix = normalizeSectionSuffix(sectionValue, municipalityCode);
  if (!suffix) return undefined;
  if (/^888888\d$/.test(suffix)) return "senza_dimora";
  if (/^999999\d$/.test(suffix)) return "zona_in_contestazione";
  return undefined;
}

function valueLooksLikeLamezia(value: unknown): boolean {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes("lamezia terme");
}

export function buildJoinParts(row: DatasetRow, columns: DetectedColumns): JoinParts {
  const sectionValue = columns.section ? row[columns.section] : undefined;
  const municipalityCode =
    (columns.municipality ? normalizeMunicipalityCode(row[columns.municipality]) : undefined) ??
    (digitsOnly(sectionValue).startsWith(LAMEZIA_ISTAT_CODE) ? LAMEZIA_ISTAT_CODE : undefined);
  const sectionSuffix = normalizeSectionSuffix(sectionValue, municipalityCode);
  return {
    municipalityCode,
    sectionSuffix,
    joinKey: municipalityCode && sectionSuffix ? `${municipalityCode}|${sectionSuffix}` : undefined,
    displaySectionId: municipalityCode && sectionSuffix ? `${municipalityCode}${sectionSuffix.padStart(7, "0")}` : undefined,
  };
}

function rowLooksLikeLamezia(row: DatasetRow, columns: DetectedColumns): boolean {
  const parts = buildJoinParts(row, columns);
  if (parts.municipalityCode === LAMEZIA_ISTAT_CODE) return true;
  if (columns.municipalityName && valueLooksLikeLamezia(row[columns.municipalityName])) return true;
  return Object.values(row).some(valueLooksLikeLamezia);
}

function rowsToRecords(rows: string[][]): { headers: string[]; records: DatasetRow[] } {
  const headerIndex = rows.findIndex((row) => {
    const columns = detectColumns(row.map((cell) => cell.trim()));
    return Boolean(columns.section && (columns.municipality || row.length > 5));
  });
  const rawHeaders = rows[Math.max(headerIndex, 0)].map((header, index) => header.trim() || `col_${index + 1}`);
  const headers = rawHeaders.map((header, index) => rawHeaders.indexOf(header) === index ? header : `${header}_${index + 1}`);
  const records = rows.slice(Math.max(headerIndex, 0) + 1).filter((row) => row.some((cell) => cell.trim())).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() ?? ""])));
  return { headers, records };
}

function isIdentifierColumn(header: string, columns: DetectedColumns): boolean {
  if (header === columns.municipality || header === columns.section || header === columns.municipalityName) return true;
  const normalized = normalizeHeader(header);
  return municipalAliases.has(normalized) || sectionAliases.has(normalized) || municipalityNameAliases.has(normalized) || normalized.includes("regione") || normalized.includes("provincia");
}

export function chooseIndicatorColumns(headers: string[], rows: DatasetRow[], columns: DetectedColumns, maxIndicators: number): string[] {
  const sampledRows = rows.slice(0, 50);
  const candidates = headers.filter((header) => !isIdentifierColumn(header, columns) && sampledRows.some((row) => row[header]?.trim()));
  const preferred = candidates.filter((header) => /^[A-Z]{1,4}\d+[A-Z0-9_]*$/.test(header.trim()));
  return [...preferred, ...candidates.filter((header) => !preferred.includes(header))].slice(0, maxIndicators);
}

function parseIndicatorValue(value: string): string | number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^[+-]?\d+(?:[.,]\d+)?$/.test(trimmed) ? Number(trimmed.replace(",", ".")) : trimmed;
}

function safePropertyName(header: string): string {
  return normalizeHeader(header) || "indicatore";
}

function roundWebPosition(position: GeoJsonPosition): GeoJsonPosition {
  return [Number(position[0].toFixed(webGeometryPrecision)), Number(position[1].toFixed(webGeometryPrecision))];
}

function squaredSegmentDistance(point: GeoJsonPosition, start: GeoJsonPosition, end: GeoJsonPosition): number {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = end;
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyWebRing(points: GeoJsonPosition[]): GeoJsonPosition[] {
  if (points.length <= 4) return points.map(roundWebPosition);
  const closed = points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length - 1][1];
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
      const distance = squaredSegmentDistance(source[current], source[first], source[last]);
      if (distance > maxDistance) { index = current; maxDistance = distance; }
    }
    if (index > 0) { keep[index] = 1; stack.push([first, index], [index, last]); }
  }
  const simplified = source.filter((_, index) => keep[index] === 1).map(roundWebPosition);
  if (closed) simplified.push(simplified[0]);
  return simplified.length >= 4 ? simplified : points.map(roundWebPosition);
}

function simplifyGeometryForWeb(geometry: unknown): unknown {
  const candidate = geometry as { type?: string; coordinates?: unknown };
  if (candidate?.type === "Polygon" && Array.isArray(candidate.coordinates)) {
    return { type: "Polygon", coordinates: (candidate.coordinates as GeoJsonPosition[][]).map(simplifyWebRing) };
  }
  if (candidate?.type === "MultiPolygon" && Array.isArray(candidate.coordinates)) {
    return { type: "MultiPolygon", coordinates: (candidate.coordinates as GeoJsonPosition[][][]).map((polygon) => polygon.map(simplifyWebRing)) };
  }
  return geometry;
}

function isFeatureCollection(value: unknown): value is GeoJsonFeatureCollection {
  return Boolean(value && typeof value === "object" && (value as GeoJsonFeatureCollection).type === "FeatureCollection" && Array.isArray((value as GeoJsonFeatureCollection).features));
}

function featureProperties(feature: GeoJsonFeature): DatasetRow {
  return Object.fromEntries(Object.entries(feature.properties ?? {}).map(([key, value]) => [key, String(value ?? "")]));
}

export async function materialize(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(argv);
  await verifyFile(options.geometryGeoJsonPath);
  await verifyFile(options.variablesXlsxPath);

  const variableRows = rowsToRecords(await readXlsxRows(options.variablesXlsxPath));
  const variableColumns = detectColumns(variableRows.headers);
  if (!variableColumns.section) throw new Error("Could not identify ISTAT 2023 census-section key");
  const lameziaVariableRows = variableRows.records.filter((row) => rowLooksLikeLamezia(row, variableColumns));
  const indicatorColumns = chooseIndicatorColumns(variableRows.headers, lameziaVariableRows, variableColumns, 40);
  const populationTotalColumn = indicatorColumns.find((column) => safePropertyName(column) === populationTotalSourceColumn.toLowerCase());
  const variableMap = new Map<string, DatasetRow>();
  let variableFictitiousRows = 0;
  for (const row of lameziaVariableRows) {
    const parts = buildJoinParts(row, variableColumns);
    const fictitiousType = classifyFictitiousSection(variableColumns.section ? row[variableColumns.section] : parts.sectionSuffix, parts.municipalityCode);
    if (fictitiousType) variableFictitiousRows += 1;
    if (parts.joinKey && (!fictitiousType || options.includeFictitious)) variableMap.set(parts.joinKey, row);
  }

  const parsedGeoJson: unknown = JSON.parse(await readFile(options.geometryGeoJsonPath, "utf8"));
  if (!isFeatureCollection(parsedGeoJson)) throw new Error("Expected a GeoJSON FeatureCollection for ISTAT geometry");
  const geometryHeaders = Object.keys(parsedGeoJson.features.find((feature) => feature.properties)?.properties ?? {});
  const geometryColumns = detectColumns(geometryHeaders);
  if (!geometryColumns.section) throw new Error("Could not identify ISTAT geometry census-section key");

  const outputFeatures: GeoJsonFeature[] = [];
  let matchedVariables = 0;
  let missingVariables = 0;
  let skippedNonLamezia = 0;
  let skippedFictitious = 0;
  for (const feature of parsedGeoJson.features) {
    const sourceProperties = featureProperties(feature);
    if (!rowLooksLikeLamezia(sourceProperties, geometryColumns)) { skippedNonLamezia += 1; continue; }
    const parts = buildJoinParts(sourceProperties, geometryColumns);
    const sectionValue = geometryColumns.section ? sourceProperties[geometryColumns.section] : parts.sectionSuffix;
    const fictitiousType = classifyFictitiousSection(sectionValue, parts.municipalityCode);
    if (fictitiousType && !options.includeFictitious) { skippedFictitious += 1; continue; }
    const variables = parts.joinKey ? variableMap.get(parts.joinKey) : undefined;
    if (variables) matchedVariables += 1;
    else missingVariables += 1;
    const value = populationTotalColumn ? parseIndicatorValue(variables?.[populationTotalColumn] ?? "") : null;
    outputFeatures.push({
      type: "Feature",
      geometry: simplifyGeometryForWeb(feature.geometry),
      properties: {
        sezione_censimento_id: parts.displaySectionId ?? sectionValue ?? null,
        istat_municipal_code: LAMEZIA_ISTAT_CODE,
        municipality: LAMEZIA_COMUNE,
        matched_istat_2023_variables: Boolean(variables),
        indicators_istat_2023: populationTotalColumn
          ? { [safePropertyName(populationTotalColumn)]: value, [populationTotalProperty]: value }
          : {},
      },
    });
  }
  if (outputFeatures.length === 0) throw new Error("No Lamezia Terme census-section features were produced");

  await mkdir(options.processedDir, { recursive: true });
  const processedGeoJsonPath = path.join(options.processedDir, processedGeoJsonName);
  const processedMetadataPath = path.join(options.processedDir, processedMetadataName);
  const processingDate = new Date().toISOString();
  const publicMetadata = {
    datasetStatus: "official",
    publicLabel: "Dato ufficiale ISTAT per sezione censuaria",
    sourceInstitution: "ISTAT",
    sourceDataset: "Basi territoriali 2021 e dati per sezioni di censimento 2023",
    sourceYear: "geometrie 2021, indicatori 2023",
    territorialLevel: "sezione di censimento",
    municipality: LAMEZIA_COMUNE,
    istatMunicipalCode: LAMEZIA_ISTAT_CODE,
    processingDate,
    verificationStatus: populationTotalColumn
      ? `Processato da fonti ufficiali ISTAT; indicatore popolazione validato sul campo ${populationTotalColumn} per ${matchedVariables} sezioni su ${outputFeatures.length}.`
      : "Processato da fonti ufficiali ISTAT; nessun indicatore pubblico ancora validato.",
    knownLimits: [
      "Le sezioni fittizie ISTAT 888888x e 999999x sono escluse dall'output pubblico predefinito.",
      `Il file ISTAT 2023 aggancia variabili a ${matchedVariables} sezioni su ${outputFeatures.length}; le sezioni rimanenti restano geometrie ufficiali senza valore indicatore.`,
      `Le geometrie pubbliche sono generalizzate per la mappa web con precisione ${webGeometryPrecision} decimali e tolleranza ${webGeometrySimplifyTolerance} gradi; i raw ISTAT restano la fonte di dettaglio.`,
      "Gli indicatori diversi dalla popolazione residente restano in preparazione finche' non viene controllato il tracciato ISTAT.",
      "Le sezioni urbane catastali Zornade non sono sezioni censuarie e non sono usate come base di questa mappa.",
    ],
  };
  await writeFile(`${processedGeoJsonPath}.tmp`, JSON.stringify({ type: "FeatureCollection", metadata: publicMetadata, features: outputFeatures }), "utf8");
  await rename(`${processedGeoJsonPath}.tmp`, processedGeoJsonPath);

  const metadata = {
    id: "istat-sezioni-censimento-lamezia",
    ...publicMetadata,
    source: "ISTAT",
    sourceDatasetDetails: {
      geometries: "Basi territoriali 2021 - Calabria, sezioni di censimento",
      variables: "Dati per sezioni di censimento - Censimento permanente della popolazione e delle abitazioni 2023",
    },
    sourceYearDetails: { geometries: 2021, variables: 2023 },
    sourcePages: {
      geometries: "https://www.istat.it/notizia/basi-territoriali-e-variabili-censuarie/",
      variables: "https://www.istat.it/notizia/dati-per-sezioni-di-censimento/",
      legalNotes: "https://www.istat.it/note-legali/",
    },
    downloadUrls: { geometryZipUrl, variablesZipUrl },
    licence: "CC BY 4.0 unless otherwise indicated by ISTAT",
    publicMapRole: "primary census-section base for Atlante territoriale",
    warning: "Non usare per indicatori censuari ISTAT dati catastali, OMI, CAP, fiscali o comunali non nativi delle sezioni censuarie.",
    inputs: {
      geometryGeoJsonPath: repoRelativePath(options.geometryGeoJsonPath),
      variablesXlsxPath: repoRelativePath(options.variablesXlsxPath),
      geometrySourceUrl: geometryZipUrl,
      variablesSourceUrl: variablesZipUrl,
    },
    counts: { outputFeatures: outputFeatures.length, matchedVariables, missingVariables, skippedNonLamezia, skippedFictitious, variableRowsForLamezia: lameziaVariableRows.length, variableFictitiousRows },
    webGeometry: { precisionDecimals: webGeometryPrecision, simplifyToleranceDegrees: webGeometrySimplifyTolerance },
    indicatorColumns,
    enabledIndicators: populationTotalColumn ? [{ id: "popolazione-residente", label: "Popolazione residente", category: "popolazione", sourceField: populationTotalColumn, publicField: populationTotalProperty, unit: "persone" }] : [],
    outputPath: repoRelativePath(processedGeoJsonPath),
  };
  await writeFile(`${processedMetadataPath}.tmp`, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  await rename(`${processedMetadataPath}.tmp`, processedMetadataPath);
  await verifyFile(processedGeoJsonPath);
  await verifyFile(processedMetadataPath);
}

if (path.resolve(process.argv[1] ?? "") === scriptPath) {
  materialize().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
