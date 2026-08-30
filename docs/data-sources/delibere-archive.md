# Archivio cumulativo delle delibere

## Fonte e perimetro

- Fonte: Albo Pretorio del Comune di Lamezia Terme, provider Tinnvision.
- URL fonte: `https://albo.tinnvision.cloud/?ente=00301390795`.
- Output pubblico: `data/public/albo/delibere-archive.json`.
- Stato di verifica: ereditato da ogni acquisizione della pipeline Albo.

L'archivio contiene soltanto deliberazioni già presenti negli output public-safe
`data/public/albo/latest.json` versionati dal monitor. Non legge né pubblica raw
snapshot o record processed non minimizzati. Prima di ogni scrittura, tutti i
record preesistenti e storici sono nuovamente proiettati dalla policy privacy
corrente e ricevono una `presentation` deterministica costruita sul solo oggetto
già public-safe.

## Aggiornamento

`pnpm albo:fetch` unisce le deliberazioni dell'ultimo snapshot all'archivio
esistente. Un atto resta consultabile quando esce dall'elenco corrente dell'Albo.
Se una classificazione successiva sposta esplicitamente lo stesso record in
`do_not_publish`, il record viene rimosso dall'archivio cumulativo.
Nella pagina pubblica, l'archivio prevale inoltre sui duplicati API: dettagli e
allegati API non possono arricchire un record già minimizzato o a solo metadato.
Per un duplicato pubblicabile a basso rischio, il client può aggiungere soltanto
il collegamento alla medesima proiezione pubblica e allegati con attestazione
esplicita; se esiste già una copia archiviata, quella resta il riferimento
documentale prioritario. La corrispondenza avviene esclusivamente sul
`public_id` stabile, non su euristiche basate su numero, data o testo.

Ogni nuova acquisizione pubblica registra una `privacy_attestation` con versione
della policy e base della valutazione. Un record storico già redatto che non ha
un'attestazione completa per la policy corrente non può essere rivalutato dai
campi rimasti: viene mantenuto al massimo come `metadata_only`, marcato
`reacquisition_required` e non torna più permissivo finché non viene riacquisito
dalla fonte. Il campo public-safe `deliberation_body`, derivato prima della
redazione, conserva invece il filtro Giunta/Consiglio senza esporre l'oggetto o
il tipo atto rimossi.

Il seed iniziale si rigenera, con un bootstrap integro o con cronologia Git
completa, tramite:

```sh
pnpm albo:seed-delibere-archive
```

Il comando legge esclusivamente output pubblici versionati:

- gli snapshot versionati e il `data/public/albo/latest.json` corrente del
  worktree, applicato per ultimo se diverge dall'ultimo commit;
- il precedente `data/public/albo/delibere-archive.json`, se presente, come
  bootstrap cumulativo;
- il solo `data/public/albo/documents-manifest.json` corrente per autorizzare i
  link alle copie locali.

La baseline immutabile del seed iniziale è registrata in
`scripts/fixtures/delibere-archive-seed-baseline.json`. Se il bootstrap pubblico
manca, il comando rifiuta un checkout Git shallow. Prima della scrittura verifica
inoltre che l'unione tra bootstrap e snapshot public-safe elaborati contenga
tutti gli ID della baseline: un bootstrap già incompleto non può quindi
nascondere una cronologia insufficiente. Il controllo riguarda la completezza
delle fonti elaborate, non impone un conteggio minimo all'output vivo: un record
può comunque essere rimosso quando una policy successiva lo porta in
`do_not_publish`, perché il suo ID resta osservabile tra gli esclusi della
cronologia completa. Per ricostruire o riparare un bootstrap è quindi necessario
un clone con cronologia completa (`fetch-depth: 0`).

L'applicazione finale del `latest.json` corrente impedisce che un seed eseguito
tra `albo:fetch` e il relativo commit ripristini un atto appena spostato in
`do_not_publish`. Se coincide con l'ultimo snapshot Git viene deduplicato.
Anche `pnpm albo:sanitise-public` rigenera l'archivio dalla versione sanitizzata
di `latest.json` e dal manifest sanitizzato, così revoche, presentazioni e policy
privacy restano coerenti su tutti gli output pubblici.

## Contratto di consultazione

La pagina `/delibere` trasforma archivio statico e risposta API nello stesso
view model pubblico. Le regole di presentazione sono condivise e verificabili:

- il titolo visibile e il testo di ricerca provengono sempre da `presentation`;
- `public_id` è identità, chiave di deduplicazione e destinazione stabile dei
  collegamenti alle schede;
- `presentation.area_theme.theme_id` è la chiave del filtro tematico; la label
  è solo testo per il lettore e può cambiare con una nuova versione;
- un tema non assegnabile resta esplicito come “Area non disponibile”, senza
  derivarlo da campi soppressi o dal PDF;
- ricerca, organo, tema, anno o intervallo e pagina sono serializzati nell'URL;
  anno e intervallo personalizzato sono alternative, non filtri sovrapposti;
- la paginazione usa blocchi deterministici di 20 record e riporta sempre il
  conteggio filtrato sul totale unificato;
- un errore dell'API non viene rappresentato come zero risultati: il fallback
  statico resta consultabile e l'errore di aggiornamento è indicato a parte.

I titoli lunghi non vengono troncati nel dato: la card limita solo l'ingombro
visivo e offre l'espansione del testo completo. Fonte, copertura e limite di
completezza restano visibili in forma sintetica; i dettagli metodologici sono
espandibili.

## Documenti

Il collegamento a una copia PDF locale viene conservato solo quando il manifest
Albo corrente contiene lo stesso record e lo ha classificato come
`public_visibility=publishable` e `privacy_risk=low`. Un riferimento storico non
più autorizzato dal manifest viene rimosso. Durante il seed, digest SHA-256,
dimensione, MIME e percorso fisico vengono ricontrollati prima di conservare il
link. Nessun PDF viene interpretato, sottoposto a OCR o riassunto.

## Copertura iniziale

Seed rigenerato con la policy corrente il 30 agosto 2026:

- 63 deliberazioni osservate;
- 43 deliberazioni di Giunta;
- 20 deliberazioni di Consiglio;
- 1 PDF autorizzato dal manifest corrente;
- 10 assegnazioni tematiche deterministiche e 53 record senza area disponibile
  (28 per testo soppresso dalla policy privacy, 25 senza regola sufficientemente
  specifica);
- date degli atti osservati: 10 giugno–24 agosto 2026.

## Limiti

La copertura coincide con ciò che il monitor ha osservato e versionato. Non è
una certificazione di completezza storica e non sostituisce l'Albo Pretorio
ufficiale. Oggetti minimizzati e record a solo metadato restano tali anche
nell'archivio; non vengono ricostruiti da versioni precedenti o da altre fonti.
