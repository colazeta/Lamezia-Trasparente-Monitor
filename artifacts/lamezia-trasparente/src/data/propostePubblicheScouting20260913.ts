import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting del 13 settembre 2026.
 *
 * Parallel Search è stato usato per discovery ed espansione; il record è stato
 * verificato sulla pagina originaria che pubblica integralmente la nota firmata
 * dai due consiglieri. Le affermazioni sul precedente passaggio in Conferenza dei
 * Capigruppo restano attribuite ai promotori finché non emerge un verbale o altro
 * atto istituzionale autonomo.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260913 = [
  {
    id: "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026",
    title:
      "Scordovillo, Cristiano e Villella: ‘Basta decisioni calate dall’alto. Si convochi il Consiglio comunale aperto’",
    summary:
      "Richiesta del gruppo consiliare Futuro Nazionale di convocare un Consiglio comunale aperto sulla vicenda Scordovillo e di rendere pubblicamente conoscibili criteri, responsabilità e modalità delle decisioni relative al percorso abitativo e agli alloggi collegati al superamento del campo.",
    promoterId: "futuro-nazionale-lamezia",
    promoter: "Gruppo consiliare Futuro Nazionale — Lamezia Terme",
    promoterType: "forza_politica",
    coPromoters: ["Massimo Cristiano", "Carmine Villella"],
    periodLabel: "12 settembre 2026",
    year: "2026",
    theme: "Trasparenza e partecipazione democratica",
    threadId: "scordovillo-consiglio-aperto-trasparenza-percorso-abitativo",
    threadLabel:
      "Scordovillo: Consiglio comunale aperto e trasparenza sul percorso abitativo",
    territorialArea:
      "Scordovillo e, per gli effetti delle scelte abitative richiamate, territorio comunale di Lamezia Terme",
    institutionalRecipient:
      "Comune di Lamezia Terme — Presidente del Consiglio comunale",
    channel: "comunicato",
    sourceLabel:
      "City One Lamezia, 12 settembre 2026 — nota firmata da Massimo Cristiano e Carmine Villella",
    sourceUrl:
      "https://www.cityonelamezia.it/scordovillo-cristiano-e-villella-basta-decisioni-calate-dallalto-si-convochi-il-consiglio-comunale-aperto/",
    status: "proposta_emersa",
    linkedActs: [
      "Regolamento di funzionamento del Consiglio comunale di Lamezia Terme, art. 5 — poteri del Presidente del Consiglio",
    ],
    verificationNote:
      "La pagina originaria di City One pubblica integralmente una nota sottoscritta dai consiglieri Massimo Cristiano e Carmine Villella per Futuro Nazionale. La richiesta concreta e attuale è rivolta alla Presidente del Consiglio comunale affinché definisca la convocazione di un Consiglio comunale aperto su Scordovillo; la stessa nota chiede che criteri di individuazione dei beneficiari, modalità di assegnazione, requisiti, responsabilità e valutazioni sull'impatto sociale delle scelte abitative siano conoscibili e discussi pubblicamente. I promotori affermano che una richiesta delle opposizioni sarebbe stata già condivisa favorevolmente in Conferenza dei Capigruppo prima di Ferragosto e che la seduta sarebbe stata prevista entro metà settembre, ma lo scouting non ha reperito un verbale, una convocazione o un altro atto comunale che verifichi autonomamente questo passaggio: non viene quindi registrato alcun deposito, recepimento o calendarizzazione pregressa. Il Regolamento comunale vigente documenta invece autonomamente che il Presidente del Consiglio convoca il Consiglio e presiede la Conferenza dei Capigruppo; tale base sostiene soltanto l'assessment di competenza sulla misura di convocazione e non attribuisce al Presidente le competenze sostanziali sulle politiche abitative o sugli interventi relativi a Scordovillo.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-12",
    lastUpdated: "2026-09-12",
    events: [
      {
        id: "scordovillo-fn-richiesta-consiglio-aperto-12-settembre",
        date: "2026-09-12",
        type: "emersione",
        title:
          "Futuro Nazionale chiede la convocazione di un Consiglio comunale aperto su Scordovillo",
        summary:
          "Cristiano e Villella chiedono alla Presidente del Consiglio comunale di definire la convocazione di una seduta aperta su Scordovillo e di portare in una sede pubblica criteri, responsabilità e modalità delle decisioni relative al percorso abitativo. Il precedente accordo in Conferenza dei Capigruppo resta una dichiarazione dei promotori non autonomamente verificata.",
        sourceLabel: "City One Lamezia — nota di Futuro Nazionale",
        sourceUrl:
          "https://www.cityonelamezia.it/scordovillo-cristiano-e-villella-basta-decisioni-calate-dallalto-si-convochi-il-consiglio-comunale-aperto/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];