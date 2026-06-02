import { Router, type IRouter } from "express";
import {
  db,
  legalityAreasTable,
  legalityRequirementsTable,
  legalityOverviewTable,
  type LegalityArea,
  type LegalityRequirement,
  type LegalityActLink,
} from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import {
  UpdateLegalityOverviewBody,
  CreateLegalityAreaBody,
  UpdateLegalityAreaBody,
  CreateLegalityRequirementBody,
  UpdateLegalityRequirementBody,
} from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

const router: IRouter = Router();

function mapArea(a: LegalityArea) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description,
    finalJudgment: a.finalJudgment,
    position: a.position,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

function mapRequirement(r: LegalityRequirement) {
  return {
    id: r.id,
    areaId: r.areaId,
    title: r.title,
    description: r.description,
    status: r.status,
    comment: r.comment,
    linkedActs: r.linkedActs,
    position: r.position,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

// Normalizza l'elenco degli atti collegati: scarta le voci senza etichetta o
// URL, ripulisce gli spazi e impedisce che venga salvata spazzatura.
function normalizeLinkedActs(
  links: { label: string; url: string }[] | undefined,
): LegalityActLink[] {
  if (!links) return [];
  return links
    .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
    .filter((l) => l.label && l.url);
}

// Restituisce l'intera sezione in una sola chiamata: giudizio complessivo +
// aree con i requisiti annidati e i relativi atti collegati. Tutto editoriale.
router.get("/legality", async (_req, res) => {
  const [overviewRow] = await db
    .select()
    .from(legalityOverviewTable)
    .where(eq(legalityOverviewTable.id, 1));

  const [areas, requirements] = await Promise.all([
    db
      .select()
      .from(legalityAreasTable)
      .orderBy(asc(legalityAreasTable.position), asc(legalityAreasTable.id)),
    db
      .select()
      .from(legalityRequirementsTable)
      .orderBy(
        asc(legalityRequirementsTable.position),
        asc(legalityRequirementsTable.id),
      ),
  ]);

  const requirementsByArea = new Map<number, LegalityRequirement[]>();
  for (const r of requirements) {
    const list = requirementsByArea.get(r.areaId) ?? [];
    list.push(r);
    requirementsByArea.set(r.areaId, list);
  }

  res.json({
    overallJudgment: overviewRow?.overallJudgment ?? "",
    updatedAt: overviewRow?.updatedAt
      ? overviewRow.updatedAt.toISOString()
      : null,
    areas: areas.map((a) => ({
      ...mapArea(a),
      requirements: (requirementsByArea.get(a.id) ?? []).map(mapRequirement),
    })),
  });
});

// --- Endpoint redazione (protetti da requireIngestAuth) ---

// Imposta il giudizio complessivo dell'intera sezione (riga singola id = 1).
router.patch("/legality/overview", requireIngestAuth, async (req, res) => {
  const parsed = UpdateLegalityOverviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }

  const now = new Date();
  const overallJudgment = parsed.data.overallJudgment;
  const [row] = await db
    .insert(legalityOverviewTable)
    .values({ id: 1, overallJudgment, updatedAt: now })
    .onConflictDoUpdate({
      target: legalityOverviewTable.id,
      set: { overallJudgment, updatedAt: now },
    })
    .returning();

  res.json({
    overallJudgment: row.overallJudgment,
    updatedAt: row.updatedAt.toISOString(),
  });
});

// Crea una nuova area di monitoraggio.
router.post("/legality/areas", requireIngestAuth, async (req, res) => {
  const parsed = CreateLegalityAreaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }
  const data = parsed.data;
  const slug = data.slug.trim();
  const title = data.title.trim();
  if (!slug || !title) {
    res.status(400).json({ error: "Slug e titolo sono obbligatori" });
    return;
  }

  const [existing] = await db
    .select({ id: legalityAreasTable.id })
    .from(legalityAreasTable)
    .where(eq(legalityAreasTable.slug, slug));
  if (existing) {
    res.status(409).json({ error: "Slug già in uso" });
    return;
  }

  const [created] = await db
    .insert(legalityAreasTable)
    .values({
      slug,
      title,
      description: data.description?.trim() ?? "",
      finalJudgment: data.finalJudgment?.trim() ?? "",
      position: data.position ?? 0,
    })
    .returning();

  res.status(201).json(mapArea(created));
});

// Aggiorna un'area esistente.
router.patch("/legality/areas/:id", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Area non trovata" });
    return;
  }

  const [area] = await db
    .select()
    .from(legalityAreasTable)
    .where(eq(legalityAreasTable.id, id));
  if (!area) {
    res.status(404).json({ error: "Area non trovata" });
    return;
  }

  const parsed = UpdateLegalityAreaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dati non validi" });
    return;
  }
  const data = parsed.data;

  const updates: Partial<typeof legalityAreasTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (data.title !== undefined) {
    const title = data.title.trim();
    if (!title) {
      res.status(400).json({ error: "Il titolo è obbligatorio" });
      return;
    }
    updates.title = title;
  }
  if (data.description !== undefined) {
    updates.description = data.description.trim();
  }
  if (data.finalJudgment !== undefined) {
    updates.finalJudgment = data.finalJudgment.trim();
  }
  if (data.position !== undefined) {
    updates.position = data.position;
  }

  const [updated] = await db
    .update(legalityAreasTable)
    .set(updates)
    .where(eq(legalityAreasTable.id, id))
    .returning();

  res.json(mapArea(updated));
});

// Elimina un'area e, a cascata, i suoi requisiti.
router.delete("/legality/areas/:id", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Area non trovata" });
    return;
  }

  const deleted = await db
    .delete(legalityAreasTable)
    .where(eq(legalityAreasTable.id, id))
    .returning();

  if (deleted.length === 0) {
    res.status(404).json({ error: "Area non trovata" });
    return;
  }

  res.status(204).end();
});

// Crea un requisito dentro un'area.
router.post(
  "/legality/areas/:id/requirements",
  requireIngestAuth,
  async (req, res) => {
    const areaId = Number(req.params.id);
    if (!Number.isInteger(areaId)) {
      res.status(404).json({ error: "Area non trovata" });
      return;
    }

    const [area] = await db
      .select({ id: legalityAreasTable.id })
      .from(legalityAreasTable)
      .where(eq(legalityAreasTable.id, areaId));
    if (!area) {
      res.status(404).json({ error: "Area non trovata" });
      return;
    }

    const parsed = CreateLegalityRequirementBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }
    const data = parsed.data;
    const title = data.title.trim();
    if (!title) {
      res.status(400).json({ error: "Il titolo è obbligatorio" });
      return;
    }

    const [created] = await db
      .insert(legalityRequirementsTable)
      .values({
        areaId,
        title,
        description: data.description?.trim() ?? "",
        status: data.status ?? "absent",
        comment: data.comment?.trim() ?? "",
        linkedActs: normalizeLinkedActs(data.linkedActs),
        position: data.position ?? 0,
      })
      .returning();

    res.status(201).json(mapRequirement(created));
  },
);

// Aggiorna un requisito (incluso lo spostamento in un'altra area).
router.patch(
  "/legality/requirements/:id",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Requisito non trovato" });
      return;
    }

    const [requirement] = await db
      .select()
      .from(legalityRequirementsTable)
      .where(eq(legalityRequirementsTable.id, id));
    if (!requirement) {
      res.status(404).json({ error: "Requisito non trovato" });
      return;
    }

    const parsed = UpdateLegalityRequirementBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dati non validi" });
      return;
    }
    const data = parsed.data;

    const updates: Partial<typeof legalityRequirementsTable.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (data.areaId !== undefined) {
      const [area] = await db
        .select({ id: legalityAreasTable.id })
        .from(legalityAreasTable)
        .where(eq(legalityAreasTable.id, data.areaId));
      if (!area) {
        res.status(400).json({ error: "Area non trovata" });
        return;
      }
      updates.areaId = data.areaId;
    }
    if (data.title !== undefined) {
      const title = data.title.trim();
      if (!title) {
        res.status(400).json({ error: "Il titolo è obbligatorio" });
        return;
      }
      updates.title = title;
    }
    if (data.description !== undefined) {
      updates.description = data.description.trim();
    }
    if (data.status !== undefined) {
      updates.status = data.status;
    }
    if (data.comment !== undefined) {
      updates.comment = data.comment.trim();
    }
    if (data.linkedActs !== undefined) {
      updates.linkedActs = normalizeLinkedActs(data.linkedActs);
    }
    if (data.position !== undefined) {
      updates.position = data.position;
    }

    const [updated] = await db
      .update(legalityRequirementsTable)
      .set(updates)
      .where(eq(legalityRequirementsTable.id, id))
      .returning();

    res.json(mapRequirement(updated));
  },
);

// Elimina un requisito.
router.delete(
  "/legality/requirements/:id",
  requireIngestAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Requisito non trovato" });
      return;
    }

    const deleted = await db
      .delete(legalityRequirementsTable)
      .where(eq(legalityRequirementsTable.id, id))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Requisito non trovato" });
      return;
    }

    res.status(204).end();
  },
);

export default router;
