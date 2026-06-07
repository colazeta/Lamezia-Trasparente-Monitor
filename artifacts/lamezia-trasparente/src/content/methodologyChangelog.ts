export type MethodologyChangeCategory =
  | "fonte-dati"
  | "indicatore"
  | "classificazione-estrazione"
  | "criterio-visualizzazione"
  | "correzione-errore";

export type MethodologyChangeImpact =
  | "nessun-impatto-storico"
  | "interpretazione-da-contestualizzare"
  | "confronti-storici-da-rileggere";

export type MethodologyChangeReference = {
  label: string;
  href: string;
};

export type MethodologyChangelogEntry = {
  version: string;
  date: string;
  title: string;
  category: MethodologyChangeCategory;
  scope: string;
  description: string;
  whyItMatters: string;
  historicalImpact: MethodologyChangeImpact;
  maintenanceBoundary: string;
  references: MethodologyChangeReference[];
};

export const METHODOLOGY_CHANGE_CATEGORIES: Record<
  MethodologyChangeCategory,
  { label: string; description: string }
> = {
  "fonte-dati": {
    label: "Fonte dati",
    description:
      "Aggiunta, rimozione, sostituzione o diversa frequenza di aggiornamento di una fonte pubblica usata dal monitor.",
  },
  indicatore: {
    label: "Indicatore",
    description:
      "Modifica alla definizione, alla soglia o al perimetro di un indicatore interpretativo.",
  },
  "classificazione-estrazione": {
    label: "Classificazione o estrazione",
    description:
      "Aggiornamento a regole che ricavano campi dal testo, associano categorie o normalizzano informazioni non strutturate.",
  },
  "criterio-visualizzazione": {
    label: "Criterio di visualizzazione",
    description:
      "Cambio nel modo in cui dati già disponibili vengono ordinati, raggruppati, filtrati o spiegati nelle pagine pubbliche.",
  },
  "correzione-errore": {
    label: "Correzione di errore",
    description:
      "Correzione di una regola, mappatura o nota metodologica che poteva rendere meno chiara la lettura dei dati.",
  },
};

export const METHODOLOGY_CHANGE_IMPACTS: Record<
  MethodologyChangeImpact,
  { label: string; description: string }
> = {
  "nessun-impatto-storico": {
    label: "Nessun impatto storico atteso",
    description:
      "La modifica documenta il metodo o migliora la consultazione senza cambiare il significato di indicatori, fonti o classificazioni precedenti.",
  },
  "interpretazione-da-contestualizzare": {
    label: "Interpretazione da contestualizzare",
    description:
      "La modifica può influire sul modo in cui una serie o un indicatore viene letto, pur senza invalidare automaticamente le letture precedenti.",
  },
  "confronti-storici-da-rileggere": {
    label: "Confronti storici da rileggere",
    description:
      "La modifica cambia regole, perimetri o fonti in modo tale che confronti prima/dopo richiedano una nota esplicativa.",
  },
};

export const METHODOLOGY_CHANGELOG_FORMAT_FIELDS = [
  "versione e data della modifica",
  "categoria metodologica interessata",
  "ambito pubblico coinvolto",
  "descrizione neutra del cambiamento",
  "nota sul perché la modifica conta per la lettura civica",
  "impatto su confronti storici o interpretazione degli indicatori",
  "confine rispetto alla manutenzione ordinaria",
  "riferimenti a issue, pull request o commit quando disponibili",
];

export const METHODOLOGY_CHANGELOG_ENTRIES: MethodologyChangelogEntry[] = [
  {
    version: "2026.06-01",
    date: "2026-06-07",
    title: "Introduzione del registro metodologico pubblico",
    category: "criterio-visualizzazione",
    scope: "Documentazione metodologica pubblica",
    description:
      "Viene definito un formato stabile per registrare modifiche a fonti, indicatori, classificazioni, criteri di visualizzazione e correzioni di errore metodologicamente rilevanti.",
    whyItMatters:
      "Il registro aiuta a distinguere una variazione dovuta a dati aggiornati da una variazione dovuta a regole, criteri o note interpretative aggiornate.",
    historicalImpact: "nessun-impatto-storico",
    maintenanceBoundary:
      "Questa voce documenta il formato del registro: non modifica fonti, soglie, classificazioni, estrazioni, database o logiche degli indicatori.",
    references: [
      {
        label: "Issue #57",
        href: "https://github.com/colazeta/Lamezia-Trasparente-Monitor/issues/57",
      },
    ],
  },
];
