import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { X, ChevronLeft, ChevronRight, Map, Navigation } from "lucide-react";
import { useCivicHelper, type GuideContents } from "./CivicHelperContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tour step model — flat list ordered by (section-array-order, step.order)
// ---------------------------------------------------------------------------

type TourEntry = {
  route: string;
  sectionTitle: string;
  target: string;
  text: string;
};

/** Build the ordered flat step list from guide contents.
 *  Sections keep their backend array order; within each section steps are
 *  sorted by `order`. This avoids the "all step-1s, then all step-2s" bug
 *  that results from sorting the merged list by a per-section `order` field.
 */
function buildTourEntries(contents: GuideContents): TourEntry[] {
  return contents.sections.flatMap((section) =>
    section.tourSteps
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((step) => ({
        route: section.route,
        sectionTitle: section.title,
        target: step.target,
        text: step.text,
      })),
  );
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

type TooltipPlacement = "top" | "bottom" | "left" | "right";

function getTargetEl(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

function computePlacement(rect: DOMRect): TooltipPlacement {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const cy = rect.top + rect.height / 2;
  const cx = rect.left + rect.width / 2;
  if (cy > vh * 0.6) return "top";
  if (cx < vw * 0.3) return "right";
  if (cx > vw * 0.7) return "left";
  return "bottom";
}

function tooltipStyle(
  rect: DOMRect,
  placement: TooltipPlacement,
): React.CSSProperties {
  const GAP = 12;
  const W = 320;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const rTop = rect.top + scrollY;
  const rLeft = rect.left + scrollX;
  const rRight = rect.right + scrollX;
  const rBottom = rect.bottom + scrollY;
  const rCx = rLeft + rect.width / 2;
  const rCy = rTop + rect.height / 2;
  const safeL = (v: number) =>
    Math.max(16, Math.min(v, window.innerWidth + scrollX - W - 16));

  switch (placement) {
    case "bottom":
      return { position: "absolute", top: rBottom + GAP, left: safeL(rCx - W / 2), width: W };
    case "top":
      return { position: "absolute", top: rTop - GAP, left: safeL(rCx - W / 2), width: W, transform: "translateY(-100%)" };
    case "right":
      return { position: "absolute", top: rCy, left: rRight + GAP, width: W, transform: "translateY(-50%)" };
    case "left":
      return { position: "absolute", top: rCy, left: rLeft - GAP - W, width: W, transform: "translateY(-50%)" };
  }
}

function fallbackTooltipStyle(): React.CSSProperties {
  return {
    position: "fixed",
    bottom: 96,
    left: "50%",
    transform: "translateX(-50%)",
    width: 320,
    zIndex: 202,
  };
}

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

/** Returns true only for SPA routes the tour can safely navigate to.
 *  External URLs, /api/* paths and non-slash-prefixed strings are rejected. */
function isSpaRoute(route: string): boolean {
  if (!route.startsWith("/")) return false;
  if (route.startsWith("/api/")) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CivicTour() {
  const {
    tourOpen,
    tourStep,
    guideContents,
    nextTourStep,
    prevTourStep,
    closeTour,
    skipTour,
  } = useCivicHelper();

  const [location, navigate] = useLocation();

  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>(fallbackTooltipStyle());
  const [placement, setPlacement] = useState<TooltipPlacement>("bottom");
  const [targetMissing, setTargetMissing] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allSteps: TourEntry[] = guideContents ? buildTourEntries(guideContents) : [];
  const current = allSteps[tourStep] ?? null;
  const total = allSteps.length;
  const isLast = tourStep >= total - 1;

  // ---------------------------------------------------------------------------
  // When the current step's route differs from the current page: navigate there.
  // Non-SPA routes (e.g. /api/*) are skipped — the tour stays on the current
  // page and the tooltip falls back to the centered position.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!tourOpen || !current) return;

    const stepRoute = current.route;
    if (!isSpaRoute(stepRoute)) {
      // Can't navigate to an external/API route — stay put.
      setNavigating(false);
      return;
    }
    if (stepRoute !== location) {
      setNavigating(true);
      setHighlightRect(null);
      setTooltipPos(fallbackTooltipStyle());
      navigate(stepRoute);
    } else {
      setNavigating(false);
    }
  }, [tourOpen, current?.route, current?.target, location, navigate]);

  // ---------------------------------------------------------------------------
  // Poll the DOM for the target element (after navigation, element may appear
  // with a slight delay as the new page renders).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!tourOpen || !current) {
      setHighlightRect(null);
      return;
    }
    if (navigating) return;

    function update() {
      if (!current) return;
      const el = getTargetEl(current.target);
      if (!el) {
        setTargetMissing(true);
        setHighlightRect(null);
        setTooltipPos(fallbackTooltipStyle());
        return;
      }
      setTargetMissing(false);
      const rect = el.getBoundingClientRect();
      setHighlightRect(rect);
      const pl = computePlacement(rect);
      setPlacement(pl);
      setTooltipPos(tooltipStyle(rect, pl));

      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    update();
    intervalRef.current = setInterval(update, 300);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tourOpen, current, navigating]);

  if (!tourOpen || !current || total === 0) return null;

  const PAD = 6;

  return (
    <>
      {/* Semi-transparent overlay */}
      <div
        className="fixed inset-0 z-[200] pointer-events-none"
        style={{ background: "rgba(0,0,0,0.45)" }}
      />

      {/* Spotlight highlight */}
      {highlightRect && !navigating && (
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            zIndex: 201,
            top: highlightRect.top + window.scrollY - PAD,
            left: highlightRect.left + window.scrollX - PAD,
            width: highlightRect.width + PAD * 2,
            height: highlightRect.height + PAD * 2,
            borderRadius: 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
            border: "2px solid hsl(var(--primary))",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="z-[202] rounded-xl border border-border bg-background shadow-2xl p-4"
        style={navigating ? fallbackTooltipStyle() : tooltipPos}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <Map className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{current.sectionTitle}</span>
            <span className="text-muted-foreground font-normal">
              {tourStep + 1}/{total}
            </span>
          </div>
          <button
            onClick={skipTour}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Chiudi tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= tourStep ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        {/* Body */}
        {navigating ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Navigation className="h-4 w-4 shrink-0 animate-pulse text-primary" />
            Navigo alla sezione <strong className="text-foreground">{current.sectionTitle}</strong>…
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground mb-4">
            {current.text}
            {targetMissing && (
              <span className="block mt-2 text-xs text-muted-foreground italic">
                (L'elemento non è visibile in questa vista — scorri la pagina)
              </span>
            )}
          </p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipTour}
            className="text-muted-foreground text-xs"
          >
            Salta tour
          </Button>
          <div className="flex gap-2">
            {tourStep > 0 && (
              <Button variant="outline" size="sm" onClick={prevTourStep} disabled={navigating}>
                <ChevronLeft className="h-4 w-4" />
                Indietro
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={closeTour}>
                Fine!
              </Button>
            ) : (
              <Button size="sm" onClick={nextTourStep} disabled={navigating}>
                Avanti
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
