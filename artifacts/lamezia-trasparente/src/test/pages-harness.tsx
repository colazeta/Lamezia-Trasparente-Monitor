import { vi } from "vitest";
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
    "useGetContractsAnalytics",
    "useGetContractsFeedStatus",
    "useGetFeedStatus",
    "useGetOpendataDataset",
    "useGetOpendataFeedStatus",
    "useGetOpendataResourceContent",
    "useGetOfficial",
    "useGetOrgano",
    "useGetPerformanceIndicator",
    "useGetPublicationsCategories",
    "useGetPublicationsTimeline",
    "useGetRecentActivity",
    "useGetSeduta",
    "useGetShareStats",
    "useGetStatsOverview",
    "useGetTheme",
    "useGetTopThemes",
    "useListCategories",
    "useListContracts",
    "useListOpendataDatasets",
    "useListConvocazioni",
    "useListDelibere",
    "useListOfficials",
    "useListOrgani",
    "useListPerformanceCategories",
    "useListPerformanceFeedStatus",
    "useListPnrrProjects",
    "useListPublications",
    "useListSedute",
    "useListQuestions",
    "useListReports",
    "useListThemePosts",
    "useListThemes",
  ];
  const MUTATION_HOOKS = [
    "useCreateReport",
    "useCreateThemePost",
    "useDeleteThemePost",
    "useFollowTheme",
    "useMarkThemeRelevant",
    "useRequestSubscriptionsLink",
    "useRequestUploadUrl",
    "useShareTheme",
    "useUpdateThemePost",
    "useWithdrawThemeRelevant",
  ];
  const QUERY_KEYS = [
    "getGetOfficialQueryKey",
    "getGetOrganoQueryKey",
    "getGetSedutaQueryKey",
    "getGetThemeQueryKey",
    "getListReportsQueryKey",
    "getListThemePostsQueryKey",
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
import { Domande } from "@/pages/Domande";
import { Themes } from "@/pages/Themes";
import { ThemeDetail } from "@/pages/ThemeDetail";
import { Contracts } from "@/pages/Contracts";
import { Albo } from "@/pages/Albo";
import { Delibere } from "@/pages/Delibere";
import { Convocazioni } from "@/pages/Convocazioni";
import { SedutaDetail } from "@/pages/SedutaDetail";
import { Organi } from "@/pages/Organi";
import { OrganoDetail } from "@/pages/OrganoDetail";
import { Amministratori } from "@/pages/Amministratori";
import { AmministratoreDetail } from "@/pages/AmministratoreDetail";
import { Pnrr } from "@/pages/Pnrr";
import { Opendata } from "@/pages/Opendata";
import { OpendataDetail } from "@/pages/OpendataDetail";
import { Performance } from "@/pages/Performance";
import { PerformanceDetail } from "@/pages/PerformanceDetail";
import { Reports } from "@/pages/Reports";
import { Statistics } from "@/pages/Statistics";
import { Subscriptions } from "@/pages/Subscriptions";
import { AdminCronistoria } from "@/pages/AdminCronistoria";
import NotFound from "@/pages/not-found";

export type PageComponent = (...args: never[]) => ReactNode;

export const PAGES: Array<[string, PageComponent]> = [
  ["Home", Home],
  ["Domande", Domande],
  ["Themes", Themes],
  ["ThemeDetail", ThemeDetail],
  ["Contracts", Contracts],
  ["Albo", Albo],
  ["Delibere", Delibere],
  ["Convocazioni", Convocazioni],
  ["SedutaDetail", SedutaDetail],
  ["Organi", Organi],
  ["OrganoDetail", OrganoDetail],
  ["Amministratori", Amministratori],
  ["AmministratoreDetail", AmministratoreDetail],
  ["Pnrr", Pnrr],
  ["Opendata", Opendata],
  ["OpendataDetail", OpendataDetail],
  ["Performance", Performance],
  ["PerformanceDetail", PerformanceDetail],
  ["Reports", Reports],
  ["Statistics", Statistics],
  ["Subscriptions", Subscriptions],
  ["AdminCronistoria", AdminCronistoria],
  ["NotFound", NotFound],
];

export class ErrorBoundary extends Component<
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

export function renderPage(Page: PageComponent) {
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

/** Apply a theme the way the app does: persist + toggle the root `dark` class. */
export function applyTheme(theme: "light" | "dark") {
  window.localStorage.setItem("rlt-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}
