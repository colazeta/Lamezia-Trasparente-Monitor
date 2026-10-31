import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting 31 ottobre 2026: richieste SAP rese pubbliche il 28 ottobre.
 * Due oggetti distinti dello stesso promotore; stesso filone organici
 * del COISP per il primo ma promotore e richiesta autonomi.
 * La nota consegnata al prefetto è riferita dal sindacato, non protocollata.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261031 = [
  {
    id: "commissariato-lamezia-rinforzi-sap-2026",
    title: "Potenziamento del personale del Commissariato di Lamezia Terme",
    summary:
      "Il Sindacato Autonomo di Polizia (SAP), segreteria provinciale di Catanzaro, tramite Sergio Riga ha segnalato al prefetto le carenze di organico del Commissariato di Lamezia Terme e la necessità di incrementare il personale. La richiesta non contiene un obiettivo numerico e non consente di stimare l'organico attuale. È distinta dalla richiesta COISP del 27 ottobre, che indicava almeno 100 unità, perché il promotore è diverso; le due iniziative condividono il filone.",
    promoterId: "sap-catanzaro",
    promoter: "Sindacato Autonomo di Polizia (SAP) — Segreteria provinciale Catanzaro",
    promoterType: "categoria",
    coPromoters: ["Sergio Riga"],
    periodLabel: "28 ottobre 2026",
    year: "2026",
    theme: "Sicurezza pubblica e organici del Commissariato",
    threadId: "commissariato-lamezia-organici-polizia-stato-2026",
    threadLabel: "Commissariato di Lamezia Terme: potenziamento degli organici",
    territorialArea: "Commissariato di Polizia di Stato di Lamezia Terme; servizio cittadino",
    institutionalRecipient: "Prefetto di Catanzaro",
    channel: "comunicato",
    sourceLabel: "La Nuova Calabria, 28 ottobre 2026 — dichiarazioni del SAP dopo l'incontro con il prefetto",
    sourceUrl: "https://www.lanuovacalabria.it/catanzaro-una-delegazione-del-sap-incontra-il-prefetto",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La Nuova Calabria del 28 ottobre attribuisce a Sergio Riga (SAP Catanzaro) la segnalazione della carenza di organico nei commissariati di Catanzaro Lido e Lamezia Terme; City One del 29 ottobre riporta lo stesso incontro, senza provare un nuovo sviluppo indipendente. Si registra soltanto la richiesta relativa a Lamezia e non l'eventuale presidio del Reparto Mobile proposto per Catanzaro. Il numero attuale degli operatori non è verificato. L'interlocuzione col prefetto è riportata dal SAP, non documentata da verbale istituzionale; nessun provvedimento di potenziamento verificato. La richiesta COISP già censita è dello stesso tema ma proviene da un altro sindacato. Il destinatario non viene convertito in competenza istituzionale: not_assessed.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-10-28",
    lastUpdated: "2026-10-28",
    events: [
      {
        id: "sap-commissariato-rinforzi-incontro-prefetto",
        date: "2026-10-28",
        type: "emersione",
        title: "SAP segnala al prefetto la necessità di rinforzi al Commissariato",
        summary:
          "Nel resoconto pubblico dell'incontro con il prefetto, il segretario provinciale SAP evidenzia le carenze del personale a Lamezia Terme. Non emerge una soglia numerica né un atto istituzionale che attesti interventi conseguenti.",
        sourceLabel: "La Nuova Calabria, 28 ottobre 2026",
        sourceUrl: "https://www.lanuovacalabria.it/catanzaro-una-delegazione-del-sap-incontra-il-prefetto",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "polizia-frontiera-lamezia-tavolo-indennita-sap-2026",
    title: "Tavolo sull'indennità di sicurezza e frontiera per la Polizia aeroportuale",
    summary:
      "La segreteria provinciale SAP Catanzaro chiede un tavolo di concertazione tra gli organismi interessati per chiarire il riconoscimento e l'attribuzione dell'indennità di sicurezza e frontiera agli operatori della Polizia di Frontiera aerea di Lamezia Terme. Secondo il resoconto del sindacato, nel corso dell'incontro con il prefetto Di Nuzzo è stata consegnata una nota specifica. La consegna è riportata dalla stampa, senza documento protocollato o conferma ufficiale sul successivo iter.",
    promoterId: "sap-catanzaro",
    promoter: "Sindacato Autonomo di Polizia (SAP) — Segreteria provinciale Catanzaro",
    promoterType: "categoria",
    coPromoters: ["Sergio Riga"],
    periodLabel: "28 ottobre 2026",
    year: "2026",
    theme: "Trattamento economico e indennità della Polizia di Frontiera",
    threadId: "polizia-frontiera-lamezia-indennita-2026",
    threadLabel: "Polizia di Frontiera di Lamezia: concertazione sull'indennità",
    territorialArea: "Polizia di Frontiera aerea, Aeroporto di Lamezia Terme - Sant'Eufemia",
    institutionalRecipient: "Prefetto di Catanzaro",
    channel: "comunicato",
    sourceLabel: "La Nuova Calabria, 28 ottobre 2026 — dichiarazioni del SAP e nota riferita al prefetto",
    sourceUrl: "https://www.lanuovacalabria.it/catanzaro-una-delegazione-del-sap-incontra-il-prefetto",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il resoconto originale di La Nuova Calabria del 28 ottobre 2026 attribuisce espressamente al SAP la richiesta di un tavolo di concertazione per il riconoscimento e l'attribuzione dell'indennità alla Polizia di Frontiera aerea di Lamezia. City One del 29 ottobre descrive il medesimo incontro, non una seconda richiesta. La consegna di una nota è dichiarata dal sindacato, ma non è stato acquisito un protocollo istituzionale: non codificare deposito formale. La disponibilità del prefetto a verificare la questione è anch'essa riportata dal SAP, e non è una risposta formale verificata, un recepimento o un'attuazione. Il destinatario Prefetto di Catanzaro non dimostra la competenza sostanziale sulla corresponsione dell'indennità: not_assessed. L'aeroporto di Sant'Eufemia è identificato ufficialmente da ENAC, senza ricavare coordinate di uffici di polizia.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-10-28",
    lastUpdated: "2026-10-28",
    events: [
      {
        id: "sap-polizia-frontiera-richiesta-tavolo",
        date: "2026-10-28",
        type: "emersione",
        title: "SAP riferisce la richiesta di un tavolo sull'indennità di frontiera",
        summary:
          "Il sindacato comunica di aver chiesto al prefetto un confronto tra organismi interessati sull'indennità di sicurezza e frontiera per il personale aeroportuale di Lamezia e riferisce di aver consegnato una nota; nessun protocollo o atto di seguito è stato verificato.",
        sourceLabel: "La Nuova Calabria, 28 ottobre 2026",
        sourceUrl: "https://www.lanuovacalabria.it/catanzaro-una-delegazione-del-sap-incontra-il-prefetto",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
