import {
  db,
  performanceIndicatorsTable,
  performanceIndicatorValuesTable,
  feedStatusTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

// Prefisso comune delle sorgenti automatiche della sezione performance:
// permette a GET /performance/feed-status di filtrare le righe pertinenti in
// feed_status.
export const PERFORMANCE_FEED_PREFIX = "performance:";

const USER_AGENT = "rendiamoLameziaTrasparente/1.0";

// Codice ISTAT del Comune di Lamezia Terme.
const LAMEZIA_ISTAT_CODE = "079160";

// Descrive una serie ISTAT (SDMX) da associare a un indicatore automatico,
// identificato dal suo `externalKey`. La query SDMX restituisce un CSV con le
// colonne TIME_PERIOD e OBS_VALUE da cui si ricava la serie storica.
type IstatSeriesConfig = {
  // Deve combaciare con performance_indicators.external_key.
  externalKey: string;
  source: string;
  label: string;
  // Dataflow ISTAT (agency,id,version) e chiave delle dimensioni.
  dataflow: string;
  key: string;
  startPeriod: number;
  endPeriod: number;
};

// Catalogo delle serie automatiche ISTAT. Per ora la sola popolazione residente
// totale (verificata come reale per Lamezia Terme); l'array è la sede per
// aggiungerne altre senza toccare la logica di ingestione.
const ISTAT_SERIES: IstatSeriesConfig[] = [
  {
    externalKey: `istat:22_289:A.${LAMEZIA_ISTAT_CODE}.JAN.9.TOTAL.99`,
    source: `${PERFORMANCE_FEED_PREFIX}istat-popolazione`,
    label: "ISTAT – Popolazione residente (Lamezia Terme)",
    dataflow: "IT1,22_289,1.0",
    key: `A.${LAMEZIA_ISTAT_CODE}.JAN.9.TOTAL.99`,
    startPeriod: 2015,
    endPeriod: new Date().getFullYear(),
  },
];

function istatUrl(cfg: IstatSeriesConfig): string {
  return `https://esploradati.istat.it/SDMXWS/rest/data/${cfg.dataflow}/${cfg.key}?startPeriod=${cfg.startPeriod}&endPeriod=${cfg.endPeriod}`;
}

// Estrae le coppie (periodo, valore) dal CSV SDMX. Le intestazioni includono
// TIME_PERIOD e OBS_VALUE; l'ordine delle colonne può variare, quindi le si
// individua per nome.
function parseSdmxCsv(csv: string): { period: string; value: number }[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim());
  const periodIdx = header.indexOf("TIME_PERIOD");
  const valueIdx = header.indexOf("OBS_VALUE");
  if (periodIdx === -1 || valueIdx === -1) return [];

  const out: { period: string; value: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const period = cols[periodIdx]?.trim();
    const rawValue = cols[valueIdx]?.trim();
    if (!period || !rawValue) continue;
    const value = Number(rawValue);
    if (!Number.isFinite(value)) continue;
    out.push({ period, value });
  }
  return out;
}

// Scrive la serie su un indicatore automatico in modo NON distruttivo: i valori
// marcati `manual` (corretti dalla redazione) non vengono mai sovrascritti.
// Ritorna il numero di righe nuove inserite.
async function writeSeries(
  indicatorId: number,
  source: string,
  points: { period: string; value: number }[],
): Promise<number> {
  let inserted = 0;
  await db.transaction(async (tx) => {
    for (const p of points) {
      const [existing] = await tx
        .select({
          id: performanceIndicatorValuesTable.id,
          manual: performanceIndicatorValuesTable.manual,
        })
        .from(performanceIndicatorValuesTable)
        .where(
          and(
            eq(performanceIndicatorValuesTable.indicatorId, indicatorId),
            eq(performanceIndicatorValuesTable.period, p.period),
          ),
        );

      if (existing) {
        // Non sovrascrivere i valori inseriti/corretti a mano.
        if (existing.manual) continue;
        await tx
          .update(performanceIndicatorValuesTable)
          .set({
            value: String(p.value),
            source,
            updatedAt: new Date(),
          })
          .where(eq(performanceIndicatorValuesTable.id, existing.id));
      } else {
        await tx.insert(performanceIndicatorValuesTable).values({
          indicatorId,
          period: p.period,
          value: String(p.value),
          manual: false,
          source,
        });
        inserted++;
      }
    }
  });
  return inserted;
}

async function recordFeedStatus(
  cfg: IstatSeriesConfig,
  outcome:
    | { status: "ok"; total: number; inserted: number }
    | { status: "error"; error: string },
): Promise<void> {
  const now = new Date();
  const url = istatUrl(cfg);
  if (outcome.status === "ok") {
    await db
      .insert(feedStatusTable)
      .values({
        source: cfg.source,
        label: cfg.label,
        url,
        status: "ok",
        error: null,
        itemsTotal: outcome.total,
        itemsNew: outcome.inserted,
        lastCheckedAt: now,
        lastUpdatedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: {
          status: "ok",
          error: null,
          itemsTotal: outcome.total,
          itemsNew: outcome.inserted,
          lastCheckedAt: now,
          ...(outcome.inserted > 0 ? { lastUpdatedAt: now } : {}),
        },
      });
  } else {
    await db
      .insert(feedStatusTable)
      .values({
        source: cfg.source,
        label: cfg.label,
        url,
        status: "error",
        error: outcome.error,
        lastCheckedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: { status: "error", error: outcome.error, lastCheckedAt: now },
      });
  }
}

async function ingestIstatSeries(cfg: IstatSeriesConfig): Promise<void> {
  const [indicator] = await db
    .select({
      id: performanceIndicatorsTable.id,
      updateMode: performanceIndicatorsTable.updateMode,
    })
    .from(performanceIndicatorsTable)
    .where(eq(performanceIndicatorsTable.externalKey, cfg.externalKey));

  // Ingestione solo per indicatori esistenti e configurati come automatici.
  if (!indicator) {
    logger.warn(
      { externalKey: cfg.externalKey },
      "No performance indicator matches ISTAT series, skipping",
    );
    return;
  }
  if (indicator.updateMode !== "automatic") {
    logger.info(
      { externalKey: cfg.externalKey },
      "Indicator not in automatic mode, skipping ISTAT ingestion",
    );
    return;
  }

  try {
    const res = await fetch(istatUrl(cfg), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/vnd.sdmx.data+csv;version=1.0.0",
      },
    });
    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}`);
    }
    const csv = await res.text();
    const points = parseSdmxCsv(csv);
    if (points.length === 0) {
      throw new Error("Nessun dato valido nel CSV SDMX");
    }

    const inserted = await writeSeries(indicator.id, cfg.source, points);
    await recordFeedStatus(cfg, {
      status: "ok",
      total: points.length,
      inserted,
    });
    logger.info(
      { source: cfg.source, total: points.length, inserted },
      "ISTAT performance ingestion complete",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    logger.error(
      { err, source: cfg.source },
      "ISTAT performance ingestion failed",
    );
    await recordFeedStatus(cfg, { status: "error", error: message });
  }
}

// Esegue l'ingestione automatica di tutte le serie ISTAT configurate. Pensata
// per essere richiamata dallo scheduler periodico. Non solleva eccezioni: ogni
// serie registra il proprio esito in feed_status.
export async function runPerformanceIngestion(): Promise<void> {
  for (const cfg of ISTAT_SERIES) {
    await ingestIstatSeries(cfg);
  }
}
