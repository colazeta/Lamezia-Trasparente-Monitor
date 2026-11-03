import type { ProposalGeography } from "./proposalGeographyCore";

/** Non si attribuiscono WGS84 a corsi d'acqua senza segmenti verificati o a un ambito cittadino. */
export const SCOUTED_PROPOSAL_GEOGRAPHY_20261103: Record<string, ProposalGeography> = {
  "corsi-acqua-manutenzione-cristiano-villella-2026": {
    label: "Corsi d'acqua nel territorio comunale: Bagni di Caronte, Canne, Piazza, Cantagalli, Cottola, Fella e Gabella",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note: "Le note del 10 ottobre (City One) e del 2 novembre (Corriere di Lamezia) richiamano più corsi d'acqua e chiedono estensione all'intera rete cittadina. Non sono documentati segmenti geografici o coordinate WGS84 degli interventi: nessun punto ricostruito artificialmente.",
  },
  "welfare-tavoli-permanenti-forum-terzo-settore-2025": {
    label: "Programmazione delle politiche sociali nel Comune di Lamezia Terme",
    scope: "citywide",
    areas: ["intera_citta"],
    points: [],
    note: "La partecipazione al welfare interessa l'intero ambito comunale. L'ATS può estendersi a più Comuni, ma non vengono inventati perimetri né coordinate di singoli tavoli; riferimento all'avviso comunale del 30 ottobre 2026.",
  },
};
