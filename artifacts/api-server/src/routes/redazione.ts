/**
 * Redazione API — endpoints for the unified editorial panel.
 * All write endpoints are protected by requireEditorAuth.
 * Read endpoints for page blocks are public (serve published layout).
 */
import { Router, type IRouter } from "express";
import { db, feedStatusTable, pageBlocksTable, siteStringsTable, helperOverridesTable, themesTable } from "@workspace/db";
import { eq, asc, inArray, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { requireEditorAuth } from "../middlewares/requireEditorAuth";
import { runIngestion } from "../lib/ingestion";
import { runAnacContractsIngestion } from "../lib/anacContracts";
import { runAttuazioneIngestion } from "../lib/attuazionePnrr";
import { runOrganiSedutaSync } from "@workspace/db";
import { helperContents } from "../lib/helperContent";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Bacheca — feed status + "Aggiorna ora"
// ---------------------------------------------------------------------------

router.get("/redazione/bacheca/feed-status", requireEditorAuth, async (_req, res) => {
  const rows = await db.select().from(feedStatusTable).orderBy(asc(feedStatusTable.source));
  res.json(rows);
});

// On-demand ingestion triggers
async function triggerIngestion(source: string, res: import("express").Response, req: import("express").Request) {
  try {
    switch (source) {
      case "albo":
        await runIngestion();
        break;
      case "anac":
        await runAnacContractsIngestion();
        break;
      case "pnrr":
        await runAttuazioneIngestion();
        break;
      case "organi":
        await runOrganiSedutaSync();
        break;
      default:
        res.status(400).json({ error: `Fonte sconosciuta: ${source}` });
        return;
    }
    // Return updated status
    const rows = await db.select().from(feedStatusTable).orderBy(asc(feedStatusTable.source));
    res.json({ ok: true, feedStatus: rows });
  } catch (err) {
    req.log?.error({ err }, `Trigger ingestion failed for ${source}`);
    res.status(500).json({ error: "Aggiornamento non riuscito. Riprova." });
  }
}

router.post("/redazione/bacheca/trigger/:source", requireEditorAuth, async (req, res) => {
  const source = Array.isArray(req.params.source) ? req.params.source[0] : req.params.source;
  await triggerIngestion(source, res, req);
});

// ---------------------------------------------------------------------------
// Pages & Blocks
// ---------------------------------------------------------------------------

// Public: get published + enabled blocks for a page (citizen-facing)
router.get("/redazione/pages/:pageSlug/blocks", async (req, res) => {
  const pageSlug = String(req.params.pageSlug);
  const rows = await db
    .select()
    .from(pageBlocksTable)
    .where(
      and(
        eq(pageBlocksTable.pageSlug, pageSlug),
        eq(pageBlocksTable.status, "published"),
        eq(pageBlocksTable.enabled, true),
      ),
    )
    .orderBy(asc(pageBlocksTable.position));
  res.json(rows);
});

// Editor: get all blocks (including drafts) for a page
router.get("/redazione/pages/:pageSlug/blocks/draft", requireEditorAuth, async (req, res) => {
  const pageSlug = String(req.params.pageSlug);
  const rows = await db
    .select()
    .from(pageBlocksTable)
    .where(eq(pageBlocksTable.pageSlug, pageSlug))
    .orderBy(asc(pageBlocksTable.position));
  res.json(rows);
});

// Create a block
router.post("/redazione/pages/:pageSlug/blocks", requireEditorAuth, async (req, res) => {
  const pageSlug = String(req.params.pageSlug);
  const { blockType, position, content, status, enabled } = req.body as {
    blockType?: string;
    position?: number;
    content?: Record<string, unknown>;
    status?: string;
    enabled?: boolean;
  };
  if (!blockType) {
    res.status(400).json({ error: "blockType è obbligatorio" });
    return;
  }
  const [created] = await db.insert(pageBlocksTable).values({
    pageSlug,
    blockType,
    position: position ?? 0,
    content: content ?? {},
    status: status ?? "draft",
    enabled: enabled ?? true,
    updatedAt: new Date(),
  }).returning();
  res.status(201).json(created);
});

// Update a block
router.patch("/redazione/pages/:pageSlug/blocks/:id", requireEditorAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { content, draftContent, status, enabled, position } = req.body as {
    content?: Record<string, unknown>;
    draftContent?: Record<string, unknown> | null;
    status?: string;
    enabled?: boolean;
    position?: number;
  };
  const updates: Partial<typeof pageBlocksTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (content !== undefined) updates.content = content;
  if (draftContent !== undefined) updates.draftContent = draftContent;
  if (status !== undefined) updates.status = status;
  if (enabled !== undefined) updates.enabled = enabled;
  if (position !== undefined) updates.position = position;

  const [updated] = await db
    .update(pageBlocksTable)
    .set(updates)
    .where(eq(pageBlocksTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Blocco non trovato" });
    return;
  }
  res.json(updated);
});

// Delete a block
router.delete("/redazione/pages/:pageSlug/blocks/:id", requireEditorAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(pageBlocksTable).where(eq(pageBlocksTable.id, id));
  res.json({ ok: true });
});

// Reorder blocks (bulk position update)
router.put("/redazione/pages/:pageSlug/blocks/reorder", requireEditorAuth, async (req, res) => {
  const order = req.body as { id: number; position: number }[];
  if (!Array.isArray(order)) {
    res.status(400).json({ error: "Array di {id, position} richiesto" });
    return;
  }
  await Promise.all(
    order.map(({ id, position }) =>
      db.update(pageBlocksTable).set({ position, updatedAt: new Date() }).where(eq(pageBlocksTable.id, id))
    )
  );
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Site Strings (micro-copy)
// ---------------------------------------------------------------------------

// Get all strings:
//   - Allowlisted editor (Clerk session in EDITOR_EMAILS): full rows with draft/published data
//   - Everyone else: key → effective published value only
router.get("/redazione/site-strings", async (req, res) => {
  const auth = getAuth(req);
  const userId = auth?.userId;

  let isEditor = false;
  if (userId) {
    const raw = process.env.EDITOR_EMAILS ?? "";
    const allowedEmails = new Set(
      raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
    );
    const email =
      (auth.sessionClaims?.email as string | undefined)?.toLowerCase() ?? "";
    if (allowedEmails.size === 0 && process.env.NODE_ENV === "development") {
      isEditor = true;
    } else if (email && allowedEmails.has(email)) {
      isEditor = true;
    }
  }

  const rows = await db.select().from(siteStringsTable);
  if (isEditor) {
    res.json(rows);
  } else {
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.publishedValue ?? row.defaultValue;
    }
    res.json(result);
  }
});

// Get by namespace (public — returns key → effective value)
router.get("/redazione/site-strings/:namespace", async (req, res) => {
  const namespace = String(req.params.namespace);
  const rows = await db
    .select()
    .from(siteStringsTable)
    .where(eq(siteStringsTable.namespace, namespace));
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.publishedValue ?? row.defaultValue;
  }
  res.json(result);
});

// Upsert a site string
router.put("/redazione/site-strings/:key", requireEditorAuth, async (req, res) => {
  const key = String(req.params.key);
  const { namespace, defaultValue, draftValue, publishedValue, richText } = req.body as {
    namespace?: string;
    defaultValue?: string;
    draftValue?: string;
    publishedValue?: string;
    richText?: boolean;
  };

  const existing = await db.select().from(siteStringsTable).where(eq(siteStringsTable.key, key)).limit(1);
  if (existing.length === 0) {
    const [created] = await db.insert(siteStringsTable).values({
      key,
      namespace: namespace ?? "general",
      defaultValue: defaultValue ?? "",
      draftValue: draftValue ?? null,
      publishedValue: publishedValue ?? null,
      richText: richText ?? false,
      updatedAt: new Date(),
    }).returning();
    res.status(201).json(created);
  } else {
    const updates: Partial<typeof siteStringsTable.$inferInsert> = { updatedAt: new Date() };
    if (namespace !== undefined) updates.namespace = namespace;
    if (defaultValue !== undefined) updates.defaultValue = defaultValue;
    if (draftValue !== undefined) updates.draftValue = draftValue;
    if (publishedValue !== undefined) updates.publishedValue = publishedValue;
    if (richText !== undefined) updates.richText = richText;
    const [updated] = await db.update(siteStringsTable).set(updates).where(eq(siteStringsTable.key, key)).returning();
    res.json(updated);
  }
});

// Publish a draft site string
router.post("/redazione/site-strings/:key/publish", requireEditorAuth, async (req, res) => {
  const key = String(req.params.key);
  const rows = await db.select().from(siteStringsTable).where(eq(siteStringsTable.key, key)).limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Stringa non trovata" });
    return;
  }
  const row = rows[0];
  const [updated] = await db
    .update(siteStringsTable)
    .set({ publishedValue: row.draftValue ?? row.publishedValue ?? row.defaultValue, updatedAt: new Date() })
    .where(eq(siteStringsTable.key, key))
    .returning();
  res.json(updated);
});

// ---------------------------------------------------------------------------
// Helper content overrides
// ---------------------------------------------------------------------------

router.get("/redazione/helper-override", async (_req, res) => {
  const rows = await db.select().from(helperOverridesTable);
  // Merge defaults with overrides
  const result = {
    ...helperContents,
    _overrides: rows.map(r => ({ key: r.key, hasPublished: !!r.publishedJson, hasDraft: !!r.draftJson })),
  };
  for (const row of rows) {
    if (row.publishedJson && row.key in helperContents) {
      (result as Record<string, unknown>)[row.key] = row.publishedJson;
    }
  }
  res.json(result);
});

router.put("/redazione/helper-override/:key", requireEditorAuth, async (req, res) => {
  const key = String(req.params.key);
  const { draftJson, publishedJson } = req.body as { draftJson?: unknown; publishedJson?: unknown };
  const existing = await db.select().from(helperOverridesTable).where(eq(helperOverridesTable.key, key)).limit(1);
  if (existing.length === 0) {
    const [created] = await db.insert(helperOverridesTable).values({
      key,
      draftJson: draftJson ?? null,
      publishedJson: publishedJson ?? null,
      updatedAt: new Date(),
    }).returning();
    res.status(201).json(created);
  } else {
    const updates: Partial<typeof helperOverridesTable.$inferInsert> = { updatedAt: new Date() };
    if (draftJson !== undefined) updates.draftJson = draftJson;
    if (publishedJson !== undefined) updates.publishedJson = publishedJson;
    const [updated] = await db.update(helperOverridesTable).set(updates).where(eq(helperOverridesTable.key, key)).returning();
    res.json(updated);
  }
});

// ---------------------------------------------------------------------------
// Whoami — allowlist check for frontend gate
// ---------------------------------------------------------------------------
router.get("/redazione/whoami", (req, res) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.json({ editor: false, email: null });
    return;
  }
  const raw = process.env.EDITOR_EMAILS ?? "";
  const allowedEmails = new Set(
    raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
  );
  const email =
    (auth.sessionClaims?.email as string | undefined)?.toLowerCase() ?? "";
  const editor =
    allowedEmails.size === 0
      ? process.env.NODE_ENV === "development"
      : !!(email && allowedEmails.has(email));
  res.json({ editor, email: email || null });
});

// ---------------------------------------------------------------------------
// Themes — status lifecycle from editorial panel
// ---------------------------------------------------------------------------
const VALID_THEME_STATUSES = ["aperto", "in_corso", "monitoraggio", "chiuso"];

router.patch("/redazione/themes/:id/status", requireEditorAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID non valido" });
    return;
  }
  const { status } = req.body as { status?: string };
  if (!status || !VALID_THEME_STATUSES.includes(status)) {
    res.status(400).json({ error: "Stato non valido", valid: VALID_THEME_STATUSES });
    return;
  }
  const [row] = await db
    .update(themesTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(themesTable.id, id))
    .returning({ id: themesTable.id, status: themesTable.status });
  if (!row) {
    res.status(404).json({ error: "Tema non trovato" });
    return;
  }
  res.json(row);
});

// ---------------------------------------------------------------------------
// Reports — moderation from editorial panel
// ---------------------------------------------------------------------------
const VALID_REPORT_STATUSES = ["in_valutazione", "presa_in_carico", "archiviata"];

router.patch("/redazione/reports/:id/status", requireEditorAuth, async (req, res) => {
  const { reportsTable } = await import("@workspace/db");
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID non valido" });
    return;
  }
  const { status } = req.body as { status?: string };
  if (!status || !VALID_REPORT_STATUSES.includes(status)) {
    res.status(400).json({ error: "Stato non valido", valid: VALID_REPORT_STATUSES });
    return;
  }
  const [row] = await db
    .update(reportsTable)
    .set({ status })
    .where(eq(reportsTable.id, id))
    .returning({ id: reportsTable.id, status: reportsTable.status });
  if (!row) {
    res.status(404).json({ error: "Segnalazione non trovata" });
    return;
  }
  res.json(row);
});

export default router;
