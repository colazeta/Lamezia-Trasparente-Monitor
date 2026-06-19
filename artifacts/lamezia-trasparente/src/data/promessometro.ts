export const PROMISE_AREAS = [
  "trasparenza",
  "urbanistica",
  "ambiente",
  "mare/costa",
  "centro storico",
  "lavori pubblici",
  "sicurezza urbana",
  "welfare",
  "cultura",
  "digitalizzazione",
  "legalità",
  "partecipazione",
  "altro",
] as const;

export const IMPLEMENTATION_STATUSES = [
  "non_avviata",
  "avviata",
  "atto_indirizzo",
  "atto_gestionale",
  "finanziata",
  "in_esecuzione",
  "completata",
  "sospesa",
  "abbandonata",
  "non_verificabile",
] as const;

export const ACT_TYPES = [
  "delibera",
  "determina",
  "albo",
  "contratto",
  "PNRR",
  "bando",
  "atto fondamentale",
  "comunicato",
  "altro",
] as const;

export const ACT_CONTRIBUTION_TYPES = [
  "fonte promessa",
  "indirizzo politico",
  "atto amministrativo",
  "finanziamento",
  "affidamento",
  "avanzamento",
  "rendicontazione",
  "criticità",
  "smentita/non attuazione",
] as const;

export type PromiseArea = (typeof PROMISE_AREAS)[number];
export type ImplementationStatus = (typeof IMPLEMENTATION_STATUSES)[number];
export type ActType = (typeof ACT_TYPES)[number];
export type ActContributionType = (typeof ACT_CONTRIBUTION_TYPES)[number];

export interface ProgrammePromise {
  id: string;
  slug: string;
  neutralTitle: string;
  area: PromiseArea;
  sourcePromiseSummary: string;
  sourceLink: string;
  sourceDate: string;
  sourceLabel: string;
  mandateReference: string;
  documentedPriority?: string;
  implementationStatus: ImplementationStatus;
  editorialSummary: string;
  cautionNote: string;
  lastVerification: string;
  missingForObservableImplementation: string;
  isPlaceholder?: boolean;
}

export interface PromiseActLink {
  promiseId: string;
  actType: ActType;
  internalId?: string;
  externalUrl?: string;
  title: string;
  date: string;
  contributionType: ActContributionType;
  technicalComment: string;
  isPlaceholder?: boolean;
}

export const PROMESSOMETRO_REAL_DATA_EDITORIAL_NOTE =
  "Nuove promesse reali vanno inserite solo dopo verifica della fonte programmatica o istituzionale originale: ogni record non-placeholder deve avere URL fonte, data fonte, mandato/amministrazione, stato documentale, nota cautelativa, ultimo aggiornamento e cosa manca per considerare osservabile la realizzazione. Il record modello resta escluso dai conteggi.";

export const PROGRAMME_PROMISES: ProgrammePromise[] = [
  {
    id: "template-001",
    slug: "scheda-modello-da-censire",
    neutralTitle: "Scheda modello: promessa da censire dopo fonte verificata",
    area: "altro",
    sourcePromiseSummary:
      "Questo record è un modello redazionale, non una promessa reale: va sostituito con un estratto da programma elettorale, linee di mandato, DUP o altra fonte pubblica verificata.",
    sourceLink: "https://www.comune.lamezia-terme.cz.it/",
    sourceDate: "Da inserire dopo verifica documentale",
    sourceLabel: "Fonte programmatica da indicare prima della pubblicazione del record reale",
    mandateReference: "Mandato/amministrazione da indicare nella scheda reale",
    documentedPriority: "Non applicabile al modello",
    implementationStatus: "non_verificabile",
    editorialSummary:
      "La versione pubblica espone la struttura del Promessometro senza inventare promesse o atti collegati non presenti nelle fonti locali già censite dal progetto.",
    cautionNote:
      "Record dimostrativo escluso dai conteggi documentali: non descrive una promessa dell'amministrazione e non va letto come evidenza di avanzamento o mancata attuazione.",
    lastVerification: "2026-06-07",
    missingForObservableImplementation:
      "Per pubblicare un record reale servono fonte programmatica, data, mandato di riferimento e almeno una verifica redazionale sull'eventuale presenza o assenza di atti collegati.",
    isPlaceholder: true,
  },
];

export const PROMISE_ACT_LINKS: PromiseActLink[] = [
  {
    promiseId: "template-001",
    actType: "altro",
    externalUrl: "https://www.comune.lamezia-terme.cz.it/",
    title: "Esempio di collegamento da sostituire con un atto o una fonte reale",
    date: "Da inserire dopo verifica documentale",
    contributionType: "fonte promessa",
    technicalComment:
      "Collegare qui la fonte programmatica o l'atto amministrativo solo dopo controllo del documento originale. Una delibera di indirizzo non equivale automaticamente a realizzazione osservabile.",
    isPlaceholder: true,
  },
];

export const STATUS_LABELS: Record<ImplementationStatus, string> = {
  non_avviata: "Non avviata documentata",
  avviata: "Avviata",
  atto_indirizzo: "Atto di indirizzo",
  atto_gestionale: "Atto gestionale",
  finanziata: "Finanziata",
  in_esecuzione: "In esecuzione",
  completata: "Completata documentata",
  sospesa: "Sospesa",
  abbandonata: "Abbandonata documentata",
  non_verificabile: "Non verificabile",
};

export const STATUS_DESCRIPTIONS: Record<ImplementationStatus, string> = {
  non_avviata:
    "Non risultano atti o evidenze amministrative collegati nella base verificata.",
  avviata:
    "Esistono segnali documentali iniziali, da distinguere dagli atti attuativi.",
  atto_indirizzo:
    "È presente un atto politico-amministrativo di orientamento, non ancora una realizzazione.",
  atto_gestionale:
    "È presente almeno un atto attuativo o gestionale da leggere insieme agli allegati.",
  finanziata:
    "Risulta una copertura o un canale di finanziamento documentato.",
  in_esecuzione:
    "Gli atti disponibili indicano una fase operativa o di avanzamento.",
  completata:
    "La documentazione disponibile segnala conclusione o disponibilità osservabile, da verificare sulla fonte.",
  sospesa:
    "Gli atti disponibili indicano sospensione o interruzione temporanea.",
  abbandonata:
    "La documentazione disponibile indica rinuncia, revoca o non prosecuzione.",
  non_verificabile:
    "Le fonti disponibili non bastano per classificare l'avanzamento.",
};

export const DOCUMENTARY_LEVELS = [
  {
    title: "Promessa dichiarata",
    description:
      "Esiste una fonte programmatica o comunicativa che descrive l'impegno. La fonte della promessa non prova da sola l'attuazione.",
  },
  {
    title: "Atto di indirizzo",
    description:
      "Delibera, linee di mandato o documento politico-amministrativo che orienta l'azione, senza dimostrare automaticamente esecuzione o risultato.",
  },
  {
    title: "Atto attuativo/gestionale",
    description:
      "Determina, bando, affidamento, convenzione, impegno di spesa, progetto esecutivo o atto equivalente che avvia una fase amministrativa concreta.",
  },
  {
    title: "Realizzazione osservabile",
    description:
      "Opera, servizio, regolamento, portale, procedura o intervento effettivamente disponibile e verificabile con fonte aggiornata.",
  },
] as const;
