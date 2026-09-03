import {
  ALL_NAV_GROUPS,
  isNavItemNavigable,
  type NavItem,
  type NavSection,
} from "./navSections";

interface PrimaryNavigationBlueprint {
  label: string;
  description: string;
  hrefs: readonly string[];
}

const PRIMARY_NAVIGATION_BLUEPRINT: readonly PrimaryNavigationBlueprint[] = [
  {
    label: "Decisioni",
    description: "Sedute, delibere e atti ufficiali del Comune.",
    hrefs: ["/convocazioni", "/delibere", "/albo/", "/atti-fondamentali"],
  },
  {
    label: "Spesa e progetti",
    description: "Contratti, PNRR, incarichi e risorse pubbliche.",
    hrefs: ["/contratti", "/pnrr", "/incarichimetro"],
  },
  {
    label: "Comune e risultati",
    description: "Persone, organizzazione, performance e politiche locali.",
    hrefs: [
      "/organi",
      "/amministratori",
      "/macchina-comunale",
      "/performance",
      "/interventi-locali",
      "/promessometro",
    ],
  },
  {
    label: "Territorio e legalità",
    description: "Mappe, monitoraggio civico, memoria e beni confiscati.",
    hrefs: [
      "/atlante-territoriale",
      "/criticita-pubbliche",
      "/monitoraggio",
      "/legalita",
      "/beni-confiscati",
    ],
  },
  {
    label: "Dati e fonti",
    description: "Dataset, provenienza, copertura e metodo.",
    hrefs: ["/opendata", "/fonti-dati", "/stato-monitoraggio", "/metodologia"],
  },
];

const itemByHref = new Map<string, NavItem>();

for (const group of ALL_NAV_GROUPS) {
  for (const item of group.items) {
    if (isNavItemNavigable(item)) {
      itemByHref.set(item.href, item);
    }
  }
}

function resolveItems(hrefs: readonly string[]): NavItem[] {
  return hrefs
    .map((href) => itemByHref.get(href))
    .filter((item): item is NavItem => Boolean(item));
}

export const PRIMARY_NAV_GROUPS: NavSection[] = PRIMARY_NAVIGATION_BLUEPRINT.map(
  (group) => ({
    label: group.label,
    description: group.description,
    items: resolveItems(group.hrefs),
  }),
).filter((group) => group.items.length > 0);

const participationGroup = ALL_NAV_GROUPS.find(
  (group) => group.label === "Partecipa",
);

export const PARTICIPATION_NAV_ITEMS: NavItem[] =
  participationGroup?.items.filter(
    (item) => item.visibility === "primary" && isNavItemNavigable(item),
  ) ?? [];
