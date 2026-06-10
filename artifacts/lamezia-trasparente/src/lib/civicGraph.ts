export const CIVIC_NODE_TYPES = [
  "person",
  "session",
  "proposal",
  "act",
  "vote",
  "speech",
  "source_document",
  "topic",
] as const;

export type CivicNodeType = (typeof CIVIC_NODE_TYPES)[number];

export const CIVIC_EDGE_TYPES = [
  "participates_in",
  "has_participant",
  "proposal_results_in_act",
  "act_originates_from_proposal",
  "vote_in_session",
  "session_has_vote",
  "vote_cast_by",
  "person_cast_vote",
  "topic_relates_to_act",
  "act_relates_to_topic",
  "topic_relates_to_session",
  "session_relates_to_topic",
] as const;

export type CivicEdgeType = (typeof CIVIC_EDGE_TYPES)[number];

export const CIVIC_VERIFICATION_STATUSES = [
  "verified",
  "partial",
  "missing_source",
  "to_verify",
  "superseded",
  "corrected",
] as const;

export type CivicVerificationStatus =
  (typeof CIVIC_VERIFICATION_STATUSES)[number];

export interface CivicNode {
  id: string;
  type: CivicNodeType;
  title: string;
  verificationStatus: CivicVerificationStatus;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface CivicEdge {
  id?: string;
  type: CivicEdgeType;
  sourceId: string;
  targetId: string;
  verificationStatus?: CivicVerificationStatus;
  sourceDocumentId?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface CivicGraph {
  nodes: CivicNode[];
  edges: CivicEdge[];
}

export type CivicGraphValidationCode =
  | "duplicate_node_id"
  | "invalid_edge_relation"
  | "missing_edge_endpoint"
  | "missing_node_field";

export interface CivicGraphValidationIssue {
  code: CivicGraphValidationCode;
  reason: string;
  nodeId?: string;
  edgeId?: string;
}

export type CivicGraphBuildResult =
  | { ok: true; graph: CivicGraph; issues: [] }
  | { ok: false; graph: CivicGraph; issues: CivicGraphValidationIssue[] };

type AllowedRelation = Readonly<{
  source: CivicNodeType;
  target: CivicNodeType;
}>;

export const CIVIC_ALLOWED_RELATIONS: Readonly<
  Record<CivicEdgeType, AllowedRelation>
> = {
  participates_in: { source: "person", target: "session" },
  has_participant: { source: "session", target: "person" },
  proposal_results_in_act: { source: "proposal", target: "act" },
  act_originates_from_proposal: { source: "act", target: "proposal" },
  vote_in_session: { source: "vote", target: "session" },
  session_has_vote: { source: "session", target: "vote" },
  vote_cast_by: { source: "vote", target: "person" },
  person_cast_vote: { source: "person", target: "vote" },
  topic_relates_to_act: { source: "topic", target: "act" },
  act_relates_to_topic: { source: "act", target: "topic" },
  topic_relates_to_session: { source: "topic", target: "session" },
  session_relates_to_topic: { source: "session", target: "topic" },
};

export const CIVIC_INVERSE_EDGE_TYPES: Readonly<Record<CivicEdgeType, CivicEdgeType>> =
  {
    participates_in: "has_participant",
    has_participant: "participates_in",
    proposal_results_in_act: "act_originates_from_proposal",
    act_originates_from_proposal: "proposal_results_in_act",
    vote_in_session: "session_has_vote",
    session_has_vote: "vote_in_session",
    vote_cast_by: "person_cast_vote",
    person_cast_vote: "vote_cast_by",
    topic_relates_to_act: "act_relates_to_topic",
    act_relates_to_topic: "topic_relates_to_act",
    topic_relates_to_session: "session_relates_to_topic",
    session_relates_to_topic: "topic_relates_to_session",
  };

const normalizeIdPart = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const normalizeCivicId = (...parts: readonly string[]): string =>
  parts.map(normalizeIdPart).filter(Boolean).join(":");

export const makeCivicNodeId = (
  type: CivicNodeType,
  stableLabel: string,
): string => normalizeCivicId(type, stableLabel);

export const makeCivicEdgeId = (edge: CivicEdge): string =>
  normalizeCivicId(edge.type, edge.sourceId, edge.targetId);

const sortNodes = (nodes: readonly CivicNode[]): CivicNode[] =>
  [...nodes].sort((left, right) =>
    `${left.type}:${left.id}`.localeCompare(`${right.type}:${right.id}`),
  );

const sortEdges = (edges: readonly CivicEdge[]): CivicEdge[] =>
  [...edges].sort((left, right) =>
    `${left.type}:${left.sourceId}:${left.targetId}:${left.id ?? ""}`.localeCompare(
      `${right.type}:${right.sourceId}:${right.targetId}:${right.id ?? ""}`,
    ),
  );

const normalizeNode = (node: CivicNode): CivicNode => ({
  ...node,
  id: normalizeCivicId(node.id),
  title: node.title.trim(),
});

const normalizeEdge = (edge: CivicEdge): CivicEdge => {
  const normalized: CivicEdge = {
    ...edge,
    sourceId: normalizeCivicId(edge.sourceId),
    targetId: normalizeCivicId(edge.targetId),
  };

  return {
    ...normalized,
    id: edge.id ? normalizeCivicId(edge.id) : makeCivicEdgeId(normalized),
  };
};

export const buildCivicGraph = (input: CivicGraph): CivicGraphBuildResult => {
  const issues: CivicGraphValidationIssue[] = [];
  const nodeIds = new Set<string>();
  const nodes: CivicNode[] = [];

  for (const node of input.nodes) {
    const normalizedNode = normalizeNode(node);

    if (
      !normalizedNode.id ||
      !normalizedNode.title ||
      !normalizedNode.type ||
      !normalizedNode.verificationStatus
    ) {
      issues.push({
        code: "missing_node_field",
        reason: "Node requires id, type, title and verificationStatus.",
        nodeId: normalizedNode.id,
      });
      continue;
    }

    if (nodeIds.has(normalizedNode.id)) {
      issues.push({
        code: "duplicate_node_id",
        reason: "Node identifiers must be unique after civic id normalization.",
        nodeId: normalizedNode.id,
      });
      continue;
    }

    nodeIds.add(normalizedNode.id);
    nodes.push(normalizedNode);
  }

  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const edgesById = new Map<string, CivicEdge>();

  for (const edge of input.edges) {
    const normalizedEdge = normalizeEdge(edge);
    const edgeId = normalizedEdge.id ?? makeCivicEdgeId(normalizedEdge);
    const sourceNode = nodesById.get(normalizedEdge.sourceId);
    const targetNode = nodesById.get(normalizedEdge.targetId);

    if (!sourceNode || !targetNode) {
      issues.push({
        code: "missing_edge_endpoint",
        reason: "Edge sourceId and targetId must reference existing civic graph nodes.",
        edgeId,
      });
      continue;
    }

    const allowed = CIVIC_ALLOWED_RELATIONS[normalizedEdge.type];
    if (allowed.source !== sourceNode.type || allowed.target !== targetNode.type) {
      issues.push({
        code: "invalid_edge_relation",
        reason: `Relation ${normalizedEdge.type} is not allowed for ${sourceNode.type} to ${targetNode.type}.`,
        edgeId,
      });
      continue;
    }

    if (!edgesById.has(edgeId)) {
      edgesById.set(edgeId, { ...normalizedEdge, id: edgeId });
    }
  }

  const graph = {
    nodes: sortNodes(nodes),
    edges: sortEdges([...edgesById.values()]),
  };

  return issues.length > 0
    ? { ok: false, graph, issues }
    : { ok: true, graph, issues: [] };
};

export const getOutgoingRelations = (
  graph: CivicGraph,
  nodeId: string,
): CivicEdge[] => {
  const normalizedNodeId = normalizeCivicId(nodeId);
  return sortEdges(
    graph.edges.filter((edge) => normalizeCivicId(edge.sourceId) === normalizedNodeId),
  );
};

export const getIncomingRelations = (
  graph: CivicGraph,
  nodeId: string,
): CivicEdge[] => {
  const normalizedNodeId = normalizeCivicId(nodeId);
  return sortEdges(
    graph.edges.filter((edge) => normalizeCivicId(edge.targetId) === normalizedNodeId),
  );
};

export const getBidirectionalRelations = (
  graph: CivicGraph,
  nodeId: string,
): CivicEdge[] => {
  const normalizedNodeId = normalizeCivicId(nodeId);
  return sortEdges(
    graph.edges.filter(
      (edge) =>
        normalizeCivicId(edge.sourceId) === normalizedNodeId ||
        normalizeCivicId(edge.targetId) === normalizedNodeId,
    ),
  );
};

export const makeInverseEdge = (edge: CivicEdge): CivicEdge => ({
  ...edge,
  id: undefined,
  type: CIVIC_INVERSE_EDGE_TYPES[edge.type],
  sourceId: edge.targetId,
  targetId: edge.sourceId,
});
