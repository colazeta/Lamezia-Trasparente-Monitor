import { describe, expect, it } from "vitest";

import {
  buildCivicGraph,
  getBidirectionalRelations,
  getIncomingRelations,
  getOutgoingRelations,
  makeCivicNodeId,
  makeInverseEdge,
  normalizeCivicId,
  type CivicGraph,
} from "@/lib/civicGraph";

const baseNodes: CivicGraph["nodes"] = [
  {
    id: "Persona Demo",
    type: "person",
    title: "Persona demo",
    verificationStatus: "to_verify",
  },
  {
    id: "Seduta Demo",
    type: "session",
    title: "Seduta demo",
    verificationStatus: "partial",
  },
  {
    id: "Proposta Demo",
    type: "proposal",
    title: "Proposta demo",
    verificationStatus: "to_verify",
  },
  {
    id: "Atto Demo",
    type: "act",
    title: "Atto demo",
    verificationStatus: "partial",
  },
  {
    id: "Votazione Demo",
    type: "vote",
    title: "Votazione demo",
    verificationStatus: "to_verify",
  },
  {
    id: "Tema Demo",
    type: "topic",
    title: "Tema demo",
    verificationStatus: "to_verify",
  },
];

describe("normalizeCivicId", () => {
  it("normalizes civic identifiers deterministically without external dependencies", () => {
    expect(normalizeCivicId("  Seduta n. 1 / Città  ", "Àtti 2026")).toBe(
      "seduta-n-1-citta:atti-2026",
    );
    expect(makeCivicNodeId("session", "Seduta n. 1 / Città")).toBe(
      "session:seduta-n-1-citta",
    );
  });
});

describe("buildCivicGraph", () => {
  it("links a person to a session and exposes outgoing, incoming and bidirectional relations", () => {
    const result = buildCivicGraph({
      nodes: baseNodes,
      edges: [
        {
          type: "participates_in",
          sourceId: "Persona Demo",
          targetId: "Seduta Demo",
          verificationStatus: "to_verify",
        },
        makeInverseEdge({
          type: "participates_in",
          sourceId: "Persona Demo",
          targetId: "Seduta Demo",
          verificationStatus: "to_verify",
        }),
      ],
    });

    expect(result.ok).toBe(true);
    expect(getOutgoingRelations(result.graph, "Persona Demo")).toHaveLength(1);
    expect(getIncomingRelations(result.graph, "Persona Demo")).toHaveLength(1);
    expect(getBidirectionalRelations(result.graph, "Persona Demo")).toHaveLength(2);
  });

  it("links a proposal to an act with an allowed neutral relation", () => {
    const result = buildCivicGraph({
      nodes: baseNodes,
      edges: [
        {
          type: "proposal_results_in_act",
          sourceId: "Proposta Demo",
          targetId: "Atto Demo",
          verificationStatus: "partial",
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.graph.edges).toMatchObject([
      {
        id: "proposal-results-in-act:proposta-demo:atto-demo",
        sourceId: "proposta-demo",
        targetId: "atto-demo",
      },
    ]);
  });

  it("links a vote to its session and person", () => {
    const result = buildCivicGraph({
      nodes: baseNodes,
      edges: [
        {
          type: "vote_in_session",
          sourceId: "Votazione Demo",
          targetId: "Seduta Demo",
          verificationStatus: "to_verify",
        },
        {
          type: "vote_cast_by",
          sourceId: "Votazione Demo",
          targetId: "Persona Demo",
          verificationStatus: "to_verify",
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(getOutgoingRelations(result.graph, "Votazione Demo")).toHaveLength(2);
  });

  it("supports cautious topic links to acts and sessions", () => {
    const result = buildCivicGraph({
      nodes: baseNodes,
      edges: [
        {
          type: "topic_relates_to_act",
          sourceId: "Tema Demo",
          targetId: "Atto Demo",
          verificationStatus: "to_verify",
        },
        {
          type: "topic_relates_to_session",
          sourceId: "Tema Demo",
          targetId: "Seduta Demo",
          verificationStatus: "to_verify",
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(getOutgoingRelations(result.graph, "Tema Demo")).toHaveLength(2);
  });

  it("rejects a relation that points to a missing node", () => {
    const result = buildCivicGraph({
      nodes: baseNodes,
      edges: [
        {
          type: "participates_in",
          sourceId: "Persona Demo",
          targetId: "Seduta Mancante",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "missing_edge_endpoint" }),
    );
    expect(result.graph.edges).toEqual([]);
  });

  it("rejects a relation that is not part of the allowed civic graph matrix", () => {
    const result = buildCivicGraph({
      nodes: baseNodes,
      edges: [
        {
          type: "vote_cast_by",
          sourceId: "Persona Demo",
          targetId: "Votazione Demo",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "invalid_edge_relation" }),
    );
  });

  it("deduplicates duplicate relations and sorts them in a stable order", () => {
    const result = buildCivicGraph({
      nodes: baseNodes,
      edges: [
        {
          type: "vote_cast_by",
          sourceId: "Votazione Demo",
          targetId: "Persona Demo",
        },
        {
          type: "participates_in",
          sourceId: "Persona Demo",
          targetId: "Seduta Demo",
        },
        {
          type: "vote_cast_by",
          sourceId: "Votazione Demo",
          targetId: "Persona Demo",
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.graph.edges.map((edge) => edge.id)).toEqual([
      "participates-in:persona-demo:seduta-demo",
      "vote-cast-by:votazione-demo:persona-demo",
    ]);
  });

  it("does not mutate caller-provided input", () => {
    const input: CivicGraph = {
      nodes: [
        {
          id: " Persona Demo ",
          type: "person",
          title: " Persona demo ",
          verificationStatus: "to_verify",
        },
        {
          id: " Seduta Demo ",
          type: "session",
          title: " Seduta demo ",
          verificationStatus: "partial",
        },
      ],
      edges: [
        {
          type: "participates_in",
          sourceId: " Persona Demo ",
          targetId: " Seduta Demo ",
        },
      ],
    };
    const before = structuredClone(input);

    const result = buildCivicGraph(input);

    expect(result.ok).toBe(true);
    expect(input).toEqual(before);
    expect(result.graph.nodes[0]?.id).toBe("persona-demo");
    expect(result.graph.nodes[0]?.title).toBe("Persona demo");
  });
});
