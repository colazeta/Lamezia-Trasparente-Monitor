import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  type AtlanteFeature,
  type AtlanteIndicatorDefinition,
  formatAtlanteValue,
  getSectionId,
  getSectionPublicLabel,
  readIndicatorValue,
} from "@/data/atlanteTerritoriale";

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
