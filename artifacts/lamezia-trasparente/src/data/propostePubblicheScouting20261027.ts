import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Acquisition of a councillor's published motion request (26 October 2026).
 * The original local outlet article was checked; the official councillor profile
 * confirms identity. No original filed motion or protocol has been recovered.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261027 = [
  {
    id: "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026",
    title: "Mozione di Nicotera per la soppressione dello staff del sindaco e la riallocazione di risorse",
    summary:
      "Il consigliere comunale Giancarlo Nicotera chiede di sopprimere lo staff politico del sindaco, cessare gli incarichi in essere, non stipulare o rinnovare contratti per gli uffici di supporto politico e destinare prioritariamente gli eventuali risparmi ai servizi sociali per persone con disabilità e a misure di contenimento della TARI per famiglie e imprese. Il deposito della mozione è riferito dalla testata, ma non è stato acquisito un testo protocollato. Le cifre di spesa e le variazioni dei tributi citate dal promotore non sono state verificate autonomamente.",
    promoterId: "giancarlo-nicotera-consigliere-lamezia-terme",
    promoter: "Giancarlo Nicotera — consigliere comunale di Lamezia Terme",
    promoterType: "consigliere",
    periodLabel: "26 ottobre 2026",
    year: "2026",
    theme: "Finanze comunali e riallocazione delle risorse",
    threadId: "staff-sindaco-soppressione-riallocazione-fondi-2026",
    threadLabel: "Staff del sindaco e destinazione delle risorse",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco e Giunta",
    channel: "mozione",
    sourceLabel: "il Lametino, 26 ottobre 2026 — mozione attribuita a Giancarlo Nicotera",
    sourceUrl: "https://www.lametino.it/ultime/lamezia-consigliere-nicotera-chiede-abolizione-dello-staff-del-sindaco-destinare-le-risorse-a-servizi.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il Lametino pubblica il 26 ottobre le misure concrete attribuite a Nicotera e riferisce il deposito di una mozione; nessun protocollo, ordine del giorno o testo originale della mozione è stato acquisito e pertanto il deposito resta dichiarato, non verificato nel percorso istituzionale. Il sito del Comune conferma Giancarlo Nicotera nel Consiglio comunale: https://www.comune.lamezia-terme.cz.it/it/persone/nicotera-giancarlo. Importi, variazioni TARI e valutazioni sulla situazione finanziaria sono riportati come dichiarazioni del promotore, non come audit contabile. La richiesta è rivolta a Sindaco e Giunta: il destinatario non è utilizzato per dedurre una competenza; assessment not_assessed. Nessun recepimento o attuazione documentati.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-10-26",
    lastUpdated: "2026-10-26",
    events: [
      {
        id: "nicotera-staff-sindaco-mozione-riferita",
        date: "2026-10-26",
        type: "emersione",
        title: "Pubblicata la richiesta di soppressione dello staff politico",
        summary:
          "La testata riporta la richiesta di cessazione degli incarichi di staff, di non rinnovare o stipulare nuovi contratti e di destinare gli eventuali risparmi a servizi per disabili e mitigazione della TARI. Il deposito della mozione è riferito, ma non corroborato dal protocollo comunale.",
        sourceLabel: "il Lametino — testo attribuito al consigliere Giancarlo Nicotera",
        sourceUrl: "https://www.lametino.it/ultime/lamezia-consigliere-nicotera-chiede-abolizione-dello-staff-del-sindaco-destinare-le-risorse-a-servizi.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
