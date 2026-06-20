import { describe, expect, it } from "vitest";

import {
  getPublishedTrameFestivalCards,
  hasCompleteTramePublicAttribution,
  tramePublicCards,
  type TramePublicCard,
} from "@/content/trameFestival";

const baseCard: TramePublicCard = {
  card_id: "card-1",
  card_title: "Proposta verificata",
  content_type: "proposta",
  content_summary: "Sintesi redazionale attribuita e verificabile.",
  speaker_name: "Nome Cognome",
  speaker_role: "Ruolo pubblico",
  event_title: "Evento verificato",
  event_date: "2026-06-18",
  edition_year: 2026,
  video_url: "https://www.youtube.com/watch?v=example12345",
  video_minute: "00:12:34",
  source_label: "Video YouTube ufficiale",
  transcript_status: "human_verified",
  verification_status: "citazione verificata",
  territorial_relevance: "Lamezia",
  relevance_for_lamezia: "Rilevanza territoriale motivata.",
  possible_civic_translation: "Possibile accesso civico o proposta locale.",
  editorial_note: "Nota prudente.",
  analytical_depth: 5,
  non_obviousness: 5,
  territorial_relevance_score: 5,
  specificity: 5,
  civic_transformability: 5,
  source_verifiability: 5,
  editorial_priority: "high",
  publication_status: "approved",
  last_reviewed: "2026-06-19",
};

describe("trame festival public cards", () => {
  it("starts with no public cards approved in the foundational materialization", () => {
    expect(tramePublicCards).toEqual([]);
    expect(getPublishedTrameFestivalCards()).toEqual([]);
  });

  it("publishes only approved or published cards with high or medium priority", () => {
    const cards: TramePublicCard[] = [
      baseCard,
      { ...baseCard, card_id: "card-2", editorial_priority: "medium" },
      { ...baseCard, card_id: "card-3", editorial_priority: "low" },
      { ...baseCard, card_id: "card-4", publication_status: "draft" },
      { ...baseCard, card_id: "card-5", editorial_priority: "exclude" },
      { ...baseCard, card_id: "card-6", publication_status: "published" },
    ];

    expect(getPublishedTrameFestivalCards(cards).map((card) => card.card_id)).toEqual([
      "card-1",
      "card-2",
      "card-6",
    ]);
  });

  it("requires complete public attribution before a card can be reviewed as publishable", () => {
    expect(hasCompleteTramePublicAttribution(baseCard)).toBe(true);
    expect(
      hasCompleteTramePublicAttribution({
        ...baseCard,
        video_minute: "",
      }),
    ).toBe(false);
  });
});
