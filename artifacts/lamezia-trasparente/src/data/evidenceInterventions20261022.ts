import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_22 = [
  {
    "id": "act-canberra-overdue-traffic-parking-fines-letters-rct",
    "title": "Lettere mirate per recuperare contravvenzioni stradali e di sosta arretrate",
    "authority": "Australian Capital Territory Government — Chief Minister, Treasury and Economic Development Directorate / Access Canberra",
    "territory": "Canberra e Australian Capital Territory, con parte dei destinatari residenti nel New South Wales",
    "country": "Australia",
    "implementationYear": "Novembre–dicembre 2017 (sperimentazione); articolo 2023",
    "problem": "Le sanzioni stradali e di sosta possono restare insolute anche dopo il primo sollecito, con oneri amministrativi e rischi di ulteriori costi per gli utenti.",
    "measure": "RCT su sanzioni insolute da 6 mesi a 5 anni. Una lettera aggiuntiva sottolineava che il debito non scompare e che occorre agire; una seconda versione richiamava la norma sociale di pagamento. Il controllo non riceveva ulteriori comunicazioni dopo il sollecito ordinario.",
    "mechanism": "Ridurre inerzia e incertezza informativa rendendo salienti obblighi preesistenti, conseguenze legittime e modalità di regolarizzazione, senza modificare l'entità delle sanzioni.",
    "population": "10.404 posizioni (campione analitico): 875 lettere enforcement, 895 norme sociali e 8.634 controlli; adulti 18–65 anni in ACT o New South Wales con una sola sanzione arretrata da più di 6 mesi e meno di 5 anni.",
    "primaryArea": "fiscalita_entrate_riscossione",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "mobilita_spazio_pubblico"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "lettere cartacee differenziate",
      "randomizzazione stratificata",
      "anagrafe amministrativa di pagamenti",
      "follow-up a sei settimane"
    ],
    "territorialScale": "Governo territoriale ACT con funzioni amministrative urbane e sovralocali",
    "interventionStatus": "Esperimento completato nel 2017; non è provato che le medesime lettere siano state adottate permanentemente.",
    "evaluationMethod": "Randomized controlled field experiment: 10.702 casi inizialmente randomizzati e 10.404 finali; regressioni sugli incassi amministrativi a circa sei settimane, con e senza covariate; pubblicazione peer-reviewed 2023.",
    "comparator": "Nessuna nuova lettera dopo il reminder ordinario, che era già stato trasmesso secondo la procedura ACT.",
    "outcomes": [
      "pagamento integrale",
      "pagamento parziale o integrale",
      "importo medio incassato",
      "eterogeneità per caratteristiche del debito e dell'utente"
    ],
    "results": "La comunicazione enforcement aumenta significativamente il pagamento almeno parziale (+3,2 punti percentuali) e il riscosso medio (+5,12 AUD/posizione); la comunicazione sulle norme sociali produce +1,9 punti e +3,35 AUD. Il campione è costituito da morosi persistenti; il controllo paga molto raramente. Nessun outcome su nuove infrazioni o sicurezza stradale.",
    "effectSize": "Tabella 4 con covariate: enforcement +0,032 (SE 0,006) pagamento parziale/integrale, +0,023 (SE 0,006) integrale, +5,117 AUD (SE 1,263) incassi; norme sociali +0,019 (SE 0,005), +0,016 (SE 0,005) integrale, +3,352 AUD (SE 1,165) incassi; p<0,01. Baseline pagamento parziale/integrale ~0,4%.",
    "evidenceStrength": "forte",
    "costsRequirements": "Disponibilità di dati per posizione e storia delle notifiche; revisione legale e privacy; costi di stampa/posta, trattamento di ricorsi, rateizzazioni e difficoltà economica. Nessuna analisi causale di beneficio netto rispetto ai costi postali.",
    "limitations": [
      "Trattamento applicato ai soli morosi persistenti con una sola multa, non alla popolazione generale delle sanzioni.",
      "Follow-up di circa sei settimane e numero di trattati molto inferiore al controllo.",
      "Campione analitico ristretto da 10.702 posizioni iniziali a 10.404; vincoli di età e residenza ACT/NSW.",
      "Percentuale di pagamento del controllo molto bassa: riportare effetti in punti percentuali, non soltanto relativi.",
      "Non identificati effetti su violazioni, incidenti o benessere netto.",
      "Disciplina italiana diversa: verificare che le comunicazioni aggiuntive non alterino notifiche obbligatorie, prescrizione e ricorsi."
    ],
    "unintendedEffects": "Possibili oneri emotivi e informativi per persone con difficoltà economiche; prevedere indicazioni chiare su contestazioni e rateizzazione. Lo studio non quantifica effetti negativi verificati.",
    "primarySource": {
      "label": "ACT Government — Access Canberra: Traffic and parking fines",
      "url": "https://www.accesscanberra.act.gov.au/driving-transport-and-parking/traffic-and-parking/traffic-and-parking-fines-infringements"
    },
    "evaluationStudies": [
      {
        "label": "Sinning e Zhang (2023) — articolo scientifico integrale",
        "url": "https://www.sciencedirect.com/science/article/pii/S0167268123001002",
        "citation": "Sinning M, Zhang Y (2023), Social norms or enforcement? A natural field experiment to improve traffic and parking fine compliance, Journal of Economic Behavior & Organization, 210:43–60",
        "doi": "10.1016/j.jebo.2023.03.029"
      }
    ],
    "lastVerifiedAt": "2026-10-22",
    "transferabilityItaly": "Trasferibile come sperimentazione di testi aggiuntivi per entrate sanzionatorie comunali, non come disciplina coercitiva straniera. Necessarie verifiche giuridiche su contravvenzioni, procedure di riscossione, prescrizione, notifiche, ricorsi, modalità di pagamento e GDPR.",
    "lameziaAdaptation": "Con l'Ufficio Sanzioni e Contenzioso censire verbali CdS e non CdS già notificati e arretrati, individuare posizioni su cui un contatto aggiuntivo sia lecito, confrontare con assegnazione randomizzata la comunicazione ordinaria e una lettera informativa aggiuntiva sulle conseguenze realmente applicabili e le opzioni di regolarizzazione, senza ritardare notifiche dovute. Misurare incassi, tasso di pagamento, rateizzazioni, ricorsi e costi a 30/60/90 giorni.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "dati pseudonimizzati delle posizioni",
      "storia dei versamenti e solleciti",
      "valutazione dell'ufficio legale e DPO",
      "randomizzazione riproducibile",
      "costi di recapito",
      "indicatori di morosità, ricorso e dilazione"
    ],
    "tags": [
      "Australia",
      "ACT",
      "Canberra",
      "sanzioni amministrative",
      "riscossione",
      "lettere",
      "RCT",
      "comportamenti",
      "morosità"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-22",
        "note": "Prima registrazione: verifica della Tabella 4 del paper definitivo e della fonte amministrativa; preservati baseline, campione limitato e assenza di outcome sulla sicurezza."
      }
    ]
  }
] satisfies readonly EvidenceIntervention[];
