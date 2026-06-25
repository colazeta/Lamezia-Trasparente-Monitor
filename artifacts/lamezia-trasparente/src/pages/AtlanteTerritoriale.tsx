import { type ReactNode, useEffect, useMemo, useState } from "react";
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
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
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
                  metadata={metadata}
                />
                <CitySummaryCard
                  activeIndicator={activeIndicator}
                  summary={distribution}
                />
              </div>
            </div>
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
    [
      "Dato",
      activeIndicator?.label.toLocaleLowerCase("it-IT") ?? "in preparazione",
    ],
  ];

  return (
    <section className="border-b border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-display font-bold leading-tight text-foreground sm:text-4xl">
            Atlante territoriale
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Leggi Lamezia Terme attraverso le sezioni censuarie ISTAT e i dati
            ufficiali disponibili.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map(([label, value]) => (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground"
                key={`${label}-${value}`}
              >
                <span className="font-semibold text-foreground">{label}:</span>
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
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Database className="h-4 w-4 text-primary" />
        Indicatore
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {orderedEntries.map(({ category, indicator }) => {
          const isActive = indicator?.id === activeIndicator?.id;
          return (
            <button
              className={`min-w-40 rounded-md border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : indicator
                    ? "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                    : "border-border bg-muted/40 text-muted-foreground"
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
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <BarChart3 className="mt-0.5 h-4 w-4 flex-none text-primary" />
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Sintesi città
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Valori calcolati solo sulle sezioni con dato disponibile.
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map(([label, value]) => (
          <div
            className="rounded-md border border-border bg-muted/35 p-3"
            key={label}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
        <p>Valori mancanti e valori zero restano separati.</p>
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
    <section className="rounded-lg border border-border bg-card p-3 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <MapPinned className="h-4 w-4" />
            Mappa
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Sezioni censuarie
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Il colore segue l'indicatore selezionato.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
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
  metadata,
}: {
  activeFeature: AtlanteFeature | null;
  activeIndicator: AtlanteIndicatorDefinition | null;
  activeValue: number | null;
  availableIndicators: AtlanteIndicatorDefinition[];
  metadata: AtlanteLayerMetadata;
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
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sezione selezionata
        </p>
        <h2 className="mt-1 break-words text-xl font-semibold text-foreground">
          {sectionId}
        </h2>
      </div>

      <div className="mt-4 rounded-md border border-primary/30 bg-primary/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Dato mappa
        </p>
        <p className="mt-1 text-2xl font-bold leading-tight text-foreground">
          {valueLabel}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeIndicator?.label ?? "Indicatore in preparazione"}
        </p>
      </div>

      <dl className="mt-4 divide-y divide-border rounded-md border border-border">
        {profileRows.length > 0 ? (
          profileRows.map((row) => (
            <div className="grid gap-1 p-3" key={row.id}>
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

      <div className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
        {activeValue === 0 ? (
          <p>Zero è mostrato come 0, non come dato mancante.</p>
        ) : null}
        <p className="font-semibold text-brand">{metadata.publicLabel}</p>
        <p>
          {metadata.sourceInstitution}, {metadata.sourceYear}.
        </p>
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
  const technicalRows = [
    ["Fonte", metadata.sourceInstitution],
    ["Dataset", metadata.sourceDataset],
    ["Anno", metadata.sourceYear],
    ["Livello", metadata.territorialLevel],
    ["Verifica", metadata.verificationStatus],
    ["Aggiornamento", metadata.processingDate ?? "non indicato"],
  ];

  return (
    <details className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <summary className="flex cursor-pointer items-center gap-2 text-base font-semibold text-foreground">
        <BookOpen className="h-5 w-5 text-primary" />
        Fonti e limiti
      </summary>
      <div className="mt-5 space-y-5 text-sm leading-6 text-muted-foreground">
        <div className="grid gap-4 md:grid-cols-2">
          <PlainLanguageNote title="Da dove vengono i dati">
            I confini delle sezioni e il dato sulla popolazione provengono da{" "}
            {metadata.sourceInstitution}. L'anno indicato è{" "}
            {metadata.sourceYear}.
          </PlainLanguageNote>
          <PlainLanguageNote title="Che cosa mostra la mappa">
            Ogni area è una sezione censuaria. Il colore cambia in base
            all'indicatore selezionato.
          </PlainLanguageNote>
          <PlainLanguageNote title="Che cosa significa dato non disponibile">
            Alcune sezioni hanno il confine geografico, ma non hanno un valore
            associato nei dati 2023.
          </PlainLanguageNote>
          <PlainLanguageNote title="Cosa non bisogna dedurre">
            La mappa non assegna giudizi, punteggi o classifiche alle aree.
          </PlainLanguageNote>
        </div>

        <div className="rounded-md border border-border bg-muted/40 p-3">
          <p>
            {formatInteger(summary.availableCount)} sezioni hanno un valore
            numerico; {formatInteger(summary.missingCount)} restano "Dato non
            disponibile".
          </p>
          <p className="mt-2">
            Le sezioni urbane catastali Zornade non sono sezioni censuarie e
            restano un livello accessorio/non censuario, non usato come base
            della mappa.
          </p>
          {dataStatus === "demo" ? (
            <p className="mt-2">
              Dato dimostrativo: non contiene sezioni censuarie reali.
            </p>
          ) : null}
        </div>

        <div>
          <h3 className="font-semibold text-foreground">Limiti noti</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {metadata.knownLimits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </div>

        <details className="rounded-md border border-border bg-background p-3">
          <summary className="cursor-pointer font-semibold text-foreground">
            Dettagli tecnici
          </summary>
          <div className="mt-4 space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {technicalRows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-1">
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
          </div>
        </details>
      </div>
    </details>
  );
}

function PlainLanguageNote({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-md border border-border bg-muted/35 p-3">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1">{children}</p>
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
