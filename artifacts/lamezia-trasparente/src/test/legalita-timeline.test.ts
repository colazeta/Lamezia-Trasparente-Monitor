import { describe, expect, it } from "vitest";

import {
  countLegalitaTimelineEvents,
  getLegalitaTimelineCategoryLabel,
  getLegalitaTimelineEventLabel,
  getLegalitaTimelineNonPublishableEvents,
  getLegalitaTimelineNonPublishableReasons,
  getLegalitaTimelineVerificationStatusLabel,
  isValidLegalitaTimelineDate,
  isValidLegalitaTimelineSourceUrl,
  type LegalitaTimelineEvent,
  normalizeLegalitaTimelineSourceUrl,
  sortLegalitaTimelineEvents,
} from "@/lib/legalitaTimeline";

const baseEvent: LegalitaTimelineEvent = {
  id: "evt-001",
  title: "Evento dimostrativo locale",
  date: "2025-01-15",
  category: "atto_pubblico",
  sourceType: "dataset_demo",
  verificationStatus: "verificato_documentale",
  sourceUrl: "demo://timeline/evento-dimostrativo",
  note: "Record demo-only senza dati reali.",
};

describe("legalitaTimeline", () => {
  it("sorts events deterministically by date and id without mutating input", () => {
    const events: LegalitaTimelineEvent[] = [
      { ...baseEvent, id: "evt-c", date: "2025-02-01" },
      { ...baseEvent, id: "evt-b", date: "2025-01-15" },
      { ...baseEvent, id: "evt-a", date: "2025-01-15" },
    ];
    const originalOrder = events.map((event) => event.id);

    const sorted = sortLegalitaTimelineEvents(events);

    expect(sorted.map((event) => event.id)).toEqual([
      "evt-a",
      "evt-b",
      "evt-c",
    ]);
    expect(events.map((event) => event.id)).toEqual(originalOrder);
    expect(sorted).not.toBe(events);
  });

  it("validates YYYY-MM-DD dates without permissive JavaScript normalization", () => {
    expect(isValidLegalitaTimelineDate("2024-02-29")).toBe(true);
    expect(isValidLegalitaTimelineDate("2023-02-29")).toBe(false);
    expect(isValidLegalitaTimelineDate("2025-02-30")).toBe(false);
    expect(isValidLegalitaTimelineDate("2025-13-01")).toBe(false);
    expect(isValidLegalitaTimelineDate("2025-1-01")).toBe(false);
    expect(isValidLegalitaTimelineDate("2025-01-01T00:00:00Z")).toBe(false);
  });

  it("normalizes allowed source URL protocols without fetching", () => {
    expect(normalizeLegalitaTimelineSourceUrl(" HTTPS://Example.test/a ")).toBe(
      "https://example.test/a",
    );
    expect(isValidLegalitaTimelineSourceUrl("http://example.test/a")).toBe(
      true,
    );
    expect(isValidLegalitaTimelineSourceUrl("https://example.test/a")).toBe(
      true,
    );
    expect(isValidLegalitaTimelineSourceUrl("demo://timeline/local-demo")).toBe(
      true,
    );
  });

  it("blocks unsafe or malformed source URL protocols", () => {
    expect(isValidLegalitaTimelineSourceUrl("mailto:test@example.test")).toBe(
      false,
    );
    expect(isValidLegalitaTimelineSourceUrl("javascript:alert(1)")).toBe(false);
    expect(isValidLegalitaTimelineSourceUrl("file:///tmp/source.pdf")).toBe(
      false,
    );
    expect(isValidLegalitaTimelineSourceUrl("not a url")).toBe(false);
  });

  it("counts events by category and verification status", () => {
    const counts = countLegalitaTimelineEvents([
      baseEvent,
      {
        ...baseEvent,
        id: "evt-002",
        category: "contratto_o_affidamento",
        verificationStatus: "verifica_parziale",
      },
      {
        ...baseEvent,
        id: "evt-003",
        category: "contratto_o_affidamento",
        verificationStatus: "da_verificare",
      },
    ]);

    expect(counts.byCategory.atto_pubblico).toBe(1);
    expect(counts.byCategory.contratto_o_affidamento).toBe(2);
    expect(counts.byCategory.da_verificare).toBe(0);
    expect(counts.byVerificationStatus.verificato_documentale).toBe(1);
    expect(counts.byVerificationStatus.verifica_parziale).toBe(1);
    expect(counts.byVerificationStatus.da_verificare).toBe(1);
    expect(counts.byVerificationStatus.fonte_non_verificata).toBe(0);
  });

  it("provides cautious technical labels without accusatory wording", () => {
    const labels = [
      getLegalitaTimelineCategoryLabel("bene_confiscato"),
      getLegalitaTimelineVerificationStatusLabel("fonte_non_verificata"),
      getLegalitaTimelineEventLabel({
        ...baseEvent,
        category: "procedimento_amministrativo",
        verificationStatus: "da_verificare",
      }),
    ];

    expect(labels).toContain("Bene confiscato");
    expect(labels).toContain("Fonte non verificata");
    expect(labels.join(" ")).toMatch(/Da verificare/);
    expect(labels.join(" ").toLowerCase()).not.toMatch(
      /corruzione|illecito|colpevole|responsabilit|mafia|anomalia/,
    );
  });

  it("detects non-publishable events with neutral reasons", () => {
    const events: LegalitaTimelineEvent[] = [
      baseEvent,
      {
        ...baseEvent,
        id: " ",
        date: "2025-02-30",
        verificationStatus: "fonte_non_verificata",
        sourceUrl: "javascript:alert(1)",
      },
      {
        ...baseEvent,
        id: "evt-003",
        verificationStatus: "da_verificare",
      },
    ];

    expect(getLegalitaTimelineNonPublishableReasons(events[1])).toEqual([
      "id_mancante",
      "data_non_valida",
      "protocollo_fonte_non_ammesso",
      "verifica_insufficiente",
    ]);
    expect(getLegalitaTimelineNonPublishableEvents(events)).toEqual([
      {
        event: events[1],
        reasons: [
          "id_mancante",
          "data_non_valida",
          "protocollo_fonte_non_ammesso",
          "verifica_insufficiente",
        ],
      },
      {
        event: events[2],
        reasons: ["verifica_insufficiente"],
      },
    ]);
  });
});
