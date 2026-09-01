# Pilot GeoLibre per l’Atlante territoriale

## Scopo

GeoLibre entra in Lamezia Trasparente come **viewer alternativo sperimentale** dell’Atlante, non come nuovo data store e non come sostituzione immediata di Leaflet.

La fonte di verità resta il data model canonico del progetto e il relativo
`spatial layer registry`. Il pilot preferisce sempre il `dataPath` primario dei
layer con `atlasStatus="active"`; un eventuale `fallbackDataPath` è una
distribuzione di continuità esplicita, non una seconda fonte di verità.

## Feature flag

Il pilot è disabilitato per default negli ambienti locali. La configurazione
pubblica versionata in `artifacts/lamezia-trasparente/.env.production` lo abilita
in produzione come opzione esplicita, mantenendo Leaflet come scelta iniziale.

Variabili frontend:

```text
VITE_ATLAS_GEOLIBRE_ENABLED=true
VITE_ATLAS_GEOLIBRE_URL=https://web.geolibre.app/
```

- `VITE_ATLAS_GEOLIBRE_ENABLED`: abilita lo switch Leaflet / GeoLibre nella pagina `/atlante-territoriale`.
- `VITE_ATLAS_GEOLIBRE_URL`: base URL del viewer. Se omesso, il codice usa `https://web.geolibre.app/`.

Anche con il flag attivo, Leaflet resta il viewer predefinito. `?viewer=geolibre` consente di aprire direttamente il pilot quando il flag è abilitato.

## Alimentazione dati

Il pilot usa i layer restituiti da `getActiveAtlasSpatialLayers()` e costruisce un URL GeoLibre con parametri `data=` ripetuti.

Esempio concettuale:

```text
https://web.geolibre.app/
  ?layout=viewer
  &panels=collapsed
  &data=https://<site>/data/processed/territorio/lamezia_confine_comunale.geojson
  &data=https://<site>/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson
  &data=https://<site>/data/processed/territorio/beni_confiscati_lamezia.geojson
```

Confine comunale e sezioni censuarie usano distribuzioni statiche primarie
same-origin. Per i beni confiscati, invece, il `dataPath` primario resta
`/api/beni-confiscati/geojson`: è costruito dal database attraverso lo spatial
adapter fail-closed e conserva le localizzazioni redazionali qualificate. Lo
snapshot ANBSC mostrato nell’esempio è dichiarato come `fallbackDataPath` e viene
usato da Leaflet o GeoLibre soltanto quando il feed API non è disponibile.

Il manifest
`/data/processed/territorio/spatial_layer_manifest.json` dichiara per ogni
distribuzione percorso primario, percorso statico, ruolo (`primary` oppure
`continuity_fallback`), conteggio feature, conteggio esclusioni, stato del
contenuto, fonte, licenza e digest SHA-256. Il frontend lo valida contro il
registry prima di mostrarne i dati di copertura.

Prima di costruire l’URL del viewer, il frontend esegue una richiesta `HEAD` con
timeout di 8 secondi e accetta soltanto risposte HTTP riuscite con Content-Type
JSON o GeoJSON. Verifica prima il feed primario; dopo un errore prova il fallback
soltanto se il registry lo dichiara. L’interfaccia segnala sia l’attivazione del
fallback sia la causa del fallimento primario. Se anche il fallback non supera
la verifica, il layer viene escluso. Un errore non viene mai convertito
implicitamente in una collezione vuota.

Una collezione può invece essere **pubblicata ma vuota per policy** quando
l’assenza di feature è un risultato verificato e documentato dal processo di
materializzazione. È il caso del fallback ANBSC corrente dei beni confiscati:
l’API pubblica ANBSC espone 340 immobili riferiti a Lamezia Terme, ma soltanto
coordinate del Comune (292 record) oppure nessuna coordinata (48 record). Il
centroide comunale non viene rappresentato come posizione del singolo bene;
lo snapshot contiene quindi 0 feature e conserva nel metadata tutti i conteggi
di esclusione. Questo stato è distinto sia da un errore di rete sia da un
dataset realmente privo di record. Non descrive né azzera le eventuali
localizzazioni qualificate presenti nel database: quando il feed API è
raggiungibile, quello resta la distribuzione selezionata.

Dettagli di fonte, conteggi e stop condition sono nella nota
[Snapshot spaziale dei beni confiscati](../data-sources/beni-confiscati-spatial-snapshot.md).

Non viene creato un `.geolibre.json` parallelo. Gli snapshot sono distribuzioni
versionate del contratto spaziale, con il loro ruolo dichiarato, non
configurazioni specifiche del viewer né sostituti silenziosi delle sorgenti
primarie.

La materializzazione si aggiorna con:

```bash
pnpm run spatial:snapshots:lamezia
```

Il comando legge il confine già versionato nel repository, il GeoJSON ISTAT
processato e gli endpoint JSON/DCAT pubblici ANBSC; interrompe la pubblicazione
se trova record fuori Comune, identificativi duplicati o un contratto sorgente
inatteso.

## CORS

L’API server usa già il middleware CORS globale. Gli asset territoriali statici sotto `/data/processed/territorio/*` dichiarano `Access-Control-Allow-Origin: *` per consentire al viewer GeoLibre ospitato su un’altra origine di leggerli.

Se GeoLibre viene self-hosted sulla stessa origine del sito, questo requisito resta innocuo ma non è più necessario per quel deployment.

## Modalità del pilot

Il viewer usa `layout=viewer` e `panels=collapsed`:

- modalità read-only;
- layer panel disponibile;
- niente authoring come percorso normale dell’utente;
- nessuna scrittura sul data model di Lamezia Trasparente.

Nel primo pilot, un cambiamento della composizione dei layer richiede il caricamento dell’iframe. Non viene ancora usata l’embed API runtime.

La disponibilità tecnica è rilevata quando l’utente apre il pilot. Se nessun feed è
raggiungibile, l’iframe non viene avviato e l’interfaccia invita a tornare a
Leaflet. Questa degradazione controllata rende il pilot osservabile, ma non
soddisfa il criterio di promozione relativo al caricamento di tutti i layer.

## Embed API e self-hosting

La sincronizzazione bidirezionale futura — selezione scheda ↔ feature, visibilità, filtri, viewport — deve usare l’embed API GeoLibre solo dopo aver predisposto un deployment controllato.

Per un’istanza self-hosted, configurare esplicitamente l’origine autorizzata attraverso `GEOLIBRE_EMBED_ORIGINS`. L’API runtime non deve essere aperta indiscriminatamente.

Possibili comandi futuri dell’integrazione:

- `setLayerVisibility`;
- `highlightFeature`;
- `setFilter`;
- `setView`;
- `addData`;
- `listLayers`.

Questa seconda fase non è necessaria per validare il primo rendering multi-layer.

## Criteri di promozione

GeoLibre non diventa viewer principale finché non sono verificati almeno:

1. caricamento affidabile di tutti i layer attivi;
2. attribuzioni e licenze corrette;
3. comportamento mobile;
4. navigazione da tastiera e lettura assistiva compatibili con gli standard del progetto;
5. tempi di caricamento accettabili;
6. nessuna regressione rispetto alla vista non cartografica delle sezioni censuarie;
7. sincronizzazione feature ↔ schede canoniche;
8. gestione chiara degli errori CORS/rete;
9. fallback immediato a Leaflet;
10. deployment e versione GeoLibre sotto controllo del progetto se si abilita l’embed API runtime.

## Regola architetturale

```text
canonical entities
      ↓
spatial adapters / registry
      ↓
public GeoJSON / altri formati canonici
      ↓
├── Leaflet
└── GeoLibre
```

Un fallback statico può affiancare una distribuzione primaria solo se il
registry e il manifest rendono leggibili entrambi i percorsi, il ruolo del
fallback e la sua copertura. Il fallback non può cancellare o sovrascrivere dati
qualificati presenti nella sorgente primaria.

Una modifica richiesta soltanto da GeoLibre non deve deformare la semantica canonica dei dati. Se un nuovo formato di distribuzione diventa necessario (per esempio GeoParquet o PMTiles), va introdotto come ulteriore output dello spatial layer, non come fonte di verità separata.
