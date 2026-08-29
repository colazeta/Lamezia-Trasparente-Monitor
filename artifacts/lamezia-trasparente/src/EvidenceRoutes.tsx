import { Route, Switch } from "wouter";

import { MainLayout } from "@/components/layout/MainLayout";
import { PageMeta } from "@/components/seo/PageMeta";
import { InterventoEvidenceDetail } from "@/pages/InterventoEvidenceDetail";
import { InterventiEvidence } from "@/pages/InterventiEvidence";

export function EvidenceRoutes() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/interventi-locali">
          <PageMeta
            title="Interventi locali basati sull'evidenza"
            description="Archivio di politiche e pratiche adottate da enti locali e accompagnate da valutazioni empiriche, con risultati, limiti e trasferibilità potenziale."
            path="/interventi-locali"
          />
          <InterventiEvidence />
        </Route>
        <Route
          path="/interventi-locali/:id"
          component={InterventoEvidenceDetail}
        />
      </Switch>
    </MainLayout>
  );
}
