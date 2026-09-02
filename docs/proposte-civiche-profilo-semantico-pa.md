# Proposte civiche — profilo semantico PA-first

## Principio

Lamezia Trasparente non definisce una tassonomia tematica autonoma quando esiste una risorsa semantica nazionale adatta.

La classificazione primaria delle proposte civiche riusa il **Vocabolario Controllato sulle Materie dei Servizi Pubblici** pubblicato nel Catalogo Nazionale Dati e risorse semantiche per l’interoperabilità (schema.gov.it) e nel repository `italia/dati-semantic-assets`.

Concept scheme ufficiale:

`https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters`

Il vocabolario è modellato in SKOS, nasce nel contesto del design dei siti web comunali e presenta mapping verso gli European Data Themes e i vocabolari italiani degli eventi della vita e d’impresa. L’ontologia di riferimento per i servizi pubblici è CPSV-AP_IT:

`https://w3id.org/italia/onto/CPSV`

## Materie ufficiali

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

## Rapporto con il vecchio `theme`

Il campo `theme` rimane nel record di acquisizione per compatibilità, audit e ricostruzione storica. Non costituisce più la tassonomia semantica autorevole.

Il layer `proposalPaSemanticProfile.ts` traduce il `theme` di acquisizione verso concetti ufficiali. Un nuovo tema che non possiede un mapping fa fallire i test e non deve essere pubblicato finché la classificazione non viene risolta.

## Estensioni locali

Le estensioni LT sono ammesse solo quando non esiste un concetto nazionale sufficientemente corretto. Non devono duplicare o rinominare concetti già presenti su schema.gov.it.

La prima e, allo stato attuale, unica estensione è:

**Governo aperto, trasparenza e partecipazione civica**

È necessaria per proposte relative a pubblicità dell’attività consiliare, streaming e strumenti di partecipazione civica digitale, che non ricadono correttamente nelle 15 materie dei servizi pubblici.

L’estensione conserva riferimenti espliciti a risorse ufficiali correlate:

- EU Data Theme `GOVE` — Government and public sector;
- vocabolario nazionale `classifications-for-transparency/transparency-subject`.

L’estensione non viene presentata come concetto schema.gov.it.

## Tipo di intervento

Le categorie operative dello Standard LT (`manutenzione`, `messa_in_sicurezza`, `rafforzamento_servizio`, ecc.) non sono una tassonomia tematica concorrente. Sono **facet operative locali** che descrivono il verbo dell’intervento richiesto.

Le due dimensioni devono restare separate:

- **Materia PA** = di che dominio pubblico tratta la proposta, con vocabolario schema.gov.it;
- **Intervento LT** = che tipo di operazione viene richiesta, solo dove manca un vocabolario ufficiale equivalente.

Esempio:

- Emodinamica H24 → Materia PA: `2 Salute, benessere e assistenza`; facet LT: `attivazione_servizio`, `rafforzamento_servizio`.
- Passerella Marinella–Gizzeria → Materie PA: `4 Mobilità e trasporti`, `8 Giustizia e sicurezza pubblica`; facet LT: `infrastruttura`, `messa_in_sicurezza`.

## Regole di pubblicazione

Per ogni nuova proposta:

1. preservare il testo e il tema di acquisizione;
2. produrre la presentazione canonica LT;
3. assegnare almeno un concetto ufficiale delle Materie dei servizi pubblici, salvo gap documentato;
4. in caso di gap, verificare prima altre risorse di schema.gov.it;
5. introdurre un’estensione LT solo se strettamente necessaria, documentandone motivazione e mapping verso risorse ufficiali correlate;
6. conservare URI e scheme URI, non soltanto le etichette;
7. bloccare la pubblicazione se il mapping semantico manca.

## Fonti di riferimento

- Catalogo Nazionale Dati: `https://schema.gov.it/`
- Repository nazionale: `https://github.com/italia/dati-semantic-assets`
- Materie dei servizi pubblici: `https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters`
- CPSV-AP_IT: `https://w3id.org/italia/onto/CPSV`
- Vocabolario della trasparenza: `https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject`
