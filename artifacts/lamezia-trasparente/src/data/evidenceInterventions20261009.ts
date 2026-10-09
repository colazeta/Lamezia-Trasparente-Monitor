import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_09 = [
  {
    "id": "santa-fe-sidewalk-lottery-property-tax",
    "title": "Premio Buen Contribuyente: marciapiedi riqualificati per contribuenti regolari",
    "authority": "Municipalidad de la Ciudad de Santa Fe",
    "territory": "Santa Fe, provincia di Santa Fe",
    "country": "Argentina",
    "implementationYear": "Sorteggio 27 febbraio 2009; lavori 2009–2010",
    "problem": "Rafforzare il pagamento tempestivo della Tasa General de Inmuebles e rendere visibile l'utilità dei tributi comunali.",
    "measure": "Lotteria pubblica fra 72.742 immobili con imposte 2008 in regola; 400 estratti premiati con nuova costruzione o riqualificazione del marciapiede frontistante, con elementi di verde e permeabilità.",
    "mechanism": "Riconoscimento pubblico temporaneo e successiva reciprocità fiscale associata a un bene fisico visibile e durevole, con possibili spillover sui vicini.",
    "population": "Proprietari di immobili residenziali, commerciali e lotti eleggibili; contribuenti vicini alle proprietà premiate.",
    "primaryArea": "fiscalita_entrate_riscossione",
    "secondaryAreas": [
      "urbanistica_rigenerazione",
      "mobilita_spazio_pubblico"
    ],
    "interventionTypes": [
      "incentivo_economico",
      "infrastruttura_fisica",
      "informazione_trasparenza"
    ],
    "tools": [
      "registro eleggibili",
      "lotteria verificabile",
      "progetto standard di marciapiede",
      "storico dei versamenti"
    ],
    "territorialScale": "Singolo immobile, spillover di vicinato; scala comunale",
    "interventionStatus": "Esperimento storico realizzato; non documentata continuazione della stessa lotteria al 2026.",
    "evaluationMethod": "Randomizzazione di 400 su 72.742 contribuenti eleggibili; ITT dei vincitori, DiD per riconoscimento e IV/2SLS con lotteria come strumento della costruzione per stimare LATE; confronto anche su prossimità territoriale.",
    "comparator": "Immobili eleggibili non estratti; per il LATE i vincitori effettivamente beneficiati sono confrontati usando l'assegnazione casuale come strumento.",
    "outcomes": [
      "pagamento puntuale",
      "pagamento entro 3 e 6 mesi",
      "durata dell'effetto",
      "versamenti dei vicini"
    ],
    "results": "L'annuncio della vittoria produce +5,4 punti percentuali di pagamento puntuale nel mese successivo, senza persistenza in assenza dell'opera. La costruzione del marciapiede è associata a +7,1 p.p. di pagamento puntuale (stima IV/LATE), +5,5 p.p. entro 3 mesi e +4,8 p.p. entro 6 mesi; benefici duraturi e spillover positivi sui vicini. La sola possibilità di vincere non stimola in modo sostanziale il recupero degli arretrati.",
    "effectSize": "+5,4 p.p. riconoscimento immediato (non persistente); +7,1 p.p. pagamento puntuale per marciapiede ricevuto (IV/LATE, non ITT); +5,5 p.p. entro 3 mesi; +4,8 p.p. entro 6 mesi.",
    "evidenceStrength": "forte",
    "costsRequirements": "Costo medio storico circa ARS 5.250 per marciapiede (circa USD 1.553 all'epoca), alto rispetto alla tassa annuale; servono regolamento, dati tributi, capacità lavori pubblici e verifica di legittimità/equità.",
    "limitations": [
      "La lotteria coinvolgeva contribuenti già in regola, non debitori inadempienti.",
      "La stima +7,1 p.p. è IV/LATE; la validità causale richiede che l'effetto del riconoscimento si esaurisca prima dei lavori.",
      "Molti vincitori non ricevettero l'opera, che non fu assegnata in maniera strettamente coincidente al premio.",
      "Follow-up fino al 2011; costi e istituti fiscali non equivalgono a quelli italiani.",
      "Una selezione meritocratica delle opere può confliggere con priorità di sicurezza e giustizia distributiva."
    ],
    "unintendedEffects": "Possibile concentrazione delle manutenzioni su contribuenti più solvibili a scapito di aree socialmente vulnerabili o infrastrutture più pericolose.",
    "primarySource": {
      "label": "BID SkillsBank — esperienza municipale Buen Contribuyente",
      "url": "https://skillsbank.iadb.org/index.php/es/our-experience/funcionan-los-premios"
    },
    "evaluationStudies": [
      {
        "label": "Journal of Public Economics (studio finale 2021)",
        "url": "https://doi.org/10.1016/j.jpubeco.2021.104422",
        "citation": "Carrillo, Castro, Scartascini (2021), Public good provision and property tax compliance: Evidence from a natural experiment",
        "doi": "10.1016/j.jpubeco.2021.104422"
      },
      {
        "label": "IDB-WP-794 (stime complete)",
        "url": "https://publications.iadb.org/en/do-rewards-work-evidence-randomization-public-works",
        "citation": "Carrillo, Castro, Scartascini (2017), Do Rewards Work? Evidence from the Randomization of Public Works",
        "doi": "10.18235/0011793"
      }
    ],
    "lastVerifiedAt": "2026-10-09",
    "transferabilityItaly": "Meccanismo di reciprocità potenzialmente trasferibile; bassa trasferibilità della lotteria di opere, soggetta a verifica legale, contabile e di equità.",
    "lameziaAdaptation": "Collegare per quartiere entrate TARI e servizi/manutenzioni verificabili, pubblicando opere, costi e tempi. Non subordinare la messa in sicurezza dei marciapiedi alla regolarità fiscale dei residenti. Valutare incentivi solo dopo istruttoria legale.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "anagrafe tributaria pseudonimizzata",
      "interventi manutentivi geocodificati",
      "costi e collaudi",
      "analisi di equità",
      "verifica giuridica"
    ],
    "tags": [
      "Santa Fe",
      "premio fiscale",
      "RCT",
      "lotteria",
      "reciprocità",
      "LATE",
      "marciapiedi"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-09",
        "note": "Prima verifica IDB e studio finale: separate stime da riconoscimento, ITT e IV/LATE; registrati rischi distributivi."
      }
    ]
  },
  {
    "id": "barcelona-b-mincome-guaranteed-income-rct",
    "title": "B-MINCOME: reddito minimo comunale integrato e politiche di inclusione",
    "authority": "Ajuntament de Barcelona, Àrea de Drets Socials, Ivàlua e partner",
    "territory": "Dieci quartieri dell'Eix Besòs, Barcellona",
    "country": "Spagna",
    "implementationYear": "2017–2019",
    "problem": "Deprivazione materiale, instabilità abitativa, difficoltà alimentari e occupazionali delle famiglie vulnerabili.",
    "measure": "Pilota biennale di reddito minimo calcolato su bisogni e mezzi, con diverse combinazioni di condizionalità, phase-out del beneficio e politiche attive per lavoro, imprenditoria sociale, affitto e partecipazione.",
    "mechanism": "Il sostegno attenua privazioni e stress economico; tassi di ritiro del sussidio quando cresce il reddito possono tuttavia disincentivare l'occupazione.",
    "population": "1.524 famiglie eleggibili; 1.000 selezionate per lotteria stratificata alle modalità sperimentali; studio 2025 su circa 1.200 nuclei nel campione analitico.",
    "primaryArea": "welfare_inclusione_servizi_sociali",
    "secondaryAreas": [
      "sviluppo_economico_commercio_lavoro",
      "housing_politiche_abitative",
      "partecipazione_democrazia_locale"
    ],
    "interventionTypes": [
      "incentivo_economico",
      "servizio_diretto",
      "partnership_pubblico_privato_terzo_settore",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "SMI means-tested",
      "randomizzazione stratificata",
      "accompagnamento sociale",
      "registri occupazionali",
      "valuta locale REC",
      "phase-out alternativi"
    ],
    "territorialScale": "Dieci quartieri di tre distretti",
    "interventionStatus": "Pilot concluso nel 2019; valutazione iniziale 2019, approfondimento peer-reviewed 2025; non assumere continuità nel 2026.",
    "evaluationMethod": "Randomized controlled trial con sorteggio stratificato fra eleggibili e più treatment arms; valutazione indipendente Ivàlua su welfare e lavoro; follow-up amministrativo lavorativo analizzato nel 2025.",
    "comparator": "Famiglie eleggibili assegnate al controllo e ai servizi ordinari; sottobracci differenziati per condizionalità e tasso di ritiro.",
    "outcomes": [
      "deprivazione grave",
      "insicurezza alimentare",
      "soddisfazione di vita",
      "morosità abitativa",
      "qualità del sonno",
      "occupazione",
      "salute",
      "formazione e partecipazione sociale"
    ],
    "results": "Il rapporto Ivàlua 2019 stima una riduzione di 8 punti percentuali della deprivazione materiale grave, +0,146 nella soddisfazione di vita e −0,213 nella scala di insicurezza alimentare; la partecipazione al lavoro cala di 13 p.p. nella survey. Lo studio 2025 trova −22% relativo nell'occupazione dei principali beneficiari dopo due anni e −14% relativo nella probabilità che il nucleo abbia almeno un occupato, con effetti persistenti almeno sei mesi dopo la fine. Riduzioni più contenute del beneficio al crescere del reddito attenuano il controeffetto occupazionale. Non è dimostrato un miglioramento generale della salute.",
    "effectSize": "Deprivazione grave −8 p.p.; partecipazione lavorativa survey 2019 −13 p.p.; occupazione beneficiario principale 2025 −22% relativo (non p.p.); almeno un occupato nel nucleo −14% relativo.",
    "evidenceStrength": "molto_forte",
    "costsRequirements": "Trasferimento medio effettivo circa €463 mensili per nucleo; massimo parametrico circa €1.676. Occorrono risorse pluriennali, verifica dei mezzi, governance con servizi sociali, privacy e valutazione; cofinanziamento EU Urban Innovative Actions.",
    "limitations": [
      "Misura means-tested, non reddito universale; diversi sottobracci e politiche attive.",
      "Il −13 p.p. 2019 e il −22% relativo 2025 riguardano outcome/campioni differenti.",
      "Nessun pre-analysis plan preregistrato; numerosi outcome e attrition richiedono cautela.",
      "Le componenti monetarie e le politiche sociali concomitanti non sono sempre isolabili.",
      "Non emerge un effetto sanitario generale significativo."
    ],
    "unintendedEffects": "Riduzione significativa della partecipazione lavorativa, amplificata da elevati tassi di ritiro del beneficio; possibile sostituzione con attività di cura, solo ipotizzata.",
    "primarySource": {
      "label": "URBACT — scheda del pilot comunale B-MINCOME",
      "url": "https://urbact.eu/good-practices/bmincome"
    },
    "evaluationStudies": [
      {
        "label": "Ivàlua — valutazione finale 2019",
        "url": "https://ivalua.cat/sites/default/files/2021-02/Informe%20Avaluaci%C3%B3%20Impacte%20BMincome_0.pdf",
        "citation": "Todeschini & Sabes-Figuera (2019), Barcelona City Council welfare programme: Impact evaluation results"
      },
      {
        "label": "Journal of Public Economics — employment effects 2025",
        "url": "https://doi.org/10.1016/j.jpubeco.2025.105420",
        "citation": "Verlaat, Todeschini & Ramos (2025), The employment effects of a means-tested guaranteed income policy",
        "doi": "10.1016/j.jpubeco.2025.105420"
      }
    ],
    "lastVerifiedAt": "2026-10-09",
    "transferabilityItaly": "Alta per progettazione e valutazione integrata dei sostegni; trasferimento economico strutturale richiede coordinamento con regimi nazionali/regionali e copertura certa.",
    "lameziaAdaptation": "Mappare eleggibilità e mancato accesso agli aiuti esistenti, verificare frizioni e coordinare servizi sociali e formazione. Evitare disincentivi marginali al lavoro nei disegni di eventuali integrazioni comunali; nuova misura monetaria solo con sostenibilità e valutazione ex ante.",
    "implementability": "strutturale",
    "capacityDataNeeds": [
      "inventario misure e beneficiari pseudonimizzati",
      "bilancio",
      "coordinamento ATS/Regione/ASP",
      "dati outcome sociali e occupazionali",
      "valutazione indipendente"
    ],
    "tags": [
      "B-MINCOME",
      "Barcellona",
      "RCT",
      "reddito minimo",
      "welfare",
      "deprivazione",
      "disincentivi occupazionali"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-09",
        "note": "Prima verifica report originale 2019 e paper JPubE 2025, incluso il controeffetto sull'occupazione."
      }
    ]
  }
] as const satisfies readonly EvidenceIntervention[];
