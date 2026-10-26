import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Recovery of two documented civic proposals from 13–16 October 2026.
 * Original communications are attributed to their promoters by local outlets.
 * A subsequent ANSA report independently documents the asbestos meeting.
 * Neither proposal has a verified institutional filing or implementation.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261026_BACKFILL = [
  {
    id: "piano-comunale-amianto-m5s-lamezia-2026",
    title: "Proposta di deliberazione d'iniziativa popolare per il Piano comunale amianto",
    summary:
      "Il Gruppo territoriale Movimento 5 Stelle di Lamezia Terme propone che il Comune avvii, entro 90 giorni dall'eventuale approvazione della deliberazione, l'aggiornamento del censimento e della mappatura dei manufatti contenenti amianto e predisponga entro 180 giorni un Piano comunale con priorità, possibili interventi e fonti di finanziamento. Propone inoltre di acquisire segnalazioni dei cittadini, soggette a successive verifiche tecniche. L'incontro di presentazione si è svolto il 16 ottobre; non è verificato il deposito della deliberazione.",
    promoterId: "gruppo-territoriale-m5s-lamezia-terme",
    promoter: "Gruppo territoriale Movimento 5 Stelle di Lamezia Terme",
    promoterType: "forza_politica",
    periodLabel: "13–16 ottobre 2026",
    year: "2026",
    theme: "Ambiente e bonifica amianto",
    threadId: "piano-comunale-amianto-censimento-bonifica-2026",
    threadLabel: "Piano comunale amianto: censimento, prevenzione e interventi",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme — Amministrazione comunale",
    channel: "iniziativa_popolare",
    sourceLabel: "il Lametino, 13 ottobre 2026 — proposta attribuita al Gruppo territoriale M5S",
    sourceUrl:
      "https://www.lametino.it/eventi/lamezia-amianto-e-salute-pubblica-m5s-promuove-incontro-e-raccoglie-le-segnalazioni-dei-cittadini.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il comunicato attribuito al Gruppo territoriale M5S contiene scadenze condizionate all'eventuale approvazione e misure concrete di censimento, piano comunale e raccolta di segnalazioni da verificare tecnicamente. ANSA documenta che l'incontro pubblico del 16 ottobre si è effettivamente tenuto. Nessun protocollo di deposito della deliberazione o prova del numero/trasmissione delle segnalazioni è stato acquisito. Le cifre su manufatti e spese riportate dagli oratori non sono dati tecnici indipendentemente validati. Il destinatario non è usato per inferire automaticamente la competenza, che resta not_assessed; lo svolgimento dell'incontro non equivale a recepimento né attuazione.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-10-13",
    lastUpdated: "2026-10-16",
    events: [
      {
        id: "pac-m5s-lamezia-proposta-presentata-alla-stampa",
        date: "2026-10-13",
        type: "emersione",
        title: "Annunciata la proposta di Piano comunale amianto",
        summary:
          "Il Gruppo territoriale M5S presenta la richiesta di censimento e mappatura da avviare entro 90 giorni e piano da predisporre entro 180 giorni dall'eventuale approvazione della deliberazione; propone un punto di raccolta di segnalazioni da verificare successivamente.",
        sourceLabel: "il Lametino — nota attribuita al Gruppo territoriale M5S",
        sourceUrl:
          "https://www.lametino.it/eventi/lamezia-amianto-e-salute-pubblica-m5s-promuove-incontro-e-raccoglie-le-segnalazioni-dei-cittadini.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "pac-m5s-lamezia-incontro-pubblico-svolto",
        date: "2026-10-16",
        type: "aggiornamento",
        title: "Svolto l'incontro pubblico «Conoscere, mappare, prevenire»",
        summary:
          "ANSA riferisce dello svolgimento dell'incontro a Lamezia promosso dal M5S. Non risultano verificati il deposito istituzionale della proposta o la trasmissione al Comune di segnalazioni raccolte.",
        sourceLabel: "ANSA Calabria, 16 ottobre 2026",
        sourceUrl:
          "https://www.ansa.it/amp/calabria/notizie/2026/10/16/costa-lamianto-e-unemergenza-ambientale-e-sanitaria_5ed18769-75dd-4b0c-927a-2d5204bdf204.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "controlli-velocita-bizantini-savutano-branca-2026",
    title: "Richiesta di verifiche e controlli della velocità in via dei Bizantini e via Savutano",
    summary:
      "Il consigliere comunale Oscar Branca, del gruppo Gianpaolo Bevilacqua, chiede all'Amministrazione e agli uffici interessati di verificare la sicurezza stradale in via dei Bizantini e via Savutano e valutare l'installazione di un dispositivo fisso di rilevazione della velocità, se consentito dalla normativa, oppure controlli mobili. Le segnalazioni sulla velocità dei veicoli e su un incidente sono riferite dalla fonte; non costituiscono accertamenti indipendenti.",
    promoterId: "oscar-branca-gruppo-bevilacqua",
    promoter: "Oscar Branca — gruppo consiliare Gianpaolo Bevilacqua",
    promoterType: "consigliere",
    periodLabel: "16 ottobre 2026",
    year: "2026",
    theme: "Sicurezza stradale e controllo della velocità",
    threadId: "bizantini-savutano-controlli-velocita-2026",
    threadLabel: "Controlli della velocità in via dei Bizantini e via Savutano",
    territorialArea: "Via dei Bizantini e via Savutano, Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme — Amministrazione comunale e uffici interessati",
    channel: "comunicato",
    sourceLabel: "City One, 16 ottobre 2026 — nota attribuita al consigliere Oscar Branca",
    sourceUrl:
      "https://cityonelamezia.it/2026/10/16/oscar-branca-servono-piu-controlli-in-via-dei-bizantini-e-via-savutano-oggi-lennesimo-incidente/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "City One attribuisce espressamente la comunicazione al consigliere Oscar Branca del gruppo Gianpaolo Bevilacqua. Le richieste concrete riguardano verifiche sulle due strade e la valutazione alternativa di controlli fissi consentiti dalla legge o mobili. La fonte dice che Branca porterà la questione all'Amministrazione, ma non comprova un deposito o contatto formale già avvenuto. Incidente, velocità e rischi sono segnalazioni da accertare, non perizie. Non si inferiscono poteri di installazione o competenza dal destinatario; assessment not_assessed. Nessuna attuazione documentata.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-10-16",
    lastUpdated: "2026-10-16",
    events: [
      {
        id: "bizantini-savutano-branca-richiesta-controlli",
        date: "2026-10-16",
        type: "emersione",
        title: "Branca chiede verifiche e valuta controlli fissi o mobili della velocità",
        summary:
          "Il consigliere rende pubblica la richiesta di verifica della sicurezza delle due strade e di valutazione di strumenti di controllo della velocità subordinati ai requisiti normativi. Non è verificata un'istanza formalmente ricevuta.",
        sourceLabel: "City One — nota attribuita al consigliere Oscar Branca",
        sourceUrl:
          "https://cityonelamezia.it/2026/10/16/oscar-branca-servono-piu-controlli-in-via-dei-bizantini-e-via-savutano-oggi-lennesimo-incidente/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
