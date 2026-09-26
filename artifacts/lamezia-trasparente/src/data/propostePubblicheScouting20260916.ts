import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting del 16 settembre 2026.
 *
 * Parallel Search è stato usato obbligatoriamente per discovery ed espansione.
 * La proposta è stata poi verificata direttamente sulla pubblicazione originaria
 * del 15 settembre che riporta la nota dei promotori. Il testo annuncia la
 * presentazione di un'interrogazione e una contestuale segnalazione, ma non
 * documenta un deposito già perfezionato con protocollo o atto istituzionale.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260916 = [
  {
    id: "cimitero-sambiase-messa-sicurezza-futuro-nazionale-2026",
    title:
      "Cimitero di Sambiase, Cristiano e Villella chiedono verifiche e interventi urgenti",
    summary:
      "Richiesta del gruppo consiliare Futuro Nazionale di effettuare verifiche tecniche urgenti e predisporre interventi di messa in sicurezza e ripristino nella parte del cimitero di Sambiase interessata dalle criticità segnalate.",
    promoterId: "futuro-nazionale-lamezia",
    promoter: "Gruppo consiliare Futuro Nazionale — Lamezia Terme",
    promoterType: "forza_politica",
    coPromoters: ["Massimo Cristiano", "Carmine Villella"],
    periodLabel: "15 settembre 2026",
    year: "2026",
    theme: "Manutenzione urbana e prevenzione del rischio",
    threadId: "cimitero-sambiase-manutenzione-sicurezza-strutturale",
    threadLabel:
      "Cimitero di Sambiase: verifiche tecniche, messa in sicurezza e ripristino",
    territorialArea:
      "Parte specifica del cimitero di Sambiase indicata nella segnalazione dei promotori",
    institutionalRecipient: "Comune di Lamezia Terme — Amministrazione comunale",
    channel: "interrogazione",
    sourceLabel:
      "Corriere di Lamezia, 15 settembre 2026 — nota di Massimo Cristiano e Carmine Villella",
    sourceUrl:
      "https://www.corrieredilamezia.it/politica/2026_09_15/lamezia-cimitero-di-sambiase-cristiano-e-villella-degrado-e-pericoli-in-una-parte-della-struttura-si-intervenga-subito_66532/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Corriere di Lamezia pubblica il 15 settembre una nota attribuita ai consiglieri comunali Massimo Cristiano e Carmine Villella. La fonte dice espressamente che i consiglieri annunciano la presentazione di un'interrogazione consiliare e una contestuale segnalazione all'Amministrazione comunale: non è stato reperito un documento istituzionale, un numero di protocollo o altra prova che consenta di qualificare l'interrogazione come già depositata. Per questo il canale conserva lo strumento annunciato, ma lo stato resta `proposta_emersa` e l'evento è `emersione`, senza inventare un deposito. La nota circoscrive la segnalazione a una parte specifica del cimitero e attribuisce ai promotori l'osservazione di muri deteriorati, calcinacci e ferri d'armatura esposti; tali condizioni restano segnalazioni dei promotori e non sono trasformate in accertamenti tecnici autonomi. Le misure materializzate sono soltanto quelle operative esplicitamente richieste: verifiche tecniche urgenti e successivi interventi di messa in sicurezza e ripristino delle parti deteriorate, ove confermate. Il Comune è il destinatario documentato, ma non viene automaticamente trattato come ente competente: in assenza di una base amministrativa sufficientemente specifica sulla manutenzione della porzione interessata, la competenza resta `not_assessed`. La localizzazione è il cimitero di Sambiase, ma la porzione esatta non è identificabile con coordinate verificabili; la geografia resta quindi `area`, tag `sambiase`, senza WGS84 artificiale.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-15",
    lastUpdated: "2026-09-15",
    events: [
      {
        id: "futuro-nazionale-annuncio-interrogazione-cimitero-sambiase-15-settembre",
        date: "2026-09-15",
        type: "emersione",
        title:
          "Cristiano e Villella annunciano un'interrogazione sul cimitero di Sambiase",
        summary:
          "I consiglieri annunciano un'interrogazione e una segnalazione al Comune chiedendo verifiche tecniche urgenti e interventi di messa in sicurezza e ripristino nella parte del cimitero interessata. Non è stato verificato un deposito formale dell'interrogazione.",
        sourceLabel:
          "Corriere di Lamezia — nota di Massimo Cristiano e Carmine Villella",
        sourceUrl:
          "https://www.corrieredilamezia.it/politica/2026_09_15/lamezia-cimitero-di-sambiase-cristiano-e-villella-degrado-e-pericoli-in-una-parte-della-struttura-si-intervenga-subito_66532/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
