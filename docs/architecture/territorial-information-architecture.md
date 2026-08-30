# Architettura territoriale di Lamezia Trasparente

## Obiettivo

L'Atlante territoriale deve diventare la modalità geografica di accesso a Lamezia Trasparente: una sola geografia di riferimento del territorio comunale alla quale collegare, direttamente o indirettamente, tutti i dati che possiedono una reale dimensione territoriale.

La mappa non è il database e non sostituisce le sezioni tematiche. Le entità continuano a vivere nel data model canonico del progetto; l'Atlante legge le stesse entità e le rende esplorabili nello spazio.

Il principio architetturale è:

```text
fonti originali
      |
      v
ingestion e normalizzazione
      |
      v
entità canoniche Lamezia Trasparente
      |
      +---------------------> pagine / tabelle / API / open data
      |
      v
territorial reference
      |
      v
spatial layer registry
      |
      +---------------------> mini-map contestuali
      |
      +---------------------> Atlante territoriale / GeoLibre
```

## Una sola mappa, molti layer

Il progetto non deve creare una mappa separata per ogni dominio. `/atlante-territoriale` è il punto unico di esplorazione geografica e deve poter sovrapporre progressivamente layer diversi.

Layer iniziali e prioritari:

1. confine comunale e geografie di riferimento;
2. sezioni censuarie e indicatori ISTAT;
3. beni confiscati con localizzazione sufficientemente documentata;
4. opere pubbliche localizzabili;
5. progetti PNRR localizzabili;
6. patrimonio pubblico;
7. scuole, servizi e beni culturali;
8. contratti soltanto quando è documentata la localizzazione dell'intervento.

La sede di un'impresa affidataria non è la localizzazione di un contratto. La sede dell'amministrazione non è la localizzazione dell'intervento. Queste relazioni possono essere conservate, ma non devono essere rappresentate come se descrivessero il luogo in cui l'azione pubblica si svolge.

## Territorio come indice, non come deposito di marker

Non ogni documento deve ricevere coordinate proprie. Gli oggetti documentali possono essere territorialmente referenziati attraverso l'entità cui si riferiscono.

Esempio:

```text
determina
   |
   | riguarda
   v
progetto / opera
   |
   | interessa
   v
edificio / area / tratto stradale
   |
   v
Atlante territoriale
```

Una determina relativa a una scuola non diventa quindi un nuovo punto sulla mappa. Cliccando la scuola, l'utente può però raggiungere determine, contratti, progetti e altri documenti collegati.

## Spatial Contract

Ogni relazione territoriale deve essere esplicita e verificabile. Il contratto TypeScript di riferimento è in:

`artifacts/lamezia-trasparente/src/lib/spatial/contract.ts`

Una relazione territoriale può essere:

- **diretta**: l'entità possiede una geometria propria e documentata;
- **collegata**: l'entità eredita il contesto territoriale da un'altra entità, senza fingere di possedere una geometria autonoma.

### Geometrie ammesse

- `Point`: edificio, bene, struttura o punto localizzato;
- `LineString` / `MultiLineString`: strada, percorso, tratto infrastrutturale;
- `Polygon` / `MultiPolygon`: area di intervento, particella, sezione censuaria, perimetro amministrativo.

### `geometry_role`

Il campo più importante è `geometry_role`: descrive che cosa rappresenta realmente la geometria.

Esempi:

- `asset_location`;
- `facility_location`;
- `intervention_site`;
- `intervention_area`;
- `route`;
- `census_area`;
- `administrative_boundary`;
- `supplier_registered_office`;
- `contracting_authority_office`.

Il ruolo deve essere conservato anche quando due geometrie coincidono fisicamente: il significato informativo resta diverso.

### Precisione, metodo e provenienza

Ogni geometria pubblicabile deve indicare almeno:

- livello di precisione;
- metodo con cui è stata ottenuta;
- livello di confidenza;
- fonte della geometria o dell'indirizzo;
- data di osservazione o estrazione quando disponibile;
- eventuale periodo di validità;
- stato di verifica;
- eventuale avvertenza pubblica.

La UI deve poter distinguere chiaramente, ad esempio, una posizione verificata a livello di edificio da una posizione geocodificata a livello di strada o da un'area approssimativa.

## Regola di pubblicazione

Una geometria non entra automaticamente in un layer pubblico solo perché esistono latitudine e longitudine.

Per essere pubblicata deve:

1. avere un significato territoriale esplicito (`geometry_role`);
2. avere una provenienza documentabile;
3. avere una precisione dichiarata;
4. rispettare le regole specifiche del layer;
5. non trasformare una relazione indiretta in una localizzazione diretta;
6. poter rimandare alla relativa entità o scheda pubblica quando esiste.

Ogni layer deve inoltre dichiarare quali `geometry_role` accetta. Per esempio, il layer degli interventi contrattuali può accettare `intervention_site`, `intervention_area` e `route`, ma non `supplier_registered_office`.

## Registry dei layer

Il registry di riferimento è in:

`artifacts/lamezia-trasparente/src/lib/spatial/layerRegistry.ts`

Il registry descrive, per ciascun layer:

- identificativo stabile;
- titolo pubblico;
- gruppo tematico;
- stato di maturità del dato (`status`);
- disponibilità nella superficie Atlante (`atlasStatus`);
- tipi di geometria ammessi;
- ruoli geografici ammessi;
- entità sorgenti;
- fonte principale;
- endpoint o percorso dati quando già disponibile;
- visibilità predefinita;
- caveat e regola minima di pubblicazione.

`status` e `atlasStatus` rispondono a due domande diverse. Un dataset può essere già canonico o esistente senza essere ancora pronto per comparire nell'Atlante: il renderer, l'accessibilità, i caveat o la semantica geografica possono richiedere ulteriore lavoro. Solo i layer con `atlasStatus="active"` e un percorso dati configurato sono candidati al selettore dell'Atlante.

Questa separazione evita che l'introduzione di un nuovo dataset nel data model lo renda implicitamente visibile sulla mappa prima della relativa validazione. Il registry deve diventare progressivamente la fonte unica per costruire il selettore dei layer nell'Atlante e per esporre metadati leggibili dall'utente.

## GeoLibre e Leaflet

L'architettura deve restare indipendente dal motore cartografico.

- **Leaflet** resta adatto alle mini-map contestuali e alle mappe semplici già presenti.
- **GeoLibre** è il candidato preferenziale per l'Atlante avanzato, dove servono molti layer, interrogazione, filtri, overlay e formati cloud-native.

GeoLibre non deve possedere una copia autonoma dei dati. Deve leggere gli stessi layer prodotti dal data model canonico.

Percorso previsto:

```text
canonical entities
      |
      v
spatial adapter
      |
      v
GeoJSON / GeoParquet / PMTiles
      |
      +----> Leaflet (quando basta una mini-map)
      |
      +----> GeoLibre (Atlante avanzato)
```

La migrazione può quindi essere progressiva e non distruttiva.

## Prima implementazione

### Fase 0 — fondazioni

- introdurre Spatial Contract;
- introdurre layer registry;
- documentare regole di pubblicazione e provenienza;
- mantenere invariato l'Atlante esistente.

### Fase 1 — beni confiscati come primo layer di entità

I beni confiscati sono il primo candidato perché la UI esistente usa già coordinate e una mappa dedicata.

Obiettivo:

1. convertire i record localizzati nel formato spaziale canonico;
2. aggiungere per ogni geometria ruolo, precisione, metodo e provenienza;
3. esporre un GeoJSON del layer;
4. visualizzarlo nell'Atlante accanto alle geografie censuarie;
5. mantenere la mappa Leaflet esistente finché il nuovo flusso non è validato.

### Fase 2 — geografie censuarie + beni confiscati

L'Atlante deve poter attivare e disattivare almeno:

- sezioni censuarie / indicatore selezionato;
- beni confiscati;
- confine comunale.

La selezione di un bene deve poter aprire la sua scheda pubblica; la scheda deve poter offrire un link `Mostra nell'Atlante`.

### Fase 3 — GeoLibre dietro feature flag

Integrare GeoLibre come viewer alternativo dell'Atlante, alimentato dagli stessi layer. Il passaggio a viewer principale avviene solo dopo verifica di:

- accessibilità;
- prestazioni;
- comportamento mobile;
- sincronizzazione selezione mappa/schede;
- attribuzioni e licenze;
- assenza di regressioni rispetto alla UI esistente.

### Fase 4 — estensione progressiva

Aggiungere solo dopo verifica semantica e documentale:

- opere pubbliche;
- PNRR;
- patrimonio pubblico;
- scuole e servizi;
- beni culturali;
- contratti con luogo dell'intervento verificabile.

## Esperienza utente obiettivo

L'Atlante deve permettere due direzioni di navigazione equivalenti:

```text
scheda / tabella -> Mostra sulla mappa -> Atlante
Atlante -> seleziona luogo/entità -> scheda completa
```

A regime, cliccando un luogo o un'entità territoriale, l'utente deve poter vedere non soltanto il record cartografico, ma anche le relazioni documentali pertinenti: progetti, contratti, determine, finanziamenti e altre evidenze collegate.

Il risultato atteso non è quindi una mappa con molti marker, ma un **indice territoriale verificabile dell'attività pubblica e del patrimonio informativo di Lamezia Terme**.
