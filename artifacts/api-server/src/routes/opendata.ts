import { Router, type IRouter } from "express";
import {
  db,
  opendataDatasetsTable,
  opendataResourcesTable,
  opendataSnapshotsTable,
  feedStatusTable,
} from "@workspace/db";
import { and, asc, desc, eq, ilike, max, or, type SQL } from "drizzle-orm";
import {
  OPENDATA_SOURCE,
  OPENDATA_LABEL,
  OPENDATA_PORTAL_URL,
  isTabularFormat,
  loadResourceTable,
  listResourceSnapshots,
  getSnapshotById,
} from "../lib/opendata";
import {
  buildDcatCatalog,
  buildDcatDataset,
  wrapDatasetDocument,
  ckanPackage,
  ckanResource,
  ckanSuccess,
  ckanError,
} from "../lib/dcat";
import type { Request } from "express";

const router: IRouter = Router();

// Public origin (scheme + host) behind the Replit / site proxy. `trust proxy`
// is enabled on the app so the forwarded host/proto are honoured here.
function publicOrigin(req: Request): string {
  const host = req.get("host") ?? "localhost";
  return `${req.protocol}://${host}`;
}

function groupResources(
  resources: (typeof opendataResourcesTable.$inferSelect)[],
): Map<number, (typeof opendataResourcesTable.$inferSelect)[]> {
  const byDataset = new Map<
    number,
    (typeof opendataResourcesTable.$inferSelect)[]
  >();
  for (const r of resources) {
    const list = byDataset.get(r.datasetId) ?? [];
    list.push(r);
    byDataset.set(r.datasetId, list);
  }
  return byDataset;
}

function mapResource(r: typeof opendataResourcesTable.$inferSelect) {
  return {
    id: r.id,
    datasetId: r.datasetId,
    name: r.name,
    description: r.description,
    format: r.format,
    url: r.url,
    position: r.position,
    lastModified: r.lastModified ? r.lastModified.toISOString() : null,
    tabular: isTabularFormat(r.format),
  };
}

function mapDataset(
  d: typeof opendataDatasetsTable.$inferSelect,
  resources: (typeof opendataResourcesTable.$inferSelect)[] = [],
  lastChangedAt: string | null = null,
) {
  return {
    id: d.id,
    sourceId: d.sourceId,
    slug: d.slug,
    title: d.title,
    description: d.description,
    category: d.category,
    theme: d.theme,
    frequency: d.frequency,
    licenseId: d.licenseId,
    licenseTitle: d.licenseTitle,
    holderName: d.holderName,
    portalUrl: d.portalUrl,
    tags: d.tags ?? [],
    resourceCount: d.resourceCount,
    metadataModified: d.metadataModified
      ? d.metadataModified.toISOString()
      : null,
    lastChangedAt,
    resources: resources
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(mapResource),
  };
}

// Most recent capture time of a *changed* snapshot, grouped by dataset. This is
// the source of truth for the "Aggiornato" badge on the catalog.
async function getLastChangedByDataset(): Promise<Map<number, string>> {
  const rows = await db
    .select({
      datasetId: opendataResourcesTable.datasetId,
      lastChangedAt: max(opendataSnapshotsTable.capturedAt),
    })
    .from(opendataSnapshotsTable)
    .innerJoin(
      opendataResourcesTable,
      eq(opendataSnapshotsTable.resourceId, opendataResourcesTable.id),
    )
    .where(eq(opendataSnapshotsTable.changed, true))
    .groupBy(opendataResourcesTable.datasetId);

  const map = new Map<number, string>();
  for (const r of rows) {
    if (r.lastChangedAt) map.set(r.datasetId, r.lastChangedAt.toISOString());
  }
  return map;
}

router.get("/opendata/datasets", async (req, res) => {
  const query = req.query as Record<string, unknown>;
  const conditions: SQL[] = [];

  const search = typeof query.search === "string" ? query.search.trim() : "";
  if (search) {
    const like = `%${search}%`;
    const clause = or(
      ilike(opendataDatasetsTable.title, like),
      ilike(opendataDatasetsTable.description, like),
    );
    if (clause) conditions.push(clause);
  }

  const category =
    typeof query.category === "string" ? query.category.trim() : "";
  if (category) {
    conditions.push(eq(opendataDatasetsTable.category, category));
  }

  const datasets = await db
    .select()
    .from(opendataDatasetsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      desc(opendataDatasetsTable.metadataModified),
      asc(opendataDatasetsTable.title),
    );

  if (datasets.length === 0) {
    res.json([]);
    return;
  }

  const allResources = await db.select().from(opendataResourcesTable);
  const byDataset = groupResources(allResources);
  const lastChangedByDataset = await getLastChangedByDataset();

  res.json(
    datasets.map((d) =>
      mapDataset(d, byDataset.get(d.id) ?? [], lastChangedByDataset.get(d.id) ?? null),
    ),
  );
});

router.get("/opendata/feed-status", async (_req, res) => {
  const [row] = await db
    .select()
    .from(feedStatusTable)
    .where(eq(feedStatusTable.source, OPENDATA_SOURCE))
    .limit(1);

  if (!row) {
    res.json({
      source: OPENDATA_SOURCE,
      label: OPENDATA_LABEL,
      url: OPENDATA_PORTAL_URL,
      status: "pending",
      error: null,
      itemsTotal: 0,
      itemsNew: 0,
      lastCheckedAt: null,
      lastUpdatedAt: null,
    });
    return;
  }

  res.json({
    source: row.source,
    label: row.label,
    url: row.url,
    status: row.status,
    error: row.error,
    itemsTotal: row.itemsTotal,
    itemsNew: row.itemsNew,
    lastCheckedAt: row.lastCheckedAt ? row.lastCheckedAt.toISOString() : null,
    lastUpdatedAt: row.lastUpdatedAt ? row.lastUpdatedAt.toISOString() : null,
  });
});

router.get("/opendata/datasets/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ message: "Dataset non trovato" });
    return;
  }
  const [dataset] = await db
    .select()
    .from(opendataDatasetsTable)
    .where(eq(opendataDatasetsTable.id, id))
    .limit(1);

  if (!dataset) {
    res.status(404).json({ message: "Dataset non trovato" });
    return;
  }

  const resources = await db
    .select()
    .from(opendataResourcesTable)
    .where(eq(opendataResourcesTable.datasetId, id));

  const [changedRow] = await db
    .select({ lastChangedAt: max(opendataSnapshotsTable.capturedAt) })
    .from(opendataSnapshotsTable)
    .innerJoin(
      opendataResourcesTable,
      eq(opendataSnapshotsTable.resourceId, opendataResourcesTable.id),
    )
    .where(
      and(
        eq(opendataResourcesTable.datasetId, id),
        eq(opendataSnapshotsTable.changed, true),
      ),
    );

  res.json(
    mapDataset(
      dataset,
      resources,
      changedRow?.lastChangedAt ? changedRow.lastChangedAt.toISOString() : null,
    ),
  );
});

router.get("/opendata/resources/:id/content", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ message: "Risorsa non trovata" });
    return;
  }
  const [resource] = await db
    .select()
    .from(opendataResourcesTable)
    .where(eq(opendataResourcesTable.id, id))
    .limit(1);

  if (!resource) {
    res.status(404).json({ message: "Risorsa non trovata" });
    return;
  }

  if (!isTabularFormat(resource.format)) {
    res.status(422).json({
      message: "Anteprima tabellare non disponibile per questo formato",
    });
    return;
  }

  try {
    const table = await loadResourceTable(
      resource.sourceId,
      resource.url,
      resource.format,
    );
    res.json(table);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Errore di elaborazione";
    req.log?.warn({ err, resourceId: id }, "Opendata resource preview failed");
    res.status(502).json({ message });
  }
});

// ---------------------------------------------------------------------------
// Snapshot endpoints
// ---------------------------------------------------------------------------

// List all snapshots for a resource (metadata only, no rows).
router.get("/opendata/resources/:id/snapshots", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ message: "Risorsa non trovata" });
    return;
  }
  const [resource] = await db
    .select({ id: opendataResourcesTable.id })
    .from(opendataResourcesTable)
    .where(eq(opendataResourcesTable.id, id))
    .limit(1);

  if (!resource) {
    res.status(404).json({ message: "Risorsa non trovata" });
    return;
  }

  const snapshots = await listResourceSnapshots(id);
  res.json(
    snapshots.map((s) => ({
      id: s.id,
      capturedAt: s.capturedAt.toISOString(),
      rowCount: s.rowCount,
      changed: s.changed,
    })),
  );
});

// Get the full content (columns + rows) of a specific snapshot.
router.get("/opendata/resources/:id/snapshots/:snapshotId", async (req, res) => {
  const resourceId = Number(req.params.id);
  const snapshotId = Number(req.params.snapshotId);
  if (Number.isNaN(resourceId) || Number.isNaN(snapshotId)) {
    res.status(404).json({ message: "Snapshot non trovato" });
    return;
  }

  const snap = await getSnapshotById(snapshotId);
  if (!snap || snap.resourceId !== resourceId) {
    res.status(404).json({ message: "Snapshot non trovato" });
    return;
  }

  res.json({
    id: snap.id,
    resourceId: snap.resourceId,
    capturedAt: snap.capturedAt.toISOString(),
    rowCount: snap.rowCount,
    changed: snap.changed,
    columns: snap.columns ?? [],
    rows: snap.rows ?? [],
    truncated: false,
  });
});

// Download a snapshot as CSV.
router.get("/opendata/resources/:id/snapshots/:snapshotId/csv", async (req, res) => {
  const resourceId = Number(req.params.id);
  const snapshotId = Number(req.params.snapshotId);
  if (Number.isNaN(resourceId) || Number.isNaN(snapshotId)) {
    res.status(404).json({ message: "Snapshot non trovato" });
    return;
  }

  const snap = await getSnapshotById(snapshotId);
  if (!snap || snap.resourceId !== resourceId) {
    res.status(404).json({ message: "Snapshot non trovato" });
    return;
  }

  const columns = snap.columns ?? [];
  const rows = snap.rows ?? [];

  function csvEscape(v: string | number | null): string {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  const header = columns.map((c) => csvEscape(c.name)).join(",");
  const body = rows
    .map((row) => columns.map((c) => csvEscape(row[c.name])).join(","))
    .join("\r\n");
  const csv = `\uFEFF${header}\r\n${body}`;

  const date = snap.capturedAt.toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv;charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="snapshot-${snapshotId}-${date}.csv"`,
  );
  res.send(csv);
});

// ---------------------------------------------------------------------------
// DCAT-AP_IT (RDF/JSON-LD) metadata
// ---------------------------------------------------------------------------

// Full catalog as DCAT-AP_IT JSON-LD — federable with dati.gov.it.
router.get("/opendata/catalog.jsonld", async (req, res) => {
  const datasets = await db
    .select()
    .from(opendataDatasetsTable)
    .orderBy(
      desc(opendataDatasetsTable.metadataModified),
      asc(opendataDatasetsTable.title),
    );
  const allResources = await db.select().from(opendataResourcesTable);
  const byDataset = groupResources(allResources);

  const modified = datasets.reduce<Date>((acc, d) => {
    const m = d.metadataModified ?? d.lastSeenAt;
    return m && m > acc ? m : acc;
  }, new Date(0));

  const catalog = buildDcatCatalog(
    datasets.map((d) => ({ dataset: d, resources: byDataset.get(d.id) ?? [] })),
    publicOrigin(req),
    datasets.length ? modified : new Date(),
  );

  res.type("application/ld+json").json(catalog);
});

// Single dataset as a self-contained DCAT-AP_IT JSON-LD document.
router.get("/opendata/datasets/:id/dcat.jsonld", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ message: "Dataset non trovato" });
    return;
  }
  const [dataset] = await db
    .select()
    .from(opendataDatasetsTable)
    .where(eq(opendataDatasetsTable.id, id))
    .limit(1);
  if (!dataset) {
    res.status(404).json({ message: "Dataset non trovato" });
    return;
  }
  const resources = await db
    .select()
    .from(opendataResourcesTable)
    .where(eq(opendataResourcesTable.datasetId, id));

  const node = buildDcatDataset(dataset, resources, publicOrigin(req));
  res.type("application/ld+json").json(wrapDatasetDocument(node));
});

// ---------------------------------------------------------------------------
// CKAN-compatible (read-only) Action API
// ---------------------------------------------------------------------------

async function resolveDatasetByRef(ref: string) {
  const numeric = Number(ref);
  const [dataset] = await db
    .select()
    .from(opendataDatasetsTable)
    .where(
      or(
        eq(opendataDatasetsTable.sourceId, ref),
        eq(opendataDatasetsTable.slug, ref),
        ...(Number.isInteger(numeric) && numeric > 0
          ? [eq(opendataDatasetsTable.id, numeric)]
          : []),
      ),
    )
    .limit(1);
  return dataset ?? null;
}

// package_list — names (slugs) of every dataset in the catalog.
router.get("/3/action/package_list", async (_req, res) => {
  const datasets = await db
    .select()
    .from(opendataDatasetsTable)
    .orderBy(asc(opendataDatasetsTable.title));
  res.json(
    ckanSuccess(
      datasets.map((d) => d.slug ?? String(d.id)),
      "package_list",
    ),
  );
});

// group_list — catalog categories (CKAN groups).
router.get("/3/action/group_list", async (_req, res) => {
  const datasets = await db
    .select({ category: opendataDatasetsTable.category })
    .from(opendataDatasetsTable);
  const set = new Set<string>();
  for (const d of datasets) if (d.category) set.add(d.category);
  res.json(
    ckanSuccess(
      Array.from(set).sort((a, b) => a.localeCompare(b)),
      "group_list",
    ),
  );
});

// package_search — full-text + category filter, CKAN result envelope.
router.get("/3/action/package_search", async (req, res) => {
  const query = req.query as Record<string, unknown>;
  const conditions: SQL[] = [];

  const q = typeof query.q === "string" ? query.q.trim() : "";
  if (q && q !== "*:*") {
    const like = `%${q}%`;
    const clause = or(
      ilike(opendataDatasetsTable.title, like),
      ilike(opendataDatasetsTable.description, like),
    );
    if (clause) conditions.push(clause);
  }

  // Support CKAN `fq=groups:<category>` as well as a plain `groups` param.
  const fq = typeof query.fq === "string" ? query.fq : "";
  const groupMatch = fq.match(/groups:"?([^"]+)"?/);
  const category =
    groupMatch?.[1] ??
    (typeof query.groups === "string" ? query.groups : "");
  if (category) {
    conditions.push(eq(opendataDatasetsTable.category, category));
  }

  const rows = Math.min(
    Math.max(Number(query.rows) || 100, 0),
    1000,
  );
  const start = Math.max(Number(query.start) || 0, 0);

  const matched = await db
    .select()
    .from(opendataDatasetsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      desc(opendataDatasetsTable.metadataModified),
      asc(opendataDatasetsTable.title),
    );

  const page = matched.slice(start, start + rows);
  const allResources = page.length
    ? await db.select().from(opendataResourcesTable)
    : [];
  const byDataset = groupResources(allResources);

  res.json(
    ckanSuccess(
      {
        count: matched.length,
        results: page.map((d) => ckanPackage(d, byDataset.get(d.id) ?? [])),
        sort: "metadata_modified desc",
      },
      "package_search",
    ),
  );
});

// package_show — single dataset by id, sourceId or slug.
router.get("/3/action/package_show", async (req, res) => {
  const ref =
    typeof req.query.id === "string"
      ? req.query.id
      : typeof req.query.name_or_id === "string"
        ? req.query.name_or_id
        : "";
  if (!ref) {
    res
      .status(400)
      .json(ckanError("Missing value for parameter id", "Validation Error"));
    return;
  }
  const dataset = await resolveDatasetByRef(ref);
  if (!dataset) {
    res.status(404).json(ckanError("Not found: Dataset"));
    return;
  }
  const resources = await db
    .select()
    .from(opendataResourcesTable)
    .where(eq(opendataResourcesTable.datasetId, dataset.id));
  res.json(ckanSuccess(ckanPackage(dataset, resources), "package_show"));
});

// resource_show — single resource by id.
router.get("/3/action/resource_show", async (req, res) => {
  const ref = typeof req.query.id === "string" ? req.query.id : "";
  const id = Number(ref);
  if (!ref || Number.isNaN(id)) {
    res
      .status(400)
      .json(ckanError("Missing value for parameter id", "Validation Error"));
    return;
  }
  const [resource] = await db
    .select()
    .from(opendataResourcesTable)
    .where(eq(opendataResourcesTable.id, id))
    .limit(1);
  if (!resource) {
    res.status(404).json(ckanError("Not found: Resource"));
    return;
  }
  res.json(ckanSuccess(ckanResource(resource), "resource_show"));
});

export default router;
