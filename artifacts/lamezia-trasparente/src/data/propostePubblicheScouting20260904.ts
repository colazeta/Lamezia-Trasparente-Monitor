import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting del 4 settembre 2026: nuove proposte emerse il 3 settembre.
 *
 * I record di acquisizione restano distinti dalla presentazione canonica LT.
 * Le affermazioni dei promotori sullo stato dei lavori o delle risorse non sono
 * trasformate in evidenza amministrativa se non confermate da una fonte idonea.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260904 = [
  {
    id: "palasparti-riapertura-manutenzione-mtl-2026",
    title: "Riapertura del Palasparti, manutenzione esterna e tempi certi",
    summary:
      "Richiesta di MTL Lamezia Terme al sindaco e all'assessore allo Sport di rendere noti tempi e condizioni per la riapertura del Palasparti, specificando eventuali adempimenti, autorizzazioni o collaudi ancora necessari, e di intervenire nel frattempo sull'area esterna con rimozione della vegetazione, pulizia e derattizzazione.",
    promoterId: "mtl-lamezia-terme",
    promoter: "Movimento Territorio e Lavoro (MTL) — Lamezia Terme",
    promoterType: "forza_politica",
    periodLabel: "3 settembre 2026",
    year: "2026",
    theme: "Sport e impianti pubblici",
    threadId: "palasparti-riapertura-manutenzione",
    threadLabel: "Palasparti: riapertura, manutenzione e programmazione",
    territorialArea: "Palazzetto dello Sport Alfio Sparti, Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco e Assessore allo Sport",
    channel: "comunicato",
    sourceLabel: "il Lametino, 3 settembre 2026",
    sourceUrl:
      "https://www.lametino.it/ultime/lamezia-mtl-su-palasparti-chiuso-sport-lametino-fermo-citta-non-puo-piu-aspettare.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La nota di MTL contiene richieste operative determinate: indicazione della data di riapertura, trasparenza su eventuali adempimenti/autorizzazioni/collaudi residui e relativi tempi, pulizia, rimozione della vegetazione e derattizzazione dell'area esterna. L'affermazione secondo cui i lavori interni sarebbero conclusi resta attribuita al promotore. Nello stesso giorno l'assessore comunale allo Sport ha dichiarato alla stampa che il Palasparti è di 'prossima riapertura' dopo lavori sul manto di gioco e sugli spogliatoi: l'informazione è registrata come aggiornamento, non come prova della riapertura né come risposta puntuale alle richieste di MTL. Non sono stati verificati un deposito formale, una data ufficiale di riapertura, un atto sui collaudi o evidenze dell'esecuzione degli interventi esterni. Il destinatario documentato non viene copiato come ente competente: l'assessment resta not_assessed in assenza di una base amministrativa sufficientemente puntuale per l'intero pacchetto di misure.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-03",
    lastUpdated: "2026-09-03",
    events: [
      {
        id: "palasparti-mtl-richiesta-riapertura-manutenzione",
        date: "2026-09-03",
        type: "emersione",
        title: "MTL chiede tempi di riapertura e interventi sull'area esterna",
        summary:
          "MTL chiede al sindaco e all'assessore allo Sport di indicare quando il Palasparti riaprirà, quali eventuali adempimenti, autorizzazioni o collaudi siano ancora necessari e quanto richiederanno; nell'attesa chiede rimozione della vegetazione, pulizia e derattizzazione dell'area esterna.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-mtl-su-palasparti-chiuso-sport-lametino-fermo-citta-non-puo-piu-aspettare.html",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "palasparti-assessore-prossima-riapertura-3-settembre",
        date: "2026-09-03",
        type: "aggiornamento",
        title: "L'assessore allo Sport indica una prossima riapertura del Palasparti",
        summary:
          "Nel bilancio pubblico dell'attività dell'Assessorato allo Sport, Salvatore Pirelli afferma che il Palasparti è di prossima riapertura dopo lavori che hanno riguardato il rifacimento del manto di gioco e degli spogliatoi. La fonte non indica una data, non dettaglia eventuali adempimenti residui e non documenta gli interventi sull'area esterna richiesti da MTL.",
        sourceLabel: "Corriere di Lamezia",
        sourceUrl:
          "https://www.corrieredilamezia.it/attualita/2026_09_03/un-anno-di-sport-a-lamezia-terme-il-bilancio-dellassessore-salvatore-pirelli-tra-nuove-strutture-cantieri-e-grandi-eventi_66166/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "fna-disabilita-gravissima-bando-futuro-nazionale-2026",
    title: "Bando FNA per disabilità gravissima e tempi trasparenti",
    summary:
      "Richiesta del gruppo consiliare Futuro Nazionale di pubblicare immediatamente l'avviso per l'accesso ai fondi FNA destinati alla disabilità gravissima, definire tempi certi e trasparenti per istruttorie ed erogazioni e rendere pubblico lo stato delle risorse e delle tempistiche previste.",
    promoterId: "futuro-nazionale-lamezia",
    promoter: "Gruppo consiliare Futuro Nazionale — Lamezia Terme",
    promoterType: "forza_politica",
    periodLabel: "3 settembre 2026",
    year: "2026",
    theme: "Welfare e disabilità",
    threadId: "fna-disabilita-gravissima-accesso-fondi",
    threadLabel: "FNA e disabilità gravissima: avviso, istruttorie ed erogazioni",
    territorialArea: "Lamezia Terme e Ambito Territoriale Sociale di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco e Amministrazione comunale",
    channel: "comunicato",
    sourceLabel: "il Lametino, 3 settembre 2026",
    sourceUrl:
      "https://www.lametino.it/ultime/futuro-nazionale-lamezia-su-fondi-per-disabilita-gravissima-ancora-nessun-bando-pubblicato-dal-comune.html",
    status: "proposta_emersa",
    linkedActs: [
      "Decreto Regione Calabria n. 11315 del 25/06/2026 — trasferimento FNA annualità 2022 agli Ambiti Territoriali Sociali, area disabili gravissimi",
    ],
    verificationNote:
      "La fonte documenta tre richieste concrete: pubblicazione dell'avviso FNA per disabilità gravissima, tempi certi per istruttorie ed erogazioni e pubblicità sullo stato delle risorse e sulle tempistiche. Il gruppo annuncia al futuro la presentazione di un'interrogazione al sindaco: non viene quindi registrato alcun deposito formale finché non emerga una fonte che ne attesti l'effettiva presentazione. Il Decreto regionale n. 11315 del 25 giugno 2026 documenta il trasferimento delle risorse FNA agli Ambiti Territoriali Sociali per l'area disabili gravissimi; lo scouting non ha invece verificato autonomamente l'affermazione della nota secondo cui le risorse destinate a Lamezia sarebbero già state accreditate nel mese di luglio. Il destinatario resta distinto dalla competenza sostanziale, valutata separatamente nel relativo assessment.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-03",
    lastUpdated: "2026-09-03",
    events: [
      {
        id: "fna-futuro-nazionale-richiesta-bando-3-settembre",
        date: "2026-09-03",
        type: "emersione",
        title: "Futuro Nazionale chiede avviso FNA, tempi certi e trasparenza",
        summary:
          "Il gruppo consiliare chiede la pubblicazione immediata dell'avviso per l'accesso ai fondi FNA destinati alla disabilità gravissima, tempi certi e trasparenti per istruttorie ed erogazioni e informazioni pubbliche sullo stato delle risorse e sulle tempistiche previste.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/futuro-nazionale-lamezia-su-fondi-per-disabilita-gravissima-ancora-nessun-bando-pubblicato-dal-comune.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
