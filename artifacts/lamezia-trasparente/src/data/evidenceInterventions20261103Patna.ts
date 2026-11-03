import type { EvidenceIntervention } from "./evidenceInterventions";

/** Patna municipal waste-segregation training: original academic sources verified on 2026-11-03. */
export const EVIDENCE_INTERVENTIONS_2026_11_03_PATNA: readonly EvidenceIntervention[] = [
{
  "id": "patna-india-municipal-waste-source-segregation-citizen-training-rct-2021",
  "title": "Patna: formazione domiciliare pratica per migliorare la separazione dei rifiuti alla fonte",
  "authority": "Patna Municipal Corporation, in collaborazione con i ricercatori della London School of Economics e il team di intervento",
  "territory": "Patna, Bihar; gruppi di edifici serviti da percorsi comunali di raccolta",
  "country": "India",
  "implementationYear": "Dicembre 2021 – aprile 2022 (rollout); rilevazioni fino ad agosto 2022",
  "problem": "Una quota molto bassa di famiglie separava rifiuti biodegradabili e non biodegradabili prima del passaggio dei mezzi di raccolta, nonostante la disponibilità del servizio; insufficiente conoscenza pratica e scarsa fiducia nella filiera di raccolta.",
  "measure": "Programma di formazione domiciliare offerto progressivamente a 10.434 famiglie: spiegazioni sui danni sanitari e ambientali dei rifiuti mal gestiti, seguite da sessioni pratiche su riduzione, separazione umido/secco, riciclo e compostaggio. Il programma è stato erogato in collaborazione con l'amministrazione cittadina lungo percorsi di raccolta già serviti; tutti i gruppi sono stati infine formati.",
  "mechanism": "Migliorare competenze operative e percezione di utilità della separazione al momento del conferimento, creando opportunità di imitazione e diffusione informale fra edifici vicini; il risultato dipende dalla presenza e affidabilità della raccolta distinta a valle.",
  "population": "Censite 10.434 famiglie in 4.202 residenze; il campione osservato lungo o vicino ai giri di raccolta comprende 10.196 famiglie in 657 gruppi di edifici. Trattamento offerto all'intera popolazione eleggibile tramite rollout scaglionato.",
  "primaryArea": "rifiuti_pulizia_urbana",
  "secondaryAreas": [
    "ambiente_clima_energia",
    "capacita_amministrativa_personale",
    "partecipazione_democrazia_locale"
  ],
  "interventionTypes": [
    "formazione_capacity_building",
    "servizio_diretto",
    "nudging_comunicazione",
    "modifica_organizzativa_processo",
    "partnership_pubblico_privato_terzo_settore"
  ],
  "tools": [
    "formatori che visitano le famiglie e dimostrazioni di separazione alla fonte",
    "materiale informativo e formazione su riciclo e compostaggio",
    "assegnazione casuale della sequenza di formazione dei gruppi di edifici",
    "rilevazione diretta del conferimento presso i camion circa due volte a settimana",
    "registri georeferenziati di edifici, giri e calendario formativo"
  ],
  "territorialScale": "Municipale, con assegnazione e analisi per gruppi di edifici lungo giri di raccolta; programma pilota con oltre 10.000 famiglie.",
  "interventionStatus": "Programma di formazione sperimentale effettivamente realizzato tra fine 2021 e aprile 2022; follow-up osservazionale nell'agosto 2022. Non è verificato se il medesimo programma sia oggi attivo a Patna.",
  "evaluationMethod": "Esperimento randomizzato nell'ordine di implementazione (staggered randomized rollout) di 38 gruppi di programmazione; blocchi geografici a scacchiera con sequenze randomizzate. Staggered difference-in-differences sui gruppi di edifici, con effetti fissi e osservatori che seguivano direttamente il conferimento presso i mezzi. Analisi complementari degli spillover spaziali mediante discontinuità geografiche e modelli di gravità/decadimento spaziale, che richiedono ipotesi ulteriori.",
  "comparator": "Per l'effetto diretto, edifici già formati confrontati nello stesso periodo con edifici non ancora formati sul medesimo sistema di raccolta. Per gli spillover, confronti basati su prossimità e barriere spaziali; non sono una seconda randomizzazione dei contatti sociali.",
  "outcomes": [
    "percentuale di conferimenti familiari con separazione umido/secco corretta osservata al camion",
    "dinamica temporale della separazione prima, durante e dopo il rollout",
    "spillover di prossimità fra edifici e gruppi",
    "costo amministrativo e operativo della formazione",
    "riduzione potenziale dei volumi in discarica ed emissioni di metano, stimata in modello e non misurata sul campo"
  ],
  "results": "L'assegnazione anticipata alla formazione produce un aumento significativo della separazione dei rifiuti rispetto a edifici non ancora formati. Nell'intera area la quota osservata passa all'incirca dal 10% iniziale al 29% dopo il completamento di tutti i trattamenti e al 32% nel follow-up; questi valori complessivi prima/dopo NON rappresentano un effetto causale isolato. Modelli spaziali suggeriscono spillover ulteriori, ma con ipotesi maggiori. Nessun dato consente di affermare risparmi comunali consuntivi o riduzioni di emissioni direttamente rilevate.",
  "effectSize": "Stima diretta randomizzata DiD: +4,5–6,1 punti percentuali di probabilità di separazione rispetto ai gruppi non ancora trattati, con baseline ~10%. Percentuali complessive osservate nel tempo: ~10% prima, ~29% post rollout e ~32% al follow-up (descrittivo). Stime spaziali che comprendono effetti diretti e di prossimità: ~10,20–16,72 pp in diverse specificazioni; scenario centrale ~13,57 pp, non equivalente all'ITT diretto. Modelli economici: rapporto benefici/costi condizionato a scenari e assunzioni, NON un risultato finanziario osservato.",
  "evidenceStrength": "forte",
  "costsRequirements": "Costo documentato dal paper: ₹2.581.000 per 5 mesi di formazione a 10.434 famiglie, composto da ₹1.881.000 di costi variabili e ₹700.000 di coordinamento/software; circa ₹247 per famiglia come costo medio una tantum in quel contesto. Richiede formatori, pianificazione dei giri, raccolta regolare, supervisione, strumenti formativi, osservazioni indipendenti e tracciamento dei costi. Il rapporto benefici/costi superiore a uno è una simulazione, dipendente da risparmi ipotetici di discarica, prezzi del carbonio e persistenza, non un rendiconto dell'ente.",
  "limitations": [
    "La pubblicazione principale verificata è un discussion paper CEP/LSE/IZA del 2025, non una versione peer-reviewed definitivamente accertata; non classificarla come tale.",
    "Il trattamento scaglionato rende credibile la differenza tra gruppi formati e non ancora formati, ma contaminazione e diffusione spaziale possono attenuare o rendere complesso il contrasto causale diretto.",
    "Gli spillover di vicinato richiedono modelli e ipotesi geografiche ulteriori: non equipararli al confronto randomizzato primario.",
    "Il risultato finale 29–32% è una variazione media complessiva nel tempo, non un effetto netto causalmente identificato da sola.",
    "La valutazione è concentrata sulla separazione umido/secco al conferimento, non su riciclo finale certificato, minori emissioni effettivamente misurate o miglioramenti sanitari.",
    "I costi e l'impiantistica di Patna non sono trasferibili direttamente a Lamezia e il programma può fallire se la raccolta separata non è affidabile.",
    "La collaborazione con Patna Municipal Corporation è attestata dagli autori nello studio originale; non è stato identificato un provvedimento comunale indipendente che descriva integralmente lo stesso protocollo."
  ],
  "unintendedEffects": "Possibile peggioramento della fiducia se le frazioni vengono ricombinate dopo la raccolta; aggravio organizzativo per i nuclei, in particolare per chi svolge lavoro di cura; miglioramento apparente della separazione senza adeguata capacità degli impianti a valle. Lo studio non quantifica causalmente questi effetti indesiderati.",
  "primarySource": {
    "label": "LSE Centre for Economic Performance, studio originale con descrizione della collaborazione con Patna Municipal Corporation e protocollo implementato",
    "url": "https://cep.lse.ac.uk/pubs/download/dp2124.pdf"
  },
  "evaluationStudies": [
    {
      "label": "Centre for Economic Performance / LSE Discussion Paper 2124 — rapporto integrale con tabelle, costi e disegno randomizzato",
      "url": "https://cep.lse.ac.uk/pubs/download/dp2124.pdf",
      "citation": "Dhingra, S., Kondirolli, F., & Machin, S. (2025). Citizen Training and the Urban Waste Footprint. CEP Discussion Paper No. 2124, London School of Economics."
    },
    {
      "label": "IZA Discussion Paper No. 18124 — scheda accademica e abstract degli autori",
      "url": "https://www.iza.org/publications/dp/18124/citizen-training-and-the-urban-waste-footprint",
      "citation": "Dhingra, S., Kondirolli, F., & Machin, S. (2025). Citizen Training and the Urban Waste Footprint. IZA Discussion Paper No. 18124."
    }
  ],
  "lastVerifiedAt": "2026-11-03",
  "transferabilityItaly": "Elevata per il meccanismo di formazione pratica, analisi di composizione e valutazione per giri, ma condizionata al regime contrattuale, alle competenze del gestore, alla qualità e continuità della raccolta e agli impianti di destinazione; il 4,5–6,1 pp sperimentale indiano non costituisce una previsione per un comune italiano.",
  "lameziaAdaptation": "Con Lamezia Multiservizi, usare i calendari porta a porta già distinti per zona per costruire gruppi di percorsi comparabili. Avviare rilievi di qualità (non solo pesi) del conferimento, selezionare casualmente la sequenza di visite di educatori ambientali su zone con servizio regolare e ricontrollare a 3–6 mesi. Conservare canali per cittadini con difficoltà linguistiche e anziani e non differire servizi già dovuti. Separare gli effetti sulla corretta raccolta da quelli su quantità totale di rifiuti, impianti e costi.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "geografia degli itinerari e delle utenze servite, aggiornata e minimizzata",
    "verifica disponibilità effettiva del servizio e destino delle frazioni",
    "checklist standardizzata di conferimento corretto osservato per area e settimana",
    "costo per ora di educatore, materiali, coordinamento e trasferte",
    "protocollo di assegnazione progressiva randomizzata con comparatori e controllo di contaminazione",
    "verifica accessibilità, privacy e tutela dei cittadini in situazione di vulnerabilità"
  ],
  "tags": [
    "Patna",
    "India",
    "separazione rifiuti alla fonte",
    "formazione domiciliare",
    "educazione ambientale",
    "staggered randomized rollout",
    "difference-in-differences",
    "spillover spaziali",
    "costi comunali",
    "waste segregation",
    "Lamezia Multiservizi"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-03",
      "note": "Prima acquisizione verificata sul testo integrale CEP Discussion Paper 2124 e la scheda IZA 18124, con separazione esplicita tra DiD sperimentale diretto, trend aggregati, effetti spaziali modellati e risultati economici simulati; controllo deduplicazione su archivio e PR GitHub."
    }
  ]
}
];
