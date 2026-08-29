import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Beaker,
  Filter,
  Globe2,
  Landmark,
  Search,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  EVIDENCE_AREA_LABELS,
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_IMPLEMENTABILITY_LABELS,
  EVIDENCE_INTERVENTIONS,
  EVIDENCE_INTERVENTION_TYPE_LABELS,
  EVIDENCE_STRENGTHS,
  EVIDENCE_STRENGTH_LABELS,
  getEvidenceAreas,
  getEvidenceCountries,
  getEvidenceInterventionTypes,
  type EvidenceImplementability,
  type EvidenceInterventionType,
  type EvidenceStrength,
  type EvidenceThematicArea,
} from "@/data/evidenceInterventions";

const ALL = "all";

type AllOr<T extends string> = typeof ALL | T;

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function evidenceBadgeVariant(strength: EvidenceStrength) {
  if (strength === "molto_forte") return "default" as const;
  if (strength === "forte") return "secondary" as const;
  return "outline" as const;
}

export function InterventiEvidence() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<AllOr<EvidenceThematicArea>>(ALL);
  const [type, setType] = useState<AllOr<EvidenceInterventionType>>(ALL);
  const [country, setCountry] = useState(ALL);
  const [strength, setStrength] = useState<AllOr<EvidenceStrength>>(ALL);
  const [implementability, setImplementability] =
    useState<AllOr<EvidenceImplementability>>(ALL);

  const publicItems = useMemo(
    () => EVIDENCE_INTERVENTIONS.filter((item) => item.evidenceStrength !== "da_verificare"),
    [],
  );

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("it");

    return publicItems.filter((item) => {
      if (area !== ALL && item.primaryArea !== area) return false;
      if (
        type !== ALL &&
        !(item.interventionTypes as readonly EvidenceInterventionType[]).includes(type)
      )
        return false;
      if (country !== ALL && item.country !== country) return false;
      if (strength !== ALL && item.evidenceStrength !== strength) return false;
      if (implementability !== ALL && item.implementability !== implementability) return false;
      if (!needle) return true;

      return [
        item.title,
        item.authority,
        item.territory,
        item.country,
        item.problem,
        item.measure,
        item.results,
        item.tags.join(" "),
      ]
        .join(" ")
        .toLocaleLowerCase("it")
        .includes(needle);
    });
  }, [area, country, implementability, publicItems, query, strength, type]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <header className="max-w-4xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
          <Beaker className="h-3.5 w-3.5" aria-hidden="true" />
          Archivio documentale · effetti valutati
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
          Interventi locali basati sull’evidenza
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Politiche e pratiche effettivamente adottate da enti locali, selezionate solo quando
          esiste una valutazione empirica leggibile. La sezione distingue ciò che è stato fatto,
          il disegno di valutazione, gli effetti osservati, i limiti e la possibile trasferibilità:
          non è una graduatoria di città né una raccomandazione automatica per Lamezia Terme.
        </p>
      </header>

      <section
        className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5"
        aria-labelledby="evidence-filters-title"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 id="evidence-filters-title" className="text-sm font-semibold">
            Filtra l’archivio
          </h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="relative md:col-span-2 xl:col-span-1">
            <span className="sr-only">Cerca nell’archivio</span>
            <Search
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cerca intervento, ente, luogo…"
              className={`${selectClass} pl-9`}
            />
          </label>

          <label>
            <span className="sr-only">Area tematica</span>
            <select
              className={selectClass}
              value={area}
              onChange={(event) => setArea(event.target.value as AllOr<EvidenceThematicArea>)}
            >
              <option value={ALL}>Tutte le aree tematiche</option>
              {getEvidenceAreas().map((value) => (
                <option key={value} value={value}>
                  {EVIDENCE_AREA_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Tipo di intervento</span>
            <select
              className={selectClass}
              value={type}
              onChange={(event) => setType(event.target.value as AllOr<EvidenceInterventionType>)}
            >
              <option value={ALL}>Tutti i tipi di intervento</option>
              {getEvidenceInterventionTypes().map((value) => (
                <option key={value} value={value}>
                  {EVIDENCE_INTERVENTION_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Paese</span>
            <select className={selectClass} value={country} onChange={(event) => setCountry(event.target.value)}>
              <option value={ALL}>Tutti i paesi</option>
              {getEvidenceCountries().map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Forza dell’evidenza</span>
            <select
              className={selectClass}
              value={strength}
              onChange={(event) => setStrength(event.target.value as AllOr<EvidenceStrength>)}
            >
              <option value={ALL}>Tutta la forza dell’evidenza</option>
              {EVIDENCE_STRENGTHS.filter((value) => value !== "da_verificare").map((value) => (
                <option key={value} value={value}>
                  {EVIDENCE_STRENGTH_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Implementabilità</span>
            <select
              className={selectClass}
              value={implementability}
              onChange={(event) =>
                setImplementability(event.target.value as AllOr<EvidenceImplementability>)
              }
            >
              <option value={ALL}>Ogni livello di implementabilità</option>
              {EVIDENCE_IMPLEMENTABILITY.map((value) => (
                <option key={value} value={value}>
                  {EVIDENCE_IMPLEMENTABILITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {filteredItems.length} {filteredItems.length === 1 ? "intervento" : "interventi"} visibili
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          I record “da verificare” non sono pubblicati in questa vista
        </span>
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-2" aria-label="Interventi locali valutati">
        {filteredItems.map((item) => (
          <article key={item.id} className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant={evidenceBadgeVariant(item.evidenceStrength)}>
                Evidenza {EVIDENCE_STRENGTH_LABELS[item.evidenceStrength].toLocaleLowerCase("it")}
              </Badge>
              <Badge variant="outline">{EVIDENCE_IMPLEMENTABILITY_LABELS[item.implementability]}</Badge>
            </div>

            <h2 className="mt-4 font-display text-xl font-semibold tracking-tight md:text-2xl">
              {item.title}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                {item.authority}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                {item.territory} · {item.country}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.measure}</p>

            <div className="mt-5 rounded-2xl border border-border bg-muted/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Risultato principale
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">{item.effectSize}</p>
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Area</dt>
                <dd className="mt-1 font-medium">{EVIDENCE_AREA_LABELS[item.primaryArea]}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valutazione</dt>
                <dd className="mt-1 line-clamp-3 text-muted-foreground">{item.evaluationMethod}</dd>
              </div>
            </dl>

            <div className="mt-auto pt-6">
              <Link
                href={`/interventi-locali/${item.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Apri la scheda completa
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      {filteredItems.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="font-semibold">Nessun intervento corrisponde ai filtri selezionati.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Modifica uno o più filtri per ampliare la ricerca.
          </p>
        </div>
      ) : null}
    </div>
  );
}
