import type { PublicProposal } from "./propostePubblicheCore";

/** Scouting dell'8 novembre: richiesta resa pubblica il 7 novembre 2026. */
export const SCOUTED_PUBLIC_PROPOSALS_20261108_B = [
  {
    id: "via-guido-dorso-ripristino-cristiano-villella-2026",
    title: "Verifiche di sicurezza e ripristino della pavimentazione in via Guido Dorso",
    summary:
      "Il 7 novembre 2026 i consiglieri comunali Massimo Cristiano e Carmine Villella, di Futuro Nazionale, hanno chiesto al Sindaco e agli uffici comunali il ripristino e la messa in sicurezza della carreggiata di via Guido Dorso, nell'area indicata come Lamezia Est. I consiglieri dichiarano di avere presentato un'interrogazione sulle condizioni della strada e segnalano buche e avvallamenti, richiamando precedenti lavori sul canale e su un muretto di contenimento. Le condizioni e le relazioni con i lavori passati sono dichiarazioni dei promotori, non verifiche tecniche autonome.",
    promoterId: "futuro-nazionale-lamezia",
    promoter: "Gruppo consiliare Futuro Nazionale — Lamezia Terme",
    promoterType: "forza_politica",
    coPromoters: ["Massimo Cristiano", "Carmine Villella"],
    periodLabel: "7 novembre 2026",
    year: "2026",
    theme: "Manutenzione e sicurezza stradale di via Guido Dorso",
    threadId: "via-guido-dorso-ripristino-manto-2026",
    threadLabel: "Via Guido Dorso: verifica e ripristino della sede stradale",
    territorialArea: "Via Guido Dorso, zona indicata come Lamezia Est",
    institutionalRecipient: "Sindaco e uffici del Comune di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "il Lametino, 7 novembre 2026 — comunicazione attribuita ai consiglieri Cristiano e Villella",
    sourceUrl: "https://www.lametino.it/ultime/lamezia-via-guido-dorso-ridotta-a-un-colabrodo-consiglieri-cristiano-e-villella-presentano-interrogazione.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il Lametino del 7 novembre 2026 riproduce la richiesta espressa dai consiglieri e riferisce la loro dichiarazione di avere presentato un'interrogazione. Non sono disponibili il testo originale protocollato, il numero di protocollo o la registrazione dell'atto nel sistema del Consiglio: non si registra deposito formale e il canale pubblico è comunicato. Non risultano sopralluoghi, risposta, calendarizzazione o ripristino verificati. Buche, degrado della sede viaria, precedenti lavori idraulici e possibili responsabilità sono affermazioni dei promotori, non accertamenti indipendenti. Il promotore è normalizzato come nelle altre richieste di Cristiano e Villella; l'oggetto è la specifica via Guido Dorso, distinta da via della Vittoria, rione Cafaldo e strade delle contrade. Destinatario documentato separatamente dalla competenza, che resta not_assessed: non si presume proprietà o titolarità della strada dalla localizzazione o dalla dichiarazione. Area stradale identificata per nome, senza coordinate WGS84 attendibili. Il Piano Asfalti comunale generale riportato il 7 novembre non prova un intervento già programmato su questa via, né un recepimento della richiesta.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-11-07",
    lastUpdated: "2026-11-07",
    events: [
      {
        id: "via-guido-dorso-cristiano-villella-richiesta-2026-11-07",
        date: "2026-11-07",
        type: "emersione",
        title: "Chiesti accertamenti e ripristino della sede stradale di via Guido Dorso",
        summary:
          "Cristiano e Villella chiedono la messa in sicurezza e il ripristino della via, dichiarando di aver presentato un'interrogazione. In assenza di copia protocollata non si registra deposito; nessuna esecuzione di lavori è verificata.",
        sourceLabel: "il Lametino — nota dei consiglieri, 7 novembre 2026",
        sourceUrl: "https://www.lametino.it/ultime/lamezia-via-guido-dorso-ridotta-a-un-colabrodo-consiglieri-cristiano-e-villella-presentano-interrogazione.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
