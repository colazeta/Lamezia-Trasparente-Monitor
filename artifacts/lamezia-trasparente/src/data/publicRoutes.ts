export const PUBLIC_SITE_ORIGIN =
  "https://lamezia-trasparente-monitor.replit.app";

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
 * - dynamic detail patterns such as /contratti/:id or /bandi/:slug;
 * - editorial/admin surfaces and legacy redirects (/redazione, /admin);
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
  { path: "/albo", rationale: "Indice pubblico dell'albo." },
  {
    path: "/atti-fondamentali",
    rationale: "Pagina pubblica degli atti fondamentali.",
  },
  { path: "/bandi", rationale: "Indice pubblico dei bandi e avvisi." },
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
    path: "/monitoraggio/nuovo",
    rationale: "Modulo pubblico per nuove segnalazioni civiche.",
  },
  {
    path: "/promessometro",
    rationale: "Modulo pubblico sulle promesse programmatiche monitorate.",
  },
  {
    path: "/archivio-proposte",
    rationale: "Archivio pubblico delle proposte civiche documentate.",
  },
  {
    path: "/legalita/timeline",
    rationale: "Timeline pubblica su legalità e memoria civica.",
  },
  {
    path: "/legalita",
    rationale: "Pagina pubblica su legalità e beni confiscati.",
  },
  { path: "/delibere", rationale: "Indice pubblico delle delibere." },
  { path: "/convocazioni", rationale: "Indice pubblico delle convocazioni." },
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
  { path: "/pnrr", rationale: "Pagina pubblica di monitoraggio PNRR." },
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
  {
    path: "/performance/confronta",
    rationale: "Strumento pubblico di confronto performance.",
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
