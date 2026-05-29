import { Switch, Route } from "wouter";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Themes } from "./pages/Themes";
import { ThemeDetail } from "./pages/ThemeDetail";
import { Contracts } from "./pages/Contracts";
import { Albo } from "./pages/Albo";
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
        <Route path="/segnalazioni" component={Reports} />
        <Route path="/statistiche" component={Statistics} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}
