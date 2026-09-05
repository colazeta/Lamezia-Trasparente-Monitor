import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  type AtlanteFeature,
  type AtlanteIndicatorDefinition,
  buildAtlanteDistribution,
  formatAtlanteValue,
  getSectionId,
  getSectionPublicLabel,
  readIndicatorValue,
} from "@/data/atlanteTerritoriale";

const integerFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 0,
});
const shareFormatter = new Intl.NumberFormat("it-IT", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function CensusSectionsDataView({
  activeIndicator,
  availableIndicators,
  features,
  onIndicatorSelect,
  onSectionSelect,
}: {
  activeIndicator: AtlanteIndicatorDefinition;
  availableIndicators: AtlanteIndicatorDefinition[];
  features: AtlanteFeature[];
  onIndicatorSelect: (indicatorId: string) => void;
  onSectionSelect: (sectionId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("it");
  const summary = useMemo(
    () =>
      buildAtlanteDistribution(
        features.map((feature) => readIndicatorValue(feature, activeIndicator)),
      ),
    [activeIndicator, features],
  );
  const rows = useMemo(() => {
    const matchingFeatures = normalizedQuery
      ? features.filter((feature) =>
          `${getSectionPublicLabel(feature)} ${getSectionId(feature)}`
            .toLocaleLowerCase("it")
            .includes(normalizedQuery),
        )
      : features;

    return [...matchingFeatures].sort((left, right) =>
      getSectionPublicLabel(left).localeCompare(
        getSectionPublicLabel(right),
        "it",
        { numeric: true },
      ),
    );
  }, [features, normalizedQuery]);

  return (
    <details className="rounded-xl border border-border bg-card" id="atlante-dati-censuari">
      <summary className="cursor-pointer px-4 py-3 font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        Consulta i dati senza mappa
      </summary>
      <div className="border-t border-border p-4">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Le stesse sezioni e gli stessi valori rappresentati sulla mappa sono
          disponibili anche in forma tabellare. Un valore mancante resta
          distinto dallo zero.
        </p>

        <section aria-labelledby="atlante-city-summary" className="mt-4 rounded-lg border border-border/70 bg-muted/20 p-3">
          <h3 className="text-sm font-semibold text-foreground" id="atlante-city-summary">
            Sintesi città
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Riepilogo delle sezioni per {activeIndicator.label.toLocaleLowerCase("it")}.
            I valori mancanti non vengono trattati come zero.
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
            <CityMetric label="Sezioni totali" value={integerFormatter.format(summary.totalCount)} />
            <CityMetric label="Con dato" value={integerFormatter.format(summary.availableCount)} />
            <CityMetric label="Senza dato" value={integerFormatter.format(summary.missingCount)} />
            <CityMetric label="Valore zero" value={integerFormatter.format(summary.zeroCount)} />
            {activeIndicator.id === "popolazione-residente" ? (
              <CityMetric
                label="Totale popolazione nelle sezioni con dato"
                value={formatAtlanteValue(summary.sum, activeIndicator.unitLabel)}
                wide
              />
            ) : null}
          </dl>

          <details className="mt-3 rounded-md border border-border/70 bg-background">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Distribuzione delle sezioni con dato
            </summary>
            <div className="border-t border-border px-3 py-2">
              {summary.bins.length > 0 && summary.availableCount > 0 ? (
                <dl className="space-y-1.5 text-xs">
                  {summary.bins.map((bin) => (
                    <div
                      className="grid grid-cols-[1fr_auto] gap-3"
                      key={`${bin.index}-${bin.label}`}
                    >
                      <dt className="text-muted-foreground">{bin.label}</dt>
                      <dd className="font-semibold text-foreground">
                        {formatSectionCount(bin.count)} · {shareFormatter.format(bin.count / summary.availableCount)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nessuna sezione con dato disponibile per questo indicatore.
                </p>
              )}
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Le percentuali usano come denominatore soltanto le sezioni con
                dato. Le sezioni senza dato sono escluse; lo zero resta un
                valore osservato.
              </p>
            </div>
          </details>
        </section>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">
              Indicatore
            </span>
            <select
              aria-label="Indicatore dei dati censuari"
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

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">
              Cerca una sezione
            </span>
            <span className="relative block">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nome area o codice ISTAT"
                type="search"
                value={query}
              />
            </span>
          </label>
        </div>

        <p aria-live="polite" className="mt-3 text-xs text-muted-foreground">
          {rows.length === features.length
            ? `${rows.length} sezioni disponibili`
            : `${rows.length} sezioni trovate su ${features.length}`}
        </p>

        <div className="mt-3 max-h-[520px] overflow-auto rounded-lg border border-border">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="px-3 py-2 font-semibold text-foreground" scope="col">
                  Sezione
                </th>
                <th className="px-3 py-2 font-semibold text-foreground" scope="col">
                  Codice ISTAT
                </th>
                <th className="px-3 py-2 font-semibold text-foreground" scope="col">
                  {activeIndicator.label}
                </th>
                <th className="px-3 py-2 font-semibold text-foreground" scope="col">
                  Mappa
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((feature) => {
                const sectionId = getSectionId(feature);
                const value = readIndicatorValue(feature, activeIndicator);
                return (
                  <tr className="border-t border-border/70" key={sectionId}>
                    <th className="px-3 py-2 font-medium text-foreground" scope="row">
                      {getSectionPublicLabel(feature)}
                    </th>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {sectionId}
                    </td>
                    <td className="px-3 py-2 font-semibold text-foreground">
                      {value === null
                        ? "Dato non disponibile"
                        : formatAtlanteValue(value, activeIndicator.unitLabel)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        onClick={() => onSectionSelect(sectionId)}
                        type="button"
                      >
                        Mostra sulla mappa
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-5 text-center text-muted-foreground" colSpan={4}>
                    Nessuna sezione corrisponde alla ricerca.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

function CityMetric({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-md bg-background px-3 py-2 ${wide ? "col-span-2 md:col-span-1" : ""}`}>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-display text-base font-bold text-foreground">{value}</dd>
    </div>
  );
}

function formatSectionCount(count: number) {
  return `${integerFormatter.format(count)} ${count === 1 ? "sezione" : "sezioni"}`;
}
