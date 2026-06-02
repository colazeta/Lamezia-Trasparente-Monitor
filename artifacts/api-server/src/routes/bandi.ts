import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  bandiTable,
  bandoMatchesTable,
  publicationsTable,
  contractsTable,
  attuazionePnrrProjectsTable,
  type Bando,
  type BandoMatch,
  type Publication,
  type Contract,
  type AttuazionePnrrProject,
} from "@workspace/db";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { CreateBandoBody, UpdateBandoBody } from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";
import {
  deriveEsito,
  lostAmountFor,
  refreshBandoMatchesFor,
  type BandoEsito,
} from "../lib/bandi";

const router: IRouter = Router();

// --- Risoluzione dei target dei riscontri ----------------------------------
type ResolvedTargets = {
  publications: Map<number, Publication>;
  contracts: Map<number, Contract>;
  pnrr: Map<number, AttuazionePnrrProject>;
};

async function resolveMatchTargets(
  matches: BandoMatch[],
): Promise<ResolvedTargets> {
  const pubIds = new Set<number>();
  const contractIds = new Set<number>();
  const pnrrIds = new Set<number>();
  for (const m of matches) {
    if (m.publicationId != null) pubIds.add(m.publicationId);
    if (m.contractId != null) contractIds.add(m.contractId);
    if (m.pnrrProjectId != null) pnrrIds.add(m.pnrrProjectId);
  }
  const publications = new Map<number, Publication>();
  const contracts = new Map<number, Contract>();
  const pnrr = new Map<number, AttuazionePnrrProject>();
  if (pubIds.size > 0) {
    const rows = await db
      .select()
      .from(publicationsTable)
      .where(inArray(publicationsTable.id, [...pubIds]));
    for (const r of rows) publications.set(r.id, r);
  }
  if (contractIds.size > 0) {
    const rows = await db
      .select()
      .from(contractsTable)
      .where(inArray(contractsTable.id, [...contractIds]));
    for (const r of rows) contracts.set(r.id, r);
  }
  if (pnrrIds.size > 0) {
    const rows = await db
      .select()
      .from(attuazionePnrrProjectsTable)
      .where(inArray(attuazionePnrrProjectsTable.id, [...pnrrIds]));
    for (const r of rows) pnrr.set(r.id, r);
  }
  return { publications, contracts, pnrr };
}

function mapMatch(m: BandoMatch, targets: ResolvedTargets) {
  let title = "";
  let reference: string | null = null;
  let date: string | null = null;
  let url: string | null = null;
  if (m.targetType === "publication" && m.publicationId != null) {
    const p = targets.publications.get(m.publicationId);
    if (p) {
      title = p.oggetto;
      reference = p.progressivo;
      date = (p.pubStart ?? p.dataAtto)?.toISOString() ?? null;
    }
  } else if (m.targetType === "contract" && m.contractId != null) {
    const c = targets.contracts.get(m.contractId);
    if (c) {
      title = c.title;
      reference = c.cig ?? c.cup ?? null;
      date = c.awardDate ? c.awardDate.toISOString() : null;
      url = c.anacUrl ?? null;
    }
  } else if (m.targetType === "pnrr" && m.pnrrProjectId != null) {
    const r = targets.pnrr.get(m.pnrrProjectId);
    if (r) {
      title = r.title;
      reference = r.cup ?? null;
    }
  }
  return {
    id: m.id,
    targetType: m.targetType,
    matchReason: m.matchReason,
    confirmed: m.confirmed,
    dismissed: m.dismissed,
    title,
    reference,
    date,
    url,
    publicationId: m.publicationId,
    contractId: m.contractId,
    pnrrProjectId: m.pnrrProjectId,
  };
}

async function loadMatchesByBando(
  bandoIds: number[],
): Promise<Map<number, BandoMatch[]>> {
  const byBando = new Map<number, BandoMatch[]>();
  if (bandoIds.length === 0) return byBando;
  const rows = await db
    .select()
    .from(bandoMatchesTable)
    .where(inArray(bandoMatchesTable.bandoId, bandoIds))
    .orderBy(desc(bandoMatchesTable.confirmed), asc(bandoMatchesTable.id));
  for (const r of rows) {
    const list = byBando.get(r.bandoId) ?? [];
    list.push(r);
    byBando.set(r.bandoId, list);
  }
  return byBando;
}

function mapPublic(b: Bando, matches: BandoMatch[]) {
  const esito = deriveEsito(b.status, matches);
  const confirmed = matches.filter((m) => m.confirmed && !m.dismissed);
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    enteErogatore: b.enteErogatore,
    description: b.description,
    eligibility: b.eligibility,
    importoStanziato: b.importoStanziato,
    importoMedioAggiudicato: b.importoMedioAggiudicato,
    scadenza: b.scadenza ? b.scadenza.toISOString() : null,
    status: b.status,
    settore: b.settore,
    officialUrl: b.officialUrl,
    esito,
    lostAmount: lostAmountFor(b, esito),
    matchCount: confirmed.length,
    updatedAt: b.updatedAt.toISOString(),
  };
}

function mapDetail(
  b: Bando,
  matches: BandoMatch[],
  targets: ResolvedTargets,
  includeAll: boolean,
) {
  const esito = deriveEsito(b.status, matches);
  const visible = includeAll
    ? matches
    : matches.filter((m) => m.confirmed && !m.dismissed);
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    enteErogatore: b.enteErogatore,
    description: b.description,
    eligibility: b.eligibility,
    importoStanziato: b.importoStanziato,
    importoMedioAggiudicato: b.importoMedioAggiudicato,
    scadenza: b.scadenza ? b.scadenza.toISOString() : null,
    status: b.status,
    settore: b.settore,
    officialUrl: b.officialUrl,
    esito,
    lostAmount: lostAmountFor(b, esito),
    matches: visible.map((m) => mapMatch(m, targets)),
    updatedAt: b.updatedAt.toISOString(),
  };
}

function mapAdmin(b: Bando, matches: BandoMatch[], targets: ResolvedTargets) {
  const esito = deriveEsito(b.status, matches);
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    enteErogatore: b.enteErogatore,
    description: b.description,
    eligibility: b.eligibility,
    importoStanziato: b.importoStanziato,
    importoMedioAggiudicato: b.importoMedioAggiudicato,
    scadenza: b.scadenza ? b.scadenza.toISOString() : null,
    status: b.status,
    settore: b.settore,
    officialUrl: b.officialUrl,
    source: b.source,
    keywords: b.keywords ?? [],
    notes: b.notes,
    esito,
    lostAmount: lostAmountFor(b, esito),
    matches: matches.map((m) => mapMatch(m, targets)),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

// Carica un bando admin completo (riscontri + target risolti) per le risposte
// delle mutazioni.
async function buildAdminResponse(bando: Bando) {
  const matchesByBando = await loadMatchesByBando([bando.id]);
  const matches = matchesByBando.get(bando.id) ?? [];
  const targets = await resolveMatchTargets(matches);
  return mapAdmin(bando, matches, targets);
}

/**
 * GET /bandi
 * Public catalog: only curated (manual) bandi, with optional filters.
 */
router.get("/bandi", async (req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(bandiTable)
    .where(eq(bandiTable.source, "manual"))
    .orderBy(desc(bandiTable.updatedAt), desc(bandiTable.id));
  const matchesByBando = await loadMatchesByBando(rows.map((r) => r.id));

  const statusFilter = typeof req.query.status === "string" ? req.query.status : null;
  const settoreFilter =
    typeof req.query.settore === "string" ? req.query.settore : null;
  const esitoFilter = typeof req.query.esito === "string" ? req.query.esito : null;
  const enteFilter =
    typeof req.query.ente === "string" ? req.query.ente.toLowerCase() : null;

  const result = rows
    .map((b) => mapPublic(b, matchesByBando.get(b.id) ?? []))
    .filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (settoreFilter && b.settore !== settoreFilter) return false;
      if (esitoFilter && b.esito !== esitoFilter) return false;
      if (enteFilter && !b.enteErogatore.toLowerCase().includes(enteFilter))
        return false;
      return true;
    });

  res.json(result);
});

/**
 * GET /bandi/summary
 * Aggregate stats over curated bandi.
 */
router.get("/bandi/summary", async (_req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(bandiTable)
    .where(eq(bandiTable.source, "manual"));
  const matchesByBando = await loadMatchesByBando(rows.map((r) => r.id));

  let aperti = 0;
  let inScadenza = 0;
  let conclusi = 0;
  let partecipati = 0;
  let vinti = 0;
  let nonPartecipati = 0;
  let daVerificare = 0;
  let risorsePerseTotale = 0;
  const settoreMap = new Map<string, { count: number; risorsePerse: number }>();
  const esitoMap = new Map<BandoEsito, number>();

  for (const b of rows) {
    const matches = matchesByBando.get(b.id) ?? [];
    const esito = deriveEsito(b.status, matches);
    const lost = lostAmountFor(b, esito);
    risorsePerseTotale += lost;

    if (b.status === "aperto") aperti += 1;
    else if (b.status === "in-scadenza") inScadenza += 1;
    else if (b.status === "concluso") conclusi += 1;

    if (esito === "vinto") vinti += 1;
    else if (esito === "partecipato") partecipati += 1;
    else if (esito === "non-partecipato") nonPartecipati += 1;
    else daVerificare += 1;

    esitoMap.set(esito, (esitoMap.get(esito) ?? 0) + 1);

    const settore = b.settore ?? "altro";
    const cur = settoreMap.get(settore) ?? { count: 0, risorsePerse: 0 };
    cur.count += 1;
    cur.risorsePerse += lost;
    settoreMap.set(settore, cur);
  }

  const totaleMappati = rows.length;
  // Tasso di partecipazione: quota di bandi a cui il Comune ha partecipato o
  // che ha vinto, sul totale dei bandi mappati.
  const tassoPartecipazione =
    totaleMappati > 0 ? (partecipati + vinti) / totaleMappati : 0;

  res.json({
    totaleMappati,
    aperti,
    inScadenza,
    conclusi,
    partecipati,
    vinti,
    nonPartecipati,
    daVerificare,
    tassoPartecipazione,
    risorsePerseTotale,
    perSettore: [...settoreMap.entries()].map(([settore, v]) => ({
      settore,
      count: v.count,
      risorsePerse: v.risorsePerse,
    })),
    perEsito: [...esitoMap.entries()].map(([esito, count]) => ({
      esito,
      count,
    })),
  });
});

/**
 * GET /bandi/admin
 * Editorial list: all bandi (incl. suggestions) with all matches.
 */
router.get(
  "/bandi/admin",
  requireIngestAuth,
  async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(bandiTable)
      .orderBy(asc(bandiTable.source), desc(bandiTable.updatedAt));
    const matchesByBando = await loadMatchesByBando(rows.map((r) => r.id));
    const allMatches = rows.flatMap((r) => matchesByBando.get(r.id) ?? []);
    const targets = await resolveMatchTargets(allMatches);
    res.json(
      rows.map((b) => mapAdmin(b, matchesByBando.get(b.id) ?? [], targets)),
    );
  },
);

/**
 * POST /bandi
 * Create a curated bando.
 */
router.post("/bandi", requireIngestAuth, async (req: Request, res: Response) => {
  const parsed = CreateBandoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }
  const body = parsed.data;

  const existing = await db
    .select({ id: bandiTable.id })
    .from(bandiTable)
    .where(eq(bandiTable.slug, body.slug));
  if (existing.length > 0) {
    res.status(400).json({ error: "Esiste già un bando con questo slug" });
    return;
  }

  const [created] = await db
    .insert(bandiTable)
    .values({
      slug: body.slug,
      title: body.title,
      enteErogatore: body.enteErogatore ?? "",
      description: body.description ?? "",
      eligibility: body.eligibility ?? "",
      importoStanziato: body.importoStanziato ?? null,
      importoMedioAggiudicato: body.importoMedioAggiudicato ?? null,
      scadenza: body.scadenza ? new Date(body.scadenza) : null,
      status: body.status ?? "aperto",
      settore: body.settore ?? null,
      officialUrl: body.officialUrl ?? null,
      source: "manual",
      keywords: body.keywords ?? [],
      notes: body.notes ?? "",
    })
    .returning();

  // Calcola subito i riscontri di partecipazione per il nuovo bando.
  await refreshBandoMatchesFor(created);

  const [fresh] = await db
    .select()
    .from(bandiTable)
    .where(eq(bandiTable.id, created.id));
  res.status(201).json(await buildAdminResponse(fresh));
});

/**
 * POST /bandi/matches/:matchId/conferma
 * Confirm a participation match.
 */
router.post(
  "/bandi/matches/:matchId/conferma",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const matchId = Number(req.params.matchId);
    if (!Number.isInteger(matchId)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }
    const [updated] = await db
      .update(bandoMatchesTable)
      .set({ confirmed: true, dismissed: false, updatedAt: new Date() })
      .where(eq(bandoMatchesTable.id, matchId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Riscontro non trovato" });
      return;
    }
    const [bando] = await db
      .select()
      .from(bandiTable)
      .where(eq(bandiTable.id, updated.bandoId));
    res.json(await buildAdminResponse(bando));
  },
);

/**
 * POST /bandi/matches/:matchId/scarta
 * Dismiss a participation match suggestion.
 */
router.post(
  "/bandi/matches/:matchId/scarta",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const matchId = Number(req.params.matchId);
    if (!Number.isInteger(matchId)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }
    const [updated] = await db
      .update(bandoMatchesTable)
      .set({ dismissed: true, confirmed: false, updatedAt: new Date() })
      .where(eq(bandoMatchesTable.id, matchId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Riscontro non trovato" });
      return;
    }
    const [bando] = await db
      .select()
      .from(bandiTable)
      .where(eq(bandiTable.id, updated.bandoId));
    res.json(await buildAdminResponse(bando));
  },
);

/**
 * GET /bandi/:slug
 * Public detail (confirmed matches only).
 */
router.get("/bandi/:slug", async (req: Request, res: Response) => {
  const [bando] = await db
    .select()
    .from(bandiTable)
    .where(eq(bandiTable.slug, String(req.params.slug)));
  if (!bando || bando.source !== "manual") {
    res.status(404).json({ error: "Bando non trovato" });
    return;
  }
  const matchesByBando = await loadMatchesByBando([bando.id]);
  const matches = matchesByBando.get(bando.id) ?? [];
  const targets = await resolveMatchTargets(matches);
  res.json(mapDetail(bando, matches, targets, false));
});

/**
 * PATCH /bandi/:slug
 * Update a bando (editorial).
 */
router.patch(
  "/bandi/:slug",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const parsed = UpdateBandoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }
    const body = parsed.data;

    const [current] = await db
      .select()
      .from(bandiTable)
      .where(eq(bandiTable.slug, String(req.params.slug)));
    if (!current) {
      res.status(404).json({ error: "Bando non trovato" });
      return;
    }

    const updates: Partial<typeof bandiTable.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (body.title !== undefined) updates.title = body.title;
    if (body.enteErogatore !== undefined)
      updates.enteErogatore = body.enteErogatore;
    if (body.description !== undefined) updates.description = body.description;
    if (body.eligibility !== undefined) updates.eligibility = body.eligibility;
    if ("importoStanziato" in body)
      updates.importoStanziato = body.importoStanziato ?? null;
    if ("importoMedioAggiudicato" in body)
      updates.importoMedioAggiudicato = body.importoMedioAggiudicato ?? null;
    if ("scadenza" in body)
      updates.scadenza = body.scadenza ? new Date(body.scadenza) : null;
    if (body.status !== undefined) updates.status = body.status;
    if ("settore" in body) updates.settore = body.settore ?? null;
    if ("officialUrl" in body) updates.officialUrl = body.officialUrl ?? null;
    if (body.keywords !== undefined) updates.keywords = body.keywords;
    if (body.notes !== undefined) updates.notes = body.notes;

    const [updated] = await db
      .update(bandiTable)
      .set(updates)
      .where(eq(bandiTable.id, current.id))
      .returning();

    // Le keyword potrebbero essere cambiate: ricalcola i nuovi riscontri.
    await refreshBandoMatchesFor(updated);

    const [fresh] = await db
      .select()
      .from(bandiTable)
      .where(eq(bandiTable.id, current.id));
    res.json(await buildAdminResponse(fresh));
  },
);

/**
 * DELETE /bandi/:slug
 */
router.delete(
  "/bandi/:slug",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const [deleted] = await db
      .delete(bandiTable)
      .where(eq(bandiTable.slug, String(req.params.slug)))
      .returning({ id: bandiTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Bando non trovato" });
      return;
    }
    res.status(204).end();
  },
);

/**
 * POST /bandi/:slug/conferma
 * Promote an auto-suggested bando to a curated (manual) one.
 */
router.post(
  "/bandi/:slug/conferma",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const [current] = await db
      .select()
      .from(bandiTable)
      .where(eq(bandiTable.slug, String(req.params.slug)));
    if (!current) {
      res.status(404).json({ error: "Bando non trovato" });
      return;
    }
    const [updated] = await db
      .update(bandiTable)
      .set({ source: "manual", updatedAt: new Date() })
      .where(eq(bandiTable.id, current.id))
      .returning();
    res.json(await buildAdminResponse(updated));
  },
);

export default router;
