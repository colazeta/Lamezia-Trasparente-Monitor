import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Acquisition of a councillor's published motion request (26 October 2026).
 * The full councillor-attributed motion was checked on City One; the official profile
 * confirms identity. No council protocol or independent filing evidence has been recovered.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261027 = [
  {
    id: "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026",
    title: "Mozione di Nicotera per la soppressione dello staff del sindaco e la riallocazione di risorse",
    summary:
      "Il consigliere comunale Giancarlo Nicotera chiede di sopprimere lo staff politico del sindaco, cessare gli incarichi in essere, non stipulare o rinnovare contratti di supporto politico, quantificare formalmente i risparmi e riferirne al Consiglio. Propone di destinare le risorse prioritariamente ai servizi sociali per persone fragili e con disabilità e alla mitigazione della TARI, in subordine agli equilibri del piano di riequilibrio, e di riferire sulle misure entro 30 giorni dall'eventuale approvazione. City One pubblica il testo completo attribuito al consigliere, ma non è stato acquisito il protocollo di deposito; cifre e contesto economico addotti dal promotore non sono autonomamente verificati.",
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
    sourceLabel: "City One, 26 ottobre 2026 — testo integrale attribuito a Giancarlo Nicotera",
    sourceUrl: "https://cityonelamezia.it/2026/10/26/soppressione-dello-staff-del-sindaco-lo-chiede-giancarlo-nicotera/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "City One pubblica il 26 ottobre il testo integrale della mozione attribuito e datato dal consigliere Nicotera, con richieste di quantificazione e relazione al Consiglio, destinazione prioritaria dei risparmi, opzione subordinata per il piano di riequilibrio e relazione entro 30 giorni dall'eventuale approvazione. Il Lametino riferisce separatamente il deposito della mozione, ma non sono stati acquisiti protocollo o conferma ufficiale del ricevimento: il deposito resta non verificato nel percorso istituzionale. Il sito del Comune conferma Giancarlo Nicotera nel Consiglio comunale: https://www.comune.lamezia-terme.cz.it/it/persone/nicotera-giancarlo. Importi, variazioni TARI e valutazioni sulla situazione finanziaria sono riportati come dichiarazioni del promotore, non come audit contabile. La richiesta è rivolta a Sindaco e Giunta: il destinatario non è utilizzato per dedurre una competenza; assessment not_assessed. Nessun recepimento o attuazione documentati.",
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
          "Il testo integrale attribuito al consigliere richiede cessazione e mancato rinnovo degli incarichi, quantificazione formale dei risparmi e relazione al Consiglio, destinazioni prioritarie ai servizi per persone fragili e alla TARI o, in subordine, agli equilibri finanziari; prevede una relazione entro 30 giorni dall\'eventuale approvazione. Il deposito non è corroborato da protocollo comunale.",
        sourceLabel: "City One — testo integrale attribuito al consigliere Giancarlo Nicotera",
        sourceUrl: "https://cityonelamezia.it/2026/10/26/soppressione-dello-staff-del-sindaco-lo-chiede-giancarlo-nicotera/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
