import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Database,
  Info,
  Layers3,
  MapPinned,
} from "lucide-react";
import {
  ATLANTE_EXPECTED_GEOJSON_PATH,
  ATLANTE_INDICATOR_CATEGORIES,
  type AtlanteFeature,
  type AtlanteFeatureCollection,
  type AtlanteGeometry,
  type AtlanteIndicatorDefinition,
  type AtlanteLayerMetadata,
  type AtlanteLoadedLayer,
  type AtlantePosition,
  featureHasIndicator,
  formatAtlanteValue,
  getAvailableIndicators,
  getSectionId,
  loadAtlanteLayer,
  readIndicatorValue,
} from "@/data/atlanteTerritoriale";

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 680;
const MAP_PADDING = 32;
const CHOROPLETH_COLORS = [
  "hsl(var(--chart-1) / 0.18)",
  "hsl(var(--chart-1) / 0.34)",
  "hsl(var(--chart-1) / 0.52)",
  "hsl(var(--chart-1) / 0.72)",
  "hsl(var(--chart-1))",
];
const EMPTY_COLOR = "hsl(var(--muted))";

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type LegendBin = {
  min: number;
  max: number;
  color: string;
  label: string;
};

type LoadState =
  | { status: "loading"; layer: null; message: null }
  | { status: "ready"; layer: AtlanteLoadedLayer; message: null }
  | { status: "error"; layer: null; message: string };

export function AtlanteTerritoriale() {
  const [loadState, setLoadState] = useState<LoadState>({
    status: "loading",
    layer: null,
    message: null,
  });
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(
    null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadAtlanteLayer()
      .then((layer) => {
        if (!cancelled) {
          setLoadState({ status: "ready", layer, message: null });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            layer: null,
            message:
              "Non e' stato possibile caricare il livello territoriale. Riprovare piu' tardi.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const layer = loadState.status === "ready" ? loadState.layer : null;
  const collection = layer?.collection ?? null;
  const features = collection?.features ?? [];
  const metadata = layer?.metadata ?? null;
  const availableIndicators = useMemo(
    () => (collection ? getAvailableIndicators(collection) : []),
    [collection],
  );
  const activeIndicator =
    availableIndicators.find((indicator) => indicator.id === selectedIndicatorId) ??
    availableIndicators[0] ??
    null;

  useEffect(() => {
    if (!activeIndicator && availableIndicators.length > 0) {
      setSelectedIndicatorId(availableIndicators[0].id);
    }
  }, [activeIndicator, availableIndicators]);

  useEffect(() => {
    if (!selectedSectionId && features.length > 0) {
      setSelectedSectionId(getSectionId(features[0]));
    }
  }, [features, selectedSectionId]);

  const values = useMemo(
    () =>
      activeIndicator
        ? features
            .map((feature) => readIndicatorValue(feature, activeIndicator))
            .filter((value): value is number => value !== null)
        : [],
    [activeIndicator, features],
  );
  const legendBins = useMemo(() => buildLegendBins(values), [values]);
  const bounds = useMemo(
    () => (collection ? computeBounds(collection) : null),
    [collection],
  );
  const activeSectionId = hoveredSectionId ?? selectedSectionId;
  const activeFeature =
    features.find((feature) => getSectionId(feature) === activeSectionId) ??
    features[0] ??
    null;
  const activeValue =
    activeFeature && activeIndicator
      ? readIndicatorValue(activeFeature, activeIndicator)
      : null;

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Dati territoriali
            </p>
            <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
              Atlante territoriale
            </h1>
            <p className="text-base leading-7 text-slate-700 sm:text-lg">
              L'Atlante territoriale legge Lamezia Terme per sezioni censuarie,
              la piu' piccola unita' territoriale statistica pubblicata da
              ISTAT. Ogni indicatore mostra fonte, anno, livello territoriale e
              limiti di interpretazione, distinguendo i dati ufficiali da
              eventuali stime o livelli accessori.
            </p>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Una sezione censuaria e' una porzione molto piccola del territorio
              usata per leggere fenomeni statistici locali. Non coincide con
              quartieri, CAP, zone catastali o aree fiscali.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {loadState.status === "loading" ? (
          <LoadingState />
        ) : loadState.status === "error" ? (
          <ErrorState message={loadState.message} />
        ) : !layer || features.length === 0 || !metadata ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              <DataNotice
                metadata={metadata}
                dataStatus={layer.dataStatus}
                loadedFrom={layer.loadedFrom}
              />
              <IndicatorSelector
                activeIndicator={activeIndicator}
                availableIndicators={availableIndicators}
                collection={collection}
                onSelect={setSelectedIndicatorId}
              />
              <MapSurface
                activeFeature={activeFeature}
                activeIndicator={activeIndicator}
                bounds={bounds}
                features={features}
                hoveredSectionId={hoveredSectionId}
                legendBins={legendBins}
                metadata={metadata}
                selectedSectionId={selectedSectionId}
                setHoveredSectionId={setHoveredSectionId}
                setSelectedSectionId={setSelectedSectionId}
              />
              <Legend
                activeIndicator={activeIndicator}
                legendBins={legendBins}
              />
            </div>
            <DetailPanel
              activeFeature={activeFeature}
              activeIndicator={activeIndicator}
              activeValue={activeValue}
              dataStatus={layer.dataStatus}
              metadata={metadata}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function DataNotice({
  dataStatus,
  loadedFrom,
  metadata,
}: {
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  loadedFrom: string;
  metadata: AtlanteLayerMetadata;
}) {
  const isDemo = dataStatus === "demo";
  return (
    <div
      className={`rounded-lg border p-4 ${
        isDemo
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : "border-teal-200 bg-teal-50 text-teal-950"
      }`}
    >
      <div className="flex items-start gap-3">
        {isDemo ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
        ) : (
          <Database className="mt-0.5 h-5 w-5 flex-none" />
        )}
        <div className="space-y-2">
          <p className="font-semibold">{metadata.publicLabel}</p>
          <p className="text-sm leading-6">
            Percorso dati atteso:{" "}
            <span className="font-mono text-xs">{ATLANTE_EXPECTED_GEOJSON_PATH}</span>.
            File caricato: <span className="font-mono text-xs">{loadedFrom}</span>.
          </p>
          {isDemo ? (
            <p className="text-sm leading-6">
              Questa visualizzazione usa dati dimostrativi per non bloccare la
              pagina quando il GeoJSON ISTAT processato non e' ancora presente.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function IndicatorSelector({
  activeIndicator,
  availableIndicators,
  collection,
  onSelect,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  availableIndicators: AtlanteIndicatorDefinition[];
  collection: AtlanteFeatureCollection | null;
  onSelect: (indicatorId: string) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Indicatore
          </h2>
          <p className="text-sm text-slate-600">
            Sono attivi solo gli indicatori presenti nel contratto dati.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          <Layers3 className="h-4 w-4" />
          Sezioni censuarie ISTAT
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {ATLANTE_INDICATOR_CATEGORIES.map((category) => {
          const indicator = availableIndicators.find(
            (candidate) => candidate.categoryId === category.id,
          );
          const isEnabled = Boolean(indicator);
          const isActive = indicator?.id === activeIndicator?.id;
          return (
            <button
              key={category.id}
              className={`min-h-20 rounded-md border p-3 text-left transition ${
                isActive
                  ? "border-teal-600 bg-teal-50 text-teal-950"
                  : isEnabled
                    ? "border-slate-200 bg-card text-slate-800 hover:border-teal-300"
                    : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
              disabled={!isEnabled || !indicator}
              onClick={() => indicator && onSelect(indicator.id)}
              type="button"
            >
              <span className="block text-sm font-semibold">
                {category.label}
              </span>
              <span className="mt-1 block text-xs leading-5">
                {indicator
                  ? indicator.label
                  : "Indicatore in preparazione"}
              </span>
            </button>
          );
        })}
      </div>
      {collection && activeIndicator ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {collection.features.filter((feature) => featureHasIndicator(feature, activeIndicator)).length}{" "}
          sezioni con valore disponibile per l'indicatore selezionato.
        </p>
      ) : null}
    </section>
  );
}

function MapSurface({
  activeFeature,
  activeIndicator,
  bounds,
  features,
  hoveredSectionId,
  legendBins,
  metadata,
  selectedSectionId,
  setHoveredSectionId,
  setSelectedSectionId,
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  bounds: Bounds | null;
  features: AtlanteFeature[];
  hoveredSectionId: string | null;
  legendBins: LegendBin[];
  metadata: AtlanteLayerMetadata;
  selectedSectionId: string | null;
  setHoveredSectionId: (sectionId: string | null) => void;
  setSelectedSectionId: (sectionId: string) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <MapPinned className="h-5 w-5 text-teal-700" />
            Mappa per sezioni censuarie
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Base territoriale primaria: sezione di censimento ISTAT.
          </p>
        </div>
        <div className="rounded-md bg-slate-100 px-3 py-2 text-xs leading-5 text-slate-700">
          <span className="font-semibold">{metadata.sourceInstitution}</span> ·{" "}
          {metadata.sourceYear} · {metadata.territorialLevel}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {!bounds || !activeIndicator ? (
          <div className="flex min-h-80 items-center justify-center rounded-md bg-slate-100 p-6 text-center text-sm text-slate-600">
            La mappa sara' disponibile quando almeno un indicatore censuario
            sara' presente nel file dati.
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-100">
            <svg
              aria-label="Mappa delle sezioni censuarie di Lamezia Terme"
              className="block h-[360px] w-full sm:h-[520px]"
              role="img"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            >
              <rect
                fill="hsl(var(--background))"
                height={MAP_HEIGHT}
                rx="0"
                width={MAP_WIDTH}
              />
              {features.map((feature) => {
                const sectionId = getSectionId(feature);
                const value = readIndicatorValue(feature, activeIndicator);
                const isActive =
                  sectionId === hoveredSectionId ||
                  sectionId === selectedSectionId;
                const path = feature.geometry
                  ? geometryToPath(feature.geometry, bounds)
                  : "";

                if (!path) {
                  return null;
                }

                return (
                  <path
                    aria-label={`${sectionId}: ${formatAtlanteValue(
                      value,
                      activeIndicator.unitLabel,
                    )}`}
                    d={path}
                    fill={getChoroplethColor(value, legendBins)}
                    key={sectionId}
                    onBlur={() => setHoveredSectionId(null)}
                    onClick={() => setSelectedSectionId(sectionId)}
                    onFocus={() => setHoveredSectionId(sectionId)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedSectionId(sectionId);
                      }
                    }}
                    onMouseEnter={() => setHoveredSectionId(sectionId)}
                    onMouseLeave={() => setHoveredSectionId(null)}
                    role="button"
                    stroke={
                      isActive ? "hsl(var(--foreground))" : "hsl(var(--card))"
                    }
                    strokeLinejoin="round"
                    strokeWidth={isActive ? 4 : 2}
                    tabIndex={0}
                  />
                );
              })}
            </svg>
          </div>
        )}
        <div className="mt-3 flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Sezione selezionata:{" "}
            <span className="font-semibold text-slate-900">
              {activeFeature ? getSectionId(activeFeature) : "nessuna"}
            </span>
          </p>
          <p>
            Valore:{" "}
            <span className="font-semibold text-slate-900">
              {activeIndicator
                ? formatAtlanteValue(
                    activeFeature
                      ? readIndicatorValue(activeFeature, activeIndicator)
                      : null,
                    activeIndicator.unitLabel,
                  )
                : "non disponibile"}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Legend({
  activeIndicator,
  legendBins,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  legendBins: LegendBin[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">Legenda</h2>
      {!activeIndicator || legendBins.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">
          Nessun valore disponibile per costruire la legenda.
        </p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {legendBins.map((bin) => (
            <div
              className="flex items-center gap-2 text-xs text-slate-700"
              key={`${bin.min}-${bin.max}-${bin.color}`}
            >
              <span
                aria-hidden="true"
                className="h-4 w-8 rounded-sm border border-slate-200"
                style={{ backgroundColor: bin.color }}
              />
              <span>{bin.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <span
              aria-hidden="true"
              className="h-4 w-8 rounded-sm border border-slate-200"
              style={{ backgroundColor: EMPTY_COLOR }}
            />
            <span>non disponibile</span>
          </div>
        </div>
      )}
    </section>
  );
}

function DetailPanel({
  activeFeature,
  activeIndicator,
  activeValue,
  dataStatus,
  metadata,
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  activeValue: number | null;
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  metadata: AtlanteLayerMetadata;
}) {
  const rows = [
    ["Fonte istituzionale", metadata.sourceInstitution],
    ["Dataset", metadata.sourceDataset],
    ["Anno", metadata.sourceYear],
    ["Livello territoriale", metadata.territorialLevel],
    ["Stato verifica", metadata.verificationStatus],
    ["Ultimo aggiornamento", metadata.processingDate ?? "non indicato"],
  ];

  return (
    <aside className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Fonti e dettagli
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Le informazioni seguono la sezione selezionata sulla mappa.
          </p>
        </div>
      </div>

      <div
        className={`mt-4 rounded-md border p-3 text-sm font-semibold ${
          dataStatus === "demo"
            ? "border-amber-300 bg-amber-50 text-amber-950"
            : "border-teal-200 bg-teal-50 text-teal-950"
        }`}
      >
        {metadata.publicLabel}
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sezione
          </dt>
          <dd className="mt-1 font-semibold text-slate-950">
            {activeFeature ? getSectionId(activeFeature) : "nessuna sezione"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Indicatore selezionato
          </dt>
          <dd className="mt-1 text-slate-900">
            {activeIndicator ? activeIndicator.label : "Indicatore in preparazione"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Valore
          </dt>
          <dd className="mt-1 text-slate-900">
            {activeIndicator
              ? formatAtlanteValue(activeValue, activeIndicator.unitLabel)
              : "non disponibile"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          Metadati pubblici
        </h3>
        <dl className="mt-3 space-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="mt-1 leading-6 text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-950">
          Limiti noti
        </h3>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
          {metadata.knownLimits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-card p-6 text-sm text-slate-700 shadow-sm">
      Caricamento del livello territoriale in corso.
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-900 shadow-sm">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-card p-6 text-sm text-slate-700 shadow-sm">
      Nessuna sezione censuaria disponibile. La pagina resta pronta per il file
      ISTAT processato atteso.
    </div>
  );
}

function buildLegendBins(values: number[]): LegendBin[] {
  if (values.length === 0) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [
      {
        min,
        max,
        color: CHOROPLETH_COLORS[CHOROPLETH_COLORS.length - 1],
        label: formatRange(min, max),
      },
    ];
  }

  const steps = Math.min(CHOROPLETH_COLORS.length, new Set(values).size);
  const range = max - min;

  return Array.from({ length: steps }, (_, index) => {
    const binMin = min + (range / steps) * index;
    const binMax = index === steps - 1 ? max : min + (range / steps) * (index + 1);
    return {
      min: binMin,
      max: binMax,
      color: CHOROPLETH_COLORS[index],
      label: formatRange(binMin, binMax),
    };
  });
}

function getChoroplethColor(value: number | null, bins: LegendBin[]) {
  if (value === null || bins.length === 0) {
    return EMPTY_COLOR;
  }

  const match =
    bins.find((bin, index) =>
      index === bins.length - 1
        ? value >= bin.min && value <= bin.max
        : value >= bin.min && value < bin.max,
    ) ?? bins[bins.length - 1];

  return match.color;
}

function formatRange(min: number, max: number) {
  const formatter = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  });

  if (min === max) {
    return formatter.format(min);
  }

  return `${formatter.format(Math.ceil(min))} - ${formatter.format(Math.floor(max))}`;
}

function computeBounds(collection: AtlanteFeatureCollection): Bounds | null {
  const positions: AtlantePosition[] = [];
  for (const feature of collection.features) {
    if (feature.geometry) {
      collectPositions(feature.geometry, positions);
    }
  }

  if (positions.length === 0) {
    return null;
  }

  return positions.reduce<Bounds>(
    (bounds, position) => ({
      minX: Math.min(bounds.minX, position[0]),
      minY: Math.min(bounds.minY, position[1]),
      maxX: Math.max(bounds.maxX, position[0]),
      maxY: Math.max(bounds.maxY, position[1]),
    }),
    {
      minX: positions[0][0],
      minY: positions[0][1],
      maxX: positions[0][0],
      maxY: positions[0][1],
    },
  );
}

function collectPositions(
  geometry: AtlanteGeometry,
  positions: AtlantePosition[],
) {
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) {
      positions.push(...ring);
    }
    return;
  }

  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) {
      positions.push(...ring);
    }
  }
}

function geometryToPath(geometry: AtlanteGeometry, bounds: Bounds) {
  if (geometry.type === "Polygon") {
    return polygonToPath(geometry.coordinates, bounds);
  }

  return geometry.coordinates
    .map((polygon) => polygonToPath(polygon, bounds))
    .join(" ");
}

function polygonToPath(rings: AtlantePosition[][], bounds: Bounds) {
  return rings
    .map((ring) =>
      ring
        .map((position, index) => {
          const [x, y] = project(position, bounds);
          return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ")
        .concat(" Z"),
    )
    .join(" ");
}

function project(position: AtlantePosition, bounds: Bounds): [number, number] {
  const width = Math.max(bounds.maxX - bounds.minX, Number.EPSILON);
  const height = Math.max(bounds.maxY - bounds.minY, Number.EPSILON);
  const x =
    MAP_PADDING +
    ((position[0] - bounds.minX) / width) * (MAP_WIDTH - MAP_PADDING * 2);
  const y =
    MAP_HEIGHT -
    MAP_PADDING -
    ((position[1] - bounds.minY) / height) * (MAP_HEIGHT - MAP_PADDING * 2);

  return [x, y];
}
