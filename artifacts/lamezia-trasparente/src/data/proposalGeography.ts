import * as core from "./proposalGeographyCore";
import { SCOUTED_PROPOSAL_GEOGRAPHY } from "./proposalGeographyScouting";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20260913 } from "./proposalGeographyScouting20260913";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20260915 } from "./proposalGeographyScouting20260915";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261013 } from "./proposalGeographyScouting20261013";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261023 } from "./proposalGeographyScouting20261023";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261026 } from "./proposalGeographyScouting20261026";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261026_BACKFILL } from "./proposalGeographyScouting20261026Backfill";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261027 } from "./proposalGeographyScouting20261027";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261028 } from "./proposalGeographyScouting20261028";

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
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20260913,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20260915,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261013,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261023,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261026,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261026_BACKFILL,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261027,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261028,
};

export function getProposalGeography(
  proposalId: string,
): core.ProposalGeography | undefined {
  return PROPOSAL_GEOGRAPHY[proposalId];
}

export function isProposalGeoreferenced(proposalId: string): boolean {
  const geography = getProposalGeography(proposalId);
  return Boolean(
    geography && geography.scope !== "citywide" && geography.points.length > 0,
  );
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

export function getProposalLocalGeoAreas() {
  return core
    .getProposalGeoAreas()
    .filter((area): area is Exclude<core.ProposalGeoArea, "intera_citta"> =>
      area !== "intera_citta",
    );
}
