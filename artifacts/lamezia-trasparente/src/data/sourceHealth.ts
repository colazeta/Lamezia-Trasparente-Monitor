import { ALBO_OPERATIONAL_STATUS } from "./alboStatus";
import atlanteMetadata from "../../../../data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json";
import demographicTrend from "./generated/lameziaDemographicTrend.json";
import familiesChildren from "./generated/lameziaFamiliesChildren.json";
import foreignResidents from "./generated/lameziaForeignResidentsAgeSex.json";

export type SourceHealthStatus = "ok" | "warning" | "stale" | "error" | "missing";
export type SourceHealthType = "acquisition" | "dataset" | "catalogue";
export type SourceHealthPriority = "alta" | "media" | "bassa";

export type SourceHealthItem = {
  id: string;
  name: string;
  sourceType: SourceHealthType;
  priority: SourceHealthPriority;
  status: SourceHealthStatus;
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
  coverageScore: number;
  freshnessScore: number;
  metricLabel: string;
  evidenceLabel: string;
  expectedRefresh: string;
  route: `/${string}`;
  sourceUrl: string;
  cautionNote: string;
};

export type SourceHealthPayload = {
  generatedAt: string | null;
  coverageScore: number;
  freshnessScore: number;
  sources: SourceHealthItem[];
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

function freshnessScore(value: string | null, expectedDays: number) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 0;

  const ageDays = Math.max(0, (Date.now() - timestamp) / MS_PER_DAY);
  return clampScore(100 - (ageDays / Math.max(expectedDays * 3, 1)) * 100);
}

function deriveStatus({
  value,
  expectedDays,
  coverage,
  hasWarnings = false,
}: {
  value: string | null;
  expectedDays: number;
  coverage: number;
  hasWarnings?: boolean;
}): SourceHealthStatus {
  if (!value || !Number.isFinite(new Date(value).getTime())) return "missing";

  const freshness = freshnessScore(value, expectedDays);
  if (freshness < 25) return "stale";
  if (freshness < 60 || coverage < 85 || hasWarnings) return "warning";
  return "ok";
}

function average(items: SourceHealthItem[], key: "coverageScore" | "freshnessScore") {
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
const alboCoverage = ALBO_OPERATIONAL_STATUS.counts.acquired > 0 ? 100 : 0;
const atlanteCoverage =
  atlanteMetadata.counts.outputFeatures > 0
    ? clampScore(
        (atlanteMetadata.counts.matchedVariables /
          atlanteMetadata.counts.outputFeatures) *
          100,
      )
    : 0;

const openDataItems = [
  {
    id: "opendata-trend-demografico",
    name: "Open Data comunale — trend demografico",
    metadata: demographicTrend.metadata,
    metricLabel: `${demographicTrend.metadata.rows} annualità, fino al ${demographicTrend.metadata.latest_year}`,
    cautionNote:
      "Serie aggregata del portale comunale: non sostituisce una ricostruzione statistica indipendente o la verifica sulla risorsa CSV originale.",
  },
  {
    id: "opendata-famiglie-figli",
    name: "Open Data comunale — famiglie per numero di figli",
    metadata: familiesChildren.metadata,
    metricLabel: `${familiesChildren.metadata.rows} classi; ${familiesChildren.metadata.total_families_with_children.toLocaleString("it-IT")} famiglie nella risorsa`,
    cautionNote:
      "La risorsa non espone l'anno di riferimento e non include esplicitamente le famiglie senza figli; la scheda rappresenta lo snapshot acquisito.",
  },
  {
    id: "opendata-residenti-stranieri",
    name: "Open Data comunale — residenti stranieri per età e sesso",
    metadata: foreignResidents.metadata,
    metricLabel: `${foreignResidents.metadata.rows} classi; anno ${foreignResidents.metadata.latest_year}`,
    cautionNote:
      "Dato aggregato, privo di elenchi nominativi: non sostituisce una validazione statistica indipendente della risorsa comunale.",
  },
].map<SourceHealthItem>(({ id, name, metadata, metricLabel, cautionNote }) => {
  const coverage = metadata.rows > 0 ? 100 : 0;
  const checkedAt = metadata.generated_at;
  const expectedDays = 14;

  return {
    id,
    name,
    sourceType: "dataset",
    priority: "media",
    status: deriveStatus({
      value: checkedAt,
      expectedDays,
      coverage,
    }),
    lastCheckedAt: checkedAt,
    lastUpdatedAt: metadata.resource_last_modified,
    coverageScore: coverage,
    freshnessScore: freshnessScore(checkedAt, expectedDays),
    metricLabel,
    evidenceLabel: "Snapshot JSON generato dalla pipeline locale e collegato alla risorsa Open Data comunale.",
    expectedRefresh: metadata.update_policy,
    route: "/opendata",
    sourceUrl: metadata.source_url,
    cautionNote,
  };
});

const sources: SourceHealthItem[] = [
  {
    id: "albo-pretorio",
    name: "Albo Pretorio — acquisizione pubblica",
    sourceType: "acquisition",
    priority: "alta",
    status: deriveStatus({
      value: alboLastChecked,
      expectedDays: 1,
      coverage: alboCoverage,
      hasWarnings: ALBO_OPERATIONAL_STATUS.warnings.length > 0,
    }),
    lastCheckedAt: alboLastChecked,
    lastUpdatedAt: ALBO_OPERATIONAL_STATUS.last_update,
    coverageScore: alboCoverage,
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
  },
  {
    id: "atlante-istat-sezioni",
    name: "Atlante territoriale — sezioni censuarie ISTAT",
    sourceType: "dataset",
    priority: "alta",
    status: deriveStatus({
      value: atlanteMetadata.processingDate,
      expectedDays: 365,
      coverage: atlanteCoverage,
    }),
    lastCheckedAt: atlanteMetadata.processingDate,
    lastUpdatedAt: atlanteMetadata.processingDate,
    coverageScore: atlanteCoverage,
    freshnessScore: freshnessScore(atlanteMetadata.processingDate, 365),
    metricLabel: `${atlanteMetadata.counts.matchedVariables}/${atlanteMetadata.counts.outputFeatures} sezioni con indicatori`,
    evidenceLabel:
      "Geometrie 2021 e variabili censuarie 2023 processate da fonti ufficiali ISTAT con metadati e limiti versionati.",
    expectedRefresh:
      "Aggiornamento quando ISTAT pubblica nuove basi territoriali o variabili censuarie compatibili.",
    route: "/atlante-territoriale",
    sourceUrl: atlanteMetadata.sourcePages.variables,
    cautionNote: atlanteMetadata.knownLimits[1],
  },
  ...openDataItems,
];

export const SOURCE_HEALTH: SourceHealthPayload = {
  generatedAt: latestTimestamp(sources.map((source) => source.lastCheckedAt)),
  coverageScore: average(sources, "coverageScore"),
  freshnessScore: average(sources, "freshnessScore"),
  sources,
  methodologyNote:
    "Il registro deriva esclusivamente da manifesti e snapshot versionati nel repository. Copertura e freschezza descrivono l'evidenza tecnica disponibile nella piattaforma: non certificano la completezza assoluta delle fonti esterne e non sostituiscono la verifica sui documenti originali.",
};
