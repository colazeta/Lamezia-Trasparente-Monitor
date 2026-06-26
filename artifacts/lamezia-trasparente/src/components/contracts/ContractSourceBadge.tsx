import { Badge } from "@/components/ui/badge";
import type { ContractSourceStatus } from "@/lib/contractDossier";

const SOURCE_STATUS_META: Record<
  ContractSourceStatus,
  { label: string; className: string }
> = {
  "official-source": {
    label: "Fonte ufficiale",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  "derived-data": {
    label: "Dato derivato",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  "search-bridge": {
    label: "Collegamento parziale",
    className:
      "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300",
  },
  "missing-source": {
    label: "Fonte mancante",
    className: "border-border bg-muted text-muted-foreground",
  },
  "information-limit": {
    label: "Limite informativo",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
};

export function ContractSourceBadge({
  status,
  className = "",
}: {
  status: ContractSourceStatus;
  className?: string;
}) {
  const meta = SOURCE_STATUS_META[status];

  return (
    <Badge className={`text-[10px] shadow-none ${meta.className} ${className}`}>
      {meta.label}
    </Badge>
  );
}

export function sourceStatusLabel(status: ContractSourceStatus): string {
  return SOURCE_STATUS_META[status].label;
}
