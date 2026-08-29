# Provenienza e manutenzione del layer geografico delle proposte

## Scopo

`artifacts/lamezia-trasparente/src/data/proposalGeography.ts` contiene riferimenti geografici destinati esclusivamente a indicizzazione, filtro e visualizzazione delle proposte civiche. Le coordinate non definiscono confini amministrativi, catastali o progettuali e non devono essere interpretate come rilievi tecnici.

## Modello di precisione

Ogni punto dichiara esplicitamente una delle seguenti classi:

- `exact_landmark`: luogo fisico identificabile e coordinate riferite al luogo;
- `street_approximate`: riferimento approssimativo lungo la via indicata dalla fonte;
- `area_centroid`: punto rappresentativo di un'area più ampia, non posizione esatta dell'intervento;
- `city_centroid`: solo centroide di visualizzazione per proposte riferite all'intero territorio comunale.

Una proposta che interessa più sedi conserva più punti. Le proposte `citywide` non vengono mostrate come pin puntuali nella mappa pubblica.

## Gerarchia delle fonti

Per nuove localizzazioni si applica, ove possibile, il seguente ordine di preferenza:

1. fonti istituzionali che identificano esplicitamente sede o luogo;
2. OpenStreetMap o altri repertori cartografici aperti e verificabili;
3. repertori cartografici pubblicamente accessibili usati esclusivamente come riscontro del punto;
4. riferimenti stradali approssimati, sempre qualificati come tali, quando non è disponibile un punto autorevole.

Il dataset conserva per ogni punto `sourceLabel` e, quando disponibile, `sourceUrl`. La presenza di un URL documenta la provenienza del riferimento e non implica che Lamezia Trasparente attribuisca alla fonte una particolare licenza, garanzia o autorità.

## Fonti attualmente utilizzate

- Comune di Lamezia Terme: denominazioni ufficiali delle sedi e associazione territoriale delle strutture, tra cui i tre asili nido;
- Regione Calabria: coordinate tabellari di strutture pubbliche, quando disponibili, tra cui il Presidio ospedaliero Giovanni Paolo II;
- OpenStreetMap/Mapcarta: riscontro di luoghi e landmark pubblici;
- BLIA e altri stradari pubblicamente accessibili: riferimenti di via utilizzati come coordinate approssimate;
- repertori pubblicamente accessibili di indirizzi: impiegati solo come riscontro provvisorio di una via quando non era disponibile una fonte cartografica migliore.

Le fonti dell'ultima categoria devono essere sostituite con una fonte istituzionale o cartografica aperta quando questa diventa disponibile. Non vengono copiati testi, immagini, database proprietari o dati personali: il layer registra soltanto il riferimento geografico necessario alla proposta e il collegamento alla pagina consultata.

## Regola editoriale

La fonte geografica deve comprovare il luogo, non il contenuto politico o civico della proposta. La fonte della proposta rimane separata e continua a essere registrata nel record e nella sua timeline.

Non si deve aumentare artificialmente la precisione. Se una fonte identifica soltanto una via o un'area, il punto deve restare `street_approximate` o `area_centroid`. Se la localizzazione non è verificabile, non va inventata una coordinata puntuale.

## Manutenzione

Il controllo ordinario del layer avviene insieme allo scouting delle proposte:

- ogni nuovo `PublicProposal` deve avere un record geografico corrispondente;
- non devono esistere record geografici orfani;
- coordinate e tag devono superare i test di integrità in `proposalGeography.test.ts`;
- quando una fonte migliore permette di correggere o affinare una localizzazione, la coordinata e la classe di precisione vengono aggiornate nella stessa pull request, mantenendo una nota metodologica quando il cambiamento è sostanziale;
- link non più accessibili o fonti divenute inadatte devono essere sostituiti senza attribuire retroattivamente maggiore precisione al dato originario.

## Limiti

La tassonomia `Nicastro`, `Sambiase`, `Sant’Eufemia`, `Costa lametina`, `Intera città` è un dispositivo di navigazione dell'archivio. Non pretende di riprodurre perimetri giuridicamente vincolanti. Nei casi di confine o sovrapposizione territoriale, la scheda deve dichiarare l'incertezza anziché forzare una classificazione apparentemente precisa.
