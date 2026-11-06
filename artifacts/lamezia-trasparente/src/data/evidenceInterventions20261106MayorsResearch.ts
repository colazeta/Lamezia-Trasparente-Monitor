import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified 2026-11-06: CNM 2016 randomized evidence briefing; IV adoption outcome not municipal revenue. */
export const EVIDENCE_INTERVENTIONS_2026_11_06_MAYORS_RESEARCH: readonly EvidenceIntervention[] = [
  {
    "id": "brazil-cnm-mayors-research-evidence-policy-adoption-rct-2016",
    "title": "Brasile: presentare ai sindaci valutazioni d'impatto aumenta l'adozione di interventi comunali basati sull'evidenza",
    "authority": "Confederação Nacional de Municípios (CNM) e ricercatori Columbia, Harvard, UC Davis e IPA; decisione di adozione rimessa ai singoli comuni brasiliani",
    "territory": "1.818 municipalità brasiliane con sindaci presenti al seminario Novos Gestores di Brasília; fase distinta su 579 municipalità",
    "country": "Brasile",
    "implementationYear": "2016 (sessioni di formazione/informazione); adozioni rilevate 15–24 mesi dopo",
    "problem": "La ricerca valutativa su interventi comunali di efficacia dimostrata può non raggiungere i decisori, contribuendo a mancata adozione di politiche semplici e potenzialmente utili.",
    "measure": "Durante il convegno CNM Novos Gestores 2016, un sottoinsieme casuale di sindaci ricevette inviti a sessioni facoltative di 45 minuti con una presentazione accessibile di risultati di RCT sui solleciti tributari, esempi di comunicazioni amministrative, dimensioni degli effetti e un policy brief con riferimenti agli studi. La politica di sollecito era facoltativa e la sua eventuale attuazione veniva decisa autonomamente dal comune.",
    "mechanism": "Ridurre i costi informativi dei decisori e rendere credibili e praticabili i risultati della ricerca tramite comunicazione sintetica, dati quantitativi, esempi operativi e materiali riutilizzabili; l'esperimento misura adozione di policy, non impatto diretto sui contribuenti.",
    "population": "1.818 sindaci di comuni principalmente tra 5.000 e 100.000 abitanti: 881 randomizzati all'invito, 937 al controllo. 37,9% degli invitati frequentò la sessione, contro meno dell'1% dei controlli. Esperimento distinto sulle convinzioni: 764 funzionari di 579 comuni.",
    "primaryArea": "capacita_amministrativa_personale",
    "secondaryAreas": [
      "fiscalita_entrate_riscossione"
    ],
    "interventionTypes": [
      "formazione_capacity_building",
      "informazione_trasparenza",
      "modifica_organizzativa_processo",
      "partnership_pubblico_privato_terzo_settore"
    ],
    "tools": [
      "inviti randomizzati a sessione facoltativa",
      "lezione di 45 minuti con 30 minuti di presentazione e 15 di domande",
      "scheda di policy con riferimenti e risultati RCT",
      "template di sollecito tributario",
      "follow-up telefonico di sindaci e responsabili tributari dopo 15–24 mesi"
    ],
    "territorialScale": "Multi-comunale, municipi di scala piccola e media in Brasile; trattamento svolto a un congresso nazionale di amministratori locali.",
    "interventionStatus": "Esperimento puntuale completato, con follow-up successivo; non risulta verificata una riproposizione stabile della specifica sessione sperimentale, né un'unica politica nazionale imposta ai municipi.",
    "evaluationMethod": "Randomized encouragement design: 1.818 sindaci stratificati assegnati a invito o controllo; partecipazione facoltativa. Analisi IV/2SLS (invito randomizzato come strumento della frequenza alla sessione) per effetto sui partecipanti/compliers e intention-to-treat nell'appendice. Follow-up su policy auto-riferita 15–24 mesi dopo; errori standard raggruppati per comune.",
    "comparator": "937 sindaci non invitati randomicamente alle sessioni informative specifiche; i 881 invitati potevano non partecipare. Confronto di adozione di solleciti comunali riportata da sindaci e uffici tributi; baseline circa 31,7% nel controllo della Tabella 7.",
    "outcomes": [
      "adozione dichiarata di lettere di sollecito tributario nei comuni a 15–24 mesi",
      "partecipazione dei sindaci alle sessioni",
      "accuratezza delle convinzioni sull'efficacia dei solleciti",
      "eventuale utilizzo di componenti delle lettere (scadenza, sanzioni effettive, norma sociale)"
    ],
    "results": "La sessione informativa ha aumentato la probabilità che un comune dichiari di utilizzare lettere di sollecito dei tributi. La stima IV per la frequenza effettiva è +10,3 punti percentuali rispetto a una media del 31,7% nel controllo, ma l'incertezza è importante (SE 5,3 pp; test bilaterale vicino a p=0,05). Poiché solo il 37,9% degli invitati frequentò la sessione, +10,3 pp NON è l'effetto dell'invito su tutti i sindaci. Non sono osservati né l'aumento del gettito né il cambiamento effettivo del comportamento dei contribuenti.",
    "effectSize": "Hjort et al. (2021), Tabella 7, colonna 1: ToT/2SLS +0,1031 (SE 0,0531; circa +10,3 punti percentuali), contro 0,317, con 2.271 risposte di 1.465 comuni; effetto prossimo alla soglia del 5% (rapporto coefficiente/SE≈1,94). Assegnazione iniziale: 881 inviti e 937 controlli; partecipazione effettiva 37,9% vs <1%. L'ITT riguarda l'invito e non deve essere equiparato al ToT; nessuna stima di incremento del gettito.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Richiede selezione critica di valutazioni applicabili, personale in grado di tradurre studi in procedure, almeno 45 minuti di formazione più preparazione e policy brief, supporto dei dirigenti settoriali e follow-up sull'adozione. Lo studio non fornisce una stima completa del costo di implementazione e non misura un ritorno finanziario; l'effetto di +10,3 pp non è una stima di ricavi comunali.",
    "limitations": [
      "Esito primario auto-riferito da sindaci o responsabili tributari tramite interviste telefoniche, senza verifica amministrativa generalizzata delle lettere effettivamente inviate o dei pagamenti.",
      "La stima principale +10,3 pp è ToT IV, non ITT dell'invito; precisione limitata (SE 5,3 pp, significatività bilaterale borderline), e l'assunzione di esclusione può essere vulnerabile a policy brief inviati anche agli invitati assenti.",
      "Risposta endline in almeno un referente per l'81% dei comuni, con mancata risposta residua; i ricercatori non rilevano attrition differenziale, ma non possono escludere ogni bias informativo.",
      "Le lettere potrebbero essere state adottate per motivi diversi dall'assimilazione dei risultati scientifici; la sessione combinava informazione, attenzione dedicata a un problema e template pratico.",
      "La popolazione era selezionata fra i sindaci che partecipavano alla conferenza CNM, circa il 45% dei comuni nella fascia dimensionale eleggibile; non è rappresentativa di tutti i comuni brasiliani o italiani.",
      "Il primo esperimento sulle convinzioni era distinto da quello di adozione; non si può sommare il suo campione di 579 comuni ai 1.818 comuni del secondo come se fossero un unico trial.",
      "Non è stata misurata alcuna riduzione delle morosità o crescita delle entrate causata dalle sessioni; l'efficacia delle lettere viene da studi separati e non equivale al risultato di questo esperimento."
    ],
    "unintendedEffects": "Nessun effetto avverso direttamente misurato sulle entrate o sui cittadini. Opportunità alternativa potenzialmente sacrificata: i sindaci potevano rinunciare a formazione concorrente e networking. In una replica, rischi di selezione opportunistica di studi, semplificazioni eccessive e pressioni a copiare policy in contesti non comparabili.",
    "primarySource": {
      "label": "Confederação Nacional de Municípios — avviso istituzionale originale Seminário Novos Gestores (7 ottobre 2016)",
      "url": "https://cnm.org.br/comunicacao/noticias/seminario-novos-gestores-pretende-trazer-todos-os-prefeitos-eleitos-a-brasilia"
    },
    "evaluationStudies": [
      {
        "label": "Hjort et al. (2021), American Economic Review — versione scientifica definitiva",
        "url": "https://doi.org/10.1257/aer.20190830",
        "citation": "Hjort, J., Moreira, D., Rao, G. & Santini, J. F. (2021). How Research Affects Policy: Experimental Evidence from 2,150 Brazilian Municipalities. American Economic Review, 111(5), 1442–1480.",
        "doi": "10.1257/aer.20190830"
      },
      {
        "label": "Articolo originale completo in accesso libero, Columbia Business School, Tabella 7",
        "url": "https://business.columbia.edu/sites/default/files-efs/pubfiles/28400/How_Research_Affects_Policy.pdf",
        "citation": "Hjort et al. (2021), versione d'autore della pubblicazione definitiva, con dettagli su randomizzazione, ToT e limitazioni."
      },
      {
        "label": "NBER working paper 25941, versione preliminare e descrizione dei due esperimenti",
        "url": "https://www.nber.org/papers/w25941",
        "citation": "Hjort et al. (2019), NBER Working Paper 25941."
      }
    ],
    "lastVerifiedAt": "2026-11-06",
    "transferabilityItaly": "Il principio di formazione dei decisori su risultati empirici verificati è trasferibile ai Comuni italiani con funzioni di programmazione e controllo. Non basta fornire accesso agli studi: servono sintesi leggibili, comparatori, schede di implementabilità, responsabilità politiche e amministrative, valutazioni giuridiche, dati sugli outcome e verifiche dell'adozione reale. Non importare senza controllo il modello brasiliano di sollecito tributario.",
    "lameziaAdaptation": "Proporre a Giunta, Segreteria generale, dirigenti e referenti del PIAO di Lamezia una sessione trimestrale di 45 minuti 'Evidenza → azione', basata sulle schede di Lamezia Trasparente, a partire da 2-3 interventi con stime causali e adeguata trasferibilità. Per ogni scheda produrre un policy brief con problema, controfattuale, effetti e limiti, competenze dell'ufficio, costi/dati, prova di fattibilità e decisione motivata (adottare, pilota, non adottare). Misurare dopo 6 e 12 mesi le delibere, gli atti e le misure effettivamente implementate, non il solo numero di partecipanti. Allineare le decisioni con la sezione Performance del PIAO 2026–2028; non promettere incrementi automatici di gettito.",
    "implementability": "quick_win",
    "capacityDataNeeds": [
      "catalogo di evidenze con peer review dei metodi e deduplicazione",
      "presidio tecnico per policy briefs di massimo due pagine",
      "condivisione con segreteria e responsabili dei servizi",
      "registro decisionale datato con identificativi di atti e responsabili",
      "follow-up sull'adozione effettiva, costi e indicatori di outcome",
      "regole per distinguere conclusioni scientifiche e discrezionalità politico-amministrativa"
    ],
    "tags": [
      "Brasile",
      "CNM",
      "sindaci",
      "evidence-informed policymaking",
      "RCT",
      "encouragement design",
      "IV",
      "TOT",
      "scelte pubbliche",
      "capacità amministrativa",
      "formazione",
      "solleciti tributari",
      "policy brief",
      "PIAO",
      "adozione di interventi"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-06",
        "note": "Primo censimento basato sull'articolo AER originale con Tabella 7, fonte CNM del 2016 e confronto diretto con archivio GitHub. Separati ToT e ITT, adozione auto-riferita e gettito non osservato; classificazione prudente moderata per incertezza e reporting."
      }
    ]
  }
];
