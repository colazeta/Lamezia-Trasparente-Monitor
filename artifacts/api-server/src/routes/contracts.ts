import { Router, type IRouter } from "express";
import { db, contractsTable, feedStatusTable } from "@workspace/db";
import { and, eq, desc, gte, lte, ilike, or, type SQL } from "drizzle-orm";
import { ANAC_SOURCE, ANAC_LABEL, ANAC_PORTAL_URL } from "../lib/anacContracts";
import { isMacrotemaKey } from "@workspace/db";
import { requireIngestAuth } from "../middlewares/requireIngestAuth";

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

export default router;
