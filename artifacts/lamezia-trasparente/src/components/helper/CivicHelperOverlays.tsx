import { lazy, Suspense } from "react";

import { useCivicHelper } from "./CivicHelperContext";

const CivicAssistant = lazy(async () => ({
  default: (await import("./CivicAssistant")).CivicAssistant,
}));

const CivicWelcome = lazy(async () => ({
  default: (await import("./CivicWelcome")).CivicWelcome,
}));

function CivicHelperOverlayLoading() {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 right-4 z-[150] flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-muted-foreground shadow-lg"
      role="status"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
      />
      Caricamento strumenti civici…
    </div>
  );
}

export function CivicHelperOverlays() {
  const { assistantOpen, welcomeOpen } = useCivicHelper();

  if (!assistantOpen && !welcomeOpen) return null;

  return (
    <Suspense fallback={<CivicHelperOverlayLoading />}>
      {assistantOpen ? <CivicAssistant /> : null}
      {welcomeOpen ? <CivicWelcome /> : null}
    </Suspense>
  );
}
