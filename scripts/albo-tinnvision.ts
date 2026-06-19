#!/usr/bin/env tsx
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { ALBO_PRETORIO_LAMEZIA_SOURCE } from "./albo-source-config";

export type AlboFetchMethod = "xml" | "csv" | "print-fallback" | "html-fallback";
export type VerificationStatus =
  | "official_source_acquired"
  | "normalised_automatically"
  | "verification_required";
export type PrivacyRisk = "low" | "medium" | "high";
export type PublicVisibility =
  | "publishable"
  | "publishable_with_minimisation"
  | "metadata_only"
  | "do_not_publish";

export interface RawAlboRecord {
  publication_number: string;
  publication_start: string | null;
  publication_end: string | null;
  office: string | null;
  act_type: string | null;
  act_number: string | null;
  act_date: string | null;
  subject: string | null;
  document_url: string | null;
  source_row: Record<string, string | null>;
}

export interface FetchAttempt {
  method: AlboFetchMethod;
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string | null;
  recordCount?: number;
  reason?: string;
}

export interface AlboRawSnapshot {
  source: string;
  source_url: string;
  provider: string;
  retrieved_at: string;
  fetch_method: AlboFetchMethod;
  raw_format: "xml" | "csv" | "html";
  structured_export_attempts: FetchAttempt[];
  records: RawAlboRecord[];
  warnings: string[];
  known_limits: string[];
}

export interface AlboItem {
  id: string;
  source: string;
  source_url: string;
  retrieved_at: string;
  fetch_method: AlboFetchMethod;
  publication_number: string;
  publication_start: string | null;
  publication_end: string | null;
  office: string | null;
  act_type: string | null;
  act_number: string | null;
  act_date: string | null;
  subject: string | null;
  document_url: string | null;
  content_hash: string;
  verification_status: VerificationStatus;
  privacy_risk: PrivacyRisk;
  public_visibility: PublicVisibility;
  known_limits: string[];
}

export interface AlboDiff {
  new: AlboItem[];
  changed: Array<{ before: AlboItem; after: AlboItem }>;
  removed: AlboItem[];
  unchanged: AlboItem[];
}

export interface RunCounts {
  acquired: number;
  new: number;
  changed: number;
  removed: number;
  unchanged: number;
  publishable: number;
  minimised: number;
  metadata_only: number;
  excluded: number;
}

export interface CliOptions {
  outDir: string;
  fromFile?: string;
  inputFormat?: "xml" | "csv" | "html" | "print";
  retrievedAt?: string;
}

type PublicRecord = Record<string, unknown> & {
  source: string;
  retrieved_at: string;
  verification_status: VerificationStatus;
  known_limits: string[];
};
type PublicLatest = Record<string, unknown> & { counts: RunCounts; items: PublicRecord[]; excluded: PublicRecord[] };
type PublicDiff = Record<string, unknown> & { counts: RunCounts };

interface RunResult {
  snapshot: AlboRawSnapshot;
  items: AlboItem[];
  diff: AlboDiff;
  publicLatest: PublicLatest;
  publicDiff: PublicDiff;
  runLog: string;
  paths: Record<
    | "currentSnapshot"
    | "historySnapshot"
    | "processedItems"
    | "publicLatest"
    | "publicDiff"
    | "runLog",
    string
  >;
}

const DOCUMENT_URL_LIMIT =
  "Allegato/documento non incluso negli export Tinnvision acquisiti da Tranche A.";
const FALLBACK_LIMIT =
  "Acquisizione effettuata da fallback HTML/print per indisponibilita' degli export strutturati.";
const MINIMISED_LIMIT =
  "Oggetto non ripubblicato integralmente nel layer pubblico per prudenza privacy.";

const DO_NOT_PUBLISH_TERMS = [
  "minore",
  "minori",
  "adozione",
  "affido",
  "sanitari",
  "disabil",
  "handicap",
  "invalid",
  "servizi sociali",
  "tutela",
  "amministratore di sostegno",
];
const METADATA_ONLY_TERMS = [
  "pubblicazione di matrimonio",
  "matrimonio",
  "notifica",
  "irreperibil",
  "cambio nome",
  "cambio cognome",
  "avviso di deposito",
  "casa comunale",
  "elenco x 1 gg",
];
const MINIMISE_TERMS = [
  "benefici",
  "contribut",
  "allogg",
  "graduatori",
  "contenzioso",
  "risarc",
  "transatt",
  "sinistro",
  "avvocatura",
  "personale",
  "incaric",
];

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { outDir: "data" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") continue;
    if (arg === "--out-dir") options.outDir = valueAfter(argv, ++index, arg);
    else if (arg === "--from-file") options.fromFile = valueAfter(argv, ++index, arg);
    else if (arg === "--input-format") options.inputFormat = parseInputFormat(valueAfter(argv, ++index, arg));
    else if (arg === "--retrieved-at") options.retrievedAt = valueAfter(argv, ++index, arg);
    else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

export async function runAlboIngestion(options: CliOptions): Promise<RunResult> {
  const currentPath = path.join(options.outDir, "snapshots", "albo", "current.json");
  const previous = await readSnapshot(currentPath);
  const snapshot = await acquireAlboSnapshot(options);
  const previousItems = previous ? normalizeAlboRecords(previous) : [];
  const items = normalizeAlboRecords(snapshot);
  const diff = diffAlboItems(previousItems, items);
  const counts = countRun(items, diff);
  const publicLatest = buildPublicLatest(snapshot, items, counts);
  const publicDiff = buildPublicDiff(snapshot, diff, counts);
  const runLog = renderRunLog(snapshot, counts);
  const paths = await writeArtifacts(options.outDir, snapshot, items, publicLatest, publicDiff, runLog);
  return { snapshot, items, diff, publicLatest, publicDiff, runLog, paths };
}

async function acquireAlboSnapshot(options: CliOptions): Promise<AlboRawSnapshot> {
  const retrievedAt = options.retrievedAt ?? new Date().toISOString();
  if (options.fromFile) {
    const format = options.inputFormat ?? inferInputFormat(options.fromFile);
    const parsed = parseByFormat(await readFile(options.fromFile, "utf8"), format);
    return buildSnapshot(parsed.records, parsed.method, parsed.rawFormat, retrievedAt, [
      { method: parsed.method, url: options.fromFile, ok: true, recordCount: parsed.records.length },
    ]);
  }

  const attempts: FetchAttempt[] = [];
  for (const candidate of [
    { method: "xml" as const, url: ALBO_PRETORIO_LAMEZIA_SOURCE.exportUrls.xml, rawFormat: "xml" as const, parser: parseTinnvisionXml },
    { method: "csv" as const, url: ALBO_PRETORIO_LAMEZIA_SOURCE.exportUrls.csv, rawFormat: "csv" as const, parser: parseTinnvisionCsv },
  ]) {
    const result = await tryFetch(candidate, fetch);
    attempts.push(result.attempt);
    if (result.records.length) return buildSnapshot(result.records, candidate.method, candidate.rawFormat, retrievedAt, attempts);
  }

  for (const candidate of [
    {
      method: "print-fallback" as const,
      url: ALBO_PRETORIO_LAMEZIA_SOURCE.exportUrls.print,
      rawFormat: "html" as const,
      parser: parseTinnvisionHtml,
    },
    {
      method: "html-fallback" as const,
      url: ALBO_PRETORIO_LAMEZIA_SOURCE.exportUrls.html,
      rawFormat: "html" as const,
      parser: parseTinnvisionHtml,
    },
  ]) {
    const result = await tryFetch(candidate, fetch);
    attempts.push(result.attempt);
    if (result.records.length) {
      return buildSnapshot(result.records, candidate.method, candidate.rawFormat, retrievedAt, attempts, [FALLBACK_LIMIT]);
    }
  }

  throw new Error(
    `No Albo records acquired. Attempts: ${attempts
      .map((attempt) => `${attempt.method}=${attempt.reason ?? attempt.status ?? "unknown"}`)
      .join(", ")}`,
  );
}

async function tryFetch(
  candidate: {
    method: AlboFetchMethod;
    url: string;
    rawFormat: "xml" | "csv" | "html";
    parser: (text: string) => RawAlboRecord[];
  },
  fetchImpl: typeof fetch,
): Promise<{ records: RawAlboRecord[]; attempt: FetchAttempt }> {
  try {
    const response = await fetchImpl(candidate.url, {
      headers: { accept: "*/*", "user-agent": "Lamezia-Trasparente-Monitor/Tranche-A" },
      redirect: "follow",
    });
    const text = await decodeResponse(response);
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      return {
        records: [],
        attempt: { method: candidate.method, url: candidate.url, ok: false, status: response.status, contentType, reason: `HTTP ${response.status}` },
      };
    }
    const records = candidate.parser(text);
    return {
      records,
      attempt: {
        method: candidate.method,
        url: candidate.url,
        ok: records.length > 0,
        status: response.status,
        contentType,
        recordCount: records.length,
        reason: records.length ? undefined : "Response did not contain parseable Albo records.",
      },
    };
  } catch (error) {
    return { records: [], attempt: { method: candidate.method, url: candidate.url, ok: false, reason: formatError(error) } };
  }
}

export function parseTinnvisionXml(xml: string): RawAlboRecord[] {
  return [...xml.matchAll(/<pubblicazione>([\s\S]*?)<\/pubblicazione>/gi)].flatMap((match) => {
    const block = match[1] ?? "";
    const publicationNumber = clean(xmlTag(block, "progressivo"));
    if (!publicationNumber) return [];
    const period = parsePeriod(xmlTag(block, "periodo-pubblicazione"));
    const typology = clean(xmlTag(block, "tipologia"));
    const regSet = clean(xmlTag(block, "num-reg-set"));
    const regGen = clean(xmlTag(block, "num-reg-gen"));
    const dataAtto = clean(xmlTag(block, "data-atto"));
    const dataRegGen = clean(xmlTag(block, "data-reg-gen"));
    const office = nullable(xmlTag(block, "provenienza"));
    const subject = nullable(xmlTag(block, "oggetto"));
    return [
      {
        publication_number: publicationNumber,
        publication_start: period.start,
        publication_end: period.end,
        office,
        act_type: cleanActType(typology),
        act_number: registryNumber(regGen) ?? registryNumber(regSet),
        act_date: italianDate(dataAtto) ?? italianDate(dataRegGen),
        subject,
        document_url: null,
        source_row: {
          progressivo: publicationNumber,
          tipologia: typology,
          provenienza: office,
          periodo_pubblicazione: clean(xmlTag(block, "periodo-pubblicazione")),
          data_atto: dataAtto,
          num_reg_set: regSet,
          num_reg_gen: regGen,
          data_reg_gen: dataRegGen,
          oggetto: subject,
        },
      },
    ];
  });
}

export function parseTinnvisionCsv(csv: string): RawAlboRecord[] {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];
  const headers = rows[0].map(headerKey);
  const value = (row: string[], name: string): string | null => {
    const index = headers.indexOf(headerKey(name));
    return index >= 0 ? nullable(row[index]) : null;
  };
  return rows.slice(1).flatMap((row) => {
    const publicationNumber = value(row, "Num. Pubblicazione");
    if (!publicationNumber) return [];
    const period = parsePeriod(value(row, "Periodo pubblicazione"));
    const typology = value(row, "Tipologia");
    const regSet = value(row, "Num.Reg.Set");
    const regGen = value(row, "Num.Reg.Gen");
    return [
      {
        publication_number: publicationNumber,
        publication_start: period.start,
        publication_end: period.end,
        office: value(row, "Provenienza"),
        act_type: cleanActType(typology),
        act_number: registryNumber(regGen) ?? registryNumber(regSet),
        act_date: italianDate(value(row, "Data atto")) ?? italianDate(value(row, "Data Reg.Gen")),
        subject: value(row, "Oggetto"),
        document_url: null,
        source_row: {
          num_pubblicazione: publicationNumber,
          provenienza: value(row, "Provenienza"),
          tipologia: typology,
          periodo_pubblicazione: value(row, "Periodo pubblicazione"),
          data_atto: value(row, "Data atto"),
          num_reg_set: regSet,
          num_reg_gen: regGen,
          data_reg_gen: value(row, "Data Reg.Gen"),
          oggetto: value(row, "Oggetto"),
        },
      },
    ];
  });
}

export function parseTinnvisionHtml(html: string): RawAlboRecord[] {
  const tbody = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i.exec(html)?.[1] ?? html;
  return [...tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap((row) => {
    const cells = [...(row[1] ?? "").matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => stripHtml(cell[1] ?? ""));
    if (cells.length < 9) return [];
    const publicationNumber = nullable(cells[1]);
    if (!publicationNumber) return [];
    const typology = nullable(cells[3]);
    const period = parsePeriod(cells[8]);
    const regGen = nullable(cells[5]);
    const regSet = nullable(cells[6]);
    return [
      {
        publication_number: publicationNumber,
        publication_start: period.start,
        publication_end: period.end,
        office: nullable(cells[2]),
        act_type: cleanActType(typology),
        act_number: registryNumber(regGen) ?? registryNumber(regSet) ?? actNumber(typology),
        act_date: italianDate(typology),
        subject: nullable(cells[4]),
        document_url: null,
        source_row: {
          publication_number: publicationNumber,
          office: nullable(cells[2]),
          typology,
          subject: nullable(cells[4]),
          num_reg_gen: regGen,
          num_reg_set: regSet,
          publication_period: cells[8],
        },
      },
    ];
  });
}

export function normalizeAlboRecords(snapshot: AlboRawSnapshot): AlboItem[] {
  return snapshot.records
    .filter((record) => record.publication_number.trim())
    .map((record) => {
      const classification = classify(record);
      const content_hash = sha256({
        publication_number: record.publication_number,
        publication_start: record.publication_start,
        publication_end: record.publication_end,
        office: record.office,
        act_type: record.act_type,
        act_number: record.act_number,
        act_date: record.act_date,
        subject: record.subject,
        document_url: record.document_url,
      });
      return {
        id: `albo-${record.publication_number.replace(/[^0-9a-z]+/gi, "-").replace(/^-|-$/g, "")}`,
        source: snapshot.source,
        source_url: snapshot.source_url,
        retrieved_at: snapshot.retrieved_at,
        fetch_method: snapshot.fetch_method,
        publication_number: record.publication_number,
        publication_start: record.publication_start,
        publication_end: record.publication_end,
        office: record.office,
        act_type: record.act_type,
        act_number: record.act_number,
        act_date: record.act_date,
        subject: record.subject,
        document_url: record.document_url,
        content_hash,
        verification_status: verificationStatus(snapshot.fetch_method),
        privacy_risk: classification.privacyRisk,
        public_visibility: classification.publicVisibility,
        known_limits: itemLimits(snapshot, record, classification.reason),
      };
    });
}

export function diffAlboItems(previous: AlboItem[], next: AlboItem[]): AlboDiff {
  const previousById = new Map(previous.map((item) => [item.id, item]));
  const nextById = new Map(next.map((item) => [item.id, item]));
  return {
    new: next.filter((item) => !previousById.has(item.id)),
    changed: next.flatMap((item) => {
      const before = previousById.get(item.id);
      return before && before.content_hash !== item.content_hash ? [{ before, after: item }] : [];
    }),
    removed: previous.filter((item) => !nextById.has(item.id)),
    unchanged: next.filter((item) => previousById.get(item.id)?.content_hash === item.content_hash),
  };
}

export function renderRunLog(snapshot: AlboRawSnapshot, counts: RunCounts): string {
  const warnings = snapshot.warnings.length ? snapshot.warnings.join("; ") : "nessuno";
  return [
    `Run: ${romeTime(snapshot.retrieved_at)}`,
    `Fonte: ${snapshot.source}`,
    `URL fonte: ${snapshot.source_url}`,
    `Metodo: ${snapshot.fetch_method}`,
    `Atti acquisiti: ${counts.acquired}`,
    `Nuovi atti: ${counts.new}`,
    `Modificati: ${counts.changed}`,
    `Rimossi/non piu' presenti: ${counts.removed}`,
    `Invariati: ${counts.unchanged}`,
    `Pubblicabili: ${counts.publishable}`,
    `Minimizzati: ${counts.minimised}`,
    `Solo metadato: ${counts.metadata_only}`,
    `Esclusi dal public layer: ${counts.excluded}`,
    `Errori/warning: ${warnings}`,
    "Next check: manuale o schedulato dal runner esterno; Tranche A espone il comando di acquisizione.",
    "",
    "Limiti noti:",
    ...snapshot.known_limits.map((limit) => `- ${limit}`),
    "",
  ].join("\n");
}

function buildSnapshot(
  records: RawAlboRecord[],
  method: AlboFetchMethod,
  rawFormat: "xml" | "csv" | "html",
  retrievedAt: string,
  attempts: FetchAttempt[],
  warnings: string[] = [],
): AlboRawSnapshot {
  const knownLimits: string[] = [...ALBO_PRETORIO_LAMEZIA_SOURCE.knownLimits];
  if (method === "print-fallback" || method === "html-fallback") knownLimits.push(FALLBACK_LIMIT);
  return {
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    provider: ALBO_PRETORIO_LAMEZIA_SOURCE.provider,
    retrieved_at: retrievedAt,
    fetch_method: method,
    raw_format: rawFormat,
    structured_export_attempts: attempts,
    records,
    warnings,
    known_limits: unique(knownLimits),
  };
}

function buildPublicLatest(snapshot: AlboRawSnapshot, items: AlboItem[], counts: RunCounts): PublicLatest {
  return {
    generated_at: snapshot.retrieved_at,
    source: snapshot.source,
    source_url: snapshot.source_url,
    retrieved_at: snapshot.retrieved_at,
    verification_status: verificationStatus(snapshot.fetch_method),
    known_limits: snapshot.known_limits,
    counts,
    items: items.filter((item) => item.public_visibility !== "do_not_publish").map(publicItem),
    excluded: items.filter((item) => item.public_visibility === "do_not_publish").map(publicExcludedItem),
  };
}

function buildPublicDiff(snapshot: AlboRawSnapshot, diff: AlboDiff, counts: RunCounts): PublicDiff {
  const safe = (item: AlboItem): PublicRecord =>
    item.public_visibility === "do_not_publish" ? publicExcludedItem(item) : publicItem(item);
  return {
    generated_at: snapshot.retrieved_at,
    source: snapshot.source,
    source_url: snapshot.source_url,
    retrieved_at: snapshot.retrieved_at,
    verification_status: verificationStatus(snapshot.fetch_method),
    known_limits: snapshot.known_limits,
    counts,
    diff: {
      new: diff.new.map(safe),
      changed: diff.changed.map((entry) => ({ before: safe(entry.before), after: safe(entry.after) })),
      removed: diff.removed.map(safe),
      unchanged: diff.unchanged.map(safe),
    },
  };
}

function publicItem(item: AlboItem): PublicRecord {
  const base = {
    id: item.id,
    source: item.source,
    source_url: item.source_url,
    retrieved_at: item.retrieved_at,
    publication_number: item.publication_number,
    publication_start: item.publication_start,
    publication_end: item.publication_end,
    office: item.office,
    act_type: item.act_type,
    act_number: item.act_number,
    act_date: item.act_date,
    content_hash: item.content_hash,
    verification_status: item.verification_status,
    privacy_risk: item.privacy_risk,
    public_visibility: item.public_visibility,
    known_limits: item.known_limits,
  };
  if (item.public_visibility === "publishable") {
    return { ...base, subject: item.subject, document_url: item.document_url, public_note: null };
  }
  if (item.public_visibility === "publishable_with_minimisation") {
    return {
      ...base,
      subject: "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.",
      document_url: null,
      public_note: "Record pubblicato con minimizzazione automatica.",
    };
  }
  return {
    ...base,
    office: null,
    act_number: null,
    act_date: null,
    subject: "Metadato minimo; oggetto non ripubblicato per prudenza privacy.",
    document_url: null,
    public_note: "Record limitato al metadato minimo.",
  };
}

function publicExcludedItem(item: AlboItem): PublicRecord {
  return {
    id: item.id,
    source: item.source,
    source_url: item.source_url,
    retrieved_at: item.retrieved_at,
    publication_number: item.publication_number,
    verification_status: item.verification_status,
    privacy_risk: item.privacy_risk,
    public_visibility: "do_not_publish",
    known_limits: item.known_limits,
    exclusion_reason: "Record escluso dal layer pubblico per prudenza privacy automatica.",
  };
}

async function writeArtifacts(
  outDir: string,
  snapshot: AlboRawSnapshot,
  items: AlboItem[],
  publicLatest: PublicLatest,
  publicDiff: PublicDiff,
  runLog: string,
): Promise<RunResult["paths"]> {
  const paths = {
    currentSnapshot: path.join(outDir, "snapshots", "albo", "current.json"),
    historySnapshot: path.join(
      outDir,
      "snapshots",
      "albo",
      "history",
      `${snapshot.retrieved_at.replace(/[:.]/g, "-")}.json`,
    ),
    processedItems: path.join(outDir, "processed", "albo", "albo_items.json"),
    publicLatest: path.join(outDir, "public", "albo", "latest.json"),
    publicDiff: path.join(outDir, "public", "albo", "diff-latest.json"),
    runLog: path.join(outDir, "public", "albo", "run-latest.md"),
  };
  await Promise.all(Object.values(paths).map((filePath) => mkdir(path.dirname(filePath), { recursive: true })));
  await writeJson(paths.currentSnapshot, snapshot);
  await writeJson(paths.historySnapshot, snapshot);
  await writeJson(paths.processedItems, {
    generated_at: snapshot.retrieved_at,
    source: snapshot.source,
    source_url: snapshot.source_url,
    retrieved_at: snapshot.retrieved_at,
    items,
  });
  await writeJson(paths.publicLatest, publicLatest);
  await writeJson(paths.publicDiff, publicDiff);
  await writeFile(paths.runLog, runLog, "utf8");
  return paths;
}

function countRun(items: AlboItem[], diff: AlboDiff): RunCounts {
  return {
    acquired: items.length,
    new: diff.new.length,
    changed: diff.changed.length,
    removed: diff.removed.length,
    unchanged: diff.unchanged.length,
    publishable: countVisibility(items, "publishable"),
    minimised: countVisibility(items, "publishable_with_minimisation"),
    metadata_only: countVisibility(items, "metadata_only"),
    excluded: countVisibility(items, "do_not_publish"),
  };
}

async function readSnapshot(filePath: string): Promise<AlboRawSnapshot | null> {
  try {
    const value = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    return isSnapshot(value) ? value : null;
  } catch {
    return null;
  }
}

function parseByFormat(
  text: string,
  format: NonNullable<CliOptions["inputFormat"]>,
): { records: RawAlboRecord[]; method: AlboFetchMethod; rawFormat: "xml" | "csv" | "html" } {
  if (format === "xml") return { records: parseTinnvisionXml(text), method: "xml", rawFormat: "xml" };
  if (format === "csv") return { records: parseTinnvisionCsv(text), method: "csv", rawFormat: "csv" };
  return {
    records: parseTinnvisionHtml(text),
    method: format === "print" ? "print-fallback" : "html-fallback",
    rawFormat: "html",
  };
}

function classify(record: RawAlboRecord): {
  privacyRisk: PrivacyRisk;
  publicVisibility: PublicVisibility;
  reason: string | null;
} {
  const text = [record.subject, record.act_type, record.office].filter(Boolean).join(" ").toLowerCase();
  if (DO_NOT_PUBLISH_TERMS.some((term) => text.includes(term))) {
    return {
      privacyRisk: "high",
      publicVisibility: "do_not_publish",
      reason: "Regola automatica prudenziale: possibile contenuto sociale, sanitario o personale sensibile.",
    };
  }
  if (METADATA_ONLY_TERMS.some((term) => text.includes(term))) {
    return {
      privacyRisk: "high",
      publicVisibility: "metadata_only",
      reason: "Regola automatica prudenziale: stato civile, notifiche o metadati personali pubblicati solo in forma minima.",
    };
  }
  if (MINIMISE_TERMS.some((term) => text.includes(term))) {
    return {
      privacyRisk: "medium",
      publicVisibility: "publishable_with_minimisation",
      reason: "Regola automatica prudenziale: oggetto minimizzato per possibile presenza di dati personali o contenzioso.",
    };
  }
  return { privacyRisk: "low", publicVisibility: "publishable", reason: null };
}

function itemLimits(snapshot: AlboRawSnapshot, record: RawAlboRecord, reason: string | null): string[] {
  const limits = [...snapshot.known_limits];
  if (!record.document_url) limits.push(DOCUMENT_URL_LIMIT);
  if (reason) limits.push(MINIMISED_LIMIT, reason);
  return unique(limits);
}

async function decodeResponse(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  const charset = /charset=([^;\s]+)/i.exec(contentType)?.[1]?.toLowerCase();
  const decoder = charset === "iso-8859-1" || charset === "latin1" ? "windows-1252" : "utf-8";
  return new TextDecoder(decoder).decode(new Uint8Array(await response.arrayBuffer()));
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ";" && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function parsePeriod(value: string | null): { start: string | null; end: string | null } {
  const [start, end] = clean(value).split(/\s+-\s+/);
  return { start: italianDate(start ?? null), end: italianDate(end ?? null) };
}

function italianDate(value: string | null): string | null {
  const match = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(clean(value));
  if (!match) return null;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function xmlTag(block: string, tagName: string): string | null {
  return new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i").exec(block)?.[1] ?? null;
}

function cleanActType(value: string | null): string | null {
  return nullable(clean(value).replace(/\s+NR\.?\s+.*$/i, ""));
}

function registryNumber(value: string | null): string | null {
  const number = clean(value);
  return number && number !== "0" ? number : null;
}

function actNumber(value: string | null): string | null {
  return registryNumber(/\bNR\.?\s*([A-Z0-9/-]+)/i.exec(clean(value))?.[1] ?? null);
}

function headerKey(value: string): string {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function stripHtml(value: string): string {
  return clean(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function nullable(value: string | null | undefined): string | null {
  const normalized = clean(value ?? null);
  return normalized ? normalized : null;
}

function clean(value: string | null | undefined): string {
  return decodeEntities(value ?? "").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    deg: "deg",
    agrave: "a",
    egrave: "e",
    eacute: "e",
    igrave: "i",
    ograve: "o",
    ugrave: "u",
  };
  return value.replace(/&(#[0-9]+|#x[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    const lower = code.toLowerCase();
    if (lower.startsWith("#x")) return codePoint(Number.parseInt(lower.slice(2), 16), entity);
    if (lower.startsWith("#")) return codePoint(Number.parseInt(lower.slice(1), 10), entity);
    return named[lower] ?? entity;
  });
}

function codePoint(value: number, fallback: string): string {
  if (!Number.isFinite(value)) return fallback;
  try {
    return String.fromCodePoint(value);
  } catch {
    return fallback;
  }
}

function verificationStatus(method: AlboFetchMethod): VerificationStatus {
  return method === "print-fallback" || method === "html-fallback"
    ? "verification_required"
    : "official_source_acquired";
}

function countVisibility(items: AlboItem[], visibility: PublicVisibility): number {
  return items.filter((item) => item.public_visibility === visibility).length;
}

function inferInputFormat(filePath: string): NonNullable<CliOptions["inputFormat"]> {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".xml") return "xml";
  if (extension === ".csv") return "csv";
  if (extension === ".html" || extension === ".htm") return "html";
  throw new Error(`Cannot infer input format from ${filePath}; pass --input-format.`);
}

function parseInputFormat(value: string): NonNullable<CliOptions["inputFormat"]> {
  if (value === "xml" || value === "csv" || value === "html" || value === "print") return value;
  throw new Error(`Unsupported input format: ${value}`);
}

function valueAfter(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${flag}.`);
  return value;
}

function usage(): string {
  return [
    "Usage: pnpm albo:fetch [--out-dir data] [--from-file fixture.xml] [--input-format xml|csv|html|print] [--retrieved-at ISO_DATE]",
    "",
    "Fetches the Comune di Lamezia Terme Albo Pretorio from Tinnvision.",
    "The command tries XML and CSV exports first, then falls back to print/HTML parsing only when needed.",
  ].join("\n");
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function romeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function isSnapshot(value: unknown): value is AlboRawSnapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { records?: unknown }).records) &&
    typeof (value as { source?: unknown }).source === "string" &&
    typeof (value as { source_url?: unknown }).source_url === "string" &&
    typeof (value as { retrieved_at?: unknown }).retrieved_at === "string"
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()))];
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  const result = await runAlboIngestion(parseArgs(process.argv.slice(2)));
  console.log(result.runLog);
  console.log(`Snapshot corrente: ${result.paths.currentSnapshot}`);
  console.log(`Snapshot storico: ${result.paths.historySnapshot}`);
  console.log(`Output pubblico: ${result.paths.publicLatest}`);
  console.log(`Diff pubblico: ${result.paths.publicDiff}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(formatError(error));
    process.exitCode = 1;
  });
}
