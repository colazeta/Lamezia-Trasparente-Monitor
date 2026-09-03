import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  ExternalLink,
  FileJson,
  Loader2,
  MapPinned,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { OpenDataThemeDataset } from "@/data/opendataThemeCategories";

type ChartDatum = {
  label: string;
  value: number;
};

type ChartDefinition = {
  title: string;
  description: string;
  data: ChartDatum[];
};

type ChartState =
  | { status: "loading" }
  | { status: "ready"; chart: ChartDefinition }
  | { status: "error" };

export function GenericDatasetDetail({
  dataset,
}: {
  dataset: OpenDataThemeDataset;
}) {
  const distributions = dataset.distributions ?? [];

  return (
    <div className="space-y-5">
      <GenericDatasetChart dataset={dataset} />

      <section className="rounded-xl border border-card-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Metadati canonici
            </p>
            <h3 className="mt-1 font-display text-xl font-bold text-foreground">
              Come leggere questo dataset
            </h3>
          </div>
          <Badge className="w-fit shadow-none" variant="outline">
            {dataset.layer === "canonical" ? "Dataset canonico" : dataset.layer}
          </Badge>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetadataItem label="Fonte" value={dataset.sourceLabel} />
          <MetadataItem label="Tema" value={dataset.subtheme} />
          <MetadataItem
            label="Copertura geografica"
            value={dataset.geographicCoverage}
          />
          <MetadataItem
            label="Copertura temporale"
            value={
              dataset.temporalCoverage?.label ??
              "Non applicabile o non documentata"
            }
          />
          <MetadataItem label="Aggiornamento" value={dataset.updateCadence} />
          <MetadataItem
            label="Licenza"
            value={
              dataset.licence ??
              "Non indicata nel registry; verificare le condizioni delle fonti originarie"
            }
          />
        </dl>

        {dataset.methodNote ? (
          <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Metodo e limiti
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {dataset.methodNote}
            </p>
          </div>
        ) : null}

        {dataset.sourceUrl ? (
          <a
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            href={dataset.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Apri la fonte primaria
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </section>

      <section
        aria-labelledby="opendata-distributions-title"
        className="rounded-xl border border-card-border bg-card p-5"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileJson className="h-5 w-5" />
          </span>
          <div>
            <h3
              className="font-display text-xl font-bold text-foreground"
              id="opendata-distributions-title"
            >
              Altri formati e riuso
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Se lo stesso dataset è disponibile in più formati, qui trovi le
              distribuzioni aggiuntive senza creare schede duplicate.
            </p>
          </div>
        </div>

        {distributions.length > 0 ? (
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {distributions.map((distribution) => (
              <li
                className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                key={distribution.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {distribution.label}
                    </p>
                    <Badge className="shadow-none" variant="outline">
                      {distribution.format}
                    </Badge>
                  </div>
                  {distribution.description ? (
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {distribution.description}
                    </p>
                  ) : null}
                </div>
                <a
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary"
                  download={distribution.downloadName}
                  href={distribution.url}
                >
                  <Download className="h-4 w-4" />
                  Scarica {distribution.format}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            La scheda è registrata, ma non ha ancora una distribuzione scaricabile
            dichiarata nel registry.
          </p>
        )}
      </section>

      {dataset.formats.includes("GeoJSON") ? (
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <MapPinned className="h-4 w-4" />
          Il GeoJSON è una distribuzione del dataset, non una scheda Open Data
          separata.
        </p>
      ) : null}
    </div>
  );
}

function GenericDatasetChart({ dataset }: { dataset: OpenDataThemeDataset }) {
  const distribution = dataset.distributions?.[0] ?? null;
  const [state, setState] = useState<ChartState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    if (!distribution) {
      setState({ status: "error" });
      return () => {
        cancelled = true;
      };
    }

    setState({ status: "loading" });
    void fetch(distribution.url)
      .then((response) => {
        if (!response.ok) throw new Error("distribution unavailable");
        return response.json() as Promise<unknown>;
      })
      .then((payload) => buildChartDefinition(dataset.id, payload))
      .then((chart) => {
        if (cancelled) return;
        setState(chart ? { status: "ready", chart } : { status: "error" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [dataset.id, distribution]);

  return (
    <section className="rounded-xl border border-card-border bg-card p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Vista rapida
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-foreground">
            {state.status === "ready" ? state.chart.title : "Grafico del dataset"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {state.status === "ready"
              ? state.chart.description
              : "La visualizzazione viene calcolata direttamente dalla distribuzione scaricabile."}
          </p>
        </div>
      </div>

      {state.status === "loading" ? (
        <div
          className="mt-5 flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/15 text-sm text-muted-foreground"
          role="status"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Caricamento grafico…
        </div>
      ) : state.status === "ready" ? (
        <SimpleBarChart chart={state.chart} />
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/15 p-4 text-sm leading-6 text-muted-foreground">
          Il grafico non è disponibile in questo momento. Il dataset resta
          scaricabile e i limiti della fonte restano visibili nella scheda.
        </div>
      )}
    </section>
  );
}

function SimpleBarChart({ chart }: { chart: ChartDefinition }) {
  const maxValue = Math.max(1, ...chart.data.map((item) => item.value));

  return (
    <figure className="mt-5" aria-label={chart.title}>
      <div className="space-y-3" role="img" aria-label={chart.description}>
        {chart.data.map((item) => (
          <div
            className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr_auto] sm:items-center sm:gap-3"
            key={item.label}
          >
            <span className="text-sm font-medium text-foreground">
              {item.label}
            </span>
            <div className="h-7 overflow-hidden rounded-md bg-muted">
              <div
                className="h-full min-w-1 rounded-md bg-primary"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <strong className="text-sm tabular-nums text-foreground">
              {item.value.toLocaleString("it-IT")}
            </strong>
          </div>
        ))}
      </div>
    </figure>
  );
}

function buildChartDefinition(
  datasetId: string,
  payload: unknown,
): ChartDefinition | null {
  if (datasetId === "istat-census-sections-lamezia-2023") {
    if (!isRecord(payload) || !Array.isArray(payload.features)) return null;
    const features = payload.features;
    const matched = features.filter((feature) => {
      if (!isRecord(feature) || !isRecord(feature.properties)) return false;
      return feature.properties.matched_istat_2023_variables === true;
    }).length;

    return {
      title: "Copertura degli indicatori ISTAT 2023",
      description:
        "Numero di sezioni censuarie con indicatori 2023 associati rispetto alle geometrie che restano senza valori.",
      data: [
        { label: "Con indicatori", value: matched },
        { label: "Solo geometria", value: Math.max(0, features.length - matched) },
      ],
    };
  }

  if (datasetId === "lamezia-pnrr-projects") {
    if (!isRecord(payload) || !Array.isArray(payload.projects)) return null;
    const counts = new Map<string, number>();
    for (const project of payload.projects) {
      if (!isRecord(project) || typeof project.mission !== "string") continue;
      const mission = project.mission.split(" - ")[0]?.trim() || "Non indicata";
      counts.set(mission, (counts.get(mission) ?? 0) + 1);
    }

    return {
      title: "Progetti per missione PNRR",
      description:
        "Conteggio dei progetti comunali nel dataset, raggruppati per codice di missione dichiarato nella fonte.",
      data: Array.from(counts, ([label, value]) => ({ label, value })).sort(
        (a, b) => a.label.localeCompare(b.label, "it"),
      ),
    };
  }

  if (datasetId === "beni-confiscati-lamezia-documentati") {
    if (!isRecord(payload) || !Array.isArray(payload.records)) return null;
    const counts = new Map<string, number>();
    for (const record of payload.records) {
      if (!isRecord(record) || typeof record.status !== "string") continue;
      const status = readableStatus(record.status);
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    return {
      title: "Beni documentati per stato di riuso",
      description:
        "Distribuzione dei soli siti presenti nel registro documentale; non rappresenta il censimento completo ANBSC.",
      data: Array.from(counts, ([label, value]) => ({ label, value })).sort(
        (a, b) => b.value - a.value || a.label.localeCompare(b.label, "it"),
      ),
    };
  }

  return null;
}

function readableStatus(value: string) {
  const normalized = value.replaceAll("_", " ").trim();
  if (!normalized) return "Non indicato";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-5 text-foreground">{value}</dd>
    </div>
  );
}
