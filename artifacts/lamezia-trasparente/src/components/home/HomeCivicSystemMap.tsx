import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  CircleDotDashed,
  Clock3,
} from "lucide-react";

import {
  NAV_GROUPS,
  SECTION_STATE_LABELS,
  getNavItemStateLabel,
  isNavItemMuted,
  isNavItemNavigable,
  type NavItem,
  type SectionAvailabilityState,
} from "@/components/layout/navSections";
import { cn } from "@/lib/utils";

const STATE_META: Record<
  Exclude<SectionAvailabilityState, "hidden">,
  {
    icon: typeof CheckCircle2;
    badgeClassName: string;
    iconClassName: string;
    itemClassName: string;
  }
> = {
  available: {
    icon: CheckCircle2,
    badgeClassName:
      "border-primary/25 bg-primary/10 text-primary dark:bg-primary/15",
    iconClassName: "bg-primary text-primary-foreground shadow-sm",
    itemClassName:
      "border-primary/30 bg-primary/10 text-foreground ring-1 ring-primary/10 hover:border-primary/45 hover:bg-primary/15",
  },
  in_progress: {
    icon: Clock3,
    badgeClassName:
      "border-border bg-muted text-muted-foreground",
    iconClassName: "bg-muted text-muted-foreground",
    itemClassName:
      "border-border bg-muted/35 text-muted-foreground hover:border-border hover:bg-muted/55",
  },
  planned: {
    icon: CircleDotDashed,
    badgeClassName:
      "border-dashed border-border bg-background text-muted-foreground",
    iconClassName: "bg-background text-muted-foreground",
    itemClassName:
      "border-dashed border-border bg-muted/20 text-muted-foreground opacity-75",
  },
};

function stateMeta(item: NavItem) {
  return STATE_META[item.state === "hidden" ? "planned" : item.state];
}

function SectionItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const navigable = isNavItemNavigable(item);
  const muted = isNavItemMuted(item);
  const meta = stateMeta(item);
  const StatusIcon = meta.icon;
  const content = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
          meta.iconClassName,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold leading-snug",
              muted ? "text-foreground/80" : "text-foreground",
            )}
          >
            {item.label}
          </span>
          {item.state !== "available" ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                meta.badgeClassName,
              )}
            >
              <StatusIcon className="h-3 w-3" aria-hidden="true" />
              {getNavItemStateLabel(item)}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </span>
      </span>
      {navigable ? (
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  const className = cn(
    "group flex min-h-[5.25rem] items-start gap-3 rounded-lg border p-3 text-left transition-colors sm:p-3.5",
    meta.itemClassName,
    navigable
      ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      : "cursor-not-allowed",
  );

  return navigable ? (
    <Link href={item.href} className={className} aria-label={item.label}>
      {content}
    </Link>
  ) : (
    <div className={className} aria-disabled="true">
      {content}
    </div>
  );
}

function MacroAreaBand({
  group,
  index,
}: {
  group: (typeof NAV_GROUPS)[number];
  index: number;
}) {
  const isTechnicalBand = group.label === "Stato delle fonti e monitoraggio";

  return (
    <section
      className={cn(
        "grid gap-5 border-t border-border py-7 lg:grid-cols-[minmax(12rem,18rem)_1fr] lg:gap-8",
        isTechnicalBand && "bg-muted/20 px-4 sm:-mx-4 sm:px-4",
      )}
      aria-labelledby={`home-civic-area-${index + 1}`}
    >
      <div className="lg:pt-1">
        <div
          className={cn(
            "mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold",
            isTechnicalBand
              ? "border-border bg-background text-muted-foreground"
              : "border-primary/30 bg-primary/10 text-primary",
          )}
        >
          {index + 1}
        </div>
        <h3
          id={`home-civic-area-${index + 1}`}
          className="font-display text-xl font-bold tracking-tight text-foreground"
        >
          {group.label}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {group.description}
        </p>
      </div>

      <div
        className={cn(
          "grid gap-2.5 sm:grid-cols-2",
          group.items.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3",
        )}
      >
        {group.items.map((item) => (
          <SectionItem key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}

export function HomeCivicSystemMap({
  title = "Scegli un percorso civico",
  subtitle = "Otto macro-aree ordinano le sezioni civiche: poche schede per fascia, stati chiari e meno rumore operativo.",
  className,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <section
      data-tour="home-themes"
      className={cn(
        "border-b border-border bg-background py-10 md:py-14",
        className,
      )}
      aria-labelledby="home-civic-system-map"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">Mappa civica</span>
            <h2
              id="home-civic-system-map"
              className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              {title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["available", "in_progress", "planned"] as const).map((state) => {
              const meta = STATE_META[state];
              const Icon = meta.icon;
              return (
                <span
                  key={state}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                    meta.badgeClassName,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {SECTION_STATE_LABELS[state]}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          {NAV_GROUPS.map((group, index) => (
            <MacroAreaBand group={group} index={index} key={group.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
