import { Router, type IRouter } from "express";
import {
  db,
  opendataDatasetsTable,
  opendataResourcesTable,
  feedStatusTable,
} from "@workspace/db";
import { and, asc, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import {
  OPENDATA_SOURCE,
  OPENDATA_LABEL,
  OPENDATA_PORTAL_URL,
  isTabularFormat,
  loadResourceTable,
} from "../lib/opendata";

const router: IRouter = Router();

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
    resources: resources
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(mapResource),
  };
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
  const byDataset = new Map<
    number,
    (typeof opendataResourcesTable.$inferSelect)[]
  >();
  for (const r of allResources) {
    const list = byDataset.get(r.datasetId) ?? [];
    list.push(r);
    byDataset.set(r.datasetId, list);
  }

  res.json(
    datasets.map((d) => mapDataset(d, byDataset.get(d.id) ?? [])),
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

  res.json(mapDataset(dataset, resources));
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

export default router;
