import {
  CalendarDays,
  ExternalLink,
  FileText,
  History,
  Landmark,
  MapPinned,
  MapPin,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getInstitutionalProposalEvents } from "@/data/proposalArchiveTimeline";
import {
  CANONICAL_PROPOSAL_ACTION_LABELS,
  getCanonicalProposalPresentation,
} from "@/data/proposalCanonicalPresentation";
import {
  PROPOSAL_GEO_AREA_LABELS,
  PROPOSAL_GEO_PRECISION_LABELS,
  PROPOSAL_GEO_SCOPE_LABELS,
  getProposalGeography,
  isProposalGeoreferenced,
} from "@/data/proposalGeography";
import {
  getProposalPaSemanticProfile,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "@/data/proposalPaSemanticProfile";
import {
  PROPOSAL_CHANNEL_LABELS,
  PROPOSAL_COMPETENCE_ASSESSMENT_LABELS,
  PROPOSAL_EVIDENCE_LABELS,
  PROPOSAL_EVENT_LABELS,
  PROPOSAL_PROMOTER_TYPE_LABELS,
  PROPOSAL_PUBLIC_STATE_LABELS,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  type PublicProposal,
  type ProposalPublicState,
} from "@/data/propostePubbliche";

function statusBadgeVariant(status: ProposalPublicState) {
  switch (status) {
    case "presentata":
    case "con_seguito":
      return "default" as const;
    case "in_attuazione":
      return "secondary" as const;
    case "da_verificare":
    case "nessun_seguito_noto":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function MetadataItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-xs leading-snug text-foreground">{children}</dd>
    </div>
  );
}

function TerritoryBlock({ proposal }: { proposal: PublicProposal }) {
  const geography = getProposalGeography(proposal.id);
  if (!geography) return null;

  if (!isProposalGeoreferenced(proposal.id)) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/15 px-3 py-2 text-xs">
        <Landmark className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="font-semibold text-foreground">Ambito cittadino</span>
        <Badge variant="outline">Non georeferenziata</Badge>
        <span className="text-muted-foreground">{geography.label}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/[0.025] px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <MapPinned className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span className="font-semibold text-foreground">Georeferenziata</span>
        <Badge variant="outline">{PROPOSAL_GEO_SCOPE_LABELS[geography.scope]}</Badge>
        {geography.areas.map((area) => (
          <Badge key={area} variant="outline">
            <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
            {PROPOSAL_GEO_AREA_LABELS[area]}
          </Badge>
        ))}
        <span className="text-muted-foreground">{geography.label}</span>
      </div>

      <details className="mt-2 text-xs">
        <summary className="cursor-pointer font-semibold text-primary">
          {geography.points.length === 1
            ? "Coordinate e fonte"
            : `${geography.points.length} riferimenti geografici`}
        </summary>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {geography.points.map((point) => (
            <div key={point.id} className="rounded-md border border-border bg-background p-2.5">
              <p className="font-semibold text-foreground">{point.label}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {PROPOSAL_GEO_PRECISION_LABELS[point.precision]}
              </p>
              {point.sourceUrl ? (
                <a
                  href={point.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  {point.sourceLabel}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : (
                <p className="mt-1 text-[10px] text-muted-foreground">{point.sourceLabel}</p>
              )}
            </div>
          ))}
        </div>
        {geography.note ? (
          <p className="mt-2 leading-relaxed text-muted-foreground">{geography.note}</p>
        ) : null}
      </details>
    </div>
  );
}

function InstitutionalPath({ proposal }: { proposal: PublicProposal }) {
  const institutionalEvents = getInstitutionalProposalEvents(proposal);
  const latestInstitutionalEvent = institutionalEvents.at(-1);
  const state = getProposalInstitutionalState(proposal);

  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Landmark className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span className="font-semibold text-foreground">Percorso istituzionale</span>
        <Badge variant="outline">
          {PROPOSAL_PUBLIC_STATE_LABELS[state.publicState]}
        </Badge>
        {institutionalEvents.length > 0 ? (
          <span className="text-muted-foreground">
            {institutionalEvents.length}{" "}
            {institutionalEvents.length === 1 ? "passaggio documentato" : "passaggi documentati"}
          </span>
        ) : (
          <span className="text-muted-foreground">nessun passaggio istituzionale documentato</span>
        )}
        {latestInstitutionalEvent ? (
          <span className="text-muted-foreground">
            · ultimo: {PROPOSAL_EVENT_LABELS[latestInstitutionalEvent.type]} {formatDate(latestInstitutionalEvent.date)}
          </span>
        ) : null}
        {proposal.linkedActs.length > 0 ? (
          <Badge variant="secondary">
            {proposal.linkedActs.length} {proposal.linkedActs.length === 1 ? "atto" : "atti"}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

function CanonicalRequestBlock({ proposal }: { proposal: PublicProposal }) {
  const canonical = getCanonicalProposalPresentation(proposal);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/[0.025] px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="text-xs font-semibold text-foreground">Cosa chiede</p>
        <Badge variant="secondary">Standard LT v{canonical.version}</Badge>
      </div>
      <p className="mt-1.5 text-sm leading-snug text-foreground">{canonical.request}</p>
      <ul className="mt-2 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
        {canonical.measures.map((measure) => (
          <li key={measure} className="flex gap-1.5">
            <span aria-hidden="true">•</span>
            <span>{measure}</span>
          </li>
        ))}
      </ul>
      {canonical.expectedOutcome ? (
        <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Risultato atteso:</span>{" "}
          {canonical.expectedOutcome}
        </p>
      ) : null}
    </div>
  );
}

function SemanticAudit({ proposal }: { proposal: PublicProposal }) {
  const canonical = getCanonicalProposalPresentation(proposal);
  const profile = getProposalPaSemanticProfile(proposal);
  const primary = getProposalPrimaryPaSubject(proposal);
  const secondary = getProposalSecondaryPaSubjects(proposal);
  const institutional = getProposalInstitutionalState(proposal);
  const competence = getProposalInstitutionalCompetence(proposal);

  return (
    <details className="rounded-md border border-border bg-background px-2.5 py-2">
      <summary className="cursor-pointer font-semibold text-foreground">
        Metadati semantici e di percorso
      </summary>
      <div className="mt-2 space-y-1.5 text-[11px] leading-relaxed">
        <p>
          <span className="font-semibold text-foreground">Materia principale:</span>{" "}
          <a href={primary.uri} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            {primary.label}
          </a>
        </p>
        {secondary.length > 0 ? (
          <p>
            <span className="font-semibold text-foreground">Classificazioni secondarie:</span>{" "}
            {secondary.map((subject, index) => (
              <span key={subject.uri}>
                {index > 0 ? ", " : ""}
                <a href={subject.uri} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {subject.label}
                </a>
              </span>
            ))}
          </p>
        ) : null}
        <p>
          <span className="font-semibold text-foreground">Facet operative LT:</span>{" "}
          {canonical.actionTypes
            .map((actionType) => CANONICAL_PROPOSAL_ACTION_LABELS[actionType])
            .join(", ")}
        </p>
        <p>
          <span className="font-semibold text-foreground">Stadio backend:</span>{" "}
          {institutional.progressStage} · status sorgente: {institutional.technicalStatus}
        </p>
        <p>
          <span className="font-semibold text-foreground">Destinatario sorgente:</span>{" "}
          {competence.sourceAddressee ?? "Non indicato"}
        </p>
        <p>
          <span className="font-semibold text-foreground">Competenza sostanziale:</span>{" "}
          {PROPOSAL_COMPETENCE_ASSESSMENT_LABELS[competence.assessmentStatus]}
        </p>
        {competence.primaryAuthority ? (
          <p>
            <span className="font-semibold text-foreground">Ente competente verificato:</span>{" "}
            {competence.primaryAuthority.label}
          </p>
        ) : null}
        {competence.involvedAuthorities.length > 0 ? (
          <p>
            <span className="font-semibold text-foreground">Enti coinvolti verificati:</span>{" "}
            {competence.involvedAuthorities.map((authority) => authority.label).join(", ")}
          </p>
        ) : null}
        <p>{competence.assessmentNote}</p>
        {profile.mappingNote ? <p>{profile.mappingNote}</p> : null}
      </div>
    </details>
  );
}

export function ProposalDossierCard({ proposal }: { proposal: PublicProposal }) {
  const orderedEvents = [...proposal.events].sort((a, b) => a.date.localeCompare(b.date));
  const latestEvent = orderedEvents[orderedEvents.length - 1];
  const georeferenced = isProposalGeoreferenced(proposal.id);
  const canonical = getCanonicalProposalPresentation(proposal);
  const primarySubject = getProposalPrimaryPaSubject(proposal);
  const institutionalState = getProposalInstitutionalState(proposal);
  const competence = getProposalInstitutionalCompetence(proposal);

  return (
    <article
      id={proposal.id}
      className="scroll-mt-24 rounded-xl border border-border bg-card shadow-sm"
      aria-labelledby={`${proposal.id}-title`}
    >
      <div className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={statusBadgeVariant(institutionalState.publicState)}>
            {PROPOSAL_PUBLIC_STATE_LABELS[institutionalState.publicState]}
          </Badge>
          <Badge variant="outline">{primarySubject.label}</Badge>
          <Badge variant={georeferenced ? "secondary" : "outline"}>
            {georeferenced ? "Georeferenziata" : "Intera città · non georeferenziata"}
          </Badge>
        </div>

        <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <h3 id={`${proposal.id}-title`} className="font-display text-lg font-semibold tracking-tight">
              {canonical.title}
            </h3>
            <p className="mt-1 text-sm leading-snug text-muted-foreground">{canonical.request}</p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground lg:max-w-[22rem] lg:justify-end">
            <span className="inline-flex items-center gap-1">
              <UsersRound className="h-3 w-3" aria-hidden="true" />
              <strong className="font-semibold text-foreground">{proposal.promoter}</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {formatDate(proposal.firstSeen)}
            </span>
          </div>
        </div>

        {latestEvent ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-2 text-xs">
            <History className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">Ultimo sviluppo</span>
            <span className="text-muted-foreground">{formatDate(latestEvent.date)}</span>
            <Badge variant="outline">{PROPOSAL_EVENT_LABELS[latestEvent.type]}</Badge>
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{latestEvent.title}</span>
          </div>
        ) : null}

        <details className="mt-2 border-t border-border pt-2">
          <summary className="cursor-pointer text-xs font-semibold text-primary">
            Apri dossier · {canonical.measures.length} misure · {orderedEvents.length}{" "}
            {orderedEvents.length === 1 ? "evento" : "eventi"}
            {proposal.linkedActs.length > 0
              ? ` · ${proposal.linkedActs.length} ${proposal.linkedActs.length === 1 ? "atto" : "atti"}`
              : ""}
          </summary>

          <div className="mt-3 space-y-2.5">
            <CanonicalRequestBlock proposal={proposal} />

            <dl className="grid gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/10 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetadataItem label="Promotore">
                <span className="font-semibold">{proposal.promoter}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {PROPOSAL_PROMOTER_TYPE_LABELS[proposal.promoterType]}
                </span>
              </MetadataItem>
              <MetadataItem label="A chi è rivolta">
                {competence.publicAddressee}
              </MetadataItem>
              <MetadataItem label="Filone">{proposal.threadLabel}</MetadataItem>
              <MetadataItem label="Canale / evidenza">
                {PROPOSAL_CHANNEL_LABELS[proposal.channel]} · {PROPOSAL_EVIDENCE_LABELS[proposal.evidenceLevel]}
              </MetadataItem>
            </dl>

            {proposal.coPromoters?.length ? (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Altri soggetti citati:</span>{" "}
                {proposal.coPromoters.join(", ")}
              </p>
            ) : null}

            <TerritoryBlock proposal={proposal} />
            <InstitutionalPath proposal={proposal} />

            <details className="rounded-lg border border-border px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-foreground">
                Cronologia completa
              </summary>
              <ol className="mt-2 space-y-2 border-l border-border pl-3">
                {orderedEvents.map((event) => (
                  <li key={event.id} className="relative text-xs">
                    <span
                      className="absolute -left-[0.97rem] top-1.5 h-1.5 w-1.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-muted-foreground">{formatDate(event.date)}</span>
                      <Badge variant="outline">{PROPOSAL_EVENT_LABELS[event.type]}</Badge>
                    </div>
                    <p className="mt-0.5 font-semibold text-foreground">{event.title}</p>
                    <p className="mt-0.5 leading-relaxed text-muted-foreground">{event.summary}</p>
                    {event.sourceUrl ? (
                      <a
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        {event.sourceLabel}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <p className="mt-0.5 text-muted-foreground">{event.sourceLabel}</p>
                    )}
                  </li>
                ))}
              </ol>
            </details>

            <details className="rounded-lg border border-border bg-muted/10 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-foreground">
                Fonti, record di acquisizione e verifica
              </summary>
              <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Fonte principale</span>
                  {proposal.sourceUrl ? (
                    <a
                      href={proposal.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      {proposal.sourceLabel}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="font-semibold text-foreground">{proposal.sourceLabel}</span>
                  )}
                </div>

                <div className="rounded-md border border-border bg-background px-2.5 py-2">
                  <p className="font-semibold text-foreground">Record di acquisizione</p>
                  <p className="mt-1 font-medium text-foreground">{proposal.title}</p>
                  <p className="mt-0.5 leading-relaxed">{proposal.summary}</p>
                  <p className="mt-1 text-[10px] leading-relaxed">
                    Tema originario: <span className="font-semibold">{proposal.theme}</span>.
                  </p>
                </div>

                {proposal.linkedActs.length > 0 ? (
                  <div>
                    <p className="font-semibold text-foreground">Atti collegati</p>
                    <ul className="mt-1 space-y-0.5">
                      {proposal.linkedActs.map((act) => (
                        <li key={act}>{act}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="border-t border-border pt-2">
                  <p className="font-semibold text-foreground">Nota di verifica redazionale</p>
                  <p className="mt-0.5 leading-relaxed">{proposal.verificationNote}</p>
                </div>
                <SemanticAudit proposal={proposal} />
              </div>
            </details>
          </div>
        </details>
      </div>
    </article>
  );
}
