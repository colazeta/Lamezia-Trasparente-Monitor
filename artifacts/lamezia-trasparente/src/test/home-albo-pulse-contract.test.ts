import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const homePath = path.resolve(testDir, "../pages/Home.tsx");

function readHome() {
  return readFileSync(homePath, "utf8");
}

describe("home daily civic pulse contract", () => {
  it("uses the public-safe Albo diff as the primary daily activity source", () => {
    const home = readHome();

    expect(home).toContain("ALBO_PUBLIC_DIFF_NEW_ITEMS");
    expect(home).toContain("ALBO_PUBLIC_DIFF_CHANGED_ITEMS");
    expect(home).toContain("ALBO_PUBLIC_DIFF_REMOVED_ITEMS");
    expect(home).toContain("ALBO_OPERATIONAL_STATUS");
    expect(home).toContain("Cosa è cambiato dall&apos;ultimo controllo");
    expect(home).not.toContain("useGetRecentActivity");
  });

  it("keeps freshness visible next to the Albo pulse", () => {
    const home = readHome();

    expect(home).toContain("Ultimo controllo");
    expect(home).toContain("Prossimo controllo");
    expect(home).toContain("baseline pubblica precedente");
  });

  it("gives council and commissions a clear sourced path from the homepage", () => {
    const home = readHome();

    expect(home).toContain('title: "Consiglio e Commissioni"');
    expect(home).toContain('href: "/convocazioni"');
    expect(home).toContain("<HomeInstitutionalSessions />");
    expect(home).toContain("Copertura iniziale");
  });
});
