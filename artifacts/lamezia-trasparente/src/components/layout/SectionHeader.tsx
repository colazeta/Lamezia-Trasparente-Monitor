import { SectionScaffold } from "@/components/civic-section/SectionScaffold";

/**
 * Legacy opt-in civic scaffold. Public route bodies now start from their
 * page-specific content instead of receiving this block automatically.
 */
export function SectionHeader() {
  return <SectionScaffold />;
}
