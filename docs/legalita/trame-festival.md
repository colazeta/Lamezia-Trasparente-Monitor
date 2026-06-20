# Trame - Festival

## Finalita' della sezione

La sezione **Legalita' -> Trame - Festival** nasce come repository civico selettivo per Lamezia Trasparente Monitor. Non e' un archivio generale del festival Trame, non replica il canale YouTube e non raccoglie indiscriminatamente video, nomi o trascrizioni.

L'obiettivo e' trasformare interventi pubblici verificabili in schede riutilizzabili:

```txt
idea / proposta / analisi del contesto -> interlocutore -> evento -> data -> minuto del video -> fonte ufficiale -> rilevanza per Lamezia
```

## Repository interno e pagina pubblica

Il repository interno conserva:

- fonti e snapshot di discovery;
- censimento video;
- programma eventi;
- interlocutori grezzi;
- transcript;
- analisi redazionali;
- scoring editoriale;
- contenuti esclusi o da verificare.

La pagina pubblica mostra solo contenuti approvati, con fonte precisa, minuto video, stato transcript e nota editoriale. Non mostra transcript integrali, elenco completo dei video, elenco completo degli interlocutori o contenuti non approvati.

## Fonti utilizzate

Fonti iniziali censite il 2026-06-19:

- sito ufficiale Trame Festival: `https://www.tramefestival.it/`;
- programma ufficiale Trame.15, 16-21 giugno 2026;
- playlist YouTube Trame.15 incorporata nel sito ufficiale: `https://www.youtube.com/playlist?list=PLC9oIvsXy4uFd-aXGDR8zMfYsSdBMh7q7`;
- canale YouTube rilevato dalla playlist: `https://www.youtube.com/@tramefestival`, da confermare manualmente come fonte autonoma;
- endpoint tecnico YouTube timedtext per verifica disponibilita' sottotitoli, marcato come probe non editoriale.

Gli stati ammessi per le fonti sono:

```txt
official
official_to_verify
derived
manual_entry
blocked_source_access
```

## Struttura dati

```txt
data/legalita/trame/
  sources/
  transcripts/
  analysis/
  public_cards/
  qa/
  trame_sources.yml
  trame_videos.csv
  trame_people.csv
  trame_events.csv
docs/legalita/
scripts/legalita/trame/
artifacts/lamezia-trasparente/src/content/
artifacts/lamezia-trasparente/src/pages/
```

File principali:

- `trame_sources.yml`: registro fonti e limiti;
- `trame_videos.csv`: censimento video Trame.15 da playlist ufficiale;
- `trame_people.csv`: repository interno interlocutori grezzi;
- `trame_events.csv`: eventi da programma ufficiale;
- `public_cards/trame_public_cards.csv`: sole schede candidabili o pubblicabili;
- `qa/trame_editorial_review.csv`: audit editoriale e decisioni;
- `artifacts/lamezia-trasparente/src/content/trameFestival.ts`: modello pubblico tipizzato e filtro di pubblicazione;
- `artifacts/lamezia-trasparente/src/pages/TrameFestival.tsx`: pagina React integrata nella route `/legalita/trame-festival`.

## Pipeline di discovery

Comandi previsti:

```txt
pnpm run trame:discover
pnpm run trame:transcripts:probe
pnpm run trame:cards
pnpm run trame:qa
pnpm --filter @workspace/lamezia-trasparente run build
```

`trame:discover` censisce programma ufficiale e playlist YouTube Trame.15. Il matching tra evento e video e' prudente e viene salvato come metadato, non come attribuzione editoriale definitiva.

## Pipeline transcript

La pipeline transcript:

1. legge `trame_videos.csv`;
2. verifica se YouTube espone track di sottotitoli;
3. salva un report in `qa/trame_transcript_probe.csv`;
4. non pubblica transcript integrali;
5. non considera transcript automatici come verificati;
6. richiede revisione umana prima di usare citazioni, minuti o speaker.

Stati transcript ammessi:

```txt
not_started
auto_available
downloaded
normalised
review_required
human_verified
blocked
```

Naming transcript:

```txt
YYYY_trame_<video_id>_transcript.md
```

## Analisi civica

Ogni analisi interna deve distinguere:

- contenuto espresso dall'interlocutore;
- sintesi redazionale;
- proposta civica derivata;
- inferenza da verificare.

Stati analisi ammessi:

```txt
not_started
candidate_extraction
editorial_review
approved_for_publication
excluded
needs_human_review
```

## Scoring editoriale

Ogni contenuto candidato riceve punteggio 1-5 per:

```txt
analytical_depth
non_obviousness
territorial_relevance
specificity
civic_transformability
source_verifiability
```

La priorita' editoriale puo' essere:

```txt
high
medium
low
exclude
```

Regola di pubblicazione:

- `high`: pubblicabile solo con verifica completa;
- `medium`: pubblicabile solo se molto rilevante e ben attribuito;
- `low`: non pubblicare;
- `exclude`: conservare solo per audit interno.

## Criteri di inclusione

Un contenuto puo' diventare scheda pubblica se:

- non e' generico o retorico;
- collega cause, conseguenze, attori o responsabilita';
- ha rilevanza diretta o trasferibile per Lamezia, Calabria, Mezzogiorno o territori ad alta esposizione criminale;
- indica un problema, meccanismo, pratica, soluzione, criticita' o linea di azione;
- puo' generare proposta civica, indicatore, accesso civico, policy locale, benchmark, campagna pubblica o approfondimento;
- e' attribuibile a interlocutore, ruolo, evento, data, minuto e fonte ufficiale.

## Criteri di esclusione

Sono esclusi dalla pagina pubblica:

- formule generiche come "serve piu' legalita'" o "bisogna fare rete", salvo analisi concreta;
- contenuti celebrativi;
- contenuti non attribuibili con precisione;
- parafrasi ambigue;
- proposte inventate o dedotte in modo eccessivo;
- transcript integrali;
- dati grezzi su video e interlocutori.

## Limiti etici e legali

Non attribuire a una persona proposte non chiaramente presenti nel transcript. Non trasformare opinioni in fatti accertati. Non fare affermazioni accusatorie non supportate. Usare estratti testuali brevi solo se necessari e verificare eventuali limiti di copyright o riuso delle trascrizioni.

## Stato attuale

Questa e' una prima materializzazione fondativa. La pagina pubblica dichiara che la revisione e' in corso e non pubblica schede civiche fino a quando non esistono contenuti approvati con minuto, fonte e verifica.

## Prossimi passi

Vedi `docs/legalita/trame-festival-backlog.md`.
