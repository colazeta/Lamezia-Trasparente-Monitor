import {
  Database,
  Download,
  ExternalLink,
  FileCheck2,
  MapPin,
  MapPinOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DOCUMENTED_CONFISCATED_ASSETS_DATA_PATH,
  documentedConfiscatedAssetsRegistry,
  type DocumentedConfiscatedAssetSource,
} from "@/data/documentedConfiscatedAssets";
import { withPublicBasePath } from "@/lib/publicBasePath";

const SOURCE_KIND_LABEL: Record<
  DocumentedConfiscatedAssetSource["source_kind"],
  string
> = {
  institutional: "Fonte istituzionale",
  manager: "Soggetto gestore",
  service_provider: "Soggetto attuatore",
  press: "Fonte giornalistica",
};

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatIsoDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function DocumentedConfiscatedAssetsRegistry() {
  const registry = documentedConfiscatedAssetsRegistry;

  return (
    <section
      id="censimento-documentato"
      className="mb-12 space-y-6"
      aria-labelledby="censimento-documentato-title"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-brand">
            <FileCheck2 className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Censimento da fonti pubbliche
            </span>
          </div>
          <h2
            id="censimento-documentato-title"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Primi siti di riuso documentati
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Queste schede ricostruiscono il contesto di due siti reali. Non
            sostituiscono l'inventario ANBSC e non attribuiscono automaticamente
            un identificativo o un punto sulla mappa: ogni passaggio resta
            separato e verificabile.
          </p>
        </div>

        <a
          href={withPublicBasePath(DOCUMENTED_CONFISCATED_ASSETS_DATA_PATH)}
          download
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Scarica il registro JSON
        </a>
      </div>

      <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-sm leading-6">
        <div className="flex items-start gap-3">
          <Database
            className="mt-0.5 h-5 w-5 shrink-0 text-sky-700 dark:text-sky-300"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">Tre livelli di verifica</p>
            <p className="text-muted-foreground">
              L'indirizzo può essere documentato anche quando la coordinata
              puntuale non lo è. Il collegamento al record ANBSC richiede una
              prova ulteriore. Finché manca, il sito resta fuori dal layer
              cartografico e non viene collocato sul centroide comunale.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fonti ricontrollate il {formatIsoDate(registry.last_verified_at)}.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {registry.records.map((record) => (
          <Card
            key={record.id}
            id={record.slug}
            role="article"
            className="flex h-full scroll-mt-24 flex-col gap-5 p-5 md:p-6"
            data-testid={`documented-asset-${record.slug}`}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                >
                  Riuso documentato
                </Badge>
                <Badge variant="secondary">Scheda pilota</Badge>
              </div>
              <h3 className="font-display text-xl font-bold leading-tight">
                {record.name}
              </h3>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{record.address.label}</span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {record.context}
              </p>
            </div>

            <dl className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gestore documentato
                </dt>
                <dd className="mt-1 font-medium">{record.manager}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Finanziamento
                </dt>
                <dd className="mt-1 font-medium">
                  {euroFormatter.format(record.refunctionalization.amount_eur)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Protocollo progetto
                </dt>
                <dd className="mt-1 font-mono text-xs">
                  {record.refunctionalization.protocol}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  CUP
                </dt>
                <dd className="mt-1 font-mono text-xs">
                  {record.refunctionalization.cup}
                </dd>
              </div>
            </dl>

            <div>
              <h4 className="text-sm font-semibold">Funzioni sociali</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {record.public_uses.map((use) => (
                  <li key={use} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
              <p className="flex items-start gap-2">
                <FileCheck2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300"
                  aria-hidden="true"
                />
                <span>
                  <strong>Indirizzo:</strong> documentato da fonti pubbliche.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <MapPinOff
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300"
                  aria-hidden="true"
                />
                <span>
                  <strong>Coordinate:</strong> non pubblicate; verifica puntuale
                  aperta.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Database
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300"
                  aria-hidden="true"
                />
                <span>
                  <strong>ANBSC:</strong> nessun identificativo individuale
                  attribuito.
                </span>
              </p>
            </div>

            <div className="mt-auto border-t pt-4">
              <h4 className="text-sm font-semibold">Fonti della scheda</h4>
              <ul className="mt-3 space-y-3">
                {record.sources.map((source) => (
                  <li key={`${record.id}:${source.url}`}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block text-sm"
                    >
                      <span className="font-medium text-foreground underline decoration-border underline-offset-4 group-hover:text-brand group-hover:decoration-brand">
                        {source.title}
                        <ExternalLink
                          className="ml-1 inline h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {SOURCE_KIND_LABEL[source.source_kind]} ·{" "}
                        {source.publisher}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Riferimento all'atto citato dalle fonti:{" "}
                {record.refunctionalization.municipal_act_reference}.
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
