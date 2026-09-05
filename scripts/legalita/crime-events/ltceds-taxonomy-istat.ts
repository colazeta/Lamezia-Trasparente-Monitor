import { createHash } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ISTAT_SYNTHETIC_SOURCE_URL =
  "https://www.istat.it/classificazione/classificazione-sintetica-dei-reati/";
export const ISTAT_ANALYTICAL_SOURCE_URL =
  "https://www.istat.it/classificazione/classificazione-analitica-dei-reati/";
export const ISTAT_GROUPS_SOURCE_URL =
  "https://www.istat.it/classificazione/gruppi-di-reato/";
export const LTCEDS_ISTAT_TAXONOMY_PARSER_VERSION = "1.0.0" as const;

export type IstatTaxonomyNamespace =
  | "istat_synthetic"
  | "istat_analytical"
  | "istat_crime_groups";

export interface IstatSyntheticNode {
  code: string;
  labelIt: string;
  labelEn: string;
  validFrom: string | null;
  validTo: string | null;
  parentCode: string;
}

export interface IstatAnalyticalNode {
  code: string;
  labelIt: string;
  labelEn: string;
  validFrom: string | null;
  validTo: string | null;
}

export interface IstatCrimeGroupItem {
  code: string;
  sourceLabel: string;
}

export interface IstatTaxonomySnapshot<T> {
  schema_version: "1.0";
  taxonomy_namespace: IstatTaxonomyNamespace;
  parser_version: typeof LTCEDS_ISTAT_TAXONOMY_PARSER_VERSION;
  retrieved_at: string;
  source: {
    provider: "Istat";
    source_url: string;
    source_page_publication_date: "2023-03-16";
    source_content_sha256: string;
    licence: "CC BY 4.0";
    licence_url: "https://creativecommons.org/licenses/by/4.0/";
    attribution: string;
  };
  item_count: number;
  items: T[];
}

export interface IstatTaxonomyManifest {
  schema_version: "1.0";
  generated_at: string;
  taxonomy_namespace: IstatTaxonomyNamespace;
  parser_version: typeof LTCEDS_ISTAT_TAXONOMY_PARSER_VERSION;
  source_url: string;
  source_content_sha256: string;
  snapshot_sha256: string;
  item_count: number;
  publication_policy: "source-faithful-no-manual-remapping";
  licence: "CC BY 4.0";
  limitations: string[];
}

const GROUP_ANCHORS = ["Cy", "Exp-Mig", "Lo", "Mot", "SiC"] as const;
const GROUP_CODE_RE = /^[A-Za-z][A-Za-z0-9_-]*$/;

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "…",
    ldquo: "“",
    lsquo: "‘",
    lt: "<",
    nbsp: " ",
    quot: '"',
    rdquo: "”",
    rsquo: "’",
  };
  return value.replace(
    /&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi,
    (match, token: string) => {
      if (/^#x/i.test(token)) {
        const codePoint = Number.parseInt(token.slice(2), 16);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
      }
      if (token.startsWith("#")) {
        const codePoint = Number.parseInt(token.slice(1), 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
      }
      return named[token.toLowerCase()] ?? match;
    },
  );
}

function htmlText(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function normaliseHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function rowCells(rowHtml: string): string[] {
  return [...rowHtml.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
    (match) => htmlText(match[1] ?? ""),
  );
}

function findTable(html: string, requiredHeaders: readonly string[]): string {
  const required = requiredHeaders.map(normaliseHeader);
  for (const match of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const table = match[0];
    const headerRow = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)]
      .map((row) => rowCells(row[0]).map(normaliseHeader))
      .find((cells) => required.every((header) => cells.includes(header)));
    if (headerRow) return table;
  }
  throw new Error(`Istat table not found; required headers: ${requiredHeaders.join(", ")}`);
}

function tableRowsByHeader(
  html: string,
  requiredHeaders: readonly string[],
): Array<Record<string, string>> {
  const table = findTable(html, requiredHeaders);
  const rows = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map((match) =>
    rowCells(match[0]),
  );
  const required = requiredHeaders.map(normaliseHeader);
  const headerIndex = rows.findIndex((cells) => {
    const normalised = cells.map(normaliseHeader);
    return required.every((header) => normalised.includes(header));
  });
  if (headerIndex < 0) throw new Error("Istat table header row not found");
  const headers = rows[headerIndex]!.map(normaliseHeader);
  return rows.slice(headerIndex + 1).flatMap((cells) => {
    if (cells.length === 0 || cells.every((cell) => !cell.trim())) return [];
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = cells[index]?.trim() ?? "";
    });
    return [record];
  });
}

function nullable(value: string | undefined): string | null {
  const clean = value?.trim() ?? "";
  return clean && clean !== "-" ? clean : null;
}

function compareCodes(left: string, right: string): number {
  return left.localeCompare(right, "it", { numeric: true, sensitivity: "base" });
}

function uniqueByCode<T extends { code: string }>(items: readonly T[], label: string): T[] {
  const byCode = new Map<string, T>();
  for (const item of items) {
    if (!item.code.trim()) throw new Error(`${label}: empty code`);
    if (byCode.has(item.code)) throw new Error(`${label}: duplicate code ${item.code}`);
    byCode.set(item.code, item);
  }
  return [...byCode.values()].sort((a, b) => compareCodes(a.code, b.code));
}

export function parseIstatSyntheticHtml(html: string): IstatSyntheticNode[] {
  const rows = tableRowsByHeader(html, [
    "ID",
    "DESCRIZIONE",
    "DESCRIZIONE EN",
    "INIZIO VALIDITÀ",
    "FINE VALIDITÀ",
    "ID PADRE",
  ]);
  const nodes = rows.flatMap((row) => {
    const code = row.ID?.trim() ?? "";
    const labelIt = row.DESCRIZIONE?.trim() ?? "";
    const labelEn = row["DESCRIZIONE EN"]?.trim() ?? "";
    const parentCode = row["ID PADRE"]?.trim() ?? "";
    if (!code || !labelIt || !labelEn || !parentCode) return [];
    return [{
      code,
      labelIt,
      labelEn,
      validFrom: nullable(row["INIZIO VALIDITA"]),
      validTo: nullable(row["FINE VALIDITA"]),
      parentCode,
    }];
  });
  return uniqueByCode(nodes, "Istat synthetic classification");
}

export function validateIstatSyntheticNodes(
  nodes: readonly IstatSyntheticNode[],
  minimumNodeCount = 20,
): void {
  if (nodes.length < minimumNodeCount) {
    throw new Error(`Istat synthetic source drift suspected: found ${nodes.length} nodes`);
  }
  const codes = new Set(nodes.map((node) => node.code));
  const roots = nodes.filter((node) => node.parentCode === node.code);
  if (roots.length === 0) throw new Error("Istat synthetic classification has no self-parent root");
  for (const node of nodes) {
    if (!codes.has(node.parentCode)) {
      throw new Error(`Istat synthetic node ${node.code} has missing parent ${node.parentCode}`);
    }
  }
}

export function parseIstatAnalyticalHtml(html: string): IstatAnalyticalNode[] {
  const rows = tableRowsByHeader(html, [
    "ID",
    "DESCRIZIONE",
    "DESCRIZIONE EN",
    "INIZIO VALIDITÀ",
    "FINE VALIDITÀ",
  ]);
  const nodes = rows.flatMap((row) => {
    const code = row.ID?.trim() ?? "";
    const labelIt = row.DESCRIZIONE?.trim() ?? "";
    const labelEn = row["DESCRIZIONE EN"]?.trim() ?? "";
    if (!code || !labelIt || !labelEn) return [];
    return [{
      code,
      labelIt,
      labelEn,
      validFrom: nullable(row["INIZIO VALIDITA"]),
      validTo: nullable(row["FINE VALIDITA"]),
    }];
  });
  return uniqueByCode(nodes, "Istat analytical classification");
}

export function validateIstatAnalyticalNodes(
  nodes: readonly IstatAnalyticalNode[],
  minimumNodeCount = 50,
): void {
  if (nodes.length < minimumNodeCount) {
    throw new Error(`Istat analytical source drift suspected: found ${nodes.length} nodes`);
  }
}

function optionAttribute(optionHtml: string, name: string): string {
  const pattern = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
  return decodeHtmlEntities(pattern.exec(optionHtml)?.[2] ?? "").trim();
}

function codeFromOption(optionHtml: string): { code: string; label: string } | null {
  const value = optionAttribute(optionHtml, "value");
  const text = htmlText(optionHtml);
  if (!text) return null;
  if (GROUP_CODE_RE.test(value) && !/^\d+$/.test(value)) {
    const label = text.replace(new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-–—:]?\\s*`, "i"), "").trim();
    return { code: value, label: label || text };
  }
  const firstToken = text.split(/\s+/)[0] ?? "";
  if (GROUP_CODE_RE.test(firstToken) && /^(?:Cy|Exp-Mig|Lo|Mot|SiC|Sexual)/i.test(firstToken)) {
    const label = text.slice(firstToken.length).replace(/^\s*[-–—:]?\s*/, "").trim();
    return { code: firstToken, label: label || text };
  }
  return null;
}

export function parseIstatCrimeGroupsHtml(html: string): IstatCrimeGroupItem[] {
  const selectCandidates = [...html.matchAll(/<select\b[^>]*>[\s\S]*?<\/select>/gi)].map(
    (match) => match[0],
  );
  const scored = selectCandidates
    .map((select) => {
      const parsed = [...select.matchAll(/<option\b[^>]*>[\s\S]*?<\/option>/gi)]
        .map((match) => codeFromOption(match[0]))
        .filter((item): item is { code: string; label: string } => item !== null);
      const codes = new Set(parsed.map((item) => item.code));
      const anchorScore = GROUP_ANCHORS.filter((anchor) => codes.has(anchor)).length;
      return { parsed, anchorScore };
    })
    .filter((candidate) => candidate.anchorScore >= 3);

  if (scored.length === 0) {
    throw new Error("Istat crime-groups select not found: expected group-code anchors");
  }
  const best = scored.sort((a, b) => b.anchorScore - a.anchorScore || b.parsed.length - a.parsed.length)[0]!;
  return uniqueByCode(
    best.parsed.map((item) => ({ code: item.code, sourceLabel: item.label })),
    "Istat crime groups",
  );
}

export function validateIstatCrimeGroups(
  items: readonly IstatCrimeGroupItem[],
  minimumItemCount = 20,
): void {
  if (items.length < minimumItemCount) {
    throw new Error(`Istat crime-groups source drift suspected: found ${items.length} items`);
  }
  const codes = new Set(items.map((item) => item.code));
  for (const anchor of GROUP_ANCHORS) {
    if (!codes.has(anchor)) throw new Error(`Istat crime-groups source drift: missing ${anchor}`);
  }
}

function buildSnapshot<T>(input: {
  namespace: IstatTaxonomyNamespace;
  sourceUrl: string;
  attribution: string;
  html: string;
  retrievedAt: string;
  items: T[];
}): IstatTaxonomySnapshot<T> {
  if (!Number.isFinite(Date.parse(input.retrievedAt))) {
    throw new Error("retrievedAt must be an ISO date/date-time");
  }
  return {
    schema_version: "1.0",
    taxonomy_namespace: input.namespace,
    parser_version: LTCEDS_ISTAT_TAXONOMY_PARSER_VERSION,
    retrieved_at: input.retrievedAt,
    source: {
      provider: "Istat",
      source_url: input.sourceUrl,
      source_page_publication_date: "2023-03-16",
      source_content_sha256: sha256(input.html),
      licence: "CC BY 4.0",
      licence_url: "https://creativecommons.org/licenses/by/4.0/",
      attribution: input.attribution,
    },
    item_count: input.items.length,
    items: input.items,
  };
}

export function buildIstatSyntheticSnapshot(input: { html: string; retrievedAt: string }): IstatTaxonomySnapshot<IstatSyntheticNode> {
  const items = parseIstatSyntheticHtml(input.html);
  validateIstatSyntheticNodes(items);
  return buildSnapshot({
    namespace: "istat_synthetic",
    sourceUrl: ISTAT_SYNTHETIC_SOURCE_URL,
    attribution: "Istat — Classificazione sintetica dei reati",
    html: input.html,
    retrievedAt: input.retrievedAt,
    items,
  });
}

export function buildIstatAnalyticalSnapshot(input: { html: string; retrievedAt: string }): IstatTaxonomySnapshot<IstatAnalyticalNode> {
  const items = parseIstatAnalyticalHtml(input.html);
  validateIstatAnalyticalNodes(items);
  return buildSnapshot({
    namespace: "istat_analytical",
    sourceUrl: ISTAT_ANALYTICAL_SOURCE_URL,
    attribution: "Istat — Classificazione analitica dei reati",
    html: input.html,
    retrievedAt: input.retrievedAt,
    items,
  });
}

export function buildIstatCrimeGroupsSnapshot(input: { html: string; retrievedAt: string }): IstatTaxonomySnapshot<IstatCrimeGroupItem> {
  const items = parseIstatCrimeGroupsHtml(input.html);
  validateIstatCrimeGroups(items);
  return buildSnapshot({
    namespace: "istat_crime_groups",
    sourceUrl: ISTAT_GROUPS_SOURCE_URL,
    attribution: "Istat — Gruppi di reato",
    html: input.html,
    retrievedAt: input.retrievedAt,
    items,
  });
}

export function buildIstatTaxonomyManifest<T>(snapshot: IstatTaxonomySnapshot<T>): IstatTaxonomyManifest {
  const snapshotJson = `${JSON.stringify(snapshot, null, 2)}\n`;
  return {
    schema_version: "1.0",
    generated_at: snapshot.retrieved_at,
    taxonomy_namespace: snapshot.taxonomy_namespace,
    parser_version: snapshot.parser_version,
    source_url: snapshot.source.source_url,
    source_content_sha256: snapshot.source.source_content_sha256,
    snapshot_sha256: sha256(snapshotJson),
    item_count: snapshot.item_count,
    publication_policy: "source-faithful-no-manual-remapping",
    licence: "CC BY 4.0",
    limitations: [
      "This snapshot reproduces an Istat classification surface and does not infer catalogue-to-classification correspondence.",
      "The national offence catalogue and official Istat↔ICCS mappings remain separate resources.",
      "A changed source structure or failed sanity check requires explicit review before replacement.",
    ],
  };
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Lamezia-Trasparente-Monitor/ltceds-taxonomy",
    },
  });
  if (!response.ok) throw new Error(`Istat taxonomy request failed (${response.status}): ${url}`);
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error(`Istat taxonomy response is not HTML: ${url} (${contentType || "unknown"})`);
  }
  return response.text();
}

async function writeAtomically(filePath: string, content: string): Promise<void> {
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, content, "utf8");
  await rename(temporaryPath, filePath);
}

async function writeSnapshot<T>(outputDirectory: string, basename: string, snapshot: IstatTaxonomySnapshot<T>): Promise<string[]> {
  const snapshotPath = path.join(outputDirectory, `${basename}-current.json`);
  const manifestPath = path.join(outputDirectory, `${basename}-manifest.json`);
  const manifest = buildIstatTaxonomyManifest(snapshot);
  await writeAtomically(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeAtomically(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return [snapshotPath, manifestPath];
}

export async function materializeIstatCrimeTaxonomies(options: { outputDirectory: string; retrievedAt?: string }): Promise<{ outputs: string[]; counts: Record<string, number> }> {
  const [syntheticHtml, analyticalHtml, groupsHtml] = await Promise.all([
    fetchHtml(ISTAT_SYNTHETIC_SOURCE_URL),
    fetchHtml(ISTAT_ANALYTICAL_SOURCE_URL),
    fetchHtml(ISTAT_GROUPS_SOURCE_URL),
  ]);
  const retrievedAt = options.retrievedAt ?? new Date().toISOString();
  const synthetic = buildIstatSyntheticSnapshot({ html: syntheticHtml, retrievedAt });
  const analytical = buildIstatAnalyticalSnapshot({ html: analyticalHtml, retrievedAt });
  const groups = buildIstatCrimeGroupsSnapshot({ html: groupsHtml, retrievedAt });

  await mkdir(options.outputDirectory, { recursive: true });
  const outputs = [
    ...(await writeSnapshot(options.outputDirectory, "istat-synthetic", synthetic)),
    ...(await writeSnapshot(options.outputDirectory, "istat-analytical", analytical)),
    ...(await writeSnapshot(options.outputDirectory, "istat-crime-groups", groups)),
  ];
  return {
    outputs,
    counts: {
      istat_synthetic: synthetic.item_count,
      istat_analytical: analytical.item_count,
      istat_crime_groups: groups.item_count,
    },
  };
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
  const outputDirectory = path.join(repoRoot, "data", "legalita", "ltceds", "taxonomy");
  const result = await materializeIstatCrimeTaxonomies({ outputDirectory });
  console.log(JSON.stringify({
    sources: [ISTAT_SYNTHETIC_SOURCE_URL, ISTAT_ANALYTICAL_SOURCE_URL, ISTAT_GROUPS_SOURCE_URL],
    counts: result.counts,
    outputs: result.outputs.map((filePath) => path.relative(repoRoot, filePath)),
  }, null, 2));
}

const invokedAsScript = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;
if (invokedAsScript) await main();
