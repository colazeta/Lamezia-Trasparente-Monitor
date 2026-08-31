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
import {
  getChangeDrivers,
  summarizeChangeDrivers,
  type BalanceGranularity,
} from "../lib/demographicBalance";
import { getPopulationStructureSnapshot } from "../lib/populationStructure";
import { getPopulationCitizenshipSnapshot } from "../lib/populationCitizenship";

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
              note: "Il tratto 2002–2018 proviene dalla ricostruzione statistica RBD su classificazione territoriale 2019; dal 2019 il Censimento permanente e la nuova contabilità micro-demografica MIDEA/ANVIS definiscono la serie corrente. Le due provenienze restano distinguibili nelle release e nello status dell'osservazione.",
            }]
          : [],
    },
  });
});

router.get("/demographics/structure", async (req, res) => {
  const rawPeriod = Array.isArray(req.query.period)
    ? req.query.period[0]
    : req.query.period;
  const period = typeof rawPeriod === "string" ? rawPeriod : null;
  const snapshot = await getPopulationStructureSnapshot(period);
  if (!snapshot) {
    res.status(404).json({ error: "Struttura demografica non ancora disponibile" });
    return;
  }

  res.json({
    geography: {
      code: LAMEZIA_ISTAT_CODE,
      name: "Lamezia Terme",
      level: "municipality",
    },
    ...snapshot,
    methodology: {
      referencePeriod:
        "La struttura si riferisce alla popolazione residente al 1° gennaio dell'anno selezionato.",
      ageBands:
        "Le quote 0–14, 15–64, 65+ e 80+ sono somme deterministiche delle singole età pubblicate dalla fonte.",
      ageingIndex: "popolazione 65+ / popolazione 0–14 × 100",
      structuralDependency:
        "(popolazione 0–14 + popolazione 65+) / popolazione 15–64 × 100",
      elderlyDependency: "popolazione 65+ / popolazione 15–64 × 100",
      youthDependency: "popolazione 0–14 / popolazione 15–64 × 100",
      pyramid:
        "La piramide aggrega le singole età in classi quinquennali; la classe 100+ resta aperta e non viene trasformata in un'età media convenzionale.",
      temporalBreak:
        "Il tratto 2002–2018 è una ricostruzione statistica su classificazione territoriale 2019 ed è marcato reconstructed. Dal 2019 la struttura proviene dalla popolazione residente del Censimento permanente. La cesura resta esplicita.",
      quality:
        "Il totale pubblicato viene confrontato sia con maschi + femmine sia con la somma delle singole età. Una differenza non nulla resta esposta e non viene corretta artificialmente.",
    },
  });
});

router.get("/demographics/citizenship", async (req, res) => {
  const rawPeriod = Array.isArray(req.query.period)
    ? req.query.period[0]
    : req.query.period;
  const period = typeof rawPeriod === "string" ? rawPeriod : null;
  const snapshot = await getPopulationCitizenshipSnapshot(period);
  if (!snapshot) {
    res.status(404).json({ error: "Dati di cittadinanza non ancora disponibili" });
    return;
  }

  res.json({
    geography: {
      code: LAMEZIA_ISTAT_CODE,
      name: "Lamezia Terme",
      level: "municipality",
    },
    ...snapshot,
    methodology: {
      citizenship:
        "Per popolazione straniera si intendono i residenti con cittadinanza non italiana. Cittadinanza, paese di nascita e provenienza migratoria sono concetti distinti e non vengono usati come sinonimi.",
      referencePeriod:
        "Le consistenze si riferiscono alla popolazione residente al 1° gennaio dell'anno indicato.",
      temporalBreak:
        "Il tratto 2002–2018 della popolazione straniera per età e sesso proviene dalla ricostruzione statistica ISTAT ed è marcato reconstructed; dal 2019 usa il Censimento permanente.",
      countryDetail:
        "Il dettaglio per singola cittadinanza usa il dataflow ISTAT 29_317 dal 2019. La fonte contiene anche aggregazioni geopolitiche: l'elenco dei principali paesi seleziona soltanto codici-paese e non somma le aggregazioni.",
      coverage:
        "La somma dei singoli paesi è confrontata con il totale dei residenti stranieri proveniente dalla serie indipendente per età e sesso. L'eventuale differenza resta visibile e può comprendere apolidi, codici non-paese o altre classificazioni della fonte.",
      birthplace:
        "Il paese di nascita non è inferito dalla cittadinanza. Entrerà come serie autonoma quando il relativo contratto di fonte sarà acquisito e validato; nessun incrocio cittadinanza × paese di nascita viene ricostruito.",
    },
  });
});

router.get("/demographics/change-drivers", async (req, res) => {
  const raw = Array.isArray(req.query.granularity)
    ? req.query.granularity[0]
    : req.query.granularity;
  const granularity: BalanceGranularity = raw === "monthly" ? "monthly" : "annual";
  const points = await getChangeDrivers(granularity);

  res.json({
    geography: {
      code: LAMEZIA_ISTAT_CODE,
      name: "Lamezia Terme",
      level: "municipality",
    },
    granularity,
    source: {
      name: "ISTAT",
      dataset:
        granularity === "annual"
          ? "RBD 2002–2018 + P02 2019+"
          : "D7B",
      url:
        granularity === "annual"
          ? "https://demo.istat.it/app/?i=P02&l=it"
          : "https://demo.istat.it/app/?i=D7B&l=it",
    },
    current: points,
    summaries: {
      last5: summarizeChangeDrivers(points, 5),
      last10: summarizeChangeDrivers(points, 10),
      full: summarizeChangeDrivers(points, points.length),
    },
    methodology: {
      identities: {
        naturalBalance: "nati vivi − morti",
        internalBalance:
          "iscritti da altri comuni − cancellati verso altri comuni",
        foreignBalance: "iscritti dall'estero − cancellati per l'estero",
        otherBalance:
          "iscritti per altri motivi − cancellati per altri motivi",
      },
      annualReconciliation:
        "Per il 2019+ definitivo la variazione è riconciliata come saldo naturale + saldo migratorio interno + saldo migratorio estero + aggiustamento statistico. L'aggiustamento ISTAT incorpora le altre poste anagrafiche e la sovra/sotto-copertura censuaria, quindi non viene sommato due volte il saldo per altri motivi. Nel tratto RBD 2002–2018 sono esposte le poste ricostruite disponibili; se una posta di chiusura non è pubblicata, la quadratura resta dichiarata come parziale anziché essere imputata artificialmente.",
      monthlyReconciliation:
        "Nel bilancio mensile provvisorio la popolazione di fine periodo è costruita sui flussi naturale, migratorio interno e migratorio estero; le altre poste e la copertura censuaria entrano nel successivo consolidamento definitivo.",
      temporalBreak:
        "Il tratto 2002–2018 è la ricostruzione statistica RBD, classificata come reconstructed. Dal 2019 ISTAT usa il Censimento permanente e contabilizza i flussi per data dell'evento nell'ambito della nuova contabilità micro-demografica MIDEA/ANVIS. La cesura resta esplicita e le due provenienze non vengono presentate come metodologicamente identiche.",
      reconciliationStatus:
        "exact indica una quadratura entro ±0,5 persone; mismatch segnala che le poste disponibili non quadrano con la variazione osservata e richiede verifica; partial indica che manca almeno una posta necessaria.",
      narrative:
        "Le frasi descrittive identificano soltanto la componente cumulata di maggiore ampiezza assoluta e non esprimono giudizi, causalità o valutazioni di policy.",
    },
  });
});

router.get("/demographics/population", (_req, res) => {
  res.redirect(307, `/api/demographics/series/${POPULATION_SERIES_KEY}`);
});

export default router;
