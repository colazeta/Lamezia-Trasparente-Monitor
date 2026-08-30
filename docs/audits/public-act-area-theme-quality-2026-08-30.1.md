# Qualita' della tassonomia tematica degli atti — 2026-08-30.1

## Esito

La tassonomia `municipal-public-act-area-theme-it@2026-08-30.1` supera le
soglie iniziali sul gold set revisionato: accuratezza tema 100%, precisione
high-confidence 100%, fallback 0% e determinismo/idempotenza 100%.

Nessun filtro valutato e' pero' pronto sullo snapshot corrente. `act_family` e
`issuer/organ` non hanno ancora un vero contratto; le proxy raggiungono
rispettivamente il 93,24% e il 91,89%, sotto il 98%. `area_theme` non e' ancora
materializzato nei record committati. L'azione copre solo il 5,17% e nessuna
opzione raggiunge cinque record. I quattro gate machine-readable restano
quindi `false`.

## Perimetro verificato

- gold set: `albo-area-theme-gold-set@2026-08-30.1`;
- fonte delle fixture: snapshot pubblico Albo recuperato il
  `2026-08-30T11:50:38.527Z`;
- record revisionati: 23;
- record con oggetto public-safe sostanziale: 21;
- record prudenzialmente minimizzati: 2;
- input del classificatore: solo `subject` public-safe;
- PDF, testo grezzo, ufficio, tipo atto e altri campi soppressi: non usati.
- assessment machine-readable:
  `albo-navigation-facet-readiness.2026-08-30.1.json`.

## Metriche

| Controllo                               | Soglia | Risultato    | Esito |
| --------------------------------------- | ------ | ------------ | ----- |
| Accuratezza `area_theme`                | >=90%  | 21/21 (100%) | passa |
| Precisione assegnazioni high-confidence | >=97%  | 21/21 (100%) | passa |
| Fallback su input disponibile           | <=10%  | 0/21 (0%)    | passa |
| Rispetto della soppressione privacy     | 100%   | 2/2          | passa |
| Determinismo e idempotenza              | 100%   | 23/23        | passa |

Lo snapshot corrente contiene 58 record `publishable` con oggetto sostanziale.
Una simulazione del profilo assegna un tema a 58/58, ma il contratto
`presentation.area_theme` e' materializzato in 0/58 record committati. Il primo
numero misura la capacita' del classificatore, il secondo la readiness reale
del dato servito. Solo quest'ultimo puo' abilitare il filtro.

## Regressioni coperte

- mobilita' con riferimenti concorrenti a sport, evento o videosorveglianza;
- edilizia con permesso, concessione, sanatoria, condono e piano attuativo;
- scuola con lavori, adeguamento sismico, energia, mensa o PNRR;
- sport e turismo con lavori, progettazione o collaudo;
- esercizio commerciale con riferimenti a spettacolo, senza falso tema cultura;
- viabilita' interna come lavoro infrastrutturale quando manca un provvedimento
  sulla circolazione;
- pareggio reale tra regole: fallback `ambiguous_match`;
- oggetto soppresso o mancante: motivi null distinti;
- override editoriale: ID, motivazione, regola e tema precedenti conservati.

## Gate per i filtri

| Facetta        | Misura corrente                                                 | Soglia                                                 | Esito | Filtro |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------ | ----- | ------ |
| `act_family`   | proxy `act_category`: 69/74 (93,24%); accuratezza non stimata   | copertura/accuratezza >=98%                            | FAIL  | no     |
| `issuer/organ` | proxy `sector`: 68/74 (91,89%); accuratezza non stimata         | copertura/accuratezza >=98%                            | FAIL  | no     |
| `area_theme`   | gold: 100%; materializzato: 0/58; fallback corpus non stimabile | >=90%, high >=97%, fallback <=10%, 100% materializzato | FAIL  | no     |
| `action`       | 3/58 (5,17%); precisione 3/3; minimo opzione 1                  | >=70%, >=95%, almeno 5 record/opzione                  | FAIL  | no     |

Per `action`, lo snapshot espone due `approvazione` e una `presa_atto`.
La precisione revisionata e' 100%, ma non compensa la copertura insufficiente
ne' la scarsita' per opzione. La precisione e' stimata sulle tre assegnazioni
del gold set; la coverage e la numerosita' sono misurate sui 58 record
pubblicabili correnti.

Il superamento del gate del tema non autorizza a usare `area_theme` come
sinonimo di famiglia, tipologia, settore, organo, ufficio, azione o macrotema.
I consumer devono usare gli ID stabili e rendere visibile il fallback senza
inventare categorie.

`classification.act_category` descrive una categoria civica derivata dalla
tipologia e non viene rinominata `act_family`. Analogamente,
`classification.sector` e' un settore civico derivato da provenienza e tipo,
non un identificatore dell'emittente o dell'organo. Entrambi restano visibili
nel descriptor come proxy di copertura, con `contract_status: "missing"` e
`public_filter_ready: false`.

## Limiti e prossima verifica

Il campione riflette una sola finestra dell'Albo e alcune categorie, tra cui
welfare e salute, non sono presenti nello snapshot. Prima di estendere i filtri
all'archivio storico occorre ampliare il gold set con delibere di anni e organi
diversi, misurare separatamente le categorie poco rappresentate e revisionare
ogni nuova regola che modifichi la distribuzione o il tasso di fallback.
