import type { ComponentType } from "react";
import {
  useGetStatsOverview,
  useListContracts,
  useListConvocazioni,
} from "@workspace/api-client-react";
import { CalendarClock, Euro, FileSearch, type LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Skeleton } from "@/components/ui/skeleton";

type PreviewKind = "contracts" | "convocazioni" | "acts";

/**
 * Mappa la destinazione di una domanda al tipo di anteprima dati da mostrare.
 * Restituisce `null` per le destinazioni senza un dato live rilevante.
 */
export function previewKindForPath(path: string): PreviewKind | null {
  const p = (path.split("?")[0] ?? "").toLowerCase();
  if (p.startsWith("/contratti")) return "contracts";
  if (p.startsWith("/convocazioni")) return "convocazioni";
  if (p.startsWith("/albo") || p.startsWith("/delibere")) return "acts";
  return null;
}

export function hasPreview(path: string): boolean {
  return previewKindForPath(path) !== null;
}

/**
 * Anteprima dati live opzionale per una card domanda. Sceglie l'hook giusto in
 * base alla destinazione e mostra uno scheletro durante il caricamento; se non
 * ci sono dati, non rende nulla (degrada con grazia).
 */
export function QuestionPreview({
  destinationPath,
}: {
  destinationPath: string;
}) {
  const kind = previewKindForPath(destinationPath);
  if (kind === "contracts") return <ContractsPreview />;
  if (kind === "convocazioni") return <ConvocazioniPreview />;
  if (kind === "acts") return <ActsPreview />;
  return null;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

function ContractsPreview() {
  const { data, isLoading } = useListContracts();
  if (isLoading) return <PreviewSkeleton />;
  // Gli appalti sono ordinati per data di affidamento (più recente prima); molti
  // record ANAC non riportano l'importo, quindi mostriamo l'ultimo con importo.
  const latest = data?.find((c) => c.amount > 0);
  if (!latest) return null;
  return (
    <PreviewShell icon={Euro} label="Ultimo appalto">
      <span className="font-bold tabular-nums text-foreground">
        {formatEuro(latest.amount)}
      </span>
    </PreviewShell>
  );
}

function ConvocazioniPreview() {
  const { data, isLoading } = useListConvocazioni();
  if (isLoading) return <PreviewSkeleton />;
  const next = data?.[0];
  const date = next?.dataAtto ?? next?.pubStart;
  if (!date) return null;
  return (
    <PreviewShell icon={CalendarClock} label="Ultima convocazione">
      <span className="font-bold text-foreground">{formatDate(date)}</span>
    </PreviewShell>
  );
}

function ActsPreview() {
  const { data, isLoading } = useGetStatsOverview();
  if (isLoading) return <PreviewSkeleton />;
  if (!data) return null;
  return (
    <PreviewShell icon={FileSearch} label="Atti pubblicati">
      <span className="font-bold tabular-nums text-foreground">
        {data.acts.toLocaleString("it-IT")}
      </span>
    </PreviewShell>
  );
}

function PreviewShell({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon | ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 text-brand" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto">{children}</span>
    </div>
  );
}

function PreviewSkeleton() {
  return <Skeleton className="h-[34px] w-full rounded-lg" />;
}
