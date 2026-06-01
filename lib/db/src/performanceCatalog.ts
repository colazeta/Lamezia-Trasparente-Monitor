// Catalogo condiviso della sezione "Performance del Comune": le categorie
// (dimensioni della qualità della vita) e il set iniziale di indicatori
// riconosciuti. Vive nel package del database (unica fonte di verità) perché è
// usato sia dal seeding sia, per i riferimenti agli indicatori automatici,
// dall'ingestione lato API.
//
// Le sei dimensioni dell'indice Qualità della Vita del Sole 24 Ore sono qui
// affiancate da alcune dimensioni aggiuntive riconosciute (mobilità
// sostenibile, istruzione, ambiente urbano).

import type { PerformancePolarity, PerformanceUpdateMode } from "./schema";

export type PerformanceCategorySeed = {
  slug: string;
  name: string;
  description: string;
};

export type PerformanceIndicatorSeed = {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  unit: string;
  source: string;
  sourceUrl?: string;
  updateMode: PerformanceUpdateMode;
  polarity: PerformancePolarity;
  // Chiave della serie sulla fonte automatica (solo per updateMode "automatic").
  externalKey?: string;
};

export const PERFORMANCE_CATEGORIES: PerformanceCategorySeed[] = [
  {
    slug: "ricchezza-consumi",
    name: "Ricchezza e consumi",
    description:
      "Reddito, depositi, consumi e benessere economico delle famiglie del territorio.",
  },
  {
    slug: "affari-lavoro",
    name: "Affari e lavoro",
    description:
      "Tessuto imprenditoriale, occupazione, disoccupazione e dinamismo economico.",
  },
  {
    slug: "ambiente-servizi",
    name: "Ambiente e servizi",
    description:
      "Qualità dell'ambiente, dotazione di servizi pubblici e infrastrutture essenziali.",
  },
  {
    slug: "demografia-societa-salute",
    name: "Demografia, società e salute",
    description:
      "Popolazione, dinamiche sociali, struttura per età e indicatori di salute.",
  },
  {
    slug: "giustizia-sicurezza",
    name: "Giustizia e sicurezza",
    description:
      "Sicurezza percepita e reale, criminalità e funzionamento della giustizia.",
  },
  {
    slug: "cultura-tempo-libero",
    name: "Cultura e tempo libero",
    description:
      "Offerta culturale, sportiva e ricreativa e partecipazione alla vita sociale.",
  },
  {
    slug: "mobilita-sostenibile",
    name: "Mobilità sostenibile",
    description:
      "Trasporto pubblico, mobilità dolce e sostenibilità degli spostamenti.",
  },
  {
    slug: "istruzione",
    name: "Istruzione e formazione",
    description:
      "Offerta scolastica, livelli di istruzione e servizi educativi.",
  },
  {
    slug: "ambiente-urbano",
    name: "Ambiente urbano",
    description:
      "Verde urbano, rifiuti, decoro e qualità dello spazio pubblico cittadino.",
  },
];

export const PERFORMANCE_INDICATORS: PerformanceIndicatorSeed[] = [
  // --- Demografia, società e salute ---
  {
    slug: "popolazione-residente",
    categorySlug: "demografia-societa-salute",
    title: "Popolazione residente",
    description:
      "Popolazione residente al 1° gennaio nel Comune di Lamezia Terme (fonte ISTAT).",
    unit: "abitanti",
    source: "ISTAT",
    sourceUrl: "https://esploradati.istat.it",
    updateMode: "automatic",
    polarity: "neutral",
    externalKey: "istat:22_289:A.079160.JAN.9.TOTAL.99",
  },
  {
    slug: "indice-vecchiaia",
    categorySlug: "demografia-societa-salute",
    title: "Indice di vecchiaia",
    description:
      "Rapporto tra popolazione di 65 anni e oltre e popolazione di 0-14 anni (per 100).",
    unit: "%",
    source: "ISTAT",
    sourceUrl: "https://esploradati.istat.it",
    updateMode: "manual",
    polarity: "neutral",
  },
  {
    slug: "saldo-migratorio",
    categorySlug: "demografia-societa-salute",
    title: "Saldo migratorio",
    description:
      "Differenza tra iscritti e cancellati dall'anagrafe nell'anno.",
    unit: "n.",
    source: "ISTAT",
    updateMode: "manual",
    polarity: "higher_better",
  },
  // --- Ricchezza e consumi ---
  {
    slug: "reddito-medio-irpef",
    categorySlug: "ricchezza-consumi",
    title: "Reddito medio dichiarato IRPEF",
    description:
      "Reddito imponibile medio per contribuente dichiarato ai fini IRPEF.",
    unit: "€",
    source: "MEF – Dipartimento delle Finanze",
    updateMode: "manual",
    polarity: "higher_better",
  },
  {
    slug: "depositi-bancari-procapite",
    categorySlug: "ricchezza-consumi",
    title: "Depositi bancari pro capite",
    description: "Depositi bancari delle famiglie per abitante.",
    unit: "€",
    source: "Banca d'Italia",
    updateMode: "manual",
    polarity: "higher_better",
  },
  // --- Affari e lavoro ---
  {
    slug: "imprese-attive",
    categorySlug: "affari-lavoro",
    title: "Imprese attive",
    description:
      "Numero di imprese attive registrate presso la Camera di Commercio.",
    unit: "n.",
    source: "Camera di Commercio",
    updateMode: "manual",
    polarity: "higher_better",
  },
  {
    slug: "tasso-disoccupazione",
    categorySlug: "affari-lavoro",
    title: "Tasso di disoccupazione",
    description:
      "Quota di persone in cerca di occupazione sulla forza lavoro (dato provinciale ISTAT).",
    unit: "%",
    source: "ISTAT",
    updateMode: "manual",
    polarity: "lower_better",
  },
  // --- Ambiente e servizi ---
  {
    slug: "raccolta-differenziata",
    categorySlug: "ambiente-urbano",
    title: "Raccolta differenziata",
    description:
      "Percentuale di rifiuti urbani raccolti in modo differenziato sul totale.",
    unit: "%",
    source: "ISPRA / Comune di Lamezia Terme",
    updateMode: "manual",
    polarity: "higher_better",
  },
  {
    slug: "rifiuti-procapite",
    categorySlug: "ambiente-urbano",
    title: "Rifiuti urbani pro capite",
    description: "Produzione annua di rifiuti urbani per abitante.",
    unit: "kg",
    source: "ISPRA",
    updateMode: "manual",
    polarity: "lower_better",
  },
  {
    slug: "verde-urbano-procapite",
    categorySlug: "ambiente-urbano",
    title: "Verde urbano pro capite",
    description:
      "Superficie di verde urbano fruibile per abitante (mq per abitante).",
    unit: "mq/ab.",
    source: "ISTAT",
    updateMode: "manual",
    polarity: "higher_better",
  },
  {
    slug: "copertura-rete-idrica",
    categorySlug: "ambiente-servizi",
    title: "Copertura del servizio idrico",
    description:
      "Quota di popolazione servita dalla rete acquedottistica comunale.",
    unit: "%",
    source: "Comune di Lamezia Terme",
    updateMode: "manual",
    polarity: "higher_better",
  },
  // --- Giustizia e sicurezza ---
  {
    slug: "delitti-denunciati",
    categorySlug: "giustizia-sicurezza",
    title: "Delitti denunciati",
    description:
      "Numero di delitti denunciati dalle forze di polizia all'autorità giudiziaria (dato provinciale).",
    unit: "n. per 1.000 ab.",
    source: "ISTAT / Ministero dell'Interno",
    updateMode: "manual",
    polarity: "lower_better",
  },
  // --- Cultura e tempo libero ---
  {
    slug: "biblioteche-prestiti",
    categorySlug: "cultura-tempo-libero",
    title: "Prestiti bibliotecari",
    description:
      "Numero di prestiti effettuati dalle biblioteche comunali nell'anno.",
    unit: "n.",
    source: "Comune di Lamezia Terme",
    updateMode: "manual",
    polarity: "higher_better",
  },
  // --- Mobilità sostenibile ---
  {
    slug: "piste-ciclabili",
    categorySlug: "mobilita-sostenibile",
    title: "Estensione piste ciclabili",
    description:
      "Chilometri di piste ciclabili disponibili sul territorio comunale.",
    unit: "km",
    source: "Comune di Lamezia Terme",
    updateMode: "manual",
    polarity: "higher_better",
  },
  // --- Istruzione ---
  {
    slug: "diplomati-quota",
    categorySlug: "istruzione",
    title: "Quota di diplomati",
    description:
      "Percentuale di popolazione 25-64 anni con almeno il diploma di scuola secondaria superiore.",
    unit: "%",
    source: "ISTAT",
    updateMode: "manual",
    polarity: "higher_better",
  },
];
