# Snapshot spaziale dei beni confiscati

## Scopo

Questa nota documenta la distribuzione pubblica
`data/processed/territorio/beni_confiscati_lamezia.geojson` usata dall’Atlante
territoriale. Lo snapshot non è un elenco alternativo dei beni e non introduce
geocodifiche: applica il contratto spaziale default-deny ai dati pubblici ANBSC.

## Fonte

- Ente: Agenzia Nazionale per l’amministrazione e la destinazione dei beni
  sequestrati e confiscati alla criminalità organizzata (ANBSC).
- Catalogo DCAT/JSON: `https://benidestinati.anbsc.it/api/data/beni/catalog`.
- Distribuzioni filtrate lato fonte:
  - `/api/data/beni/immobili/in_amministrazione?comune=Lamezia+Terme`;
  - `/api/data/beni/immobili/destinato?comune=Lamezia+Terme`.
- Licenza dichiarata dal catalogo: Italian Open Data License v2.0.
- Data di modifica dichiarata nella fotografia corrente: `2026-09-02 04:00:00`
  (valore conservato testualmente perché la fonte non specifica il fuso).

Il catalogo descrive l’accesso come parzialmente pubblico e avverte, nella
pagina InfoWeb, che durante la reingegnerizzazione della piattaforma i dati
sulle destinazioni potrebbero essere sottostimati. I conteggi vanno quindi
letti come fotografia della fonte, non come certificazione di completezza.

## Esito della fotografia

| Stato ANBSC        | Record sorgente | Feature pubblicate |
| ------------------ | --------------: | -----------------: |
| In amministrazione |             119 |                  0 |
| Destinati          |             221 |                  0 |
| Totale             |             340 |                  0 |

Motivi di esclusione:

| Motivo                                                                 | Record |
| ---------------------------------------------------------------------- | -----: |
| Solo coordinate del Comune (`latitudine_comune`, `longitudine_comune`) |    292 |
| Nessuna coordinata asset-level                                         |     48 |
| Coordinate asset-level nuove, in attesa di revisione esplicita         |      0 |

Le coordinate comunali coincidono con un riferimento aggregato di Lamezia
Terme e non documentano il luogo del singolo immobile. Convertirle in punti
`asset_location` collocherebbe artificiosamente centinaia di beni nello stesso
punto. Per questo lo snapshot è una `FeatureCollection` valida ma vuota, con
conteggi e motivazioni nel blocco `metadata`.

## Aggiornamento e controlli

```bash
pnpm run spatial:snapshots:lamezia
```

La materializzazione:

1. richiede JSON agli endpoint pubblici ANBSC filtrati per Lamezia Terme;
2. verifica Comune, iter amministrativo e unicità dell’identificativo sorgente
   (`bene_id`, con fallback agli identificativi legacy ANBSC);
3. non pubblica automaticamente eventuali nuovi campi di coordinate
   asset-level: li classifica come `asset_coordinates_pending_review`;
4. genera confine, snapshot dei beni e manifest con digest SHA-256;
5. mantiene lo snapshot ISTAT esistente come terza distribuzione canonica.

Un futuro passaggio da 0 a feature puntuali richiede una revisione dedicata di
precisione, provenienza, stato di verifica e collegamento alla scheda pubblica.
Non è autorizzato inferire posizioni dal centroide comunale, da categorie, da
procedimenti o da altri campi non spaziali.
