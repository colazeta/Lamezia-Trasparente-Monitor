import { Router, type IRouter } from "express";
import {
  db,
  themesTable,
  categoriesTable,
  contractsTable,
  publicationsTable,
  reportsTable,
  sharesTable,
  MACROTEMA_KEYS,
  type MacrotemaKey,
} from "@workspace/db";
import { eq, desc, isNotNull, sql } from "drizzle-orm";
import { mapPublicPublication } from "../lib/publicActProjection";

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
  const [[themes], [contracts], actRows, [reports], [agg]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(themesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(contractsTable),
    db.select().from(publicationsTable),
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
    acts: actRows.filter((row) => mapPublicPublication(row) !== null).length,
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
      .select()
      .from(publicationsTable)
      .orderBy(desc(publicationsTable.pubStart))
      .limit(50),
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
    ...acts.flatMap((act) => {
      const projected = mapPublicPublication(act);
      if (!projected) return [];
      const dateValue =
        projected.pubStart ?? projected.dataAtto ?? projected.firstSeenAt;
      return [{
        id: `act-${projected.publicId}`,
        type: "act" as const,
        title: projected.presentation.display_title,
        date: new Date(dateValue),
        themeId: null as number | null,
      }];
    }),
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
    .select()
    .from(publicationsTable)
    .where(
      sql`${publicationsTable.pubStart} IS NOT NULL AND ${publicationsTable.pubStart} >= now() - (${days} || ' days')::interval`,
    )
    .orderBy(publicationsTable.pubStart);

  const byDay = new Map<string, number>();
  for (const row of rows) {
    const projected = mapPublicPublication(row);
    const day = projected?.pubStart?.slice(0, 10);
    if (day) byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const points = [...byDay.entries()].map(([day, count]) => ({ day, count }));

  res.json({ days, points });
});

router.get("/stats/publications-categories", async (_req, res) => {
  const rows = await db.select().from(publicationsTable);
  const counts = new Map<string, number>();
  for (const row of rows) {
    const projected = mapPublicPublication(row);
    if (!projected) continue;
    counts.set(projected.category, (counts.get(projected.category) ?? 0) + 1);
  }
  res.json(
    [...counts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
  );
});

router.get("/stats/publications-macrotemi", async (req, res) => {
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;

  const rows = await db
    .select()
    .from(publicationsTable)
    .where(category ? eq(publicationsTable.category, category) : undefined);

  const counts: Record<MacrotemaKey, number> = MACROTEMA_KEYS.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<MacrotemaKey, number>,
  );

  for (const r of rows) {
    const projected = mapPublicPublication(r);
    if (!projected) continue;
    const key = projected.macrotema as MacrotemaKey;
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
