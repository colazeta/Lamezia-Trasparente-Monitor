import type { EvidenceIntervention } from "./evidenceInterventions";

/** NYC school water dispensers (2008–2013), original studies and city policy verified 2026-11-19. */
export const EVIDENCE_INTERVENTIONS_2026_11_19_NYC_SCHOOL_WATER: readonly EvidenceIntervention[] = [
  {
    "id": "new-york-city-school-cafeteria-water-jets-2008",
    "title": "New York City: erogatori di acqua gratuita nelle mense scolastiche e miglioramento dei comportamenti idrici",
    "authority": "New York City Department of Education / Office of School Food, con New York City Department of Health and Mental Hygiene",
    "territory": "New York City, New York",
    "country": "Stati Uniti",
    "implementationYear": "2008/09 (pilota in cinque mense); progressiva estensione 2009–2013; studi su dati 2010–2013",
    "problem": "Nelle mense scolastiche l'accesso immediato a un'acqua potabile fresca e gratuita non era sempre agevole. Bevande caloriche potevano essere scelte per comodità; l'amministrazione cercava misure semplici per promuovere abitudini salutari e affrontare l'eccesso ponderale in età scolare.",
    "measure": "Installazione progressiva di erogatori refrigerati ad alto flusso ('water jets') nelle mense delle scuole pubbliche cittadine, con acqua gratuita e bicchieri disponibili. Il programma iniziò con cinque mense nel 2008/09; entro il 2012/13 circa due terzi delle scuole elementari e medie NYCDOE erano dotati di un water jet. Si tratta di dotazione infrastrutturale effettivamente realizzata, confermata dalla policy di salute scolastica NYCPS che continua a prevedere acqua potabile gratuita durante i pasti, anche attraverso water jets.",
    "mechanism": "Ridurre tempi, attrito e disagio nell'accedere all'acqua durante il pranzo rende più probabile scegliere acqua al posto di altre bevande. Possibile sostituzione delle bevande con zuccheri/calorie; lo studio non identifica direttamente che cosa gli studenti abbiano bevuto né dimostra questo meccanismo come causa dei cambiamenti nel peso.",
    "population": "Alunni di scuole pubbliche elementari e medie della città (K–8). La valutazione su peso e altezza include 1.065.562 studenti in 1.227 scuole; lo studio sulle condotte ha osservato 9 scuole trattate e 10 di confronto e somministrato questionari a 2.899 studenti di specifiche classi.",
    "primaryArea": "salute_pubblica_locale",
    "secondaryAreas": [
      "istruzione_giovani",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "infrastruttura_fisica",
      "servizio_diretto",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "erogatori d'acqua refrigerata con leva per servizio rapido",
      "bicchieri e gestione igienica quotidiana delle postazioni",
      "registri NYCDOE delle consegne e installazioni",
      "osservazioni dirette in mensa",
      "misurazioni antropometriche annuali FITNESSGRAM, solo nelle analisi scientifiche de-identificate",
      "standard comunali di accesso all'acqua potabile durante i pasti"
    ],
    "territorialScale": "Scuole pubbliche dell'intera città, a implementazione scaglionata scuola per scuola; valutazioni a livello scolastico e individuale.",
    "interventionStatus": "Intervento storico implementato dal 2008/09, studiato fino al 2013. La policy corrente NYCPS prevede acqua gratuita nelle mense, compresi erogatori refrigerati. Non si afferma che ogni apparecchio storico sia ancora in funzione o che l'adozione specifica sia completa nel 2026.",
    "evaluationMethod": "Due studi peer-reviewed quasi-sperimentali, non RCT. Elbel et al. (2015, American Journal of Public Health): confronto difference-in-differences fra 9 scuole con water jets e 10 di comparazione, osservazioni prima e circa tre mesi dopo e un follow-up parziale a un anno, outcome eventi di prelievo d'acqua e latte. Schwartz et al. (2016, JAMA Pediatrics): adozione scaglionata nel periodo scolastico 2008/09–2012/13 in 1.227 scuole e 1.065.562 studenti; difference-in-differences con effetti fissi di scuola e specificazioni più conservative con effetti fissi individuali; outcome zBMI, sovrappeso, obesità e acquisti di latte. La data amministrativa di consegna misura esposizione, non utilizzo individuale.",
    "comparator": "Scuole non ancora dotate di erogatore nel medesimo periodo; per BMI confronto tra esiti degli alunni delle scuole trattate e non trattate prima/dopo installazione, controllando per anno, grado, caratteristiche e effetti fissi; seconda analisi usa effetti fissi individuali. Nessuna assegnazione casuale degli erogatori.",
    "outcomes": [
      "eventi osservati di prelievo d'acqua per 100 alunni durante il pranzo",
      "eventi osservati di prelievo del latte per 100 alunni",
      "indice di massa corporea standardizzato per età e sesso (zBMI)",
      "probabilità di sovrappeso e obesità",
      "cartoni di latte acquistati per studente/anno (proxy amministrativa non equivalente al consumo)"
    ],
    "results": "Nell'analisi di 19 scuole, dopo circa tre mesi il prelievo d'acqua è triplicato rispetto al gruppo di confronto (+21,63 eventi per 100 alunni; p<0,001); prelievi di latte −6,73 per 100 (p=0,012), calo non evidente al follow-up parziale di un anno. Nella valutazione ampia JAMA Pediatrics la disponibilità di water jets si associa a zBMI ridotto di 0,025 nei maschi e 0,022 nelle femmine e minore probabilità di sovrappeso di 0,9 e 0,6 punti percentuali nelle specificazioni con effetti fissi di scuola. Con effetti fissi individuali restano significativi zBMI e sovrappeso per i maschi, mentre zBMI delle femmine (p=0,11) e loro sovrappeso (p=0,07) non risultano significativi al 5%. Le vendite/acquisti di latte calano, principalmente quello al cioccolato, ma il consumo effettivo non è stato misurato. Non è provato un effetto certo e uniforme sull'obesità clinica.",
    "effectSize": "Elbel et al. (2015): +21,63 eventi di prelievo acqua/100 alunni (circa triplicati) e −6,73 prelievi latte/100 dopo circa 3 mesi. Schwartz et al. (2016): zBMI maschi −0,025 (IC95% −0,038 a −0,011), femmine −0,022 (IC95% −0,035 a −0,008) con effetti fissi scuola; sovrappeso −0,9 e −0,6 punti percentuali rispettivamente; specifiche con effetti fissi individuali: zBMI maschi −0,017 significativo, femmine −0,014 non significativo, sovrappeso maschi −1,2 p.p. significativo, femmine −0,6 p.p. non significativo al 5%. Acquisti totali latte −5,15 cartoni da mezza pinta/studente/anno con effetti fissi scuola, contro −12,29 nella specificazione semplice; non sono 'litri bevuti'.",
    "evidenceStrength": "moderata",
    "costsRequirements": "L'articolo JAMA (2016) cita un costo una tantum indicativo di circa 1.000 USD per erogatore nell'esperienza storica NYC, non un preventivo attuale né il costo completo di utilizzo: occorrono verifiche della potabilità, accessibilità, presa elettrica o allaccio secondo modello, igiene, sanificazione, approvvigionamento bicchieri o borracce, manutenzione e riparazione. Manca una valutazione completa costi-benefici e delle eventuali riduzioni dei rifiuti.",
    "limitations": [
      "L'installazione non è randomizzata: selezione delle scuole e politiche alimentari concomitanti possono confondere un effetto causale pienamente identificato.",
      "La stima JAMA dell'esposizione deriva dalla data di consegna del macchinario, non da misure individuali del consumo d'acqua.",
      "I risultati sulle ragazze per zBMI/sovrappeso perdono significatività al 5% nel modello più conservativo con effetti fissi individuali; non affermare un impatto certo su tutti.",
      "Lo studio sui comportamenti ha solo 9 scuole trattate e 10 controlli; follow-up a un anno incompleto e cambiamento delle dotazioni anche in alcune scuole di confronto.",
      "La riduzione degli acquisti di latte non prova diminuzione dell'effettivo consumo; non sono osservate le bevande introdotte dagli studenti dall'esterno.",
      "Non esiste nello studio una verifica clinica dell'effetto a lungo termine o un calcolo del costo per caso di sovrappeso evitato.",
      "La manutenzione, la qualità dell'acqua e l'adeguatezza delle strutture italiane richiedono verifiche locali, non automatica replicazione dello schema USA."
    ],
    "unintendedEffects": "Gli eventi di prelievo del latte sono diminuiti nel breve periodo e gli acquisti di latte, soprattutto al cioccolato, sono risultati inferiori. Possibile sostituzione di bevande nutritive: rischio da monitorare ma nessun danno nutrizionale documentato e nessuna prova di riduzione del consumo complessivo di nutrienti. Considerare uso di bicchieri monouso, pulizia e sicurezza sanitaria; lo studio non ne quantifica i costi né le esternalità.",
    "primarySource": {
      "label": "NYC Public Schools — Citywide School Wellness Policy, sezione acqua gratuita e refrigerated water jets",
      "url": "https://infohub.nyced.org/in-our-schools/policies/doe-wellness-policy"
    },
    "evaluationStudies": [
      {
        "label": "Schwartz et al. (2016), JAMA Pediatrics — studio originale full text",
        "url": "https://jamanetwork.com/journals/jamapediatrics/fullarticle/2480887",
        "citation": "Schwartz, A. E., Leardo, M., Aneja, S. e Elbel, B. (2016). Effect of a School-Based Water Intervention on Child Body Mass Index and Obesity. JAMA Pediatrics 170(3):220–226. Published online 19 January 2016.",
        "doi": "10.1001/jamapediatrics.2015.3778"
      },
      {
        "label": "Elbel et al. (2015), American Journal of Public Health — studio originale (PubMed/PMC)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/25521867/",
        "citation": "Elbel, B., Mijanovich, T., Abrams, C., et al. (2015). A water availability intervention in New York City public schools: influence on youths' water and milk behaviors. American Journal of Public Health 105(2):365–372.",
        "doi": "10.2105/AJPH.2014.302221"
      },
      {
        "label": "NYU School of Medicine — catalogo dati e metodi del sotto-studio acqua/latte",
        "url": "https://datacatalog.med.nyu.edu/dataset/10138",
        "citation": "NYU, Evaluation of the NYC Water Jets Program: 9 scuole trattate e 10 di confronto, osservazioni e interviste 2010–2011."
      }
    ],
    "lastVerifiedAt": "2026-11-19",
    "transferabilityItaly": "Trasferibile come intervento sull'accessibilità dell'acqua nelle mense e nei servizi educativi di competenza comunale, previa verifica degli obblighi italiani in tema di acqua potabile, igiene e ristorazione scolastica e del ruolo degli istituti e dei concessionari. Non trasferire il cambiamento ponderale come previsione quantitativa per alunni italiani, né raccogliere BMI individuali per il Comune senza specifica base giuridica, necessità e garanzie.",
    "lameziaAdaptation": "Partire dal servizio di refezione scolastica 2026/27 già documentato dal Comune di Lamezia Terme. Fare con dirigenti scolastici, gestore mensa e ASP una ricognizione scuola per scuola di accesso effettivo all'acqua potabile durante il pasto, qualità e manutenzione dei punti di erogazione, orari e reclami. Se le criticità sono reali, installare o rendere più accessibili erogatori con caratteristiche e controlli sanitari adeguati in una selezione volontaria di plessi, con introduzione scaglionata e scuole comparabili; rilevare indicatori non personali come litri o occasioni di erogazione, gradimento e costo del servizio, senza schedare i minori. Valutare con l'ASP eventuali outcome sanitari aggregati e solo se giuridicamente ed eticamente appropriato.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "elenco dei plessi comunali con mensa, punti d'acqua e stato manutentivo",
      "accordo operativo con istituti, concessionario refezione, Settore Servizi alla Persona e ASP",
      "verifiche di potabilità, sicurezza e sanificazione periodica",
      "stima completa dei costi di acquisto, manutenzione ed eventuali consumabili",
      "serie di indicatori aggregati sul servizio, inclusa accessibilità e uso effettivo",
      "gruppi comparabili e calendario di rollout documentati prima del pilota",
      "valutazione privacy e protezione dei minori; evitare raccolte superflue di informazioni sanitarie individuali"
    ],
    "tags": [
      "New York City",
      "Stati Uniti",
      "2008",
      "water jets",
      "mense scolastiche",
      "acqua potabile",
      "salute scolastica",
      "sovrappeso",
      "zBMI",
      "difference-in-differences",
      "valutazione quasi-sperimentale",
      "JAMA Pediatrics 2016",
      "AJPH 2015",
      "accesso all'acqua",
      "infrastruttura leggera"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-19",
        "note": "Prima catalogazione: Parallel Search per discovery, verifica diretta JAMA Pediatrics (2016), PubMed AJPH (2015), NYCPS School Wellness Policy e NYU data catalogue; deduplicazione per trattamento, città e DOI nella ricerca repository e PR. Salvaguardie: nessuna randomizzazione, effetti condizionati alle specificazioni, differenza tra prelievo di acqua, acquisti e consumo di latte, costo unitario solo storico, proposta per Lamezia subordinata a un audit di servizio e al trattamento rispettoso dei dati dei minori."
      }
    ]
  }
];
