export type ContractPipelineStageState =
  | "complete"
  | "ready"
  | "blocked"
  | "inactive";

export interface ContractPipelineStage {
  id: string;
  title: string;
  label: string;
  state: ContractPipelineStageState;
  description: string;
  detail: string;
}

export interface ContractPipelineSnapshot {
  nextAction: string;
  stages: ContractPipelineStage[];
}

export function buildContractPipelineSnapshot(): ContractPipelineSnapshot {
  return {
    nextAction:
      "La superficie pubblica corrente è attiva. Lo storico completo e la sincronizzazione strutturata con i dataset ANAC restano un'integrazione distinta: finché non sono disponibili, nessuna assenza viene interpretata come zero o come anomalia.",
    stages: [
      {
        id: "albo-current",
        title: "Albo Pretorio corrente",
        label: "Acquisito",
        state: "complete",
        description:
          "Snapshot ufficiale degli atti correnti pubblicati dal Comune di Lamezia Terme.",
        detail: "Aggiornato dalla pipeline Albo già in esercizio",
      },
      {
        id: "public-safety",
        title: "Filtro pubblico e privacy",
        label: "Applicato",
        state: "complete",
        description:
          "Entrano solo record acquisiti dalla fonte ufficiale e già classificati come pubblicabili.",
        detail: "Record minimizzati o metadata-only esclusi dalle schede",
      },
      {
        id: "identifiers",
        title: "Estrazione CIG e CUP",
        label: "Attiva",
        state: "complete",
        description:
          "Regole deterministiche individuano gli identificativi esposti nell'oggetto pubblico dell'atto.",
        detail: "Nessuna lettura o inferenza automatica dai PDF",
      },
      {
        id: "bdncp-bridge",
        title: "Ponte BDNCP / ANAC",
        label: "Collegamento parziale",
        state: "ready",
        description:
          "Ogni CIG formalmente valido apre la ricerca sul portale ufficiale nazionale.",
        detail: "Ponte di ricerca, non sincronizzazione della scheda ANAC",
      },
    ],
  };
}
