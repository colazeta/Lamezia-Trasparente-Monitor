export type PnrrReconciliationStatus =
  | "collegamento-verificato"
  | "collegamento-possibile"
  | "non-rilevato-nelle-fonti-monitorate"
  | "fonte-non-riconciliata";

export type PnrrEvidenceSourceType = "pnrr" | "albo" | "unreconciled";

export type PnrrEvidenceMatchKey = "cup" | "cig" | "titolo-normalizzato" | "parola-chiave";

export type PnrrEvidenceConfidence = "alta" | "media" | "bassa" | "nessuna";

export interface PnrrMissionComponent {
  mission: string;
  component?: string;
  investment?: string;
  label?: string;
}

export interface PnrrEvidenceLink {
  id: string;
  sourceType: PnrrEvidenceSourceType;
  sourceLabel: string;
  sourceUrl?: string;
  matchedBy: readonly PnrrEvidenceMatchKey[];
  confidence: PnrrEvidenceConfidence;
  status: PnrrReconciliationStatus;
  reason: string;
}

export interface PnrrProject {
  id: string;
  title: string;
  missionComponent: PnrrMissionComponent;
  cup?: string | null;
  amountEuro?: number | null;
  placeOrDistrict?: string | null;
  pnrrSource: PnrrEvidenceLink;
  keywords?: readonly string[];
  cigs?: readonly string[];
  incompletenessNotes?: readonly string[];
}

export interface PnrrActConnectionInput {
  id: string;
  title: string;
  sourceLabel: string;
  sourceUrl?: string;
  cup?: string | null;
  cig?: string | null;
  keywords?: readonly string[];
}

export interface PnrrActConnection {
  actId: string;
  title: string;
  status: PnrrReconciliationStatus;
  confidence: PnrrEvidenceConfidence;
  evidenceLink: PnrrEvidenceLink;
  reason: string;
}

export interface PnrrProjectReconciliation {
  project: PnrrProject;
  connectedActs: readonly PnrrActConnection[];
  unreconciledEvidence: readonly PnrrEvidenceLink[];
  status: PnrrReconciliationStatus;
  incompletenessNotes: readonly string[];
}

export interface PnrrCivicTwinReport {
  projects: readonly PnrrProjectReconciliation[];
  unlinkedAlboActs: readonly PnrrActConnection[];
  generatedFrom: "documented-fields-only";
  methodologicalNote: string;
}

const NO_ALBO_MATCH_REASON = "non rilevato nelle fonti monitorate con i campi documentati";
const UNLINKED_ALBO_REASON = "fonte Albo non riconciliata con i progetti PNRR monitorati";

export function buildPnrrEvidenceLink(input: {
  id: string;
  sourceType: PnrrEvidenceSourceType;
  sourceLabel: string;
  sourceUrl?: string;
  matchedBy?: readonly PnrrEvidenceMatchKey[];
  confidence?: PnrrEvidenceConfidence;
  status?: PnrrReconciliationStatus;
  reason?: string;
}): PnrrEvidenceLink {
  const matchedBy = [...new Set(input.matchedBy ?? [])];
  const status = input.status ?? (matchedBy.length > 0 ? "collegamento-possibile" : "fonte-non-riconciliata");

  return {
    id: input.id,
    sourceType: input.sourceType,
    sourceLabel: normalizeWhitespace(input.sourceLabel) || "Fonte documentale non etichettata",
    sourceUrl: normalizeOptionalText(input.sourceUrl) || undefined,
    matchedBy,
    confidence: input.confidence ?? confidenceForMatchedKeys(matchedBy),
    status,
    reason: normalizeWhitespace(input.reason ?? reasonForStatus(status, matchedBy)),
  };
}

export function buildPnrrCivicTwinReport(
  projects: readonly PnrrProject[],
  alboActs: readonly PnrrActConnectionInput[],
): PnrrCivicTwinReport {
  const linkedActIds = new Set<string>();

  const reconciledProjects = projects.map((project) => {
    const connectedActs = alboActs
      .map((act) => buildActConnection(project, act))
      .filter((connection): connection is PnrrActConnection => connection !== null);

    for (const connection of connectedActs) {
      linkedActIds.add(connection.actId);
    }

    const unreconciledEvidence = connectedActs.length === 0 ? [buildProjectUnreconciledEvidence(project)] : [];

    return {
      project,
      connectedActs,
      unreconciledEvidence,
      status: projectStatus(connectedActs),
      incompletenessNotes: buildIncompletenessNotes(project, connectedActs),
    } satisfies PnrrProjectReconciliation;
  });

  const unlinkedAlboActs = alboActs
    .filter((act) => !linkedActIds.has(act.id))
    .map(buildUnlinkedAlboConnection);

  return {
    projects: reconciledProjects,
    unlinkedAlboActs,
    generatedFrom: "documented-fields-only",
    methodologicalNote:
      "Il report collega solo campi documentati e usa formulazioni prudenti: collegamento possibile, collegamento verificato o non rilevato nelle fonti monitorate.",
  };
}

export function normalizePnrrComparableText(value: string | null | undefined): string {
  return normalizeWhitespace(value)
    .toLocaleLowerCase("it-IT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildActConnection(
  project: PnrrProject,
  act: PnrrActConnectionInput,
): PnrrActConnection | null {
  const matchedBy = matchProjectAndAct(project, act);

  if (matchedBy.length === 0) {
    return null;
  }

  const status = matchedBy.includes("cup") || matchedBy.includes("cig") ? "collegamento-verificato" : "collegamento-possibile";
  const confidence = confidenceForMatchedKeys(matchedBy);
  const reason = reasonForStatus(status, matchedBy);
  const evidenceLink = buildPnrrEvidenceLink({
    id: `albo:${act.id}`,
    sourceType: "albo",
    sourceLabel: act.sourceLabel,
    sourceUrl: act.sourceUrl,
    matchedBy,
    confidence,
    status,
    reason,
  });

  return {
    actId: act.id,
    title: act.title,
    status,
    confidence,
    evidenceLink,
    reason,
  };
}

function buildUnlinkedAlboConnection(act: PnrrActConnectionInput): PnrrActConnection {
  const evidenceLink = buildPnrrEvidenceLink({
    id: `albo:${act.id}`,
    sourceType: "unreconciled",
    sourceLabel: act.sourceLabel,
    sourceUrl: act.sourceUrl,
    confidence: "nessuna",
    status: "fonte-non-riconciliata",
    reason: UNLINKED_ALBO_REASON,
  });

  return {
    actId: act.id,
    title: act.title,
    status: "fonte-non-riconciliata",
    confidence: "nessuna",
    evidenceLink,
    reason: UNLINKED_ALBO_REASON,
  };
}

function buildProjectUnreconciledEvidence(project: PnrrProject): PnrrEvidenceLink {
  return buildPnrrEvidenceLink({
    id: `pnrr-unreconciled:${project.id}`,
    sourceType: "pnrr",
    sourceLabel: project.pnrrSource.sourceLabel,
    sourceUrl: project.pnrrSource.sourceUrl,
    confidence: "nessuna",
    status: "non-rilevato-nelle-fonti-monitorate",
    reason: NO_ALBO_MATCH_REASON,
  });
}

function matchProjectAndAct(
  project: PnrrProject,
  act: PnrrActConnectionInput,
): readonly PnrrEvidenceMatchKey[] {
  const matches: PnrrEvidenceMatchKey[] = [];
  const projectCup = normalizeIdentifier(project.cup);
  const actCup = normalizeIdentifier(act.cup);
  const projectCigs = new Set((project.cigs ?? []).map(normalizeIdentifier).filter(Boolean));
  const actCig = normalizeIdentifier(act.cig);

  if (projectCup && actCup && projectCup === actCup) {
    matches.push("cup");
  }

  if (actCig && projectCigs.has(actCig)) {
    matches.push("cig");
  }

  if (normalizePnrrComparableText(project.title) === normalizePnrrComparableText(act.title)) {
    matches.push("titolo-normalizzato");
  }

  if (keywordOverlap(project, act).length > 0) {
    matches.push("parola-chiave");
  }

  return [...new Set(matches)];
}

function keywordOverlap(project: PnrrProject, act: PnrrActConnectionInput): readonly string[] {
  const projectKeywords = new Set((project.keywords ?? []).map(normalizePnrrComparableText).filter(Boolean));
  const actKeywords = new Set((act.keywords ?? []).map(normalizePnrrComparableText).filter(Boolean));

  return [...projectKeywords].filter((keyword) => actKeywords.has(keyword));
}

function projectStatus(connectedActs: readonly PnrrActConnection[]): PnrrReconciliationStatus {
  if (connectedActs.some((connection) => connection.status === "collegamento-verificato")) {
    return "collegamento-verificato";
  }

  if (connectedActs.length > 0) {
    return "collegamento-possibile";
  }

  return "non-rilevato-nelle-fonti-monitorate";
}

function buildIncompletenessNotes(
  project: PnrrProject,
  connectedActs: readonly PnrrActConnection[],
): readonly string[] {
  const notes = [...(project.incompletenessNotes ?? [])];

  if (!normalizeIdentifier(project.cup)) {
    notes.push("CUP non documentato nella scheda progetto fornita");
  }

  if (connectedActs.length === 0) {
    notes.push(NO_ALBO_MATCH_REASON);
  }

  return [...new Set(notes.map(normalizeWhitespace).filter(Boolean))];
}

function confidenceForMatchedKeys(matchedBy: readonly PnrrEvidenceMatchKey[]): PnrrEvidenceConfidence {
  if (matchedBy.includes("cup") || matchedBy.includes("cig")) {
    return "alta";
  }

  if (matchedBy.includes("titolo-normalizzato")) {
    return "media";
  }

  if (matchedBy.includes("parola-chiave")) {
    return "bassa";
  }

  return "nessuna";
}

function reasonForStatus(
  status: PnrrReconciliationStatus,
  matchedBy: readonly PnrrEvidenceMatchKey[],
): string {
  if (status === "collegamento-verificato") {
    return `collegamento verificato tramite ${matchedBy.join(", ")}`;
  }

  if (status === "collegamento-possibile") {
    return `collegamento possibile tramite ${matchedBy.join(", ")}`;
  }

  if (status === "non-rilevato-nelle-fonti-monitorate") {
    return NO_ALBO_MATCH_REASON;
  }

  return UNLINKED_ALBO_REASON;
}

function normalizeIdentifier(value: string | null | undefined): string {
  return normalizeWhitespace(value).toLocaleUpperCase("it-IT").replace(/[^A-Z0-9]/g, "");
}

function normalizeOptionalText(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function normalizeWhitespace(value: string | null | undefined): string {
  return normalizeOptionalText(value);
}
