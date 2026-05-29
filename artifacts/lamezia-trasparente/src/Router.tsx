import { Switch, Route } from "wouter";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Themes } from "./pages/Themes";
import { ThemeDetail } from "./pages/ThemeDetail";
import { Contracts } from "./pages/Contracts";
import { Albo } from "./pages/Albo";
import { Delibere } from "./pages/Delibere";
import { Convocazioni } from "./pages/Convocazioni";
import { SedutaDetail } from "./pages/SedutaDetail";
import { Pnrr } from "./pages/Pnrr";
import { Reports } from "./pages/Reports";
import { Statistics } from "./pages/Statistics";
import NotFound from "./pages/not-found";

export function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/temi" component={Themes} />
        <Route path="/temi/:id" component={ThemeDetail} />
        <Route path="/contratti" component={Contracts} />
        <Route path="/albo" component={Albo} />
        <Route path="/delibere" component={Delibere} />
        <Route path="/convocazioni" component={Convocazioni} />
        <Route path="/convocazioni/:id" component={SedutaDetail} />
        <Route path="/pnrr" component={Pnrr} />
        <Route path="/segnalazioni" component={Reports} />
        <Route path="/statistiche" component={Statistics} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}
