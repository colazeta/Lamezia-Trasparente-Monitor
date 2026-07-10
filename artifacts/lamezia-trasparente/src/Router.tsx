import { lazy, Suspense, type ComponentType } from "react";
import { Switch, Route } from "wouter";
import { MainLayout } from "./components/layout/MainLayout";

function lazyNamed(loader: () => Promise<object>, exportName: string) {
  return lazy(async () => {
    const module = (await loader()) as Record<string, ComponentType>;
    return { default: module[exportName] };
  });
}

const Home = lazyNamed(() => import("./pages/Home"), "Home");
const Domande = lazyNamed(() => import("./pages/Domande"), "Domande");
const Themes = lazyNamed(() => import("./pages/Themes"), "Themes");
const ThemeDetail = lazyNamed(() => import("./pages/ThemeDetail"), "ThemeDetail");
const Contracts = lazyNamed(() => import("./pages/Contracts"), "Contracts");
const Incarichimetro = lazyNamed(() => import("./pages/Incarichimetro"), "Incarichimetro");
const ContractStoryline = lazyNamed(() => import("./pages/ContractStoryline"), "ContractStoryline");
const Albo = lazyNamed(() => import("./pages/Albo"), "Albo");
const AlboDetail = lazyNamed(() => import("./pages/AlboDetail"), "AlboDetail");
const Delibere = lazyNamed(() => import("./pages/Delibere"), "Delibere");
const Convocazioni = lazyNamed(() => import("./pages/Convocazioni"), "Convocazioni");
const SedutaDetail = lazyNamed(() => import("./pages/SedutaDetail"), "SedutaDetail");
const Organi = lazyNamed(() => import("./pages/Organi"), "Organi");
const OrganoDetail = lazyNamed(() => import("./pages/OrganoDetail"), "OrganoDetail");
const Amministratori = lazyNamed(() => import("./pages/Amministratori"), "Amministratori");
const AmministratoreDetail = lazyNamed(() => import("./pages/AmministratoreDetail"), "AmministratoreDetail");
const Pnrr = lazyNamed(() => import("./pages/Pnrr"), "Pnrr");
const PareriVigilanza = lazyNamed(() => import("./pages/PareriVigilanza"), "PareriVigilanza");
const PareriVigilanzaDetail = lazyNamed(() => import("./pages/PareriVigilanzaDetail"), "PareriVigilanzaDetail");
const Opendata = lazyNamed(() => import("./pages/Opendata"), "Opendata");
const OpendataDetail = lazyNamed(() => import("./pages/OpendataDetail"), "OpendataDetail");
const Feeds = lazyNamed(() => import("./pages/Feeds"), "Feeds");
const Sviluppatori = lazyNamed(() => import("./pages/Sviluppatori"), "Sviluppatori");
const AttiFondamentali = lazyNamed(() => import("./pages/AttiFondamentali"), "AttiFondamentali");
const BeniConfiscati = lazyNamed(() => import("./pages/BeniConfiscati"), "BeniConfiscati");
const BeneConfiscatoDetail = lazyNamed(() => import("./pages/BeneConfiscatoDetail"), "BeneConfiscatoDetail");
const AccessoCivico = lazyNamed(() => import("./pages/AccessoCivico"), "AccessoCivico");
const Monitoraggio = lazyNamed(() => import("./pages/Monitoraggio"), "Monitoraggio");
const MonitoraggioDetail = lazyNamed(() => import("./pages/MonitoraggioDetail"), "MonitoraggioDetail");
const MonitoraggioNuovo = lazyNamed(() => import("./pages/MonitoraggioNuovo"), "MonitoraggioNuovo");
const Promessometro = lazyNamed(() => import("./pages/Promessometro"), "Promessometro");
const PropostePubbliche = lazyNamed(() => import("./pages/PropostePubbliche"), "PropostePubbliche");
const MacchinaComunale = lazyNamed(() => import("./pages/MacchinaComunale"), "MacchinaComunale");
const Legalita = lazyNamed(() => import("./pages/Legalita"), "Legalita");
const TrameFestival = lazyNamed(() => import("./pages/TrameFestival"), "TrameFestival");
const Performance = lazyNamed(() => import("./pages/Performance"), "Performance");
const PerformanceDetail = lazyNamed(() => import("./pages/PerformanceDetail"), "PerformanceDetail");
const Reports = lazyNamed(() => import("./pages/Reports"), "Reports");
const FontiDati = lazyNamed(() => import("./pages/FontiDati"), "FontiDati");
const AtlanteTerritoriale = lazyNamed(() => import("./pages/AtlanteTerritoriale"), "AtlanteTerritoriale");
const StatoMonitoraggio = lazyNamed(() => import("./pages/StatoMonitoraggio"), "StatoMonitoraggio");
const Metodologia = lazyNamed(() => import("./pages/Metodologia"), "Metodologia");
const Roadmap = lazyNamed(() => import("./pages/Roadmap"), "Roadmap");
const NoteLegali = lazyNamed(() => import("./pages/NoteLegali"), "NoteLegali");
const ChiSiamo = lazyNamed(() => import("./pages/ChiSiamo"), "ChiSiamo");
const Contatti = lazyNamed(() => import("./pages/Contatti"), "Contatti");
const Statistics = lazyNamed(() => import("./pages/Statistics"), "Statistics");
const Subscriptions = lazyNamed(() => import("./pages/Subscriptions"), "Subscriptions");
const Guida = lazyNamed(() => import("./pages/Guida"), "Guida");
const Redazione = lazyNamed(() => import("./pages/Redazione"), "Redazione");
const NotFound = lazy(() => import("./pages/not-found"));
import { PageMeta } from "./components/seo/PageMeta";
import { PublicErrorBoundary } from "./components/PublicErrorBoundary";

function RouteLoading() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center px-4 py-16"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground shadow-sm">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          aria-hidden="true"
        />
        Caricamento sezione…
      </div>
    </div>
  );
}

// Legacy /admin/* â†’ redirect to /redazione
import { Redirect } from "wouter";

function AdminRedirect() {
  return <Redirect to="/redazione" />;
}

function BandiRedirect() {
  return <Redirect to="/contratti" />;
}

function ProposteLegacyRedirect() {
  return <Redirect to="/proposte-civiche" />;
}

function LegalitaTimelineRedirect() {
  return <Redirect to="/legalita" />;
}

function PerformanceCompareRedirect() {
  return <Redirect to="/performance" />;
}

type PublicRouteWithMetaProps = {
  path: string;
  component: ComponentType;
  title: string;
  description: string;
};

function PublicRouteWithMeta({
  path,
  component: Component,
  title,
  description,
}: PublicRouteWithMetaProps) {
  return (
    <Route path={path}>
      <PageMeta title={title} description={description} path={path} />
      <Component />
    </Route>
  );
}

export function Router() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Switch>
      {/* /redazione â€” no MainLayout (has its own full layout) */}
      <Route path="/redazione" component={Redazione} />
      <Route path="/redazione/*" component={Redazione} />

      {/* Legacy /admin/* redirects to /redazione */}
      <Route path="/admin" component={AdminRedirect} />
      <Route path="/admin/*" component={AdminRedirect} />

      {/* Public pages â€” wrapped in MainLayout */}
      <Route>
        <PublicErrorBoundary>
          <MainLayout>
            <Switch>
              <Route path="/" component={Home} />
              <PublicRouteWithMeta
                path="/domande"
                component={Domande}
                title="Domande civiche"
                description="Risposte e percorsi di consultazione per orientarsi tra atti, dati e servizi del monitoraggio civico."
              />
              <PublicRouteWithMeta
                path="/temi"
                component={Themes}
                title="Temi monitorati"
                description="Raccolta di temi civici che aggregano documenti, atti e contratti per facilitare la consultazione pubblica."
              />
              <Route path="/temi/:id" component={ThemeDetail} />
              <PublicRouteWithMeta
                path="/contratti"
                component={Contracts}
                title="Contratti pubblici sotto osservazione"
                description="Consultazione civica di contratti, CIG, importi e indicatori disponibili, da leggere con verifica sulle fonti e senza promessa di copertura completa."
              />
              <Route path="/incarichimetro" component={Incarichimetro} />
              <Route path="/contratti/:id" component={ContractStoryline} />
              <Route path="/albo" component={Albo} />
              <Route path="/albo/:id" component={AlboDetail} />
              <PublicRouteWithMeta
                path="/atti-fondamentali"
                component={AttiFondamentali}
                title="Atti fondamentali"
                description="Documenti di programmazione e atti fondamentali raccolti per agevolare la consultazione pubblica."
              />
              <Route path="/bandi" component={BandiRedirect} />
              <Route path="/bandi/:slug" component={BandiRedirect} />
              <PublicRouteWithMeta
                path="/beni-confiscati"
                component={BeniConfiscati}
                title="Beni confiscati"
                description="Schede e mappe informative sui beni confiscati, con cautele di lettura e rinvio alle fonti pubbliche."
              />
              <Route
                path="/beni-confiscati/:slug"
                component={BeneConfiscatoDetail}
              />
              <Route path="/accesso-civico" component={AccessoCivico} />
              <PublicRouteWithMeta
                path="/monitoraggio"
                component={Monitoraggio}
                title="Monitor civico"
                description="Hub documentale che collega criticitÃ  pubbliche, programma sotto verifica, atti, PNRR, incarichi, accesso civico e legalitÃ  senza formulare accuse autonome."
              />
              <PublicRouteWithMeta
                path="/monitoraggio/nuovo"
                component={MonitoraggioNuovo}
                title="Nuova segnalazione civica"
                description="Modulo per proporre un elemento di monitoraggio civico da valutare con cautele, fonti e verifiche successive."
              />
              <PublicRouteWithMeta
                path="/promessometro"
                component={Promessometro}
                title="Promessometro amministrativo"
                description="Modulo civico per collegare promesse programmatiche e atti amministrativi con cautele documentali e senza scoring politico."
              />
              <PublicRouteWithMeta
                path="/proposte-civiche"
                component={PropostePubbliche}
                title="Proposte civiche"
                description="Archivio documentale e neutro delle proposte civiche di valore pubblico censite come memoria verificabile."
              />
              <Route
                path="/archivio-proposte"
                component={ProposteLegacyRedirect}
              />
              <PublicRouteWithMeta
                path="/macchina-comunale"
                component={MacchinaComunale}
                title="Macchina comunale"
                description="Modulo prudente sulla capacitÃ  amministrativa, organico, scoperture e stato delle fonti, senza valutazioni individuali."
              />
              <Route path="/monitoraggio/:id" component={MonitoraggioDetail} />
              <PublicRouteWithMeta
                path="/legalita/timeline"
                component={LegalitaTimelineRedirect}
                title="Timeline legalitÃ  e memoria civica"
                description="Struttura pubblica per eventi documentati su legalitÃ , antimafia e memoria istituzionale, con fonti, status e cautele esplicite."
              />
              <PublicRouteWithMeta
                path="/legalita/trame-festival"
                component={TrameFestival}
                title="Trame - Festival"
                description="Raccolta selettiva di idee, proposte e analisi emerse dal festival Trame, pubblicabile solo con fonte, minuto video e verifica redazionale."
              />
              <PublicRouteWithMeta
                path="/legalita"
                component={Legalita}
                title="LegalitÃ  e beni confiscati"
                description="Percorsi informativi su legalitÃ , riuso civico e fonti pubbliche, con linguaggio prudente e non accusatorio."
              />
              <PublicRouteWithMeta
                path="/delibere"
                component={Delibere}
                title="Delibere"
                description="Consultazione civica delle delibere pubblicate, con ricerca e rinvio alla documentazione disponibile."
              />
              <PublicRouteWithMeta
                path="/convocazioni"
                component={Convocazioni}
                title="Sedute e ordini del giorno"
                description="Calendario e schede di Consiglio e commissioni, organizzate per orientare la consultazione e distinguere fonte, stato e limiti della versione pubblica."
              />
              <Route path="/convocazioni/:id" component={SedutaDetail} />
              <PublicRouteWithMeta
                path="/organi"
                component={Organi}
                title="Organi istituzionali"
                description="Indice civico degli organi e delle informazioni pubbliche disponibili per orientare la consultazione."
              />
              <Route path="/organi/:slug" component={OrganoDetail} />
              <PublicRouteWithMeta
                path="/amministratori"
                component={Amministratori}
                title="Amministratori"
                description="Schede pubbliche e incarichi amministrativi consultabili come dati informativi da verificare sulle fonti."
              />
              <Route
                path="/amministratori/:id"
                component={AmministratoreDetail}
              />
              <PublicRouteWithMeta
                path="/pnrr"
                component={Pnrr}
                title="Progetti e informazioni PNRR"
                description="Sezione informativa sui contenuti PNRR disponibili nel monitoraggio civico, con collegamenti da verificare sulle fonti e limiti espliciti."
              />
              <PublicRouteWithMeta
                path="/opendata"
                component={Opendata}
                title="Open data"
                description="Catalogo civico dei dataset disponibili, con risorse, aggiornamenti e limiti da leggere insieme alle fonti."
              />
              <Route path="/opendata/:id" component={OpendataDetail} />
              <PublicRouteWithMeta
                path="/feeds"
                component={Feeds}
                title="Feed e aggiornamenti"
                description="Canali di aggiornamento per seguire pubblicazioni e novitÃ  del monitoraggio civico in modo trasparente."
              />
              <PublicRouteWithMeta
                path="/sviluppatori"
                component={Sviluppatori}
                title="Sviluppatori"
                description="Informazioni tecniche per consultare API, feed e risorse aperte del progetto civico."
              />
              <PublicRouteWithMeta
                path="/performance"
                component={Performance}
                title="Performance amministrativa"
                description="Indicatori e confronti di performance da leggere come segnali di monitoraggio, non come conclusioni automatiche."
              />
              <PublicRouteWithMeta
                path="/performance/confronta"
                component={PerformanceCompareRedirect}
                title="Confronto performance"
                description="Strumento di confronto tra indicatori amministrativi per osservare pattern e differenze da verificare nel contesto."
              />
              <Route path="/performance/:id" component={PerformanceDetail} />
              <PublicRouteWithMeta
                path="/pareri"
                component={PareriVigilanza}
                title="Pareri e vigilanza"
                description="Raccolta informativa di pareri e documenti di vigilanza, organizzata con cautele e collegamenti alle fonti."
              />
              <Route path="/pareri/:id" component={PareriVigilanzaDetail} />
              <PublicRouteWithMeta
                path="/criticita-pubbliche"
                component={Reports}
                title="Registro delle criticitÃ  pubbliche"
                description="Registro civico per distinguere segnalazioni, fonti, atti, risposte istituzionali e dati mancanti senza presentare accuse come fatti."
              />
              <PublicRouteWithMeta
                path="/segnalazioni"
                component={Reports}
                title="Segnalazioni e criticitÃ  pubbliche"
                description="Area unica per inviare segnalazioni civiche e consultarle come criticitÃ  pubbliche da verificare, non accuse."
              />
              <PublicRouteWithMeta
                path="/statistiche"
                component={Statistics}
                title="Statistiche"
                description="Sintesi statistiche del monitoraggio civico, utili per orientare lettura, verifica e approfondimento delle fonti."
              />
              <PublicRouteWithMeta
                path="/fonti-dati"
                component={FontiDati}
                title="Fonti dati"
                description="Indice delle fonti pubbliche considerate dalla versione pubblica, con stato del collegamento, riferimenti, frequenze attese e limiti di lettura."
              />
              <PublicRouteWithMeta
                path="/atlante-territoriale"
                component={AtlanteTerritoriale}
                title="Atlante territoriale"
                description="Mappa pubblica di Lamezia Terme per sezioni censuarie ISTAT, con indicatori, fonte, anno, livello territoriale e limiti di lettura."
              />
              <PublicRouteWithMeta
                path="/stato-monitoraggio"
                component={StatoMonitoraggio}
                title="Stato del monitoraggio"
                description="Dashboard prudente sulla freschezza e copertura operativa delle fonti censite dal monitoraggio civico."
              />
              <PublicRouteWithMeta
                path="/metodologia"
                component={Metodologia}
                title="Metodologia"
                description="Criteri, cautele e limiti per leggere dati, indicatori, ricorrenze e assenze informative come segnali documentali da verificare."
              />
              <Route path="/roadmap" component={Roadmap} />
              <PublicRouteWithMeta
                path="/note-legali"
                component={NoteLegali}
                title="Note legali"
                description="Informazioni legali, avvertenze e limiti dâ€™uso per consultare le risorse pubblicate senza dedurre responsabilitÃ  o completezza dai dati."
              />
              <PublicRouteWithMeta
                path="/chi-siamo"
                component={ChiSiamo}
                title="Chi siamo"
                description="Presentazione del progetto, dei suoi obiettivi civici e dellâ€™approccio documentale alla trasparenza pubblica."
              />
              <PublicRouteWithMeta
                path="/contatti"
                component={Contatti}
                title="Contatti"
                description="Canali di contatto per informazioni, segnalazioni civiche e richieste relative al monitoraggio documentale."
              />
              <PublicRouteWithMeta
                path="/iscrizioni"
                component={Subscriptions}
                title="Iscrizioni agli aggiornamenti"
                description="Gestione delle preferenze per ricevere aggiornamenti civici e seguire le novitÃ  del progetto."
              />
              <PublicRouteWithMeta
                path="/guida"
                component={Guida}
                title="Guida"
                description="Guida pratica per orientarsi tra sezioni, fonti e strumenti del monitoraggio civico."
              />
              <Route component={NotFound} />
            </Switch>
          </MainLayout>
        </PublicErrorBoundary>
      </Route>
      </Switch>
    </Suspense>
  );
}
