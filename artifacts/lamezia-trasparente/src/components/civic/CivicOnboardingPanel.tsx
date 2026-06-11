import * as React from "react";
import { ExternalLink, Info, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const civicOnboardingStatuses = [
  "demo",
  "documentato",
  "sperimentale",
  "stabile",
] as const;

export type CivicOnboardingStatus = (typeof civicOnboardingStatuses)[number];

export type CivicOnboardingVariant = "compact" | "full";

export type CivicOnboardingMethodologyLink = {
  label: string;
  href: string;
};

export type CivicOnboardingRelatedSection = {
  title: string;
  description?: string;
  href?: string;
};

export type CivicOnboardingPanelProps = {
  title: string;
  description: string;
  status: CivicOnboardingStatus;
  caution: string;
  methodologyLink?: CivicOnboardingMethodologyLink;
  relatedSections?: CivicOnboardingRelatedSection[];
  variant?: CivicOnboardingVariant;
  className?: string;
};

const statusCopy: Record<
  CivicOnboardingStatus,
  { label: string; note: string; badgeClassName: string }
> = {
  demo: {
    label: "Demo",
    note: "Contenuto dimostrativo o statico, utile per spiegare il metodo senza rappresentare un quadro completo.",
    badgeClassName: "border-amber-300 bg-amber-50 text-amber-900",
  },
  documentato: {
    label: "Documentato",
    note: "Contenuto basato su fonti, criteri o passaggi descritti nella documentazione del progetto.",
    badgeClassName: "border-sky-300 bg-sky-50 text-sky-900",
  },
  sperimentale: {
    label: "Sperimentale",
    note: "Modulo in verifica: lettura, copertura e metriche possono richiedere controlli metodologici aggiuntivi.",
    badgeClassName: "border-violet-300 bg-violet-50 text-violet-900",
  },
  stabile: {
    label: "Stabile",
    note: "Modulo con impostazione consolidata, fermo restando il controllo sulle fonti e sugli aggiornamenti disponibili.",
    badgeClassName: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
};

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:)/i.test(href);
}

function CivicLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const external = isExternalHref(href);

  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-1 font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
    >
      {children}
      {external ? (
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      ) : null}
    </a>
  );
}

export function CivicOnboardingPanel({
  title,
  description,
  status,
  caution,
  methodologyLink,
  relatedSections,
  variant = "full",
  className,
}: CivicOnboardingPanelProps) {
  const headingId = React.useId();
  const cautionId = React.useId();
  const statusDetails = statusCopy[status];
  const hasRelatedSections = relatedSections && relatedSections.length > 0;
  const isCompact = variant === "compact";

  return (
    <Card
      className={cn(
        "border-brand/20 bg-brand/5 text-foreground shadow-sm",
        isCompact ? "p-4" : "p-5 md:p-6",
        className,
      )}
    >
      <section aria-labelledby={headingId} aria-describedby={cautionId}>
        <div
          className={cn(
            "flex gap-3",
            isCompact ? "items-start" : "items-start md:gap-4",
          )}
        >
          <div
            className={cn(
              "shrink-0 rounded-full bg-background text-brand ring-1 ring-brand/20",
              isCompact ? "p-2" : "p-3",
            )}
            aria-hidden="true"
          >
            {status === "stabile" ? (
              <ShieldCheck className={cn(isCompact ? "h-4 w-4" : "h-5 w-5")} />
            ) : (
              <Info className={cn(isCompact ? "h-4 w-4" : "h-5 w-5")} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id={headingId}
                className={cn(
                  "font-semibold tracking-tight text-foreground",
                  isCompact ? "text-base" : "text-xl",
                )}
              >
                {title}
              </h2>
              <Badge
                variant="outline"
                className={cn("shrink-0", statusDetails.badgeClassName)}
              >
                {statusDetails.label}
              </Badge>
            </div>

            <p
              className={cn(
                "mt-2 leading-relaxed text-muted-foreground",
                isCompact ? "text-sm" : "text-base",
              )}
            >
              {description}
            </p>

            {!isCompact ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {statusDetails.note}
              </p>
            ) : null}

            <p
              id={cautionId}
              className={cn(
                "mt-3 rounded-md border border-border bg-background/80 leading-relaxed text-foreground",
                isCompact ? "p-3 text-sm" : "p-4 text-sm",
              )}
            >
              <span className="font-semibold">Nota di cautela: </span>
              {caution}
            </p>

            {methodologyLink || hasRelatedSections ? (
              isCompact ? (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  {methodologyLink ? (
                    <CivicLink href={methodologyLink.href}>
                      {methodologyLink.label}
                    </CivicLink>
                  ) : null}
                  {hasRelatedSections
                    ? relatedSections.map((section) =>
                        section.href ? (
                          <CivicLink
                            key={`${section.title}-${section.href}`}
                            href={section.href}
                          >
                            {section.title}
                          </CivicLink>
                        ) : (
                          <span
                            key={`${section.title}-static`}
                            className="font-medium text-foreground"
                          >
                            {section.title}
                          </span>
                        ),
                      )
                    : null}
                </div>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {methodologyLink ? (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Metodo e limiti
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Consulta la documentazione prima di usare indicatori o
                        sintesi come base di valutazione.
                      </p>
                      <CivicLink
                        href={methodologyLink.href}
                        className="mt-2 text-sm"
                      >
                        {methodologyLink.label}
                      </CivicLink>
                    </div>
                  ) : null}

                  {hasRelatedSections ? (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Sezioni correlate
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {relatedSections.map((section) => (
                          <li
                            key={`${section.title}-${section.href ?? "static"}`}
                          >
                            {section.href ? (
                              <CivicLink href={section.href}>
                                {section.title}
                              </CivicLink>
                            ) : (
                              <span className="font-medium text-foreground">
                                {section.title}
                              </span>
                            )}
                            {section.description ? (
                              <p className="mt-0.5 leading-relaxed">
                                {section.description}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )
            ) : null}
          </div>
        </div>
      </section>
    </Card>
  );
}
