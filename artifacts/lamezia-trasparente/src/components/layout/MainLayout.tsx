import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, FileText } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MigrationStatusBanner } from "@/components/admin/MigrationStatusBanner";
import { CivicHelperFAB } from "@/components/helper/CivicHelperFAB";
import { CivicAssistant } from "@/components/helper/CivicAssistant";
import { CivicWelcome } from "@/components/helper/CivicWelcome";
import { Button } from "@/components/ui/button";
import { SOURCE_HEALTH } from "@/data/sourceHealth";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const isAtlanteExplorer = location === "/atlante-territoriale";
  const showCivicHelper = !isAtlanteExplorer;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      {location === "/" ? <HomePriorityAccess /> : null}
      <MigrationStatusBanner />
      <main className="flex-1 bg-background">
        {children}
      </main>
      <Footer />
      {showCivicHelper ? (
        <>
          <CivicHelperFAB />
          <CivicAssistant />
          <CivicWelcome />
        </>
      ) : null}
    </div>
  );
}

function HomePriorityAccess() {
  return (
    <section
      data-tour="home-contracts-entry"
      className="border-b border-border bg-background"
      aria-label="Accessi prioritari"
    >
      <div className="container mx-auto grid gap-3 px-4 py-3 md:px-6 lg:grid-cols-2">
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Evidenze dati della piattaforma
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {SOURCE_HEALTH.sources.length} flussi reali integrati ·{" "}
                {SOURCE_HEALTH.coverageScore}% copertura documentata media
              </p>
            </div>
          </div>
          <Link href="/stato-monitoraggio" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Stato dei dati
            </Button>
          </Link>
        </article>

        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="mt-0.5 rounded-lg bg-brand/10 p-2 text-brand">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Contratti pubblici
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Segui il fascicolo dal programma fino a esecuzione, collaudi e
                verifiche.
              </p>
            </div>
          </div>
          <Link href="/contratti" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Apri contratti
            </Button>
          </Link>
        </article>
      </div>
    </section>
  );
}
