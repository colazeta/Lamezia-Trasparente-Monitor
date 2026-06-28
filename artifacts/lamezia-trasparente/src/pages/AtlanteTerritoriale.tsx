import { useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  BarChart3,
  Database,
  Download,
  Layers,
  MapPinned,
} from "lucide-react";
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
  getSectionPublicLabel,
  loadAtlanteLayer,
  readIndicatorValue,
} from "@/data/atlanteTerritoriale";

const NO_BASEMAP_ID = "none";
const BASEMAP_PROVIDERS = [
  {
    id: "openstreetmap-standard",
    label: "Strade",
    description: "OpenStreetMap",
    urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
    opacity: 0.52,
    maxZoom: 18,
  },
  {
    id: "esri-world-imagery",
    label: "Aerea",
    description: "Immagini satellitari",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles © Esri - Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    opacity: 0.72,
    maxZoom: 18,
  },
] as const;
const CHOROPLETH_COLORS = [
  "hsl(45 100% 88%)",
  "hsl(142 76% 84%)",
  "hsl(187 92% 69%)",
  "hsl(199 89% 58%)",
  "hsl(224 76% 48%)",
];
const EMPTY_COLOR = "hsl(220 13% 82%)";

type BasemapId = (typeof BASEMAP_PROVIDERS)[number]["id"] | typeof NO_BASEMAP_ID;

type GeographicBounds = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};

type SectionLayer = {
  bindTooltip?: (
    content: string,
    options?: { direction?: "top"; sticky?: boolean },
  ) => unknown;
  getElement?: () => Element | null;
  on: (...args: unknown[]) => unknown;
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
    if (
      selectedSectionId &&
      !features.some((feature) => getSectionId(feature) === selectedSectionId)
    ) {
      setSelectedSectionId(null);
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
  const activeFeature = activeSectionId
    ? features.find((feature) => getSectionId(feature) === activeSectionId) ??
      null
    : null;
  const activeValue =
    activeFeature && activeIndicator
      ? readIndicatorValue(activeFeature, activeIndicator)
      : null;

  return (
    <main className="bg-background text-foreground">
      <Header />

      <section className="mx-auto w-full max-w-[1800px] px-3 py-5 sm:px-5 lg:px-6 2xl:px-8">
        {loadState.status === "loading" ? (
          <LoadingState />
        ) : loadState.status === "error" ? (
          <ErrorState message={loadState.message} />
        ) : !layer || features.length === 0 || !metadata ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {layer.dataStatus === "demo" ? <DemoNotice /> : null}
            <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] xl:grid-cols-[180px_minmax(0,1fr)_270px] 2xl:grid-cols-[190px_minmax(0,1fr)_280px] xl:items-start">
              <IndicatorControl
                activeIndicator={activeIndicator}
                availableIndicators={availableIndicators}
                onSelect={setSelectedIndicatorId}
              />
              <MapSurface
                activeIndicator={activeIndicator}
                bounds={bounds}
                coloredBins={coloredBins}
                dataStatus={layer.dataStatus}
                features={features}
                hoveredSectionId={hoveredSectionId}
                metadata={metadata}
                selectedSectionId={selectedSectionId}
                setHoveredSectionId={setHoveredSectionId}
                setSelectedSectionId={setSelectedSectionId}
                summary={distribution}
              />
              <div className="space-y-5 lg:col-start-2 xl:col-start-auto">
                <SectionProfileCard
                  activeFeature={activeFeature}
                  activeIndicator={activeIndicator}
                  activeValue={activeValue}
                  availableIndicators={availableIndicators}
                />
                <CitySummaryCard
                  activeIndicator={activeIndicator}
                  coloredBins={coloredBins}
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
    <section className="rounded-lg border border-border/80 bg-card/80 p-2.5 shadow-sm lg:sticky lg:top-4">
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
              className={`flex min-h-11 w-full flex-col items-start justify-center gap-1 rounded-md px-2.5 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
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
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] leading-none ${
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground/90"
                    : indicator
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
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
  coloredBins,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  coloredBins: ColoredDistributionBin[];
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const unitLabel = activeIndicator?.unitLabel ?? "";
  const isPopulationIndicator = activeIndicator?.id === "popolazione-residente";
  const metrics = isPopulationIndicator
    ? [
        [
          "Sezioni totali",
          formatCountWithShare(summary.totalCount, summary.totalCount),
        ],
        [
          "Con dato P1",
          formatCountWithShare(summary.availableCount, summary.totalCount),
        ],
        [
          "Dato non disponibile",
          formatCountWithShare(summary.missingCount, summary.totalCount),
        ],
        [
          "Valore 0",
          formatCountWithShare(summary.zeroCount, summary.totalCount),
        ],
      ]
    : [
        ["Sezioni con dato", formatInteger(summary.availableCount)],
        ["Dato non disponibile", formatInteger(summary.missingCount)],
        ["Minimo", formatSummaryValue(summary.min, unitLabel)],
        ["Massimo", formatSummaryValue(summary.max, unitLabel)],
        ["Media", formatSummaryValue(summary.mean, unitLabel)],
        ["Mediana", formatSummaryValue(summary.median, unitLabel)],
      ];

  return (
    <section className="rounded-lg border border-border/80 bg-card/80 p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <BarChart3 className="mt-0.5 h-4 w-4 flex-none text-primary" />
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Sintesi città
          </h2>
        </div>
      </div>

      {isPopulationIndicator ? (
        <div className="mt-3 rounded-md bg-background p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Popolazione totale nelle sezioni con P1 disponibile
          </p>
          <p className="mt-1 text-2xl font-bold leading-tight text-foreground">
            {formatSummaryValue(summary.sum, unitLabel)}
          </p>
        </div>
      ) : null}

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      {isPopulationIndicator && coloredBins.length > 0 ? (
        <DistributionBands bins={coloredBins} summary={summary} />
      ) : null}

      <div className="mt-3 space-y-1 text-xs leading-5 text-muted-foreground">
        <p>Valori null esclusi da somma e fasce; zero resta zero.</p>
        {summary.zeroCount > 0 ? (
          <p>{formatInteger(summary.zeroCount)} sezioni hanno valore 0.</p>
        ) : null}
      </div>
    </section>
  );
}

function DistributionBands({
  bins,
  summary,
}: {
  bins: ColoredDistributionBin[];
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Distribuzione per fasce
      </h3>
      <div
        aria-label="Distribuzione delle sezioni per fascia"
        className="mt-2 flex h-3 overflow-hidden rounded-full border border-border bg-muted"
      >
        {bins.map((bin) => (
          <span
            aria-hidden="true"
            key={bin.index}
            style={{
              backgroundColor: bin.color,
              width: `${Math.max(
                4,
                (bin.count / Math.max(1, summary.availableCount)) * 100,
              )}%`,
            }}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-2 text-xs leading-5">
        {bins.map((bin) => (
          <li className="grid grid-cols-[auto_1fr] gap-x-2" key={bin.index}>
            <span
              aria-hidden="true"
              className="mt-1 h-3 w-3 rounded-sm border border-border"
              style={{ backgroundColor: bin.color }}
            />
            <span>
              <span className="font-semibold text-foreground">
                {formatDistributionBandName(bin.index, bins.length)}
              </span>
              <span className="text-muted-foreground"> · {bin.label}</span>
              <span className="block text-muted-foreground">
                {formatSectionCount(bin.count)} ·{" "}
                {formatPercentage(bin.count, summary.availableCount)} delle
                sezioni con dato
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MapSurface({
  activeIndicator,
  bounds,
  coloredBins,
  dataStatus,
  features,
  hoveredSectionId,
  metadata,
  selectedSectionId,
  setHoveredSectionId,
  setSelectedSectionId,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  bounds: GeographicBounds | null;
  coloredBins: ColoredDistributionBin[];
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  features: AtlanteFeature[];
  hoveredSectionId: string | null;
  metadata: AtlanteLayerMetadata;
  selectedSectionId: string | null;
  setHoveredSectionId: (sectionId: string | null) => void;
  setSelectedSectionId: (sectionId: string) => void;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const [selectedBasemapId, setSelectedBasemapId] = useState<BasemapId>(
    "openstreetmap-standard",
  );
  const [resetSignal, setResetSignal] = useState(0);
  const selectedBasemap =
    BASEMAP_PROVIDERS.find((provider) => provider.id === selectedBasemapId) ??
    null;
  const leafletBounds = useMemo(
    () => (bounds ? toLeafletBounds(bounds) : null),
    [bounds],
  );
  const mapData = useMemo<AtlanteFeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features,
    }),
    [features],
  );

  return (
    <section className="rounded-xl border border-primary/20 bg-card p-2 shadow-md ring-1 ring-primary/10 sm:p-3">
      {!leafletBounds || !activeIndicator ? (
        <div className="flex min-h-80 items-center justify-center rounded-md bg-muted p-6 text-center text-sm text-muted-foreground">
          La mappa sarà disponibile quando almeno un indicatore censuario sarà
          presente nel file dati.
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-border bg-background">
          <MapContainer
            attributionControl={!!selectedBasemap}
            bounds={leafletBounds}
            className="h-[520px] w-full sm:h-[640px] lg:h-[min(78vh,860px)] lg:min-h-[700px] 2xl:min-h-[760px]"
            maxZoom={selectedBasemap?.maxZoom ?? 18}
            scrollWheelZoom
            style={{ background: "hsl(var(--background))" }}
            zoomControl
          >
            <MapViewResetter bounds={leafletBounds} resetSignal={resetSignal} />
            {selectedBasemap ? (
              <TileLayer
                attribution={selectedBasemap.attribution}
                opacity={selectedBasemap.opacity}
                url={selectedBasemap.urlTemplate}
              />
            ) : null}
            <GeoJSON
              key={[
                activeIndicator.id,
                selectedSectionId ?? "none",
                hoveredSectionId ?? "none",
              ].join(":")}
              data={mapData as unknown as GeoJSON.GeoJsonObject}
              onEachFeature={(geoFeature, layer) => {
                bindSectionLayer({
                  activeIndicator,
                  feature: geoFeature as unknown as AtlanteFeature,
                  layer,
                  setHoveredSectionId,
                  setSelectedSectionId,
                });
              }}
              style={(geoFeature) =>
                getLeafletFeatureStyle({
                  activeIndicator,
                  bins: coloredBins,
                  feature: geoFeature as unknown as AtlanteFeature,
                  hoveredSectionId,
                  selectedSectionId,
                })
              }
            />
          </MapContainer>

          <div className="pointer-events-none absolute inset-x-2 top-2 z-[500] flex flex-col gap-2 sm:inset-x-3 sm:top-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="pointer-events-auto ml-11 max-w-[calc(100%-2.75rem)] rounded-lg border border-border/90 bg-card/95 px-3 py-2 shadow-sm backdrop-blur sm:ml-0 sm:max-w-sm">
              <h2
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary"
                id="atlante-map-title"
              >
                <MapPinned className="h-4 w-4" />
                Mappa
              </h2>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {activeIndicator.label}
              </p>
            </div>

            <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-lg border border-border/90 bg-card/95 p-2 text-xs shadow-sm backdrop-blur">
              <label className="inline-flex items-center gap-2 font-medium text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                <span>Sfondo mappa</span>
                <select
                  aria-label="Sfondo mappa"
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                  onChange={(event) =>
                    setSelectedBasemapId(event.target.value as BasemapId)
                  }
                  value={selectedBasemapId}
                >
                  <option value={NO_BASEMAP_ID}>Nessuno</option>
                  {BASEMAP_PROVIDERS.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setResetSignal((current) => current + 1)}
                type="button"
              >
                Reimposta vista
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() =>
                  downloadAtlanteMapSvg({
                    activeIndicator,
                    bounds: bounds as GeographicBounds,
                    coloredBins,
                    dataStatus,
                    features,
                    metadata,
                    summary,
                  })
                }
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                Scarica mappa
              </button>
            </div>
          </div>

          <MapLegend
            bins={coloredBins}
            className="pointer-events-auto absolute bottom-3 left-3 z-[500] max-w-[calc(100%-1.5rem)]"
          />
        </div>
      )}

    </section>
  );
}

function MapViewResetter({
  bounds,
  resetSignal,
}: {
  bounds: LatLngBoundsExpression;
  resetSignal: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { animate: false, padding: [18, 18] });
    const timeout = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(timeout);
  }, [bounds, map]);

  useEffect(() => {
    if (resetSignal > 0) {
      map.fitBounds(bounds, { animate: true, padding: [18, 18] });
    }
  }, [bounds, map, resetSignal]);

  return null;
}

function MapLegend({
  bins,
  className,
}: {
  bins: ColoredDistributionBin[];
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap gap-2 rounded-lg border border-border/90 bg-card/95 p-2 text-xs text-muted-foreground shadow-sm backdrop-blur ${className ?? ""}`}
    >
      {bins.map((bin) => (
        <span className="inline-flex items-center gap-1.5" key={bin.index}>
          <span
            aria-hidden="true"
            className="h-3 w-5 rounded-sm border border-border"
            style={{ backgroundColor: bin.color }}
          />
          {formatDistributionBandName(bin.index, bins.length)}
          <span className="text-muted-foreground/80">· {bin.label}</span>
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
  if (!activeFeature) {
    return (
      <section className="rounded-lg border border-border/80 bg-card/80 p-3 shadow-sm xl:sticky xl:top-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sezione selezionata
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          Nessuna sezione selezionata
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Seleziona una sezione sulla mappa per vedere i dati disponibili.
        </p>
      </section>
    );
  }

  const sectionId = getSectionId(activeFeature);
  const sectionLabel = getSectionPublicLabel(activeFeature);
  const valueLabel = activeIndicator
    ? formatProfileValue(activeValue, activeIndicator.unitLabel)
    : "Dato non disponibile";
  const profileRows = availableIndicators
    .filter((indicator) => indicator.id !== activeIndicator?.id)
    .map((indicator) => ({
      id: indicator.id,
      label: indicator.label,
      value: formatProfileValue(
        readIndicatorValue(activeFeature, indicator),
        indicator.unitLabel,
      ),
    }));

  return (
    <section className="rounded-lg border border-border/80 bg-card/80 p-3 shadow-sm xl:sticky xl:top-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sezione selezionata
        </p>
        <h2 className="mt-1 break-words text-xl font-semibold text-foreground">
          {sectionLabel}
        </h2>
        <p className="mt-1 break-words text-xs text-muted-foreground">
          Sezione censuaria ISTAT: {sectionId}
        </p>
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
            Nessun altro indicatore disponibile per questa sezione.
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

function formatCountWithShare(count: number, total: number) {
  return `${formatInteger(count)} (${formatPercentage(count, total)})`;
}

function formatPercentage(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 1,
  }).format((count / total) * 100)}%`;
}

function formatSectionCount(count: number) {
  return `${formatInteger(count)} ${count === 1 ? "sezione" : "sezioni"}`;
}

function formatDistributionBandName(index: number, total: number) {
  if (total <= 1) {
    return "Fascia unica";
  }

  const labels = [
    "Fascia bassa",
    "Fascia medio-bassa",
    "Fascia media",
    "Fascia medio-alta",
    "Fascia alta",
  ];
  if (total === labels.length) {
    return labels[index] ?? `Fascia ${index + 1}`;
  }

  return `Fascia ${index + 1}`;
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

function downloadAtlanteMapSvg({
  activeIndicator,
  bounds,
  coloredBins,
  dataStatus,
  features,
  metadata,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  bounds: GeographicBounds;
  coloredBins: ColoredDistributionBin[];
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  features: AtlanteFeature[];
  metadata: AtlanteLayerMetadata;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const svg = buildAtlanteMapExportSvg({
    activeIndicator,
    bounds,
    coloredBins,
    dataStatus,
    features,
    metadata,
    summary,
  });
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `atlante-territoriale-lamezia-${activeIndicator.id}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function buildAtlanteMapExportSvg({
  activeIndicator,
  bounds,
  coloredBins,
  dataStatus,
  features,
  metadata,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  bounds: GeographicBounds;
  coloredBins: ColoredDistributionBin[];
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  features: AtlanteFeature[];
  metadata: AtlanteLayerMetadata;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const width = 1400;
  const height = 980;
  const mapHeight = 690;
  const padding = 56;
  const lngRange = Math.max(0.000001, bounds.maxLng - bounds.minLng);
  const latRange = Math.max(0.000001, bounds.maxLat - bounds.minLat);
  const scale = Math.min(
    (width - padding * 2) / lngRange,
    (mapHeight - padding * 2) / latRange,
  );
  const drawWidth = lngRange * scale;
  const drawHeight = latRange * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = padding + (mapHeight - padding * 2 - drawHeight) / 2;
  const project = (position: AtlantePosition) => {
    const x = offsetX + (position[0] - bounds.minLng) * scale;
    const y = offsetY + (bounds.maxLat - position[1]) * scale;
    return `${roundSvgNumber(x)},${roundSvgNumber(y)}`;
  };
  const paths = features
    .map((feature) => {
      if (!feature.geometry) {
        return "";
      }
      const value = readIndicatorValue(feature, activeIndicator);
      const sectionId = getSectionId(feature);
      return `<path d="${geometryToSvgPath(
        feature.geometry,
        project,
      )}" fill="${getChoroplethColor(
        value,
        coloredBins,
      )}" fill-opacity="${value === null ? "0.58" : "0.9"}" stroke="hsl(0 0% 100%)" stroke-width="1.4"><title>${escapeXml(
        `${getSectionPublicLabel(feature)} - ${sectionId}: ${formatAtlanteValue(
          value,
          activeIndicator.unitLabel,
        )}`,
      )}</title></path>`;
    })
    .join("");
  const legendItems = coloredBins
    .map(
      (bin, index) => `
        <g transform="translate(${padding + index * 210}, 794)">
          <rect width="24" height="16" rx="3" fill="${bin.color}" stroke="hsl(215 25% 27%)" stroke-opacity="0.2" />
          <text x="34" y="13" font-size="18" fill="hsl(215 25% 27%)">${escapeXml(
            formatDistributionBandName(index, coloredBins.length),
          )}</text>
          <text x="34" y="38" font-size="15" fill="hsl(215 16% 47%)">${escapeXml(
            `${bin.label} · ${formatSectionCount(bin.count)}`,
          )}</text>
        </g>`,
    )
    .join("");
  const statusLabel =
    dataStatus === "demo"
      ? "Dato dimostrativo - non usare per analisi"
      : metadata.publicLabel;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">Atlante territoriale - Lamezia Terme</title>
  <desc id="desc">Mappa tematica per sezioni censuarie ISTAT con legenda e statistiche essenziali.</desc>
  <rect width="100%" height="100%" fill="hsl(210 40% 98%)" />
  <text x="${padding}" y="54" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700" fill="hsl(222 47% 11%)">Atlante territoriale - Lamezia Terme</text>
  <text x="${padding}" y="88" font-family="Inter, Arial, sans-serif" font-size="18" fill="hsl(215 16% 35%)">${escapeXml(
    activeIndicator.label,
  )} · ${escapeXml(statusLabel)}</text>
  <g font-family="Inter, Arial, sans-serif">${paths}</g>
  <rect x="${padding}" y="728" width="${width - padding * 2}" height="1" fill="hsl(213 27% 84%)" />
  <g font-family="Inter, Arial, sans-serif">
    <text x="${padding}" y="764" font-size="20" font-weight="700" fill="hsl(222 47% 11%)">Fasce di popolazione</text>
    ${legendItems}
    <g transform="translate(${padding}, 900)">
      <text font-size="18" font-weight="700" fill="hsl(222 47% 11%)">${escapeXml(
        formatSummaryValue(summary.sum, activeIndicator.unitLabel),
      )}</text>
      <text y="28" font-size="15" fill="hsl(215 16% 47%)">Totale sezioni con dato disponibile</text>
    </g>
    <g transform="translate(440, 900)">
      <text font-size="18" font-weight="700" fill="hsl(222 47% 11%)">${escapeXml(
        formatCountWithShare(summary.availableCount, summary.totalCount),
      )}</text>
      <text y="28" font-size="15" fill="hsl(215 16% 47%)">Sezioni con dato</text>
    </g>
    <g transform="translate(760, 900)">
      <text font-size="18" font-weight="700" fill="hsl(222 47% 11%)">${escapeXml(
        formatCountWithShare(summary.missingCount, summary.totalCount),
      )}</text>
      <text y="28" font-size="15" fill="hsl(215 16% 47%)">Dato non disponibile</text>
    </g>
    <text x="${padding}" y="956" font-size="13" fill="hsl(215 16% 47%)">Fonte: ${escapeXml(
      `${metadata.sourceInstitution}, ${metadata.sourceDataset}, ${metadata.sourceYear}`,
    )}. Sfondo cartografico escluso dall'esportazione.</text>
  </g>
</svg>`;
}

function geometryToSvgPath(
  geometry: AtlanteGeometry,
  project: (position: AtlantePosition) => string,
) {
  if (geometry.type === "Polygon") {
    return polygonToSvgPath(geometry.coordinates, project);
  }

  return geometry.coordinates
    .map((polygon) => polygonToSvgPath(polygon, project))
    .join(" ");
}

function polygonToSvgPath(
  rings: AtlantePosition[][],
  project: (position: AtlantePosition) => string,
) {
  return rings
    .map((ring) =>
      ring.length > 0
        ? `M ${project(ring[0])} ${ring
            .slice(1)
            .map((position) => `L ${project(position)}`)
            .join(" ")} Z`
        : "",
    )
    .join(" ");
}

function roundSvgNumber(value: number) {
  return Number(value.toFixed(2));
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

function toLeafletBounds(bounds: GeographicBounds): LatLngBoundsExpression {
  return [
    [bounds.minLat, bounds.minLng],
    [bounds.maxLat, bounds.maxLng],
  ];
}

function getLeafletFeatureStyle({
  activeIndicator,
  bins,
  feature,
  hoveredSectionId,
  selectedSectionId,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  bins: ColoredDistributionBin[];
  feature: AtlanteFeature;
  hoveredSectionId: string | null;
  selectedSectionId: string | null;
}) {
  const sectionId = getSectionId(feature);
  const value = readIndicatorValue(feature, activeIndicator);
  const isHovered = sectionId === hoveredSectionId;
  const isSelected = sectionId === selectedSectionId;
  const isActive = isHovered || isSelected;
  const isMissing = value === null;

  return {
    color: isActive ? "hsl(var(--brand))" : "hsl(var(--card))",
    dashArray: isMissing ? "5 4" : undefined,
    fillColor: getChoroplethColor(value, bins),
    fillOpacity: isMissing ? 0.56 : 0.82,
    lineJoin: "round" as const,
    opacity: 1,
    weight: isSelected ? 4 : isHovered ? 3 : 1.4,
  };
}

function bindSectionLayer({
  activeIndicator,
  feature,
  layer,
  setHoveredSectionId,
  setSelectedSectionId,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  feature: AtlanteFeature;
  layer: SectionLayer;
  setHoveredSectionId: (sectionId: string | null) => void;
  setSelectedSectionId: (sectionId: string) => void;
}) {
  const sectionId = getSectionId(feature);
  const sectionLabel = getSectionPublicLabel(feature);
  const value = readIndicatorValue(feature, activeIndicator);
  const label = `${sectionLabel} (${sectionId}): ${formatAtlanteValue(
    value,
    activeIndicator.unitLabel,
  )}`;
  const interactiveLayer = layer;

  interactiveLayer.bindTooltip?.(label, {
    direction: "top",
    sticky: true,
  });
  interactiveLayer.on({
    click: () => setSelectedSectionId(sectionId),
    mouseout: () => setHoveredSectionId(null),
    mouseover: () => setHoveredSectionId(sectionId),
  });
  interactiveLayer.on("add", () => {
    const element = interactiveLayer.getElement?.();
    if (!element) {
      return;
    }

    element.setAttribute("aria-label", label);
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.addEventListener("blur", () => setHoveredSectionId(null));
    element.addEventListener("focus", () => setHoveredSectionId(sectionId));
    element.addEventListener("keydown", (event) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelectedSectionId(sectionId);
        }
      }
    });
  });
}

function computeBounds(
  collection: AtlanteFeatureCollection,
): GeographicBounds | null {
  const positions: AtlantePosition[] = [];
  for (const feature of collection.features) {
    if (feature.geometry) {
      collectPositions(feature.geometry, positions);
    }
  }

  if (positions.length === 0) {
    return null;
  }

  return positions.reduce<GeographicBounds>(
    (bounds, position) => ({
      minLng: Math.min(bounds.minLng, position[0]),
      minLat: Math.min(bounds.minLat, position[1]),
      maxLng: Math.max(bounds.maxLng, position[0]),
      maxLat: Math.max(bounds.maxLat, position[1]),
    }),
    {
      minLng: positions[0][0],
      minLat: positions[0][1],
      maxLng: positions[0][0],
      maxLat: positions[0][1],
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
