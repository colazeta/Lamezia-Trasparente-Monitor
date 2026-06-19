import type { ReactNode } from "react";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, FileWarning, Info } from "lucide-react";

export type V0SectionLandingProps = {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  subtitle: ReactNode;
  stateLabel: string;
  stateDescription: string;
  findItems: string[];
  missingItems: string[];
  sourceLimit: ReactNode;
  cta: { label: string; href: string };
  secondaryLink?: { label: string; href: string };
  actions?: ReactNode;
};

export function V0SectionLanding({
  eyebrow,
  icon: Icon,
  title,
  subtitle,
  stateLabel,
  stateDescription,
  findItems,
  missingItems,
  sourceLimit,
  cta,
  secondaryLink,
  actions,
}: V0SectionLandingProps) {
  return (
    <section
      className="mb-8 rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6"
      aria-labelledby="v0-section-title"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <span className="eyebrow text-primary">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {eyebrow}
          </span>
          <h1
            id="v0-section-title"
            className="mt-2 text-3xl font-display font-bold tracking-tight md:text-4xl"
          >
            {title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              {stateLabel}
            </span>
            <span className="text-muted-foreground">{stateDescription}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={cta.href}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {secondaryLink ? (
            <Link
              href={secondaryLink.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {secondaryLink.label}
            </Link>
          ) : null}
          {actions}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoPanel
          title="Cosa trovi qui"
          icon={CheckCircle2}
          items={findItems}
        />
        <InfoPanel
          title="Cosa manca ancora"
          icon={FileWarning}
          items={missingItems}
        />
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 font-display text-base font-bold">
            <Info className="h-4 w-4 text-primary" aria-hidden="true" />
            Fonti e limiti
          </div>
          <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {sourceLimit}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoPanel({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 font-display text-base font-bold">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
