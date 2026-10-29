import type { EvidenceIntervention } from "./evidenceInterventions";

/** Sources verified on 2026-10-29: Santa Fe municipality program via IDB; Carrillo, Castro & Scartascini (2021). */
export const EVIDENCE_INTERVENTIONS_2026_10_29: readonly EvidenceIntervention[] = [
{
  "id": "santa-fe-argentina-good-taxpayer-sidewalk-lottery-2009",
  "title": "Santa Fe: premio al buon contribuente con riqualificazione dei marciapiedi e effetti sulla regolarità tributaria",
  "authority": "Municipalidad de Santa Fe (Provincia di Santa Fe), Argentina",
  "territory": "Città di Santa Fe, Provincia di Santa Fe",
  "country": "Argentina",
  "implementationYear": "Annuncio 16 dicembre 2008; sorteggio 27 febbraio 2009; opere realizzate nel 2009–2010",
  "problem": "Morosità e pagamenti tardivi della Tasa General de Inmuebles; scarsa visibilità dell'impiego delle entrate comunali in opere pubbliche di prossimità e insufficiente qualità di alcuni marciapiedi.",
  "measure": "Il Comune ha sorteggiato 400 proprietà su 72.742 ammesse perché in regola con le obbligazioni immobiliari del 2008. I vincitori venivano pubblicamente riconosciuti e avevano diritto alla costruzione o riqualificazione del marciapiede antistante, ove tecnicamente possibile. Le opere, avviate nel marzo 2009, erano scaglionate per vincoli logistici e di appalto.",
  "mechanism": "La visibilità dell'investimento pubblico e il riconoscimento possono incentivare reciprocità e fiducia nella capacità dell'amministrazione di utilizzare i tributi, influenzando la puntualità dei pagamenti dei vincitori e, indirettamente, dei vicini. La lotteria genera un incentivo ex ante, distinto dagli effetti della premiazione ex post.",
  "population": "Proprietari di abitazioni, locali commerciali e terreni nella città di Santa Fe; 72.742 proprietà fiscalmente in regola ammesse al sorteggio e 400 selezionate casualmente. Il confronto diretto riguarda soltanto gli eleggibili già relativamente adempienti; l'analisi di vicinato osserva immobili non eleggibili nello stesso isolato.",
  "primaryArea": "fiscalita_entrate_riscossione",
  "secondaryAreas": [
    "mobilita_spazio_pubblico",
    "urbanistica_rigenerazione",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "incentivo_economico",
    "infrastruttura_fisica",
    "informazione_trasparenza",
    "modifica_organizzativa_processo"
  ],
  "tools": [
    "sorteggio pubblico fra immobili fiscalmente regolari",
    "premio in natura: costruzione o riparazione del marciapiede",
    "pubblicazione dei vincitori sui quotidiani e sul sito comunale",
    "registri longitudinali di pagamenti della tassa immobiliare",
    "georeferenziazione delle proprietà e analisi degli isolati"
  ],
  "territorialScale": "Municipale, trattamento su singoli immobili e analisi indiretta a livello di isolato.",
  "interventionStatus": "Esperimento storico concluso; non si assume che il regime del 2009, o il premio a sorte, sia tuttora vigente. La progettata variante del 2010 che avrebbe riqualificato interi isolati fu sostanzialmente non implementata.",
  "evaluationMethod": "Esperimento naturale con estrazione casuale di 400 vincitori su 72.742 proprietà eleggibili, linked administrative panel, differenze tra vincitori e non vincitori per intention-to-treat (ITT). Stime della realizzazione effettiva tramite trattamento strumentato da assegnazione, con ipotesi addizionali; spillover su proprietà non eleggibili in isolati con e senza vincitori tramite confronto longitudinale e fixed effects (non randomizzazione individuale dei vicini).",
  "comparator": "Per l'effetto diretto, contribuenti eleggibili non estratti nel sorteggio. Per gli effetti indiretti, proprietà non eleggibili in isolati senza vincitori; queste ultime non sono individualmente randomizzate e richiedono ipotesi di comparabilità territoriale.",
  "outcomes": [
    "pagamento puntuale della tassa immobiliare",
    "pagamento entro tre o sei mesi",
    "persistenza delle condotte fiscali nei tre anni successivi",
    "compliance di vicini non eleggibili",
    "realizzazione effettiva dei marciapiedi",
    "effetto dell'annuncio sul recupero di arretrati",
    "bilancio fiscale stimato dell'iniziativa"
  ],
  "results": "L'assegnazione casuale al premio ha aumentato modestamente ma significativamente la puntualità dei pagamenti fra i già adempienti, con persistenza di almeno tre anni. La componente di riconoscimento senza opera realizzata sembra svanire rapidamente; le stime relative alle opere completate sono più elevate ma dipendono da assunzioni strumentali. I vicini non eleggibili mostrano incrementi positivi associati all'essere nello stesso isolato di un vincitore, ma l'identificazione è meno solida dell'ITT diretto. L'annuncio non ha indotto un recupero sostanziale delle morosità. La valutazione economica degli autori non dimostra una convenienza netta per il bilancio comunale.",
  "effectSize": "ITT vincita: +3,1 punti percentuali nella puntualità media rispetto ai contribuenti eleggibili non estratti; +2,4 pp nel pagamento entro tre mesi e +2,1 pp entro sei mesi. Baseline della puntualità circa 86%; effetto sostenuto almeno tre anni. Stima locale del trattamento di costruzione effettiva (LATE/IV, con ipotesi): +7,1 pp pagamento puntuale. Per vicini non eleggibili: differenza descrittiva tra isolati con e senza vincitori circa +4 pp nel 2010 e +3 pp nel 2011; la stima longitudinal baseline sugli isolati è circa +1,7 pp, da non equiparare all'effetto ITT randomizzato diretto. Su 400 vincitori, 223 opere risultavano completate e 16 avviate alla raccolta dati.",
  "evidenceStrength": "forte",
  "costsRequirements": "Costo medio preventivato circa 5.250 pesos argentini per marciapiede (circa 1.553 USD all'epoca), pari a circa 9,7–14,4 annualità del tributo medio; necessarie risorse per progettazione, appalti, accessibilità, titolarità delle opere, manutenzione, comunicazioni e monitoraggio fiscale pseudonimizzato. Gli autori osservano che, pur includendo spillover e gettito aggiuntivo stimato, il programma può essere finanziariamente in perdita: NON è provato un ritorno netto positivo della lotteria.",
  "limitations": [
    "La randomizzazione avviene solo tra contribuenti che avevano già pagato regolarmente: gli effetti non si generalizzano automaticamente a morosi e contribuenti vulnerabili.",
    "A dati raccolti soltanto 223 dei 400 marciapiedi risultavano completati e 16 iniziati; vincere non equivale a ricevere l'opera, e la stima LATE richiede ipotesi aggiuntive.",
    "La componente di spillover non è individualmente randomizzata: possibili differenze territoriali e interventi concomitanti negli isolati.",
    "Il beneficio monetario della sola compliance non copre necessariamente il costo dei lavori; impossibile stimare con precisione tutti i vantaggi urbani e di drenaggio.",
    "La selezione dei beneficiari già adempienti solleva problemi distributivi: il premio può privilegiare chi ha risorse per pagare puntualmente.",
    "Contesto fiscale e regole di responsabilità dei marciapiedi argentini non sono equivalenti alle competenze comunali italiane."
  ],
  "unintendedEffects": "Rischio di trasferimento regressivo delle risorse verso proprietari fiscalmente regolari anziché aree di maggiore bisogno; esclusione di proprietari insolventi; costo-opportunità delle opere; possibile confusione tra investimento collettivo e premio privato. Lo studio non misura compiutamente equità, accessibilità e benefici idraulici.",
  "primarySource": {
    "label": "Inter-American Development Bank — scheda dell'iniziativa municipale Premio al Buen Contribuyente",
    "url": "https://behavioral.iadb.org/en/our-projects/can-rewards-improve-tax-compliance"
  },
  "evaluationStudies": [
    {
      "label": "Journal of Public Economics — articolo definitivo, 2021",
      "url": "https://doi.org/10.1016/j.jpubeco.2021.104422",
      "citation": "Carrillo, P. E., Castro, E. e Scartascini, C. (2021), Public good provision and property tax compliance: Evidence from a natural experiment, Journal of Public Economics, 198, 104422.",
      "doi": "10.1016/j.jpubeco.2021.104422"
    },
    {
      "label": "Inter-American Development Bank — working paper e descrizione del disegno 2017",
      "url": "https://publications.iadb.org/en/do-rewards-work-evidence-randomization-public-works",
      "citation": "Carrillo, P. E., Castro, E. e Scartascini, C. (2017), Do Rewards Work? Evidence from the Randomization of Public Works, IDB Working Paper Series 794."
    }
  ],
  "lastVerifiedAt": "2026-10-29",
  "transferabilityItaly": "Alta per il principio di rendere tracciabili e visibili investimenti di prossimità e valutare l'effetto su fiducia e compliance; bassa per replicare meccanicamente la lotteria fiscale o utilizzare opere pubbliche quale premio individuale. Qualsiasi selezione delle opere deve rispettare competenze, programmazione dei lavori, evidenza pubblica, criteri di equità, sicurezza e accessibilità.",
  "lameziaAdaptation": "Senza introdurre subito premi a sorteggio, collegare a Lamezia la mappa pubblica degli interventi su marciapiedi/percorsi pedonali ai relativi costi, stati e risultati, con priorità basate su rischio, accessibilità e bisogno urbano; sperimentare comunicazioni trasparenti su opere effettivamente concluse e verificare con analisi aggregata di dati tributari se migliora la puntualità, distinguendola dal trend ordinario e dai cambiamenti normativi. Un eventuale incentivo individuale richiederebbe verifica preventiva di legittimità, equità e costo-efficacia.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "inventario georeferenziato delle opere sui marciapiedi",
    "costi, atti e cronoprogrammi di lavori effettivamente completati",
    "criteri ex ante di bisogno e sicurezza/accessibilità",
    "storico di pagamenti tributari minimizzato o pseudonimizzato con base giuridica",
    "protocollo di valutazione causale e comparatori territoriali",
    "verifica di competenze, copertura finanziaria ed equità distributiva"
  ],
  "tags": [
    "Santa Fe",
    "Argentina",
    "lotteria",
    "buon contribuente",
    "premio in natura",
    "marciapiedi",
    "tributi locali",
    "public goods",
    "ITT",
    "IV",
    "spillover",
    "randomizzazione",
    "fiscal contract"
  ],
  "revisionHistory": [
    {
      "date": "2026-10-29",
      "note": "Nuovo record verificato su articolo JPubE 2021, working paper IDB e scheda primaria dell'iniziativa; distinti ITT, stima condizionata alle opere, spillover non randomizzati, incompleta realizzazione e possibile perdita di bilancio."
    }
  ]
}
];
