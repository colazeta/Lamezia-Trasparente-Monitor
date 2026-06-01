import { Router, type IRouter } from "express";
import {
  db,
  publicationsTable,
  attuazionePnrrProjectsTable,
  feedStatusTable,
  sessionReportsTable,
  sessionInterventionsTable,
  seduteTable,
  organiTable,
  officialsTable,
  officialVotesTable,
  type Publication,
  type SessionReport,
  type SessionIntervention,
} from "@workspace/db";
import { and, eq, asc, desc, ilike, gte, lte, sql } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { UpsertSedutaReportBody } from "@workspace/api-zod";
import { ALBO_SOURCE } from "../lib/ingestion";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

const router: IRouter = Router();

function sanitizeText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

function mapIntervention(i: SessionIntervention) {
  return {
    id: i.id,
    speakerName: i.speakerName,
    speakerRole: i.speakerRole,
    content: i.content,
    position: i.position,
  };
}

async function buildSedutaDetail(publication: Publication) {
  const [report] = await db
    .select()
    .from(sessionReportsTable)
    .where(eq(sessionReportsTable.publicationId, publication.id));

  let interventions: SessionIntervention[] = [];
  if (report) {
    interventions = await db
      .select()
      .from(sessionInterventionsTable)
      .where(eq(sessionInterventionsTable.reportId, report.id))
      .orderBy(
        asc(sessionInterventionsTable.position),
        asc(sessionInterventionsTable.id),
      );
  }

  const [seduta] = await db
    .select()
    .from(seduteTable)
    .where(eq(seduteTable.publicationId, publication.id));

  let organo: {
    id: number;
    type: string;
    name: string;
    slug: string;
  } | null = null;
  let votes: {
    officialId: number;
    name: string;
    slug: string;
    vote: string;
  }[] = [];

  if (seduta) {
    if (seduta.organoId) {
      const [org] = await db
        .select()
        .from(organiTable)
        .where(eq(organiTable.id, seduta.organoId));
      if (org) {
        organo = { id: org.id, type: org.type, name: org.name, slug: org.slug };
      }
    }
    votes = await db
      .select({
        officialId: officialsTable.id,
        name: officialsTable.name,
        slug: officialsTable.slug,
        vote: officialVotesTable.vote,
      })
      .from(officialVotesTable)
      .innerJoin(
        officialsTable,
        eq(officialVotesTable.officialId, officialsTable.id),
      )
      .where(eq(officialVotesTable.sedutaId, seduta.id))
      .orderBy(asc(officialsTable.name));
  }

  return {
    ...mapPublication(publication),
    hasReport: Boolean(report),
    summary: report?.summary ?? null,
    interventions: interventions.map(mapIntervention),
    organo,
    votes,
  };
}

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

async function findConvocazione(id: number): Promise<Publication | undefined> {
  const [publication] = await db
    .select()
    .from(publicationsTable)
    .where(
      and(
        eq(publicationsTable.id, id),
        eq(publicationsTable.category, "convocazione"),
      ),
    );
  return publication;
}

router.get("/convocazioni/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Seduta non trovata" });
    return;
  }

  const publication = await findConvocazione(id);
  if (!publication) {
    res.status(404).json({ error: "Seduta non trovata" });
    return;
  }

  res.json(await buildSedutaDetail(publication));
});

router.post(
  "/convocazioni/:id/report",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Seduta non trovata" });
      return;
    }

    const parsed = UpsertSedutaReportBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati del resoconto non validi" });
      return;
    }

    const publication = await findConvocazione(id);
    if (!publication) {
      res.status(404).json({ error: "Seduta non trovata" });
      return;
    }

    const summary =
      typeof parsed.data.summary === "string" && sanitizeText(parsed.data.summary)
        ? sanitizeText(parsed.data.summary)
        : null;

    const interventions = parsed.data.interventions.map((intervention) => ({
      speakerName: sanitizeText(intervention.speakerName),
      speakerRole:
        typeof intervention.speakerRole === "string" &&
        sanitizeText(intervention.speakerRole)
          ? sanitizeText(intervention.speakerRole)
          : null,
      content: sanitizeText(intervention.content),
    }));

    if (interventions.some((i) => !i.speakerName || !i.content)) {
      res.status(400).json({
        error: "Ogni intervento richiede un relatore e un contenuto.",
      });
      return;
    }

    await db.transaction(async (tx) => {
      const [report]: SessionReport[] = await tx
        .insert(sessionReportsTable)
        .values({ publicationId: id, summary })
        .onConflictDoUpdate({
          target: sessionReportsTable.publicationId,
          set: { summary, updatedAt: new Date() },
        })
        .returning();

      await tx
        .delete(sessionInterventionsTable)
        .where(eq(sessionInterventionsTable.reportId, report.id));

      if (interventions.length) {
        await tx.insert(sessionInterventionsTable).values(
          interventions.map((intervention, index) => ({
            reportId: report.id,
            ...intervention,
            position: index,
          })),
        );
      }
    });

    res.json(await buildSedutaDetail(publication));
  },
);

function normalizeCup(value: string): string {
  return value.toUpperCase().replace(/\s+/g, "");
}

router.get("/pnrr/projects", async (_req, res) => {
  const [registry, alboRows] = await Promise.all([
    db
      .select()
      .from(attuazionePnrrProjectsTable)
      .orderBy(
        desc(attuazionePnrrProjectsTable.publishedAt),
        desc(attuazionePnrrProjectsTable.id),
      ),
    db
      .select()
      .from(publicationsTable)
      .where(eq(publicationsTable.isPnrr, true))
      .orderBy(desc(publicationsTable.pubStart), desc(publicationsTable.id)),
  ]);

  const docsByCup = new Map<string, Publication[]>();
  for (const r of alboRows) {
    for (const c of r.cups) {
      const cup = normalizeCup(c);
      const list = docsByCup.get(cup);
      if (list) list.push(r);
      else docsByCup.set(cup, [r]);
    }
  }

  const matchedDocIds = new Set<number>();

  const projects = registry.map((p) => {
    const cup = p.cup ? normalizeCup(p.cup) : null;
    const matched = cup ? (docsByCup.get(cup) ?? []) : [];
    const documents = matched.map((d) => {
      matchedDocIds.add(d.id);
      return mapPublication(d);
    });
    let lastPublication: string | null = null;
    for (const d of documents) {
      if (d.pubStart && (!lastPublication || d.pubStart > lastPublication)) {
        lastPublication = d.pubStart;
      }
    }
    return {
      key: p.sourceId,
      sourceId: p.sourceId,
      url: p.url,
      title: p.title,
      cup: p.cup,
      mission: p.mission,
      component: p.component,
      investment: p.investment,
      intervention: p.intervention,
      holder: p.holder,
      attuatore: p.attuatore,
      importoFinanziato:
        p.importoFinanziato != null ? Number(p.importoFinanziato) : null,
      status: p.status,
      startDate: p.startDate ? p.startDate.toISOString() : null,
      endDate: p.endDate ? p.endDate.toISOString() : null,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      attachments: p.attachments,
      documentsCount: documents.length,
      lastPublication,
      documents,
    };
  });

  const uncensored = alboRows
    .filter((r) => !matchedDocIds.has(r.id))
    .map(mapPublication);

  res.json({ projects, uncensored });
});

export default router;
