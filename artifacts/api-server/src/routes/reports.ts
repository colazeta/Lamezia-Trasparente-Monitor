import { Router, type IRouter } from "express";
import { db, reportsTable } from "@workspace/db";
import { CreateReportBody } from "@workspace/api-zod";

const router: IRouter = Router();

function mapPublicReport(r: typeof reportsTable.$inferSelect) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    location: r.location,
    status: r.status,
    initialSourceType: r.initialSourceType,
    initialSourceUrl: r.initialSourceUrl,
    publicEmergenceDate: r.publicEmergenceDate?.toISOString() ?? null,
    involvedSector: r.involvedSector,
    competentOffice: r.competentOffice,
    formalAct: r.formalAct,
    institutionalResponse: r.institutionalResponse,
    institutionalResponseDate:
      r.institutionalResponseDate?.toISOString() ?? null,
    availableData: r.availableData,
    missingData: r.missingData,
    foiaLink: r.foiaLink,
    outcome: r.outcome,
    verificationStatus: r.verificationStatus,
    interpretiveCaution: r.interpretiveCaution,
    updatedAt: r.updatedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/reports", async (_req, res) => {
  // Privacy guard: the legacy reports table has workflow statuses but no
  // explicit public/published moderation flag. Until a human-reviewed
  // publication model is introduced, do not expose unmoderated submissions on
  // the public board.
  // TODO(#74): decide whether to consolidate this legacy board into the
  // monitoringReports flow or add an explicit published flag/admin workflow.
  res.json([]);
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
      initialSourceType: parsed.data.initialSourceType ?? null,
      initialSourceUrl: parsed.data.initialSourceUrl ?? null,
      publicEmergenceDate: parsed.data.publicEmergenceDate
        ? new Date(parsed.data.publicEmergenceDate)
        : null,
      involvedSector: parsed.data.involvedSector ?? null,
      competentOffice: parsed.data.competentOffice ?? null,
      formalAct: parsed.data.formalAct ?? null,
      institutionalResponse: parsed.data.institutionalResponse ?? null,
      institutionalResponseDate: parsed.data.institutionalResponseDate
        ? new Date(parsed.data.institutionalResponseDate)
        : null,
      availableData: parsed.data.availableData ?? null,
      missingData: parsed.data.missingData ?? null,
      foiaLink: parsed.data.foiaLink ?? null,
      outcome: parsed.data.outcome ?? "aperta",
      verificationStatus: parsed.data.verificationStatus ?? "non_verificata",
      interpretiveCaution: parsed.data.interpretiveCaution,
    })
    .returning();

  res.status(201).json(mapPublicReport(created));
});

export default router;
