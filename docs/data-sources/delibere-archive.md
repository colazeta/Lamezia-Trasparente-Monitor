# Archivio cumulativo delle delibere

## Fonte e perimetro

- Fonte: Albo Pretorio del Comune di Lamezia Terme, provider Tinnvision.
- URL fonte: `https://albo.tinnvision.cloud/?ente=00301390795`.
- Output pubblico: `data/public/albo/delibere-archive.json`.
- Stato di verifica: ereditato da ogni acquisizione della pipeline Albo.

L'archivio contiene soltanto deliberazioni già presenti negli output public-safe
`data/public/albo/latest.json` versionati dal monitor. Non legge né pubblica raw
snapshot o record processed non minimizzati.

## Aggiornamento

`pnpm albo:fetch` unisce le deliberazioni dell'ultimo snapshot all'archivio
esistente. Un atto resta consultabile quando esce dall'elenco corrente dell'Albo.
Se una classificazione successiva sposta esplicitamente lo stesso record in
`do_not_publish`, il record viene rimosso dall'archivio cumulativo.

Il seed iniziale si rigenera, con cronologia Git completa, tramite:

```sh
pnpm albo:seed-delibere-archive
```

Il comando legge esclusivamente le revisioni Git dei due output pubblici:

- `data/public/albo/latest.json`;
- `data/public/albo/documents-manifest.json`.

## Documenti

Il collegamento a una copia PDF locale viene conservato solo quando il manifest
Albo ha già classificato il record come `public_visibility=publishable` e
`privacy_risk=low`. Nessun PDF viene interpretato, sottoposto a OCR o riassunto.

## Copertura iniziale

Seed generato il 29 agosto 2026:

- 63 deliberazioni osservate;
- 43 deliberazioni di Giunta;
- 20 deliberazioni di Consiglio;
- 32 PDF public-safe già archiviati;
- date degli atti osservati: 10 giugno–24 agosto 2026.

## Limiti

La copertura coincide con ciò che il monitor ha osservato e versionato. Non è
una certificazione di completezza storica e non sostituisce l'Albo Pretorio
ufficiale. Oggetti minimizzati e record a solo metadato restano tali anche
nell'archivio; non vengono ricostruiti da versioni precedenti o da altre fonti.
