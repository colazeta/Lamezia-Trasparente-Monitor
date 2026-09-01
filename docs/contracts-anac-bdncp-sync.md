# Collegamento resiliente ANAC/BDNCP

La sezione `/contratti` usa due collegamenti ufficiali distinti. Non li presenta come equivalenti e non dichiara una copertura BDNCP completa.

## Livelli del collegamento

1. **Scheda ufficiale per CIG.** Ogni CIG formalmente valido apre `https://dati.anticorruzione.it/superset/dashboard/dettaglio_cig/?cig=...`. Il link resta disponibile anche se il download degli open data non risponde.
2. **Snapshot strutturato.** Il workflow `ANAC BDNCP sync` consulta i pacchetti CSV ZIP mensili pubblicati nella pagina ufficiale [Aggiornamenti CIG](https://dati.anticorruzione.it/opendata/dataset/cig), seleziona soltanto i CIG presenti nella finestra corrente dell'Albo e pubblica uno stato verificabile.

La [Banca Dati Nazionale dei Contratti Pubblici](https://pubblicitalegale.anticorruzione.it/bdncp) e il [catalogo open data ANAC](https://dati.anticorruzione.it/opendata) restano collegati come fonti ufficiali.

## Frequenza e perimetro

Il workflow `.github/workflows/anac-bdncp-sync.yml` parte ogni giorno alle 05:40 UTC, puo essere avviato manualmente e parte quando la pipeline cambia su `main`. In quest'ultimo caso attende prima che il commit scatenante sia verificato sul sito pubblico; solo dopo esegue il primo aggiornamento. Il nuovo commit dati viene a sua volta verificato in produzione, evitando una sovrapposizione ambigua con il deploy iniziale.

Per impostazione predefinita:

- prova fino a 12 mesi, dal piu recente al meno recente;
- interrompe il download dopo 3 pacchetti validi;
- accetta al massimo 300 MB compressi per pacchetto;
- applica timeout, un solo retry, controllo del dominio finale e firma ZIP;
- estrae soltanto il CSV e conserva campi pubblici minimi: CIG, oggetto lotto, stazione appaltante, importo lotto, procedura e identificativo record quando presenti.

Il perimetro e intenzionalmente limitato. Un CIG non trovato nei pacchetti consultati non viene classificato come assente dalla BDNCP.

## Continuita e ultimo dato valido

Il file pubblico `data/public/contracts/anac-bdncp/latest.json` e versionato e validato prima del build. A ogni tentativo la pipeline distingue:

- `current`: almeno un pacchetto ufficiale e stato scaricato e letto;
- `stale`: il tentativo e fallito, ma esiste uno snapshot valido precedente;
- `degraded`: la fonte non ha ancora prodotto uno snapshot valido;
- `pending`: la prima esecuzione non e ancora avvenuta.

Un errore remoto non svuota mai i record gia validati. Se nessun pacchetto e disponibile, la pipeline conserva record, data dell'ultimo successo e periodi consultati; aggiorna soltanto il tentativo e lo stato. Il job termina senza trasformare l'indisponibilita esterna in un falso “zero contratti”. Errori di codice o di schema continuano invece a bloccare il build.

## Superficie pubblica

Il build incorpora lo snapshot nel dataset contratti e il worker espone:

- `GET /api/contracts/anac-status`
- schema `anac-bdncp-connection.v1`
- stato, ultimo tentativo, ultimo successo, numero di link diretti, match strutturati e pacchetti consultati.

Il worker riclassifica come `stale` uno snapshot marcato `current` quando l'ultimo successo supera 72 ore. La UI mostra sempre il limite: mancato match nella finestra consultata non significa assenza dalla BDNCP.

Gli importi ANAC restano identificati come importi del lotto e non sovrascrivono ne sommano gli importi ricavati dagli oggetti degli atti dell'Albo.

## Esecuzione e controlli

Comando locale:

```bash
pnpm contracts:anac-sync
```

Parametri opzionali:

- `ANAC_LOOKBACK_MONTHS` (1-60, default 12)
- `ANAC_MAX_SUCCESSFUL_ARCHIVES` (1-12, default 3)
- `ANAC_ARCHIVE_MAX_BYTES` (default 300 MB)

I test coprono URL mensili deterministici, CSV delimitato e quotato, mapping limitato ai CIG tracciati, conservazione della cache e distinzione tra fonte fallita e pacchetto valido senza match.
