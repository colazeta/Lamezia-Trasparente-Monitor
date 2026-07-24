import { useEffect } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";

import { Router } from "@/Router";

interface ClerkProtectedRoutesProps {
  basePath: string;
  proxyUrl?: string;
  publishableKey: string;
}

function stripBase(path: string, basePath: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function createClerkAppearance(basePath: string) {
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

const clerkUserByQueryClient = new WeakMap<QueryClient, string | null>();

function syncClerkQueryClientUser(
  queryClient: QueryClient,
  userId: string | null,
) {
  const previousUserId = clerkUserByQueryClient.get(queryClient);
  if (previousUserId !== undefined && previousUserId !== userId) {
    queryClient.clear();
  }
  clerkUserByQueryClient.set(queryClient, userId);
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      syncClerkQueryClientUser(queryClient, user?.id ?? null);
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-sidebar px-4">
      {children}
    </div>
  );
}

export default function ClerkProtectedRoutes({
  basePath,
  proxyUrl,
  publishableKey,
}: ClerkProtectedRoutesProps) {
  const [, setLocation] = useLocation();
  const appearance = createClerkAppearance(basePath);

  return (
    <ClerkProvider
      appearance={appearance}
      localization={{
        signIn: {
          start: {
            title: "Accedi alla Redazione",
            subtitle: "Area riservata agli editor autorizzati",
          },
        },
      }}
      proxyUrl={proxyUrl}
      publishableKey={publishableKey}
      routerPush={(to) => setLocation(stripBase(to, basePath))}
      routerReplace={(to) =>
        setLocation(stripBase(to, basePath), { replace: true })
      }
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
    >
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/sign-in/*?">
          <AuthPage>
            <SignIn
              forceRedirectUrl={`${basePath}/redazione`}
              path={`${basePath}/sign-in`}
              routing="path"
              signUpUrl={`${basePath}/sign-up`}
            />
          </AuthPage>
        </Route>
        <Route path="/sign-up/*?">
          <AuthPage>
            <SignUp
              forceRedirectUrl={`${basePath}/redazione`}
              path={`${basePath}/sign-up`}
              routing="path"
              signInUrl={`${basePath}/sign-in`}
            />
          </AuthPage>
        </Route>
        <Route component={Router} />
      </Switch>
    </ClerkProvider>
  );
}
