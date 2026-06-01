import {
  db,
  opendataDatasetsTable,
  opendataResourcesTable,
  feedStatusTable,
  type InsertOpendataDataset,
  type InsertOpendataResource,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export const OPENDATA_SOURCE = "opendata-lamezia";
export const OPENDATA_LABEL =
  "Open Data – Comune di Lamezia Terme";
export const OPENDATA_PORTAL_URL =
  "https://opendata.comune.lamezia-terme.cz.it";

// Maggioli / Municipium open-data backend powering the official portal.
const API_BASE = "https://dataportal.maggioli.cloud/api/v1/mgg-od/datasets";
const COD_ENTE = "188067-opendata";
const ORGANIZATION = "comune-di-lamezia-terme";
const DATASET_PORTAL_BASE =
  "https://www.opendata.maggioli.cloud/dataset";
const PAGE_SIZE = 20;
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) rendiamoLameziaTrasparente/1.0";

type RawResource = {
  id?: string;
  name?: string;
  description?: string | null;
  format?: string | null;
  url?: string | null;
  position?: number | null;
  lastModified?: string | null;
};

type RawExtra = { key?: string; value?: string };

type RawDataset = {
  id?: string;
  name?: string;
  title?: string;
  notes?: string | null;
  holderName?: string | null;
  licenseId?: string | null;
  licenseTitle?: string | null;
  metadataModified?: string | null;
  resources?: RawResource[];
  tags?: { displayName?: string; name?: string }[];
  groups?: { displayName?: string; title?: string; name?: string }[];
  extras?: RawExtra[];
};

type RawListResponse = {
  count?: number;
  items?: RawDataset[];
};

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function firstTheme(extras: RawExtra[]): string | null {
  const themeRaw = extras.find((e) => e.key === "theme")?.value;
  if (!themeRaw) return null;
  try {
    const parsed = JSON.parse(themeRaw);
    if (Array.isArray(parsed) && parsed.length) return String(parsed[0]);
  } catch {
    // value was not JSON – use as-is.
    return themeRaw.replace(/[[\]"]/g, "").split(",")[0]?.trim() || null;
  }
  return null;
}

function extraValue(extras: RawExtra[], key: string): string | null {
  const v = extras.find((e) => e.key === key)?.value;
  return v && v.trim().length ? v.trim() : null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      Origin: OPENDATA_PORTAL_URL,
      Referer: `${OPENDATA_PORTAL_URL}/`,
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed with status ${res.status} for ${url}`);
  }
  return (await res.json()) as T;
}

async function fetchAllDatasets(): Promise<RawDataset[]> {
  const byId = new Map<string, RawDataset>();
  let start = 0;
  let count = Infinity;
  // Solr-style pagination: `start` is the offset, `rows` the page size.
  // `rows` is capped server-side at 20, so we walk the offset by PAGE_SIZE.
  // (The `page`/`size` params are silently ignored and always return page 0.)
  while (start < count && start < 2000) {
    const url =
      `${API_BASE}?cod-ente=${COD_ENTE}` +
      `&organizations=${ORGANIZATION}&start=${start}&rows=${PAGE_SIZE}`;
    const data = await fetchJson<RawListResponse>(url);
    if (typeof data.count === "number") count = data.count;
    const items = data.items ?? [];
    if (items.length === 0) break;
    for (const item of items) {
      if (item.id) byId.set(item.id, item);
    }
    start += PAGE_SIZE;
  }
  return Array.from(byId.values());
}

function mapDataset(raw: RawDataset): {
  dataset: InsertOpendataDataset;
  resources: RawResource[];
} | null {
  const sourceId = raw.id;
  if (!sourceId || !raw.title) return null;

  const extras = raw.extras ?? [];
  const group = raw.groups?.[0];
  const tags = (raw.tags ?? [])
    .map((t) => t.displayName ?? t.name ?? "")
    .filter((t) => t.length > 0);
  const resources = (raw.resources ?? []).filter((r) => r.url);

  const dataset: InsertOpendataDataset = {
    sourceId,
    slug: raw.name ?? null,
    title: raw.title,
    description: raw.notes?.trim() ?? "",
    category: group?.displayName ?? group?.title ?? null,
    theme: firstTheme(extras),
    frequency:
      extraValue(extras, "frequency") ??
      extraValue(extras, "accrualPeriodicity"),
    licenseId: raw.licenseId ?? null,
    licenseTitle: raw.licenseTitle ?? null,
    holderName: raw.holderName ?? null,
    portalUrl: `${DATASET_PORTAL_BASE}/${sourceId}`,
    tags,
    resourceCount: resources.length,
    metadataModified: parseDate(raw.metadataModified),
  };

  return { dataset, resources };
}

export async function runOpendataIngestion(): Promise<{
  total: number;
  upserted: number;
}> {
  logger.info({ source: OPENDATA_SOURCE }, "Starting opendata ingestion");
  try {
    const rawDatasets = await fetchAllDatasets();
    const mapped = rawDatasets
      .map(mapDataset)
      .filter((m): m is NonNullable<typeof m> => m !== null);

    const now = new Date();
    let upserted = 0;

    for (const { dataset, resources } of mapped) {
      const [row] = await db
        .insert(opendataDatasetsTable)
        .values({ ...dataset, firstSeenAt: now, lastSeenAt: now })
        .onConflictDoUpdate({
          target: opendataDatasetsTable.sourceId,
          set: {
            slug: dataset.slug,
            title: dataset.title,
            description: dataset.description,
            category: dataset.category,
            theme: dataset.theme,
            frequency: dataset.frequency,
            licenseId: dataset.licenseId,
            licenseTitle: dataset.licenseTitle,
            holderName: dataset.holderName,
            portalUrl: dataset.portalUrl,
            tags: dataset.tags,
            resourceCount: dataset.resourceCount,
            metadataModified: dataset.metadataModified,
            lastSeenAt: now,
          },
        })
        .returning({ id: opendataDatasetsTable.id });

      const datasetId = row.id;
      upserted += 1;

      for (const r of resources) {
        if (!r.id || !r.url) continue;
        const resource: InsertOpendataResource = {
          sourceId: r.id,
          datasetId,
          name: r.name ?? "",
          description: r.description ?? null,
          format: r.format ? r.format.toUpperCase() : null,
          url: r.url,
          position: typeof r.position === "number" ? r.position : 0,
          lastModified: parseDate(r.lastModified),
        };
        await db
          .insert(opendataResourcesTable)
          .values({ ...resource, firstSeenAt: now, lastSeenAt: now })
          .onConflictDoUpdate({
            target: opendataResourcesTable.sourceId,
            set: {
              datasetId: resource.datasetId,
              name: resource.name,
              description: resource.description,
              format: resource.format,
              url: resource.url,
              position: resource.position,
              lastModified: resource.lastModified,
              lastSeenAt: now,
            },
          });
      }
    }

    await db
      .insert(feedStatusTable)
      .values({
        source: OPENDATA_SOURCE,
        label: OPENDATA_LABEL,
        url: OPENDATA_PORTAL_URL,
        status: "ok",
        error: null,
        itemsTotal: mapped.length,
        itemsNew: upserted,
        lastCheckedAt: now,
        lastUpdatedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: {
          status: "ok",
          error: null,
          itemsTotal: mapped.length,
          itemsNew: upserted,
          lastCheckedAt: now,
          lastUpdatedAt: now,
        },
      });

    logger.info(
      { source: OPENDATA_SOURCE, total: mapped.length, upserted },
      "Opendata ingestion complete",
    );
    return { total: mapped.length, upserted };
  } catch (err) {
    logger.error({ err, source: OPENDATA_SOURCE }, "Opendata ingestion failed");
    const now = new Date();
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    await db
      .insert(feedStatusTable)
      .values({
        source: OPENDATA_SOURCE,
        label: OPENDATA_LABEL,
        url: OPENDATA_PORTAL_URL,
        status: "error",
        error: message,
        lastCheckedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: { status: "error", error: message, lastCheckedAt: now },
      });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Tabular resource parsing (for the generic viewer)
// ---------------------------------------------------------------------------

export type ColumnType = "number" | "date" | "string";

export type TableColumn = { name: string; type: ColumnType };

export type ParsedTable = {
  columns: TableColumn[];
  rows: Record<string, string | number | null>[];
  rowCount: number;
  truncated: boolean;
};

const MAX_ROWS = 5000;
const RESOURCE_CACHE_TTL_MS = 30 * 60 * 1000;
const resourceCache = new Map<
  string,
  { at: number; table: ParsedTable }
>();

function detectDelimiter(headerLine: string): string {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = -1;
  for (const c of candidates) {
    const count = headerLine.split(c).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

// Minimal RFC-4180-ish CSV parser (handles quoted fields, escaped quotes,
// and newlines inside quotes).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let delimiter: string | null = null;

  // Strip a UTF-8 BOM if present.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  if (delimiter === null) {
    const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
    delimiter = detectDelimiter(firstLine);
  }

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch === "\r") {
      // ignore – handled by the \n branch
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

const DATE_RE =
  /^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}|\s\d{2}:\d{2})?|^\d{2}\/\d{2}\/\d{4}$/;

// Parse a numeric string that may use either Italian ("1.234,56") or
// English ("1,234.56") grouping/decimal conventions, returning null when the
// value is not a plain number. When both separators are present the *last* one
// is treated as the decimal separator; a lone separator followed by exactly 3
// digits is treated as a thousands group, otherwise as a decimal point.
export function parseNumber(v: string): number | null {
  const s = v.trim();
  if (s === "" || !/^[+-]?[\d.,]+$/.test(s)) return null;
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  let normalized: string;

  if (lastDot !== -1 && lastComma !== -1) {
    normalized =
      lastDot > lastComma
        ? s.replace(/,/g, "")
        : s.replace(/\./g, "").replace(",", ".");
  } else if (lastComma !== -1) {
    const after = s.length - lastComma - 1;
    const count = (s.match(/,/g) ?? []).length;
    normalized =
      count === 1 && after !== 3 ? s.replace(",", ".") : s.replace(/,/g, "");
  } else if (lastDot !== -1) {
    const after = s.length - lastDot - 1;
    const count = (s.match(/\./g) ?? []).length;
    normalized = count === 1 && after !== 3 ? s : s.replace(/\./g, "");
  } else {
    normalized = s;
  }

  const n = Number(normalized);
  return Number.isNaN(n) ? null : n;
}

export function isNumeric(v: string): boolean {
  return parseNumber(v) !== null;
}

function toNumber(v: string): number {
  return parseNumber(v) ?? Number.NaN;
}

export function inferColumns(
  headers: string[],
  sample: string[][],
): TableColumn[] {
  return headers.map((name, idx) => {
    let numeric = true;
    let date = true;
    let seen = 0;
    for (const r of sample) {
      const cell = (r[idx] ?? "").trim();
      if (cell === "") continue;
      seen += 1;
      if (!isNumeric(cell)) numeric = false;
      if (!DATE_RE.test(cell)) date = false;
      if (!numeric && !date) break;
    }
    let type: ColumnType = "string";
    if (seen > 0) {
      if (numeric) type = "number";
      else if (date) type = "date";
    }
    return { name, type };
  });
}

function tableFromRecords(
  records: Record<string, unknown>[],
): ParsedTable {
  const headerSet: string[] = [];
  const seen = new Set<string>();
  for (const rec of records) {
    for (const k of Object.keys(rec)) {
      if (!seen.has(k)) {
        seen.add(k);
        headerSet.push(k);
      }
    }
  }
  const truncated = records.length > MAX_ROWS;
  const limited = records.slice(0, MAX_ROWS);
  const sample = limited
    .slice(0, 50)
    .map((rec) => headerSet.map((h) => String(rec[h] ?? "")));
  const columns = inferColumns(headerSet, sample);

  const rows = limited.map((rec) => {
    const out: Record<string, string | number | null> = {};
    for (const col of columns) {
      const raw = rec[col.name];
      if (raw === null || raw === undefined || raw === "") {
        out[col.name] = null;
      } else if (col.type === "number" && isNumeric(String(raw))) {
        out[col.name] = toNumber(String(raw));
      } else {
        out[col.name] = String(raw);
      }
    }
    return out;
  });

  return { columns, rows, rowCount: rows.length, truncated };
}

function parseTabular(text: string, format: string | null): ParsedTable {
  const fmt = (format ?? "").toUpperCase();
  const trimmed = text.trimStart();
  const looksJson =
    fmt === "JSON" || trimmed.startsWith("[") || trimmed.startsWith("{");

  if (looksJson) {
    const parsed = JSON.parse(text);
    let records: Record<string, unknown>[] = [];
    if (Array.isArray(parsed)) {
      records = parsed.filter(
        (x): x is Record<string, unknown> =>
          x !== null && typeof x === "object" && !Array.isArray(x),
      );
    } else if (parsed && typeof parsed === "object") {
      const arr = Object.values(parsed).find((v) => Array.isArray(v));
      if (Array.isArray(arr)) {
        records = (arr as unknown[]).filter(
          (x): x is Record<string, unknown> =>
            x !== null && typeof x === "object" && !Array.isArray(x),
        );
      }
    }
    if (records.length === 0) {
      throw new Error("La risorsa JSON non contiene una tabella di oggetti");
    }
    return tableFromRecords(records);
  }

  // CSV / TSV path.
  const grid = parseCsv(text);
  if (grid.length === 0) {
    throw new Error("La risorsa è vuota");
  }
  const headers = grid[0].map((h, i) => h.trim() || `col_${i + 1}`);
  const dataRows = grid.slice(1);
  const truncated = dataRows.length > MAX_ROWS;
  const limited = dataRows.slice(0, MAX_ROWS);
  const columns = inferColumns(headers, limited.slice(0, 50));

  const rows = limited.map((r) => {
    const out: Record<string, string | number | null> = {};
    columns.forEach((col, idx) => {
      const cell = (r[idx] ?? "").trim();
      if (cell === "") out[col.name] = null;
      else if (col.type === "number" && isNumeric(cell)) out[col.name] = toNumber(cell);
      else out[col.name] = cell;
    });
    return out;
  });

  return { columns, rows, rowCount: rows.length, truncated };
}

export const TABULAR_FORMATS = new Set(["CSV", "TSV", "JSON"]);

export function isTabularFormat(format: string | null | undefined): boolean {
  return TABULAR_FORMATS.has((format ?? "").toUpperCase());
}

export async function loadResourceTable(
  resourceSourceId: string,
  url: string,
  format: string | null,
): Promise<ParsedTable> {
  const cached = resourceCache.get(resourceSourceId);
  if (cached && Date.now() - cached.at < RESOURCE_CACHE_TTL_MS) {
    return cached.table;
  }

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Download della risorsa fallito (status ${res.status})`);
  }
  const text = await res.text();
  const table = parseTabular(text, format);
  resourceCache.set(resourceSourceId, { at: Date.now(), table });
  return table;
}
