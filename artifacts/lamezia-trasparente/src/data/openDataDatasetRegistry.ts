import {
  LAMEZIA_OPEN_DATA_SERIES_BY_ID,
  type LameziaOpenDataSeriesStatusItem,
} from "@/data/lameziaOpenDataSeriesStatus";

export type OpenDataThemeStatus = "published" | "ready";
export type OpenDataDatasetFormat = "JSON" | "CSV" | "API";
export type OpenDataDatasetLayer = "canonical";

export type OpenDataDetailKind =
  | "air-traffic-monthly"
  | "climate-daily"
  | "demographic-trend"
  | "families-children"
  | "household-composition-2023"
  | "foreign-residents-age-sex";

export interface OpenDataThemeDataset {
  id: string;
  label: string;
  statusLabel: string;
  dataType: string;
  description: string;
  updateCadence: string;
  sourceLabel: string;
  detailKind?: OpenDataDetailKind;
  themeId: string;
  subtheme: string;
  familyId: string;
  familyLabel: string;
  sourceId: string;
  formats: readonly OpenDataDatasetFormat[];
  geographicCoverage: string;
  temporalCoverage: {
    from: string | null;
    to: string | null;
    label: string;
  } | null;
  licence: string | null;
  layer: OpenDataDatasetLayer;
}

export interface OpenDataThemeCategory {
  id: string;
  label: string;
  shortLabel: string;
  status: OpenDataThemeStatus;
  statusLabel: string;
  description: string;
  civicQuestion: string;
  datasets: OpenDataThemeDataset[];
  dataTypes: string[];
  civicUses: string[];
}

export interface OpenDataSourceDefinition {
  id: string;
  label: string;
}

interface OpenDataThemeDefinition
  extends Omit<OpenDataThemeCategory, "datasets"> {}

export const DEFAULT_OPEN_DATA_THEME_ID = "climate-territory";

export const OPEN_DATA_SOURCE_REGISTRY = [
  { id: "open-meteo", label: "Open-Meteo" },
  { id: "assaeroporti", label: "Assaeroporti" },
  { id: "istat", label: "ISTAT" },
  { id: "comune-opendata", label: "Comune di Lamezia Terme · Open Data" },
] as const satisfies readonly OpenDataSourceDefinition[];

export const OPEN_DATA_DATASET_REGISTRY = [
  {
    id: "lamezia-climate-daily",
    label: "Anomalie climatiche · Lamezia Terme",
    statusLabel: "Disponibile",
    dataType: "Serie temporale giornaliera",
    description:
      "Temperatura media giornaliera rispetto alla normale 1991-2020, con serie JSON statica e ultimo giorno completo disponibile.",
    updateCadence:
      "Aggiornamento giornaliero pianificato al mattino quando la fonte espone il giorno precedente completo.",
    sourceLabel: "Open-Meteo Historical Weather API",
    detailKind: "climate-daily",
    themeId: "climate-territory",
    subtheme: "Clima",
    familyId: "climate-observations",
    familyLabel: "Osservazioni climatiche",
    sourceId: "open-meteo",
    formats: ["JSON"],
    geographicCoverage: "Lamezia Terme",
    temporalCoverage: {
      from: "1991-01-01",
      to: null,
      label: "1991–oggi",
    },
    licence: null,
    layer: "canonical",
  },
  {
    id: "lamezia-air-traffic-monthly",
    label: "Traffico aeroportuale mensile - Lamezia Terme",
    statusLabel: "Disponibile",
    dataType: "Serie temporale mensile",
    description:
      "Passeggeri, movimenti e cargo dello scalo SUF, estratti dai file mensili Assaeroporti e pubblicati come JSON statico.",
    updateCadence:
      "Aggiornamento mensile quando Assaeroporti pubblica il nuovo file Excel di traffico aeroportuale.",
    sourceLabel: "Assaeroporti - Dati di traffico aeroportuale",
    detailKind: "air-traffic-monthly",
    themeId: "mobility-connections",
    subtheme: "Trasporto aereo",
    familyId: "air-traffic",
    familyLabel: "Traffico aeroportuale",
    sourceId: "assaeroporti",
    formats: ["JSON"],
    geographicCoverage: "Aeroporto di Lamezia Terme (SUF)",
    temporalCoverage: null,
    licence: null,
    layer: "canonical",
  },
  {
    id: "lamezia-demographic-trend",
    label: "Osservatorio demografico - Lamezia Terme",
    statusLabel: "Disponibile",
    dataType: "Serie annuali versionate e bilancio demografico",
    description:
      "Archivio canonico della popolazione residente e delle componenti del bilancio demografico di Lamezia Terme, con release ISTAT conservate, revisioni visibili e ricostruzione storica 2002-2018 semanticamente distinta dal 2019+.",
    updateCadence:
      "Aggiornamento automatico sulle fonti ISTAT; le release storiche vengono conservate invece di essere sovrascritte.",
    sourceLabel: "ISTAT - archivio demografico versionato",
    detailKind: "demographic-trend",
    themeId: "population-society",
    subtheme: "Popolazione residente",
    familyId: "resident-population",
    familyLabel: "Popolazione residente",
    sourceId: "istat",
    formats: ["JSON", "API"],
    geographicCoverage: "Comune di Lamezia Terme",
    temporalCoverage: {
      from: "2002",
      to: null,
      label: "2002–oggi",
    },
    licence: null,
    layer: "canonical",
  },
  {
    id: "lamezia-household-composition-2023",
    label: "Famiglie per numero di componenti 2023 - Lamezia Terme",
    statusLabel: "Disponibile",
    dataType: "Benchmark strutturale censuario 2023",
    description:
      "Benchmark strutturale delle famiglie anagrafiche per 1, 2, 3, 4, 5 e 6 o più componenti, aggregato dalle sezioni ISTAT 2023 e pubblicato come JSON statico con quadratura esatta sul totale comunale.",
    updateCadence:
      "Rigenerazione verificata quando ISTAT pubblica una nuova edizione compatibile dei dati per sezione di censimento.",
    sourceLabel: "ISTAT - Censimento permanente 2023",
    detailKind: "household-composition-2023",
    themeId: "population-society",
    subtheme: "Famiglie",
    familyId: "households",
    familyLabel: "Famiglie e composizione",
    sourceId: "istat",
    formats: ["JSON"],
    geographicCoverage: "Comune di Lamezia Terme",
    temporalCoverage: {
      from: "2023",
      to: "2023",
      label: "2023",
    },
    licence: null,
    layer: "canonical",
  },
  {
    id: "lamezia-foreign-residents-age-sex",
    label: "Stranieri per sesso ed eta - Lamezia Terme",
    statusLabel: "Disponibile",
    dataType: "Distribuzione per classi d'eta",
    description:
      "Residenti stranieri 2025 per sesso e classi d'eta, acquisiti dal CSV del Portale OpenData del Comune e pubblicati come JSON statico.",
    updateCadence:
      "Aggiornamento settimanale quando il portale OpenData comunale modifica la risorsa CSV.",
    sourceLabel: "Comune di Lamezia Terme - Portale OpenData",
    detailKind: "foreign-residents-age-sex",
    themeId: "population-society",
    subtheme: "Cittadinanza e struttura demografica",
    familyId: "foreign-residents",
    familyLabel: "Residenti stranieri",
    sourceId: "comune-opendata",
    formats: ["JSON"],
    geographicCoverage: "Comune di Lamezia Terme",
    temporalCoverage: {
      from: "2025",
      to: "2025",
      label: "2025",
    },
    licence: null,
    layer: "canonical",
  },
  {
    id: "lamezia-families-children",
    label: "Famiglie per numero di figli - Lamezia Terme",
    statusLabel: "Disponibile",
    dataType: "Approfondimento comunale per numero di figli",
    description:
      "Distribuzione interna alla risorsa comunale per numero di figli, pubblicata come JSON statico e letta accanto al benchmark strutturale ISTAT 2023 senza calcolare confronti diretti tra perimetri diversi.",
    updateCadence:
      "Aggiornamento settimanale quando il portale OpenData comunale modifica la risorsa CSV.",
    sourceLabel: "Comune di Lamezia Terme - Portale OpenData",
    detailKind: "families-children",
    themeId: "population-society",
    subtheme: "Famiglie",
    familyId: "households",
    familyLabel: "Famiglie e composizione",
    sourceId: "comune-opendata",
    formats: ["JSON"],
    geographicCoverage: "Comune di Lamezia Terme",
    temporalCoverage: null,
    licence: null,
    layer: "canonical",
  },
] as const satisfies readonly OpenDataThemeDataset[];

const OPEN_DATA_THEME_DEFINITIONS = [
  {
    id: "climate-territory",
    label: "Clima e territorio",
    shortLabel: "Clima",
    status: "published",
    statusLabel: "Dataset pubblicato",
    description:
      "Serie ambientali e territoriali utili a leggere tendenze locali, limiti del dato e aggiornamenti documentati.",
    civicQuestion:
      "Come cambiano nel tempo le condizioni climatiche e territoriali osservabili con dati aperti riusabili?",
    dataTypes: [
      "serie temporali giornaliere",
      "indicatori civici",
      "dataset territoriali",
    ],
    civicUses: [
      "lettura di tendenze locali",
      "confronto tra anni",
      "supporto a note civiche e richieste di accesso",
    ],
  },
  {
    id: "mobility-connections",
    label: "Mobilita e collegamenti",
    shortLabel: "Mobilita",
    status: "published",
    statusLabel: "Dataset pubblicato",
    description:
      "Serie su accessibilita, infrastrutture e collegamenti che incidono sulla vita quotidiana e sull'economia locale.",
    civicQuestion:
      "Come cambiano nel tempo i flussi di mobilita che collegano Lamezia Terme al resto del territorio?",
    dataTypes: [
      "serie temporali mensili",
      "indicatori di mobilita",
      "dataset infrastrutturali",
    ],
    civicUses: [
      "lettura dei flussi dello scalo aeroportuale",
      "confronto tra anni e stagioni",
      "supporto a note civiche su collegamenti e accessibilita",
    ],
  },
  {
    id: "population-society",
    label: "Popolazione e societa",
    shortLabel: "Popolazione",
    status: "published",
    statusLabel: "Dataset pubblicato",
    description:
      "Serie demografiche comunali aggregate per leggere popolazione, famiglie e struttura sociale senza esporre elenchi individuali.",
    civicQuestion:
      "Come leggere popolazione, famiglie e struttura sociale attraverso dataset comunali aggregati?",
    dataTypes: [
      "serie temporali annuali",
      "distribuzioni per eta e sesso",
      "distribuzioni familiari aggregate",
      "indicatori demografici",
      "dataset comunali aggregati",
    ],
    civicUses: [
      "lettura delle tendenze demografiche",
      "confronto con servizi e quartieri",
      "supporto a note civiche su popolazione e bisogni locali",
    ],
  },
  {
    id: "contracts-spending",
    label: "Contratti e spesa pubblica",
    shortLabel: "Contratti",
    status: "ready",
    statusLabel: "Categoria pronta",
    description:
      "Dataset su affidamenti, spesa, CIG, CUP e collegamenti alle fonti ufficiali quando disponibili.",
    civicQuestion:
      "Quali risorse pubbliche vengono impegnate, con quali atti e con quale tracciabilita delle fonti?",
    dataTypes: ["registri tabellari", "indicatori aggregati", "timeline"],
    civicUses: [
      "monitoraggio di affidamenti e importi",
      "confronto tra procedure",
      "preparazione di dossier civici",
    ],
  },
  {
    id: "administration-acts",
    label: "Amministrazione e atti",
    shortLabel: "Atti",
    status: "ready",
    statusLabel: "Categoria pronta",
    description:
      "Dati su atti, organi, sedute e documenti pubblici, con metadati per provenienza e aggiornamento.",
    civicQuestion:
      "Quali decisioni sono documentate e come si collegano a temi, organi e fonti ufficiali?",
    dataTypes: ["registri tabellari", "cronologie", "metadati documentali"],
    civicUses: [
      "ricostruzione di decisioni pubbliche",
      "verifica di completezza documentale",
      "orientamento alla consultazione degli atti",
    ],
  },
  {
    id: "assets-confiscated-property",
    label: "Patrimonio e beni confiscati",
    shortLabel: "Patrimonio",
    status: "ready",
    statusLabel: "Categoria pronta",
    description:
      "Dataset su beni, patrimonio pubblico e riuso sociale, da leggere insieme ai limiti delle fonti disponibili.",
    civicQuestion:
      "Quali beni pubblici o confiscati sono descritti, localizzati o riutilizzabili secondo fonti documentate?",
    dataTypes: ["dataset tabellari", "layer territoriali", "schede fonte"],
    civicUses: [
      "mappatura civica",
      "monitoraggio del riuso",
      "segnalazione di lacune informative",
    ],
  },
  {
    id: "participation-access",
    label: "Partecipazione e accesso civico",
    shortLabel: "Accesso",
    status: "ready",
    statusLabel: "Categoria pronta",
    description:
      "Dati e modelli per domande civiche, richieste FOIA, percorsi di partecipazione e riuso del catalogo.",
    civicQuestion:
      "Quali dati aiutano cittadini, redazioni civiche e associazioni a chiedere, verificare e riusare informazioni pubbliche?",
    dataTypes: ["indicatori civici", "template", "cataloghi di fonti"],
    civicUses: [
      "preparazione di richieste mirate",
      "alfabetizzazione al dato pubblico",
      "riuso in iniziative civiche",
    ],
  },
] as const satisfies readonly OpenDataThemeDefinition[];

export const OPEN_DATA_THEME_LIBRARY: OpenDataThemeCategory[] =
  OPEN_DATA_THEME_DEFINITIONS.map((theme) => ({
    ...theme,
    dataTypes: [...theme.dataTypes],
    civicUses: [...theme.civicUses],
    datasets: OPEN_DATA_DATASET_REGISTRY.filter(
      (dataset) => dataset.themeId === theme.id,
    ).map((dataset) => ({ ...dataset, formats: [...dataset.formats] })),
  }));

export const OPEN_DATA_THEME_LIBRARY_SUMMARY = {
  total: OPEN_DATA_THEME_LIBRARY.length,
  published: OPEN_DATA_THEME_LIBRARY.filter(
    (theme) => theme.status === "published",
  ).length,
  ready: OPEN_DATA_THEME_LIBRARY.filter((theme) => theme.status === "ready")
    .length,
};

const COMPLETENESS_FIELDS = [
  "themeId",
  "subtheme",
  "familyId",
  "familyLabel",
  "sourceId",
  "formats",
  "geographicCoverage",
  "temporalCoverage",
  "licence",
] as const;

export interface OpenDataCatalogDistributionItem {
  id: string;
  label: string;
  count: number;
}

export interface OpenDataCatalogStatistics {
  totalDatasets: number;
  totalFamilies: number;
  publishedThemes: number;
  totalSources: number;
  totalFormats: number;
  automatedDatasets: number;
  documentedStatusDatasets: number;
  recentWindowDays: number;
  recentlyUpdated: Array<{
    id: string;
    label: string;
    updatedAt: string;
  }>;
  metadataCompletenessPct: number;
  missingMetadataFields: number;
  temporalCoverage: {
    from: string | null;
    to: string | null;
    label: string;
  };
  byTheme: OpenDataCatalogDistributionItem[];
  bySource: OpenDataCatalogDistributionItem[];
  byFormat: OpenDataCatalogDistributionItem[];
}

export function buildOpenDataCatalogStatistics(
  referenceDate = new Date(),
  recentWindowDays = 14,
): OpenDataCatalogStatistics {
  const datasets = [...OPEN_DATA_DATASET_REGISTRY];
  const families = new Set(datasets.map((dataset) => dataset.familyId));
  const sourceIds = new Set(datasets.map((dataset) => dataset.sourceId));
  const formats = new Set(datasets.flatMap((dataset) => dataset.formats));
  const publishedThemeIds = new Set(datasets.map((dataset) => dataset.themeId));
  const operationalStatus = datasets
    .map((dataset) => LAMEZIA_OPEN_DATA_SERIES_BY_ID.get(dataset.id))
    .filter(isDefined);

  const recentThreshold =
    referenceDate.getTime() - recentWindowDays * 24 * 60 * 60 * 1000;
  const recentlyUpdated = operationalStatus
    .flatMap((status) => {
      const updatedAt = status.materialised_at ?? status.source_modified_at;
      if (!updatedAt) return [];
      const timestamp = new Date(updatedAt).getTime();
      if (!Number.isFinite(timestamp) || timestamp < recentThreshold) return [];
      return [{ id: status.id, label: status.label, updatedAt }];
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const completeness = getMetadataCompleteness(datasets);
  const temporalCoverage = getTemporalCoverage(datasets, operationalStatus);

  return {
    totalDatasets: datasets.length,
    totalFamilies: families.size,
    publishedThemes: publishedThemeIds.size,
    totalSources: sourceIds.size,
    totalFormats: formats.size,
    automatedDatasets: operationalStatus.filter(
      (status) => status.automation_status === "active",
    ).length,
    documentedStatusDatasets: operationalStatus.length,
    recentWindowDays,
    recentlyUpdated,
    metadataCompletenessPct: completeness.percentage,
    missingMetadataFields: completeness.missing,
    temporalCoverage,
    byTheme: OPEN_DATA_THEME_LIBRARY.filter((theme) => theme.datasets.length > 0)
      .map((theme) => ({
        id: theme.id,
        label: theme.shortLabel,
        count: theme.datasets.length,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    bySource: OPEN_DATA_SOURCE_REGISTRY.filter((source) =>
      sourceIds.has(source.id),
    )
      .map((source) => ({
        id: source.id,
        label: source.label,
        count: datasets.filter((dataset) => dataset.sourceId === source.id).length,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    byFormat: Array.from(formats)
      .map((format) => ({
        id: format.toLowerCase(),
        label: format,
        count: datasets.filter((dataset) => dataset.formats.includes(format))
          .length,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  };
}

function getMetadataCompleteness(
  datasets: readonly OpenDataThemeDataset[],
): { percentage: number; missing: number } {
  const checks = datasets.flatMap((dataset) =>
    COMPLETENESS_FIELDS.map((field) => hasMetadataValue(dataset[field])),
  );
  const complete = checks.filter(Boolean).length;
  const missing = checks.length - complete;
  return {
    percentage:
      checks.length === 0 ? 100 : Math.round((complete / checks.length) * 100),
    missing,
  };
}

function hasMetadataValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    const temporal = value as OpenDataThemeDataset["temporalCoverage"];
    return Boolean(temporal?.label && (temporal.from || temporal.to));
  }
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

function getTemporalCoverage(
  datasets: readonly OpenDataThemeDataset[],
  statuses: readonly LameziaOpenDataSeriesStatusItem[],
) {
  const starts = datasets
    .map((dataset) => extractYear(dataset.temporalCoverage?.from ?? null))
    .filter(isDefined);
  const statusById = new Map(statuses.map((status) => [status.id, status]));
  const ends = datasets
    .map((dataset) => {
      const status = statusById.get(dataset.id);
      return (
        extractYear(status?.latest_observation ?? null) ??
        extractYear(dataset.temporalCoverage?.to ?? null)
      );
    })
    .filter(isDefined);
  const from = starts.length > 0 ? String(Math.min(...starts)) : null;
  const to = ends.length > 0 ? String(Math.max(...ends)) : null;

  return {
    from,
    to,
    label: from && to ? `${from}–${to}` : from ?? to ?? "Da completare",
  };
}

function extractYear(value: string | null) {
  if (!value) return null;
  const year = Number(value.slice(0, 4));
  return Number.isInteger(year) && year >= 1000 && year <= 9999 ? year : null;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
