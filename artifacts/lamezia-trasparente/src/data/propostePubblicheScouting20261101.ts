import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting del 1 novembre, su comunicato Federalberghi Calabria pubblicato il 31 ottobre.
 * Fonti: due testate che riproducono la medesima nota, non due riscontri istituzionali.
 * Il confronto dichiarato non prova un deposito né un recepimento o un'attuazione.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261101 = [
  {
    id: "turismo-imposta-soggiorno-tavolo-federalberghi-2026",
    title: "Coordinamento dell'accoglienza turistica e destinazione degli introiti dell'imposta di soggiorno",
    summary:
      "Nel comunicato pubblicato il 31 ottobre 2026 Federalberghi Calabria, tramite il presidente Fabrizio D'Agostino, esprime disponibilità all'introduzione dell'imposta di soggiorno a Lamezia Terme a condizione che le eventuali entrate siano destinate a finalità e servizi turistici e chiede l'istituzione immediata di un tavolo di coordinamento con amministrazione comunale, ricettività, ristorazione, taxi, trasporti e operatori culturali. Sollecita inoltre un progetto di accoglienza che consideri musei e orari, informazioni accessibili ai visitatori anche stranieri e collegamenti con aeroporto, stazione e mare. Le criticità dei servizi e l'impegno attribuito al Comune sono dichiarazioni del promotore, non accertamenti indipendenti.",
    promoterId: "federalberghi-calabria",
    promoter: "Federalberghi Calabria",
    promoterType: "categoria",
    coPromoters: ["Fabrizio D'Agostino"],
    periodLabel: "31 ottobre 2026",
    year: "2026",
    theme: "Coordinamento turistico e imposta di soggiorno",
    threadId: "turismo-accoglienza-lamezia-2026",
    threadLabel: "Coordinamento dell'accoglienza e destinazione turistica",
    territorialArea: "Intero territorio comunale di Lamezia Terme; servizi per i visitatori",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco e Assessorato al Turismo",
    channel: "comunicato",
    sourceLabel: "il Lametino, 31 ottobre 2026 — nota attribuita a Federalberghi Calabria",
    sourceUrl: "https://www.lametino.it/ultimora/federalberghi-calabria-si-a-tassa-di-soggiorno-a-lamezia-ma-risorse-siano-investite-nel-turismo.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La fonte originaria consultata è il Lametino del 31 ottobre, che pubblica una nota attribuita a Federalberghi Calabria; Corriere di Lamezia del 31 ottobre (https://www.corrieredilamezia.it/attualita/2026_10_31/imposta-di-soggiorno-a-lamezia-terme-federalberghi-calabria-si-ma-ogni-euro-incassato-va-speso-per-il-turismo-serve-unidentita-turistica-e-subito-un-tavolo-di-coordinamento_67993/) riproduce la stessa comunicazione e non costituisce conferma istituzionale indipendente. Secondo Federalberghi si è svolto un incontro con il sindaco Mario Murone e l'assessora al Turismo Annalisa Spinelli: l'incontro e l'asserito impegno di accoglimento delle richieste non sono corroborati da verbale o comunicato istituzionale acquisiti. Non risulta verificata una delibera istitutiva dell'imposta, il relativo regolamento, l'istituzione del tavolo, l'assegnazione di risorse o l'avvio delle misure. Il contenuto riguarda richieste e condizioni del promotore, non una misura già decisa; nessun deposito, recepimento, calendarizzazione istituzionale o attuazione è attribuito. Destinatario del confronto documentato distinto da competenza: not_assessed; nessun ente competente dedotto per la disciplina tributaria o l'organizzazione dei servizi.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-10-31",
    lastUpdated: "2026-10-31",
    events: [
      {
        id: "federalberghi-turismo-imposta-tavolo-31-ottobre",
        date: "2026-10-31",
        type: "emersione",
        title: "Federalberghi chiede un tavolo turistico e destinazione vincolata degli eventuali introiti",
        summary:
          "La nota attribuita a Federalberghi Calabria chiede di istituire un tavolo con operatori del turismo e Amministrazione e di utilizzare eventuali entrate dell'imposta di soggiorno per finalità turistiche. Il promotore riferisce una disponibilità del Comune, non corroborata da una fonte istituzionale: non è registrata come risposta ufficiale o recepimento.",
        sourceLabel: "il Lametino, 31 ottobre 2026 — nota Federalberghi Calabria",
        sourceUrl: "https://www.lametino.it/ultimora/federalberghi-calabria-si-a-tassa-di-soggiorno-a-lamezia-ma-risorse-siano-investite-nel-turismo.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
