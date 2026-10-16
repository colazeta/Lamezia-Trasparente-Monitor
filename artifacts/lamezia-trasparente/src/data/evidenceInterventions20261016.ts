import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_16 = [
  {
    id: "sacramento-smud-home-electricity-reports-rct",
    title: "Report domestici con confronto tra consumi elettrici di abitazioni simili",
    authority: "Sacramento Municipal Utility District (SMUD), con Positive Energy / Opower",
    territory: "Area di servizio SMUD, Sacramento, California",
    country: "Stati Uniti",
    implementationYear: "Dal 2008; programma e valutazioni 2008–2011",
    problem:
      "Le famiglie conoscono la bolletta ma hanno scarsi riferimenti comparabili per comprendere se i consumi elettrici siano elevati e come ridurli senza investimenti immediati.",
    measure:
      "Invio periodico per posta di Home Electricity Reports: confronto dei consumi domestici con abitazioni simili della zona, cronologia personale e consigli pratici di risparmio. Il pilot è distinto dalle tariffe time-of-use/critical-peak dello SmartPricing Options successivamente sperimentate dalla stessa utility.",
    mechanism:
      "Il confronto con gruppi di riferimento credibili rende saliente il consumo relativo e combina informazione, norme sociali e suggerimenti pratici, favorendo riduzioni di utilizzi non necessari dell'elettricità.",
    population:
      "Clienti domestici del gestore elettrico pubblico locale; la ricerca peer-reviewed studia clienti randomizzati di SMUD e, separatamente, di Puget Sound Energy. Il risultato SMUD non è una stima per edifici municipali.",
    primaryArea: "ambiente_clima_energia",
    secondaryAreas: ["digitalizzazione_servizi_online", "welfare_inclusione_servizi_sociali"],
    interventionTypes: [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "partnership_pubblico_privato_terzo_settore"
    ],
    tools: [
      "dati di consumo delle utenze",
      "gruppi di abitazioni comparabili",
      "report cartacei mensili o trimestrali",
      "consigli pratici per il risparmio",
      "assegnazione casuale per la valutazione"
    ],
    territorialScale: "Area di servizio di utility pubblica locale / utenza domestica",
    interventionStatus:
      "Il trattamento storico è stato effettivamente applicato e valutato nel 2008–2011. Non è stata verificata la permanenza nel 2026 del medesimo formato di report; SMUD continua a operare come utility di proprietà della comunità.",
    evaluationMethod:
      "Esperimento sul campo con assegnazione casuale dei clienti domestici a ricevere periodicamente i report o a non riceverli; confronto dei consumi misurati tra trattamento e controllo. Ayres, Raseman e Shih (2013) analizzano due utility separatamente: SMUD per l'elettricità e PSE per energia elettrica/gas.",
    comparator:
      "Famiglie eleggibili assegnate casualmente al gruppo di controllo, senza report personalizzati di confronto tra consumi.",
    outcomes: [
      "consumo effettivo di elettricità domestica",
      "persistenza dell'effetto durante l'osservazione",
      "differenze di risposta al feedback fra utenze"
    ],
    results:
      "Nell'esperimento SMUD i consumi elettrici dei destinatari sono inferiori di circa il 2,1% rispetto al gruppo randomizzato di controllo, con beneficio riscontrato lungo 12 mesi. Il secondo esperimento sulla distinta utility PSE produce circa l'1,2% di minori consumi per un periodo osservato di sette mesi. Questi sono risultati sui consumi energetici, non misure dirette di CO2, salute o povertà energetica.",
    effectSize:
      "SMUD: circa −2,1% dei consumi elettrici domestici, rispetto ai controlli, con effetto osservato per 12 mesi. PSE (replica separata, non un altro risultato SMUD): circa −1,2% dei consumi di energia, osservati per sette mesi.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Dati di consumo affidabili, criteri di comparabilità fra abitazioni, preparazione e invio dei report, supporto utenti, governo dei dati e valutazione sperimentale. I costi unitari e il rapporto costi-benefici aggiornati per un comune italiano non sono stabiliti dalle fonti analizzate.",
    limitations: [
      "Le riduzioni osservate si riferiscono ai clienti della utility in uno specifico contesto tariffario e climatico statunitense; non sono un effetto trasferibile automaticamente agli edifici pubblici o alle famiglie italiane.",
      "L'assegnazione casuale identifica l'effetto del pacchetto informativo, non separa confronto sociale, frequenza delle lettere e consigli pratici.",
      "La persistenza dimostrata nello studio riguarda circa 12 mesi per SMUD: non prova risparmi indefiniti o addizionali anno dopo anno.",
      "Non sono direttamente misurati emissioni di gas serra, benessere, condizioni di salute o effetti redistributivi.",
      "Confronti personalizzati richiedono minimizzazione dei dati, tutela della riservatezza e accuratezza nella scelta dei gruppi di riferimento."
    ],
    unintendedEffects:
      "Possibili effetti di normalizzazione al rialzo per utenze già efficienti, pressione sociale percepita o disaffezione verso messaggi ripetitivi: la valutazione di un adattamento deve monitorare tali esiti, rinunce e reclami; non sono quantificati come danni dimostrati da questo RCT.",
    primarySource: {
      label: "SMUD — valutazione commissionata del programma Home Electricity Report 2008–2011 (Integral Analytics, 2012)",
      url: "https://www.oracle.com/us/industries/utilities/smud-home-energy-rpt-program-3631971.pdf"
    },
    evaluationStudies: [
      {
        label: "Journal of Law, Economics, and Organization — studio peer-reviewed",
        url: "https://doi.org/10.1093/jleo/ews020",
        citation: "Ayres I, Raseman S, Shih A (2013), Evidence from Two Large Field Experiments that Peer Comparison Feedback Can Reduce Residential Energy Usage",
        doi: "10.1093/jleo/ews020"
      },
      {
        label: "NBER Working Paper 15386",
        url: "https://www.nber.org/papers/w15386",
        citation: "Ayres I, Raseman S, Shih A (2009), Evidence from Two Large Field Experiments that Peer Comparison Feedback Can Reduce Residential Energy Usage",
        doi: "10.3386/w15386"
      }
    ],
    lastVerifiedAt: "2026-10-16",
    transferabilityItaly:
      "Media-alta come protocollo informativo e di valutazione, non come esercizio di competenza tariffaria comunale. La condivisione di dati nominativi di consumo richiede un attore energetico autorizzato e una base giuridica appropriata; andrebbe distinta da iniziative comunali sugli edifici propri.",
    lameziaAdaptation:
      "Valutare con un operatore energetico o una comunità energetica ammissibile un pilot volontario: report che confrontino i consumi normalizzati di famiglie realmente comparabili, con gruppo di controllo randomizzato, opzione di rinuncia, informativa trasparente e dati personali non accessibili al Comune. Misurare kWh risparmiati, costi per kWh evitato, reclami ed eterogeneità per tipologia abitativa. Separatamente si possono rendere pubblici i consumi aggregati degli edifici comunali, senza attribuire loro l'effetto RCT residenziale.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "accordo con gestore energetico e verifica della base giuridica",
      "serie storiche di consumo per utenza presso il titolare autorizzato",
      "normalizzazione per metratura, clima e tipo di edificio",
      "sistema di comunicazione e opt-out",
      "piano di randomizzazione e verifica di addizionalità",
      "metrica di costo per kWh evitato"
    ],
    tags: [
      "Sacramento",
      "SMUD",
      "home energy reports",
      "confronto sociale",
      "RCT",
      "risparmio elettrico",
      "utility municipale",
      "nudging",
      "Opower"
    ],
    revisionHistory: [
      {
        date: "2026-10-16",
        note: "Prima verifica su esperimento SMUD e studio peer-reviewed; preservata la distinzione dal precedente record SmartPricing Options e fra risultati SMUD/PSE."
      }
    ]
  }
] as const satisfies readonly EvidenceIntervention[];
