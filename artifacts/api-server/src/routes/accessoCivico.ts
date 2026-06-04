import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  accessoCivicoRequestsTable,
  type AccessoCivicoRequest,
} from "@workspace/db";
import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import {
  CreateAccessoCivicoBody,
  ImportAccessoCivicoBody,
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
    origine: r.origine,
    fonteUrl: r.fonteUrl,
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
    origine: r.origine,
    fonteUrl: r.fonteUrl,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * Parsa una data in modo rigoroso: accetta solo date che esistono realmente
 * nel calendario, rifiutando la normalizzazione automatica di JS Date
 * (es. "2024-02-31" -> 2 marzo). Restituisce:
 *  - { ok: true, date: Date|null } per input validi (null se vuoto/assente),
 *  - { ok: false } per date impossibili o non interpretabili.
 */
function parseStrictDate(
  raw: string | null | undefined,
): { ok: true; date: Date | null } | { ok: false } {
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return { ok: true, date: null };
  }
  const v = String(raw).trim();
  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!iso) {
    // Formati non-ISO non sono attesi qui (il parser frontend normalizza in
    // ISO); accettiamo solo se interpretabili come data reale via round-trip.
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return { ok: false };
    return { ok: true, date: d };
  }
  const year = Number(iso[1]);
  const month = Number(iso[2]);
  const day = Number(iso[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return { ok: false };
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return { ok: false };
  }
  return { ok: true, date: d };
}

/**
 * Calcola la chiave di deduplica per una riga del registro ufficiale.
 * La chiave è stabile rispetto a whitespace e capitalizzazione.
 */
function computeDeduplicaKey(
  oggetto: string,
  ente: string,
  requestDate: string | null | undefined,
): string {
  const parts = [
    oggetto.trim().toLowerCase(),
    ente.trim().toLowerCase(),
    requestDate ? requestDate.slice(0, 10) : "",
  ];
  return parts.join("|");
}

/**
 * GET /accesso-civico
 * Public registry: only published requests, with optional filters.
 */
router.get("/accesso-civico", async (req: Request, res: Response) => {
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
        desc(accessoCivicoRequestsTable.createdAt),
        desc(accessoCivicoRequestsTable.id),
      );
    res.json(rows.map(mapAdmin));
  },
);

/**
 * POST /accesso-civico/importa
 * Admin: bulk-import rows from the official municipal access register.
 * Validates, deduplicates (upsert by deduplicaKey), marks as "registro-ufficiale",
 * publishes immediately, and returns a summary {create, aggiornate, scartate}.
 */
router.post(
  "/accesso-civico/importa",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const parsed = ImportAccessoCivicoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi", details: parsed.error.issues });
      return;
    }

    const { righe } = parsed.data;

    let create = 0;
    let aggiornate = 0;
    const scartate: Array<{ indice: number; oggetto: string; motivo: string }> = [];

    for (let i = 0; i < righe.length; i++) {
      const riga = righe[i];
      const oggettoTrim = riga.oggetto.trim();
      if (!oggettoTrim) {
        scartate.push({ indice: i, oggetto: riga.oggetto, motivo: "Oggetto mancante o vuoto" });
        continue;
      }

      const enteTrim = (riga.ente ?? "Comune di Lamezia Terme").trim() || "Comune di Lamezia Terme";
      const requestDateParsed = parseStrictDate(riga.requestDate ?? null);
      if (!requestDateParsed.ok) {
        scartate.push({ indice: i, oggetto: oggettoTrim, motivo: "Data presentazione non valida" });
        continue;
      }
      const requestDate = requestDateParsed.date;

      const responseDateParsed = parseStrictDate(riga.responseDate ?? null);
      if (!responseDateParsed.ok) {
        scartate.push({ indice: i, oggetto: oggettoTrim, motivo: "Data decisione non valida" });
        continue;
      }
      const responseDate = responseDateParsed.date;

      const deduplicaKey = computeDeduplicaKey(
        oggettoTrim,
        enteTrim,
        requestDate ? requestDate.toISOString() : null,
      );

      // Cerca una voce esistente con la stessa chiave di deduplica.
      const [existing] = await db
        .select({ id: accessoCivicoRequestsTable.id })
        .from(accessoCivicoRequestsTable)
        .where(eq(accessoCivicoRequestsTable.deduplicaKey, deduplicaKey));

      const values = {
        oggetto: oggettoTrim,
        tipo: riga.tipo ?? "generalizzato",
        ente: enteTrim,
        descrizione: riga.esitoNote ?? "",
        requestText: "",
        stato: riga.stato ?? "in-attesa",
        esitoNote: riga.esitoNote ?? "",
        requestDate: requestDate,
        responseDate: responseDate,
        responseUrl: riga.responseUrl ?? null,
        responseLabel: riga.responseUrl ? (riga.responseLabel ?? "Documento di risposta") : null,
        origine: "registro-ufficiale" as const,
        deduplicaKey,
        fonteUrl: riga.fonteUrl ?? null,
        status: "published" as const,
        updatedAt: new Date(),
      };

      if (existing) {
        await db
          .update(accessoCivicoRequestsTable)
          .set(values)
          .where(eq(accessoCivicoRequestsTable.id, existing.id));
        aggiornate++;
      } else {
        await db
          .insert(accessoCivicoRequestsTable)
          .values(values);
        create++;
      }
    }

    res.json({ create, aggiornate, scartate });
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
      origine: "cittadino",
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
    if ("fonteUrl" in body) updates.fonteUrl = body.fonteUrl ?? null;

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
