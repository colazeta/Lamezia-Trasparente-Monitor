export type AlboStatusCounts = {
  acquired: number;
  new: number;
  changed: number;
  removed: number;
  unchanged: number;
  publishable: number;
  minimised: number;
  metadata_only: number;
  excluded: number;
};

export type AlboOperationalStatus = {
  source: string;
  source_url: string;
  last_update: string | null;
  method: string | null;
  counts: AlboStatusCounts;
  warnings: string[];
  next_scheduled_check: string | null;
  verification_status: "verification_required" | "official_source_acquired" | "normalised_automatically";
  known_limits: string[];
  official_albo_disclaimer: string;
};

export const ALBO_OPERATIONAL_STATUS: AlboOperationalStatus = {
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: "https://albo.tinnvision.cloud/?ente=00301390795",
  last_update: null,
  method: null,
  counts: {
    acquired: 0,
    new: 0,
    changed: 0,
    removed: 0,
    unchanged: 0,
    publishable: 0,
    minimised: 0,
    metadata_only: 0,
    excluded: 0,
  },
  warnings: [
    "Pipeline configurata; nessuna esecuzione ufficiale registrata nel bundle pubblico statico.",
  ],
  next_scheduled_check: null,
  verification_status: "verification_required",
  known_limits: [
    "Tranche B rende operativa la pipeline ma non certifica completezza storica dell'Albo Pretorio.",
    "Gli allegati e i PDF non sono scaricati o analizzati in Tranche B.",
    "Il layer pubblico espone solo metadati minimizzati o aggregati quando le regole prudenziali lo richiedono.",
  ],
  official_albo_disclaimer:
    "Lamezia Trasparente Monitor non sostituisce l'Albo Pretorio ufficiale: pubblicazioni, termini, allegati e contenuti vanno verificati sulla fonte istituzionale.",
};

export const ALBO_VERIFICATION_LABELS: Record<
  AlboOperationalStatus["verification_status"],
  string
> = {
  verification_required: "Verifica richiesta",
  official_source_acquired: "Fonte ufficiale acquisita",
  normalised_automatically: "Normalizzato automaticamente",
};
