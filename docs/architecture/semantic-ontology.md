# Profilo semantico federato di Lamezia Trasparente

**Stato:** baseline architetturale v0.1  
**Data:** 2026-09-02  
**Issue:** #920  
**Ambito:** modello semantico e mapping; nessuna migrazione DB, modifica API o UI.

## Decisione

Lamezia Trasparente adotta un **profilo semantico federato**, non una nuova ontologia monolitica e non un'importazione indiscriminata di ontologie esterne.

Il profilo usa come riferimento primario per il dominio della pubblica amministrazione italiana le risorse semantiche nazionali pubblicate nel repository `italia/dati-semantic-assets` e nel catalogo `schema.gov.it`. Tali risorse sono già organizzate in livelli core, di supporto e di dominio e includono ontologie direttamente pertinenti alla piattaforma: `l0`, `CPV`, `COV`, `RO`, `CLV`, `TI`, `Transparency`, `PublicContract`, `Project`, `Indicator`, `CPSV`, `CPEV` e `DCAT`.

Il profilo italiano viene integrato, dove necessario, con:

- specifiche SEMIC dell'Unione europea per interoperabilità transfrontaliera;
- W3C/OGC per organizzazioni, provenance, tassonomie, tempo e geometrie;
- eProcurement Ontology e OCDS per il ciclo di procurement;
- BODS per ownership/control e per il modello a statement;
- FollowTheMoney per il modello operativo di entity graph e le relazioni utili alla ricerca;
- ELI/ELI-DL per risorse giuridiche e processi legislativi solo quando semanticamente applicabili;
- CCCEV per criteri, requisiti ed evidenze;
- Popolo/ORG-EP come riferimenti per cariche, membership e attività assembleari;
- LinkML come eventuale linguaggio di authoring/validazione del profilo, non come ontologia di dominio;
- Nomenklatura/Yente come riferimenti implementativi per entity resolution, non come vocabolario canonico.

La regola di precedenza è:

```text
semantica PA italiana
    -> interoperabilità europea/internazionale
        -> estensione specialistica di dominio
            -> estensione locale Lamezia Trasparente
```

Una fonte specialistica può ampliare il modello, ma non deve ridefinire un concetto già coperto in modo adeguato dal profilo italiano.

## Perché una federazione e non una sola ontologia

Le ontologie considerate hanno obiettivi diversi. `CPV` descrive persone; `COV` organizzazioni; `RO` ruoli che possono evolvere nel tempo; `Transparency-AP_IT` obblighi, attività e risorse di trasparenza; `PublicContract-AP_IT` il procurement italiano; `Project-AP_IT` i progetti pubblici e il CUP; BODS proprietà e controllo; FollowTheMoney un grafo pragmatico per ricerca investigativa; DCAT dataset e distribuzioni; PROV-O la provenienza.

Forzare tutti questi concetti in una gerarchia unica produrrebbe equivalenze false e classi troppo specializzate. Lamezia Trasparente deve invece mantenere una piccola identità canonica e applicare **facette e relazioni indipendenti**.

Esempio: una società partecipata può essere simultaneamente una `Organization`, una organizzazione privata dal punto di vista della forma giuridica, un soggetto controllato da un ente pubblico dal punto di vista dell'ownership, un `supplier` in uno specifico contratto e un beneficiario/partecipante in uno specifico progetto. Nessuna di queste dimensioni deve sovrascrivere le altre.

## Livelli del profilo

### L0 — fondazione

Il profilo assume `OntoPiA l0` come riferimento fondazionale per concetti generali come `Entity`, `Agent`, `Object` ed `EventOrSituation`. Non è necessario replicare queste classi nel database: il modello relazionale può continuare a usare nomi pragmatici, purché il mapping semantico sia esplicito.

Elementi trasversali:

| Funzione | Riferimento primario | Riferimenti complementari |
| --- | --- | --- |
| fondazione | OntoPiA `l0` | PROV-O per Agent/Entity/Activity nel solo contesto di provenance |
| tempo | OntoPiA `TI` | W3C OWL-Time per interoperabilità e relazioni temporali |
| provenance | W3C PROV-O | modello statement BODS; provenance per valore di FollowTheMoney |
| tassonomie/codelist | W3C SKOS | vocabolari controllati OntoPiA e EU Publications Office |
| luogo/indirizzo | OntoPiA `CLV` | SEMIC Core Location; GeoSPARQL 1.1 per geometrie |
| identificatori | identificatore qualificato da scheme | URI/identifier dei profili OntoPiA/SEMIC |

`prov:Entity` non va confuso con l'entità civica canonica: in PROV il termine indica un oggetto della provenance. Il registry interno `entities` avrà quindi una propria semantica applicativa e mapping espliciti verso le classi di dominio.

### L1 — identità e organizzazione

Il nucleo identitario riusa:

- `CPV-AP_IT` per `Person`;
- `COV-AP_IT` per `Organization`, `PublicOrganization`, `PrivateOrganization`, unità e struttura organizzativa;
- `RO-AP_IT` per `Role` e `TimeIndexedRole`;
- `CLV-AP_IT` per indirizzi e localizzazioni.

`COV-AP_IT` possiede già allineamenti verso W3C ORG, Core Public Organisation Vocabulary, Registered Organization, Schema.org ed ePO. Tali mapping hanno precedenza sui mapping locali duplicati.

#### Regola ruoli

Un ruolo non è una sottoclasse della persona o dell'organizzazione.

```text
Person: Mario Rossi
  -> RoleAssignment / TimeIndexedRole
       role: Sindaco
       context: Comune di Lamezia Terme
       valid_from: ...
       valid_to: ...
       statement/source: ...
```

Lo stesso pattern vale per assessore, consigliere, dirigente, responsabile di ufficio, amministratore di società, presidente, componente di commissione e altri ruoli contestuali.

### L2 — domini civico-amministrativi

#### Trasparenza amministrativa

`Transparency-AP_IT` è il riferimento primario. I concetti centrali sono:

- `TransparencyObligation`;
- `TransparencyDataTypology`;
- `TransparencySubject`;
- `TransparencyActivity`;
- `TransparencyResource`.

La tassonomia locale `area_theme` non viene sostituita: è una facetta editoriale di navigazione. Gli obblighi normativi di trasparenza e le sezioni di Amministrazione Trasparente devono invece essere collegati ai vocabolari controllati ufficiali del profilo italiano quando disponibili.

#### Contratti pubblici

`PublicContract-AP_IT` è il profilo nazionale di base. Esso già allinea classi quali `Procedure`, `Lot`, `Tender`, `Contract`, `Notice` e `AwardCriterion` alla eProcurement Ontology europea.

La eProcurement Ontology può estendere il dettaglio quando il profilo nazionale non copre una fase o una relazione necessaria. OCDS resta particolarmente utile come **modello di scambio/ingestione** e per il concetto di party con ruoli; non diventa il top-level ontology della piattaforma.

Il fornitore non deve restare una stringa strutturalmente isolata: a regime deve essere un riferimento a una entità `Organization` con una partecipazione al procurement e un ruolo (`supplier`, `tenderer`, `buyer`, ecc.) riferito alla procedura, al lotto o al contratto pertinente.

#### Progetti e PNRR

`Project-AP_IT` è il riferimento nazionale. Modella `PublicInvestmentProject`, `Programme`, `Call`, partecipanti e `UniqueProjectCode` (CUP). Il CUP è quindi un identificatore del progetto, non la chiave di una scheda di presentazione: più record di fonte con lo stesso CUP devono poter convergere sulla stessa entità progetto senza perdere la provenienza originaria.

#### Open Data

Dataset, serie, distribuzioni e servizi dati vengono descritti tramite DCAT/DCAT-AP e relativo profilo italiano. La tassonomia civica serve alla navigazione; non sostituisce i metadati DCAT.

#### Performance e indicatori

`Indicator-AP_IT` fornisce `Indicator`, `IndicatorCalculation`, `Metric` e `Parameter`, con metodo, frequenza e temporalità del calcolo. Questo consente di separare stabilmente la **definizione dell'indicatore** dalla **singola osservazione/calcolo**.

Per serie statistiche multidimensionali si può aggiungere RDF Data Cube/SDMX come proiezione di interoperabilità, senza imporlo alle tabelle operative.

#### Organi, sedute e voti

Gli organi e le unità amministrative si appoggiano a `COV`/W3C ORG; le membership e le cariche a `RO`. Le sedute sono eventi e possono essere allineate a CPEV quando appropriato. Popolo e il profilo ORG-EP del Parlamento europeo sono riferimenti utili per pattern di membership, post, mandato e attività assembleare.

Una votazione non è un attributo permanente della persona: è una partecipazione/decisione riferita a una seduta, un oggetto sottoposto a voto e una fonte.

#### Atti e documenti

Lamezia Trasparente mantiene una classe applicativa `AdministrativeAct`/`InformationResource` per gli atti comunali. ELI/ELI-DL si applica solo quando la risorsa soddisfa davvero la semantica di risorsa giuridica o processo normativo; non ogni determina o documento amministrativo viene dichiarato `eli:LegalResource` per comodità.

Dublin Core Terms e PROV-O restano gli strati generici per titolo, emittente, data, relazione documentale, versione e derivazione.

#### Beni confiscati e altri asset

La classe canonica è `Asset`, con specializzazioni utili come immobile o altro bene. La confisca, il sequestro, l'assegnazione o il riuso sono **misure/eventi/status documentati e temporalizzati**, non attributi ontologici eterni del bene.

Il modello di asset di FollowTheMoney è un riferimento operativo. CLV e GeoSPARQL descrivono la componente geografica. Ogni misura deve conservare fonte e qualificazione giuridico-amministrativa senza inferire responsabilità individuali.

### L3 — ownership, controllo e investigative graph

Il profilo PA non copre a sufficienza ownership e controllo societario. Qui Lamezia Trasparente integra due modelli complementari.

**BODS** è il riferimento semantico per beneficial ownership/control e per il principio secondo cui una fonte pubblica uno `statement` su una persona, entità o relazione in un dato momento. Questo è utile anche oltre la beneficial ownership perché impedisce di confondere automaticamente un'affermazione di fonte con la verità canonica corrente.

**FollowTheMoney** è il riferimento pragmatico per la tassonomia di relazioni usata in entity graph: `Person`, `Organization`, `Company`, `PublicBody`, `Ownership`, `Directorship`, asset, pagamenti, contratti, eventi e documenti. Viene usato come **profilo operativo/investigativo**, non come autorità semantica primaria per concetti già coperti da OntoPiA.

Il modello locale conserva quindi due livelli:

```text
source record -> statement/claim -> entity or relationship asserted
                               -> canonical projection after resolution/curation
```

Fonti diverse possono sostenere valori diversi senza che l'ingestione sovrascriva silenziosamente la storia precedente.

## Classi canoniche minime

La prima versione del registry non deve moltiplicare le classi. La tassonomia minima proposta è:

| Classe applicativa | Base semantica | Nota |
| --- | --- | --- |
| `Person` | CPV-AP_IT Person | identità naturale, non ruolo |
| `Organization` | COV-AP_IT Organization | supertipo operativo |
| `PublicOrganization` | COV-AP_IT PublicOrganization | PA/organizzazioni pubbliche |
| `PrivateOrganization` | COV-AP_IT PrivateOrganization | imprese e altre organizzazioni private |
| `Place` | CLV-AP_IT | luogo/indirizzo; geometria separata |
| `Asset` | estensione locale + FtM | proprietà e misure come relazioni/eventi |
| `Project` | Project-AP_IT PublicInvestmentProject | CUP come identificatore |
| `ProcurementProcess` | PublicContract Procedure + ePO | processo, non fornitore |
| `PublicContract` | PublicContract Contract + ePO | contratto aggiudicato/stipulato |
| `Event` | l0 EventOrSituation + CPEV quando applicabile | sedute, eventi, cambiamenti |
| `InformationResource` | estensione locale + DCT/PROV | documenti e risorse informative |
| `AdministrativeAct` | estensione locale | ELI solo se semanticamente giustificato |
| `Dataset` | DCAT Dataset | metadati Open Data |
| `Indicator` | Indicator-AP_IT Indicator | definizione, distinta dal calcolo |
| `TransparencyObligation` | Transparency-AP_IT | obbligo normativo |
| `TransparencyResource` | Transparency-AP_IT | risorsa pubblicata per adempimento |

`Role`, `TimeIndexedRole`, `Ownership`, `ProcurementParticipation`, `ProjectParticipation`, `MeasureOnAsset`, `Statement` e `EntityResolutionDecision` sono invece **relazioni o entità associative**: non devono essere trattate come tipi permanenti del soggetto.

## Relazioni canoniche

Le relazioni che portano attributi, tempo o provenance devono essere reificate in record propri. La baseline comprende almeno questi pattern:

| Pattern | Attributi tipici |
| --- | --- |
| `RoleAssignment` | agent, role, context, valid_from, valid_to, source/statement |
| `Ownership` | owner, owned entity/asset, direct/indirect, share, control type, valid time, source |
| `ProcurementParticipation` | agent, procedure/lot/contract, role, amount se pertinente, valid time, source |
| `ProjectParticipation` | agent, project, role, period, source |
| `AssetMeasure` | asset, measure type, authority, date/period, legal/administrative basis, source |
| `DocumentRelation` | source resource, target resource/entity, relation type, source |
| `EntityMention` | information resource, entity, extraction/matching basis; non implica altra relazione |
| `Statement` | asserting source/agent, subject, predicate, object/value, asserted/valid time, status |

Un semplice `mentioned_in` non autorizza a inferire `owns`, `directs`, `member_of`, `supplier_in` o altre relazioni sostanziali.

## Provenance e statement

Il sistema distingue quattro oggetti:

1. **source** — la fonte o il sistema originario;
2. **source record** — il record/documento acquisito, immutabile o versionato;
3. **statement/claim** — ciò che quel record afferma;
4. **canonical projection** — la vista riconciliata che la piattaforma espone quando il dato è sufficientemente determinato.

PROV-O descrive derivazione, generazione e attribuzione. Il pattern BODS ispira la gestione di statement potenzialmente sovrapposti o confliggenti. La piattaforma non elimina il dato precedente quando una fonte cambia: registra la nuova osservazione e aggiorna, se necessario, la proiezione canonica.

Ogni relazione sostanziale dovrebbe poter rispondere almeno a:

```text
chi/cosa lo afferma?
da quale record deriva?
quando è stato osservato?
per quale periodo è dichiarato valido?
è un dato di fonte, un mapping deterministico o una decisione editoriale?
```

## Entity resolution

Il registry canonico non deve fondere entità in base al solo nome.

Ordine di forza dei segnali:

```text
identificatore ufficiale qualificato e compatibile
    > combinazione di identificatori/attributi forti
        > nome + indirizzo/contesto
            > similarità del nome soltanto
```

Gli identificatori sono sempre coppie `(scheme, value)`; `12345` senza scheme non è un identificatore interoperabile. Esempi di scheme utili possono includere IPA, REA, partita IVA/codice fiscale quando lecitamente trattabili, LEI, CUP, CIG e identificativi specifici delle fonti.

Le decisioni di resolution sono dati auditabili:

```text
same_entity
not_same_entity
possible_match
needs_review
```

Una decisione manuale registra motivazione, autore/curatore, data e record confrontati. Nomenklatura/Yente sono riferimenti implementativi per questo workflow.

## Controlled vocabularies

Le classificazioni non devono proliferare come stringhe arbitrarie. Quando esiste un vocabolario nazionale o UE autorevole viene riusato; altrimenti Lamezia Trasparente pubblica un `skos:ConceptScheme` locale versionato.

Ogni concept locale dispone di ID stabile e label modificabile tra versioni. I mapping fra concept scheme usano `skos:exactMatch`, `skos:closeMatch`, `skos:broadMatch` o `skos:narrowMatch` solo quando la semantica lo consente.

`owl:equivalentClass` e `owl:equivalentProperty` sono riservati a equivalenze realmente dimostrate. Per gli altri casi si usano `rdfs:subClassOf`, mapping SKOS o una relazione di mapping documentale non inferenziale.

Il registro dei mapping di Lamezia segue lo stesso principio del repository SEMIC `Semantic-Mappings`: ogni riga dichiara termine locale, termine esterno, forza del mapping, versione della specifica, stato e motivazione.

## Integrazione non distruttiva con lo schema corrente

La baseline non modifica le tabelle esistenti. La futura integrazione deve essere additiva e procedere tramite bridge.

| Dominio corrente | Proiezione semantica iniziale | Migrazione futura |
| --- | --- | --- |
| `officials` | `Person` + ruolo corrente/storico | separare identità personale da `RoleAssignment` |
| `organi` | `Organization`/unità/gruppo secondo natura | classificazione dell'organo senza forzare un unico tipo |
| `organi_members` | `TimeIndexedRole`/membership | riuso diretto del pattern temporale |
| `contracts` | Procedure/Contract + party participation | sostituire progressivamente `supplier` string con entity link mantenendo il testo di fonte |
| PNRR/ItaliaDomani | `PublicInvestmentProject` | CUP come identifier, source records separati |
| `confiscatedAssets` | `Asset` + `AssetMeasure` | separare bene da misura/status e fonte |
| `opendata*` | DCAT Dataset/Distribution | aggiungere mapping semantico ai metadati esistenti |
| `performanceIndicators*` | Indicator/Calculation/Metric | separare definizione e osservazioni |
| `acts`/`publications` | InformationResource/AdministrativeAct | ELI selettivo; provenance documentale |
| `sedute` | Event/PublicEvent | collegare partecipanti, organo, atti e voti |
| `accessoCivico` | processo/interazione amministrativa | CPSV per il servizio, modello locale per la singola istanza |

La compatibilità retroattiva si ottiene con un bridge del tipo `entity_source_links`, non riscrivendo i record verticali al primo passaggio.

## Schema relazionale target indicativo

Questo non è ancora uno schema da migrare; serve a verificare che l'ontologia sia materializzabile in PostgreSQL/Drizzle senza imporre un triplestore.

```text
entities
entity_names
entity_identifiers
entity_source_links
sources
source_records
statements
entity_relationships
entity_resolution_decisions
concept_schemes
concepts
concept_mappings
```

Le tabelle di dominio restano dove apportano struttura e vincoli utili. Il registry semantico collega i domini anziché rimpiazzarli.

## Serializzazioni e API

PostgreSQL/Drizzle rimane la sorgente operativa. La semantica può essere esposta progressivamente come:

- JSON REST con ID canonici e relazioni;
- JSON-LD tramite un context versionato;
- export RDF/Turtle per riuso specialistico;
- grafo di navigazione nel frontend;
- MCP/read-only API sulla stessa canonical projection.

Non è richiesto introdurre Neo4j o un triple store per adottare il modello. Un graph store potrà essere valutato solo se query e volumi lo giustificheranno.

## Validazione

Il profilo deve essere validabile indipendentemente dal database. La soluzione preferita è mantenere una specifica machine-readable versionata e generare/controllare almeno:

- JSON Schema o Zod per le proiezioni applicative;
- SHACL per la proiezione RDF;
- test di mapping per i bridge dalle tabelle verticali;
- test di idempotenza e round-trip degli identificatori.

LinkML è un candidato per authoring e generazione di JSON Schema/OWL/SHACL, ma non deve diventare una dipendenza runtime del frontend/API. L'adozione richiede una issue separata e una prova che non duplichi inutilmente gli schemi TypeScript/Zod già presenti.

## Guardrail civici e privacy

Il grafo non è un grafo di sospetto. Una relazione compare solo se rappresenta un dato pubblico/documentato o una relazione editoriale esplicitamente qualificata. Nessuna connessione, prossimità, ricorrenza, co-occorrenza o appartenenza produce automaticamente un giudizio di rischio o illecito.

Gli identificatori personali e gli attributi sensibili passano sempre attraverso le regole esistenti di public-safety e minimizzazione. Il fatto che una proprietà sia prevista da CPV/BODS/FtM non costituisce di per sé una base per pubblicarla.

## Versioning

Il profilo viene versionato per moduli, ad esempio:

```text
lt-core.v1
lt-agents.v1
lt-organisations.v1
lt-roles.v1
lt-procurement.v1
lt-projects.v1
lt-transparency.v1
lt-documents.v1
lt-assets.v1
lt-provenance.v1
lt-statistics.v1
```

Un cambio di label o mapping non cambia l'identità locale. Una modifica incompatibile della semantica richiede una nuova major del modulo interessato.

## Fonti normative e tecniche della baseline

- Italia / National Data Catalog — `https://github.com/italia/dati-semantic-assets`
- SEMIC — `https://github.com/SEMICeu`
- SEMIC Semantic Mappings — `https://github.com/SEMICeu/Semantic-Mappings`
- W3C PROV-O — `https://www.w3.org/TR/prov-o/`
- W3C Organization Ontology — `https://www.w3.org/TR/vocab-org/`
- W3C SKOS — `https://www.w3.org/TR/skos-reference/`
- OGC GeoSPARQL — `https://opengeospatial.github.io/ogc-geosparql/`
- EU eProcurement Ontology — `https://docs.ted.europa.eu/EPO/latest/`
- Open Contracting Data Standard — `https://standard.open-contracting.org/`
- Open Ownership BODS — `https://standard.openownership.org/`
- FollowTheMoney — `https://github.com/opensanctions/followthemoney`
- European Parliament ORG-EP — `https://github.com/europarl/org-ep`
- European Parliament ELI-EP — `https://github.com/europarl/eli-ep`
- LinkML — `https://github.com/linkml/linkml`

## Passo successivo

La prossima issue deve tradurre questa baseline in un **contratto machine-readable locale**, con mapping verificabili e fixture minime per almeno: una persona con due ruoli temporali, una società fornitrice, un contratto con CIG/CUP, un progetto PNRR, un dataset, un bene con misura amministrativa/giudiziaria e due source statement potenzialmente divergenti. Solo dopo il superamento di questi casi va proposta la prima migrazione additiva del registry `entities`.