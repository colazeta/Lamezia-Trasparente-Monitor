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
import {
  PROPOSAL_GEO_AREA_LABELS,
  PROPOSAL_GEO_PRECISION_LABELS,
  PROPOSAL_GEO_SCOPE_LABELS,
  getProposalGeography,
  isProposalGeoreferenced,
} from "@/data/proposalGeography";
import {
  PROPOSAL_CHANNEL_LABELS,
  PROPOSAL_EVIDENCE_LABELS,
  PROPOSAL_EVENT_LABELS,
  PROPOSAL_PROMOTER_TYPE_LABELS,
  PROPOSAL_STATUS_LABELS,
  type PublicProposal,
  type ProposalStatus,
} from "@/data/propostePubbliche";

function statusBadgeVariant(status: ProposalStatus) {
  switch (status) {
    case "presentata_formalmente":
    case "discussa":
      return "default" as const;
    case "recepita_parzialmente":
    case "recepita_integralmente":
      return "secondary" as const;
    case "non_verificabile":
    case "senza_seguito_noto":
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
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-snug text-foreground">{children}</dd>
    </div>
  );
}

function TerritoryBlock({ proposal }: { proposal: PublicProposal }) {
  const geography = getProposalGeography(proposal.id);
  if (!geography) return null;

  const georeferenced = isProposalGeoreferenced(proposal.id);

  if (!georeferenced) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Landmark className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">Ambito territoriale</p>
          <Badge variant="outline">Non georeferenziata</Badge>
          <Badge variant="secondary">Intera città</Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {geography.label}. Nessuna coordinata viene assegnata perché la proposta
          riguarda genericamente l’intero territorio comunale.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.035] px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <MapPinned className="h-4 w-4 text-primary" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">Riferimento geografico</p>
        <Badge variant="secondary">Georeferenziata</Badge>
        <Badge variant="outline">{PROPOSAL_GEO_SCOPE_LABELS[geography.scope]}</Badge>
        {geography.areas.map((area) => (
          <Badge key={area} variant="outline">
            <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
            {PROPOSAL_GEO_AREA_LABELS[area]}
          </Badge>
        ))}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {geography.label}
      </p>

      <details className="mt-2 text-xs">
        <summary className="cursor-pointer font-semibold text-primary">
          {geography.points.length === 1
            ? "Coordinate e fonte geografica"
            : `${geography.points.length} riferimenti geografici`}
        </summary>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {geography.points.map((point) => (
            <div key={point.id} className="rounded-lg border border-border bg-background p-3">
              <p className="font-semibold leading-relaxed text-foreground">
                {point.label}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {PROPOSAL_GEO_PRECISION_LABELS[point.precision]}
              </p>
              {point.sourceUrl ? (
                <a
                  href={point.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {point.sourceLabel}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {point.sourceLabel}
                </p>
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

export function ProposalDossierCard({ proposal }: { proposal: PublicProposal }) {
  const orderedEvents = [...proposal.events].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const latestEvent = orderedEvents[orderedEvents.length - 1];
  const georeferenced = isProposalGeoreferenced(proposal.id);

  return (
    <article
      id={proposal.id}
      className="rounded-2xl border border-border bg-card shadow-sm"
      aria-labelledby={`${proposal.id}-title`}
    >
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={statusBadgeVariant(proposal.status)}>
                {PROPOSAL_STATUS_LABELS[proposal.status]}
              </Badge>
              <Badge variant="outline">{PROPOSAL_CHANNEL_LABELS[proposal.channel]}</Badge>
              <Badge variant="secondary">{proposal.theme}</Badge>
              <Badge variant={georeferenced ? "secondary" : "outline"}>
                {georeferenced ? "Georeferenziata" : "Non georeferenziata · intera città"}
              </Badge>
            </div>

            <h3
              id={`${proposal.id}-title`}
              className="mt-3 font-display text-xl font-semibold tracking-tight md:text-2xl"
            >
              {proposal.title}
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              {proposal.summary}
            </p>
          </div>

          <div className="shrink-0 text-xs text-muted-foreground lg:text-right">
            <p className="inline-flex items-center gap-1.5 lg:justify-end">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Prima evidenza {formatDate(proposal.firstSeen)}
            </p>
            <p className="mt-1">Aggiornata {formatDate(proposal.lastUpdated)}</p>
          </div>
        </div>

        <dl className="mt-4 grid gap-x-5 gap-y-3 rounded-xl border border-border bg-muted/15 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetadataItem label="Promotore">
            <span className="inline-flex items-start gap-1.5">
              <UsersRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>
                <span className="font-semibold">{proposal.promoter}</span>
                <span className="block text-xs text-muted-foreground">
                  {PROPOSAL_PROMOTER_TYPE_LABELS[proposal.promoterType]}
                </span>
              </span>
            </span>
          </MetadataItem>
          <MetadataItem label="Destinatario">
            {proposal.institutionalRecipient ?? "Non indicato"}
          </MetadataItem>
          <MetadataItem label="Filone">{proposal.threadLabel}</MetadataItem>
          <MetadataItem label="Evidenza">
            {PROPOSAL_EVIDENCE_LABELS[proposal.evidenceLevel]}
          </MetadataItem>
        </dl>

        {proposal.coPromoters?.length ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Altri soggetti citati:</span>{" "}
            {proposal.coPromoters.join(", ")}
          </p>
        ) : null}

        <div className="mt-3">
          <TerritoryBlock proposal={proposal} />
        </div>

        {latestEvent ? (
          <div className="mt-3 rounded-xl border border-border px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <History className="h-4 w-4 text-primary" aria-hidden="true" />
                  <p className="text-sm font-semibold text-foreground">Ultimo sviluppo</p>
                  <Badge variant="outline">{PROPOSAL_EVENT_LABELS[latestEvent.type]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(latestEvent.date)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {latestEvent.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {latestEvent.summary}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {orderedEvents.length} {orderedEvents.length === 1 ? "evento" : "eventi"}
              </Badge>
            </div>

            {orderedEvents.length > 1 ? (
              <details className="mt-3 border-t border-border pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-primary">
                  Apri la timeline completa
                </summary>
                <ol className="mt-3 space-y-3 border-l border-border pl-4">
                  {orderedEvents.map((event) => (
                    <li key={event.id} className="relative">
                      <span
                        className="absolute -left-[1.16rem] top-1.5 h-2 w-2 rounded-full border border-background bg-primary"
                        aria-hidden="true"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {formatDate(event.date)}
                        </span>
                        <Badge variant="outline">{PROPOSAL_EVENT_LABELS[event.type]}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {event.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {event.summary}
                      </p>
                      {event.sourceUrl ? (
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          {event.sourceLabel}
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.sourceLabel}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}
          </div>
        ) : null}

        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Fonte principale
            </span>
            {proposal.sourceUrl ? (
              <a
                href={proposal.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
              >
                <span className="truncate">{proposal.sourceLabel}</span>
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              </a>
            ) : (
              <span className="font-semibold text-foreground">{proposal.sourceLabel}</span>
            )}
            {proposal.linkedActs.length > 0 ? (
              <span className="text-muted-foreground">
                {proposal.linkedActs.length} {proposal.linkedActs.length === 1 ? "atto collegato" : "atti collegati"}
              </span>
            ) : null}
          </div>
        </div>

        <details className="mt-3 rounded-xl border border-border bg-muted/10 px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold text-foreground">
            Documentazione e verifica
          </summary>
          {proposal.linkedActs.length > 0 ? (
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Atti collegati
              </p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {proposal.linkedActs.map((act) => (
                  <li key={act}>{act}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className={proposal.linkedActs.length > 0 ? "mt-3 border-t border-border pt-3" : "mt-3"}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Nota di verifica redazionale
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {proposal.verificationNote}
            </p>
          </div>
        </details>
      </div>
    </article>
  );
}
