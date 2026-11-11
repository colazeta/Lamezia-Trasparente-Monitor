import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting 11 novembre 2026, da comunicato dei consiglieri pubblicato il 10 novembre.
 * La convocazione per il 19 novembre è riferita dai firmatari, non confermata
 * da una convocazione/ordine del giorno comunale acquisito.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261111 = [
  {
    id: "scordovillo-consiglio-aperto-pd-azione-per-vivere-bene-2026",
    title: "Consiglio comunale aperto sul superamento del campo di Scordovillo",
    summary:
      "Il 10 novembre 2026 i gruppi consiliari Partito Democratico, Azione e Per Vivere Bene, con sei consiglieri firmatari, rendono nota una richiesta di Consiglio comunale aperto dedicato al superamento del campo di Scordovillo e ai percorsi di inclusione abitativa e sociale. Chiedono un confronto pubblico sulle scelte amministrative e l'invito delle istituzioni coinvolte, comprese le autorità statali e regionali, ATERP, ASP, comuni interessati e Terzo Settore. I firmatari riferiscono che la seduta è stata convocata per il 19 novembre, ma non sono stati acquisiti la convocazione ufficiale né l'ordine del giorno: la data resta un annuncio attribuito alla fonte.",
    promoterId: "gruppi-consiliari-pd-azione-per-vivere-bene-lamezia",
    promoter: "Gruppi consiliari Partito Democratico, Azione e Per Vivere Bene — Lamezia Terme",
    promoterType: "forza_politica",
    coPromoters: [
      "Gennarino Masi",
      "Doris Lo Moro",
      "Bernadette Serratore",
      "Lidia Vescio",
      "Annita Vitale",
      "Fabrizio Muraca",
    ],
    periodLabel: "10 novembre 2026",
    year: "2026",
    theme: "Trasparenza e partecipazione democratica",
    threadId: "scordovillo-consiglio-aperto-trasparenza-percorso-abitativo",
    threadLabel: "Scordovillo: Consiglio comunale aperto e trasparenza sul percorso abitativo",
    territorialArea:
      "Scordovillo e territorio comunale di Lamezia Terme interessato dalle scelte abitative",
    institutionalRecipient: "Comune di Lamezia Terme — Presidenza del Consiglio comunale",
    channel: "comunicato",
    sourceLabel: "il Lametino — comunicato dei consiglieri di PD, Azione e Per Vivere Bene, 10 novembre 2026",
    sourceUrl: "https://www.lametino.it/ultime/lamezia-il-19-novembre-consiglio-comunale-aperto-sul-superamento-del-campo-rom-di-scordovillo.html",
    status: "proposta_emersa",
    linkedActs: [
      "https://www.comune.lamezia-terme.cz.it/it/documenti_pubblici/regolamento-di-funzionamento-del-consiglio-comunale-modificato-con-deliberazione-di-consiglio-comunale-n-1-del-31-01-2025",
    ],
    verificationNote:
      "Il Lametino pubblica il 10 novembre 2026 la nota attribuita a sei consiglieri dei gruppi PD, Azione e Per Vivere Bene che rivendicano la richiesta di Consiglio comunale aperto e affermano che è stato convocato per il 19 novembre. LameziaTerme.it riproduce il comunicato. La richiesta firmata non è stata acquisita in copia protocollata: la dichiarazione sulla sottoscrizione non è prova autonoma di deposito formale; non sono stati reperiti un ordine del giorno o una convocazione dell'ente e dunque la data annunciata non viene qualificata come calendarizzazione istituzionale verificata. Il 19 novembre è una data futura: nessuna discussione si considera svolta, nessuna soluzione abitativa o attuazione è verificata. Il promotore è distinto dal gruppo Futuro Nazionale di Cristiano e Villella, la cui richiesta di settembre resta censita con un ID separato e il medesimo filone tematico; nessun rapporto causale è attribuito a un singolo gruppo. Il destinatario è la Presidenza del Consiglio comunale e non viene automaticamente considerato titolare delle competenze abitative. La competenza sulla sola convocazione è verificata in parte tramite art. 5 del Regolamento comunale 2025, senza attribuirle poteri su sgombero, allocazione degli alloggi o inclusione sociale.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-11-10",
    lastUpdated: "2026-11-10",
    events: [
      {
        id: "scordovillo-centrosinistra-richiesta-e-data-riferita-2026-11-10",
        date: "2026-11-10",
        type: "emersione",
        title: "Resa pubblica la richiesta di Consiglio aperto, con data riferita per il 19 novembre",
        summary:
          "Sei consiglieri di PD, Azione e Per Vivere Bene chiedono un confronto pubblico con istituzioni e Terzo Settore sulle scelte relative a Scordovillo. Dichiarano che il Consiglio aperto è stato convocato per il 19 novembre; mancano convocazione e ordine del giorno originali, quindi la data è registrata come dichiarazione e non come calendarizzazione ufficialmente verificata.",
        sourceLabel: "il Lametino — nota dei gruppi consiliari, 10 novembre 2026",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-il-19-novembre-consiglio-comunale-aperto-sul-superamento-del-campo-rom-di-scordovillo.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
