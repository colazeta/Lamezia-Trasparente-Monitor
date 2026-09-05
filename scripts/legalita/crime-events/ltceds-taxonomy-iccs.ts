import { createHash } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ISTAT_ICCS_SOURCE_URL =
  "https://www.istat.it/classificazione/classificazione-internazionale-dei-reati/";
export const ISTAT_OPEN_DATA_URL = "https://www.istat.it/dati/open-data/";
export const ISTAT_LEGAL_NOTES_URL = "https://www.istat.it/note-legali/";
export const LTCEDS_ICCS_PARSER_VERSION = "1.0.0" as const;
export const MIN_EXPECTED_ICCS_NODE_COUNT = 300;
export const EXPECTED_ICCS_ROOT_CODES = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
] as const;

const ICCS_CODE_RE = /^\d{2}(?:\.\d+)*$/;

export interface LtcedsIccsNode {
  code: string;
  labelIt: string;
  labelEn: string;
  parentCode: string;
  depth: number;
}

export interface LtcedsIccsSnapshot {
  schema_version: "1.0";
  taxonomy_namespace: "iccs";
  parser_version: typeof LTCEDS_ICCS_PARSER_VERSION;
  retrieved_at: string;
  source: {
    provider: "Istat";
    source_url: typeof ISTAT_ICCS_SOURCE_URL;
    source_page_publication_date: "2023-03-16";
    source_content_sha256: string;
    licence: "CC BY 4.0";
    licence_url: "https://creativecommons.org/licenses/by/4.0/";
    attribution: "Istat — Classificazione internazionale dei reati";
  };
  node_count: number;
  root_codes: string[];
  nodes: LtcedsIccsNode[];
}

export interface LtcedsIccsManifest {
  schema_version: "1.0";
  generated_at: string;
  taxonomy_namespace: "iccs";
  parser_version: typeof LTCEDS_ICCS_PARSER_VERSION;
  source_url: typeof ISTAT_ICCS_SOURCE_URL;
  source_content_sha256: string;
  snapshot_sha256: string;
  node_count: number;
  root_codes: string[];
  publication_policy: "source-faithful-no-manual-remapping";
  licence: "CC BY 4.0";
  limitations: string[];
}

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
      if (token.startsWith("#x") || token.startsWith("#X")) {
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

function htmlCellText(value: string): string {
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

function rowCells(rowHtml: string): string[] {
  return [...rowHtml.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
    (match) => htmlCellText(match[1] ?? ""),
  );
}

function nodeDepth(code: string): number {
  return code.split(".").length;
}

function sortCodes(left: string, right: string): number {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index];
    const rightPart = rightParts[index];
    if (leftPart === undefined) return -1;
    if (rightPart === undefined) return 1;
    if (leftPart !== rightPart) return leftPart - rightPart;
  }
  return left.localeCompare(right);
}

function dataNodeFromCells(cells: readonly string[]): LtcedsIccsNode | null {
  const codeIndex = cells.findIndex((cell) => ICCS_CODE_RE.test(cell));
  if (codeIndex < 0) return null;

  const code = cells[codeIndex]!;
  const labelIt = cells[codeIndex + 1]?.trim() ?? "";
  const labelEn = cells[codeIndex + 2]?.trim() ?? "";
  const parentCode = cells.slice(codeIndex + 3).find((cell) => ICCS_CODE_RE.test(cell));

  if (!labelIt || !labelEn || !parentCode) return null;

  return {
    code,
    labelIt,
    labelEn,
    parentCode,
    depth: nodeDepth(code),
  };
}

export function parseIstatIccsHtml(html: string): LtcedsIccsNode[] {
  if (!html.trim()) throw new Error("Istat ICCS HTML is empty");

  const tableCandidates = [...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)].map(
    (match) => match[0],
  );
  const table = tableCandidates.find((candidate) => {
    const text = htmlCellText(candidate).toUpperCase();
    return (
      text.includes("DESCRIZIONE") &&
      text.includes("DESCRIZIONE EN") &&
      text.includes("ID PADRE")
    );
  });
  if (!table) {
    throw new Error(
      "Istat ICCS table not found: expected DESCRIZIONE / DESCRIZIONE EN / ID PADRE headers",
    );
  }

  const nodes = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)]
    .map((match) => dataNodeFromCells(rowCells(match[0])))
    .filter((node): node is LtcedsIccsNode => node !== null);

  const byCode = new Map<string, LtcedsIccsNode>();
  for (const node of nodes) {
    if (byCode.has(node.code)) {
      throw new Error(`Duplicate ICCS code in Istat source: ${node.code}`);
    }
    byCode.set(node.code, node);
  }

  return [...byCode.values()].sort((left, right) => sortCodes(left.code, right.code));
}

export function validateIccsNodes(
  nodes: readonly LtcedsIccsNode[],
  options: {
    minimumNodeCount?: number;
    expectedRootCodes?: readonly string[];
  } = {},
): void {
  const minimumNodeCount = options.minimumNodeCount ?? MIN_EXPECTED_ICCS_NODE_COUNT;
  const expectedRootCodes = options.expectedRootCodes ?? EXPECTED_ICCS_ROOT_CODES;

  if (nodes.length < minimumNodeCount) {
    throw new Error(
      `ICCS source drift suspected: expected at least ${minimumNodeCount} nodes, found ${nodes.length}`,
    );
  }

  const byCode = new Map(nodes.map((node) => [node.code, node]));
  for (const node of nodes) {
    if (!ICCS_CODE_RE.test(node.code)) {
      throw new Error(`Invalid ICCS code: ${node.code}`);
    }
    if (!node.labelIt.trim() || !node.labelEn.trim()) {
      throw new Error(`ICCS node ${node.code} is missing a label`);
    }
    if (node.depth !== nodeDepth(node.code)) {
      throw new Error(`ICCS node ${node.code} has inconsistent depth`);
    }
    if (node.parentCode !== node.code && !byCode.has(node.parentCode)) {
      throw new Error(
        `ICCS node ${node.code} refers to missing parent ${node.parentCode}`,
      );
    }
  }

  const roots = new Set(
    nodes.filter((node) => node.parentCode === node.code).map((node) => node.code),
  );
  for (const expected of expectedRootCodes) {
    if (!roots.has(expected)) {
      throw new Error(`ICCS source drift suspected: missing expected root ${expected}`);
    }
  }
}

export function buildIstatIccsSnapshot(input: {
  html: string;
  retrievedAt: string;
  minimumNodeCount?: number;
  expectedRootCodes?: readonly string[];
}): LtcedsIccsSnapshot {
  if (!Number.isFinite(Date.parse(input.retrievedAt))) {
    throw new Error("retrievedAt must be an ISO date/date-time");
  }
  const nodes = parseIstatIccsHtml(input.html);
  validateIccsNodes(nodes, {
    minimumNodeCount: input.minimumNodeCount,
    expectedRootCodes: input.expectedRootCodes,
  });
  const roots = nodes
    .filter((node) => node.parentCode === node.code)
    .map((node) => node.code)
    .sort(sortCodes);

  return {
    schema_version: "1.0",
    taxonomy_namespace: "iccs",
    parser_version: LTCEDS_ICCS_PARSER_VERSION,
    retrieved_at: input.retrievedAt,
    source: {
      provider: "Istat",
      source_url: ISTAT_ICCS_SOURCE_URL,
      source_page_publication_date: "2023-03-16",
      source_content_sha256: sha256(input.html),
      licence: "CC BY 4.0",
      licence_url: "https://creativecommons.org/licenses/by/4.0/",
      attribution: "Istat — Classificazione internazionale dei reati",
    },
    node_count: nodes.length,
    root_codes: roots,
    nodes,
  };
}

export function buildIstatIccsManifest(
  snapshot: LtcedsIccsSnapshot,
): LtcedsIccsManifest {
  const snapshotJson = `${JSON.stringify(snapshot, null, 2)}\n`;
  return {
    schema_version: "1.0",
    generated_at: snapshot.retrieved_at,
    taxonomy_namespace: "iccs",
    parser_version: snapshot.parser_version,
    source_url: snapshot.source.source_url,
    source_content_sha256: snapshot.source.source_content_sha256,
    snapshot_sha256: sha256(snapshotJson),
    node_count: snapshot.node_count,
    root_codes: [...snapshot.root_codes],
    publication_policy: "source-faithful-no-manual-remapping",
    licence: "CC BY 4.0",
    limitations: [
      "The snapshot reproduces the ICCS hierarchy exposed by Istat; it does not infer Italian legal classifications.",
      "Istat catalogue-to-ICCS mappings are a separate resource and are not reconstructed from labels.",
      "A changed source hash requires review before replacing a previous snapshot.",
    ],
  };
}

async function fetchIstatIccsHtml(): Promise<string> {
  const response = await fetch(ISTAT_ICCS_SOURCE_URL, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Lamezia-Trasparente-Monitor/ltceds-taxonomy",
    },
  });
  if (!response.ok) {
    throw new Error(`Istat ICCS request failed (${response.status})`);
  }
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error(`Istat ICCS response is not HTML: ${contentType || "unknown"}`);
  }
  return response.text();
}

async function writeAtomically(filePath: string, content: string): Promise<void> {
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, content, "utf8");
  await rename(temporaryPath, filePath);
}

export async function materializeIstatIccs(options: {
  outputDirectory: string;
  retrievedAt?: string;
}): Promise<{ snapshotPath: string; manifestPath: string; nodeCount: number }> {
  const html = await fetchIstatIccsHtml();
  const retrievedAt = options.retrievedAt ?? new Date().toISOString();
  const snapshot = buildIstatIccsSnapshot({ html, retrievedAt });
  const manifest = buildIstatIccsManifest(snapshot);

  await mkdir(options.outputDirectory, { recursive: true });
  const snapshotPath = path.join(options.outputDirectory, "iccs-istat-current.json");
  const manifestPath = path.join(options.outputDirectory, "iccs-istat-manifest.json");
  await writeAtomically(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeAtomically(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return { snapshotPath, manifestPath, nodeCount: snapshot.node_count };
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "..",
  );
  const outputDirectory = path.join(
    repoRoot,
    "data",
    "legalita",
    "ltceds",
    "taxonomy",
  );
  const result = await materializeIstatIccs({ outputDirectory });
  console.log(
    JSON.stringify(
      {
        source: ISTAT_ICCS_SOURCE_URL,
        nodeCount: result.nodeCount,
        outputs: [result.snapshotPath, result.manifestPath].map((filePath) =>
          path.relative(repoRoot, filePath),
        ),
      },
      null,
      2,
    ),
  );
}

const invokedAsScript = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;
if (invokedAsScript) await main();
