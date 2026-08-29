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
] as const satisfies readonly PublicProposal[];
