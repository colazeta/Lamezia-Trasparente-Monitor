import * as core from "./propostePubblicheCore";
import { applyScoutingUpdates } from "./proposalScoutingUpdates";
import { SCOUTED_PUBLIC_PROPOSALS } from "./propostePubblicheScouting";

export type {
  ProposalPromoterType,
  ProposalChannel,
  ProposalStatus,
  ProposalEvidenceLevel,
  ProposalEventType,
  ProposalEvent,
  PublicProposal,
  ProposalFilter,
} from "./propostePubblicheCore";

export {
  PROPOSAL_PROMOTER_TYPES,
  PROPOSAL_CHANNELS,
  PROPOSAL_STATUSES,
  PROPOSAL_EVIDENCE_LEVELS,
  PROPOSAL_EVENT_TYPES,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_CHANNEL_LABELS,
  PROPOSAL_PROMOTER_TYPE_LABELS,
  PROPOSAL_EVIDENCE_LABELS,
  PROPOSAL_EVENT_LABELS,
  normalizeProposalFacet,
  filterPublicProposals,
  groupProposalsByPromoter,
  groupProposalsByThread,
} from "./propostePubblicheCore";

export type {
  CanonicalProposalAction,
  CanonicalProposalPresentation,
} from "./proposalCanonicalPresentation";
export {
  CANONICAL_PROPOSAL_ACTIONS,
  CANONICAL_PROPOSAL_ACTION_LABELS,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation,
} from "./proposalCanonicalPresentation";

export type {
  LtSemanticExtensionId,
  OfficialFallbackDataThemeCode,
  PaPublicServiceSubjectCode,
  PaSemanticConcept,
  ProposalPaSemanticProfile,
  ProposalPaSubjectCode,
} from "./proposalPaSemanticProfile";
export {
  EU_DATA_THEME_SCHEME,
  LT_SEMANTIC_EXTENSIONS,
  OFFICIAL_FALLBACK_DATA_THEMES,
  PA_PUBLIC_SERVICE_SUBJECT_CODES,
  PA_PUBLIC_SERVICE_SUBJECT_SCHEME,
  PA_PUBLIC_SERVICE_SUBJECTS,
  PA_TRANSPARENCY_SUBJECT_SCHEME_URI,
  getAllPaPublicServiceSubjects,
  getAvailablePaSubjects,
  getAvailablePrimaryPaSubjects,
  getMappedProposalThemes,
  getProposalLocalSemanticExtensions,
  getProposalOfficialPaSubjects,
  getProposalPaSemanticProfile,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
  proposalMatchesPaSubject,
  proposalMatchesPrimaryPaSubject,
} from "./proposalPaSemanticProfile";

const UPDATED_CORE_PROPOSALS = core.PUBLIC_PROPOSALS.map(applyScoutingUpdates);

export const PUBLIC_PROPOSALS = [
  ...UPDATED_CORE_PROPOSALS,
  ...SCOUTED_PUBLIC_PROPOSALS,
] as const satisfies readonly core.PublicProposal[];

export function getProposalThemes(
  proposals: readonly core.PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return core.getProposalThemes(proposals);
}

export function getProposalPromoters(
  proposals: readonly core.PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return core.getProposalPromoters(proposals);
}

export function getProposalYears(
  proposals: readonly core.PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return core.getProposalYears(proposals);
}

export function getLatestProposalEvents(
  proposals: readonly core.PublicProposal[] = PUBLIC_PROPOSALS,
  limit = 6,
) {
  return core.getLatestProposalEvents(proposals, limit);
}
