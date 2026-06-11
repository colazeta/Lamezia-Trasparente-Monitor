/**
 * Dataset dimostrativo isolato per il Promessometro / Programma sotto verifica.
 *
 * I record sono fittizi, non rappresentano persone, liste, amministrazioni,
 * promesse o atti reali e non sono collegati a dati verificati. Gli stati sono
 * etichette documentali provvisorie per testare il modello dati: non sono
 * giudizi politici, accuse, valutazioni reputazionali o prove di responsabilità,
 * illegittimità, favoritismo, corruzione o inadempienza.
 */

export const PROMESSOMETRO_DEMO_NOTICE =
  "Dataset dimostrativo fittizio separato da dati verificati: gli stati sono indicatori documentali provvisori, non giudizi politici o accuse.";

export const PROMESSOMETRO_STATUSES = [
  "non_verificabile",
  "da_verificare",
  "avviato",
  "atto_collegato",
  "in_esecuzione",
  "completato",
  "sospeso",
] as const;

export type PromessometroStatus = (typeof PROMESSOMETRO_STATUSES)[number];

export const PROMESSOMETRO_STATUS_LABELS: Record<PromessometroStatus, string> = {
  non_verificabile: "Non verificabile",
  da_verificare: "Da verificare",
  avviato: "Avviato",
  atto_collegato: "Atto collegato",
  in_esecuzione: "In esecuzione",
  completato: "Completato",
  sospeso: "Sospeso",
};

export const PROMESSOMETRO_STATUS_NOTES: Record<PromessometroStatus, string> = {
  non_verificabile:
    "Le informazioni dimostrative non bastano per simulare una classificazione documentale.",
  da_verificare:
    "Il punto richiede una verifica documentale prima di qualsiasi lettura pubblica.",
  avviato:
    "Sono presenti segnali documentali iniziali nel solo scenario fittizio.",
  atto_collegato:
    "Il record fittizio contiene almeno un atto dimostrativo collegato, senza implicare esecuzione o risultato.",
  in_esecuzione:
    "Lo scenario dimostrativo rappresenta una fase operativa da leggere con cautela metodologica.",
  completato:
    "Lo scenario dimostrativo indica una conclusione documentale simulata, non un riscontro reale.",
  sospeso:
    "Lo scenario dimostrativo indica una pausa documentale simulata, non una responsabilità o inadempienza.",
};

export type PromessometroDemoSourceKind = "programma_demo" | "atto_demo";
export type PromessometroDataKind = "demo_fittizio";
export type PromessometroDataQuality = "fittizio_non_verificato" | "fonte_mancante_demo";

export interface PromessometroDemoSource {
  id: string;
  kind: PromessometroDemoSourceKind;
  title: string;
  date: string;
  note: string;
  isFictional: true;
  verified: false;
}

export interface PromessometroDemoItem {
  id: string;
  area: string;
  shortTitle: string;
  syntheticText: string;
  status: PromessometroStatus;
  programmeSource: PromessometroDemoSource | null;
  linkedActSources: PromessometroDemoSource[];
  lastVerification: string;
  methodologyNote: string;
  dataQuality: PromessometroDataQuality;
  dataKind: PromessometroDataKind;
  isDemoOnly: true;
}

export const PROMESSOMETRO_DEMO_ITEMS: PromessometroDemoItem[] = [
  {
    id: "demo-programma-001",
    area: "servizi civici dimostrativi",
    shortTitle: "Sportello informativo di esempio",
    syntheticText:
      "Punto programmatico fittizio su un servizio informativo non riferito ad atti, persone o amministrazioni reali.",
    status: "da_verificare",
    programmeSource: {
      id: "fonte-programma-demo-001",
      kind: "programma_demo",
      title: "Estratto programmatico dimostrativo non reale",
      date: "2026-06-08",
      note: "Fonte inventata per testare campi e import frontend senza chiamate API.",
      isFictional: true,
      verified: false,
    },
    linkedActSources: [],
    lastVerification: "2026-06-08",
    methodologyNote:
      "Stato assegnato solo per collaudo: non misura merito politico, responsabilità o adempimento.",
    dataQuality: "fittizio_non_verificato",
    dataKind: "demo_fittizio",
    isDemoOnly: true,
  },
  {
    id: "demo-programma-002",
    area: "manutenzione urbana dimostrativa",
    shortTitle: "Piano manutenzioni di esempio",
    syntheticText:
      "Punto dimostrativo su una manutenzione ipotetica, senza luoghi reali identificabili o collegamenti a soggetti reali.",
    status: "atto_collegato",
    programmeSource: {
      id: "fonte-programma-demo-002",
      kind: "programma_demo",
      title: "Scheda programmatica fittizia per manutenzione",
      date: "2026-06-08",
      note: "Fonte simulata per distinguere dataset demo e dati verificati.",
      isFictional: true,
      verified: false,
    },
    linkedActSources: [
      {
        id: "atto-demo-002-a",
        kind: "atto_demo",
        title: "Atto dimostrativo collegato non reale",
        date: "2026-06-08",
        note: "Atto inventato: serve solo a testare la metrica di copertura fonti.",
        isFictional: true,
        verified: false,
      },
    ],
    lastVerification: "2026-06-08",
    methodologyNote:
      "La presenza di un atto collegato nel demo non implica esecuzione, risultato o valutazione reputazionale.",
    dataQuality: "fittizio_non_verificato",
    dataKind: "demo_fittizio",
    isDemoOnly: true,
  },
  {
    id: "demo-programma-003",
    area: "partecipazione dimostrativa",
    shortTitle: "Calendario incontri di esempio",
    syntheticText:
      "Punto fittizio usato per rappresentare un caso privo di fonte programmatica e quindi non verificabile.",
    status: "non_verificabile",
    programmeSource: null,
    linkedActSources: [],
    lastVerification: "2026-06-08",
    methodologyNote:
      "La mancanza di fonti nel demo segnala solo un requisito documentale da simulare, non una criticità reale.",
    dataQuality: "fonte_mancante_demo",
    dataKind: "demo_fittizio",
    isDemoOnly: true,
  },
];
