import { describe, it, expect } from "vitest";
import { extractBeneficiario } from "./anacContracts";

describe("extractBeneficiario", () => {
  it("estrae ragioni sociali che terminano con una forma giuridica", () => {
    expect(
      extractBeneficiario(
        "Liquidazione fatture emesse dalla società Hera Comm Spa, per la fornitura di energia elettrica. CIG B0FBDECA67.",
      ),
    ).toBe("Hera Comm Spa");

    expect(
      extractBeneficiario(
        "Autorizzazione subappalto lavori all'impresa COSTRUZIONI STRADALI SRL. CIG A015882CCD.",
      ),
    ).toBe("COSTRUZIONI STRADALI SRL");

    expect(
      extractBeneficiario(
        'Liquidazione SAC n.2 del "Servizio di disinfestazione" alla Società Artemide Global Service Srl CIG B794E31C60',
      ),
    ).toBe("Artemide Global Service Srl");

    expect(
      extractBeneficiario(
        "Liquidazione saldo 2025 INRETE Società Cooperativa sociale -CIG: B07E0997CB",
      ),
    ).toBe("INRETE Società Cooperativa sociale");

    expect(
      extractBeneficiario(
        "Liquidazione fattura numero 89 emessa dalla Società Tipografica Lametina S.n.c., a seguito della fornitura di timbri. CIG. BB8757C878",
      ),
    ).toBe("Tipografica Lametina S.n.c");
  });

  it("estrae nomi propri introdotti da frasi esplicite senza forma giuridica", () => {
    expect(
      extractBeneficiario(
        "Liquidazione fattura in favore dell'operatore economico Music Art Service di Tonino Sirianni, per l'espletamento del servizio. CIG BA558BFAEF",
      ),
    ).toBe("Music Art Service di Tonino Sirianni");
  });

  it("non inventa beneficiari quando il testo non ne nomina uno", () => {
    expect(
      extractBeneficiario(
        "Assunzione di impegno di spesa per la stampa e fornitura di n. 200 manifesti. CIG. BBABD73FA3",
      ),
    ).toBeNull();

    expect(
      extractBeneficiario(
        "Servizio di supporto al responsabile per la transizione digitale - Impegno spesa anno 2027 - CIG B17919B85C.",
      ),
    ).toBeNull();

    expect(
      extractBeneficiario(
        "PNRR M4C1I1.1 - Lavori relativi all'intervento di realizzazione \u201cAsilo Nido NIKE\u201d. Liquidazione SAL n. 1. CUP C86F24000150006. CIG B63A87D3EA.",
      ),
    ).toBeNull();
  });

  it("non scambia un sostantivo comune per un'azienda", () => {
    expect(
      extractBeneficiario(
        "Liquidazione servizio prestato dall'agronomo per la pratica di estirpazione. CIG B7E82FF9E0",
      ),
    ).toBeNull();
  });

  it("è deterministico (idempotente) sullo stesso input", () => {
    const text =
      "Liquidazione fatture emesse dalla società Hera Comm Spa. CIG B0FBDECA67.";
    expect(extractBeneficiario(text)).toBe(extractBeneficiario(text));
  });
});
