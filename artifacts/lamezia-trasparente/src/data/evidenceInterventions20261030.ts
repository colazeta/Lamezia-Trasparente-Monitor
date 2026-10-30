import type { EvidenceIntervention } from "./evidenceInterventions";

/** Municipal waste-policy case verified on 2026-10-30 against Lee & Jung (2017), Seoul and Lamezia sources. */
export const EVIDENCE_INTERVENTIONS_2026_10_30: readonly EvidenceIntervention[] = [
  {
    "id": "seoul-mapo-gu-rfid-unit-food-waste-pricing-2016",
    "title": "Mapo-gu (Seoul): tariffazione dell'organico a peso per singola utenza con identificazione RFID",
    "authority": "Mapo-gu District Government, nell'ambito delle politiche sui rifiuti della Seoul Metropolitan Government",
    "territory": "Mapo-gu, Seoul; 12 complessi residenziali trattati e 61 complessi di confronto",
    "country": "Corea del Sud",
    "implementationYear": "Dal gennaio 2016 nei complessi analizzati; panel giugno 2013–luglio 2016",
    "problem": "Nel precedente sistema di ripartizione condominiale, ciascuna famiglia pagava una quota del costo complessivo dei rifiuti alimentari del condominio, riducendo l'incentivo marginale a evitarne il conferimento (free riding).",
    "measure": "Dodici complessi residenziali hanno sostituito il sistema di addebito collettivo per l'organico con contenitori dotati di lettore RFID e bilancia: tessera identificativa, peso registrato al conferimento e costo attribuito alla singola utenza; 61 complessi hanno mantenuto la ripartizione collettiva. Il trattamento comprende insieme tecnologia di misurazione e cambio della regola di tariffazione.",
    "mechanism": "Il prezzo marginale del conferimento è reso direttamente percepibile al nucleo familiare: l'identificazione e la pesatura digitale allineano la responsabilità di pagamento alla quantità di rifiuto organico effettivamente conferita, riducendo l'incentivo all'uso opportunistico del contenitore condominiale.",
    "population": "Residenti dei 12 complessi condominiali trattati di Mapo-gu, confrontati con 61 complessi non trattati nello stesso distretto; lo studio misura i chilogrammi mensili aggregati per complesso, non un effetto sperimentale su singole famiglie.",
    "primaryArea": "rifiuti_pulizia_urbana",
    "secondaryAreas": [
      "ambiente_clima_energia",
      "digitalizzazione_servizi_online",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "incentivo_economico",
      "infrastruttura_digitale",
      "modifica_organizzativa_processo",
      "targeting_data_analytics"
    ],
    "tools": [
      "contenitori per organico con lettore RFID e pesatura elettronica",
      "tessera identificativa per utenza",
      "registro digitale dei kg conferiti e dell'addebito",
      "sistema tariffario a quantità individuale invece di ripartizione collettiva",
      "dati mensili del servizio per DID e propensity-score matching"
    ],
    "territorialScale": "Distretto municipale; unità di trattamento e outcome: complesso residenziale condominiale.",
    "interventionStatus": "Introduzione documentata nel gennaio 2016 e valutazione sul periodo fino al luglio 2016. La fonte comunale metropolitana documenta l'espansione successiva dei contenitori RFID, ma non è verificato lo stato specifico nel 2026 di ciascuno dei 12 complessi del campione storico.",
    "evaluationMethod": "Esperimento naturale non randomizzato: difference-in-differences (DID) su 38 mesi di panel (31 mesi prima, sette mesi dopo) con controllo per prezzo, composizione/caratteristiche dei complessi e stagionalità; confronto di robustezza con propensity-score matching (PSM-DID) su 12 complessi trattati e 12 controlli abbinati.",
    "comparator": "61 complessi del distretto che hanno mantenuto la tariffazione collettiva; specificazione alternativa con 12 complessi di controllo abbinati per propensity score. L'adozione nei 12 complessi vicini allo stadio non è stata randomizzata.",
    "outcomes": [
      "peso mensile di rifiuti alimentari/organici conferito per complesso residenziale (log kg)",
      "differenza nell'evoluzione dei conferimenti tra complessi trattati e di confronto",
      "rifiuti residui, abbandoni, contaminazioni, prevenzione dello spreco ed effetti distributivi: non adeguatamente misurati nello studio"
    ],
    "results": "I modelli DID e PSM-DID associano il passaggio dalla tariffazione collettiva alla pesatura e tariffazione per nucleo a una riduzione statisticamente significativa dei kg mensili di organico conferiti nei condomìni trattati. Non si può attribuire il risultato alla sola tecnologia RFID, distinta dall'incentivo economico, né identificarlo automaticamente come riduzione dello spreco alimentare effettivamente prodotto.",
    "effectSize": "Coefficiente dell'interazione trattamento×post su log(kg/mese): circa −0,460 nel DID con controlli non abbinati e −0,507 nel PSM-DID con controlli abbinati (specificazioni con covariate dello studio). La trasformazione [exp(beta)−1] indica riduzioni stimate di circa 36,9% e 39,8% del peso mensile conferito rispetto al controfattuale, non una differenza in punti percentuali e non un risparmio di costi; stime relative a soli sette mesi successivi.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Necessari acquisto o noleggio dei contenitori RFID, bilance calibrate, lettori e tessere, manutenzione, interoperabilità con anagrafe utenze e dati tariffari, gestione degli errori e canali alternativi accessibili. Lo studio non dimostra un ritorno finanziario netto, né quantifica un costo trasferibile per kg evitato.",
    "limitations": [
      "Adozione non randomizzata: i 12 condomìni trattati si concentrano nei pressi del World Cup Stadium; caratteristiche territoriali e cambiamenti contemporanei possono confondere il DID anche dopo matching.",
      "Solo sette mesi post-intervento: gli effetti di lungo periodo e la stabilità dei comportamenti non sono dimostrati.",
      "Differenze nei livelli iniziali e possibili trend non paralleli, assieme al numero ridotto di soli 12 cluster trattati, limitano inferenza causale e precisione delle stime.",
      "L'outcome è il peso dell'organico raccolto, non la prevenzione fisica dello spreco alimentare: possibili conferimenti nel rifiuto residuo, rimozione di liquidi, smaltimenti impropri o abbandoni non misurati.",
      "Il passaggio alla tariffazione individuale è congiunto all'installazione dei dispositivi RFID: gli effetti delle due componenti non sono separabili.",
      "Possibile differenza normativa e infrastrutturale rispetto all'Italia, dove le regole sulla misurazione puntuale e sulla TARI non coincidono con quelle coreane."
    ],
    "unintendedEffects": "Non sono documentati quantitativamente effetti avversi. Rischi plausibili da monitorare: trasferimento dell'organico all'indifferenziato, abbandoni, errori di misura, oneri relativi per famiglie numerose o fragili, esclusione digitale, trattamento improprio di dati riconducibili alla singola utenza.",
    "primarySource": {
      "label": "Seoul Metropolitan Government — piano ufficiale di diffusione del pay-as-you-throw RFID per l'organico",
      "url": "https://english.seoul.go.kr/seoul-targets-20-lower-food-waste-by-2030/"
    },
    "evaluationStudies": [
      {
        "label": "Sustainability — articolo peer-reviewed e tabelle DID/PSM-DID originali",
        "url": "https://doi.org/10.3390/su9112046",
        "citation": "Lee, S. e Jung, K. (2017), Exploring Effective Incentive Design to Reduce Food Waste: A Natural Experiment of Policy Change from Community Based Charge to RFID Based Weight Charge, Sustainability, 9(11), 2046.",
        "doi": "10.3390/su9112046"
      }
    ],
    "lastVerifiedAt": "2026-10-30",
    "transferabilityItaly": "Il principio di responsabilizzare le utenze mediante misurazione puntuale è rilevante per un Comune italiano, ma non è giuridicamente equivalente a imporre un prezzo coreano per kg di organico. Il decreto del Ministero dell'Ambiente 20 aprile 2017 (GU 22 maggio 2017 n.117) stabilisce requisiti per sistemi di misurazione puntuale, con attenzione al rifiuto urbano residuo; occorre valutare assetto tariffario e competenze comunali, del gestore e dell'ente territoriale competente, norme ARERA, privacy e tutela delle utenze vulnerabili.",
    "lameziaAdaptation": "Co-progettare con Lamezia Multiservizi una diagnosi dei pesi e della qualità dell'organico già raccolto porta a porta; selezionare condomìni comparabili, introdurre un monitoraggio pilota della pesatura senza immediata modifica della TARI e predefinire eventuale sperimentazione tariffaria solo dopo istruttoria giuridica. Valutare con rollout per fasi: kg organico pro-capite/utenza, residuo, contaminazione, abbandoni, stagionalità, costi di investimento/gestione ed equità, confrontando complessi simili. Coordinare con il programma di compostiere in comodato e riduzione TARI dal 2027 annunciato dal Comune il 9 gennaio 2026.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "banca dati delle utenze e condomìni con basi giuridiche di trattamento",
      "pesi mensili dell'organico per area/complesso e rifiuto residuo",
      "rilevazione composizione/contaminazione e abbandoni",
      "calibrazione strumenti e capitolato tecnico per RFID",
      "verifica del decreto 20 aprile 2017, regolamento TARI e competenze tariffarie",
      "protocollo statistico predefinito con confronto e stagionalità",
      "costi unitari OPEX/CAPEX, verifiche di accessibilità, equità e GDPR"
    ],
    "tags": [
      "Mapo-gu",
      "Seoul",
      "Corea del Sud",
      "rifiuti organici",
      "spreco alimentare",
      "RFID",
      "tariffazione puntuale",
      "PAYT",
      "condomini",
      "propensity score matching",
      "difference-in-differences",
      "misurazione a peso"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-30",
        "note": "Prima verifica sullo studio originale Lee e Jung 2017, piano ufficiale Seoul, quadro normativo italiano e fonti primarie Lamezia. Distinti peso raccolto da spreco prevenuto, DID non randomizzato, effetti di breve durata, costi ignoti e vincoli tariffari."
      }
    ]
  }
];
