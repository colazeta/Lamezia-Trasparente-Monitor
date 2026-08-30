import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  Download,
  ExternalLink,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  ConfiscatedAssetsAtlasLayer,
  getConfiscatedAssetsCoverageLabel,
  useConfiscatedAssetsAtlasLayer,
} from "@/components/atlas/ConfiscatedAssetsAtlasLayer";
import {
  buildAtlanteDistribution,
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
import { getSpatialLayer, parseAtlasNavigation } from "@/lib/spatial";

const NO_BASEMAP_ID = "none";
const BASEMAP_PROVIDERS = [
  {
    id: "openstreetmap-standard",
    label: "Strade",
    description: "OpenStreetMap",
    urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
    opacity: 0.2,
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
    opacity: 0.28,
    maxZoom: 18,
  },
] as const;

const SCALE_COLORS = [
  "rgb(239 246 234)",
  "rgb(205 225 197)",
  "rgb(153 194 160)",
  "rgb(85 146 113)",
  "rgb(30 91 72)",
];
const EMPTY_COLOR = "hsl(82 9% 78%)";
const MAP_CANVAS_COLOR = "hsl(78 26% 94%)";
const MAP_SELECTED_STROKE = "hsl(24 74% 42%)";
const MAP_SECTION_STROKE = "hsl(96 18% 88%)";

type BasemapId =
  | (typeof BASEMAP_PROVIDERS)[number]["id"]
  | typeof NO_BASEMAP_ID;

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

export function AtlanteTerritoriale() {
  const navigationState = useMemo(
    () =>
      parseAtlasNavigation(
        typeof window === "undefined" ? "" : window.location.search,
      ),
    [],
  );
  const [loadState, setLoadState] = useState<LoadState>({
    status: "loading",
    layer: null,
    message: null,
  });
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(
    null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [selectedBasemapId, setSelectedBasemapId] = useState<BasemapId>(
    NO_BASEMAP_ID,
  );
  const [showConfiscatedAssets, setShowConfiscatedAssets] = useState(() =>
    navigationState.layerIds.includes("confiscated-assets"),
  );
  const [isDetailOpen, setDetailOpen] = useState(false);
  const focusConfiscatedAssetId =
    navigationState.entity?.entityType === "confiscated_asset"
      ? navigationState.entity.entityId
      : null;

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
    if (!selectedIndicatorId && activeIndicator) {
      setSelectedIndicatorId(activeIndicator.id);
    }
  }, [activeIndicator, selectedIndicatorId]);

  const values = useMemo(
    () =>
      activeIndicator
        ? features.map((feature) => readIndicatorValue(feature, activeIndicator))
        : [],
    [activeIndicator, features],
  );
  const summary = useMemo(() => buildAtlanteDistribution(values), [values]);
  const bounds = useMemo(
    () => (collection ? computeBounds(collection) : null),
    [collection],
  );
  const selectedFeature = selectedSectionId
    ? (features.find((feature) => getSectionId(feature) === selectedSectionId) ??
      null)
    : null;
  const hoveredFeature = hoveredSectionId
    ? (features.find((feature) => getSectionId(feature) === hoveredSectionId) ??
      null)
    : null;

  const selectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setDetailOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Atlante territoriale
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Scegli un indicatore, poi tocca un’area della mappa.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] px-2 py-3 sm:px-4 lg:px-6">
        {loadState.status === "loading" ? (
          <LoadingState />
        ) : loadState.status === "error" ? (
          <ErrorState message={loadState.message} />
        ) : !layer || !metadata || features.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {layer.dataStatus === "demo" ? <DemoNotice /> : null}

            <MapExplorer
              activeIndicator={activeIndicator}
              availableIndicators={availableIndicators}
              bounds={bounds}
              dataStatus={layer.dataStatus}
              features={features}
              focusConfiscatedAssetId={focusConfiscatedAssetId}
              hoveredFeature={hoveredFeature}
              hoveredSectionId={hoveredSectionId}
              isDetailOpen={isDetailOpen}
              metadata={metadata}
              onCloseDetail={() => setDetailOpen(false)}
              onIndicatorSelect={setSelectedIndicatorId}
              onOpenDetail={() => setDetailOpen(true)}
              onSectionSelect={selectSection}
              selectedBasemapId={selectedBasemapId}
              selectedFeature={selectedFeature}
              selectedSectionId={selectedSectionId}
              setHoveredSectionId={setHoveredSectionId}
              setSelectedBasemapId={setSelectedBasemapId}
              setShowConfiscatedAssets={setShowConfiscatedAssets}
              showConfiscatedAssets={showConfiscatedAssets}
              summary={summary}
            />

            <CoverageStrip
              dataStatus={layer.dataStatus}
              metadata={metadata}
              summary={summary}
            />
            <SourceAndLimits metadata={metadata} summary={summary} />
          </div>
        )}
      </div>
    </main>
  );
}

function MapExplorer({
  activeIndicator,
  availableIndicators,
  bounds,
  dataStatus,
  features,
  focusConfiscatedAssetId,
  hoveredFeature,
  hoveredSectionId,
  isDetailOpen,
  metadata,
  onCloseDetail,
  onIndicatorSelect,
  onOpenDetail,
  onSectionSelect,
  selectedBasemapId,
  selectedFeature,
  selectedSectionId,
  setHoveredSectionId,
  setSelectedBasemapId,
  setShowConfiscatedAssets,
  showConfiscatedAssets,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  availableIndicators: AtlanteIndicatorDefinition[];
  bounds: GeographicBounds | null;
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  features: AtlanteFeature[];
  focusConfiscatedAssetId: string | null;
  hoveredFeature: AtlanteFeature | null;
  hoveredSectionId: string | null;
  isDetailOpen: boolean;
  metadata: AtlanteLayerMetadata;
  onCloseDetail: () => void;
  onIndicatorSelect: (indicatorId: string) => void;
  onOpenDetail: () => void;
  onSectionSelect: (sectionId: string) => void;
  selectedBasemapId: BasemapId;
  selectedFeature: AtlanteFeature | null;
  selectedSectionId: string | null;
  setHoveredSectionId: (sectionId: string | null) => void;
  setSelectedBasemapId: (basemapId: BasemapId) => void;
  setShowConfiscatedAssets: (visible: boolean) => void;
  showConfiscatedAssets: boolean;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const [resetSignal, setResetSignal] = useState(0);
  const [isFullPageMap, setFullPageMap] = useState(false);
  const confiscatedAssetsState = useConfiscatedAssetsAtlasLayer(
    showConfiscatedAssets,
  );
  const confiscatedAssetsCoverage = getConfiscatedAssetsCoverageLabel(
    confiscatedAssetsState,
  );
  const censusLayerDefinition = getSpatialLayer("census-sections");
  const confiscatedAssetsDefinition = getSpatialLayer("confiscated-assets");
  const selectedBasemap =
    BASEMAP_PROVIDERS.find((provider) => provider.id === selectedBasemapId) ??
    null;
  const leafletBounds = useMemo(
    () => (bounds ? toLeafletBounds(bounds) : null),
    [bounds],
  );
  const mapData = useMemo<AtlanteFeatureCollection>(
    () => ({ type: "FeatureCollection", features }),
    [features],
  );

  if (!leafletBounds || !activeIndicator || !bounds) {
    return (
      <section className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        La mappa sarà disponibile quando almeno un indicatore territoriale sarà presente.
      </section>
    );
  }

  return (
    <section
      aria-labelledby="atlante-map-title"
      className={`overflow-hidden border border-border/80 bg-card shadow-lg ${
        isFullPageMap ? "fixed inset-0 z-[80] rounded-none" : "rounded-2xl"
      }`}
    >
      <h2 className="sr-only" id="atlante-map-title">
        Mappa
      </h2>

      <div
        className="relative w-full overflow-hidden"
        style={{ background: MAP_CANVAS_COLOR }}
      >
        <MapContainer
          attributionControl={!!selectedBasemap}
          bounds={leafletBounds}
          className={
            isFullPageMap
              ? "h-[100svh] w-full"
              : "h-[74svh] min-h-[520px] w-full sm:h-[78svh] lg:h-[calc(100svh-190px)] lg:min-h-[680px]"
          }
          maxBounds={leafletBounds}
          maxBoundsViscosity={1}
          maxZoom={selectedBasemap?.maxZoom ?? 18}
          scrollWheelZoom
          style={{ background: MAP_CANVAS_COLOR }}
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
            onEachFeature={(geoFeature, mapLayer) => {
              bindSectionLayer({
                activeIndicator,
                feature: geoFeature as unknown as AtlanteFeature,
                layer: mapLayer,
                onSectionSelect,
                setHoveredSectionId,
              });
            }}
            style={(geoFeature) =>
              getFeatureStyle({
                activeIndicator,
                feature: geoFeature as unknown as AtlanteFeature,
                hoveredSectionId,
                selectedSectionId,
                summary,
              })
            }
          />
          {showConfiscatedAssets ? (
            <ConfiscatedAssetsAtlasLayer
              focusEntityId={focusConfiscatedAssetId}
              state={confiscatedAssetsState}
            />
          ) : null}
        </MapContainer>

        <div className="absolute left-3 top-3 z-[650] w-[min(390px,calc(100%-1.5rem))] rounded-xl border border-border/80 bg-card/95 p-2.5 shadow-xl backdrop-blur">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Indicatore
            </span>
            <select
              aria-label="Indicatore mappa"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => onIndicatorSelect(event.target.value)}
              value={activeIndicator.id}
            >
              {availableIndicators.map((indicator) => (
                <option key={indicator.id} value={indicator.id}>
                  {indicator.label}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            {hoveredFeature
              ? `${getSectionPublicLabel(hoveredFeature)} · ${formatProfileValue(
                  readIndicatorValue(hoveredFeature, activeIndicator),
                  activeIndicator.unitLabel,
                )}`
              : selectedFeature
                ? `${getSectionPublicLabel(selectedFeature)} selezionata`
                : "Tocca un’area per vedere i dati."}
          </p>
        </div>

        <div className="absolute left-3 top-[118px] z-[650] w-[min(390px,calc(100%-1.5rem))] rounded-xl border border-border/80 bg-card/95 p-2.5 shadow-xl backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Livelli
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 font-medium text-foreground">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-primary"
              />
              {censusLayerDefinition?.title ?? "Sezioni censuarie"}
            </span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-medium text-foreground">
              <input
                checked={showConfiscatedAssets}
                className="h-3.5 w-3.5 accent-primary"
                onChange={(event) =>
                  setShowConfiscatedAssets(event.target.checked)
                }
                type="checkbox"
              />
              {confiscatedAssetsDefinition?.title ?? "Beni confiscati"}
            </label>
          </div>
          {showConfiscatedAssets && confiscatedAssetsCoverage ? (
            <p
              aria-live="polite"
              className={`mt-2 text-[11px] leading-4 ${
                confiscatedAssetsState.status === "error"
                  ? "font-medium text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {confiscatedAssetsCoverage}
            </p>
          ) : null}
        </div>

        <div className="absolute right-3 top-[230px] z-[650] flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-1.5 sm:top-3 sm:max-w-none">
          <label className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-card/95 px-2 text-xs font-medium text-foreground shadow-md backdrop-blur">
            <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Sfondo</span>
            <select
              aria-label="Sfondo mappa"
              className="max-w-24 bg-transparent text-xs outline-none sm:max-w-none"
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
          <UtilityButton
            label="Reimposta vista"
            onClick={() => setResetSignal((value) => value + 1)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </UtilityButton>
          <UtilityButton
            label={isFullPageMap ? "Esci dalla pagina intera" : "Pagina intera"}
            onClick={() => setFullPageMap(!isFullPageMap)}
            pressed={isFullPageMap}
          >
            {isFullPageMap ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </UtilityButton>
          <UtilityButton
            label="Scarica mappa"
            onClick={() =>
              downloadMapSvg({
                activeIndicator,
                bounds,
                dataStatus,
                features,
                metadata,
                summary,
              })
            }
          >
            <Download className="h-3.5 w-3.5" />
          </UtilityButton>
        </div>

        <MapLegend activeIndicator={activeIndicator} summary={summary} />

        {selectedFeature && isDetailOpen ? (
          <AreaDetail
            activeIndicator={activeIndicator}
            availableIndicators={availableIndicators}
            feature={selectedFeature}
            features={features}
            onClose={onCloseDetail}
            onSectionSelect={onSectionSelect}
            summary={summary}
          />
        ) : selectedFeature ? (
          <button
            className="absolute bottom-3 left-3 z-[650] max-w-[calc(100%-1.5rem)] rounded-xl border border-border/80 bg-card/95 px-3 py-2 text-left text-sm font-semibold text-foreground shadow-xl backdrop-blur hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onOpenDetail}
            type="button"
          >
            {getSectionPublicLabel(selectedFeature)} · apri dati
          </button>
        ) : null}
      </div>
    </section>
  );
}

function AreaDetail({
  activeIndicator,
  availableIndicators,
  feature,
  features,
  onClose,
  onSectionSelect,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  availableIndicators: AtlanteIndicatorDefinition[];
  feature: AtlanteFeature;
  features: AtlanteFeature[];
  onClose: () => void;
  onSectionSelect: (sectionId: string) => void;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const activeValue = readIndicatorValue(feature, activeIndicator);
  const sectionId = getSectionId(feature);
  const sectionLabel = getSectionPublicLabel(feature);

  return (
    <aside
      aria-label="Dettaglio area Atlante"
      className="absolute bottom-3 left-3 z-[670] flex max-h-[62svh] w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur sm:bottom-auto sm:left-auto sm:right-3 sm:top-14 sm:max-h-[calc(100%-4.5rem)] sm:w-[360px]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Area selezionata
          </p>
          <h2 className="mt-1 truncate font-display text-lg font-bold text-foreground">
            {sectionLabel}
          </h2>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            Sezione censuaria ISTAT {sectionId}
          </p>
        </div>
        <button
          aria-label="Chiudi dettaglio area"
          className="rounded-lg border border-border bg-background p-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 overflow-y-auto p-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-xs font-semibold text-primary">
            {activeIndicator.label}
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {formatProfileValue(activeValue, activeIndicator.unitLabel)}
          </p>
          {activeValue === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Zero è un valore reale, non un dato mancante.
            </p>
          ) : null}
        </div>

        <details className="mt-3 rounded-lg border border-border bg-background">
          <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-foreground">
            Altri indicatori
          </summary>
          <dl className="border-t border-border px-3 py-2">
            {availableIndicators
              .filter((indicator) => indicator.id !== activeIndicator.id)
              .map((indicator) => (
                <div
                  className="grid grid-cols-[1fr_auto] gap-3 border-b border-border/60 py-2 text-xs last:border-b-0"
                  key={indicator.id}
                >
                  <dt className="text-muted-foreground">{indicator.label}</dt>
                  <dd className="font-semibold text-foreground">
                    {formatProfileValue(
                      readIndicatorValue(feature, indicator),
                      indicator.unitLabel,
                    )}
                  </dd>
                </div>
              ))}
          </dl>
        </details>

        <details className="mt-2 rounded-lg border border-border bg-background">
          <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-foreground">
            Confronto con la città
          </summary>
          <dl className="grid grid-cols-2 gap-2 border-t border-border p-3 text-xs">
            <Metric label="Sezioni con dato" value={formatInteger(summary.availableCount)} />
            <Metric label="Senza dato" value={formatInteger(summary.missingCount)} />
            <Metric
              label="Minimo"
              value={formatProfileValue(summary.min, activeIndicator.unitLabel)}
            />
            <Metric
              label="Massimo"
              value={formatProfileValue(summary.max, activeIndicator.unitLabel)}
            />
          </dl>
        </details>

        <AreaSearch
          activeIndicator={activeIndicator}
          features={features}
          onSectionSelect={onSectionSelect}
        />
      </div>
    </aside>
  );
}

function AreaSearch({
  activeIndicator,
  features,
  onSectionSelect,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  features: AtlanteFeature[];
  onSectionSelect: (sectionId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      normalizedQuery
        ? features.filter((feature) =>
            `${getSectionPublicLabel(feature)} ${getSectionId(feature)}`
              .toLowerCase()
              .includes(normalizedQuery),
          )
        : [],
    [features, normalizedQuery],
  );

  return (
    <details className="mt-2 rounded-lg border border-border bg-background">
      <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-foreground">
        Cerca un’area
      </summary>
      <div className="border-t border-border p-3">
        <label className="relative block">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <span className="sr-only">Cerca sezione censuaria</span>
          <input
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome area o codice"
            type="search"
            value={query}
          />
        </label>
        {normalizedQuery ? (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
            {matches.length > 0 ? (
              matches.slice(0, 30).map((feature) => (
                <button
                  aria-label={`Seleziona ${getSectionPublicLabel(feature)}`}
                  className="grid w-full grid-cols-[1fr_auto] gap-3 border-b border-border/60 px-3 py-2 text-left text-xs last:border-b-0 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  key={getSectionId(feature)}
                  onClick={() => onSectionSelect(getSectionId(feature))}
                  type="button"
                >
                  <span className="truncate font-semibold text-foreground">
                    {getSectionPublicLabel(feature)}
                  </span>
                  <span className="text-muted-foreground">
                    {formatProfileValue(
                      readIndicatorValue(feature, activeIndicator),
                      activeIndicator.unitLabel,
                    )}
                  </span>
                </button>
              ))
            ) : (
              <p className="p-3 text-xs text-muted-foreground">
                Nessuna area trovata.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </details>
  );
}

function CoverageStrip({
  dataStatus,
  metadata,
  summary,
}: {
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  metadata: AtlanteLayerMetadata;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">
        {formatSectionCount(summary.availableCount)} con dato
      </span>
      <span>{formatSectionCount(summary.missingCount)} senza dato</span>
      <span>
        {metadata.sourceInstitution} · {metadata.sourceYear}
      </span>
      {dataStatus === "demo" ? (
        <span className="font-semibold text-warning">demo</span>
      ) : null}
    </div>
  );
}

function SourceAndLimits({
  metadata,
  summary,
}: {
  metadata: AtlanteLayerMetadata;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  return (
    <details className="rounded-lg border border-border/70 bg-muted/20 text-sm">
      <summary className="cursor-pointer list-none px-3 py-2.5 font-semibold text-foreground marker:hidden">
        Fonte e limiti
      </summary>
      <div className="grid gap-4 border-t border-border px-3 py-3 text-xs leading-5 text-muted-foreground md:grid-cols-3">
        <div>
          <p className="font-semibold text-foreground">Fonte dati</p>
          <p className="mt-1">{metadata.sourceDataset}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {metadata.sourcePages?.geometries ? (
              <a
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                href={metadata.sourcePages.geometries}
                rel="noreferrer"
                target="_blank"
              >
                Geometrie ISTAT <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
            {metadata.sourcePages?.variables ? (
              <a
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                href={metadata.sourcePages.variables}
                rel="noreferrer"
                target="_blank"
              >
                Dati ISTAT <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground">Come leggere</p>
          <p className="mt-1">
            Il colore mostra il valore dell’indicatore scelto. Un dato mancante
            resta distinto dallo zero.
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Limiti</p>
          <p className="mt-1">
            {formatInteger(summary.availableCount)} sezioni hanno un valore e{" "}
            {formatInteger(summary.missingCount)} no. La mappa non assegna
            punteggi, classifiche o giudizi alle aree.
          </p>
          {metadata.knownLimits.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {metadata.knownLimits.slice(0, 2).map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </details>
  );
}

function MapLegend({
  activeIndicator,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-[620] w-[min(250px,calc(100%-1.5rem))] rounded-xl border border-border/80 bg-card/94 p-2.5 text-[11px] text-muted-foreground shadow-lg backdrop-blur">
      <p className="truncate font-semibold text-foreground">
        {activeIndicator.label}
      </p>
      <div
        aria-label="Scala cromatica indicatore"
        className="mt-2 grid h-2.5 overflow-hidden rounded-full border border-border"
        style={{ gridTemplateColumns: `repeat(${SCALE_COLORS.length}, minmax(0,1fr))` }}
      >
        {SCALE_COLORS.map((color) => (
          <span key={color} style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between gap-3">
        <span>{formatProfileValue(summary.min, activeIndicator.unitLabel)}</span>
        <span>{formatProfileValue(summary.max, activeIndicator.unitLabel)}</span>
      </div>
      <span className="mt-1.5 inline-flex items-center gap-1.5">
        <span
          className="h-2.5 w-4 rounded-sm border border-border"
          style={{ backgroundColor: EMPTY_COLOR }}
        />
        dato non disponibile
      </span>
    </div>
  );
}

function UtilityButton({
  children,
  label,
  onClick,
  pressed,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-card/95 text-foreground shadow-md backdrop-blur hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold text-foreground">{value}</dd>
    </div>
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
    map.fitBounds(bounds, { animate: false, padding: [8, 8] });
    const timeout = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(timeout);
  }, [bounds, map]);

  useEffect(() => {
    if (resetSignal > 0) {
      map.fitBounds(bounds, { animate: true, padding: [8, 8] });
    }
  }, [bounds, map, resetSignal]);

  return null;
}

function DemoNotice() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-warning" />
      <p>Dato dimostrativo: non contiene sezioni censuarie reali e non va usato per analisi.</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
      Caricamento della mappa…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-foreground">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
      Nessun dato territoriale disponibile.
    </div>
  );
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(value);
}

function formatSectionCount(count: number) {
  return `${formatInteger(count)} ${count === 1 ? "sezione" : "sezioni"}`;
}

function formatProfileValue(value: number | null, unitLabel: string) {
  return value === null
    ? "Dato non disponibile"
    : formatAtlanteValue(value, unitLabel);
}

function toLeafletBounds(bounds: GeographicBounds): LatLngBoundsExpression {
  return [
    [bounds.minLat, bounds.minLng],
    [bounds.maxLat, bounds.maxLng],
  ];
}

function getFeatureStyle({
  activeIndicator,
  feature,
  hoveredSectionId,
  selectedSectionId,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  feature: AtlanteFeature;
  hoveredSectionId: string | null;
  selectedSectionId: string | null;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const sectionId = getSectionId(feature);
  const value = readIndicatorValue(feature, activeIndicator);
  const isHovered = sectionId === hoveredSectionId;
  const isSelected = sectionId === selectedSectionId;
  const isActive = isHovered || isSelected;

  return {
    color: isActive ? MAP_SELECTED_STROKE : MAP_SECTION_STROKE,
    dashArray: value === null ? "5 4" : undefined,
    fillColor: getContinuousColor(value, summary),
    fillOpacity: value === null ? 0.48 : isActive ? 0.88 : 0.78,
    lineJoin: "round" as const,
    opacity: 1,
    weight: isSelected ? 4.2 : isHovered ? 3 : 1.1,
  };
}

function bindSectionLayer({
  activeIndicator,
  feature,
  layer,
  onSectionSelect,
  setHoveredSectionId,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  feature: AtlanteFeature;
  layer: SectionLayer;
  onSectionSelect: (sectionId: string) => void;
  setHoveredSectionId: (sectionId: string | null) => void;
}) {
  const sectionId = getSectionId(feature);
  const label = `${getSectionPublicLabel(feature)} (${sectionId}): ${formatAtlanteValue(
    readIndicatorValue(feature, activeIndicator),
    activeIndicator.unitLabel,
  )}`;

  layer.bindTooltip?.(label, { direction: "top", sticky: true });
  layer.on({
    click: () => onSectionSelect(sectionId),
    mouseout: () => setHoveredSectionId(null),
    mouseover: () => setHoveredSectionId(sectionId),
  });
  layer.on("add", () => {
    const element = layer.getElement?.();
    if (!element) return;
    element.setAttribute("aria-label", label);
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.addEventListener("blur", () => setHoveredSectionId(null));
    element.addEventListener("focus", () => setHoveredSectionId(sectionId));
    element.addEventListener("keydown", (event) => {
      if (
        event instanceof KeyboardEvent &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        onSectionSelect(sectionId);
      }
    });
  });
}

function computeBounds(
  collection: AtlanteFeatureCollection,
): GeographicBounds | null {
  const positions: AtlantePosition[] = [];
  for (const feature of collection.features) {
    if (feature.geometry) collectPositions(feature.geometry, positions);
  }
  if (positions.length === 0) return null;

  return positions.reduce<GeographicBounds>(
    (current, position) => ({
      minLng: Math.min(current.minLng, position[0]),
      minLat: Math.min(current.minLat, position[1]),
      maxLng: Math.max(current.maxLng, position[0]),
      maxLat: Math.max(current.maxLat, position[1]),
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
    for (const ring of geometry.coordinates) positions.push(...ring);
    return;
  }
  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) positions.push(...ring);
  }
}

function getContinuousColor(
  value: number | null,
  summary: ReturnType<typeof buildAtlanteDistribution>,
) {
  if (value === null || summary.min === null || summary.max === null) {
    return EMPTY_COLOR;
  }
  if (summary.min === summary.max) {
    return SCALE_COLORS[SCALE_COLORS.length - 1];
  }

  const normalized = Math.max(
    0,
    Math.min(1, (value - summary.min) / (summary.max - summary.min)),
  );
  const scaled = normalized * (SCALE_COLORS.length - 1);
  const lowerIndex = Math.floor(scaled);
  const upperIndex = Math.min(SCALE_COLORS.length - 1, lowerIndex + 1);
  return interpolateColor(
    SCALE_COLORS[lowerIndex],
    SCALE_COLORS[upperIndex],
    scaled - lowerIndex,
  );
}

function interpolateColor(start: string, end: string, amount: number) {
  const from = parseRgb(start);
  const to = parseRgb(end);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  return `rgb(${mix(from[0], to[0])} ${mix(from[1], to[1])} ${mix(from[2], to[2])})`;
}

function parseRgb(color: string) {
  const values = color.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0] as const;
}

function downloadMapSvg({
  activeIndicator,
  bounds,
  dataStatus,
  features,
  metadata,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  bounds: GeographicBounds;
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  features: AtlanteFeature[];
  metadata: AtlanteLayerMetadata;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const width = 1200;
  const height = 820;
  const padding = 48;
  const mapHeight = 630;
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
    return `${Number(x.toFixed(2))},${Number(y.toFixed(2))}`;
  };
  const paths = features
    .map((feature) => {
      if (!feature.geometry) return "";
      const value = readIndicatorValue(feature, activeIndicator);
      return `<path d="${geometryToSvgPath(feature.geometry, project)}" fill="${getContinuousColor(
        value,
        summary,
      )}" fill-opacity="${value === null ? "0.4" : "0.8"}" stroke="hsl(0 0% 100%)" stroke-width="1"><title>${escapeXml(
        `${getSectionPublicLabel(feature)}: ${formatAtlanteValue(
          value,
          activeIndicator.unitLabel,
        )}`,
      )}</title></path>`;
    })
    .join("");
  const status =
    dataStatus === "demo" ? "Dato dimostrativo" : metadata.publicLabel;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="hsl(210 40% 98%)" />
  <text x="${padding}" y="44" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="hsl(222 47% 11%)">Atlante territoriale · Lamezia Terme</text>
  <text x="${padding}" y="72" font-family="Arial, sans-serif" font-size="16" fill="hsl(215 16% 47%)">${escapeXml(
    activeIndicator.label,
  )} · ${escapeXml(status)}</text>
  ${paths}
  <text x="${padding}" y="760" font-family="Arial, sans-serif" font-size="14" fill="hsl(215 25% 27%)">${escapeXml(
    `Fonte: ${metadata.sourceInstitution}, ${metadata.sourceYear}. ${formatSectionCount(
      summary.availableCount,
    )} con dato; ${formatSectionCount(summary.missingCount)} senza dato.`,
  )}</text>
</svg>`;

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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
