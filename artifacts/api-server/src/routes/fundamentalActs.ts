import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  fundamentalActsTable,
  publicationsTable,
  type FundamentalAct,
  type FundamentalActFile,
  type Publication,
} from "@workspace/db";
import { asc, eq, inArray } from "drizzle-orm";
import {
  CreateFundamentalActBody,
  UpdateFundamentalActBody,
} from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";
import { refreshFundamentalActSuggestion } from "../lib/fundamentalActs";

const router: IRouter = Router();

type PublicationAttachment = {
  name: string;
  tipo: string;
  officialUrl: string;
  storagePath: string | null;
  contentType: string | null;
  size: number | null;
};

function publicationAttachments(p: Publication | undefined): PublicationAttachment[] {
  if (!p) return [];
  return (p.attachments ?? []) as PublicationAttachment[];
}

function mapPublicationSummary(p: Publication) {
  return {
    id: p.id,
    progressivo: p.progressivo,
    tipologia: p.tipologia,
    oggetto: p.oggetto,
    dataAtto: p.dataAtto ? p.dataAtto.toISOString() : null,
    pubStart: p.pubStart ? p.pubStart.toISOString() : null,
    attachments: publicationAttachments(p),
  };
}

// Costruisce gli allegati da mostrare al pubblico, riusando il formato
// PublicationAttachment per poter riutilizzare il componente AlboLink:
// - source "manual": un allegato dal file archiviato e/o dal link ufficiale.
// - source "auto": gli allegati della pubblicazione collegata.
function buildAttachments(
  act: FundamentalAct,
  linked: Publication | undefined,
): PublicationAttachment[] {
  if (act.source === "manual") {
    const file = act.manualFile as FundamentalActFile | null;
    const attachments: PublicationAttachment[] = [];
    if (file) {
      attachments.push({
        name: file.name,
        tipo: "documento",
        officialUrl: act.manualOfficialUrl ?? file.storagePath,
        storagePath: file.storagePath,
        contentType: file.contentType,
        size: file.size,
      });
    } else if (act.manualOfficialUrl) {
      attachments.push({
        name: act.title ?? act.label,
        tipo: "documento",
        officialUrl: act.manualOfficialUrl,
        storagePath: null,
        contentType: null,
        size: null,
      });
    }
    return attachments;
  }
  if (act.source === "auto") {
    return publicationAttachments(linked);
  }
  return [];
}

// Una voce è "pubblicata" (visibile al pubblico) se ha una fonte con almeno un
// documento o link consultabile.
function isPublished(
  act: FundamentalAct,
  linked: Publication | undefined,
): boolean {
  return buildAttachments(act, linked).length > 0;
}

function mapPublic(act: FundamentalAct, linked: Publication | undefined) {
  return {
    id: act.id,
    slug: act.slug,
    label: act.label,
    title: act.title,
    description: act.description,
    source: act.source,
    attachments: buildAttachments(act, linked),
    updatedAt: act.updatedAt.toISOString(),
  };
}

function mapAdmin(
  act: FundamentalAct,
  byId: Map<number, Publication>,
) {
  const linked = act.linkedPublicationId
    ? byId.get(act.linkedPublicationId)
    : undefined;
  const suggested = act.suggestedPublicationId
    ? byId.get(act.suggestedPublicationId)
    : undefined;
  return {
    id: act.id,
    slug: act.slug,
    label: act.label,
    keywords: act.keywords ?? [],
    sortOrder: act.sortOrder,
    title: act.title,
    description: act.description,
    source: act.source,
    manualOfficialUrl: act.manualOfficialUrl,
    manualFile: (act.manualFile as FundamentalActFile | null) ?? null,
    attachments: buildAttachments(act, linked),
    linkedPublication: linked ? mapPublicationSummary(linked) : null,
    suggestedPublication: suggested ? mapPublicationSummary(suggested) : null,
    createdAt: act.createdAt.toISOString(),
    updatedAt: act.updatedAt.toISOString(),
  };
}

// Carica le pubblicazioni referenziate (linked/suggested) in un solo round-trip.
async function loadReferencedPublications(
  acts: FundamentalAct[],
): Promise<Map<number, Publication>> {
  const ids = new Set<number>();
  for (const a of acts) {
    if (a.linkedPublicationId) ids.add(a.linkedPublicationId);
    if (a.suggestedPublicationId) ids.add(a.suggestedPublicationId);
  }
  const byId = new Map<number, Publication>();
  if (ids.size === 0) return byId;
  const rows = await db
    .select()
    .from(publicationsTable)
    .where(inArray(publicationsTable.id, [...ids]));
  for (const r of rows) byId.set(r.id, r);
  return byId;
}

/**
 * GET /atti-fondamentali
 * Public list: only acts with a published current entry (latest version only).
 */
router.get("/atti-fondamentali", async (_req: Request, res: Response) => {
  const acts = await db
    .select()
    .from(fundamentalActsTable)
    .orderBy(asc(fundamentalActsTable.sortOrder), asc(fundamentalActsTable.id));
  const byId = await loadReferencedPublications(acts);

  const result = acts
    .map((a) => ({
      act: a,
      linked: a.linkedPublicationId ? byId.get(a.linkedPublicationId) : undefined,
    }))
    .filter(({ act, linked }) => isPublished(act, linked))
    .map(({ act, linked }) => mapPublic(act, linked));

  res.json(result);
});

/**
 * GET /atti-fondamentali/admin
 * Editorial list: all acts with suggestions and editorial metadata.
 */
router.get(
  "/atti-fondamentali/admin",
  requireIngestAuth,
  async (_req: Request, res: Response) => {
    const acts = await db
      .select()
      .from(fundamentalActsTable)
      .orderBy(
        asc(fundamentalActsTable.sortOrder),
        asc(fundamentalActsTable.id),
      );
    const byId = await loadReferencedPublications(acts);
    res.json(acts.map((a) => mapAdmin(a, byId)));
  },
);

/**
 * POST /atti-fondamentali
 * Create a new act type/entry.
 */
router.post(
  "/atti-fondamentali",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const parsed = CreateFundamentalActBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }
    const body = parsed.data;

    const hasManual = Boolean(body.manualFile || body.manualOfficialUrl);

    const existing = await db
      .select({ id: fundamentalActsTable.id })
      .from(fundamentalActsTable)
      .where(eq(fundamentalActsTable.slug, body.slug));
    if (existing.length > 0) {
      res.status(400).json({ error: "Esiste già un atto con questo slug" });
      return;
    }

    const [created] = await db
      .insert(fundamentalActsTable)
      .values({
        slug: body.slug,
        label: body.label,
        keywords: body.keywords ?? [],
        sortOrder: body.sortOrder ?? 0,
        title: body.title ?? null,
        description: body.description ?? null,
        source: hasManual ? "manual" : "none",
        manualOfficialUrl: body.manualOfficialUrl ?? null,
        manualFile: (body.manualFile as FundamentalActFile | null) ?? null,
      })
      .returning();

    await refreshFundamentalActSuggestion(created.id);

    const [fresh] = await db
      .select()
      .from(fundamentalActsTable)
      .where(eq(fundamentalActsTable.id, created.id));
    const byId = await loadReferencedPublications([fresh]);
    res.status(201).json(mapAdmin(fresh, byId));
  },
);

/**
 * PATCH /atti-fondamentali/:id
 * Update an act. Setting a manual file/link switches source to "manual";
 * clearing both manual fields resets to the auto/none state.
 */
router.patch(
  "/atti-fondamentali/:id",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }
    const parsed = UpdateFundamentalActBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }
    const body = parsed.data;

    const [current] = await db
      .select()
      .from(fundamentalActsTable)
      .where(eq(fundamentalActsTable.id, id));
    if (!current) {
      res.status(404).json({ error: "Atto non trovato" });
      return;
    }

    const updates: Partial<typeof fundamentalActsTable.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (body.label !== undefined) updates.label = body.label;
    if (body.keywords !== undefined) updates.keywords = body.keywords;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;

    // Gestione fonte manuale: se uno dei due campi è presente nel body lo
    // applichiamo e ricalcoliamo la fonte. Il valore risultante determina se la
    // voce è manuale, oppure ricade su un'eventuale pubblicazione collegata.
    const manualFileProvided = "manualFile" in body;
    const manualUrlProvided = "manualOfficialUrl" in body;
    if (manualFileProvided) {
      updates.manualFile =
        (body.manualFile as FundamentalActFile | null) ?? null;
    }
    if (manualUrlProvided) {
      updates.manualOfficialUrl = body.manualOfficialUrl ?? null;
    }

    if (manualFileProvided || manualUrlProvided) {
      const nextFile = manualFileProvided
        ? ((body.manualFile as FundamentalActFile | null) ?? null)
        : (current.manualFile as FundamentalActFile | null);
      const nextUrl = manualUrlProvided
        ? (body.manualOfficialUrl ?? null)
        : current.manualOfficialUrl;
      const hasManual = Boolean(nextFile || nextUrl);
      if (hasManual) {
        updates.source = "manual";
      } else {
        // Niente più contenuto manuale: ricadi su auto se c'è una
        // pubblicazione collegata, altrimenti nessuna fonte.
        updates.source = current.linkedPublicationId ? "auto" : "none";
      }
    }

    const [updated] = await db
      .update(fundamentalActsTable)
      .set(updates)
      .where(eq(fundamentalActsTable.id, id))
      .returning();

    const byId = await loadReferencedPublications([updated]);
    res.json(mapAdmin(updated, byId));
  },
);

/**
 * DELETE /atti-fondamentali/:id
 */
router.delete(
  "/atti-fondamentali/:id",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }
    const [deleted] = await db
      .delete(fundamentalActsTable)
      .where(eq(fundamentalActsTable.id, id))
      .returning({ id: fundamentalActsTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Atto non trovato" });
      return;
    }
    res.status(204).end();
  },
);

/**
 * POST /atti-fondamentali/:id/conferma-suggerimento
 * Confirm the auto-matched suggestion as the current entry (source -> auto).
 * Non-destructive towards manual entries: if a manual entry exists, the
 * redazione must clear it first; here we simply set the link and source.
 */
router.post(
  "/atti-fondamentali/:id/conferma-suggerimento",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }
    const [current] = await db
      .select()
      .from(fundamentalActsTable)
      .where(eq(fundamentalActsTable.id, id));
    if (!current) {
      res.status(404).json({ error: "Atto non trovato" });
      return;
    }
    if (!current.suggestedPublicationId) {
      res.status(400).json({ error: "Nessun suggerimento disponibile" });
      return;
    }

    const [updated] = await db
      .update(fundamentalActsTable)
      .set({
        linkedPublicationId: current.suggestedPublicationId,
        source: "auto",
        // La conferma del suggerimento sostituisce la fonte manuale.
        manualFile: null,
        manualOfficialUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(fundamentalActsTable.id, id))
      .returning();

    const byId = await loadReferencedPublications([updated]);
    res.json(mapAdmin(updated, byId));
  },
);

export default router;
