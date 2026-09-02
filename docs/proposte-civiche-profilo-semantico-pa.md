# Proposte civiche — profilo semantico PA-first

## Principio

Lamezia Trasparente riusa le risorse semantiche ufficiali della PA e distingue due esigenze diverse:

1. **completezza del backend** — il modello deve conservare l’intera tassonomia ufficiale, gli URI persistenti e i mapping necessari all’analisi;
2. **parsimonia del frontend** — l’interfaccia mostra soltanto le informazioni utili a leggere e filtrare le proposte, senza trasformare la tassonomia in complessità visuale.

La classificazione di base riusa il **Vocabolario Controllato sulle Materie dei Servizi Pubblici** pubblicato in schema.gov.it / `italia/dati-semantic-assets`.

Concept scheme:

`https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters`

Ontologia di riferimento:

`https://w3id.org/italia/onto/CPSV`

## Catalogo backend completo

Il backend mantiene sempre tutti i 15 concetti ufficiali, anche quando nessuna proposta corrente usa uno specifico concetto:

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

Per ogni concetto il modello conserva almeno codice, preferred label, URI del concetto, URI dello scheme e autorità. Il catalogo backend non viene derivato dalle sole proposte presenti: deve restare completo e stabile.

## Materia primaria e classificazioni secondarie

Ogni proposta pubblicata deve avere **una e una sola materia primaria**. Questa è la classificazione utilizzata per la navigazione ordinaria e per il filtro pubblico `Materia`.

Una proposta può inoltre avere classificazioni secondarie quando contiene componenti sostanziali appartenenti ad altri domini. Le classificazioni secondarie:

- restano nel backend;
- sono disponibili per analisi e audit;
- non vengono mostrate come badge nella card ordinaria;
- non fanno entrare la proposta in più categorie del filtro pubblico.

Questo evita che una singola proposta appaia contemporaneamente sotto molte materie solo perché possiede aspetti accessori.

## Fallback ufficiali

Le 15 materie sono la prima scelta, non una classificazione da forzare. Quando nessuna materia descrive correttamente il dominio, si cerca prima un’altra risorsa ufficiale.

Per pubblicità dell’attività istituzionale e partecipazione civica digitale viene usato:

**GOVE — Governo e settore pubblico**

`http://publications.europa.eu/resource/authority/data-theme/GOVE`

Come risorsa ufficiale correlata resta disponibile anche il vocabolario nazionale della trasparenza:

`https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject`

Allo stato attuale non è necessaria alcuna estensione tematica LT.

## Rapporto con il record di acquisizione

Il campo `theme` resta nel record di acquisizione per compatibilità, audit e ricostruzione storica. Non è la tassonomia autorevole e non governa il frontend.

`proposalPaSemanticProfile.ts` traduce ogni tema di acquisizione in:

- materia primaria;
- eventuali classificazioni secondarie;
- nota di mapping quando utile.

Un nuovo tema senza mapping fa fallire i test e non deve essere pubblicato.

## Facet operative LT

Le categorie dello Standard LT come `manutenzione`, `messa_in_sicurezza`, `rafforzamento_servizio` o `trasparenza` descrivono **che tipo di intervento viene chiesto**. Non sono una tassonomia tematica concorrente.

Restano nel backend per analisi trasversali. Non devono essere mostrate sistematicamente nella card o nel blocco principale della proposta; sono consultabili nel livello di audit semantico quando necessario.

## Policy UI

Il frontend applica una progressive disclosure rigorosa.

### Sempre visibile

- stato;
- una sola materia primaria;
- stato geografico essenziale;
- titolo canonico;
- richiesta principale;
- promotore e data;
- ultimo sviluppo.

### Nel dossier aperto

- misure concrete;
- destinatario e filone;
- territorio;
- percorso istituzionale;
- cronologia;
- fonti e atti.

### Solo nel livello di audit

- classificazioni semantiche secondarie;
- URI e scheme URI;
- note di mapping;
- facet operative LT;
- tema e formulazione del record di acquisizione.

Il filtro `Materia` elenca soltanto le **materie primarie effettivamente usate** dalle proposte correnti. L’intero vocabolario dei 15 concetti rimane comunque presente e validato nel backend.

## Regole di pubblicazione

Per ogni nuova proposta:

1. preservare il record di acquisizione;
2. produrre la presentazione canonica LT;
3. individuare una sola materia primaria ufficiale;
4. aggiungere classificazioni secondarie solo se sostanzialmente giustificate;
5. cercare fallback ufficiali prima di qualsiasi estensione LT;
6. conservare URI e scheme URI;
7. non pubblicare se il mapping semantico manca;
8. non aggiungere automaticamente nuovi concetti al filtro pubblico: il filtro deriva dalle sole materie primarie in uso.

## Fonti di riferimento

- Catalogo Nazionale Dati: `https://schema.gov.it/`
- Repository nazionale: `https://github.com/italia/dati-semantic-assets`
- Materie dei servizi pubblici: `https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters`
- CPSV-AP_IT: `https://w3id.org/italia/onto/CPSV`
- EU Data Theme GOVE: `http://publications.europa.eu/resource/authority/data-theme/GOVE`
- Vocabolario della trasparenza: `https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject`
