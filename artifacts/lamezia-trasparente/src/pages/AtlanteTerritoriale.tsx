import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  BarChart3,
  Database,
  Download,
  Layers,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Table2,
  X,
} from "lucide-react";
import {
  ATLANTE_INDICATOR_CATEGORIES,
  buildAtlanteDistribution,
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
    opacity: 0.18,
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
    opacity: 0.26,
    maxZoom: 18,
  },
] as const;
const CHOROPLETH_COLORS = [
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

type ColoredDistributionBin = AtlanteDistributionBin & {
  color: string;
};

type DetailView = "profile" | "data";

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
  const [isIndicatorSidebarOpen, setIndicatorSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 900;
    }
    return true;
  });
  const [isDetailPanelOpen, setDetailPanelOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 900;
    }
    return true;
  });
  const [detailView, setDetailView] = useState<DetailView>("profile");
  const [selectedBasemapId, setSelectedBasemapId] = useState<BasemapId>(
    NO_BASEMAP_ID,
  );

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
    () => colorDistributionBins(distribution.bins, distribution),
    [distribution],
  );
  const bounds = useMemo(
    () => (collection ? computeBounds(collection) : null),
    [collection],
  );
  const activeSectionId = hoveredSectionId ?? selectedSectionId;
  const activeFeature = activeSectionId
    ? (features.find((feature) => getSectionId(feature) === activeSectionId) ??
      null)
    : null;
  const activeValue =
    activeFeature && activeIndicator
      ? readIndicatorValue(activeFeature, activeIndicator)
      : null;

  return (
    <main className="min-h-screen w-[100vw] max-w-[100vw] overflow-x-hidden bg-background text-foreground">
      <Header />

      <section className="mx-auto min-w-0 w-full max-w-[100vw] px-2 py-3 sm:px-4 lg:px-5 2xl:px-6">
        {loadState.status === "loading" ? (
          <LoadingState />
        ) : loadState.status === "error" ? (
          <ErrorState message={loadState.message} />
        ) : !layer || features.length === 0 || !metadata ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {layer.dataStatus === "demo" ? <DemoNotice /> : null}
            <MapSurface
              activeIndicator={activeIndicator}
              activeFeature={activeFeature}
              activeValue={activeValue}
              availableIndicators={availableIndicators}
              bounds={bounds}
              coloredBins={coloredBins}
              dataStatus={layer.dataStatus}
              detailView={detailView}
              features={features}
              hoveredSectionId={hoveredSectionId}
              isDetailPanelOpen={isDetailPanelOpen}
              isIndicatorSidebarOpen={isIndicatorSidebarOpen}
              metadata={metadata}
              onDetailViewChange={setDetailView}
              onIndicatorSelect={setSelectedIndicatorId}
              selectedBasemapId={selectedBasemapId}
              selectedSectionId={selectedSectionId}
              setDetailPanelOpen={setDetailPanelOpen}
              setIndicatorSidebarOpen={setIndicatorSidebarOpen}
              setSelectedBasemapId={setSelectedBasemapId}
              setHoveredSectionId={setHoveredSectionId}
              setSelectedSectionId={setSelectedSectionId}
              summary={distribution}
            />
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
    <section className="w-full max-w-[100vw] overflow-x-hidden border-b border-border bg-card/95">
      <div className="mx-auto flex w-full min-w-0 max-w-none flex-col gap-2 px-3 py-3 sm:px-5 lg:px-6 xl:flex-row xl:items-end xl:justify-between 2xl:px-8">
        <div className="min-w-0 max-w-5xl">
          <h1 className="text-2xl font-display font-bold leading-tight text-foreground sm:text-3xl">
            Atlante territoriale
          </h1>
          <p className="mt-1 max-w-4xl break-words text-sm leading-6 text-muted-foreground sm:text-base">
            Esplora il territorio di Lamezia attraverso una mappa interattiva.
            Scegli un indicatore e confronta le diverse aree della città.
          </p>
        </div>
        <p className="min-w-0 max-w-2xl break-words text-xs leading-5 text-muted-foreground sm:text-sm xl:text-right">
            Le sezioni censuarie sono piccole aree statistiche usate per leggere
            il territorio in modo più dettagliato del livello comunale.
          </p>
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

function ActiveContextStrip({
  activeFeature,
  activeIndicator,
  dataStatus,
  metadata,
  selectedBasemapId,
  summary,
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  metadata: AtlanteLayerMetadata;
  selectedBasemapId: BasemapId;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const sectionLabel = activeFeature
    ? getSectionPublicLabel(activeFeature)
    : "Nessuna area selezionata";
  const coverageLabel =
    summary.totalCount > 0
      ? `${formatSectionCount(summary.availableCount)} con dato`
      : "Nessun dato disponibile";
  const missingLabel =
    summary.totalCount > 0
      ? `${formatSectionCount(summary.missingCount)} senza dato`
      : "";

  const items = [
    {
      label: "Base",
      value:
        dataStatus === "demo"
          ? "demo esplicito"
          : `${formatInteger(summary.totalCount)} sezioni ISTAT`,
    },
    {
      label: "Indicatore",
      value: activeIndicator?.label ?? "Indicatore in preparazione",
    },
    {
      label: "Copertura dati",
      value: missingLabel
        ? `${coverageLabel} · ${missingLabel}`
        : coverageLabel,
    },
    {
      label: "Selezione",
      value: sectionLabel,
    },
    {
      label: "Sfondo",
      value: getBasemapDisplayName(selectedBasemapId),
    },
    {
      label: "Fonte",
      value: `${metadata.sourceInstitution} · ${metadata.sourceYear}`,
    },
  ];

  return (
    <section
      aria-label="Contesto mappa"
      className="overflow-hidden rounded-xl border border-border/80 bg-card/75 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <h2 className="text-sm font-semibold text-foreground">
          Contesto mappa
        </h2>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          Esplora e confronta
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-2 px-3 pb-3 sm:grid-cols-3 sm:px-4 xl:grid-cols-6">
        {items.map((item) => (
          <div
            className="rounded-lg border border-border/60 bg-background/85 px-3 py-2"
            key={item.label}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function IndicatorSidebar({
  activeFeature,
  activeIndicator,
  availableIndicators,
  dataStatus,
  metadata,
  onClose,
  onSelect,
  selectedBasemapId,
  summary,
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  availableIndicators: AtlanteIndicatorDefinition[];
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  metadata: AtlanteLayerMetadata;
  onClose: () => void;
  onSelect: (indicatorId: string) => void;
  selectedBasemapId: BasemapId;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const entries = ATLANTE_INDICATOR_CATEGORIES.map((category) => ({
    category,
    indicators: availableIndicators.filter(
      (candidate) => candidate.categoryId === category.id,
    ),
  }));
  const orderedEntries = [
    ...entries.filter((entry) => entry.indicators.length > 0),
    ...entries.filter((entry) => entry.indicators.length === 0),
  ];
  const sectionLabel = activeFeature
    ? getSectionPublicLabel(activeFeature)
    : "Nessuna area selezionata";
  const coverageLabel =
    summary.totalCount > 0
      ? `${formatSectionCount(summary.availableCount)} con dato`
      : "Nessun dato disponibile";
  const missingLabel =
    summary.totalCount > 0
      ? `${formatSectionCount(summary.missingCount)} senza dato`
      : "";

  return (
    <aside
      aria-label="Indicatori Atlante territoriale"
      className="absolute inset-y-3 left-3 z-[650] flex w-[min(370px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 text-foreground shadow-2xl ring-1 ring-border/60 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/80 px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Database className="h-4 w-4" />
            Indicatori
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-tight text-foreground">
            Scegli cosa leggere
          </h2>
        </div>
        <button
          aria-label="Chiudi barra indicatori"
          className="rounded-md border border-border/80 bg-background p-2 text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-border/80 bg-muted/45 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            {activeIndicator
              ? getIndicatorKindLabel(activeIndicator)
              : "indicatore"}
          </span>
          {dataStatus === "demo" ? (
            <span className="rounded-full bg-warning/20 px-2.5 py-1 text-xs font-semibold text-warning">
              demo
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {activeIndicator?.label ?? "Indicatore in preparazione"}
        </p>
        {activeIndicator ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {activeIndicator.publicHint}
          </p>
        ) : null}
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-border/70 bg-background px-2.5 py-2">
            <dt className="font-semibold text-muted-foreground">Copertura</dt>
            <dd className="mt-0.5 font-semibold text-foreground">
              {coverageLabel}
            </dd>
          </div>
          <div className="rounded-lg border border-border/70 bg-background px-2.5 py-2">
            <dt className="font-semibold text-muted-foreground">Selezione</dt>
            <dd className="mt-0.5 truncate font-semibold text-foreground">
              {sectionLabel}
            </dd>
          </div>
        </dl>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-2">
          {orderedEntries.map(({ category, indicators }) => {
            const hasIndicators = indicators.length > 0;
            return (
              <section
                className={`rounded-xl border px-3 py-2.5 ${
                  hasIndicators
                    ? "border-border/70 bg-background/85"
                    : "border-border/60 bg-muted/45 text-muted-foreground"
                }`}
                key={category.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {category.label}
                  </h3>
                  {!hasIndicators ? (
                    <span className="rounded-full bg-background px-2 py-0.5 text-[11px] leading-none text-muted-foreground">
                      in preparazione
                    </span>
                  ) : null}
                </div>
                {hasIndicators ? (
                  <div className="mt-2 grid gap-1.5">
                    {indicators.map((indicator) => {
                      const isActive = indicator.id === activeIndicator?.id;
                      return (
                        <button
                          aria-pressed={isActive}
                          className={`grid min-h-11 grid-cols-[1fr_auto] items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border/70 bg-card text-foreground hover:border-primary/40 hover:bg-muted"
                          }`}
                          key={indicator.id}
                          onClick={() => onSelect(indicator.id)}
                          title={indicator.publicHint}
                          type="button"
                        >
                          <span>{indicator.label}</span>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] leading-none ${
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {getIndicatorKindLabel(indicator)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/80 bg-muted/45 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <p>
          {metadata.sourceInstitution} / {metadata.sourceYear} /{" "}
          {metadata.territorialLevel}
        </p>
        <p className="mt-1">
          Sfondo: {getBasemapDisplayName(selectedBasemapId)}.{" "}
          {missingLabel ? `${missingLabel}.` : ""}
        </p>
      </div>
    </aside>
  );
}

function CitySummaryCard({
  activeIndicator,
  coloredBins,
  summary,
  surface = "light",
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  coloredBins: ColoredDistributionBin[];
  summary: ReturnType<typeof buildAtlanteDistribution>;
  surface?: "light" | "dark";
}) {
  const isDark = surface === "dark";
  const cardClass = isDark
    ? "rounded-xl border border-background/10 bg-background/10 p-3 shadow-sm"
    : "rounded-lg border border-border/80 bg-card/80 p-3 shadow-sm";
  const mutedClass = isDark ? "text-slate-300" : "text-muted-foreground";
  const strongClass = isDark ? "text-background" : "text-foreground";
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
    <section className={cardClass}>
      <div className="flex items-start gap-2">
        <BarChart3
          className={`mt-0.5 h-4 w-4 flex-none ${
            isDark ? "text-emerald-200" : "text-primary"
          }`}
        />
        <div>
          <h2 className={`text-base font-semibold ${strongClass}`}>
            Sintesi città
          </h2>
        </div>
      </div>

      {isPopulationIndicator ? (
        <div
          className={`mt-3 rounded-md p-3 ${
            isDark ? "bg-foreground/20" : "bg-background"
          }`}
        >
          <p className={`text-xs font-medium ${mutedClass}`}>
            Popolazione totale nelle sezioni con P1 disponibile
          </p>
          <p className={`mt-1 text-2xl font-bold leading-tight ${strongClass}`}>
            {formatSummaryValue(summary.sum, unitLabel)}
          </p>
        </div>
      ) : null}

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <dt className={`text-xs ${mutedClass}`}>{label}</dt>
            <dd className={`text-sm font-semibold ${strongClass}`}>{value}</dd>
          </div>
        ))}
      </dl>

      {coloredBins.length > 0 ? (
        <DistributionBands
          bins={coloredBins}
          summary={summary}
          surface={surface}
        />
      ) : null}

      <div className={`mt-3 space-y-1 text-xs leading-5 ${mutedClass}`}>
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
  surface = "light",
}: {
  bins: ColoredDistributionBin[];
  summary: ReturnType<typeof buildAtlanteDistribution>;
  surface?: "light" | "dark";
}) {
  const isDark = surface === "dark";
  const mutedClass = isDark ? "text-slate-300" : "text-muted-foreground";
  const strongClass = isDark ? "text-background" : "text-foreground";

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <h3
          className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}
        >
          Distribuzione per fasce
        </h3>
        <span className={`text-[11px] font-medium ${mutedClass}`}>
          {formatInteger(bins.length)} classi
        </span>
      </div>
      <div
        aria-label="Distribuzione delle sezioni per fascia"
        className={`mt-2 grid h-4 overflow-hidden rounded-lg border ${
          isDark ? "border-background/10 bg-background/10" : "border-border bg-muted"
        }`}
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, bins.length)}, minmax(0, 1fr))`,
        }}
      >
        {bins.map((bin) => (
          <span
            aria-hidden="true"
            className="border-r border-background/80 last:border-r-0"
            key={bin.index}
            style={{
              backgroundColor: bin.color,
            }}
          />
        ))}
      </div>
      <ol className="mt-3 grid gap-2 text-xs leading-5">
        {bins.map((bin) => (
          <li
            className={`grid grid-cols-[auto_1fr] gap-x-2 rounded-md border px-2.5 py-2 ${
              isDark
                ? "border-background/10 bg-foreground/20"
                : "border-border/70 bg-background"
            }`}
            key={bin.index}
          >
            <span
              aria-hidden="true"
              className="mt-1 h-3 w-3 rounded-sm border border-border"
              style={{ backgroundColor: bin.color }}
            />
            <span>
              <span className={`font-semibold ${strongClass}`}>
                {formatDistributionBandName(bin.index, bins.length)}
              </span>
              <span className={mutedClass}> · {bin.label}</span>
              <span className={`block ${mutedClass}`}>
                {formatSectionCount(bin.count)} ·{" "}
                {formatPercentage(bin.count, summary.availableCount)} delle
                sezioni con dato
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MapSurface({
  activeIndicator,
  activeFeature,
  activeValue,
  availableIndicators,
  bounds,
  coloredBins,
  dataStatus,
  detailView,
  features,
  hoveredSectionId,
  isDetailPanelOpen,
  isIndicatorSidebarOpen,
  metadata,
  onDetailViewChange,
  onIndicatorSelect,
  selectedBasemapId,
  selectedSectionId,
  setDetailPanelOpen,
  setIndicatorSidebarOpen,
  setSelectedBasemapId,
  setHoveredSectionId,
  setSelectedSectionId,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  activeFeature: AtlanteFeature | null;
  activeValue: number | null;
  availableIndicators: AtlanteIndicatorDefinition[];
  bounds: GeographicBounds | null;
  coloredBins: ColoredDistributionBin[];
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  detailView: DetailView;
  features: AtlanteFeature[];
  hoveredSectionId: string | null;
  isDetailPanelOpen: boolean;
  isIndicatorSidebarOpen: boolean;
  metadata: AtlanteLayerMetadata;
  onDetailViewChange: (view: DetailView) => void;
  onIndicatorSelect: (indicatorId: string) => void;
  selectedBasemapId: BasemapId;
  selectedSectionId: string | null;
  setDetailPanelOpen: (isOpen: boolean) => void;
  setIndicatorSidebarOpen: (isOpen: boolean) => void;
  setSelectedBasemapId: (basemapId: BasemapId) => void;
  setHoveredSectionId: (sectionId: string | null) => void;
  setSelectedSectionId: (sectionId: string) => void;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const [resetSignal, setResetSignal] = useState(0);
  const [isFullPageMap, setFullPageMap] = useState(false);
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
    <section
      aria-labelledby="atlante-map-title"
      className={`w-full min-w-0 max-w-full overflow-hidden border border-border/80 bg-card shadow-xl ring-1 ring-border/60 transition-all ${
        isFullPageMap
          ? "fixed inset-0 z-[80] rounded-none"
          : "rounded-2xl"
      }`}
    >
      <h2 className="sr-only" id="atlante-map-title">
        Mappa
      </h2>
      {!leafletBounds || !activeIndicator ? (
        <div className="flex min-h-80 items-center justify-center rounded-md bg-muted p-6 text-center text-sm text-muted-foreground">
          La mappa sarà disponibile quando almeno un indicatore censuario sarà
          presente nel file dati.
        </div>
      ) : (
        <div
          className="relative w-full max-w-full overflow-hidden"
          style={{ background: MAP_CANVAS_COLOR }}
        >
          <MapContainer
            attributionControl={!!selectedBasemap}
            bounds={leafletBounds}
            className={`w-full ${
              isFullPageMap
                ? "h-[100svh]"
                : "h-[78svh] min-h-[560px] sm:h-[82svh] lg:h-[calc(100svh-132px)] lg:min-h-[740px] 2xl:min-h-[860px]"
            }`}
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
                  feature: geoFeature as unknown as AtlanteFeature,
                  hoveredSectionId,
                  selectedSectionId,
                  summary,
                })
              }
            />
          </MapContainer>

          {isIndicatorSidebarOpen ? (
            <IndicatorSidebar
              activeFeature={activeFeature}
              activeIndicator={activeIndicator}
              availableIndicators={availableIndicators}
              dataStatus={dataStatus}
              metadata={metadata}
              onClose={() => setIndicatorSidebarOpen(false)}
              onSelect={onIndicatorSelect}
              selectedBasemapId={selectedBasemapId}
              summary={summary}
            />
          ) : (
            <button
              aria-expanded="false"
              aria-label="Apri barra indicatori"
              className="absolute left-3 top-3 z-[650] inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card/95 px-3 py-2 text-sm font-semibold text-foreground shadow-lg backdrop-blur transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setIndicatorSidebarOpen(true)}
              type="button"
            >
              <PanelLeftOpen className="h-4 w-4 text-primary" />
              <span aria-hidden="true">Indicatori</span>
            </button>
          )}

          <div className="pointer-events-none absolute left-3 top-16 z-[500] w-[calc(100vw-1.5rem)] max-w-[calc(100%-1.5rem)] sm:left-auto sm:right-3 sm:top-3 sm:w-auto">
            <div className="pointer-events-auto grid w-full min-w-0 grid-cols-2 gap-2 rounded-xl border border-border/80 bg-card/95 p-2 text-xs text-foreground shadow-xl backdrop-blur sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
              <label className="col-span-2 grid min-w-0 grid-cols-[auto_1fr] items-center gap-2 font-medium text-foreground sm:col-span-1 sm:inline-flex">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Layers className="h-4 w-4 flex-none text-primary" />
                  <span className="hidden sm:inline">Sfondo mappa</span>
                </span>
                <select
                  aria-label="Sfondo mappa"
                  className="min-w-0 rounded-md border border-border/80 bg-background px-2 py-1 text-xs text-foreground sm:w-auto"
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
                aria-label="Reimposta vista"
                className="min-w-0 rounded-md border border-border/80 bg-background px-2.5 py-1.5 text-center font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setResetSignal((current) => current + 1)}
                type="button"
              >
                <span className="sm:hidden">Reset</span>
                <span className="hidden sm:inline">Reimposta vista</span>
              </button>
              <button
                aria-label={
                  isFullPageMap
                    ? "Esci dalla pagina intera"
                    : "Pagina intera"
                }
                aria-pressed={isFullPageMap}
                className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md border border-border/80 bg-background px-2.5 py-1.5 font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setFullPageMap(!isFullPageMap)}
                type="button"
              >
                {isFullPageMap ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
                <span className="sm:hidden">
                  {isFullPageMap ? "Esci" : "Piena"}
                </span>
                <span className="hidden sm:inline">
                  {isFullPageMap
                    ? "Esci dalla pagina intera"
                    : "Pagina intera"}
                </span>
              </button>
              <button
                aria-expanded={isIndicatorSidebarOpen}
                aria-label={
                  isIndicatorSidebarOpen
                    ? "Nascondi barra indicatori"
                    : "Mostra barra indicatori"
                }
                className="hidden rounded-md border border-border/80 bg-background px-2.5 py-1.5 font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:inline-flex lg:items-center lg:gap-1.5"
                onClick={() =>
                  setIndicatorSidebarOpen(!isIndicatorSidebarOpen)
                }
                type="button"
              >
                {isIndicatorSidebarOpen ? (
                  <PanelLeftClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelLeftOpen className="h-3.5 w-3.5" />
                )}
                <span aria-hidden="true">
                  {isIndicatorSidebarOpen ? "Nascondi indicatori" : "Indicatori"}
                </span>
              </button>
              <button
                aria-expanded={isDetailPanelOpen}
                aria-label={
                  isDetailPanelOpen
                    ? "Nascondi dettaglio area"
                    : "Mostra dettaglio area"
                }
                className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md border border-border/80 bg-background px-2.5 py-1.5 font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setDetailPanelOpen(!isDetailPanelOpen)}
                type="button"
              >
                {isDetailPanelOpen ? (
                  <PanelRightClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelRightOpen className="h-3.5 w-3.5" />
                )}
                <span aria-hidden="true">Dettaglio</span>
              </button>
              <button
                aria-label="Scarica mappa"
                className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md border border-border/80 bg-background px-2.5 py-1.5 font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                <span className="hidden sm:inline">Scarica mappa</span>
              </button>
            </div>
          </div>

          {isDetailPanelOpen ? (
            <DetailDrawer
              activeFeature={activeFeature}
              activeIndicator={activeIndicator}
              activeValue={activeValue}
              availableIndicators={availableIndicators}
              coloredBins={coloredBins}
              detailView={detailView}
              features={features}
              onClose={() => setDetailPanelOpen(false)}
              onDetailViewChange={onDetailViewChange}
              onSectionSelect={setSelectedSectionId}
              selectedSectionId={selectedSectionId}
              summary={summary}
            />
          ) : (
            <button
              aria-label="Apri pannello dettaglio area"
              className="absolute bottom-3 left-3 right-3 z-[650] inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/95 px-3 py-2 text-center text-sm font-semibold text-foreground shadow-xl backdrop-blur transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:left-auto sm:w-auto sm:max-w-[min(360px,calc(100%-1.5rem))] sm:text-left"
              onClick={() => setDetailPanelOpen(true)}
              type="button"
            >
              <PanelRightOpen className="h-4 w-4 flex-none text-primary" />
              <span>
                {activeFeature
                  ? `Dettaglio: ${getSectionPublicLabel(activeFeature)}`
                  : "Apri dettaglio area"}
              </span>
            </button>
          )}

          <div className="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-[min(420px,calc(100%-1.5rem))] rounded-xl border border-border/80 bg-card/90 px-3 py-2 text-xs leading-5 text-muted-foreground shadow-xl backdrop-blur">
            <span className="font-semibold text-foreground">
              {metadata.sourceInstitution}
            </span>{" "}
            / {metadata.sourceYear} / {metadata.territorialLevel}
          </div>

          <MapLegend
            activeIndicator={activeIndicator}
            bins={coloredBins}
            className={`pointer-events-auto absolute z-[500] w-[min(320px,calc(100vw-2rem))] max-w-[calc(100%-1.5rem)] ${
              isDetailPanelOpen
                ? "bottom-3 left-3 mb-16 sm:left-auto sm:right-[410px] sm:mb-0"
                : "bottom-16 left-3 sm:left-auto sm:right-3"
            }`}
            summary={summary}
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

function MapLegend({
  activeIndicator,
  bins,
  className,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  bins: ColoredDistributionBin[];
  className?: string;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  return (
    <div
      className={`grid gap-2 rounded-lg border border-border/90 bg-card/95 p-2 text-xs text-muted-foreground shadow-sm backdrop-blur ${className ?? ""}`}
    >
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
          Fasce indicatore
        </p>
        <div
          aria-label="Fasce cromatiche indicatore"
          className="grid h-3 w-56 max-w-full overflow-hidden rounded-full border border-border"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, bins.length)}, minmax(0, 1fr))`,
          }}
        >
          {bins.map((bin) => (
            <span
              aria-hidden="true"
              className="border-r border-background/80 last:border-r-0"
              key={bin.index}
              style={{ backgroundColor: bin.color }}
            />
          ))}
        </div>
        <div className="mt-1 grid gap-1 text-[11px] sm:flex sm:justify-between sm:gap-3">
          <span>
            Valore minimo{" "}
            {formatSummaryValue(summary.min, activeIndicator.unitLabel)}
          </span>
          <span>
            Valore massimo{" "}
            {formatSummaryValue(summary.max, activeIndicator.unitLabel)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {bins.map((bin) => (
          <span className="inline-flex items-center gap-1.5" key={bin.index}>
            <span
              aria-hidden="true"
              className="h-3 w-5 rounded-sm border border-border"
              style={{ backgroundColor: bin.color }}
            />
            {formatDistributionBandName(bin.index, bins.length)}
          </span>
        ))}
      </div>
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
function DetailDrawer({
  activeFeature,
  activeIndicator,
  activeValue,
  availableIndicators,
  coloredBins,
  detailView,
  features,
  onClose,
  onDetailViewChange,
  onSectionSelect,
  selectedSectionId,
  summary,
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  activeValue: number | null;
  availableIndicators: AtlanteIndicatorDefinition[];
  coloredBins: ColoredDistributionBin[];
  detailView: DetailView;
  features: AtlanteFeature[];
  onClose: () => void;
  onDetailViewChange: (view: DetailView) => void;
  onSectionSelect: (sectionId: string) => void;
  selectedSectionId: string | null;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const views: Array<{
    id: DetailView;
    label: string;
    icon: typeof MapIcon;
  }> = [
    { id: "profile", label: "Scheda", icon: MapIcon },
    { id: "data", label: "Dati", icon: Table2 },
  ];

  return (
    <aside
      aria-label="Dettaglio area Atlante"
      className="absolute bottom-3 left-3 z-[660] flex w-[calc(100vw-1.5rem)] max-w-[calc(100%-1.5rem)] max-h-[62svh] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 text-foreground shadow-2xl ring-1 ring-border/60 backdrop-blur-xl sm:left-auto sm:right-3 sm:top-3 sm:w-[390px] sm:max-h-[calc(100%-1.5rem)]"
    >
      <div className="border-b border-border/80 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Atlante
            </p>
            <h2 className="mt-1 text-lg font-semibold leading-tight text-foreground">
              Dettaglio area
            </h2>
          </div>
          <button
            aria-label="Chiudi pannello dettaglio area"
            className="rounded-md border border-border/80 bg-background p-2 text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          aria-label="Viste dettaglio Atlante"
          className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-border/80 bg-muted/50 p-1"
          role="tablist"
        >
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = detailView === view.id;
            return (
              <button
                aria-selected={isActive}
                className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-background"
                }`}
                key={view.id}
                onClick={() => onDetailViewChange(view.id)}
                role="tab"
                type="button"
              >
                <Icon className="h-4 w-4" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {detailView === "profile" ? (
          <div className="space-y-3">
            <SectionProfileCard
              activeFeature={activeFeature}
              activeIndicator={activeIndicator}
              activeValue={activeValue}
              availableIndicators={availableIndicators}
            />
            <CitySummaryCard
              activeIndicator={activeIndicator}
              coloredBins={coloredBins}
              summary={summary}
            />
          </div>
        ) : (
          <SectionDataBrowser
            activeIndicator={activeIndicator}
            features={features}
            onSectionSelect={onSectionSelect}
            selectedSectionId={selectedSectionId}
            summary={summary}
          />
        )}
      </div>
    </aside>
  );
}

function SectionDataBrowser({
  activeIndicator,
  features,
  onSectionSelect,
  selectedSectionId,
  summary,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  features: AtlanteFeature[];
  onSectionSelect: (sectionId: string) => void;
  selectedSectionId: string | null;
  summary: ReturnType<typeof buildAtlanteDistribution>;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleFeatures = useMemo(
    () =>
      features.filter((feature) => {
        if (!normalizedQuery) {
          return true;
        }
        return `${getSectionPublicLabel(feature)} ${getSectionId(feature)}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [features, normalizedQuery],
  );
  const maxValue = summary.max ?? 0;

  if (!activeIndicator) {
    return (
      <p className="rounded-xl border border-border/70 bg-muted/45 p-3 text-sm leading-6 text-muted-foreground">
        La vista dati sara disponibile quando un indicatore censuario sara
        attivo.
      </p>
    );
  }

  return (
    <section aria-label="Vista dati sezioni" className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Vista dati</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Righe leggibili per sezione censuaria, nello stesso ordine del livello
          ISTAT. I valori mancanti restano separati da zero.
        </p>
      </div>

      <label className="relative block">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <span className="sr-only">Cerca sezione censuaria</span>
        <input
          className="w-full rounded-lg border border-border/80 bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca area o codice"
          type="search"
          value={query}
        />
      </label>

      <div className="rounded-xl border border-border/80 bg-card">
        <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-border/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{formatSectionCount(visibleFeatures.length)}</span>
          <span>{activeIndicator.label}</span>
        </div>
        <div className="max-h-[46svh] overflow-y-auto">
          {visibleFeatures.length > 0 ? (
            visibleFeatures.map((feature) => {
              const sectionId = getSectionId(feature);
              const value = readIndicatorValue(feature, activeIndicator);
              const label = getSectionPublicLabel(feature);
              const isSelected = sectionId === selectedSectionId;
              const barWidth =
                value !== null && maxValue > 0
                  ? Math.max(2, Math.min(100, (value / maxValue) * 100))
                  : 0;

              return (
                <button
                  aria-label={`Seleziona ${label}`}
                  className={`grid w-full gap-2 border-b border-border/70 px-3 py-2 text-left transition last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected ? "bg-primary/10" : "hover:bg-muted/60"
                  }`}
                  key={sectionId}
                  onClick={() => onSectionSelect(sectionId)}
                  type="button"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {label}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {sectionId}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {formatProfileValue(value, activeIndicator.unitLabel)}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="block h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <span
                      className={`block h-full rounded-full ${
                        value === null ? "bg-transparent" : "bg-primary"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </span>
                </button>
              );
            })
          ) : (
            <p className="p-3 text-sm text-muted-foreground">
              Nessuna sezione corrisponde alla ricerca.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionProfileCard({
  activeFeature,
  activeIndicator,
  activeValue,
  availableIndicators,
  surface = "light",
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  activeValue: number | null;
  availableIndicators: AtlanteIndicatorDefinition[];
  surface?: "light" | "dark";
}) {
  const isDark = surface === "dark";
  const cardClass = isDark
    ? "rounded-xl border border-background/10 bg-background/10 p-3 shadow-sm"
    : "rounded-lg border border-border/80 bg-card/80 p-3 shadow-sm xl:sticky xl:top-4";
  const eyebrowClass = isDark
    ? "text-xs font-semibold uppercase tracking-wide text-emerald-200"
    : "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  const titleClass = isDark
    ? "mt-1 break-words text-xl font-semibold text-background"
    : "mt-1 break-words text-xl font-semibold text-foreground";
  const mutedClass = isDark ? "text-slate-300" : "text-muted-foreground";
  const strongClass = isDark ? "text-background" : "text-foreground";

  if (!activeFeature) {
    return (
      <section className={cardClass}>
        <p className={eyebrowClass}>
          Sezione selezionata
        </p>
        <h2 className={titleClass}>
          Nessuna sezione selezionata
        </h2>
        <p className={`mt-3 text-sm leading-6 ${mutedClass}`}>
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
    <section className={cardClass}>
      <div>
        <p className={eyebrowClass}>
          Sezione selezionata
        </p>
        <h2 className={titleClass}>
          {sectionLabel}
        </h2>
        <p className={`mt-1 break-words text-xs ${mutedClass}`}>
          Sezione censuaria ISTAT: {sectionId}
        </p>
      </div>

      <div
        className={`mt-4 rounded-md p-3 ${
          isDark ? "bg-emerald-300/12" : "bg-primary/10"
        }`}
      >
        <p
          className={`text-xs font-semibold ${
            isDark ? "text-emerald-200" : "text-primary"
          }`}
        >
          {activeIndicator?.label ?? "Indicatore in preparazione"}
        </p>
        <p className={`mt-1 text-2xl font-bold leading-tight ${strongClass}`}>
          {valueLabel}
        </p>
      </div>

      <dl
        className={`mt-4 divide-y ${
          isDark ? "divide-white/10" : "divide-border"
        }`}
      >
        {profileRows.length > 0 ? (
          profileRows.map((row) => (
            <div className="grid gap-1 py-2" key={row.id}>
              <dt className={`text-sm font-medium ${mutedClass}`}>
                {row.label}
              </dt>
              <dd className={`text-sm font-semibold ${strongClass}`}>
                {row.value}
              </dd>
            </div>
          ))
        ) : (
          <div className={`p-3 text-sm ${mutedClass}`}>
            Nessun altro indicatore disponibile per questa sezione.
          </div>
        )}
      </dl>

      <div className={`mt-3 text-xs leading-5 ${mutedClass}`}>
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
  surface = "light",
}: {
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  metadata: AtlanteLayerMetadata;
  summary: ReturnType<typeof buildAtlanteDistribution>;
  surface?: "light" | "dark";
}) {
  const isDark = surface === "dark";
  const sectionClass = isDark
    ? "rounded-xl border border-background/10 bg-background/10 p-3 text-xs leading-5 text-slate-300"
    : "border-t border-border pt-4 text-sm leading-6 text-muted-foreground";
  const titleClass = isDark
    ? "font-semibold text-background"
    : "font-semibold text-foreground";
  const linkClass = isDark
    ? "text-emerald-200 underline-offset-4 hover:underline"
    : "text-primary underline-offset-4 hover:underline";
  const gridClass = isDark
    ? "grid gap-3"
    : "grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]";

  return (
    <section className={sectionClass}>
      <div className={gridClass}>
        <div>
          <h2 className={titleClass}>Fonte dati</h2>
          <ul className="mt-1 space-y-1">
            <li>
              {metadata.sourcePages?.geometries ? (
                <a
                  className={linkClass}
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
                  className={linkClass}
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
          <h2 className={titleClass}>Come leggere</h2>
          <p className="mt-1">
            Il colore evidenzia l'indicatore scelto. "Dato non disponibile" non
            significa zero.
          </p>
        </div>
        <div>
          <h2 className={titleClass}>Cosa non mostra</h2>
          <p className="mt-1">
            La mappa non assegna punteggi, classifiche o giudizi alle aree.
          </p>
        </div>
      </div>
      <details className="mt-3 text-xs leading-5">
        <summary className={`cursor-pointer font-medium ${isDark ? "text-background" : "text-foreground"}`}>
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

function getBasemapDisplayName(basemapId: BasemapId) {
  if (basemapId === NO_BASEMAP_ID) {
    return "Senza sfondo";
  }

  const provider = BASEMAP_PROVIDERS.find(
    (candidate) => candidate.id === basemapId,
  );
  return provider ? `${provider.label} · ${provider.description}` : "Sfondo";
}

function getIndicatorKindLabel(indicator: AtlanteIndicatorDefinition) {
  if (indicator.valueKind === "densita") {
    return "densita";
  }
  if (indicator.valueKind === "quota") {
    return "quota";
  }
  if (indicator.valueKind === "rapporto") {
    return "rapporto";
  }
  return "conteggio";
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
  summary: ReturnType<typeof buildAtlanteDistribution>,
): ColoredDistributionBin[] {
  return bins.map((bin) => {
    return {
      ...bin,
      color: getContinuousChoroplethColor((bin.min + bin.max) / 2, summary),
    };
  });
}

function parseRgbColor(color: string) {
  const match = color.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  return [match[0] ?? 0, match[1] ?? 0, match[2] ?? 0] as const;
}

function interpolateColor(start: string, end: string, amount: number) {
  const [sr, sg, sb] = parseRgbColor(start);
  const [er, eg, eb] = parseRgbColor(end);
  const mix = (from: number, to: number) =>
    Math.round(from + (to - from) * amount);
  return `rgb(${mix(sr, er)} ${mix(sg, eg)} ${mix(sb, eb)})`;
}

function getContinuousChoroplethColor(
  value: number | null,
  summary: ReturnType<typeof buildAtlanteDistribution>,
) {
  if (value === null || summary.min === null || summary.max === null) {
    return EMPTY_COLOR;
  }

  if (summary.min === summary.max) {
    return CHOROPLETH_COLORS[CHOROPLETH_COLORS.length - 1];
  }

  const normalized = Math.max(
    0,
    Math.min(1, (value - summary.min) / (summary.max - summary.min)),
  );
  const scaled = normalized * (CHOROPLETH_COLORS.length - 1);
  const lowerIndex = Math.floor(scaled);
  const upperIndex = Math.min(CHOROPLETH_COLORS.length - 1, lowerIndex + 1);
  return interpolateColor(
    CHOROPLETH_COLORS[lowerIndex],
    CHOROPLETH_COLORS[upperIndex],
    scaled - lowerIndex,
  );
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
      )}" fill="${getContinuousChoroplethColor(
        value,
        summary,
      )}" fill-opacity="${value === null ? "0.34" : "0.76"}" stroke="hsl(0 0% 100%)" stroke-width="1.4"><title>${escapeXml(
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
  const primarySummaryValue =
    activeIndicator.unitLabel === "%" ? summary.mean : summary.sum;
  const primarySummaryLabel =
    activeIndicator.unitLabel === "%"
      ? "Media sezioni con dato disponibile"
      : "Totale sezioni con dato disponibile";

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
    <text x="${padding}" y="764" font-size="20" font-weight="700" fill="hsl(222 47% 11%)">Fasce indicatore</text>
    ${legendItems}
    <g transform="translate(${padding}, 900)">
      <text font-size="18" font-weight="700" fill="hsl(222 47% 11%)">${escapeXml(
        formatSummaryValue(primarySummaryValue, activeIndicator.unitLabel),
      )}</text>
      <text y="28" font-size="15" fill="hsl(215 16% 47%)">${escapeXml(primarySummaryLabel)}</text>
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

function toLeafletBounds(bounds: GeographicBounds): LatLngBoundsExpression {
  return [
    [bounds.minLat, bounds.minLng],
    [bounds.maxLat, bounds.maxLng],
  ];
}

function getLeafletFeatureStyle({
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
  const isMissing = value === null;

  return {
    color: isActive ? MAP_SELECTED_STROKE : MAP_SECTION_STROKE,
    dashArray: isMissing ? "5 4" : undefined,
    fillColor: getContinuousChoroplethColor(value, summary),
    fillOpacity: isMissing ? 0.48 : isActive ? 0.86 : 0.78,
    lineJoin: "round" as const,
    opacity: 1,
    weight: isSelected ? 4.2 : isHovered ? 3 : 1.1,
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
