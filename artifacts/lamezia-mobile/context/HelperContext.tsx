import { usePathname } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
  fetchHelperGuide,
  getWalkthroughSeen,
  markWalkthroughSeenStorage,
  resetWalkthroughSeenStorage,
  getVisitedSections,
  setVisitedSections,
  normalizeRoute,
  isRouteVisited,
  type GuideContent,
  type GuideSection,
  type StoryChapter,
  type WalkthroughSlide,
  FALLBACK_SLIDES,
  FALLBACK_SECTIONS,
  FALLBACK_STORY_CHAPTERS,
} from "@/lib/helper";

type HelperContextType = {
  walkthroughReady: boolean;
  walkthroughSeen: boolean;
  markWalkthroughSeen: () => Promise<void>;
  resetWalkthrough: () => Promise<void>;
  slides: WalkthroughSlide[];
  sections: GuideSection[];
  storyChapters: StoryChapter[];
  guideLoading: boolean;
  visitedRoutes: string[];
  isSectionVisited: (route?: string) => boolean;
};

const HelperContext = createContext<HelperContextType>({
  walkthroughReady: false,
  walkthroughSeen: false,
  markWalkthroughSeen: async () => {},
  resetWalkthrough: async () => {},
  slides: FALLBACK_SLIDES,
  sections: FALLBACK_SECTIONS,
  storyChapters: FALLBACK_STORY_CHAPTERS,
  guideLoading: true,
  visitedRoutes: [],
  isSectionVisited: () => false,
});

export function HelperProvider({ children }: { children: React.ReactNode }) {
  const [walkthroughReady, setWalkthroughReady] = useState(false);
  const [walkthroughSeen, setWalkthroughSeen] = useState(false);
  const [guide, setGuide] = useState<GuideContent>({
    slides: FALLBACK_SLIDES,
    sections: FALLBACK_SECTIONS,
    storyChapters: FALLBACK_STORY_CHAPTERS,
  });
  const [guideLoading, setGuideLoading] = useState(true);
  const [visitedRoutes, setVisitedRoutesState] = useState<string[]>([]);
  const [visitedLoaded, setVisitedLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    getWalkthroughSeen().then((seen) => {
      setWalkthroughSeen(seen);
      setWalkthroughReady(true);
    });

    getVisitedSections().then((stored) => {
      setVisitedRoutesState(stored);
      setVisitedLoaded(true);
    });

    fetchHelperGuide().then((content) => {
      setGuide(content);
      setGuideLoading(false);
    });
  }, []);

  // Only start recording the current route once the previously stored routes
  // have loaded, otherwise the first write would clobber saved progress.
  useEffect(() => {
    if (!visitedLoaded || !pathname) return;
    const path = normalizeRoute(pathname);
    setVisitedRoutesState((prev) => {
      if (prev.includes(path)) return prev;
      const next = [...prev, path];
      void setVisitedSections(next);
      return next;
    });
  }, [visitedLoaded, pathname]);

  const isSectionVisited = useCallback(
    (route?: string) => isRouteVisited(visitedRoutes, route),
    [visitedRoutes],
  );

  const markWalkthroughSeen = useCallback(async () => {
    await markWalkthroughSeenStorage();
    setWalkthroughSeen(true);
  }, []);

  const resetWalkthrough = useCallback(async () => {
    await resetWalkthroughSeenStorage();
    setWalkthroughSeen(false);
  }, []);

  return (
    <HelperContext.Provider
      value={{
        walkthroughReady,
        walkthroughSeen,
        markWalkthroughSeen,
        resetWalkthrough,
        slides: guide.slides,
        sections: guide.sections,
        storyChapters: guide.storyChapters,
        guideLoading,
        visitedRoutes,
        isSectionVisited,
      }}
    >
      {children}
    </HelperContext.Provider>
  );
}

export function useHelper() {
  return useContext(HelperContext);
}
