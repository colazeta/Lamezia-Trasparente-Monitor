import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

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

export type GuideContents = {
  version: string;
  storyChapters: StoryChapter[];
  sections: HelperSection[];
};

interface CivicHelperContextValue {
  tourOpen: boolean;
  tourStep: number;
  assistantOpen: boolean;
  guideContents: GuideContents | null;
  guideLoading: boolean;
  tourSeen: boolean;
  startTour: () => void;
  closeTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  dismissWelcome: () => void;
  welcomeOpen: boolean;
}

const CivicHelperContext = createContext<CivicHelperContextValue | undefined>(
  undefined,
);

const TOUR_SEEN_KEY = "rlt-tour-seen";

function readTourSeen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(TOUR_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function writeTourSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {}
}

export function CivicHelperProvider({ children }: { children: ReactNode }) {
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [guideContents, setGuideContents] = useState<GuideContents | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [tourSeen, setTourSeen] = useState<boolean>(readTourSeen);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    const seen = readTourSeen();
    if (!seen) {
      const timer = setTimeout(() => setWelcomeOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    setGuideLoading(true);
    fetch("/api/helper/guide")
      .then((r) => r.json())
      .then((data) => setGuideContents(data as GuideContents))
      .catch(() => {})
      .finally(() => setGuideLoading(false));
  }, []);

  const startTour = useCallback(() => {
    setTourStep(0);
    setTourOpen(true);
    setWelcomeOpen(false);
  }, []);

  const closeTour = useCallback(() => {
    setTourOpen(false);
    writeTourSeen();
    setTourSeen(true);
  }, []);

  const skipTour = useCallback(() => {
    setTourOpen(false);
    setWelcomeOpen(false);
    writeTourSeen();
    setTourSeen(true);
  }, []);

  const nextTourStep = useCallback(() => {
    setTourStep((s) => s + 1);
  }, []);

  const prevTourStep = useCallback(() => {
    setTourStep((s) => Math.max(0, s - 1));
  }, []);

  const openAssistant = useCallback(() => {
    setAssistantOpen(true);
    setWelcomeOpen(false);
  }, []);

  const closeAssistant = useCallback(() => setAssistantOpen(false), []);

  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false);
    writeTourSeen();
    setTourSeen(true);
  }, []);

  return (
    <CivicHelperContext.Provider
      value={{
        tourOpen,
        tourStep,
        assistantOpen,
        guideContents,
        guideLoading,
        tourSeen,
        welcomeOpen,
        startTour,
        closeTour,
        nextTourStep,
        prevTourStep,
        skipTour,
        openAssistant,
        closeAssistant,
        dismissWelcome,
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
