import type { EvidenceIntervention } from "./evidenceInterventions";

/** Two Mozambican municipal IPRA notification trials; non-random delivery comparison disclosed. */
export const EVIDENCE_INTERVENTIONS_2026_11_10_DONDO_VILANKULO: readonly EvidenceIntervention[] = [
  {
    "id": "dondo-vilankulo-mozambique-2018-ipra-tax-notice-messages-rct",
    "title": "Dondo e Vilankulo: avvisi tributari personalizzati e messaggi differenziati sull'imposta immobiliare",
    "authority": "Conselhos Municipais de Dondo e de Vilankulo, con supporto di GIZ",
    "territory": "Dondo (Sofala) e Vilankulo (Inhambane)",
    "country": "Mozambico",
    "implementationYear": "2018 (avvisi consegnati tra gennaio e maggio; pagamenti osservati fino a fine anno)",
    "problem": "Bassa riscossione dell'Imposto Predial Autárquico (IPRA): nelle anagrafiche comunali oggetto dello studio aveva pagato nell'anno precedente circa il 13% dei contribuenti registrati. Comunicazioni dirette di pagamento storicamente poco diffuse e limitata capacità di rintracciare i destinatari.",
    "measure": "I due comuni hanno predisposto e tentato di consegnare avvisi nominativi per l'IPRA. I contribuenti registrati sono stati assegnati casualmente a tre versioni della stessa lettera: messaggio su investimenti pubblici locali (reciprocità), messaggio con conseguenze legali effettive del mancato pagamento (deterrenza) oppure logo/slogan municipale senza messaggio tributario specifico (neutro).",
    "mechanism": "Rendere riconoscibile la posizione tributaria e l'obbligo di pagamento; testare se le informazioni su servizi realizzati o su conseguenze giuridiche reali modificano i pagamenti. La raggiungibilità dei destinatari e il comportamento pregresso risultano condizioni cruciali, con rischio di reazioni avverse.",
    "population": "L'intero registro di 1.058 contribuenti IPRA (persone e imprese) dei due municipi, randomizzati a uno di tre messaggi; circa il 54% risulta effettivamente raggiunto dalla consegna. La stima principale DiD comprende 997 contribuenti; universo registrato, non tutti i potenziali soggetti passivi.",
    "primaryArea": "fiscalita_entrate_riscossione",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "trasparenza_integrita_anticorruzione"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "targeting_data_analytics",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "anagrafe comunale dell'imposta sugli immobili",
      "avvisi nominativi e consegna diretta gennaio–maggio 2018",
      "tre contenuti assegnati casualmente",
      "registri pagamenti dell'anno precedente e corrente",
      "differenza-nelle-differenze con effetti fissi individuali e errori clusterizzati",
      "segmentazione esplorativa per persone/imprese e regolarità pregressa"
    ],
    "territorialScale": "Due comuni; unità sperimentale singolo contribuente iscritto all'anagrafe tributaria.",
    "interventionStatus": "Esperimento municipale concluso nel 2018 e valutato in articolo peer-reviewed del 2024; prosecuzione delle specifiche lettere nel 2026 non verificata.",
    "evaluationMethod": "Randomizzazione individuale fra tre VERSIONI di avviso, senza braccio pianificato di non invio. Per stimare l'effetto dell'AVVENUTA consegna lo studio applica un modello difference-in-differences con effetti fissi individuali, confrontando contribuenti raggiunti e contribuenti non raggiunti: tale gruppo di confronto emerge ex post e NON è randomizzato. I confronti fra versioni di lettera sono randomizzati nell'assegnazione ma limitati da consegne incomplete e potenza statistica.",
    "comparator": "Per effetto del recapito: contribuenti non raggiunti, senza lettera, individuati ex post (comparatore non assegnato casualmente). Per confronti del framing: avviso neutro ricevuto, con logo/slogan del comune. Dati di pagamento prima/dopo dai registri municipali.",
    "outcomes": [
      "almeno un pagamento IPRA nell'anno di osservazione",
      "risposta ai diversi messaggi",
      "eterogeneità fra persone e imprese",
      "eterogeneità rispetto al pagamento nell'anno precedente"
    ],
    "results": "Modello DiD: i contribuenti effettivamente raggiunti mostrano un aumento di circa 5,09 punti percentuali nella probabilità di pagare rispetto ai non raggiunti (p<0,05), ma il gruppo di non recapito non era randomizzato; quindi NON va presentato come effetto causale RCT certo. Il messaggio di deterrenza rispetto a non avere ricevuto alcun avviso registra +8,42 punti (p<0,01), ancora su confronto non randomizzato. Nel confronto randomizzato dei diversi messaggi consegnati, né deterrenza né reciprocità differiscono significativamente dal messaggio neutro in media. Il messaggio di reciprocità può peggiorare gli esiti delle imprese; effetti negativi anche per contribuenti già adempienti.",
    "effectSize": "Tabella 2, articolo originale: recapito vs non recapito DiD +0,0509 (SE 0,0203; p<0,05); deterrenza vs nessuna lettera +0,0842 (SE 0,0308; p<0,01); deterrenza vs avviso neutro +0,0430 (SE 0,0416; NON significativo); reciprocità vs neutro −0,0129 (SE 0,0439; NON significativo). Baseline precedente: circa 13% dei registrati aveva pagato. I coefficienti sono punti percentuali, non aumenti relativi.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Servono anagrafe tributaria aggiornata, recapiti affidabili, operazioni di recapito tracciate, accesso legittimo ai dati di pagamento, controllo giuridico del testo e personale addetto. Lo studio non dimostra un costo unitario, costo-efficacia o aumento netto delle entrate trasferibile a un comune italiano.",
    "limitations": [
      "La più importante: l'effetto positivo di 5,09 punti è identificato confrontando consegnati e non consegnati, NON attraverso l'assegnazione casuale a lettera/no lettera. Possibile selezione di soggetti più raggiungibili o diligenti, nonostante regressione DiD e verifiche riportate.",
      "Solo circa il 54% dei 1.058 registrati ricevette un avviso; l'analisi principale considera un campione ridotto e il registro IPRA non copriva necessariamente tutti gli immobili imponibili.",
      "Differenze fra messaggi assegnati casualmente NON statisticamente significative in media quando il comparatore è la lettera neutra; vietato attribuire +8,42 punti al solo framing di deterrenza.",
      "Sottogruppi per precedente adempimento e per impresa/persona hanno minore potenza e vanno considerati esplorativi; non attribuire effetti universali.",
      "L'osservazione copre un periodo fiscale, non documenta fedeltà o incassi a lungo termine; importi effettivamente riscossi e costi non quantificati in forma confrontabile.",
      "Regimi IPRA mozambicano e IMU/TARI italiano, sistemi di riscossione, capacità di recapito e obblighi di notifica differenti: non sono trasferibili né le formule tributarie né le potenziali conseguenze prospettate."
    ],
    "unintendedEffects": "Nelle analisi per sottogruppi, messaggi sui benefici pubblici riducono significativamente la propensione delle imprese a pagare e tutte le lettere mostrano associazioni negative tra contribuenti già adempienti. Attenzione a perdita di fiducia, messaggi percepiti come minaccia o comunicazioni non veritiere: un adattamento italiano non deve suggerire sanzioni o poteri non previsti dalla legge.",
    "primarySource": {
      "label": "DEval Rigorous Evidence Database — programma di valutazione GIZ con Dondo e Vilankulo",
      "url": "https://rie.deval.org/rigorous-evidence-database-red/detail/applying-rigorous-impact-evaluation-in-giz-governance-programmes-mozambique"
    },
    "evaluationStudies": [
      {
        "label": "Articolo peer-reviewed integrale — Journal of Public Affairs (2024)",
        "url": "https://onlinelibrary.wiley.com/doi/full/10.1002/pa.2960",
        "citation": "von Schiller, A. (2024), Which Messages Motivate Tax Compliance in Low Administrative Capacity Settings? Experimental Evidence From Two Mozambican Municipalities, Journal of Public Affairs 24(4), e2960.",
        "doi": "10.1002/pa.2960"
      },
      {
        "label": "IDOS — scheda istituzionale dell'autore e DOI",
        "url": "https://www.idos-research.de/en/others-publications/article/which-messages-motivate-tax-compliance-in-low-administrative-capacity-settings-experimental-evidence-from-two-mozambican-municipalities",
        "citation": "German Institute of Development and Sustainability (2024), scheda ufficiale dell'articolo di von Schiller."
      }
    ],
    "lastVerifiedAt": "2026-11-10",
    "transferabilityItaly": "Media come lezione di capacità amministrativa: garantire l'effettivo recapito e valutare la chiarezza delle comunicazioni di entrata, senza presumere che i medesimi messaggi o dimensioni d'effetto funzionino dove avvisi e PagoPA sono già attivi. I limiti alle notifiche tributarie, alla privacy e alle comunicazioni di sollecito devono essere verificati con Ufficio Tributi e ufficio legale.",
    "lameziaAdaptation": "Il Comune ha già annunciato per TARI 2026 avvisi mediante App IO, e-mail/PEC e posta e accesso a PagoPA (comunicazione del 9 settembre 2026). NON replicare una generica 'prima notifica' come se mancasse. Avviare invece un audit dei tassi di recapito, degli errori anagrafici e dei pagamenti distinguendo regolari e insoluti. Solo per promemoria informativi legalmente facoltativi e sempre dopo verifica giuridica/privacy, testare a parità di canale la chiarezza del testo contro una comunicazione neutra, misurando pagamenti puntuali, contestazioni e costi. Evitare messaggi aggressivi verso chi paga regolarmente.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "dataset anonimizzato delle posizioni e dei pagamenti tributi, per annualità",
      "evidenze di consegna per App IO, e-mail/PEC e posta con denominatori corretti",
      "protocollo di legittimità dei solleciti e privacy/DPO",
      "separazione degli adempienti da debitori e soggetti che contestano o sono esenti",
      "gruppi comparabili e indicatori predefiniti di pagamento, reclami, costo di comunicazione"
    ],
    "tags": [
      "Dondo",
      "Vilankulo",
      "Mozambico",
      "property tax",
      "IPRA",
      "DiD",
      "RCT framing",
      "recapito",
      "comunicazioni tributarie",
      "effetti indesiderati",
      "riscossione locale",
      "selezione ex post",
      "tributi",
      "TARI"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-10",
        "note": "Primo inserimento: discovery Parallel Search; riscontro con articolo originale 2024, Tabella 1 e 2, descrizione DEval dell'esperimento. Qualificato esplicitamente il comparatore di recapito ex post non randomizzato, il framing non significativo vs neutro e i possibili backfire."
      }
    ]
  }
];
