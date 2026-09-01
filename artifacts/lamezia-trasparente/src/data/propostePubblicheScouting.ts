import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Record aggiuntivi verificati durante lo scouting successivo al consolidamento
 * del dataset principale. Il modulo pubblico li unisce al core in modo trasparente.
 * Le proposte con oggetto coincidente ma promotore diverso restano record distinti,
 * condividendo lo stesso thread tematico.
 */
export const SCOUTED_PUBLIC_PROPOSALS = [
  {
    id: "emodinamica-h24-vescio-2026",
    title: "Emodinamica H24 e personale stabile al Giovanni Paolo II",
    summary:
      "Richiesta di attivare a Lamezia un servizio di emodinamica H24 capace di gestire anche le emergenze cardiologiche, superando il modello H6/H12 con équipe itineranti e rafforzando il presidio con personale stabile; viene chiesta inoltre trasparenza sui dati e sui criteri utilizzati nella programmazione regionale.",
    promoterId: "lidia-vescio",
    promoter: "Lidia Vescio (PD)",
    promoterType: "consigliere",
    periodLabel: "14 agosto 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "ospedale-emodinamica-h24",
    threadLabel: "Ospedale Giovanni Paolo II: emodinamica H24 e rete cardiologica",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient: "Regione Calabria — Presidente e programmazione sanitaria regionale",
    channel: "comunicato",
    sourceLabel: "Corriere di Lamezia, 14 agosto 2026",
    sourceUrl:
      "https://www.corrieredilamezia.it/politica/2026_08_14/emodinamica-vescio-presidente-occhiuto-e-centrodestra-qual-e-la-vostra-visione-per-lospedale-di-lamezia-terme_65701/",
    status: "proposta_emersa",
    linkedActs: ["DGR Calabria n. 400/2026"],
    verificationNote:
      "La nota della consigliera formula richieste operative sufficientemente determinate: emodinamica H24 anche per le emergenze, personale stabile e pubblicazione dei dati e criteri alla base della scelta H6/H12. Non è stato verificato, per questa specifica iniziativa del 14 agosto, un deposito consiliare o regionale; resta quindi distinta dalla successiva mozione regionale di Elisa Scutellà pur condividendone il filone.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-14",
    lastUpdated: "2026-08-14",
    events: [
      {
        id: "emodinamica-vescio-richiesta-h24",
        date: "2026-08-14",
        type: "emersione",
        title: "Vescio chiede emodinamica H24, personale stabile e trasparenza sui criteri",
        summary:
          "La consigliera sostiene la necessità di un servizio H24 al Giovanni Paolo II, contesta l'adeguatezza di un modello basato su équipe itineranti e chiede che la Regione renda pubblici dati e criteri utilizzati per definire la rete cardiologica.",
        sourceLabel: "Corriere di Lamezia",
        sourceUrl:
          "https://www.corrieredilamezia.it/politica/2026_08_14/emodinamica-vescio-presidente-occhiuto-e-centrodestra-qual-e-la-vostra-visione-per-lospedale-di-lamezia-terme_65701/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "emodinamica-h24-nucifero-2026",
    title: "Emodinamica strutturale H24 e investimenti per il Giovanni Paolo II",
    summary:
      "Richiesta di istituire un servizio di emodinamica strutturale H24 al Giovanni Paolo II, escludendo una soluzione itinerante, e di accompagnarlo con maggiori investimenti in personale, infrastrutture, diagnostica e pronto soccorso.",
    promoterId: "fernando-nucifero-udc",
    promoter: "Fernando Nucifero (UDC)",
    promoterType: "forza_politica",
    periodLabel: "19 agosto 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "ospedale-emodinamica-h24",
    threadLabel: "Ospedale Giovanni Paolo II: emodinamica H24 e rete cardiologica",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient: "Regione Calabria",
    channel: "comunicato",
    sourceLabel: "Corriere di Lamezia, 19 agosto 2026",
    sourceUrl:
      "https://www.corrieredilamezia.it/politica/2026_08_19/nucifero-la-salute-non-ha-colori-politici-lamezia-merita-unemodinamica-h24-e-investimenti-reali-sullospedale-giovanni-paolo-ii_65831/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La nota del dirigente UDC contiene misure concrete — emodinamica strutturale H24, rifiuto del modello itinerante e investimenti su personale e dotazioni — ma non documenta un atto formalmente depositato. Il record resta distinto dalle iniziative di Lidia Vescio ed Elisa Scutellà perché il criterio di deduplicazione considera anche il promotore; i tre record condividono invece lo stesso filone tematico.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-19",
    lastUpdated: "2026-08-19",
    events: [
      {
        id: "emodinamica-nucifero-richiesta-h24",
        date: "2026-08-19",
        type: "emersione",
        title: "Nucifero chiede emodinamica strutturale H24 e maggiori investimenti",
        summary:
          "Nucifero chiede un servizio H24 non itinerante e un rafforzamento complessivo del presidio attraverso personale, infrastrutture, diagnostica e pronto soccorso.",
        sourceLabel: "Corriere di Lamezia",
        sourceUrl:
          "https://www.corrieredilamezia.it/politica/2026_08_19/nucifero-la-salute-non-ha-colori-politici-lamezia-merita-unemodinamica-h24-e-investimenti-reali-sullospedale-giovanni-paolo-ii_65831/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "scuole-orario-ridotto-caldo-settembre-2026",
    title: "Orario scolastico ridotto a settembre per il caldo",
    summary:
      "Richiesta di predisporre per l'intero mese di settembre un orario ridotto in tutte le scuole cittadine di ogni ordine e grado, come misura temporanea contro le elevate temperature negli edifici privi di adeguata climatizzazione o ventilazione.",
    promoterId: "fernando-nucifero-udc",
    promoter: "Fernando Nucifero (UDC)",
    promoterType: "forza_politica",
    periodLabel: "31 agosto 2026",
    year: "2026",
    theme: "Scuola, clima e sicurezza",
    threadId: "scuole-caldo-estremo",
    threadLabel: "Scuole: caldo estremo, orari e adeguamento degli edifici",
    territorialArea: "Istituti scolastici del territorio comunale di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme e dirigenti scolastici",
    channel: "comunicato",
    sourceLabel: "City One, 31 agosto 2026",
    sourceUrl:
      "https://www.cityonelamezia.it/emergenza-caldo-nucifero-udc-propone-orario-ridotto-per-tutte-le-scuole-cittadine-per-il-mese-di-settembre/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La fonte attribuisce a Nucifero una misura circoscritta e operativa: riduzione dell'orario per tutte le scuole cittadine durante settembre. Non è stato verificato un atto formalmente depositato, un provvedimento comunale o una decisione dei dirigenti scolastici. Il record documenta la proposta e non assume che il Comune disponga da solo di tutte le competenze necessarie alla sua attuazione.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-31",
    lastUpdated: "2026-08-31",
    events: [
      {
        id: "scuole-nucifero-orario-ridotto-settembre",
        date: "2026-08-31",
        type: "emersione",
        title: "Nucifero propone un orario ridotto per le scuole durante settembre",
        summary:
          "La proposta chiede una rimodulazione temporanea del monte ore giornaliero per tutte le scuole cittadine, motivandola con le temperature elevate e con l'assenza, in diversi edifici, di sistemi adeguati di climatizzazione o ventilazione.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/emergenza-caldo-nucifero-udc-propone-orario-ridotto-per-tutte-le-scuole-cittadine-per-il-mese-di-settembre/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "tutela-animali-regolamento-garante-sportello-2026",
    title: "Aggiornamento del regolamento e strumenti comunali per la tutela degli animali",
    summary:
      "Pacchetto di richieste per aggiornare e condividere il regolamento comunale sui diritti degli animali alla normativa regionale, promuovere attività didattico-culturali, attivare uno sportello di ascolto, nominare un garante per i diritti degli animali e formalizzare una rete di contatti per le emergenze.",
    promoterId: "ninfa-marilena-vescio",
    promoter: "Ninfa Marilena Vescio",
    promoterType: "cittadino_comitato",
    periodLabel: "31 agosto 2026",
    year: "2026",
    theme: "Tutela animale e servizi civici",
    threadId: "tutela-animali-servizi-comunali",
    threadLabel: "Tutela degli animali: regole, servizi e partecipazione",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "il Lametino, 31 agosto 2026",
    sourceUrl:
      "https://www.lametino.it/ultimora/lamezia-al-via-la-raccolta-di-cibo-per-le-colonie-feline-della-citta.html",
    status: "proposta_emersa",
    linkedActs: [
      "Regolamento comunale per la tutela e il benessere degli animali — Delibera n. 7 del 15/03/2016",
      "Legge regionale Calabria n. 45/2023",
    ],
    verificationNote:
      "La nota è pubblicata in occasione di una raccolta alimentare per le colonie feline, ma contiene anche richieste di policy comunale sufficientemente determinate. La promotrice è indicata dalla fonte come referente di colonia felina. Non risultano verificati un deposito formale, una risposta del Comune o l'avvio degli strumenti richiesti. Il luogo della raccolta alimentare non viene usato come geografia della proposta, che riguarda l'intero territorio comunale.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-31",
    lastUpdated: "2026-08-31",
    events: [
      {
        id: "tutela-animali-vescio-regolamento-garante-sportello",
        date: "2026-08-31",
        type: "emersione",
        title: "Proposti aggiornamento del regolamento, garante, sportello e rete di emergenza",
        summary:
          "Vescio chiede di aggiornare il regolamento comunale alla normativa regionale, sviluppare iniziative educative, attivare uno sportello di ascolto, nominare un garante per i diritti degli animali e rendere ufficiale una rete di contatti utili per le emergenze.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultimora/lamezia-al-via-la-raccolta-di-cibo-per-le-colonie-feline-della-citta.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
