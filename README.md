# rendiamoLameziaTrasparente

Piattaforma civica di trasparenza per il Comune di Lamezia Terme: aggrega e rende navigabili atti dell'Albo Pretorio, contratti pubblici ANAC, progetti PNRR, indicatori di performance, beni confiscati, bandi e molto altro. I dati sono consultabili via web, app mobile e API pubblica (REST + MCP per assistenti AI).

---

## Struttura del monorepo

```
.
├── artifacts/
│   ├── api-server/          # Backend Express 5 — API REST, MCP, ingestione dati
│   ├── lamezia-trasparente/ # Web app React + Vite (sito pubblico)
│   ├── lamezia-mobile/      # App mobile Expo (React Native) per iOS/Android/Web
│   └── mockup-sandbox/      # Sandbox Vite per prototipazione UI (non pubblica)
├── lib/
│   ├── db/                  # Schema Drizzle, migrazioni, seed — fonte di verità del DB
│   ├── api-spec/            # openapi.yaml — contratto API (fonte di verità) + codegen Orval
│   ├── api-zod/             # Schema Zod generati (validazione server + client)
│   ├── api-client-react/    # Hook TanStack Query generati (web + mobile)
│   ├── integrations-openai-ai-server/  # Integrazione OpenAI lato server
│   └── integrations-openai-ai-react/  # Integrazione OpenAI lato client React
├── scripts/
│   └── post-merge.sh        # Script post-merge: install + push schema + seed
├── pnpm-workspace.yaml      # Configurazione workspace pnpm (catalog delle versioni)
├── tsconfig.base.json       # Opzioni TypeScript condivise
└── package.json             # Script radice (typecheck, build)
```

---

## Artifact e pacchetti

### `artifacts/api-server` — API Server

Backend Node.js (Express 5). Responsabilità principali:

- **API REST interna** (`/api/*`) — dati civici per web e mobile
- **API pubblica in sola lettura** (`/api/public/v1`) — per giornalisti, ricercatori, AI
- **Server MCP** (`/api/mcp`) — protocollo Model Context Protocol per assistenti AI
- **Ingestione dati** — Albo Pretorio (Tinn), ANAC, ITALIADOMANI, ANBSC, ISTAT
- **Migrazioni DB** — esegue automaticamente le migrazioni Drizzle all'avvio
- **Generazione brief AI** — riassunti automatici degli atti tramite OpenAI
- **Email** — notifiche cittadini via Resend
- **Object Storage** — allegati e file tramite Google Cloud Storage (sidecar Replit)

Build: `esbuild` produce un bundle CJS singolo in `dist/index.mjs`.

→ Documentazione API pubblica: [`artifacts/api-server/PUBLIC_API.md`](artifacts/api-server/PUBLIC_API.md)

### `artifacts/lamezia-trasparente` — Sito web

App React 19 + Vite 7. Stack UI: Tailwind CSS v4, Shadcn UI (Radix), Framer Motion, Recharts, Leaflet. Routing: Wouter. Data fetching: TanStack Query + hook generati.

Sezioni principali: Albo Pretorio, Contratti, Temi di monitoraggio, Performance, PNRR, Bandi, Beni confiscati, Open data, Atti fondamentali, Legalità e trasparenza, Cronistoria.

### `artifacts/lamezia-mobile` — App mobile

Expo 54 (React Native). Stesse API del sito web. Navigazione Expo Router (file-based). Mappa nativa `react-native-maps` su native, Leaflet su web.

### `artifacts/mockup-sandbox` — Sandbox UI

Vite + React. Usato dai designer per prototipare componenti in isolamento. Non esposto pubblicamente in produzione.

### `lib/db` — Database

Fonte di verità dello schema PostgreSQL. Drizzle ORM. Contiene:
- `src/schema/` — definizioni di tutte le tabelle
- `migrations/` — file SQL generati (da committare)
- `src/seed.ts` — dati di riferimento (temi, categorie, catalog indicatori)
- `src/migrate.ts` — runner di migrazione usato dall'api-server all'avvio

### `lib/api-spec` — Contratto API

`openapi.yaml` è la **fonte di verità** dell'API. Il codegen (Orval) genera automaticamente `lib/api-zod` e `lib/api-client-react`. **Non modificare mai i file generati a mano.**

### `lib/api-zod` — Schema Zod (generati)

Usati dall'api-server per la validazione degli input/output. Generati da `lib/api-spec`.

### `lib/api-client-react` — Hook React Query (generati)

Usati da `lamezia-trasparente` e `lamezia-mobile`. Generati da `lib/api-spec`.

---

## Prerequisiti

- **Node.js 24** (gestito da Nix/Replit)
- **pnpm** (versione specificata in `.replit`)
- **PostgreSQL 16** (locale in dev, managed in prod)
- Variabili d'ambiente configurate (vedi `.env.example`)

---

## Avvio in locale (dev)

```bash
# 1. Installa le dipendenze
pnpm install

# 2. Applica lo schema al database di sviluppo (prima volta o dopo modifiche allo schema)
pnpm --filter @workspace/db run push

# 3. Popola i dati di seed (categorie, temi, indicatori di performance)
pnpm --filter @workspace/db run seed

# 4. Avvia i servizi (in terminali separati o tramite il workflow "Project" di Replit)
pnpm --filter @workspace/api-server run dev        # API server (porta 5000)
pnpm --filter @workspace/lamezia-trasparente dev   # Web app
pnpm --filter @workspace/lamezia-mobile dev        # App mobile Expo
```

In Replit, il pulsante **Run** avvia tutti i servizi tramite il workflow `Project`.

---

## Comandi principali

| Comando | Descrizione |
|---|---|
| `pnpm install` | Installa tutte le dipendenze del workspace |
| `pnpm install --frozen-lockfile && pnpm run typecheck && pnpm run build` | Replica in locale il gate CI minimo |
| `pnpm run typecheck` | Typecheck completo (libs + artifacts) |
| `pnpm run build` | Typecheck + build di tutti i pacchetti |
| `pnpm --filter @workspace/api-server run dev` | Avvia l'API server in modalità dev |
| `pnpm --filter @workspace/api-server run build` | Build esbuild dell'api-server |
| `pnpm --filter @workspace/api-spec run codegen` | Rigenera hook e Zod dall'OpenAPI spec |
| `pnpm --filter @workspace/db run generate` | Genera nuovi file SQL da modifiche allo schema |
| `pnpm --filter @workspace/db run push` | Applica lo schema al DB senza migrazioni (solo dev) |
| `pnpm --filter @workspace/db run migrate` | Esegue le migrazioni in ordine (sicuro, non interattivo) |
| `pnpm --filter @workspace/db run seed` | Popola i dati di riferimento |
| `pnpm --filter @workspace/db run baseline` | Segna le migrazioni esistenti come già applicate (post-push) |
| `pnpm -r --if-present run test` | Esegue le suite test workspace dichiarate nei pacchetti (vitest) |

### Validazione CI e test stabili

La CI replica un gate locale riproducibile con:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
pnpm -r --if-present run test
```

Lo step test CI è separato da typecheck e build e usa `pnpm -r --if-present run test`, così esegue solo le suite dichiarate dai pacchetti workspace. Al momento include:

- `artifacts/api-server`: test Vitest senza database esterno quando non è configurato un database di test; le suite che richiedono PostgreSQL restano escluse dalla configurazione Vitest in ambienti leggeri.
- `artifacts/lamezia-trasparente`: test Vitest/jsdom di rendering, accessibilità, componenti e utilità frontend, senza servizi esterni.

Le esclusioni sono intenzionali: i test che richiedono servizi non disponibili o non mockati non devono rendere fragile il gate CI minimo.

---

## Flussi operativi chiave

### Modifica allo schema del database

```bash
# 1. Modifica lib/db/src/schema/<tabella>.ts
# 2. Genera il file SQL di migrazione
pnpm --filter @workspace/db run generate
# 3. Controlla il file generato in lib/db/migrations/
# 4. Applica la migrazione in dev
pnpm --filter @workspace/db run migrate
# 5. Committa sia lo schema che il file SQL generato
git add lib/db/src/schema/ lib/db/migrations/
```

In **produzione** l'api-server esegue automaticamente `runMigrations()` all'avvio, quindi le migrazioni vengono applicate al deploy senza intervento manuale.

> ⚠️ `push` è comodo in dev ma non deve essere usato in produzione: è interattivo e può truncare dati. Usare sempre il runner di migrazione in prod.

### Aggiornare il contratto API

```bash
# 1. Modifica lib/api-spec/openapi.yaml
# 2. Rigenera hook e schema Zod
pnpm --filter @workspace/api-spec run codegen
# 3. Committa i file generati in lib/api-client-react/ e lib/api-zod/
```

### Build e deploy

```bash
# Build completo (typecheck + tutti i pacchetti)
pnpm run build

# Build solo api-server (produce dist/index.mjs)
pnpm --filter @workspace/api-server run build
```

Il deploy avviene tramite il pannello **Deployments** di Replit (target: `autoscale`). Alla pubblicazione:
1. Replit esegue `pnpm run build`
2. Avvia l'api-server (`node dist/index.mjs`)
3. L'api-server esegue le migrazioni e poi avvia l'ingestione

---

## Dev vs Produzione

| Aspetto | Dev (workspace Replit) | Produzione (deployment autoscale) |
|---|---|---|
| **Codice** | Identico | Identico |
| **Database** | PostgreSQL locale (Replit) | PostgreSQL managed (Replit) |
| **Schema** | `push` (interattivo, niente SQL) | Migrazione runner automatica all'avvio |
| **Avvio** | `tsx` (hot-reload via workflow) | `node dist/index.mjs` (bundle esbuild) |
| **Variabili d'ambiente** | `.env` locale / Secrets Replit dev | Secrets Replit produzione |
| **Object Storage** | Sidecar Replit (`REPL_IDENTITY`) | Sidecar Replit (`REPL_IDENTITY`) |
| **Log** | Pino pretty (stdout) | Pino JSON (stdout) |
| `NODE_ENV` | `development` | `production` |

---

## Strategia branch (dev → prod)

Il repository su GitHub usa **due branch principali**:

| Branch | Scopo |
|---|---|
| `dev` | Lavoro quotidiano — ogni task viene integrato qui |
| `main` (o `prod`) | Allineato al deployment di produzione |

**Flusso consigliato:**

```
feature/xxx  →  dev  →  (test + review)  →  main
```

1. Tutto il lavoro avviene su `dev` (o branch di feature poi mergiati in `dev`).
2. Quando `dev` è stabile e testato, si promuove su `main`.
3. Il deploy di produzione parte da `main`.

**Script post-merge** (`scripts/post-merge.sh`): viene eseguito automaticamente da Replit dopo ogni merge nel workspace dev. Esegue:
```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/db push      # aggiorna lo schema del DB di dev
pnpm --filter @workspace/db seed      # aggiorna i dati di seed
```

---

## Documentazione aggiuntiva

- [API pubblica (REST + MCP)](artifacts/api-server/PUBLIC_API.md)
