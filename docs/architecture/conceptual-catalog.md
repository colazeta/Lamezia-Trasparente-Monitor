# Catalogo concettuale, logico e di copertura

> Generato da `architecture/data-domain-registry.v1.json`. Modificare il registro e rieseguire `node scripts/architecture/renderConceptualCatalog.mjs --write`.

Versione 1.0.0; revisione del 2026-09-07. La classificazione non certifica popolamento o completezza.

Leggere prima [il disegno concettuale e le regole di identità](conceptual-schema.md). Per i conteggi effettivi e i limiti: [assessment](conceptual-assessment-2026-09-07.md).

## Concetti e identità

| Concetto | Definizione | Identità | Profilo semantico |
| --- | --- | --- | --- |
| Identità canonica | Un riferimento stabile a un soggetto, senza duplicarne gli attributi di dominio. | UUID e tipo di dominio; non si fonde per somiglianza del nome. | gap |
| Fonte | Il soggetto o sistema che pubblica informazioni. | Codice della fonte; non coincide con il documento acquisito. | reference · prov:Agent |
| Artefatto | Una sequenza di byte identificata da hash e formato. | Hash dei byte; gli allegati possono rimanere fuori PostgreSQL. | reference · prov:Entity |
| Versione informativa | Un insieme di dati acquisito a un determinato stato. | Fonte, versione e hash; una nuova versione non sovrascrive la precedente. | reference · dcat:Dataset |
| Record di fonte | Un'unità informativa di una versione di fonte. | Chiave originaria dentro la release; non coincide automaticamente con l'entità descritta. | gap |
| Acquisizione | Un tentativo di acquisire o verificare una fonte. | ID del tentativo ed esito, anche quando non produce nuovi record. | reference · prov:Activity |
| Pubblicazione | La comparsa di un contenuto in un registro pubblico. | Fonte e identificativo di pubblicazione, distinti dall'identità dell'atto. | partial · lt:AdministrativeAct |
| Documento | Una risorsa informativa o allegato che descrive un atto o altro soggetto. | Identità documentale distinta da formato, estrazione testuale e pubblicazione. | partial · lt:AdministrativeActTextRepresentation |
| Atto amministrativo | Una decisione o parere formalizzato da un'autorità. | Autorità, tipo, numero e data verificati; il titolo da solo non è una chiave. | partial · lt:AdministrativeAct |
| Persona | Un individuo la cui identità rimane stabile al cambiare della carica. | Identificatori qualificati e risoluzione documentata; mai soltanto il nome. | reference · CPV-AP_IT |
| Organizzazione o organo | Un ente o organo istituzionale, con natura e contesto espliciti. | Ente, unità e periodo; un organo non è la persona che lo presiede. | reference · COV-AP_IT |
| Incarico o partecipazione | Il ruolo svolto da una persona in un contesto e periodo. | Persona, ruolo, organo e intervallo di validità. | reference · RO-AP_IT |
| Seduta | Una riunione di un organo con documenti, interventi e voti. | Organo, data e identificativo della fonte; non il singolo verbale. | gap |
| Procedura di affidamento | Procedimento con cui un’amministrazione seleziona un contraente. Può produrre uno o più contratti. | Identificativo qualificato della procedura o del lotto, compreso il CIG dove applicabile; non coincide con il contratto stipulato. | partial · lt:PublicProcurementRecord |
| Progetto pubblico | Un investimento che può essere descritto da più amministrazioni e fonti. | UUIDv7 indipendente dalla fonte. CUP qualificato con fonte, emittente e controllo di formato; record senza identità sufficiente conservano un esito esplicito. | local · lt:PnrrProject |
| Indicatore | Definizione di ciò che si misura, con unità, metodo e significato. Le serie fissano le dimensioni della misura. | Definizione, unità e metodo; non il valore di un anno o una serie territoriale. | partial · lt:PerformanceIndicator |
| Osservazione | Il valore di una misura in un luogo, periodo e versione di fonte. | Serie, release, periodo e dimensioni; zero e dato mancante sono distinti. | reference · qb:Observation |
| Luogo | Territorio o luogo identificabile, distinto dalle geometrie che ne rappresentano forma e posizione. | Codice o identificatore geografico qualificato; una coordinata approssimata non è una chiave di identità. | reference · CLV-AP_IT |
| Bene | Un bene distinto dai provvedimenti che lo riguardano. | Identificatore del bene; confisca, assegnazione e riuso sono eventi separati. | gap |
| Evento documentato | Un evento con tempo, luogo, fonti e stato probatorio. | Identità LTCEDS; le fonti possono divergere senza produrre automaticamente nuovi eventi. | gap |
| Evidenza di evento | Una fonte, qualificazione o localizzazione a sostegno di un evento. | Evento, fonte, tipo di attestazione e versione; una menzione non prova responsabilità. | reference · prov:Entity |
| Raggruppamento documentato | Un collegamento esplicito tra eventi sostenuto da fonti. | ID del cluster e criterio documentato; non inferire una rete criminale dalla prossimità. | gap |
| Segnalazione civica | Una comunicazione ricevuta e sottoposta a verifica. | ID della segnalazione e storia; non è un fatto accertato. | gap |
| Scheda di monitoraggio | Una valutazione curata su un oggetto civico e sulle sue evidenze. | Oggetto, autore, versione e stato di revisione; distinta dalla segnalazione ricevuta. | gap |
| Richiesta di accesso | Un procedimento di accesso civico con istanza, riscontri ed esito. | Identificativo della richiesta e storia del procedimento. | gap |
| Bando o avviso | Un avviso che stabilisce requisiti, scadenze e risorse disponibili. | Ente emittente e identificativo del bando; distinto dalla domanda di partecipazione. | gap |
| Proposta civica | Una proposta attribuita, con oggetto e stato istituzionale. | ID della proposta, fonti e revisioni; categoria tematica distinta dall'entità proposta. | reference · CPSV-AP_IT, SKOS (classificazione) |
| Valutazione di intervento | Valutazione documentata di un intervento, con studio, risultati, limiti e contesto di applicabilità. | Studio e versione della valutazione; più valutazioni possono riguardare lo stesso intervento. | gap |
| Contenuto redazionale | Testi, sintesi, pagine e contributi curati per la presentazione. | ID editoriale e revisione; non crea da solo un soggetto canonico. | outside |
| Classificazione | Una categoria o tema usato per organizzare i contenuti. | Schema e codice stabile; temi civici e categorie di performance sono faccette diverse. | partial · lt:CivicTheme |
| Stato applicativo | Dati necessari al funzionamento del servizio. | ID applicativo; fuori dall'ontologia dei fatti civici. | outside |
| Contratto pubblico | Accordo stipulato tra un’amministrazione e un contraente nell’ambito di una procedura. Distinto da lotto, aggiudicazione e pagamento. | Identificativo del contratto qualificato dalla fonte, collegato alla procedura; il CIG non basta a distinguere tutti gli oggetti. | partial · lt:PublicProcurementRecord |
| Serie di osservazioni | Insieme di misure dello stesso indicatore a dimensioni definite, per esempio territorio e popolazione di riferimento. | Indicatore e dimensioni della serie; periodi e release distinguono le osservazioni. | gap |
| Rappresentazione geografica | Geometria o posizione di un luogo, con sistema di riferimento, fonte, versione e precisione. | Luogo, fonte e versione della geometria; due geometrie diverse non implicano due luoghi. | gap |
| Intervento di politica pubblica | Azione o strumento di politica pubblica definito per obiettivi e destinatari, che può essere studiato e proposto localmente. | Identificativo dell’intervento e della sua versione; distinto da proposta locale e valutazione scientifica. | reference |
| Asserzione di fonte | Un contenuto riportato o derivato da una fonte, conservato con valore, posizione e metodo di estrazione. | Record di fonte, puntatore al campo e versione dell’estrattore; non richiede un progetto già riconciliato. | gap |
| Decisione di riconciliazione | Un esito motivato di collegamento a un soggetto oppure di scelta del valore di un campo. | Candidato e versione del risolutore; le revisioni delle scelte mantengono la storia. | gap |
| Identificatore qualificato | Un codice attribuito da un sistema o ente emittente a un soggetto. | Schema, emittente e valore; un identificatore non coincide con l’oggetto descritto. | gap |

## Relazioni e cardinalità

`implemented`: struttura presente per il dominio indicato; `partial`: solo una parte è rappresentata; `target`: collegamento da realizzare. Le cardinalità sono massime, non vincoli di obbligatorietà. Non attestano record popolati. Le FK effettive sono consultabili nell’archivio e nello schema Drizzle.

| Origine | Relazione | Destinazione | Cardinalità | Stato |
| --- | --- | --- | --- | --- |
| Fonte | Pubblica versioni informative | Versione informativa | 1:N | partial |
| Versione informativa | Contiene record originari | Record di fonte | 1:N | implemented |
| Versione informativa | Conserva i byte acquisiti | Artefatto | N:1 | implemented |
| Fonte | È verificata da tentativi di acquisizione | Acquisizione | 1:N | implemented |
| Record di fonte | È riconciliato tramite esiti espliciti; primo perimetro PNRR | Progetto pubblico | N:M | partial |
| Pubblicazione | Pubblica o richiama atti | Atto amministrativo | N:M | target |
| Atto amministrativo | È documentato da risorse e allegati | Documento | N:M | partial |
| Persona | Assume incarichi nel tempo | Incarico o partecipazione | 1:N | partial |
| Organizzazione o organo | È il contesto dell'incarico | Incarico o partecipazione | 1:N | partial |
| Organizzazione o organo | Tiene sedute | Seduta | 1:N | implemented |
| Seduta | Ha resoconti e documenti | Documento | 1:N | partial |
| Procedura di affidamento | Contribuisce alla realizzazione di progetti | Progetto pubblico | N:M | target |
| Indicatore | Definisce valori osservati | Osservazione | 1:N | partial |
| Versione informativa | Documenta la versione dell'osservazione | Osservazione | 1:N | partial |
| Evento documentato | È sostenuto da attestazioni | Evidenza di evento | 1:N | implemented |
| Evento documentato | è localizzato in | Luogo | N:M | partial |
| Segnalazione civica | Può alimentare una analisi verificata | Scheda di monitoraggio | N:M | target |
| Proposta civica | Può richiamare interventi valutati | Valutazione di intervento | N:M | target |
| Procedura di affidamento | può produrre | Contratto pubblico | 1:N | target |
| Indicatore | è misurato da | Serie di osservazioni | 1:N | target |
| Serie di osservazioni | raccoglie | Osservazione | 1:N | implemented |
| Luogo | ha rappresentazioni | Rappresentazione geografica | 1:N | partial |
| Intervento di politica pubblica | è oggetto di | Valutazione di intervento | 1:N | target |
| Record di fonte | Conserva le asserzioni estratte | Asserzione di fonte | 1:N | implemented |
| Asserzione di fonte | Documenta le decisioni | Decisione di riconciliazione | 1:N | implemented |
| Progetto pubblico | È riconosciuto da codici qualificati | Identificatore qualificato | 1:N | implemented |
| Progetto pubblico | Mantiene scelte e varianti dei campi | Decisione di riconciliazione | 1:N | implemented |

## Modello logico: tabelle per dominio

I domini sono raggruppamenti concettuali; le tabelle restano nello schema PostgreSQL `public`. `entity`: entità/osservazione; `source`: struttura o record di fonte; `relation`: associazione; `projection`: proiezione; `legacy`: rappresentazione da armonizzare; `editorial`: contenuto redazionale; `operation`: esecuzione; `application`: stato del servizio.

### Identità comuni

Identificatori stabili e collegamenti alle identità dei sistemi precedenti.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `canonical_subjects` | Identità canoniche | Identità canonica | entity | Un soggetto globale e il suo tipo di dominio |
| `legacy_subject_map` | Corrispondenze con il modello precedente | Identità canonica | relation | Una decisione storicizzata di collegamento di identità |
| `core_assertions` | Asserzioni e valori di fonte | Asserzione di fonte | source | Un campo o contenuto di un record, con puntatore, fonte e versione dell’estrattore |
| `core_resolution_outcomes` | Esiti di riconciliazione | Decisione di riconciliazione | relation | Un candidato di un record e un esito motivato, anche senza soggetto canonico |

### Fonti e acquisizioni

Origini, versioni, record osservati e operazioni di acquisizione.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `source_sources` | Fonti registrate | Fonte | source | Una fonte con il proprio codice |
| `source_endpoints` | Punti di acquisizione | Fonte | source | Un endpoint appartenente a una fonte |
| `source_artifacts` | Artefatti acquisiti | Artefatto | source | Un artefatto identificato da endpoint e hash dei byte |
| `source_releases` | Versioni delle fonti | Versione informativa | source | Una release registrata |
| `source_records` | Record acquisiti | Record di fonte | source | Una chiave originaria dentro una release |
| `source_acquisition_runs` | Tentativi di acquisizione | Acquisizione | operation | Un tentativo con esito e conteggi |
| `opendata_datasets` | Dataset del catalogo open data | Fonte | source | Un dataset censito nel catalogo precedente |
| `opendata_resources` | Distribuzioni open data | Artefatto | source | Una risorsa scaricabile di un dataset |
| `opendata_snapshots` | Snapshot open data | Versione informativa | source | Una versione acquisita di una risorsa |
| `feed_status` | Stato dei feed | Acquisizione | operation | Lo stato operativo di un feed |
| `change_sentinel_events` | Segnalazioni di cambiamento delle fonti | Acquisizione | operation | Un cambiamento rilevato da processare |

### Atti e documenti

Decisioni amministrative, pubblicazioni, allegati e pareri.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `publications` | Pubblicazioni dell'Albo | Pubblicazione | source | Una pubblicazione identificata dal progressivo |
| `acts` | Schede di atti del modello precedente | Atto amministrativo | legacy | Una scheda sintetica di atto senza identità documentale comune |
| `fundamental_acts` | Atti fondamentali selezionati | Atto amministrativo | editorial | Una scheda curata di atto fondamentale |
| `oversight_opinions` | Pareri e vigilanza | Atto amministrativo | entity | Un parere con autore istituzionale e data |
| `oversight_opinion_documents` | Allegati ai pareri | Documento | relation | Un documento collegato a un parere |

### Persone e istituzioni

Persone, organi, incarichi nel tempo e sedute.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `officials` | Persone e carica corrente | Persona | legacy | Una persona con attributi della carica ancora incorporati |
| `organi` | Organi istituzionali | Organizzazione o organo | entity | Un organo identificato da slug |
| `organi_members` | Appartenenze e mandati | Incarico o partecipazione | relation | Una persona in un organo per un periodo |
| `sedute` | Sedute degli organi | Seduta | entity | Una convocazione o seduta |
| `session_reports` | Resoconti delle sedute | Documento | relation | Un resoconto associato a una seduta |
| `session_interventions` | Interventi nei resoconti | Incarico o partecipazione | relation | Un intervento nel contesto di un resoconto |
| `official_activities` | Attività degli amministratori | Incarico o partecipazione | relation | Una attività documentata attribuita a una persona |
| `official_remunerations` | Compensi degli amministratori | Osservazione | relation | Un importo per persona, tipo e periodo |
| `official_declarations` | Dichiarazioni degli amministratori | Documento | relation | Una dichiarazione collegata a una persona |
| `official_votes` | Voti documentati | Incarico o partecipazione | relation | Un voto della persona nel contesto di un atto o seduta |

### Appalti

Procedure, affidamenti e contratti con i loro identificatori.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `contracts` | Schede di contratti e affidamenti | Contratto pubblico | legacy | Una riga che combina campi di procedura, contratto e fornitore |

### Progetti pubblici

Progetti identificati dal CUP e descritti da più fonti.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `attuazione_pnrr_projects` | Progetti dalla fonte comunale | Progetto pubblico | source | Un record della fonte Attuazione PNRR |
| `italiadomani_projects` | Progetti da ItaliaDomani | Progetto pubblico | source | Un record ItaliaDomani identificato dal CUP |
| `project_projects` | Progetti canonici | Progetto pubblico | entity | Un investimento identificato da UUIDv7, con attributi tipizzati e provenienza dei valori |
| `project_identifiers` | Identificatori dei progetti | Identificatore qualificato | relation | Un codice CUP qualificato per schema ed emittente, collegato al progetto |
| `project_field_resolutions` | Scelte dei valori di progetto | Decisione di riconciliazione | relation | Una scelta di campo, la sua evidenza e il periodo di validità; le varianti non sono eliminate |

### Indicatori e osservazioni

Definizioni, serie, periodi e valori osservati.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `performance_categories` | Categorie di performance | Classificazione | editorial | Una categoria per raggruppare indicatori |
| `performance_indicators` | Definizioni degli indicatori | Indicatore | entity | Una definizione di indicatore amministrativo |
| `performance_indicator_values` | Valori degli indicatori | Osservazione | entity | Un valore dell'indicatore nel periodo |
| `demographic_series` | Serie demografiche | Serie di osservazioni | entity | Una definizione di serie statistica |
| `demographic_releases` | Release demografiche | Versione informativa | source | Una versione di fonte della serie |
| `demographic_observations` | Osservazioni demografiche | Osservazione | entity | Una osservazione per serie, release, periodo e dimensioni |

### Territorio e beni

Luoghi, geometrie, beni e loro stato documentato.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `confiscated_assets` | Beni confiscati | Bene | legacy | Un bene con stato e localizzazione ancora incorporati |

### Eventi documentati

Eventi criminali, fonti, qualificazioni, localizzazioni e proiezioni pubbliche.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `crime_events` | Eventi criminali documentati | Evento documentato | entity | Un evento LTCEDS con stato probatorio |
| `crime_sources` | Fonti degli eventi | Evidenza di evento | source | Una fonte del dominio LTCEDS |
| `crime_event_sources` | Eventi e fonti collegate | Evidenza di evento | relation | Una associazione tra evento e fonte |
| `crime_event_offences` | Qualificazioni degli eventi | Evidenza di evento | relation | Una qualificazione dell'evento sostenuta da fonte |
| `crime_event_locations` | Localizzazioni degli eventi | Luogo | relation | Una attestazione di luogo, precisione e ruolo |
| `crime_event_clusters` | Raggruppamenti di eventi | Raggruppamento documentato | entity | Un raggruppamento documentato |
| `crime_event_cluster_sources` | Fonti dei raggruppamenti | Evidenza di evento | relation | Una fonte a sostegno del raggruppamento |
| `crime_event_cluster_members` | Eventi nei raggruppamenti | Raggruppamento documentato | relation | Una appartenenza evento-raggruppamento |
| `crime_public_events` | Proiezioni pubbliche degli eventi | Evento documentato | projection | Una proiezione approvata e minimizzata di un evento |

### Monitoraggio e partecipazione

Segnalazioni, richieste, proposte e valutazioni documentate.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `reports` | Segnalazioni ricevute | Segnalazione civica | editorial | Una segnalazione civica con stato di verifica |
| `monitoring_reports` | Analisi di monitoraggio | Scheda di monitoraggio | editorial | Una valutazione curata su un contratto o progetto |
| `accesso_civico_requests` | Richieste di accesso civico | Richiesta di accesso | entity | Una richiesta con iter e riscontri |
| `bandi` | Bandi e avvisi | Bando o avviso | entity | Un avviso con requisiti e scadenza |
| `bando_matches` | Collegamenti dei bandi | Bando o avviso | relation | Un collegamento proposto tra bando e oggetto civico |
| `legality_areas` | Aree del monitoraggio legalità | Classificazione | editorial | Una area del quadro di monitoraggio |
| `legality_requirements` | Requisiti da verificare | Scheda di monitoraggio | editorial | Un requisito con evidenze e stato |
| `legality_overview` | Sintesi del monitoraggio legalità | Scheda di monitoraggio | projection | Una sintesi del quadro di monitoraggio |

### Redazione e classificazioni

Temi, testi curati e configurazione della presentazione.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `themes` | Temi civici | Classificazione | editorial | Un tema di navigazione civica |
| `categories` | Categorie editoriali | Classificazione | editorial | Una categoria per organizzare i temi |
| `theme_documents` | Documenti nei temi | Documento | editorial | Una scheda documentale collegata a un tema |
| `theme_posts` | Contributi nei temi | Contenuto redazionale | editorial | Un contributo redazionale nel tema |
| `theme_metrics` | Metriche dei temi | Osservazione | legacy | Una metrica editoriale senza modello universale di serie |
| `questions` | Domande civiche | Contenuto redazionale | editorial | Una domanda usata come percorso di consultazione |
| `page_blocks` | Blocchi delle pagine | Contenuto redazionale | editorial | Un blocco di presentazione con revisione |
| `site_strings` | Testi dell'interfaccia | Contenuto redazionale | editorial | Una stringa modificabile del sito |
| `helper_overrides` | Testi di aiuto personalizzati | Contenuto redazionale | editorial | Una personalizzazione dell'aiuto contestuale |

### Servizi applicativi

Conversazioni, iscrizioni e utilizzo del servizio.

| Tabella | Nome leggibile | Concetto | Ruolo | Una riga rappresenta |
| --- | --- | --- | --- | --- |
| `conversations` | Conversazioni | Stato applicativo | application | Una conversazione applicativa |
| `messages` | Messaggi | Stato applicativo | application | Un messaggio dentro una conversazione |
| `theme_emails` | Messaggi associati ai temi | Stato applicativo | application | Una comunicazione applicativa relativa a un tema |
| `theme_followers` | Iscrizioni ai temi | Stato applicativo | application | Una iscrizione di un utente a un tema |
| `shares` | Condivisioni | Stato applicativo | application | Una azione di condivisione nel servizio |
| `theme_relevance_events` | Interazioni con i temi | Stato applicativo | application | Un evento di utilizzo del sito, non un evento civico |

## Sovrapposizioni e decisioni

| Dominio | Tabelle | Problema | Decisione | Fase |
| --- | --- | --- | --- | --- |
| Progetti pubblici | `attuazione_pnrr_projects`, `italiadomani_projects` | Rappresentazioni per fonte | Mantenere i record fonte e collegarli a una sola identità progetto per CUP validato. I 30 record attuali hanno CUP distinti; nessuna fusione necessaria nel campione osservato. | 9 |
| Atti e documenti | `publications`, `acts`, `fundamental_acts`, `oversight_opinions`, `theme_documents` | Sovrapposizione di responsabilità | Separare pubblicazione, atto, documento e selezione editoriale; riconciliare su autorità, tipo, numero, data e fonte prima di ritirare le schede precedenti. | 7 |
| Persone e istituzioni | `officials`, `organi_members` | Identità e ruolo mescolati | Conservare la persona; trasferire le cariche in appartenenze temporali solo dopo verifica della storia e delle fonti. | 10 |
| Fonti e acquisizioni | `source_sources`, `opendata_datasets`, `crime_sources` | Registri con responsabilità diverse | Collegare catalogo dataset e fonti LTCEDS al registro comune; una fonte editoriale e un endpoint non si fondono per URL simile. | 3 |
| Indicatori e osservazioni | `performance_indicators`, `performance_indicator_values`, `demographic_series`, `demographic_observations`, `theme_metrics` | Pattern statistici paralleli | Usare definizione, release, osservazione e dimensioni comuni; mantenere unità e metodi distinti e non sommare indicatori eterogenei. | 14 |
| Monitoraggio e partecipazione | `reports`, `monitoring_reports` | Entità diverse con nomi simili | Mantenere distinte segnalazione ricevuta e analisi curata; introdurre collegamenti espliciti tra le due. | 15 |
| Redazione e classificazioni | `categories`, `themes`, `performance_categories`, `legality_areas` | Classificazioni di contesti diversi | Mantenere schemi di classificazione distinti con codici stabili e mapping documentati; non fonderli solo perché sono categorie. | 6 |

## Contenuti del sito e copertura

Copertura dei percorsi espliciti in `Router.tsx`, compresi alias e accessi riservati, più le pagine HTML autonome in `public`. Non è una riconciliazione di ogni campo di ogni file. `files` indica file senza tabella dedicata; `files_with_snapshot_ledger` conserva uno snapshot nel registro fonti senza materializzare tutte le entità; `files_with_domain_projection` indica una proiezione specifica della fonte; `api_and_files` combina API e fallback/file; `api` indica un percorso API, non la sua completezza; `editorial` indica testo redazionale; `redirect` indica un alias. Gli endpoint interni di autenticazione non rappresentano contenuti civici.

Semantica: `local` = classe locale dichiarata; `partial` = copertura parziale; `reference` = riferimento o classificazione; `gap` = mapping da definire; `outside` = fuori dai fatti civici. Una classe dichiarata non dimostra che ogni record sia esportato in RDF.

| Sezione | Concetti | Percorsi | Persistenza | Tabelle | Semantica | Limite |
| --- | --- | --- | --- | --- | --- | --- |
| Albo e delibere | Pubblicazione, Atto amministrativo, Documento | `/albo`, `/albo/:id`, `/delibere` | files_with_snapshot_ledger | publications, acts, source_records | local | Le due raccolte sono archiviate nel registro fonte; le tabelle degli atti restano un percorso da riconciliare. |
| Atti fondamentali e pareri | Atto amministrativo, Documento | `/atti-fondamentali`, `/pareri`, `/pareri/:id` | api_and_files | fundamental_acts, oversight_opinions, oversight_opinion_documents | partial | La selezione editoriale non costituisce una nuova identità dell'atto. |
| Contratti e incarichi | Procedura di affidamento, Contratto pubblico | `/contratti`, `/contratti/:id`, `/incarichimetro` | api_and_files | contracts, source_records | partial | La proiezione pubblica da atti non equivale a un contratto canonico o alla copertura completa ANAC. |
| Progetti PNRR | Progetto pubblico | `/pnrr`, `/pnrr/:cup` | files_with_domain_projection | attuazione_pnrr_projects, italiadomani_projects, source_records, project_projects, project_identifiers, project_field_resolutions, core_assertions, core_resolution_outcomes | local | Persistono i record della fonte comunale; manca l'identità progetto condivisa tra tutte le fonti. |
| Persone e organi | Persona, Organizzazione o organo, Incarico o partecipazione | `/organi`, `/organi/:slug`, `/amministratori`, `/amministratori/:id` | api_and_files | officials, organi, organi_members | reference | I profili statici alimentano il sito anche quando le tabelle sono vuote; cariche e persone vanno riconciliate. |
| Sedute | Seduta, Documento, Incarico o partecipazione | `/convocazioni`, `/convocazioni/:id` | api_and_files | sedute, session_reports, session_interventions, official_votes | gap | Convocazione, verbale, intervento e voto sono oggetti collegati; la fixture demo non è una seduta reale. |
| Performance | Indicatore, Osservazione, Serie di osservazioni | `/performance`, `/performance/:id`, `/performance/confronta` | api_and_files | performance_categories, performance_indicators, performance_indicator_values | partial | Gli obiettivi curati nei file non sono automaticamente valori importati negli indicatori. |
| Capacità e programma comunale | Scheda di monitoraggio, Proposta civica | `/macchina-comunale`, `/promessometro` | files | — | gap | Dati e dimostrazioni richiedono un modello per obiettivi, impegni, evidenze ed esiti; non diventano giudizi individuali. |
| Catalogo e serie open data | Fonte, Indicatore, Osservazione, Serie di osservazioni | `/opendata`, `/opendata/:id` | api_and_files | opendata_datasets, opendata_resources, opendata_snapshots, demographic_series, demographic_releases, demographic_observations | reference | Traffico aereo, clima, demografia, famiglie e residenti stranieri sono distribuiti da file; lo schema DB non prova l'importazione dei valori. |
| Atlante territoriale | Luogo, Osservazione, Rappresentazione geografica | `/atlante-territoriale` | files | — | reference | Geometrie e indicatori territoriali restano artefatti esterni: occorrono registro, release e precisione geografica. |
| Beni confiscati | Bene, Luogo, Rappresentazione geografica | `/beni-confiscati`, `/beni-confiscati/:slug` | api_and_files | confiscated_assets | gap | Il bene, il provvedimento e lo stato di riuso vanno separati mantenendo fonti e limiti di localizzazione. |
| Legalità ed eventi documentati | Evento documentato, Evidenza di evento, Raggruppamento documentato | `/legalita`, `/legalita/timeline` | api_and_files | crime_events, crime_sources, crime_event_sources, crime_public_events, legality_areas, legality_requirements | gap | LTCEDS esiste nel backend; il profilo RDF pubblico non ne copre ancora il modello. Eventi registrati non significa eventi approvati per la pubblicazione. |
| Trame Festival | Proposta civica, Persona, Documento | `/legalita/trame-festival` | files | — | gap | Programmi, persone, video, trascrizioni e schede curate restano fuori dalle tabelle applicative. |
| Proposte civiche | Proposta civica | `/proposte-civiche`, `/archivio-proposte` | files | — | reference | Esiste una classificazione PA nelle proposte; non va confusa con un'entità proposta persistita o un export RDF di tutte le schede. |
| Interventi locali valutati | Valutazione di intervento, Intervento di politica pubblica | `/interventi-locali`, `/interventi-locali/:id` | files | — | gap | Interventi, studi, risultati e limiti sono nei file TypeScript; modello e importazione DB ancora assenti. |
| Segnalazioni e monitoraggio | Segnalazione civica, Scheda di monitoraggio | `/monitoraggio`, `/monitoraggio/nuovo`, `/monitoraggio/:id`, `/criticita-pubbliche`, `/segnalazioni` | api_and_files | reports, monitoring_reports | gap | Segnalazione e analisi curata hanno responsabilità distinte; le due route di segnalazione non rappresentano due entità. |
| Accesso civico | Richiesta di accesso | `/accesso-civico` | api | accesso_civico_requests | gap | La richiesta è un procedimento con esiti, non un documento generico o un fatto verificato. |
| Bandi (percorsi precedenti) | Bando o avviso | `/bandi`, `/bandi/:slug` | redirect | bandi, bando_matches | gap | Le route reindirizzano; le tabelle restano nello schema. La presenza della route non prova una raccolta attiva. |
| Temi e domande | Classificazione, Contenuto redazionale | `/temi`, `/temi/:id`, `/domande` | api_and_files | themes, categories, questions, theme_documents, theme_posts | partial | Temi e categorie sono faccette editoriali, non nuove entità per ogni documento classificato. |
| Fonti e stato operativo | Fonte, Acquisizione | `/fonti-dati`, `/stato-monitoraggio`, `/feeds` | api_and_files | feed_status, source_acquisition_runs | reference | Metadati di stato e acquisizioni hanno significati diversi; un workflow riuscito non certifica la copertura della fonte. |
| Statistiche del servizio | Stato applicativo | `/statistiche` | api | shares, themes, publications | outside | Conteggi e attività del sito appartengono all'uso del servizio, non alle serie statistiche sulla città. |
| Iscrizioni | Stato applicativo | `/iscrizioni` | api | theme_followers | outside | Preferenze e iscrizioni sono stato applicativo riservato. |
| Orientamento, metodo e progetto | Contenuto redazionale | `/`, `/metodologia`, `/guida`, `/note-legali`, `/chi-siamo`, `/contatti`, `/roadmap` | editorial | — | outside | Pagine di orientamento e regole di lettura; non richiedono un'entità civica per ogni blocco di testo. |
| Sviluppatori e profilo semantico | Fonte, Classificazione | `/sviluppatori`, `/semantic/` | editorial | — | local | Documentazione tecnica e profilo RDF 1.2.0: le classi dichiarate coprono un sottoinsieme dei concetti, non certificano la persistenza o esportazione di tutti i record. |
| Archivio e redazione | Stato applicativo, Contenuto redazionale | `/admin`, `/admin/*`, `/admin/database`, `/redazione`, `/redazione/*` | api | page_blocks, site_strings, helper_overrides | outside | Interfacce riservate; la classificazione del catalogo non amplia i permessi di lettura. |

## Evidenze di implementazione

- **Albo e delibere**: [data/public/albo/latest.json](../../data/public/albo/latest.json), [data/public/albo/delibere-archive.json](../../data/public/albo/delibere-archive.json)

- **Atti fondamentali e pareri**: [artifacts/lamezia-trasparente/src/pages/AttiFondamentali.tsx](../../artifacts/lamezia-trasparente/src/pages/AttiFondamentali.tsx), [artifacts/lamezia-trasparente/src/pages/PareriVigilanza.tsx](../../artifacts/lamezia-trasparente/src/pages/PareriVigilanza.tsx)

- **Contratti e incarichi**: [artifacts/lamezia-trasparente/src/lib/staticContractsDataset.ts](../../artifacts/lamezia-trasparente/src/lib/staticContractsDataset.ts), [data/public/contracts/anac-bdncp/latest.json](../../data/public/contracts/anac-bdncp/latest.json)

- **Progetti PNRR**: [artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json](../../artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json), [artifacts/lamezia-trasparente/src/pages/Pnrr.tsx](../../artifacts/lamezia-trasparente/src/pages/Pnrr.tsx), [lib/db/src/canonicalPnrr.ts](../../lib/db/src/canonicalPnrr.ts)

- **Persone e organi**: [lib/db/src/institutional-officials-data.ts](../../lib/db/src/institutional-officials-data.ts), [artifacts/lamezia-trasparente/src/lib/institutionalStaticData.ts](../../artifacts/lamezia-trasparente/src/lib/institutionalStaticData.ts)

- **Sedute**: [artifacts/lamezia-trasparente/src/pages/Convocazioni.tsx](../../artifacts/lamezia-trasparente/src/pages/Convocazioni.tsx), [artifacts/lamezia-trasparente/src/data/councilSessionV0.ts](../../artifacts/lamezia-trasparente/src/data/councilSessionV0.ts)

- **Performance**: [artifacts/lamezia-trasparente/src/data/performanceObjectiveRegistry.ts](../../artifacts/lamezia-trasparente/src/data/performanceObjectiveRegistry.ts), [artifacts/lamezia-trasparente/src/pages/Performance.tsx](../../artifacts/lamezia-trasparente/src/pages/Performance.tsx)

- **Capacità e programma comunale**: [artifacts/lamezia-trasparente/src/data/macchinaComunale.ts](../../artifacts/lamezia-trasparente/src/data/macchinaComunale.ts), [artifacts/lamezia-trasparente/src/data/promessometro.ts](../../artifacts/lamezia-trasparente/src/data/promessometro.ts)

- **Catalogo e serie open data**: [artifacts/lamezia-trasparente/src/data/openDataDatasetRegistry.ts](../../artifacts/lamezia-trasparente/src/data/openDataDatasetRegistry.ts), [artifacts/lamezia-trasparente/src/data/generated](../../artifacts/lamezia-trasparente/src/data/generated)

- **Atlante territoriale**: [data/processed/territorio](../../data/processed/territorio), [artifacts/lamezia-trasparente/src/pages/AtlanteTerritoriale.tsx](../../artifacts/lamezia-trasparente/src/pages/AtlanteTerritoriale.tsx)

- **Beni confiscati**: [data/curated/territorio/beni_confiscati_lamezia_pilot.json](../../data/curated/territorio/beni_confiscati_lamezia_pilot.json), [artifacts/lamezia-trasparente/src/pages/BeniConfiscati.tsx](../../artifacts/lamezia-trasparente/src/pages/BeniConfiscati.tsx)

- **Legalità ed eventi documentati**: [lib/db/src/schema/crimeEvents.ts](../../lib/db/src/schema/crimeEvents.ts), [artifacts/lamezia-trasparente/src/pages/Legalita.tsx](../../artifacts/lamezia-trasparente/src/pages/Legalita.tsx)

- **Trame Festival**: [data/legalita/trame/trame_events.csv](../../data/legalita/trame/trame_events.csv), [data/legalita/trame/trame_people.csv](../../data/legalita/trame/trame_people.csv), [data/legalita/trame/public_cards/trame_public_cards.public.json](../../data/legalita/trame/public_cards/trame_public_cards.public.json)

- **Proposte civiche**: [artifacts/lamezia-trasparente/src/data/propostePubblicheCore.ts](../../artifacts/lamezia-trasparente/src/data/propostePubblicheCore.ts), [artifacts/lamezia-trasparente/src/data/proposalPaSemanticProfile.ts](../../artifacts/lamezia-trasparente/src/data/proposalPaSemanticProfile.ts)

- **Interventi locali valutati**: [artifacts/lamezia-trasparente/src/data/evidenceInterventionsArchive.ts](../../artifacts/lamezia-trasparente/src/data/evidenceInterventionsArchive.ts)

- **Segnalazioni e monitoraggio**: [artifacts/lamezia-trasparente/src/pages/Reports.tsx](../../artifacts/lamezia-trasparente/src/pages/Reports.tsx), [artifacts/lamezia-trasparente/src/pages/Monitoraggio.tsx](../../artifacts/lamezia-trasparente/src/pages/Monitoraggio.tsx)

- **Accesso civico**: [artifacts/lamezia-trasparente/src/pages/AccessoCivico.tsx](../../artifacts/lamezia-trasparente/src/pages/AccessoCivico.tsx)

- **Bandi (percorsi precedenti)**: [artifacts/lamezia-trasparente/src/Router.tsx](../../artifacts/lamezia-trasparente/src/Router.tsx)

- **Temi e domande**: [artifacts/lamezia-trasparente/src/pages/Themes.tsx](../../artifacts/lamezia-trasparente/src/pages/Themes.tsx), [artifacts/lamezia-trasparente/src/pages/Domande.tsx](../../artifacts/lamezia-trasparente/src/pages/Domande.tsx)

- **Fonti e stato operativo**: [artifacts/lamezia-trasparente/src/data/sourceHealth.ts](../../artifacts/lamezia-trasparente/src/data/sourceHealth.ts), [artifacts/lamezia-trasparente/src/pages/FontiDati.tsx](../../artifacts/lamezia-trasparente/src/pages/FontiDati.tsx)

- **Statistiche del servizio**: [artifacts/lamezia-trasparente/src/pages/Statistics.tsx](../../artifacts/lamezia-trasparente/src/pages/Statistics.tsx)

- **Iscrizioni**: [artifacts/lamezia-trasparente/src/pages/Subscriptions.tsx](../../artifacts/lamezia-trasparente/src/pages/Subscriptions.tsx)

- **Orientamento, metodo e progetto**: [artifacts/lamezia-trasparente/src/Router.tsx](../../artifacts/lamezia-trasparente/src/Router.tsx)

- **Sviluppatori e profilo semantico**: [artifacts/lamezia-trasparente/public/semantic/ontology.ttl](../../artifacts/lamezia-trasparente/public/semantic/ontology.ttl), [artifacts/api-server/src/lib/semanticProfile.ts](../../artifacts/api-server/src/lib/semanticProfile.ts), [artifacts/lamezia-trasparente/public/semantic/index.html](../../artifacts/lamezia-trasparente/public/semantic/index.html), [artifacts/lamezia-trasparente/public/semantic/ontology.ttl](../../artifacts/lamezia-trasparente/public/semantic/ontology.ttl)

- **Archivio e redazione**: [artifacts/lamezia-trasparente/src/pages/AdminDatabase.tsx](../../artifacts/lamezia-trasparente/src/pages/AdminDatabase.tsx)
