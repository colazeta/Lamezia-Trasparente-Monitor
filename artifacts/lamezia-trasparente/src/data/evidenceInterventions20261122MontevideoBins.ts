import type { EvidenceIntervention } from "./evidenceInterventions";

/** Montevideo matched-pair cluster RCT of removing bins in small public squares, verified 2026-11-22. */
export const EVIDENCE_INTERVENTIONS_2026_11_22_MONTEVIDEO_BINS: readonly EvidenceIntervention[] = [
  {
    "id": "montevideo-plazas-bin-removal-matched-rct-2022",
    "title": "Montevideo: rimozione sperimentale dei cestini nelle piazze per ridurre i rifiuti dispersi",
    "authority": "Intendencia de Montevideo (Departamento de Desarrollo Ambiental), in collaborazione con ricercatori della Universidad Católica del Uruguay e di altre università",
    "territory": "Municipios B e C, Montevideo",
    "country": "Uruguay",
    "implementationYear": "Programma municipale avviato nell'agosto 2021; RCT in 36 piazze con baseline giugno–settembre 2022 e rilevazioni post-intervento novembre 2022–gennaio 2023; studi 2023 e 2025",
    "problem": "In alcune piazze piccole e medie, l'uso improprio dei cestini e il prelievo/disperdersi dei rifiuti attorno agli stessi producevano accumuli e peggioravano il mantenimento della pulizia; l'amministrazione voleva individuare una soluzione realmente efficace.",
    "measure": "Rimozione dei cestini di carta/rifiuti dalle piazze assegnate casualmente al trattamento; nelle piazze di controllo i cestini rimangono. Intervento inserito nel programma Montevideo Más Verde, con attività di pulizia ordinaria e comunicazione ai fruitori per conferire i rifiuti negli appositi contenitori esterni o portarli via. L'intervento era mirato e sperimentale, non un divieto generalizzato di cestini urbani.",
    "mechanism": "Ridurre l'uso improprio dei cestini come punti di accumulo e dispersione, compresa la fuoriuscita dei rifiuti durante la ricerca di materiali recuperabili, e incentivare lo smaltimento in luoghi più controllati. Possibile meccanismo di riduzione dei segnali di disordine; non è identificata separatamente la componente comportamentale o l'effetto dei servizi di pulizia.",
    "population": "Utilizzatori e residenti prossimi a 36 piccole/medie piazze con cestini preesistenti, scelte tra 60 piazze eleggibili nei Municipios B e C; 18 coppie di piazze, una trattata e una controllo per coppia; 340 interviste a utenti di piazze nelle rilevazioni.",
    "primaryArea": "rifiuti_pulizia_urbana",
    "secondaryAreas": [
      "mobilita_spazio_pubblico",
      "ambiente_clima_energia",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "modifica_organizzativa_processo",
      "infrastruttura_fisica",
      "servizio_diretto",
      "nudging_comunicazione",
      "targeting_data_analytics"
    ],
    "tools": [
      "rimozione selettiva dei cestini nelle piazze assegnate",
      "matching pre-trattamento delle 36 piazze in 18 coppie",
      "randomizzazione entro ciascuna coppia con probabilità 0,5",
      "monitoraggio fotografico e codifica indipendente dei rifiuti per m²",
      "tre sopralluoghi per piazza prima e tre dopo il trattamento",
      "questionari di percezione a 340 frequentatori",
      "pulizia municipale e indicazioni sul conferimento corretto"
    ],
    "territorialScale": "Piazza / spazio pubblico di piccole-medie dimensioni in due municipi di Montevideo; randomizzazione a livello di piazza.",
    "interventionStatus": "Pilota avviato nel 2021 e trial territoriale valutato nel 2022–2023; la Intendencia annunciava nel 2023 l'intenzione di estendere la misura, adattandola alle caratteristiche dei luoghi. Non verificata la configurazione attuale di tutte le piazze nel 2026.",
    "evaluationMethod": "Matched-pair cluster randomized field trial (RCT): 36 piazze con cestini iniziali, abbinate in 18 coppie su dimensioni, litter baseline, municipio e caratteristiche contestuali; una piazza per coppia assegnata casualmente alla rimozione. Differenza-in-differenze su misure pre/post e inferenza per randomizzazione (1.000 riassegnazioni riportate nel report); 218 osservazioni di sopralluogo su rifiuti e 340 interviste. Report municipale Rosenblatt, Tealde e Valenzuela (2023); articolo peer-reviewed Piñeiro-Rodriguez et al. (2025), Cities 161, 105913, DOI 10.1016/j.cities.2025.105913.",
    "comparator": "Piazza abbinata di controllo in ciascuna delle 18 coppie, nella quale i cestini non sono stati rimossi; confronto dell'evoluzione pre/post nell'identico periodo e nell'ambito della stessa struttura municipale.",
    "outcomes": [
      "rifiuti dispersi per metro quadrato delle piazze, conteggi fotografici",
      "rifiuti per metro quadrato ponderati per dimensione",
      "rifiuti piccoli, medi e grandi",
      "concentrazioni puntuali di rifiuti",
      "percezione di pulizia, verde, qualità dell'infrastruttura e condizioni generali"
    ],
    "results": "Nel report originale 2023, la rimozione è associata causalmente a −0,021 rifiuti/m² (−43,5% rispetto alla media pre-trattamento di 0,049/m² nelle piazze trattate; inferenza per randomizzazione p<0,001). Rifiuti ponderati per dimensione: −36,8%, p=0,001; piccoli: −53,7%, p<0,001; medi: nessuna variazione significativa (p=0,980); grandi: −46,6% ma p=0,098, quindi solo significativo al 10%. Ridotte anche le concentrazioni puntuali (coefficiente −0,195, p=0,007). Nessun effetto significativo sulla percezione della pulizia (−0,015 su scala 1–7, p=0,951), né sullo stato generale; lieve peggioramento della qualità percepita dell'infrastruttura (−0,307 punti su scala 1–7, p=0,054). L'articolo peer-reviewed 2025 conferma il risultato del −43,5% e l'effetto negativo sulla percezione dell'infrastruttura.",
    "effectSize": "Outcome primario: −43,5% di rifiuti dispersi/m², differenza-in-differenze −0,021 rifiuti/m² sulla baseline trattata 0,049/m² (p<0,001); osservazioni 218, unità randomizzate 36 piazze. Rifiuti ponderati −36,8% (p=0,001); rifiuti piccoli −53,7% (p<0,001); rifiuti grandi −46,6% (p=0,098, NON significativo al 5%); qualità percepita infrastruttura −0,307/7 (p=0,054); percezione pulizia non significativa (p=0,951).",
    "evidenceStrength": "forte",
    "costsRequirements": "Servono rilievo di densità e stato dei cestini, piano per il conferimento alternativo e manutenzione, squadra per rimozione/installazione e ripristino, fotografie standardizzate, rilevatori indipendenti, dati dei costi del servizio. Gli studi consultati non forniscono un conto economico completo né provano risparmi netti: la rimozione dei cestini non può essere presentata come risparmio automatico.",
    "limitations": [
      "Validità esterna limitata: sole 36 piazze piccole/medie in due municipi in cui l'amministrazione aveva già riscontrato specifici episodi di uso improprio e dispersione presso i cestini; non applicabile indiscriminatamente a grandi parchi, stazioni, aree commerciali o realtà italiane.",
      "Il follow-up sperimentale si concentra sulle rilevazioni novembre 2022–gennaio 2023; non dimostra persistenza pluriennale o adattamento dei comportamenti nel tempo.",
      "Non sono misurati in modo esaustivo gli eventuali spostamenti dei rifiuti sulle strade o nei contenitori esterni, i costi integrali della pulizia, il carico sui cittadini o gli effetti su persone con difficoltà motorie.",
      "Lo studio osserva i pezzi dispersi/m² e i giudizi dei frequentatori; non misura la produzione totale di rifiuti urbani, il riciclo o un miglioramento percepito della pulizia.",
      "Nel testo del report 2023 è dichiarata per i rifiuti grandi una significatività all'1%, ma la Tabella 4 riporta p=0,098: interpretata correttamente come evidenza debole, non significativa al 5%. Il commento testuale sulle concentrazioni contiene un'altra frase incoerente col coefficiente negativo; nel record prevale la tabella.",
      "Il report 2023 elenca tre autori; l'articolo peer-reviewed 2025 ne elenca quattro. Si tratta della stessa valutazione, NON di due interventi indipendenti.",
      "Le pulizie ordinarie e la comunicazione possono interagire con il trattamento: la randomizzazione identifica l'effetto del pacchetto attuato, non ciascun meccanismo causale separatamente."
    ],
    "unintendedEffects": "La qualità percepita dell'infrastruttura scende leggermente (−0,307 punti su scala 1–7; p=0,054, significatività solo al 10%); non cresce la pulizia percepita. Possibile maggiore onere per gli utenti e trasferimento dei rifiuti ad altre aree, non quantificati. Non attribuire alla presenza di persone senza dimora comportamenti illeciti: è una caratteristica contestuale usata solo nel matching.",
    "primarySource": {
      "label": "Intendencia de Montevideo — Evaluación de impacto sobre retiro de papeleras, 31 agosto 2023",
      "url": "https://montevideo.gub.uy/noticias/medio-ambiente-y-sostenibilidad/evaluacion-de-impacto-sobre-retiro-de-papeleras"
    },
    "evaluationStudies": [
      {
        "label": "Cities — articolo originale peer-reviewed, vol. 161 (2025), art. 105913",
        "url": "https://doi.org/10.1016/j.cities.2025.105913",
        "doi": "10.1016/j.cities.2025.105913",
        "citation": "Piñeiro-Rodriguez, R., Rosenblatt, F., Tealde, E. e Valenzuela-Levi, N. (2025). Intervening public spaces by subtraction: A randomised controlled trial in Montevideo, Uruguay. Cities, 161, 105913. Pubblicazione online 21 marzo 2025; fascicolo giugno 2025."
      },
      {
        "label": "Intendencia de Montevideo — valutazione originale completa e Tabella 4 (2023)",
        "url": "https://montevideo.gub.uy/sites/default/files/biblioteca/evaluaciondeimpactodelretirodepapelerasenplazasdemontevideo.pdf",
        "citation": "Rosenblatt, F., Tealde, E. e Valenzuela, N. (2023). Evaluación de impacto del retiro de papeleras en plazas de Montevideo. Rapporto con randomizzazione, matched pairs, randomization inference e Tabella 4."
      },
      {
        "label": "Universidad Católica del Uruguay — scheda dell'articolo 2025",
        "url": "https://investigadores.ucu.edu.uy/en/publications/intervening-public-spaces-by-subtraction-a-randomised-controlled-/",
        "citation": "Scheda istituzionale bibliografica del peer-reviewed paper, con DOI e risultati."
      }
    ],
    "lastVerifiedAt": "2026-11-22",
    "transferabilityItaly": "Trasferibile il metodo sperimentale per decidere densità e localizzazione ottimale dei cestini, solo su microaree in cui un audit dimostri che i cestini generano accumuli per modalità d'uso o svuotamento. Non è una prova che diminuire i cestini in generale migliori la pulizia. Rispettare norme locali e diritti degli utenti; mantenere canali di smaltimento accessibili.",
    "lameziaAdaptation": "Avviare con Lamezia Multiservizi e il settore comunale che gestisce il verde un censimento georiferito di cestini, svuotamenti, accumuli e segnalazioni in piccole piazze/parchi. Il bando comunale del 20 ottobre 2026 per la gestione dei parchi Impastato, XXV Aprile e Mastroianni mostra un punto istituzionale per definire standard di pulizia, ma NON dimostra l'aggiudicazione o un problema con i cestini. Solo se si osservano punti di dispersione legati ai cestini, confrontare in un pilota legalmente e operativamente concordato spostamento/sostituzione antivandalica, svuotamento più frequente e, dove ragionevole, rimozione selettiva; preservare sempre accessibilità a cestini alternativi e misurare anche le vie limitrofe. Pre-registrare outcome, costi e controfattuale e sospendere qualunque trattamento che peggiori accessibilità o litter.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "inventario georeferenziato degli spazi e dei cestini, titolarità, eventuali concessioni e standard contrattuali",
      "dati del gestore sullo svuotamento e sugli interventi di pulizia per luogo e settimana",
      "baseline di rifiuti per m² con fotografie e protocollo di campionamento replicabile",
      "rete e distanza di contenitori accessibili alternativi, valutazione accessibilità e impatti sugli utenti",
      "confronto randomizzato o rollout a coppie comparabili su pochi siti, senza penalizzare luoghi vulnerabili",
      "indagine breve sulla percezione di pulizia, infrastrutture e oneri per i fruitori",
      "monitoraggio di possibili spostamenti di litter in vie limitrofe e costi effettivi di esercizio",
      "coordinamento Comune, gestore, eventuali concessionari e DPO dove vi siano dati personali"
    ],
    "tags": [
      "Montevideo",
      "Uruguay",
      "2021",
      "2022",
      "2023",
      "2025",
      "RCT",
      "matched-pair randomisation",
      "difference-in-differences",
      "spazi pubblici",
      "piazze",
      "cestini",
      "rifiuti dispersi",
      "pulizia urbana",
      "43,5%",
      "percezione infrastrutture",
      "Lamezia Terme",
      "pilot"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-22",
        "note": "Discovery tramite Parallel Search; confronto con le fonti originali Intendencia de Montevideo (pagina 31/08/2023 e rapporto PDF Tabella 4, pp. 14–15) e pubblicazione peer-reviewed Cities (2025), DOI verificato presso l'editore e le università. Deduplicazione per intervento, ente, territorio e studio mediante lettura diretta dei 70 moduli, file base/daily/archivio e ricerca PR GitHub; nessun equivalente. Corrette le incongruenze del rapporto su p-value dei rifiuti grandi e commento sulle concentrazioni; non generalizzato l'effetto a tutti i cestini urbani. Fonte locale: bando parchi Comune di Lamezia Terme 20/10/2026, senza presunzione di aggiudicazione."
      }
    ]
  }
];
