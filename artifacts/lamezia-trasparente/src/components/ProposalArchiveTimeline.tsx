import { CalendarRange, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getProposalTimelineBuckets,
  type ProposalTimelineMode,
  type ProposalTimelineRange,
} from "@/data/proposalArchiveTimeline";
import type { PublicProposal } from "@/data/propostePubbliche";

export function ProposalArchiveTimeline({
  proposals,
  mode,
  activeRange,
  onModeChange,
  onRangeChange,
}: {
  proposals: readonly PublicProposal[];
  mode: ProposalTimelineMode;
  activeRange: ProposalTimelineRange | null;
  onModeChange: (mode: ProposalTimelineMode) => void;
  onRangeChange: (range: ProposalTimelineRange | null) => void;
}) {
  const buckets = getProposalTimelineBuckets(proposals, mode);
  const maxCount = Math.max(1, ...buckets.map((bucket) => bucket.count));

  return (
    <section
      aria-labelledby="timeline-proposte"
      className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarRange className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <h2 id="timeline-proposte" className="text-sm font-bold text-foreground">
              Distribuzione temporale
            </h2>
            <p className="text-xs text-muted-foreground">
              Clicca un mese per filtrare i dossier.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={mode === "origins" ? "default" : "outline"}
            onClick={() => {
              onModeChange("origins");
              onRangeChange(null);
            }}
          >
            Nascita
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "events" ? "default" : "outline"}
            onClick={() => {
              onModeChange("events");
              onRangeChange(null);
            }}
          >
            Sviluppi
          </Button>
          {activeRange ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onRangeChange(null)}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Tutto
            </Button>
          ) : null}
        </div>
      </div>

      {buckets.length > 0 ? (
        <div className="mt-3 overflow-x-auto pb-1">
          <div
            className="relative flex min-w-max items-end px-3"
            role="group"
            aria-label="Mesi della timeline delle proposte"
          >
            <div
              className="pointer-events-none absolute left-3 right-3 top-[2.55rem] h-px bg-border"
              aria-hidden="true"
            />
            {buckets.map((bucket) => {
              const active = activeRange?.key === bucket.key;
              const barHeight = bucket.count === 0
                ? 2
                : Math.max(5, Math.round((bucket.count / maxCount) * 26));
              const countLabel = mode === "origins"
                ? `${bucket.proposalCount} proposte`
                : `${bucket.eventCount} eventi su ${bucket.proposalCount} proposte`;

              return (
                <button
                  key={bucket.key}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${bucket.label}: ${countLabel}`}
                  className="group relative flex w-[4.6rem] shrink-0 flex-col items-center px-1 py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() =>
                    onRangeChange(
                      active
                        ? null
                        : {
                            key: bucket.key,
                            label: bucket.label,
                            start: bucket.start,
                            end: bucket.end,
                          },
                    )
                  }
                >
                  <span className="flex h-7 items-end" aria-hidden="true">
                    <span
                      className={
                        active
                          ? "w-2 rounded-t bg-primary"
                          : "w-2 rounded-t bg-primary/45 transition-colors group-hover:bg-primary/75"
                      }
                      style={{ height: `${barHeight}px` }}
                    />
                  </span>
                  <span
                    className={
                      active
                        ? "relative z-10 mt-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-primary bg-primary px-1.5 text-[10px] font-bold text-primary-foreground"
                        : "relative z-10 mt-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-border bg-background px-1.5 text-[10px] font-bold text-foreground transition-colors group-hover:border-primary/60"
                    }
                  >
                    {bucket.count}
                  </span>
                  <span className="mt-1 whitespace-nowrap text-[10px] font-medium capitalize text-muted-foreground">
                    {bucket.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Nessun evento disponibile per i filtri correnti.
        </p>
      )}

      {activeRange ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
          <span>Periodo selezionato</span>
          <Badge variant="secondary" className="capitalize">
            {activeRange.label}
          </Badge>
        </div>
      ) : null}
    </section>
  );
}
