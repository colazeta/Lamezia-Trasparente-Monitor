import { describe, it, expect } from "vitest";
import { extractPlaceCandidates, quartiereHintFromText } from "./geocode";

describe("extractPlaceCandidates", () => {
  it("estrae toponimi/POI civici introdotti da un prefisso", () => {
    expect(
      extractPlaceCandidates(
        "Lavori di manutenzione presso la Scuola Borrello di Nicastro",
      ),
    ).toContain("Scuola Borrello di Nicastro");

    expect(
      extractPlaceCandidates(
        "Riqualificazione dello Stadio Guido D'Ippolito",
      ),
    ).toContain("Stadio Guido D'Ippolito");

    expect(
      extractPlaceCandidates("Interventi al Cimitero di Sambiase"),
    ).toContain("Cimitero di Sambiase");
  });

  it("riconosce POI composti senza nome proprio", () => {
    expect(
      extractPlaceCandidates("Manutenzione della villa comunale"),
    ).toContain("villa comunale");
  });

  it("non estrae nulla quando non ci sono toponimi", () => {
    expect(
      extractPlaceCandidates(
        "Liquidazione fattura per fornitura di cancelleria",
      ),
    ).toEqual([]);
  });
});

describe("quartiereHintFromText", () => {
  it("mappa le frazioni principali sulla circoscrizione storica", () => {
    expect(quartiereHintFromText("intervento a Nicastro")).toBe("nicastro");
    expect(quartiereHintFromText("lavori a Sambiase")).toBe("sambiase");
    expect(quartiereHintFromText("manutenzione a Sant'Eufemia")).toBe(
      "santeufemia",
    );
    expect(quartiereHintFromText("zona Marinella")).toBe("santeufemia");
  });

  it("mappa contrade/quartieri minori sulla frazione di riferimento", () => {
    expect(quartiereHintFromText("contrada Zangarona")).toBe("sambiase");
    expect(quartiereHintFromText("quartiere Capizzaglie")).toBe("nicastro");
  });

  it("restituisce null quando non c'è alcun riferimento", () => {
    expect(quartiereHintFromText("liquidazione fattura energia")).toBeNull();
  });
});
