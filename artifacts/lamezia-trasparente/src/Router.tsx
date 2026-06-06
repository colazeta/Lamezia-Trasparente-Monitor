import { Switch, Route } from "wouter";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Domande } from "./pages/Domande";
import { Themes } from "./pages/Themes";
import { ThemeDetail } from "./pages/ThemeDetail";
import { Contracts } from "./pages/Contracts";
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
import { Legalita } from "./pages/Legalita";
import { Performance } from "./pages/Performance";
import { PerformanceCompare } from "./pages/PerformanceCompare";
import { PerformanceDetail } from "./pages/PerformanceDetail";
import { Reports } from "./pages/Reports";
import { FontiDati } from "./pages/FontiDati";
import { Metodologia } from "./pages/Metodologia";
import { NoteLegali } from "./pages/NoteLegali";
import { Statistics } from "./pages/Statistics";
import { Subscriptions } from "./pages/Subscriptions";
import { Guida } from "./pages/Guida";
import { Redazione } from "./pages/Redazione";
import NotFound from "./pages/not-found";

// Legacy /admin/* → redirect to /redazione
import { Redirect } from "wouter";

function AdminRedirect() {
  return <Redirect to="/redazione" />;
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
            <Route path="/domande" component={Domande} />
            <Route path="/temi" component={Themes} />
            <Route path="/temi/:id" component={ThemeDetail} />
            <Route path="/contratti" component={Contracts} />
            <Route path="/contratti/:id" component={ContractStoryline} />
            <Route path="/albo" component={Albo} />
            <Route path="/albo/:id" component={AlboDetail} />
            <Route path="/atti-fondamentali" component={AttiFondamentali} />
            <Route path="/bandi" component={Bandi} />
            <Route path="/bandi/:slug" component={BandoDetail} />
            <Route path="/beni-confiscati" component={BeniConfiscati} />
            <Route path="/beni-confiscati/:slug" component={BeneConfiscatoDetail} />
            <Route path="/accesso-civico" component={AccessoCivico} />
            <Route path="/monitoraggio" component={Monitoraggio} />
            <Route path="/monitoraggio/nuovo" component={MonitoraggioNuovo} />
            <Route path="/monitoraggio/:id" component={MonitoraggioDetail} />
            <Route path="/legalita" component={Legalita} />
            <Route path="/delibere" component={Delibere} />
            <Route path="/convocazioni" component={Convocazioni} />
            <Route path="/convocazioni/:id" component={SedutaDetail} />
            <Route path="/organi" component={Organi} />
            <Route path="/organi/:slug" component={OrganoDetail} />
            <Route path="/amministratori" component={Amministratori} />
            <Route path="/amministratori/:id" component={AmministratoreDetail} />
            <Route path="/pnrr" component={Pnrr} />
            <Route path="/opendata" component={Opendata} />
            <Route path="/opendata/:id" component={OpendataDetail} />
            <Route path="/feeds" component={Feeds} />
            <Route path="/sviluppatori" component={Sviluppatori} />
            <Route path="/performance" component={Performance} />
            <Route path="/performance/confronta" component={PerformanceCompare} />
            <Route path="/performance/:id" component={PerformanceDetail} />
            <Route path="/pareri" component={PareriVigilanza} />
            <Route path="/pareri/:id" component={PareriVigilanzaDetail} />
            <Route path="/segnalazioni" component={Reports} />
            <Route path="/statistiche" component={Statistics} />
            <Route path="/fonti-dati" component={FontiDati} />
            <Route path="/metodologia" component={Metodologia} />
            <Route path="/note-legali" component={NoteLegali} />
            <Route path="/iscrizioni" component={Subscriptions} />
            <Route path="/guida" component={Guida} />
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
      </Route>
    </Switch>
  );
}
