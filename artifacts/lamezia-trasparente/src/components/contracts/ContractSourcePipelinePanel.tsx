import { ExternalLink, FileText, Landmark } from "lucide-react";
import { Link } from "wouter";
import { useListContracts, type Contract } from "@workspace/api-client-react";

import { asApiList } from "@/lib/apiList";
import { BDNCP_APPALTI_URL } from "@/lib/bdncp";
import { summarizeContractDossiers } from "@/lib/contractDossier";

export function ContractSourcePipelinePanel() {
  const { data, isLoading } = useListContracts({});
  const contracts = asApiList<Contract>(data);
  const summary = summarizeContractDossiers(contracts);

  return (
    <section className="mb-8 rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <span className="eyebrow text-primary">
            <FileText className="h-3.5 w-3.5" />
            Fonti dei contratti
          </span>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">
            Dati pubblici, con la fonte sempre raggiungibile
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Le schede partono dagli atti pubblici del Comune e collegano i
            riferimenti ANAC quando disponibili. Mostriamo soltanto ciò che le
            fonti consentono di verificare; un dato assente non indica di per sé
            un problema nel contratto.
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-border bg-muted/25 px-4 py-3 text-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Fascicoli correnti
          </div>
          <div className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">
            {isLoading ? "…" : summary.total}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {isLoading ? "Verifica in corso" : `${summary.withCig} con CIG rilevato`}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4 text-sm">
        <a
          href={BDNCP_APPALTI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <Landmark className="h-4 w-4" />
          Consulta ANAC
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Link
          href="/metodologia"
          className="font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Come leggiamo i dati
        </Link>
      </div>
    </section>
  );
}
