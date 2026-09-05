import * as core from "./propostePubblicheCore";
import { applyScoutingUpdates } from "./proposalScoutingUpdates";
import { applyScoutingUpdates20260904 } from "./proposalScoutingUpdates20260904";
import { applyScoutingUpdates20260905 } from "./proposalScoutingUpdates20260905";
import { SCOUTED_PUBLIC_PROPOSALS } from "./propostePubblicheScouting";
import { SCOUTED_PUBLIC_PROPOSALS_20260903 } from "./propostePubblicheScouting20260903";
import { SCOUTED_PUBLIC_PROPOSALS_20260904 } from "./propostePubblicheScouting20260904";

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
} from "./proposalCanonicalPresentation";
export {
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  hasCanonicalProposalPresentation,
} from "./proposalCanonicalPresentationArchive";

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

export type {
  ProposalEvidenceRole,
  ProposalImplementationEvidence,
  ProposalInstitutionalEvidence,
  ProposalInstitutionalProgressStage,
  ProposalInstitutionalState,
  ProposalPublicState,
} from "./proposalInstitutionalState";
export {
  INSTITUTIONAL_PROPOSAL_EVENT_TYPES,
  PROPOSAL_EVIDENCE_ROLES,
  PROPOSAL_EVIDENCE_ROLE_LABELS,
  PROPOSAL_IMPLEMENTATION_EVIDENCE,
  PROPOSAL_INSTITUTIONAL_PROGRESS_STAGES,
  PROPOSAL_INSTITUTIONAL_PROGRESS_LABELS,
  PROPOSAL_PUBLIC_STATES,
  PROPOSAL_PUBLIC_STATE_LABELS,
  getAvailablePublicInstitutionalStates,
  getProposalInstitutionalEvidence,
  getProposalInstitutionalState,
  proposalMatchesPublicInstitutionalState,
} from "./proposalInstitutionalState";

export type {
  ProposalAuthorityLevel,
  ProposalCompetenceAssessment,
  ProposalCompetenceAssessmentStatus,
  ProposalCompetentAuthority,
  ProposalInstitutionalCompetence,
} from "./proposalInstitutionalCompetence";
export {
  PROPOSAL_AUTHORITY_LEVELS,
  PROPOSAL_COMPETENCE_ASSESSMENTS,
  PROPOSAL_COMPETENCE_ASSESSMENT_LABELS,
  PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES,
  getProposalInstitutionalCompetence,
  hasVerifiedProposalCompetence,
} from "./proposalInstitutionalCompetence";

const EXISTING_PUBLIC_PROPOSALS = [
  ...core.PUBLIC_PROPOSALS.map(applyScoutingUpdates),
  ...SCOUTED_PUBLIC_PROPOSALS,
  ...SCOUTED_PUBLIC_PROPOSALS_20260903,
] as const satisfies readonly core.PublicProposal[];

const UPDATED_EXISTING_PUBLIC_PROPOSALS = EXISTING_PUBLIC_PROPOSALS.map(
  applyScoutingUpdates20260904,
);

const UPDATED_EXISTING_PUBLIC_PROPOSALS_20260905 =
  UPDATED_EXISTING_PUBLIC_PROPOSALS.map(applyScoutingUpdates20260905);
const UPDATED_SCOUTED_PUBLIC_PROPOSALS_20260904 =
  SCOUTED_PUBLIC_PROPOSALS_20260904.map(applyScoutingUpdates20260905);

export const PUBLIC_PROPOSALS = [
  ...UPDATED_EXISTING_PUBLIC_PROPOSALS_20260905,
  ...UPDATED_SCOUTED_PUBLIC_PROPOSALS_20260904,
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
