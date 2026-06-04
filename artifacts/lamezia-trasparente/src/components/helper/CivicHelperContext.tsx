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
  assistantOpen: boolean;
  guideContents: GuideContents | null;
  guideLoading: boolean;
  introSeen: boolean;
  openIntro: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  dismissWelcome: () => void;
  welcomeOpen: boolean;
}

const CivicHelperContext = createContext<CivicHelperContextValue | undefined>(
  undefined,
);

const INTRO_SEEN_KEY = "rlt-tour-seen";

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

export function CivicHelperProvider({ children }: { children: ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [guideContents, setGuideContents] = useState<GuideContents | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [introSeen, setIntroSeen] = useState<boolean>(readIntroSeen);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    const seen = readIntroSeen();
    if (seen) return;
    const timer = setTimeout(() => setWelcomeOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

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
