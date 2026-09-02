import { useMemo, type ComponentType, type ReactNode } from "react";
import type { Contract } from "@workspace/api-client-react";
import {
  AlertCircle,
  CalendarDays,
  Euro,
  FileText,
  Gavel,
  Repeat2,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  supplierKey,
  type AttentionSignal,
} from "./contractCitizenSignals";

function formatEuro(value: number, compact = false): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : format(date, "dd MMM yyyy", { locale: it });
}

export function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

export function CitizenSummary({
  contracts,
  loading,
}: {
  contracts: Contract[];
  loading: boolean;
}) {
  const stats = useMemo(() => {
    const knownAmounts = contracts.filter((contract) => contract.amount > 0);
    const totalAmount = knownAmounts.reduce(
      (sum, contract) => sum + contract.amount,
      0,
    );
    const suppliers = new Set(
      contracts
        .map((contract) => supplierKey(contract.supplier))
        .filter((value): value is string => Boolean(value)),
    );
    const years = contracts
      .map((contract) => new Date(contract.awardDate).getFullYear())
      .filter((year) => Number.isFinite(year));
    const minYear = years.length > 0 ? Math.min(...years) : null;
    const maxYear = years.length > 0 ? Math.max(...years) : null;

    return {
      total: contracts.length,
      knownAmountCount: knownAmounts.length,
      totalAmount,
      suppliers: suppliers.size,
      period:
        minYear == null || maxYear == null
          ? "—"
          : minYear === maxYear
            ? String(minYear)
            : `${minYear}–${maxYear}`,
    };
  }, [contracts]);

  if (loading) {
    return (
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <section aria-label="Quadro sintetico" className="mb-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={FileText} label="Contratti nel perimetro" value={String(stats.total)} />
        <SummaryCard
          icon={Euro}
          label="Valore rilevato"
          value={stats.knownAmountCount > 0 ? formatEuro(stats.totalAmount, true) : "—"}
          sub={
            stats.knownAmountCount > 0
              ? `importo disponibile per ${stats.knownAmountCount} contratti`
              : "nessun importo esplicito"
          }
        />
        <SummaryCard icon={Users} label="Operatori economici" value={String(stats.suppliers)} />
        <SummaryCard icon={CalendarDays} label="Periodo osservato" value={stats.period} />
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 font-display text-2xl font-bold tracking-tight tabular-nums text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function AttentionContracts({
  items,
  loading,
  onOpen,
}: {
  items: { contract: Contract; signals: AttentionSignal[] }[];
  loading: boolean;
  onOpen: (contract: Contract) => void;
}) {
  if (loading) {
    return (
      <section className="mb-10">
        <Skeleton className="mb-3 h-7 w-64" />
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section id="contratti-da-approfondire" className="mb-10 scroll-mt-24">
      <div className="mb-4 max-w-3xl">
        <span className="eyebrow text-primary">
          <AlertCircle className="h-3.5 w-3.5" />
          Orientamento
        </span>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
          Contratti da approfondire
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Una selezione automatica basata su elementi descrittivi e verificabili:
          ricorrenza dell’operatore, affidamento diretto dichiarato o importo
          nella fascia più alta del perimetro corrente. Sono inviti alla lettura,
          non un indice di rischio e non indicano irregolarità.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {items.map(({ contract, signals }) => (
          <button
            key={contract.id}
            type="button"
            onClick={() => onOpen(contract)}
            className="group rounded-2xl border border-card-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display font-bold leading-snug text-foreground group-hover:text-primary">
                  {contract.title}
                </h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {contract.supplier || "Operatore non indicato"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-display font-bold tabular-nums text-foreground">
                  {contract.amount > 0 ? formatEuro(contract.amount, true) : "—"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatDate(contract.awardDate)}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {signals.map((signal) => (
                <SignalBadge key={signal.key} signal={signal} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ContractsList({
  contracts,
  signalsByContractId,
  loading,
  onOpen,
}: {
  contracts: Contract[];
  signalsByContractId: Map<number, AttentionSignal[]>;
  loading: boolean;
  onOpen: (contract: Contract) => void;
}) {
  if (loading) {
    return (
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="mt-4 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center">
        <FileText className="h-7 w-7 text-muted-foreground" />
        <h3 className="mt-3 font-display font-bold">Nessun contratto trovato</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Nessun contratto corrisponde ai filtri selezionati. Modifica la ricerca
          oppure azzera i filtri.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 space-y-3 md:hidden" data-tour="contracts-list">
        {contracts.map((contract) => {
          const signals = signalsByContractId.get(contract.id) ?? [];
          return (
            <button
              key={contract.id}
              type="button"
              onClick={() => onOpen(contract)}
              className="w-full rounded-2xl border border-card-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display font-bold leading-snug text-foreground">
                  {contract.title}
                </h3>
                <span className="shrink-0 font-display font-bold tabular-nums text-foreground">
                  {contract.amount > 0 ? formatEuro(contract.amount, true) : "—"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {contract.supplier || "Operatore non indicato"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(contract.awardDate)}</span>
                <span aria-hidden="true">·</span>
                <span>{contract.status}</span>
              </div>
              {signals.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {signals.slice(0, 2).map((signal) => (
                    <SignalBadge key={signal.key} signal={signal} />
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <Table data-tour="contracts-list">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[280px]">Oggetto</TableHead>
                <TableHead className="min-w-[180px]">Operatore</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="min-w-[210px]">Da approfondire</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => {
                const signals = signalsByContractId.get(contract.id) ?? [];
                return (
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer hover:bg-muted/30"
                    tabIndex={0}
                    onClick={() => onOpen(contract)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpen(contract);
                      }
                    }}
                  >
                    <TableCell>
                      <div className="font-display font-bold leading-snug text-foreground">
                        {contract.title}
                      </div>
                      {contract.procedureType ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {contract.procedureType}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm">{contract.supplier || "—"}</TableCell>
                    <TableCell className="text-right font-display font-bold tabular-nums whitespace-nowrap">
                      {contract.amount > 0 ? formatEuro(contract.amount) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(contract.awardDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal shadow-none">
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {signals.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {signals.slice(0, 2).map((signal) => (
                            <SignalBadge key={signal.key} signal={signal} />
                          ))}
                          {signals.length > 2 ? (
                            <Badge variant="outline" className="text-[10px] shadow-none">
                              +{signals.length - 2}
                            </Badge>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

function SignalBadge({ signal }: { signal: AttentionSignal }) {
  const icon =
    signal.key === "recurrent-supplier" ? (
      <Repeat2 className="mr-1 h-3 w-3" />
    ) : signal.key === "direct-award" ? (
      <Gavel className="mr-1 h-3 w-3" />
    ) : (
      <Euro className="mr-1 h-3 w-3" />
    );

  return (
    <Badge
      variant="outline"
      className="border-amber-300/70 bg-amber-50 text-[10px] font-medium text-amber-900 shadow-none dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    >
      {icon}
      {signal.label}
    </Badge>
  );
}
