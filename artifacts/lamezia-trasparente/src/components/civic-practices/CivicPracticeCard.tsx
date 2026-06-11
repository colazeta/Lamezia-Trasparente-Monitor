import { Link } from "wouter";
import { AlertTriangle, ExternalLink, MapPin, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CIVIC_PRACTICE_AREA_LABELS,
  CIVIC_PRACTICE_REPLICABILITY_LABELS,
  CIVIC_PRACTICE_STATUS_LABELS,
  type CivicPractice,
} from "@/data/civicPractices";

function sourceTypeLabel(type: CivicPractice["sources"][number]["type"]) {
  switch (type) {
    case "fonte_primaria":
      return "Fonte primaria";
    case "fonte_secondaria":
      return "Fonte secondaria";
    case "social":
      return "Social";
    case "screenshot":
      return "Screenshot";
    case "scouting_redazionale":
      return "Scouting redazionale";
  }
}

export function CivicPracticeCard({ practice }: { practice: CivicPractice }) {
  return (
    <article
      className="rounded-3xl border border-border bg-card p-5 shadow-sm"
      aria-labelledby={`${practice.id}-title`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="outline">
              {CIVIC_PRACTICE_STATUS_LABELS[practice.sourceStatus]}
            </Badge>
            <Badge variant="secondary">
              Replicabilità: {CIVIC_PRACTICE_REPLICABILITY_LABELS[practice.replicability.level]}
            </Badge>
            {practice.area.map((area) => (
              <Badge key={area} variant="outline">
                {CIVIC_PRACTICE_AREA_LABELS[area]}
              </Badge>
            ))}
          </div>
          <h3
            id={`${practice.id}-title`}
            className="font-display text-xl font-semibold tracking-tight"
          >
            {practice.title}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {practice.summary}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 p-3 text-sm lg:min-w-64">
          <p className="flex items-center gap-1.5 font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            Comune osservato
          </p>
          <p className="mt-1 text-muted-foreground">
            {practice.municipality}
            {practice.province ? ` (${practice.province})` : ""}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Ultima revisione: {practice.lastReviewedAt}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 text-sm lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="font-semibold text-foreground">Problema osservato</p>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {practice.observedProblem}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="font-semibold text-foreground">Pratica descritta</p>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {practice.practiceDescription}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="font-semibold text-foreground">Attori pubblici</p>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {practice.publicActors.join(", ")}
          </p>
          {practice.nonPublicActors?.length ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Altri soggetti citati/da verificare: {practice.nonPublicActors.join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          <RotateCcw className="h-4 w-4 text-primary" aria-hidden="true" />
          Domande civiche per Lamezia
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
          {practice.replicability.questionsForLamezia.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {practice.relatedInternalRoutes.map((href) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-primary/20 bg-background px-3 py-1 font-semibold text-primary hover:bg-primary/10"
            >
              {href.replace("/", "") || "home"}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card className="p-4 shadow-none">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Condizioni minime di replicabilità
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {practice.replicability.conditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5 p-4 shadow-none">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Rischi di lettura
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-950 dark:text-amber-100">
            {practice.replicability.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Fonti e caveat
        </p>
        <div className="mt-3 space-y-3">
          {practice.sources.map((source) => (
            <div key={`${practice.id}-${source.label}`} className="text-sm leading-relaxed">
              <Badge variant="outline" className="mb-1 text-[10px]">
                {sourceTypeLabel(source.type)}
              </Badge>
              <p className="text-muted-foreground">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                  >
                    {source.label}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  source.label
                )}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{source.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
          {practice.caveat}
        </p>
      </div>
    </article>
  );
}
