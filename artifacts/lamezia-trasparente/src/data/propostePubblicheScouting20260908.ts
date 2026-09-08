import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting dell'8 settembre 2026: proposte concrete emerse il 7 settembre.
 *
 * I record di acquisizione restano distinti dalla presentazione canonica LT.
 * La deduplicazione usa promotore normalizzato, oggetto e filone: per Oscar
 * Branca la reiterazione del 2026 viene ricostruita nella stessa timeline della
 * richiesta già pubblica del 2019 sul medesimo parco, invece di creare record
 * separati per il ruolo politico ricoperto nel tempo.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260908 = [
  {
    id: "emodinamica-h24-reclutamento-muraca-2026",
    title: "Reclutamento specialisti, H24 e rete SCA per la Cardiologia Interventistica",
    summary:
      "Fabrizio Muraca, consigliere comunale del PD, chiede al Presidente della Regione e Commissario ad acta di promuovere tramite Azienda Zero procedure straordinarie e mirate di reclutamento di cardiologi ed emodinamisti, così da rafforzare strutturalmente l'organico, garantire l'operatività H24 della Cardiologia Interventistica del Giovanni Paolo II e consentire il pieno inserimento del presidio nella rete tempo-dipendente della Sindrome Coronarica Acuta.",
    promoterId: "fabrizio-muraca",
    promoter: "Fabrizio Muraca",
    promoterType: "consigliere",
    periodLabel: "7 settembre 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "ospedale-emodinamica-h24",
    threadLabel: "Ospedale Giovanni Paolo II: emodinamica H24 e rete cardiologica",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient:
      "Regione Calabria — Presidente e Commissario ad acta; Azienda Zero",
    channel: "comunicato",
    sourceLabel: "LameziaTerme.it, 7 settembre 2026",
    sourceUrl:
      "https://www.lameziaterme.it/sanita-lamezia-muraca-pd-bene-avvio-della-cardiologia-interventistica/",
    status: "proposta_emersa",
    linkedActs: ["DGR Calabria n. 400/2026"],
    verificationNote:
      "La nota è firmata da Fabrizio Muraca quale consigliere comunale PD e contiene tre misure operative collegate: reclutamento mirato di cardiologi ed emodinamisti tramite Azienda Zero, copertura continuativa H24 della Cardiologia Interventistica e pieno inserimento del presidio nella rete SCA. Il promotore è normalizzato sulla persona e la proposta resta distinta da quella della Commissione Sanità PD del 5 settembre perché il criterio di deduplicazione considera anche il promotore; entrambe confluiscono però nello stesso thread tecnico sull'emodinamica H24. L'operatività della sala e le prime procedure, richiamate dalla fonte come contesto già realizzato prima della richiesta, non costituiscono attuazione del reclutamento, della copertura H24 o dell'inserimento nella rete SCA. La fonte regionale ufficiale del 13 agosto documenta che l'aggiornamento della rete SCA e il modello organizzativo dell'emodinamica coinvolgono Regione, Dipartimento Salute e Azienda Zero; non viene invece attribuita automaticamente ad Azienda Zero la competenza completa sull'intero pacchetto di misure sulla sola base del destinatario.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-07",
    lastUpdated: "2026-09-07",
    events: [
      {
        id: "emodinamica-muraca-reclutamento-h24-sca-7-settembre",
        date: "2026-09-07",
        type: "emersione",
        title: "Muraca chiede reclutamento mirato, H24 e pieno inserimento nella rete SCA",
        summary:
          "Fabrizio Muraca chiede al Presidente della Regione e Commissario ad acta di attivare, tramite Azienda Zero, procedure mirate di reclutamento di cardiologi ed emodinamisti, rafforzare l'organico per una copertura H24 e completare l'inserimento del Giovanni Paolo II nella rete SCA.",
        sourceLabel: "LameziaTerme.it — comunicato di Fabrizio Muraca",
        sourceUrl:
          "https://www.lameziaterme.it/sanita-lamezia-muraca-pd-bene-avvio-della-cardiologia-interventistica/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "parco-via-degli-itali-manutenzione-branca-2026",
    title: "Manutenzione e sicurezza del parco di via degli Itali",
    summary:
      "Oscar Branca chiede al Comune interventi di manutenzione e messa in sicurezza del parco di via degli Itali a Capizzaglie. La timeline ricostruisce, senza duplicazione, una precedente richiesta dello stesso promotore sul medesimo parco del 2019 e la reiterazione del 7 settembre 2026, oggi estesa a giochi, cestini e verde.",
    promoterId: "oscar-branca",
    promoter: "Oscar Branca",
    promoterType: "consigliere",
    periodLabel: "22 marzo 2019–7 settembre 2026",
    year: "2026",
    theme: "Decoro urbano e manutenzione",
    threadId: "parco-via-degli-itali-manutenzione-sicurezza",
    threadLabel: "Parco di via degli Itali: manutenzione e sicurezza",
    territorialArea: "Parco giochi di via degli Itali, quartiere Capizzaglie",
    institutionalRecipient:
      "Comune di Lamezia Terme — Amministrazione comunale e settore Patrimonio",
    channel: "comunicato",
    sourceLabel: "il Lametino, 7 settembre 2026",
    sourceUrl:
      "https://www.lametino.it/ultime/lamezia-branca-denuncia-degrado-nel-parco-di-via-degli-itali-giochi-rotti-e-verde-abbandonato.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il promotore è normalizzato sulla persona Oscar Branca, indipendentemente dal ruolo politico indicato nelle diverse fonti: nel 2019 interveniva come referente Lega Lamezia Sud, nel 2026 come consigliere comunale. Le due iniziative riguardano lo stesso parco e lo stesso filone manutenzione/sicurezza e vengono quindi mantenute in un'unica timeline. Il 22 marzo 2019 Branca chiedeva un intervento urgente per ripristinare l'illuminazione del parco; il 7 settembre 2026 chiede di mettere in sicurezza i giochi, sostituire i cestini danneggiati e curare il verde. La fonte del 2026 riferisce che il consigliere avrebbe già inoltrato più segnalazioni, anche formalmente, all'Amministrazione e al dirigente del settore Patrimonio, ma non fornisce numero di protocollo, atto o copia del deposito: il record resta quindi proposta emersa e non viene trasformato in presentazione formale. Le evidenze social reperite su lavori nel 2024 non sono usate come prova amministrativa di attuazione dell'intero pacchetto, perché non è stata reperita una fonte ufficiale che ne documenti portata e nesso con le richieste censite. La competenza sostanziale resta non valutata; il destinatario documentato non viene copiato come ente competente.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2019-03-22",
    lastUpdated: "2026-09-07",
    events: [
      {
        id: "parco-via-degli-itali-branca-illuminazione-22-marzo-2019",
        date: "2019-03-22",
        type: "emersione",
        title: "Branca chiede il ripristino urgente dell'illuminazione del parco",
        summary:
          "Oscar Branca chiede al Comune un intervento urgente di manutenzione per ripristinare l'illuminazione delle aree pavimentate e verdi del parco di via degli Itali, richiamando esigenze di fruibilità e sicurezza.",
        sourceLabel: "il Lametino, 22 marzo 2019",
        sourceUrl:
          "https://www.lametino.it/Ultime/branca-lega-lamezia-sud-scarsa-manutenzione-del-parco-giochi-via-degli-itali-luci-spente-e-bimbi-lasciati-al-buio.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "parco-via-degli-itali-branca-giochi-cestini-verde-7-settembre-2026",
        date: "2026-09-07",
        type: "aggiornamento",
        title: "Branca rinnova e amplia la richiesta di manutenzione del parco",
        summary:
          "Branca chiede all'Amministrazione comunale un intervento immediato per mettere in sicurezza i giochi, sostituire i cestini danneggiati, effettuare la manutenzione del verde e ripristinare condizioni di decoro nel parco. La reiterazione aggiorna la medesima proposta per promotore, luogo e filone.",
        sourceLabel: "il Lametino, 7 settembre 2026",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-branca-denuncia-degrado-nel-parco-di-via-degli-itali-giochi-rotti-e-verde-abbandonato.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
