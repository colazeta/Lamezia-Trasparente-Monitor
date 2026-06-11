export const FOIA_REQUEST_TYPES = [
  "accesso_civico_semplice",
  "accesso_civico_generalizzato",
  "richiesta_chiarimento",
  "richiesta_link_documento",
  "richiesta_aggiornamento",
] as const;

export type FoiaRequestType = (typeof FOIA_REQUEST_TYPES)[number];

export type FoiaDemoSourceModule =
  | "albo_demo"
  | "bilancio_demo"
  | "pnrr_demo"
  | "incarichi_demo"
  | "servizi_demo";

export type FoiaDemoDataQualityStatus =
  | "documento_non_rintracciato_demo"
  | "link_non_disponibile_demo"
  | "metadati_incompleti_demo"
  | "aggiornamento_da_verificare_demo"
  | "contesto_da_chiarire_demo";

export interface FoiaDemoCase {
  id: `foia-demo-${number}`;
  /**
   * Flag intenzionale: questi casi sono fittizi e non rappresentano atti,
   * protocolli, persone, procedimenti o obblighi giuridici accertati.
   */
  demoOnly: true;
  sourceModule: FoiaDemoSourceModule;
  requestType: FoiaRequestType;
  documentSubject: string;
  cautiousMotivation: string;
  demoRecipientEntity: string;
  sourceContext: string;
  dataQualityStatus: FoiaDemoDataQualityStatus;
  cautionNotes: readonly string[];
}

export const foiaRequestTypeLabels: Record<FoiaRequestType, string> = {
  accesso_civico_semplice: "Accesso civico semplice",
  accesso_civico_generalizzato: "Accesso civico generalizzato",
  richiesta_chiarimento: "Richiesta di chiarimento",
  richiesta_link_documento: "Richiesta link documento",
  richiesta_aggiornamento: "Richiesta aggiornamento",
};

const sharedDemoCautionNotes = [
  "Caso dimostrativo: non usare come dato ufficiale o completo.",
  "La bozza è modificabile e richiede verifica del caso concreto prima di qualsiasi invio.",
  "Il testo non prova inadempimento, illecito, responsabilità personale o obbligo giuridico accertato.",
] as const;

export const foiaMachineDemoCases = [
  {
    id: "foia-demo-1",
    demoOnly: true,
    sourceModule: "albo_demo",
    requestType: "richiesta_link_documento",
    documentSubject: "collegamento pubblico a un allegato amministrativo indicato come non raggiungibile nel caso demo",
    cautiousMotivation:
      "facilitare la consultazione di un documento citato nel percorso dimostrativo, senza assumere completezza o mancanze reali dell'ente",
    demoRecipientEntity: "Ufficio Demo Trasparenza Documentale",
    sourceContext: "Scenario fittizio su scheda albo demo, privo di numeri di protocollo e riferimenti identificabili",
    dataQualityStatus: "link_non_disponibile_demo",
    cautionNotes: sharedDemoCautionNotes,
  },
  {
    id: "foia-demo-2",
    demoOnly: true,
    sourceModule: "bilancio_demo",
    requestType: "accesso_civico_semplice",
    documentSubject: "tabella riepilogativa demo su un indicatore di pubblicazione periodica",
    cautiousMotivation:
      "richiedere orientamento documentale su una voce dimostrativa che appare da aggiornare nel prototipo",
    demoRecipientEntity: "Ufficio Demo Pubblicazioni Periodiche",
    sourceContext: "Scenario fittizio su quadro bilancio demo, senza importare dati contabili reali",
    dataQualityStatus: "aggiornamento_da_verificare_demo",
    cautionNotes: sharedDemoCautionNotes,
  },
  {
    id: "foia-demo-3",
    demoOnly: true,
    sourceModule: "pnrr_demo",
    requestType: "accesso_civico_generalizzato",
    documentSubject: "documentazione aggregata demo su avanzamento e contesto di un intervento simulato",
    cautiousMotivation:
      "ottenere elementi descrittivi utili a comprendere lo stato informativo di un intervento fittizio, senza collegarlo a procedimenti reali",
    demoRecipientEntity: "Ufficio Demo Progetti e Monitoraggio",
    sourceContext: "Scenario fittizio PNRR demo, senza CUP, CIG, importi, soggetti o cronoprogrammi reali",
    dataQualityStatus: "metadati_incompleti_demo",
    cautionNotes: sharedDemoCautionNotes,
  },
  {
    id: "foia-demo-4",
    demoOnly: true,
    sourceModule: "servizi_demo",
    requestType: "richiesta_chiarimento",
    documentSubject: "nota esplicativa demo su frequenza di aggiornamento di una pagina informativa",
    cautiousMotivation:
      "chiarire criteri e tempi indicativi di aggiornamento di una sezione simulata, con formulazione collaborativa e non assertiva",
    demoRecipientEntity: "Ufficio Demo Relazioni con il Pubblico",
    sourceContext: "Scenario fittizio su pagina servizi demo, senza riferimenti a pratiche o utenti reali",
    dataQualityStatus: "contesto_da_chiarire_demo",
    cautionNotes: sharedDemoCautionNotes,
  },
  {
    id: "foia-demo-5",
    demoOnly: true,
    sourceModule: "incarichi_demo",
    requestType: "richiesta_aggiornamento",
    documentSubject: "scheda demo con campi descrittivi da riallineare tra fonte e riepilogo civico",
    cautiousMotivation:
      "segnalare una possibile esigenza di allineamento informativo in un esempio di laboratorio, senza riferirsi a incarichi o persone reali",
    demoRecipientEntity: "Ufficio Demo Amministrazione Aperta",
    sourceContext: "Scenario fittizio su modulo incarichi demo, senza nominativi, compensi, determine o date reali",
    dataQualityStatus: "documento_non_rintracciato_demo",
    cautionNotes: sharedDemoCautionNotes,
  },
] as const satisfies readonly FoiaDemoCase[];
