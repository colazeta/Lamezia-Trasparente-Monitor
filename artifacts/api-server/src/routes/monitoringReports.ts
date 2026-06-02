import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  monitoringReportsTable,
  contractsTable,
  attuazionePnrrProjectsTable,
  MONITORING_REPORT_STATUSES,
  type MonitoringReport as MonitoringReportRow,
  type MonitoringReportAttachment,
} from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import {
  CreateMonitoringReportBody,
  ModerateMonitoringReportBody,
  RequestMonitoringReportUploadUrlBody,
} from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);
const MAX_ATTACHMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_ATTACHMENTS = 10;

function mapReport(r: MonitoringReportRow) {
  return {
    id: r.id,
    subjectType: r.subjectType,
    contractId: r.contractId,
    pnrrProjectId: r.pnrrProjectId,
    subjectTitle: r.subjectTitle,
    cig: r.cig,
    cup: r.cup,
    title: r.title,
    authorName: r.authorName,
    deskAnalysis: r.deskAnalysis,
    effectivenessEvaluation: r.effectivenessEvaluation,
    impactResults: r.impactResults,
    overallAssessment: r.overallAssessment,
    attachments: r.attachments,
    status: r.status,
    moderationNote: r.moderationNote,
    createdAt: r.createdAt.toISOString(),
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
  };
}

function sanitizeAttachments(
  raw: unknown,
): MonitoringReportAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: MonitoringReportAttachment[] = [];
  for (const item of raw.slice(0, MAX_ATTACHMENTS)) {
    if (!item || typeof item !== "object") continue;
    const title = (item as { title?: unknown }).title;
    const url = (item as { url?: unknown }).url;
    const contentType = (item as { contentType?: unknown }).contentType;
    if (typeof title !== "string" || typeof url !== "string") continue;
    if (!title.trim() || !url.trim()) continue;
    // Accetta solo riferimenti al nostro object storage, per evitare che il
    // report incorpori URL arbitrari esterni.
    if (!url.startsWith("/api/storage/")) continue;
    out.push({
      title: title.trim().slice(0, 200),
      url,
      contentType: typeof contentType === "string" ? contentType : null,
    });
  }
  return out;
}

// GET /monitoring-reports — elenco pubblico (solo report pubblicati).
router.get("/monitoring-reports", async (req, res) => {
  const conditions = [eq(monitoringReportsTable.status, "pubblicato")];

  const contractId = Number(req.query.contractId);
  if (Number.isInteger(contractId)) {
    conditions.push(eq(monitoringReportsTable.contractId, contractId));
  }
  const pnrrProjectId = Number(req.query.pnrrProjectId);
  if (Number.isInteger(pnrrProjectId)) {
    conditions.push(eq(monitoringReportsTable.pnrrProjectId, pnrrProjectId));
  }

  const rows = await db
    .select()
    .from(monitoringReportsTable)
    .where(and(...conditions))
    .orderBy(desc(monitoringReportsTable.publishedAt));

  res.json(rows.map(mapReport));
});

// POST /monitoring-reports — invio di un nuovo report di monitoraggio civico.
router.post("/monitoring-reports", async (req, res) => {
  const parsed = CreateMonitoringReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }

  const data = parsed.data;

  // Risolve il progetto monitorato e denormalizza titolo/CIG/CUP.
  let subjectTitle: string | null = null;
  let cig: string | null = null;
  let cup: string | null = null;
  let contractId: number | null = null;
  let pnrrProjectId: number | null = null;

  if (data.subjectType === "contract") {
    if (!data.contractId) {
      res.status(400).json({ error: "contractId mancante" });
      return;
    }
    const [contract] = await db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, data.contractId))
      .limit(1);
    if (!contract) {
      res.status(400).json({ error: "Contratto non trovato" });
      return;
    }
    contractId = contract.id;
    subjectTitle = contract.title;
    cig = contract.cig;
    cup = contract.cup;
  } else {
    if (!data.pnrrProjectId) {
      res.status(400).json({ error: "pnrrProjectId mancante" });
      return;
    }
    const [project] = await db
      .select()
      .from(attuazionePnrrProjectsTable)
      .where(eq(attuazionePnrrProjectsTable.id, data.pnrrProjectId))
      .limit(1);
    if (!project) {
      res.status(400).json({ error: "Progetto PNRR non trovato" });
      return;
    }
    pnrrProjectId = project.id;
    subjectTitle = project.title;
    cup = project.cup;
  }

  const attachments = sanitizeAttachments(data.attachments);

  const [created] = await db
    .insert(monitoringReportsTable)
    .values({
      subjectType: data.subjectType,
      contractId,
      pnrrProjectId,
      subjectTitle: subjectTitle ?? "Progetto monitorato",
      cig,
      cup,
      title: data.title,
      authorName: data.authorName?.trim() ? data.authorName.trim() : null,
      deskAnalysis: data.deskAnalysis,
      effectivenessEvaluation: data.effectivenessEvaluation,
      impactResults: data.impactResults,
      overallAssessment: data.overallAssessment,
      attachments,
      status: "in_revisione",
    })
    .returning();

  res.status(201).json(mapReport(created));
});

// POST /monitoring-reports/uploads/request-url — URL prefirmato per allegare un
// file al report. Pubblico (il cittadino non è autenticato) ma con limiti
// stringenti su tipo e dimensione del file.
router.post(
  "/monitoring-reports/uploads/request-url",
  async (req: Request, res: Response) => {
    const parsed = RequestMonitoringReportUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }

    const { name, size, contentType } = parsed.data;
    if (!ALLOWED_ATTACHMENT_TYPES.has(contentType)) {
      res.status(400).json({ error: "Tipo di file non supportato" });
      return;
    }
    if (size > MAX_ATTACHMENT_SIZE_BYTES) {
      res.status(400).json({ error: "File troppo grande (max 15 MB)" });
      return;
    }

    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath =
        objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
    } catch (error) {
      req.log.error({ err: error }, "Error generating upload URL");
      res.status(500).json({ error: "Impossibile generare l'URL di upload" });
    }
  },
);

// GET /monitoring-reports/admin — elenco completo per la moderazione.
router.get(
  "/monitoring-reports/admin",
  requireIngestAuth,
  async (_req, res) => {
    const rows = await db
      .select()
      .from(monitoringReportsTable)
      .orderBy(desc(monitoringReportsTable.createdAt));
    res.json(rows.map(mapReport));
  },
);

// GET /monitoring-reports/:id — dettaglio pubblico (solo se pubblicato).
router.get("/monitoring-reports/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Report non trovato" });
    return;
  }
  const [row] = await db
    .select()
    .from(monitoringReportsTable)
    .where(eq(monitoringReportsTable.id, id))
    .limit(1);

  if (!row || row.status !== "pubblicato") {
    res.status(404).json({ error: "Report non trovato" });
    return;
  }
  res.json(mapReport(row));
});

// PATCH /monitoring-reports/:id — moderazione (pubblica/rifiuta).
router.patch(
  "/monitoring-reports/:id",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Report non trovato" });
      return;
    }

    const parsed = ModerateMonitoringReportBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }

    const { status } = parsed.data;
    if (!MONITORING_REPORT_STATUSES.includes(status)) {
      res.status(400).json({ error: "Stato non valido" });
      return;
    }

    const [existing] = await db
      .select()
      .from(monitoringReportsTable)
      .where(eq(monitoringReportsTable.id, id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Report non trovato" });
      return;
    }

    const now = new Date();
    const [row] = await db
      .update(monitoringReportsTable)
      .set({
        status,
        moderationNote:
          parsed.data.moderationNote != null
            ? parsed.data.moderationNote
            : existing.moderationNote,
        publishedAt:
          status === "pubblicato"
            ? (existing.publishedAt ?? now)
            : existing.publishedAt,
        updatedAt: now,
      })
      .where(eq(monitoringReportsTable.id, id))
      .returning();

    res.json(mapReport(row));
  },
);

// DELETE /monitoring-reports/:id — rimozione definitiva.
router.delete(
  "/monitoring-reports/:id",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Report non trovato" });
      return;
    }
    const deleted = await db
      .delete(monitoringReportsTable)
      .where(eq(monitoringReportsTable.id, id))
      .returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Report non trovato" });
      return;
    }
    res.status(204).end();
  },
);

export default router;
