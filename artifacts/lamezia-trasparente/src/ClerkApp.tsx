import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import {
  QueryClientProvider,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "sonner";

import { CivicHelperProvider } from "@/components/helper/CivicHelperContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router } from "./Router";

interface ClerkAppProps {
  basePath: string;
  proxyUrl?: string;
  publishableKey: string;
  queryClient: QueryClient;
}

function stripBase(path: string, basePath: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function buildClerkAppearance(basePath: string) {
  return {
    theme: shadcn,
    cssLayerName: "clerk",
    options: {
      logoPlacement: "inside" as const,
      logoLinkUrl: basePath || "/",
      logoImageUrl: `${window.location.origin}${basePath}/logo-wordmark.svg`,
    },
    variables: {
      colorPrimary: "hsl(var(--brand))",
      colorForeground: "hsl(var(--foreground))",
      colorMutedForeground: "hsl(var(--muted-foreground))",
      colorDanger: "hsl(var(--destructive))",
      colorBackground: "hsl(var(--background))",
      colorInput: "hsl(var(--input))",
      colorInputForeground: "hsl(var(--foreground))",
      colorNeutral: "hsl(var(--border))",
      fontFamily: "Inter, sans-serif",
      borderRadius: "0.5rem",
    },
    elements: {
      rootBox: "w-full flex justify-center",
      cardBox:
        "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-border",
      card: "!shadow-none !border-0 !bg-transparent !rounded-none",
      footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
      headerTitle: "text-foreground font-bold",
      headerSubtitle: "text-muted-foreground",
      socialButtonsBlockButtonText: "text-foreground font-medium",
      formFieldLabel: "text-foreground font-medium",
      footerActionLink: "text-brand hover:text-brand/80",
      footerActionText: "text-muted-foreground",
      dividerText: "text-muted-foreground",
      identityPreviewEditButton: "text-brand",
      formFieldSuccessText: "text-green-600",
      alertText: "text-foreground",
      logoBox: "flex justify-center mb-2",
      logoImage: "h-10 w-auto",
      socialButtonsBlockButton: "border border-border hover:bg-muted",
      formButtonPrimary:
        "bg-brand hover:bg-brand/90 text-brand-foreground font-semibold",
      formFieldInput: "border-border bg-background text-foreground",
      footerAction: "border-t border-border bg-muted/50",
      dividerLine: "bg-border",
      alert: "border border-border bg-muted",
      otpCodeFieldInput: "border-border",
      formFieldRow: "mb-4",
      main: "p-6",
    },
  };
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        previousUserId.current !== undefined &&
        previousUserId.current !== userId
      ) {
        queryClient.clear();
      }
      previousUserId.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function SignInPage({ basePath }: { basePath: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-sidebar px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        forceRedirectUrl={`${basePath}/redazione`}
      />
    </div>
  );
}

export default function ClerkApp({
  basePath,
  proxyUrl,
  publishableKey,
  queryClient,
}: ClerkAppProps) {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      proxyUrl={proxyUrl}
      appearance={buildClerkAppearance(basePath)}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Accedi alla Redazione",
            subtitle: "Area riservata agli editor autorizzati",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to, basePath))}
      routerReplace={(to) =>
        setLocation(stripBase(to, basePath), { replace: true })
      }
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ThemeProvider>
          <TooltipProvider>
            <CivicHelperProvider>
              <Switch>
                <Route path="/sign-in/*?">
                  <SignInPage basePath={basePath} />
                </Route>
                <Route component={Router} />
              </Switch>
            </CivicHelperProvider>
            <Toaster position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
