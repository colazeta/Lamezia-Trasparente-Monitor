import {
  identifyInstitutionalSessionCandidate,
  type InstitutionalSessionCandidate,
  type InstitutionalSessionCandidateInput,
} from "../../../../scripts/institutional-session-candidates";

import type {
  CouncilSessionV0,
  CouncilSessionV0ContextResearch,
  CouncilSessionV0Provenance,
} from "@/data/councilSessionV0";

const OFFICIAL_ALBO_URL = "https://albo.tinnvision.cloud/?ente=00301390795";
const COMMISSION_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2648_2_P?ente=00301390795";
const COMMISSION_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304.pdf";
const COMMISSION_VI_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2788_2_P?ente=00301390795";
const COMMISSION_VI_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/165152190ac39451d35caf5815bfb4d7d6d7ee66c20abe630c98b47d62858c72.pdf";
const COMMISSION_IV_EARLY_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2840_2_P?ente=00301390795";
const COMMISSION_IV_EARLY_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/365976826d174821dfcd69c4c02710fcc8eb324c24ccefe2549d3fce932abd0b.pdf";
const COMMISSION_VI_SEPTEMBER_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2859_1_X?ente=00301390795";
const COMMISSION_VI_SEPTEMBER_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/a1dad36522921833ac71b994a73032d3454227d0a2c00f57156a8d7059d94baf.pdf";
const COMMISSION_IV_LATER_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2860_1_X?ente=00301390795";
const COMMISSION_IV_LATER_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/dee314eb1f7e9133848be4b48c1c0b5e06ddd60371a92acc40ef9e290a62e411.pdf";
const COMMISSIONS_III_IV_JOINT_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2861_1_X?ente=00301390795";
const COMMISSIONS_III_IV_JOINT_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/feb500c847880bf03ab1cd09190b961828f5b3873d60bea800e93367a3c74468.pdf";
const COMMISSION_III_GUARANTOR_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2879_1_X?ente=00301390795";
const COMMISSION_III_GUARANTOR_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/b3f2d6a2b5884cd5e17b77b03289abeff7ab1f9994d7b70aa0d66ade22abdb09.pdf";
const COMMISSION_IV_MID_SEPTEMBER_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2925_1_X?ente=00301390795";
const COMMISSION_IV_MID_SEPTEMBER_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/671bbd99e42677437d3c2b424d2ffd1794c8b1195efbf867591e3550480d31d1.pdf";
const COMMISSION_III_MID_SEPTEMBER_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2926_1_X?ente=00301390795";
const COMMISSION_III_MID_SEPTEMBER_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/3de7a9e3185b36116474d8ecb3bed1c425b7395af5e85c9bb83bb16ca082e8d0.pdf";
const COUNCIL_SESSION_EVIDENCE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2755_6_ALLEG?ente=00301390795";
const COUNCIL_SESSION_EVIDENCE_ARCHIVE_URL =
  "/data/public/albo/documents/2026/e008e83a4d7ae0a4672146b73ebc62e64d565a26eeb043cafaf9e45d92ecf2c5.pdf";
const COUNCIL_PROJECTS_OF_LIFE_URL =
  "https://www.comune.lamezia-terme.cz.it/it/news/115163/lamezia-amministrazione-comunale-su-disabilita-sottoscritti-142-progetti-di-vita-ora-rafforziamo-rete-territoriale";
const COUNCIL_CITY_ONE_RECORDING_URL =
  "https://www.cityonelamezia.it/episodio/video/consiglio-comunale-del-13-agosto-consiglio-comunale/?format=video";
const COUNCIL_VITALE_VIDEO_URL = "https://www.instagram.com/reel/DcGRDc8o1qI/";
const MUNICIPAL_NURSERIES_NOTICE_URL =
  "https://www.comune.lamezia-terme.cz.it/it/news/avvio-del-servizio-di-asilo-nido-comunale";
const MUNICIPAL_NURSERIES_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/scuola-e-universita/2026/09/11/asili-nido-comunali-aperti-dal-15-settembre/69226/";
const SCHOOL_TRANSPORT_CITY_ONE_URL =
  "https://www.cityonelamezia.it/lamezia-gianturco-assistenza-specialistica-si-parte-con-il-nuovo-anno-scolastico-piu-ore-per-gli-alunni-con-disabilita/";
const SERRA_ANNUNZIATA_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-consigliera-serratore-presenta-mozione-su-rifiuti-e-sicurezza-in-localita-serra-e-annunziata.html";
const COMMISSION_I_MOTION_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-mozioni-di-sfiducia-contro-cristiano-e-villella-tensioni-nelle-commissioni-consiliari.html";
const VIA_TRENTO_ROADWORKS_LAMETINO_URL =
  "https://www.lametino.it/ultimora/lamezia-lavori-di-bitumazione-in-via-trento-limitazione-della-circolazione-stradale-il-25-settembre.html";
const COMMISSION_V_REU_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-verifica-sul-regolamento-edilizio-e-urbanistico-la-v-commissione-chiede-adeguamento-alle-norme-vigenti.html";
const COMMISSION_V_REU_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/09/28/il-comune-chiede-a-se-stesso-di-aggiornare-il-regolamento-edilizio-ed-urbanistico/69454/";
const COMMISSION_V_MUNICIPAL_ASSET_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/istituzione/2026/09/28/nuovo-rinnovo-fino-a-fine-2028-per-lassegnazione-alla-progetto-sud-dellimmobile-di-via-dei-bizantini/69453/";
const COMMISSION_IV_STREET_ART_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/arte-e-cultura/2026/09/22/street-art-prosegue-il-percorso-per-un-regolamento-comunale/69348/";
const MULTI_YEAR_REBALANCING_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-comitato-progetto-civico-italia-contesta-affidamento-del-comune-oltre-13mila-euro-per-supporto-giuridico-al-piano-di-riequilibrio.html";
const MULTI_YEAR_REBALANCING_LAMETINO_REPORT_URL =
  "https://www.lametino.it/ultime/lamezia-per-la-redazione-del-piano-di-riequilibrio-il-comune-si-affida-anche-ad-uno-studio-di-reggio.html";
const MULTI_YEAR_REBALANCING_LA_NOVITA_URL =
  "https://lanovitaonline.it/lamezia-pre-dissesto-affidamento-da-14-mila-euro-per-il-piano-la-consulenza-si-poteva-evitare/";
const MULTI_YEAR_REBALANCING_CORRIERE_URL =
  "https://www.corrieredilamezia.it/politica/2026_10_01/lamezia-comitato-progetto-civico-italia-siamo-in-pre-dissesto-e-il-comune-continua-a-spendere-i-soldi-dei-cittadini_67083/";
const MULTI_YEAR_REBALANCING_NOTIZIE_URL =
  "https://catanzaro.notizie.it/scelta-contro-lifel-14000-euro-per-consulenza-esterna-a-lamezia/";
const MULTI_YEAR_REBALANCING_AUSTERITY_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-cristiano-e-villella-fn-su-piano-di-riequilibrio-arrivano-i-primi-tagli-e-solo-linizio-dellausterita.html";
const MULTI_YEAR_REBALANCING_AUSTERITY_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/piano-di-riequilibrio-cristiano-villella-primi-tagli-per-14-milioni-di-euro/";
const MULTI_YEAR_REBALANCING_AUSTERITY_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/10/06/comune-di-lamezia-verso-il-predissesto-fn-basta-con-le-austerita-619d7fd4-575a-49e6-ba81-cb14a0148a3f/";
const MULTI_YEAR_REBALANCING_RASO_BRANCA_URL =
  "https://www.lameziaterme.it/piano-di-riequilibrio-raso-branca-perche-un-incarico-esterno/";
const MULTI_YEAR_REBALANCING_CRISIS_LAMETINO_URL =
  "https://www.lametino.it/economia/crisi-finanziaria-dei-comuni-calabria-al-primo-posto-il-caso-lamezia.html";
const MULTI_YEAR_REBALANCING_MASCARO_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/10/02/lamezia-piano-di-riequilibrio-sotto-accusa-mascaro-inutile-sperpero-di-denaro-1c1cb663-9810-4cfa-a2ea-86c2f5320db8/";
const MULTI_YEAR_REBALANCING_CRISIS_QUOTIDIANO_URL =
  "https://www.quotidianodelsud.it/calabria/catanzaro/cronache/pubblica-amministrazione/2026/10/04/comuni-in-crisi-lamezia-caso-emblematico-nella-relazione-della-corte-dei-conti";
const MULTI_YEAR_REBALANCING_RASO_BRANCA_CORRIERE_URL =
  "https://www.corrieredilamezia.it/politica/2026_10_06/piano-di-riequilibrio-raso-e-branca-una-scelta-sbagliata-che-oggi-solleva-nuovi-interrogativi_67203/";
const MULTI_YEAR_REBALANCING_RASO_BRANCA_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-raso-e-branca-serve-chiarezza-sullincarico-esterno-per-piano-di-riequilibrio.html";
const COUNCIL_OCTOBER_9_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/10/06/convocato-il-consiglio-comunale-per-venerdi-09-ottobre-2026/";
const COUNCIL_OCTOBER_9_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-il-9-ottobre-seduta-del-consiglio-comunale-fra-i-punti-la-nomina-del-collegio-dei-revisori.html";
const COUNCIL_OCTOBER_9_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/10/06/venerdi-consiglio-comunale-interlocutorio-su-21-punti-nomina-dei-revisori-dei-conti-unico-pragmatico/69602/";
const COUNCIL_OCTOBER_9_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/lamezia-consiglio-comunale-21-punti-tra-conti-sanita-emergenze-della-citta/";
const COUNCIL_OCTOBER_9_CITY_ONE_LIVE_URL =
  "https://www.youtube.com/watch?v=36nih-4G2GA";
const COUNCIL_OCTOBER_9_LAMEZIATERME_LIVE_URL =
  "https://www.facebook.com/lameziatermeit/videos/consiglio-comunale-9-ottobre-2026/1112463858409425/";
const COUNCIL_OCTOBER_9_LAMEZIATERME_PRESS_CONFERENCE_URL =
  "https://www.facebook.com/lameziatermeit/videos/conferenza-stampa-del-centrosinistra-post-consiglio-comunale-del-9-ottobre-2026/1423909363164071/";
const COUNCIL_OCTOBER_9_REVISORS_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-nominato-il-collegio-dei-revisori-dei-conti-rieletto-daffina-alla-presidenza.html";
const COUNCIL_OCTOBER_9_SUSPENDED_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-seduta-consiglio-sospesa-per-mancanza-numero-legale-niente-voto-su-debiti-fuori-bilancio-si-torna-in-aula-il-12-ottobre.html";
const COUNCIL_OCTOBER_9_REPORT_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/consiglio-comunale-scordovillo-revisori-al-centro-dei-lavori/";
const SOURCE_REVIEWED_AT = "2026-08-22T12:10:49Z";
const CONTEXT_RESEARCHED_AT = "2026-08-23T10:48:08Z";
const COUNCIL_CONTEXT_RESEARCHED_AT = "2026-08-27T21:49:11Z";
const COMMISSION_VI_RESEARCHED_AT = "2026-08-31T22:02:47Z";
const SEPTEMBER_COMMISSION_RESEARCHED_AT = "2026-09-07T04:19:06Z";
const MID_SEPTEMBER_COMMISSION_RESEARCHED_AT = "2026-09-12T10:18:08Z";
const LATE_SEPTEMBER_COMMISSION_RESEARCHED_AT = "2026-09-19T09:34:42Z";
const SEPTEMBER_22_25_COMMISSION_RESEARCHED_AT = "2026-09-21T22:07:23Z";
const SEPTEMBER_24_COMMISSION_RESEARCHED_AT = "2026-09-23T10:14:27Z";
const SEPTEMBER_24_30_COMMISSION_RESEARCHED_AT = "2026-09-26T22:13:55Z";
const SEPTEMBER_29_OCTOBER_1_COMMISSION_RESEARCHED_AT = "2026-09-28T15:27:08Z";
const OCTOBER_1_6_COMMISSION_RESEARCHED_AT = "2026-10-02T22:19:30Z";
const SERRA_ANNUNZIATA_CONTEXT_RESEARCHED_AT = "2026-09-19T15:49:21Z";
const COMMISSION_I_MOTION_CONTEXT_RESEARCHED_AT = "2026-09-23T22:14:41Z";
const VIA_TRENTO_ROADWORKS_CONTEXT_RESEARCHED_AT = "2026-09-24T09:59:02Z";
const COMMISSION_V_REU_CONTEXT_RESEARCHED_AT = "2026-09-28T15:27:08Z";
const COMMISSION_IV_STREET_ART_CONTEXT_RESEARCHED_AT = "2026-09-29T04:07:44Z";
const OCTOBER_7_RESEARCHED_AT = "2026-10-07T10:16:27Z";
const COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT = "2026-10-10T03:39:54Z";
const OCTOBER_12_13_COMMISSION_RESEARCHED_AT = "2026-10-09T15:32:27Z";
const MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT = "2026-10-07T15:48:24Z";
const MUNICIPAL_NURSERIES_CONTEXT_RESEARCHED_AT = "2026-09-12T21:51:17Z";
const SCHOOL_TRANSPORT_CONTEXT_RESEARCHED_AT = "2026-09-14T10:13:39Z";

const councilContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
  searchNote:
    "La pubblicazione istituzionale 2026/2755 conferma una seduta del Consiglio comunale il 13 agosto 2026. Sette articoli e comunicati coincidono con organo, data e temi distintivi; il comunicato ufficiale del Comune del 14 agosto conferma che l'informativa sui Progetti di Vita è stata resa durante quella seduta, senza documentarne l'ordine del giorno completo. La stampa non completa l'orario o l'ordine del giorno ufficiale. Sono disponibili la pagina editoriale stabile della registrazione integrale pubblicata da City One il 17 agosto e due estratti attribuiti a Salvatore Vescio e Annita Vitale; il video City One già individuato su Facebook non è contato una seconda volta. Tutti restano distinti da eventuali registrazioni istituzionali. I temi sono ricostruiti separatamente dalla copertura editoriale.",
  articles: [
    {
      title:
        "Convocato Consiglio Comunale di Lamezia Terme in prossimità del ferragosto",
      url: "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
      publisher: "City One",
      publishedAt: "2026-08-10",
      relationship: "same_session",
      relevanceNote:
        "Indica il Consiglio del 13 agosto e include tra i 33 punti i debiti fuori bilancio; la successiva pubblicazione istituzionale 2026/2755 conferma organo, data e l'approvazione di uno di questi debiti.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Consiglio comunale prima di Ferragosto con soliti stilemi politici e qualche fuoriprogramma estivo",
      url: "https://www.lameziainforma.it/istituzione/2026/08/13/consiglio-comunale-prima-di-ferragosto-con-soliti-stilemi-politici-e-qualche-fuoriprogramma-estivo/68880/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-13",
      relationship: "same_session",
      relevanceNote:
        "Descrive il Consiglio del 13 agosto e temi distintivi, inclusi bilancio e debiti fuori bilancio; la data della seduta è ora confermata dalla fonte istituzionale 2026/2755.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Question time politico evaso in consiglio comunale",
      url: "https://www.lameziainforma.it/politica/2026/08/13/question-time-politico-evaso-in-consiglio-comunale/68885/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-13",
      relationship: "same_session",
      relevanceNote:
        "Il resoconto del 13 agosto tratta question time e debiti fuori bilancio; organo, data e tema del debito coincidono con la successiva fonte istituzionale.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, 33 punti in Consiglio comunale il 13 agosto: al centro assestamento e salvaguardia equilibri di Bilancio",
      url: "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      publisher: "il Lametino",
      publishedAt: "2026-08-10",
      relationship: "same_session",
      relevanceNote:
        "Annuncia il Consiglio del 13 agosto e riporta assestamento, salvaguardia degli equilibri e debiti fuori bilancio; uno di questi ultimi è richiamato dalla fonte istituzionale 2026/2755.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, il Consiglio comunale approva l'assestamento e la salvaguardia degli equilibri di Bilancio",
      url: "https://www.lametino.it/ultime/lamezia-il-consiglio-comunale-approva-lassestamento-e-la-salvaguardia-degli-equilibri-di-bilancio.html",
      publisher: "il Lametino",
      publishedAt: "2026-08-13",
      relationship: "same_session",
      relevanceNote:
        "Resoconta il Consiglio del 13 agosto e più temi distintivi già presenti negli avvisi editoriali; la data è confermata dalla pubblicazione istituzionale successiva.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        'Lamezia, Amministrazione Comunale su disabilità: "Sottoscritti 142 Progetti di Vita. Ora rafforziamo rete territoriale"',
      url: "https://www.lametino.it/ultimora/lamezia-amministrazione-comunale-su-disabilita-sottoscritti-142-progetti-di-vita-ora-rafforziamo-rete-territoriale.html",
      publisher: "il Lametino",
      publishedAt: "2026-08-14",
      relationship: "same_session",
      relevanceNote:
        "Riprende l'informativa sui Progetti di Vita resa nel Consiglio del 13 agosto, ora collegata anche al comunicato ufficiale del Comune; non documenta l'ordine del giorno completo.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        'Lamezia, Amministrazione Comunale su disabilità: "Sottoscritti 142 Progetti di Vita. Ora rafforziamo la rete territoriale"',
      url: COUNCIL_PROJECTS_OF_LIFE_URL,
      publisher: "Comune di Lamezia Terme",
      publishedAt: "2026-08-14",
      relationship: "same_session",
      relevanceNote:
        "Il comunicato istituzionale indica espressamente che i dati sui Progetti di Vita sono stati comunicati durante il Consiglio comunale del 13 agosto 2026. Verifica questo singolo tema trattato, non l'ordine del giorno completo, votazioni o altri esiti.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [
    {
      title: "Consiglio comunale del 13 Agosto",
      url: COUNCIL_CITY_ONE_RECORDING_URL,
      publisher: "City One",
      publishedAt: "2026-08-17",
      relationship: "same_session",
      mediaType: "full_recording",
      availability: "replay_available",
      relevanceNote:
        "La pagina editoriale di City One, pubblicata il 17 agosto, identifica e ospita il video del Consiglio comunale del 13 agosto 2026. Sostituisce come collegamento stabile la stessa registrazione già individuata su Facebook, senza duplicarla. Non prova da sola completezza, svolgimento o risultati della seduta.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Salvatore Vescio — Consiglio comunale del 13 agosto 2026",
      url: "https://www.instagram.com/reel/DcB8mBgtILm/",
      publisher: "Liberali Calabria",
      publishedAt: "2026-08-14",
      relationship: "same_session",
      mediaType: "excerpt",
      availability: "replay_available",
      relevanceNote:
        "Il titolo identifica espressamente il consigliere, l'organo e la data del 13 agosto 2026. È un estratto editoriale esterno: non prova completezza, programmazione, esiti o deliberazioni della seduta.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Annita Vitale — intervento sul Piano di riequilibrio finanziario",
      url: COUNCIL_VITALE_VIDEO_URL,
      publisher: "Annita Vitale",
      publishedAt: "2026-08-16",
      relationship: "same_session",
      mediaType: "excerpt",
      availability: "replay_available",
      relevanceNote:
        "Il fotogramma del reel identifica espressamente il Consiglio comunale del 13 agosto 2026 e un intervento sul Piano di riequilibrio finanziario; la descrizione espone una posizione politica. È un estratto editoriale esterno e non certifica ordine del giorno, votazioni, risultati o completezza della seduta.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
  ],
  editorialAgenda: [
    {
      title:
        "Variazione al bilancio 2026–2028, assestamento e salvaguardia degli equilibri",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Entrambe le testate associano questi temi alla seduta del 13 agosto; il resoconto successivo del Lametino ne riferisce anche la trattazione. Non è un ordine del giorno ufficiale acquisito.",
    },
    {
      title: "Piano di riequilibrio finanziario pluriennale",
      sourceUrls: [COUNCIL_VITALE_VIDEO_URL],
      confidence: "medium",
      reason:
        "Il reel di Annita Vitale identifica il proprio contenuto come intervento sul Piano di riequilibrio finanziario nel Consiglio del 13 agosto. La singola fonte documenta un tema emerso dalla copertura, non un punto dell'ordine del giorno ufficiale né l'esito di una votazione.",
    },
    {
      title:
        "Ripiano parziale delle perdite di Sacal e fondo per le società partecipate",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Il tema è riportato da entrambe le anticipazioni editoriali e ripreso dal resoconto post-seduta; resta una ricostruzione da stampa.",
    },
    {
      title:
        "Riconoscimento di debiti fuori bilancio e posizioni debitorie del Comune",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Le due testate riportano numerosi punti sui debiti fuori bilancio; la fonte istituzionale 2026/2755 conferma soltanto uno specifico debito approvato.",
    },
    {
      title:
        "Disabilità, Progetti di Vita, continuità assistenziale e inclusione scolastica",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
        COUNCIL_PROJECTS_OF_LIFE_URL,
      ],
      confidence: "high",
      reason:
        "Mozioni e interrogazioni su questi temi compaiono nelle due ricostruzioni editoriali; il comunicato del Comune conferma inoltre che l'informativa sui Progetti di Vita è stata resa durante la seduta. Non se ne inferiscono l'ordine del giorno completo, votazioni o risultati ulteriori.",
    },
    {
      title:
        "Riqualificazione urbana, parchi, fascia costiera ed ex Cinema Grandinetti",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Le due testate elencano interrogazioni e mozioni su spazi pubblici, parchi, pineta, lungomare e area dell'ex Cinema Grandinetti.",
    },
    {
      title:
        "Castello Normanno-Svevo e gestione del Teatro comunale Grandinetti",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Entrambe le anticipazioni includono quesiti sul recupero del Castello e sul futuro affidamento del Teatro; non documentano gli esiti.",
    },
    {
      title:
        "Digitalizzazione dell'ente e riconciliazione dei pagamenti tributari",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Il tema è riportato con formulazione coerente dalle due testate come interrogazione; non è trasferito nel campo ufficiale agenda.",
    },
    {
      title:
        "Sicurezza e servizi: cinghiali, SUEM 118, degrado urbano e incendio presso un'azienda di pneumatici",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "I temi ricorrono nelle due ricostruzioni editoriali; la loro presenza non certifica discussione completa, decisioni o seguito amministrativo.",
    },
  ],
};

const commissionViContextResearch: CouncilSessionV0ContextResearch = {
  status: "checked_no_match",
  checkedAt: COMMISSION_VI_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita dopo la revisione dell'allegato ufficiale 2026/2788, usando VI Commissione, le date del 1° e 4 settembre 2026, l'orario delle 12:00 e i due punti distintivi dell'ordine del giorno. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione. La ricerca sarà ripetuta in prossimità e dopo le sedute; non sono ricostruiti temi editoriali perché l'ordine del giorno ufficiale è disponibile.",
  articles: [],
  media: [],
};

const commissionIvStreetArtContextResearch: CouncilSessionV0ContextResearch = {
  status: "checked_no_match",
  checkedAt: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita con Parallel Search e verifica diretta delle fonti originali per IV Commissione, date dal 3 all'11 settembre 2026, orari e regolamento comunale per la promozione della Street Art. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alle singole sedute. L'ordine del giorno ufficiale è disponibile e non viene ricostruita un'agenda editoriale.",
  articles: [],
  media: [],
};

const commissionViSeptemberContextResearch: CouncilSessionV0ContextResearch = {
  status: "checked_no_match",
  checkedAt: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita con Parallel Search e verifica diretta delle fonti originali per la VI Commissione dell'8 settembre 2026 alle 11:00 e il punto sulla Denominazione comunale d'origine (De.Co.). Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione. L'ordine del giorno ufficiale è disponibile e non viene ricostruita un'agenda editoriale.",
  articles: [],
  media: [],
};

const commissionsIiiIvJointContextResearch: CouncilSessionV0ContextResearch = {
  status: "checked_no_match",
  checkedAt: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita con Parallel Search e verifica diretta delle fonti originali per la seduta congiunta di III e IV Commissione del 7 settembre 2026 alle 12:00, usando il progetto Sport e Disabilità e l'audizione dell'assessore Gennaro Gianturco. Non sono emersi articoli o audiovisivi collegabili con sufficiente precisione alla seduta nella finestra attiva. I contenuti generici o fuori finestra non sono stati associati.",
  articles: [],
  media: [],
};

const commissionIiiGuarantorContextResearch: CouncilSessionV0ContextResearch = {
  status: "checked_no_match",
  checkedAt: MID_SEPTEMBER_COMMISSION_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita con Parallel Search e verifica diretta delle fonti originali per la III Commissione dell'11, 14 e 15 settembre 2026, usando date, orari e il regolamento per l'istituzione del Garante delle persone con disabilità. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alle singole sedute. L'ordine del giorno ufficiale è disponibile e non viene ricostruita un'agenda editoriale.",
  articles: [],
  media: [],
};

const commissionIvMidSeptemberContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "checked_no_match",
    checkedAt: MID_SEPTEMBER_COMMISSION_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search e verifica diretta delle fonti originali per la IV Commissione del 14, 15 e 16 settembre 2026, usando date, orari, Trasporto Pubblico Scolastico Locale, Asili Nido Comunali e regolamento Street Art con le audizioni indicate. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alle singole sedute. L'ordine del giorno ufficiale è disponibile e non viene ricostruita un'agenda editoriale.",
    articles: [],
    media: [],
  };

const commissionIvSchoolTransportContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "reviewed_matches",
    checkedAt: SCHOOL_TRANSPORT_CONTEXT_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta delle fonti originali per la IV Commissione del 14 settembre 2026. L'articolo di City One dell'11 settembre tratta il trasporto scolastico degli alunni con disabilità e la presenza di Lamezia Multiservizi, elementi pertinenti al punto ufficiale, e viene collegato come contesto tematico. La fonte non nomina la Commissione né documenta la seduta o l'audizione dell'ing. Alessandro Vescio. Non sono emerse dirette, registrazioni, clip o interviste collegabili con sufficiente precisione.",
    articles: [
      {
        title:
          "Lamezia, Gianturco: «Assistenza specialistica, si parte con il nuovo anno scolastico. Più ore per gli alunni con disabilità»",
        url: SCHOOL_TRANSPORT_CITY_ONE_URL,
        publisher: "City One",
        publishedAt: "2026-09-11",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo tratta il trasporto scolastico degli alunni con disabilità e indica la presenza di Lamezia Multiservizi in un incontro comunale. Questi elementi sono pertinenti al punto ufficiale del 14 settembre, ma il testo non nomina la Commissione né attesta svolgimento, audizione o risultati della seduta.",
        reviewedAt: SCHOOL_TRANSPORT_CONTEXT_RESEARCHED_AT,
      },
    ],
    media: [],
  };

const commissionIvMunicipalNurseriesContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "reviewed_matches",
    checkedAt: MUNICIPAL_NURSERIES_CONTEXT_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta delle fonti originali per la IV Commissione del 15 settembre 2026. L'avviso del Comune e l'articolo di LameziaInforma dell'11 settembre riguardano l'avvio, nella stessa data, del servizio presso i tre asili nido comunali e vengono collegati come contesto del punto ufficiale. Nessuna delle due fonti nomina la Commissione o ne prova svolgimento, audizione o esiti. L'avviso comunale del 25 agosto sul precedente rinvio è fuori dalla finestra di sette giorni e non viene aggiunto. Non sono emerse dirette, registrazioni, clip o interviste collegabili con sufficiente precisione.",
    articles: [
      {
        title: "Avvio del servizio di Asilo Nido comunale",
        url: MUNICIPAL_NURSERIES_NOTICE_URL,
        publisher: "Comune di Lamezia Terme",
        publishedAt: "2026-09-11",
        relationship: "agenda_item",
        relevanceNote:
          "L'avviso istituzionale comunica l'avvio del servizio il 15 settembre 2026 nei tre asili nido comunali, data e tema coincidenti con il punto della convocazione. Non menziona la Commissione e non attesta svolgimento, audizione o risultati della seduta.",
        reviewedAt: MUNICIPAL_NURSERIES_CONTEXT_RESEARCHED_AT,
      },
      {
        title: "Asili nido comunali aperti dal 15 settembre",
        url: MUNICIPAL_NURSERIES_LAMEZIAINFORMA_URL,
        publisher: "LameziaInforma",
        publishedAt: "2026-09-11",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo riporta l'avvio del servizio il 15 settembre 2026 nei tre asili nido comunali e l'incontro dell'assessore con i genitori. Data, strutture e tema coincidono con il punto della convocazione, ma il testo non menziona la Commissione e non ne attesta svolgimento, audizione o risultati.",
        reviewedAt: MUNICIPAL_NURSERIES_CONTEXT_RESEARCHED_AT,
      },
    ],
    media: [],
  };

const lateSeptemberCommissionContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "checked_no_match",
    checkedAt: LATE_SEPTEMBER_COMMISSION_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta di Albo, Comune, ConsigliCloud, City One, LameziaInforma, LameziaTermeNews, il Lametino e risultati indicizzati per le sedute di I, II, III, IV e V Commissione dal 16 al 21 settembre 2026. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alle singole sedute. Gli ordini del giorno ufficiali sono disponibili e non viene ricostruita un'agenda editoriale.",
    articles: [],
    media: [],
  };

const commissionISeptember17ContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: COMMISSION_I_MOTION_CONTEXT_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita con Parallel Search per discovery e verifica diretta dell'articolo originale de il Lametino e del calendario ufficiale Albo 2026/2971. L'articolo del 23 settembre identifica la I Commissione e riferisce fatti al 17 settembre 2026, ma indica la discussione del Regolamento Taxi, che il calendario ufficiale assegna alla seduta del 16 settembre; per questa discrepanza il collegamento resta `possible_same_session`. Le contestazioni riportate non verificano costituzione, svolgimento, validità, votazioni o esiti della seduta e non modificano i campi ufficiali. Non sono emersi contenuti audiovisivi collegabili con sufficiente precisione.",
  articles: [
    {
      title:
        "Lamezia, mozioni di sfiducia contro Cristiano e Villella: tensioni nelle Commissioni consiliari",
      url: COMMISSION_I_MOTION_LAMETINO_URL,
      publisher: "il Lametino",
      publishedAt: "2026-09-23",
      relationship: "possible_same_session",
      relevanceNote:
        "L'articolo nomina la I Commissione e attribuisce al 17 settembre una contestazione sulla regolare costituzione della seduta. Il riferimento al Regolamento Taxi non coincide però con il calendario ufficiale, che associa quel tema al 16 settembre e indica le vertenze per il 17: il collegamento resta possibile e non prova svolgimento, validità o risultati.",
      reviewedAt: COMMISSION_I_MOTION_CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [],
};

const september22To25CommissionContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "checked_no_match",
    checkedAt: SEPTEMBER_22_25_COMMISSION_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta di Albo, Comune, ConsigliCloud, City One, LameziaInforma, LameziaTermeNews, il Lametino e risultati indicizzati per le sedute della V Commissione del 22, 23 e 24 settembre 2026 e della IV Commissione del 23 settembre 2026. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione a queste quattro sedute. Gli ordini del giorno ufficiali sono disponibili e non viene ricostruita un'agenda editoriale.",
    articles: [],
    media: [],
  };

const commissionIvSeptember22StreetArtContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "reviewed_matches",
    checkedAt: COMMISSION_IV_STREET_ART_CONTEXT_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta dell'articolo originale LameziaInforma e del calendario ufficiale Albo 2026/3012. Organo, data, Regolamento Street Art e audizione di Giacomo Marinaro coincidono senza contraddizioni, quindi il collegamento è `same_session`. La fonte editoriale descrive la riunione ma non certifica costituzione, validità, votazioni o risultati e non modifica i campi ufficiali. Non sono emersi contenuti audiovisivi collegabili con sufficiente precisione.",
    articles: [
      {
        title: "Street art, prosegue il percorso per un regolamento comunale",
        url: COMMISSION_IV_STREET_ART_LAMEZIAINFORMA_URL,
        publisher: "LameziaInforma",
        publishedAt: "2026-09-22",
        relationship: "same_session",
        relevanceNote:
          "L'articolo nomina la Commissione Cultura e, nella data ufficiale del 22 settembre, descrive il Regolamento Street Art e l'audizione di Giacomo Marinaro: organo, data e punti distintivi coincidono con l'Albo 2026/3012. Resta una fonte editoriale e non certifica costituzione, validità, votazioni o risultati.",
        reviewedAt: COMMISSION_IV_STREET_ART_CONTEXT_RESEARCHED_AT,
      },
    ],
    media: [],
  };

const commissionVSeptember25RoadWorksContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "reviewed_matches",
    checkedAt: VIA_TRENTO_ROADWORKS_CONTEXT_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta dell'articolo originale de il Lametino e del calendario ufficiale Albo 2026/3011. L'articolo del 23 settembre descrive un intervento di bitumazione in via Trento programmato per il 25 settembre e viene collegato come `agenda_item` al punto ufficiale «Disciplinare per interventi sulla rete stradale». La fonte non nomina la Commissione e non attesta programmazione, costituzione, svolgimento, trattazione, approvazione, votazioni o risultati della seduta. Campi e ordine del giorno ufficiali restano invariati. Non sono emersi contenuti audiovisivi collegabili con sufficiente precisione.",
    articles: [
      {
        title:
          "Lamezia, lavori di bitumazione in via Trento: limitazione della circolazione stradale il 25 settembre",
        url: VIA_TRENTO_ROADWORKS_LAMETINO_URL,
        publisher: "il Lametino",
        publishedAt: "2026-09-23",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo descrive lavori di bitumazione in via Trento previsti per il 25 settembre, tema e data pertinenti al punto ufficiale sul disciplinare per gli interventi sulla rete stradale. Non nomina la Commissione e non prova svolgimento, trattazione, approvazione o risultati della seduta.",
        reviewedAt: VIA_TRENTO_ROADWORKS_CONTEXT_RESEARCHED_AT,
      },
    ],
    media: [],
  };

const september24CommissionContextResearch: CouncilSessionV0ContextResearch = {
  status: "checked_no_match",
  checkedAt: SEPTEMBER_24_COMMISSION_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita con Parallel Search per discovery e verifica diretta di Albo, Comune, City One, LameziaInforma, LameziaTermeNews, il Lametino e risultati indicizzati, inclusi canali social e video, per la seduta della III Commissione del 24 settembre 2026 alle 11:00. Le query hanno combinato organo, data, orario, raccolta dei rifiuti nelle zone collinari e montane e i nomi degli auditi Alessandro Vescio e Francesco Esposito. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alla seduta. L'ordine del giorno ufficiale è disponibile e non viene ricostruita un'agenda editoriale.",
  articles: [],
  media: [],
};

const september24To30CommissionContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "checked_no_match",
    checkedAt: SEPTEMBER_24_30_COMMISSION_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta di Albo, Comune, ConsigliCloud, City One, LameziaInforma, LameziaTermeNews, il Lametino e risultati indicizzati, inclusi canali YouTube e Facebook, per le sedute di III, IV e V Commissione dal 24 al 30 settembre 2026. Le query hanno combinato organo, date, orari e temi distintivi: Garante delle persone con disabilità, tutela della salute e del benessere della comunità scolastica, adeguamento climatico degli edifici scolastici, Street Art, beni comunali e interventi sulla rete stradale. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alle singole sedute. Gli ordini del giorno ufficiali sono disponibili e non viene ricostruita un'agenda editoriale.",
    articles: [],
    media: [],
  };

const commissionVSeptember28ReuContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "reviewed_matches",
    checkedAt: COMMISSION_V_REU_CONTEXT_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta degli articoli originali de il Lametino e LameziaInforma, della convocazione Albo 2026/3090 e della deliberazione di Giunta 2026/3123 richiamata dalla copertura sull'immobile comunale. I due articoli sul Regolamento edilizio e urbanistico nominano la V Commissione ma non datano una seduta e trattano un tema diverso dall'ordine del giorno ufficiale del 28 settembre: restano `possible_same_session`. L'articolo sul rinnovo della concessione di un immobile comunale è collegato come `agenda_item` perché pertinente alla gestione dei beni comunali, ma non nomina la Commissione. Nessuna fonte editoriale modifica i campi ufficiali o prova costituzione, svolgimento, trattazione, approvazione, votazioni o risultati. Non sono emersi contenuti audiovisivi collegabili con sufficiente precisione.",
    articles: [
      {
        title:
          "Lamezia, verifica sul Regolamento edilizio e urbanistico: la V Commissione chiede adeguamento alle norme vigenti",
        url: COMMISSION_V_REU_LAMETINO_URL,
        publisher: "il Lametino",
        publishedAt: "2026-09-28",
        relationship: "possible_same_session",
        relevanceNote:
          "L'articolo nomina la V Commissione ed è pubblicato nella data della seduta, ma non data una riunione e tratta il Regolamento edilizio e urbanistico, tema diverso dall'ordine del giorno ufficiale sui beni comunali. Non prova svolgimento, trattazione, votazioni o risultati della seduta del 28 settembre.",
        reviewedAt: COMMISSION_V_REU_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Il Comune chiede a sè stesso di aggiornare il Regolamento Edilizio ed Urbanistico",
        url: COMMISSION_V_REU_LAMEZIAINFORMA_URL,
        publisher: "LameziaInforma",
        publishedAt: "2026-09-28",
        relationship: "possible_same_session",
        relevanceNote:
          "L'articolo attribuisce ai componenti della V Commissione un ordine del giorno sul Regolamento edilizio e urbanistico, ma non data una riunione e il tema è diverso dall'ordine del giorno ufficiale del 28 settembre sui beni comunali. Non prova svolgimento, trattazione, votazioni o risultati della seduta.",
        reviewedAt: COMMISSION_V_REU_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Nuovo rinnovo fino a fine 2028 per l’assegnazione alla Progetto Sud dell’immobile di via dei Bizantini",
        url: COMMISSION_V_MUNICIPAL_ASSET_LAMEZIAINFORMA_URL,
        publisher: "LameziaInforma",
        publishedAt: "2026-09-28",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo riguarda la concessione di un immobile comunale ed è quindi pertinente al punto ufficiale sulla gestione e valorizzazione dei beni comunali. Non nomina la Commissione e non prova svolgimento, trattazione, votazioni o risultati della seduta.",
        reviewedAt: COMMISSION_V_REU_CONTEXT_RESEARCHED_AT,
      },
    ],
    media: [],
  };

const september29ToOctober1CommissionContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "checked_no_match",
    checkedAt: SEPTEMBER_29_OCTOBER_1_COMMISSION_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta di Albo, Comune, ConsigliCloud, City One, LameziaInforma, LameziaTermeNews, il Lametino e risultati indicizzati, inclusi canali YouTube e Facebook, per le sedute della III Commissione del 29 settembre e 1° ottobre 2026 e della IV Commissione del 29 e 30 settembre 2026. Le query hanno combinato organo, date, orari e temi distintivi: contrasto all'abbandono dei rifiuti e audizione del Vicecomandante Ten. Col. Aldo Rubino, Garante delle persone con disabilità e regolamento Street Art. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alle singole sedute. Gli ordini del giorno ufficiali sono disponibili e non viene ricostruita un'agenda editoriale.",
    articles: [],
    media: [],
  };

const october1To6CommissionContextResearch: CouncilSessionV0ContextResearch = {
  status: "checked_no_match",
  checkedAt: OCTOBER_1_6_COMMISSION_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita con Parallel Search per discovery e verifica diretta di Albo, Comune, City One, LameziaInforma, LameziaTermeNews, il Lametino e risultati indicizzati, inclusi canali YouTube e Facebook, per le sedute di II, III, IV, V e VI Commissione dal 1° al 6 ottobre 2026. Le query hanno combinato organo, date, orari e temi distintivi: beni comunali, rete stradale, tariffe di asili nido e refezione scolastica, Street Art, mercato di prossimità a Sant'Eufemia Vetere, Garante delle persone con disabilità, debiti fuori bilancio e piano di riequilibrio. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alle singole sedute. Gli ordini del giorno ufficiali sono disponibili e non viene ricostruita un'agenda editoriale.",
  articles: [],
  media: [],
};

const october12To13CommissionContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "checked_no_match",
    checkedAt: OCTOBER_12_13_COMMISSION_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta di Albo, Comune, ConsigliCloud, City One, LameziaInforma, LameziaTermeNews, il Lametino e risultati indicizzati, inclusi canali YouTube e Facebook, per le sedute della V Commissione del 12 e 13 ottobre 2026. Le query hanno combinato organo, date, orario e temi distintivi: regolamento sulla gestione e valorizzazione dei beni comunali e disciplinare per interventi sulla rete stradale. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione alle singole sedute. Gli ordini del giorno ufficiali sono disponibili e non viene ricostruita un'agenda editoriale.",
    articles: [],
    media: [],
  };

const councilOctober9ContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita con Parallel Search per discovery e verifica diretta di Albo, Comune, ConsigliCloud, City One, LameziaInforma, LameziaTermeNews, LameziaTerme.it, il Lametino e risultati indicizzati, inclusi canali YouTube e Facebook, per il Consiglio comunale convocato il 9 ottobre 2026 alle 09:30. Sette articoli originali coincidono su organo, data e punti distintivi e sono collegati come `same_session`: quattro annunci del 6 ottobre e tre resoconti del 9 ottobre. I resoconti restano fonti editoriali e non valorizzano campi ufficiali, presenze, votazioni o risultati. La pubblicazione istituzionale successiva 2026/3263 attesta invece la mancanza del numero legale e il rinvio dei 18 punti non discussi e votati alla seconda convocazione del 12 ottobre alle 10:30. Tre collegamenti audiovisivi editoriali sono disponibili come replay: la diretta YouTube di City One di 4:17:09 e la diretta Facebook di LameziaTerme.it di 3:52:52 restano `possible_same_session` e `live_stream` perché titolo, organo e data coincidono senza un punto distintivo o il numero Albo; la conferenza stampa del centrosinistra di 12:27 è collegata come `same_session` e `interview` perché il titolo identifica espressamente la fase successiva al Consiglio del 9 ottobre. Tutti hanno stato `replay_available` e non provano completezza, presenze, votazioni o risultati. Il portale istituzionale ConsigliCloud mostrava «No meetings found», quindi non è stato valorizzato alcuno streaming o registrazione istituzionale. L'ordine del giorno ufficiale resta quello dell'allegato istituzionale e non viene ricostruita un'agenda editoriale; la ricerca resta aperta fino al termine della finestra prevista.",
  articles: [
    {
      title: "Convocato il Consiglio Comunale per venerdì 9 ottobre 2026",
      url: COUNCIL_OCTOBER_9_CITY_ONE_URL,
      publisher: "City One",
      publishedAt: "2026-10-06",
      relationship: "same_session",
      relevanceNote:
        "L'articolo identifica il Consiglio del 9 ottobre alle 09:30, la seconda convocazione del 12 ottobre alle 10:30, la sede e i punti ufficiali. È un annuncio precedente alla seduta e non prova costituzione, svolgimento, presenze, trattazione, votazioni o risultati.",
      reviewedAt: OCTOBER_7_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, il 9 ottobre seduta del Consiglio comunale: fra i punti la nomina del Collegio dei revisori",
      url: COUNCIL_OCTOBER_9_LAMETINO_URL,
      publisher: "il Lametino",
      publishedAt: "2026-10-06",
      relationship: "same_session",
      relevanceNote:
        "L'articolo identifica il Consiglio del 9 ottobre alle 09:30, la seconda convocazione del 12 ottobre alle 10:30 e temi distintivi dei 21 punti ufficiali. È un annuncio precedente alla seduta e non prova costituzione, svolgimento, presenze, trattazione, votazioni o risultati.",
      reviewedAt: OCTOBER_7_RESEARCHED_AT,
    },
    {
      title:
        "Venerdì consiglio comunale interlocutorio, su 21 punti nomina dei revisori dei conti unico pragmatico",
      url: COUNCIL_OCTOBER_9_LAMEZIAINFORMA_URL,
      publisher: "LameziaInforma",
      publishedAt: "2026-10-06",
      relationship: "same_session",
      relevanceNote:
        "L'articolo identifica il Consiglio di venerdì 9 ottobre e richiama la nomina del Collegio dei revisori e altri punti distintivi dei 21 punti ufficiali. È un annuncio precedente alla seduta e non prova costituzione, svolgimento, presenze, trattazione, votazioni o risultati.",
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, Consiglio comunale: 21 punti tra conti, sanità e le emergenze della città",
      url: COUNCIL_OCTOBER_9_LAMEZIATERME_URL,
      publisher: "LameziaTerme.it",
      publishedAt: "2026-10-06",
      relationship: "same_session",
      relevanceNote:
        "L'articolo identifica il Consiglio del 9 ottobre alle 09:30, la sede e numerosi punti distintivi dei 21 punti ufficiali, inclusi revisori, controlli interni, debiti fuori bilancio, mozioni e interrogazioni. È un annuncio precedente alla seduta e non prova costituzione, svolgimento, presenze, trattazione, votazioni o risultati.",
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, nominato il Collegio dei revisori dei conti: rieletto Daffinà alla presidenza",
      url: COUNCIL_OCTOBER_9_REVISORS_LAMETINO_URL,
      publisher: "il Lametino",
      publishedAt: "2026-10-09",
      relationship: "same_session",
      relevanceNote:
        "Il resoconto identifica il Consiglio del 9 ottobre e il punto distintivo sulla nomina del Collegio dei revisori. Resta una fonte editoriale: non completa i campi ufficiali e non certifica presenze, votazioni o risultati.",
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, seduta Consiglio sospesa per mancanza numero legale: niente voto su debiti fuori bilancio, si torna in aula il 12 ottobre",
      url: COUNCIL_OCTOBER_9_SUSPENDED_LAMETINO_URL,
      publisher: "il Lametino",
      publishedAt: "2026-10-09",
      relationship: "same_session",
      relevanceNote:
        "Il resoconto identifica organo, data, mancanza del numero legale e seconda convocazione. È conservato come contesto editoriale; lo stato ufficiale è valorizzato soltanto dalla successiva pubblicazione Albo 2026/3263.",
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Consiglio comunale, Scordovillo e revisori al centro dei lavori",
      url: COUNCIL_OCTOBER_9_REPORT_LAMEZIATERME_URL,
      publisher: "LameziaTerme.it",
      publishedAt: "2026-10-09",
      relationship: "same_session",
      relevanceNote:
        "Il resoconto identifica la seduta, lo smantellamento del campo di Scordovillo, la nomina del Collegio dei revisori, l'aggiornamento del regolamento sui controlli interni, la perdita del numero legale e la ripresa del 12 ottobre. Resta una fonte editoriale: non completa i campi ufficiali e non certifica presenze, votazioni o risultati.",
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [
    {
      title: "Diretta consiglio comunale del 9 ottobre 2026",
      url: COUNCIL_OCTOBER_9_CITY_ONE_LIVE_URL,
      publisher: "City One",
      publishedAt: "2026-10-09",
      relationship: "possible_same_session",
      mediaType: "live_stream",
      availability: "replay_available",
      relevanceNote:
        "Titolo, organo e data rendono plausibile il collegamento alla seduta del 9 ottobre 2026, ma il video non espone un punto distintivo dell'ordine del giorno o il numero della pubblicazione ufficiale; la pagina originale del canale City One rende ora disponibile il replay di 4:17:09. È copertura editoriale esterna e non certifica programmazione istituzionale, completezza, presenze, votazioni o risultati.",
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Consiglio Comunale 9 ottobre 2026",
      url: COUNCIL_OCTOBER_9_LAMEZIATERME_LIVE_URL,
      publisher: "LameziaTerme.it",
      publishedAt: "2026-10-09",
      relationship: "possible_same_session",
      mediaType: "live_stream",
      availability: "replay_available",
      relevanceNote:
        "La pagina Facebook originale identifica nel titolo il Consiglio comunale e la data del 9 ottobre 2026 e rende disponibile il replay di 3:52:52. Non espone un punto distintivo dell'ordine del giorno o il numero della pubblicazione ufficiale; resta copertura editoriale esterna e non certifica programmazione istituzionale, completezza, presenze, votazioni o risultati.",
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Conferenza stampa del centrosinistra post consiglio comunale del 9 ottobre 2026",
      url: COUNCIL_OCTOBER_9_LAMEZIATERME_PRESS_CONFERENCE_URL,
      publisher: "LameziaTerme.it",
      publishedAt: "2026-10-09",
      relationship: "same_session",
      mediaType: "interview",
      availability: "replay_available",
      relevanceNote:
        "Il titolo identifica espressamente una conferenza stampa del centrosinistra successiva al Consiglio comunale del 9 ottobre 2026; la pagina Facebook originale rende disponibile il replay di 12:27. È una reazione politica editoriale, non una registrazione della seduta, e non certifica presenze, votazioni, deliberazioni o risultati ufficiali.",
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    },
  ],
};

const commissionIiOctober6RebalancingContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "reviewed_matches",
    checkedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta dei quattordici articoli originali de il Lametino, LameziaTerme.it, Gazzetta del Sud, La Novità Online, Corriere di Lamezia, Notizie.it Catanzaro e Il Quotidiano del Sud e del calendario ufficiale Albo 2026/3197. Gli articoli dal 30 settembre al 6 ottobre trattano il Piano di Riequilibrio Finanziario Pluriennale, il quadro di crisi finanziaria, gli effetti finanziari attribuiti o il relativo supporto giuridico-contabile e vengono collegati come `agenda_item` al punto ufficiale della II Commissione del 6 ottobre. Tre pagine del 6 ottobre riprendono la stessa nota di Raso e Branca e sono conservate come distinti collegamenti editoriali, non come conferme indipendenti. Le fonti non identificano la seduta del 6 ottobre: un articolo LameziaTerme.it richiama precedenti lavori della I Commissione, mentre la nota di Raso e Branca menziona genericamente un mancato passaggio nella Commissione Bilancio senza indicare data o riunione. Nessuna fonte attesta programmazione, costituzione, svolgimento, trattazione, audizione, approvazione, votazioni o risultati della seduta del 6 ottobre. Campi e ordine del giorno ufficiali restano invariati. Non sono emersi contenuti audiovisivi collegabili con sufficiente precisione.",
    articles: [
      {
        title:
          "Lamezia, per la redazione del Piano di riequilibrio il Comune si affida anche ad uno studio di Reggio",
        url: MULTI_YEAR_REBALANCING_LAMETINO_REPORT_URL,
        publisher: "il Lametino",
        publishedAt: "2026-09-30",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo riferisce l'affidamento del Comune a uno studio esterno per il supporto giuridico-contabile alla redazione del Piano di Riequilibrio Finanziario Pluriennale, tema coincidente con il punto ufficiale della II Commissione del 6 ottobre. Non nomina la Commissione e documenta il contesto amministrativo, non la seduta, la sua trattazione, l'audizione o eventuali esiti.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          'Lamezia, Comitato Progetto Civico Italia contesta affidamento del Comune: "Oltre 13mila euro per supporto giuridico al piano di riequilibrio"',
        url: MULTI_YEAR_REBALANCING_LAMETINO_URL,
        publisher: "il Lametino",
        publishedAt: "2026-10-01",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo descrive l'affidamento di un supporto giuridico-contabile per la redazione del Piano di Riequilibrio Finanziario Pluriennale, tema coincidente con il punto ufficiale della II Commissione del 6 ottobre. Non nomina la Commissione e documenta il contesto finanziario, non la seduta, la sua trattazione, l'audizione o eventuali esiti.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Lamezia | Pre-dissesto, affidamento da 14 mila euro per il Piano: «La consulenza si poteva evitare»",
        url: MULTI_YEAR_REBALANCING_LA_NOVITA_URL,
        publisher: "La Novità Online",
        publishedAt: "2026-10-01",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo descrive lo stesso affidamento di supporto alla redazione del Piano di Riequilibrio Finanziario Pluriennale, tema coincidente con il punto ufficiale della II Commissione del 6 ottobre. Non nomina la Commissione e documenta il contesto finanziario, non la seduta, la sua trattazione, l'audizione o eventuali esiti.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Lamezia, Comitato Progetto Civico Italia: “Siamo in pre-dissesto e il Comune continua a spendere i soldi dei cittadini”",
        url: MULTI_YEAR_REBALANCING_CORRIERE_URL,
        publisher: "Corriere di Lamezia",
        publishedAt: "2026-10-01",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo riporta la posizione critica di Progetto Civico Italia sull'affidamento esterno di supporto al Piano di Riequilibrio Finanziario Pluriennale, tema coincidente con il punto ufficiale della II Commissione del 6 ottobre. Non nomina la Commissione e documenta il contesto politico-finanziario, non la seduta, la sua trattazione, l'audizione o eventuali esiti.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Scelta contro l’IFEL: 14.000 euro per consulenza esterna a Lamezia",
        url: MULTI_YEAR_REBALANCING_NOTIZIE_URL,
        publisher: "Notizie.it Catanzaro",
        publishedAt: "2026-10-01",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo descrive la contestazione dell'affidamento esterno per il supporto al Piano di Riequilibrio Finanziario Pluriennale, tema coincidente con il punto ufficiale della II Commissione del 6 ottobre. Non nomina la Commissione e documenta il contesto politico-finanziario, non la seduta, la sua trattazione, l'audizione o eventuali esiti.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Crisi finanziaria dei Comuni, Calabria al primo posto: il caso Lamezia",
        url: MULTI_YEAR_REBALANCING_CRISIS_LAMETINO_URL,
        publisher: "il Lametino",
        publishedAt: "2026-10-02",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo ricostruisce, a partire dalla relazione della Corte dei conti, il precedente piano di riequilibrio, il disavanzo e l'annunciato nuovo Piano di Riequilibrio Finanziario Pluriennale, tema del punto ufficiale della II Commissione del 6 ottobre. Non identifica la Commissione o la seduta e documenta il contesto finanziario, non svolgimento, trattazione, audizione o risultati.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Lamezia, piano di riequilibrio sotto accusa. Mascaro: «Inutile sperpero di denaro»",
        url: MULTI_YEAR_REBALANCING_MASCARO_GAZZETTA_URL,
        publisher: "Gazzetta del Sud",
        publishedAt: "2026-10-02",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo riporta una posizione critica sul nuovo piano e sull'incarico esterno di supporto alla sua predisposizione, temi pertinenti al punto ufficiale della II Commissione del 6 ottobre. Non identifica la Commissione o la seduta e documenta il contesto politico-finanziario, non svolgimento, trattazione, audizione o risultati.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Comuni in crisi, Lamezia caso emblematico nella relazione della Corte dei Conti",
        url: MULTI_YEAR_REBALANCING_CRISIS_QUOTIDIANO_URL,
        publisher: "Il Quotidiano del Sud",
        publishedAt: "2026-10-04",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo ricostruisce le precedenti procedure di riequilibrio, le criticità richiamate dalla Corte dei conti e il termine indicato per il nuovo piano, offrendo contesto al punto ufficiale della II Commissione del 6 ottobre. Non identifica la Commissione o la seduta e non ne prova svolgimento, trattazione, audizione o risultati.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          'Lamezia, Cristiano e Villella (FN) su piano di riequilibrio: "Arrivano i primi tagli, è solo l’inizio dell’austerità"',
        url: MULTI_YEAR_REBALANCING_AUSTERITY_LAMETINO_URL,
        publisher: "il Lametino",
        publishedAt: "2026-10-05",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo riporta la posizione di due consiglieri sugli effetti finanziari attribuiti al percorso verso il piano di riequilibrio e sui relativi accantonamenti, tema coincidente con il punto ufficiale della II Commissione del 6 ottobre. Non nomina la Commissione e documenta il contesto politico-finanziario, non la seduta, la sua trattazione, l'audizione o eventuali esiti.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Piano di Riequilibrio, Cristiano e Villella: primi tagli per 1,4 milioni di euro",
        url: MULTI_YEAR_REBALANCING_AUSTERITY_LAMEZIATERME_URL,
        publisher: "LameziaTerme.it",
        publishedAt: "2026-10-05",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo riporta la posizione di due consiglieri sulle variazioni al PEG e sugli effetti finanziari attribuiti al percorso verso il piano di riequilibrio, tema coincidente con il punto ufficiale della II Commissione del 6 ottobre. Richiama precedenti lavori della I Commissione, ma non identifica la II Commissione o la seduta del 6 ottobre e documenta il contesto politico-finanziario, non la seduta, la sua trattazione, l'audizione o eventuali esiti.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Comune di Lamezia, verso il predissesto. FN: «Basta con le austerità»",
        url: MULTI_YEAR_REBALANCING_AUSTERITY_GAZZETTA_URL,
        publisher: "Gazzetta del Sud",
        publishedAt: "2026-10-06",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo descrive i primi effetti finanziari attribuiti al percorso verso il predissesto e i dubbi espressi sul contenzioso comunale, temi pertinenti al Piano di Riequilibrio Finanziario Pluriennale indicato nell'ordine del giorno ufficiale della II Commissione del 6 ottobre. Non identifica la Commissione o la seduta e documenta il contesto politico-finanziario, non lo svolgimento, la trattazione, l'audizione o eventuali esiti.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Piano di riequilibrio, Raso e Branca: «Perché un incarico esterno?»",
        url: MULTI_YEAR_REBALANCING_RASO_BRANCA_URL,
        publisher: "LameziaTerme.it",
        publishedAt: "2026-10-06",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo riporta le richieste di chiarimento di due consiglieri sull'incarico esterno collegato al Piano di Riequilibrio Finanziario Pluriennale, tema del punto ufficiale della II Commissione del 6 ottobre. Menziona genericamente un mancato passaggio nella Commissione Bilancio, ma non identifica una data o la seduta del 6 ottobre e non ne documenta svolgimento, trattazione, audizione o risultati.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Piano di Riequilibrio, Raso e Branca: «Una scelta sbagliata che oggi solleva nuovi interrogativi»",
        url: MULTI_YEAR_REBALANCING_RASO_BRANCA_CORRIERE_URL,
        publisher: "Corriere di Lamezia",
        publishedAt: "2026-10-06",
        relationship: "agenda_item",
        relevanceNote:
          "La pagina riprende la stessa nota di Raso e Branca sull'incarico esterno collegato al Piano di Riequilibrio Finanziario Pluriennale. Menziona genericamente un mancato passaggio nella Commissione Bilancio, ma non identifica una data o la seduta del 6 ottobre e non ne documenta svolgimento, trattazione, audizione o risultati.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
      {
        title:
          "Lamezia, Raso e Branca: «Serve chiarezza sull’incarico esterno per Piano di riequilibrio»",
        url: MULTI_YEAR_REBALANCING_RASO_BRANCA_LAMETINO_URL,
        publisher: "il Lametino",
        publishedAt: "2026-10-06",
        relationship: "agenda_item",
        relevanceNote:
          "La pagina riprende la stessa nota di Raso e Branca sull'incarico esterno collegato al Piano di Riequilibrio Finanziario Pluriennale. Menziona genericamente un mancato passaggio nella Commissione Bilancio, ma non identifica una data o la seduta del 6 ottobre e non ne documenta svolgimento, trattazione, audizione o risultati.",
        reviewedAt: MULTI_YEAR_REBALANCING_CONTEXT_RESEARCHED_AT,
      },
    ],
    media: [],
  };

const commissionIiiWasteMotionContextResearch: CouncilSessionV0ContextResearch =
  {
    status: "reviewed_matches",
    checkedAt: SERRA_ANNUNZIATA_CONTEXT_RESEARCHED_AT,
    searchNote:
      "Ricerca eseguita con Parallel Search per discovery e verifica diretta dell'articolo originale de il Lametino e della convocazione Albo 2026/3001 per la III Commissione del 21 settembre 2026. L'articolo del 14 settembre descrive la stessa mozione della consigliera Bernadette Serratore su bonifica, sicurezza, controllo e contrasto all'abbandono dei rifiuti nelle località Serra e Annunziata. Il collegamento è registrato come contesto del punto in agenda: la fonte non attesta convocazione, svolgimento, votazioni o risultati della seduta. Non sono emerse dirette, registrazioni, clip o interviste collegabili con sufficiente precisione.",
    articles: [
      {
        title:
          "Lamezia, consigliera Serratore presenta mozione su rifiuti e sicurezza in località Serra e Annunziata",
        url: SERRA_ANNUNZIATA_LAMETINO_URL,
        publisher: "il Lametino",
        publishedAt: "2026-09-14",
        relationship: "agenda_item",
        relevanceNote:
          "L'articolo attribuisce a Bernadette Serratore una mozione su rifiuti, bonifica, sicurezza e controlli nelle località Serra e Annunziata, elementi coincidenti con il punto ufficiale della III Commissione del 21 settembre. Pubblicato prima della convocazione, documenta il tema della mozione ma non la seduta, la sua trattazione o eventuali esiti.",
        reviewedAt: SERRA_ANNUNZIATA_CONTEXT_RESEARCHED_AT,
      },
    ],
    media: [],
  };

const commissionContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: CONTEXT_RESEARCHED_AT,
  searchNote:
    "La ricerca di articoli, dirette e video per organo, date e temi non ha restituito contenuti che nominino con sufficiente precisione le sedute della II Commissione del 10 o 11 agosto; i collegamenti riportati riguardano soltanto i temi in agenda.",
  articles: [
    {
      title:
        "Approvato in giunta l'assestamento generale di bilancio e salvaguardia degli equilibri per l'esercizio 2026",
      url: "https://www.lameziainforma.it/istituzione/2026/08/06/approvato-in-giunta-lassestamento-generale-di-bilancio-e-salvaguardia-degli-equilibri-per-lesercizio-2026/68773/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-06",
      relationship: "agenda_item",
      relevanceNote:
        "Approfondisce la proposta di assestamento approvata dalla Giunta il 6 agosto, poi indicata nel primo punto della convocazione; non documenta le riunioni della Commissione.",
      reviewedAt: CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "LAMEZIA | Bilancio, la maggioranza si sfalda in Giunta: tre assessori assenti. Muraca: «È sfiducia al sindaco»",
      url: "https://lanovitaonline.it/lamezia-bilancio-la-maggioranza-si-sfalda-in-giunta-tre-assessori-assenti-muraca-e-sfiducia-al-sindaco/",
      publisher: "La Novità Online",
      publishedAt: "2026-08-08",
      relationship: "agenda_item",
      relevanceNote:
        "Riporta una posizione politica sulla deliberazione di Giunta relativa all'assestamento; riguarda il tema in agenda e non verifica attività o esiti della Commissione.",
      reviewedAt: CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [],
};

function requireCandidate(
  input: InstitutionalSessionCandidateInput,
): InstitutionalSessionCandidate {
  const candidate = identifyInstitutionalSessionCandidate(input);
  if (!candidate) {
    throw new Error(`Invalid institutional session source record: ${input.id}`);
  }
  return candidate;
}

interface LateSeptemberNoticeInput {
  publicationNumber: string;
  publicationStart: string;
  publicationEnd: string;
  subject: string;
  sourceContentHash: string;
  documentSha256: string;
  reviewedAt?: string;
}

function lateSeptemberNotice({
  publicationNumber,
  publicationStart,
  publicationEnd,
  subject,
  sourceContentHash,
  documentSha256,
  reviewedAt = LATE_SEPTEMBER_COMMISSION_RESEARCHED_AT,
}: LateSeptemberNoticeInput): {
  candidate: InstitutionalSessionCandidate;
  provenance: CouncilSessionV0Provenance;
} {
  const publicationId = publicationNumber.replace("/", "-");
  const documentUrl = `https://albo.tinnvision.cloud/allegati/${publicationId.replace("-", "_")}_1_X?ente=00301390795`;
  const candidate = requireCandidate({
    id: `albo-${publicationId}`,
    source: "Albo Pretorio Comune di Lamezia Terme",
    source_url: OFFICIAL_ALBO_URL,
    retrieved_at: reviewedAt,
    publication_number: publicationNumber,
    publication_start: publicationStart,
    publication_end: publicationEnd,
    act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
    subject,
    document_url: documentUrl,
    content_hash: sourceContentHash,
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
  });

  return {
    candidate,
    provenance: {
      noticeId: candidate.id,
      publicationNumber: candidate.publicationNumber,
      sourceLabel: candidate.source.label,
      sourceUrl: candidate.source.url,
      documentUrl: candidate.source.documentUrl,
      archivedDocumentUrl: `/data/public/albo/documents/2026/${documentSha256}.pdf`,
      sourceContentHash: candidate.source.contentHash,
      documentSha256,
      embeddedDocumentSha256: null,
      retrievedAt: candidate.source.retrievedAt,
      reviewedAt,
      sourceReviewStatus: "reviewed_against_official_attachment",
    },
  };
}

const commissionCandidate = requireCandidate({
  id: "albo-2026-2648",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-08-11T07:32:34.743Z",
  publication_number: "2026/2648",
  publication_start: "2026-08-07",
  publication_end: "2026-08-14",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 2° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_NOTICE_URL,
  content_hash:
    "f4301f15e2bfd99aecb79f25ceb4d1346a486ff1fe20e748f9bac89a818eee09",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionViCandidate = requireCandidate({
  id: "albo-2026-2788",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-08-31T13:37:46.902Z",
  publication_number: "2026/2788",
  publication_start: "2026-08-31",
  publication_end: "2026-09-07",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 6° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_VI_NOTICE_URL,
  content_hash:
    "32af1fef2fdc84892259f836c0cc6c1aa70d1e404d664a91f7cad339e3c24629",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionIvEarlyCandidate = requireCandidate({
  id: "albo-2026-2840",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-09-03T18:34:57.880Z",
  publication_number: "2026/2840",
  publication_start: "2026-09-02",
  publication_end: "2026-09-09",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 4° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_IV_EARLY_NOTICE_URL,
  content_hash:
    "29b8c30dc8fcfe6e73229bf4b46917876ef46dd3dcc7be4b3a6d277a4e220efc",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionViSeptemberCandidate = requireCandidate({
  id: "albo-2026-2859",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  publication_number: "2026/2859",
  publication_start: "2026-09-04",
  publication_end: "2026-09-11",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject: "Convocazione 6° Commissione Consiliare Permanente.",
  document_url: COMMISSION_VI_SEPTEMBER_NOTICE_URL,
  content_hash:
    "935417af6dfd7f23abf125c15655a0e031e5e85ec4331dab4131ccca493d9eec",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionIvLaterCandidate = requireCandidate({
  id: "albo-2026-2860",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  publication_number: "2026/2860",
  publication_start: "2026-09-04",
  publication_end: "2026-09-11",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 4° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_IV_LATER_NOTICE_URL,
  content_hash:
    "422e104e5b17eb72bcb036b6c4816cbc1ee7c1ac77a6b9f080c1a9c66b4c3f20",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionsIiiIvJointCandidate = requireCandidate({
  id: "albo-2026-2861",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  publication_number: "2026/2861",
  publication_start: "2026-09-04",
  publication_end: "2026-09-11",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject: "Convocazione congiunta 3° e 4° Commissione Consiliare Permanente.",
  document_url: COMMISSIONS_III_IV_JOINT_NOTICE_URL,
  content_hash:
    "1035de7c0cd5355d2d68dfeef8833c838d9e2a8a3ae5e4338f8abd3b5c7f90f7",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionIiiGuarantorCandidate = requireCandidate({
  id: "albo-2026-2879",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: MID_SEPTEMBER_COMMISSION_RESEARCHED_AT,
  publication_number: "2026/2879",
  publication_start: "2026-09-09",
  publication_end: "2026-09-16",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject: "Convocazione 3° Commissione Consiliare Permanente.",
  document_url: COMMISSION_III_GUARANTOR_NOTICE_URL,
  content_hash:
    "04f12caf167315030334618ea41d7e5091cf271b75baf33da58cccb1e35326c9",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionIvMidSeptemberCandidate = requireCandidate({
  id: "albo-2026-2925",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: MID_SEPTEMBER_COMMISSION_RESEARCHED_AT,
  publication_number: "2026/2925",
  publication_start: "2026-09-11",
  publication_end: "2026-09-18",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 4° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_IV_MID_SEPTEMBER_NOTICE_URL,
  content_hash:
    "5a9d168246b9a4ed62e13c53e6a1106415f2c5d7c8825ea8d439ce165deaa500",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionIiiMidSeptemberCandidate = requireCandidate({
  id: "albo-2026-2926",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: MID_SEPTEMBER_COMMISSION_RESEARCHED_AT,
  publication_number: "2026/2926",
  publication_start: "2026-09-11",
  publication_end: "2026-09-18",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 3° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_III_MID_SEPTEMBER_NOTICE_URL,
  content_hash:
    "fc6d1aaf789ee6902f85d537cd5b8dde937ea9e62573eacf8c75fd84d0c14117",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionVSeptember17Notice = lateSeptemberNotice({
  publicationNumber: "2026/2953",
  publicationStart: "2026-09-15",
  publicationEnd: "2026-09-22",
  subject: "Convocazione 5° Commissione Consiliare Permante.",
  sourceContentHash:
    "a0847f430a5d647392679397388a437ab59552a0c8703b1b53c7b1d7ad43e451",
  documentSha256:
    "57731fbea7c4cdd31d8ff82175a0f84fc4fb053c0d71cb073d00ce38b33c74b5",
});

const commissionIiSeptemberCalendarNotice = lateSeptemberNotice({
  publicationNumber: "2026/2959",
  publicationStart: "2026-09-15",
  publicationEnd: "2026-09-22",
  subject:
    "Convocazione 2° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "91111c510f5fd5aa973bd579d24a595d3cf54e0ebb4a66fee237c167b599c237",
  documentSha256:
    "674f8c685f04e85674e4530e180cc45bca76b0256d06397040c2a024afb8f440",
});

const commissionIiiSeptember18Notice = lateSeptemberNotice({
  publicationNumber: "2026/2960",
  publicationStart: "2026-09-15",
  publicationEnd: "2026-09-22",
  subject: "Convocazione 3° Commissione Consiliare Permanente.",
  sourceContentHash:
    "30980bcc9f5acb9173fe1bab42601c7999edfa30e72e0341ac8143c11fb59317",
  documentSha256:
    "f311abbc9e4c6e3d0b9cfe4d4d0225548be713cef74686ec2556148e8c1901e5",
});

const commissionISeptemberCalendarNotice = lateSeptemberNotice({
  publicationNumber: "2026/2971",
  publicationStart: "2026-09-16",
  publicationEnd: "2026-09-23",
  subject:
    "Convocazione 1° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "6db758ff5ddab2f37c7db4442641b0e75481ddfd9b201d9738a7579cd414c1f5",
  documentSha256:
    "08f1075950b3e90994c2c5353cb0b1dc0992a4c6f4d55b27ba2e5ddcb99f5c40",
});

const commissionIvSeptemberCalendarNotice = lateSeptemberNotice({
  publicationNumber: "2026/2981",
  publicationStart: "2026-09-17",
  publicationEnd: "2026-09-24",
  subject:
    "Convocazione 4° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "a6a45d08d063c993b69995557a4a82417c4fba918de3315260a189bb2a78c38f",
  documentSha256:
    "588fe94ce804d0f1699cb42f41eee4390e4ecb3f3fab21379b100b5c84e3e4eb",
});

const commissionVSeptember21Notice = lateSeptemberNotice({
  publicationNumber: "2026/2986",
  publicationStart: "2026-09-17",
  publicationEnd: "2026-09-24",
  subject: "Convocazione 5° Commissione Consiliare Permanente.",
  sourceContentHash:
    "6b5898f02ec82e8f3a587c49491033d0945396b9589c5d1584da4d2002205ca6",
  documentSha256:
    "b23e5a278fa5550657c3804e2a60a37ad09a1bdad2efcff6a7ece4f68a6b15e1",
});

const commissionIiiSeptember21Notice = lateSeptemberNotice({
  publicationNumber: "2026/3001",
  publicationStart: "2026-09-18",
  publicationEnd: "2026-09-25",
  subject: "Convocazione 3° Commissione Consiliare Permanente.",
  sourceContentHash:
    "7d6e5cc50baeb9e9d79c2b668de35004a3134587fd714964170828c2228adee3",
  documentSha256:
    "8eebc4e71f5def4118e620b94ea9855319f39f9c548aedb7d4860d19a42b6f7f",
});

const commissionVSeptember22To25Notice = lateSeptemberNotice({
  publicationNumber: "2026/3011",
  publicationStart: "2026-09-21",
  publicationEnd: "2026-09-28",
  subject:
    "Convocazione 5° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "8baf6844580bd1b54d2ee18a669183432df8c6512eb5cd5972e70d69fcdbeae9",
  documentSha256:
    "faa773ca9b02a88e8e7de334843e86dc20daa153f835f2acf50a2ca88a1754f5",
  reviewedAt: SEPTEMBER_22_25_COMMISSION_RESEARCHED_AT,
});

const commissionIvSeptember22And23Notice = lateSeptemberNotice({
  publicationNumber: "2026/3012",
  publicationStart: "2026-09-21",
  publicationEnd: "2026-09-28",
  subject:
    "Convocazione 4° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "db8e6b45c1fc183b22c3d7aa421187efe779bd05c67b550038eb7712ac38fa3d",
  documentSha256:
    "85c4218e626ff552d3663519672675fd42d05a212a392f66683c3d1fba011492",
  reviewedAt: SEPTEMBER_22_25_COMMISSION_RESEARCHED_AT,
});

const commissionIiiSeptember24Notice = lateSeptemberNotice({
  publicationNumber: "2026/3043",
  publicationStart: "2026-09-22",
  publicationEnd: "2026-09-29",
  subject: "Convocazione 3° Commissione Consiliare Permanente.",
  sourceContentHash:
    "82e6f6fd989cf7e37ae8b4dd8e24a3d4e056a5b486d6fa68e6dd0d8c7f11f222",
  documentSha256:
    "bebe656039da9f7a4dd7b93f3baf530902ac0a1da3319e1bf3e063001845bbb8",
  reviewedAt: SEPTEMBER_24_COMMISSION_RESEARCHED_AT,
});

const commissionIiiSeptember25Notice = lateSeptemberNotice({
  publicationNumber: "2026/3089",
  publicationStart: "2026-09-25",
  publicationEnd: "2026-10-02",
  subject: "Convocazione 3° Commissione Consiliare Permanente.",
  sourceContentHash:
    "b621f17980514460f3620dfcae1fc8ad976072c73a2da36e1ced4164c8cbb179",
  documentSha256:
    "a4d38091b4b34ac513d25e6a7a200dcb0538f086ae29d2f4aa42e8f04b13cd62",
  reviewedAt: SEPTEMBER_24_30_COMMISSION_RESEARCHED_AT,
});

const commissionVSeptember28To30Notice = lateSeptemberNotice({
  publicationNumber: "2026/3090",
  publicationStart: "2026-09-25",
  publicationEnd: "2026-10-02",
  subject:
    "Convocazione 5° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "1ccc848648feb3895b8d94ee2f546862f919b6e46b1592da9d3f0575f100e3e2",
  documentSha256:
    "095b6802f339bc9bbf7279fc905e021ffd9a6867d2dcc1a465e28439d1ade6a2",
  reviewedAt: SEPTEMBER_24_30_COMMISSION_RESEARCHED_AT,
});

const commissionIvSeptember28Notice = lateSeptemberNotice({
  publicationNumber: "2026/3091",
  publicationStart: "2026-09-25",
  publicationEnd: "2026-10-02",
  subject: "Convocazione 4° Commissione Consiliare Permanente.",
  sourceContentHash:
    "5664f02ecd0edb544711b691fbbb080732cb6e2e9c6cdea4f88f4052d9b225ba",
  documentSha256:
    "a8381207edd8c5ca1b7cacd2b3c006ebe4073ee3b22dd199fac616705031f23c",
  reviewedAt: SEPTEMBER_24_30_COMMISSION_RESEARCHED_AT,
});

const commissionIvSeptember24And25Notice = lateSeptemberNotice({
  publicationNumber: "2026/3097",
  publicationStart: "2026-09-25",
  publicationEnd: "2026-10-02",
  subject:
    "Convocazione 4° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "4a6199e13ea5f62aff37318343b396776b6208511c9cdc12cc03d1b9eadaa708",
  documentSha256:
    "4f2d4c158f13f9239d1b5391f92315a7a7ef29a2e8769c8b04697f0a92f30b1d",
  reviewedAt: SEPTEMBER_24_30_COMMISSION_RESEARCHED_AT,
});

const commissionIiiSeptember29AndOctober1Notice = lateSeptemberNotice({
  publicationNumber: "2026/3129",
  publicationStart: "2026-09-28",
  publicationEnd: "2026-10-05",
  subject:
    "Convocazione 3° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "62415093f67010fd438f1c50356797e45627e166ad510bb0dd4c3ff60b230539",
  documentSha256:
    "3bad1431481f91442b163c8476275d492807e42bf2bd80807961dd80d2e7a972",
  reviewedAt: SEPTEMBER_29_OCTOBER_1_COMMISSION_RESEARCHED_AT,
});

const commissionIvSeptember29And30Notice = lateSeptemberNotice({
  publicationNumber: "2026/3127",
  publicationStart: "2026-09-28",
  publicationEnd: "2026-10-05",
  subject:
    "Convocazione 4° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "597162d76e5aa5f1c63f56847e6d96e6418f07263b3c32bb6738b7946d0e9b52",
  documentSha256:
    "a0138aeebec3e21db1a1b922f91886dd186bad25ffc56542076ecbbb147ae5ae",
  reviewedAt: SEPTEMBER_29_OCTOBER_1_COMMISSION_RESEARCHED_AT,
});

const commissionVOctober1And2Notice = lateSeptemberNotice({
  publicationNumber: "2026/3151",
  publicationStart: "2026-09-30",
  publicationEnd: "2026-10-07",
  subject:
    "Convocazione 5° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "2f133ea15d7c0972572dff147299e6cdf337044a1cadfdaa0eaa872bc942a6e3",
  documentSha256:
    "22fda4e484df93fbc9983803b62e066a46201d094f601ee38cdcd2a730004000",
  reviewedAt: OCTOBER_1_6_COMMISSION_RESEARCHED_AT,
});

const commissionViOctober2Notice = lateSeptemberNotice({
  publicationNumber: "2026/3152",
  publicationStart: "2026-09-30",
  publicationEnd: "2026-10-07",
  subject: "Convocazione 6° Commissione Consiliare Permanente.",
  sourceContentHash:
    "057df91b8abf8c7a3fcf0752c049b2035310fca58087dbe11603e6b7d66c4643",
  documentSha256:
    "5e9df217a9c8310fc25597070b99e01776e5a2b3b0993ef937e5b06fa95a6d93",
  reviewedAt: OCTOBER_1_6_COMMISSION_RESEARCHED_AT,
});

const commissionIvOctober1And2Notice = lateSeptemberNotice({
  publicationNumber: "2026/3157",
  publicationStart: "2026-09-30",
  publicationEnd: "2026-10-07",
  subject:
    "Convocazione 4° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "cd8e31c6f50d175d5a071f9c51c34c82589b1237b6675cf6c6b6f8c510a9c205",
  documentSha256:
    "6bbec3fb6360a5d8cfd40362d775e398bd0f4a80d41c49d5c375d8216bbc77d8",
  reviewedAt: OCTOBER_1_6_COMMISSION_RESEARCHED_AT,
});

const commissionIiiOctober5And6Notice = lateSeptemberNotice({
  publicationNumber: "2026/3190",
  publicationStart: "2026-10-01",
  publicationEnd: "2026-10-08",
  subject:
    "Convocazione 3° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "e4746942f27d592cf2b3ce71705382bcd5935fe9203c5e28fe5d4bab0ba45b73",
  documentSha256:
    "5d607076e9146eaadb5bc23b83928c865e1007c010abbf77c6dacbdf4a17770d",
  reviewedAt: OCTOBER_1_6_COMMISSION_RESEARCHED_AT,
});

const commissionIiOctober5And6Notice = lateSeptemberNotice({
  publicationNumber: "2026/3197",
  publicationStart: "2026-10-02",
  publicationEnd: "2026-10-09",
  subject:
    "Convocazione 2° Commissione Consiliare Permanente. Calendario lavori.",
  sourceContentHash:
    "35477946eac942930eb5fc7be71afdc63505e07b4442416e703f6799f7d8e82e",
  documentSha256:
    "50dc729a39338b607925d93f7cf927a38ed75f88ec8ca8ebc7163a5166ae7cc1",
  reviewedAt: OCTOBER_1_6_COMMISSION_RESEARCHED_AT,
});

const commissionIvOctober5Notice = lateSeptemberNotice({
  publicationNumber: "2026/3198",
  publicationStart: "2026-10-02",
  publicationEnd: "2026-10-09",
  subject: "Convocazione 4° Commissione Consiliare Permanente.",
  sourceContentHash:
    "57af86ffd8640a7acf140edf2742e9b761022da32f8be076332c4e6145d2c090",
  documentSha256:
    "83fe0c8c9149f7fb01dd5ca0180d0c8d4decf59be9ef5c44a36baad7b1e6fbec",
  reviewedAt: OCTOBER_1_6_COMMISSION_RESEARCHED_AT,
});

const commissionVOctober12And13Notice = lateSeptemberNotice({
  publicationNumber: "2026/3262",
  publicationStart: "2026-10-09",
  publicationEnd: "2026-10-16",
  subject: "Convocazione seduta 5° Commissione Consiliare permanente.",
  sourceContentHash:
    "77c48da9bd24ef016efb6d91aee2111faaadfaaad94195f3ef7f8c01ac799928",
  documentSha256:
    "162b92486574751b01024336f282ec58496ae951bbec08c455d42480f2cf2cce",
  reviewedAt: OCTOBER_12_13_COMMISSION_RESEARCHED_AT,
});

const councilOctober9DocumentUrl =
  "https://albo.tinnvision.cloud/allegati/2026_3221_1_X?ente=00301390795";
const councilOctober9DocumentSha256 =
  "83aea5a29ea10b1e32c08649c8f9fc9d3e8c45e1d015c6ea902ca6e2214a7c97";
const councilOctober9Candidate = requireCandidate({
  id: "albo-2026-3221",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: OCTOBER_7_RESEARCHED_AT,
  publication_number: "2026/3221",
  publication_start: "2026-10-06",
  publication_end: "2026-10-08",
  act_type: "CONVOCAZIONE CONSIGLIO COMUNALE",
  subject: "Avviso seduta di Consiglio Comunale",
  document_url: councilOctober9DocumentUrl,
  content_hash:
    "0b6cb9a1d7d74d086dca4c7cc4c17ce3000bf2b5e2c1efd53f4c8f20a5c279f1",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});
const councilOctober9Provenance: CouncilSessionV0Provenance = {
  noticeId: councilOctober9Candidate.id,
  publicationNumber: councilOctober9Candidate.publicationNumber,
  sourceLabel: councilOctober9Candidate.source.label,
  sourceUrl: councilOctober9Candidate.source.url,
  documentUrl: councilOctober9Candidate.source.documentUrl,
  archivedDocumentUrl: `/data/public/albo/documents/2026/${councilOctober9DocumentSha256}.pdf`,
  sourceContentHash: councilOctober9Candidate.source.contentHash,
  documentSha256: councilOctober9DocumentSha256,
  embeddedDocumentSha256: null,
  retrievedAt: councilOctober9Candidate.source.retrievedAt,
  reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_later_official_source",
  supplementalEvidence: [
    {
      publicationNumber: "2026/3263",
      sourceLabel: "Albo Pretorio Comune di Lamezia Terme",
      sourceUrl:
        "https://albo.tinnvision.cloud/allegati/2026_3263_1_X?ente=00301390795",
      archivedDocumentUrl:
        "/data/public/albo/documents/2026/cfcb9e41a26ac25a2e48f034365cfee2cfe4b5ba1ac5b1fcff09e483caacc4a0.pdf",
      documentSha256:
        "cfcb9e41a26ac25a2e48f034365cfee2cfe4b5ba1ac5b1fcff09e483caacc4a0",
      retrievedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
      reviewedAt: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
      verificationNote:
        "Avviso ufficiale di seconda convocazione: attesta la mancanza del numero legale nella prima convocazione del 9 ottobre e ripropone per il 12 ottobre alle 10:30 i 18 punti non discussi e votati.",
    },
  ],
};

const councilCandidate = requireCandidate({
  id: "albo-2026-2673",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-08-11T07:32:34.743Z",
  publication_number: "2026/2673",
  publication_start: "2026-08-10",
  publication_end: "2026-08-14",
  act_type: "CONVOCAZIONE CONSIGLIO COMUNALE",
  subject: "Avviso seduta di Consiglio Comunale.",
  document_url: null,
  content_hash:
    "31789ffe968c4991b8b066817d50b757920a36b0bc6f83bff5628f9012a4d108",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionCandidate.id,
  publicationNumber: commissionCandidate.publicationNumber,
  sourceLabel: commissionCandidate.source.label,
  sourceUrl: commissionCandidate.source.url,
  documentUrl: commissionCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionCandidate.source.contentHash,
  documentSha256:
    "842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304",
  embeddedDocumentSha256:
    "3069388db15c43fdbf3cc980195f9c88ded602a6e9f8f89f358a006ce789096c",
  retrievedAt: commissionCandidate.source.retrievedAt,
  reviewedAt: SOURCE_REVIEWED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const commissionViProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionViCandidate.id,
  publicationNumber: commissionViCandidate.publicationNumber,
  sourceLabel: commissionViCandidate.source.label,
  sourceUrl: commissionViCandidate.source.url,
  documentUrl: commissionViCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_VI_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionViCandidate.source.contentHash,
  documentSha256:
    "165152190ac39451d35caf5815bfb4d7d6d7ee66c20abe630c98b47d62858c72",
  embeddedDocumentSha256:
    "c09e7aacd7d22f77f8e72db5b5198203748b5f032dfd604b236f46fe8a28197d",
  retrievedAt: commissionViCandidate.source.retrievedAt,
  reviewedAt: COMMISSION_VI_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const commissionIvEarlyProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionIvEarlyCandidate.id,
  publicationNumber: commissionIvEarlyCandidate.publicationNumber,
  sourceLabel: commissionIvEarlyCandidate.source.label,
  sourceUrl: commissionIvEarlyCandidate.source.url,
  documentUrl: commissionIvEarlyCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_IV_EARLY_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionIvEarlyCandidate.source.contentHash,
  documentSha256:
    "365976826d174821dfcd69c4c02710fcc8eb324c24ccefe2549d3fce932abd0b",
  embeddedDocumentSha256:
    "d642b7171bc1494ffcdb500eb3e30fd88883fbb166f3ebcd80da83a03d32d768",
  retrievedAt: commissionIvEarlyCandidate.source.retrievedAt,
  reviewedAt: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const commissionViSeptemberProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionViSeptemberCandidate.id,
  publicationNumber: commissionViSeptemberCandidate.publicationNumber,
  sourceLabel: commissionViSeptemberCandidate.source.label,
  sourceUrl: commissionViSeptemberCandidate.source.url,
  documentUrl: commissionViSeptemberCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_VI_SEPTEMBER_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionViSeptemberCandidate.source.contentHash,
  documentSha256:
    "a1dad36522921833ac71b994a73032d3454227d0a2c00f57156a8d7059d94baf",
  embeddedDocumentSha256: null,
  retrievedAt: commissionViSeptemberCandidate.source.retrievedAt,
  reviewedAt: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const commissionIvLaterProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionIvLaterCandidate.id,
  publicationNumber: commissionIvLaterCandidate.publicationNumber,
  sourceLabel: commissionIvLaterCandidate.source.label,
  sourceUrl: commissionIvLaterCandidate.source.url,
  documentUrl: commissionIvLaterCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_IV_LATER_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionIvLaterCandidate.source.contentHash,
  documentSha256:
    "dee314eb1f7e9133848be4b48c1c0b5e06ddd60371a92acc40ef9e290a62e411",
  embeddedDocumentSha256: null,
  retrievedAt: commissionIvLaterCandidate.source.retrievedAt,
  reviewedAt: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const commissionsIiiIvJointProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionsIiiIvJointCandidate.id,
  publicationNumber: commissionsIiiIvJointCandidate.publicationNumber,
  sourceLabel: commissionsIiiIvJointCandidate.source.label,
  sourceUrl: commissionsIiiIvJointCandidate.source.url,
  documentUrl: commissionsIiiIvJointCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSIONS_III_IV_JOINT_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionsIiiIvJointCandidate.source.contentHash,
  documentSha256:
    "feb500c847880bf03ab1cd09190b961828f5b3873d60bea800e93367a3c74468",
  embeddedDocumentSha256: null,
  retrievedAt: commissionsIiiIvJointCandidate.source.retrievedAt,
  reviewedAt: SEPTEMBER_COMMISSION_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const commissionIiiGuarantorProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionIiiGuarantorCandidate.id,
  publicationNumber: commissionIiiGuarantorCandidate.publicationNumber,
  sourceLabel: commissionIiiGuarantorCandidate.source.label,
  sourceUrl: commissionIiiGuarantorCandidate.source.url,
  documentUrl: commissionIiiGuarantorCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_III_GUARANTOR_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionIiiGuarantorCandidate.source.contentHash,
  documentSha256:
    "b3f2d6a2b5884cd5e17b77b03289abeff7ab1f9994d7b70aa0d66ade22abdb09",
  embeddedDocumentSha256: null,
  retrievedAt: commissionIiiGuarantorCandidate.source.retrievedAt,
  reviewedAt: MID_SEPTEMBER_COMMISSION_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const commissionIvMidSeptemberProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionIvMidSeptemberCandidate.id,
  publicationNumber: commissionIvMidSeptemberCandidate.publicationNumber,
  sourceLabel: commissionIvMidSeptemberCandidate.source.label,
  sourceUrl: commissionIvMidSeptemberCandidate.source.url,
  documentUrl: commissionIvMidSeptemberCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_IV_MID_SEPTEMBER_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionIvMidSeptemberCandidate.source.contentHash,
  documentSha256:
    "671bbd99e42677437d3c2b424d2ffd1794c8b1195efbf867591e3550480d31d1",
  embeddedDocumentSha256: null,
  retrievedAt: commissionIvMidSeptemberCandidate.source.retrievedAt,
  reviewedAt: MID_SEPTEMBER_COMMISSION_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const commissionIiiMidSeptemberProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionIiiMidSeptemberCandidate.id,
  publicationNumber: commissionIiiMidSeptemberCandidate.publicationNumber,
  sourceLabel: commissionIiiMidSeptemberCandidate.source.label,
  sourceUrl: commissionIiiMidSeptemberCandidate.source.url,
  documentUrl: commissionIiiMidSeptemberCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_III_MID_SEPTEMBER_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionIiiMidSeptemberCandidate.source.contentHash,
  documentSha256:
    "3de7a9e3185b36116474d8ecb3bed1c425b7395af5e85c9bb83bb16ca082e8d0",
  embeddedDocumentSha256: null,
  retrievedAt: commissionIiiMidSeptemberCandidate.source.retrievedAt,
  reviewedAt: MID_SEPTEMBER_COMMISSION_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const councilProvenance: CouncilSessionV0Provenance = {
  noticeId: councilCandidate.id,
  publicationNumber: councilCandidate.publicationNumber,
  sourceLabel: councilCandidate.source.label,
  sourceUrl: councilCandidate.source.url,
  documentUrl: null,
  archivedDocumentUrl: null,
  sourceContentHash: councilCandidate.source.contentHash,
  documentSha256: null,
  embeddedDocumentSha256: null,
  retrievedAt: councilCandidate.source.retrievedAt,
  reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_later_official_source",
  supplementalEvidence: [
    {
      publicationNumber: "2026/2755",
      sourceLabel: "Albo Pretorio Comune di Lamezia Terme",
      sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
      archivedDocumentUrl: COUNCIL_SESSION_EVIDENCE_ARCHIVE_URL,
      documentSha256:
        "e008e83a4d7ae0a4672146b73ebc62e64d565a26eeb043cafaf9e45d92ecf2c5",
      retrievedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
      verificationNote:
        "La determinazione conferma la seduta del 13 agosto 2026 e l'approvazione di uno specifico debito fuori bilancio; non documenta orario, ordine del giorno completo, presenze o tutte le votazioni.",
    },
  ],
};

const commissionAgenda = [
  "Esame della proposta di deliberazione del Consiglio comunale n. 2259 del 6 agosto 2026: assestamento generale di bilancio e salvaguardia degli equilibri per l'esercizio 2026.",
  "Esame delle proposte di deliberazione del Consiglio comunale relative a debiti fuori bilancio derivanti da sentenze esecutive.",
] as const;

function commissionSession(
  date: "2026-08-10" | "2026-08-11",
): CouncilSessionV0 {
  const italianDate =
    date === "2026-08-10" ? "10 agosto 2026" : "11 agosto 2026";
  const documentUrl = commissionCandidate.source.documentUrl ?? undefined;

  return {
    id: `albo-2026-2648-commissione-ii-${date}`,
    kind: "commission",
    isDemoFixture: false,
    provenance: commissionProvenance,
    contextResearch: commissionContextResearch,
    title: {
      key: "title",
      label: "Titolo",
      value: `II Commissione consiliare permanente — seduta del ${italianDate}`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Titolo normalizzato dalla convocazione ufficiale; la fonte identifica la II Commissione come Servizi economici e finanziari.",
    },
    scheduledAt: {
      key: "scheduledAt",
      label: "Data e ora",
      value: `${date}T09:30:00+02:00`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Data e ora trascritte dall'allegato ufficiale; indicano la programmazione, non provano lo svolgimento.",
    },
    sessionStatus: {
      key: "sessionStatus",
      label: "Stato seduta",
      value: "non_verificata",
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "La convocazione documenta la seduta programmata; non è stata collegata una fonte che ne confermi lo svolgimento o l'eventuale rinvio.",
    },
    agenda: {
      key: "agenda",
      label: "Ordine del giorno",
      value: commissionAgenda,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Sintesi fedele dei due punti riportati nell'allegato; per formulazione completa e riferimenti normativi consultare il documento originale.",
    },
    sourceLink: {
      key: "sourceLink",
      label: "Fonte",
      value: "Apri la convocazione nell'Albo ufficiale",
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit: `Pubblicazione ${commissionCandidate.publicationNumber}; copia acquisita e verificata tramite hash nel repository.`,
    },
    liveStreaming: {
      key: "liveStreaming",
      label: "Streaming live",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione consultata; ciò non esclude che possa essere stato comunicato su un altro canale.",
    },
    recording: {
      key: "recording",
      label: "Registrazione",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevata nella fonte monitorata; nessuna conclusione viene tratta sulla disponibilità complessiva di registrazioni.",
    },
    minutesOrReport: {
      key: "minutesOrReport",
      label: "Verbale o resoconto",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione; verbali o resoconti successivi richiedono una ricerca separata nelle fonti istituzionali.",
    },
    lastCheckedAt: {
      key: "lastCheckedAt",
      label: "Ultimo controllo",
      value: SOURCE_REVIEWED_AT,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Controllo della copia ufficiale archiviata; future modifiche o nuove pubblicazioni non sono incluse automaticamente in questa scheda revisionata.",
    },
    dataLimits: {
      key: "dataLimits",
      label: "Limiti del dato",
      value: [
        "La stessa convocazione programma due sedute, il 10 e l'11 agosto 2026 alle 09:30.",
        "La scheda non certifica svolgimento, presenze, esiti o completezza storica.",
        "Streaming, registrazione e verbale sono indicati come non rilevati nella fonte consultata, non come inesistenti.",
      ],
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "Prima tranche editoriale basata su un solo avviso ufficiale; la copertura delle Commissioni non è completa.",
    },
  };
}

const commissionViAgenda = [
  "Denominazione comunale d'origine (De.Co.).",
  "Regolamento chioschi.",
] as const;

function commissionViSession(
  date: "2026-09-01" | "2026-09-04",
): CouncilSessionV0 {
  const italianDate =
    date === "2026-09-01" ? "1 settembre 2026" : "4 settembre 2026";
  const documentUrl = commissionViCandidate.source.documentUrl ?? undefined;

  return {
    id: `albo-2026-2788-commissione-vi-${date}`,
    kind: "commission",
    isDemoFixture: false,
    provenance: commissionViProvenance,
    contextResearch: commissionViContextResearch,
    title: {
      key: "title",
      label: "Titolo",
      value: `VI Commissione consiliare permanente — seduta del ${italianDate}`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Titolo normalizzato dalla convocazione ufficiale; la fonte identifica la VI Commissione come Sviluppo economico ed attività produttive.",
    },
    scheduledAt: {
      key: "scheduledAt",
      label: "Data e ora",
      value: `${date}T12:00:00+02:00`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Data e ora trascritte dall'allegato ufficiale; indicano la programmazione, non provano lo svolgimento.",
    },
    sessionStatus: {
      key: "sessionStatus",
      label: "Stato seduta",
      value: "non_verificata",
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "La convocazione documenta la seduta programmata; non è stata collegata una fonte che ne confermi lo svolgimento o l'eventuale rinvio.",
    },
    agenda: {
      key: "agenda",
      label: "Ordine del giorno",
      value: commissionViAgenda,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Trascrizione fedele dei due punti riportati nell'allegato ufficiale; non documenta discussione, votazioni o esiti.",
    },
    sourceLink: {
      key: "sourceLink",
      label: "Fonte",
      value: "Apri il calendario ufficiale della VI Commissione",
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit: `Pubblicazione ${commissionViCandidate.publicationNumber}; copia acquisita e verificata tramite hash nel repository.`,
    },
    liveStreaming: {
      key: "liveStreaming",
      label: "Streaming live",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione consultata; ciò non esclude che possa essere comunicato su un altro canale.",
    },
    recording: {
      key: "recording",
      label: "Registrazione",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevata nella fonte monitorata; nessuna conclusione viene tratta sulla disponibilità complessiva di registrazioni.",
    },
    minutesOrReport: {
      key: "minutesOrReport",
      label: "Verbale o resoconto",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione; verbali o resoconti successivi richiedono una ricerca separata nelle fonti istituzionali.",
    },
    lastCheckedAt: {
      key: "lastCheckedAt",
      label: "Ultimo controllo",
      value: COMMISSION_VI_RESEARCHED_AT,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Controllo della copia ufficiale archiviata e ricerca contestuale iniziale; nuovi collegamenti saranno verificati in prossimità e dopo la seduta.",
    },
    dataLimits: {
      key: "dataLimits",
      label: "Limiti del dato",
      value: [
        "La stessa convocazione programma due sedute, il 1° e il 4 settembre 2026 alle 12:00.",
        "La sede non è indicata nell'allegato ufficiale e non viene inferita.",
        "La scheda non certifica svolgimento, presenze, esiti o completezza storica.",
        "Streaming, registrazione e verbale sono indicati come non rilevati nella fonte consultata, non come inesistenti.",
        "Non sono emersi collegamenti editoriali sufficientemente precisi al primo controllo.",
      ],
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "Prima verifica basata sul calendario ufficiale; la ricerca di copertura sarà ripetuta durante la finestra attiva.",
    },
  };
}

interface SeptemberCommissionSessionInput {
  id: string;
  title: string;
  scheduledAt: string;
  agenda: readonly string[];
  candidate: InstitutionalSessionCandidate;
  provenance: CouncilSessionV0Provenance;
  contextResearch: CouncilSessionV0ContextResearch;
  sourceLinkLabel: string;
  calendarSummary: string;
}

function septemberCommissionSession({
  id,
  title,
  scheduledAt,
  agenda,
  candidate,
  provenance,
  contextResearch,
  sourceLinkLabel,
  calendarSummary,
}: SeptemberCommissionSessionInput): CouncilSessionV0 {
  const documentUrl = candidate.source.documentUrl ?? undefined;
  const hasContextMatches =
    contextResearch.articles.length > 0 || contextResearch.media.length > 0;

  return {
    id,
    kind: "commission",
    isDemoFixture: false,
    provenance,
    contextResearch,
    title: {
      key: "title",
      label: "Titolo",
      value: title,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Titolo normalizzato dalla denominazione dell'organo e dalla data riportate nella convocazione ufficiale.",
    },
    scheduledAt: {
      key: "scheduledAt",
      label: "Data e ora",
      value: scheduledAt,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Data e ora trascritte dall'allegato ufficiale; indicano la programmazione, non provano lo svolgimento.",
    },
    sessionStatus: {
      key: "sessionStatus",
      label: "Stato seduta",
      value: "non_verificata",
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "La convocazione documenta la seduta programmata; non è stata collegata una fonte istituzionale che ne confermi lo svolgimento o l'eventuale rinvio.",
    },
    agenda: {
      key: "agenda",
      label: "Ordine del giorno",
      value: agenda,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Trascrizione fedele dei punti riportati nell'allegato ufficiale; non documenta discussione, votazioni o esiti.",
    },
    sourceLink: {
      key: "sourceLink",
      label: "Fonte",
      value: sourceLinkLabel,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit: `Pubblicazione ${candidate.publicationNumber}; copia acquisita e verificata tramite hash nel repository.`,
    },
    liveStreaming: {
      key: "liveStreaming",
      label: "Streaming live",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione né nei canali controllati; ciò non equivale a dichiararne l'inesistenza.",
    },
    recording: {
      key: "recording",
      label: "Registrazione",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevata nella fonte istituzionale o nella ricerca editoriale; richiede ulteriori controlli nella finestra attiva.",
    },
    minutesOrReport: {
      key: "minutesOrReport",
      label: "Verbale o resoconto",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione; verbali o resoconti successivi richiedono una ricerca separata nelle fonti istituzionali.",
    },
    lastCheckedAt: {
      key: "lastCheckedAt",
      label: "Ultimo controllo",
      value: contextResearch.checkedAt,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Controllo dell'allegato ufficiale, della copia archiviata e delle fonti di contesto; la ricerca prosegue durante la finestra attiva.",
    },
    dataLimits: {
      key: "dataLimits",
      label: "Limiti del dato",
      value: [
        calendarSummary,
        "La sede non è indicata nell'allegato ufficiale e non viene inferita.",
        "La scheda non certifica svolgimento, presenze, esiti o completezza storica.",
        "Streaming, registrazione e verbale sono indicati come non rilevati, non come inesistenti.",
        hasContextMatches
          ? "I collegamenti di contesto non certificano svolgimento, audizioni, votazioni o esiti della seduta."
          : "Non sono emersi collegamenti editoriali sufficientemente precisi al controllo corrente.",
      ],
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "Verifica basata sulla convocazione ufficiale e su una ricerca contestuale ancora aperta.",
    },
  };
}

const streetArtAgenda = [
  "Regolamento comunale per la promozione della Street Art.",
] as const;

const decoAgenda = ["Denominazione comunale d'origine (De.Co.)."] as const;

const sportDisabilityAgenda = [
  "Progetto Sport e Disabilità. Audizione dell'assessore al ramo Gennaro Gianturco.",
] as const;

const disabilityGuarantorAgenda = [
  'Regolamento per l\'istituzione della figura del "Garante delle persone con disabilità".',
] as const;

const schoolTransportAgenda = [
  "Trasporto Pubblico Scolastico Locale. Audizione del dirigente della Lamezia Multiservizi, ing. Alessandro Vescio.",
] as const;

const municipalNurseriesAgenda = [
  "Asili Nido Comunali. Audizione dell'assessore al ramo Gennaro Gianturco.",
] as const;

const streetArtIcicaAgenda = [
  "Regolamento comunale per la promozione della Street Art. Audizione dell'Associazione Icica.",
] as const;

const commissionPresidentElectionAgenda = ["Elezione del Presidente."] as const;

const courtJudgmentDebtsAgenda = [
  "Esame delle proposte di debiti fuori bilancio derivanti da sentenze esecutive.",
] as const;

const internalControlsAgenda = [
  "Regolamento Controlli Interni. Audizione del Segretario Generale avv. Simona Provenzano e del dirigente del Settore Economico-Finanziario dott.ssa Nadia Aiello.",
] as const;

const taxiRegulationAgenda = [
  "Informativa sulla proposta del nuovo Regolamento Taxi comunale.",
] as const;

const legalDisputesAgenda = [
  "Trattazione della richiesta relativa allo studio e all'esame delle vertenze. Audizione del dirigente del Settore Avvocatura dott.ssa Alessandra Belvedere.",
] as const;

const workPlanningAgenda = ["Programmazione lavori."] as const;

const wasteAbandonmentMotionAgenda = [
  'Mozione prot. n. 71796/2026: "Interventi urgenti di bonifica, sicurezza, controllo e contrasto all\'abbandono dei rifiuti in località Serra e località Annunziata".',
] as const;

const municipalAssetsRegulationAgenda = [
  "Regolamento sulla gestione e valorizzazione dei beni comunali.",
] as const;

const roadNetworkWorksRulesAgenda = [
  "Disciplinare per interventi sulla rete stradale.",
] as const;

const streetArtGiuliaUrbanaAgenda = [
  "Regolamento comunale per la promozione della Street Art. Audizione del sig. Giacomo Marinaro, curatore e direttore artistico del progetto Giulia Urbana.",
] as const;

const hillsideWasteCollectionAgenda = [
  "Servizio raccolta rifiuti nelle zone collinari e montane. Audizione del dirigente della Lamezia Multiservizi ing. Alessandro Vescio e del dirigente di Settore ing. Francesco Esposito.",
] as const;

const wasteAbandonmentMeasuresAgenda = [
  "Misure di contrasto all'abbandono di rifiuti. Audizione del Vicecomandante Ten. Col. Aldo Rubino.",
] as const;

const schoolClimateMotionAgenda = [
  "Mozione prot. n. 68544/2026: tutela della salute e del benessere della comunità scolastica e piano di adeguamento climatico degli edifici scolastici comunali.",
] as const;

const municipalNurseriesAndSchoolMealsTariffsAgenda = [
  "Determinazione delle tariffe per i servizi asili nido comunali e refezione scolastica. Audizione dell'assessore Gennaro Gianturco.",
] as const;

const proximityMarketSantEufemiaAgenda = [
  "Proposta prot. n. 74657/2026: avvio sperimentale di un mercato di prossimità nella zona di Sant'Eufemia Vetere.",
] as const;

const multiYearFinancialRebalancingAgenda = [
  "Aggiornamento sul piano di riequilibrio finanziario pluriennale dell'Ente. Audizione dell'assessore al ramo dott.ssa Maria Nardo.",
] as const;

const councilOctober9Agenda = [
  "Comunicazioni del Presidente sull'intervenuta approvazione dei verbali delle sedute del 10, 17, 21 e 30 luglio 2026 e del 13 agosto 2026.",
  "Nomina del Collegio dei Revisori per il triennio 2026–2029.",
  "Regolamento sui Controlli Interni.",
  "Riconoscimento del debito fuori bilancio derivante dalla sentenza n. 616/26 del Tribunale di Lamezia Terme.",
  "Riconoscimento del debito fuori bilancio derivante dalla sentenza n. 917/25 del Tribunale di Lamezia Terme.",
  "Riconoscimento del debito fuori bilancio derivante dalla sentenza n. 826/24 della Commissione di Giustizia Tributaria di primo grado, II sezione di Catanzaro.",
  "Riconoscimento del debito fuori bilancio derivante dalla sentenza n. 889/26 del Tribunale di Lamezia Terme.",
  "Mozione sulla tutela della salute e del benessere della comunità scolastica, la valutazione del posticipo delle attività didattiche e il piano di adeguamento climatico degli edifici scolastici comunali.",
  "Mozione su manutenzione, igiene urbana, riqualificazione e messa in sicurezza del Rione Timpone.",
  "Mozione sulla procedura di mobilità per agenti di Polizia Locale e sul rafforzamento dell'organico.",
  'Interrogazione sul ruolo strategico di Lamezia Terme nel progetto regionale "Città-Territorio dei Due Mari Catanzaro-Lamezia".',
  'Interrogazione sulla delocalizzazione della base operativa dei Canadair da Lamezia Terme a Crotone nell\'ambito del CIS "Volare".',
  "Interrogazione sul progetto della passerella ciclopedonale tra Marinella e Gizzeria Lido, sul ripristino di via Antonio Cappelli e sulla messa in sicurezza della SS18.",
  'Interrogazione sulla crisi organizzativa e assistenziale del presidio ospedaliero "Giovanni Paolo II".',
  "Interrogazione sull'area di accesso al Cimitero di Sant'Eufemia Lamezia e sul servizio di custodia.",
  "Interrogazione sui Tirocinanti di inclusione sociale (TIS), sulle misure regionali e sul completamento del percorso occupazionale degli idonei.",
  "Interrogazione sull'area giochi presso la scuola Nicholas Green.",
  "Interrogazione sullo stato del Cimitero di Sambiase e sugli interventi di manutenzione e messa in sicurezza.",
  "Interrogazione sulla frazione Caronte, il PTE, l'area camper, il progetto della piazza e la pulizia del torrente Bagni.",
  "Interrogazione sullo stato manutentivo del Cimitero di Nicastro.",
  "Interrogazione su San Teodoro-Piedichiusa, il nuovo parco, il torrente Niola/Piedichiusa, via SS. Salvatore e via dei Normanni.",
] as const;

const councilOctober9Session: CouncilSessionV0 = {
  id: "albo-2026-3221-consiglio-comunale-2026-10-09",
  kind: "council",
  isDemoFixture: false,
  provenance: councilOctober9Provenance,
  contextResearch: councilOctober9ContextResearch,
  title: {
    key: "title",
    label: "Titolo",
    value: "Consiglio comunale — seduta del 9 ottobre 2026",
    sourceStatus: "verificato",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Titolo normalizzato dall'organo e dalla prima convocazione riportati nell'allegato ufficiale.",
  },
  scheduledAt: {
    key: "scheduledAt",
    label: "Data e ora",
    value: "2026-10-09T09:30:00+02:00",
    sourceStatus: "verificato",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Prima convocazione trascritta dall'allegato ufficiale; la seconda convocazione è fissata al 12 ottobre 2026 alle 10:30.",
  },
  sessionStatus: {
    key: "sessionStatus",
    label: "Stato seduta",
    value: "sospesa",
    sourceStatus: "verificato",
    sourceUrl:
      "https://albo.tinnvision.cloud/allegati/2026_3263_1_X?ente=00301390795",
    limit:
      "L'avviso ufficiale 2026/3263 attesta che la prima convocazione si è tenuta ma è stata sospesa per mancanza del numero legale e che i 18 punti non discussi e votati sono passati alla seconda convocazione del 12 ottobre; non è un verbale completo della seduta.",
  },
  agenda: {
    key: "agenda",
    label: "Ordine del giorno",
    value: councilOctober9Agenda,
    sourceStatus: "verificato",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Sintesi fedele dei 21 punti dell'allegato ufficiale; per protocolli, riferimenti e formulazione integrale consultare il documento.",
  },
  sourceLink: {
    key: "sourceLink",
    label: "Fonte",
    value: "Apri la convocazione ufficiale del Consiglio comunale",
    sourceStatus: "verificato",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Pubblicazione 2026/3221; copia acquisita e verificata tramite SHA-256 nel repository.",
  },
  liveStreaming: {
    key: "liveStreaming",
    label: "Streaming live",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Non rilevato nella fonte istituzionale; il replay editoriale di City One resta nella sezione contestuale e non valorizza questo campo.",
  },
  recording: {
    key: "recording",
    label: "Registrazione",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Non rilevata nella fonte istituzionale; il replay editoriale di City One non viene trattato come registrazione ufficiale.",
  },
  minutesOrReport: {
    key: "minutesOrReport",
    label: "Verbale o resoconto",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Non rilevato nella convocazione; eventuali pubblicazioni successive richiedono un controllo separato.",
  },
  lastCheckedAt: {
    key: "lastCheckedAt",
    label: "Ultimo controllo",
    value: COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT,
    sourceStatus: "verificato",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Controllo dell'allegato ufficiale, della copia archiviata e delle fonti contestuali; la finestra di ricerca resta aperta.",
  },
  dataLimits: {
    key: "dataLimits",
    label: "Limiti del dato",
    value: [
      "La prima convocazione è fissata al 9 ottobre 2026 alle 09:30; la seconda al 12 ottobre alle 10:30.",
      'La sede indicata è la Sala Consiliare "Renato Luisi", in via Sen. Arturo Perugini.',
      "L'avviso ufficiale 2026/3263 attesta lo svolgimento parziale e la sospensione per mancanza del numero legale, con passaggio alla seconda convocazione dei 18 punti non discussi e votati; non costituisce un verbale completo.",
      "Streaming istituzionale, registrazione istituzionale e verbale sono indicati come non rilevati, non come inesistenti.",
      "I sette articoli collegati, inclusi tre resoconti del 9 ottobre, restano fonti editoriali e non valorizzano campi, presenze, votazioni o risultati ufficiali.",
      "I tre replay di City One e LameziaTerme.it sono fonti editoriali esterne: non certificano programmazione istituzionale, completezza, presenze, votazioni o risultati.",
    ],
    sourceStatus: "parziale",
    sourceUrl: councilOctober9DocumentUrl,
    limit:
      "Verifica basata sulla convocazione ufficiale, sull'avviso ufficiale di seconda convocazione e su una ricerca contestuale ancora aperta.",
  },
};

const councilVerifiedSession: CouncilSessionV0 = {
  id: "albo-2026-2673-consiglio-comunale",
  kind: "council",
  isDemoFixture: false,
  provenance: councilProvenance,
  contextResearch: councilContextResearch,
  title: {
    key: "title",
    label: "Titolo",
    value: "Consiglio comunale — seduta del 13 agosto 2026",
    sourceStatus: "verificato",
    sourceUrl: councilCandidate.source.url,
    limit: `Titolo normalizzato dall'oggetto della pubblicazione ${councilCandidate.publicationNumber} e dalla data confermata dalla pubblicazione istituzionale 2026/2755.`,
  },
  scheduledAt: {
    key: "scheduledAt",
    label: "Data e ora",
    value: "2026-08-13",
    sourceStatus: "verificato",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "La data è indicata nella pubblicazione istituzionale 2026/2755; l'orario non è presente nella fonte e non viene ricavato dalla stampa.",
  },
  sessionStatus: {
    key: "sessionStatus",
    label: "Stato seduta",
    value: "svolta",
    sourceStatus: "verificato",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "La determinazione successiva richiama un debito approvato nella seduta del 13 agosto; non documenta presenze, durata o trattazione completa.",
  },
  agenda: {
    key: "agenda",
    label: "Ordine del giorno",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati ufficiali acquisiti; la fonte successiva conferma un solo punto e non viene usata per ricostruire l'elenco completo.",
  },
  sourceLink: {
    key: "sourceLink",
    label: "Fonte",
    value: "Apri l'evidenza istituzionale sulla seduta",
    sourceStatus: "verificato",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "La pubblicazione 2026/2755 conferma organo, data e approvazione di un debito; l'avviso originario 2026/2673 resta privo di allegato nell'export acquisito.",
  },
  liveStreaming: {
    key: "liveStreaming",
    label: "Streaming live",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati dell'avviso; il controllo dei canali video istituzionali resta separato.",
  },
  recording: {
    key: "recording",
    label: "Registrazione",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevata nei metadati dell'avviso; non equivale a dichiararne l'inesistenza.",
  },
  minutesOrReport: {
    key: "minutesOrReport",
    label: "Verbale o resoconto",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati acquisiti; una pubblicazione successiva richiede un controllo dedicato.",
  },
  lastCheckedAt: {
    key: "lastCheckedAt",
    label: "Ultimo controllo",
    value: COUNCIL_CONTEXT_RESEARCHED_AT,
    sourceStatus: "verificato",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "Controllo della nuova pubblicazione istituzionale e nuova ricerca di articoli e video nella finestra dal 6 al 20 agosto 2026.",
  },
  dataLimits: {
    key: "dataLimits",
    label: "Limiti del dato",
    value: [
      "Data e svolgimento sono confermati dalla pubblicazione istituzionale 2026/2755; l'orario resta da verificare.",
      "La fonte successiva documenta l'approvazione di un debito fuori bilancio, non l'ordine del giorno completo, le presenze o tutte le votazioni.",
      "L'avviso originario 2026/2673 non espone un allegato nell'export acquisito.",
      "La registrazione City One è copertura editoriale esterna e non una registrazione istituzionale.",
    ],
    sourceStatus: "parziale",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "Arricchimento prudenziale basato su una fonte istituzionale successiva; nessuna informazione editoriale completa i campi ufficiali mancanti.",
  },
};

export const councilSessionV0ReviewedRecords: readonly CouncilSessionV0[] = [
  septemberCommissionSession({
    id: "albo-2026-3262-commissione-v-2026-10-13",
    title: "V Commissione consiliare permanente — seduta del 13 ottobre 2026",
    scheduledAt: "2026-10-13T09:00:00+02:00",
    agenda: roadNetworkWorksRulesAgenda,
    candidate: commissionVOctober12And13Notice.candidate,
    provenance: commissionVOctober12And13Notice.provenance,
    contextResearch: october12To13CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della V Commissione, il 12 e il 13 ottobre 2026 alle 09:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3262-commissione-v-2026-10-12",
    title: "V Commissione consiliare permanente — seduta del 12 ottobre 2026",
    scheduledAt: "2026-10-12T09:00:00+02:00",
    agenda: municipalAssetsRegulationAgenda,
    candidate: commissionVOctober12And13Notice.candidate,
    provenance: commissionVOctober12And13Notice.provenance,
    contextResearch: october12To13CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della V Commissione, il 12 e il 13 ottobre 2026 alle 09:00.",
  }),
  councilOctober9Session,
  septemberCommissionSession({
    id: "albo-2026-3190-commissione-iii-2026-10-06",
    title: "III Commissione consiliare permanente — seduta del 6 ottobre 2026",
    scheduledAt: "2026-10-06T11:00:00+02:00",
    agenda: disabilityGuarantorAgenda,
    candidate: commissionIiiOctober5And6Notice.candidate,
    provenance: commissionIiiOctober5And6Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della III Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della III Commissione, il 5 e il 6 ottobre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3197-commissione-ii-2026-10-06",
    title: "II Commissione consiliare permanente — seduta del 6 ottobre 2026",
    scheduledAt: "2026-10-06T10:00:00+02:00",
    agenda: multiYearFinancialRebalancingAgenda,
    candidate: commissionIiOctober5And6Notice.candidate,
    provenance: commissionIiOctober5And6Notice.provenance,
    contextResearch: commissionIiOctober6RebalancingContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della II Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della II Commissione: 5 ottobre alle 12:00 e 6 ottobre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3197-commissione-ii-2026-10-05",
    title: "II Commissione consiliare permanente — seduta del 5 ottobre 2026",
    scheduledAt: "2026-10-05T12:00:00+02:00",
    agenda: courtJudgmentDebtsAgenda,
    candidate: commissionIiOctober5And6Notice.candidate,
    provenance: commissionIiOctober5And6Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della II Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della II Commissione: 5 ottobre alle 12:00 e 6 ottobre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3190-commissione-iii-2026-10-05",
    title: "III Commissione consiliare permanente — seduta del 5 ottobre 2026",
    scheduledAt: "2026-10-05T11:00:00+02:00",
    agenda: disabilityGuarantorAgenda,
    candidate: commissionIiiOctober5And6Notice.candidate,
    provenance: commissionIiiOctober5And6Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della III Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della III Commissione, il 5 e il 6 ottobre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3198-commissione-iv-2026-10-05",
    title: "IV Commissione consiliare permanente — seduta del 5 ottobre 2026",
    scheduledAt: "2026-10-05T10:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvOctober5Notice.candidate,
    provenance: commissionIvOctober5Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della IV Commissione",
    calendarSummary:
      "La convocazione programma una seduta della IV Commissione il 5 ottobre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3152-commissione-vi-2026-10-02",
    title: "VI Commissione consiliare permanente — seduta del 2 ottobre 2026",
    scheduledAt: "2026-10-02T11:00:00+02:00",
    agenda: proximityMarketSantEufemiaAgenda,
    candidate: commissionViOctober2Notice.candidate,
    provenance: commissionViOctober2Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della VI Commissione",
    calendarSummary:
      "La convocazione programma una seduta della VI Commissione il 2 ottobre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3157-commissione-iv-2026-10-02",
    title: "IV Commissione consiliare permanente — seduta del 2 ottobre 2026",
    scheduledAt: "2026-10-02T10:00:00+02:00",
    agenda: [
      "Regolamento comunale per la promozione della Street Art. Audizione dell'assessore dott.ssa Annalisa Spinelli.",
    ],
    candidate: commissionIvOctober1And2Notice.candidate,
    provenance: commissionIvOctober1And2Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione, il 1° e il 2 ottobre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3151-commissione-v-2026-10-02",
    title: "V Commissione consiliare permanente — seduta del 2 ottobre 2026",
    scheduledAt: "2026-10-02T09:00:00+02:00",
    agenda: roadNetworkWorksRulesAgenda,
    candidate: commissionVOctober1And2Notice.candidate,
    provenance: commissionVOctober1And2Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della V Commissione, il 1° e il 2 ottobre 2026 alle 09:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3129-commissione-iii-2026-10-01",
    title: "III Commissione consiliare permanente — seduta del 1° ottobre 2026",
    scheduledAt: "2026-10-01T11:00:00+02:00",
    agenda: disabilityGuarantorAgenda,
    candidate: commissionIiiSeptember29AndOctober1Notice.candidate,
    provenance: commissionIiiSeptember29AndOctober1Notice.provenance,
    contextResearch: september29ToOctober1CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della III Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della III Commissione: 29 settembre e 1° ottobre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3157-commissione-iv-2026-10-01",
    title: "IV Commissione consiliare permanente — seduta del 1° ottobre 2026",
    scheduledAt: "2026-10-01T10:00:00+02:00",
    agenda: municipalNurseriesAndSchoolMealsTariffsAgenda,
    candidate: commissionIvOctober1And2Notice.candidate,
    provenance: commissionIvOctober1And2Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione, il 1° e il 2 ottobre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3151-commissione-v-2026-10-01",
    title: "V Commissione consiliare permanente — seduta del 1° ottobre 2026",
    scheduledAt: "2026-10-01T09:00:00+02:00",
    agenda: municipalAssetsRegulationAgenda,
    candidate: commissionVOctober1And2Notice.candidate,
    provenance: commissionVOctober1And2Notice.provenance,
    contextResearch: october1To6CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della V Commissione, il 1° e il 2 ottobre 2026 alle 09:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3127-commissione-iv-2026-09-30",
    title:
      "IV Commissione consiliare permanente — seduta del 30 settembre 2026",
    scheduledAt: "2026-09-30T10:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvSeptember29And30Notice.candidate,
    provenance: commissionIvSeptember29And30Notice.provenance,
    contextResearch: september29ToOctober1CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione, il 29 e il 30 settembre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3090-commissione-v-2026-09-30",
    title: "V Commissione consiliare permanente — seduta del 30 settembre 2026",
    scheduledAt: "2026-09-30T09:00:00+02:00",
    agenda: roadNetworkWorksRulesAgenda,
    candidate: commissionVSeptember28To30Notice.candidate,
    provenance: commissionVSeptember28To30Notice.provenance,
    contextResearch: september24To30CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma tre sedute della V Commissione dal 28 al 30 settembre 2026; il 30 settembre è fissata alle 09:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3129-commissione-iii-2026-09-29",
    title:
      "III Commissione consiliare permanente — seduta del 29 settembre 2026",
    scheduledAt: "2026-09-29T11:00:00+02:00",
    agenda: wasteAbandonmentMeasuresAgenda,
    candidate: commissionIiiSeptember29AndOctober1Notice.candidate,
    provenance: commissionIiiSeptember29AndOctober1Notice.provenance,
    contextResearch: september29ToOctober1CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della III Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della III Commissione: 29 settembre e 1° ottobre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3127-commissione-iv-2026-09-29",
    title:
      "IV Commissione consiliare permanente — seduta del 29 settembre 2026",
    scheduledAt: "2026-09-29T10:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvSeptember29And30Notice.candidate,
    provenance: commissionIvSeptember29And30Notice.provenance,
    contextResearch: september29ToOctober1CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione, il 29 e il 30 settembre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3090-commissione-v-2026-09-29",
    title: "V Commissione consiliare permanente — seduta del 29 settembre 2026",
    scheduledAt: "2026-09-29T09:00:00+02:00",
    agenda: roadNetworkWorksRulesAgenda,
    candidate: commissionVSeptember28To30Notice.candidate,
    provenance: commissionVSeptember28To30Notice.provenance,
    contextResearch: september24To30CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma tre sedute della V Commissione dal 28 al 30 settembre 2026; il 29 settembre è fissata alle 09:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3091-commissione-iv-2026-09-28",
    title:
      "IV Commissione consiliare permanente — seduta del 28 settembre 2026",
    scheduledAt: "2026-09-28T10:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvSeptember28Notice.candidate,
    provenance: commissionIvSeptember28Notice.provenance,
    contextResearch: september24To30CommissionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della IV Commissione",
    calendarSummary:
      "La convocazione programma una seduta della IV Commissione il 28 settembre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3090-commissione-v-2026-09-28",
    title: "V Commissione consiliare permanente — seduta del 28 settembre 2026",
    scheduledAt: "2026-09-28T09:00:00+02:00",
    agenda: municipalAssetsRegulationAgenda,
    candidate: commissionVSeptember28To30Notice.candidate,
    provenance: commissionVSeptember28To30Notice.provenance,
    contextResearch: commissionVSeptember28ReuContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma tre sedute della V Commissione dal 28 al 30 settembre 2026; il 28 settembre è fissata alle 09:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3089-commissione-iii-2026-09-25",
    title:
      "III Commissione consiliare permanente — seduta del 25 settembre 2026",
    scheduledAt: "2026-09-25T12:00:00+02:00",
    agenda: disabilityGuarantorAgenda,
    candidate: commissionIiiSeptember25Notice.candidate,
    provenance: commissionIiiSeptember25Notice.provenance,
    contextResearch: september24To30CommissionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della III Commissione",
    calendarSummary:
      "La convocazione programma una seduta della III Commissione il 25 settembre 2026 alle 12:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3097-commissione-iv-2026-09-25",
    title:
      "IV Commissione consiliare permanente — seduta del 25 settembre 2026",
    scheduledAt: "2026-09-25T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvSeptember24And25Notice.candidate,
    provenance: commissionIvSeptember24And25Notice.provenance,
    contextResearch: september24To30CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione: 24 settembre alle 12:00 e 25 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3011-commissione-v-2026-09-25",
    title: "V Commissione consiliare permanente — seduta del 25 settembre 2026",
    scheduledAt: "2026-09-25T10:00:00+02:00",
    agenda: roadNetworkWorksRulesAgenda,
    candidate: commissionVSeptember22To25Notice.candidate,
    provenance: commissionVSeptember22To25Notice.provenance,
    contextResearch: commissionVSeptember25RoadWorksContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma quattro sedute della V Commissione dal 22 al 25 settembre 2026; il 25 settembre è fissata alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3097-commissione-iv-2026-09-24",
    title:
      "IV Commissione consiliare permanente — seduta del 24 settembre 2026",
    scheduledAt: "2026-09-24T12:00:00+02:00",
    agenda: schoolClimateMotionAgenda,
    candidate: commissionIvSeptember24And25Notice.candidate,
    provenance: commissionIvSeptember24And25Notice.provenance,
    contextResearch: september24To30CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione: 24 settembre alle 12:00 e 25 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3043-commissione-iii-2026-09-24",
    title:
      "III Commissione consiliare permanente — seduta del 24 settembre 2026",
    scheduledAt: "2026-09-24T11:00:00+02:00",
    agenda: hillsideWasteCollectionAgenda,
    candidate: commissionIiiSeptember24Notice.candidate,
    provenance: commissionIiiSeptember24Notice.provenance,
    contextResearch: september24CommissionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della III Commissione",
    calendarSummary:
      "La convocazione programma una seduta della III Commissione il 24 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3011-commissione-v-2026-09-24",
    title: "V Commissione consiliare permanente — seduta del 24 settembre 2026",
    scheduledAt: "2026-09-24T10:00:00+02:00",
    agenda: municipalAssetsRegulationAgenda,
    candidate: commissionVSeptember22To25Notice.candidate,
    provenance: commissionVSeptember22To25Notice.provenance,
    contextResearch: september22To25CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma quattro sedute della V Commissione dal 22 al 25 settembre 2026; il 24 settembre è fissata alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3011-commissione-v-2026-09-23",
    title: "V Commissione consiliare permanente — seduta del 23 settembre 2026",
    scheduledAt: "2026-09-23T12:00:00+02:00",
    agenda: roadNetworkWorksRulesAgenda,
    candidate: commissionVSeptember22To25Notice.candidate,
    provenance: commissionVSeptember22To25Notice.provenance,
    contextResearch: september22To25CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma quattro sedute della V Commissione dal 22 al 25 settembre 2026; il 23 settembre è fissata alle 12:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3012-commissione-iv-2026-09-23",
    title:
      "IV Commissione consiliare permanente — seduta del 23 settembre 2026",
    scheduledAt: "2026-09-23T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvSeptember22And23Notice.candidate,
    provenance: commissionIvSeptember22And23Notice.provenance,
    contextResearch: september22To25CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione: 22 settembre alle 10:00 e 23 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3011-commissione-v-2026-09-22",
    title: "V Commissione consiliare permanente — seduta del 22 settembre 2026",
    scheduledAt: "2026-09-22T11:00:00+02:00",
    agenda: municipalAssetsRegulationAgenda,
    candidate: commissionVSeptember22To25Notice.candidate,
    provenance: commissionVSeptember22To25Notice.provenance,
    contextResearch: september22To25CommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della V Commissione",
    calendarSummary:
      "La stessa convocazione programma quattro sedute della V Commissione dal 22 al 25 settembre 2026; il 22 settembre è fissata alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3012-commissione-iv-2026-09-22",
    title:
      "IV Commissione consiliare permanente — seduta del 22 settembre 2026",
    scheduledAt: "2026-09-22T10:00:00+02:00",
    agenda: streetArtGiuliaUrbanaAgenda,
    candidate: commissionIvSeptember22And23Notice.candidate,
    provenance: commissionIvSeptember22And23Notice.provenance,
    contextResearch: commissionIvSeptember22StreetArtContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione: 22 settembre alle 10:00 e 23 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-3001-commissione-iii-2026-09-21",
    title:
      "III Commissione consiliare permanente — seduta del 21 settembre 2026",
    scheduledAt: "2026-09-21T10:30:00+02:00",
    agenda: wasteAbandonmentMotionAgenda,
    candidate: commissionIiiSeptember21Notice.candidate,
    provenance: commissionIiiSeptember21Notice.provenance,
    contextResearch: commissionIiiWasteMotionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della III Commissione",
    calendarSummary:
      "La convocazione programma una seduta della III Commissione il 21 settembre 2026 alle 10:30.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2986-commissione-v-2026-09-21",
    title: "V Commissione consiliare permanente — seduta del 21 settembre 2026",
    scheduledAt: "2026-09-21T09:30:00+02:00",
    agenda: workPlanningAgenda,
    candidate: commissionVSeptember21Notice.candidate,
    provenance: commissionVSeptember21Notice.provenance,
    contextResearch: lateSeptemberCommissionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della V Commissione",
    calendarSummary:
      "La convocazione programma una seduta della V Commissione il 21 settembre 2026 alle 09:30.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2960-commissione-iii-2026-09-18",
    title:
      "III Commissione consiliare permanente — seduta del 18 settembre 2026",
    scheduledAt: "2026-09-18T12:00:00+02:00",
    agenda: disabilityGuarantorAgenda,
    candidate: commissionIiiSeptember18Notice.candidate,
    provenance: commissionIiiSeptember18Notice.provenance,
    contextResearch: lateSeptemberCommissionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della III Commissione",
    calendarSummary:
      "La convocazione programma una seduta della III Commissione il 18 settembre 2026 alle 12:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2981-commissione-iv-2026-09-18",
    title:
      "IV Commissione consiliare permanente — seduta del 18 settembre 2026",
    scheduledAt: "2026-09-18T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvSeptemberCalendarNotice.candidate,
    provenance: commissionIvSeptemberCalendarNotice.provenance,
    contextResearch: lateSeptemberCommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione, il 17 e il 18 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2959-commissione-ii-2026-09-18",
    title:
      "II Commissione consiliare permanente — seduta del 18 settembre 2026",
    scheduledAt: "2026-09-18T10:00:00+02:00",
    agenda: internalControlsAgenda,
    candidate: commissionIiSeptemberCalendarNotice.candidate,
    provenance: commissionIiSeptemberCalendarNotice.provenance,
    contextResearch: lateSeptemberCommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della II Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della II Commissione: 17 settembre alle 15:30 e 18 settembre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2971-commissione-i-2026-09-17",
    title: "I Commissione consiliare permanente — seduta del 17 settembre 2026",
    scheduledAt: "2026-09-17T16:30:00+02:00",
    agenda: legalDisputesAgenda,
    candidate: commissionISeptemberCalendarNotice.candidate,
    provenance: commissionISeptemberCalendarNotice.provenance,
    contextResearch: commissionISeptember17ContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della I Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della I Commissione: 16 settembre alle 12:00 e 17 settembre 2026 alle 16:30.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2959-commissione-ii-2026-09-17",
    title:
      "II Commissione consiliare permanente — seduta del 17 settembre 2026",
    scheduledAt: "2026-09-17T15:30:00+02:00",
    agenda: courtJudgmentDebtsAgenda,
    candidate: commissionIiSeptemberCalendarNotice.candidate,
    provenance: commissionIiSeptemberCalendarNotice.provenance,
    contextResearch: lateSeptemberCommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della II Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della II Commissione: 17 settembre alle 15:30 e 18 settembre 2026 alle 10:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2953-commissione-v-2026-09-17",
    title: "V Commissione consiliare permanente — seduta del 17 settembre 2026",
    scheduledAt: "2026-09-17T12:00:00+02:00",
    agenda: commissionPresidentElectionAgenda,
    candidate: commissionVSeptember17Notice.candidate,
    provenance: commissionVSeptember17Notice.provenance,
    contextResearch: lateSeptemberCommissionContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della V Commissione",
    calendarSummary:
      "La convocazione programma una seduta della V Commissione il 17 settembre 2026 alle 12:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2981-commissione-iv-2026-09-17",
    title:
      "IV Commissione consiliare permanente — seduta del 17 settembre 2026",
    scheduledAt: "2026-09-17T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvSeptemberCalendarNotice.candidate,
    provenance: commissionIvSeptemberCalendarNotice.provenance,
    contextResearch: lateSeptemberCommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione, il 17 e il 18 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2971-commissione-i-2026-09-16",
    title: "I Commissione consiliare permanente — seduta del 16 settembre 2026",
    scheduledAt: "2026-09-16T12:00:00+02:00",
    agenda: taxiRegulationAgenda,
    candidate: commissionISeptemberCalendarNotice.candidate,
    provenance: commissionISeptemberCalendarNotice.provenance,
    contextResearch: lateSeptemberCommissionContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della I Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della I Commissione: 16 settembre alle 12:00 e 17 settembre 2026 alle 16:30.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2925-commissione-iv-2026-09-16",
    title:
      "IV Commissione consiliare permanente — seduta del 16 settembre 2026",
    scheduledAt: "2026-09-16T11:00:00+02:00",
    agenda: streetArtIcicaAgenda,
    candidate: commissionIvMidSeptemberCandidate,
    provenance: commissionIvMidSeptemberProvenance,
    contextResearch: commissionIvMidSeptemberContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma tre sedute della IV Commissione: 14 settembre alle 11:00, 15 settembre alle 12:00 e 16 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2925-commissione-iv-2026-09-15",
    title:
      "IV Commissione consiliare permanente — seduta del 15 settembre 2026",
    scheduledAt: "2026-09-15T12:00:00+02:00",
    agenda: municipalNurseriesAgenda,
    candidate: commissionIvMidSeptemberCandidate,
    provenance: commissionIvMidSeptemberProvenance,
    contextResearch: commissionIvMunicipalNurseriesContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma tre sedute della IV Commissione: 14 settembre alle 11:00, 15 settembre alle 12:00 e 16 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2926-commissione-iii-2026-09-15",
    title:
      "III Commissione consiliare permanente — seduta del 15 settembre 2026",
    scheduledAt: "2026-09-15T11:00:00+02:00",
    agenda: disabilityGuarantorAgenda,
    candidate: commissionIiiMidSeptemberCandidate,
    provenance: commissionIiiMidSeptemberProvenance,
    contextResearch: commissionIiiGuarantorContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della III Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della III Commissione: 14 settembre alle 12:00 e 15 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2926-commissione-iii-2026-09-14",
    title:
      "III Commissione consiliare permanente — seduta del 14 settembre 2026",
    scheduledAt: "2026-09-14T12:00:00+02:00",
    agenda: disabilityGuarantorAgenda,
    candidate: commissionIiiMidSeptemberCandidate,
    provenance: commissionIiiMidSeptemberProvenance,
    contextResearch: commissionIiiGuarantorContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della III Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della III Commissione: 14 settembre alle 12:00 e 15 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2925-commissione-iv-2026-09-14",
    title:
      "IV Commissione consiliare permanente — seduta del 14 settembre 2026",
    scheduledAt: "2026-09-14T11:00:00+02:00",
    agenda: schoolTransportAgenda,
    candidate: commissionIvMidSeptemberCandidate,
    provenance: commissionIvMidSeptemberProvenance,
    contextResearch: commissionIvSchoolTransportContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma tre sedute della IV Commissione: 14 settembre alle 11:00, 15 settembre alle 12:00 e 16 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2879-commissione-iii-2026-09-11",
    title:
      "III Commissione consiliare permanente — seduta dell'11 settembre 2026",
    scheduledAt: "2026-09-11T12:00:00+02:00",
    agenda: disabilityGuarantorAgenda,
    candidate: commissionIiiGuarantorCandidate,
    provenance: commissionIiiGuarantorProvenance,
    contextResearch: commissionIiiGuarantorContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della III Commissione",
    calendarSummary:
      "La convocazione programma una seduta della III Commissione l'11 settembre 2026 alle 12:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2860-commissione-iv-2026-09-11",
    title:
      "IV Commissione consiliare permanente — seduta dell'11 settembre 2026",
    scheduledAt: "2026-09-11T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvLaterCandidate,
    provenance: commissionIvLaterProvenance,
    contextResearch: commissionIvStreetArtContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma quattro sedute: 8 settembre alle 12:00 e 9, 10 e 11 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2860-commissione-iv-2026-09-10",
    title:
      "IV Commissione consiliare permanente — seduta del 10 settembre 2026",
    scheduledAt: "2026-09-10T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvLaterCandidate,
    provenance: commissionIvLaterProvenance,
    contextResearch: commissionIvStreetArtContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma quattro sedute: 8 settembre alle 12:00 e 9, 10 e 11 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2860-commissione-iv-2026-09-09",
    title: "IV Commissione consiliare permanente — seduta del 9 settembre 2026",
    scheduledAt: "2026-09-09T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvLaterCandidate,
    provenance: commissionIvLaterProvenance,
    contextResearch: commissionIvStreetArtContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma quattro sedute: 8 settembre alle 12:00 e 9, 10 e 11 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2860-commissione-iv-2026-09-08",
    title:
      "IV Commissione consiliare permanente — seduta dell'8 settembre 2026",
    scheduledAt: "2026-09-08T12:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvLaterCandidate,
    provenance: commissionIvLaterProvenance,
    contextResearch: commissionIvStreetArtContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma quattro sedute: 8 settembre alle 12:00 e 9, 10 e 11 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2859-commissione-vi-2026-09-08",
    title:
      "VI Commissione consiliare permanente — seduta dell'8 settembre 2026",
    scheduledAt: "2026-09-08T11:00:00+02:00",
    agenda: decoAgenda,
    candidate: commissionViSeptemberCandidate,
    provenance: commissionViSeptemberProvenance,
    contextResearch: commissionViSeptemberContextResearch,
    sourceLinkLabel: "Apri la convocazione ufficiale della VI Commissione",
    calendarSummary:
      "La convocazione programma una seduta della VI Commissione l'8 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2861-commissioni-iii-iv-2026-09-07",
    title:
      "III e IV Commissioni consiliari permanenti — seduta congiunta del 7 settembre 2026",
    scheduledAt: "2026-09-07T12:00:00+02:00",
    agenda: sportDisabilityAgenda,
    candidate: commissionsIiiIvJointCandidate,
    provenance: commissionsIiiIvJointProvenance,
    contextResearch: commissionsIiiIvJointContextResearch,
    sourceLinkLabel:
      "Apri la convocazione ufficiale della seduta congiunta III–IV",
    calendarSummary:
      "La convocazione programma una seduta congiunta della III e IV Commissione il 7 settembre 2026 alle 12:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2840-commissione-iv-2026-09-04",
    title: "IV Commissione consiliare permanente — seduta del 4 settembre 2026",
    scheduledAt: "2026-09-04T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvEarlyCandidate,
    provenance: commissionIvEarlyProvenance,
    contextResearch: commissionIvStreetArtContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione, il 3 e il 4 settembre 2026 alle 11:00.",
  }),
  septemberCommissionSession({
    id: "albo-2026-2840-commissione-iv-2026-09-03",
    title: "IV Commissione consiliare permanente — seduta del 3 settembre 2026",
    scheduledAt: "2026-09-03T11:00:00+02:00",
    agenda: streetArtAgenda,
    candidate: commissionIvEarlyCandidate,
    provenance: commissionIvEarlyProvenance,
    contextResearch: commissionIvStreetArtContextResearch,
    sourceLinkLabel: "Apri il calendario ufficiale della IV Commissione",
    calendarSummary:
      "La stessa convocazione programma due sedute della IV Commissione, il 3 e il 4 settembre 2026 alle 11:00.",
  }),
  commissionViSession("2026-09-04"),
  commissionViSession("2026-09-01"),
  commissionSession("2026-08-11"),
  commissionSession("2026-08-10"),
  councilVerifiedSession,
];

const reviewedRecordsById = new Map(
  councilSessionV0ReviewedRecords.map((session) => [session.id, session]),
);

export function findCouncilSessionV0ReviewedRecord(
  id: string,
): CouncilSessionV0 | undefined {
  return reviewedRecordsById.get(id);
}
