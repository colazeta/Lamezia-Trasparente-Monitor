import { lazy, Suspense, type ReactNode } from "react";
import { Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { CivicHelperProvider } from "@/components/helper/CivicHelperContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isProtectedAppPath } from "@/lib/authRouteMode";
import { WebMcpBridge } from "@/lib/webmcp";
import { Router } from "./Router";

const ClerkApp = lazy(() => import("./ClerkApp"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const configuredClerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function RedazioneUnavailablePage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-sidebar px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Area redazione
        </p>
        <h1 className="mt-3 text-2xl font-bold">
          Redazione non disponibile in questa anteprima
        </h1>
        <p className="mt-4 text-muted-foreground">
          La preview pubblica non ha una configurazione Clerk attiva. Per
          proteggere il percorso riservato, l’area redazione resta disattivata
          finché la chiave pubblicabile Clerk non viene configurata.
        </p>
        <a
          className="mt-6 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          href={basePath || "/"}
        >
          Torna alle pagine pubbliche
        </a>
      </section>
    </main>
  );
}

function AppLoading() {
  return (
    <main
      className="flex min-h-[100dvh] items-center justify-center bg-background px-4 text-sm font-semibold text-muted-foreground"
      role="status"
    >
      Caricamento area riservata…
    </main>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <CivicHelperProvider>{children}</CivicHelperProvider>
          <Toaster position="top-right" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

interface AppRoutesProps {
  clerkPubKey?: string;
  proxyUrl?: string;
}

export function AppRoutes({
  clerkPubKey = configuredClerkPubKey,
  proxyUrl = clerkProxyUrl,
}: AppRoutesProps = {}) {
  const [location] = useLocation();

  if (!isProtectedAppPath(location)) {
    return (
      <AppShell>
        <Router />
      </AppShell>
    );
  }

  if (!clerkPubKey) {
    return (
      <AppShell>
        <RedazioneUnavailablePage />
      </AppShell>
    );
  }

  return (
    <Suspense fallback={<AppLoading />}>
      <ClerkApp
        basePath={basePath}
        proxyUrl={proxyUrl}
        publishableKey={clerkPubKey}
        queryClient={queryClient}
      />
    </Suspense>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <WebMcpBridge />
      <AppRoutes />
    </WouterRouter>
  );
}

export default App;
