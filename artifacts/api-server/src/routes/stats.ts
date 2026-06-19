import { Router, type IRouter } from "express";
import {
  db,
  themesTable,
  categoriesTable,
  contractsTable,
  publicationsTable,
  reportsTable,
  sharesTable,
  classifyMacrotema,
  MACROTEMA_KEYS,
  type MacrotemaKey,
} from "@workspace/db";
import { eq, desc, isNotNull, sql } from "drizzle-orm";

const router: IRouter = Router();

function mapThemeRow(r: {
  id: number;
  title: string;
  slug: string;
  summary: string;
  categoryId: number;
  categoryName: string;
  status: string;
  relevanceCount: number;
  shareCount: number;
  followerCount: number;
  updatedAt: Date;
}) {
  return { ...r, updatedAt: r.updatedAt.toISOString() };
}

const themeSelect = {
  id: themesTable.id,
  title: themesTable.title,
  slug: themesTable.slug,
  summary: themesTable.summary,
  categoryId: themesTable.categoryId,
  categoryName: categoriesTable.name,
  status: themesTable.status,
  relevanceCount: themesTable.relevanceCount,
  shareCount: themesTable.shareCount,
  followerCount: themesTable.followerCount,
  updatedAt: themesTable.updatedAt,
};

router.get("/stats/overview", async (_req, res) => {
  const [[themes], [contracts], [acts], [reports], [agg]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(themesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(contractsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(publicationsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(reportsTable),
    db
      .select({
        totalRelevance: sql<number>`coalesce(sum(${themesTable.relevanceCount}),0)::int`,
        totalShares: sql<number>`coalesce(sum(${themesTable.shareCount}),0)::int`,
      })
      .from(themesTable),
  ]);

  const [amount] = await db
    .select({
      total: sql<string>`coalesce(sum(${contractsTable.amount}),0)`,
    })
    .from(contractsTable);

  res.json({
    themes: themes.count,
    contracts: contracts.count,
    acts: acts.count,
    reports: reports.count,
    totalRelevance: agg.totalRelevance,
    totalShares: agg.totalShares,
    monitoredAmount: Number(amount.total),
  });
});

router.get("/stats/top-themes", async (_req, res) => {
  const [byRelevance, byShares] = await Promise.all([
    db
      .select(themeSelect)
      .from(themesTable)
      .innerJoin(categoriesTable, eq(themesTable.categoryId, categoriesTable.id))
      .orderBy(desc(themesTable.relevanceCount))
      .limit(5),
    db
      .select(themeSelect)
      .from(themesTable)
      .innerJoin(categoriesTable, eq(themesTable.categoryId, categoriesTable.id))
      .orderBy(desc(themesTable.shareCount))
      .limit(5),
  ]);

  res.json({
    byRelevance: byRelevance.map(mapThemeRow),
    byShares: byShares.map(mapThemeRow),
  });
});

router.get("/stats/activity", async (_req, res) => {
  const [themes, contracts, acts, reports] = await Promise.all([
    db
      .select({
        id: themesTable.id,
        title: themesTable.title,
        date: themesTable.updatedAt,
      })
      .from(themesTable)
      .orderBy(desc(themesTable.updatedAt))
      .limit(10),
    db
      .select({
        id: contractsTable.id,
        title: contractsTable.title,
        date: contractsTable.awardDate,
        themeId: contractsTable.themeId,
      })
      .from(contractsTable)
      .orderBy(desc(contractsTable.awardDate))
      .limit(10),
    db
      .select({
        id: publicationsTable.id,
        title: publicationsTable.oggetto,
        date: publicationsTable.pubStart,
      })
      .from(publicationsTable)
      .orderBy(desc(publicationsTable.pubStart))
      .limit(10),
    db
      .select({
        id: reportsTable.id,
        title: reportsTable.title,
        date: reportsTable.publishedAt,
      })
      .from(reportsTable)
      .where(isNotNull(reportsTable.publishedAt))
      .orderBy(desc(reportsTable.publishedAt))
      .limit(10),
  ]);

  const items = [
    ...themes.map((t) => ({
      id: `theme-${t.id}`,
      type: "theme" as const,
      title: t.title,
      date: t.date,
      themeId: t.id,
    })),
    ...contracts.map((c) => ({
      id: `contract-${c.id}`,
      type: "contract" as const,
      title: c.title,
      date: c.date,
      themeId: c.themeId,
    })),
    ...acts
      .filter((a) => a.date !== null)
      .map((a) => ({
        id: `act-${a.id}`,
        type: "act" as const,
        title: a.title,
        date: a.date as Date,
        themeId: null as number | null,
      })),
    ...reports
      .filter((r) => r.date !== null)
      .map((r) => ({
        id: `report-${r.id}`,
        type: "report" as const,
        title: r.title,
        date: r.date as Date,
        themeId: null,
      })),
  ];

  items.sort((a, b) => b.date.getTime() - a.date.getTime());

  res.json(
    items.slice(0, 15).map((i) => ({
      id: i.id,
      type: i.type,
      title: i.title,
      date: i.date.toISOString(),
      themeId: i.themeId,
    })),
  );
});

router.get("/stats/publications-timeline", async (req, res) => {
  const daysParam =
    typeof req.query.days === "string" ? Number(req.query.days) : NaN;
  const days =
    Number.isFinite(daysParam) && daysParam > 0 && daysParam <= 365
      ? Math.floor(daysParam)
      : 90;

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${publicationsTable.pubStart}), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(publicationsTable)
    .where(
      sql`${publicationsTable.pubStart} IS NOT NULL AND ${publicationsTable.pubStart} >= now() - (${days} || ' days')::interval`,
    )
    .groupBy(sql`date_trunc('day', ${publicationsTable.pubStart})`)
    .orderBy(sql`date_trunc('day', ${publicationsTable.pubStart}) asc`);

  res.json({ days, points: rows });
});

router.get("/stats/publications-categories", async (_req, res) => {
  const rows = await db
    .select({
      category: publicationsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(publicationsTable)
    .groupBy(publicationsTable.category)
    .orderBy(desc(sql`count(*)`));

  res.json(rows);
});

router.get("/stats/publications-macrotemi", async (req, res) => {
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;

  const rows = await db
    .select({
      macrotema: publicationsTable.macrotema,
      oggetto: publicationsTable.oggetto,
      tipologia: publicationsTable.tipologia,
    })
    .from(publicationsTable)
    .where(category ? eq(publicationsTable.category, category) : undefined);

  // Conteggio per macrotema applicando la stessa logica del listing:
  // usa il macrotema persistito quando presente, altrimenti la classificazione
  // automatica dal testo (oggetto + tipologia).
  const counts: Record<MacrotemaKey, number> = MACROTEMA_KEYS.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<MacrotemaKey, number>,
  );

  for (const r of rows) {
    const key = (r.macrotema ??
      classifyMacrotema(`${r.oggetto} ${r.tipologia ?? ""}`)) as MacrotemaKey;
    if (key in counts) {
      counts[key] += 1;
    } else {
      counts.altro += 1;
    }
  }

  res.json(
    MACROTEMA_KEYS.map((macrotema) => ({ macrotema, count: counts[macrotema] })),
  );
});

router.get("/stats/shares", async (_req, res) => {
  const rows = await db
    .select({
      channel: sharesTable.channel,
      count: sql<number>`count(*)::int`,
    })
    .from(sharesTable)
    .groupBy(sharesTable.channel)
    .orderBy(desc(sql`count(*)`));

  res.json(rows);
});

export default router;
