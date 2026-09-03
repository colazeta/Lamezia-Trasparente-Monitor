# Contratto semantico eseguibile v0.2

**Issue:** #943  
**Profilo concettuale:** `semantic-profile.v0.2.yaml`  
**Contratto eseguibile:** `semantic-contract.v0.2.json`  
**JSON Schema:** `semantic-contract.v0.2.schema.json`  
**Fixture eseguibili:** `semantic-contract-fixtures.v0.2.json`

## Scopo

Il profilo v0.2 descrive l'architettura semantica federata e i suoi allineamenti. Questo documento definisce un livello più stretto: il sottoinsieme che il software deve poter validare automaticamente prima di introdurre un registry semantico nel database.

Il contratto **non è ancora una superficie runtime pubblica** e non autorizza una migration. Serve a rendere verificabili tipi, pattern associativi, stati, identifier policy e invarianti che lo stress-test della v0.2 ha reso necessari.

## Source of truth e responsabilità

Le responsabilità sono separate deliberatamente:

1. `semantic-profile.v0.2.yaml` resta il riferimento concettuale e documenta OntoPiA, SEMIC/W3C/OGC e le estensioni specialistiche;
2. `lib/api-zod/src/semanticContract.ts` è la definizione eseguibile del contratto software;
3. `semantic-contract.v0.2.json` è l'istanza versionata che il software valida;
4. `semantic-contract.v0.2.schema.json` è l'artefatto JSON Schema generabile dalla definizione Zod;
5. `semantic-contract-fixtures.v0.2.json` collega il contratto ai sette casi del repository già usati nello stress-test.

Il contratto eseguibile non replica note ontologiche, mapping esterni o motivazioni editoriali che non richiedono enforcement software. Questo evita che due rappresentazioni complete della stessa ontologia possano divergere silenziosamente.

## Perché TypeScript/Zod adesso

Il monorepo usa già TypeScript e Zod, e `@workspace/api-zod` è già parte della dependency graph dell'API server. Il pin corrente di Zod espone anche il bridge `zod/v4` con conversione nativa a JSON Schema Draft 2020-12. Il gate può quindi entrare nel CI esistente senza aggiungere una seconda toolchain, un ambiente Python o un servizio esterno.

La scelta è soprattutto operativa:

- typecheck e test usano lo stesso stack del prodotto;
- il contratto può essere importato da futuri bridge DB senza generazione intermedia;
- JSON Schema resta disponibile per validatori e riusatori non TypeScript;
- il controllo può essere database-free e zero-cost;
- nessun package o lockfile deve cambiare per questo gate.

## Perché LinkML resta differito, non escluso

LinkML resta interessante quando Lamezia Trasparente avrà un bisogno concreto di authoring semantico multi-target, in particolare generazione SHACL/RDF oltre a JSON Schema. Non viene introdotto ora perché aggiungerebbe una toolchain Python prima che esista una superficie RDF/JSON-LD da validare, mentre il problema immediato è impedire regressioni nel contratto relazionale/JSON che precede il database.

La decisione va rivalutata quando almeno una delle condizioni seguenti diventa vera:

- viene pubblicato un export JSON-LD/RDF stabile;
- SHACL diventa un gate effettivo di interoperabilità;
- il mantenimento parallelo di più target semantici rende insufficiente l'authoring TypeScript-first;
- il contratto deve essere condiviso con sistemi che adottano LinkML come formato sorgente.

Fino ad allora `shacl` resta un export futuro dichiarato, non un output simulato.

## Invarianti eseguibili

Il contratto rende espliciti i gate della v0.2:

- nessun seed dichiarato fittizio può diventare evidenza civica;
- nessun merge automatico basato soltanto sul nome;
- uno stato corrente non ricostruisce una sequenza storica mancante;
- un richiamo testuale PNRR non riconcilia automaticamente un documento con un progetto;
- i source record restano separati anche dopo la canonicalizzazione;
- la provenance delle osservazioni resta preservata;
- stato di entity resolution e forza della relazione sono assi indipendenti.

Le distinzioni emerse nello stress-test sono inoltre modellate come tipi diversi: `RoleAssignment`/`EventParticipation`, `AssetStateAssertion`/`AssetMeasure` e `Indicator`/`IndicatorObservation`.

## Fixture ancorate alle fonti del repository

Le fixture eseguibili non copiano soltanto il risultato atteso. Ogni caso dichiara uno o più `source_anchors` con:

- path del file reale;
- token minimi che devono continuare a essere presenti.

Il test fallisce se un file scompare o se gli anchor non sono più verificabili. Questo non prova che la fonte sia immutata o che il mapping sia sempre corretto, ma impedisce che una fixture continui a passare dopo essersi sganciata dal record/policy che pretende di rappresentare.

Gli anchor sono deliberatamente minimali: non sono snapshot completi e non sostituiscono i test di dominio.

## Identifier policy

Gli identificatori sono qualificati per schema e scope.

- `CUP` identifica il progetto nel relativo dominio;
- `CIG` riconduce al procurement object pertinente, la cui proiezione può essere procedura o contratto;
- `source_id` identifica un `SourceRecord` entro la fonte e **non** diventa un identificatore globale dell'entità;
- `tax_identifier` può supportare la risoluzione di persona/organizzazione ma resta soggetto al public-safety review prima di qualunque esposizione.

Questa distinzione evita che chiavi tecniche idempotenti o attributi personali vengano trattati come URI civici universali.

## Gate prima del database

Il completamento della #943 non autorizza ancora `entities`, `entity_identifiers`, `source_records`, `statements` o `entity_relationships` nel database.

Il gate successivo è disegnare **uno schema relazionale soltanto additivo** e provarlo contro queste fixture, verificando almeno:

1. round-trip degli identificatori qualificati;
2. preservazione di source record e statement concorrenti;
3. temporalità delle relazioni reificate;
4. separazione fra entity resolution e assertion status;
5. public-safety fields per persone e identificatori;
6. possibilità di esportare senza perdere provenance.

Solo dopo quel test una migration potrà essere proposta esplicitamente.

## Limiti

Il JSON Schema valida la struttura rappresentabile del contratto. Gli invarianti cross-record e l'ancoraggio alle fonti sono verificati dal test TypeScript, non delegati artificialmente a JSON Schema. Analogamente, questo gate non certifica accuratezza fattuale delle fonti, completezza dei dati, correttezza giuridica o assenza di errori di entity resolution.

Nessuna relazione semantica, menzione o evidence link costituisce di per sé indicazione di rischio, illecito, responsabilità o anomalia.
