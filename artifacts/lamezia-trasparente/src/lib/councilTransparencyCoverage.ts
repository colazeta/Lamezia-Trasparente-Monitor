export type CouncilTransparencyCoverageStatus =
  | "verified"
  | "partial"
  | "not_found_in_monitored_sources"
  | "not_applicable"
  | "needs_review";

export type CouncilSourceReference = {
  label: string;
  url?: string;
  publishedAt?: string;
  checkedAt?: string;
};

export type CouncilNotice = {
  id: string;
  kind: "council" | "commission";
  title: string;
  source?: CouncilSourceReference;
  publishedAt?: string;
  agendaItems?: AgendaItem[];
};

export type AgendaItem = {
  id: string;
  title: string;
  description?: string;
  source?: CouncilSourceReference;
};

export type CouncilPublicationChannelKind =
  | "albo_pretorio"
  | "institutional_section"
  | "streaming_live"
  | "recording_archive"
  | "minutes"
  | "full_report";

export type CouncilPublicationChannel = {
  kind: CouncilPublicationChannelKind;
  status?: CouncilTransparencyCoverageStatus;
  source?: CouncilSourceReference;
  checkedAt?: string;
  note?: string;
};

export type CouncilMediaEvidenceKind =
  | "streaming_live"
  | "recording_archive"
  | "minutes"
  | "full_report";

export type CouncilMediaEvidence = {
  kind: CouncilMediaEvidenceKind;
  status?: CouncilTransparencyCoverageStatus;
  source?: CouncilSourceReference;
  checkedAt?: string;
  note?: string;
};

export type CouncilSession = {
  id: string;
  kind: "council" | "commission";
  title: string;
  startsAt?: string;
  notice?: CouncilNotice;
  agendaItems?: AgendaItem[];
  publicationChannels?: CouncilPublicationChannel[];
  mediaEvidence?: CouncilMediaEvidence[];
  source?: CouncilSourceReference;
  lastCheckedAt?: string;
  notes?: string[];
};

export type CouncilCoverageField = {
  status: CouncilTransparencyCoverageStatus;
  source?: CouncilSourceReference;
  checkedAt?: string;
  note?: string;
};

export type CouncilTransparencyCoverageReport = {
  sessionId: string;
  sessionKind: CouncilSession["kind"];
  overallStatus: CouncilTransparencyCoverageStatus;
  noticeDetected: CouncilCoverageField;
  agendaDetected: CouncilCoverageField;
  alboPublication: CouncilCoverageField;
  institutionalSection: CouncilCoverageField;
  streamingLive: CouncilCoverageField;
  recordingArchive: CouncilCoverageField;
  minutes: CouncilCoverageField;
  fullReport: CouncilCoverageField;
  source: CouncilCoverageField;
  lastCheckedAt?: string;
  incompletenessNotes: string[];
};

const NOT_DETECTED_NOTE = "non rilevato nelle fonti monitorate";
const SOURCE_REVIEW_NOTE = "fonte da verificare prima di inferire copertura";

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

function hasSource(source: CouncilSourceReference | undefined) {
  return Boolean(source && hasText(source.label));
}

function combineCheckedAt(
  ...values: Array<string | undefined>
): string | undefined {
  return values.filter(Boolean).sort().at(-1);
}

function sourceFromSession(session: CouncilSession) {
  return (
    session.source ??
    session.notice?.source ??
    session.publicationChannels?.find((channel) => hasSource(channel.source))
      ?.source ??
    session.mediaEvidence?.find((evidence) => hasSource(evidence.source))
      ?.source ??
    session.agendaItems?.find((item) => hasSource(item.source))?.source
  );
}

function channelFor(
  session: CouncilSession,
  kind: CouncilPublicationChannelKind,
): CouncilPublicationChannel | undefined {
  return session.publicationChannels?.find((channel) => channel.kind === kind);
}

function mediaFor(
  session: CouncilSession,
  kind: CouncilMediaEvidenceKind,
): CouncilMediaEvidence | undefined {
  return session.mediaEvidence?.find((evidence) => evidence.kind === kind);
}

function fieldFromEvidence(
  evidence: CouncilPublicationChannel | CouncilMediaEvidence | undefined,
  defaultStatus: CouncilTransparencyCoverageStatus = "not_found_in_monitored_sources",
): CouncilCoverageField {
  if (!evidence) {
    return {
      status: defaultStatus,
      note:
        defaultStatus === "not_found_in_monitored_sources"
          ? NOT_DETECTED_NOTE
          : undefined,
    };
  }

  const status =
    evidence.status ?? (hasSource(evidence.source) ? "verified" : "partial");
  return {
    status,
    source: evidence.source,
    checkedAt: evidence.checkedAt ?? evidence.source?.checkedAt,
    note:
      evidence.note ??
      (status === "not_found_in_monitored_sources"
        ? NOT_DETECTED_NOTE
        : undefined),
  };
}

function noticeField(session: CouncilSession): CouncilCoverageField {
  if (!session.notice) {
    return {
      status: "not_found_in_monitored_sources",
      note: NOT_DETECTED_NOTE,
    };
  }

  return {
    status: hasSource(session.notice.source) ? "verified" : "partial",
    source: session.notice.source,
    checkedAt: session.notice.source?.checkedAt,
  };
}

function agendaField(session: CouncilSession): CouncilCoverageField {
  const items = session.agendaItems ?? session.notice?.agendaItems ?? [];
  if (items.length === 0) {
    return {
      status: "not_found_in_monitored_sources",
      note: NOT_DETECTED_NOTE,
    };
  }

  const withSource = items.filter((item) => hasSource(item.source));
  return {
    status: withSource.length === items.length ? "verified" : "partial",
    source: withSource[0]?.source,
    checkedAt: combineCheckedAt(...items.map((item) => item.source?.checkedAt)),
    note:
      withSource.length === items.length
        ? undefined
        : "punti all'ordine del giorno rilevati con fonte parziale",
  };
}

function sourceField(session: CouncilSession): CouncilCoverageField {
  const source = sourceFromSession(session);
  if (!source) {
    return {
      status: "needs_review",
      note: SOURCE_REVIEW_NOTE,
    };
  }

  return {
    status: "verified",
    source,
    checkedAt: source.checkedAt,
  };
}

function overallStatus(
  fields: CouncilCoverageField[],
): CouncilTransparencyCoverageStatus {
  if (fields.some((field) => field.status === "needs_review")) {
    return "needs_review";
  }

  const applicableFields = fields.filter(
    (field) => field.status !== "not_applicable",
  );

  if (applicableFields.every((field) => field.status === "verified")) {
    return "verified";
  }

  if (
    applicableFields.some(
      (field) =>
        field.status === "verified" ||
        field.status === "partial" ||
        field.status === "not_found_in_monitored_sources",
    )
  ) {
    return "partial";
  }

  return "not_applicable";
}

function incompletenessNotes(fields: Record<string, CouncilCoverageField>) {
  return Object.entries(fields)
    .filter(([, field]) =>
      ["partial", "not_found_in_monitored_sources", "needs_review"].includes(
        field.status,
      ),
    )
    .map(
      ([fieldName, field]) =>
        `${fieldName}: ${field.note ?? NOT_DETECTED_NOTE}`,
    );
}

export function buildCouncilTransparencyCoverageReport(
  session: CouncilSession,
): CouncilTransparencyCoverageReport {
  const noticeDetected = noticeField(session);
  const agendaDetected = agendaField(session);
  const alboPublication = fieldFromEvidence(
    channelFor(session, "albo_pretorio"),
  );
  const institutionalSection = fieldFromEvidence(
    channelFor(session, "institutional_section"),
  );
  const streamingLive = fieldFromEvidence(
    mediaFor(session, "streaming_live") ??
      channelFor(session, "streaming_live"),
    session.kind === "commission"
      ? "not_applicable"
      : "not_found_in_monitored_sources",
  );
  const recordingArchive = fieldFromEvidence(
    mediaFor(session, "recording_archive") ??
      channelFor(session, "recording_archive"),
    session.kind === "commission"
      ? "not_applicable"
      : "not_found_in_monitored_sources",
  );
  const minutes = fieldFromEvidence(
    mediaFor(session, "minutes") ?? channelFor(session, "minutes"),
  );
  const fullReport = fieldFromEvidence(
    mediaFor(session, "full_report") ?? channelFor(session, "full_report"),
  );
  const source = sourceField(session);

  const fields = {
    noticeDetected,
    agendaDetected,
    alboPublication,
    institutionalSection,
    streamingLive,
    recordingArchive,
    minutes,
    fullReport,
    source,
  };

  return {
    sessionId: session.id,
    sessionKind: session.kind,
    overallStatus: overallStatus(Object.values(fields)),
    ...fields,
    lastCheckedAt: combineCheckedAt(
      session.lastCheckedAt,
      source.checkedAt,
      ...Object.values(fields).map((field) => field.checkedAt),
    ),
    incompletenessNotes: [
      ...incompletenessNotes(fields),
      ...(session.notes ?? []),
    ],
  };
}

export { NOT_DETECTED_NOTE as COUNCIL_NOT_DETECTED_NOTE };
