# Validazione del profilo semantico federato — v0.2

**Issue:** #928  
**Baseline:** `docs/architecture/semantic-profile.v0.1.yaml`  
**Profilo validato:** `docs/architecture/semantic-profile.v0.2.yaml`  
**Fixture:** `docs/architecture/semantic-fixtures.v0.2.yaml`  
**Data:** 2026-09-03

## Esito

La baseline v0.1 supera lo stress-test senza contraddizioni e senza richiedere una riscrittura del modello. I casi già presenti nel repository richiedono però cinque raffinamenti additivi prima di progettare lo schema runtime:

1. `EventParticipation` va separato da `RoleAssignment`;
2. `AssetStateAssertion` va separato da `AssetMeasure`;
3. `IndicatorObservation` va separato da `Indicator`;
4. identità dell'entità e forza della relazione devono avere stati indipendenti;
5. i collegamenti documentali deterministici devono essere modellati come `EvidenceLink`, distinti dalle mere `EntityMention`.

Il risultato è quindi **pass con raffinamenti additivi**. Non è ancora autorizzata una migrazione DB.

## Metodo

La validazione usa esclusivamente strutture, record e policy già presenti nel repository. Non vengono introdotti dati esterni per completare artificialmente i casi.

In particolare:

- i dati istituzionali sono letti dal layer curato con fonti comunali/Maggioli;
- il caso PNRR usa il feed materializzato comunale con arricchimento OpenCUP;
- il test sui beni confiscati usa il contratto corrente e la policy di cleanup, non i vecchi record dimostrativi;
- il test sugli indicatori usa il catalogo e lo schema dei valori già adottati;
- il test Open Data usa il contratto dataset/distribuzioni già presente nel repository.

Non sono state usate come evidenza le righe seed dichiarate fittizie. In particolare il repository contiene una routine che rimuove cinque vecchi beni confiscati dimostrativi se sono rimasti invariati: questa scelta è trattata come un vincolo metodologico, non come una fonte di dati sul territorio.

## Matrice sintetica

| Caso | v0.1 | Esito | Raffinamento v0.2 |
| --- | --- | --- | --- |
| candidatura elettorale 2025 | parzialmente coperto | pass | `EventParticipation` |
| PNRR: Comune + OpenCUP stesso CUP | coperto | pass | nessuno |
| società nominate nei titoli di affidamento | coperto ma non abbastanza esplicito | pass | identità e forza relazione separate |
| Albo ↔ PNRR tramite CUP | parzialmente coperto | pass | `EvidenceLink` |
| bene confiscato con solo stato corrente | troppo vicino ad `AssetMeasure` | pass | `AssetStateAssertion` |
| indicatore ISTAT + valori per periodo | definizione coperta | pass | `IndicatorObservation` |
| dataset + distribuzioni Open Data | coperto | pass | nessuno |

## 1. Persona: candidatura elettorale non equivale a carica

### Input del repository

`lib/db/src/institutional-officials-data.ts` conserva il contesto elettorale 2025 separatamente dai profili istituzionali. Un caso esplicito è `doris-lo-moro`, registrata come `candidato_sindaco` nel documento Maggioli dei totali per il sindaco.

La v0.1 disponeva di `Person`, `RoleAssignment` e `Event`, ma il test mette in luce un rischio: usare `RoleAssignment` per qualsiasi relazione persona-contesto sarebbe troppo ampio.

### Decisione

La candidatura viene modellata come:

```text
Person
  -> EventParticipation
       event = elezione comunale 2025
       participation_role = mayoral_candidate
       source_statement = documento elettorale
```

Non viene modellata come:

```text
Person -> RoleAssignment -> Mayor
```

finché una fonte distinta non attesta l'effettiva carica.

### Perché conta

La distinzione evita di confondere:

- candidatura;
- elezione;
- proclamazione;
- carica istituzionale;
- appartenenza a un organo.

Sono eventi o relazioni diverse e possono avere fonti e periodi diversi.

**Esito:** v0.1 confermata; aggiunto `EventParticipation`.

## 2. PNRR: un progetto canonico, più source record

### Input del repository

Il feed PNRR materializzato contiene il progetto comunale con `source_id = 3226`:

- titolo comunale: *Investimento 1.2 “Abilitazione al cloud per le PA Locali” Comuni Aprile 2022*;
- CUP: `C81C22001090006`;
- attuatore: `Comune di Lamezia Terme`;
- importo: 419.124 euro.

Lo stesso oggetto contiene un record OpenCUP distinto:

- CUP: `C81C22001090006`;
- titolo OpenCUP differente;
- costo totale e finanziamento pubblico: 419.124 euro;
- anno decisione: 2022;
- stato CUP: `ATTIVO`;
- titolare: `COMUNE DI LAMEZIA TERME - CZ -`;
- codice fiscale del titolare: `00301390795`.

### Decisione

Il CUP è l'identificatore qualificato del `Project`, mentre i due payload restano `SourceRecord` separati.

```text
Project[CUP=C81C22001090006]
   ^                         ^
   |                         |
municipal SourceRecord   OpenCUP SourceRecord
```

I titoli non vengono normalizzati distruttivamente in un unico valore sorgente: possono alimentare una proiezione canonica, ma restano attribuiti alla rispettiva fonte.

Lo stesso vale per l'organizzazione comunale: la variante nominale OpenCUP non deve generare una seconda organizzazione solo per differenze di stringa. Il codice fiscale qualificato fornisce un identificatore forte nel record OpenCUP; l'eventuale riconciliazione con altri record del Comune deve comunque registrare la base della decisione.

### Guardrail

`cup_status = ATTIVO` è lo stato del CUP e non lo stato di avanzamento dei lavori. Il feed lo dichiara già esplicitamente nei propri caveat. La semantica v0.2 mantiene quindi distinti:

- stato dell'identificatore CUP;
- stato amministrativo del progetto;
- avanzamento fisico;
- avanzamento finanziario;
- classificazione documentale degli allegati.

**Esito:** pass senza modifica del core.

## 3. Società nei documenti: relazione esplicita, identità ancora incerta

### Input del repository

Tra gli allegati del progetto cloud compaiono titoli quali:

- `Affidamento a soc.Register spa ...`;
- `Affidamento a soc. Microvision srl ...`;
- `Affidamento a soc. Maggioli spa ...`;
- `Affidamento a soc.Tinn srl ...`.

Il titolo della fonte offre una base concreta per estrarre un'evidenza di affidamento, ma non contiene da solo un identificatore societario qualificato.

### Problema emerso

Due domande non devono essere compresse in un unico confidence score:

1. **quanto è forte l'affermazione della relazione?**
2. **quanto è sicura l'identità della società nominata?**

Un titolo può essere molto esplicito sulla relazione e al contempo insufficiente per decidere quale specifica persona giuridica sia la controparte canonica.

### Decisione

La v0.2 mantiene due assi indipendenti:

```text
relation_assertion_status = source_explicit
entity_resolution_status  = unresolved
```

Fino alla risoluzione dell'identità, il nome resta una `EntityMention` collegata al documento. Una `ProcurementParticipation` canonica può essere promossa solo conservando lo statement sorgente e una decisione di entity resolution auditabile.

**Esito:** pass con raffinamento.

## 4. Evidenza PNRR: CUP sì, semplice richiamo testuale no

### Input del repository

Il feed PNRR dichiara una regola di riconciliazione già prudenziale: gli atti dell'Albo vengono collegati a una scheda progetto esclusivamente quando condividono lo stesso CUP normalizzato; i soli richiami testuali al PNRR restano evidenze non riconciliate.

### Decisione

La regola diventa un pattern semantico generale:

```text
same normalized CUP
   -> EvidenceLink(match_basis = qualified_identifier_exact)

text-only PNRR mention
   -> EntityMention / unlinked evidence
```

Questo pattern è riusabile anche oltre il PNRR: la piattaforma deve poter spiegare **perché** due oggetti sono collegati, separando il link probatorio/documentale da una relazione sostanziale fra gli attori.

**Esito:** pass; introdotto `EvidenceLink`.

## 5. Beni confiscati: lo stato non è una timeline

### Input del repository

`confiscatedAssets.ts` ammette quattro stati:

- `sequestrato`;
- `confiscato`;
- `assegnato`;
- `riutilizzato`.

Il record conserva inoltre origine `manual`/`auto`, `sourceId`, assegnatario, destinazione d'uso e geolocalizzazione.

Il repository contiene anche un cleanup esplicito che rimuove cinque vecchie righe dimostrative dichiarate fittizie. Le fixture v0.2 non usano quei contenuti come casi territoriali reali.

### Problema emerso

La v0.1 aveva già stabilito correttamente che confisca e riuso non sono tipi permanenti di asset, ma il solo `AssetMeasure` rischiava di spingere l'implementazione futura a trasformare uno stato corrente in un evento storico.

Esempio da evitare:

```text
status = riutilizzato
=> inventare automaticamente:
   sequestro -> confisca -> assegnazione -> riuso
```

Il database corrente non fornisce necessariamente le date di ciascun passaggio.

### Decisione

Si introducono due pattern:

**`AssetStateAssertion`**
: ciò che una fonte afferma sullo stato osservato/corrente del bene.

**`AssetMeasure`**
: un atto o evento storico documentato, con data o precisione temporale esplicita.

Un `AssetStateAssertion` non genera automaticamente gli `AssetMeasure` precedenti.

**Esito:** pass con raffinamento sostanziale ma additivo.

## 6. Indicatori: definizione e osservazione sono oggetti diversi

### Input del repository

Il catalogo performance contiene l'indicatore `popolazione-residente`:

- titolo: `Popolazione residente`;
- unità: `abitanti`;
- fonte: `ISTAT`;
- aggiornamento: `automatic`;
- polarità: `neutral`;
- chiave esterna: `istat:22_289:A.079160.JAN.9.TOTAL.99`.

Lo schema `performance_indicator_values` conserva invece, per ogni valore:

- `period`;
- `value`;
- `note`;
- flag `manual`;
- `source`.

### Decisione

```text
Indicator
  popolazione-residente
       |
       +-- IndicatorObservation(period=..., value=..., source=...)
       +-- IndicatorObservation(period=..., value=..., source=...)
       +-- ...
```

La polarità appartiene alla semantica di lettura dell'indicatore, non al valore osservato. Una correzione manuale non deve cancellare la provenance del valore precedente: deve essere rappresentabile come nuovo/revisionato statement o metadato di provenance dell'osservazione.

L'`IndicatorObservation` resta una estensione applicativa locale in v0.2; prima di fissarne un mapping RDF definitivo va confrontato il modello OntoPiA Indicator con un pattern interoperabile per le osservazioni, ad esempio SDMX/RDF Data Cube o SOSA/SSN quando appropriato. Non viene dichiarata oggi una equivalenza OWL.

**Esito:** pass con raffinamento.

## 7. Open Data: Dataset e Distribution

### Input del repository

Lo schema `opendata_datasets` conserva già identificativo di fonte, titolo, descrizione, categoria, tema DCAT-AP, frequenza, licenza, titolare, URL del portale, tag, numero di risorse e data di modifica dei metadati.

### Decisione

La struttura è compatibile con la distinzione già adottata:

```text
Dataset
  -> Distribution
  -> Distribution
```

Una serializzazione JSON e una GeoJSON dello stesso oggetto non diventano due dataset soltanto perché hanno formati diversi. `holderName` resta una stringa di fonte finché non è effettuata una entity resolution verso `Organization`.

**Esito:** pass senza raffinamento del profilo.

## Raffinamenti consolidati nella v0.2

### Associazioni

La famiglia delle associazioni diventa:

```text
RoleAssignment
EventParticipation
Ownership
ProcurementParticipation
ProjectParticipation
AssetStateAssertion
AssetMeasure
EntityMention
EvidenceLink
IndicatorObservation
Statement
EntityResolutionDecision
```

Questi oggetti non sono tutti equivalenti né devono essere salvati necessariamente in una sola tabella runtime. La lista definisce il contratto semantico, non ancora il disegno fisico del database.

### Due assi di certezza

Ogni futura pipeline di riconciliazione dovrà poter esprimere separatamente:

**entity resolution**

```text
resolved_by_qualified_identifier
resolved_by_authoritative_context
resolved_after_editorial_review
possible_match
unresolved
rejected_match
```

**relation assertion**

```text
source_explicit
deterministic_identifier_link
deterministic_rule
editorially_confirmed
candidate
mention_only
unresolved
```

Non va costruito un unico `confidence = 0.87` privo di significato semantico.

## Valutazione complessiva

Le sette fixture producono:

- 2 pass senza modifica del profilo;
- 5 pass con raffinamenti additivi;
- 0 contraddizioni con la v0.1;
- 0 necessità di migrazioni distruttive;
- 0 casi in cui sia necessario abbandonare OntoPiA come riferimento primario della PA italiana.

Il risultato rafforza quindi l'architettura federata: gli standard specialistici servono soprattutto nei **pattern di relazione, evidenza e provenance**, mentre l'identità di persone, organizzazioni, progetti e oggetti amministrativi può restare ancorata al profilo italiano e ai mapping europei già disponibili.

## Cosa non è stato autorizzato

Questa validazione non autorizza ancora:

- creazione delle tabelle `entities`, `statements` o `relationships`;
- migrazione dei dati verticali esistenti;
- pubblicazione di un knowledge graph RDF;
- deduplicazione automatica delle persone per nome;
- deduplicazione automatica delle imprese per sola ragione sociale;
- ricostruzione di timeline dei beni confiscati da stati puntuali;
- attribuzione automatica di responsabilità, rischio, anomalia o illecito a partire dai collegamenti del grafo.

## Gate successivo consigliato

Prima del database, il passo successivo dovrebbe essere un **contratto validabile** molto piccolo:

1. trasformare v0.2 e le fixture in schema verificabile;
2. decidere se l'authoring source sarà YAML + Zod/JSON Schema oppure LinkML con generazione di JSON Schema/SHACL;
3. validare automaticamente le sette fixture;
4. disegnare uno schema relazionale additivo e provarlo contro le fixture senza migrare i dati reali;
5. solo dopo introdurre una prima migration con registry e bridge.

Il primo disegno DB da valutare, non ancora implementare, è:

```text
entities
entity_names
entity_identifiers
sources
source_records
statements
entity_relationships
entity_resolution_decisions
```

Le associazioni ad alta struttura (`IndicatorObservation`, ownership, ruoli nel tempo) potranno essere tabelle specializzate o proiezioni sopra `statements`/`entity_relationships`: la scelta va presa dopo il test del contratto runtime, non prima.
