import type { Contract } from "@workspace/api-client-react";
import type { ContractDossier } from "@/lib/contractDossier";

export type AttentionSignal = {
  key: "direct-award" | "recurrent-supplier" | "high-amount";
  label: string;
};

export type SignalContext = {
  supplierCounts: Map<string, number>;
  highAmountThreshold: number | null;
};

export function supplierKey(value: string | null | undefined) {
  const key = value?.trim().toLocaleLowerCase("it-IT");
  if (!key || key === "—" || key === "non disponibile") return null;
  return key;
}

export function buildSignalContext(contracts: Contract[]): SignalContext {
  const supplierCounts = new Map<string, number>();
  const knownAmounts: number[] = [];

  for (const contract of contracts) {
    const key = supplierKey(contract.supplier);
    if (key) supplierCounts.set(key, (supplierCounts.get(key) ?? 0) + 1);
    if (contract.amount > 0) knownAmounts.push(contract.amount);
  }

  knownAmounts.sort((a, b) => a - b);
  const highAmountThreshold =
    knownAmounts.length >= 5
      ? knownAmounts[Math.max(0, Math.ceil(knownAmounts.length * 0.9) - 1)]
      : null;

  return { supplierCounts, highAmountThreshold };
}

export function attentionSignals(
  contract: Contract,
  context: SignalContext,
): AttentionSignal[] {
  const signals: AttentionSignal[] = [];

  if (contract.withoutTender) {
    signals.push({
      key: "direct-award",
      label: "Affidamento diretto dichiarato",
    });
  }

  const key = supplierKey(contract.supplier);
  const recurrence = key ? context.supplierCounts.get(key) ?? 0 : 0;
  if (recurrence >= 2) {
    signals.push({
      key: "recurrent-supplier",
      label: `Operatore ricorrente · ${recurrence} affidamenti`,
    });
  }

  if (
    context.highAmountThreshold != null &&
    contract.amount > 0 &&
    contract.amount >= context.highAmountThreshold
  ) {
    signals.push({
      key: "high-amount",
      label: "Importo nella fascia più alta",
    });
  }

  return signals;
}

export function matchesDossierFilters(
  dossier: ContractDossier | undefined,
  filters: { lifecycleFilter: string; identifierFilter: string },
): boolean {
  if (!dossier) return true;

  if (filters.lifecycleFilter === "complete") {
    if (dossier.lifecycleCompleteness !== "complete") return false;
  } else if (filters.lifecycleFilter === "needs-review") {
    if (dossier.lifecycleCompleteness !== "needs-review") return false;
  } else if (filters.lifecycleFilter === "missing-execution") {
    if (!dossier.missingExecutionEvidence) return false;
  } else if (filters.lifecycleFilter === "missing-evaluation") {
    if (!dossier.missingEvaluationEvidence) return false;
  }

  const cig = dossier.identifiers.find((item) => item.kind === "cig");
  const cup = dossier.identifiers.find((item) => item.kind === "cup");
  const hasCig = cig?.formalStatus === "formal-only";
  const hasCup = cup?.formalStatus === "formal-only";

  if (filters.identifierFilter === "with-cig" && !hasCig) return false;
  if (filters.identifierFilter === "without-cig" && hasCig) return false;
  if (filters.identifierFilter === "with-cup" && !hasCup) return false;
  if (filters.identifierFilter === "without-cup" && hasCup) return false;

  return true;
}
