import type { TinnvisionProcurementRecord } from "../../artifacts/lamezia-trasparente/src/lib/tinnvisionProcurement";
import { classifyProcurementIdentifier } from "../../artifacts/lamezia-trasparente/src/lib/procurementIdentifiers";

const AUTHORITY_TAX_ID = "00301390795";
const BASE_URL = "https://trasparenza.tinnvision.cloud";

export type ParsedTinnvisionPage = {
  page: number;
  reportedTotalElements: number | null;
  reportedTotalPages: number | null;
  records: TinnvisionProcurementRecord[];
};

export function parseTinnvisionProcurementPage(
  html: string,
  page: number,
): ParsedTinnvisionPage {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Tinnvision page number must be a positive integer");
  }
  const table = selectProcurementTable(html);
  if (!table) {
    throw new Error("Tinnvision procurement table not found");
  }
  const headers = extractCells(table, "th").map(normalizeLabel);
  const column = resolveColumns(headers);
  const records: TinnvisionProcurementRecord[] = [];

  for (const row of table.match(/<tr\b[\s\S]*?<\/tr>/giu) ?? []) {
    const detail = extractDetailLink(row);
    if (!detail) continue;
    const cells = extractCells(row, "td").map(cellText);
    if (cells.length === 0) continue;
    const rawCig = cellAt(cells, column.cig);
    const cigCandidates = extractCigCandidates(rawCig);
    const cigs = cigCandidates.filter(isFormallyValidCig);
    const invalidCigs = cigCandidates.filter((cig) => !cigs.includes(cig));
    const completion = parseCompletionDates(cellAt(cells, column.completion));
    const object =
      cellAt(cells, column.object) ||
      extractAnchorText(row, detail.href) ||
      `Procedura Tinnvision ${detail.year}/${detail.recordId}`;

    records.push({
      sourceId: `tinn:${detail.year}:${detail.recordId}`,
      recordYear: detail.year,
      recordId: detail.recordId,
      detailUrl: detail.url,
      proposer: nullable(cellAt(cells, column.proposer)),
      choiceProcedure: nullable(cellAt(cells, column.choiceProcedure)),
      object,
      rawCig: nullable(rawCig),
      cigCandidates,
      cigs,
      invalidCigs,
      invitedOperators: nullable(cellAt(cells, column.invitedOperators)),
      awardee: nullable(cellAt(cells, column.awardee)),
      startDate: completion.startDate,
      endDate: completion.endDate,
      awardAmount: parseItalianMoney(cellAt(cells, column.awardAmount)),
      liquidatedAmount: parseItalianMoney(cellAt(cells, column.liquidatedAmount)),
      procedureType: nullable(cellAt(cells, column.procedureType)),
      procedureNumber: nullable(cellAt(cells, column.procedureNumber)),
      sourcePage: page,
    });
  }

  const reportedTotalElements = parseTotalElements(html);
  const reportedTotalPages =
    reportedTotalElements === null
      ? parseTotalPages(html)
      : Math.ceil(reportedTotalElements / 30);

  return {
    page,
    reportedTotalElements,
    reportedTotalPages,
    records,
  };
}

export function parseTotalElements(html: string): number | null {
  const text = cellText(html);
  const candidates = [
    /\b(?:totale\s*)?(\d{1,6})\s+elementi\b/iu,
    /\b(\d{1,6})\s+risultati\b/iu,
    /\bnumero\s+elementi\s*[:\-]?\s*(\d{1,6})\b/iu,
  ];
  for (const pattern of candidates) {
    const value = Number(pattern.exec(text)?.[1]);
    if (Number.isInteger(value) && value >= 0) return value;
  }
  return null;
}

export function parseTotalPages(html: string): number | null {
  const text = cellText(html);
  const explicit = /\b(?:pagina\s*)?\d+\s*(?:\/|di)\s*(\d{1,5})\b/iu.exec(text);
  if (explicit) {
    const value = Number(explicit[1]);
    if (Number.isInteger(value) && value >= 1) return value;
  }
  const pages = Array.from(
    html.matchAll(/[?&](?:amp;)?page=(\d{1,5})\b/giu),
    (match) => Number(match[1]),
  ).filter((value) => Number.isInteger(value) && value >= 1);
  return pages.length > 0 ? Math.max(...pages) : null;
}

function selectProcurementTable(html: string): string | null {
  const tables = html.match(/<table\b[\s\S]*?<\/table>/giu) ?? [];
  return (
    tables.find((table) =>
      /bandodigara\/00301390795\/2\/\d{4}\//iu.test(table),
    ) ?? null
  );
}

function extractDetailLink(row: string): {
  href: string;
  url: string;
  year: number;
  recordId: string;
} | null {
  const links = Array.from(
    row.matchAll(/href\s*=\s*["']([^"']+)["']/giu),
    (match) => decodeHtml(match[1]),
  );
  for (const href of links) {
    const match = /\/traspamm\/bandodigara\/00301390795\/2\/(\d{4})\/([^/?#"']+)/iu.exec(
      href,
    );
    if (!match) continue;
    const year = Number(match[1]);
    if (!Number.isInteger(year)) continue;
    const url = new URL(href, BASE_URL);
    if (!isOfficialTinnvisionUrl(url)) continue;
    return {
      href,
      url: url.toString(),
      year,
      recordId: decodeURIComponent(match[2]),
    };
  }
  return null;
}

function extractAnchorText(row: string, href: string): string | null {
  const escaped = escapeRegExp(href);
  const match = new RegExp(
    `<a\\b[^>]*href\\s*=\\s*["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/a>`,
    "iu",
  ).exec(row);
  return nullable(match ? cellText(match[1]) : "");
}

function extractCells(fragment: string, tag: "th" | "td"): string[] {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "giu");
  return Array.from(fragment.matchAll(pattern), (match) => match[1]);
}

function resolveColumns(headers: string[]) {
  const find = (...needles: string[]) =>
    headers.findIndex((header) => needles.some((needle) => header.includes(needle)));
  const indexes = {
    proposer: find("struttura proponente"),
    choiceProcedure: find("procedura di scelta", "scelta del contraente"),
    object: find("oggetto del bando", "oggetto"),
    cig: find("cig", "smartcig"),
    invitedOperators: find("operatori invitati", "offerenti", "partecipato al procedimento"),
    awardee: find("aggiudicatario"),
    completion: find("tempi di completamento", "completamento"),
    awardAmount: find("importo di aggiudicazione", "importo aggiudicazione"),
    liquidatedAmount: find("somme liquidate", "importo liquidato"),
    procedureType: find("tipologia di procedura", "tipo procedura"),
    procedureNumber: find("numero fte", "numero procedura", "id procedura"),
  };

  // The official server-rendered section currently exposes these eleven columns
  // in this stable order. Header matching remains primary; positional fallback
  // makes the parser resilient to minor label wording changes without guessing
  // when the table shape itself changes.
  const fallback = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const keys = Object.keys(indexes) as Array<keyof typeof indexes>;
  keys.forEach((key, index) => {
    if (indexes[key] === -1) indexes[key] = fallback[index];
  });
  return indexes;
}

function extractCigCandidates(value: string): string[] {
  if (!value) return [];
  const candidates = Array.from(
    value.toUpperCase().matchAll(/\b[A-Z0-9]{10}\b/gu),
    (match) => match[0],
  );
  return unique(candidates);
}

function isFormallyValidCig(value: string): boolean {
  const classification = classifyProcurementIdentifier(value);
  return (
    classification.type === "cig" &&
    classification.formallyValid &&
    classification.normalized === value
  );
}

function parseCompletionDates(value: string): {
  startDate: string | null;
  endDate: string | null;
} {
  const dates = Array.from(
    value.matchAll(/\b(\d{2})[/.\-](\d{2})[/.\-](\d{4})\b/gu),
    (match) => `${match[3]}-${match[2]}-${match[1]}`,
  );
  return {
    startDate: dates[0] ?? null,
    endDate: dates[1] ?? null,
  };
}

export function parseItalianMoney(value: string): number | null {
  const cleaned = value
    .replace(/\s+/gu, "")
    .replace(/[€]/gu, "")
    .replace(/[^0-9,.-]/gu, "");
  if (!cleaned) return null;
  const comma = cleaned.lastIndexOf(",");
  const dot = cleaned.lastIndexOf(".");
  let normalized = cleaned;
  if (comma > dot) {
    normalized = cleaned.replace(/\./gu, "").replace(",", ".");
  } else if (dot > comma && comma !== -1) {
    normalized = cleaned.replace(/,/gu, "");
  } else if (comma !== -1) {
    normalized = cleaned.replace(",", ".");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function cellAt(cells: string[], index: number): string {
  return index >= 0 && index < cells.length ? cells[index] : "";
}

function cellText(fragment: string): string {
  return decodeHtml(
    fragment
      .replace(/<br\s*\/?\s*>/giu, " ")
      .replace(/<[^>]+>/gu, " ")
      .replace(/\s+/gu, " ")
      .trim(),
  );
}

function normalizeLabel(value: string): string {
  return cellText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/\s+/gu, " ")
    .trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&quot;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/&#(\d+);/gu, (_, value: string) => String.fromCodePoint(Number(value)))
    .replace(/&#x([0-9a-f]+);/giu, (_, value: string) =>
      String.fromCodePoint(Number.parseInt(value, 16)),
    )
    .replace(/\s+/gu, " ")
    .trim();
}

function nullable(value: string): string | null {
  const cleaned = value.trim();
  return cleaned && cleaned !== "-" ? cleaned : null;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function isOfficialTinnvisionUrl(url: URL): boolean {
  return (
    url.protocol === "https:" &&
    (url.hostname === "trasparenza.tinnvision.cloud" ||
      url.hostname === "trasparenza.tinnservice.com") &&
    url.pathname.includes(`/traspamm/bandodigara/${AUTHORITY_TAX_ID}/`)
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
