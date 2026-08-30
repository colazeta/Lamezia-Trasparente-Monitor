import { createHash } from "node:crypto";
import {
  db,
  demographicObservationsTable,
  demographicReleasesTable,
  demographicSeriesTable,
  feedStatusTable,
  type DemographicSeries,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { logger } from "./logger";
import {
  canonicalDimensionKey,
  LAMEZIA_ISTAT_CODE,
  mapSdmxStatus,
  parseCsvRow,
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

export type RbdObservation = {
  dataType: string;
  period: string;
  value: number;
  rawStatus: string | null;
  qualityFlags: string[];
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

const RBD_DATA_TYPES = new Set(RBD_FIELDS.map((field) => field.dataType));

export function rbdCombinedSeriesKey(): string {
  // Dimension order: FREQ.REF_AREA.DATA_TYPE.AGE.SEX.CITIZENSHIP.
  // Lamezia è 079160 nella codelist Calabria; 9/TOTAL selezionano entrambi i
  // sessi e tutte le cittadinanze. In SDMX il `+` seleziona più valori della
  // stessa dimensione, quindi tutte le otto poste arrivano con una sola query.
  const dataTypes = RBD_FIELDS.map((field) => field.dataType).join("+");
  return `A.${LAMEZIA_ISTAT_CODE}.${dataTypes}.TOTAL.9.TOTAL`;
}

export function rbdSdmxUrl(): string {
  return `${RBD_SOURCE_URL}/SDMXWS/rest/data/${RBD_DATAFLOW}/${rbdCombinedSeriesKey()}?startPeriod=2002&endPeriod=2018`;
}

export function parseRbdCsv(csv: string): RbdObservation[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvRow(lines[0]).map((value) => value.trim());
  const dataTypeIdx = header.indexOf("DATA_TYPE");
  const periodIdx = header.indexOf("TIME_PERIOD");
  const valueIdx = header.indexOf("OBS_VALUE");
  const statusIdx = header.indexOf("OBS_STATUS");
  if (dataTypeIdx === -1 || periodIdx === -1 || valueIdx === -1) {
    throw new Error(
      "ISTAT RBD CSV privo di DATA_TYPE, TIME_PERIOD o OBS_VALUE",
    );
  }

  const out: RbdObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const dataType = cols[dataTypeIdx]?.trim();
    const period = cols[periodIdx]?.trim();
    const rawValue = cols[valueIdx]?.trim();
    if (!dataType || !RBD_DATA_TYPES.has(dataType) || !period || !rawValue) {
      continue;
    }

    const year = Number(period.slice(0, 4));
    if (!Number.isInteger(year) || year < 2002 || year > 2018) continue;

    const value = Number(rawValue);
    if (!Number.isFinite(value)) continue;

    const rawStatus =
      statusIdx >= 0 && cols[statusIdx]?.trim()
        ? cols[statusIdx].trim()
        : null;
    const mapped = mapSdmxStatus(rawStatus, "reconstructed");
    out.push({
      dataType,
      period,
      value,
      rawStatus,
      qualityFlags: [
        ...new Set(["source_reconstructed", ...mapped.qualityFlags]),
      ],
    });
  }

  return out.sort(
    (left, right) =>
      left.dataType.localeCompare(right.dataType) ||
      left.period.localeCompare(right.period),
  );
}

function observationsForType(
  observations: RbdObservation[],
  dataType: string,
): RbdObservation[] {
  return observations.filter((point) => point.dataType === dataType);
}

function hashObservations(points: RbdObservation[]): string {
  // L'hash è specifico della singola posta, non dell'intero bundle. Se ISTAT
  // rettificasse solo una componente, le altre serie non apparirebbero
  // artificiosamente come revisionate.
  const canonical = points.map((point) => ({
    period: point.period,
    value: point.value,
    rawStatus: point.rawStatus,
  }));
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
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
    acquisitionMode: "single-multiseries-sdmx-query",
  };
}

async function fetchRbdBundle() {
  const url = rbdSdmxUrl();
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/vnd.sdmx.data+csv;version=1.0.0",
    },
  });
  if (!response.ok) {
    throw new Error(`ISTAT RBD bundle failed with status ${response.status}`);
  }

  const rawPayload = await response.text();
  const observations = parseRbdCsv(rawPayload);
  for (const config of RBD_FIELDS) {
    const count = observationsForType(observations, config.dataType).length;
    if (count !== 17) {
      throw new Error(
        `ISTAT RBD ${config.dataType}: attese 17 annualità 2002–2018, ricevute ${count}`,
      );
    }
  }

  return { url, response, rawPayload, observations };
}

type RbdBundle = Awaited<ReturnType<typeof fetchRbdBundle>>;

async function persistRelease(options: {
  series: DemographicSeries;
  config: RbdFieldConfig;
  bundle: RbdBundle;
  dimensions: Record<string, string>;
  unit: string;
}) {
  const points = observationsForType(
    options.bundle.observations,
    options.config.dataType,
  );
  const hash = hashObservations(points);
  const [sameRelease] = await db
    .select({ id: demographicReleasesTable.id })
    .from(demographicReleasesTable)
    .where(
      and(
        eq(demographicReleasesTable.seriesId, options.series.id),
        eq(demographicReleasesTable.sourceHash, hash),
      ),
    )
    .limit(1);
  if (sameRelease) return { inserted: 0, changed: false };

  const now = new Date();
  await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(demographicReleasesTable)
      .values({
        seriesId: options.series.id,
        sourceDataset: RBD_DATAFLOW_ID,
        sourceUrl: options.bundle.url,
        sourceHash: hash,
        sourceVersion: options.bundle.response.headers.get("etag"),
        acquiredAt: now,
        httpEtag: options.bundle.response.headers.get("etag"),
        httpLastModified: options.bundle.response.headers.get("last-modified"),
        rawPayload: options.bundle.rawPayload,
        metadata: releaseMetadata(options.config),
      })
      .returning({ id: demographicReleasesTable.id });

    const dimensionKey = canonicalDimensionKey(options.dimensions);
    await tx.insert(demographicObservationsTable).values(
      points.map((point) => ({
        seriesId: options.series.id,
        releaseId: release.id,
        geographyCode: LAMEZIA_ISTAT_CODE,
        referencePeriod: point.period,
        referenceType: options.config.referenceType,
        dimensions: options.dimensions,
        dimensionKey,
        value: String(point.value),
        unit: options.unit,
        sourceStatus: "reconstructed",
        sourceObservationStatus: point.rawStatus,
        qualityFlags: point.qualityFlags,
      })),
    );
  });

  return { inserted: points.length, changed: true };
}

async function recordRbdFeedStatus(
  outcome:
    | { status: "ok"; observations: number; releases: number; requests: number }
    | { status: "error"; error: string },
) {
  const now = new Date();
  const url = rbdSdmxUrl();
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
  requests: number;
}> {
  let releases = 0;
  let observations = 0;

  try {
    const targets = await Promise.all(
      RBD_FIELDS.map(async (config) => ({
        config,
        series: await targetSeries(config),
      })),
    );
    const populationSeries = await seriesByKey(POPULATION_SERIES_KEY);

    const missingTargets: typeof targets = [];
    for (const target of targets) {
      if (!(await hasRbdRelease(target.series.id))) missingTargets.push(target);
    }
    const populationMirrorMissing = !(await hasRbdRelease(populationSeries.id));

    // Backfill one-shot: dopo l'acquisizione iniziale nessuna chiamata alla fonte
    // storica viene effettuata nei cicli ordinari.
    if (!missingTargets.length && !populationMirrorMissing) {
      await recordRbdFeedStatus({
        status: "ok",
        observations: (RBD_FIELDS.length + 1) * 17,
        releases: 0,
        requests: 0,
      });
      return {
        fields: RBD_FIELDS.length,
        releases: 0,
        observations: 0,
        requests: 0,
      };
    }

    // Una sola query multi-serie evita di avvicinarsi al limite ufficiale ISTAT
    // di 5 richieste/minuto per IP.
    const bundle = await fetchRbdBundle();

    for (const target of missingTargets) {
      const result = await persistRelease({
        series: target.series,
        config: target.config,
        bundle,
        dimensions: { frequency: "annual", reconstruction: "RBD" },
        unit: "persone",
      });
      if (result.changed) releases++;
      observations += result.inserted;
    }

    if (populationMirrorMissing) {
      const jan = RBD_FIELDS.find((item) => item.field === "populationStart");
      if (!jan) throw new Error("Configurazione RBD JAN mancante");
      const mirror = await persistRelease({
        series: populationSeries,
        config: jan,
        bundle,
        dimensions: {},
        unit: populationSeries.unit,
      });
      if (mirror.changed) releases++;
      observations += mirror.inserted;
    }

    await recordRbdFeedStatus({
      status: "ok",
      observations,
      releases,
      requests: 1,
    });
    logger.info(
      { fields: RBD_FIELDS.length, releases, observations, requests: 1 },
      "ISTAT RBD demographic backfill complete",
    );
    return {
      fields: RBD_FIELDS.length,
      releases,
      observations,
      requests: 1,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await recordRbdFeedStatus({ status: "error", error: message }).catch(() => {});
    logger.error({ err }, "ISTAT RBD demographic backfill failed");
    throw err;
  }
}
