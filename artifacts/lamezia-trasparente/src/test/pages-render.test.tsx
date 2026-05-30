import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";
import { Component, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

/**
 * Mock the generated API client so pages render in an isolated, network-free
 * environment. Every `useX` hook returns a stable "loading" query result and
 * every mutation hook returns an inert mutation, so pages render their loading
 * / skeleton states without throwing.
 */
vi.mock("@workspace/api-client-react", () => {
  const queryResult = {
    data: undefined,
    isLoading: true,
    isPending: true,
    isError: false,
    isSuccess: false,
    error: null,
    refetch: vi.fn(),
    status: "pending",
    fetchStatus: "fetching",
  };
  const mutationResult = {
    mutate: vi.fn(),
    mutateAsync: vi.fn(async () => undefined),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    reset: vi.fn(),
    data: undefined,
    status: "idle",
  };

  // Mutation hooks return an inert mutation; every other `use*` hook returns
  // a stable loading query result. Query-key helpers return a static array.
  const QUERY_HOOKS = [
    "useGetFeedStatus",
    "useGetOfficial",
    "useGetRecentActivity",
    "useGetSeduta",
    "useGetShareStats",
    "useGetStatsOverview",
    "useGetTheme",
    "useGetTopThemes",
    "useListCategories",
    "useListContracts",
    "useListConvocazioni",
    "useListDelibere",
    "useListOfficials",
    "useListPnrrProjects",
    "useListPublications",
    "useListReports",
    "useListThemes",
  ];
  const MUTATION_HOOKS = [
    "useCreateReport",
    "useFollowTheme",
    "useMarkThemeRelevant",
    "useRequestSubscriptionsLink",
    "useShareTheme",
  ];
  const QUERY_KEYS = [
    "getGetOfficialQueryKey",
    "getGetSedutaQueryKey",
    "getGetThemeQueryKey",
    "getListReportsQueryKey",
    "getListThemesQueryKey",
  ];

  const mod: Record<string, unknown> = {};
  for (const name of QUERY_HOOKS) mod[name] = () => queryResult;
  for (const name of MUTATION_HOOKS) mod[name] = () => mutationResult;
  for (const name of QUERY_KEYS)
    mod[name] = (...args: unknown[]) => ["mock", name, ...args];
  return mod;
});

import { Home } from "@/pages/Home";
import { Themes } from "@/pages/Themes";
import { ThemeDetail } from "@/pages/ThemeDetail";
import { Contracts } from "@/pages/Contracts";
import { Albo } from "@/pages/Albo";
import { Delibere } from "@/pages/Delibere";
import { Convocazioni } from "@/pages/Convocazioni";
import { SedutaDetail } from "@/pages/SedutaDetail";
import { Amministratori } from "@/pages/Amministratori";
import { AmministratoreDetail } from "@/pages/AmministratoreDetail";
import { Pnrr } from "@/pages/Pnrr";
import { Reports } from "@/pages/Reports";
import { Statistics } from "@/pages/Statistics";
import { Subscriptions } from "@/pages/Subscriptions";
import NotFound from "@/pages/not-found";

type PageComponent = (...args: never[]) => ReactNode;

const PAGES: Array<[string, PageComponent]> = [
  ["Home", Home],
  ["Themes", Themes],
  ["ThemeDetail", ThemeDetail],
  ["Contracts", Contracts],
  ["Albo", Albo],
  ["Delibere", Delibere],
  ["Convocazioni", Convocazioni],
  ["SedutaDetail", SedutaDetail],
  ["Amministratori", Amministratori],
  ["AmministratoreDetail", AmministratoreDetail],
  ["Pnrr", Pnrr],
  ["Reports", Reports],
  ["Statistics", Statistics],
  ["Subscriptions", Subscriptions],
  ["NotFound", NotFound],
];

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div data-testid="render-error">{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

function renderPage(Page: PageComponent) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter>
            <ErrorBoundary>
              <Page />
            </ErrorBoundary>
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("pages render without errors in both themes", () => {
  let consoleError: Mock;
  let originalError: typeof console.error;

  beforeEach(() => {
    originalError = console.error;
    consoleError = vi.fn();
    console.error = consoleError as unknown as typeof console.error;
  });

  afterEach(() => {
    console.error = originalError;
    window.localStorage.clear();
  });

  for (const theme of ["light", "dark"] as const) {
    describe(`${theme} mode`, () => {
      beforeEach(() => {
        window.localStorage.setItem("rlt-theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
      });

      for (const [name, Page] of PAGES) {
        it(`${name} renders`, () => {
          const { queryByTestId } = renderPage(Page);
          expect(
            queryByTestId("render-error"),
            `${name} threw while rendering in ${theme} mode`,
          ).toBeNull();
          // The theme class must be applied to the document root.
          expect(document.documentElement.classList.contains("dark")).toBe(
            theme === "dark",
          );
        });
      }
    });
  }
});
