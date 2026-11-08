import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting 5 novembre 2026: una richiesta ACU del 2 novembre e due petizioni
 * anteriori recuperate dalle pagine originali Change.org. Identità distinte
 * dai promotori di proposte già censite, in filoni tematici condivisi.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261105_BACKFILL = [
  {
    id: "turismo-imposta-soggiorno-trasparenza-acu-calabria-2026",
    title: "Pubblicazione dei dati turistici e trasparenza sull'imposta di soggiorno",
    summary:
      "Il 2 novembre 2026 ACU Calabria, in una nota attribuita al presidente Sergio Tomaino, chiede al Comune di accertare e pubblicare le presenze turistiche richiamate nel dibattito sull'eventuale imposta di soggiorno, rendere accessibili dati dettagliati sull'impiego degli eventuali proventi e sugli adempimenti dei gestori, anche mediante una piattaforma pubblica, e coinvolgere le associazioni dei consumatori nel confronto sulla misura e sulla programmazione turistica. I giudizi del promotore sulla legittimità o sull'opportunità del tributo non sono assunti come valutazioni giuridiche LT.",
    promoterId: "acu-calabria",
    promoter: "ACU Calabria",
    promoterType: "associazione",
    coPromoters: ["Sergio Tomaino"],
    periodLabel: "2 novembre 2026",
    year: "2026",
    theme: "Trasparenza e partecipazione sull'imposta di soggiorno",
    threadId: "turismo-accoglienza-lamezia-2026",
    threadLabel: "Coordinamento dell'accoglienza e destinazione turistica",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme — Amministrazione comunale",
    channel: "comunicato",
    sourceLabel: "il Lametino, 2 novembre 2026 — nota attribuita ad ACU Calabria",
    sourceUrl: "https://www.lametino.it/ultimora/tassa-di-soggiorno-a-lamezia-acu-inutile-balzello-che-limita-i-diritti-degli-utenti.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La pubblicazione del Lametino del 2 novembre riproduce una nota attribuita ad ACU Calabria e al suo presidente Sergio Tomaino. Sono richieste concrete la pubblicazione delle presenze turistiche, la trasparenza sull'uso di eventuali introiti e sugli adempimenti dei gestori, anche tramite piattaforma accessibile, e l'inclusione delle associazioni dei consumatori nel confronto. La mancata convocazione dell'associazione e le valutazioni sul regime legislativo dell'imposta sono posizioni attribuite al promotore; non sono riscontri autonomi. Non risultano un deposito, una risposta ufficiale specifica ad ACU, un regolamento deliberato, una piattaforma attiva o una misura attuata. Il promotore e l'oggetto prevalente (verifiche informative e partecipazione dei consumatori) differiscono da Federalberghi Calabria, che propone tavolo per gli operatori e impiego turistico del gettito: stesso filone, due proposal ID. Destinatario documentato senza inferenza di competenza: not_assessed.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-11-02",
    lastUpdated: "2026-11-02",
    events: [
      {
        id: "acu-calabria-trasparenza-imposta-soggiorno-2026-11-02",
        date: "2026-11-02",
        type: "emersione",
        title: "ACU Calabria chiede dati pubblici e partecipazione al confronto sull'imposta di soggiorno",
        summary:
          "La nota pubblicata dalla stampa richiede la verifica e pubblicazione dei dati sulle presenze turistiche, informazioni trasparenti sull'uso dei futuri introiti e sugli adempimenti dei gestori, e l'inclusione dei consumatori nel confronto. Non prova una decisione o un procedimento istituzionale.",
        sourceLabel: "il Lametino — nota ACU Calabria, 2 novembre 2026",
        sourceUrl: "https://www.lametino.it/ultimora/tassa-di-soggiorno-a-lamezia-acu-inutile-balzello-che-limita-i-diritti-degli-utenti.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "tutela-cane-kira-progetto-gestione-controllata-solla-2026",
    title: "Valutazione di un progetto di gestione controllata per il cane Kira",
    summary:
      "L'8 settembre 2026 Clara Solla avvia una petizione online per chiedere la valutazione del possibile ritorno del cane Kira nel territorio di provenienza, subordinato a un progetto di gestione responsabile che preveda un tutor di riferimento, monitoraggio del benessere e delle condizioni di sicurezza e collaborazione fra volontari, associazioni e istituzioni. Secondo la promotrice Kira è stata trasferita nel canile comunale ed è già sterilizzata: circostanze non autonomamente accertate.",
    promoterId: "clara-solla",
    promoter: "Clara Solla",
    promoterType: "cittadino_comitato",
    periodLabel: "8 settembre 2026",
    year: "2026",
    theme: "Tutela animale e servizi civici",
    threadId: "tutela-animali-servizi-comunali",
    threadLabel: "Tutela degli animali: regole, servizi e partecipazione",
    territorialArea: "Lamezia Terme; luogo di provenienza del cane non identificato dalla petizione",
    institutionalRecipient: "Sindaco del Comune di Lamezia Terme (indicato come decisore nella petizione); autorità interessate alla valutazione",
    channel: "petizione",
    sourceLabel: "Change.org — petizione originale di Clara Solla, 8 settembre 2026",
    sourceUrl: "https://www.change.org/p/ridate-kira-al-suo-territorio-chiediamo-la-sua-reimmissione",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La pagina Change.org originale indica la creazione l'8 settembre 2026, la promotrice Clara Solla e il sindaco Mario Murone fra i decisori indicati. Chiede una valutazione condizionata del possibile ritorno di Kira con tutor, monitoraggio e collaborazione, non un rilascio senza garanzie. Il racconto sul trasferimento nel canile, sulla sterilizzazione e sulle condizioni di benessere è un'affermazione della promotrice e non un accertamento veterinario o amministrativo. Nessuna prova di consegna delle firme, deposito/protocollo, risposta al caso concreto o attuazione. L'indicazione del Sindaco nella pagina non è attribuzione giuridica di competenza: not_assessed. Distinta dall'iniziativa di Ninfa Marilena Vescio per il regolamento generale sui diritti degli animali, ma collegata al medesimo filone. Il luogo preciso del possibile ritorno non è verificato; nessun punto WGS84 assegnato.",
    evidenceLevel: "fonte_social_verificabile",
    firstSeen: "2026-09-08",
    lastUpdated: "2026-09-08",
    events: [
      {
        id: "clara-solla-kira-petizione-2026-09-08",
        date: "2026-09-08",
        type: "petizione",
        title: "Aperta una raccolta firme online per valutare il rientro controllato di Kira",
        summary:
          "La petizione originale chiede un progetto con tutor, monitoraggio e collaborazione tra soggetti interessati, subordinando l'eventuale ritorno alla verifica delle condizioni di sicurezza. La pubblicazione non prova consegna o deposito formale.",
        sourceLabel: "Change.org — petizione originale, creata l'8 settembre 2026",
        sourceUrl: "https://www.change.org/p/ridate-kira-al-suo-territorio-chiediamo-la-sua-reimmissione",
        evidenceLevel: "fonte_social_verificabile",
      },
    ],
  },
  {
    id: "scuola-perri-pitagora-orario-sei-giorni-di-spena-2026",
    title: "Riesame dell'orario settimanale dell'I.C. Perri Pitagora Don Milani",
    summary:
      "Il 19 settembre 2026 Silvia Di Spena promuove una petizione per chiedere al dirigente scolastico e al Consiglio d'Istituto dell'I.C. Perri Pitagora Don Milani di riesaminare l'articolazione delle lezioni e valutare il ritorno all'orario 08:15–13:15 dal lunedì al sabato, in alternativa al 07:55–13:55 dal lunedì al venerdì descritto per le classi interessate. Al Comune viene chiesto di favorire il confronto fra famiglie, scuola e amministrazione. I disagi e i benefici attesi sono rappresentazioni dei firmatari, non analisi di efficacia accertate.",
    promoterId: "silvia-di-spena",
    promoter: "Silvia Di Spena",
    promoterType: "cittadino_comitato",
    periodLabel: "19 settembre 2026",
    year: "2026",
    theme: "Organizzazione dell'orario scolastico",
    threadId: "scuola-orari-organizzazione-2026",
    threadLabel: "Orari scolastici e organizzazione per le famiglie",
    territorialArea: "Plessi dell'I.C. Perri Pitagora Don Milani a Lamezia Terme",
    institutionalRecipient: "Dirigente scolastico e Consiglio d'Istituto dell'I.C. Perri Pitagora Don Milani; Comune di Lamezia Terme per il confronto richiesto",
    channel: "petizione",
    sourceLabel: "Change.org — petizione originale di Silvia Di Spena, 19 settembre 2026",
    sourceUrl: "https://www.change.org/p/ripristino-dell-orario-scolastico-8-15-13-15-all-i-c-perri-pitagora-don-milani",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La pagina originale Change.org indica la data 19 settembre 2026 e la promotrice Silvia Di Spena. La petizione chiede esplicitamente al dirigente e al Consiglio d'Istituto di valutare un diverso calendario settimanale e al Comune soltanto di agevolare il confronto; la distinzione è conservata nell'elenco dei destinatari, senza inferire competenza. Il sito ufficiale della scuola documenta una comunicazione del 12 settembre sull'organizzazione dei plessi per l'a.s. 2026/27 (https://icperripitagoradonmilani.edu.it/orari-di-funzionamento-plessi-scolastici/): è antecedente alla petizione, NON una risposta o un recepimento. Il 07:55–13:55 per le classi interessate è riferito dalla petizione, non verificato per ogni plesso. La raccolta firme online non dimostra consegna, protocollo, discussione istituzionale o modifica degli orari. Il decreto del Dirigente scolastico n. 1386 del 28 agosto 2026, in esecuzione della delibera del Consiglio d'Istituto n. 161 del 15 dicembre 2025 (https://icperripitagoradonmilani.edu.it/adozione-della-settimana-corta-a-s-2026-27/), precede la petizione e consente un assessment di competenza partially_verified per l'istituto, non per il Comune. Non prova risposta, rigetto, recepimento o modifica degli orari. Distinta dalla proposta cittadina di riduzione temporanea dell'orario per il caldo, che ha oggetto e promotore differenti.",
    evidenceLevel: "fonte_social_verificabile",
    firstSeen: "2026-09-19",
    lastUpdated: "2026-09-19",
    events: [
      {
        id: "silvia-di-spena-orario-scuola-petizione-2026-09-19",
        date: "2026-09-19",
        type: "petizione",
        title: "Pubblicata la petizione per il riesame degli orari all'I.C. Perri Pitagora Don Milani",
        summary:
          "La petizione chiede di valutare la settimana lunedì–sabato 08:15–13:15 e una sede di confronto con le famiglie. La comunicazione ufficiale della scuola del 12 settembre è un antecedente organizzativo, non una risposta alla petizione.",
        sourceLabel: "Change.org — petizione originale, creata il 19 settembre 2026",
        sourceUrl: "https://www.change.org/p/ripristino-dell-orario-scolastico-8-15-13-15-all-i-c-perri-pitagora-don-milani",
        evidenceLevel: "fonte_social_verificabile",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
