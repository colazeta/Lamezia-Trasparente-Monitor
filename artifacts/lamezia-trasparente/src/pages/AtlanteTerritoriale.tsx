import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Database,
  MapPinned,
} from "lucide-react";
import {
  ATLANTE_EXPECTED_GEOJSON_PATH,
  ATLANTE_EXPECTED_INDICATOR_DICTIONARY_PATH,
  ATLANTE_INDICATOR_CATEGORIES,
  buildAtlanteDistribution,
  describeAtlanteDistributionPosition,
  findAtlanteDistributionBin,
  type AtlanteDistributionBin,
  type AtlanteFeature,
  type AtlanteFeatureCollection,
  type AtlanteGeometry,
  type AtlanteIndicatorDefinition,
  type AtlanteLayerMetadata,
  type AtlanteLoadedLayer,
  type AtlantePosition,
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

type LoadState =
  | { status: "loading"; layer: null; message: null }
  | { status: "ready"; layer: AtlanteLoadedLayer; message: null }
  | { status: "error"; layer: null; message: string };

type ColoredDistributionBin = AtlanteDistributionBin & {
  color: string;
};

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
              "Non è stato possibile caricare il livello territoriale. Riprovare più tardi.",
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
        ? features.map((feature) => readIndicatorValue(feature, activeIndicator))
        : [],
    [activeIndicator, features],
  );
  const distribution = useMemo(() => buildAtlanteDistribution(values), [values]);
  const coloredBins = useMemo(
    () => colorDistributionBins(distribution.bins),
    [distribution.bins],
  );
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
  const activeBinIndex = findAtlanteDistributionBin(
    activeValue,
    distribution.bins,
  );

  return (
    <main className="bg-slate-50 text-slate-950">
      <Header activeIndicator={activeIndicator} metadata={metadata} />

      <section className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {loadState.status === "loading" ? (
          <LoadingState />
        ) : loadState.status === "error" ? (
          <ErrorState message={loadState.message} />
        ) : !layer || features.length === 0 || !metadata ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {layer.dataStatus === "demo" ? <DemoNotice /> : null}
            <IndicatorControl
              activeIndicator={activeIndicator}
              availableIndicators={availableIndicators}
              onSelect={setSelectedIndicatorId}
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] xl:items-start">
              <DistributionChart
                activeBinIndex={activeBinIndex}
                activeIndicator={activeIndicator}
                selectedValue={activeValue}
                summary={distribution}
              />
              <MapSurface
                activeIndicator={activeIndicator}
                bounds={bounds}
                coloredBins={coloredBins}
                features={features}
                hoveredSectionId={hoveredSectionId}
                selectedSectionId={selectedSectionId}
                setHoveredSectionId={setHoveredSectionId}
                setSelectedSectionId={setSelectedSectionId}
              />
            </div>
            <SelectedSectionCard
              activeFeature={activeFeature}
              activeIndicator={activeIndicator}
              activeValue={activeValue}
              bins={distribution.bins}
              metadata={metadata}
            />
            <MethodologyDisclosure
              dataStatus={layer.dataStatus}
              loadedFrom={layer.loadedFrom}
              metadata={metadata}
              summary={distribution}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function Header({
  activeIndicator,
  metadata,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  metadata: AtlanteLayerMetadata | null;
}) {
  const chips = [
    ["Fonte", metadata?.sourceInstitution ?? "ISTAT"],
    ["Livello", "sezioni censuarie"],
    ["Indicatore", activeIndicator?.label ?? "in preparazione"],
  ];

  return (
    <section className="border-b border-slate-200 bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            Atlante territoriale
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
            Esplora come la popolazione si distribuisce nelle sezioni censuarie
            di Lamezia Terme. Scegli un indicatore, guarda la distribuzione e
            confronta le diverse aree della città.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map(([label, value]) => (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                key={`${label}-${value}`}
              >
                <span className="font-semibold text-slate-950">{label}:</span>
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoNotice() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
      <p>
        Dato dimostrativo: non contiene sezioni censuarie reali e non va usato
        per analisi.
      </p>
    </div>
  );
}

function IndicatorControl({
  activeIndicator,
  availableIndicators,
  onSelect,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  availableIndicators: AtlanteIndicatorDefinition[];
  onSelect: (indicatorId: string) => void;
}) {
  const entries = ATLANTE_INDICATOR_CATEGORIES.map((category) => ({
    category,
    indicator: availableIndicators.find(
      (candidate) => candidate.categoryId === category.id,
    ),
  }));
  const orderedEntries = [
    ...entries.filter((entry) => entry.indicator),
    ...entries.filter((entry) => !entry.indicator),
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
        <Database className="h-4 w-4 text-teal-700" />
        Indicatore
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {orderedEntries.map(({ category, indicator }) => {
          const isActive = indicator?.id === activeIndicator?.id;
          return (
            <button
              className={`min-w-40 rounded-md border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                isActive
                  ? "border-teal-600 bg-teal-50 text-teal-950"
                  : indicator
                    ? "border-slate-200 bg-card text-slate-800 hover:border-teal-300"
                    : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
              disabled={!indicator}
              key={category.id}
              onClick={() => indicator && onSelect(indicator.id)}
              type="button"
            >
              <span className="block font-semibold">{category.label}</span>
              <span className="mt-1 block text-xs leading-5">
                {indicator ? indicator.label : "Indicatore in preparazione"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DistributionChart({
  activeBinIndex,
  activeIndicator,
  selectedValue,
  summary,
}: {
  activeBinIndex: number | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  selectedValue: number | null;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const maxCount = Math.max(
    1,
    ...summary.bins.map((bin) => bin.count),
    summary.missingCount,
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
            <BarChart3 className="h-4 w-4" />
            Distribuzione
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {activeIndicator?.label ?? "Indicatore in preparazione"}
          </h2>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {summary.availableCount} sezioni con dato
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {summary.bins.length > 0 ? (
          summary.bins.map((bin) => {
            const isSelected = activeBinIndex === bin.index;
            return (
              <div
                className="grid grid-cols-[72px_minmax(0,1fr)_42px] items-center gap-2 text-sm"
                key={bin.index}
              >
                <span className="text-xs font-medium text-slate-600">
                  {bin.label}
                </span>
                <div
                  aria-label={`Fascia ${bin.label}: ${bin.count} sezioni`}
                  className={`h-8 overflow-hidden rounded-md border bg-slate-100 ${
                    isSelected ? "border-slate-950" : "border-slate-200"
                  }`}
                >
                  <div
                    className={`h-full rounded-sm ${
                      isSelected ? "bg-teal-700" : "bg-teal-500"
                    }`}
                    style={{
                      width: `${Math.max(4, (bin.count / maxCount) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-right font-semibold text-slate-950">
                  {bin.count}
                </span>
              </div>
            );
          })
        ) : (
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            Nessun valore numerico disponibile per costruire la distribuzione.
          </p>
        )}

        {summary.missingCount > 0 ? (
          <div className="grid grid-cols-[72px_minmax(0,1fr)_42px] items-center gap-2 text-sm">
            <span className="text-xs font-medium text-slate-600">n.d.</span>
            <div
              className={`h-8 overflow-hidden rounded-md border bg-slate-100 ${
                selectedValue === null ? "border-slate-950" : "border-slate-200"
              }`}
            >
              <div
                className="h-full rounded-sm bg-slate-300"
                style={{
                  width: `${Math.max(
                    4,
                    (summary.missingCount / maxCount) * 100,
                  )}%`,
                }}
              />
            </div>
            <span className="text-right font-semibold text-slate-950">
              {summary.missingCount}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-2 text-sm leading-6 text-slate-600">
        <p>
          I valori mancanti sono separati dai valori numerici. Zero resta zero.
        </p>
        {summary.zeroCount > 0 ? (
          <p>{summary.zeroCount} sezioni hanno valore 0.</p>
        ) : null}
      </div>
    </section>
  );
}

function MapSurface({
  activeIndicator,
  bounds,
  coloredBins,
  features,
  hoveredSectionId,
  selectedSectionId,
  setHoveredSectionId,
  setSelectedSectionId,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  bounds: Bounds | null;
  coloredBins: ColoredDistributionBin[];
  features: AtlanteFeature[];
  hoveredSectionId: string | null;
  selectedSectionId: string | null;
  setHoveredSectionId: (sectionId: string | null) => void;
  setSelectedSectionId: (sectionId: string) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
            <MapPinned className="h-4 w-4" />
            Mappa
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Sezioni censuarie
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          {activeIndicator?.label ?? "Indicatore in preparazione"}
        </p>
      </div>

      {!bounds || !activeIndicator ? (
        <div className="flex min-h-80 items-center justify-center rounded-md bg-slate-100 p-6 text-center text-sm text-slate-600">
          La mappa sarà disponibile quando almeno un indicatore censuario sarà
          presente nel file dati.
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
              fill="hsl(var(--card))"
              height={MAP_HEIGHT}
              rx="0"
              width={MAP_WIDTH}
            />
            {features.map((feature) => {
              const sectionId = getSectionId(feature);
              const value = readIndicatorValue(feature, activeIndicator);
              const isActive =
                sectionId === hoveredSectionId || sectionId === selectedSectionId;
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
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  d={path}
                  fill={getChoroplethColor(value, coloredBins)}
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

      <MapLegend bins={coloredBins} />
    </section>
  );
}

function MapLegend({ bins }: { bins: ColoredDistributionBin[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
      {bins.map((bin) => (
        <span className="inline-flex items-center gap-1.5" key={bin.index}>
          <span
            aria-hidden="true"
            className="h-3 w-5 rounded-sm border border-slate-200"
            style={{ backgroundColor: bin.color }}
          />
          {bin.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-3 w-5 rounded-sm border border-slate-200"
          style={{ backgroundColor: EMPTY_COLOR }}
        />
        dato non disponibile
      </span>
    </div>
  );
}

function SelectedSectionCard({
  activeFeature,
  activeIndicator,
  activeValue,
  bins,
  metadata,
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  activeValue: number | null;
  bins: AtlanteDistributionBin[];
  metadata: AtlanteLayerMetadata;
}) {
  const sectionId = activeFeature ? getSectionId(activeFeature) : "nessuna";
  const valueLabel = activeIndicator
    ? formatAtlanteValue(activeValue, activeIndicator.unitLabel)
    : "dato non disponibile";
  const context = describeAtlanteDistributionPosition(activeValue, bins);

  return (
    <section className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-[220px_180px_minmax(0,1fr)] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sezione selezionata
          </p>
          <h2 className="mt-1 break-words text-xl font-semibold text-slate-950">
            {sectionId}
          </h2>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Valore
          </p>
          <p className="mt-1 text-2xl font-bold leading-tight text-slate-950">
            {valueLabel}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          <p>{context}</p>
          {activeValue === 0 ? (
            <p className="mt-2">Zero è mostrato come 0, non come dato mancante.</p>
          ) : null}
          <p className="mt-2 font-semibold text-teal-800">
            {metadata.publicLabel}
          </p>
        </div>
      </div>
    </section>
  );
}

function MethodologyDisclosure({
  dataStatus,
  loadedFrom,
  metadata,
  summary,
}: {
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  loadedFrom: string;
  metadata: AtlanteLayerMetadata;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const rows = [
    ["Fonte", metadata.sourceInstitution],
    ["Dataset", metadata.sourceDataset],
    ["Anno", metadata.sourceYear],
    ["Livello", metadata.territorialLevel],
    ["Verifica", metadata.verificationStatus],
    ["Aggiornamento", metadata.processingDate ?? "non indicato"],
  ];

  return (
    <details className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-5">
      <summary className="flex cursor-pointer items-center gap-2 text-base font-semibold text-slate-950">
        <BookOpen className="h-5 w-5 text-teal-700" />
        Fonti e limiti
      </summary>
      <div className="mt-5 space-y-5 text-sm leading-6 text-slate-700">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="mt-1 text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p>
            {summary.availableCount} sezioni hanno un valore numerico;{" "}
            {summary.missingCount} restano "dato non disponibile".
          </p>
          <p>
            Le sezioni urbane catastali Zornade non sono sezioni censuarie e
            restano fuori da questa base.
          </p>
          {dataStatus === "demo" ? (
            <p>Dato dimostrativo: non contiene sezioni censuarie reali.</p>
          ) : null}
        </div>

        <div>
          <p>
            File atteso:{" "}
            <span className="font-mono text-xs">
              {ATLANTE_EXPECTED_GEOJSON_PATH}
            </span>
          </p>
          <p>
            File caricato: <span className="font-mono text-xs">{loadedFrom}</span>
          </p>
          <p>
            Dizionario indicatori:{" "}
            <span className="font-mono text-xs">
              {metadata.qa?.indicatorDictionaryPath ??
                ATLANTE_EXPECTED_INDICATOR_DICTIONARY_PATH}
            </span>
          </p>
        </div>

        <ul className="list-disc space-y-2 pl-5">
          {metadata.knownLimits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </div>
    </details>
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

function colorDistributionBins(
  bins: AtlanteDistributionBin[],
): ColoredDistributionBin[] {
  return bins.map((bin, index) => {
    const colorIndex =
      bins.length <= 1
        ? CHOROPLETH_COLORS.length - 1
        : Math.round((index / (bins.length - 1)) * (CHOROPLETH_COLORS.length - 1));
    return {
      ...bin,
      color: CHOROPLETH_COLORS[colorIndex],
    };
  });
}

function getChoroplethColor(
  value: number | null,
  bins: ColoredDistributionBin[],
) {
  if (value === null || bins.length === 0) {
    return EMPTY_COLOR;
  }

  const binIndex = findAtlanteDistributionBin(value, bins);
  return binIndex === null ? EMPTY_COLOR : (bins[binIndex]?.color ?? EMPTY_COLOR);
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
