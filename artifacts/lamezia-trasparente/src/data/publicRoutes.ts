export const PUBLIC_SITE_ORIGIN =
  "https://lamezia-trasparente.pages.dev";

export const COUNCIL_SESSION_V0_DEMO_PATH =
  "/convocazioni/demo-consiglio-comunale-v0" as const;

export type V0RouteStatus =
  | "pubblicabile"
  | "sperimentale"
  | "in-preparazione"
  | "riservata"
  | "static-marker";

export type PublicV0CivicSectionId =
  | "home"
  | "council-sessions"
  | "contracts"
  | "pnrr-projects"
  | "data-sources"
  | "method"
  | "legal-notes"
  | "editorial-area"
  | "static-health";

export type PublicV0RouteContract = {
  path: `/${string}`;
  civicSectionId: PublicV0CivicSectionId;
  status: V0RouteStatus;
  title: string;
  note: string;
  rationale: string;
};

export const V0_ROUTE_STATUS_LABELS: Record<V0RouteStatus, string> = {
  pubblicabile: "Consultabile nella versione pubblica",
  sperimentale: "In verifica guidata",
  "in-preparazione": "In preparazione dati",
  riservata: "Area non pubblica",
  "static-marker": "Verifica tecnica",
};

export const PUBLIC_V0_ROUTE_CONTRACT = [
  {
    path: "/",
    civicSectionId: "home",
    status: "pubblicabile",
    title: "Home page pubblica",
    note: "Ingresso pubblico alla versione pubblica: orientamento, limiti e percorsi principali.",
    rationale: "Home page pubblica.",
  },
  {
    path: "/convocazioni",
    civicSectionId: "council-sessions",
    status: "pubblicabile",
    title: "Sedute e ordini del giorno",
    note: "Indice consultabile: se la fonte non restituisce convocazioni, la pagina lo dichiara come limite informativo della versione pubblica.",
    rationale: "Indice pubblico delle convocazioni.",
  },
  {
    path: COUNCIL_SESSION_V0_DEMO_PATH,
    civicSectionId: "council-sessions",
    status: "sperimentale",
    title: "Scheda demo convocazione",
    note: "Fixture dichiarata: verifica struttura, fonti e limiti senza rappresentare una seduta reale.",
    rationale:
      "Scheda demo dichiarata per verificare il percorso pubblico minimo senza dati reali.",
  },
  {
    path: "/contratti",
    civicSectionId: "contracts",
    status: "pubblicabile",
    title: "Contratti pubblici",
    note: "Consultazione civica di contratti e affidamenti con cautele su fonti, importi, CUP/CIG e dati non ancora disponibili.",
    rationale: "Indice pubblico dei contratti.",
  },
  {
    path: "/pnrr",
    civicSectionId: "pnrr-projects",
    status: "sperimentale",
    title: "Progetti e informazioni PNRR",
    note: "Sezione in verifica guidata: mostra collegamenti e schede disponibili, da riscontrare sulle fonti richiamate.",
    rationale: "Pagina pubblica di monitoraggio PNRR.",
  },
  {
    path: "/redazione",
    civicSectionId: "editorial-area",
    status: "riservata",
    title: "Area redazione",
    note: "Percorso riservato: senza Clerk deve mostrare il fallback dedicato, non l'error boundary pubblico.",
    rationale: "Area editoriale protetta esclusa dal sitemap pubblico.",
  },
  {
    path: "/healthz.json",
    civicSectionId: "static-health",
    status: "static-marker",
    title: "Health check statico",
    note: "Marker JSON statico della preview; non esegue verifiche su API, worker o dati live.",
    rationale: "Marker statico pubblico per smoke test del fallback statico.",
  },
  {
    path: "/fonti-dati",
    civicSectionId: "data-sources",
    status: "pubblicabile",
    title: "Fonti dati",
    note: "Indice delle fonti con stato del collegamento, frequenze attese, limiti e assunzioni pubbliche.",
    rationale: "Pagina pubblica sulle fonti dati.",
  },
  {
    path: "/metodologia",
    civicSectionId: "method",
    status: "pubblicabile",
    title: "Metodologia",
    note: "Criteri e cautele per leggere indicatori, assenze informative e ricorrenze come segnali documentali da verificare.",
    rationale: "Pagina pubblica sulla metodologia.",
  },
  {
    path: "/note-legali",
    civicSectionId: "legal-notes",
    status: "pubblicabile",
    title: "Note legali",
    note: "Avvertenze e limiti d'uso da preservare senza modifiche sostanziali in questa issue.",
    rationale: "Pagina pubblica delle note legali.",
  },
] as const satisfies readonly PublicV0RouteContract[];

export const PUBLIC_V0_ROUTE_PATHS = PUBLIC_V0_ROUTE_CONTRACT.map(
  (route) => route.path,
);

export function getPublicV0RouteContract(path: string) {
  return PUBLIC_V0_ROUTE_CONTRACT.find((route) => route.path === path) ?? null;
}

export type PublicIndexableRoute = {
  /** Static router path that may be listed in the public sitemap. */
  path: `/${string}`;
  /** Short maintenance note for reviewers comparing Router.tsx and sitemap.xml. */
  rationale: string;
};

/**
 * Static inventory for public, indexable routes.
 *
 * Inclusion criteria:
 * - the route is static and explicitly registered in Router.tsx;
 * - the page is public-facing, uses the civic MainLayout, and can be indexed;
 * - the URL does not depend on runtime data, user input, authentication, or redirects.
 *
 * Exclusion criteria:
 * - dynamic detail patterns such as /contratti/:id;
 * - editorial/admin surfaces and legacy redirects (/redazione, /admin, /bandi);
 * - catch-all and not-found routes.
 */
export const PUBLIC_INDEXABLE_ROUTES = [
  { path: "/", rationale: "Home page pubblica." },
  { path: "/domande", rationale: "Indice pubblico delle domande civiche." },
  { path: "/temi", rationale: "Indice statico dei temi monitorati." },
  { path: "/contratti", rationale: "Indice pubblico dei contratti." },
  {
    path: "/incarichimetro",
    rationale: "Pagina pubblica di sintesi sugli incarichi.",
  },
  { path: "/albo/", rationale: "Indice pubblico dell'albo." },
  {
    path: "/atti-fondamentali",
    rationale: "Pagina pubblica degli atti fondamentali.",
  },
  {
    path: "/beni-confiscati",
    rationale: "Indice pubblico dei beni confiscati.",
  },
  { path: "/accesso-civico", rationale: "Guida pubblica sull'accesso civico." },
  {
    path: "/monitoraggio",
    rationale: "Indice pubblico del monitoraggio civico.",
  },
  {
    path: "/promessometro",
    rationale: "Modulo pubblico sulle promesse programmatiche monitorate.",
  },
  {
    path: "/proposte-civiche",
    rationale: "Raccolta pubblica delle proposte civiche documentate.",
  },
  {
    path: "/legalita/trame-festival",
    rationale:
      "Raccolta pubblica selettiva di idee e analisi da Trame Festival, solo dopo verifica redazionale.",
  },
  {
    path: "/legalita",
    rationale: "Pagina pubblica su legalità e beni confiscati.",
  },
  { path: "/delibere", rationale: "Indice pubblico delle delibere." },
  { path: "/convocazioni", rationale: "Indice pubblico delle convocazioni." },
  {
    path: COUNCIL_SESSION_V0_DEMO_PATH,
    rationale:
      "Scheda demo dichiarata per verificare il percorso pubblico minimo senza dati reali.",
  },
  { path: "/organi", rationale: "Indice pubblico degli organi istituzionali." },
  {
    path: "/amministratori",
    rationale: "Indice pubblico degli amministratori.",
  },
  {
    path: "/macchina-comunale",
    rationale:
      "Pagina pubblica su capacità amministrativa, organico e stato delle fonti.",
  },
  {
    path: "/pnrr",
    rationale: "Pagina pubblica di monitoraggio PNRR.",
  },
  { path: "/opendata", rationale: "Catalogo pubblico open data." },
  { path: "/feeds", rationale: "Pagina pubblica dei feed di aggiornamento." },
  {
    path: "/sviluppatori",
    rationale: "Pagina tecnica pubblica per sviluppatori.",
  },
  {
    path: "/performance",
    rationale: "Indice pubblico degli indicatori di performance.",
  },
  { path: "/pareri", rationale: "Indice pubblico di pareri e vigilanza." },
  {
    path: "/criticita-pubbliche",
    rationale: "Registro pubblico delle criticità civiche da verificare.",
  },
  {
    path: "/segnalazioni",
    rationale: "Pagina pubblica delle segnalazioni civiche.",
  },
  { path: "/statistiche", rationale: "Pagina pubblica delle statistiche." },
  {
    path: "/atlante-territoriale",
    rationale:
      "Mappa pubblica per sezioni censuarie ISTAT con metadati e limiti visibili.",
  },
  { path: "/fonti-dati", rationale: "Pagina pubblica sulle fonti dati." },
  {
    path: "/stato-monitoraggio",
    rationale: "Dashboard pubblica sullo stato operativo delle fonti censite.",
  },
  { path: "/metodologia", rationale: "Pagina pubblica sulla metodologia." },
  { path: "/roadmap", rationale: "Pagina pubblica della roadmap." },
  { path: "/note-legali", rationale: "Pagina pubblica delle note legali." },
  { path: "/chi-siamo", rationale: "Pagina pubblica sul progetto civico." },
  {
    path: "/contatti",
    rationale: "Pagina pubblica dei contatti del progetto.",
  },
  {
    path: "/iscrizioni",
    rationale: "Pagina pubblica per iscrizioni agli aggiornamenti.",
  },
  { path: "/guida", rationale: "Guida pubblica alla consultazione." },
] as const satisfies readonly PublicIndexableRoute[];

export const PUBLIC_INDEXABLE_PATHS = PUBLIC_INDEXABLE_ROUTES.map(
  (route) => route.path,
);

export function toPublicUrl(path: PublicIndexableRoute["path"]) {
  return path === "/" ? PUBLIC_SITE_ORIGIN : `${PUBLIC_SITE_ORIGIN}${path}`;
}
