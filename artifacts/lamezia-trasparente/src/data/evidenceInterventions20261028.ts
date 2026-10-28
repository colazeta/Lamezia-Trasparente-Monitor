import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified original sources: CGU / Zamboni–Litschig (2018); Bogotá SED/CEPAL and Barrera-Osorio et al. (2011, 2019). */
export const EVIDENCE_INTERVENTIONS_2026_10_28: readonly EvidenceIntervention[] = [
  {
    "id": "brazil-cgu-municipal-procurement-audit-risk-rct",
    "title": "Aumento randomizzato della probabilità di audit esterno sui contratti pubblici comunali",
    "authority": "Controladoria-Geral da União (CGU), con amministrazioni municipali brasiliane sottoposte a verifica",
    "territory": "120 comuni sorteggiati per il rischio di audit elevato, confrontati con i restanti comuni eleggibili del Brasile",
    "country": "Brasile",
    "implementationYear": "Esperimento annunciato il 12 maggio 2009; audit e misurazioni nel marzo–maggio 2010",
    "problem": "Rischio di frodi, favoritismi e gravi irregolarità nell'impiego di trasferimenti federali per acquisti e appalti comunali; insufficiente capacità deterrente dei controlli ordinari.",
    "measure": "La CGU ha comunicato pubblicamente a 120 comuni selezionati casualmente che 30 di essi sarebbero stati controllati circa un anno dopo, aumentando temporaneamente la probabilità annua di audit da circa 5% a 25%. I sindaci hanno ricevuto anche una lettera formale; successivi audit CGU hanno misurato irregolarità di procurement e servizi.",
    "mechanism": "L'aumento credibile e reso noto del rischio di audit esterno può disincentivare accordi collusivi e violazioni documentabili, specialmente nelle procedure a concorrenza ristretta, quando sono prevedibili sanzioni e verifiche indipendenti.",
    "population": "Amministrazioni e decisori di procurement dei comuni brasiliani; nel gruppo ad alto rischio 120 municipalità; campione analitico 60 comuni verificati nel maggio 2010 (30 trattati e 30 controlli), con 60 controlli aggiuntivi del marzo 2010 in analisi pooled.",
    "primaryArea": "trasparenza_integrita_anticorruzione",
    "secondaryAreas": [
      "procurement_spesa_pubblica",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "enforcement_controllo",
      "targeting_data_analytics",
      "informazione_trasparenza",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "sorteggio pubblico dell'intensità di audit",
      "notifica preventiva ai sindaci",
      "audit CGU su documenti e forniture",
      "codifica uniforme delle irregolarità",
      "report pubblici e follow-up delle competenti autorità"
    ],
    "territorialScale": "Intergovernativa: controllo federale dei processi di acquisto e delle spese dei comuni.",
    "interventionStatus": "Esperimento 2009–2010 concluso; il programma federale di controlli ai municipi è proseguito con metodologie evolute, senza presumere che il trattamento randomizzato sia oggi identico.",
    "evaluationMethod": "Randomized policy experiment, differenza tra gruppi con bassa/alta probabilità ex ante di audit. La CGU randomizzò 120 comuni nel gruppo 25% rispetto a circa 5% degli altri; misurazione uniforme delle infrazioni con audit successivi. Analisi semplice e aggiustata, errori standard cluster a livello municipale.",
    "comparator": "Comuni eleggibili al normale programma di audit CGU con probabilità annua di circa 5%; 30 comuni campionati nel maggio 2010 e ulteriori 60 controlli del marzo 2010 nelle stime pooled.",
    "outcomes": [
      "quota di risorse federali controllate con evidenze di irregolarità corruttive negli acquisti",
      "quota di procedure di procurement con evidenza documentale di irregolarità",
      "eterogeneità per modalità di gara ristretta/non ristretta",
      "qualità assistenza sanitaria primaria riferita dagli utenti",
      "conformità del programma Bolsa Família"
    ],
    "results": "Aumenti temporanei del rischio di audit hanno ridotto gli episodi codificati come corruzione/irregolarità gravi nel procurement municipale. I benefici si concentrano nelle procedure ristrette, mentre nelle gare non ristrette la stima non è significativa. Nessun miglioramento statisticamente dimostrato nei servizi sanitari primari o nei controlli di eleggibilità/condizionalità di Bolsa Família. La misura osserva irregolarità amministrative documentate: non prova automaticamente condanne penali né un miglioramento di tutti i servizi.",
    "effectSize": "Rischio annuale di audit ~5% → 25% (+20 punti). Tabella 4, campione pooled: quota di risorse con corruzione codificata nel controllo 18,7%, differenza −10,5 punti percentuali (stima aggiustata −9,5 pp); quota di procedure con evidenza di corruzione 31,6% nel controllo, −15,4 pp non aggiustati (−11,8 pp con covariate). Per gare ristrette −18,9 pp non aggiustati; per gare aperte −6,0 pp, non significativo. Non convertire questi valori in risparmi di cassa.",
    "evidenceStrength": "forte",
    "costsRequirements": "Richiede ente di controllo terzo con poteri legali, disponibilità di fascicoli di gara e trasferimenti, auditor qualificati, standard di codifica delle violazioni, procedure di contestazione e seguito correttivo. Lo studio non produce una stima completa del costo netto o del ROI del programma per un Comune.",
    "limitations": [
      "Il trattamento è stato deciso e condotto dalla CGU federale, non autonomamente dalle amministrazioni comunali: in Italia la replicabilità dei poteri di audit dipende dalle competenze degli organi di vigilanza.",
      "Il campione effettivamente verificato è inferiore ai circa 5.400 comuni potenzialmente nel controllo; intervalli di confidenza relativamente ampi in alcune specificazioni.",
      "La definizione operativa di 'corruzione' nei rapporti include in parte mismanagement e irregolarità non equivalenti a reati accertati con sentenza.",
      "Non si possono escludere sostituzioni delle condotte improprie verso risorse non federali, altre procedure o periodi successivi al controllo.",
      "Nessun impatto identificato su due ulteriori dimensioni: qualità percepita dell'assistenza sanitaria e regolarità dei trasferimenti condizionati."
    ],
    "unintendedEffects": "Non sono valutati in modo completo spostamenti dell'irregolarità verso altri capitoli di spesa o periodi, costi di compliance e possibili ritardi amministrativi; non vanno presunti assenti.",
    "primarySource": {
      "label": "Controladoria-Geral da União — Programa de Fiscalização por Sorteios Públicos",
      "url": "https://www.gov.br/cgu/pt-br/assuntos/auditoria-e-fiscalizacao/programa-de-fiscalizacao-em-entes-federativos/3-ciclo/sorteios-publicos"
    },
    "evaluationStudies": [
      {
        "label": "Journal of Development Economics — articolo definitivo",
        "url": "https://doi.org/10.1016/j.jdeveco.2018.03.008",
        "citation": "Zamboni, Y. e Litschig, S. (2018), Audit risk and rent extraction: Evidence from a randomized evaluation in Brazil, Journal of Development Economics 134, 133–149.",
        "doi": "10.1016/j.jdeveco.2018.03.008"
      },
      {
        "label": "Working paper degli autori — tabelle e appendici",
        "url": "https://s-litschig.github.io/pdfs/Zamboni_and_Litschig_2018.pdf",
        "citation": "Zamboni, Y. e Litschig, S., preprint finale marzo 2018, Table 4, effetti dei controlli randomizzati sul procurement."
      }
    ],
    "lastVerifiedAt": "2026-10-28",
    "transferabilityItaly": "Alta per il principio di controlli indipendenti credibili, selezione documentata dei procedimenti e audit risk-based nella fase esecutiva; medio-bassa per riprodurre la randomizzazione esterna, che richiede poteri e competenze non nella disponibilità del singolo Comune. Non equiparare automaticamente audit interni e CGU.",
    "lameziaAdaptation": "Nel quadro PIAO/rischi corruttivi e delle competenze di segreteria, RPCT, controllo di gestione e altri organi competenti, costruire un inventario dei contratti e degli affidamenti ad alta discrezionalità, con fascicoli e alert su procedure ristrette, ripetizioni dei fornitori, varianti e fasi esecutive. Proporre una verifica a campione motivata, indipendente e tracciata su un insieme di procedimenti, con esiti classificati e follow-up; non pretendere di introdurre audit CGU o sanzioni estranee alle competenze comunali. Valutare con ANAC e autorità competenti eventuali accordi sperimentali.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "esportazioni BDNCP e dati contratti/affidamenti del Comune",
      "classificazione comparabile di procedure e rilievi",
      "base giuridica e responsabilità per gli audit",
      "controllori indipendenti/controllo interno competente",
      "protocollo di campionamento e valutazione con unità comparabili",
      "distinzione formale fra violazioni amministrative e accertamenti penali"
    ],
    "tags": [
      "procurement",
      "integrità",
      "CGU",
      "Brasile",
      "RCT",
      "audit risk",
      "contratti pubblici",
      "controlli a campione",
      "rischio corruttivo",
      "evidenza causale"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-28",
        "note": "Prima scheda verificata sullo studio definitivo 2018 e sulla CGU; distinte stime unadjusted/adjusted, null outcomes e codifica amministrativa delle irregolarità."
      }
    ]
  },
  {
    "id": "bogota-school-attendance-cct-savings-timing-rct",
    "title": "Contributi scolastici condizionati: rinviare una quota del pagamento per favorire la reiscrizione",
    "authority": "Alcaldía Mayor de Bogotá — Secretaría de Educación Distrital (SED)",
    "territory": "Bogotá, Colombia (sperimentazioni nei distretti di San Cristóbal e Suba)",
    "country": "Colombia",
    "implementationYear": "Pilota avviato nel 2005; studi su esiti nel 2011 e follow-up di medio/lungo periodo nel 2019; programma storico 2005–2012 secondo CEPAL",
    "problem": "Abbandono e mancata reiscrizione alla scuola secondaria tra studenti a basso reddito, spesso in concomitanza con costi concentrati all'inizio dell'anno e vincoli di liquidità familiare.",
    "measure": "La SED ha sperimentato tramite lotterie pubbliche tre strutture di contributo condizionato alla frequenza scolastica: pagamento regolare (basic), riduzione della quota erogata mensilmente con una parte accantonata fino alla reiscrizione (savings), e trasferimento che incentiva il passaggio alla formazione terziaria (tertiary). Lo stanziamento annuo previsto per beneficiario restava analogo fra varianti rilevanti.",
    "mechanism": "Conservare una quota del trasferimento fino al momento in cui le famiglie affrontano le spese di prosecuzione degli studi riduce i vincoli di liquidità e può sostenere la reiscrizione, senza aumentare il costo nominale del sussidio.",
    "population": "Studenti socioeconomicamente svantaggiati della scuola secondaria; due esperimenti con 10.907 richiedenti eleggibili nell'esperimento basic/savings e 2.526 nel tertiary, con campioni analitici variabili per esito e anno.",
    "primaryArea": "istruzione_giovani",
    "secondaryAreas": [
      "welfare_inclusione_servizi_sociali",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "incentivo_economico",
      "modifica_organizzativa_processo",
      "targeting_data_analytics",
      "servizio_diretto"
    ],
    "tools": [
      "lotterie pubbliche per assegnazione dei sussidi",
      "verifica frequenza scolastica ≥80%",
      "pagamenti bimestrali su carta bancaria",
      "accantonamento di un terzo della somma fino alla reiscrizione",
      "tracciamento degli esiti scolastici e universitari su registri amministrativi"
    ],
    "territorialScale": "Cittadino (Bogotá), con sperimentazione presso quartieri e scuole selezionate.",
    "interventionStatus": "Pilota storico 2005–2012 secondo la ricostruzione CEPAL; non è verificato che le specifiche varianti sperimentali siano attualmente in corso.",
    "evaluationMethod": "RCT individuale con lotterie pubbliche e randomizzazione stratificata il 4 aprile 2005; confronto tra gruppo standard, delayed savings, tertiary incentive e controlli. Valutazioni peer-reviewed 2011 e 2019; 2019 follow-up amministrativo per 5–10 anni dopo l'uscita dalla scuola secondaria, errori standard cluster per scuola.",
    "comparator": "Studenti eleggibili assegnati tramite lotteria a gruppi di controllo senza il trasferimento; analisi anche differenziale tra architetture di pagamento a parità di budget nominale.",
    "outcomes": [
      "presenza a scuola",
      "reiscrizione puntuale alla scuola secondaria",
      "abbandono",
      "diploma secondario",
      "immatricolazione terziaria a medio termine",
      "immatricolazione terziaria puntuale a lungo termine",
      "conseguimento di titolo terziario",
      "potenziali effetti su fratelli e sorelle"
    ],
    "results": "I sussidi migliorano la frequenza rispetto ai controlli. Il pagamento con quota rinviata aumenta la reiscrizione puntuale e, nel sottogruppo iscritto alle classi superiori all'avvio, l'ingresso puntuale nel terziario anche negli anni successivi. L'incentivo diretto all'università accelera l'ingresso soprattutto in istituti di qualità inferiore. Il follow-up NON trova aumenti robusti della laurea per l'intero campione, né dell'accesso universitario nel lungo periodo per tutti i gradi; il risultato dipende da coorte e definizione dell'esito.",
    "effectSize": "Saggio 2019: nella popolazione basic/savings, reiscrizione puntuale +3,5 punti percentuali per savings rispetto al controllo (base 51%, p<0,01) e +2,4 pp per basic (p<0,10). Nell'analisi pooled per studenti inizialmente ai gradi 9–11, iscrizione terziaria puntuale nel lungo termine: savings +3,9 pp (SE 1,4 pp) e tertiary +3,2 pp (SE 1,8 pp), su base controllo 21%. Iscrizione terziaria 'ever' a lungo termine: +2,8 pp per savings in gradi 9–11, solo p<0,10; nel campione completo l'effetto non è statisticamente significativo. Nessuna evidenza robusta di aumento generalizzato dei titoli terziari.",
    "evidenceStrength": "forte",
    "costsRequirements": "Con frequenza sufficiente, trasferimento nominale di circa 150 USD per anno e studente nel contesto 2005, con componente savings di circa 50 USD pagata in coincidenza della reiscrizione. Richiede regole di eleggibilità, disponibilità di bilancio, carte/pagamenti tracciati, registri scolastici, controllo accesso/benefici, comunicazioni e governance dei dati dei minori. Non è un costo unitario replicabile in Italia.",
    "limitations": [
      "Il disegno è randomizzato, ma il contesto colombiano e l'importo dei contributi non sono direttamente trasferibili al diritto allo studio in Italia.",
      "L'effetto sul lungo periodo è eterogeneo: sostanzialmente concentrato negli studenti delle classi secondarie superiori all'inizio della sperimentazione.",
      "Alcune evidenze di lungo periodo sono significative soltanto al 10%; non vanno presentate come risultati solidi al 5%.",
      "Gli effetti sul diploma universitario non sono robusti nell'intero campione; accelerare l'iscrizione non equivale necessariamente ad aumentare il numero finale di laureati.",
      "Analisi precedenti riferiscono possibili riallocazioni intra-familiari di lavoro/scuola tra fratelli e sorelle; servono controlli distributivi.",
      "Alcuni pagamenti sono subordinati all'80% delle presenze: la replica italiana deve evitare qualsiasi sospensione di un diritto soggettivo, soprattutto per assenze giustificate e bisogni educativi speciali."
    ],
    "unintendedEffects": "La valutazione precedente segnala possibili effetti indiretti intrafamiliari: alcuni fratelli/sorelle dei beneficiari lavorano di più o frequentano meno la scuola, senza stima direttamente trasferibile al contesto italiano. La variante tertiary induce maggiormente ingressi in programmi terziari meno qualificati.",
    "primarySource": {
      "label": "CEPAL — scheda del programma municipale Subsidios Condicionados a la Asistencia Escolar (2005–2012)",
      "url": "https://observatorioalianzapacifico.cepal.org/en/ncsp/programme/subsidios-condicionados-la-asistencia-escolar-conditional-subsidies-school"
    },
    "evaluationStudies": [
      {
        "label": "American Economic Journal: Applied Economics — valutazione RCT 2011",
        "url": "https://doi.org/10.1257/app.3.2.167",
        "citation": "Barrera-Osorio, F., Bertrand, M., Linden, L. L. e Pérez-Calle, F. (2011), Improving the Design of Conditional Transfer Programs: Evidence from a Randomized Education Experiment in Colombia, AEJ: Applied Economics 3(2), 167–195.",
        "doi": "10.1257/app.3.2.167"
      },
      {
        "label": "American Economic Journal: Applied Economics — follow-up 2019",
        "url": "https://doi.org/10.1257/app.20170008",
        "citation": "Barrera-Osorio, F., Linden, L. L. e Saavedra, J. E. (2019), Medium- and Long-Term Educational Consequences of Alternative Conditional Cash Transfer Designs: Experimental Evidence from Colombia, AEJ: Applied Economics 11(3), 54–91.",
        "doi": "10.1257/app.20170008"
      },
      {
        "label": "NIH PMC — testo integrale follow-up con tabelle 3–5",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10409605/",
        "citation": "Versione integrale accessibile dell'articolo del 2019: disegno sperimentale, effetti per sottogruppo e test di robustezza."
      }
    ],
    "lastVerifiedAt": "2026-10-28",
    "transferabilityItaly": "Medio-alta per il principio della tempestività dei contributi e del supporto nelle fasi di transizione scolastica; limitata per un sussidio condizionato a frequenza e per la modifica dei benefici regionali/nazionali vincolati. Possibile solo su fondi comunali discrezionali e nel rispetto di competenze, parità di accesso e tutela dei minori.",
    "lameziaAdaptation": "Con l'Ufficio Politiche Educative, l'Ambito Sociale e le scuole, ricostruire i tempi effettivi di erogazione dei contributi per libri e trasporto e le necessità al passaggio fra cicli. Valutare l'anticipazione o il frazionamento di eventuali aiuti comunali discrezionali in prossimità delle scadenze di iscrizione, senza sottrarre somme già spettanti. Misurare con dati aggregati per coorte domanda, erogazione tempestiva, reiscrizione, frequenza e rinunce; non usare una lotteria per prestazioni dovute per legge.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "inventario dei contributi disponibili e vincoli di erogazione",
      "intese con istituti scolastici e Ufficio Politiche Educative",
      "dati aggregati su domanda, erogazione e passaggi scolastici",
      "protocollo GDPR per dati di minori e famiglie",
      "analisi distribuzione di reddito e bisogni senza stigmatizzazione",
      "valutazione controfattuale e budget di contribuzione discrezionale"
    ],
    "tags": [
      "Bogotá",
      "Colombia",
      "istruzione",
      "sussidi scolastici",
      "RCT",
      "tempi dei pagamenti",
      "reiscrizione",
      "transizione scuola-università",
      "welfare educativo"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-28",
        "note": "Nuova scheda unica per il pilota 2005 e le due valutazioni 2011/2019; evidenze di lungo periodo qualificate per sottocampione, significatività e outcome non migliorati."
      }
    ]
  }
];
