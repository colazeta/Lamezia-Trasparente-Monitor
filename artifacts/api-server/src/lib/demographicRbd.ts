import { createHash } from "node:crypto";
import {
  db,
  demographicObservationsTable,
  demographicReleasesTable,
  demographicSeriesTable,
  feedStatusTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { logger } from "./logger";
import {
  canonicalDimensionKey,
  LAMEZIA_ISTAT_CODE,
  parseSdmxCsv,
  POPULATION_SERIES_KEY,
} from "./demographics";
import {
  balanceSeriesKey,
  type BalanceField,
} from "./demographicBalance";

const RBD_DATAFLOW_ID = "164_164_DF_DCIS_RICPOPRES2011_21";
const RBD_DATAFLOW = `IT1,${RBD_DATAFLOW_ID},1.0`;
const RBD_SOURCE_URL = "https://esploradati.istat.it";
const RBD_FEED_SOURCE = "demographics:istat-rbd-2002-2018";
const RBD_FEED_LABEL =
  "ISTAT – Bilancio demografico ricostruito 2002–2018 (Lamezia Terme)";
const USER_AGENT = "rendiamoLameziaTrasparente/1.0";

export type RbdFieldConfig = {
  field: BalanceField;
  dataType: string;
  referenceType: "stock" | "flow";
};

// Il dataflow RBD espone anche ACQCITIZ, ma l'acquisizione di cittadinanza non
// modifica la popolazione totale e non entra nella quadratura demografica.
// Importiamo quindi solo le otto poste necessarie alla storia del bilancio.
export const RBD_FIELDS: RbdFieldConfig[] = [
  { field: "births", dataType: "LBIRTH", referenceType: "flow" },
  { field: "deaths", dataType: "DEATH", referenceType: "flow" },
  { field: "internalIn", dataType: "REGM", referenceType: "flow" },
  { field: "internalOut", dataType: "DEREGM", referenceType: "flow" },
  { field: "foreignIn", dataType: "REGOTHC", referenceType: "flow" },
  { field: "foreignOut", dataType: "DEREGOTHC", referenceType: "flow" },
  { field: "populationStart", dataType: "JAN", referenceType: "stock" },
  { field: "populationEnd", dataType: "DEC", referenceType: "stock" },
];

export function rbdSeriesKey(dataType: string): string {
  // Dimension order: FREQ.REF_AREA.DATA_TYPE.AGE.SEX.CITIZENSHIP.
  // Lamezia is explicitly 079160 in the Calabria RBD codelist; 9/TOTAL select
  // both sexes and all citizenships.
  return `A.${LAMEZIA_ISTAT_CODE}.${dataType}.TOTAL.9.TOTAL`;
}

export function rbdSdmxUrl(config: RbdFieldConfig): string {
  const key = rbdSeriesKey(config.dataType);
  return `${RBD_SOURCE_URL}/SDMXWS/rest/data/${RBD_DATAFLOW}/${key}?startPeriod=2002&endPeriod=2018`;
}

export function normaliseRbdCsv(csv: string) {
  return parseSdmxCsv(csv, "reconstructed")
    .filter((point) => {
      const year = Number(point.period.slice(0, 4));
      return Number.isInteger(year) && year >= 2002 && year <= 2018;
    })
    .map((point) => ({
      ...point,
      sourceStatus: "reconstructed" as const,
      qualityFlags: [
        ...new Set([...point.qualityFlags, "source_reconstructed"]),
      ],
    }));
}

function hashPayload(payload: string) {
  return createHash("sha256").update(payload).digest("hex");
}

async function targetSeries(config: RbdFieldConfig) {
  const key = balanceSeriesKey(config.field, "annual");
  const [series] = await db
    .select()
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, key));
  if (!series) {
    throw new Error(
      `Serie demografica annuale ${key} non inizializzata: eseguire prima il bilancio P02`,
    );
  }
  return series;
}

async function seriesByKey(seriesKey: string) {
  const [series] = await db
    .select()
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, seriesKey));
  if (!series) {
    throw new Error(`Serie demografica ${seriesKey} non inizializzata`);
  }
  return series;
}

async function hasRbdRelease(seriesId: number): Promise<boolean> {
  const [release] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, seriesId),
        eq(demographicReleasesTable.sourceDataset, RBD_DATAFLOW_ID),
      ),
    )
    .limit(1);
  return Boolean(release);
}

async function alreadyBackfilled(config: RbdFieldConfig): Promise<boolean> {
  const series = await targetSeries(config);
  return hasRbdRelease(series.id);
}

async function fetchRbdSeries(config: RbdFieldConfig) {
  const url = rbdSdmxUrl(config);
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/vnd.sdmx.data+csv;version=1.0.0",
    },
  });
  if (!response.ok) {
    throw new Error(
      `ISTAT RBD ${config.dataType} failed with status ${response.status}`,
    );
  }

  const rawPayload = await response.text();
  const observations = normaliseRbdCsv(rawPayload);
  if (observations.length !== 17) {
    throw new Error(
      `ISTAT RBD ${config.dataType}: attese 17 annualità 2002–2018, ricevute ${observations.length}`,
    );
  }
  return { url, response, rawPayload, observations };
}

function releaseMetadata(config: RbdFieldConfig) {
  return {
    dataflow: RBD_DATAFLOW_ID,
    dataType: config.dataType,
    periodStart: 2002,
    periodEnd: 2018,
    sourceStatus: "reconstructed",
    territorialClassification: 2019,
    excludedPartial2001: true,
    methodologyBreakAt: 2019,
  };
}

async function persistRbdField(config: RbdFieldConfig) {
  const series = await targetSeries(config);
  const payload = await fetchRbdSeries(config);
  const hash = hashPayload(payload.rawPayload);
  const [sameRelease] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, series.id),
        eq(demographicReleasesTable.sourceHash, hash),
      ),
    )
    .limit(1);
  if (sameRelease) {
    return { inserted: 0, changed: false };
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: series.id,
        sourceDataset: RBD_DATAFLOW_ID,
        sourceUrl: payload.url,
        sourceHash: hash,
        sourceVersion: payload.response.headers.get("etag"),
        acquiredAt: now,
        httpEtag: payload.response.headers.get("etag"),
        httpLastModified: payload.response.headers.get("last-modified"),
        rawPayload: payload.rawPayload,
        metadata: releaseMetadata(config),
      })
      .returning({ id: demographicReleasesTable.id });

    await tx.insert(demographicObservationsTable).values(
      payload.observations.map((point) => ({
        seriesId: series.id,
        releaseId: release.id,
        geographyCode: LAMEZIA_ISTAT_CODE,
        referencePeriod: point.period,
        referenceType: config.referenceType,
        dimensions: { frequency: "annual", reconstruction: "RBD" },
        dimensionKey: canonicalDimensionKey({
          frequency: "annual",
          reconstruction: "RBD",
        }),
        value: String(point.value),
        unit: "persone",
        sourceStatus: "reconstructed",
        sourceObservationStatus: point.rawStatus,
        qualityFlags: point.qualityFlags,
      })),
    );
  });

  return { inserted: payload.observations.length, changed: true };
}

async function persistPopulationHistoryMirror() {
  const populationSeries = await seriesByKey(POPULATION_SERIES_KEY);
  if (await hasRbdRelease(populationSeries.id)) {
    return { inserted: 0, changed: false };
  }

  const config = RBD_FIELDS.find((item) => item.field === "populationStart");
  if (!config) throw new Error("Configurazione RBD JAN mancante");
  const payload = await fetchRbdSeries(config);
  const hash = hashPayload(payload.rawPayload);
  const now = new Date();

  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: populationSeries.id,
        sourceDataset: RBD_DATAFLOW_ID,
        sourceUrl: payload.url,
        sourceHash: hash,
        sourceVersion: payload.response.headers.get("etag"),
        acquiredAt: now,
        httpEtag: payload.response.headers.get("etag"),
        httpLastModified: payload.response.headers.get("last-modified"),
        rawPayload: payload.rawPayload,
        metadata: {
          ...releaseMetadata(config),
          mirrorRole: "population-resident-jan1-history",
        },
      })
      .returning({ id: demographicReleasesTable.id });

    await tx.insert(demographicObservationsTable).values(
      payload.observations.map((point) => ({
        seriesId: populationSeries.id,
        releaseId: release.id,
        geographyCode: LAMEZIA_ISTAT_CODE,
        referencePeriod: point.period,
        referenceType: "stock",
        dimensions: {},
        dimensionKey: canonicalDimensionKey({}),
        value: String(point.value),
        unit: populationSeries.unit,
        sourceStatus: "reconstructed",
        sourceObservationStatus: point.rawStatus,
        qualityFlags: point.qualityFlags,
      })),
    );
  });

  return { inserted: payload.observations.length, changed: true };
}

async function recordRbdFeedStatus(
  outcome:
    | { status: "ok"; observations: number; releases: number }
    | { status: "error"; error: string },
) {
  const now = new Date();
  const url = `${RBD_SOURCE_URL}/SDMXWS/rest/data/${RBD_DATAFLOW}`;
  if (outcome.status === "ok") {
    await db
      .insert(feedStatusTable)
      .values({
        source: RBD_FEED_SOURCE,
        label: RBD_FEED_LABEL,
        url,
        status: "ok",
        error: null,
        itemsTotal: outcome.observations,
        itemsNew: outcome.releases,
        lastCheckedAt: now,
        lastUpdatedAt: outcome.releases > 0 ? now : undefined,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: {
          label: RBD_FEED_LABEL,
          url,
          status: "ok",
          error: null,
          itemsTotal: outcome.observations,
          itemsNew: outcome.releases,
          lastCheckedAt: now,
          ...(outcome.releases > 0 ? { lastUpdatedAt: now } : {}),
        },
      });
    return;
  }

  await db
    .insert(feedStatusTable)
    .values({
      source: RBD_FEED_SOURCE,
      label: RBD_FEED_LABEL,
      url,
      status: "error",
      error: outcome.error,
      lastCheckedAt: now,
    })
    .onConflictDoUpdate({
      target: feedStatusTable.source,
      set: {
        label: RBD_FEED_LABEL,
        url,
        status: "error",
        error: outcome.error,
        lastCheckedAt: now,
      },
    });
}

export async function runRbdBackfill(): Promise<{
  fields: number;
  releases: number;
  observations: number;
}> {
  let releases = 0;
  let observations = 0;

  try {
    for (const config of RBD_FIELDS) {
      if (await alreadyBackfilled(config)) continue;
      const result = await persistRbdField(config);
      if (result.changed) releases++;
      observations += result.inserted;
    }

    // JAN alimenta anche la serie longitudinale principale usata da "Lamezia
    // nel tempo". È un mirror semantico, non una nuova fonte: la release mantiene
    // il dataflow RBD e lo status reconstructed.
    const mirror = await persistPopulationHistoryMirror();
    if (mirror.changed) releases++;
    observations += mirror.inserted;

    await recordRbdFeedStatus({ status: "ok", observations, releases });
    logger.info(
      { fields: RBD_FIELDS.length, releases, observations },
      "ISTAT RBD demographic backfill complete",
    );
    return { fields: RBD_FIELDS.length, releases, observations };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await recordRbdFeedStatus({ status: "error", error: message }).catch(() => {});
    logger.error({ err }, "ISTAT RBD demographic backfill failed");
    throw err;
  }
}
