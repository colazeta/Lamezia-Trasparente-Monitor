import { Router, type IRouter } from "express";
import { db, reportsTable } from "@workspace/db";
import { CreateReportBody } from "@workspace/api-zod";
import { desc, isNotNull } from "drizzle-orm";

const router: IRouter = Router();

const DEFAULT_OUTCOME = "aperta";
const DEFAULT_VERIFICATION_STATUS = "non_verificata";
const DEFAULT_INTERPRETIVE_CAUTION =
  "Scheda da leggere come tracciamento civico: la presenza nel registro non indica responsabilità o irregolarità accertate.";

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
    publishedAt: r.publishedAt?.toISOString() ?? null,
    updatedAt: r.updatedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  };
}

function parseOptionalDate(
  raw: string | Date | null | undefined,
): { ok: true; date: Date | null } | { ok: false } {
  if (raw === null || raw === undefined || raw === "") {
    return { ok: true, date: null };
  }

  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime())
      ? { ok: false }
      : { ok: true, date: raw };
  }

  const value = raw.trim();
  if (!value) {
    return { ok: true, date: null };
  }

  const isoPrefix = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
  if (isoPrefix) {
    const year = Number(isoPrefix[1]);
    const month = Number(isoPrefix[2]);
    const day = Number(isoPrefix[3]);
    const calendarDate = new Date(Date.UTC(year, month - 1, day));
    if (
      calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day
    ) {
      return { ok: false };
    }

    if (value.length === 10) {
      return { ok: true, date: calendarDate };
    }
  }

  const dateTime = new Date(value);
  if (Number.isNaN(dateTime.getTime())) {
    return { ok: false };
  }

  return { ok: true, date: dateTime };
}

router.get("/reports", async (_req, res) => {
  const rows = await db
    .select()
    .from(reportsTable)
    .where(isNotNull(reportsTable.publishedAt))
    .orderBy(desc(reportsTable.publishedAt), desc(reportsTable.createdAt));

  res.json(rows.map(mapPublicReport));
});

router.post("/reports", async (req, res) => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }

  const publicEmergenceDate = parseOptionalDate(
    parsed.data.publicEmergenceDate,
  );
  const institutionalResponseDate = parseOptionalDate(
    parsed.data.institutionalResponseDate,
  );

  if (!publicEmergenceDate.ok || !institutionalResponseDate.ok) {
    res.status(400).json({ error: "Date non valide" });
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
      publicEmergenceDate: publicEmergenceDate.date,
      involvedSector: parsed.data.involvedSector ?? null,
      competentOffice: parsed.data.competentOffice ?? null,
      formalAct: parsed.data.formalAct ?? null,
      institutionalResponse: parsed.data.institutionalResponse ?? null,
      institutionalResponseDate: institutionalResponseDate.date,
      availableData: parsed.data.availableData ?? null,
      missingData: parsed.data.missingData ?? null,
      foiaLink: parsed.data.foiaLink ?? null,
      outcome: DEFAULT_OUTCOME,
      verificationStatus: DEFAULT_VERIFICATION_STATUS,
      interpretiveCaution: DEFAULT_INTERPRETIVE_CAUTION,
      publishedAt: null,
    })
    .returning();

  res.status(201).json(mapPublicReport(created));
});

export default router;
