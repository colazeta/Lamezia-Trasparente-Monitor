import type { ComponentType } from "react";
import { Switch, Route } from "wouter";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Domande } from "./pages/Domande";
import { Themes } from "./pages/Themes";
import { ThemeDetail } from "./pages/ThemeDetail";
import { Contracts } from "./pages/Contracts";
import { Incarichimetro } from "./pages/Incarichimetro";
import { ContractStoryline } from "./pages/ContractStoryline";
import { Albo } from "./pages/Albo";
import { AlboDetail } from "./pages/AlboDetail";
import { Delibere } from "./pages/Delibere";
import { Convocazioni } from "./pages/Convocazioni";
import { SedutaDetail } from "./pages/SedutaDetail";
import { Organi } from "./pages/Organi";
import { OrganoDetail } from "./pages/OrganoDetail";
import { Amministratori } from "./pages/Amministratori";
import { AmministratoreDetail } from "./pages/AmministratoreDetail";
import { Pnrr } from "./pages/Pnrr";
import { PareriVigilanza } from "./pages/PareriVigilanza";
import { PareriVigilanzaDetail } from "./pages/PareriVigilanzaDetail";
import { Opendata } from "./pages/Opendata";
import { OpendataDetail } from "./pages/OpendataDetail";
import { Feeds } from "./pages/Feeds";
import { Sviluppatori } from "./pages/Sviluppatori";
import { AttiFondamentali } from "./pages/AttiFondamentali";
import { Bandi } from "./pages/Bandi";
import { BandoDetail } from "./pages/BandoDetail";
import { BeniConfiscati } from "./pages/BeniConfiscati";
import { BeneConfiscatoDetail } from "./pages/BeneConfiscatoDetail";
import { AccessoCivico } from "./pages/AccessoCivico";
import { Monitoraggio } from "./pages/Monitoraggio";
import { MonitoraggioDetail } from "./pages/MonitoraggioDetail";
import { MonitoraggioNuovo } from "./pages/MonitoraggioNuovo";
import { Promessometro } from "./pages/Promessometro";
import { Legalita } from "./pages/Legalita";
import { LegalitaTimeline } from "./pages/LegalitaTimeline";
import { Performance } from "./pages/Performance";
import { PerformanceCompare } from "./pages/PerformanceCompare";
import { PerformanceDetail } from "./pages/PerformanceDetail";
import { Reports } from "./pages/Reports";
import { FontiDati } from "./pages/FontiDati";
import { Metodologia } from "./pages/Metodologia";
import { Roadmap } from "./pages/Roadmap";
import { NoteLegali } from "./pages/NoteLegali";
import { ChiSiamo } from "./pages/ChiSiamo";
import { Contatti } from "./pages/Contatti";
import { Statistics } from "./pages/Statistics";
import { Subscriptions } from "./pages/Subscriptions";
import { Guida } from "./pages/Guida";
import { Redazione } from "./pages/Redazione";
import NotFound from "./pages/not-found";
import { PageMeta } from "./components/seo/PageMeta";

// Legacy /admin/* → redirect to /redazione
import { Redirect } from "wouter";

function AdminRedirect() {
  return <Redirect to="/redazione" />;
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
    <Switch>
      {/* /redazione — no MainLayout (has its own full layout) */}
      <Route path="/redazione" component={Redazione} />
      <Route path="/redazione/*" component={Redazione} />

      {/* Legacy /admin/* redirects to /redazione */}
      <Route path="/admin" component={AdminRedirect} />
      <Route path="/admin/*" component={AdminRedirect} />

      {/* Public pages — wrapped in MainLayout */}
      <Route>
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
              title="Contratti pubblici"
              description="Consultazione civica di contratti, CIG, importi e indicatori di monitoraggio da leggere con verifica sulle fonti."
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
            <PublicRouteWithMeta
              path="/bandi"
              component={Bandi}
              title="Bandi e avvisi"
              description="Elenco civico di bandi e avvisi pubblici con collegamenti alle fonti disponibili e informazioni da verificare sugli atti."
            />
            <Route path="/bandi/:slug" component={BandoDetail} />
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
              description="Hub documentale che collega criticità pubbliche, programma sotto verifica, atti, PNRR, incarichi, accesso civico e legalità senza formulare accuse autonome."
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
            <Route path="/monitoraggio/:id" component={MonitoraggioDetail} />
            <PublicRouteWithMeta
              path="/legalita/timeline"
              component={LegalitaTimeline}
              title="Timeline legalità e memoria civica"
              description="Struttura pubblica per eventi documentati su legalità, antimafia e memoria istituzionale, con fonti, status e cautele esplicite."
            />
            <PublicRouteWithMeta
              path="/legalita"
              component={Legalita}
              title="Legalità e beni confiscati"
              description="Percorsi informativi su legalità, riuso civico e fonti pubbliche, con linguaggio prudente e non accusatorio."
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
              title="Convocazioni"
              description="Calendario e schede delle convocazioni pubbliche, organizzate per facilitare orientamento e verifica."
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
            <Route path="/pnrr" component={Pnrr} />
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
              description="Canali di aggiornamento per seguire pubblicazioni e novità del monitoraggio civico in modo trasparente."
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
              component={PerformanceCompare}
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
              title="Registro delle criticità pubbliche"
              description="Registro civico per distinguere segnalazioni, fonti, atti, risposte istituzionali e dati mancanti senza presentare accuse come fatti."
            />
            <PublicRouteWithMeta
              path="/segnalazioni"
              component={Reports}
              title="Segnalazioni e criticità pubbliche"
              description="Area unica per inviare segnalazioni civiche e consultarle come criticità pubbliche da verificare, non accuse."
            />
            <PublicRouteWithMeta
              path="/statistiche"
              component={Statistics}
              title="Statistiche"
              description="Sintesi statistiche del monitoraggio civico, utili per orientare lettura, verifica e approfondimento delle fonti."
            />
            <Route path="/fonti-dati" component={FontiDati} />
            <Route path="/metodologia" component={Metodologia} />
            <Route path="/roadmap" component={Roadmap} />
            <Route path="/note-legali" component={NoteLegali} />
            <Route path="/chi-siamo" component={ChiSiamo} />
            <Route path="/contatti" component={Contatti} />
            <PublicRouteWithMeta
              path="/iscrizioni"
              component={Subscriptions}
              title="Iscrizioni agli aggiornamenti"
              description="Gestione delle preferenze per ricevere aggiornamenti civici e seguire le novità del progetto."
            />
            <Route path="/guida" component={Guida} />
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
      </Route>
    </Switch>
  );
}
