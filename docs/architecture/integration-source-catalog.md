# Catalogo delle fonti e delle integrazioni

Questo catalogo elenca le principali fonti che alimentano, o possono alimentare, Lamezia Trasparente Monitor. Non sostituisce il database, la specifica OpenAPI o le issue operative: serve a rendere esplicito il ruolo di ogni fonte nel sistema.

## Stati usati

| Stato | Significato |
| --- | --- |
| `presente` | dominio già documentato nel prodotto o nell'API pubblica |
| `presente / da consolidare` | dominio già presente, ma con documentazione o controlli da rafforzare |
| `proposto` | integrazione pianificata, non ancora da trattare come dato disponibile |
| `audit-only` | fonte utile per confronto o verifica, non per pubblicazione diretta |
| `strumentale` | servizio tecnico, non fonte documentale civica |

## Catalogo sintetico

| Dominio | Fonte primaria / federata | Ruolo | Stato | Superfici candidate | Caveat principali |
| --- | --- | --- | --- | --- | --- |
| Albo Pretorio e atti | Portale/atti del Comune di Lamezia Terme | primaria locale | presente | web, mobile, REST, MCP | PDF e allegati firmati possono non essere elaborabili; testo Markdown è best-effort |
| Allegati e copie archiviate | URL ufficiali + object storage locale | evidenza tecnica | presente / da consolidare | web, REST dove opportuno | la copia archiviata non sostituisce il documento ufficiale |
| Contratti pubblici | ANAC / obblighi L. 190/2012 e dataset collegati | primaria nazionale | presente | web, REST, MCP, open data | CIG, importi e fornitori vanno mantenuti con fonte e data; eventuali mismatch non sono automaticamente anomalie |
| PNRR | Italia Domani / ReGiS / censimenti pubblici disponibili | primaria nazionale | presente | web, REST, MCP | stati e importi possono avere aggiornamenti asincroni rispetto ad atti locali |
| Performance | indicatori ISTAT SDMX e valori manuali/locali | primaria nazionale + locale | presente | web, REST, MCP | distinguere sempre dato ufficiale, dato manuale e indicatore derivato |
| Bandi e avvisi | fonti pubbliche comunali o correlate | primaria locale | presente | web, mobile | collegamenti a contratti/PNRR sono relazioni locali da verificare |
| Beni confiscati | ANBSC e dataset pubblici collegati | primaria nazionale | presente | web, mobile, mappe | georeferenziazione e stato dei beni possono richiedere verifica puntuale |
| Atti fondamentali | atti comunali chiave, delibere, regolamenti, bilanci | primaria locale | presente | web | classificazione e priorità sono letture locali; il testo ufficiale resta la fonte |
| Monitoraggio civico | segnalazioni e contenuti moderati | editoriale/civico | presente | web, mobile | non è fonte amministrativa primaria; richiede moderazione e minimizzazione dati personali |
| Open data locale | catalogo locale DCAT-AP_IT e CKAN compatibile | superficie di riuso | presente | open data, API | deve mantenere metadati, licenza, dataset/risorse e tracciabilità |
| API pubblica | `/api/public/v1` | superficie read-only | presente | REST, OpenAPI | deve restare versionata, documentata e coerente con il data-access layer |
| MCP pubblico | `/api/mcp` | superficie read-only per assistenti AI | presente | MCP Streamable HTTP | deve restare stateless, read-only e coerente con REST quando espone gli stessi dati |
| Cruscotto Italia | AgID / fonti nazionali federate per codice ISTAT | federata nazionale | proposto | dossier comune, REST, MCP, audit diff | fonte federatrice, non primaria; non deve sovrascrivere dati locali senza istruttoria |
| BDAP-MOP / opere pubbliche | MEF-RGS / BDAP-MOP, anche tramite Cruscotto Italia | primaria nazionale o federata | proposto | dossier comune, audit, mappe | copertura e granularità da verificare; attenzione ai progetti non comunali o intercomunali |
| SIOPE | SIOPE / Banca d'Italia-RGS, anche tramite Cruscotto Italia | primaria nazionale o federata | proposto | dossier comune, grafici, audit | dati di cassa: non equivalgono automaticamente a bilancio politico o responsabilità gestionale |
| RUNTS | Registro Unico Nazionale Terzo Settore, anche tramite Cruscotto Italia | primaria nazionale o federata | proposto | dossier comune, contesto civico | presenza territoriale non implica rapporti economici con il Comune |
| ASIA UL / imprese | ISTAT, anche tramite Cruscotto Italia | primaria nazionale o federata | proposto | dossier comune | dato statistico; non usare per inferenze su singole imprese |
| Sezioni censuarie | ISTAT 2021, anche tramite Cruscotto Italia | primaria nazionale o federata | proposto / audit-only | atlante urbano, mappe | denominatori bassi e sezioni non residenziali richiedono caveat forti |
| Civici ANNCSU | ANNCSU, anche tramite Cruscotto Italia | primaria nazionale o federata | proposto / audit-only | atlante urbano, geografie | dato puntuale utile ma da usare con minimizzazione e limiti di accuratezza |
| Catasto | Agenzia Entrate / servizi collegati, anche tramite Cruscotto Italia | primaria nazionale o federata | proposto / audit-only | verifiche puntuali, non layer massivo v0 | dati catastali hanno limiti d'uso, granularità e rischi privacy |
| Scuole, sanità, farmacie | fonti nazionali/territoriali federate | primaria o federata | proposto | dossier comune | non duplicare servizi istituzionali; usare come contesto territoriale |
| AI summaries | modello AI su testi già acquisiti | trasformazione locale | presente / strumentale | web, eventualmente API se marcato | mai testo ufficiale; sempre indicare natura automatica/best-effort |
| Email e notifiche | Resend e workflow applicativi | strumentale | presente | notifiche | non è fonte civica; dati personali minimizzati e non esposti pubblicamente |
| Object storage | Replit sidecar / GCS | strumentale | presente | archiviazione | conserva evidenze, non determina ufficialità del dato |
| Mappe e tile | provider cartografici / Leaflet / mappe native | strumentale | presente | web, mobile | base map non è fonte amministrativa; layer dati devono avere proprie fonti |

## Fonte primaria, fonte federata e trasformazione locale

Una stessa scheda pubblica può combinare tre livelli. Esempio:

```txt
Contratto pubblico mostrato nel monitor
├─ fonte primaria: ANAC o file comunale L. 190/2012
├─ eventuale fonte federata: Cruscotto Italia, se usato per confronto
└─ trasformazione locale: normalizzazione importi, collegamento a tema civico, eventuale sintesi o tag
```

Il frontend e l'API devono evitare formulazioni ambigue come “dato ufficiale Lamezia Trasparente” quando il dato ufficiale appartiene a un'altra amministrazione. La forma corretta è: “dato da [fonte primaria], acquisito/normalizzato da Lamezia Trasparente Monitor”.

## Metadati minimi per fonte pubblica

Ogni fonte pubblicabile dovrebbe essere rappresentabile con questa struttura concettuale:

```ts
type IntegrationSourceRecord = {
  sourceId: string;
  displayName: string;
  sourceRole: "primary-local" | "primary-national" | "federated" | "editorial" | "service";
  owner?: string;
  officialUrl?: string;
  licence?: string;
  extractedAt?: string;
  publishedAt?: string;
  updatedAtFromSource?: string;
  updateFrequency?: string;
  granularity: "document" | "contract" | "project" | "municipality" | "submunicipal" | "point" | "mixed" | "unknown";
  publicUse: "published" | "audit-only" | "internal-only";
  qualityStatus: "ok" | "partial" | "missing" | "stale" | "unverified";
  caveats: string[];
};
```

## Regole per collegare fonti tra loro

### Collegamento forte

Usare quando esiste un identificativo condiviso o un riferimento esplicito:

- CIG per contratti;
- CUP per PNRR/opere;
- numero/progressivo e data dell'atto;
- codice ISTAT comune;
- codice meccanografico scuola;
- identificativo dataset/risorsa.

### Collegamento debole

Usare solo come suggerimento da verificare:

- somiglianza testuale;
- stesso importo e periodo;
- prossimità geografica;
- stesso fornitore senza CIG/CUP;
- classificazione AI;
- corrispondenza parziale tra titoli.

I collegamenti deboli non devono produrre affermazioni definitive. Devono essere presentati come “possibile collegamento”, “da verificare” o restare interni fino a revisione.

## Uso civico del catalogo

Il catalogo non serve solo agli sviluppatori. Deve permettere anche a un revisore civico di capire:

- quali domini sono coperti;
- quali domini sono assenti;
- quali fonti sono aggiornate;
- quali fonti sono solo candidate;
- dove un dato viene arricchito localmente;
- dove un confronto può mostrare differenze senza dimostrare errore.

## Azioni di manutenzione consigliate

- [ ] Aggiornare questo catalogo ogni volta che una nuova fonte entra nel codice o nella UI.
- [ ] Collegare ogni nuova fonte a una issue o PR.
- [ ] Aggiungere fonte, licenza e granularità alla documentazione pubblica quando il dato è esposto.
- [ ] Segnare chiaramente le fonti federate come federate.
- [ ] Evitare che fonti `proposto` vengano presentate nella UI come già operative.
- [ ] Revisionare periodicamente i domini `presente / da consolidare`.
