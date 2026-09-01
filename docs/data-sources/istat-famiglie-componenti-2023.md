# Famiglie per numero di componenti — Lamezia Terme, Censimento permanente 2023

## Fonte canonica

ISTAT, **Dati per sezioni di censimento — Censimento permanente della popolazione e delle abitazioni 2023**, riferimento 31 dicembre 2023. Le basi territoriali sono quelle del 2021.

Pagina fonte: https://www.istat.it/notizia/dati-per-sezioni-di-censimento/

Download registrato nel progetto: `Dati_regionali_2023.zip` da IstatData. Il file regionale Calabria contiene le variabili censuarie per sezione; Lamezia Terme è identificata dal codice ISTAT `079160`.

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

## Regole di aggregazione e QA

1. Si aggregano le sole sezioni del Comune di Lamezia Terme (`079160`).
2. Le sezioni fittizie ISTAT `888888x` e `999999x` sono escluse, coerentemente con il layer territoriale pubblico corrente.
3. Valori mancanti restano mancanti: non vengono convertiti a zero.
4. Prima della pubblicazione deve valere, sul perimetro aggregato:

   `PF3 + PF4 + PF5 + PF6 + PF7 + PF8 = PF1`.

5. Se la quadratura non è esatta o esistono righe reali incomplete, il profilo non è qualificato come pubblicabile senza ulteriore verifica.
6. Sono derivati soltanto indicatori trasparenti, fra cui quota di famiglie unipersonali e quota di famiglie con almeno 5 componenti.

## Relazione con lo storico famiglie

Questo profilo è una **fotografia censuaria 2023**. Non viene interpolato né retrodatato. Lo storico annuale del numero di famiglie e della popolazione residente in famiglia resta quello canonico derivato dalle release P02 e introdotto separatamente nell’Osservatorio demografico.

## Collegamento territoriale

Le stesse variabili `PF3–PF8` possono in seguito essere esposte, con adeguati controlli di missingness, anche nel layer delle sezioni censuarie dell’Atlante. La sintesi comunale e la lettura sub-comunale devono provenire dalla stessa edizione ISTAT 2023 e non da dataset paralleli.

## Civic safeguard

I dati sono aggregati statistici. Non vengono ricostruite famiglie individuali, relazioni personali o profili di persone. Nessuna composizione familiare viene interpretata automaticamente come indicatore di disagio, vulnerabilità o bisogno di servizi.
