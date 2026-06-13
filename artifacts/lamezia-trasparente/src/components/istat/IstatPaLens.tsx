import type { ElementType } from "react";
import { Link } from "wouter";
import {
  BookOpenCheck,
  Bot,
  Building2,
  Database,
  ExternalLink,
  Info,
  Leaf,
  Network,
  ShieldCheck,
  Telescope,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ISTAT_PA_DIMENSION_BY_ID,
  ISTAT_PA_DIMENSIONS,
  ISTAT_PA_READING_RULES,
  ISTAT_PA_SOURCE,
  type IstatPaDimension,
  type IstatPaDimensionId,
  type IstatPaIconName,
} from "@/data/istatPaLens";

export type IstatPaLensVariant = "compact" | "inline" | "full";

const ISTAT_PA_ICONS: Record<IstatPaIconName, ElementType> = {
  "book-open-check": BookOpenCheck,
  bot: Bot,
  building: Building2,
  database: Database,
  leaf: Leaf,
  network: Network,
  "shield-check": ShieldCheck,
  users: Users,
};

function getDimensions(
  ids?: readonly IstatPaDimensionId[],
): readonly IstatPaDimension[] {
  return ids?.length
    ? ids.map((id) => ISTAT_PA_DIMENSION_BY_ID[id])
    : ISTAT_PA_DIMENSIONS;
}

function getDimensionIcon(dimension: IstatPaDimension): ElementType {
  return ISTAT_PA_ICONS[dimension.iconName];
}

export function IstatDimensionChips({
  dimensions,
  className,
}: {
  dimensions?: readonly IstatPaDimensionId[];
  className?: string;
}) {
  const items = getDimensions(dimensions);

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {items.map((dimension) => {
        const Icon = getDimensionIcon(dimension);
        return (
          <Badge
            key={dimension.id}
            variant="outline"
            className="border-primary/20 bg-primary/5 text-primary shadow-none"
          >
            <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
            ISTAT PA · {dimension.shortLabel}
          </Badge>
        );
      })}
    </div>
  );
}

export function IstatReadingRules({ className }: { className?: string }) {
  return (
    <ul
      className={`space-y-2 text-sm leading-6 text-muted-foreground ${className ?? ""}`}
    >
      {ISTAT_PA_READING_RULES.map((rule) => (
        <li key={rule} className="flex gap-2">
          <Info
            className="mt-1 h-3.5 w-3.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{rule}</span>
        </li>
      ))}
    </ul>
  );
}

export function IstatPaLensCard({
  variant = "compact",
  context = "generale",
  dimensions,
}: {
  variant?: IstatPaLensVariant;
  context?: string;
  dimensions?: readonly IstatPaDimensionId[];
}) {
  const items = getDimensions(dimensions);
  const isFull = variant === "full";

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Telescope className="h-4 w-4 text-primary" aria-hidden="true" />
          Lente ISTAT PA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          Il censimento ISTAT delle istituzioni pubbliche viene usato come griglia
          di lettura per orientare verifiche su capacità amministrativa,
          digitalizzazione, servizi, sostenibilità, sicurezza informatica e uso
          dell’IA nella PA.
        </p>
        <p>
          Nel contesto <span className="font-medium text-foreground">{context}</span>{" "}
          questa lente non produce punteggi sul Comune: indica quali documenti
          locali cercare, quali dati mancano e quali richieste civiche possono
          essere motivate.
        </p>
        <IstatDimensionChips dimensions={dimensions} />
        {isFull ? (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((dimension) => {
              const Icon = getDimensionIcon(dimension);
              return (
                <article
                  key={dimension.id}
                  className="rounded-xl border border-border bg-background/80 p-4"
                >
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {dimension.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {dimension.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Evidenze locali da cercare
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
                    {dimension.localEvidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/fonti-dati">Fonte e limiti</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/metodologia">Metodo di lettura</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={ISTAT_PA_SOURCE.href} target="_blank" rel="noreferrer">
              ISTAT
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>
        {isFull ? <IstatReadingRules /> : null}
      </CardContent>
    </Card>
  );
}
