import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_05_SPECIAL = [
  {
    id: "baoshan-weekly-property-tax-reminders-rct",
    title: "Solleciti SMS ricorrenti per aumentare il pagamento di imposte immobiliari arretrate",
    authority: "Baoshan Tax Administration / State Taxation Administration, Shanghai",
    territory: "Distretto di Baoshan, Shanghai",
    country: "Cina",
    implementationYear: "2019",
    problem:
      "Una quota di contribuenti immobiliari manteneva imposte scadute per molti mesi nonostante gli ordinari avvisi, con conseguente ritardo di gettito e costi di riscossione.",
    measure:
      "Invio di SMS a contribuenti con imposta immobiliare arretrata, randomizzando non solo la presenza del sollecito ma soprattutto la frequenza: un solo SMS, un SMS a settimana per quattro settimane oppure due SMS a settimana per quattro settimane.",
    mechanism:
      "Rendere ripetutamente salienti importo dovuto, sanzioni/conseguenze reali e modalità di pagamento può ridurre dimenticanza e procrastinazione; una frequenza eccessiva può però generare assuefazione e rendimenti marginali decrescenti.",
    population:
      "1.742 contribuenti del distretto di Baoshan che non avevano pagato l'imposta immobiliare 2018 entro il 17 settembre 2019, circa nove mesi dopo la scadenza.",
    primaryArea: "fiscalita_entrate_riscossione",
    secondaryAreas: ["digitalizzazione_servizi_online", "capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza", "targeting_data_analytics"],
    tools: ["SMS", "anagrafica tributaria", "scadenziario dei solleciti", "monitoraggio dei pagamenti"],
    territorialScale: "Distretto / singolo contribuente",
    interventionStatus:
      "Randomized controlled trial realizzato in collaborazione con l'amministrazione tributaria di Baoshan tra settembre e novembre 2019.",
    evaluationMethod:
      "Randomized controlled trial a quattro bracci su 1.742 contribuenti morosi: controllo senza il sollecito sperimentale, un solo SMS, un SMS settimanale per quattro settimane e due SMS settimanali per quattro settimane; outcome osservato sui pagamenti amministrativi fino al 18 novembre 2019.",
    comparator: "Contribuenti morosi che non ricevevano i solleciti SMS sperimentali nello stesso periodo.",
    outcomes: ["probabilità di pagamento dell'arretrato", "rapidità della risposta al sollecito", "rendimento marginale della frequenza", "gettito recuperato"],
    results:
      "I solleciti ricorrenti hanno aumentato fortemente la probabilità di pagamento rispetto al controllo e a un singolo promemoria. Il passaggio da una a due comunicazioni settimanali non ha prodotto un incremento statisticamente significativo comparabile, indicando rendimenti decrescenti oltre una frequenza moderata. I contribuenti con precedenti ritardi risultavano inoltre meno sensibili ai nudges.",
    effectSize:
      "Rispetto al controllo: +7,6 punti percentuali con un solo SMS, circa +12,4 p.p. con un SMS a settimana e circa +14,4 p.p. con due SMS a settimana. Il trattamento settimanale supera il singolo reminder di circa 5 p.p.; il vantaggio di due SMS settimanali rispetto a uno è circa 2 p.p. e non statisticamente significativo.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Intervento a bassissimo costo marginale se esistono numeri di telefono aggiornati e un sistema di messaggistica: nello studio un SMS costava 0,4 RMB. Servono regole di contatto, log degli invii, contenuti legalmente corretti e collegamento affidabile tra messaggio e stato del debito.",
    limitations: [
      "Il trial riguarda contribuenti già in arretrato in un distretto cinese e non stima l'effetto su contribuenti ordinariamente puntuali o su tributi con diversa struttura normativa.",
      "Il messaggio includeva informazioni specifiche su sanzioni e limitazioni alla commerciabilità dell'immobile: tali elementi non sono trasferibili senza una base giuridica equivalente.",
      "Il follow-up è breve e misura soprattutto il recupero immediato; non dimostra persistenza della compliance negli anni successivi.",
      "L'effetto è più debole tra contribuenti con una storia di ritardi, quindi il nudge non sostituisce strategie differenziate di riscossione.",
    ],
    unintendedEffects:
      "Una frequenza eccessiva può produrre assuefazione, irritazione o percezione di pressione indebita. Il risultato stesso suggerisce di non massimizzare automaticamente il numero di solleciti e di prevedere stop rules dopo il pagamento.",
    primarySource: {
      label: "State Taxation Administration, Shanghai — Baoshan District Tax Bureau",
      url: "https://shanghai.chinatax.gov.cn/bstax/",
    },
    evaluationStudies: [
      {
        label: "Journal of Economic Behavior & Organization",
        url: "https://doi.org/10.1016/j.jebo.2021.09.023",
        citation: "Antinyan A et al. (2021), Does the frequency of reminders matter for their effectiveness? A randomized controlled trial",
        doi: "10.1016/j.jebo.2021.09.023",
      },
    ],
    lastVerifiedAt: "2026-09-05",
    transferabilityItaly:
      "Alta per il principio di ottimizzare frequenza e timing dei solleciti su entrate locali, ma non per il contenuto coercitivo del messaggio. In Italia occorrono base giuridica, correttezza dell'anagrafica, regole privacy/comunicazioni e coordinamento con il concessionario o l'ufficio tributi competente.",
    lameziaAdaptation:
      "Su un tributo o entrata comunale con arretrati e recapiti affidabili, costruire un trial semplice tra comunicazione ordinaria, un reminder aggiuntivo e reminder settimanale per un periodo breve. Predefinire pagamento entro 30/60 giorni come outcome, interrompere gli SMS appena il debito risulta estinto e misurare costo per euro recuperato e reclami.",
    implementability: "quick_win",
    capacityDataNeeds: ["anagrafica debitori aggiornata", "recapiti telefonici con base giuridica", "stato del debito quasi real-time", "gateway SMS", "protocollo di randomizzazione", "monitoraggio pagamenti e reclami"],
    tags: ["tributi", "riscossione", "SMS", "reminder", "RCT", "Baoshan", "tax compliance"],
    revisionHistory: [{ date: "2026-09-05", note: "Inserimento straordinario da scouting Parallel Search; verificati disegno RCT, frequenza dei trattamenti, effect size e rendimenti decrescenti." }],
  },
  {
    id: "lambeth-simplified-council-tax-bill-rct",
    title: "Bolletta del tributo locale semplificata per aumentare i pagamenti puntuali",
    authority: "London Borough of Lambeth",
    territory: "Lambeth, Londra",
    country: "Regno Unito",
    implementationYear: "2014-2015",
    problem:
      "Una bolletta del Council Tax densa e poco saliente poteva rendere meno chiari importo, scadenza e azione richiesta, aumentando ritardi di pagamento e successivi costi di recupero.",
    measure:
      "Ridisegno della bolletta cartacea per mettere in evidenza le informazioni essenziali e l'azione richiesta. Il trial testava separatamente e congiuntamente semplificazione e una norma sociale descrittiva sul pagamento del tributo.",
    mechanism:
      "Ridurre il carico cognitivo e rendere immediatamente visibili scadenza e istruzioni dovrebbe diminuire errori, procrastinazione e mancata azione. La componente di norma sociale avrebbe dovuto aggiungere pressione conformativa, ma non ha mostrato benefici affidabili.",
    population:
      "7.951 titolari di account Council Tax non iscritti a pagamenti automatici in tre wards di Lambeth nel primo trial; un secondo trial sulla norma sociale ha coinvolto oltre 56.000 residenti.",
    primaryArea: "fiscalita_entrate_riscossione",
    secondaryAreas: ["digitalizzazione_servizi_online", "capacita_amministrativa_personale"],
    interventionTypes: ["nudging_comunicazione", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: ["redesign della bolletta", "gerarchia visiva dell'informazione", "randomizzazione", "dati amministrativi di pagamento"],
    territorialScale: "Borough / nucleo contribuente",
    interventionStatus:
      "Trial concluso; dopo il risultato positivo Lambeth ha ridisegnato la bolletta standard incorporando il trattamento di semplificazione.",
    evaluationMethod:
      "Randomized controlled trial fattoriale: 7.951 account assegnati casualmente a bolletta ordinaria, semplificazione, norma sociale oppure semplificazione + norma sociale; pagamento osservato una settimana dopo la prima scadenza. Un secondo RCT cittadino ha testato separatamente la norma sociale su oltre 56.000 residenti.",
    comparator: "Contribuenti che ricevevano la bolletta standard del Council Tax senza le modifiche sperimentali.",
    outcomes: ["pagamento puntuale del Council Tax", "effetto della semplificazione", "effetto della norma sociale", "costi di recupero evitabili"],
    results:
      "Nel primo trial la semplificazione ha aumentato significativamente i pagamenti, mentre la norma sociale non ha aggiunto un effetto positivo. Nel secondo trial la norma sociale ha addirittura ridotto il tasso di pagamento. Il caso mostra quindi sia un intervento efficace sia un'importante evidenza negativa contro l'uso automatico di messaggi conformativi.",
    effectSize:
      "Il paper peer-reviewed stima circa +4 punti percentuali di pagamenti con la semplificazione rispetto al controllo. La documentazione locale descrive lo stesso risultato come circa +9% in termini relativi. La norma sociale è nulla nel primo trial e negativa nel secondo.",
    evidenceStrength: "molto_forte",
    costsRequirements:
      "Costo marginale basso quando la comunicazione è già prodotta periodicamente: richiede redesign, test di leggibilità, dati di pagamento e capacità di sperimentazione. Lambeth stimava che un solo punto percentuale aggiuntivo di riscossione valesse oltre £1 milione di entrate e riducesse costi di debt recovery.",
    limitations: [
      "Il primo trial escludeva utenti con pagamento automatico e si concentrava su tre wards: l'effetto riguarda quindi una popolazione per cui la scelta/azione manuale era ancora necessaria.",
      "Il Council Tax britannico differisce dai tributi comunali italiani per base imponibile, riscossione e comunicazioni; è trasferibile il design informativo, non il testo della bolletta.",
      "La documentazione locale riporta un incremento relativo di circa 9%, mentre il paper peer-reviewed esprime l'effetto come circa +4 punti percentuali: le due metriche non devono essere confuse.",
      "La norma sociale ha prodotto un backfire nel secondo esperimento, quindi la sua efficacia non va inferita dal successo della semplificazione.",
    ],
    unintendedEffects:
      "La norma sociale descrittiva ha ridotto i pagamenti nel secondo trial. Un adattamento dovrebbe quindi separare il redesign di chiarezza da qualunque messaggio normativo e testare quest'ultimo solo sperimentalmente, con stop rule se l'effetto è nullo o avverso.",
    primarySource: {
      label: "Local Government Association — Increasing council tax collection rates in Lambeth",
      url: "https://www.local.gov.uk/our-support/behavioural-insights/behavioural-insights-resources-and-best-practice",
    },
    evaluationStudies: [
      {
        label: "Journal of Behavioral Public Administration",
        url: "https://doi.org/10.30636/jbpa.11.10",
        citation: "John P, Blume T (2018), How best to nudge taxpayers? The impact of message simplification and descriptive social norms on payment rates in a central London local authority",
        doi: "10.30636/jbpa.11.10",
      },
      {
        label: "LARIA — Lambeth Research Impact Award case study",
        url: "https://www.laria.org.uk/2015/04/02/award-winner-2015-london-borough-of-lambeth/",
        citation: "London Borough of Lambeth (2015), Using Randomised Controlled Trials to Improve Public Service Outcomes",
      },
    ],
    lastVerifiedAt: "2026-09-05",
    transferabilityItaly:
      "Molto alta per il principio di semplificazione delle comunicazioni su entrate locali: non richiede nuovi poteri tributari e può essere testato su avvisi, bollette e solleciti già previsti. La norma sociale, invece, non va trasferita senza un nuovo test locale.",
    lameziaAdaptation:
      "Selezionare una comunicazione tributaria ad alto volume e ridisegnarla con gerarchia visiva chiara: importo, scadenza, come pagare, cosa fare in caso di errore o difficoltà. Randomizzare la versione semplificata rispetto al template corrente e misurare pagamento entro scadenza, contatti all'ufficio, errori e costi di recupero. Non includere inizialmente messaggi di norma sociale.",
    implementability: "quick_win",
    capacityDataNeeds: ["template attuale delle comunicazioni", "dati amministrativi sui pagamenti", "strumento di randomizzazione", "metriche su contatti/reclami", "revisione legale e di accessibilità"],
    tags: ["Council Tax", "riscossione", "semplificazione", "bolletta", "RCT", "Lambeth", "behavioural insights"],
    revisionHistory: [{ date: "2026-09-05", note: "Inserimento straordinario da scouting Parallel Search; separato l'effetto positivo della semplificazione dal backfire della norma sociale." }],
  },
] as const satisfies readonly EvidenceIntervention[];
