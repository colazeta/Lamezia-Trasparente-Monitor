import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting 12 novembre 2026. Una proposta del giorno precedente e due recuperi.
 * Le fonti stampa riproducono richieste concrete, non attestano protocolli,
 * decisioni comunali o attuazioni. Il destinatario non determina la competenza.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261112 = [
  {
    id: "nuovo-cimitero-monumentale-studio-de-biase-2026",
    title: "Studio di fattibilità per un nuovo cimitero monumentale a Lamezia",
    summary:
      "In una lettera aperta pubblicata l'11 novembre 2026, Salvatore De Biase, già presidente del Consiglio comunale, chiede di studiare la fattibilità di un nuovo Cimitero Monumentale per la città, insieme alla verifica di ampliamenti e recuperi dei cimiteri storici di Nicastro, Sambiase e Sant'Eufemia. Richiede censimento delle domande di concessione inevase, comparazione di possibili aree, stima economica e programmazione urbanistica. L'ipotesi di collocazione nella zona sud è solo una possibilità da confrontare tecnicamente con alternative. La cifra di oltre mille richieste è richiamata dal promotore come dato da accertare, non come totale verificato.",
    promoterId: "salvatore-de-biase",
    promoter: "Salvatore De Biase",
    promoterType: "cittadino_comitato",
    coPromoters: [],
    periodLabel: "11 novembre 2026",
    year: "2026",
    theme: "Programmazione del nuovo cimitero e verifica degli spazi cimiteriali",
    threadId: "cimiteri-programmazione-spazi-lamezia-2026",
    threadLabel: "Programmazione di nuovi spazi cimiteriali e mantenimento dei cimiteri storici",
    territorialArea: "Intero territorio comunale; localizzazione del nuovo cimitero da valutare",
    institutionalRecipient: "Sindaco, Giunta e Consiglio comunale di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "il Lametino — lettera aperta di Salvatore De Biase, 11 novembre 2026",
    sourceUrl: "https://www.lametino.it/ultime/de-biase-lamezia-ha-bisogno-di-un-nuovo-cimitero.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "È documentata la lettera aperta e una richiesta di programmazione, non uno studio già avviato, una deliberazione, una localizzazione approvata o lavori. Il dato di oltre mille domande pendenti e il riferimento a previsioni del PSC sono dichiarazioni del promotore da verificare presso fonti istituzionali. Non risulta deposito protocollato della proposta. Salvatore De Biase è lo stesso promotore normalizzato del Patto civico del 4 novembre ma l'oggetto è differente; questa proposta non coincide con la segnalazione dei familiari sui loculi di Nicastro. Destinatario documentato, competenza specifica non accertata: not_assessed. Nessuna georeferenziazione senza scelta di sito.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-11-11",
    lastUpdated: "2026-11-11",
    events: [
      {
        id: "de-biase-proposta-nuovo-cimitero-2026-11-11",
        date: "2026-11-11",
        type: "emersione",
        title: "De Biase chiede censimento della domanda e studio comparativo per un nuovo cimitero",
        summary:
          "Lettera aperta con cinque azioni: censimento delle domande, verifica di ampliamenti esistenti, confronto delle aree alternative, fattibilità economica e inserimento nella pianificazione. Non attestati procedimenti avviati o interventi.",
        sourceLabel: "il Lametino — lettera aperta, 11 novembre 2026",
        sourceUrl: "https://www.lametino.it/ultime/de-biase-lamezia-ha-bisogno-di-un-nuovo-cimitero.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "microforesta-urbana-lamezia-respira-vescio-scaramuzzino-2026",
    title: "Realizzazione sperimentale di una microforesta urbana",
    summary:
      "Il 29 settembre 2026 una nota riferisce che la consigliera Lidia Vescio, su proposta di Rosamaria Scaramuzzino nell'ambito del progetto Lamezia Respira, ha presentato una mozione per avviare una microforesta su area pubblica ancora da individuare. Le misure comprendono ricognizione di aree con poco verde entro 90 giorni, valutazione tecnica e dei costi, specie autoctone, eventuale metodo Miyawaki e partecipazione locale. Il 3 ottobre sono stati riferiti ulteriori aspetti di accessibilità, inclusione e possibile depavimentazione. L'avvenuto deposito della mozione è dichiarato dalla stampa, non accertato tramite protocollo comunale.",
    promoterId: "lidia-vescio",
    promoter: "Lidia Vescio",
    promoterType: "consigliere",
    coPromoters: ["Rosamaria Scaramuzzino (ideatrice di Lamezia Respira)"],
    periodLabel: "29 settembre – 3 ottobre 2026",
    year: "2026",
    theme: "Rigenerazione del verde urbano e microforeste",
    threadId: "lamezia-respira-microforesta-2026",
    threadLabel: "Lamezia Respira: prima microforesta e spazi verdi inclusivi",
    territorialArea: "Aree pubbliche di Lamezia Terme ancora da identificare; attenzione ai quartieri meno dotati di verde",
    institutionalRecipient: "Sindaco e Giunta comunale di Lamezia Terme",
    channel: "mozione",
    sourceLabel: "il Lametino — nota Lamezia Respira, 29 settembre 2026",
    sourceUrl: "https://www.lametino.it/ultime/lamezia-respira-vescio-su-proposta-di-scaramuzzino-presenta-mozione-per-la-prima-microforesta-urbana.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La presentazione e il presunto deposito di una mozione sono riportati dalla stampa, ma mancano numero di protocollo, testo ufficiale o registrazione del deposito: non assegnare evento deposito, presentata_formalmente o recepita. Il termine di 90 giorni è una richiesta nella mozione riferita, non una scadenza amministrativa vigente. La fonte del 3 ottobre descrive ampliamenti partecipativi e possibili interventi di depavimentazione, non un progetto esecutivo. Metodo Miyawaki, impatti ecologici e sicurezza sono ipotesi da sottoporre a verifica tecnica; non attribuire efficacia provata. Area non selezionata, nessuna coordinata. Destinatario distinto dall'ente competente, che resta not_assessed.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-29",
    lastUpdated: "2026-10-03",
    events: [
      {
        id: "lamezia-respira-mozione-microforesta-riferita-2026-09-29",
        date: "2026-09-29",
        type: "emersione",
        title: "Comunicata la richiesta di individuare un'area per la prima microforesta urbana",
        summary:
          "Lidia Vescio e Rosamaria Scaramuzzino illustrano selezione delle aree, verifica tecnica, costi, coinvolgimento della comunità e specie autoctone. Il deposito della mozione è solo riferito, senza protocollo.",
        sourceLabel: "il Lametino, 29 settembre 2026",
        sourceUrl: "https://www.lametino.it/ultime/lamezia-respira-vescio-su-proposta-di-scaramuzzino-presenta-mozione-per-la-prima-microforesta-urbana.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "lamezia-respira-ampliamento-inclusione-2026-10-03",
        date: "2026-10-03",
        type: "aggiornamento",
        title: "Illustrati ulteriori criteri di accessibilità e possibile depavimentazione",
        summary:
          "Nella presentazione pubblica si prospettano una mappatura partecipata dei luoghi, l'attenzione a persone fragili e minoranze e la valutazione di spazi da rendere permeabili; non risultano aree deliberate o lavori.",
        sourceLabel: "il Lametino, 3 ottobre 2026",
        sourceUrl: "https://www.lametino.it/ultime/piu-verde-e-nuovo-spazi-presentato-progetto-pd-lamezia-respira.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "reu-verifica-adeguamento-v-commissione-vescio-2026",
    title: "Verifica e possibile adeguamento del Regolamento Edilizio Urbanistico",
    summary:
      "Il 28 settembre 2026 è pubblicata una comunicazione su un ordine del giorno attribuito a tutti i componenti della V Commissione consiliare, presieduta da Salvatore Vescio. Chiede una verifica puntuale del Regolamento Edilizio Urbanistico (REU) comunale rispetto alle norme nazionali e regionali, la ricognizione di eventuali incongruenze, la valutazione delle procedure di aggiornamento applicabili e la revisione degli allegati A e B, ove necessaria, con informativa al Consiglio. Le asserite difformità sono dichiarazioni riportate nella fonte e richiedono specifico accertamento degli uffici.",
    promoterId: "quinta-commissione-consiliare-lamezia-terme",
    promoter: "V Commissione consiliare di Lamezia Terme",
    promoterType: "consigliere",
    coPromoters: ["Salvatore Vescio (presidente della V Commissione)"],
    periodLabel: "28 settembre 2026",
    year: "2026",
    theme: "Verifica e adeguamento del Regolamento Edilizio Urbanistico",
    threadId: "regolamento-edilizio-urbanistico-verifica-2026",
    threadLabel: "REU comunale: verifica e adeguamento normativo",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient: "Sindaco e Giunta comunale di Lamezia Terme — Ufficio Urbanistica e Sportello Unico dell'Edilizia",
    channel: "altro",
    sourceLabel: "il Lametino — ordine del giorno riferito della V Commissione, 28 settembre 2026",
    sourceUrl: "https://www.lametino.it/ultime/lamezia-verifica-sul-regolamento-edilizio-e-urbanistico-la-v-commissione-chiede-adeguamento-alle-norme-vigenti.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il Lametino del 28 settembre riferisce un ordine del giorno predisposto e sottoposto al Consiglio, ma senza testo protocollato, verbale o numero dell'atto verificati; la pubblicazione non prova adozione né risposta. La fonte richiama l'art. 27 comma 14-bis della L.R. Calabria 19/2002 e DGR 642/2017: senza verifica diretta del testo vigente e della fattispecie concreta non viene registrata una competenza amministrativa né affermata la procedura semplificata applicabile. Le presunte criticità del REU richiedono verifica tecnica e non sono qui accertate. Destinatario documentato e assessment not_assessed. L'intero Comune è ambito di efficacia potenziale, non un punto georeferenziato.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-28",
    lastUpdated: "2026-09-28",
    events: [
      {
        id: "v-commissione-odg-reu-verifica-riferito-2026-09-28",
        date: "2026-09-28",
        type: "emersione",
        title: "Riferita una richiesta consiliare di verifica e adeguamento del REU",
        summary:
          "La V Commissione propone ricognizione tecnica e normativa, eventuale aggiornamento, adeguamento degli allegati e informativa al Consiglio. Nessun deposito istituzionale o recepimento acquisito.",
        sourceLabel: "il Lametino, 28 settembre 2026",
        sourceUrl: "https://www.lametino.it/ultime/lamezia-verifica-sul-regolamento-edilizio-e-urbanistico-la-v-commissione-chiede-adeguamento-alle-norme-vigenti.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
