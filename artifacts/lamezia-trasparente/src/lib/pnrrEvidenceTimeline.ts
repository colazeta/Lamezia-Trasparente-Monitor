import type { PnrrViewProject } from "@/data/lameziaPnrr";

export type PnrrEvidenceDatePrecision = "day" | "year";

export type PnrrEvidenceEventKind =
  | "project_publication"
  | "project_update"
  | "opencup_generation"
  | "opencup_acquisition"
  | "municipal_attachment"
  | "albo_publication"
  | "contract_award";

export interface PnrrEvidenceEvent {
  id: string;
  kind: PnrrEvidenceEventKind;
  date: string;
  datePrecision: PnrrEvidenceDatePrecision;
  sortTimestamp: number;
  title: string;
  sourceLabel: string;
  description: string;
  href: string | null;
}

export interface PnrrEvidenceTimeline {
  events: PnrrEvidenceEvent[];
  undatedEvidenceCount: number;
}

function parseExactDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    date: value,
    sortTimestamp: parsed.getTime(),
  };
}

function parseYear(value: number | null | undefined) {
  if (value == null || !Number.isInteger(value) || value < 1900 || value > 2200)
    return null;
  return {
    date: String(value),
    sortTimestamp: Date.UTC(value, 0, 1),
  };
}

function eventIdentity(event: PnrrEvidenceEvent) {
  return [
    event.date,
    event.href ?? "",
    event.kind,
    event.title.trim().toLocaleLowerCase("it-IT"),
  ].join("|");
}

export function buildPnrrEvidenceTimeline(
  project: PnrrViewProject,
): PnrrEvidenceTimeline {
  const eventsByIdentity = new Map<string, PnrrEvidenceEvent>();
  let undatedEvidenceCount = 0;

  const add = (event: PnrrEvidenceEvent) => {
    const identity = eventIdentity(event);
    if (!eventsByIdentity.has(identity)) eventsByIdentity.set(identity, event);
  };

  const publishedAt = parseExactDate(project.publishedAt);
  if (publishedAt) {
    add({
      id: `project-publication-${project.key}`,
      kind: "project_publication",
      ...publishedAt,
      datePrecision: "day",
      title: "Pubblicazione della scheda progetto",
      sourceLabel:
        project.dataOrigin === "runtime-api"
          ? "Fonte progetto PNRR"
          : "Comune di Lamezia Terme",
      description:
        "Data di pubblicazione esposta nei metadati della scheda; non indica l'avvio dei lavori.",
      href: project.url ?? project.projectSourceUrl ?? null,
    });
  }

  const lastUpdatedAt = parseExactDate(project.lastUpdatedAt);
  if (lastUpdatedAt) {
    add({
      id: `project-update-${project.key}`,
      kind: "project_update",
      ...lastUpdatedAt,
      datePrecision: "day",
      title: "Aggiornamento della scheda progetto",
      sourceLabel: "Fonte progetto PNRR",
      description:
        "Data di aggiornamento dichiarata dalla fonte del progetto; non certifica una variazione dello stato dei lavori.",
      href: project.projectSourceUrl ?? project.url ?? null,
    });
  }

  const openCupGeneratedAt = parseExactDate(project.openCup?.generated_at);
  if (openCupGeneratedAt && project.openCup) {
    add({
      id: `opencup-generation-${project.key}`,
      kind: "opencup_generation",
      ...openCupGeneratedAt,
      datePrecision: "day",
      title: "Data di generazione esposta da OpenCUP",
      sourceLabel: "OpenCUP",
      description:
        "Riferimento anagrafico del sistema CUP; non rappresenta l'avvio o l'avanzamento dell'intervento.",
      href: project.openCup.source_url,
    });
  }

  const openCupAcquiredAt = parseExactDate(
    project.openCupAcquisition?.acquired_at,
  );
  if (openCupAcquiredAt) {
    add({
      id: `opencup-acquisition-${project.key}`,
      kind: "opencup_acquisition",
      ...openCupAcquiredAt,
      datePrecision: "day",
      title: "Acquisizione del corredo OpenCUP",
      sourceLabel: "Pipeline automatica OpenCUP",
      description:
        "Data tecnica di acquisizione dei dati: non indica avanzamento fisico, amministrativo o finanziario.",
      href: project.openCup?.source_url ?? null,
    });
  }

  for (const [index, attachment] of project.attachments.entries()) {
    const exactDate = parseExactDate(attachment.documentDate);
    const yearDate = exactDate ? null : parseYear(attachment.documentYear);
    const parsedDate = exactDate ?? yearDate;
    if (!parsedDate) {
      undatedEvidenceCount += 1;
      continue;
    }

    add({
      id: `municipal-attachment-${project.key}-${index}`,
      kind: "municipal_attachment",
      ...parsedDate,
      datePrecision: exactDate ? "day" : "year",
      title: attachment.title,
      sourceLabel: attachment.phaseLabel,
      description: exactDate
        ? "Data individuata nel titolo o nel nome del documento comunale."
        : "È disponibile soltanto l'anno individuato nel titolo o nel nome del file; l'ordine interno all'anno non è determinabile.",
      href: attachment.url,
    });
  }

  for (const document of project.documents) {
    const publicationDate = parseExactDate(document.pubStart);
    if (!publicationDate) {
      undatedEvidenceCount += 1;
      continue;
    }

    add({
      id: `albo-publication-${project.key}-${document.publicId || document.id}`,
      kind: "albo_publication",
      ...publicationDate,
      datePrecision: "day",
      title: document.oggetto,
      sourceLabel: `Albo Pretorio · ${document.tipologia}`,
      description:
        "Data di pubblicazione nell'Albo Pretorio del documento collegato tramite CUP.",
      href: document.publicId
        ? `/albo/${encodeURIComponent(document.publicId)}`
        : null,
    });
  }

  for (const linkedContract of project.linkedContracts) {
    const awardDate = parseExactDate(linkedContract.contract.awardDate);
    if (!awardDate) {
      undatedEvidenceCount += 1;
      continue;
    }

    add({
      id: `contract-award-${project.key}-${linkedContract.contract.id}`,
      kind: "contract_award",
      ...awardDate,
      datePrecision: "day",
      title: linkedContract.contract.title,
      sourceLabel: "Contratti pubblici",
      description: `Affidamento collegato esclusivamente tramite ${linkedContract.relationKey} ${linkedContract.relationValue}.`,
      href: `/contratti/${linkedContract.contract.id}`,
    });
  }

  const events = Array.from(eventsByIdentity.values()).sort((left, right) => {
    if (right.sortTimestamp !== left.sortTimestamp)
      return right.sortTimestamp - left.sortTimestamp;
    if (left.datePrecision !== right.datePrecision)
      return left.datePrecision === "day" ? -1 : 1;
    return left.title.localeCompare(right.title, "it-IT");
  });

  return { events, undatedEvidenceCount };
}
