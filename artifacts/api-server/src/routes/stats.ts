import { Router, type IRouter } from "express";
import {
  db,
  themesTable,
  categoriesTable,
  contractsTable,
  actsTable,
  reportsTable,
  sharesTable,
} from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

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
  updatedAt: themesTable.updatedAt,
};

router.get("/stats/overview", async (_req, res) => {
  const [[themes], [contracts], [acts], [reports], [agg]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(themesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(contractsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(actsTable),
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
        id: actsTable.id,
        title: actsTable.title,
        date: actsTable.publishDate,
        themeId: actsTable.themeId,
      })
      .from(actsTable)
      .orderBy(desc(actsTable.publishDate))
      .limit(10),
    db
      .select({
        id: reportsTable.id,
        title: reportsTable.title,
        date: reportsTable.createdAt,
      })
      .from(reportsTable)
      .orderBy(desc(reportsTable.createdAt))
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
    ...acts.map((a) => ({
      id: `act-${a.id}`,
      type: "act" as const,
      title: a.title,
      date: a.date,
      themeId: a.themeId,
    })),
    ...reports.map((r) => ({
      id: `report-${r.id}`,
      type: "report" as const,
      title: r.title,
      date: r.date,
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
