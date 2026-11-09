import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting 9 novembre 2026: comunicato pubblicato il 6 novembre.
 * La fonte documenta una richiesta associativa, non una decisione accademica
 * o comunale sulla sede del corso.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261109 = [
  {
    id: "infermieristica-sede-ospedale-parco-agricolo-2026",
    title: "Sede ospedaliera per il corso universitario di Infermieristica",
    summary:
      "Il 6 novembre 2026 Piero Renda, presidente dell'Associazione Parco Agricolo di Calabria, contesta la prospettata collocazione urbana delle lezioni del corso di laurea in Infermieristica dell'Università Magna Graecia e chiede di mantenere il polo universitario all'interno dell'ospedale Giovanni Paolo II di Lamezia Terme, proponendone anche un ampliamento strutturale nel presidio. L'ubicazione urbana e gli annunci sulla riattivazione del corso sono riferiti dalle fonti di stampa, non verificati qui tramite un atto dell'Ateneo o del Comune.",
    promoterId: "parco-agricolo-calabria",
    promoter: "Associazione Parco Agricolo di Calabria",
    promoterType: "associazione",
    coPromoters: ["Piero Renda"],
    periodLabel: "6 novembre 2026",
    year: "2026",
    theme: "Collocazione e potenziamento del corso universitario di Infermieristica",
    threadId: "infermieristica-sede-corso-universitario-lamezia-2026",
    threadLabel: "Corso universitario di Infermieristica: sede didattica a Lamezia",
    territorialArea: "Ospedale Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient: "Sindaco e Amministrazione comunale di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "City One — nota di Piero Renda (Parco Agricolo di Calabria), 6 novembre 2026",
    sourceUrl: "https://cityonelamezia.it/2026/11/06/corso-di-laurea-in-infermieristica-la-sede-ideale-e-lospedale-giovanni-paolo-ii-renda/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "City One del 6 novembre 2026 pubblica la nota firmata da Piero Renda, che richiama una precedente proposta di polo universitario all'ospedale senza una data o URL originario recuperato: il primo evento documentato qui resta il 6 novembre. Non sono stati acquisiti atti ufficiali che confermino una decisione definitiva sulla sede delle lezioni, iscrizioni riaperte per il primo anno, il deposito formale della richiesta, una risposta, il recepimento o l'attuazione. Il corso è distinto dal precedente record del medesimo promotore sul piano assunzioni Polizia Locale: stessa identità normalizzata ma oggetto e thread differenti. La dichiarazione del promotore è rivolta alla scelta prospettata dal Sindaco e dall'Amministrazione; institutionalRecipient non costituisce prova della competenza a decidere sede e organizzazione universitaria. Competenza not_assessed. La geografia indica il presidio senza coordinate WGS84 non verificate.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-11-06",
    lastUpdated: "2026-11-06",
    events: [
      {
        id: "infermieristica-ospedale-parco-agricolo-comunicato-2026-11-06",
        date: "2026-11-06",
        type: "emersione",
        title: "Parco Agricolo di Calabria propone di collocare e ampliare il corso nell'ospedale",
        summary:
          "Piero Renda chiede di mantenere le lezioni di Infermieristica nel presidio Giovanni Paolo II e prospetta un ampliamento del polo sanitario-universitario. Il posizionamento definitivo del corso e gli esiti istituzionali non risultano verificati.",
        sourceLabel: "City One — nota di Piero Renda, 6 novembre 2026",
        sourceUrl: "https://cityonelamezia.it/2026/11/06/corso-di-laurea-in-infermieristica-la-sede-ideale-e-lospedale-giovanni-paolo-ii-renda/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
