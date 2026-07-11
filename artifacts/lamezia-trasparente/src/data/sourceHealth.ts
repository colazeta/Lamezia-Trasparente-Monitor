import { ALBO_OPERATIONAL_STATUS } from "./alboStatus";
import atlanteMetadata from "../../../../data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json";
import airTrafficMetadata from "./generated/lameziaAirTrafficMonthly.metadata.json";
import climateMetadata from "./generated/lameziaClimateDaily.metadata.json";
import demographicTrend from "./generated/lameziaDemographicTrend.json";
import familiesChildren from "./generated/lameziaFamiliesChildren.json";
import foreignResidents from "./generated/lameziaForeignResidentsAgeSex.json";
import { OPEN_DATA_THEME_LIBRARY } from "./opendataThemeCategories";

export type SourceHealthStatus =
  | "ok"
  | "warning"
  | "stale"
  | "error"
  | "missing";
export type SourceHealthType = "acquisition" | "dataset" | "catalogue";
export type SourceHealthPriority = "alta" | "media" | "bassa";

export type SourceHealthHistoryEvent = {
  at: string;
  kind: "check" | "source-update" | "baseline";
  label: string;
};

export type SourceHealthItem = {
  id: string;
  name: string;
  sourceType: SourceHealthType;
  priority: SourceHealthPriority;
  status: SourceHealthStatus;
  statusReason: string;
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
  traceabilityScore: number;
  freshnessScore: number;
  metricLabel: string;
  evidenceLabel: string;
  expectedRefresh: string;
  route: `/${string}`;
  sourceUrl: string;
  cautionNote: string;
  openDataDatasetId?: string;
  history: SourceHealthHistoryEvent[];
};

export type OpenDataHealthCoverage = {
  published: number;
  monitored: number;
  percentage: number;
  missingDatasetIds: string[];
};

export type SourceHealthPayload = {
  generatedAt: string | null;
  traceabilityScore: number;
  freshnessScore: number;
  sources: SourceHealthItem[];
  openDataCoverage: OpenDataHealthCoverage;
  methodologyNote: string;
};

export const SOURCE_STATUS_LABELS: Record<SourceHealthStatus, string> = {
  ok: "Evidenza aggiornata",
  warning: "Verifica consigliata",
  stale: "Evidenza oltre la soglia attesa",
  error: "Controllo tecnico non riuscito",
  missing: "Evidenza non disponibile",
};

export const SOURCE_TYPE_LABELS: Record<SourceHealthType, string> = {
  acquisition: "Acquisizione ufficiale",
  dataset: "Dataset versionato",
  catalogue: "Catalogo documentato",
};

export const SOURCE_PRIORITY_LABELS: Record<SourceHealthPriority, string> = {
  alta: "Alta",
  media: "Media",
  bassa: "Bassa",
};

const MS_PER_DAY = 86_400_000;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function evidenceCompleteness(values: unknown[]) {
  if (values.length === 0) return 0;
  const available = values.filter((value) => {
    if (value === null || value === undefined || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }).length;

  return clampScore((available / values.length) * 100);
}

function freshnessScore(value: string | null, expectedDays: number) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 0;

  const ageDays = Math.max(0, (Date.now() - timestamp) / MS_PER_DAY);
  return clampScore(100 - (ageDays / Math.max(expectedDays * 3, 1)) * 100);
}

export function assessSourceHealth({
  value,
  expectedDays,
  traceability,
  hasWarnings = false,
}: {
  value: string | null;
  expectedDays: number;
  traceability: number;
  hasWarnings?: boolean;
}): { status: SourceHealthStatus; reason: string } {
  if (!value || !Number.isFinite(new Date(value).getTime())) {
    return {
      status: "missing",
      reason:
        "Timestamp del controllo assente o non leggibile nell'evidenza versionata.",
    };
  }

  const freshness = freshnessScore(value, expectedDays);
  if (freshness < 25) {
    return {
      status: "stale",
      reason:
        "L'ultima evidenza disponibile supera la soglia tecnica prevista dalla cadenza dichiarata.",
    };
  }
  if (hasWarnings) {
    return {
      status: "warning",
      reason:
        "Il manifest versionato riporta almeno un avviso che richiede un controllo manuale.",
    };
  }
  if (traceability < 85) {
    return {
      status: "warning",
      reason: `I metadati minimi di tracciabilità risultano presenti al ${traceability}%.`,
    };
  }
  if (freshness < 60) {
    return {
      status: "warning",
      reason:
        "L'evidenza si avvicina alla soglia tecnica prevista dalla cadenza dichiarata.",
    };
  }
  return {
    status: "ok",
    reason:
      "Timestamp leggibile, cadenza tecnica rispettata e tracciabilità minima almeno all'85%.",
  };
}

function evidenceHistory({
  checkedAt,
  updatedAt,
  baselineAt,
}: {
  checkedAt: string | null;
  updatedAt: string | null;
  baselineAt?: string | null;
}): SourceHealthHistoryEvent[] {
  const events: SourceHealthHistoryEvent[] = [];
  if (checkedAt) {
    events.push({
      at: checkedAt,
      kind: "check",
      label: "Evidenza tecnica integrata nel repository",
    });
  }
  if (updatedAt && updatedAt !== checkedAt) {
    events.push({
      at: updatedAt,
      kind: "source-update",
      label: "Aggiornamento dichiarato nei metadati della fonte",
    });
  }
  if (baselineAt && baselineAt !== checkedAt && baselineAt !== updatedAt) {
    events.push({
      at: baselineAt,
      kind: "baseline",
      label: "Baseline pubblica precedente disponibile per il confronto",
    });
  }

  return events.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

function average(
  items: SourceHealthItem[],
  key: "traceabilityScore" | "freshnessScore",
) {
  if (items.length === 0) return 0;
  return clampScore(
    items.reduce((total, item) => total + item[key], 0) / items.length,
  );
}

function latestTimestamp(values: Array<string | null>) {
  const validValues = values
    .filter((value): value is string => Boolean(value))
    .filter((value) => Number.isFinite(new Date(value).getTime()))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return validValues[0] ?? null;
}

const alboLastChecked =
  ALBO_OPERATIONAL_STATUS.last_run_at ?? ALBO_OPERATIONAL_STATUS.last_update;
const alboTraceability = evidenceCompleteness([
  alboLastChecked,
  ALBO_OPERATIONAL_STATUS.source_url,
  ALBO_OPERATIONAL_STATUS.method,
  ALBO_OPERATIONAL_STATUS.counts,
  ALBO_OPERATIONAL_STATUS.schedule,
  ALBO_OPERATIONAL_STATUS.verification_status,
]);
const atlanteTraceability = evidenceCompleteness([
  atlanteMetadata.processingDate,
  atlanteMetadata.sourcePages.variables,
  atlanteMetadata.counts.outputFeatures,
  atlanteMetadata.counts.matchedVariables,
  atlanteMetadata.verificationStatus,
  atlanteMetadata.knownLimits,
]);

function buildOpenDataHealthItem({
  id,
  datasetId,
  name,
  checkedAt,
  updatedAt,
  sourceUrl,
  expectedRefresh,
  expectedDays,
  priority = "media",
  metricLabel,
  cautionNote,
  evidenceValues,
}: {
  id: string;
  datasetId: string;
  name: string;
  checkedAt: string;
  updatedAt: string | null;
  sourceUrl: string;
  expectedRefresh: string;
  expectedDays: number;
  priority?: SourceHealthPriority;
  metricLabel: string;
  cautionNote: string;
  evidenceValues: unknown[];
}): SourceHealthItem {
  const traceability = evidenceCompleteness(evidenceValues);
  const assessment = assessSourceHealth({
    value: checkedAt,
    expectedDays,
    traceability,
  });

  return {
    id,
    openDataDatasetId: datasetId,
    name,
    sourceType: "dataset",
    priority,
    status: assessment.status,
    statusReason: assessment.reason,
    lastCheckedAt: checkedAt,
    lastUpdatedAt: updatedAt,
    traceabilityScore: traceability,
    freshnessScore: freshnessScore(checkedAt, expectedDays),
    metricLabel,
    evidenceLabel:
      "Snapshot JSON generato dalla pipeline locale con metadati di fonte separati e versionati.",
    expectedRefresh,
    route: `/opendata?dataset=${datasetId}`,
    sourceUrl,
    cautionNote,
    history: evidenceHistory({ checkedAt, updatedAt }),
  };
}

const openDataItems: SourceHealthItem[] = [
  buildOpenDataHealthItem({
    id: "opendata-clima-giornaliero",
    datasetId: climateMetadata.dataset_id,
    name: "Open Data — anomalie climatiche giornaliere",
    checkedAt: climateMetadata.generated_at,
    updatedAt: climateMetadata.generated_at,
    sourceUrl: climateMetadata.source_url,
    expectedRefresh: climateMetadata.update_policy,
    expectedDays: 2,
    priority: "alta",
    metricLabel: `${climateMetadata.record_count.toLocaleString("it-IT")} giorni; fino al ${climateMetadata.latest_data_point}`,
    cautionNote: climateMetadata.caveat,
    evidenceValues: [
      climateMetadata.source_url,
      climateMetadata.generated_at,
      climateMetadata.latest_data_point,
      climateMetadata.record_count,
      climateMetadata.update_policy,
      climateMetadata.caveat,
    ],
  }),
  buildOpenDataHealthItem({
    id: "opendata-traffico-aeroportuale",
    datasetId: airTrafficMetadata.dataset_id,
    name: "Open Data — traffico aeroportuale mensile",
    checkedAt: airTrafficMetadata.generated_at,
    updatedAt: airTrafficMetadata.generated_at,
    sourceUrl: airTrafficMetadata.source_url,
    expectedRefresh: airTrafficMetadata.update_policy,
    expectedDays: 45,
    metricLabel: `${airTrafficMetadata.record_count} mensilità; fino a ${airTrafficMetadata.latest_data_point}`,
    cautionNote: airTrafficMetadata.caveat,
    evidenceValues: [
      airTrafficMetadata.source_url,
      airTrafficMetadata.generated_at,
      airTrafficMetadata.latest_data_point,
      airTrafficMetadata.record_count,
      airTrafficMetadata.update_policy,
      airTrafficMetadata.caveat,
    ],
  }),
  buildOpenDataHealthItem({
    id: "opendata-trend-demografico",
    datasetId: "lamezia-demographic-trend",
    name: "Open Data comunale — trend demografico",
    checkedAt: demographicTrend.metadata.generated_at,
    updatedAt: demographicTrend.metadata.resource_last_modified,
    sourceUrl: demographicTrend.metadata.source_url,
    expectedRefresh: demographicTrend.metadata.update_policy,
    expectedDays: 14,
    metricLabel: `${demographicTrend.metadata.rows} annualità, fino al ${demographicTrend.metadata.latest_year}`,
    cautionNote:
      "Serie aggregata del portale comunale: non sostituisce una ricostruzione statistica indipendente o la verifica sulla risorsa CSV originale.",
    evidenceValues: [
      demographicTrend.metadata.source_url,
      demographicTrend.metadata.generated_at,
      demographicTrend.metadata.resource_last_modified,
      demographicTrend.metadata.rows,
      demographicTrend.metadata.update_policy,
      demographicTrend.metadata.caveat,
    ],
  }),
  buildOpenDataHealthItem({
    id: "opendata-famiglie-figli",
    datasetId: "lamezia-families-children",
    name: "Open Data comunale — famiglie per numero di figli",
    checkedAt: familiesChildren.metadata.generated_at,
    updatedAt: familiesChildren.metadata.resource_last_modified,
    sourceUrl: familiesChildren.metadata.source_url,
    expectedRefresh: familiesChildren.metadata.update_policy,
    expectedDays: 14,
    metricLabel: `${familiesChildren.metadata.rows} classi; ${familiesChildren.metadata.total_families_with_children.toLocaleString("it-IT")} famiglie nella risorsa`,
    cautionNote:
      "La risorsa non espone l'anno di riferimento e non include esplicitamente le famiglie senza figli; la scheda rappresenta lo snapshot acquisito.",
    evidenceValues: [
      familiesChildren.metadata.source_url,
      familiesChildren.metadata.generated_at,
      familiesChildren.metadata.resource_last_modified,
      familiesChildren.metadata.rows,
      familiesChildren.metadata.update_policy,
      familiesChildren.metadata.caveat,
    ],
  }),
  buildOpenDataHealthItem({
    id: "opendata-residenti-stranieri",
    datasetId: "lamezia-foreign-residents-age-sex",
    name: "Open Data comunale — residenti stranieri per età e sesso",
    checkedAt: foreignResidents.metadata.generated_at,
    updatedAt: foreignResidents.metadata.resource_last_modified,
    sourceUrl: foreignResidents.metadata.source_url,
    expectedRefresh: foreignResidents.metadata.update_policy,
    expectedDays: 14,
    metricLabel: `${foreignResidents.metadata.rows} classi; anno ${foreignResidents.metadata.latest_year}`,
    cautionNote:
      "Dato aggregato, privo di elenchi nominativi: non sostituisce una validazione statistica indipendente della risorsa comunale.",
    evidenceValues: [
      foreignResidents.metadata.source_url,
      foreignResidents.metadata.generated_at,
      foreignResidents.metadata.resource_last_modified,
      foreignResidents.metadata.rows,
      foreignResidents.metadata.update_policy,
      foreignResidents.metadata.caveat,
    ],
  }),
];

const alboAssessment = assessSourceHealth({
  value: alboLastChecked,
  expectedDays: 1,
  traceability: alboTraceability,
  hasWarnings: ALBO_OPERATIONAL_STATUS.warnings.length > 0,
});
const atlanteAssessment = assessSourceHealth({
  value: atlanteMetadata.processingDate,
  expectedDays: 365,
  traceability: atlanteTraceability,
  hasWarnings: atlanteMetadata.counts.missingVariables > 0,
});

const sources: SourceHealthItem[] = [
  {
    id: "albo-pretorio",
    name: "Albo Pretorio — acquisizione pubblica",
    sourceType: "acquisition",
    priority: "alta",
    status: alboAssessment.status,
    statusReason: alboAssessment.reason,
    lastCheckedAt: alboLastChecked,
    lastUpdatedAt: ALBO_OPERATIONAL_STATUS.last_update,
    traceabilityScore: alboTraceability,
    freshnessScore: freshnessScore(alboLastChecked, 1),
    metricLabel: `${ALBO_OPERATIONAL_STATUS.counts.acquired} acquisiti; ${ALBO_OPERATIONAL_STATUS.counts.publishable} pubblicabili`,
    evidenceLabel:
      "Acquisizione XML dalla fonte ufficiale con conteggi pubblici, baseline diff e classificazione prudenziale.",
    expectedRefresh:
      ALBO_OPERATIONAL_STATUS.schedule?.monitoring_window ??
      "Controllo periodico documentato nel manifest pubblico.",
    route: "/albo/",
    sourceUrl: ALBO_OPERATIONAL_STATUS.source_url,
    cautionNote:
      ALBO_OPERATIONAL_STATUS.warnings[0] ??
      "La disponibilità di allegati e metadati varia per singolo atto; ogni contenuto va verificato sull'Albo ufficiale.",
    history: evidenceHistory({
      checkedAt: alboLastChecked,
      updatedAt: ALBO_OPERATIONAL_STATUS.last_update,
      baselineAt: ALBO_OPERATIONAL_STATUS.diff_baseline?.previous_retrieved_at,
    }),
  },
  {
    id: "atlante-istat-sezioni",
    name: "Atlante territoriale — sezioni censuarie ISTAT",
    sourceType: "dataset",
    priority: "alta",
    status: atlanteAssessment.status,
    statusReason: atlanteAssessment.reason,
    lastCheckedAt: atlanteMetadata.processingDate,
    lastUpdatedAt: atlanteMetadata.processingDate,
    traceabilityScore: atlanteTraceability,
    freshnessScore: freshnessScore(atlanteMetadata.processingDate, 365),
    metricLabel: `${atlanteMetadata.counts.matchedVariables}/${atlanteMetadata.counts.outputFeatures} sezioni con indicatori`,
    evidenceLabel:
      "Geometrie 2021 e variabili censuarie 2023 processate da fonti ufficiali ISTAT con metadati e limiti versionati.",
    expectedRefresh:
      "Aggiornamento quando ISTAT pubblica nuove basi territoriali o variabili censuarie compatibili.",
    route: "/atlante-territoriale",
    sourceUrl: atlanteMetadata.sourcePages.variables,
    cautionNote: atlanteMetadata.knownLimits[1],
    history: evidenceHistory({
      checkedAt: atlanteMetadata.processingDate,
      updatedAt: atlanteMetadata.processingDate,
    }),
  },
  ...openDataItems,
];

const publishedOpenDataDatasetIds = OPEN_DATA_THEME_LIBRARY.filter(
  (theme) => theme.status === "published",
).flatMap((theme) => theme.datasets.map((dataset) => dataset.id));
const monitoredOpenDataDatasetIds = new Set(
  sources
    .map((source) => source.openDataDatasetId)
    .filter((datasetId): datasetId is string => Boolean(datasetId)),
);
const missingOpenDataDatasetIds = publishedOpenDataDatasetIds.filter(
  (datasetId) => !monitoredOpenDataDatasetIds.has(datasetId),
);
const openDataCoverage: OpenDataHealthCoverage = {
  published: publishedOpenDataDatasetIds.length,
  monitored:
    publishedOpenDataDatasetIds.length - missingOpenDataDatasetIds.length,
  percentage:
    publishedOpenDataDatasetIds.length === 0
      ? 100
      : clampScore(
          ((publishedOpenDataDatasetIds.length -
            missingOpenDataDatasetIds.length) /
            publishedOpenDataDatasetIds.length) *
            100,
        ),
  missingDatasetIds: missingOpenDataDatasetIds,
};

export const SOURCE_HEALTH: SourceHealthPayload = {
  generatedAt: latestTimestamp(sources.map((source) => source.lastCheckedAt)),
  traceabilityScore: average(sources, "traceabilityScore"),
  freshnessScore: average(sources, "freshnessScore"),
  sources,
  openDataCoverage,
  methodologyNote:
    "Il registro deriva esclusivamente da manifesti e snapshot versionati nel repository. Tracciabilità e freschezza descrivono l'evidenza tecnica disponibile nella piattaforma; le coperture reali restano espresse nelle metriche proprie di ogni dataset. Nessuno di questi valori certifica la completezza assoluta delle fonti esterne o sostituisce la verifica sui documenti originali.",
};
