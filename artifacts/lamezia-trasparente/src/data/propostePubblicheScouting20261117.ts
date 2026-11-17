import type { PublicProposal } from "./propostePubblicheCore";

/** Ricostruzione May–November 2026: proposta civica e distinta evoluzione procedurale regionale. */
export const SCOUTED_PUBLIC_PROPOSALS_20261117 = [
  {
    "id": "polo-sportivo-paralimpico-stretto-iona-2026",
    "title": "Proposta di polo sportivo paralimpico nell'area del palazzetto e dello stadio Carlei",
    "summary": "Nel maggio 2026 il consigliere regionale Emanuele Ionà propone un polo sportivo paralimpico a Lamezia Terme, prospettando la riqualificazione dell'area del nuovo palazzetto e dello stadio Carlei e un ruolo del Comitato Italiano Paralimpico. Il 16 novembre 2026 la Regione Calabria annuncia che la Giunta ha approvato la stipula di un protocollo d'intesa con il Ministro per lo Sport e i Giovani e il CIP finalizzato a un polo in Calabria, indicando Lamezia quale sede ideale; non è attestata la sottoscrizione né la realizzazione.",
    "promoterId": "emanuele-iona",
    "promoter": "Emanuele Ionà",
    "promoterType": "consigliere",
    "coPromoters": [],
    "periodLabel": "17 maggio – 16 novembre 2026",
    "year": "2026",
    "theme": "Sport paralimpico e riqualificazione degli impianti",
    "threadId": "stretto-carlei-polo-paralimpico-2026",
    "threadLabel": "Polo paralimpico nell'area Stretto–Carlei",
    "territorialArea": "Località Stretto, area del nuovo palazzetto e dello stadio Carlei",
    "institutionalRecipient": "Presidente della Regione Calabria",
    "channel": "comunicato",
    "sourceLabel": "LameziaInforma — proposta attribuita a Emanuele Ionà, 17 maggio 2026",
    "sourceUrl": "https://www.lameziainforma.it/sport/2026/05/17/una-cittadella-dello-sport-paraolimpico-allingresso-di-lamezia-terme-la-proposta-della-regione/67336/",
    "status": "proposta_emersa",
    "linkedActs": [],
    "verificationNote": "La fonte editoriale del 17 maggio attribuisce a Ionà una proposta concreta, ma non un deposito formale. Il comunicato ufficiale della Regione Calabria del 16 novembre documenta l'approvazione della stipula di un protocollo d'intesa Regione–Ministero–CIP, non un protocollo sottoscritto. Il nesso causale fra la proposta del promotore e l'atto della Giunta non è documentato; l'evento regionale è un aggiornamento dello stesso oggetto e non un recepimento attribuito a Ionà. Non sono acquisiti gli estremi e il testo della deliberazione, il protocollo firmato, l'individuazione definitiva delle aree, risorse assegnate o evidenze di avvio lavori o attuazione. La competenza è verificabile solo per la procedura approvata in Giunta, non per proprietà, appalti, gestione o finanziamenti. L'area è descritta senza perimetro o coordinate WGS84 verificate.",
    "evidenceLevel": "ricostruzione_multi_fonte",
    "firstSeen": "2026-05-17",
    "lastUpdated": "2026-11-16",
    "events": [
      {
        "id": "iona-polo-paralimpico-proposta-2026-05-17",
        "date": "2026-05-17",
        "type": "emersione",
        "title": "Ionà propone un polo sportivo paralimpico nell'area del palazzetto",
        "summary": "La fonte editoriale attribuisce a Emanuele Ionà la proposta di valorizzare e riqualificare il nuovo palazzetto e lo stadio Carlei con attività paralimpiche e possibile gestione CIP; non è verificato un deposito.",
        "sourceLabel": "LameziaInforma, 17 maggio 2026",
        "sourceUrl": "https://www.lameziainforma.it/sport/2026/05/17/una-cittadella-dello-sport-paraolimpico-allingresso-di-lamezia-terme-la-proposta-della-regione/67336/",
        "evidenceLevel": "fonte_stampa"
      },
      {
        "id": "regione-calabria-protocollo-polo-paralimpico-2026-11-16",
        "date": "2026-11-16",
        "type": "aggiornamento",
        "title": "La Giunta approva la stipula del protocollo d'intesa per il polo paralimpico",
        "summary": "La fonte istituzionale attesta l'approvazione della stipula di un protocollo d'intesa Regione–Ministero–CIP, indicante Lamezia quale sede ideale. Non attesta la firma, la localizzazione definitiva, finanziamenti, lavori, attuazione o recepimento della specifica proposta di Ionà.",
        "sourceLabel": "Regione Calabria — comunicato del 16 novembre 2026",
        "sourceUrl": "https://www.regione.calabria.it/regione-ok-giunta-a-piano-emergenza-diga-migliarite-stato-emergenza-per-bova-marina-protocollo-polo-sportivo-paralimpico-e-piano-politiche-della-famiglia/",
        "evidenceLevel": "fonte_ufficiale"
      }
    ]
  }
] as const satisfies readonly PublicProposal[];
