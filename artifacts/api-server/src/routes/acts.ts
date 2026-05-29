import { Router, type IRouter } from "express";
import { db, actsTable } from "@workspace/db";
import { and, eq, desc, ilike } from "drizzle-orm";

const router: IRouter = Router();

router.get("/acts", async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;

  const conditions = [];
  if (search) {
    conditions.push(ilike(actsTable.title, `%${search}%`));
  }
  if (type) {
    conditions.push(eq(actsTable.type, type));
  }

  const rows = await db
    .select()
    .from(actsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(actsTable.publishDate));

  res.json(
    rows.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      number: a.number,
      summary: a.summary,
      publishDate: a.publishDate.toISOString(),
      endDate: a.endDate.toISOString(),
      themeId: a.themeId,
    })),
  );
});

export default router;
