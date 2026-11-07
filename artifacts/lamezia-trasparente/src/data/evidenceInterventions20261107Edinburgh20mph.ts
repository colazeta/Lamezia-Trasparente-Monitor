import type { EvidenceIntervention } from "./evidenceInterventions";

/** Edinburgh 20 mph citywide limits: original studies and council source checked on 2026-11-07; natural experiment, not randomised. */
export const EVIDENCE_INTERVENTIONS_2026_11_07_EDINBURGH_20MPH: readonly EvidenceIntervention[] = [
  {
    "id": "edinburgh-citywide-20mph-speed-limits-traffic-injuries-natural-experiment-2016",
    "title": "Edimburgo: rete urbana con limite di 20 mph e riduzione dei feriti negli incidenti stradali",
    "authority": "The City of Edinburgh Council — Transport and Environment Committee",
    "territory": "Edimburgo, Scozia; sette zone di attuazione nella rete stradale cittadina",
    "country": "Regno Unito",
    "implementationYear": "31 luglio 2016 – 5 marzo 2018 (attuazione progressiva; valutazioni fino a circa tre anni dopo)",
    "problem": "Velocità veicolari e rischi di collisioni e lesioni in strade residenziali, commerciali e prossime ai servizi; necessità di estendere a scala cittadina la protezione già esistente presso scuole e alcune strade di quartiere.",
    "measure": "Estensione graduale del limite di 20 mph (~32 km/h) dal 50% a circa l'80% delle strade di Edimburgo, inclusi centro, vie commerciali e residenziali; mantenimento di alcune arterie a 30–40 mph. Per l'espansione analizzata: cartelli e ordinanze stradali, comunicazione ed enforcement, senza dossi o nuove opere fisiche di moderazione specifiche del trattamento.",
    "mechanism": "Limiti coerenti e riconoscibili su una rete ampia, con segnaletica, comunicazione e controlli, possono ridurre velocità medie e comportamenti pericolosi; diffusione della norma e spillover di rete sono ipotesi compatibili con il risultato, non meccanismi causalmente isolati.",
    "population": "Utenti stradali, residenti, pedoni, ciclisti e automobilisti; outcome rilevati dai registri di polizia STATS19 sulle collisioni con lesioni, localizzate su rete GIS.",
    "primaryArea": "mobilita_spazio_pubblico",
    "secondaryAreas": [
      "sicurezza_urbana_prevenzione",
      "salute_pubblica_locale",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "regolazione",
      "nudging_comunicazione",
      "enforcement_controllo",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "Traffic Regulation Order e segnaletica 20 mph",
      "attuazione per sette aree fra luglio 2016 e marzo 2018",
      "informazione pubblica, educazione ed enforcement ordinario",
      "dati STATS19 e sistema GIS degli archi viari",
      "confronti per segmenti di strada, zone abbinate e serie temporali"
    ],
    "territorialScale": "Rete urbana, circa 80% delle strade cittadine al termine della fase; espansione da un precedente 50%.",
    "interventionStatus": "Rete da 20 mph completata nel marzo 2018; il Comune ne documenta il funzionamento e successive consultazioni per estensioni. La valutazione riguarda la fase storica 2016–2018, non le modifiche successive.",
    "evaluationMethod": "Esperimento naturale NON randomizzato (Kokka et al., JECH 2024): comparazione della variazione pre/post dei tassi annualizzati su segmenti convertiti 30→20 mph e segmenti rimasti 30 mph; confronti tra sette zone di implementazione e aree di controllo scozzesi abbinate per caratteristiche socio-territoriali; modello di serie temporale cittadina con trend pre-intervento; simulazione degli esiti attesi da velocità e flussi. Le zone scaglionate non sono state assegnate casualmente: stepped rollout non equivale a stepped-wedge RCT.",
    "comparator": "Segmenti rimasti a 30 mph; segmenti già a 20 mph (controllo di contesto con possibili spillover); sette aree scozzesi abbinate per indicatori SIMD, classificazione urbana/rurale e densità; previsione controfattuale sulla base del trend cittadino pre-2016.",
    "outcomes": [
      "Numero annualizzato di persone ferite negli incidenti stradali segnalati alla polizia (casualties, non coincidenti con le collisioni)",
      "numero di collisioni con lesioni",
      "velocità veicolari medie",
      "flussi di traffico; variazione non robustamente rilevata"
    ],
    "results": "La valutazione del 2024 trova una riduzione delle persone ferite di circa 20% nelle zone di attuazione rispetto alle aree di controllo abbinate e 22% per le collisioni; nell'analisi cittadina le vittime di lesioni risultano 17% meno numerose della traiettoria prevista dal trend pre-intervento. Il confronto più localizzato tra segmenti convertiti e rimasti a 30 mph mostra −10% per le lesioni con IC95% che tocca 0, quindi evidenza al limite della significatività, e −8% per le collisioni con IC che comprende 0. La ricerca precedente documenta riduzione di velocità medie di 1,34 mph (5,7%) a un anno; variazione del volume non significativa. Sono risultati associati alla politica complessiva, non effetto identificato dei soli cartelli.",
    "effectSize": "Kokka et al. 2024: confronto zone di intervento vs zone abbinate: lesioni −20% (IC95% approssimativo −22 a −8% riportato dagli autori), collisioni −22%; confronto strade nuove 20 mph vs 30 mph rimaste: lesioni −10% (IC95% −19 a 0%), collisioni −8% (IC95% −18 a +2% dalla tabella 1); serie storica cittadina: −17% lesioni rispetto al trend previsto (IC95% riduzione 13–22%; ~228 feriti/anno meno della previsione). Nightingale et al. 2021: velocità media −1,34 mph (IC95% 0,95–1,72 mph) a 12 mesi; volume −2,4%, p=0,39. Non interpretare −20% come riduzione rispetto alla situazione iniziale senza comparatore né come effetto RCT.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Delimitazione e motivazione tecnica degli assi, atto regolamentare, segnaletica omogenea, informazione e controlli compatibili con competenze; aggiornamento cartografie, monitoraggio della velocità e dei sinistri, possibili costi di comunicazione e supervisione. L'articolo non offre un costo unitario trasferibile né una vera analisi costi-benefici; la misura segnaletica è meno onerosa di un rifacimento fisico, ma non è a costo zero.",
    "limitations": [
      "Natural experiment non randomizzato; aree abbinate selezionate in modo manuale, possibili differenze iniziali e interventi concomitanti; ipotesi di trend controfattuale non garantita.",
      "I dati STATS19 sottostimano collisioni e, meno, lesioni; variazioni nella registrazione o segnalazione possono influenzare gli esiti.",
      "Assenza di misure di mobilità attiva e di velocità per singolo segmento; possibili spillover di rete e diversa esposizione al traffico non isolati.",
      "Il confronto tra segmenti trattati e rimasti a 30 mph è di significatività marginale per lesioni e non significativo per collisioni; anche segmenti già a 20 mph migliorano.",
      "Nel periodo si verificarono modifiche legislative scozzesi sulla guida in stato di ebbrezza; non è possibile escludere altre politiche locali concomitanti.",
      "Le stime sul numero di feriti in base a gravità possono risentire di modifiche alla codifica di polizia introdotte nel 2019.",
      "Non è provata direttamente una crescita dell'attività fisica, una riduzione dell'inquinamento o il vantaggio economico netto per un Comune italiano."
    ],
    "unintendedEffects": "Possibili spostamenti del traffico su altre arterie, percorrenze più lente, costi di enforcement o diversa distribuzione di incidenti ed esposizione; lo studio non quantifica causalmente questi esiti. Nessuna dimostrazione di aumento dei volumi di traffico. Rischi e vantaggi distributivi devono essere misurati localmente.",
    "primarySource": {
      "label": "City of Edinburgh Council — About 20mph for Edinburgh (delibera 13/01/2015, completamento 05/03/2018, valutazioni municipali)",
      "url": "https://www.edinburgh.gov.uk/20mph-edinburgh/20mph-edinburgh-1"
    },
    "evaluationStudies": [
      {
        "label": "Kokka et al. (2024) — articolo originale peer-reviewed, testo integrale con tabelle su PMC",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11187370/",
        "citation": "Kokka, K., Nightingale, G., Williams, A. J., et al. (2024). Effect of 20 mph speed limits on traffic injuries in Edinburgh, UK: a natural experiment and modelling study. Journal of Epidemiology & Community Health, 78(7), 437–443.",
        "doi": "10.1136/jech-2023-221612"
      },
      {
        "label": "Nightingale et al. (2021) — valutazione originale della velocità, PLOS ONE",
        "url": "https://pubmed.ncbi.nlm.nih.gov/34972123/",
        "citation": "Nightingale, G. F., et al. (2021). Evaluating the citywide Edinburgh 20mph speed limit intervention effects on traffic speed and volume: a pre-post observational evaluation. PLoS ONE, 16(12), e0261383.",
        "doi": "10.1371/journal.pone.0261383"
      }
    ],
    "lastVerifiedAt": "2026-11-07",
    "transferabilityItaly": "Trasferibile in parte: la disciplina italiana consente limiti localizzati motivati secondo caratteristiche e criticità viarie, nei limiti di competenza, Codice della strada e direttive ministeriali; non dedurre che sia autorizzata una generalizzazione indiscriminata a tutta Lamezia. La leva è combinare segnaletica, conformità normativa e misurazione causale rigorosa; il limite britannico 20 mph equivale a circa 32 km/h, non esattamente a 30.",
    "lameziaAdaptation": "Nell'aggiornamento del PGTU avviato nel 2026, svolgere un audit GIS dei sinistri con feriti e velocità attorno a scuole, attraversamenti, fermate e percorsi pedonali di Nicastro, Sambiase e Sant'Eufemia. Definire con il Settore Tecnico e Polizia locale uno o più corridoi pilota eventualmente a 30 km/h, previa verifica della base giuridica per ogni tratto; integrare informazione, segnaletica e controlli proporzionati. Pre-registrare gli outcome, scegliere zone comparabili, raccogliere dati almeno 12 mesi prima e più follow-up dopo, monitorare anche vie adiacenti, tempi di viaggio ed esposizione pedonale; riportare incidenti gravi separatamente dai semplici conteggi di segnalazioni.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "base geografica geocodificata dei sinistri con feriti su almeno 3–5 anni, con qualità e privacy",
      "stradario, categorie di strada, limiti vigenti, accessibilità a scuole e servizi",
      "misurazioni automatiche ripetute della velocità e del flusso per fasce orarie",
      "individuazione di aree comparabili e piano di valutazione pre-registrato",
      "verifica normativa nazionale (Codice della strada, direttiva MIT 2024) e competenze",
      "costi di cartelli, campagne, rilievi e controlli e piano di misurazione di eventuali deviazioni"
    ],
    "tags": [
      "Edimburgo",
      "Scozia",
      "20mph",
      "limite 30 km/h",
      "sicurezza stradale",
      "feriti stradali",
      "collisioni",
      "esperimento naturale",
      "matching territoriale",
      "serie temporali",
      "PGTU Lamezia",
      "Kokka 2024",
      "Nightingale 2021"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-07",
        "note": "Prima scheda dopo discovery Parallel Search, lettura diretta degli studi originali peer-reviewed e della pagina istituzionale di Edimburgo, confronto con le schede londinesi e con il repository; riportati limiti causali e confronto dei gruppi; nessuna modifica a main."
      }
    ]
  }
];
