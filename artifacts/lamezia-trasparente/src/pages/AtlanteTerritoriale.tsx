import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Database,
  Info,
  Layers3,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import {
  ATLANTE_EXPECTED_GEOJSON_PATH,
  ATLANTE_EXPECTED_INDICATOR_DICTIONARY_PATH,
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
    <main className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="max-w-4xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                Dati territoriali
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                  Atlante territoriale
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-700">
                  L'Atlante territoriale permette di leggere Lamezia Terme per
                  sezioni censuarie, la piu' piccola unita' statistica
                  pubblicata da ISTAT. Qui puoi esplorare come cambia il
                  territorio tra quartieri e micro-aree, con dati pubblici,
                  limiti dichiarati e fonti sempre visibili.
                </p>
              </div>
              <TrustChips />
            </div>
            <HeroStatusCard
              activeIndicator={activeIndicator}
              dataStatus={layer?.dataStatus ?? null}
              featureCount={features.length}
              metadata={metadata}
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loadState.status === "loading" ? (
          <LoadingState />
        ) : loadState.status === "error" ? (
          <ErrorState message={loadState.message} />
        ) : !layer || features.length === 0 || !metadata ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            <IndicatorSelector
              activeIndicator={activeIndicator}
              availableIndicators={availableIndicators}
              collection={collection}
              onSelect={setSelectedIndicatorId}
            />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
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
              <DetailPanel
                activeFeature={activeFeature}
                activeIndicator={activeIndicator}
                activeValue={activeValue}
                dataStatus={layer.dataStatus}
                metadata={metadata}
              />
            </div>
            <MethodologyPanel
              activeIndicator={activeIndicator}
              collection={collection}
              dataStatus={layer.dataStatus}
              loadedFrom={layer.loadedFrom}
              metadata={metadata}
            />
            <FutureLayers />
          </div>
        )}
      </section>
    </main>
  );
}

function TrustChips() {
  const chips = [
    { icon: Database, label: "Fonte ISTAT" },
    { icon: MapPinned, label: "Sezioni censuarie" },
    { icon: ShieldCheck, label: "Limiti dichiarati" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(({ icon: Icon, label }) => (
        <span
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-card px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
          key={label}
        >
          <Icon className="h-4 w-4 text-teal-700" />
          {label}
        </span>
      ))}
    </div>
  );
}

function HeroStatusCard({
  activeIndicator,
  dataStatus,
  featureCount,
  metadata,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  dataStatus: AtlanteLoadedLayer["dataStatus"] | null;
  featureCount: number;
  metadata: AtlanteLayerMetadata | null;
}) {
  const isDemo = dataStatus === "demo";
  const coverage = metadata?.qa?.populationValueCoverage;

  return (
    <aside className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {isDemo ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
        )}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stato del livello
            </p>
            <p className="mt-1 font-semibold leading-6 text-slate-950">
              {metadata?.publicLabel ?? "Caricamento fonte territoriale"}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-950">Fonte:</span>{" "}
              {metadata?.sourceInstitution ?? "ISTAT"}
            </p>
            <p>
              <span className="font-medium text-slate-950">Livello:</span>{" "}
              {metadata?.territorialLevel ?? "sezione di censimento"}
            </p>
            <p>
              <span className="font-medium text-slate-950">Indicatore:</span>{" "}
              {activeIndicator?.label ?? "in preparazione"}
            </p>
            {featureCount > 0 ? (
              <p>
                <span className="font-medium text-slate-950">Sezioni:</span>{" "}
                {featureCount}
              </p>
            ) : null}
          </div>
          {coverage ? (
            <p className="rounded-md bg-teal-50 px-3 py-2 text-sm leading-6 text-teal-950">
              QA popolazione residente: {coverage.availableCount} sezioni su{" "}
              {coverage.totalFeatures} hanno valore 2023; {coverage.nullCount}{" "}
              restano "dato non disponibile" e non sono trattate come zero.
            </p>
          ) : null}
          {isDemo ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
              Dato dimostrativo: non contiene sezioni censuarie reali e non va
              usato per analisi.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
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
  const availableCount =
    collection && activeIndicator
      ? collection.features.filter((feature) =>
          featureHasIndicator(feature, activeIndicator),
        ).length
      : 0;
  const unavailableCount =
    collection && activeIndicator
      ? collection.features.length - availableCount
      : 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Indicatore
          </p>
          <h2 className="text-xl font-semibold text-slate-950">
            Scegli cosa osservare sulla mappa
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Oggi e' pubblicabile solo la popolazione residente. Le altre
            categorie restano visibili per chiarezza, ma saranno attivate solo
            dopo verifica dei campi ISTAT.
          </p>
        </div>
        <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm leading-6 text-teal-950">
          <p className="font-semibold">
            {activeIndicator?.label ?? "Indicatore in preparazione"}
          </p>
          {collection && activeIndicator ? (
            <p className="mt-1">
              {availableCount} sezioni con valore disponibile.{" "}
              {unavailableCount > 0
                ? `${unavailableCount} sezioni mostrano "dato non disponibile"; non sono conteggiate come zero.`
                : "Nessuna sezione senza valore."}
            </p>
          ) : (
            <p className="mt-1">In attesa del contratto dati validato.</p>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ATLANTE_INDICATOR_CATEGORIES.map((category) => {
          const indicator = availableIndicators.find(
            (candidate) => candidate.categoryId === category.id,
          );
          const isEnabled = Boolean(indicator);
          const isActive = indicator?.id === activeIndicator?.id;
          return (
            <button
              key={category.id}
              className={`min-h-24 rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                isActive
                  ? "border-teal-600 bg-teal-50 text-teal-950 shadow-sm"
                  : isEnabled
                    ? "border-slate-200 bg-card text-slate-800 hover:border-teal-300 hover:bg-teal-50/40"
                    : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
              disabled={!isEnabled || !indicator}
              onClick={() => indicator && onSelect(indicator.id)}
              type="button"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{category.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    isEnabled
                      ? "bg-teal-100 text-teal-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isEnabled ? "attivo" : "presto"}
                </span>
              </span>
              <span className="mt-3 block text-xs leading-5">
                {indicator
                  ? indicator.label
                  : "Indicatore in preparazione"}
              </span>
            </button>
          );
        })}
      </div>
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
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Mappa
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-950">
            <MapPinned className="h-6 w-6 text-teal-700" />
            Lamezia per sezioni censuarie
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ogni poligono rappresenta una sezione di censimento ISTAT. Le aree
            senza variabile 2023 restano visibili, ma sono indicate come dato
            non disponibile.
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700">
          <span className="font-semibold">{metadata.sourceInstitution}</span>{" "}
          - {metadata.sourceYear} - {metadata.territorialLevel}
        </div>
      </div>

      <div className="p-3 sm:p-5">
        {!bounds || !activeIndicator ? (
          <div className="flex min-h-96 items-center justify-center rounded-md bg-slate-100 p-6 text-center text-sm text-slate-600">
            La mappa sara' disponibile quando almeno un indicatore censuario
            sara' presente nel file dati.
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-100">
            <svg
              aria-label="Mappa delle sezioni censuarie di Lamezia Terme"
              className="block h-[420px] w-full sm:h-[600px]"
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
                    className="cursor-pointer transition-opacity hover:opacity-90"
                    tabIndex={0}
                  />
                );
              })}
            </svg>
          </div>
        )}
        <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sezione selezionata
              </span>
              <span className="mt-1 block font-semibold text-slate-950">
                {activeFeature ? getSectionId(activeFeature) : "nessuna"}
              </span>
            </p>
            <p>
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Valore
              </span>
              <span className="mt-1 block font-semibold text-slate-950">
                {activeIndicator
                  ? formatAtlanteValue(
                      activeFeature
                        ? readIndicatorValue(activeFeature, activeIndicator)
                        : null,
                      activeIndicator.unitLabel,
                    )
                  : "dato non disponibile"}
              </span>
            </p>
          </div>
          <Legend activeIndicator={activeIndicator} legendBins={legendBins} />
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
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-950">Legenda</h3>
      {!activeIndicator || legendBins.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">
          Nessun valore disponibile per costruire la legenda.
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
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
            <span>dato non disponibile</span>
          </div>
        </div>
      )}
    </div>
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
  const sectionId = activeFeature ? getSectionId(activeFeature) : "nessuna sezione";
  const valueLabel = activeIndicator
    ? formatAtlanteValue(activeValue, activeIndicator.unitLabel)
    : "dato non disponibile";
  const interpretation = activeIndicator
    ? activeValue === null
      ? "Per questa sezione il valore non e' disponibile nel join ISTAT 2023; non viene conteggiato come zero."
      : `Il valore indica le ${activeIndicator.unitLabel} associate alla sezione nel dataset ISTAT 2023.`
    : "Gli indicatori saranno mostrati solo dopo verifica dei campi disponibili.";
  const rows = [
    ["Fonte istituzionale", metadata.sourceInstitution],
    ["Dataset", metadata.sourceDataset],
    ["Anno", metadata.sourceYear],
    ["Livello territoriale", metadata.territorialLevel],
    ["Stato verifica", metadata.verificationStatus],
    ["Ultimo aggiornamento", metadata.processingDate ?? "non indicato"],
  ];

  return (
    <aside className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-5 xl:sticky xl:top-24 xl:self-start">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Sezione selezionata
          </p>
          <h2 className="mt-1 break-words text-xl font-semibold text-slate-950">
            {sectionId}
          </h2>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {activeIndicator ? activeIndicator.label : "Indicatore in preparazione"}
        </p>
        <p
          className={`mt-2 break-words text-3xl font-bold leading-tight ${
            activeValue === null ? "text-slate-700" : "text-slate-950"
          }`}
        >
          {valueLabel}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{interpretation}</p>
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

      <div className="mt-5 border-t border-slate-200 pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          Contesto del dato
        </h3>
        <dl className="mt-3 grid gap-3 text-sm">
          {rows.slice(0, 4).map(([label, value]) => (
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
          Cautela principale
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {metadata.knownLimits[0] ??
            "Interpretare il dato insieme a fonte, anno e livello territoriale."}
        </p>
      </div>
    </aside>
  );
}

function MethodologyPanel({
  activeIndicator,
  collection,
  dataStatus,
  loadedFrom,
  metadata,
}: {
  activeIndicator: AtlanteIndicatorDefinition | null;
  collection: AtlanteFeatureCollection | null;
  dataStatus: AtlanteLoadedLayer["dataStatus"];
  loadedFrom: string;
  metadata: AtlanteLayerMetadata;
}) {
  const coverage = metadata.qa?.populationValueCoverage;
  const isDemo = dataStatus === "demo";
  const rows = [
    ["Fonte istituzionale", metadata.sourceInstitution],
    ["Dataset", metadata.sourceDataset],
    ["Anno", metadata.sourceYear],
    ["Livello territoriale", metadata.territorialLevel],
    ["Stato verifica", metadata.verificationStatus],
    ["Ultimo aggiornamento", metadata.processingDate ?? "non indicato"],
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Fonti e metodologia
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              I dati sono pubblici e vanno letti con fonte, anno, livello
              territoriale e limiti sempre visibili. La sezione censuaria non e'
              un quartiere, un CAP o una zona catastale.
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="mt-1 leading-6 text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>

        <details className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-950">
            Percorsi tecnici e limiti completi
          </summary>
          <div className="mt-3 space-y-4 text-sm leading-6 text-slate-700">
            <div>
              <p>
                File atteso:{" "}
                <span className="font-mono text-xs">
                  {ATLANTE_EXPECTED_GEOJSON_PATH}
                </span>
              </p>
              <p>
                File caricato:{" "}
                <span className="font-mono text-xs">{loadedFrom}</span>
              </p>
              <p>
                Dizionario indicatori:{" "}
                <span className="font-mono text-xs">
                  {metadata.qa?.indicatorDictionaryPath ??
                    ATLANTE_EXPECTED_INDICATOR_DICTIONARY_PATH}
                </span>
              </p>
            </div>
            <ul className="space-y-2">
              {metadata.knownLimits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </div>
        </details>
      </div>

      <aside
        className={`rounded-lg border p-4 shadow-sm sm:p-5 ${
          isDemo
            ? "border-amber-300 bg-amber-50 text-amber-950"
            : "border-teal-200 bg-teal-50 text-teal-950"
        }`}
      >
        <div className="flex items-start gap-3">
          {isDemo ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
          ) : (
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-none" />
          )}
          <div className="space-y-3">
            <h3 className="font-semibold">Cosa sapere prima di usare i dati</h3>
            {coverage ? (
              <p className="text-sm leading-6">
                {coverage.availableCount} sezioni su {coverage.totalFeatures}{" "}
                hanno valore per {activeIndicator?.label ?? "l'indicatore"};{" "}
                {coverage.nullCount} restano "dato non disponibile".
              </p>
            ) : null}
            <p className="text-sm leading-6">
              {collection?.features.length ?? 0} geometrie sono mostrate come
              base territoriale. Le sezioni urbane catastali Zornade non sono
              sezioni censuarie e restano fuori da questa base.
            </p>
            {isDemo ? (
              <p className="text-sm leading-6">
                Questa visualizzazione usa dati dimostrativi per non bloccare la
                pagina quando il GeoJSON ISTAT processato non e' disponibile.
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    </section>
  );
}

function FutureLayers() {
  return (
    <section className="rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Prossimi passi
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Altri indicatori arriveranno solo dopo revisione
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Eta', cittadinanza, famiglie, abitazioni, mobilita', istruzione e
            lavoro restano in preparazione finche' campi, numeratori,
            denominatori e cautele non saranno verificati.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
          <Layers3 className="h-4 w-4 text-slate-500" />
          Layer accessorio/non censuario separato
        </div>
      </div>
    </section>
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
