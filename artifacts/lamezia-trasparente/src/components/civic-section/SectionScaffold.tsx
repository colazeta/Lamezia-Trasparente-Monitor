import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  Database,
  FileSearch,
  Home,
  Info,
  ListChecks,
  Route,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SECTION_DATA_STATUS_LABELS,
  SECTION_LAUNCH_READINESS_LABELS,
  SECTION_SOURCE_TYPE_LABELS,
  SECTION_STATUS_LABELS,
  findSectionArchitecture,
  getRelatedSectionArchitectures,
  type SectionArchitecture,
  type SectionDataStatus,
  type SectionLaunchReadiness,
  type SectionStatus,
} from "@/data/sectionArchitecture";
import { findSectionByPath } from "@/components/layout/navSections";

const statusStyles: Record<
  SectionStatus,
  {
    variant: "success" | "secondary" | "warning" | "outline";
    icon: typeof Info;
  }
> = {
  demo: { variant: "warning", icon: AlertTriangle },
  partial: { variant: "secondary", icon: CircleDashed },
  verified: { variant: "success", icon: CheckCircle2 },
  "needs-source": { variant: "warning", icon: FileSearch },
  "under-construction": { variant: "outline", icon: Clock3 },
};

const dataStatusStyles: Record<
  SectionDataStatus,
  {
    variant: "success" | "secondary" | "warning" | "outline";
    icon: typeof Info;
  }
> = {
  demo: { variant: "warning", icon: AlertTriangle },
  partial: { variant: "secondary", icon: CircleDashed },
  missing: { variant: "outline", icon: FileSearch },
  verified: { variant: "success", icon: CheckCircle2 },
};

const launchReadinessStyles: Record<
  SectionLaunchReadiness,
  {
    variant: "success" | "secondary" | "warning" | "outline";
    icon: typeof Info;
  }
> = {
  "launch-ready": { variant: "success", icon: ShieldCheck },
  "launch-ready-with-caveats": { variant: "secondary", icon: Info },
  "not-launch-ready": { variant: "warning", icon: AlertTriangle },
};

export function SectionScaffold() {
  const [location] = useLocation();
  const section = findSectionArchitecture(location);

  if (!section || section.path === "/") {
    return null;
  }

  const active = findSectionByPath(section.path);
  const Icon = active?.item.icon ?? Database;

  return (
    <section className="border-b border-border bg-muted/25">
      <div className="container mx-auto px-4 py-5 md:px-6 md:py-7">
        <nav
          aria-label="Percorso di navigazione"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href="/"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          <span>{section.group}</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          <span
            aria-current="page"
            className="flex items-center gap-1.5 font-semibold text-foreground"
          >
            <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {section.title}
          </span>
        </nav>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <SectionStatusBadge status={section.status} />
              <LaunchReadinessBadge readiness={section.launchReadiness} />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-foreground md:text-3xl">
              {section.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              {section.publicExplanation}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <CivicQuestionBlock question={section.civicQuestion} />
              <WhatThisHelpsBlock items={section.helpsUnderstand} />
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <DataReadinessPanel section={section} compact />
            <RelatedNavigationBlock section={section} />
          </div>
        </div>

        <PageImplementationPanel section={section} />
      </div>
    </section>
  );
}

export function SectionStatusBadge({ status }: { status: SectionStatus }) {
  const { variant, icon: Icon } = statusStyles[status];

  return (
    <Badge variant={variant} className="gap-1.5">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {SECTION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function VerificationBadge({ status }: { status: SectionDataStatus }) {
  const { variant, icon: Icon } = dataStatusStyles[status];

  return (
    <Badge variant={variant} className="gap-1.5">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {SECTION_DATA_STATUS_LABELS[status]}
    </Badge>
  );
}

function LaunchReadinessBadge({
  readiness,
}: {
  readiness: SectionLaunchReadiness;
}) {
  const { variant, icon: Icon } = launchReadinessStyles[readiness];

  return (
    <Badge variant={variant} className="gap-1.5">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {SECTION_LAUNCH_READINESS_LABELS[readiness]}
    </Badge>
  );
}

export function CivicQuestionBlock({ question }: { question: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/75 p-4">
      <p className="text-[11px] font-bold uppercase text-primary">
        Domanda civica
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
        {question}
      </p>
    </div>
  );
}

function WhatThisHelpsBlock({ items }: { items: readonly string[] }) {
  return (
    <div className="rounded-lg border border-border bg-background/75 p-4">
      <p className="text-[11px] font-bold uppercase text-primary">
        Aiuta a capire
      </p>
      <ul className="mt-2 space-y-1.5 text-sm leading-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PageImplementationPanel({
  section,
}: {
  section: SectionArchitecture;
}) {
  const blueprint = section.pageImplementation;

  if (!blueprint.isPriorityPage) return null;

  return (
    <div
      className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)_minmax(16rem,0.85fr)]"
      aria-label={`Struttura operativa della sezione ${section.title}`}
    >
      <div className="rounded-lg border border-border bg-background/75 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-primary">
          <Database className="h-3.5 w-3.5" aria-hidden="true" />
          Oggetto primario
        </p>
        <p className="mt-2 text-sm leading-6 text-foreground">
          {blueprint.primaryDataObject}
        </p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold uppercase text-muted-foreground">
              Fonte, stato e limiti
            </dt>
            <dd className="mt-1 leading-5 text-muted-foreground">
              {blueprint.sourceStatusPlacement}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase text-muted-foreground">
              Azione cittadino
            </dt>
            <dd className="mt-1 leading-5 text-muted-foreground">
              {blueprint.citizenAction}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-background/75 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-primary">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
          Gerarchia pagina
        </p>
        <ol className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
          {blueprint.contentHierarchy.map((item, index) => (
            <li key={item} className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-background/75 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-primary">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Controlli e postura
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {blueprint.usefulControls.map((control) => (
            <span
              key={control}
              className="rounded-full border border-border bg-muted/35 px-2 py-1 text-xs font-semibold text-muted-foreground"
            >
              {control}
            </span>
          ))}
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-muted-foreground">
              <Route className="h-3.5 w-3.5" aria-hidden="true" />
              Lancio pubblico
            </dt>
            <dd className="mt-1 leading-5 text-foreground">
              {blueprint.launchPosture}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase text-muted-foreground">
              Dato ancora necessario
            </dt>
            <dd className="mt-1 leading-5 text-muted-foreground">
              {blueprint.remainingDataDependency}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function DataReadinessPanel({
  section,
  compact = false,
}: {
  section: SectionArchitecture;
  compact?: boolean;
}) {
  const readiness = section.dataReadiness;

  return (
    <div className="rounded-lg border border-border bg-background/75 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase text-primary">
            Stato dati e fonti
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ultimo aggiornamento: {section.lastUpdated}
          </p>
        </div>
        <VerificationBadge status={readiness.dataStatus} />
      </div>

      <dl
        className={cn(
          "mt-4 grid gap-3 text-sm",
          compact ? "grid-cols-1" : "md:grid-cols-2",
        )}
      >
        <ReadinessItem label="Fonte attesa" value={readiness.expectedSource} />
        <ReadinessItem
          label="Tipo fonte"
          value={SECTION_SOURCE_TYPE_LABELS[readiness.sourceType]}
        />
        <ReadinessItem
          label="Frequenza target"
          value={readiness.updateFrequency}
        />
        <ReadinessItem label="Verifica" value={readiness.verificationLevel} />
        <ReadinessItem label="Ingestion" value={readiness.ingestionStatus} />
        <ReadinessItem label="Limiti noti" value={readiness.knownLimits} />
      </dl>

      <EmptyDataState section={section} compact={compact} />
    </div>
  );
}

function ReadinessItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-bold uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-5 text-foreground">{value}</dd>
    </div>
  );
}

export function EmptyDataState({
  section,
  compact = false,
}: {
  section: SectionArchitecture;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-4 rounded-md border border-dashed border-border bg-muted/35 p-3",
        !compact && "md:col-span-2",
      )}
    >
      <p className="text-xs font-semibold text-foreground">
        {section.emptyState.title}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {section.emptyState.description}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {section.emptyState.whyItMatters}
      </p>
    </div>
  );
}

export function RelatedNavigationBlock({
  section,
}: {
  section: SectionArchitecture;
}) {
  const related = getRelatedSectionArchitectures(section);

  if (related.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-background/75 p-4">
      <p className="text-[11px] font-bold uppercase text-primary">
        Prossimi passi
      </p>
      <div className="mt-3 space-y-2">
        {related.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-w-0 items-start justify-between gap-3 rounded-md border border-border bg-muted/25 p-3 text-sm transition-colors hover:border-primary/30 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="min-w-0">
              <span className="block font-semibold text-foreground">
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                {item.reason}
              </span>
            </span>
            <ArrowRight
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PageSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-10 md:py-14", className)}>
      <div className="container mx-auto px-4 md:px-6">{children}</div>
    </section>
  );
}
