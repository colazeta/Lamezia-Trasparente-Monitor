import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { SectionHeader } from "./SectionHeader";
import { Footer } from "./Footer";
import { MigrationStatusBanner } from "@/components/admin/MigrationStatusBanner";
import { PrototypeNotice } from "@/components/civic/PrototypeNotice";
import { CivicHelperFAB } from "@/components/helper/CivicHelperFAB";
import { CivicAssistant } from "@/components/helper/CivicAssistant";
import { CivicWelcome } from "@/components/helper/CivicWelcome";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <SectionHeader />
      <MigrationStatusBanner />
      <main className="flex-1 bg-background">
        <PrototypeNotice />
        {children}
      </main>
      <Footer />
      <CivicHelperFAB />
      <CivicAssistant />
      <CivicWelcome />
    </div>
  );
}
