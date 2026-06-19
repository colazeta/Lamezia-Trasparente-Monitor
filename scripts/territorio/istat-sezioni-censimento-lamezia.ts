#!/usr/bin/env tsx
import { createWriteStream } from 'node:fs';
import { access, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

type DatasetRow = Record<string, string>;

interface CliOptions {
  download: boolean;
  extract: boolean;
  convertGeometry: boolean;
  prepare: boolean;
  force: boolean;
  includeFictitious: boolean;
  maxIndicators: number;
  geometryRawDir: string;
  variablesRawDir: string;
  processedDir: string;
  geometryGeoJsonPath?: string;
  variablesXlsxPath?: string;
}

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
  type: 'Feature';
  properties?: Record<string, unknown> | null;
  geometry?: unknown;
  [key: string]: unknown;
}

interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
  [key: string]: unknown;
}

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), '..', '..');
const LAMEZIA_COMUNE = 'Lamezia Terme';
const LAMEZIA_ISTAT_CODE = '079160';
const geometryZipUrl = 'https://www.istat.it/storage/cartografia/basi_territoriali/2021/R18_21.zip';
const variablesZipUrl = 'https://esploradati.istat.it/databrowser/DWL/PERMPOP/SUBCOM/Dati_regionali_2023.zip';
const geometryZipName = 'R18_21.zip';
const variablesZipName = 'Dati_regionali_2023.zip';
const variablesWorkbookName = 'R18_Calabria_2023_sezioni.xlsx';
const geometryGeoJsonName = 'R18_21_WGS84_lamezia.geojson';
const processedGeoJsonName = 'istat_sezioni_censimento_lamezia.geojson';
const processedMetadataName = 'istat_sezioni_censimento_lamezia.metadata.json';
const geometryRawDirDefault = path.join(repoRoot, 'data', 'raw', 'territorio', 'istat', 'basi_territoriali_2021_calabria');
const variablesRawDirDefault = path.join(repoRoot, 'data', 'raw', 'territorio', 'istat', 'censimento_2023_sezioni_calabria');
const processedDirDefault = path.join(repoRoot, 'data', 'processed', 'territorio');
const geometryEntries = ['SHP/R18_21_WGS84.shp', 'SHP/R18_21_WGS84.dbf', 'SHP/R18_21_WGS84.shx', 'SHP/R18_21_WGS84.prj'];
const variablesWorkbookEntry = 'Dati_regionali_2023/R18_Calabria_2023_sezioni.xlsx';
const municipalAliases = new Set(['procom', 'procomt', 'procom2021', 'codcom', 'codcomune', 'codicecomune', 'codiceistatcomune', 'istatcomune', 'codistat']);
const sectionAliases = new Set(['sez', 'sez21', 'sezione', 'sezione2021', 'sezionecensimento', 'codsez', 'codsezione', 'codicesezione', 'idsezione']);
const municipalityNameAliases = new Set(['comune', 'dencom', 'denominazionecomune', 'nomecomune', 'comune2021']);

function usage(): string {
  return [
    'Usage: tsx scripts/territorio/istat-sezioni-censimento-lamezia.ts [options]',
    '',
    'Options:',
    '  --download                       Download the official ISTAT source ZIPs',
    '  --extract                        Extract Calabria workbook and shapefile support files',
    '  --convert-geometry               Convert the extracted shapefile to WGS84 GeoJSON with ogr2ogr',
    '  --prepare                        Join Lamezia geometries and variables into processed GeoJSON',
    '  --geometry-geojson <path>         Use an already converted official ISTAT GeoJSON',
    '  --variables-xlsx <path>           Use an already extracted ISTAT Calabria workbook',
    '  --geometry-raw-dir <path>         Override geometry raw directory',
    '  --variables-raw-dir <path>        Override variables raw directory',
    '  --processed-dir <path>            Override processed output directory',
    '  --max-indicators <number>         Maximum variable columns copied into each feature (default: 40)',
    '  --include-fictitious             Keep ISTAT fictitious sections 888888x and 999999x',
    '  --force                          Redownload, re-extract or overwrite generated outputs',
    '  --help                           Show this help',
  ].join('\n');
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    download: false,
    extract: false,
    convertGeometry: false,
    prepare: false,
    force: false,
    includeFictitious: false,
    maxIndicators: 40,
    geometryRawDir: geometryRawDirDefault,
    variablesRawDir: variablesRawDirDefault,
    processedDir: processedDirDefault,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--help') {
      console.log(usage());
      process.exit(0);
    }
    if (arg === '--download') options.download = true;
    else if (arg === '--extract') options.extract = true;
    else if (arg === '--convert-geometry') {
      options.convertGeometry = true;
      options.extract = true;
    } else if (arg === '--prepare') options.prepare = true;
    else if (arg === '--include-fictitious') options.includeFictitious = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--geometry-geojson') {
      if (!next) throw new Error('--geometry-geojson requires a path');
      options.geometryGeoJsonPath = path.resolve(next);
      index += 1;
    } else if (arg === '--variables-xlsx') {
      if (!next) throw new Error('--variables-xlsx requires a path');
      options.variablesXlsxPath = path.resolve(next);
      index += 1;
    } else if (arg === '--geometry-raw-dir') {
      if (!next) throw new Error('--geometry-raw-dir requires a path');
      options.geometryRawDir = path.resolve(next);
      index += 1;
    } else if (arg === '--variables-raw-dir') {
      if (!next) throw new Error('--variables-raw-dir requires a path');
      options.variablesRawDir = path.resolve(next);
      index += 1;
    } else if (arg === '--processed-dir') {
      if (!next) throw new Error('--processed-dir requires a path');
      options.processedDir = path.resolve(next);
      index += 1;
    } else if (arg === '--max-indicators') {
      if (!next) throw new Error('--max-indicators requires a number');
      const parsed = Number.parseInt(next, 10);
      if (!Number.isFinite(parsed) || parsed < 1) throw new Error('--max-indicators must be a positive integer');
      options.maxIndicators = parsed;
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
    }
  }
  return options;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatBytes(bytes: number): string {
  const mib = bytes / 1024 / 1024;
  return `${bytes.toLocaleString('en-US')} bytes (${mib.toFixed(1)} MiB)`;
}

async function verifyFile(filePath: string): Promise<void> {
  const file = await stat(filePath);
  if (!file.isFile() || file.size === 0) throw new Error(`Expected a non-empty file at ${filePath}`);
  console.log(`Verified ${filePath} (${formatBytes(file.size)})`);
}

async function downloadFile(url: string, targetPath: string, force: boolean): Promise<void> {
  await mkdir(path.dirname(targetPath), { recursive: true });
  if (!force && (await exists(targetPath))) {
    const current = await stat(targetPath);
    console.log(`Using existing ${targetPath} (${formatBytes(current.size)})`);
    return;
  }
  const tmpPath = `${targetPath}.tmp`;
  await rm(tmpPath, { force: true });
  const response = await fetch(url, { headers: { 'user-agent': 'Lamezia Trasparente Monitor ISTAT ETL' } });
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  if (!response.body) throw new Error('Download failed: response body is empty');
  await pipeline(Readable.fromWeb(response.body as unknown as ReadableStream<Uint8Array>), createWriteStream(tmpPath));
  const downloaded = await stat(tmpPath);
  if (downloaded.size === 0) throw new Error('Download failed: downloaded file is empty');
  await rename(tmpPath, targetPath);
  console.log(`Saved ${targetPath} (${formatBytes(downloaded.size)})`);
}

async function runCommand(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8'); });
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8'); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        if (stdout.trim()) console.log(stdout.trim());
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 'unknown'}${stderr.trim() ? `\n${stderr.trim()}` : ''}`));
    });
  });
}

async function extractZipEntry(zipPath: string, entryName: string, targetPath: string, force: boolean): Promise<void> {
  if (!force && (await exists(targetPath))) {
    await verifyFile(targetPath);
    return;
  }
  const tempDir = await mkdtemp(path.join(tmpdir(), 'istat-zip-'));
  try {
    await runCommand('tar', ['-xf', zipPath, '-C', tempDir, entryName]);
    const extractedPath = path.join(tempDir, ...entryName.split('/'));
    await mkdir(path.dirname(targetPath), { recursive: true });
    await rm(targetPath, { force: true });
    await rename(extractedPath, targetPath);
    await verifyFile(targetPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function extractSources(options: CliOptions): Promise<void> {
  const geometryZipPath = path.join(options.geometryRawDir, geometryZipName);
  const variablesZipPath = path.join(options.variablesRawDir, variablesZipName);
  await verifyFile(geometryZipPath);
  await verifyFile(variablesZipPath);
  for (const entryName of geometryEntries) {
    await extractZipEntry(geometryZipPath, entryName, path.join(options.geometryRawDir, 'extracted', ...entryName.split('/')), options.force);
  }
  await extractZipEntry(variablesZipPath, variablesWorkbookEntry, path.join(options.variablesRawDir, variablesWorkbookName), options.force);
}

async function convertGeometry(options: CliOptions): Promise<string> {
  const sourceShpPath = path.join(options.geometryRawDir, 'extracted', 'SHP', 'R18_21_WGS84.shp');
  const geoJsonPath = options.geometryGeoJsonPath ?? path.join(options.geometryRawDir, geometryGeoJsonName);
  await verifyFile(sourceShpPath);
  await mkdir(path.dirname(geoJsonPath), { recursive: true });
  if (options.force) await rm(geoJsonPath, { force: true });
  if (!options.force && (await exists(geoJsonPath))) {
    await verifyFile(geoJsonPath);
    return geoJsonPath;
  }
  await runCommand('ogr2ogr', ['-f', 'GeoJSON', '-t_srs', 'EPSG:4326', geoJsonPath, sourceShpPath]);
  await verifyFile(geoJsonPath);
  return geoJsonPath;
}

function decodeXml(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
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
    values.push(parts.join(''));
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
  if (cellType === 'inlineStr') {
    const parts: string[] = [];
    const textRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let textMatch: RegExpExecArray | null;
    while ((textMatch = textRegex.exec(body)) !== null) parts.push(decodeXml(textMatch[1]));
    return parts.join('');
  }
  const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
  if (value === undefined) return '';
  if (cellType === 's') return sharedStrings[Number.parseInt(value, 10)] ?? '';
  return decodeXml(value);
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
      const attributes = parseAttributes(cellMatch[1]);
      const columnIndex = columnIndexFromCellRef(attributes.r, fallbackIndex);
      cells[columnIndex] = parseCellValue(cellMatch[2], attributes.t, sharedStrings);
      fallbackIndex = columnIndex + 1;
    }
    rows.push(cells.map((cell) => cell ?? ''));
  }
  return rows;
}

function resolveFirstWorksheetPath(workbookXml: string, relsXml: string, xlsxDir: string): string {
  const sheetMatch = workbookXml.match(/<sheet\b([^>]*)\/?>/);
  if (!sheetMatch) throw new Error('No worksheet declaration found in workbook.xml');
  const relId = parseAttributes(sheetMatch[1])['r:id'];
  if (!relId) throw new Error('First worksheet does not expose an r:id relationship');
  const relationshipRegex = /<Relationship\b([^>]*)\/?>/g;
  let relationshipMatch: RegExpExecArray | null;
  while ((relationshipMatch = relationshipRegex.exec(relsXml)) !== null) {
    const attrs = parseAttributes(relationshipMatch[1]);
    if (attrs.Id === relId && attrs.Target) return path.join(xlsxDir, 'xl', attrs.Target.replace(/^\/xl\//, ''));
  }
  throw new Error(`Worksheet relationship ${relId} was not found`);
}

async function readXlsxRows(xlsxPath: string): Promise<string[][]> {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'istat-xlsx-'));
  try {
    await runCommand('tar', ['-xf', xlsxPath, '-C', tempDir]);
    const workbookXml = await readFile(path.join(tempDir, 'xl', 'workbook.xml'), 'utf8');
    const relsXml = await readFile(path.join(tempDir, 'xl', '_rels', 'workbook.xml.rels'), 'utf8');
    const sharedStringsPath = path.join(tempDir, 'xl', 'sharedStrings.xml');
    const sharedStrings = (await exists(sharedStringsPath)) ? parseSharedStrings(await readFile(sharedStringsPath, 'utf8')) : [];
    const worksheetPath = resolveFirstWorksheetPath(workbookXml, relsXml, tempDir);
    return parseWorksheetRows(await readFile(worksheetPath, 'utf8'), sharedStrings);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function normalizeHeader(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function findColumn(headers: string[], aliases: Set<string>): string | undefined {
  const exact = headers.find((header) => aliases.has(normalizeHeader(header)));
  if (exact) return exact;
  return headers.find((header) => [...aliases].some((alias) => normalizeHeader(header).includes(alias)));
}

export function detectColumns(headers: string[]): DetectedColumns {
  return { municipality: findColumn(headers, municipalAliases), section: findColumn(headers, sectionAliases), municipalityName: findColumn(headers, municipalityNameAliases) };
}

export function normalizeMunicipalityCode(value: unknown): string | undefined {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return undefined;
  return digits.padStart(6, '0').slice(-6);
}

function digitsOnly(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

export function normalizeSectionSuffix(value: unknown, municipalityCode?: string): string | undefined {
  const digits = digitsOnly(value);
  if (!digits) return undefined;
  const suffix = municipalityCode && digits.startsWith(municipalityCode) && digits.length > municipalityCode.length ? digits.slice(municipalityCode.length) : digits;
  return suffix.replace(/^0+/, '') || '0';
}

export function classifyFictitiousSection(sectionValue: unknown, municipalityCode?: string): 'senza_dimora' | 'zona_in_contestazione' | undefined {
  const suffix = normalizeSectionSuffix(sectionValue, municipalityCode);
  if (!suffix) return undefined;
  if (/^888888\d$/.test(suffix)) return 'senza_dimora';
  if (/^999999\d$/.test(suffix)) return 'zona_in_contestazione';
  return undefined;
}

function valueLooksLikeLamezia(value: unknown): boolean {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('lamezia terme');
}

export function buildJoinParts(row: DatasetRow, columns: DetectedColumns): JoinParts {
  const sectionValue = columns.section ? row[columns.section] : undefined;
  const municipalityCode = (columns.municipality ? normalizeMunicipalityCode(row[columns.municipality]) : undefined) ?? (digitsOnly(sectionValue).startsWith(LAMEZIA_ISTAT_CODE) ? LAMEZIA_ISTAT_CODE : undefined);
  const sectionSuffix = normalizeSectionSuffix(sectionValue, municipalityCode);
  return {
    municipalityCode,
    sectionSuffix,
    joinKey: municipalityCode && sectionSuffix ? `${municipalityCode}|${sectionSuffix}` : undefined,
    displaySectionId: municipalityCode && sectionSuffix ? `${municipalityCode}${sectionSuffix.padStart(7, '0')}` : undefined,
  };
}

function rowLooksLikeLamezia(row: DatasetRow, columns: DetectedColumns): boolean {
  const parts = buildJoinParts(row, columns);
  if (parts.municipalityCode === LAMEZIA_ISTAT_CODE) return true;
  if (columns.municipalityName && valueLooksLikeLamezia(row[columns.municipalityName])) return true;
  return Object.values(row).some(valueLooksLikeLamezia);
}

function findHeaderRow(rows: string[][]): number {
  for (let index = 0; index < Math.min(rows.length, 25); index += 1) {
    const headers = rows[index].map((cell) => cell.trim());
    const columns = detectColumns(headers);
    if (columns.section && (columns.municipality || headers.length > 5)) return index;
  }
  return 0;
}

function rowsToRecords(rows: string[][]): { headers: string[]; records: DatasetRow[] } {
  const headerIndex = findHeaderRow(rows);
  const rawHeaders = rows[headerIndex].map((header, index) => header.trim() || `col_${index + 1}`);
  const headers = rawHeaders.map((header, index) => rawHeaders.indexOf(header) === index ? header : `${header}_${index + 1}`);
  const records = rows.slice(headerIndex + 1).filter((row) => row.some((cell) => cell.trim() !== '')).map((row) => {
    const record: DatasetRow = {};
    headers.forEach((header, index) => { record[header] = row[index]?.trim() ?? ''; });
    return record;
  });
  return { headers, records };
}

function isIdentifierColumn(header: string, columns: DetectedColumns): boolean {
  if (header === columns.municipality || header === columns.section || header === columns.municipalityName) return true;
  const normalized = normalizeHeader(header);
  return municipalAliases.has(normalized) || sectionAliases.has(normalized) || municipalityNameAliases.has(normalized) || normalized.includes('regione') || normalized.includes('provincia');
}

export function chooseIndicatorColumns(headers: string[], rows: DatasetRow[], columns: DetectedColumns, maxIndicators: number): string[] {
  const sampledRows = rows.slice(0, 50);
  const candidates = headers.filter((header) => {
    if (isIdentifierColumn(header, columns)) return false;
    const normalized = normalizeHeader(header);
    if (!normalized || normalized.startsWith('col')) return false;
    return sampledRows.filter((row) => row[header]?.trim()).length > 0;
  });
  const preferred = candidates.filter((header) => /^[A-Z]{1,4}\d+[A-Z0-9_]*$/.test(header.trim()));
  return [...preferred, ...candidates.filter((header) => !preferred.includes(header))].slice(0, maxIndicators);
}

function parseIndicatorValue(value: string): string | number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[+-]?\d+(?:[.,]\d+)?$/.test(trimmed)) return Number(trimmed.replace(',', '.'));
  return trimmed;
}

function safePropertyName(header: string): string {
  return normalizeHeader(header) || 'indicatore';
}

function isFeatureCollection(value: unknown): value is GeoJsonFeatureCollection {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GeoJsonFeatureCollection>;
  return candidate.type === 'FeatureCollection' && Array.isArray(candidate.features);
}

function featureProperties(feature: GeoJsonFeature): DatasetRow {
  const record: DatasetRow = {};
  for (const [key, value] of Object.entries(feature.properties ?? {})) record[key] = String(value ?? '');
  return record;
}

async function prepareProcessedLayer(options: CliOptions, geometryGeoJsonPath: string): Promise<void> {
  const variablesXlsxPath = options.variablesXlsxPath ?? path.join(options.variablesRawDir, variablesWorkbookName);
  await verifyFile(geometryGeoJsonPath);
  await verifyFile(variablesXlsxPath);
  const variableRows = rowsToRecords(await readXlsxRows(variablesXlsxPath));
  const variableColumns = detectColumns(variableRows.headers);
  if (!variableColumns.section) throw new Error('Could not identify the census-section key in the ISTAT variables workbook');
  const lameziaVariableRows = variableRows.records.filter((row) => rowLooksLikeLamezia(row, variableColumns));
  const indicatorColumns = chooseIndicatorColumns(variableRows.headers, lameziaVariableRows, variableColumns, options.maxIndicators);
  const variableMap = new Map<string, DatasetRow>();
  let variableFictitiousRows = 0;
  for (const row of lameziaVariableRows) {
    const parts = buildJoinParts(row, variableColumns);
    if (!parts.joinKey) continue;
    const sectionValue = variableColumns.section ? row[variableColumns.section] : parts.sectionSuffix;
    const fictitiousType = classifyFictitiousSection(sectionValue, parts.municipalityCode);
    if (fictitiousType) variableFictitiousRows += 1;
    if (fictitiousType && !options.includeFictitious) continue;
    variableMap.set(parts.joinKey, row);
  }
  const parsedGeoJson: unknown = JSON.parse(await readFile(geometryGeoJsonPath, 'utf8'));
  if (!isFeatureCollection(parsedGeoJson)) throw new Error(`Expected a GeoJSON FeatureCollection in ${geometryGeoJsonPath}`);
  const geometryHeaders = Object.keys(parsedGeoJson.features.find((feature) => feature.properties)?.properties ?? {});
  const geometryColumns = detectColumns(geometryHeaders);
  if (!geometryColumns.section) throw new Error('Could not identify the census-section key in the geometry GeoJSON');
  const outputFeatures: GeoJsonFeature[] = [];
  let skippedNonLamezia = 0;
  let skippedFictitious = 0;
  let matchedVariables = 0;
  let missingVariables = 0;
  for (const feature of parsedGeoJson.features) {
    const sourceProperties = featureProperties(feature);
    if (!rowLooksLikeLamezia(sourceProperties, geometryColumns)) {
      skippedNonLamezia += 1;
      continue;
    }
    const parts = buildJoinParts(sourceProperties, geometryColumns);
    const sectionValue = geometryColumns.section ? sourceProperties[geometryColumns.section] : parts.sectionSuffix;
    const fictitiousType = classifyFictitiousSection(sectionValue, parts.municipalityCode);
    if (fictitiousType && !options.includeFictitious) {
      skippedFictitious += 1;
      continue;
    }
    const variables = parts.joinKey ? variableMap.get(parts.joinKey) : undefined;
    if (variables) matchedVariables += 1;
    else missingVariables += 1;
    const indicators: Record<string, string | number | null> = {};
    for (const column of indicatorColumns) indicators[safePropertyName(column)] = parseIndicatorValue(variables?.[column] ?? '');
    outputFeatures.push({
      ...feature,
      properties: {
        sezione_censimento_id: parts.displaySectionId ?? sectionValue ?? null,
        istat_municipal_code: LAMEZIA_ISTAT_CODE,
        municipality: LAMEZIA_COMUNE,
        source_geometry_join_key: parts.joinKey ?? null,
        matched_istat_2023_variables: Boolean(variables),
        fictitious_section_type: fictitiousType ?? null,
        indicator_columns: indicatorColumns,
        indicators_istat_2023: indicators,
      },
    });
  }
  if (outputFeatures.length === 0) throw new Error('No Lamezia Terme census-section features were produced. Check field detection and source files.');
  await mkdir(options.processedDir, { recursive: true });
  const processedGeoJsonPath = path.join(options.processedDir, processedGeoJsonName);
  const processedMetadataPath = path.join(options.processedDir, processedMetadataName);
  await writeFile(`${processedGeoJsonPath}.tmp`, JSON.stringify({ type: 'FeatureCollection', features: outputFeatures }), 'utf8');
  await rename(`${processedGeoJsonPath}.tmp`, processedGeoJsonPath);
  await verifyFile(processedGeoJsonPath);
  const metadata = {
    id: 'istat-sezioni-censimento-lamezia',
    publicLabel: 'Dato ufficiale ISTAT per sezione censuaria',
    sourceInstitution: 'ISTAT',
    sourceDataset: {
      geometries: 'Basi territoriali 2021 - Calabria, sezioni di censimento',
      variables: 'Dati per sezioni di censimento - Censimento permanente della popolazione e delle abitazioni 2023',
    },
    sourceYear: { geometries: 2021, variables: 2023 },
    territorialLevel: 'sezione di censimento',
    municipality: LAMEZIA_COMUNE,
    istatMunicipalCode: LAMEZIA_ISTAT_CODE,
    processingDate: new Date().toISOString(),
    verificationStatus: 'processed locally from official ISTAT source files; requires human review before frontend publication',
    knownLimits: [
      'Indicator labels are preserved as ISTAT source columns and must be reviewed against the tracciato before public copy is written.',
      'Fictitious sections 888888x and 999999x are excluded by default unless --include-fictitious is used.',
      'This census-section layer must not be confused with Zornade cadastral urban sections.',
    ],
    publicMapRole: 'future primary census-section base after validation',
    warning: 'Non confondere con sezioni urbane catastali; non usare layer catastali per indicatori censuari ISTAT',
    inputs: { geometryGeoJsonPath, variablesXlsxPath, geometrySourceUrl: geometryZipUrl, variablesSourceUrl: variablesZipUrl },
    counts: { outputFeatures: outputFeatures.length, matchedVariables, missingVariables, skippedNonLamezia, skippedFictitious, variableRowsForLamezia: lameziaVariableRows.length, variableFictitiousRows },
    indicatorColumns,
    outputPath: processedGeoJsonPath,
  };
  await writeFile(`${processedMetadataPath}.tmp`, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
  await rename(`${processedMetadataPath}.tmp`, processedMetadataPath);
  await verifyFile(processedMetadataPath);
}

export async function run(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(argv);
  const geometryZipPath = path.join(options.geometryRawDir, geometryZipName);
  const variablesZipPath = path.join(options.variablesRawDir, variablesZipName);
  if (!options.download && !options.extract && !options.convertGeometry && !options.prepare) {
    console.log(usage());
    return;
  }
  if (options.download) {
    await downloadFile(geometryZipUrl, geometryZipPath, options.force);
    await verifyFile(geometryZipPath);
    await downloadFile(variablesZipUrl, variablesZipPath, options.force);
    await verifyFile(variablesZipPath);
  }
  if (options.extract) await extractSources(options);
  let geometryGeoJsonPath = options.geometryGeoJsonPath ?? path.join(options.geometryRawDir, geometryGeoJsonName);
  if (options.convertGeometry) geometryGeoJsonPath = await convertGeometry(options);
  if (options.prepare) await prepareProcessedLayer(options, geometryGeoJsonPath);
}

if (path.resolve(process.argv[1] ?? '') === scriptPath) {
  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
