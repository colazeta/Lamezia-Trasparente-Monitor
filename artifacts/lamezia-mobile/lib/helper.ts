import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------------------------------------------------------------------------
// Persistenza "tour già visto"
// ---------------------------------------------------------------------------
const WALKTHROUGH_SEEN_KEY = "helper:walkthrough_seen_v1";

export async function getWalkthroughSeen(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(WALKTHROUGH_SEEN_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

export async function markWalkthroughSeenStorage(): Promise<void> {
  try {
    await AsyncStorage.setItem(WALKTHROUGH_SEEN_KEY, "true");
  } catch {}
}

export async function resetWalkthroughSeenStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WALKTHROUGH_SEEN_KEY);
  } catch {}
}

// ---------------------------------------------------------------------------
// Persistenza "sezioni esplorate" (riprendi da dove avevi lasciato)
// ---------------------------------------------------------------------------
const VISITED_SECTIONS_KEY = "helper:visited_sections_v1";

/** Legge l'elenco delle route già visitate da AsyncStorage. */
export async function getVisitedSections(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(VISITED_SECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

/** Salva l'elenco delle route già visitate su AsyncStorage. */
export async function setVisitedSections(routes: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(VISITED_SECTIONS_KEY, JSON.stringify(routes));
  } catch {}
}

/** Normalizza un pathname (rimuove query string e frammenti). */
export function normalizeRoute(route: string): string {
  return route.split("?")[0].split("#")[0] || "/";
}

/**
 * Una sezione è "esplorata" quando l'utente ha aperto la sua route o una
 * pagina di dettaglio annidata sotto di essa. La home ("/") combacia solo
 * in modo esatto.
 */
export function isRouteVisited(visited: string[], route?: string): boolean {
  if (!route) return false;
  const target = normalizeRoute(route);
  return visited.some((v) =>
    target === "/" ? v === "/" : v === target || v.startsWith(target + "/"),
  );
}

// ---------------------------------------------------------------------------
// Tipi condivisi
// ---------------------------------------------------------------------------
export type WalkthroughSlide = {
  id: string;
  icon: string;
  title: string;
  body: string;
};

export type GuideSection = {
  id: string;
  icon: string;
  title: string;
  description: string;
  route?: string;
};

export type StoryChapter = {
  id: string;
  title: string;
  body: string;
  order: number;
};

// Forma della risposta di GET /api/helper/guide
type ApiGuideContent = {
  version?: string;
  storyChapters: Array<{ id: string; title: string; body: string; order: number }>;
  sections: Array<{
    id: string;
    title: string;
    description: string;
    route: string;
    tourSteps: Array<{ target: string; text: string; order: number }>;
  }>;
};

// ---------------------------------------------------------------------------
// Mapping route web → route mobile
// (il backend espone route pensate per il sito web; il mobile ha nomi diversi)
// ---------------------------------------------------------------------------
const WEB_TO_MOBILE_ROUTE: Record<string, string | null> = {
  "/": "/",
  "/domande": "/domande",
  "/temi": "/themes",
  "/contratti": "/contratti",
  "/albo": "/albo",
  "/delibere": "/delibere",
  "/pnrr": "/pnrr",
  "/organi": "/organi",
  "/monitoraggio": "/report",
  "/legalita": "/legality",
  "/legalita-trasparenza": "/legality",
  "/performance": "/performance",
  "/opendata": "/opendata",
  "/bandi": null,
  "/beni-confiscati": null,
  "/api/public/v1": null,
  "/accesso-civico": null,
};

/** Converte una route web in una route mobile (null se non esiste). */
export function webRouteToMobile(webRoute: string): string | null {
  if (webRoute in WEB_TO_MOBILE_ROUTE) return WEB_TO_MOBILE_ROUTE[webRoute];
  return webRoute; // percorsi non censiti passano invariati (potrebbero funzionare)
}

// ---------------------------------------------------------------------------
// Mapping sezione → icona Feather
// ---------------------------------------------------------------------------
const SECTION_ICON: Record<string, string> = {
  home: "home",
  temi: "folder",
  contratti: "briefcase",
  appalti: "briefcase",
  pnrr: "trending-up",
  performance: "bar-chart-2",
  opendata: "database",
  "accesso-civico": "mail",
  legalita: "shield",
  "legalita-trasparenza": "shield",
  bandi: "award",
  atti: "archive",
  segnalazioni: "alert-triangle",
  report: "alert-triangle",
  "beni-confiscati": "package",
  beni: "package",
  organi: "users",
  delibere: "file-text",
  albo: "clipboard",
  pareri: "eye",
};

function sectionIcon(id: string): string {
  return SECTION_ICON[id] ?? "circle";
}

function sectionTitle(raw: string): string {
  return raw.split("—")[0].split("–")[0].trim();
}

// ---------------------------------------------------------------------------
// Dati statici di fallback (usati se il backend non è raggiungibile)
// 4 schede essenziali
// ---------------------------------------------------------------------------
export const FALLBACK_SLIDES: WalkthroughSlide[] = [
  {
    id: "welcome",
    icon: "eye",
    title: "Benvenuto in Lamezia Trasparente",
    body: "Un osservatorio civico indipendente sui dati pubblici del Comune di Lamezia Terme. Scopri come vengono spesi i tuoi soldi, monitora gli appalti e segnala anomalie.",
  },
  {
    id: "atti",
    icon: "briefcase",
    title: "Contratti, atti e delibere",
    body: "Appalti pubblici con importi e aggiudicatari, delibere consiliari, albo pretorio e organi del Comune — tutto in un unico posto.",
  },
  {
    id: "temi",
    icon: "folder",
    title: "Temi e segnalazioni civiche",
    body: "Segui le aree tematiche che ti interessano e invia segnalazioni di monitoraggio collegate ai contratti e ai progetti PNRR.",
  },
  {
    id: "assistente",
    icon: "message-circle",
    title: "L'assistente è sempre disponibile",
    body: "Tocca il pulsante (?) in alto a destra per riaprire questa introduzione, consultare la guida o chattare con l'assistente in qualsiasi momento.",
  },
];

export const FALLBACK_SECTIONS: GuideSection[] = [
  { id: "home", icon: "home", title: "Home", description: "Statistiche aggregate, valore monitorato, scorciatoie e attività recenti.", route: "/" },
  { id: "atti", icon: "archive", title: "Atti", description: "Delibere, determine, appalti, albo pretorio, convocazioni e organi consiliari.", route: "/monitor" },
  { id: "temi", icon: "folder", title: "Temi", description: "Raggruppamenti tematici dei dati pubblici con contratti, atti e segnalazioni.", route: "/themes" },
  { id: "segnala", icon: "alert-triangle", title: "Segnala", description: "Segnalazioni di monitoraggio civico collegate a contratti e progetti PNRR.", route: "/report" },
  { id: "contratti", icon: "briefcase", title: "Appalti", description: "Catalogo degli appalti pubblici con importi, aggiudicatari e stato di attuazione.", route: "/contratti" },
  { id: "pnrr", icon: "trending-up", title: "PNRR", description: "Progetti PNRR attivi nel Comune con avanzamento e risorse.", route: "/pnrr" },
  { id: "performance", icon: "bar-chart-2", title: "Performance", description: "Indicatori di qualità della governance con serie storiche.", route: "/performance" },
  { id: "opendata", icon: "database", title: "Opendata", description: "Dataset aperti in formato DCAT-AP_IT.", route: "/opendata" },
  { id: "legalita", icon: "shield", title: "Legalità e Trasparenza", description: "Requisiti di trasparenza, protocolli anticorruzione e obblighi di pubblicazione.", route: "/legality" },
];

export const FALLBACK_STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "nascita",
    order: 1,
    title: "Come nasce rendiamoLameziaTrasparente",
    body: "Un osservatorio civico indipendente nato dalla volontà di cittadini di Lamezia Terme di rendere accessibili e monitorabili le informazioni pubbliche del proprio Comune. Non è un sito istituzionale: è uno strumento della comunità, per la comunità.",
  },
  {
    id: "filosofia",
    order: 2,
    title: "Trasparenza come diritto, non come favore",
    body: "Non basta pubblicare, bisogna rendere comprensibile. Il sito aggrega automaticamente dati da fonti ufficiali (ANAC, Albo Pretorio, PNRR, ISTAT), li organizza in temi di interesse civico e permette ai cittadini di segnalare, commentare e monitorare.",
  },
];

// ---------------------------------------------------------------------------
// Fetch contenuti dal backend con fallback statico
// ---------------------------------------------------------------------------
export type GuideContent = {
  slides: WalkthroughSlide[];
  sections: GuideSection[];
  storyChapters: StoryChapter[];
};

function mapApiToGuideContent(api: ApiGuideContent): GuideContent {
  // Guide sections: convert web routes to mobile routes, exclude unmappable ones
  const sections: GuideSection[] = api.sections
    .map((s) => ({
      id: s.id,
      icon: sectionIcon(s.id),
      title: sectionTitle(s.title),
      description: s.description,
      route: webRouteToMobile(s.route) ?? undefined,
    }));

  const storyChapters: StoryChapter[] = [...api.storyChapters].sort(
    (a, b) => a.order - b.order,
  );

  const byId = new Map(api.sections.map((s) => [s.id, s]));

  function makeSlide(
    ids: string[],
    fallback: WalkthroughSlide,
  ): WalkthroughSlide {
    for (const id of ids) {
      const s = byId.get(id);
      if (!s) continue;
      const firstStep = [...s.tourSteps].sort((a, b) => a.order - b.order)[0];
      return {
        id: s.id,
        icon: sectionIcon(s.id),
        title: sectionTitle(s.title),
        body: firstStep?.text ?? s.description,
      };
    }
    return fallback;
  }

  // 4 essential slides
  const slides: WalkthroughSlide[] = [
    {
      id: "welcome",
      icon: "eye",
      title: "Benvenuto in Lamezia Trasparente",
      body:
        storyChapters[0]?.body.split("\n\n")[0].replace(/\*\*/g, "") ??
        FALLBACK_SLIDES[0].body,
    },
    // Contratti/atti tab
    makeSlide(["contratti", "albo", "delibere"], FALLBACK_SLIDES[1]),
    // Temi + segnalazioni
    makeSlide(["temi", "monitoraggio", "segnalazioni"], FALLBACK_SLIDES[2]),
    // Assistente — always static
    FALLBACK_SLIDES[3],
  ];

  return { slides, sections, storyChapters };
}

export async function fetchHelperGuide(): Promise<GuideContent> {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const baseUrl = domain ? `https://${domain}` : "";
  try {
    const res = await fetch(`${baseUrl}/api/helper/guide`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ApiGuideContent;
    if (
      Array.isArray(data.storyChapters) &&
      Array.isArray(data.sections) &&
      data.sections.length > 0
    ) {
      return mapApiToGuideContent(data);
    }
  } catch {
    // backend not available — use static fallback
  }
  return {
    slides: FALLBACK_SLIDES,
    sections: FALLBACK_SECTIONS,
    storyChapters: FALLBACK_STORY_CHAPTERS,
  };
}

// ---------------------------------------------------------------------------
// Assistente AI — POST /api/helper/ask con risposta SSE
// ---------------------------------------------------------------------------

/**
 * Invia una domanda all'assistente e restituisce il testo completo della
 * risposta. Il backend usa SSE; questa funzione legge la risposta per intero
 * e ne estrae il testo concatenando tutti i token ricevuti.
 */
export async function sendAssistantMessage(
  question: string,
  currentRoute?: string,
): Promise<string> {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const baseUrl = domain ? `https://${domain}` : "";

  const res = await fetch(`${baseUrl}/api/helper/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, currentRoute }),
  });

  // 429, 503, 400 devono dare un messaggio leggibile
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const errMsg =
      (errData as { error?: string } | null)?.error ?? `Errore ${res.status}`;
    throw new Error(errMsg);
  }

  // Legge l'intera risposta SSE e concatena i token
  const raw = await res.text();
  let content = "";
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data: ")) continue;
    try {
      const payload = JSON.parse(trimmed.slice(6)) as {
        content?: string;
        done?: boolean;
        error?: string;
      };
      if (payload.error) throw new Error(payload.error);
      if (typeof payload.content === "string") content += payload.content;
    } catch (e) {
      if (e instanceof Error && !e.message.startsWith("SyntaxError")) throw e;
    }
  }

  return content.trim() || "Non ho ricevuto una risposta. Riprova.";
}
