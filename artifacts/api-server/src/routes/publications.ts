import { Router, type IRouter } from "express";
import {
  db,
  publicationsTable,
  feedStatusTable,
  type Publication,
} from "@workspace/db";
import { and, eq, desc, ilike, gte, lte, sql } from "drizzle-orm";
import { ALBO_SOURCE } from "../lib/ingestion";

const router: IRouter = Router();

function mapPublication(p: Publication) {
  return {
    id: p.id,
    progressivo: p.progressivo,
    tipologia: p.tipologia,
    category: p.category,
    subcategory: p.subcategory,
    provenienza: p.provenienza,
    oggetto: p.oggetto,
    dataAtto: p.dataAtto ? p.dataAtto.toISOString() : null,
    pubStart: p.pubStart ? p.pubStart.toISOString() : null,
    pubEnd: p.pubEnd ? p.pubEnd.toISOString() : null,
    numRegSet: p.numRegSet,
    numRegGen: p.numRegGen,
    cups: p.cups,
    pnrrMission: p.pnrrMission,
    isPnrr: p.isPnrr,
    isNew: p.isNew,
    firstSeenAt: p.firstSeenAt.toISOString(),
  };
}

function buildFilters(req: {
  query: Record<string, unknown>;
}) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const tipologia =
    typeof req.query.tipologia === "string" ? req.query.tipologia : undefined;
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;

  const conditions = [];
  if (q) conditions.push(ilike(publicationsTable.oggetto, `%${q}%`));
  if (category) conditions.push(eq(publicationsTable.category, category));
  if (tipologia) conditions.push(eq(publicationsTable.tipologia, tipologia));
  const fromDate = from ? new Date(from) : undefined;
  if (fromDate && !Number.isNaN(fromDate.getTime())) {
    conditions.push(gte(publicationsTable.pubStart, fromDate));
  }
  const toDate = to ? new Date(to) : undefined;
  if (toDate && !Number.isNaN(toDate.getTime())) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(to as string)) {
      toDate.setHours(23, 59, 59, 999);
    }
    conditions.push(lte(publicationsTable.pubStart, toDate));
  }
  return conditions;
}

router.get("/publications/feed-status", async (_req, res) => {
  const [row] = await db
    .select()
    .from(feedStatusTable)
    .where(eq(feedStatusTable.source, ALBO_SOURCE));

  if (!row) {
    res.json({
      source: ALBO_SOURCE,
      label: null,
      url: null,
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

router.get("/publications", async (req, res) => {
  const conditions = buildFilters(req);
  const rows = await db
    .select()
    .from(publicationsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id));
  res.json(rows.map(mapPublication));
});

router.get("/delibere", async (req, res) => {
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;

  const conditions = [eq(publicationsTable.category, "delibera")];
  if (tipo) conditions.push(eq(publicationsTable.subcategory, tipo));
  if (q) conditions.push(ilike(publicationsTable.oggetto, `%${q}%`));

  const rows = await db
    .select()
    .from(publicationsTable)
    .where(and(...conditions))
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id));
  res.json(rows.map(mapPublication));
});

router.get("/convocazioni", async (req, res) => {
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;

  const conditions = [eq(publicationsTable.category, "convocazione")];
  if (tipo) conditions.push(eq(publicationsTable.subcategory, tipo));

  const rows = await db
    .select()
    .from(publicationsTable)
    .where(and(...conditions))
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id));
  res.json(rows.map(mapPublication));
});

router.get("/pnrr/projects", async (_req, res) => {
  const rows = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.isPnrr, true))
    .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id));

  const projects = new Map<
    string,
    {
      key: string;
      cup: string | null;
      mission: string | null;
      title: string;
      documentsCount: number;
      lastPublication: string | null;
      documents: ReturnType<typeof mapPublication>[];
    }
  >();

  for (const r of rows) {
    const cup = r.cups.length ? r.cups[0] : null;
    const key = cup ?? r.pnrrMission ?? `altro-${r.id}`;
    let project = projects.get(key);
    if (!project) {
      project = {
        key,
        cup,
        mission: r.pnrrMission,
        title: r.oggetto,
        documentsCount: 0,
        lastPublication: null,
        documents: [],
      };
      projects.set(key, project);
    }
    if (!project.mission && r.pnrrMission) project.mission = r.pnrrMission;
    if (r.oggetto.length > project.title.length) project.title = r.oggetto;
    const doc = mapPublication(r);
    project.documents.push(doc);
    project.documentsCount += 1;
    if (
      doc.pubStart &&
      (!project.lastPublication || doc.pubStart > project.lastPublication)
    ) {
      project.lastPublication = doc.pubStart;
    }
  }

  res.json(Array.from(projects.values()));
});

export default router;
