import * as core from "./proposalGeographyCore";
import { SCOUTED_PROPOSAL_GEOGRAPHY } from "./proposalGeographyScouting";

export type {
  ProposalGeoArea,
  ProposalGeoScope,
  ProposalGeoPrecision,
  ProposalGeoPoint,
  ProposalGeography,
} from "./proposalGeographyCore";

export {
  PROPOSAL_GEO_AREAS,
  PROPOSAL_GEO_AREA_LABELS,
  PROPOSAL_GEO_SCOPES,
  PROPOSAL_GEO_SCOPE_LABELS,
  PROPOSAL_GEO_PRECISIONS,
  PROPOSAL_GEO_PRECISION_LABELS,
} from "./proposalGeographyCore";

export const PROPOSAL_GEOGRAPHY: Record<string, core.ProposalGeography> = {
  ...core.PROPOSAL_GEOGRAPHY,
  ...SCOUTED_PROPOSAL_GEOGRAPHY,
};

export function getProposalGeography(
  proposalId: string,
): core.ProposalGeography | undefined {
  return PROPOSAL_GEOGRAPHY[proposalId];
}

export function proposalMatchesGeoArea(
  proposalId: string,
  area: core.ProposalGeoArea,
): boolean {
  return getProposalGeography(proposalId)?.areas.includes(area) ?? false;
}

export function getProposalGeoAreas() {
  return core.getProposalGeoAreas();
}
