import { Download, ExternalLink, FileJson, MapPinned } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { OpenDataThemeDataset } from "@/data/opendataThemeCategories";

export function GenericDatasetDetail({
  dataset,
}: {
  dataset: OpenDataThemeDataset;
}) {
  const distributions = dataset.distributions ?? [];

  return (
    <div className="space-y-5">
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
          <MetadataItem label="Copertura geografica" value={dataset.geographicCoverage} />
          <MetadataItem
            label="Copertura temporale"
            value={dataset.temporalCoverage?.label ?? "Non applicabile o non documentata"}
          />
          <MetadataItem label="Aggiornamento" value={dataset.updateCadence} />
          <MetadataItem
            label="Licenza"
            value={dataset.licence ?? "Non indicata nel registry; verificare le condizioni delle fonti originarie"}
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
              Distribuzioni riusabili
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Formati diversi dello stesso oggetto canonico restano distribuzioni
              dello stesso dataset: non aumentano il numero delle schede nel catalogo.
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
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
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
          Il GeoJSON è una distribuzione del dataset, non una scheda Open Data separata.
        </p>
      ) : null}
    </div>
  );
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
