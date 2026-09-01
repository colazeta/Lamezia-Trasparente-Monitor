# Famiglie per numero di componenti — Lamezia Terme, Censimento permanente 2023

## Fonte canonica

ISTAT, **Dati per sezioni di censimento — Censimento permanente della popolazione e delle abitazioni 2023**, riferimento 31 dicembre 2023. Le basi territoriali sono quelle del 2021.

Pagina fonte: https://www.istat.it/notizia/dati-per-sezioni-di-censimento/

Download registrato nel progetto: `Dati_regionali_2023.zip` da IstatData. Il file regionale Calabria contiene le variabili censuarie per sezione; Lamezia Terme è identificata dal codice ISTAT `079160`.

Edizione acquisita e verificata:

- aggiornamento indicato dalla fonte: **9 giugno 2026**;
- SHA-256 archivio `Dati_regionali_2023.zip`: `05661a6e248d4241c9fdd1b1fa1e740eae0706dd3fcfdbeb366f608269bfeb45`;
- SHA-256 workbook `R18_Calabria_2023_sezioni.xlsx`: `40de6162994478f85773e71829dd7ec49badbef472e285ce4de855793eb1fa28`.

## Variabili

Il profilo comunale usa esclusivamente campi del tracciato ufficiale 2023:

- `PF1`: famiglie residenti, totale;
- `PF3`: famiglie di 1 componente;
- `PF4`: famiglie di 2 componenti;
- `PF5`: famiglie di 3 componenti;
- `PF6`: famiglie di 4 componenti;
- `PF7`: famiglie di 5 componenti;
- `PF8`: famiglie di 6 o più componenti.

`PF9` (famiglie coabitanti) è una variabile distinta e non viene sommata alle classi dimensionali.

## Semantica

Una **famiglia anagrafica** non coincide necessariamente con un nucleo familiare: può essere costituita anche da una sola persona. Il profilo per componenti descrive la dimensione della famiglia anagrafica e non permette di inferire relazioni di coppia, parentela o presenza di figli.

Il dataset comunale già presente in Open Data “Famiglie per numero di figli” resta un arricchimento separato: non ha un anno di riferimento verificato e non include esplicitamente le famiglie senza figli, quindi non può essere usato come denominatore del profilo censuario né trasformato in una serie storica.

Il profilo ISTAT viene usato come **benchmark strutturale 2023** della scheda comunale: fissa il totale canonico di 27.591 famiglie anagrafiche e rende esplicito il perimetro completo. Il confronto è soltanto metodologico e di contesto. Non si calcolano rapporto, scarto o copertura tra le 13.358 famiglie classificate nella risorsa comunale e il totale ISTAT, perché “numero di figli” e “numero di componenti” sono variabili diverse e la risorsa comunale non certifica un periodo coerente né la classe senza figli.

## Regole di aggregazione e QA

1. Ogni riga deve avere un identificativo di sezione con prefisso comunale `079160`; righe prive dell'identificativo o appartenenti a un altro comune bloccano l'aggregazione.
2. Le sezioni fittizie ISTAT `888888x` e `999999x` sono escluse, coerentemente con il layer territoriale pubblico corrente.
3. Valori mancanti restano mancanti: non vengono convertiti a zero.
4. Prima della pubblicazione deve valere, sul perimetro aggregato:

   `PF3 + PF4 + PF5 + PF6 + PF7 + PF8 = PF1`.

5. Se la quadratura non è esatta o esistono righe reali incomplete, il profilo non è qualificato come pubblicabile senza ulteriore verifica.
6. Sono derivati soltanto indicatori trasparenti, fra cui quota di famiglie unipersonali e quota di famiglie con almeno 5 componenti.

## Profilo comunale materializzato

L'aggregazione ufficiale 2023, dopo l'esclusione di una sezione fittizia, comprende **246 sezioni reali complete** e produce:

| Componenti | Campo |   Famiglie |                        Quota |
| ---------- | ----: | ---------: | ---------------------------: |
| 1          | `PF3` |      8.713 |                        31,6% |
| 2          | `PF4` |      7.197 |                        26,1% |
| 3          | `PF5` |      5.369 |                        19,5% |
| 4          | `PF6` |      4.709 |                        17,1% |
| 5          | `PF7` |      1.263 |                         4,6% |
| 6 o più    | `PF8` |        340 |                         1,2% |
| **Totale** | `PF1` | **27.591** | **100% sui conteggi interi** |

La somma delle sei classi è esattamente **27.591**, con residuo zero rispetto a `PF1`. Le quote mostrate sono arrotondate singolarmente a un decimale e possono quindi sommare visivamente a 100,1%.

Indicatori derivati:

- famiglie unipersonali: **8.713**, pari al **31,6%**;
- famiglie con almeno 5 componenti: **1.603**, pari al **5,8%**.

Il profilo versionato è `artifacts/api-server/src/data/lameziaHouseholdComposition2023.json`. Per rigenerarlo dai due file ufficiali:

```bash
corepack pnpm --filter @workspace/scripts run materialize:istat-household-composition-lamezia \
  --variables-xlsx /percorso/R18_Calabria_2023_sezioni.xlsx \
  --archive /percorso/Dati_regionali_2023.zip
```

Il comando ricalcola entrambi gli hash, verifica gli identificativi di sezione, rifiuta duplicati e scrive l'artefatto soltanto dopo il superamento dei gate di pubblicazione.
Inoltre legge direttamente dallo ZIP il membro `Dati_regionali_2023/R18_Calabria_2023_sezioni.xlsx` e richiede che il suo SHA-256 coincida con quello del workbook passato a `--variables-xlsx`: un file esterno o appartenente a un'altra edizione blocca la pubblicazione.
L'artefatto registra inoltre `verification.verifiedAt`: è il momento effettivo in cui hash e gate sono stati superati, distinto da `source.sourceUpdateDate`, che resta la data dichiarata da ISTAT. La UI usa il primo come “Ultimo controllo” e il secondo come “Ultimo aggiornamento della fonte”.

Lo stesso artefatto canonico alimenta sia `/api/demographics/households` sia la scheda statica **“Famiglie per numero di componenti 2023”** nell'archivio Open Data. Il frontend lo include nel bundle come JSON scaricabile: grafico e valori restano quindi consultabili anche nei deploy pubblici privi di un origin API configurato, senza mantenere una seconda copia dei conteggi.

Deep-link pubblico della scheda:

`/opendata?tema=population-society&dataset=lamezia-household-composition-2023`

## Relazione con lo storico famiglie

Questo profilo è una **fotografia censuaria 2023**. Non viene interpolato né retrodatato. Lo storico annuale del numero di famiglie e della popolazione residente in famiglia resta quello canonico derivato dalle release P02 e introdotto separatamente nell’Osservatorio demografico.

## Collegamento territoriale

Le stesse variabili `PF3–PF8` possono in seguito essere esposte, con adeguati controlli di missingness, anche nel layer delle sezioni censuarie dell’Atlante. La sintesi comunale e la lettura sub-comunale devono provenire dalla stessa edizione ISTAT 2023 e non da dataset paralleli.

## Civic safeguard

I dati sono aggregati statistici. Non vengono ricostruite famiglie individuali, relazioni personali o profili di persone. Nessuna composizione familiare viene interpretata automaticamente come indicatore di disagio, vulnerabilità o bisogno di servizi.
