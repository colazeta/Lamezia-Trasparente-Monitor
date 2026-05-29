import { Router, type IRouter } from "express";
import { db, categoriesTable, themesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      themeCount: sql<number>`count(${themesTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(themesTable, eq(themesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.name);

  res.json(rows);
});

export default router;
