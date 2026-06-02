import {
  db,
  publicationsTable,
  feedStatusTable,
  runOrganiSedutaSync,
  type InsertPublication,
} from "@workspace/db";
import { sql, inArray } from "drizzle-orm";
import { logger } from "./logger";
import { runAttuazioneIngestion } from "./attuazionePnrr";
import {
  runAnacContractsIngestion,
  runContractsGeocoding,
} from "./anacContracts";
import { reconcileThemeCounters } from "./counters";
import { runOpendataIngestion } from "./opendata";
import { enrichAlboAttachments } from "./alboAttachments";
import { runPerformanceIngestion } from "./performanceIndicators";
import { refreshFundamentalActSuggestions } from "./fundamentalActs";

export const ALBO_SOURCE = "albo-lamezia";
export const ALBO_LABEL = "Albo Pretorio – Amministrazione Trasparente";
export const ALBO_URL =
  "https://albo.tinnvision.cloud/export/xml?wich=&ente=00301390795";

const CUP_RE = /\b([A-Z]\d{2}[A-Z]\d{8,11})\b/g;
const MISSION_RE = /\bM\d\s?C\d(?:\s?I\d(?:\.\d+){0,2})?/i;

function tag(block: string, name: string): string | undefined {
  const m = new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`).exec(block);
  if (!m) return undefined;
  const v = m[1].replace(/\s+/g, " ").trim();
  return v.length ? v : undefined;
}

function parseItDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const PUBLICATION_CATEGORIES = [
  "albo",
  "delibera",
  "convocazione",
  "ordinanza",
] as const;

export type PublicationCategory = (typeof PUBLICATION_CATEGORIES)[number];

function classify(tipologia: string, oggetto: string) {
  const t = tipologia.toUpperCase();
  const o = oggetto.toUpperCase();
  let category: PublicationCategory = "albo";
  let subcategory: string | null = null;

  if (t.includes("DELIBERAZIONE") || t.includes("DELIBERA")) {
    category = "delibera";
    subcategory = t.includes("CONSIGLIO")
      ? "consiglio"
      : t.includes("GIUNTA")
        ? "giunta"
        : "altro";
  } else if (t.includes("CONVOCAZION") || o.includes("CONVOCAZION")) {
    category = "convocazione";
    if (t.includes("COMMISSION") || o.includes("COMMISSION")) {
      subcategory = "commissione";
    } else if (t.includes("CONSIGLIO") || o.includes("CONSIGLIO COMUNALE")) {
      subcategory = "consiglio";
    } else {
      subcategory = "commissione";
    }
  } else if (t.includes("ORDINANZA") || o.startsWith("ORDINANZA")) {
    category = "ordinanza";
    if (t.includes("SINDAC") || o.includes("SINDAC")) {
      subcategory = "sindacale";
    } else if (t.includes("DIRIGENZ") || o.includes("DIRIGENZ")) {
      subcategory = "dirigenziale";
    } else {
      subcategory = null;
    }
  }

  return { category, subcategory };
}

function parseAlboXml(xml: string): InsertPublication[] {
  const blocks = [...xml.matchAll(/<pubblicazione>([\s\S]*?)<\/pubblicazione>/g)];
  const out: InsertPublication[] = [];

  for (const b of blocks) {
    const block = b[1];
    const progressivo = tag(block, "progressivo");
    const oggetto = tag(block, "oggetto");
    if (!progressivo || !oggetto) continue;

    const tipologia = tag(block, "tipologia") ?? "ALTRO";
    const provenienza = tag(block, "provenienza") ?? null;
    const { category, subcategory } = classify(tipologia, oggetto);

    const periodo = tag(block, "periodo-pubblicazione");
    let pubStart: Date | null = null;
    let pubEnd: Date | null = null;
    if (periodo) {
      const parts = periodo.split("-");
      pubStart = parseItDate(parts[0]);
      pubEnd = parseItDate(parts[1]);
    }

    const cups = [...oggetto.matchAll(CUP_RE)].map((m) => m[1]);
    const missionMatch = MISSION_RE.exec(oggetto);
    const pnrrMission = missionMatch
      ? missionMatch[0].replace(/\s+/g, "").toUpperCase()
      : null;
    const isPnrr =
      cups.length > 0 ||
      /PNRR|P\.N\.R\.R|NEXT\s?GENERATION/i.test(oggetto) ||
      pnrrMission !== null;

    out.push({
      progressivo,
      tipologia,
      category,
      subcategory,
      provenienza,
      oggetto,
      dataAtto: parseItDate(tag(block, "data-atto")),
      pubStart,
      pubEnd,
      numRegSet: tag(block, "num-reg-set") ?? null,
      numRegGen: tag(block, "num-reg-gen") ?? null,
      cups,
      pnrrMission,
      isPnrr,
    });
  }

  return out;
}

export async function runIngestion(): Promise<{
  total: number;
  inserted: number;
}> {
  logger.info({ source: ALBO_SOURCE }, "Starting albo ingestion");
  try {
    const res = await fetch(ALBO_URL, {
      headers: { "User-Agent": "rendiamoLameziaTrasparente/1.0" },
    });
    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}`);
    }
    const xml = await res.text();
    const items = parseAlboXml(xml);

    const inserted = await db.transaction(async (tx) => {
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(publicationsTable);
      const firstRun = count === 0;

      const progressivi = items.map((i) => i.progressivo);
      const existing = progressivi.length
        ? await tx
            .select({ progressivo: publicationsTable.progressivo })
            .from(publicationsTable)
            .where(inArray(publicationsTable.progressivo, progressivi))
        : [];
      const existingSet = new Set(existing.map((e) => e.progressivo));

      const fresh = items.filter((i) => !existingSet.has(i.progressivo));
      if (fresh.length) {
        await tx
          .insert(publicationsTable)
          .values(fresh.map((i) => ({ ...i, isNew: !firstRun })))
          .onConflictDoNothing({ target: publicationsTable.progressivo });
      }

      const now = new Date();

      // Aggiorna lastSeenAt per tutti gli atti presenti nel feed corrente, così
      // si possono individuare le pubblicazioni sparite (pattern uniforme a
      // contratti ANAC e progetti PNRR).
      if (progressivi.length) {
        await tx
          .update(publicationsTable)
          .set({ lastSeenAt: now })
          .where(inArray(publicationsTable.progressivo, progressivi));
      }
      await tx
        .insert(feedStatusTable)
        .values({
          source: ALBO_SOURCE,
          label: ALBO_LABEL,
          url: ALBO_URL,
          status: "ok",
          error: null,
          itemsTotal: items.length,
          itemsNew: fresh.length,
          lastCheckedAt: now,
          lastUpdatedAt: now,
        })
        .onConflictDoUpdate({
          target: feedStatusTable.source,
          set: {
            status: "ok",
            error: null,
            itemsTotal: items.length,
            itemsNew: fresh.length,
            lastCheckedAt: now,
            ...(fresh.length || firstRun ? { lastUpdatedAt: now } : {}),
          },
        });

      return fresh.length;
    });

    logger.info(
      { source: ALBO_SOURCE, total: items.length, inserted },
      "Albo ingestion complete",
    );
    return { total: items.length, inserted };
  } catch (err) {
    logger.error({ err, source: ALBO_SOURCE }, "Albo ingestion failed");
    const now = new Date();
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    await db
      .insert(feedStatusTable)
      .values({
        source: ALBO_SOURCE,
        label: ALBO_LABEL,
        url: ALBO_URL,
        status: "error",
        error: message,
        lastCheckedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: { status: "error", error: message, lastCheckedAt: now },
      });
    throw err;
  }
}

const INGESTION_INTERVAL_MS = 3 * 60 * 60 * 1000;

async function runIngestionCycle(): Promise<void> {
  await runIngestion().catch(() => {});
  await enrichAlboAttachments().catch((err) => {
    logger.error({ err }, "Albo attachment enrichment cycle failed");
  });
  await runAttuazioneIngestion().catch(() => {});
  await runAnacContractsIngestion().catch(() => {});
  await runContractsGeocoding().catch((err) => {
    logger.error({ err }, "Contracts geocoding pass failed");
  });
  await runOpendataIngestion().catch(() => {});
  await runPerformanceIngestion().catch((err) => {
    logger.error({ err }, "Performance ingestion cycle failed");
  });
  await runOrganiSedutaSync().catch((err) => {
    logger.error({ err }, "Organi/sedute sync failed");
  });
  await refreshFundamentalActSuggestions().catch((err) => {
    logger.error({ err }, "Fundamental act suggestions refresh failed");
  });
  await reconcileThemeCounters();
}

export function startIngestionScheduler(): void {
  void runIngestionCycle();
  setInterval(() => {
    void runIngestionCycle();
  }, INGESTION_INTERVAL_MS).unref();
}
