export const BENI_CONFISCATI_CATEGORIES = [
  "immobile",
  "terreno",
  "attivita_economica",
  "bene_mobile_registrato",
  "altro",
] as const;

export type BeneConfiscatoCategory =
  (typeof BENI_CONFISCATI_CATEGORIES)[number];

export const BENI_CONFISCATI_CATEGORY_LABELS: Record<
  BeneConfiscatoCategory,
  string
> = {
  immobile: "Immobile",
  terreno: "Terreno",
  attivita_economica: "Attività economica",
  bene_mobile_registrato: "Bene mobile registrato",
  altro: "Altro bene",
};

export const BENI_CONFISCATI_DEMO_ADMIN_STATUSES = [
  "da_verificare",
  "assegnazione_demo",
  "riuso_civico_demo",
  "informazione_parziale",
  "non_applicabile",
] as const;

export type BeneConfiscatoDemoAdministrativeStatus =
  (typeof BENI_CONFISCATI_DEMO_ADMIN_STATUSES)[number];

export const BENI_CONFISCATI_DEMO_ADMIN_STATUS_LABELS: Record<
  BeneConfiscatoDemoAdministrativeStatus,
  string
> = {
  da_verificare: "Da verificare",
  assegnazione_demo: "Assegnazione demo",
  riuso_civico_demo: "Riuso civico demo",
  informazione_parziale: "Informazione parziale",
  non_applicabile: "Non applicabile",
};

export const BENI_CONFISCATI_DEMO_DATA_QUALITY_STATUSES = [
  "scheda_dimostrativa",
  "campi_parziali",
  "contesto_da_verificare",
] as const;

export type BeneConfiscatoDemoDataQualityStatus =
  (typeof BENI_CONFISCATI_DEMO_DATA_QUALITY_STATUSES)[number];

export interface BeneConfiscatoDemoSourceContext {
  readonly label: string;
  readonly description: string;
  readonly realSourceUsed: false;
}

export interface BeneConfiscatoDemoItem {
  readonly id: `demo-bene-${string}`;
  readonly demoOnly: true;
  readonly title: string;
  readonly category: BeneConfiscatoCategory;
  readonly administrativeStatus: BeneConfiscatoDemoAdministrativeStatus;
  readonly genericTerritorialContext: string;
  readonly sourceContext: BeneConfiscatoDemoSourceContext;
  readonly dataQualityStatus: BeneConfiscatoDemoDataQualityStatus;
  readonly knownLimitations: readonly string[];
  readonly possibleCivicUses: readonly string[];
  readonly cautionNotes: readonly string[];
}

export const BENI_CONFISCATI_DEMO_NOTICE =
  "Dataset dimostrativo e fittizio: non contiene dati reali, indirizzi, persone, imprese, procedimenti, protocolli, coordinate o riferimenti catastali.";

export const beniConfiscatiDemoItems = [
  {
    id: "demo-bene-immobile-spazio-civico",
    demoOnly: true,
    title: "Spazio civico dimostrativo",
    category: "immobile",
    administrativeStatus: "riuso_civico_demo",
    genericTerritorialContext: "Area urbana indicativa, senza indirizzo reale",
    sourceContext: {
      label: "Scenario redazionale fittizio",
      description:
        "Esempio costruito solo per validare campi, cautele e conteggi del modulo.",
      realSourceUsed: false,
    },
    dataQualityStatus: "scheda_dimostrativa",
    knownLimitations: [
      "Nessun collegamento a fonti amministrative reali.",
      "Localizzazione volutamente generica e non identificabile.",
    ],
    possibleCivicUses: [
      "Descrivere un possibile presidio informativo di quartiere.",
      "Mostrare come indicare limiti e verifiche necessarie.",
    ],
    cautionNotes: [
      "La scheda non documenta disponibilità effettiva, assegnazioni reali o responsabilità.",
    ],
  },
  {
    id: "demo-bene-terreno-orto-sociale",
    demoOnly: true,
    title: "Area verde dimostrativa",
    category: "terreno",
    administrativeStatus: "assegnazione_demo",
    genericTerritorialContext: "Contesto periurbano indicativo, senza coordinate",
    sourceContext: {
      label: "Scenario didattico fittizio",
      description:
        "Record inventato per rappresentare un bene con possibili usi civici descrittivi.",
      realSourceUsed: false,
    },
    dataQualityStatus: "campi_parziali",
    knownLimitations: [
      "Assenza intenzionale di riferimenti catastali o provvedimenti.",
      "Stato amministrativo usato solo come tassonomia demo.",
    ],
    possibleCivicUses: [
      "Esemplificare una proposta di orto sociale da verificare in un caso reale.",
    ],
    cautionNotes: [
      "Ogni eventuale uso reale richiederebbe fonti ufficiali e verifica documentale.",
    ],
  },
  {
    id: "demo-bene-attivita-laboratorio",
    demoOnly: true,
    title: "Laboratorio formativo dimostrativo",
    category: "attivita_economica",
    administrativeStatus: "informazione_parziale",
    genericTerritorialContext: "Ambito comunale generico, senza denominazioni identificabili",
    sourceContext: {
      label: "Scheda simulata senza fonte esterna",
      description:
        "Esempio fittizio per verificare la rappresentazione di informazioni incomplete.",
      realSourceUsed: false,
    },
    dataQualityStatus: "contesto_da_verificare",
    knownLimitations: [
      "Non sono presenti imprese, persone o atti reali.",
      "La descrizione non consente identificazione di un soggetto economico.",
    ],
    possibleCivicUses: [
      "Illustrare una futura card con stato informativo parziale.",
      "Evidenziare la necessità di separare demo e dati documentali.",
    ],
    cautionNotes: [
      "Il record non suggerisce condotte, appartenenze o disponibilità effettive.",
    ],
  },
  {
    id: "demo-bene-mobile-servizio",
    demoOnly: true,
    title: "Mezzo di servizio dimostrativo",
    category: "bene_mobile_registrato",
    administrativeStatus: "da_verificare",
    genericTerritorialContext: "Uso civico ipotetico, senza targa o identificativi",
    sourceContext: {
      label: "Esempio sintetico fittizio",
      description:
        "Voce demo per controllare tassonomia e cautele sui beni mobili registrati.",
      realSourceUsed: false,
    },
    dataQualityStatus: "scheda_dimostrativa",
    knownLimitations: [
      "Nessun identificativo tecnico o amministrativo reale.",
      "Disponibilità e stato d'uso non sono verificati perché il bene è fittizio.",
    ],
    possibleCivicUses: [
      "Simulare un riepilogo per servizi sociali o logistici futuri.",
    ],
    cautionNotes: [
      "La voce serve solo a testare il modello dati in modo isolato.",
    ],
  },
  {
    id: "demo-bene-altro-presidio",
    demoOnly: true,
    title: "Presidio civico dimostrativo",
    category: "altro",
    administrativeStatus: "non_applicabile",
    genericTerritorialContext: "Contesto descrittivo non localizzato",
    sourceContext: {
      label: "Caso redazionale inventato",
      description:
        "Esempio residuale per verificare la categoria altro senza dati reali.",
      realSourceUsed: false,
    },
    dataQualityStatus: "campi_parziali",
    knownLimitations: [
      "Categoria usata solo per coprire casi non classificati nella demo.",
    ],
    possibleCivicUses: [
      "Mostrare una classificazione prudente quando la categoria è da precisare.",
    ],
    cautionNotes: [
      "Non rappresenta una posizione amministrativa reale né una fonte ufficiale.",
    ],
  },
] as const satisfies readonly BeneConfiscatoDemoItem[];
