import { Switch, Route } from "wouter";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Domande } from "./pages/Domande";
import { Themes } from "./pages/Themes";
import { ThemeDetail } from "./pages/ThemeDetail";
import { Contracts } from "./pages/Contracts";
import { ContractStoryline } from "./pages/ContractStoryline";
import { Albo } from "./pages/Albo";
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
import { Performance } from "./pages/Performance";
import { PerformanceCompare } from "./pages/PerformanceCompare";
import { PerformanceDetail } from "./pages/PerformanceDetail";
import { Reports } from "./pages/Reports";
import { Metodologia } from "./pages/Metodologia";
import { Statistics } from "./pages/Statistics";
import { Subscriptions } from "./pages/Subscriptions";
import { AdminCronistoria } from "./pages/AdminCronistoria";
import { AdminDomande } from "./pages/AdminDomande";
import { AdminAppalti } from "./pages/AdminAppalti";
import NotFound from "./pages/not-found";

export function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/domande" component={Domande} />
        <Route path="/temi" component={Themes} />
        <Route path="/temi/:id" component={ThemeDetail} />
        <Route path="/contratti" component={Contracts} />
        <Route path="/contratti/:id" component={ContractStoryline} />
        <Route path="/albo" component={Albo} />
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
        <Route path="/performance" component={Performance} />
        <Route path="/performance/confronta" component={PerformanceCompare} />
        <Route path="/performance/:id" component={PerformanceDetail} />
        <Route path="/pareri" component={PareriVigilanza} />
        <Route path="/pareri/:id" component={PareriVigilanzaDetail} />
        <Route path="/segnalazioni" component={Reports} />
        <Route path="/statistiche" component={Statistics} />
        <Route path="/metodologia" component={Metodologia} />
        <Route path="/iscrizioni" component={Subscriptions} />
        <Route path="/admin/cronistoria" component={AdminCronistoria} />
        <Route path="/admin/domande" component={AdminDomande} />
        <Route path="/admin/appalti" component={AdminAppalti} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}
