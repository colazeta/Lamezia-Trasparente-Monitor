import { Router, type IRouter } from "express";
import {
  db,
  contractsTable,
  publicationsTable,
  feedStatusTable,
} from "@workspace/db";
import {
  and,
  eq,
  desc,
  gte,
  lte,
  ilike,
  or,
  isNotNull,
  sql,
  type SQL,
} from "drizzle-orm";
import { ANAC_SOURCE, ANAC_LABEL, ANAC_PORTAL_URL } from "../lib/anacContracts";
import { isMacrotemaKey } from "@workspace/db";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";
import { nearestQuartiere } from "../lib/geocode";
import {
  buildStoryline,
  type StorylineEvent,
  type StorylineIndicators,
} from "../lib/contractStoryline";

const router: IRouter = Router();

function mapContract(c: typeof contractsTable.$inferSelect) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    supplier: c.supplier,
    amount: Number(c.amount),
    procedureType: c.procedureType,
    status: c.status,
    awardDate: c.awardDate.toISOString(),
    cig: c.cig,
    cup: c.cup,
    stazioneAppaltante: c.stazioneAppaltante,
    acquisitionTool: c.acquisitionTool,
    withoutTender: c.withoutTender,
    withoutMepa: c.withoutMepa,
    anacUrl: c.anacUrl,
    themeId: c.themeId,
    macrotema: c.macrotema,
    macrotemaManual: c.macrotemaManual,
    latitude: c.latitude !== null ? Number(c.latitude) : null,
    longitude: c.longitude !== null ? Number(c.longitude) : null,
    geoAddress: c.geoAddress,
    geoQuartiere: c.geoQuartiere,
    geoSource: c.geoSource,
    geoManual: c.geoManual,
    geoVerify: c.geoVerify,
  };
}

function buildFilters(query: Record<string, unknown>): SQL[] {
  const conditions: SQL[] = [];

  const search = typeof query.search === "string" ? query.search.trim() : "";
  if (search) {
    const like = `%${search}%`;
    const clause = or(
      ilike(contractsTable.title, like),
      ilike(contractsTable.description, like),
      ilike(contractsTable.supplier, like),
      ilike(contractsTable.cig, like),
    );
    if (clause) conditions.push(clause);
  }

  const supplier =
    typeof query.supplier === "string" ? query.supplier.trim() : "";
  if (supplier) {
    conditions.push(ilike(contractsTable.supplier, `%${supplier}%`));
  }

  const procedureType =
    typeof query.procedureType === "string" ? query.procedureType.trim() : "";
  if (procedureType) {
    conditions.push(eq(contractsTable.procedureType, procedureType));
  }

  const acquisitionTool =
    typeof query.acquisitionTool === "string"
      ? query.acquisitionTool.trim()
      : "";
  if (acquisitionTool) {
    conditions.push(eq(contractsTable.acquisitionTool, acquisitionTool));
  }

  const minAmount = query.minAmount ? Number(query.minAmount) : NaN;
  if (!Number.isNaN(minAmount)) {
    conditions.push(gte(contractsTable.amount, minAmount.toString()));
  }
  const maxAmount = query.maxAmount ? Number(query.maxAmount) : NaN;
  if (!Number.isNaN(maxAmount)) {
    conditions.push(lte(contractsTable.amount, maxAmount.toString()));
  }

  const from = typeof query.from === "string" ? query.from : "";
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) {
      conditions.push(gte(contractsTable.awardDate, d));
    }
  }
  const to = typeof query.to === "string" ? query.to : "";
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      conditions.push(lte(contractsTable.awardDate, d));
    }
  }

  const themeId = query.themeId ? Number(query.themeId) : NaN;
  if (!Number.isNaN(themeId)) {
    conditions.push(eq(contractsTable.themeId, themeId));
  }

  const quartiere =
    typeof query.quartiere === "string" ? query.quartiere.trim() : "";
  if (quartiere) {
    conditions.push(eq(contractsTable.geoQuartiere, quartiere));
  }

  // hasLocation=true → solo contratti già geolocalizzati (con coordinate).
  if (query.hasLocation === "true" || query.hasLocation === true) {
    conditions.push(isNotNull(contractsTable.latitude));
  }

  return conditions;
}

router.get("/contracts", async (req, res) => {
  const conditions = buildFilters(req.query as Record<string, unknown>);
  const rows = await db
    .select()
    .from(contractsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(contractsTable.awardDate));

  res.json(rows.map(mapContract));
});

router.get("/contracts/feed-status", async (_req, res) => {
  const [row] = await db
    .select()
    .from(feedStatusTable)
    .where(eq(feedStatusTable.source, ANAC_SOURCE))
    .limit(1);

  if (!row) {
    res.json({
      source: ANAC_SOURCE,
      label: ANAC_LABEL,
      url: ANAC_PORTAL_URL,
      status: "pending",
      error: null,
      itemsTotal: 0,
      itemsNew: 0,
      lastCheckedAt: null,
      lastUpdatedAt: null,
    });
    return;
  }

  res.json({
    source: row.source,
    label: row.label,
    url: row.url,
    status: row.status,
    error: row.error,
    itemsTotal: row.itemsTotal,
    itemsNew: row.itemsNew,
    lastCheckedAt: row.lastCheckedAt ? row.lastCheckedAt.toISOString() : null,
    lastUpdatedAt: row.lastUpdatedAt ? row.lastUpdatedAt.toISOString() : null,
  });
});

router.get("/contracts/analytics", async (req, res) => {
  const conditions = buildFilters(req.query as Record<string, unknown>);
  const rows = await db
    .select()
    .from(contractsTable)
    .where(conditions.length ? and(...conditions) : undefined);

  const totalCount = rows.length;
  let totalAmount = 0;
  let withoutTenderCount = 0;
  let withoutMepaCount = 0;

  const beneficiaryAmount = new Map<string, number>();
  const beneficiaryCount = new Map<string, number>();
  const procedureCount = new Map<string, number>();
  const toolCount = new Map<string, number>();
  const periodMap = new Map<string, { amount: number; count: number }>();

  for (const c of rows) {
    const amount = Number(c.amount);
    totalAmount += amount;
    if (c.withoutTender) withoutTenderCount += 1;
    if (c.withoutMepa) withoutMepaCount += 1;

    const beneficiary = c.supplier?.trim() ?? "";
    const hasBeneficiary =
      beneficiary.length > 0 &&
      !/^non\s+(specificat|disponibil)/i.test(beneficiary);
    if (hasBeneficiary) {
      beneficiaryAmount.set(
        beneficiary,
        (beneficiaryAmount.get(beneficiary) ?? 0) + amount,
      );
      beneficiaryCount.set(
        beneficiary,
        (beneficiaryCount.get(beneficiary) ?? 0) + 1,
      );
    }

    const procedure = c.procedureType?.trim() || "Non specificata";
    procedureCount.set(procedure, (procedureCount.get(procedure) ?? 0) + 1);

    const tool = c.acquisitionTool?.trim() || "Non specificato";
    toolCount.set(tool, (toolCount.get(tool) ?? 0) + 1);

    const period = `${c.awardDate.getFullYear()}-${String(
      c.awardDate.getMonth() + 1,
    ).padStart(2, "0")}`;
    const prev = periodMap.get(period) ?? { amount: 0, count: 0 };
    periodMap.set(period, {
      amount: prev.amount + amount,
      count: prev.count + 1,
    });
  }

  const topBeneficiaries = Array.from(beneficiaryAmount.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  let mostRecurrentBeneficiary: { name: string; count: number } | null = null;
  for (const [name, count] of beneficiaryCount.entries()) {
    if (!mostRecurrentBeneficiary || count > mostRecurrentBeneficiary.count) {
      mostRecurrentBeneficiary = { name, count };
    }
  }
  if (mostRecurrentBeneficiary && mostRecurrentBeneficiary.count < 2) {
    mostRecurrentBeneficiary = null;
  }

  const byProcedure = Array.from(procedureCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const byAcquisitionTool = Array.from(toolCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const amountOverTime = Array.from(periodMap.entries())
    .map(([period, v]) => ({ period, amount: v.amount, count: v.count }))
    .sort((a, b) => a.period.localeCompare(b.period));

  res.json({
    totalCount,
    totalAmount,
    withoutTenderCount,
    withoutTenderPct: totalCount ? (withoutTenderCount / totalCount) * 100 : 0,
    withoutMepaCount,
    withoutMepaPct: totalCount ? (withoutMepaCount / totalCount) * 100 : 0,
    topBeneficiaries,
    mostRecurrentBeneficiary,
    byProcedure,
    byAcquisitionTool,
    amountOverTime,
  });
});

router.get("/contracts/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ message: "Contratto non trovato" });
    return;
  }
  const [row] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, id))
    .limit(1);

  if (!row) {
    res.status(404).json({ message: "Contratto non trovato" });
    return;
  }

  res.json(mapContract(row));
});

function serializeEvent(e: StorylineEvent) {
  return {
    publicationId: e.publicationId,
    progressivo: e.progressivo,
    phase: e.phase,
    matchedBy: e.matchedBy,
    tipologia: e.tipologia,
    oggetto: e.oggetto,
    date: e.date ? e.date.toISOString() : null,
    estimatedAmount: e.estimatedAmount,
  };
}

function serializeIndicators(i: StorylineIndicators) {
  return {
    evidenceCount: i.evidenceCount,
    phaseCounts: i.phaseCounts,
    firstEvidenceDate: i.firstEvidenceDate
      ? i.firstEvidenceDate.toISOString()
      : null,
    lastEvidenceDate: i.lastEvidenceDate
      ? i.lastEvidenceDate.toISOString()
      : null,
    daysToFirstLiquidazione: i.daysToFirstLiquidazione,
    daysToLastLiquidazione: i.daysToLastLiquidazione,
    awardedAmount: i.awardedAmount,
    extraAmount: i.extraAmount,
    extraAmountIsEstimate: i.extraAmountIsEstimate,
    costOverrunPct: i.costOverrunPct,
    liquidatedAmount: i.liquidatedAmount,
    liquidatedAmountIsEstimate: i.liquidatedAmountIsEstimate,
    status: i.status,
  };
}

// Storyline della spesa pubblica: ciclo di vita di un singolo contratto
// ricostruito collegando le pubblicazioni dell'Albo Pretorio tramite CIG/CUP.
// Restituisce il contratto, la timeline cronologica delle evidenze e gli
// indicatori sintetici (tempi alla liquidazione, scostamenti di costo, stato).
router.get("/contracts/:id/storyline", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ message: "Contratto non trovato" });
    return;
  }
  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, id))
    .limit(1);

  if (!contract) {
    res.status(404).json({ message: "Contratto non trovato" });
    return;
  }

  // Filtro grossolano sulle candidate: oggetto/tipologia che cita il CIG o il
  // CUP, oppure CUP presente tra quelli strutturati. Il match preciso (e la
  // forza del collegamento) è poi rifinito da `matchStrength`.
  const candidateFilters: SQL[] = [];
  if (contract.cig) {
    candidateFilters.push(ilike(publicationsTable.oggetto, `%${contract.cig}%`));
  }
  if (contract.cup) {
    candidateFilters.push(ilike(publicationsTable.oggetto, `%${contract.cup}%`));
    candidateFilters.push(
      sql`${contract.cup} = ANY(${publicationsTable.cups})`,
    );
  }

  let publications: (typeof publicationsTable.$inferSelect)[] = [];
  if (candidateFilters.length > 0) {
    publications = await db
      .select()
      .from(publicationsTable)
      .where(or(...candidateFilters));
  }

  const { timeline, indicators } = buildStoryline(
    {
      cig: contract.cig,
      cup: contract.cup,
      amount: Number(contract.amount),
      awardDate: contract.awardDate,
    },
    publications.map((p) => ({
      id: p.id,
      progressivo: p.progressivo,
      tipologia: p.tipologia,
      oggetto: p.oggetto,
      cups: p.cups,
      dataAtto: p.dataAtto,
      pubStart: p.pubStart,
    })),
  );

  // Allegati e link ufficiali, indicizzati per pubblicazione, per arricchire la
  // timeline lato client senza esporre l'intero record della pubblicazione.
  const pubById = new Map(publications.map((p) => [p.id, p]));

  res.json({
    contract: mapContract(contract),
    timeline: timeline.map((e) => {
      const pub = pubById.get(e.publicationId);
      return {
        ...serializeEvent(e),
        attachments: pub?.attachments ?? [],
      };
    }),
    indicators: serializeIndicators(indicators),
  });
});

// Correzione redazionale del macrotema (ambito di spesa) di un contratto.
// Protetta dal token di ingestione: solo la redazione può ritaggare i
// contratti. Una volta corretto a mano, l'ingestione non sovrascrive più la
// scelta con la classificazione automatica.
router.patch("/contracts/:id", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ message: "Contratto non trovato" });
    return;
  }

  const body = req.body as { macrotema?: unknown };
  if (!("macrotema" in body) || !isMacrotemaKey(body.macrotema)) {
    res.status(400).json({ message: "Ambito di spesa non valido" });
    return;
  }

  const [row] = await db
    .update(contractsTable)
    .set({ macrotema: body.macrotema, macrotemaManual: true })
    .where(eq(contractsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ message: "Contratto non trovato" });
    return;
  }

  res.json(mapContract(row));
});

// Correzione redazionale della posizione geografica di un contratto (Mappa GIS).
// Protetta dal token di ingestione. La redazione può:
//  - impostare/spostare la posizione (latitude+longitude) → geoManual=true,
//    così l'ingestione non la sovrascrive più con il geocoding automatico;
//  - rimuovere la posizione passando latitude/longitude = null;
//  - aggiornare l'etichetta (geoAddress) e segnalare/rimuovere "da verificare".
router.patch("/contracts/:id/location", requireIngestAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ message: "Contratto non trovato" });
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

  const update: Partial<typeof contractsTable.$inferInsert> = {
    geoManual: true,
    geoSource: "manual",
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
    // Una posizione confermata a mano non è più "da verificare".
    update.geoVerify = false;
  }

  const [row] = await db
    .update(contractsTable)
    .set(update)
    .where(eq(contractsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ message: "Contratto non trovato" });
    return;
  }

  res.json(mapContract(row));
});

export default router;
