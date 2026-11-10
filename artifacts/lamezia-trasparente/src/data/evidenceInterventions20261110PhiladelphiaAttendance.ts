import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified against IES original REL 2017-252 and NIJ programme review, 2026-11-10. */
export const EVIDENCE_INTERVENTIONS_2026_11_10_PHILADELPHIA_ATTENDANCE: readonly EvidenceIntervention[] = [
{
  "id": "philadelphia-school-absenteeism-postcard-guardians-rct-2014",
  "title": "Philadelphia: comunicazioni postali ai genitori per ridurre le assenze scolastiche",
  "authority": "School District of Philadelphia, in collaborazione con Regional Educational Laboratory Mid-Atlantic (Institute of Education Sciences)",
  "territory": "Philadelphia, Pennsylvania",
  "country": "Stati Uniti",
  "implementationYear": "2014 (invio nell'ottobre 2014; osservazione fino al 31 dicembre 2014)",
  "problem": "Assenze scolastiche frequenti e consapevolezza incompleta dei genitori sulla frequenza dei figli, con rischi educativi; necessità di verificare se messaggi informativi a basso costo migliorino la presenza, oltre le normali comunicazioni scolastiche.",
  "measure": "Nell'ottobre 2014 il distretto scolastico pubblico locale inviò una singola cartolina postale ai genitori/tutori di studenti di classe 1–12 che avevano registrato almeno un'assenza l'anno precedente: un gruppo ricevette un incoraggiamento generale alla frequenza; un altro lo stesso messaggio con il numero personale di assenze registrate l'anno precedente; il controllo non ricevette la cartolina aggiuntiva. Nessuna misura coercitiva, nessun cambiamento dell'obbligo scolastico.",
  "mechanism": "Rendere saliente l'importanza della frequenza e il ruolo del tutore, ridurre la disattenzione verso le assenze e incoraggiare il dialogo familiare con la scuola; la personalizzazione aggiuntiva non migliorò significativamente il risultato rispetto al semplice incoraggiamento.",
  "population": "38.187 coppie studente-tutore randomizzate nel campione analitico, in 217 scuole pubbliche, classi 1–12, tra eleggibili con almeno un'assenza nell'anno precedente; 12.756 incoraggiamento, 12.721 incoraggiamento+storico individuale, 12.710 controllo. Escluse famiglie con indirizzi non affidabili, alcune situazioni vulnerabili e altri gruppi secondo i criteri del protocollo.",
  "primaryArea": "istruzione_giovani",
  "secondaryAreas": [
    "welfare_inclusione_servizi_sociali",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "nudging_comunicazione",
    "informazione_trasparenza",
    "modifica_organizzativa_processo"
  ],
  "tools": [
    "cartolina postale a basso costo",
    "registri amministrativi giornalieri delle presenze",
    "sorteggio dell'assegnazione a tre gruppi",
    "messaggi approvati dal distretto e canale di contatto con la scuola",
    "monitoraggio assenze in 43 giorni scolastici"
  ],
  "territorialScale": "Distretto scolastico urbano (217 scuole; sperimentazione individuale all'interno delle scuole)",
  "interventionStatus": "Esperimento concluso nel 2014 e valutato nel rapporto ufficiale REL 2017-252 (2017); continuità dell'esatto intervento nel 2026 non verificata.",
  "evaluationMethod": "Randomized controlled trial individuale su tre bracci, con regressioni multilivello che tengono conto di scuola e classe e covariate; outcomes ricavati dai registri scolastici dal 9 ottobre al 31 dicembre 2014 (43 giorni). Differenza fra trattamento generico e controllo, trattamento personalizzato e generico, e analisi pooled trattamenti versus controllo.",
  "comparator": "12.710 studenti assegnati casualmente al gruppo che non ricevette la cartolina aggiuntiva; ulteriore comparatore randomizzato fra cartolina generica (n=12.756) e personalizzata (n=12.721). Tutti continuarono a ricevere i normali servizi scolastici e comunicazioni ordinarie.",
  "outcomes": [
    "giornate di assenza dopo l'invio",
    "incremento differenziale della personalizzazione",
    "eterogeneità della risposta per classi 1–8 vs 9–12"
  ],
  "results": "L'invio di una cartolina incoraggiante ridusse significativamente le assenze nell'orizzonte osservato; gli autori riportano una riduzione relativa di circa il 2,4% (non 2,4 punti percentuali). Nel confronto pooled delle due versioni, i trattati registrarono mediamente 3,29 giorni di assenza e il controllo 3,45 giorni nei 43 giorni scolastici osservati (differenza stimata −0,16 giorni; p=0,0001 secondo Tabella B9). Per la sola cartolina generica rispetto al controllo la differenza stimata è −0,13 giorni (p=0,004; Tabella B7). Non emerge beneficio incrementale statisticamente significativo della versione con lo storico individuale (p=0,361); nessuna differenza significativa fra classi 1–8 e 9–12. Non si sono misurati causalmente risultati di diploma o apprendimento a lungo termine.",
  "effectSize": "Rapporto IES: assenze circa −2,4% in termini relativi (stima percentuale riportata dagli autori); Tabella B7 cartolina generica vs controllo: −0,13 giorni in 43 giorni, p=0,004 (medie 3,31 vs 3,45); Tabella B9 bracci uniti vs controllo: −0,16 giorni, p=0,0001 (3,29 vs 3,45); Tabella B8 cartolina personalizzata vs generica: −0,04 giorni, p=0,361, NON significativo. Percentuale modellata e differenze in giorni non vanno trattate come la stessa metrica, né confuse con punti percentuali del tasso di assenza.",
  "evidenceStrength": "forte",
  "costsRequirements": "Il rapporto originale riporta circa 0,22 USD per cartolina, inviata con servizi postali in grandi lotti nel 2014; non è un preventivo italiano del 2026 e non comprende necessariamente progettazione, pulizia anagrafiche, gestione casi e valutazione. Necessari dati accurati di presenza, recapiti sicuri, personale amministrativo e referenti scolastici; costi effettivi italiani da stimare.",
  "limitations": [
    "Orizzonte molto breve: solo 43 giorni scolastici, dal 9 ottobre al 31 dicembre 2014; non verificata persistenza dell'effetto oltre il periodo.",
    "Domicili senza recapito postale affidabile esclusi; lo studio non copre adeguatamente studenti senza dimora o in affido e alcuni gruppi di maggiore vulnerabilità.",
    "Analisi basata su campione di eleggibili che avevano almeno un'assenza l'anno precedente; non generalizzabile automaticamente a studenti con presenza perfetta o ad altri sistemi educativi.",
    "Numero elevato di combinazioni scuola/classe ha ridotto la potenza per identificare differenze fra versioni dei messaggi o livelli scolastici: assenza di significatività non prova equivalenza.",
    "Lo studio non identifica l'impatto su apprendimento, diplomati o abbandono scolastico a lungo termine; l'associazione fra assenze e abbandono non dimostra causalità di questi esiti.",
    "Un comune italiano non gestisce unilateralmente i registri delle presenze delle scuole: necessaria intesa con dirigenti scolastici e titolarità, ruoli privacy, competenze e base giuridica per comunicazioni ai tutori.",
    "I trasferimenti da scuola e record di frequenza incompleti sono stati esclusi dall'analisi; gli autori non rilevano squilibri significativi per gruppo ma resta una restrizione del campione."
  ],
  "unintendedEffects": "Lo studio non documenta effetti avversi statisticamente verificati. Da monitorare in eventuale replica: stigmatizzazione dei nuclei vulnerabili, messaggi erronei dovuti a registri incompleti, difficoltà di recapito e sovraccarico dei servizi scolastici, senza presentarli come effetti osservati.",
  "primarySource": {
    "label": "U.S. Department of Education / IES — valutazione ufficiale del programma svolto con School District of Philadelphia (REL 2017-252)",
    "url": "https://ies.ed.gov/use-work/resource-library/report/impact-study/randomized-experiment-using-absenteeism-information-nudge-attendance"
  },
  "evaluationStudies": [
    {
      "label": "IES — rapporto integrale originale, tabelle B7–B9 e appendice dei messaggi",
      "url": "https://ies.ed.gov/ncee/rel/regions/midatlantic/pdf/REL_2017252.pdf",
      "citation": "Rogers, T., Duncan, T., Wolford, T., Ternovski, J., Subramanyam, S. & Reitano, A. (2017). A randomized experiment using absenteeism information to ‘nudge’ attendance (REL 2017-252). U.S. Department of Education, Institute of Education Sciences. Rapporto istituzionale; DOI non attribuito."
    },
    {
      "label": "National Institute of Justice — revisione indipendente del programma",
      "url": "https://crimesolutions.ojp.gov/ratedprograms/using-absenteeism-information-nudge-attendance-philadelphia-pa",
      "citation": "U.S. Department of Justice, National Institute of Justice, CrimeSolutions (2024). Using Absenteeism Information to ‘Nudge’ Attendance (Philadelphia, Pa.), valutazione del programma."
    }
  ],
  "lastVerifiedAt": "2026-11-10",
  "transferabilityItaly": "Alta per il principio di comunicazione semplice e verificabile, ma competenze comunali italiane differenti: la frequenza scolastica è gestita dalle istituzioni scolastiche; il Comune può proporre raccordo con dirigenti e servizi sociali, non inviare autonomamente elenchi di assenti. I risultati statunitensi non sono previsione quantitativa per Lamezia; necessarie base giuridica, tutela minori e valutazione sperimentale.",
  "lameziaAdaptation": "L'Ufficio Politiche educative di Lamezia cura rapporti con le scuole, assistenza scolastica e diritto allo studio; con dirigenti degli istituti scolastici, servizi sociali e ufficio privacy si può elaborare un protocollo sperimentale di comunicazioni non sanzionatorie alle famiglie con assenze ripetute, collegando l'avviso a un contatto umano e ai servizi scolastici/trasporto/sociali. Partire da 2–3 scuole volontarie e co-progettare testo, accessibilità, modalità di invio e registrazione degli esiti; se le condizioni etiche e legali lo consentono, allocare casualmente calendario o formato delle comunicazioni senza negare servizi o tutele dovuti. Pubblicare solo dati aggregati, controllare disuguaglianze e verificare assenze totali/ingiustificate, tempo di presa in carico e ritorno a frequenza regolare.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "accordo con dirigenti e responsabili delle scuole partecipanti e riparto ruoli GDPR",
    "dati amministrativi affidabili di frequenza con definizioni omogenee",
    "recapiti tutori aggiornati e canali accessibili anche a famiglie senza domicilio affidabile",
    "testo chiaro, non stigmatizzante e validato da scuole/servizi sociali",
    "protocollo di valutazione pre-registrato con comparatore eticamente ammissibile",
    "monitoraggio degli outcome per fragilità e degli effetti indesiderati",
    "stima costi unitari italiani e disponibilità di personale per follow-up"
  ],
  "tags": [
    "Philadelphia",
    "Stati Uniti",
    "frequenza scolastica",
    "assenteismo",
    "comunicazione ai genitori",
    "behavioral insights",
    "nudge",
    "cartoline",
    "RCT",
    "registro presenze",
    "REL-2017-252",
    "School District of Philadelphia",
    "dispersione scolastica",
    "scuola",
    "GDPR"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-10",
      "note": "Nuovo censimento verificato sul rapporto originale IES REL 2017-252 e sulle tabelle B7–B9, con revisione indipendente NIJ. Distinte riduzione relativa 2,4%, medie in giorni, beneficio non significativo della personalizzazione, durata 43 giorni ed esclusioni del campione. Confronto con moduli dell'archivio esistente per evitare casi ripetuti; nessuna dichiarazione di persistenza nel 2026."
    }
  ]
}
];
