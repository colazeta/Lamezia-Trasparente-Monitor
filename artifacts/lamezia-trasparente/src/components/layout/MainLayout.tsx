import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { FileText } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MigrationStatusBanner } from "@/components/admin/MigrationStatusBanner";
import { CivicHelperFAB } from "@/components/helper/CivicHelperFAB";
import { CivicAssistant } from "@/components/helper/CivicAssistant";
import { CivicWelcome } from "@/components/helper/CivicWelcome";
import { Button } from "@/components/ui/button";

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
      {location === "/" ? <HomeContractsAccess /> : null}
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

function HomeContractsAccess() {
  return (
    <section
      data-tour="home-contracts-entry"
      className="border-b border-border bg-background"
    >
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Contratti pubblici
          </p>
          <p className="text-xs text-muted-foreground">
            Segui il fascicolo dal programma fino a esecuzione, collaudi e
            verifiche.
          </p>
        </div>
        <Link href="/contratti" className="w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <FileText className="mr-1 h-4 w-4" aria-hidden="true" />
            Apri sezione contratti
          </Button>
        </Link>
      </div>
    </section>
  );
}
