import type {
  PublicProposal,
  ProposalEventType,
  ProposalStatus,
} from "./propostePubblicheCore";

/**
 * Backend-only institutional progression. The public UI intentionally exposes
 * a much smaller vocabulary through ProposalPublicState below.
 */
export const PROPOSAL_INSTITUTIONAL_PROGRESS_STAGES = [
  "emersa",
  "formalizzata",
  "calendarizzata",
  "discussa",
  "risposta_ricevuta",
  "recepita",
  "attuazione_avviata",
  "attuata",
] as const;

export type ProposalInstitutionalProgressStage =
  (typeof PROPOSAL_INSTITUTIONAL_PROGRESS_STAGES)[number];

export const PROPOSAL_INSTITUTIONAL_PROGRESS_LABELS: Record<
  ProposalInstitutionalProgressStage,
  string
> = {
  emersa: "Emersa",
  formalizzata: "Formalizzata",
  calendarizzata: "Calendarizzata",
  discussa: "Discussa",
  risposta_ricevuta: "Risposta ricevuta",
  recepita: "Recepita",
  attuazione_avviata: "Attuazione avviata",
  attuata: "Attuata",
};

/**
 * Citizen-facing states. These are deliberately broader than the backend
 * progression and should remain few, neutral and immediately understandable.
 */
export const PROPOSAL_PUBLIC_STATES = [
  "segnalata",
  "presentata",
  "con_seguito",
  "in_attuazione",
  "nessun_seguito_noto",
  "da_verificare",
] as const;

export type ProposalPublicState = (typeof PROPOSAL_PUBLIC_STATES)[number];

export const PROPOSAL_PUBLIC_STATE_LABELS: Record<ProposalPublicState, string> = {
  segnalata: "Segnalata",
  presentata: "Presentata formalmente",
  con_seguito: "Ha avuto seguito",
  in_attuazione: "In attuazione",
  nessun_seguito_noto: "Nessun seguito noto",
  da_verificare: "Da verificare",
};

export const INSTITUTIONAL_PROPOSAL_EVENT_TYPES = [
  "deposito",
  "calendarizzazione",
  "discussione",
  "risposta_istituzionale",
  "recepimento",
] as const satisfies readonly ProposalEventType[];

export const PROPOSAL_EVIDENCE_ROLES = [
  "origine",
  "petizione",
  "formalizzazione",
  "calendarizzazione",
  "discussione",
  "risposta_istituzionale",
  "recepimento",
  "aggiornamento",
  "atto_collegato",
] as const;

export type ProposalEvidenceRole = (typeof PROPOSAL_EVIDENCE_ROLES)[number];

export const PROPOSAL_EVIDENCE_ROLE_LABELS: Record<ProposalEvidenceRole, string> = {
  origine: "Fonte originaria",
  petizione: "Petizione / raccolta firme",
  formalizzazione: "Formalizzazione",
  calendarizzazione: "Calendarizzazione",
  discussione: "Discussione",
  risposta_istituzionale: "Risposta istituzionale",
  recepimento: "Recepimento",
  aggiornamento: "Aggiornamento",
  atto_collegato: "Atto collegato",
};

export type ProposalImplementationEvidence = {
  state: "started" | "completed";
  sourceEventId: string;
  note: string;
};

/**
 * Implementation is never inferred from `recepimento` or from a generic update.
 * A proposal enters the implementation stage only when a dedicated, reviewed
 * evidence record is added here and points to an existing sourced event.
 *
 * The registry is intentionally empty until that stronger evidentiary threshold
 * is met for a proposal.
 */
export const PROPOSAL_IMPLEMENTATION_EVIDENCE: Readonly<
  Partial<Record<string, ProposalImplementationEvidence>>
> = {};

export type ProposalInstitutionalState = {
  progressStage: ProposalInstitutionalProgressStage;
  publicState: ProposalPublicState;
  technicalStatus: ProposalStatus;
  institutionalEventCount: number;
  hasFormalization: boolean;
  hasInstitutionalFollowUp: boolean;
  implementation: "none" | "started" | "completed";
};

const progressRank = new Map(
  PROPOSAL_INSTITUTIONAL_PROGRESS_STAGES.map((stage, index) => [stage, index]),
);

const eventProgress: Partial<
  Record<ProposalEventType, ProposalInstitutionalProgressStage>
> = {
  emersione: "emersa",
  deposito: "formalizzata",
  calendarizzazione: "calendarizzata",
  discussione: "discussa",
  risposta_istituzionale: "risposta_ricevuta",
  recepimento: "recepita",
};

const statusProgress: Record<ProposalStatus, ProposalInstitutionalProgressStage> = {
  proposta_emersa: "emersa",
  presentata_formalmente: "formalizzata",
  discussa: "discussa",
  recepita_parzialmente: "recepita",
  recepita_integralmente: "recepita",
  respinta: "discussa",
  senza_seguito_noto: "emersa",
  non_verificabile: "emersa",
};

const followUpStatuses = new Set<ProposalStatus>([
  "discussa",
  "recepita_parzialmente",
  "recepita_integralmente",
  "respinta",
]);

const followUpEventTypes = new Set<ProposalEventType>([
  "calendarizzazione",
  "discussione",
  "risposta_istituzionale",
  "recepimento",
]);

function laterStage(
  current: ProposalInstitutionalProgressStage,
  candidate: ProposalInstitutionalProgressStage,
) {
  return (progressRank.get(candidate) ?? 0) > (progressRank.get(current) ?? 0)
    ? candidate
    : current;
}

function evidenceRoleForEventType(type: ProposalEventType): ProposalEvidenceRole {
  switch (type) {
    case "emersione":
      return "origine";
    case "petizione":
      return "petizione";
    case "deposito":
      return "formalizzazione";
    case "calendarizzazione":
      return "calendarizzazione";
    case "discussione":
      return "discussione";
    case "risposta_istituzionale":
      return "risposta_istituzionale";
    case "recepimento":
      return "recepimento";
    case "aggiornamento":
      return "aggiornamento";
  }
}

export function getProposalInstitutionalState(
  proposal: PublicProposal,
): ProposalInstitutionalState {
  let progressStage = statusProgress[proposal.status];

  for (const event of proposal.events) {
    const candidate = eventProgress[event.type];
    if (candidate) progressStage = laterStage(progressStage, candidate);
  }

  const implementationEvidence = PROPOSAL_IMPLEMENTATION_EVIDENCE[proposal.id];
  const implementation = implementationEvidence?.state ?? "none";
  if (implementation === "started") {
    progressStage = laterStage(progressStage, "attuazione_avviata");
  } else if (implementation === "completed") {
    progressStage = laterStage(progressStage, "attuata");
  }

  const hasFormalization =
    (progressRank.get(progressStage) ?? 0) >=
    (progressRank.get("formalizzata") ?? 1);
  const hasInstitutionalFollowUp =
    followUpStatuses.has(proposal.status) ||
    proposal.events.some((event) => followUpEventTypes.has(event.type));

  let publicState: ProposalPublicState;
  if (proposal.status === "non_verificabile") {
    publicState = "da_verificare";
  } else if (implementation !== "none") {
    publicState = "in_attuazione";
  } else if (proposal.status === "senza_seguito_noto") {
    publicState = "nessun_seguito_noto";
  } else if (hasInstitutionalFollowUp) {
    publicState = "con_seguito";
  } else if (hasFormalization) {
    publicState = "presentata";
  } else {
    publicState = "segnalata";
  }

  return {
    progressStage,
    publicState,
    technicalStatus: proposal.status,
    institutionalEventCount: proposal.events.filter((event) =>
      (INSTITUTIONAL_PROPOSAL_EVENT_TYPES as readonly ProposalEventType[]).includes(
        event.type,
      ),
    ).length,
    hasFormalization,
    hasInstitutionalFollowUp,
    implementation,
  };
}

export function getAvailablePublicInstitutionalStates(
  proposals: readonly PublicProposal[],
) {
  const used = new Set(
    proposals.map((proposal) => getProposalInstitutionalState(proposal).publicState),
  );
  return PROPOSAL_PUBLIC_STATES.filter((state) => used.has(state));
}

export function proposalMatchesPublicInstitutionalState(
  proposal: PublicProposal,
  state: ProposalPublicState,
) {
  return getProposalInstitutionalState(proposal).publicState === state;
}

export type ProposalInstitutionalEvidence = {
  id: string;
  role: ProposalEvidenceRole;
  date?: string;
  label: string;
  url?: string;
};

/**
 * Normalized evidence ledger for analysis/audit. This is intentionally not a
 * public-card surface: the citizen view only needs the summarized public state.
 */
export function getProposalInstitutionalEvidence(
  proposal: PublicProposal,
): ProposalInstitutionalEvidence[] {
  const evidence: ProposalInstitutionalEvidence[] = [
    {
      id: `${proposal.id}:origin`,
      role: "origine",
      date: proposal.firstSeen,
      label: proposal.sourceLabel,
      url: proposal.sourceUrl,
    },
    ...proposal.events.map((event) => ({
      id: `${proposal.id}:event:${event.id}`,
      role: evidenceRoleForEventType(event.type),
      date: event.date,
      label: event.sourceLabel,
      url: event.sourceUrl,
    })),
    ...proposal.linkedActs.map((act, index) => ({
      id: `${proposal.id}:act:${index}`,
      role: "atto_collegato" as const,
      label: act,
    })),
  ];

  return evidence;
}
