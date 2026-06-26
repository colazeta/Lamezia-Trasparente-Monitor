import { ExternalLink, Hash, KeyRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  ContractDossier,
  ContractIdentifier,
} from "@/lib/contractDossier";

import { ContractSourceBadge } from "./ContractSourceBadge";

export function ContractIdentifiersCard({
  dossier,
}: {
  dossier: ContractDossier;
}) {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-brand" />
        <h2 className="font-display text-lg font-bold tracking-tight">
          Identificativi
        </h2>
      </div>
      <dl className="grid gap-3 sm:grid-cols-3">
        {dossier.identifiers.map((identifier) => (
          <IdentifierItem key={identifier.kind} identifier={identifier} />
        ))}
      </dl>
    </section>
  );
}

function IdentifierItem({ identifier }: { identifier: ContractIdentifier }) {
  const value =
    identifier.normalizedValue ?? identifier.value ?? "Non rilevato";

  return (
    <div className="rounded-xl border border-border bg-muted/25 p-4">
      <dt className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
          <Hash className="h-3.5 w-3.5" />
          {identifier.label}
        </span>
        <ContractSourceBadge status={identifier.sourceStatus} />
      </dt>
      <dd className="mt-2 min-w-0">
        <div className="truncate font-mono text-sm font-semibold text-foreground">
          {value}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {identifier.note}
        </p>
        {identifier.sourceUrl ? (
          <a
            href={identifier.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Apri fonte
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <Badge variant="outline" className="mt-3 text-[10px] shadow-none">
            {identifier.sourceLabel}
          </Badge>
        )}
      </dd>
    </div>
  );
}
