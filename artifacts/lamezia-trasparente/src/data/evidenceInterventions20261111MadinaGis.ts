import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified using NBER WP 29923, revision February 2025, and J-PAL; 2026-11-11. */
export const EVIDENCE_INTERVENTIONS_2026_11_11_MADINA_GIS: readonly EvidenceIntervention[] = [
{
  "id": "madina-ghana-municipal-property-tax-gis-tablet-rct-2021",
  "title": "Madina (Ghana): geolocalizzazione GIS per la riscossione immobiliare e rischio di pagamenti informali",
  "authority": "La Nkwantanang Madina Municipal Assembly, con partner tecnologico privato e ricercatori; implementazione municipale",
  "territory": "Madina, Greater Accra Region",
  "country": "Ghana",
  "implementationYear": "2021 (campagna di riscossione municipale di sei settimane, marzo–aprile)",
  "problem": "Indirizzi e anagrafe degli immobili incompleti limitavano il recapito delle bollette per l'imposta immobiliare e la capacità comunale di riscuotere; occorreva valutare se il supporto digitale agli addetti migliorasse gli esiti senza trascurare integrità e trattamento degli utenti.",
  "measure": "Il municipio ha utilizzato un'anagrafe geospaziale già predisposta e ha assegnato casualmente a metà degli addetti alla riscossione un tablet con coordinate degli immobili e navigazione GPS. Gli altri hanno continuato con bollette cartacee e le informazioni cartografiche ordinarie. La tecnologia era un supporto agli operatori, non un sistema di pagamento online o una riforma della legge tributaria.",
  "mechanism": "Le coordinate riducono il tempo necessario per trovare gli immobili e recapitare gli avvisi; il tempo liberato può essere speso in contatti ripetuti e nella ricerca di soggetti ritenuti più propensi a pagare. I medesimi margini di discrezionalità possono però incrementare il rischio di richieste di pagamenti informali, come indicano le risposte indirette all'indagine sui nuclei.",
  "population": "56 addetti comunali randomizzati (28 tablet GIS; 28 controllo), circa 145 bollette per addetto, universo di 8.120 immobili residenziali e commerciali; indagine di fine campagna presso 4.334 nuclei. Unità di assegnazione: addetto e zona di raccolta; non singolo contribuente.",
  "primaryArea": "fiscalita_entrate_riscossione",
  "secondaryAreas": [
    "digitalizzazione_servizi_online",
    "capacita_amministrativa_personale",
    "trasparenza_integrita_anticorruzione"
  ],
  "interventionTypes": [
    "infrastruttura_digitale",
    "modifica_organizzativa_processo",
    "targeting_data_analytics",
    "formazione_capacity_building",
    "partnership_pubblico_privato_terzo_settore"
  ],
  "tools": [
    "anagrafe georeferenziata degli immobili",
    "tablet con coordinate e navigazione GPS",
    "assegnazione randomizzata delle aree agli addetti",
    "registri giornalieri di bollette recapitate e incassi",
    "questionari agli operatori e a 4.334 nuclei, incluse domande indirette sui pagamenti informali"
  ],
  "territorialScale": "Comune; campagna di riscossione immobiliare in aree assegnate casualmente a 56 operatori",
  "interventionStatus": "Sperimentazione municipale conclusa nel 2021; valutazione in working paper NBER rivisto nel febbraio 2025. Non verificata la permanenza dell'esatta modalità operativa nel 2026.",
  "evaluationMethod": "Randomized controlled field experiment: 56 addetti assegnati casualmente a zone di riscossione e poi a tablet GIS o procedura cartacea; confronto fra 28 addetti trattati e 28 controlli, dati amministrativi sull'intera campagna di sei settimane e indagine indipendente presso 4.334 nuclei; misure di percezione/attività informale rilevate con domande indirette.",
  "comparator": "28 operatori in zone assegnate casualmente che lavoravano senza tablet GIS, con bollette cartacee e strumenti ordinari; condizioni amministrative e incentivi economici agli addetti altrimenti comparabili.",
  "outcomes": [
    "bollette recapitate per addetto",
    "importi di imposta riscossi durante la campagna",
    "tempo impiegato per recapito e visite",
    "contatti ulteriori e distribuzione dei pagamenti",
    "percezione di integrità del governo",
    "segnalazioni indirette di richieste di denaro non ufficiali"
  ],
  "results": "In sei settimane il tablet GIS ha aumentato i recapiti (+27%) e le imposte riscosse (+103%) rispetto al gruppo di controllo, senza aumento statisticamente rilevante della fiducia o della percezione di integrità. Un effetto indesiderato essenziale: la probabilità che un nucleo, rispondendo a domande indirette, riferisse possibili richieste di pagamenti informali è aumentata di 11,6 punti percentuali dal 13,9% nel controllo. Le interviste non sono accertamenti giudiziari di episodi individuali. Il meccanismo proposto dagli autori comprende un maggiore impiego del tempo liberato nel conoscere e visitare nuclei ad alta propensione di pagamento, non una semplice automazione.",
  "effectSize": "Bollette recapitate +21,5 per addetto dal valore medio di controllo 80,7: +27% relativo (circa 102,2 in trattamento); gettito +856 GHC per addetto dal valore medio di 829 GHC nel controllo: +103% relativo (non +103 punti percentuali); tempo per bolletta circa −63% secondo l'indagine; indice di percezione di pagamenti informali +0,116 (SE 0,039; p<0,01) dalla baseline 0,139: +11,6 punti percentuali, non +11,6%; indici di integrità/fiducia senza effetti significativi. Il paper riporta +96% per il gettito al netto dei costi operativi incrementali, escludendo il costo fisso di creazione del GIS.",
  "evidenceStrength": "forte",
  "costsRequirements": "Richiede anagrafe immobiliare con riferimenti territoriali corretti, supporto GIS, dispositivi, personale formato, tracciamento delle attività e audit indipendenti. Il paper valuta costi operativi incrementali dei tablet ma non attribuisce ai soli tablet l'intero costo della costruzione e manutenzione dell'anagrafe GIS, già disponibile: costo-efficacia complessiva non dimostrata per Lamezia. Nell'esperimento gli addetti avevano una componente di incentivo alla riscossione; non replicabile automaticamente in Italia.",
  "limitations": [
    "Solo 56 operatori e sei settimane in una singola municipalità: persistenza, effetti sulla compliance nel lungo periodo e replicabilità istituzionale non verificati.",
    "Il trattamento randomizzato riguarda accesso a tablet GIS con anagrafe già costruita, non l'effetto causale del progetto integrale di digitalizzazione dell'anagrafe.",
    "NBER Working Paper 29923 (revisione febbraio 2025) non risulta una pubblicazione peer-reviewed; classificazione forte per la randomizzazione, non molto_forte per tutti gli outcome o validità esterna.",
    "Le informazioni sulla condotta dei riscossori vengono da domande indirette a 4.334 famiglie e non costituiscono prova di pagamenti illeciti effettivamente verificati o responsabilità individuali.",
    "Il modello di riscossione di Madina, con visite degli agenti e frequenti pagamenti diretti in contanti, è diverso dalla notifica e dal pagamento dei tributi locali italiani attraverso canali istituzionali e PagoPA.",
    "Lo studio non misura un beneficio netto per i contribuenti o una maggiore qualità dei servizi finanziati e non dimostra che il gettito aggiuntivo migliori automaticamente il welfare.",
    "Un targeting dei cittadini basato su informazioni reddituali inferite durante le visite non è un modello da trasferire nel sistema italiano senza base giuridica, proporzionalità, tracciabilità, tutela dei dati e garanzie di pari trattamento."
  ],
  "unintendedEffects": "Risultato negativo statisticamente significativo: la misura indiretta di possibili richieste di denaro non ufficiali cresce di 11,6 punti percentuali (13,9% nel controllo; circa 25,5% nel trattamento; Tabella 2 del paper, p<0,01). Non emerge miglioramento significativo degli indicatori di fiducia o integrità percepita. Il dato è una stima da risposte ad indagine, non un'accusa verso specifici addetti.",
  "primarySource": {
    "label": "NBER — studio originale Dzansi et al., Working Paper 29923 (revisione febbraio 2025)",
    "url": "https://www.nber.org/papers/w29923"
  },
  "evaluationStudies": [
    {
      "label": "NBER — testo integrale e tabelle originali, revisione febbraio 2025",
      "url": "https://www.nber.org/system/files/working_papers/w29923/w29923.pdf",
      "citation": "Dzansi, J., Jensen, A., Lagakos, D. e Telli, H. (2022; rev. febbraio 2025), Technology and Tax Capacity: Evidence from Local Governments in Ghana, NBER Working Paper 29923.",
      "doi": "10.3386/w29923"
    },
    {
      "label": "J-PAL / Innovations for Poverty Action — scheda della valutazione randomizzata e del partner municipale",
      "url": "https://www.povertyactionlab.org/evaluation/improving-local-tax-collection-through-technology-ghana",
      "citation": "J-PAL, Improving local tax collection through technology in Ghana; studio registrato AEARCTR-0007267, Madina, 2021."
    }
  ],
  "lastVerifiedAt": "2026-11-11",
  "transferabilityItaly": "Potenzialmente alta per la riconciliazione GIS–anagrafe–recapiti, ma non per la riscossione domiciliare e il targeting discrezionale: IMU/TARI, canali di notifica, PagoPA, App IO, norme sulla privacy e competenze comunali differiscono. Valutare accuratezza dell'anagrafe, percentuali di recapito corretto, errori e insoluti, con tracciabilità degli accessi e controllo degli effetti indesiderati.",
  "lameziaAdaptation": "Il Comune e gli uffici Tributi, SIT/GIS e servizio digitale potrebbero confrontare, su base legittima e minimizzata, posizioni TARI/IMU, indirizzi delle notifiche e riferimenti territoriali degli immobili per individuare errori materiali e duplicazioni; usare i canali istituzionali già disponibili (PagoPA, App IO, PEC/posta), senza riscossione in contanti né selezione discrezionale basata su ricchezza percepita. In un pilot per pratiche sanabili, assegnare casualmente l'ordine di verifica amministrativa di aree comparabili, nel rispetto degli obblighi legali, e misurare correzioni, avvisi recapitati, incassi effettivi, costi, ricorsi, reclami e incidenti di integrità. Prevedere verifiche del DPO e del responsabile della prevenzione della corruzione.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "accordo operativo fra Ufficio Tributi, SIT/GIS e gestione delle notifiche",
    "base giuridica per incroci dati, valutazione privacy e accessi minimizzati",
    "geocodifica affidabile delle sole posizioni legittimamente utilizzabili",
    "tracciamento del corretto recapito, pagamenti e contestazioni per periodo",
    "audit accessi, canali segnalazione reclami e indicatori di integrità indipendenti",
    "disegno pilota con comparatori leciti e protocollo di valutazione prima dell'avvio",
    "stima costi reali della bonifica anagrafica, manutenzione GIS e supporto utenti"
  ],
  "tags": [
    "Madina",
    "Ghana",
    "riscossione tributi",
    "imposta immobiliare",
    "GIS",
    "GPS",
    "RCT",
    "bollette",
    "recapiti",
    "integrità",
    "pagamenti informali",
    "trade-off",
    "TARI",
    "IMU",
    "PagoPA",
    "capacità amministrativa"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-11",
      "note": "Primo inserimento dopo discovery obbligatoria con Parallel Search; verifica diretta su NBER Working Paper 29923, versione febbraio 2025 (abstract, disegno, Tabella 2), e su J-PAL. Verificati +27% recapiti, +103% incassi e +11,6 p.p. nelle risposte indirette relative a possibili pagamenti informali. Distinta rigorosamente la funzione del tablet GIS dall'anagrafe già costruita e segnalata assenza di peer review e validità esterna limitata; deduplica su archivio GitHub."
    }
  ]
}
];
