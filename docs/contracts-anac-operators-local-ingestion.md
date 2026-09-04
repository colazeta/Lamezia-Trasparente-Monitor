# ANAC operatori — ingestione da archivio locale verificato

## Scopo

Questo percorso è un fallback controllato per i dataset ANAC **Partecipanti** e **Aggiudicatari** quando il runner GitHub non riesce a scaricare direttamente gli archivi ufficiali, ad esempio per un blocco WAF/HTTP 403.

Non aggira il servizio ANAC e non usa proxy o mirror non verificati. Accetta soltanto un archivio ZIP già acquisito attraverso un canale pubblico e un sidecar di provenienza esplicito. Il parser CSV, il filtro sui CIG monitorati, la deduplica, le regole di identità e lo schema finale restano gli stessi del sync di rete.

## Input obbligatori

Per ogni dataset servono due file locali:

1. l'archivio ZIP ufficiale ANAC;
2. un sidecar JSON di provenienza.

Esempio `partecipanti.metadata.json`:

```json
{
  "schema_version": "anac-operator-local-archive.v1",
  "dataset": "participants",
  "official_archive_url": "https://dati.anticorruzione.it/opendata/download/dataset/partecipanti/filesystem/partecipanti_csv.zip",
  "acquired_at": "2026-09-04T08:00:00+02:00",
  "catalog_resource_id": "opzionale",
  "catalog_metadata_url": "https://data.europa.eu/..."
}
```

Campi obbligatori:

- `schema_version`: deve essere `anac-operator-local-archive.v1`;
- `dataset`: `participants` oppure `awardees` e deve coincidere con `--dataset`;
- `official_archive_url`: URL HTTPS sotto dominio `anticorruzione.it` e con estensione ZIP;
- `acquired_at`: data/ora effettiva di acquisizione dell'archivio.

`catalog_resource_id` e `catalog_metadata_url` sono opzionali e servono a conservare il locator del catalogo federato quando disponibile. `catalog_metadata_url`, se presente, deve essere HTTPS e appartenere a `data.europa.eu` oppure al dominio ufficiale ANAC.

## Esecuzione

Partecipanti:

```bash
pnpm run contracts:anac-operators-ingest-local -- \
  --dataset participants \
  --archive /percorso/partecipanti_csv.zip \
  --metadata /percorso/partecipanti.metadata.json
```

Aggiudicatari:

```bash
pnpm run contracts:anac-operators-ingest-local -- \
  --dataset awardees \
  --archive /percorso/aggiudicatari_csv.zip \
  --metadata /percorso/aggiudicatari.metadata.json
```

Il comando legge i CIG monitorati da `data/public/contracts/anac-bdncp/latest.json` e scrive, solo dopo validazione completa:

- `data/public/contracts/anac-participants/latest.json`, oppure
- `data/public/contracts/anac-awardees/latest.json`.

## Gate fail-closed

Prima della pubblicazione il percorso locale verifica:

- sidecar presente e JSON valido;
- dataset del sidecar coerente con il comando;
- URL di provenienza ufficiale ANAC via HTTPS;
- data di acquisizione valida;
- file locale non vuoto e sotto il limite dimensionale;
- firma ZIP `PK`;
- SHA-256 e byte size dell'archivio effettivamente ingerito;
- presenza di un CSV nello ZIP;
- schema CSV specifico del dataset;
- parsing mediante lo stesso `AnacOperatorsCsvMatcher` usato dal sync di rete;
- filtro esclusivamente sui CIG già monitorati;
- output mediante lo stesso `buildAnacOperatorsSnapshot` e schema `anac-operators.v1`.

La `source.selection` dello snapshot è `verified-local-archive`, mentre `source.archiveUrl`, `source.acquiredAt`, `source.archiveSha256`, `source.archiveBytes` e `source.csvEntry` descrivono la provenienza e i byte realmente elaborati.

Se qualunque gate fallisce, il nuovo snapshot **non viene scritto**. Un file mancante, un sidecar incompleto, un dataset errato, uno schema CSV incompatibile o un archivio non ZIP restano failure osservabili e non vengono trasformati in uno snapshot vuoto.

## Salvaguardie civiche

- Partecipante e aggiudicatario restano ruoli distinti.
- Il nome dell'operatore non diventa identità canonica in assenza di identificatore fiscale source-backed.
- L'assenza di un operatore nell'archivio acquisito non prova la sua assenza dalla BDNCP.
- Ricorrenza, partecipazione e aggiudicazione sono fatti descrittivi e non costituiscono evidenza di collusione, favoritismo, corruzione o infiltrazione.
- Questo percorso non modifica indicatori Cardinal e non introduce risk score pubblici.

## Relazione con il sync di rete

`contracts:anac-operators-sync` resta il percorso ordinario e continua a tentare discovery CKAN/canonical fallback. Il percorso locale è una modalità di acquisizione alternativa dei byte, non una seconda semantica: entrambi convergono sullo stesso parser e sullo stesso snapshot `anac-operators.v1`.
