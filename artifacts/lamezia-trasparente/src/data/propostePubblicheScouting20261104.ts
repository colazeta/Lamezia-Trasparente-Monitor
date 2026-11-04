import type { PublicProposal } from "./propostePubblicheCore";

/** Segnalazione pubblica distinta dalla richiesta dei consiglieri sul reticolo cittadino. */
export const SCOUTED_PUBLIC_PROPOSALS_20261104 = [
  {
    id: "cottola-fiala-pulizia-detriti-residenti-agricoltori-2026",
    title: "Rimozione dei detriti nell'alveo del torrente Cottola presso località Fialà",
    summary:
      "Alcuni residenti e titolari di aziende agricole nella zona fra Maida e Lamezia Terme chiedono interventi di pulizia e prevenzione in corrispondenza del ponte di località Fialà, dove segnalano accumuli di detriti nell'alveo del torrente Cottola. La segnalazione è riportata dal Lametino il 3 novembre. La situazione materiale e l'effettivo rischio di esondazione non sono accertati autonomamente; il tratto si trova in prossimità del confine comunale.",
    promoterId: "residenti-e-aziende-agricole-fiala-cottola",
    promoter: "Residenti e titolari di aziende agricole della zona del Cottola presso Fialà (non nominati)",
    promoterType: "cittadino_comitato",
    periodLabel: "3 novembre 2026",
    year: "2026",
    theme: "Manutenzione dei corsi d'acqua e prevenzione idrogeologica",
    threadId: "corsi-acqua-pulizia-manutenzione-calabria-verde",
    threadLabel: "Corsi d'acqua cittadini: pulizia alvei e programmazione",
    territorialArea: "Torrente Cottola presso il ponte di località Fialà, zona di confine fra Maida e Lamezia Terme",
    institutionalRecipient: "Istituzioni interessate alla richiesta (non indicate nominalmente nella segnalazione)",
    channel: "altro",
    sourceLabel: "il Lametino, 3 novembre 2026 — segnalazione di residenti e operatori agricoli",
    sourceUrl: "https://www.lametino.it/ultimora/detriti-nel-torrente-cottola-i-cittadini-ripulire-al-piu-presto.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il Lametino del 3 novembre riporta direttamente le parole di titolari di aziende agricole e residenti, non identificati per nome. È documentata la richiesta concreta di pulizia dei detriti presso il ponte di Fialà, non la verifica tecnica dell'ostruzione, l'attribuzione dei lavori, l'avvenuto deposito o un provvedimento. La località è descritta come zona di confine Maida–Lamezia: non sono documentate coordinate, perimetro comunale puntuale o autorità competente. I promotori si rivolgono genericamente alle istituzioni: il destinatario è riportato senza trasferirlo alla competenza, che resta not_assessed. La proposta è distinta da quella di Cristiano e Villella per promotori e tratto specifico, pur appartenendo allo stesso filone.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-11-03",
    lastUpdated: "2026-11-03",
    events: [
      {
        id: "residenti-fiala-cottola-richiesta-pulizia",
        date: "2026-11-03",
        type: "emersione",
        title: "Residenti e imprese agricole chiedono la rimozione di detriti presso Fialà",
        summary:
          "La stampa riporta la richiesta di lavori di pulizia e prevenzione nel tratto del torrente Cottola presso il ponte in località Fialà; la situazione segnalata richiede riscontro tecnico.",
        sourceLabel: "il Lametino, 3 novembre 2026",
        sourceUrl: "https://www.lametino.it/ultimora/detriti-nel-torrente-cottola-i-cittadini-ripulire-al-piu-presto.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
