import { Router, type IRouter } from "express";
import { db, reportsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { CreateReportBody } from "@workspace/api-zod";

const router: IRouter = Router();

function mapReport(r: typeof reportsTable.$inferSelect) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    location: r.location,
    status: r.status,
    citizenName: r.citizenName,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/reports", async (_req, res) => {
  const rows = await db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt));
  res.json(rows.map(mapReport));
});

router.post("/reports", async (req, res) => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }

  const [created] = await db
    .insert(reportsTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      location: parsed.data.location,
      citizenName: parsed.data.citizenName ?? null,
    })
    .returning();

  res.status(201).json(mapReport(created));
});

export default router;
