import { ExternalLink, FileText, ShieldCheck } from "lucide-react";

import type { ContractDossier, ContractEvidence } from "@/lib/contractDossier";

import { ContractSourceBadge } from "./ContractSourceBadge";

export function ContractEvidencePanel({
  dossier,
}: {
  dossier: ContractDossier;
}) {
  const evidence = dossier.evidence;

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fonti e prove
          </span>
          <h2 className="mt-2 font-display text-lg font-bold tracking-tight">
            Evidenze del fascicolo
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {evidence.length} {evidence.length === 1 ? "voce" : "voci"}
        </span>
      </div>

      <div className="space-y-3">
        {evidence.map((item) => (
          <EvidenceItem key={item.id} evidence={item} />
        ))}
      </div>

      {dossier.officialLinks.length > 0 ? (
        <div className="mt-5 border-t border-border pt-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Collegamenti ufficiali
          </div>
          <div className="flex flex-wrap gap-2">
            {dossier.officialLinks.map((link) => (
              <a
                key={`${link.sourceKind}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10"
                title={link.note}
              >
                {link.label}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function EvidenceItem({ evidence }: { evidence: ContractEvidence }) {
  const isExternal = evidence.sourceUrl?.startsWith("http");

  return (
    <article className="rounded-xl border border-border bg-muted/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <FileText className="h-4 w-4 text-brand" />
            <h3 className="font-display text-sm font-bold tracking-tight">
              {evidence.title}
            </h3>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {evidence.description}
          </p>
        </div>
        <ContractSourceBadge status={evidence.sourceStatus} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>{evidence.sourceLabel}</span>
        {evidence.identifier ? <span>via {evidence.identifier}</span> : null}
        {evidence.sourceUrl ? (
          <a
            href={evidence.sourceUrl}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            Apri riferimento
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
