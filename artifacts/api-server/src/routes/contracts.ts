import { Router, type IRouter } from "express";
import { db, contractsTable } from "@workspace/db";
import { and, eq, desc, ilike } from "drizzle-orm";

const router: IRouter = Router();

router.get("/contracts", async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const themeId = req.query.themeId ? Number(req.query.themeId) : undefined;

  const conditions = [];
  if (search) {
    conditions.push(ilike(contractsTable.title, `%${search}%`));
  }
  if (themeId && !Number.isNaN(themeId)) {
    conditions.push(eq(contractsTable.themeId, themeId));
  }

  const rows = await db
    .select()
    .from(contractsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(contractsTable.awardDate));

  res.json(
    rows.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      supplier: c.supplier,
      amount: Number(c.amount),
      procedureType: c.procedureType,
      status: c.status,
      awardDate: c.awardDate.toISOString(),
      themeId: c.themeId,
    })),
  );
});

export default router;
