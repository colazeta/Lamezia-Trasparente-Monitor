import { createHash } from "node:crypto";

export const COMUNE_PNRR_INDEX_URL =
  "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr";
export const COMUNE_PNRR_ORIGIN = "https://www.comune.lamezia-terme.cz.it";

const CUP_RE = /\b[A-Z][0-9]{2}[A-Z][0-9]{11}\b/g;
const MISSION_RE = /\bM[1-7]\s*C[0-9]+(?:\s*I\s*[0-9]+(?:\.[0-9]+)*)?/gi;
const EXPLICIT_PNRR_RE =
  /\bPNRR\b|\bP\s*\.\s*N\s*\.\s*R\s*\.\s*R\s*\.?\b|NEXT[\s-]?GENERATION|\bM[1-7]\s*C[0-9]+(?:\s*I\s*[0-9]+(?:\.[0-9]+)*)?/i;
const ITALIAN_MONTHS = new Map([
  ["gen", 1],
  ["feb", 2],
  ["mar", 3],
  ["apr", 4],
  ["mag", 5],
  ["giu", 6],
  ["lug", 7],
  ["ago", 8],
  ["set", 9],
  ["ott", 10],
  ["nov", 11],
  ["dic", 12],
]);

export const MUNICIPAL_ATTACHMENT_PHASES = Object.freeze([
  {
    id: "programme_funding",
    label: "Programmazione e finanziamento",
    description:
      "Avvisi, candidature, decreti di finanziamento, graduatorie e convenzioni.",
  },
  {
    id: "planning_authorisations",
    label: "Progettazione e autorizzazioni",
    description:
      "Progetti, studi, indagini, conferenze di servizi, pareri e nomine tecniche.",
  },
  {
    id: "procurement_contracts",
    label: "Affidamenti e contratti",
    description:
      "Gare, decisioni a contrarre, affidamenti, aggiudicazioni e subappalti.",
  },
  {
    id: "execution_spending",
    label: "Esecuzione e spesa",
    description:
      "Stati di avanzamento, liquidazioni, anticipazioni, varianti e altri atti esecutivi o contabili.",
  },
  {
    id: "completion_verification",
    label: "Collaudo e chiusura",
    description:
      "Collaudi, certificati di ultimazione o regolare esecuzione e verifiche conclusive.",
  },
  {
    id: "other",
    label: "Altri documenti",
    description:
      "Allegati il cui titolo non consente una classificazione documentale prudente.",
  },
]);

const MUNICIPAL_ATTACHMENT_PHASE_BY_ID = new Map(
  MUNICIPAL_ATTACHMENT_PHASES.map((phase) => [phase.id, phase]),
);

const MUNICIPAL_ATTACHMENT_PHASE_RULES = [
  {
    id: "completion_verification",
    pattern:
      /collaud|certificat.{0,30}(?:ultimazione|regolare esecuzione)|ultimazione lavori|fine lavori|conformita tecnica|relazione struttura ultimata|\brsu\b|\bcre\b/,
  },
  {
    id: "procurement_contracts",
    pattern:
      /affidament|aggiudicaz|(?:determina|decisione).{0,24}contrarre|indizione.{0,20}gara|procedura.{0,20}gara|subappalt|contratto|appalto/,
  },
  {
    id: "execution_spending",
    pattern:
      /liquidaz|pagament|\bsal\b|stato.{0,20}avanzamento|anticipaz|impegno.{0,16}spesa|accertamento.{0,16}entrat|perizia.{0,24}variant|assestamento.{0,20}contabile|manutenzion|consegna.{0,16}lavor|direzione.{0,16}lavor|coordinamento.{0,16}sicurezz/,
  },
  {
    id: "planning_authorisations",
    pattern:
      /progett|\bp\s*f\s*t\s*e\b|\bd\s*i\s*p\b|fattibilit|fattibit|\bconf(?:erenza)?\b.{0,18}serviz|indagin|parere|nomina.{0,12}rup|approvazione.{0,18}schema/,
  },
  {
    id: "programme_funding",
    pattern:
      /avviso|decreto.{0,24}finanziamento|finanziament|candidatur|graduatoria|ammission|ammess|istanza.{0,18}partecipazione|contribut|convenzione|coprogettazione/,
  },
];

export function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) => {
      const numeric = code.toLowerCase().startsWith("x")
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : _;
    })
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&agrave;/gi, "à")
    .replace(/&egrave;/gi, "è")
    .replace(/&eacute;/gi, "é")
    .replace(/&igrave;/gi, "ì")
    .replace(/&ograve;/gi, "ò")
    .replace(/&ugrave;/gi, "ù");
}

export function cleanHtmlText(value) {
  const cleaned = decodeHtmlEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
}

export function extractProjectLinks(
  indexHtml,
  baseOrigin = COMUNE_PNRR_ORIGIN,
) {
  const links = new Map();
  const pattern =
    /href\s*=\s*["']([^"']*\/it\/attuazione-misure-pnrr\/(\d+)(?:[?#][^"']*)?)["']/gi;
  let match;

  while ((match = pattern.exec(indexHtml)) !== null) {
    const sourceId = match[2];
    const url = new URL(decodeHtmlEntities(match[1]), baseOrigin);
    url.search = "";
    url.hash = "";
    links.set(sourceId, url.toString());
  }

  return Array.from(links, ([source_id, source_url]) => ({
    source_id,
    source_url,
  })).sort((left, right) => Number(left.source_id) - Number(right.source_id));
}

export function parseMunicipalPnrrProject({ sourceId, sourceUrl, html }) {
  const title = cleanHtmlText(
    /<h1[^>]*data-element=["']attuator-title["'][^>]*>([\s\S]*?)<\/h1>/i.exec(
      html,
    )?.[1],
  );
  if (!title) {
    throw new Error(
      `PNRR project ${sourceId} does not expose a readable title.`,
    );
  }

  const mission = extractLabelledField(html, ["Missione"]);
  const component = extractLabelledField(html, ["Componente"]);
  const investment = extractLabelledField(html, ["Investimento"]);
  const intervention = extractLabelledField(html, ["Intervento"]);
  const holder = extractLabelledField(html, ["Titolare"]);
  const attuatore = extractLabelledField(html, ["Soggetto Attuatore"]);
  const subAttuatore = extractLabelledField(html, [
    "Soggetto sub-Attuatore",
    "Soggetto Sub-Attuatore",
    "Soggetto sub Attuatore",
  ]);
  const cup = extractCups(extractLabelledField(html, ["CUP"]) ?? "")[0] ?? null;
  const status = extractLabelledField(html, ["Stato di avanzamento", "Stato"]);
  const startDate = parseItalianDate(
    extractLabelledField(html, ["Data di avvio", "Data avvio"]),
  );
  const endDate = parseItalianDate(
    extractLabelledField(html, [
      "Data di fine",
      "Data fine",
      "Data di conclusione",
    ]),
  );
  const publishedAt = parseItalianDate(
    /Data di [Pp]ubblicazione\s*:?\s*([0-9]{1,2}\s+[a-zA-Zàèéìòù]{3,}\.?\s+[0-9]{4})/i.exec(
      html,
    )?.[1] ?? null,
  );
  const amount = parseItalianAmount(
    sectionAfterAnchor(html, "importo-finanziato", 5_000),
  );
  const attachments = extractAttachments(
    sectionAfterAnchor(html, "atti-legislativi-e-amministrativi", 100_000),
    sourceUrl,
  );

  const project = {
    source_id: String(sourceId),
    source_url: sourceUrl,
    title,
    mission,
    component,
    investment,
    intervention,
    holder,
    attuatore,
    sub_attuatore: subAttuatore,
    cup,
    amount_eur: amount,
    status,
    start_date: startDate,
    end_date: endDate,
    published_at: publishedAt,
    attachments,
    verification_status: "official_municipal_project_page",
  };

  return {
    ...project,
    source_record_hash: sha256(stableStringify(project)),
  };
}

export function parseItalianAmount(value) {
  const text = cleanHtmlText(value);
  if (!text) return null;

  const match =
    /(?:€\s*)?([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:,[0-9]{1,2})?)\s*(?:€|euro)?/i.exec(
      text,
    );
  if (!match) return null;

  const amount = Number(match[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function parseItalianDate(value) {
  const text = cleanHtmlText(value);
  if (!text) return null;

  const match = /\b([0-9]{1,2})\s+([a-zA-Zàèéìòù]{3,})\.?\s+([0-9]{4})\b/i.exec(
    text,
  );
  if (!match) return null;

  const month = ITALIAN_MONTHS.get(match[2].slice(0, 3).toLowerCase());
  if (!month) return null;

  const day = Number(match[1]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function deriveMunicipalAttachmentMetadata({ title, url, sourceOrder }) {
  const cleanedTitle = cleanHtmlText(title) ?? "Allegato";
  const exactDate =
    parseNumericAttachmentDate(cleanedTitle) ?? parseItalianDate(cleanedTitle);
  const yearCandidates = exactDate
    ? [Number(exactDate.slice(0, 4))]
    : extractAttachmentYearCandidates(cleanedTitle);
  const documentYear = yearCandidates.length === 1 ? yearCandidates[0] : null;
  const searchableTitle = normaliseAttachmentSearchText(cleanedTitle);
  const matchedRule = MUNICIPAL_ATTACHMENT_PHASE_RULES.find((rule) =>
    rule.pattern.test(searchableTitle),
  );

  return {
    title: cleanedTitle,
    url,
    source_order: sourceOrder,
    sequence: extractAttachmentSequence(cleanedTitle),
    document_date: exactDate,
    document_year: documentYear,
    date_precision: exactDate ? "day" : documentYear ? "year" : null,
    date_basis: exactDate
      ? "title_explicit_date"
      : documentYear
        ? "title_or_filename_year"
        : null,
    phase: matchedRule?.id ?? "other",
    classification_basis: matchedRule ? "title_keyword" : "unclassified",
  };
}

export function extractCups(value) {
  const normalized = String(value ?? "")
    .toUpperCase()
    .replace(/\s+/g, " ");
  return Array.from(new Set(normalized.match(CUP_RE) ?? [])).sort();
}

export function extractMissionCodes(value) {
  const normalized = String(value ?? "").toUpperCase();
  return Array.from(
    new Set(
      Array.from(normalized.matchAll(MISSION_RE), (match) =>
        match[0].replace(/\s+/g, ""),
      ),
    ),
  ).sort();
}

export function hasExplicitPnrrMarker(value) {
  return EXPLICIT_PNRR_RE.test(String(value ?? ""));
}

export function buildAlboEvidenceArchive({
  currentSources,
  existingEvidence = [],
  officialProjectCups,
  documentManifest = null,
  reviewedDocumentAllowlist = null,
}) {
  const officialCups = new Set(officialProjectCups);
  const manifestById = new Map(
    (documentManifest?.documents ?? []).map((document) => [
      document.id,
      document,
    ]),
  );
  const allowedArchivePaths = new Set([
    ...(documentManifest?.documents ?? []).map(
      (document) => document.storage_path,
    ),
    ...(reviewedDocumentAllowlist?.documents ?? []).map(
      (document) => document.storage_path,
    ),
  ]);
  const evidenceById = new Map(
    existingEvidence.map((item) => {
      const retained = structuredClone(item);
      if (
        retained.archived_path &&
        !allowedArchivePaths.has(retained.archived_path)
      ) {
        retained.archived_path = null;
        retained.document_content_type = null;
        retained.document_size_bytes = null;
        retained.evidence_hash = hashEvidence(retained);
      }
      return [retained.id, retained];
    }),
  );
  const currentById = new Map();

  for (const source of currentSources) {
    for (const record of [
      ...(source.items ?? []),
      ...(source.excluded ?? []),
    ]) {
      if (!record?.id) continue;
      currentById.set(record.id, {
        record,
        sourceGeneratedAt: source.generated_at ?? null,
      });
    }
  }

  for (const [id, { record, sourceGeneratedAt }] of currentById) {
    // Re-evaluate every record that is still visible in the current public
    // snapshots. This removes a previously retained item when the upstream
    // public/privacy projection revokes or minimises it.
    evidenceById.delete(id);

    if (!isEligiblePublicAlboRecord(record)) continue;

    const subject = cleanHtmlText(record.subject);
    if (!subject) continue;
    const cups = extractCups(subject);
    const explicitPnrr = hasExplicitPnrrMarker(subject);
    const matchedOfficialCup = cups.some((cup) => officialCups.has(cup));
    if (!explicitPnrr && !matchedOfficialCup) continue;

    const manifest = manifestById.get(id);
    const archivedDocument = record.archived_document ?? null;
    const evidence = {
      id,
      public_id: record.public_id ?? id,
      source: record.source ?? "Albo Pretorio Comune di Lamezia Terme",
      source_url: record.source_url ?? null,
      publication_number: record.publication_number ?? null,
      publication_start: record.publication_start ?? null,
      publication_end: record.publication_end ?? null,
      office: record.office ?? null,
      act_type: record.act_type ?? null,
      act_number: record.act_number ?? null,
      act_date: record.act_date ?? null,
      subject,
      cups,
      mission_codes: extractMissionCodes(subject),
      match_basis: [
        ...(explicitPnrr ? ["explicit_pnrr_marker"] : []),
        ...(matchedOfficialCup ? ["official_project_cup"] : []),
      ],
      verification_status: record.verification_status,
      public_visibility: record.public_visibility,
      privacy_risk: record.privacy_risk,
      document_url: record.document_url ?? manifest?.document_url ?? null,
      archived_path:
        archivedDocument?.storage_path ?? manifest?.storage_path ?? null,
      document_content_type:
        archivedDocument?.content_type ?? manifest?.content_type ?? null,
      document_size_bytes:
        archivedDocument?.size_bytes ?? manifest?.size_bytes ?? null,
      first_observed_at:
        record.first_observed_at ?? record.retrieved_at ?? sourceGeneratedAt,
      last_observed_at:
        record.last_observed_at ?? record.retrieved_at ?? sourceGeneratedAt,
      evidence_status: "official_albo_public_record",
    };

    evidenceById.set(id, withEvidenceHash(evidence));
  }

  return Array.from(evidenceById.values()).sort(compareEvidence);
}

export function buildStaticPnrrDataset({
  projects,
  alboEvidence,
  materializedAt,
  alboSnapshotGeneratedAt = null,
}) {
  const evidenceByCup = new Map();
  for (const evidence of alboEvidence) {
    for (const cup of evidence.cups) {
      const bucket = evidenceByCup.get(cup) ?? [];
      bucket.push(evidence.id);
      evidenceByCup.set(cup, bucket);
    }
  }

  const publicProjects = projects
    .map((project) => {
      const evidenceIds = project.cup
        ? [...new Set(evidenceByCup.get(project.cup) ?? [])]
        : [];
      return {
        ...project,
        albo_evidence_ids: evidenceIds,
      };
    })
    .sort(compareProjects);

  const linkedEvidenceIds = new Set(
    publicProjects.flatMap((project) => project.albo_evidence_ids),
  );
  const unmatchedEvidenceIds = alboEvidence
    .filter((item) => !linkedEvidenceIds.has(item.id))
    .map((item) => item.id);
  const attachmentsCount = publicProjects.reduce(
    (total, project) => total + project.attachments.length,
    0,
  );
  const attachments = publicProjects.flatMap((project) => project.attachments);

  return {
    schema_version: 2,
    metadata: {
      dataset_id: "lamezia-pnrr-static-feed",
      source: "Città di Lamezia Terme — Attuazione Misure PNRR",
      source_url: COMUNE_PNRR_INDEX_URL,
      source_type: "official_municipal_project_pages",
      materialized_at: materializedAt,
      source_index_hash: sha256(
        stableStringify(
          publicProjects.map(
            ({ source_id, source_url, source_record_hash }) => ({
              source_id,
              source_url,
              source_record_hash,
            }),
          ),
        ),
      ),
      albo_snapshot_generated_at: alboSnapshotGeneratedAt,
      update_policy:
        "Controllo giornaliero della sezione comunale PNRR e riconciliazione con gli output pubblici dell'Albo Pretorio; il file cambia solo quando mutano dati o collegamenti documentali.",
      reconciliation_rule:
        "Gli atti Albo sono collegati a una scheda progetto esclusivamente quando condividono lo stesso CUP normalizzato; i soli richiami testuali PNRR restano evidenze non riconciliate.",
      coverage_note:
        "Il perimetro deriva dalle schede pubblicate nella sezione PNRR del Comune e non equivale al censimento nazionale completo ReGiS/Italia Domani.",
      caveat:
        "Importi, stati e allegati descrivono quanto pubblicato nelle fonti acquisite. L'assenza di un campo o di un atto non dimostra assenza amministrativa, ritardo o criticità.",
      licence_or_terms_note:
        "Il dataset civico conserva campi descrittivi, metadati di provenienza e collegamenti alle fonti ufficiali; per il riuso dei documenti si applicano le condizioni indicate dai rispettivi portali.",
    },
    attachment_taxonomy: {
      schema_version: "pnrr-attachment-phase.v1",
      order_policy:
        "Gli allegati mantengono l'ordine della scheda comunale; non viene inferita una cronologia quando il titolo non espone una data.",
      classification_policy:
        "La fase documentale è una classificazione automatica basata soltanto sul titolo dell'allegato e serve alla navigazione: non rappresenta lo stato di avanzamento del progetto.",
      date_policy:
        "La data o l'anno sono esposti solo quando compaiono esplicitamente nel titolo o nel nome del file; la precisione resta dichiarata.",
      phases: MUNICIPAL_ATTACHMENT_PHASES,
    },
    coverage: {
      projects: publicProjects.length,
      projects_with_cup: publicProjects.filter((project) => project.cup).length,
      projects_with_amount: publicProjects.filter(
        (project) => project.amount_eur != null,
      ).length,
      projects_with_albo_evidence: publicProjects.filter(
        (project) => project.albo_evidence_ids.length > 0,
      ).length,
      municipal_attachments: attachmentsCount,
      municipal_attachments_classified: attachments.filter(
        (attachment) => attachment.phase !== "other",
      ).length,
      municipal_attachments_with_year: attachments.filter(
        (attachment) => attachment.document_year != null,
      ).length,
      municipal_attachments_with_day: attachments.filter(
        (attachment) => attachment.date_precision === "day",
      ).length,
      albo_evidence: alboEvidence.length,
      linked_albo_evidence: linkedEvidenceIds.size,
      unmatched_albo_evidence: unmatchedEvidenceIds.length,
    },
    projects: publicProjects,
    albo_evidence: alboEvidence,
    unmatched_albo_evidence_ids: unmatchedEvidenceIds,
  };
}

export function validateStaticPnrrDataset(
  dataset,
  { minimumProjects = 1 } = {},
) {
  const errors = [];
  const projects = Array.isArray(dataset?.projects) ? dataset.projects : [];
  const evidence = Array.isArray(dataset?.albo_evidence)
    ? dataset.albo_evidence
    : [];
  const evidenceIds = new Set(evidence.map((item) => item.id));
  const sourceIds = new Set();

  if (dataset?.schema_version !== 2) {
    errors.push("schema_version must be 2");
  }
  const attachmentPhases = new Map(
    (dataset?.attachment_taxonomy?.phases ?? []).map((phase) => [
      phase.id,
      phase,
    ]),
  );
  if (
    attachmentPhases.size !== MUNICIPAL_ATTACHMENT_PHASES.length ||
    MUNICIPAL_ATTACHMENT_PHASES.some(
      (phase) => attachmentPhases.get(phase.id)?.label !== phase.label,
    )
  ) {
    errors.push("attachment_taxonomy does not match the supported phases");
  }
  if (projects.length < minimumProjects) {
    errors.push(
      `projects must contain at least ${minimumProjects} records (found ${projects.length})`,
    );
  }

  for (const project of projects) {
    if (!project?.source_id || sourceIds.has(project.source_id)) {
      errors.push(
        `duplicate or missing project source_id: ${project?.source_id}`,
      );
    }
    sourceIds.add(project?.source_id);
    if (!project?.title?.trim()) {
      errors.push(`project ${project?.source_id} has no title`);
    }
    if (!isOfficialMunicipalProjectUrl(project?.source_url)) {
      errors.push(`project ${project?.source_id} has an unexpected source URL`);
    }
    if (project?.cup && !/^[A-Z][0-9]{2}[A-Z][0-9]{11}$/.test(project.cup)) {
      errors.push(`project ${project?.source_id} has an invalid CUP`);
    }
    if (project?.amount_eur != null && project.amount_eur <= 0) {
      errors.push(`project ${project?.source_id} has a non-positive amount`);
    }

    for (const [attachmentIndex, attachment] of (
      project?.attachments ?? []
    ).entries()) {
      if (!attachment?.title?.trim() || !isHttpUrl(attachment?.url)) {
        errors.push(
          `project ${project?.source_id} has an invalid municipal attachment`,
        );
      }
      if (
        !Number.isInteger(attachment?.source_order) ||
        attachment.source_order !== attachmentIndex
      ) {
        errors.push(
          `project ${project?.source_id} has an invalid attachment source order`,
        );
      }
      if (!MUNICIPAL_ATTACHMENT_PHASE_BY_ID.has(attachment?.phase)) {
        errors.push(
          `project ${project?.source_id} has an unsupported attachment phase`,
        );
      }
      if (
        attachment?.date_precision === "day" &&
        (!isIsoCalendarDate(attachment?.document_date) ||
          attachment.document_year !==
            Number(attachment.document_date?.slice(0, 4)) ||
          attachment.date_basis !== "title_explicit_date")
      ) {
        errors.push(
          `project ${project?.source_id} has an invalid attachment day precision`,
        );
      }
      if (
        attachment?.date_precision === "year" &&
        (!Number.isInteger(attachment?.document_year) ||
          attachment.document_year < 2020 ||
          attachment.document_year > 2035 ||
          attachment.document_date != null ||
          attachment.date_basis !== "title_or_filename_year")
      ) {
        errors.push(
          `project ${project?.source_id} has an invalid attachment year precision`,
        );
      }
      if (
        attachment?.date_precision == null &&
        (attachment?.document_date != null ||
          attachment?.document_year != null ||
          attachment?.date_basis != null)
      ) {
        errors.push(
          `project ${project?.source_id} has attachment date data without precision`,
        );
      }
      if (
        (attachment?.phase === "other") !==
        (attachment?.classification_basis === "unclassified")
      ) {
        errors.push(
          `project ${project?.source_id} has inconsistent attachment classification metadata`,
        );
      }
    }

    for (const evidenceId of project?.albo_evidence_ids ?? []) {
      const item = evidence.find((candidate) => candidate.id === evidenceId);
      if (!item || !evidenceIds.has(evidenceId)) {
        errors.push(
          `project ${project?.source_id} references missing evidence ${evidenceId}`,
        );
        continue;
      }
      if (!project.cup || !item.cups?.includes(project.cup)) {
        errors.push(
          `project ${project?.source_id} links evidence ${evidenceId} without a shared CUP`,
        );
      }
    }
  }

  if (evidenceIds.size !== evidence.length) {
    errors.push("albo_evidence contains duplicate ids");
  }
  for (const item of evidence) {
    if (
      item.public_visibility !== "publishable" ||
      item.privacy_risk !== "low" ||
      item.verification_status !== "official_source_acquired"
    ) {
      errors.push(`evidence ${item.id} does not meet the public safety policy`);
    }
  }

  if (dataset?.coverage?.projects !== projects.length) {
    errors.push("coverage.projects does not match the project records");
  }
  if (dataset?.coverage?.albo_evidence !== evidence.length) {
    errors.push("coverage.albo_evidence does not match the evidence records");
  }
  const municipalAttachments = projects.flatMap(
    (project) => project.attachments ?? [],
  );
  if (
    dataset?.coverage?.municipal_attachments !== municipalAttachments.length
  ) {
    errors.push(
      "coverage.municipal_attachments does not match the attachment records",
    );
  }
  if (
    dataset?.coverage?.municipal_attachments_classified !==
    municipalAttachments.filter((attachment) => attachment.phase !== "other")
      .length
  ) {
    errors.push(
      "coverage.municipal_attachments_classified does not match the attachment records",
    );
  }
  if (
    dataset?.coverage?.municipal_attachments_with_year !==
    municipalAttachments.filter(
      (attachment) => attachment.document_year != null,
    ).length
  ) {
    errors.push(
      "coverage.municipal_attachments_with_year does not match the attachment records",
    );
  }
  if (
    dataset?.coverage?.municipal_attachments_with_day !==
    municipalAttachments.filter(
      (attachment) => attachment.date_precision === "day",
    ).length
  ) {
    errors.push(
      "coverage.municipal_attachments_with_day does not match the attachment records",
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid Lamezia PNRR static dataset:\n- ${errors.join("\n- ")}`,
    );
  }
  return dataset;
}

export function validateCoverageRegression(candidate, previous) {
  if (!previous?.coverage) return candidate;

  const checks = [
    ["projects", 0.8],
    ["projects_with_cup", 0.75],
    ["projects_with_amount", 0.75],
    ["municipal_attachments", 0.5],
  ];
  const regressions = [];

  for (const [metric, minimumRetainedRatio] of checks) {
    const previousValue = Number(previous.coverage[metric] ?? 0);
    const candidateValue = Number(candidate?.coverage?.[metric] ?? 0);
    if (
      previousValue > 0 &&
      candidateValue < previousValue * minimumRetainedRatio
    ) {
      regressions.push(
        `${metric} dropped from ${previousValue} to ${candidateValue}`,
      );
    }
  }

  if (regressions.length > 0) {
    throw new Error(
      `Unexpected Lamezia PNRR coverage regression; previous output was not changed:\n- ${regressions.join("\n- ")}`,
    );
  }
  return candidate;
}

export function stableDatasetPayload(dataset) {
  if (!dataset) return null;
  return {
    schema_version: dataset.schema_version,
    metadata: {
      ...dataset.metadata,
      materialized_at: null,
      albo_snapshot_generated_at: null,
    },
    attachment_taxonomy: dataset.attachment_taxonomy,
    coverage: dataset.coverage,
    projects: dataset.projects,
    albo_evidence: dataset.albo_evidence,
    unmatched_albo_evidence_ids: dataset.unmatched_albo_evidence_ids,
  };
}

export function stableStringify(value) {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys(value[key])]),
  );
}

function extractLabelledField(html, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = new RegExp(
      `<b[^>]*>\\s*${escaped}\\s*:?\\s*</b>\\s*([\\s\\S]*?)(?=</p>|<p\\b|<br\\s*\\/?\\s*>|<b\\b|</div>)`,
      "i",
    ).exec(html);
    const value = cleanHtmlText(match?.[1]);
    if (value) return value;
  }
  return null;
}

function sectionAfterAnchor(html, anchorId, maxLength) {
  const match = new RegExp(`id=["']${anchorId}["']`, "i").exec(html);
  if (!match) return null;
  return html.slice(match.index, match.index + maxLength);
}

function extractAttachments(section, baseUrl) {
  if (!section) return [];

  const attachments = new Map();
  const pattern = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(section)) !== null) {
    const rawUrl = decodeHtmlEntities(match[1]).trim();
    if (!/\.(?:pdf|p7m|zip|docx?|xlsx?)(?:[?#].*)?$/i.test(rawUrl)) continue;

    let url;
    try {
      url = new URL(rawUrl, baseUrl);
    } catch {
      continue;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") continue;

    const title =
      cleanHtmlText(match[2]) ??
      decodeURIComponent(url.pathname.split("/").pop() ?? "Allegato");
    const canonicalUrl = url.toString();
    if (attachments.has(canonicalUrl)) continue;
    attachments.set(
      canonicalUrl,
      deriveMunicipalAttachmentMetadata({
        title,
        url: canonicalUrl,
        sourceOrder: attachments.size,
      }),
    );
  }
  return Array.from(attachments.values());
}

function normaliseAttachmentSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[_./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAttachmentSequence(value) {
  const match = /^\s*0*([1-9][0-9]?)(?=\s*(?:[-.)_]|[a-zA-ZÀ-ÿ]))/.exec(
    String(value ?? ""),
  );
  return match ? Number(match[1]) : null;
}

function parseNumericAttachmentDate(value) {
  const match =
    /(?:^|[^0-9])([0-3]?[0-9])[./-]([01]?[0-9])[./-](20[0-9]{2})(?:[^0-9]|$)/.exec(
      String(value ?? ""),
    );
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function extractAttachmentYearCandidates(value) {
  return Array.from(
    new Set(
      Array.from(String(value ?? "").matchAll(/20[0-9]{2}/g), (match) =>
        Number(match[0]),
      ).filter((year) => year >= 2020 && year <= 2035),
    ),
  ).sort((left, right) => left - right);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isIsoCalendarDate(value) {
  const match = /^(20[0-9]{2})-([0-9]{2})-([0-9]{2})$/.exec(
    String(value ?? ""),
  );
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isEligiblePublicAlboRecord(record) {
  return (
    record.public_visibility === "publishable" &&
    record.privacy_risk === "low" &&
    record.verification_status === "official_source_acquired"
  );
}

function isOfficialMunicipalProjectUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.comune.lamezia-terme.cz.it" &&
      /^\/it\/attuazione-misure-pnrr\/\d+$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function compareEvidence(left, right) {
  const date = String(right.publication_start ?? "").localeCompare(
    String(left.publication_start ?? ""),
  );
  return date || String(left.id).localeCompare(String(right.id), "it");
}

function compareProjects(left, right) {
  const mission = String(left.mission ?? "").localeCompare(
    String(right.mission ?? ""),
    "it",
  );
  return mission || left.title.localeCompare(right.title, "it");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function withEvidenceHash(evidence) {
  return {
    ...evidence,
    evidence_hash: sha256(stableStringify(evidence)),
  };
}

function hashEvidence(evidence) {
  const { evidence_hash: _ignored, ...payload } = evidence;
  return sha256(stableStringify(payload));
}
