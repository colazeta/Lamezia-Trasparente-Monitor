Warning: truncated output (original token count: 83085)
Total output lines: 5522

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
const COMMISSION_I_OCTOBER_22_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-consiglieri-di-opposizione-lavori-fermi-in-i-commissione-citta-non-puo-continuare-a-pagare-scontri-nel-centrodestra.html";
const COMMISSION_I_OCTOBER_22_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/10/22/lamezia-terme-stallo-in-i-commissione-il-centrodestra-blocca-i-lavori-e-dimentica-la-citta/";
const COMMISSION_I_OCTOBER_22_LAMEZIA_OGGI_URL =
  "https://www.lameziaoggi.it/lamezia-terme/2026/10/22/lamezia-consiglieri-di-opposizione-lavori-fermi-in-i-commissione-citta-non-puo-essere-compromessa/";
const COMMISSION_I_OCTOBER_23_NTACALABRIA_URL =
  "https://www.ntacalabria.it/lamezia-terme/a-lamezia-terme-scontro-politico-sulla-sfiducia-a-cristiano.html";
const COMMISSION_I_OCTOBER_23_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/10/23/lamezia-scontro-sulla-sfiducia-a-cristiano-lopposizione-basta-teatrini-ba6ad80b-b52f-49e0-abb8-aead22676d13/";
const COMMISSION_I_OCTOBER_22_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/lamezia-scontro-in-commissione-centrodestra-blocca-istituzioni/";
const COMMISSION_II_OCTOBER_26_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-settimana-cruciale-per-la-commissione-bilancio-prima-del-consiglio-su-piano-di-riequilibrio-e-consolidato.html";
const COMMISSION_II_OCTOBER_25_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/10/25/oltre-a-consolidato-2025-e-piano-di-riequilibrio-malumori-politici-e-question-time-ricorsivi-in-via-perugini/69907/amp/";
const COMMISSION_II_OCTOBER_27_NTACALABRIA_URL =
  "https://www.ntacalabria.it/lamezia-terme/a-lamezia-terme-bilancio-consolidato-e-riequilibrio.html";
const COMMISSION_II_OCTOBER_27_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/cronaca/2026/10/27/lamezia-consolidato-e-piano-di-riequilibrio-infiammano-lautunno-politico-0d9cc6d7-3b68-449b-8f5a-e166a8faad22/";
const COMMISSION_II_OCTOBER_27_ITALY_TODAY_URL =
  "https://italytoday.net/lamezia-consolidato-e-piano-di-riequilibrio-infiammano-lautunno-politico/";
const COMMISSION_II_OCTOBER_27_TV6ONAIR_URL =
  "https://tv6onair.com/tv6onair-lamezia-solidificato-e-piano-in-riequilibrio-infiammano-lautunno-politico/";
const PROGETTO_CIVICO_OCTOBER_31_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/lamezia-progetto-civico-attacca-sul-riequilibrio-dove-finita-politica/";
const PROGETTO_CIVICO_OCTOBER_31_LAMETINO_URL =
  "https://www.lametino.it/ultimora/piano-di-riequilibrio-progetto-civico-italia-lamezia-merita-trasparenza.html";
const PROGETTO_CIVICO_OCTOBER_31_CORRIERE_LAMEZIA_URL =
  "https://www.corrieredilamezia.it/politica/2026_10_31/progetto-civico-italia-lamezia-terme-piano-di-riequilibrio-le-decisioni-non-si-prendono-piu-nei-luoghi-della-politica-ma-dove-e-finita-la-politica_67991/";
const SCORDOVILLO_OPEN_COUNCIL_OCTOBER_28_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/10/28/lamezia-consiglio-comunale-aperto-sullo-sgombero-di-scordovillo-18a052db-3c86-4127-9b75-a085d97241e1/";
const SCORDOVILLO_OPEN_COUNCIL_OCTOBER_30_TV6ONAIR_URL =
  "https://tv6onair.com/tv6onair-lamezia-insegnamento-schiuso-sullo-che-scordovillo/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_10_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-il-19-novembre-consiglio-comunale-aperto-sul-superamento-del-campo-rom-di-scordovillo.html";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_10_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/11/10/scordovillo-convocato-il-consiglio-comunale-aperto-soddisfazione-di-pd-azione-e-per-vivere-bene/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_10_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/lamezia-il-19-novembre-consiglio-comunale-aperto-dedicato-scordovillo/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_10_CORRIERE_LAMEZIA_URL =
  "https://www.corrieredilamezia.it/politica/2026_11_10/lamezia-il-19-novembre-consiglio-comunale-aperto-dedicato-a-scordovillo_68223/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_11_NTACALABRIA_URL =
  "https://www.ntacalabria.it/lamezia-terme/lamezia-consiglio-comunale-sgombero-scordovillo.html";
const SCORDOVILLO_NOVEMBER_14_GIANTURCO_LAMETINO_URL =
  "https://www.lametino.it/ultimora/gianturco-dopo-aggressione-non-mi-faccio-intimidire-continuero-a-lavorare-per-lamezia-e-per-superamento-del-campo-rom.html";
const SCORDOVILLO_NOVEMBER_14_GIANTURCO_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/gianturco-dopo-laggressione-avanti-sul-superamento-di-scordovillo/";
const SCORDOVILLO_NOVEMBER_14_GIANTURCO_CATANZARO_CHANNEL_URL =
  "https://www.catanzarochannel.it/cronaca/aggressione-in-comune-a-lamezia-gianturco-non-arretra-non-mi-fermeranno-avanti-sul-campo-rom-ig85f8d6";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_13_ANSA_URL =
  "https://www.ansa.it/calabria/notizie/2026/11/13/aggredito-nella-sede-del-comune-lassessore-al-welfare-di-lamezia-terme_a57528d9-35a9-426a-8bc6-30b27f38053b.html";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_13_ANSA_VIDEO_URL =
  "https://videoembed.ansa.it/sito/notizie/economia/pmi/2026/11/13/aggredito-nella-sede-del-comune-lassessore-al-welfare-di-lamezia-terme_30461b08-8ae3-4a42-a5a4-749f2bc619b6.html";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_13_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/11/13/assessore-gianturco-aggredito-in-comune-10-giorni-di-prognosi/70272/amp/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_13_CORRIERE_CALABRIA_URL =
  "https://www.corrieredellacalabria.it/2026/11/13/lamezia-aggressione-assessore-gianturco-comune-scordovillo/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_13_NOIDICALABRIA_URL =
  "https://noidicalabria.it/lamezia-aggredito-in-comune-lassessore-al-welfare-gianturco-prognosi-di-10-giorni/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_14_CITYNOW_URL =
  "https://www.citynow.it/lamezia-terme-aggredito-assessore-gianturco-comune-scordovillo/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_14_CITY_ONE_REACTIONS_URL =
  "https://cityonelamezia.it/2026/11/14/assessore-mimmo-gianturco-aggredito-nella-sede-del-comune/";
const SCORDOVILLO_NOVEMBER_16_CITY_ONE_VIDEO_URL =
  "https://www.youtube.com/watch?v=kHUfWP41N8c";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_18_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/11/18/sgombero-di-scordovillo-al-centro-dellennesimo-consiglio-comunale-aperto-simbolico-in-via-perugini/70248/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_18_LAMETINO_URL =
  "https://www.lametino.it/ultimora/prosegue-sgombero-campo-rom-di-scordovillo-trasferite-altre-22-persone-e-abbattute-4-baracche-domani-consiglio-comunale-aperto.html";
const SCORDOVILLO_NOVEMBER_18_LAMEZIAINFORMA_PREFETTURA_URL =
  "https://www.lameziainforma.it/cronaca/2026/11/18/dal-campo-rom-di-scordovillo-altre-22-persone-in-uscita-demolite-4-baracche/70330/";
const SCORDOVILLO_NOVEMBER_18_CITY_ONE_PREFETTURA_URL =
  "https://cityonelamezia.it/2026/11/18/campo-rom-di-scordovillo-proseguono-le-operazioni-di-abbattimento-delle-baracche-e-di-delocalizzazione-dei-rom/";
const SCORDOVILLO_NOVEMBER_19_NOIDICALABRIA_PREFETTURA_URL =
  "https://noidicalabria.it/il-campo-di-scordovillo-trasferiti-altri-22-residenti-e-abbattute-quattro-baracche/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_11_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/11/11/lamezia-sgombero-del-campo-di-scordovillo-in-consiglio-comunale-si-fara-il-punto-5024f2a2-1888-4bf3-ac9d-df764ccc6713/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_13_IL_DISPACCIO_URL =
  "https://ildispaccio.it/calabria/catanzaro/2026/11/13/aggredito-nella-sede-del-comune-lassessore-al-welfare-di-lamezia-terme-mimmo-gianturco";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_19_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-al-via-i-lavori-del-consiglio-comunale-aperto-sullo-sgombero-del-campo-rom.html";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_19_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/11/19/su-scordovillo-soddisfatta-la-voglia-di-conoscenza-del-consiglio-comunale-degli-atti-amministrativi-non-propri/70346/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_19_LAC_URL =
  "https://www.lacnews24.it/politica/campo-rom-di-scordovillo-a-lamezia-un-consiglio-comunale-aperto-per-fare-il-punto-sullo-sgombero-nzz8u4u7";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_19_LAMEZIATERME_RECAP_URL =
  "https://www.lameziaterme.it/scordovillo-scintille-in-aula-manca-chiarezza-murone-respinge-accuse/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_19_CITY_ONE_RECAP_URL =
  "https://cityonelamezia.it/2026/11/19/lamezia-smantellamento-scordovillo-opposizione-e-sindaci-chiedono-maggiore-coinvolgimento/";
const SCORDOVILLO_NOVEMBER_20_FUTURO_NAZIONALE_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/11/20/presunta-aggressione-allassessore-gianturco-gravi-le-parole-del-sindaco-murone-chiarisca-a-chi-si-riferiva/";
const SCORDOVILLO_NOVEMBER_20_FUTURO_NAZIONALE_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-futuro-nazionale-su-presunta-aggressione-a-gianturco-sindaco-chiarisca-suo-riferimento-ad-allarmismi.html";
const SCORDOVILLO_NOVEMBER_20_FUTURO_NAZIONALE_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/presunta-aggressione-assessore-gianturco-gravi-le-parole-del-sindaco-murone/";
const SCORDOVILLO_NOVEMBER_20_NTACALABRIA_RECAP_URL =
  "https://www.ntacalabria.it/lamezia-terme/dossier-scordovillo-a-lamezia-assenti-i-protagonisti-chiave.html";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_19_LAMEZIATERME_FURGIUELE_URL =
  "https://www.lameziaterme.it/scordovillo-furgiuele-non-coinvolto-nelle-fasi-operative/";
const SCORDOVILLO_OPEN_COUNCIL_NOVEMBER_19_ZOOM24_URL =
  "https://www.zoom24.it/news/177322495494/campo-rom-calabria-trasferiti";
const SCORDOVILLO_NOVEMBER_19_CITY_ONE_LIVE_URL =
  "https://www.youtube.com/watch?v=BZYuyK6nhbw";
const SCORDOVILLO_NOVEMBER_19_CORRIERE_CALABRIA_CLASH_URL =
  "https://www.corrieredellacalabria.it/2026/11/19/lamezia-scordovillo-scontro-consiglio-comunale-lo-moro-murone/";
const SCORDOVILLO_NOVEMBER_19_CORRIERE_CALABRIA_GIANTURCO_VIDEO_URL =
  "https://www.corrieredellacalabria.it/2026/11/19/lamezia-scordovillo-gianturco-futuro-inclusione-sociale/";
const SCORDOVILLO_NOVEMBER_19_CORRIERE_CALABRIA_TARANTINO_VIDEO_URL =
  "https://www.corrieredellacalabria.it/2026/11/19/lamezia-campo-rom-scordovillo-chiusura-definitiva-2027/";
const COMMISSION_NOVEMBER_17_PEDESTRIAN_AREA_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/istituzione/2026/11/16/a-lamezia-terme-its-beginning-to-look-a-lot-like-christmas-in-attesa-di-sapere-quanto-e-come/70303/";
const COMMISSION_I_NOVEMBER_18_CORRIERE_LAMEZIA_URL =
  "https://www.corrieredilamezia.it/politica/2026_11_18/lamezia-futuro-nazionale-due-commissioni-bloccate-facendo-mancare-il-numero-legale-a-pagare-sono-i-cittadini_68441/";
const COMMISSION_I_NOVEMBER_18_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/11/18/lamezia-futuro-nazionale-attacca-la-maggioranza-commissioni-paralizzate-e-guerriglia-politica/";
const COUNCIL_NOVEMBER_3_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-il-3-novembre-consiglio-comunale-fra-i-punti-approvazione-del-bilancio-consolidato-e-del-piano-di-riequilibrio.html";
const COUNCIL_NOVEMBER_3_AUDITORS_LAMETINO_URL =
  "https://www.lametino.it/ultimora/lamezia-parere-favorevole-dei-revisori-al-piano-di-riequilibrio-ma-condizionato-da-severo-monitoraggio-trimestrale.html";
const COUNCIL_NOVEMBER_3_MASCARO_LAMETINO_URL =
  "https://www.lametino.it/ultimora/lamezia-mascaro-dubbi-su-legittimita-piano-di-riequilibrio-invito-a-revocare-la-delibera.html";
const COUNCIL_NOVEMBER_3_MASCARO_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/10/30/conti-del-comune-mascaro-attacca-nessuno-squilibrio-strutturale/";
const COUNCIL_NOVEMBER_3_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/10/31/comune-di-lamezia-terme-consolidato-e-piano-di-riequilibrio-appuntamento-decisivo-per-lente-d647362e-31d0-4e1e-a40d-39d6c1eee2cf/";
const COUNCIL_NOVEMBER_3_TV6ONAIR_URL =
  "https://tv6onair.com/tv6onair-comune-per-lamezia-terme-cementato-e-piano-per-riequilibrio-colloquio-attraverso-lente/";
const COUNCIL_NOVEMBER_3_ITALY_TODAY_URL =
  "https://italytoday.net/comune-di-lamezia-terme-consolidato-e-piano-di-riequilibrio-appuntamento-decisivo-per-lente/";
const COUNCIL_NOVEMBER_3_FINANCIAL_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/11/01/comune-di-lamezia-futuro-finanziario-incerto-tra-disavanzo-e-nodi-ancora-irrisolti-dc4fb2c5-ef12-40b5-aa5b-40e65ee573c8/";
const COUNCIL_NOVEMBER_3_FINANCIAL_NTACALABRIA_URL =
  "https://www.ntacalabria.it/lamezia-terme/futuro-finanziario-incerto-a-lamezia-terme-per-il-comune.html";
const COUNCIL_NOVEMBER_3_VOTE_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/11/03/lamezia-consiglio-comunale-sul-bilancio-oggi-il-voto-che-ipoteca-il-futuro-della-citta-5021e998-ea08-40ba-b4af-28e423312b32/";
const COUNCIL_NOVEMBER_3_VOTE_ITALY_TODAY_URL =
  "https://italytoday.net/lamezia-consiglio-comunale-sul-bilancio-oggi-il-voto-che-ipoteca-il-futuro-della-citta/";
const COUNCIL_NOVEMBER_3_FDI_LAMETINO_URL =
  "https://www.lametino.it/ultime/fratelli-ditalia-lamezia-presenta-una-mozione-a-sostegno-delle-forze-dellordine-contro-ogni-forma-di-violenza-e-intimidazione.html";
const COUNCIL_NOVEMBER_3_FDI_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/fratelli-italia-lamezia-mozione-sostegno-delle-forze-ordine/";
const COUNCIL_NOVEMBER_3_FDI_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/10/30/lamezia-terme-fratelli-ditalia-presenta-una-mozione-a-sostegno-delle-forze-dellordine/";
const COUNCIL_NOVEMBER_3_FDI_IL_DISPACCIO_URL =
  "https://ildispaccio.it/calabria/catanzaro/2026/10/30/fratelli-ditalia-lamezia-terme-presenta-una-mozione-a-sostegno-delle-forze-dellordine-e-contro-ogni-forma-di-violenza-e-intimidazione";
const COUNCIL_NOVEMBER_3_FDI_LA_NOVITA_URL =
  "https://lanovitaonline.it/lamezia-terme-fratelli-ditalia-porta-in-consiglio-una-mozione-a-sostegno-delle-forze-dellordine/";
const COUNCIL_NOVEMBER_3_FDI_CORRIERE_URL =
  "https://www.corrieredilamezia.it/politica/2026_10_30/fratelli-ditalia-lamezia-terme-presenta-una-mozione-a-sostegno-delle-forze-dellordine-e-contro-ogni-forma-di-violenza-e-intimidazione_67966/";
const COUNCIL_NOVEMBER_3_MASI_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-masi-pd-legalita-non-vuol-dire-propaganda-basta-criminalizzare-lavoratori-e-studenti.html";
const COUNCIL_NOVEMBER_3_MASI_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/10/31/masi-a-fdi-legalita-non-vuol-dire-propaganda-basta-criminalizzare-lavoratori-e-studenti/";
const COUNCIL_NOVEMBER_3_MASI_LA_NOVITA_URL =
  "https://lanovitaonline.it/lamezia-il-pd-attacca-fratelli-ditalia-legalita-non-vuol-dire-propaganda-basta-criminalizzare-lavoratori-e-studenti/";
const COUNCIL_NOVEMBER_3_PROGETTO_CIVICO_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/11/01/piano-di-riequilibrio-le-decisioni-non-si-prendono-piu-nei-luoghi-della-politica-ma-dove-e-finita-la-politica/";
const COUNCIL_NOVEMBER_3_REPORT_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-il-consiglio-comunale-approva-il-piano-di-riequilibrio-10-anni-per-risanare-lente.html";
const COUNCIL_NOVEMBER_3_REPORT_ANSA_URL =
  "https://www.ansa.it/calabria/notizie/2026/11/03/il-consiglio-comunale-di-lamezia-approva-il-piano-di-riequilibrio_9ec0c0d9-1469-428d-b394-557dc25388d6.html";
const COUNCIL_NOVEMBER_3_REPORT_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/consiglio-comunale-lamezia-approva-piano-riequilibrio/";
const COUNCIL_NOVEMBER_3_REPORT_ESSETV_URL =
  "https://www.essetvnews.it/2026/11/03/il-consiglio-comunale-di-lamezia-approva-il-piano-di-riequilibrio/";
const COUNCIL_NOVEMBER_3_REPORT_CALABRIA7_URL =
  "https://calabria7.news/politica/il-comune-di-lamezia-prova-a-scongiurare-il-dissesto-piano-decennale-per-il-risanamento-decisivo-il-parere-della-corte-dei-conti/";
const COUNCIL_NOVEMBER_3_REPORT_REGGIOTV_URL =
  "https://origin.reggiotv.it/notizie/attualita/136987/lamezia-terme-il-consiglio-comunale-approva-il-piano-di-riequilibrio-finanziario";
const COUNCIL_NOVEMBER_3_REPORT_CALABRIA_TRIBUNE_URL =
  "https://www.calabriatribune.it/2026/11/03/lamezia-terme-approvato-il-piano-di-riequilibrio-dal-consiglio-comunale/";
const COUNCIL_NOVEMBER_3_VESCIO_FACEBOOK_VIDEO_URL =
  "https://www.facebook.com/100063686725609/videos/1134845932760709/";
const COUNCIL_NOVEMBER_3_LO_MORO_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-lo-moro-su-piano-di-riequilibrio-scelta-grave-che-meritava-maggiore-coraggio-e-trasparenza.html";
const MUNICIPAL_ALBO_DOCUMENTS_URL =
  "https://www.comune.lamezia-terme.cz.it/it/documenti_pubblici/atti-di-albo-pretorio";
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
const COUNCIL_OCTOBER_12_CITY_ONE_SHORT_LIVE_URL =
  "https://www.youtube.com/watch?v=cO_x2MgOatg";
const COUNCIL_OCTOBER_12_CITY_ONE_LIVE_URL =
  "https://www.youtube.com/watch?v=38oLusBfODw";
const COUNCIL_OCTOBER_12_CITY_ONE_FACEBOOK_LIVE_URL =
  "https://www.facebook.com/cityonetv/videos/consiglio-comunale/1639489530950538/";
const COUNCIL_OCTOBER_9_CITY_ONE_FACEBOOK_LIVE_URL =
  "https://www.facebook.com/cityonetv/videos/consiglio-comunale/935130015986793/";
const COUNCIL_OCTOBER_9_LAMEZIATERME_EXCERPT_URL =
  "https://www.facebook.com/lameziatermeit/videos/consiglio-comunale-9-ottobre-2026/979266201889411/";
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
const COUNCIL_OCTOBER_9_REPORT_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/10/09/confermato-daffina-come-presidente-del-collegio-dei-revisori-dei-conti-consiglio-comunale-senza-altri-esiti/69647/";
const COUNCIL_OCTOBER_9_REPORT_CORRIERE_CALABRIA_URL =
  "https://www.corrieredellacalabria.it/2026/10/10/lamezia-murone-futuro-nazionale-scontro-consiglio-numero-legale-maggioranza/";
const COUNCIL_OCTOBER_9_REPORT_GAZZETTA_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/10/10/comune-di-lamezia-collegio-dei-revisori-dei-conti-daffina-confermato-presidente-fbf4810c-cacb-48ed-adbc-6bfc403487fe/";
const COUNCIL_OCTOBER_12_USB_LAMETINO_URL =
  "https://www.lametino.it/ultimora/lamezia-usb-taxi-proclama-stato-di-agitazione-lunedi-in-consiglio-comunale-per-chiedere-nuovo-regolamento.html";
const COUNCIL_OCTOBER_12_USB_CALABRIA_DIRETTA_URL =
  "https://www.calabriadirettanews.com/2026/10/10/lamezia-terme-stallo-sul-nuovo-regolamento-la-usb-taxi-dichiara-lo-stato-di-agitazione/";
const COUNCIL_OCTOBER_12_USB_LAMEZIATERME_URL =
  "https://www.lameziaterme.it/taxi-lamezia-usb-proclama-stato-agitazione-dopo-rinvii/";
const COUNCIL_OCTOBER_12_USB_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/10/10/lusb-taxi-lamenta-la-non-approvazione-degli-aggiornamenti-del-regolamento-richiesti/69666/";
const COUNCIL_OCTOBER_12_USB_LAMEZIA_OGGI_URL =
  "https://www.lameziaoggi.it/lamezia-terme/2026/10/10/usb-taxi-proclama-stato-di-agitazione-lunedi-in-consiglio-comunale-a-lamezia-per-chiedere-nuovo-regolamento/";
const COUNCIL_OCTOBER_12_USB_LA_NOVITA_URL =
  "https://lanovitaonline.it/lamezia-terme-taxi-nuovo-regolamento-fermo-usb-proclama-lo-stato-di-agitazione/";
const COUNCIL_OCTOBER_11_COUNT_LAMEZIAINFORMA_URL =
  "https://www.lameziainforma.it/politica/2026/10/11/la-conta-nei-banchi-in-consiglio-comunale-per-non-pensare-alle-scadenze-in-arrivo-contabili-istituzionali/69676/";
const COUNCIL_OCTOBER_11_MURONE_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-sindaco-murone-nessuna-crisi-sul-piano-di-riequilibrio-presto-confernza-per-fare-chiarezza.html";
const COUNCIL_OCTOBER_11_GAZZETTA_CONTEXT_URL =
  "https://catanzaro.gazzettadelsud.it/articoli/politica/2026/10/11/lamezia-laffondo-del-centrosinistra-maggioranza-senza-numeri-593af877-017f-4027-bf99-67e88e418fb9/";
const COUNCIL_OCTOBER_12_REPORT_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-dal-consiglio-comunale-via-libera-a-quattro-debiti-di-bilancio.html";
const COUNCIL_OCTOBER_13_NTACALABRIA_REPORT_URL =
  "https://www.ntacalabria.it/politica/consiglio-comunale-a-lamezia-bocciate-mozioni-minoranza.html";
const COUNCIL_OCTOBER_13_TIMPONE_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-cristiano-e-villella-dopo-il-no-alla-mozione-su-timpone-andremo-avanti-per-i-cittadini.html";
const COUNCIL_OCTOBER_13_TIMPONE_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/10/13/rione-timpone-il-nostro-impegno-continua-nonostante-il-voto-contrario-alla-mozione/";
const COMMISSION_V_OCTOBER_23_ASSETS_LAMETINO_URL =
  "https://www.lametino.it/ultime/lamezia-nuove-regole-per-il-patrimonio-immobiliare-comunale-approvato-regolamento-acquisizione-gestione-e-valorizzazione-dei-beni.html";
const COMMISSION_V_OCTOBER_23_ASSETS_CITY_ONE_URL =
  "https://cityonelamezia.it/2026/10/23/patrimonio-immobiliare-comunale-a-lamezia-la-quinta-commissione-approva-il-nuovo-regolamento/";
const COMMISSION_V_OCTOBER_23_ASSETS_LA_NOVITA_URL =
  "https://lanovitaonline.it/lamezia-terme-nuove-regole-per-gli-immobili-comunali-piu-trasparenza-e-valorizzazione-del-patrimonio/";
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
const COUNCIL_OCTOBER_9_CONTEXT_RESEARCHED_AT = "2026-10-14T15:44:57Z";
const OCTOBER_12_13_COMMISSION_SOURCE_REVIEWED_AT = "2026-10-13T09:58:28Z";
const OCTOBER_12_13_COMMISSION_CONTEXT_RESEARCHED_AT =
  "2026-10-29T05:34:00+01:00";
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

const september24To30…53085 tokens truncated…nfiammano” l’autunno politico",
        url: COMMISSION_II_OCTOBER_27_TV6ONAIR_URL,
        publisher: "TV6onAir",
        publishedAt: "2026-10-27",
        relationship: "agenda_item",
        relevanceNote:
          "La pagina ripubblica la copertura di Gazzetta del Sud e ne espone il collegamento come fonte originale. Associa Bilancio consolidato 2025 e Piano di riequilibrio alla II Commissione, ma non identifica una singola seduta: è un mirror distinto per tracciabilità, non una conferma indipendente, e non prova convocazione del Consiglio, programmazione, trattazione, voto o esito ufficiale.",
        reviewedAt: "2026-10-30T12:17:00+01:00",
      },
      {
        title:
          "Lamezia, Progetto Civico attacca sul riequilibrio: «Dove è finita la politica?»",
        url: PROGETTO_CIVICO_OCTOBER_31_LAMEZIATERME_URL,
        publisher: "LameziaTerme.it",
        publishedAt: "2026-10-31",
        relationship: "possible_same_session",
        relevanceNote:
          "La pagina, etichettata “Comunicato Stampa”, riproduce una nota di Progetto Civico Italia sui lavori della Commissione Bilancio e sul venir meno del numero legale. Il riferimento relativo a “ieri” non viene presentato come data della seduta; senza convocazione o resoconto istituzionale il collegamento resta possibile e non certifica programmazione, svolgimento, numero legale, voto o esito.",
        reviewedAt: "2026-10-31T23:43:00+01:00",
      },
      {
        title:
          'Piano di riequilibrio, Progetto Civico Italia: "Lamezia merita trasparenza"',
        url: PROGETTO_CIVICO_OCTOBER_31_LAMETINO_URL,
        publisher: "il Lametino",
        publishedAt: "2026-10-31",
        relationship: "possible_same_session",
        relevanceNote:
          "Il Lametino riproduce la stessa nota di Progetto Civico Italia sui lavori della Commissione Bilancio. Il riferimento relativo a “ieri” non viene presentato come data della seduta; la pagina non è una conferma indipendente e non certifica programmazione, svolgimento, numero legale, voto o esito.",
        reviewedAt: "2026-10-31T23:43:00+01:00",
      },
      {
        title:
          "Progetto Civico Italia Lamezia Terme, Piano di riequilibrio: “Le decisioni non si prendono più nei luoghi della politica. Ma dove è finita la Politica?”",
        url: PROGETTO_CIVICO_OCTOBER_31_CORRIERE_LAMEZIA_URL,
        publisher: "Corriere di Lamezia",
        publishedAt: "2026-10-31",
        relationship: "possible_same_session",
        relevanceNote:
          "Corriere di Lamezia riproduce la stessa nota di Progetto Civico Italia sui lavori della Commissione Bilancio. Il riferimento relativo a “ieri” non viene presentato come data della seduta; la pagina non è una conferma indipendente e non certifica programmazione, svolgimento, numero legale, voto o esito.",
        reviewedAt: "2026-10-31T23:43:00+01:00",
      },
    ],
    media: [],
    editorialAgenda: [
      {
        title: "Relazione sul Piano di riequilibrio finanziario pluriennale",
        sourceUrls: [
          COMMISSION_II_OCTOBER_26_LAMETINO_URL,
          COMMISSION_II_OCTOBER_25_LAMEZIAINFORMA_URL,
          COMMISSION_II_OCTOBER_27_NTACALABRIA_URL,
          COMMISSION_II_OCTOBER_27_GAZZETTA_URL,
          COMMISSION_II_OCTOBER_27_ITALY_TODAY_URL,
          COMMISSION_II_OCTOBER_27_TV6ONAIR_URL,
          PROGETTO_CIVICO_OCTOBER_31_LAMEZIATERME_URL,
          PROGETTO_CIVICO_OCTOBER_31_LAMETINO_URL,
          PROGETTO_CIVICO_OCTOBER_31_CORRIERE_LAMEZIA_URL,
        ],
        confidence: "medium",
        reason:
          "Il tema è riportato espressamente dalle fonti editoriali, ma la loro cronologia non è pienamente coerente. Le tre pagine del 31 ottobre riproducono la stessa nota di Progetto Civico Italia e non costituiscono conferme indipendenti. In assenza dell'avviso istituzionale resta un tema emerso dalla copertura e non prova iscrizione all'ordine del giorno, trattazione, numero legale o esito.",
      },
      {
        title: "Bilancio consolidato dell'esercizio 2025",
        sourceUrls: [
          COMMISSION_II_OCTOBER_26_LAMETINO_URL,
          COMMISSION_II_OCTOBER_25_LAMEZIAINFORMA_URL,
          COMMISSION_II_OCTOBER_27_NTACALABRIA_URL,
          COMMISSION_II_OCTOBER_27_GAZZETTA_URL,
          COMMISSION_II_OCTOBER_27_ITALY_TODAY_URL,
          COMMISSION_II_OCTOBER_27_TV6ONAIR_URL,
        ],
        confidence: "medium",
        reason:
          "Le fonti associano il tema alla II Commissione, ma LameziaInforma, NtaCalabria e Gazzetta del Sud lo descrivono come già passato mentre il Lametino lo colloca nel calendario successivo. L'atto di convocazione non è stato acquisito e nessun riferimento viene trasferito nei campi ufficiali.",
      },
      {
        title: "Ratifica di variazioni al Bilancio 2026–2028",
        sourceUrls: [COMMISSION_II_OCTOBER_26_LAMETINO_URL],
        confidence: "medium",
        reason:
          "La fonte editoriale cita due proposte di ratifica collegate a deliberazioni di Giunta; senza l'avviso originale il tema resta separato dall'ordine del giorno ufficiale e non implica esame o voto.",
      },
      {
        title: "Debiti fuori bilancio derivanti da sentenze esecutive",
        sourceUrls: [COMMISSION_II_OCTOBER_26_LAMETINO_URL],
        confidence: "medium",
        reason:
          "Il tema compare nella copertura editoriale, che non consente di stabilire numero e completezza delle proposte né di inferire trattazione, votazioni o risultati.",
      },
    ],
  },
  title: {
    key: "title",
    label: "Titolo",
    value:
      "II Commissione consiliare permanente — ciclo segnalato dalla copertura",
    sourceStatus: "da_verificare",
    limit:
      "L'organo e il ciclo di lavori sono indicati da una fonte editoriale; manca una pubblicazione istituzionale acquisita che consenta di verificare convocazione e singole sedute.",
  },
  scheduledAt: {
    key: "scheduledAt",
    label: "Data e ora",
    value: null,
    sourceStatus: "da_verificare",
    limit:
      "Date e orari non sono disponibili da una fonte istituzionale acquisita. Il calendario riportato dall'articolo viene usato soltanto per la ricerca e non come dato ufficiale delle sedute.",
  },
  sessionStatus: {
    key: "sessionStatus",
    label: "Stato seduta",
    value: "non_verificata",
    sourceStatus: "da_verificare",
    limit:
      "La copertura editoriale non certifica convocazione, programmazione, svolgimento, chiusura, rinvio o altro esito ufficiale.",
  },
  agenda: {
    key: "agenda",
    label: "Ordine del giorno",
    value: null,
    sourceStatus: "assente",
    limit:
      "Ordine del giorno istituzionale non acquisito. Gli argomenti riportati dalla stampa sono esposti soltanto nella sezione separata “Temi emersi dalla copertura”.",
  },
  sourceLink: {
    key: "sourceLink",
    label: "Fonte",
    value: null,
    sourceStatus: "assente",
    limit:
      "Non è stata acquisita una pubblicazione istituzionale associabile con precisione al ciclo di sedute segnalato.",
  },
  liveStreaming: {
    key: "liveStreaming",
    label: "Streaming live",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessuna diretta istituzionale associabile con precisione è stata individuata.",
  },
  recording: {
    key: "recording",
    label: "Registrazione",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessuna registrazione istituzionale associabile con precisione è stata individuata.",
  },
  minutesOrReport: {
    key: "minutesOrReport",
    label: "Verbale o resoconto",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessun verbale o resoconto istituzionale associabile con precisione è stato individuato.",
  },
  lastCheckedAt: {
    key: "lastCheckedAt",
    label: "Ultimo controllo",
    value: "2026-10-31T23:43:00+01:00",
    sourceStatus: "verificato",
    sourceUrl: MUNICIPAL_ALBO_DOCUMENTS_URL,
    limit:
      "Indica quando sono state ricontrollate le fonti, non una conferma istituzionale del ciclo di sedute.",
  },
  dataLimits: {
    key: "dataLimits",
    label: "Limiti del dato",
    value: [
      "Le date e gli orari pubblicati dalla testata non vengono presentati come dati ufficiali delle sedute.",
      "Non è stata acquisita una pubblicazione istituzionale con convocazione o allegato riferibile con precisione al ciclo; il nuovo Albo dinamico non ha restituito un atto utile durante il controllo diretto.",
      "Date, orari, sede, ordine del giorno, stato, streaming, registrazione e verbale restano non verificati o non rilevati secondo il campo.",
      "Gli articoli collegati sono fonti editoriali e non certificano programmazione, svolgimento, completezza, presenze, votazioni o risultati.",
      "Le nove pagine editoriali non sono pienamente coerenti sulla cronologia del Bilancio consolidato e non vengono usate per stabilire se il tema fosse già passato o ancora da esaminare in Commissione; NtaCalabria ripete la ricostruzione di LameziaInforma, Italy Today e TV6onAir ripubblicano Gazzetta del Sud, mentre LameziaTerme.it, il Lametino e Corriere di Lamezia riproducono la stessa nota di Progetto Civico Italia. Queste pagine non costituiscono conferme indipendenti; nessuna fonte fornisce prova istituzionale di una singola seduta, del numero legale o di un esito.",
      "I temi riportati dalla copertura restano nell'agenda editoriale separata e dovranno essere riconciliati se emergerà un atto istituzionale.",
    ],
    sourceStatus: "parziale",
    sourceUrl: MUNICIPAL_ALBO_DOCUMENTS_URL,
    limit:
      "Scheda prudenziale basata su una corrispondenza editoriale esplicita; tutti i campi ufficiali restano separati e non confermati.",
  },
};

const commissionPedestrianAreaNovemberEditorialSignal: CouncilSessionV0 = {
  id: "editorial-commissione-isola-pedonale-2026-11",
  kind: "commission",
  isDemoFixture: false,
  contextResearch: {
    status: "reviewed_matches",
    checkedAt: "2026-11-17T00:18:00+01:00",
    searchNote:
      "Parallel Search e la verifica diretta della pagina originale di LameziaInforma hanno individuato un riferimento a una discussione in commissione consiliare sull'isola pedonale di Corso Numistrano, espressa come prevista per “domani” nell'articolo del 16 novembre. La pagina non indica il numero della Commissione, l'ora, la sede o un ordine del giorno istituzionale. La pagina delle novità del Comune non pubblicava una convocazione associabile e la pagina istituzionale dell'Albo rinviava al nuovo portale; il portale ha bloccato il client automatizzato e non ha restituito l'elenco degli atti. È quindi materializzata una sola scheda editoriale prudenziale: l'espressione relativa è usata soltanto per la ricerca e non diventa data ufficiale della seduta.",
    articles: [
      {
        title:
          "A Lamezia Terme “It's beginning to look a lot like Christmas” in attesa di sapere quanto e come",
        url: COMMISSION_NOVEMBER_17_PEDESTRIAN_AREA_LAMEZIAINFORMA_URL,
        publisher: "LameziaInforma",
        publishedAt: "2026-11-16",
        relationship: "possible_same_session",
        relevanceNote:
          "L'articolo riferisce che “domani” in commissione consiliare si ridiscuterà dell'isola pedonale di Corso Numistrano, ma non identifica il numero dell'organo né fornisce una convocazione. Il riferimento temporale resta contesto editoriale e non certifica data, ora, sede, ordine del giorno, programmazione, svolgimento, partecipanti, votazioni o esiti.",
        reviewedAt: "2026-11-17T00:18:00+01:00",
      },
    ],
    media: [],
    editorialAgenda: [
      {
        title:
          "Isola pedonale serale su Corso Numistrano e gestione di sosta e transito",
        sourceUrls: [COMMISSION_NOVEMBER_17_PEDESTRIAN_AREA_LAMEZIAINFORMA_URL],
        confidence: "medium",
        reason:
          "Il tema è indicato esplicitamente dalla fonte editoriale, ma non è stato acquisito un ordine del giorno istituzionale e non è identificato il numero della Commissione. La voce descrive soltanto un tema emerso dalla copertura e non implica iscrizione, trattazione, voto o esito.",
      },
    ],
  },
  title: {
    key: "title",
    label: "Titolo",
    value:
      "Commissione consiliare sull'isola pedonale — segnalazione editoriale",
    sourceStatus: "da_verificare",
    limit:
      "L'organo generico e il tema sono indicati da una fonte editoriale; manca una pubblicazione istituzionale che consenta di identificare la Commissione e la seduta.",
  },
  scheduledAt: {
    key: "scheduledAt",
    label: "Data e ora",
    value: null,
    sourceStatus: "da_verificare",
    limit:
      "Data e ora non sono disponibili da una fonte istituzionale. L'espressione relativa “domani” viene usata soltanto per la ricerca e non come data ufficiale della seduta.",
  },
  sessionStatus: {
    key: "sessionStatus",
    label: "Stato seduta",
    value: "non_verificata",
    sourceStatus: "da_verificare",
    limit:
      "La copertura editoriale non certifica convocazione, programmazione, svolgimento, chiusura, rinvio o altro esito ufficiale.",
  },
  agenda: {
    key: "agenda",
    label: "Ordine del giorno",
    value: null,
    sourceStatus: "assente",
    limit:
      "Ordine del giorno istituzionale non acquisito. Il tema riportato dalla stampa è esposto soltanto nella sezione separata “Temi emersi dalla copertura”.",
  },
  sourceLink: {
    key: "sourceLink",
    label: "Fonte",
    value: null,
    sourceStatus: "assente",
    limit:
      "Non è stata acquisita una pubblicazione istituzionale associabile con precisione alla seduta segnalata.",
  },
  liveStreaming: {
    key: "liveStreaming",
    label: "Streaming live",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessuna diretta istituzionale associabile con precisione è stata individuata.",
  },
  recording: {
    key: "recording",
    label: "Registrazione",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessuna registrazione istituzionale associabile con precisione è stata individuata.",
  },
  minutesOrReport: {
    key: "minutesOrReport",
    label: "Verbale o resoconto",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessun verbale o resoconto istituzionale associabile con precisione è stato individuato.",
  },
  lastCheckedAt: {
    key: "lastCheckedAt",
    label: "Ultimo controllo",
    value: "2026-11-17T00:18:00+01:00",
    sourceStatus: "verificato",
    sourceUrl: MUNICIPAL_ALBO_DOCUMENTS_URL,
    limit:
      "Indica quando sono state ricontrollate le fonti, non una conferma istituzionale della seduta segnalata.",
  },
  dataLimits: {
    key: "dataLimits",
    label: "Limiti del dato",
    value: [
      "L'espressione relativa “domani” e la data di pubblicazione dell'articolo non vengono presentate come data ufficiale della seduta.",
      "La fonte non identifica il numero della Commissione e non è stata acquisita una pubblicazione istituzionale con convocazione o allegato riferibile con precisione alla seduta.",
      "La pagina delle novità del Comune non pubblicava una convocazione associabile; il portale Albo corrente ha bloccato il client automatizzato e non ha restituito l'elenco degli atti.",
      "Data, ora, sede, ordine del giorno, stato, streaming, registrazione e verbale restano non verificati o non rilevati secondo il campo.",
      "L'articolo collegato è una fonte editoriale e non certifica programmazione, svolgimento, completezza, presenze, votazioni o risultati.",
      "Il tema riportato dalla copertura resta nell'agenda editoriale separata e dovrà essere riconciliato se emergerà un atto istituzionale.",
    ],
    sourceStatus: "parziale",
    sourceUrl: MUNICIPAL_ALBO_DOCUMENTS_URL,
    limit:
      "Scheda prudenziale basata su una corrispondenza editoriale esplicita; tutti i campi ufficiali restano separati e non confermati.",
  },
};

const commissionIAffariGeneraliNovemberEditorialSignal: CouncilSessionV0 = {
  id: "editorial-commissione-i-polizia-mortuaria-2026-11",
  kind: "commission",
  isDemoFixture: false,
  contextResearch: {
    status: "reviewed_matches",
    checkedAt: "2026-11-18T23:32:00+01:00",
    searchNote:
      "Parallel Search e la verifica diretta delle pagine originali del Corriere di Lamezia e di City One hanno individuato due riprese della stessa nota di Futuro Nazionale sulla Prima Commissione consiliare Affari Generali. Le pagine, pubblicate il 18 novembre, riferiscono che l'assenza di alcuni componenti avrebbe fatto venir meno il numero legale e impedito la discussione del regolamento di polizia mortuaria; non espongono una convocazione, una data assoluta della seduta, un orario, una sede o un ordine del giorno istituzionale e non costituiscono conferme indipendenti. Al controllo delle 23:32 la pagina delle novità del Comune non pubblicava una convocazione associabile e la pagina istituzionale dell'Albo rinviava al portale corrente, che ha bloccato il client automatizzato con il codice `MDAWAF001`. È quindi mantenuta una scheda editoriale prudenziale: il riferimento relativo a “oggi” è usato soltanto per la ricerca e non diventa data ufficiale; il numero legale e la mancata discussione restano affermazioni editoriali e non valorizzano lo stato della seduta o un esito ufficiale.",
    articles: [
      {
        title:
          "Lamezia, Futuro Nazionale: “Due Commissioni bloccate facendo mancare il numero legale, a pagare sono i cittadini”",
        url: COMMISSION_I_NOVEMBER_18_CORRIERE_LAMEZIA_URL,
        publisher: "Corriere di Lamezia",
        publishedAt: "2026-11-18",
        relationship: "possible_same_session",
        relevanceNote:
          "La pagina identifica la Prima Commissione Affari Generali e il regolamento di polizia mortuaria, ma deriva da una nota politica e non espone una convocazione o una data assoluta della seduta. Il riferimento a “oggi”, la perdita del numero legale e la mancata discussione restano contesto editoriale e non certificano data, ora, sede, ordine del giorno, programmazione, svolgimento, presenze, votazioni o esiti.",
        reviewedAt: "2026-11-18T17:41:00+01:00",
      },
      {
        title:
          "Lamezia, Futuro Nazionale attacca la maggioranza: Commissioni paralizzate, ‘è guerriglia politica’",
        url: COMMISSION_I_NOVEMBER_18_CITY_ONE_URL,
        publisher: "City One",
        publishedAt: "2026-11-18",
        relationship: "possible_same_session",
        relevanceNote:
          "City One riproduce la stessa nota di Futuro Nazionale già pubblicata dal Corriere di Lamezia. Il testo identifica la Prima Commissione Affari Generali e il regolamento di polizia mortuaria, ma non costituisce una conferma indipendente e non espone una convocazione o una data assoluta della seduta; numero legale e mancata discussione restano affermazioni editoriali.",
        reviewedAt: "2026-11-18T23:32:00+01:00",
      },
    ],
    media: [],
    editorialAgenda: [
      {
        title: "Regolamento comunale di polizia mortuaria",
        sourceUrls: [
          COMMISSION_I_NOVEMBER_18_CORRIERE_LAMEZIA_URL,
          COMMISSION_I_NOVEMBER_18_CITY_ONE_URL,
        ],
        confidence: "medium",
        reason:
          "Il tema è attribuito esplicitamente alla Prima Commissione dalla fonte editoriale, ma non è stato acquisito un ordine del giorno istituzionale. La voce descrive soltanto un tema emerso dalla copertura e non implica iscrizione, trattazione, voto o esito.",
      },
    ],
  },
  title: {
    key: "title",
    label: "Titolo",
    value:
      "Prima Commissione Affari Generali sul regolamento di polizia mortuaria — segnalazione editoriale",
    sourceStatus: "da_verificare",
    limit:
      "Organo e tema sono indicati da una fonte editoriale; manca una pubblicazione istituzionale che consenta di identificare e verificare la seduta.",
  },
  scheduledAt: {
    key: "scheduledAt",
    label: "Data e ora",
    value: null,
    sourceStatus: "da_verificare",
    limit:
      "Data e ora non sono disponibili da una fonte istituzionale. Il riferimento relativo a “oggi” viene usato soltanto per la ricerca e non come data ufficiale della seduta.",
  },
  sessionStatus: {
    key: "sessionStatus",
    label: "Stato seduta",
    value: "non_verificata",
    sourceStatus: "da_verificare",
    limit:
      "La copertura editoriale sulla perdita del numero legale e sulla mancata discussione non certifica costituzione, svolgimento, chiusura, rinvio o altro esito ufficiale.",
  },
  agenda: {
    key: "agenda",
    label: "Ordine del giorno",
    value: null,
    sourceStatus: "assente",
    limit:
      "Ordine del giorno istituzionale non acquisito. Il tema riportato dalla stampa è esposto soltanto nella sezione separata “Temi emersi dalla copertura”.",
  },
  sourceLink: {
    key: "sourceLink",
    label: "Fonte",
    value: null,
    sourceStatus: "assente",
    limit:
      "Non è stata acquisita una pubblicazione istituzionale associabile con precisione alla seduta segnalata.",
  },
  liveStreaming: {
    key: "liveStreaming",
    label: "Streaming live",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessuna diretta istituzionale associabile con precisione è stata individuata.",
  },
  recording: {
    key: "recording",
    label: "Registrazione",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessuna registrazione istituzionale associabile con precisione è stata individuata.",
  },
  minutesOrReport: {
    key: "minutesOrReport",
    label: "Verbale o resoconto",
    value: null,
    sourceStatus: "assente",
    limit:
      "Nessun verbale o resoconto istituzionale associabile con precisione è stato individuato.",
  },
  lastCheckedAt: {
    key: "lastCheckedAt",
    label: "Ultimo controllo",
    value: "2026-11-18T23:32:00+01:00",
    sourceStatus: "verificato",
    sourceUrl: MUNICIPAL_ALBO_DOCUMENTS_URL,
    limit:
      "Indica quando sono state ricontrollate le fonti, non una conferma istituzionale della seduta segnalata.",
  },
  dataLimits: {
    key: "dataLimits",
    label: "Limiti del dato",
    value: [
      "Il riferimento relativo a “oggi” e la data di pubblicazione dell'articolo non vengono presentati come data ufficiale della seduta.",
      "La fonte identifica la Prima Commissione Affari Generali e il tema, ma non è stata acquisita una pubblicazione istituzionale con convocazione o allegato riferibile con precisione alla seduta.",
      "La pagina delle novità del Comune non pubblicava una convocazione associabile; il portale Albo corrente ha bloccato il client automatizzato con il codice `MDAWAF001` e non ha restituito l'elenco degli atti.",
      "Data, ora, sede, ordine del giorno, stato, streaming, registrazione e verbale restano non verificati o non rilevati secondo il campo.",
      "L'articolo deriva da una nota politica ed è una fonte editoriale: non certifica programmazione, costituzione, svolgimento, completezza, presenze, numero legale, mancata discussione, votazioni o risultati.",
      "Corriere di Lamezia e City One riproducono la stessa nota di Futuro Nazionale: i due collegamenti sono conservati per tracciabilità ma non costituiscono conferme indipendenti.",
      "Il titolo richiama due Commissioni, ma il testo identifica con precisione soltanto la Prima Commissione Affari Generali; non viene quindi materializzata una seconda seduta.",
      "Il tema riportato dalla copertura resta nell'agenda editoriale separata e dovrà essere riconciliato se emergerà un atto istituzionale.",
    ],
    sourceStatus: "parziale",
    sourceUrl: MUNICIPAL_ALBO_DOCUMENTS_URL,
    limit:
      "Scheda prudenziale basata su una corrispondenza editoriale esplicita; tutti i campi ufficiali restano separati e non confermati.",
  },
};

export const councilSessionV0ReviewedRecords: readonly CouncilSessionV0[] = [
  commissionIAffariGeneraliNovemberEditorialSignal,
  commissionPedestrianAreaNovemberEditorialSignal,
  councilNovember3EditorialSignal,
  scordovilloOpenCouncilEditorialSignal,
  commissionIIOctoberEditorialCycle,
  commissionIOctober22EditorialSession,
  septemberCommissionSession({
    id: "albo-2026-3262-commissione-v-2026-10-13",
    title: "V Commissione consiliare permanente — seduta del 13 ottobre 2026",
    scheduledAt: "2026-10-13T09:00:00+02:00",
    agenda: roadNetworkWorksRulesAgenda,
    candidate: commissionVOctober12And13Notice.candidate,
    provenance: commissionVOctober12And13Notice.provenance,
    contextResearch: october13CommissionContextResearch,
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
    contextResearch: october12CommissionContextResearch,
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
