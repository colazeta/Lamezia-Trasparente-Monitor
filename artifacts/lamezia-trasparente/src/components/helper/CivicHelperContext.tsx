import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useLocation } from "wouter";

export type HelperSection = {
  id: string;
  title: string;
  description: string;
  route: string;
  tourSteps: Array<{ target: string; text: string; order: number }>;
};

export type StoryChapter = {
  id: string;
  title: string;
  body: string;
  order: number;
};

export type WelcomeHighlight = {
  icon: string;
  text: string;
};

export type GuideContents = {
  version: string;
  storyChapters: StoryChapter[];
  sections: HelperSection[];
  welcomeHighlights?: WelcomeHighlight[];
};

interface CivicHelperContextValue {
  assistantOpen: boolean;
  guideContents: GuideContents | null;
  guideLoading: boolean;
  introSeen: boolean;
  openIntro: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  dismissWelcome: () => void;
  welcomeOpen: boolean;
  visitedRoutes: string[];
  isSectionVisited: (route: string) => boolean;
}

const CivicHelperContext = createContext<CivicHelperContextValue | undefined>(
  undefined,
);

const INTRO_SEEN_KEY = "rlt-tour-seen";
const VISITED_KEY = "rlt-visited-sections";

function readIntroSeen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function writeIntroSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {}
}

function readVisited(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VISITED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function writeVisited(routes: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VISITED_KEY, JSON.stringify(routes));
  } catch {}
}

/** Normalize a location to a bare pathname (strip query string and hash). */
function normalizePath(location: string): string {
  return location.split("?")[0].split("#")[0] || "/";
}

/** A section is "visited" when the user navigated to its route or any
 *  detail page nested beneath it. The root route matches only exactly. */
function matchesVisited(visited: string[], route: string): boolean {
  if (!route.startsWith("/")) return false;
  const target = normalizePath(route);
  return visited.some((v) =>
    target === "/" ? v === "/" : v === target || v.startsWith(target + "/"),
  );
}

export function CivicHelperProvider({ children }: { children: ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [guideContents, setGuideContents] = useState<GuideContents | null>(
    null,
  );
  const [guideLoading, setGuideLoading] = useState(false);
  const [introSeen, setIntroSeen] = useState<boolean>(readIntroSeen);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [visitedRoutes, setVisitedRoutes] = useState<string[]>(readVisited);
  const [location] = useLocation();

  useEffect(() => {
    if (!location) return;
    const path = normalizePath(location);
    setVisitedRoutes((prev) => {
      if (prev.includes(path)) return prev;
      const next = [...prev, path];
      writeVisited(next);
      return next;
    });
  }, [location]);

  const isSectionVisited = useCallback(
    (route: string) => matchesVisited(visitedRoutes, route),
    [visitedRoutes],
  );

  useEffect(() => {
    setGuideLoading(true);
    fetch("/api/helper/guide")
      .then((r) => r.json())
      .then((data) => setGuideContents(data as GuideContents))
      .catch(() => {})
      .finally(() => setGuideLoading(false));
  }, []);

  const openIntro = useCallback(() => {
    setWelcomeOpen(true);
  }, []);

  const openAssistant = useCallback(() => {
    setAssistantOpen(true);
    setWelcomeOpen(false);
  }, []);

  const closeAssistant = useCallback(() => setAssistantOpen(false), []);

  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false);
    writeIntroSeen();
    setIntroSeen(true);
  }, []);

  return (
    <CivicHelperContext.Provider
      value={{
        assistantOpen,
        guideContents,
        guideLoading,
        introSeen,
        welcomeOpen,
        openIntro,
        openAssistant,
        closeAssistant,
        dismissWelcome,
        visitedRoutes,
        isSectionVisited,
      }}
    >
      {children}
    </CivicHelperContext.Provider>
  );
}

export function useCivicHelper() {
  const ctx = useContext(CivicHelperContext);
  if (!ctx)
    throw new Error("useCivicHelper must be used within CivicHelperProvider");
  return ctx;
}
