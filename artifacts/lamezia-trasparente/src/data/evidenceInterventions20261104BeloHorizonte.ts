import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified 2026-11-04: municipal RCT with ITT/LATE and adverse findings kept distinct. */
export const EVIDENCE_INTERVENTIONS_2026_11_04_BELO_HORIZONTE: readonly EvidenceIntervention[] = [
{
  "id": "belo-horizonte-brazil-municipal-business-license-enforcement-rct-2011",
  "title": "Belo Horizonte: controlli mirati sulle licenze commerciali e registrazione delle microimprese",
  "authority": "Prefeitura de Belo Horizonte (PBH), ispettori municipali; Governo dello Stato di Minas Gerais e gruppo di ricerca World Bank",
  "territory": "Belo Horizonte, Minas Gerais",
  "country": "Brasile",
  "implementationYear": "2011–2012 (interventi e follow-up; campagna ispettiva dicembre 2011–aprile 2012)",
  "problem": "Microimprese attive senza tutte le necessarie registrazioni o licenze; incertezza su quale combinazione di informazione, agevolazioni e controllo possa aumentare la regolarità amministrativa.",
  "measure": "Esperimento di campo: distribuzione di informazioni sui procedimenti di registrazione; informazioni più esenzione dai costi iniziali e commercialista gratuito per un anno; assegnazione di verifiche da parte di ispettori municipali sulle licenze di localizzazione/funzionamento ALF; valutazione degli effetti su imprese vicine. Non fu un'applicazione generalizzata obbligatoria della sola misura ispettiva.",
  "mechanism": "L'assegnazione a verifiche credibili sulla licenza municipale aumenta la probabilità che imprese già attive regolarizzino il titolo; la sola informazione o riduzione dei costi iniziali potrebbe non superare costi ricorrenti e incentivi economici all'informalità.",
  "population": "Imprese potenzialmente informali censite in 605 isolati urbani (7.795 imprese nella lista iniziale); 577 assegnate al trattamento ispettivo, 331 alla comunicazione, 328 all'offerta gratuita e gruppi di controllo/effetto indiretto.",
  "primaryArea": "sviluppo_economico_commercio_lavoro",
  "secondaryAreas": [
    "capacita_amministrativa_personale",
    "digitalizzazione_servizi_online",
    "fiscalita_entrate_riscossione",
    "trasparenza_integrita_anticorruzione"
  ],
  "interventionTypes": [
    "enforcement_controllo",
    "informazione_trasparenza",
    "incentivo_economico",
    "targeting_data_analytics",
    "modifica_organizzativa_processo"
  ],
  "tools": [
    "registro delle imprese e licenze ALF",
    "assegnazione casuale stratificata per isolati",
    "brochure e numero informativo",
    "esonero dai costi di registrazione e supporto contabile temporaneo",
    "visite ispettive comunali con notifiche",
    "matching dei registri amministrativi ALF, SIMPLES e MEI"
  ],
  "territorialScale": "Quartieri e isolati all'interno di una metropoli; cluster randomisation stratificata per sottodistretto e densità delle imprese.",
  "interventionStatus": "Sperimentazione completata nel 2012. Il sistema di licenze municipali ALF è tuttora operativo con procedure molto diverse e successive semplificazioni (PBH 2025); la campagna specifica non è presentata come attualmente attiva.",
  "evaluationMethod": "Randomized field experiment a due livelli: 605 isolati randomizzati a controlli, comunicazione e baseline; assegnazione ulteriore individuale. Stima intention-to-treat (ITT) su esiti amministrativi, errori standard clusterizzati; LATE mediante assegnazione come strumento per visita effettiva. Analisi di spillover, aggiustamenti per test multipli e controlli sui tassi di risposta.",
  "comparator": "Imprese in 201 isolati di controllo e sottogruppi non trattati nello stesso periodo; per comunicazione/offerta gratuita confronto su imprese che avevano risposto alla survey baseline, per ispezioni confronto sulla più ampia lista originaria pesata.",
  "outcomes": [
    "nuove licenze municipali ALF (match certo o probabile)",
    "registrazione nazionale SIMPLES e MEI",
    "qualsiasi nuova registrazione",
    "chiusura dell'attività",
    "conoscenze e fiducia nell'amministrazione",
    "effetti indiretti sulle imprese confinanti"
  ],
  "results": "L'assegnazione casuale a un controllo municipale ha incrementato soprattutto il rilascio di licenze ALF: +2,18 punti percentuali per match certi e +3,27 punti per match certi o probabili (rispetto ai controlli). Sull'ottenimento di almeno una forma di registrazione la stima ITT è +2,45 punti per match certi e +3,92 per certi/probabili. L'informazione non mostra effetti robustamente positivi; l'offerta di costi iniziali azzerati e commercialista gratuito non aumenta la formalizzazione e riduce la registrazione nella categoria MEI. Non emerge un effetto significativo su chiusure di imprese o imprese vicine. Gran parte del beneficio municipale riguarda ALF, non la registrazione fiscale nazionale.",
  "effectSize": "Tab. 4, campione ispezioni n=5.186: ALF match certo +0,0218 (p<0,05), ALF certo/probabile +0,0327 (p<0,01); qualsiasi registrazione certa +0,0245 (p<0,10), certa/probabile +0,0392 (p<0,01). Offerta gratuita, registro MEI certo −0,0349 (p<0,01), gruppo comparativo distinto. Stime LATE IV su imprese rispondenti alla survey: +0,214–0,265 (21,4–26,5 punti), INFERENZA DEBOLE (per ALF p=0,108 per match certo, 0,051 per certo/probabile), da NON confondere con ITT o proiettare sull'intera popolazione.",
  "evidenceStrength": "forte",
  "costsRequirements": "Costi stimati dagli autori: R$64,34 per ispezione, 387 visite effettive, R$24.900 totali; R$1.132–2.264 per impresa addizionalmente registrata secondo ITT. Le stime fiscali sui ritorni sono illustrative e includono entrate spettanti a più livelli di governo: non prova di saldo netto positivo per il solo Comune. Richiede personale ispettivo competente, titoli normativi, coordinamento registri, classificazione delle attività, informativa adeguata e audit dei procedimenti.",
  "limitations": [
    "L'assegnazione a ispezione è randomizzata, ma solo 387 delle 577 imprese assegnate risultavano aperte e visitabili; non riportare il LATE 21–27 punti come ITT dell'intervento o beneficio atteso.",
    "Le ispezioni riguardavano il solo titolo comunale ALF; l'effetto su formalità complessiva deriva largamente da licenze locali, spesso di imprese già parzialmente registrate.",
    "La valutazione mediante survey subisce attrition (1.802 rispondenti su 3.227, 56%); gli esiti amministrativi sono invece ricostruiti senza attrition con abbinamenti certi/probabili.",
    "Gli esperimenti di informazione e riduzione dei costi si svolgono su sottocampione che ha risposto alla baseline, differente dall'intera platea delle ispezioni; non equipararne direttamente le ATE.",
    "Norme MEI cambiate durante lo studio: possibili effetti di informazioni ormai inattuali; risultati non generalizzabili a comunicazioni amministrative aggiornate e personalizzate.",
    "Le stime IV hanno livelli di significatività marginali e dipendono da ipotesi di esclusione che gli stessi autori considerano discutibili.",
    "Il calcolo del recupero tributario non osserva effettivi pagamenti futuri, separazione dei gettiti per livelli di governo o reazioni economiche a lungo termine.",
    "Dal 2019 Belo Horizonte ha ampliato le attività esentate da ALF e digitalizzato i procedimenti; replicare il trattamento storico senza verificare quali attività siano oggi esenti sarebbe scorretto."
  ],
  "unintendedEffects": "L'offerta gratuita ha ridotto la registrazione MEI nel campione trattato (−3,49 punti per match certo). Le survey riportano una diminuzione della fiducia nel governo tra gruppi che ricevevano informazioni/offerte. L'effetto su cessazioni non è statisticamente significativo. Rischi plausibili nella replica: oneri sproporzionati per microimprese, selezione discriminatoria delle verifiche, contenzioso, incentivi a cessare/trasferirsi; non quantificati come effetti certi.",
  "primarySource": {
    "label": "Prefeitura de Belo Horizonte — discipline, condizioni e rilascio degli alvarás ALF (fonte amministrativa attuale; non documenta da sola l'esperimento storico)",
    "url": "https://prefeitura.pbh.gov.br/empreendedor/abrir-minha-empresa/alvara-localizacao-funcionamento"
  },
  "evaluationStudies": [
    {
      "label": "World Bank Economic Review — versione definitiva peer-reviewed, testo integrale World Bank",
      "url": "https://documents1.worldbank.org/curated/en/802931502348707678/pdf/112478-JRN-PUBLIC-WBER-2016-30-1-a-helping-hand-or-the-long-arm-of-the-law-experimental-evidence-on-what-governments-can-do-to-formalizr-firms.pdf",
      "citation": "de Andrade, G. H., Bruhn, M. & McKenzie, D. (2016). A Helping Hand or the Long Arm of the Law? Experimental Evidence on What Governments Can Do to Formalize Firms. The World Bank Economic Review, 30(1), 24–54.",
      "doi": "10.1093/wber/lhu008"
    },
    {
      "label": "World Bank — working paper 6435 con metodologia e contesto dell'esperimento",
      "url": "https://openknowledge.worldbank.org/entities/publication/12bffa63-7081-5deb-bf0c-33e28e9d347c",
      "citation": "de Andrade, G. H., Bruhn, M. & McKenzie, D. (2013). A Helping Hand or the Long Arm of the Law? World Bank Policy Research Working Paper 6435."
    }
  ],
  "lastVerifiedAt": "2026-11-04",
  "transferabilityItaly": "Rilevante per Comuni italiani perché i controlli SUAP e il monitoraggio dei titoli abilitativi possono incidere sulla regolarità delle attività economiche. Trasferibile soprattutto il protocollo di individuazione dei gap amministrativi, informazione corretta, ispezioni motivate e valutazione di outcome; NON sono trasferibili automaticamente il regime brasiliano ALF/SIMPLES/MEI, le stime di gettito o la possibilità di ispezionare imprese senza requisiti legali.",
  "lameziaAdaptation": "Con SUAP di Lamezia, Polizia Locale e uffici competenti: mappare dati aggregati su SCIA, licenze, revoche, integrazioni e ritardi tramite CalabriaSUAP; definire criteri di verifica per tipologie ad alto rischio oggettivo, selezionare eventuali procedimenti comparabili per verifiche legittime e proporzionate, e misurare gli esiti correttivi verificati. Affiancare comunicazioni aggiornate e un percorso guidato di regolarizzazione, senza sanzionare automaticamente carenze documentali sanabili. Qualsiasi assegnazione sperimentale dei controlli va sottoposta prima a verifica giuridica, garantendo uniformità, non discriminazione e priorità ai rischi di sicurezza e salute.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "accesso legittimo a serie aggregate di pratiche CalabriaSUAP e tipologie di SCIA/permessi",
    "mappa delle competenze ispettive fra SUAP, Polizia Locale, ASP e altre autorità",
    "definizione di base giuridica e criteri proporzionati per le verifiche",
    "tracciabilità di avvisi, rettifiche, regolarizzazioni e sanzioni",
    "protocollo privacy e revisione dei bias nei criteri di selezione",
    "misure di qualità del servizio, tempi, contenzioso e costi reali"
  ],
  "tags": [
    "Belo Horizonte",
    "Brasile",
    "microimprese",
    "attività produttive",
    "SUAP",
    "SCIA",
    "licenze",
    "Alvará ALF",
    "enforcement",
    "cluster RCT",
    "intention-to-treat",
    "formalizzazione",
    "costi amministrativi",
    "effetti indesiderati"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-04",
      "note": "Primo censimento: tabelle 3–5 del peer-reviewed World Bank Economic Review confrontate con fonte istituzionale PBH e pagina SUAP Lamezia. Distinti ITT, LATE marginale, ALF da registrazione fiscale e costi modellizzati; formalizzazione tramite agevolazioni non efficace o negativa."
    }
  ]
}
];
