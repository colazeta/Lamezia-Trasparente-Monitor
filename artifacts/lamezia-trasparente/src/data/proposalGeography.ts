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
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261029 } from "./proposalGeographyScouting20261029";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261031 } from "./proposalGeographyScouting20261031";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261031_B } from "./proposalGeographyScouting20261031B";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261101 } from "./proposalGeographyScouting20261101";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261102 } from "./proposalGeographyScouting20261102";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261103 } from "./proposalGeographyScouting20261103";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261104 } from "./proposalGeographyScouting20261104";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261105 } from "./proposalGeographyScouting20261105";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261105_BACKFILL } from "./proposalGeographyScouting20261105Backfill";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261106 } from "./proposalGeographyScouting20261106";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261107 } from "./proposalGeographyScouting20261107";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261108_B } from "./proposalGeographyScouting20261108B";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261109 } from "./proposalGeographyScouting20261109";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261110 } from "./proposalGeographyScouting20261110";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261111 } from "./proposalGeographyScouting20261111";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261112 } from "./proposalGeographyScouting20261112";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261113 } from "./proposalGeographyScouting20261113";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261114 } from "./proposalGeographyScouting20261114";
import { SCOUTED_PROPOSAL_GEOGRAPHY_20261114_B } from "./proposalGeographyScouting20261114B";

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
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261029,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261031,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261031_B,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261101,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261102,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261103,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261104,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261105,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261105_BACKFILL,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261106,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261107,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261108_B,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261109,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261110,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261111,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261112,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261113,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261114,
  ...SCOUTED_PROPOSAL_GEOGRAPHY_20261114_B,
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
