import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  confiscatedAssetsTable,
  type ConfiscatedAsset,
  type ConfiscatedAssetStatus,
} from "@workspace/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  CreateConfiscatedAssetBody,
  UpdateConfiscatedAssetBody,
} from "@workspace/api-zod";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";
import { nearestQuartiere } from "../lib/geocode";

const router: IRouter = Router();

// Vista pubblica: dati essenziali del bene con la sua posizione.
function mapPublic(a: ConfiscatedAsset) {
  return {
    id: a.id,
    slug: a.slug,
    denominazione: a.denominazione,
    description: a.description,
    tipologia: a.tipologia,
    status: a.status,
    indirizzo: a.indirizzo,
    assegnatario: a.assegnatario,
    destinazioneUso: a.destinazioneUso,
    datiCatastali: a.datiCatastali,
    officialUrl: a.officialUrl,
    latitude: a.latitude,
    longitude: a.longitude,
    geoAddress: a.geoAddress,
    geoQuartiere: a.geoQuartiere,
    updatedAt: a.updatedAt.toISOString(),
  };
}

// Vista redazionale: include provenienza, note e metadati di geolocalizzazione.
function mapAdmin(a: ConfiscatedAsset) {
  return {
    ...mapPublic(a),
    source: a.source,
    sourceId: a.sourceId,
    geoSource: a.geoSource,
    geoManual: a.geoManual,
    geoVerify: a.geoVerify,
    notes: a.notes,
    createdAt: a.createdAt.toISOString(),
  };
}

// --- GET /beni-confiscati: catalogo pubblico filtrabile --------------------
router.get("/beni-confiscati", async (req: Request, res: Response) => {
  const { status, tipologia } = req.query as {
    status?: string;
    tipologia?: string;
  };

  const conds = [];
  if (status) {
    conds.push(eq(confiscatedAssetsTable.status, status as ConfiscatedAssetStatus));
  }
  if (tipologia) {
    conds.push(eq(confiscatedAssetsTable.tipologia, tipologia));
  }

  const rows = await db
    .select()
    .from(confiscatedAssetsTable)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(confiscatedAssetsTable.denominazione));

  res.json(rows.map(mapPublic));
});

// --- GET /beni-confiscati/summary: statistiche aggregate -------------------
router.get("/beni-confiscati/summary", async (_req: Request, res: Response) => {
  const rows = await db.select().from(confiscatedAssetsTable);

  const byStatus = new Map<string, number>();
  const byTipologia = new Map<string, number>();
  let geolocalizzati = 0;
  for (const a of rows) {
    byStatus.set(a.status, (byStatus.get(a.status) ?? 0) + 1);
    const tip = a.tipologia.trim() || "Altro";
    byTipologia.set(tip, (byTipologia.get(tip) ?? 0) + 1);
    if (a.latitude != null && a.longitude != null) geolocalizzati += 1;
  }

  res.json({
    totale: rows.length,
    sequestrati: byStatus.get("sequestrato") ?? 0,
    confiscati: byStatus.get("confiscato") ?? 0,
    assegnati: byStatus.get("assegnato") ?? 0,
    riutilizzati: byStatus.get("riutilizzato") ?? 0,
    geolocalizzati,
    perStatus: [...byStatus.entries()].map(([status, count]) => ({
      status: status as ConfiscatedAssetStatus,
      count,
    })),
    perTipologia: [...byTipologia.entries()]
      .map(([tipologia, count]) => ({ tipologia, count }))
      .sort((a, b) => b.count - a.count),
  });
});

// --- GET /beni-confiscati/admin: elenco redazionale completo ---------------
router.get(
  "/beni-confiscati/admin",
  requireIngestAuth,
  async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(confiscatedAssetsTable)
      .orderBy(desc(confiscatedAssetsTable.updatedAt));
    res.json(rows.map(mapAdmin));
  },
);

// --- POST /beni-confiscati: creazione redazionale --------------------------
router.post(
  "/beni-confiscati",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const parsed = CreateConfiscatedAssetBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Dati non validi" });
      return;
    }
    const b = parsed.data;
    try {
      const [row] = await db
        .insert(confiscatedAssetsTable)
        .values({
          slug: b.slug,
          denominazione: b.denominazione,
          description: b.description ?? "",
          tipologia: b.tipologia ?? "",
          status: (b.status ?? "confiscato") as ConfiscatedAssetStatus,
          indirizzo: b.indirizzo ?? "",
          assegnatario: b.assegnatario ?? "",
          destinazioneUso: b.destinazioneUso ?? "",
          datiCatastali: b.datiCatastali ?? "",
          officialUrl: b.officialUrl ?? null,
          notes: b.notes ?? "",
          source: "manual",
        })
        .returning();
      res.status(201).json(mapAdmin(row));
    } catch {
      res.status(400).json({ message: "Slug già esistente o dati non validi" });
    }
  },
);

// --- GET /beni-confiscati/:slug: dettaglio pubblico ------------------------
router.get("/beni-confiscati/:slug", async (req: Request, res: Response) => {
  const [row] = await db
    .select()
    .from(confiscatedAssetsTable)
    .where(eq(confiscatedAssetsTable.slug, String(req.params.slug)))
    .limit(1);
  if (!row) {
    res.status(404).json({ message: "Bene non trovato" });
    return;
  }
  res.json(mapPublic(row));
});

// --- PATCH /beni-confiscati/:slug: aggiornamento redazionale ---------------
// Modificando un bene importato (auto) lo si promuove a manuale, così
// l'ingestione non lo sovrascrive più.
router.patch(
  "/beni-confiscati/:slug",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const parsed = UpdateConfiscatedAssetBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Dati non validi" });
      return;
    }
    const b = parsed.data;
    const update: Partial<typeof confiscatedAssetsTable.$inferInsert> = {
      updatedAt: new Date(),
      // Una voce curata a mano ha la precedenza sull'automatico.
      source: "manual",
    };
    if (b.denominazione !== undefined) update.denominazione = b.denominazione;
    if (b.description !== undefined) update.description = b.description;
    if (b.tipologia !== undefined) update.tipologia = b.tipologia;
    if (b.status !== undefined)
      update.status = b.status as ConfiscatedAssetStatus;
    if (b.indirizzo !== undefined) update.indirizzo = b.indirizzo;
    if (b.assegnatario !== undefined) update.assegnatario = b.assegnatario;
    if (b.destinazioneUso !== undefined)
      update.destinazioneUso = b.destinazioneUso;
    if (b.datiCatastali !== undefined) update.datiCatastali = b.datiCatastali;
    if (b.officialUrl !== undefined) update.officialUrl = b.officialUrl;
    if (b.notes !== undefined) update.notes = b.notes;

    const [row] = await db
      .update(confiscatedAssetsTable)
      .set(update)
      .where(eq(confiscatedAssetsTable.slug, String(req.params.slug)))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Bene non trovato" });
      return;
    }
    res.json(mapAdmin(row));
  },
);

// --- DELETE /beni-confiscati/:slug -----------------------------------------
router.delete(
  "/beni-confiscati/:slug",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const [row] = await db
      .delete(confiscatedAssetsTable)
      .where(eq(confiscatedAssetsTable.slug, String(req.params.slug)))
      .returning({ id: confiscatedAssetsTable.id });
    if (!row) {
      res.status(404).json({ message: "Bene non trovato" });
      return;
    }
    res.status(204).send();
  },
);

// --- PATCH /beni-confiscati/:id/location: correzione editoriale posizione ---
// Stessa convenzione dei contratti: una posizione fissata a mano imposta
// geoManual=true e blocca il geocoding automatico nei cicli successivi.
router.patch(
  "/beni-confiscati/:id/location",
  requireIngestAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(404).json({ message: "Bene non trovato" });
      return;
    }

    const body = req.body as {
      latitude?: unknown;
      longitude?: unknown;
      geoAddress?: unknown;
      geoQuartiere?: unknown;
      geoVerify?: unknown;
    };

    const hasLat = "latitude" in body;
    const hasLon = "longitude" in body;
    if (hasLat !== hasLon) {
      res
        .status(400)
        .json({ message: "latitude e longitude vanno forniti insieme" });
      return;
    }

    const update: Partial<typeof confiscatedAssetsTable.$inferInsert> = {
      geoManual: true,
      geoSource: "manual",
      updatedAt: new Date(),
    };

    if (hasLat && hasLon) {
      const clearing = body.latitude === null && body.longitude === null;
      if (clearing) {
        update.latitude = null;
        update.longitude = null;
        update.geoQuartiere = null;
      } else {
        const lat = Number(body.latitude);
        const lon = Number(body.longitude);
        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lon) ||
          lat < -90 ||
          lat > 90 ||
          lon < -180 ||
          lon > 180
        ) {
          res.status(400).json({ message: "Coordinate non valide" });
          return;
        }
        update.latitude = lat.toFixed(7);
        update.longitude = lon.toFixed(7);
        update.geoQuartiere =
          typeof body.geoQuartiere === "string" && body.geoQuartiere.trim()
            ? body.geoQuartiere.trim()
            : nearestQuartiere(lat, lon);
      }
    } else if (typeof body.geoQuartiere === "string") {
      update.geoQuartiere = body.geoQuartiere.trim() || null;
    }

    if ("geoAddress" in body) {
      update.geoAddress =
        typeof body.geoAddress === "string" && body.geoAddress.trim()
          ? body.geoAddress.trim()
          : null;
    }

    if ("geoVerify" in body) {
      update.geoVerify = body.geoVerify === true;
    } else if (hasLat && hasLon && body.latitude !== null) {
      update.geoVerify = false;
    }

    const [row] = await db
      .update(confiscatedAssetsTable)
      .set(update)
      .where(eq(confiscatedAssetsTable.id, id))
      .returning();

    if (!row) {
      res.status(404).json({ message: "Bene non trovato" });
      return;
    }
    res.json(mapAdmin(row));
  },
);

export default router;
