import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
  fetchHelperGuide,
  getWalkthroughSeen,
  markWalkthroughSeenStorage,
  resetWalkthroughSeenStorage,
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

  useEffect(() => {
    getWalkthroughSeen().then((seen) => {
      setWalkthroughSeen(seen);
      setWalkthroughReady(true);
    });

    fetchHelperGuide().then((content) => {
      setGuide(content);
      setGuideLoading(false);
    });
  }, []);

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
      }}
    >
      {children}
    </HelperContext.Provider>
  );
}

export function useHelper() {
  return useContext(HelperContext);
}
