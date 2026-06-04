import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  accessoCivicoRequestsTable,
  type AccessoCivicoRequest,
} from "@workspace/db";
import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import {
  CreateAccessoCivicoBody,
  UpdateAccessoCivicoBody,
} from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

const router: IRouter = Router();

// Vista pubblica: nasconde i metadati editoriali (stato di moderazione e testo
// integrale della richiesta).
function mapPublic(r: AccessoCivicoRequest) {
  return {
    id: r.id,
    oggetto: r.oggetto,
    tipo: r.tipo,
    ente: r.ente,
    descrizione: r.descrizione,
    requesterName: r.requesterName,
    requestDate: r.requestDate ? r.requestDate.toISOString() : null,
    stato: r.stato,
    esitoNote: r.esitoNote,
    responseDate: r.responseDate ? r.responseDate.toISOString() : null,
    responseUrl: r.responseUrl,
    responseLabel: r.responseLabel,
    themeId: r.themeId,
    pnrrProjectId: r.pnrrProjectId,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

// Vista editoriale: include lo stato di moderazione e il testo integrale.
function mapAdmin(r: AccessoCivicoRequest) {
  return {
    id: r.id,
    oggetto: r.oggetto,
    tipo: r.tipo,
    ente: r.ente,
    descrizione: r.descrizione,
    requestText: r.requestText,
    requesterName: r.requesterName,
    requestDate: r.requestDate ? r.requestDate.toISOString() : null,
    stato: r.stato,
    esitoNote: r.esitoNote,
    responseDate: r.responseDate ? r.responseDate.toISOString() : null,
    responseUrl: r.responseUrl,
    responseLabel: r.responseLabel,
    themeId: r.themeId,
    pnrrProjectId: r.pnrrProjectId,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * GET /accesso-civico
 * Public registry: only published requests, with optional filters.
 */
router.get("/accesso-civico", async (req: Request, res: Response) => {
  // Filtri applicati a livello di query DB: ente destinatario e intervallo di
  // date (sulla data di invio della richiesta).
  const conditions: SQL[] = [
    eq(accessoCivicoRequestsTable.status, "published"),
  ];

  const enteFilter = typeof req.query.ente === "string" ? req.query.ente.trim() : "";
  if (enteFilter) {
    conditions.push(eq(accessoCivicoRequestsTable.ente, enteFilter));
  }

  const fromRaw = typeof req.query.from === "string" ? req.query.from : "";
  const fromDate = fromRaw ? new Date(fromRaw) : null;
  if (fromDate && !Number.isNaN(fromDate.getTime())) {
    conditions.push(gte(accessoCivicoRequestsTable.requestDate, fromDate));
  }

  const toRaw = typeof req.query.to === "string" ? req.query.to : "";
  const toDate = toRaw ? new Date(toRaw) : null;
  if (toDate && !Number.isNaN(toDate.getTime())) {
    conditions.push(lte(accessoCivicoRequestsTable.requestDate, toDate));
  }

  const rows = await db
    .select()
    .from(accessoCivicoRequestsTable)
    .where(and(...conditions))
    .orderBy(
      desc(accessoCivicoRequestsTable.requestDate),
      desc(accessoCivicoRequestsTable.id),
    );

  const statoFilter =
    typeof req.query.stato === "string" ? req.query.stato : null;
  const tipoFilter = typeof req.query.tipo === "string" ? req.query.tipo : null;
  const themeIdFilter =
    typeof req.query.themeId === "string" ? Number(req.query.themeId) : null;

  const result = rows
    .map(mapPublic)
    .filter((r) => {
      if (statoFilter && r.stato !== statoFilter) return false;
      if (tipoFilter && r.tipo !== tipoFilter) return false;
      if (
        themeIdFilter != null &&
        Number.isInteger(themeIdFilter) &&
        r.themeId !== themeIdFilter
      )
        return false;
      return true;
    });

  res.json(result);
});

/**
 * GET /accesso-civico/admin
 * Editorial list: all requests (incl. pending) for moderation.
 */
router.get(
  "/accesso-civico/admin",
  requireIngestAuth,
  async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(accessoCivicoRequestsTable)
      .orderBy(
        // Le richieste in attesa di moderazione per prime.
        desc(accessoCivicoRequestsTable.createdAt),
        desc(accessoCivicoRequestsTable.id),
      );
    res.json(rows.map(mapAdmin));
  },
);

/**
 * POST /accesso-civico
 * Public: register a sent request. Held in `pending` moderation state.
 */
router.post("/accesso-civico", async (req: Request, res: Response) => {
  const parsed = CreateAccessoCivicoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }
  const body = parsed.data;

  const [created] = await db
    .insert(accessoCivicoRequestsTable)
    .values({
      oggetto: body.oggetto,
      tipo: body.tipo ?? "generalizzato",
      ente: body.ente && body.ente.trim() ? body.ente : "Comune di Lamezia Terme",
      descrizione: body.descrizione ?? "",
      requestText: body.requestText ?? "",
      requesterName: body.requesterName ?? null,
      requestDate: body.requestDate ? new Date(body.requestDate) : null,
      stato: body.stato ?? "in-attesa",
      esitoNote: body.esitoNote ?? "",
      responseDate: body.responseDate ? new Date(body.responseDate) : null,
      themeId: body.themeId ?? null,
      pnrrProjectId: body.pnrrProjectId ?? null,
      // Le richieste dei cittadini partono sempre in moderazione.
      status: "pending",
    })
    .returning();

  res.status(201).json(mapAdmin(created));
});

/**
 * GET /accesso-civico/:id
 * Public detail of a published request.
 */
router.get("/accesso-civico/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Richiesta non trovata" });
    return;
  }
  const [row] = await db
    .select()
    .from(accessoCivicoRequestsTable)
    .where(eq(accessoCivicoRequestsTable.id, id));
  if (!row || row.status !== "published") {
    res.status(404).json({ error: "Richiesta non trovata" });
    return;
  }
  res.json(mapPublic(row));
});

/**
 * PATCH /accesso-civico/:id
 * Update a request, its outcome and response document (editorial).
 */
router.patch(
  "/accesso-civico/:id",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Richiesta non trovata" });
      return;
    }
    const parsed = UpdateAccessoCivicoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }
    const body = parsed.data;

    const [current] = await db
      .select()
      .from(accessoCivicoRequestsTable)
      .where(eq(accessoCivicoRequestsTable.id, id));
    if (!current) {
      res.status(404).json({ error: "Richiesta non trovata" });
      return;
    }

    const updates: Partial<typeof accessoCivicoRequestsTable.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (body.oggetto !== undefined) updates.oggetto = body.oggetto;
    if (body.tipo !== undefined) updates.tipo = body.tipo;
    if (body.ente !== undefined) updates.ente = body.ente;
    if (body.descrizione !== undefined) updates.descrizione = body.descrizione;
    if (body.requestText !== undefined) updates.requestText = body.requestText;
    if ("requesterName" in body)
      updates.requesterName = body.requesterName ?? null;
    if ("requestDate" in body)
      updates.requestDate = body.requestDate ? new Date(body.requestDate) : null;
    if (body.stato !== undefined) updates.stato = body.stato;
    if (body.esitoNote !== undefined) updates.esitoNote = body.esitoNote;
    if ("responseDate" in body)
      updates.responseDate = body.responseDate
        ? new Date(body.responseDate)
        : null;
    if ("responseUrl" in body) updates.responseUrl = body.responseUrl ?? null;
    if ("responseLabel" in body)
      updates.responseLabel = body.responseLabel ?? null;
    if ("themeId" in body) updates.themeId = body.themeId ?? null;
    if ("pnrrProjectId" in body)
      updates.pnrrProjectId = body.pnrrProjectId ?? null;

    const [updated] = await db
      .update(accessoCivicoRequestsTable)
      .set(updates)
      .where(eq(accessoCivicoRequestsTable.id, id))
      .returning();
    res.json(mapAdmin(updated));
  },
);

/**
 * DELETE /accesso-civico/:id
 */
router.delete(
  "/accesso-civico/:id",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Richiesta non trovata" });
      return;
    }
    const [deleted] = await db
      .delete(accessoCivicoRequestsTable)
      .where(eq(accessoCivicoRequestsTable.id, id))
      .returning({ id: accessoCivicoRequestsTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Richiesta non trovata" });
      return;
    }
    res.status(204).end();
  },
);

/**
 * POST /accesso-civico/:id/pubblica
 * Approve a pending request and make it public (editorial).
 */
router.post(
  "/accesso-civico/:id/pubblica",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Richiesta non trovata" });
      return;
    }
    const [current] = await db
      .select()
      .from(accessoCivicoRequestsTable)
      .where(eq(accessoCivicoRequestsTable.id, id));
    if (!current) {
      res.status(404).json({ error: "Richiesta non trovata" });
      return;
    }
    const [updated] = await db
      .update(accessoCivicoRequestsTable)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(accessoCivicoRequestsTable.id, id))
      .returning();
    res.json(mapAdmin(updated));
  },
);

export default router;
