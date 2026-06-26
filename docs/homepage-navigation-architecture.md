# Homepage e navigazione civica

Questo documento descrive la nuova architettura informativa della homepage e della navigazione primaria di Lamezia Trasparente Monitor.

## Macro-aree primarie

La homepage espone poche macro-aree civiche, non una lista piatta di moduli con lo stesso peso visivo.

| Macro-area | Sezioni canoniche |
| --- | --- |
| Cosa decide il Comune | Sedute e ordini del giorno; Delibere e atti; Albo Pretorio; Atti fondamentali |
| Chi governa e come vota | Organi istituzionali; Amministratori; Macchina comunale; Elezioni e voti |
| Cosa viene finanziato e realizzato | Contratti pubblici; PNRR; Incarichi e consulenze; Performance |
| Criticita e luoghi della citta | Criticita pubbliche |
| Memoria civica e antimafia | Beni confiscati; Legalita e memoria; Trame - Festival |
| Partecipazione e proposte | Proposte civiche; Accesso civico; Segnalazioni |
| Dati pubblici e territorio | Atlante territoriale; Open data; Dati elettorali; Dataset scaricabili |
| Stato delle fonti e monitoraggio | Stato delle fonti; Metodologia; Promessometro; Incarichimetro; Roadmap |

Le sezioni tecniche o di supporto, come API, feed, note legali, contatti, guida, fonti dati di dettaglio e statistiche, restano raggiungibili dove utile ma non competono con le macro-aree civiche nella homepage.

## Stati delle sezioni

Il modello di navigazione usa quattro stati espliciti:

| Stato | Rendering atteso |
| --- | --- |
| `available` | Sezione pienamente attiva, colore pieno, link abilitato. Usare solo quando pagina, fonti, copy, caveat e QA sono stati lavorati e verificati. |
| `in_progress` | Sezione grigia/neutra con badge "In lavorazione". Il link resta abilitato solo se la pagina contiene contenuto utile, non un placeholder ingannevole. |
| `planned` | Sezione attenuata con badge "Prevista" o "In arrivo". Non e navigabile dalla homepage o dal menu primario. |
| `hidden` | Non compare in homepage, menu primario o command palette. Puo restare come route legacy, supporto tecnico, footer o redirect. |

La command palette deriva dalla stessa registry della navigazione e mostra solo voci navigabili. Non deve reintrodurre voci legacy come sezioni primarie.

## Mapping legacy

| Vecchia voce/percorso | Canonico attuale | Regola |
| --- | --- | --- |
| Bandi e avvisi `/bandi` | Contratti pubblici `/contratti` | Redirect 301 e voce `hidden` nella registry |
| Confronto performance `/performance/confronta` | Performance `/performance` | Redirect/alias e rimozione dalle CTA primarie |
| Nuova segnalazione `/monitoraggio/nuovo` | Segnalazioni `/segnalazioni` | Azione non primaria; il percorso resta supportato per compatibilita dei flussi contestuali |
| Archivio proposte `/archivio-proposte` | Proposte civiche `/proposte-civiche` | Redirect 301 e nuova route canonica |
| DEMI | Proposte civiche `/proposte-civiche` | Da trattare come contenuto o fonte interna della sezione, non come card autonoma |
| Timeline legalita `/legalita/timeline` | Legalita e memoria `/legalita` | Redirect/alias e rimozione come card autonoma |
| Fonti dati, qualita dati, roadmap, API, feed | Stato/fonti o footer tecnico | Non devono competere come sezioni civiche autonome |
| Incarichimetro `/incarichimetro` | Incarichi e consulenze `/incarichimetro` | Alias tecnico mantenuto nella registry come `hidden` per evitare una seconda card sullo stesso percorso |

## Promozione a `available`

Una sezione puo passare da `planned` o `in_progress` ad `available` solo quando:

- la pagina pubblica ha contenuto utile e non solo placeholder;
- fonti, limiti, stato dati e ultimo controllo sono visibili dove servono;
- non presenta indicatori, segnalazioni o demo come prove o dati completi;
- route, sitemap, redirect e command palette sono allineati;
- mobile, accessibilita di base, typecheck, test e build sono verificati;
- il contenuto sensibile ha copy prudente, fonte e caveat metodologici.

Se uno di questi criteri manca, la sezione resta `in_progress` o `planned` anche se la route esiste.
