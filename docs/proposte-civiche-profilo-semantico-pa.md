# Proposte civiche — profilo semantico PA-first

## Principio

Lamezia Trasparente non definisce una tassonomia tematica autonoma quando esiste una risorsa semantica ufficiale adatta.

La classificazione primaria delle proposte civiche riusa il **Vocabolario Controllato sulle Materie dei Servizi Pubblici** pubblicato nel Catalogo Nazionale Dati e risorse semantiche per l’interoperabilità (schema.gov.it) e nel repository `italia/dati-semantic-assets`.

Concept scheme ufficiale:

`https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters`

Il vocabolario è modellato in SKOS, nasce nel contesto del design dei siti web comunali e presenta mapping verso gli European Data Themes e i vocabolari italiani degli eventi della vita e d’impresa. L’ontologia di riferimento per i servizi pubblici è CPSV-AP_IT:

`https://w3id.org/italia/onto/CPSV`

## Materie ufficiali di base

Il profilo LT conserva codice, preferred label, URI del concetto e URI dello scheme per ciascuna classificazione utilizzata:

1. Educazione e formazione
2. Salute, benessere e assistenza
3. Vita lavorativa
4. Mobilità e trasporti
5. Catasto e urbanistica
6. Anagrafe e stato civile
7. Turismo
8. Giustizia e sicurezza pubblica
9. Tributi, finanze e contravvenzioni
10. Cultura e tempo libero
11. Ambiente
12. Impresa e commercio
13. Autorizzazioni
14. Appalti pubblici
15. Agricoltura e pesca

Una proposta può essere collegata a più materie quando contiene componenti sostanziali realmente appartenenti a domini diversi. Il primo codice rappresenta la materia prevalente nel mapping editoriale.

## Fallback su altre risorse ufficiali

Le 15 materie sono la base, non un vincolo che autorizza classificazioni forzate. Quando nessuna delle 15 materie descrive correttamente il dominio, il processo deve cercare **prima** un’altra risorsa semantica ufficiale già interoperabile con il patrimonio nazionale.

Il primo caso concreto è la pubblicità dell’attività istituzionale e la partecipazione civica digitale. Invece di introdurre una categoria LT, il profilo usa il concetto ufficiale:

**GOVE — Governo e settore pubblico**

`http://publications.europa.eu/resource/authority/data-theme/GOVE`

Il concetto appartiene all’authority list europea dei Data Themes ed è già presente nei mapping del repository nazionale `dati-semantic-assets`. Per il dettaglio relativo alla trasparenza amministrativa viene inoltre mantenuto come risorsa ufficiale correlata il vocabolario:

`https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject`

Di conseguenza, **allo stato attuale il profilo tematico delle proposte non richiede alcuna estensione LT**.

## Rapporto con il vecchio `theme`

Il campo `theme` rimane nel record di acquisizione per compatibilità, audit e ricostruzione storica. Non costituisce più la tassonomia semantica autorevole e non governa più il filtro pubblico della pagina.

Il layer `proposalPaSemanticProfile.ts` traduce il `theme` di acquisizione verso concetti ufficiali. Un nuovo tema che non possiede un mapping fa fallire i test e non deve essere pubblicato finché la classificazione non viene risolta.

## Estensioni locali: ultima istanza

Un’estensione tematica LT potrà essere introdotta soltanto se, in sequenza:

1. nessuna delle 15 Materie dei servizi pubblici è semanticamente corretta;
2. non esiste un’altra risorsa utile in schema.gov.it/OntoPiA;
3. non esiste un vocabolario ufficiale europeo o nazionale già collegato al patrimonio semantico italiano;
4. il gap è documentato e l’estensione può essere collegata alle risorse ufficiali più vicine tramite URI.

Non è consentito creare un sinonimo LT di un concetto ufficiale esistente.

## Tipo di intervento

Le categorie operative dello Standard LT (`manutenzione`, `messa_in_sicurezza`, `rafforzamento_servizio`, ecc.) non sono una tassonomia tematica concorrente. Sono **facet operative locali** che descrivono il verbo dell’intervento richiesto.

Le due dimensioni devono restare separate:

- **Materia PA** = di che dominio pubblico tratta la proposta, usando concetti ufficiali;
- **Intervento LT** = che tipo di operazione viene richiesta, usato solo come facet operativa dove non esiste un vocabolario ufficiale equivalente adeguato allo scopo.

Esempi:

- Emodinamica H24 → Materia PA: `2 Salute, benessere e assistenza`; facet LT: `attivazione_servizio`, `rafforzamento_servizio`.
- Passerella Marinella–Gizzeria → Materie PA: `4 Mobilità e trasporti`, `8 Giustizia e sicurezza pubblica`; facet LT: `infrastruttura`, `messa_in_sicurezza`.
- Streaming delle sedute → dominio ufficiale: `GOVE Governo e settore pubblico`; facet LT: `trasparenza`, `partecipazione_digitale`.

## UI

La navigazione pubblica usa il filtro **Materia PA**. Le opzioni sono derivate dai concetti ufficiali effettivamente associati ai record, indipendentemente dallo scheme di provenienza.

Nelle schede:

- i concetti ufficiali sostituiscono il vecchio badge `theme`;
- l’URI del concetto è direttamente consultabile;
- le facet operative sono mostrate separatamente come `Intervento LT`;
- il vecchio tema di acquisizione resta disponibile soltanto nella sezione di audit.

## Regole di pubblicazione

Per ogni nuova proposta:

1. preservare il testo e il tema di acquisizione;
2. produrre la presentazione canonica LT;
3. tentare anzitutto il mapping alle Materie dei servizi pubblici;
4. in caso di gap, verificare altre risorse di schema.gov.it/OntoPiA e vocabolari ufficiali già interoperabili;
5. introdurre un’estensione LT soltanto come ultima istanza, con gap documentato;
6. conservare URI e scheme URI, non soltanto le etichette;
7. bloccare la pubblicazione se il mapping semantico manca.

## Fonti di riferimento

- Catalogo Nazionale Dati: `https://schema.gov.it/`
- Repository nazionale: `https://github.com/italia/dati-semantic-assets`
- Materie dei servizi pubblici: `https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters`
- CPSV-AP_IT: `https://w3id.org/italia/onto/CPSV`
- EU Data Theme GOVE: `http://publications.europa.eu/resource/authority/data-theme/GOVE`
- Vocabolario della trasparenza: `https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject`
