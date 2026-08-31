# Pilot GeoLibre per l’Atlante territoriale

## Scopo

GeoLibre entra in Lamezia Trasparente come **viewer alternativo sperimentale** dell’Atlante, non come nuovo data store e non come sostituzione immediata di Leaflet.

La fonte di verità resta il data model canonico del progetto e il relativo `spatial layer registry`. Il pilot carica gli stessi `dataPath` dei layer con `atlasStatus="active"`.

## Feature flag

Il pilot è disabilitato per default.

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
  &data=https://<api>/api/gis/comune
  &data=https://<site>/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson
  &data=https://<api>/api/beni-confiscati/geojson
```

I percorsi `/api/*` usano `VITE_API_BASE_URL` quando configurato; gli asset statici usano l’origine pubblica del sito.

Non viene creato un `.geolibre.json` parallelo e non vengono duplicate geometrie o proprietà di dominio.

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

Una modifica richiesta soltanto da GeoLibre non deve deformare la semantica canonica dei dati. Se un nuovo formato di distribuzione diventa necessario (per esempio GeoParquet o PMTiles), va introdotto come ulteriore output dello spatial layer, non come fonte di verità separata.
