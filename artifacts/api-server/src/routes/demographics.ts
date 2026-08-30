import { Router, type IRouter } from "express";
import {
  db,
  demographicSeriesTable,
  demographicReleasesTable,
  demographicObservationsTable,
  type DemographicSourceStatus,
} from "@workspace/db";
import { asc, desc, eq } from "drizzle-orm";
import {
  LAMEZIA_ISTAT_CODE,
  POPULATION_SERIES_KEY,
} from "../lib/demographics";

const router: IRouter = Router();

function iso(value: Date | null) {
  return value ? value.toISOString() : null;
}

router.get("/demographics/series", async (_req, res) => {
  const series = await db
    .select()
    .from(demographicSeriesTable)
    .orderBy(asc(demographicSeriesTable.title));

  const out = await Promise.all(
    series.map(async (item) => {
      const [latest] = await db
        .select({
          id: demographicReleasesTable.id,
          acquiredAt: demographicReleasesTable.acquiredAt,
          releaseDate: demographicReleasesTable.releaseDate,
          sourceVersion: demographicReleasesTable.sourceVersion,
        })
        .from(demographicReleasesTable)
        .where(eq(demographicReleasesTable.seriesId, item.id))
        .orderBy(
          desc(demographicReleasesTable.acquiredAt),
          desc(demographicReleasesTable.id),
        )
        .limit(1);

      return {
        id: item.id,
        seriesKey: item.seriesKey,
        title: item.title,
        description: item.description,
        unit: item.unit,
        geographyLevel: item.geographyLevel,
        referenceType: item.referenceType,
        source: item.source,
        sourceDataset: item.sourceDataset,
        sourceUrl: item.sourceUrl,
        latestRelease: latest
          ? {
              id: latest.id,
              acquiredAt: latest.acquiredAt.toISOString(),
              releaseDate: iso(latest.releaseDate),
              sourceVersion: latest.sourceVersion,
            }
          : null,
      };
    }),
  );

  res.json(out);
});

router.get("/demographics/series/:key", async (req, res) => {
  const key = Array.isArray(req.params.key)
    ? (req.params.key[0] ?? "")
    : req.params.key;
  const [series] = await db
    .select()
    .from(demographicSeriesTable)
    .where(eq(demographicSeriesTable.seriesKey, key));

  if (!series) {
    res.status(404).json({ error: "Serie demografica non trovata" });
    return;
  }

  const releases = await db
    .select()
    .from(demographicReleasesTable)
    .where(eq(demographicReleasesTable.seriesId, series.id))
    .orderBy(
      asc(demographicReleasesTable.acquiredAt),
      asc(demographicReleasesTable.id),
    );

  const rows = await db
    .select({
      id: demographicObservationsTable.id,
      referencePeriod: demographicObservationsTable.referencePeriod,
      value: demographicObservationsTable.value,
      unit: demographicObservationsTable.unit,
      dimensions: demographicObservationsTable.dimensions,
      dimensionKey: demographicObservationsTable.dimensionKey,
      sourceStatus: demographicObservationsTable.sourceStatus,
      sourceObservationStatus:
        demographicObservationsTable.sourceObservationStatus,
      qualityFlags: demographicObservationsTable.qualityFlags,
      releaseId: demographicReleasesTable.id,
      acquiredAt: demographicReleasesTable.acquiredAt,
      releaseDate: demographicReleasesTable.releaseDate,
    })
    .from(demographicObservationsTable)
    .innerJoin(
      demographicReleasesTable,
      eq(demographicObservationsTable.releaseId, demographicReleasesTable.id),
    )
    .where(eq(demographicObservationsTable.seriesId, series.id))
    .orderBy(
      asc(demographicReleasesTable.acquiredAt),
      asc(demographicReleasesTable.id),
      asc(demographicObservationsTable.referencePeriod),
    );

  const current = new Map<string, {
    id: number;
    period: string;
    value: number;
    unit: string;
    dimensions: Record<string, string>;
    sourceStatus: DemographicSourceStatus;
    sourceObservationStatus: string | null;
    qualityFlags: string[];
    releaseId: number;
    acquiredAt: string;
    releaseDate: string | null;
  }>();
  const releasesByPoint = new Map<string, Set<number>>();

  for (const row of rows) {
    const identity = `${row.referencePeriod}|${row.dimensionKey}`;
    const set = releasesByPoint.get(identity) ?? new Set<number>();
    set.add(row.releaseId);
    releasesByPoint.set(identity, set);
    current.set(identity, {
      id: row.id,
      period: row.referencePeriod,
      value: Number(row.value),
      unit: row.unit,
      dimensions: row.dimensions as Record<string, string>,
      sourceStatus: row.sourceStatus as DemographicSourceStatus,
      sourceObservationStatus: row.sourceObservationStatus,
      qualityFlags: row.qualityFlags as string[],
      releaseId: row.releaseId,
      acquiredAt: row.acquiredAt.toISOString(),
      releaseDate: iso(row.releaseDate),
    });
  }

  const currentPoints = [...current.entries()]
    .map(([identity, point]) => ({
      ...point,
      revisionCount: Math.max(0, (releasesByPoint.get(identity)?.size ?? 1) - 1),
    }))
    .sort((left, right) => left.period.localeCompare(right.period));

  res.json({
    series: {
      id: series.id,
      seriesKey: series.seriesKey,
      title: series.title,
      description: series.description,
      unit: series.unit,
      geographyLevel: series.geographyLevel,
      referenceType: series.referenceType,
      source: series.source,
      sourceDataset: series.sourceDataset,
      sourceUrl: series.sourceUrl,
    },
    geography: {
      code: LAMEZIA_ISTAT_CODE,
      name: "Lamezia Terme",
      level: series.geographyLevel,
    },
    current: currentPoints,
    releases: [...releases].reverse().map((release) => ({
      id: release.id,
      sourceDataset: release.sourceDataset,
      sourceHash: release.sourceHash,
      sourceVersion: release.sourceVersion,
      releaseDate: iso(release.releaseDate),
      acquiredAt: release.acquiredAt.toISOString(),
      httpEtag: release.httpEtag,
      httpLastModified: release.httpLastModified,
    })),
    methodology: {
      versioning:
        "Le release della fonte sono conservate separatamente: una revisione di uno stesso periodo non sovrascrive il valore acquisito in precedenza.",
      referencePeriod:
        "Il periodo identifica il momento cui il dato si riferisce; acquiredAt identifica quando Lamezia Trasparente ha acquisito quella release.",
      currentSelection:
        "La serie corrente usa, per ciascun periodo e combinazione di dimensioni, l'osservazione della release acquisita più recentemente.",
      breaks:
        series.seriesKey === POPULATION_SERIES_KEY
          ? [{
              period: "2019",
              type: "methodological",
              note: "Dal 2019 il Censimento permanente e la nuova contabilizzazione demografica richiedono cautela nei confronti di lungo periodo; il dato ufficiale resta comunque esposto con la propria provenienza e release.",
            }]
          : [],
    },
  });
});

router.get("/demographics/population", (_req, res) => {
  res.redirect(307, `/api/demographics/series/${POPULATION_SERIES_KEY}`);
});

export default router;
