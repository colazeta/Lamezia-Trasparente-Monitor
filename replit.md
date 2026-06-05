# rendiamoLameziaTrasparente

Piattaforma civica di trasparenza per il Comune di Lamezia Terme. Aggrega e rende navigabili atti dell'Albo Pretorio, contratti pubblici ANAC, progetti PNRR, indicatori di performance, beni confiscati, bandi e monitoraggio civico. I dati sono accessibili via sito web, app mobile e API pubblica (REST + MCP per assistenti AI).

## Run & Operate

```bash
pnpm --filter @workspace/api-server run dev        # API server (porta 5000)
pnpm --filter @workspace/lamezia-trasparente dev   # Web app (Vite)
pnpm --filter @workspace/lamezia-mobile dev        # App mobile (Expo)
pnpm run typecheck                                  # Typecheck completo
pnpm run build                                      # Typecheck + build tutti i pacchetti
pnpm --filter @workspace/api-spec run codegen       # Rigenera hook e Zod dall'OpenAPI spec
pnpm --filter @workspace/db run push                # Aggiorna schema DB (solo dev)
pnpm --filter @workspace/db run generate            # Genera file SQL di migrazione
pnpm --filter @workspace/db run migrate             # Esegue le migrazioni (sicuro, non interattivo)
pnpm --filter @workspace/db run seed                # Popola dati di seed (temi, categorie, indicatori)
pnpm --filter @workspace/db run baseline            # Segna le migrazioni esistenti come già applicate
```

Variabili d'ambiente richieste: vedi `.env.example` per la lista completa con descrizioni. Variabile minima obbligatoria: `DATABASE_URL`.

## Stack

- **Runtime**: Node.js 24, pnpm workspaces, TypeScript 5.9
- **Backend**: Express 5, Drizzle ORM (PostgreSQL 16), Zod (`zod/v4`), `drizzle-zod`
- **Frontend web**: React 19, Vite 7, Tailwind CSS v4, Shadcn UI (Radix), TanStack Query, Wouter, Recharts, Leaflet
- **Mobile**: Expo 54, React Native, Expo Router, react-native-maps (native) / react-leaflet (web)
- **API**: contratto-first via OpenAPI 3.1 (`lib/api-spec/openapi.yaml`) + codegen Orval
- **Build api-server**: esbuild (bundle ESM → `dist/index.mjs`)
- **Email**: Resend
- **Storage**: Google Cloud Storage (via sidecar Replit)
- **AI**: OpenAI (via proxy Replit AI Integrations) — brief automatici atti, assistente AI
- **MCP**: `@modelcontextprotocol/sdk` — server stateless per assistenti AI su `/api/mcp`

## Where things live

| Cosa | Dove |
|---|---|
| Schema DB (fonte di verità) | `lib/db/src/schema/` |
| Migrazioni SQL | `lib/db/migrations/` |
| Contratto API (fonte di verità) | `lib/api-spec/openapi.yaml` |
| Hook React Query (generati) | `lib/api-client-react/src/generated/` |
| Schema Zod (generati) | `lib/api-zod/src/generated/` |
| Route API server | `artifacts/api-server/src/routes/` |
| Pagine web | `artifacts/lamezia-trasparente/src/pages/` |
| Schermate mobile | `artifacts/lamezia-mobile/app/` |
| Config codegen Orval | `lib/api-spec/orval.config.ts` |
| Script post-merge | `scripts/post-merge.sh` |
| Variabili d'ambiente (template) | `.env.example` |
| Documentazione API pubblica | `artifacts/api-server/PUBLIC_API.md` |

## Architecture decisions

- **Contratto-first**: `openapi.yaml` è la fonte unica di verità per l'API. Mai modificare i file in `lib/api-client-react/` o `lib/api-zod/` a mano — vengono rigenerati dal codegen. Qualunque cambiamento all'API parte da `openapi.yaml`.

- **Migrazione runner automatica all'avvio**: l'api-server esegue `runMigrations()` al boot prima di aprire le connessioni ai client. In prod non serve intervento manuale: le migrazioni vengono applicate al deploy. In dev si usa `push` (interattivo, conveniente); in prod si usa solo il runner.

- **`push` in dev, `migrate` in prod**: `drizzle-kit push` è comodo per iterare rapidamente in sviluppo ma è interattivo e potenzialmente distruttivo. In produzione si usano esclusivamente i file SQL generati da `generate` e applicati dal runner Drizzle.

- **Ingestione dati gated sulla validità dello schema**: l'api-server controlla all'avvio che le colonne attese esistano nel DB prima di avviare qualunque ingestion job. Se lo schema è sfasato, l'ingestione è bloccata (errore esplicito nel log) fino al prossimo deploy con le migrazioni corrette.

- **Object Storage via sidecar Replit**: GCS non viene raggiunto con credenziali Service Account dirette ma tramite il sidecar locale Replit (`REPLIT_CONNECTORS_HOSTNAME`) che gestisce l'exchange di token via `REPL_IDENTITY`. Funziona identicamente in dev e in prod.

- **Mappe: native vs web**: `react-native-maps` funziona solo su iOS/Android; sull'esportazione web di Expo si usa `react-leaflet`. La scelta avviene con file platform-split (`.tsx` nativo, `.web.tsx` web) importati con path relativo (non `@/`) affinché Metro risolva correttamente il suffisso `.web.tsx`.

## Product

**rendiamoLameziaTrasparente** rende il Comune di Lamezia Terme leggibile e monitorabile dai cittadini:

- **Albo Pretorio**: atti ufficiali con testo estratto in Markdown dai PDF, riassunti AI automatici, allegati archiviati
- **Contratti pubblici**: dati ANAC con CIG, importi, fornitori, collegamento a temi e PNRR
- **Temi di monitoraggio**: aree tematiche con contratti collegati, cronistoria editoriale, seguiti dai cittadini via email
- **Performance**: indicatori di gestione con valori storici e sparkline (dati ISTAT SDMX + manuali)
- **PNRR**: censimento dei progetti del Comune da ITALIADOMANI, con stati di attuazione
- **Bandi**: catalogo avvisi pubblici con cross-match automatico a contratti e PNRR
- **Beni confiscati**: catalogo ANBSC con mappa
- **Open data**: dataset scaricabili in formato aperto con preview tabulare e grafici auto-generati
- **Atti fondamentali**: delibere e atti chiave con votazioni e cronologia
- **Legalità e trasparenza**: sezione editoriale con rating e requisiti
- **Monitoraggio civico**: segnalazioni cittadine (Monithon-style) su contratti e PNRR con foto e moderazione
- **API pubblica + MCP**: dati in sola lettura per giornalisti, ricercatori e assistenti AI

## User preferences

_Nessuna preferenza esplicita registrata fino ad ora._

## Gotchas

- **Dopo un cambio di schema in dev**: `push` aggiunge le nuove colonne ma lascia `NULL` le righe esistenti. Se il seed dipende da quelle colonne, troncare la tabella e ri-eseguire `seed`. Se invece le migrazioni erano già state usate, eseguire `baseline` prima di passare a `migrate`.

- **Codegen dopo cambio API**: dopo `codegen`, il pacchetto `@workspace/api-client-react` espone i tipi dal sorgente (non da `dist/`). Se il frontend non vede le nuove definizioni, verificare che `lib/api-client-react/src/generated/` sia aggiornato e non fare riferimento ai file in `dist/`.

- **Errori `column does not exist` in prod**: il DB di produzione ha uno schema diverso da quello di sviluppo. Applicare le migrazioni tramite deploy (il runner parte automaticamente); non usare mai `push` su prod.

- **Nuove route Express**: in dev con `tsx` le route non vengono ricaricate a caldo. Riavviare il workflow `api-server` dopo aver aggiunto una nuova route.

- **Expo typed-routes**: dopo aver aggiunto una nuova schermata, `tsc` segnala route non valide finché il dev-server Expo non rigenera i tipi. Riavviare il workflow `expo` (non "correggere" le stringhe di route — sono corrette).

- **Recharts e tsc nel web**: il progetto `lamezia-trasparente` ha errori TypeScript preesistenti sulle dipendenze Recharts/React (incompatibilità di versione). Non sono bug introdotti: `typecheck` li mostra ma il sito funziona correttamente.

- **Sintassi errata in una pagina → 500 sull'intera app**: Vite serve tutte le pagine dallo stesso bundle. Un errore di sintassi in qualunque file produce un 500 su tutte le route, non solo su quella pagina.

- **Migrazioni in ambienti isolati (Replit task agent)**: ogni task agent ha il proprio DB isolato. Se lo schema risulta sfasato rispetto al codice, troncare la tabella problematica, eseguire `push-force`, poi riavviare l'api-server.

- **`drizzle-kit push` blocca in ambienti non-TTY**: il comando `push` chiede conferma interattiva prima di troncare tabelle. In CI o in script non-TTY, troncare manualmente prima, poi eseguire `push-force`.

## Pointers

- Vedi [`README.md`](README.md) per la documentazione completa del monorepo
- Vedi [`.env.example`](.env.example) per tutte le variabili d'ambiente necessarie
- Vedi [`artifacts/api-server/PUBLIC_API.md`](artifacts/api-server/PUBLIC_API.md) per l'API pubblica (REST + MCP)
- Vedi la skill `pnpm-workspace` per dettagli sulla struttura del workspace e TypeScript project references
