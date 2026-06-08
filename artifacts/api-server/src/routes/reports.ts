import { Router, type IRouter } from "express";
import { db, reportsTable } from "@workspace/db";
import { CreateReportBody, PublishReportBody } from "@workspace/api-zod";
import { desc, eq, isNotNull } from "drizzle-orm";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

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

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
      ? { ok: true, date }
      : { ok: false };
  }

  const dateTime =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/.exec(
      value,
    );
  if (!dateTime) {
    return { ok: false };
  }

  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw, msRaw] =
    dateTime;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const second = Number(secondRaw);
  const millisecond = Number((msRaw ?? "0").padEnd(3, "0"));

  if (hour > 23 || minute > 59 || second > 59) {
    return { ok: false };
  }

  const date = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond),
  );
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== second ||
    date.getUTCMilliseconds() !== millisecond
  ) {
    return { ok: false };
  }

  return { ok: true, date };
}

function publicationPatchDate(raw: string | null | undefined) {
  if (raw === undefined) {
    return { ok: true as const, date: new Date() };
  }
  return parseOptionalDate(raw);
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

router.patch(
  "/reports/:id/publication",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Segnalazione non trovata" });
      return;
    }

    const parsed = PublishReportBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }

    const publishedAt = publicationPatchDate(parsed.data.publishedAt);
    if (!publishedAt.ok) {
      res.status(400).json({ error: "Date non valide" });
      return;
    }

    const [row] = await db
      .update(reportsTable)
      .set({ publishedAt: publishedAt.date, updatedAt: new Date() })
      .where(eq(reportsTable.id, id))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Segnalazione non trovata" });
      return;
    }

    res.json(mapPublicReport(row));
  },
);

export default router;
