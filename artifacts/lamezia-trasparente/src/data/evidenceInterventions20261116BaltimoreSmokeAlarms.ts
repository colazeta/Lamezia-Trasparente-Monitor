import type { EvidenceIntervention } from "./evidenceInterventions";

/** Baltimore City Fire Department: RCT territoriale 2010–2011, verificato 2026-11-16. */
export const EVIDENCE_INTERVENTIONS_2026_11_16_BALTIMORE_SMOKE_ALARMS: readonly EvidenceIntervention[] = [
  {
    "id": "baltimore-city-fire-department-enhanced-home-smoke-alarm-visits-2010",
    "title": "Baltimore: visite domiciliari potenziate per installare rilevatori di fumo — studio randomizzato territoriale",
    "authority": "Baltimore City Fire Department (BCFD), Johns Hopkins Center for Injury Research and Policy, Environmental Justice Partnership e Urban Health Institute",
    "territory": "12 census tracts di East Baltimore, Maryland; programma ordinario sull'intera città",
    "country": "Stati Uniti",
    "implementationYear": "2010–2011 (sperimentazione con visite fra aprile 2010 e aprile 2011); programma municipale ordinario di installazione gratuita ancora documentato nel 2026",
    "problem": "Nei quartieri urbani vulnerabili molti alloggi non dispongono di rilevatori di fumo funzionanti su ogni piano. I vigili del fuoco raggiungono solo parte delle abitazioni e non sempre ottengono il consenso all'ingresso e all'installazione.",
    "measure": "Rafforzamento sperimentale del programma di visite domiciliari gratuito del Baltimore City Fire Department: comunicazione preventiva e porta-a-porta attraverso operatori di comunità, accompagnamento di un educatore sanitario per consigli individualizzati e, quando disponibile, centro mobile di educazione alla sicurezza. In entrambi i gruppi, i vigili del fuoco testavano/installavano senza costo rilevatori di fumo con batteria al litio di 10 anni e fornivano istruzioni di base.",
    "mechanism": "Promozione anticipata e mediazione di prossimità aumentano la fiducia e la disponibilità ad accogliere una visita volontaria; installazione diretta di dispositivi durevoli rimuove barriere pratiche e di costo. L'intervento aggiuntivo non modifica la protezione offerta dal servizio standard se il residente consente l'ingresso.",
    "population": "8.080 abitazioni considerate eleggibili e raggiunte dal programma nei 12 tratti censuari; 603 nuclei nel campione di rilevazione baseline; la valutazione del mantenimento a sei mesi riguarda 754 residenti con follow-up, selezionati tra chi aveva accettato visita e questionari.",
    "primaryArea": "salute_pubblica_locale",
    "secondaryAreas": [
      "sicurezza_urbana_prevenzione",
      "welfare_inclusione_servizi_sociali",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "servizio_diretto",
      "nudging_comunicazione",
      "partnership_pubblico_privato_terzo_settore",
      "formazione_capacity_building",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "visite domiciliari volontarie e installazione gratuita di rilevatori di fumo decennali",
      "promozione preventiva del quartiere, locandine e comunicazioni porta-a-porta",
      "operatori sanitari di comunità (CHW) ed educatore per prevenzione incendi, scottature e monossido",
      "centro mobile CARES di educazione alla sicurezza, ove disponibile",
      "manuale operativo BCFD e formazione dei pompieri",
      "misurazioni di campo, registri di visita e controllo del funzionamento dei rilevatori"
    ],
    "territorialScale": "Intervento sperimentale randomizzato per 12 tratti censuari (6 potenziati, 6 standard) nell'area di East Baltimore; servizio istituzionale di base disponibile su scala cittadina.",
    "interventionStatus": "Trattamento potenziato valutato nel 2010–2011, non dimostrato tuttora attivo nella sua forma sperimentale. Il programma cittadino standard di fornitura e installazione gratuita tramite 311 risulta ancora documentato nella pagina ufficiale consultata nel novembre 2026.",
    "evaluationMethod": "Cluster randomized trial: sei census tracts randomizzati alla procedura standard e sei a un pacchetto potenziato; outcome di processo rilevati durante visite aprile 2010–aprile 2011 (Gielen et al., 2013). Follow-up osservazionale nei soli partecipanti con questionario a sei mesi (Gielen et al., 2016) e valutazione economica modellata delle morti prevenute (2013/2014): non sono trial indipendenti né misure dirette di mortalità. L'analisi primaria riporta confronti di proporzioni; pochi cluster limitano la precisione e la generalizzabilità.",
    "comparator": "Programma BCFD ordinario di visita porta-a-porta con installazione gratuita e istruzioni standard, SENZA promozione preventiva ed educazione potenziata; non un gruppo senza rilevatori. Il confronto economico aggiunge uno scenario teorico senza visite, non sperimentato randomicamente nel medesimo trial.",
    "outcomes": [
      "consenso all'ingresso domiciliare fra residenti presenti",
      "consenso all'installazione fra abitazioni visitate",
      "abitazioni dotate di rilevatore funzionante su ciascun piano all'uscita",
      "numero medio di rilevatori installati per visita accettata",
      "funzionamento dei rilevatori a sei mesi tra rispondenti al follow-up",
      "costo e vite potenzialmente salvate secondo modello economico, non decessi osservati"
    ],
    "results": "Nelle abitazioni con residente presente, l'ingresso era consentito nel 75% delle comunità potenziate contro il 62% delle standard; fra case accessibili, consenso all'installazione 95% contro 92% e rilevatore funzionante su ciascun piano al termine della visita nell'84% contro il 78%. In entrambi i gruppi era a casa un residente soltanto nel 40% degli indirizzi tentati. Un follow-up a sei mesi su un sottocampione con risposte complete non riscontrava differenza statisticamente significativa fra trattamenti sul mantenimento dei dispositivi; l'81% di quelli inizialmente completi continuava a esserlo. Il modello economico indica che anche le visite standard possono essere convenienti; la procedura potenziata costa di più per beneficio incrementale modellato.",
    "effectSize": "Ingresso consentito: 75% vs 62% (+13 punti percentuali, differenza condizionata alla presenza in casa). Consenso installazione: 95% vs 92% (+3 pp tra case accessibili). Protezione su ogni piano a fine visita: 84% vs 78% (+6 pp tra case entrate); rilevatori installati: 1,89 vs 1,74 per casa visitata. 6 mesi: 81% degli alloggi inizialmente protetti ancora protetti nel sottocampione, nessun incremento relativo significativo del braccio potenziato. Modello economico: 0,24 vite/10.000 case/10 anni standard vs nessuna visita e 0,07 vite incrementali per potenziamento vs standard, SOLO proiezioni non osservazioni.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Occorrono dispositivi certificati, personale dei Vigili del Fuoco competente per l'installazione, coordinamento logistico, comunicazione multicanale, formazione e accesso consensuale; la visita potenziata aggiunge operatori di comunità/educatori e materiali. Studio economico: costo modellato incrementale per morte evitata 28.252 USD per visita standard vs assenza programma e 284.501 USD per procedura potenziata vs standard; valori storici modellati su rischio relativo di decesso, NON costi per morte effettivamente evitata o preventivi correnti per l'Italia.",
    "limitations": [
      "Solo 12 tratti censuari randomizzati: rischio di imprecisione dovuto al piccolo numero di cluster e possibili correlazioni intra-zona; eventi e nuclei individuali non equivalgono a unità randomizzate indipendenti.",
      "Esiti positivi soprattutto di processo e disponibilità di rilevatori alla fine della visita; nessuna rilevazione causale di incendi, feriti, morti o danni materiali ridotti.",
      "La differenza 75% vs 62% è tra chi era in casa; solo circa il 40% degli indirizzi aveva residenti presenti. Non equivale a +13 pp di copertura sull'intera città.",
      "Il follow-up a sei mesi coinvolge esclusivamente famiglie che avevano consentito ingresso e partecipazione ai questionari; non identifica effetti intention-to-treat sull'intero campione randomizzato.",
      "A sei mesi non emerge differenza statisticamente significativa fra standard ed enhanced nella quota di alloggi con rilevatori funzionanti su tutti i piani.",
      "La valutazione economica usa rischi di morte da altri studi e ipotesi di modello; la differenza di costo incrementale indica che l'opzione standard può essere più efficiente.",
      "La sperimentazione risale al 2010–2011 in quartieri specifici degli USA e non dimostra efficacia o necessità equivalenti in un comune italiano.",
      "Le competenze per attività antincendio, accesso domiciliare e dotazioni richiedono verifica con Corpo nazionale dei Vigili del Fuoco, protezione civile, servizi sociali e normativa italiana; nessun accesso forzato o schedatura di residenti."
    ],
    "unintendedEffects": "Lo studio non misura effetti avversi su mortalità, privacy, visite indesiderate o equità. La promozione non incrementa la quota di residenti trovati in casa (circa 40% entrambi i gruppi); il trattamento potenziato richiede risorse aggiuntive e non mostra un beneficio significativo a sei mesi, quindi può essere meno costo-efficiente della procedura standard. Le visite devono restare volontarie, accessibili e rispettose della riservatezza.",
    "primarySource": {
      "label": "Baltimore City Fire Department — servizio 311 di fornitura e installazione gratuita di smoke alarms, pagina comunale ufficiale",
      "url": "https://www.baltimorecity.gov/fire/request-a-smoke-alarm"
    },
    "evaluationStudies": [
      {
        "label": "Gielen et al. (2013), studio originale randomizzato — J Burn Care Res / PMC",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3610828/",
        "citation": "Gielen, A. C. et al. (2013). Enhancing Fire Department Home Visiting Programs: Results of a Community Intervention Trial. Journal of Burn Care & Research 34(4):e250–e256.",
        "doi": "10.1097/BCR.0b013e3182685b3a"
      },
      {
        "label": "Follow-up del programma a sei mesi — studio originale completo PMC",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5005669/",
        "citation": "Changes in smoke alarm coverage following two fire department home visiting programs: what predicts success? Studio con follow-up a 6 mesi del medesimo intervento, analisi su partecipanti selezionati."
      },
      {
        "label": "Valutazione economica originale — PubMed",
        "url": "https://pubmed.ncbi.nlm.nih.gov/24154622/",
        "citation": "Economic evaluation of smoke alarm distribution methods in Baltimore, Maryland. Injury Prevention. Modello di costo-efficacia e decessi attesi, non osservati.",
        "doi": "10.1136/injuryprev-2013-040885"
      },
      {
        "label": "Johns Hopkins Center for Injury Research and Policy — programma Baltimore free smoke alarms",
        "url": "https://publichealth.jhu.edu/center-for-injury-research-and-policy/our-work/safety-in-and-around-the-home",
        "citation": "Johns Hopkins Bloomberg School of Public Health, Safety In and Around the Home, documentazione della partnership e programma tuttora istituzionale."
      },
      {
        "label": "Comune di Lamezia Terme — ordinanza comunale di prevenzione incendi 2026 (ambito boschivo, non domiciliare)",
        "url": "https://www.comune.lamezia-terme.cz.it/it/news/1999018",
        "citation": "Comune di Lamezia Terme (22 maggio 2026), Ordinanza prevenzione incendi: disciplina per incendi estivi e terreni; contesto di prevenzione locale, NON programma di rilevatori domestici."
      }
    ],
    "lastVerifiedAt": "2026-11-16",
    "transferabilityItaly": "Trasferibile soprattutto la collaborazione tra Comune, Corpo nazionale Vigili del Fuoco, assistenza sociale e organizzazioni di comunità per identificare bisogni e offrire informazioni e dispositivi su base volontaria. Non trasferire competenze del fire department statunitense direttamente a un comune italiano; verifica preventiva di requisiti tecnici, titolarità degli interventi, privacy e risorse.",
    "lameziaAdaptation": "Prima accertare con Vigili del Fuoco di Catanzaro/distaccamento di Lamezia e servizi sociali se esistano già servizi gratuiti o iniziative di prevenzione incendi domestici, senza confondere l'ordinanza antincendi boschivi 2026 con la sicurezza nelle abitazioni. Pilotare eventuale campagna informativa con prenotazione volontaria per persone anziane, persone con disabilità e nuclei in alloggi a rischio, concordando visite con figure autorizzate e associazioni. Rilevare per zona solo dati aggregati di adesione, installazione e verifica funzionamento 6–12 mesi; confrontare la campagna di base con una comunicazione di prossimità intensiva se budget e valutazione etica lo consentono. Non affermare che il pilota riduca direttamente incendi o mortalità.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "mappatura degli interventi già esistenti dei Vigili del Fuoco e delle reti sociali, con accordo scritto sui rispettivi ruoli",
      "verifica della normativa tecnica e delle responsabilità per fornitura/installazione di rilevatori in diversi edifici",
      "disponibilità di dispositivi omologati, personale autorizzato, budget per installazione e visite di controllo",
      "definizione di modalità di adesione volontaria, informative privacy e minimizzazione dei dati domestici",
      "baseline aggregata delle esigenze tramite servizi sociali e questionario non intrusivo, evitando profili nominativi pubblici",
      "indicatori di adesione, copertura iniziale e mantenimento a 6–12 mesi con gruppo comparatore corretto e costi completi"
    ],
    "tags": [
      "Baltimore",
      "Maryland",
      "Vigili del Fuoco",
      "smoke alarms",
      "rilevatori di fumo",
      "prevenzione domestica",
      "incendi domestici",
      "salute pubblica",
      "RCT a cluster",
      "12 quartieri",
      "Johns Hopkins",
      "operatori di comunità",
      "outreach",
      "costo-efficacia",
      "follow-up sei mesi",
      "Lamezia Terme"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-16",
        "note": "Record nuovo: discovery con Parallel Search e verifica diretta dello studio randomizzato originale Gielen et al. (2013), del follow-up a sei mesi, dell'analisi economica e del servizio ufficiale del Baltimore City Fire Department. Controllata deduplicazione su 65 moduli dell'archivio in main e PR mirate. Separati indicatori di processo, esiti non significativi al follow-up e decessi soltanto modellati; forza moderata per 12 cluster e trasferibilità italiana condizionata."
      }
    ]
  }
];
