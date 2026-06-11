import { describe, expect, it } from "vitest";

import {
  calculateFoiaCivicMeterMetrics,
  calculateIndicativeDeadline,
  type FoiaRegisterEntry,
  type FoiaRegisterStatus,
} from "@/lib/accessoCivicoRegister";

function entry(
  requestId: string,
  status: FoiaRegisterStatus,
  overrides: Partial<FoiaRegisterEntry["publicFields"]> = {},
): FoiaRegisterEntry {
  return {
    publicFields: {
      requestId,
      creationDate: "2026-05-01",
      subject: `Richiesta dimostrativa ${requestId}`,
      requestType: "generalizzato",
      recipientOffice: "Responsabile della trasparenza / Ufficio competente",
      sourceModule: "atti",
      status,
      ...overrides,
    },
    privateFields: {
      requesterName: "Dato privato non usato nelle metriche pubbliche",
      requesterContact: "privato@example.test",
    },
  };
}

describe("calculateIndicativeDeadline", () => {
  it("calcola il termine indicativo a 30 giorni con confini di mese e anno in UTC", () => {
    expect(calculateIndicativeDeadline("2026-01-31")).toBe("2026-03-02");
    expect(calculateIndicativeDeadline("2026-12-15")).toBe("2027-01-14");
  });

  it("restituisce undefined per date assenti o non valide", () => {
    expect(calculateIndicativeDeadline("2026-02-30")).toBeUndefined();
    expect(calculateIndicativeDeadline("non-una-data")).toBeUndefined();
  });
});

describe("calculateFoiaCivicMeterMetrics", () => {
  it("aggrega solo campi pubblici per stati, risposte, dinieghi, riesami e silenzi", () => {
    const metrics = calculateFoiaCivicMeterMetrics(
      [
        entry("FOIA-1", "in attesa", {
          sentDate: "2026-05-20",
          estimatedDeadline: "2026-06-19",
        }),
        entry("FOIA-2", "risposta ricevuta", {
          sentDate: "2026-05-10",
          estimatedDeadline: "2026-06-09",
        }),
        entry("FOIA-3", "diniego", {
          sentDate: "2026-05-09",
          estimatedDeadline: "2026-06-08",
        }),
        entry("FOIA-4", "riesame", {
          sentDate: "2026-05-01",
          estimatedDeadline: "2026-05-31",
        }),
        entry("FOIA-5", "silenzio", {
          sentDate: "2026-05-01",
          estimatedDeadline: "2026-05-31",
        }),
        entry("FOIA-6", "bozza"),
      ],
      { today: "2026-06-09" },
    );

    expect(metrics).toEqual({
      totalPublicRequests: 6,
      sentRequests: 5,
      pendingRequests: 1,
      upcomingDeadlines: 1,
      overdueToVerify: 2,
      answeredRequests: 1,
      deniedRequests: 1,
      reviewRequests: 1,
      silenceSignals: 1,
      noEstimatedDeadline: 0,
    });
  });

  it("tratta oggi e il quattordicesimo giorno come scadenze prossime, non oltre termine", () => {
    const metrics = calculateFoiaCivicMeterMetrics(
      [
        entry("FOIA-TODAY", "inviata", {
          sentDate: "2026-05-10",
          estimatedDeadline: "2026-06-09",
        }),
        entry("FOIA-PLUS-14", "in attesa", {
          sentDate: "2026-05-24",
          estimatedDeadline: "2026-06-23",
        }),
        entry("FOIA-PLUS-15", "in attesa", {
          sentDate: "2026-05-25",
          estimatedDeadline: "2026-06-24",
        }),
        entry("FOIA-YESTERDAY", "in attesa", {
          sentDate: "2026-05-09",
          estimatedDeadline: "2026-06-08",
        }),
      ],
      { today: "2026-06-09" },
    );

    expect(metrics.upcomingDeadlines).toBe(2);
    expect(metrics.overdueToVerify).toBe(1);
  });

  it("conta come senza scadenza stimata solo richieste inviate con scadenza assente o non valida", () => {
    const metrics = calculateFoiaCivicMeterMetrics(
      [
        entry("FOIA-NO-DEADLINE", "inviata", {
          sentDate: "2026-06-01",
        }),
        entry("FOIA-BAD-DEADLINE", "in attesa", {
          sentDate: "2026-06-01",
          estimatedDeadline: "2026-02-30",
        }),
        entry("FOIA-DRAFT", "bozza"),
      ],
      { today: "2026-06-09" },
    );

    expect(metrics.sentRequests).toBe(2);
    expect(metrics.noEstimatedDeadline).toBe(2);
    expect(metrics.totalPublicRequests).toBe(3);
  });
});
