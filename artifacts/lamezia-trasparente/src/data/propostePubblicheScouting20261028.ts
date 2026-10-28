import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Acquisition dated 27 October 2026, indexed 28 October.
 * The union statement supports the demand, not a verified current staffing count.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261028 = [
  {
    id: "commissariato-lamezia-organico-cento-unita-coisp-2026",
    title: "Potenziamento dell'organico del Commissariato di Polizia di Stato di Lamezia Terme",
    summary:
      "La Segreteria regionale COISP Calabria e la Segreteria provinciale COISP Catanzaro chiedono un piano di rafforzamento del Commissariato di Polizia di Stato di Lamezia Terme che porti l'organico ad almeno 100 unità. La soglia è richiesta dal sindacato: la fonte non documenta il personale effettivo, il fabbisogno accertato o un piano già adottato.",
    promoterId: "coisp-calabria-catanzaro",
    promoter: "COISP — Segreteria regionale Calabria e Segreteria provinciale Catanzaro",
    promoterType: "categoria",
    periodLabel: "27 ottobre 2026",
    year: "2026",
    theme: "Sicurezza pubblica e organici del Commissariato",
    threadId: "commissariato-lamezia-organici-polizia-stato-2026",
    threadLabel: "Commissariato di Lamezia Terme: potenziamento degli organici",
    territorialArea: "Commissariato di Polizia di Stato di Lamezia Terme; servizio di rilievo cittadino",
    institutionalRecipient: "Stato italiano",
    channel: "comunicato",
    sourceLabel: "Corriere di Lamezia, 27 ottobre 2026 — nota attribuita alle segreterie COISP",
    sourceUrl:
      "https://www.corrieredilamezia.it/attualita/2026_10_27/lamezia-il-coisp-plaudisce-alla-polizia-di-stato-e-chiede-un-organico-di-almeno-100-unita-per-il-commissariato_67862/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Corriere di Lamezia pubblica il 27 ottobre una nota esplicitamente attribuita alla Segreteria regionale COISP Calabria e alla Segreteria provinciale COISP Catanzaro; intervengono Raffaele Maurotti e Francesco Spizzirri. La misura richiesta è un piano per portare l'organico del Commissariato ad almeno 100 unità. Non è stata reperita una pubblicazione indipendente di questa nota sul sito del sindacato, né verificato il personale attuale. Nessun deposito, risposta, recepimento o intervento attuativo è documentato. Il destinatario ricavabile dalla nota è lo Stato, senza usarlo per inferire l'ente competente: assessment not_assessed. Il campo geografico citywide descrive il servizio rivolto alla città e non una localizzazione puntuale; non vengono attribuite coordinate WGS84. Questa proposta non va confusa con iniziative riguardanti la Polizia Locale o altri uffici.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-10-27",
    lastUpdated: "2026-10-27",
    events: [
      {
        id: "coisp-commissariato-richiesta-rinforzo-ottobre",
        date: "2026-10-27",
        type: "emersione",
        title: "COISP chiede un piano di potenziamento fino ad almeno 100 unità",
        summary:
          "Le segreterie COISP Calabria e Catanzaro chiedono un piano per rafforzare il personale del Commissariato di Lamezia fino ad almeno 100 unità. La soglia è una richiesta sindacale, non un dato verificato sugli organici; non sono documentati depositi istituzionali o atti conseguenti.",
        sourceLabel: "Corriere di Lamezia, 27 ottobre 2026 — nota COISP",
        sourceUrl:
          "https://www.corrieredilamezia.it/attualita/2026_10_27/lamezia-il-coisp-plaudisce-alla-polizia-di-stato-e-chiede-un-organico-di-almeno-100-unita-per-il-commissariato_67862/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
