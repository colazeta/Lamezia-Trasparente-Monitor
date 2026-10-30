import type { EvidenceIntervention } from "./evidenceInterventions";

/** Maputo household recycling RCT: scientific and institutional evidence checked 2026-10-30. */
export const EVIDENCE_INTERVENTIONS_2026_10_30_MAPUTO: readonly EvidenceIntervention[] = [
{
  "id": "maputo-mozambique-household-waste-segregation-support-rct-2014",
  "title": "Maputo: incentivi in natura, secchi dedicati e visite domiciliari per aumentare la separazione dei rifiuti riciclabili",
  "authority": "Conselho Municipal de Maputo / Direcção Municipal de Gestão de Resíduos Sólidos e Cemitérios, in collaborazione con Japan International Cooperation Agency (JICA)",
  "territory": "Area suburbana del Comune di Maputo; 1.000 nuclei randomizzati tra 1.817 eleggibili",
  "country": "Mozambico",
  "implementationYear": "2014 (programma sperimentale municipale 3R; pubblicazione online 2017 e in volume 2018)",
  "problem": "La raccolta separata dei riciclabili era stata introdotta in una zona periferica, ma l'adesione delle famiglie rimaneva bassa malgrado l'esistenza di un servizio di raccolta dedicato. Era necessario individuare strumenti realmente efficaci e sostenibili per aumentare il conferimento corretto.",
  "measure": "Nel pilota promosso dal Comune e da JICA, 1.000 famiglie sono state assegnate casualmente a quattro gruppi da 250: controllo con la raccolta già operativa; incentivo in natura tramite tessere/timbri convertibili in beni domestici; consegna gratuita di secchi per separare riciclabili; istruzioni ripetute attraverso visite domiciliari. Le tre misure si aggiungevano al servizio, senza sostituirlo.",
  "mechanism": "Gli incentivi in natura aumentano il vantaggio immediato del conferimento; i secchi riducono il costo pratico e organizzativo di separare i materiali in casa; le visite ripetute chiariscono le regole, riducono gli errori e rafforzano la salienza della pratica. La qualità e regolarità del servizio di raccolta restano condizioni necessarie.",
  "population": "1.000 famiglie suburbane (250 per braccio) selezionate casualmente tra 1.817 eleggibili. I risultati riguardano nuclei con servizio sperimentale di raccolta differenziata funzionante, non l'intera popolazione di Maputo.",
  "primaryArea": "rifiuti_pulizia_urbana",
  "secondaryAreas": [
    "ambiente_clima_energia",
    "capacita_amministrativa_personale",
    "partecipazione_democrazia_locale"
  ],
  "interventionTypes": [
    "incentivo_economico",
    "servizio_diretto",
    "formazione_capacity_building",
    "modifica_organizzativa_processo"
  ],
  "tools": [
    "tessere e timbri convertibili in beni domestici",
    "secchi per la separazione domestica dei riciclabili",
    "visite periodiche di istruzione presso le abitazioni",
    "servizio di raccolta separata attivato in ambito suburbano",
    "pesatura dei riciclabili e osservazioni sul comportamento delle famiglie"
  ],
  "territorialScale": "Sperimentazione per nucleo familiare entro un'area suburbana della città; quattro bracci assegnati individualmente.",
  "interventionStatus": "Trial effettivamente realizzato nel 2014 nel programma tecnico comunale-JICA avviato nel 2013; studio pubblicato nel 2017/2018. Non è stato verificato se ciascuna misura sperimentata sia ancora attiva nel 2026; il progetto 3R ha avuto fasi e successori organizzativi distinti.",
  "evaluationMethod": "Randomized controlled trial a quattro bracci paralleli, 250 nuclei per braccio (1000 su 1817 eleggibili). Indicatori raccolti mediante osservazioni e pesatura dei materiali separati; effetti stimati rispetto al gruppo di controllo nel periodo pilota. Randomizzazione individuale in un'area relativamente circoscritta, con possibili spillover di vicinato.",
  "comparator": "250 nuclei randomizzati al controllo, che disponevano del medesimo servizio di raccolta separata ma non ricevevano ulteriori incentivi, secchi o visite di istruzione.",
  "outcomes": [
    "probabilità di separare i rifiuti riciclabili a livello familiare",
    "grammi di riciclabili conferiti separatamente per famiglia su due settimane",
    "costo operativo e costo-efficacia delle diverse misure",
    "persistenza nel lungo periodo ed effettivo riciclo a valle non adeguatamente misurati"
  ],
  "results": "Tutti e tre i trattamenti hanno aumentato significativamente la probabilità di separazione dei riciclabili rispetto al controllo. Anche il peso di materiali differenziati risulta più elevato nei gruppi sperimentali. Tuttavia, gli autori giudicano bassa la costo-efficacia rispetto ad altri progetti di riciclaggio dello stesso programma: un effetto comportamentale positivo non costituisce prova di convenienza economica.",
  "effectSize": "Incremento della probabilità di separazione +7,5–10,6 punti percentuali nei gruppi di trattamento rispetto al controllo (p<0,01). L'abstract riporta un incremento del quantitativo di riciclabili nei gruppi trattati di 267,4–386,1 grammi per famiglia su due settimane, contro 25,57 grammi nel gruppo di controllo (significatività fra 1% e 10%). Non interpretare questi valori come tonnellate effettivamente riciclate o risultati annuali.",
  "evidenceStrength": "forte",
  "costsRequirements": "Per replicare occorrono fornitura e gestione di contenitori domestici, materiale informativo plurilingue, gestione dei timbri/beni e delle visite, operatori addetti alla raccolta, pesatura dei conferimenti e osservazioni indipendenti. Lo studio giudica la costo-efficacia relativamente bassa; i secchi, essendo un costo meno ricorrente, risultano più sostenibili delle visite e degli incentivi continuativi, ma non è disponibile un costo per kg trasferibile a Lamezia.",
  "limitations": [
    "Sperimentazione in una sola area suburbana, con un servizio di raccolta separata attivo: scarsa generalizzabilità ai territori privi di servizio affidabile.",
    "Randomizzazione dei nuclei all'interno della medesima area: possibili spillover positivi o negativi fra vicini, anche nel controllo.",
    "Gli autori segnalano possibili duplicazioni negli elenchi delle famiglie e questioni relative alla qualità della cornice campionaria.",
    "I risultati quantitativi di raccolta si riferiscono a un periodo limitato; non sono disponibili prove sulla persistenza dopo la fine del trial.",
    "Un maggiore conferimento separato non dimostra da solo un aumento di materiali realmente riciclati a valle della raccolta.",
    "Costo-efficacia bassa rispetto ad altri piloti del programma: l'efficacia statistica non implica convenienza economica.",
    "Le modalità di raccolta suburbana e il contesto dei costi e degli incentivi del Mozambico non corrispondono alla raccolta porta a porta e alle regole TARI italiane."
  ],
  "unintendedEffects": "Non quantificati effetti avversi nel trial. Il disegno a gruppi vicini può generare confronto sociale negativo o contaminazione del controllo; premi continuativi e visite possono produrre costi amministrativi elevati, dipendenza dagli incentivi, disparità nell'accesso e contestazioni. Da misurare errori di conferimento, contaminazione, abbandoni e reale recupero a valle.",
  "primarySource": {
    "label": "African Clean Cities Platform (JICA/UN-Habitat) — presentazione ufficiale del progetto municipale 3R di Maputo, aprile 2017",
    "url": "https://www.africancleancities.org/activities/events-newsletters/event-archive/preparatory-meeting-establishing-accp-maputo"
  },
  "evaluationStudies": [
    {
      "label": "Journal of Material Cycles and Waste Management — articolo peer-reviewed originale e abstract quantitativo",
      "url": "https://doi.org/10.1007/s10163-017-0677-2",
      "citation": "Hosono, T. e Aoyagi, K. (2018), Effectiveness of interventions to induce waste segregation by households: evidence from a randomized controlled trial in Mozambique, Journal of Material Cycles and Waste Management, 20, 1143–1153 (pubblicato online 1 novembre 2017).",
      "doi": "10.1007/s10163-017-0677-2"
    }
  ],
  "lastVerifiedAt": "2026-10-30",
  "transferabilityItaly": "Elevata per il meccanismo di rimozione delle barriere pratiche e per il test di supporti informativi e materiali, subordinata a un servizio di raccolta affidabile e alla conformità dei conferimenti con il regolamento locale. Non trasferire automaticamente premi in natura né stime di efficacia/costo: una misura di questo tipo richiede accordo con il gestore, criteri trasparenti, tutela dell'uguaglianza, privacy e valutazione indipendente.",
  "lameziaAdaptation": "Con Lamezia Multiservizi, selezionare zone porta a porta comparabili con differenze documentate nella qualità dei conferimenti. Verificare mastelli già disponibili, calendari e criticità per zona, quindi testare in modo randomizzato un kit aggiuntivo chiaro e accessibile (per esempio guida visiva e, solo dove mancano, supporti domestici di separazione) rispetto al servizio ordinario. Mantenere eventuali visite o premi in bracci distinti, per stimarne costi marginali e valore incrementale. Misurare frazioni correttamente separate, kg idonei alla filiera, impurità, abbandoni, costi e soddisfazione a 2, 8 e 24 settimane. Non cambiare TARI né obblighi legali sulla base dell'esperimento.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "accordo di valutazione con Lamezia Multiservizi e mappa delle zone servite",
    "inventario dei mastelli già consegnati e calendari ufficiali per zona",
    "campione di nuclei/isolati con adeguata dimensione e prevenzione dei spillover",
    "audit fisici standardizzati dei conferimenti e delle impurità",
    "registri dei kg raccolti e degli scarti di selezione effettivi",
    "costi CAPEX/OPEX per kit, premi, visite e servizio ordinario",
    "regole di informazione, trattamento dati personali e accessibilità",
    "protocollo preregistrato con outcome primario, comparatore e analisi di costo-efficacia"
  ],
  "tags": [
    "Maputo",
    "Mozambico",
    "JICA",
    "waste segregation",
    "raccolta differenziata",
    "RCT",
    "incentivi in natura",
    "secchi domestici",
    "visite domiciliari",
    "costo-efficacia",
    "riciclabili",
    "servizio comunale"
  ],
  "revisionHistory": [
    {
      "date": "2026-10-30",
      "note": "Nuovo record deduplicato verificato sullo studio originale Hosono e Aoyagi 2018 e sulla documentazione ufficiale del progetto municipale-JICA. Evidenziate differenze in punti percentuali, limiti del trial individuale, costo-efficacia bassa, risultato breve e non equivalenza tra conferito e riciclato."
    }
  ]
}
];
