import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

type PublicErrorBoundaryProps = {
  children: ReactNode;
};

const publicHomePath = import.meta.env.BASE_URL || "/";

type PublicErrorBoundaryState = {
  hasError: boolean;
};

export class PublicErrorBoundary extends Component<
  PublicErrorBoundaryProps,
  PublicErrorBoundaryState
> {
  state: PublicErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PublicErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Public preview render error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
          <section className="max-w-xl rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Anteprima pubblica
            </p>
            <h1 className="mt-3 text-2xl font-bold">
              Questa sezione non è disponibile al momento
            </h1>
            <p className="mt-4 text-muted-foreground">
              Un errore di visualizzazione ha interessato questa pagina. Il
              resto del sito resta consultabile e i dati vanno comunque
              verificati sulle fonti pubbliche indicate.
            </p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.assign(publicHomePath);
              }}
            >
              Torna alla homepage
            </Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
