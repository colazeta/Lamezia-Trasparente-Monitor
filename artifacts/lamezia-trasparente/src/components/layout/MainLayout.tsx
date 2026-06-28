import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MigrationStatusBanner } from "@/components/admin/MigrationStatusBanner";
import { CivicHelperFAB } from "@/components/helper/CivicHelperFAB";
import { CivicAssistant } from "@/components/helper/CivicAssistant";
import { CivicWelcome } from "@/components/helper/CivicWelcome";

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
