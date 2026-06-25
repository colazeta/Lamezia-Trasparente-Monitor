import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Database, MapPinned } from "lucide-react";
import {
  ATLANTE_INDICATOR_CATEGORIES,
  buildAtlanteDistribution,
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
  "hsl(var(--primary) / 0.14)",
  "hsl(var(--primary) / 0.28)",
  "hsl(var(--primary) / 0.44)",
  "hsl(var(--primary) / 0.62)",
  "hsl(var(--primary) / 0.82)",
];
const EMPTY_COLOR = "hsl(var(--muted-foreground) / 0.24)";

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
    availableIndicators.find(
      (indicator) => indicator.id === selectedIndicatorId,
    ) ??
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
        ? features.map((feature) =>
            readIndicatorValue(feature, activeIndicator),
          )
        : [],
    [activeIndicator, features],
  );
  const distribution = useMemo(
    () => buildAtlanteDistribution(values),
    [values],
  );
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

  return (
    <main className="bg-background text-foreground">
      <Header />

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
            <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)_310px] xl:grid-cols-[220px_minmax(0,1fr)_330px] xl:items-start">
              <IndicatorControl
                activeIndicator={activeIndicator}
                availableIndicators={availableIndicators}
                onSelect={setSelectedIndicatorId}
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
              <div className="space-y-5">
                <SectionProfileCard
                  activeFeature={activeFeature}
                  activeIndicator={activeIndicator}
                  activeValue={activeValue}
                  availableIndicators={availableIndicators}
                />
                <CitySummaryCard
                  activeIndicator={activeIndicator}
                  summary={distribution}
                />
              </div>
            </div>
            <SourceReference
              dataStatus={layer.dataStatus}
              metadata={metadata}
              summary={distribution}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function Header() {
  return (
    <section className="border-b border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-display font-bold leading-tight text-foreground sm:text-4xl">
            Atlante territoriale
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Esplora il territorio di Lamezia attraverso una mappa interattiva.
            Scegli un indicatore e confronta le diverse aree della città.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Le sezioni censuarie sono piccole aree statistiche usate per leggere
            il territorio in modo più dettagliato del livello comunale.
          </p>
        </div>
      </div>
    </section>
  );
}

function DemoNotice() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm leading-6 text-foreground">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-warning" />
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
    <section className="rounded-lg border border-border bg-card p-3 shadow-sm lg:sticky lg:top-4">
      <label
        className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"
        htmlFor="atlante-indicator-select"
      >
        <Database className="h-4 w-4 text-primary" />
        Indicatore
      </label>
      <select
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground lg:hidden"
        id="atlante-indicator-select"
        onChange={(event) => onSelect(event.target.value)}
        value={activeIndicator?.id ?? ""}
      >
        {orderedEntries.map(({ category, indicator }) => (
          <option
            disabled={!indicator}
            key={category.id}
            value={indicator?.id ?? category.id}
          >
            {indicator
              ? `${category.label} - ${indicator.label}`
              : `${category.label} - in preparazione`}
          </option>
        ))}
      </select>

      <div className="hidden space-y-1 lg:block">
        {orderedEntries.map(({ category, indicator }) => {
          const isActive = indicator?.id === activeIndicator?.id;
          return (
            <button
              className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-primary/10 text-foreground"
                  : indicator
                    ? "text-foreground hover:bg-primary/5"
                    : "text-muted-foreground"
              }`}
              disabled={!indicator}
              key={category.id}
              onClick={() => indicator && onSelect(indicator.id)}
              type="button"
            >
              <span className="font-medium">{category.label}</span>
              <span className="text-xs text-muted-foreground">
                {indicator ? "attivo" : "in preparazione"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CitySummaryCard({
  activeIndicator,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const unitLabel = activeIndicator?.unitLabel ?? "";
  const metrics = [
    ["Sezioni con dato", formatInteger(summary.availableCount)],
    ["Dato non disponibile", formatInteger(summary.missingCount)],
    ["Minimo", formatSummaryValue(summary.min, unitLabel)],
    ["Massimo", formatSummaryValue(summary.max, unitLabel)],
    ["Media", formatSummaryValue(summary.mean, unitLabel)],
    ["Mediana", formatSummaryValue(summary.median, unitLabel)],
  ];

  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <BarChart3 className="mt-0.5 h-4 w-4 flex-none text-primary" />
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Sintesi città
          </h2>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 space-y-1 text-xs leading-5 text-muted-foreground">
        <p>Valori null esclusi dai calcoli; zero resta zero.</p>
        {summary.zeroCount > 0 ? (
          <p>{formatInteger(summary.zeroCount)} sezioni hanno valore 0.</p>
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
    <section className="rounded-lg border border-border bg-card p-3 shadow-sm sm:p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <MapPinned className="h-4 w-4" />
            Mappa
          </h2>
        </div>
        <p className="text-sm font-medium text-foreground">
          {activeIndicator?.label ?? "Indicatore in preparazione"}
        </p>
      </div>

      {!bounds || !activeIndicator ? (
        <div className="flex min-h-80 items-center justify-center rounded-md bg-muted p-6 text-center text-sm text-muted-foreground">
          La mappa sarà disponibile quando almeno un indicatore censuario sarà
          presente nel file dati.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-muted">
          <svg
            aria-label="Mappa delle sezioni censuarie di Lamezia Terme"
            className="block h-[430px] w-full sm:h-[620px] xl:h-[680px]"
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
                  stroke={isActive ? "hsl(var(--brand))" : "hsl(var(--card))"}
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
    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
      {bins.map((bin) => (
        <span className="inline-flex items-center gap-1.5" key={bin.index}>
          <span
            aria-hidden="true"
            className="h-3 w-5 rounded-sm border border-border"
            style={{ backgroundColor: bin.color }}
          />
          {bin.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-3 w-5 rounded-sm border border-border"
          style={{ backgroundColor: EMPTY_COLOR }}
        />
        dato non disponibile
      </span>
    </div>
  );
}

function SectionProfileCard({
  activeFeature,
  activeIndicator,
  activeValue,
  availableIndicators,
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  activeValue: number | null;
  availableIndicators: AtlanteIndicatorDefinition[];
}) {
  const sectionId = activeFeature
    ? getSectionId(activeFeature)
    : "nessuna sezione";
  const valueLabel = activeIndicator
    ? formatProfileValue(activeValue, activeIndicator.unitLabel)
    : "Dato non disponibile";
  const profileRows = availableIndicators.map((indicator) => ({
    id: indicator.id,
    label: indicator.label,
    value: activeFeature
      ? formatProfileValue(
          readIndicatorValue(activeFeature, indicator),
          indicator.unitLabel,
        )
      : "Dato non disponibile",
  }));

  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sezione selezionata
        </p>
        <h2 className="mt-1 break-words text-xl font-semibold text-foreground">
          {sectionId}
        </h2>
      </div>

      <div className="mt-4 rounded-md bg-primary/10 p-3">
        <p className="text-xs font-semibold text-primary">
          {activeIndicator?.label ?? "Indicatore in preparazione"}
        </p>
        <p className="mt-1 text-2xl font-bold leading-tight text-foreground">
          {valueLabel}
        </p>
      </div>

      <dl className="mt-4 divide-y divide-border">
        {profileRows.length > 0 ? (
          profileRows.map((row) => (
            <div className="grid gap-1 py-2" key={row.id}>
              <dt className="text-sm font-medium text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-sm font-semibold text-foreground">
                {row.value}
              </dd>
            </div>
          ))
        ) : (
          <div className="p-3 text-sm text-muted-foreground">
            Nessun indicatore disponibile per questa sezione.
          </div>
        )}
      </dl>

      <div className="mt-3 text-xs leading-5 text-muted-foreground">
        {activeValue === 0 ? (
          <p>Zero è un valore reale, non un dato mancante.</p>
        ) : null}
      </div>
    </section>
  );
}

function SourceReference({
  dataStatus,
  metadata,
  summary,
}: {
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  metadata: AtlanteLayerMetadata;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  return (
    <section className="border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <h2 className="font-semibold text-foreground">Fonte dati</h2>
          <ul className="mt-1 space-y-1">
            <li>
              {metadata.sourcePages?.geometries ? (
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href={metadata.sourcePages.geometries}
                  rel="noreferrer"
                  target="_blank"
                >
                  ISTAT, Basi territoriali 2021
                </a>
              ) : (
                "ISTAT, Basi territoriali 2021"
              )}
            </li>
            <li>
              {metadata.sourcePages?.variables ? (
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href={metadata.sourcePages.variables}
                  rel="noreferrer"
                  target="_blank"
                >
                  ISTAT, dati per sezioni di censimento 2023
                </a>
              ) : (
                "ISTAT, dati per sezioni di censimento 2023"
              )}
            </li>
          </ul>
          {dataStatus === "demo" ? (
            <p className="mt-2 font-medium text-warning">
              Dato dimostrativo: non contiene sezioni censuarie reali.
            </p>
          ) : null}
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Come leggere</h2>
          <p className="mt-1">
            Il colore evidenzia l'indicatore scelto. "Dato non disponibile" non
            significa zero.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Cosa non mostra</h2>
          <p className="mt-1">
            La mappa non assegna punteggi, classifiche o giudizi alle aree.
          </p>
        </div>
      </div>
      <details className="mt-3 text-xs leading-5">
        <summary className="cursor-pointer font-medium text-foreground">
          Dettagli tecnici
        </summary>
        <p className="mt-2">
          Base: {metadata.territorialLevel}. Valori disponibili:{" "}
          {formatInteger(summary.availableCount)} sezioni; senza dato:{" "}
          {formatInteger(summary.missingCount)}. Le sezioni catastali Zornade
          restano un livello accessorio/non censuario e non sono usate come base
          della mappa.
        </p>
      </details>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
      Caricamento del livello territoriale in corso.
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-foreground shadow-sm">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
      Nessuna sezione censuaria disponibile. La pagina resta pronta per il file
      ISTAT processato atteso.
    </div>
  );
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatProfileValue(value: number | null, unitLabel: string) {
  return value === null
    ? "Dato non disponibile"
    : formatAtlanteValue(value, unitLabel);
}

function formatSummaryValue(value: number | null, unitLabel: string) {
  return value === null
    ? "Dato non disponibile"
    : formatAtlanteValue(value, unitLabel);
}

function colorDistributionBins(
  bins: AtlanteDistributionBin[],
): ColoredDistributionBin[] {
  return bins.map((bin, index) => {
    const colorIndex =
      bins.length <= 1
        ? CHOROPLETH_COLORS.length - 1
        : Math.round(
            (index / (bins.length - 1)) * (CHOROPLETH_COLORS.length - 1),
          );
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
  return binIndex === null
    ? EMPTY_COLOR
    : (bins[binIndex]?.color ?? EMPTY_COLOR);
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
