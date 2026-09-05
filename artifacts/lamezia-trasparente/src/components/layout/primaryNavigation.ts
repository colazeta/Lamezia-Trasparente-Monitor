import {
  NAV_GROUPS,
  type NavItem,
  type NavSection,
} from "./navSections";

type PrimaryProjection = {
  label: string;
  description: string;
  sourceGroups: string[];
};

const PRIMARY_PROJECTION: PrimaryProjection[] = [
  {
    label: "Decisioni",
    description:
      "Sedute, delibere, Albo e atti fondamentali: come il Comune decide e formalizza le scelte.",
    sourceGroups: ["Atti"],
  },
  {
    label: "Spesa e progetti",
    description:
      "Contratti, PNRR, incarichi e altre risorse pubbliche collegate alle fonti disponibili.",
    sourceGroups: ["Spesa"],
  },
  {
    label: "Comune e risultati",
    description:
      "Organi, amministratori, macchina comunale, performance e risultati documentati.",
    sourceGroups: ["Comune"],
  },
  {
    label: "Territorio e legalità",
    description:
      "Mappe, criticità, monitoraggio civico, memoria e beni confiscati letti insieme ai luoghi.",
    sourceGroups: ["Territorio", "Legalità"],
  },
  {
    label: "Dati e fonti",
    description:
      "Open data, copertura, freschezza e metodo per capire cosa sappiamo e con quali limiti.",
    sourceGroups: ["Dati"],
  },
];

function requireSourceGroup(label: string): NavSection {
  const group = NAV_GROUPS.find((candidate) => candidate.label === label);
  if (!group) {
    throw new Error(`Missing navigation source group: ${label}`);
  }
  return group;
}

function collectItems(sourceGroups: string[]): NavItem[] {
  const items = sourceGroups.flatMap((label) => requireSourceGroup(label).items);
  const hrefs = new Set<string>();

  return items.filter((item) => {
    if (hrefs.has(item.href)) return false;
    hrefs.add(item.href);
    return true;
  });
}

export const PRIMARY_NAV_GROUPS: NavSection[] = PRIMARY_PROJECTION.map(
  (projection) => ({
    label: projection.label,
    description: projection.description,
    items: collectItems(projection.sourceGroups),
  }),
);

/**
 * Resolve an internal inventory group (for example `Dati` or `Legalità`) to
 * the five-domain public navigation projection without duplicating the IA map.
 */
export function findPrimaryNavGroupBySourceLabel(
  sourceGroupLabel: string,
): NavSection | null {
  const projection = PRIMARY_PROJECTION.find((candidate) =>
    candidate.sourceGroups.includes(sourceGroupLabel),
  );
  if (!projection) return null;

  return (
    PRIMARY_NAV_GROUPS.find((group) => group.label === projection.label) ?? null
  );
}

export const PARTICIPATION_ACTIONS: NavItem[] = [
  "/segnalazioni",
  "/accesso-civico",
  "/proposte-civiche",
]
  .map((href) =>
    requireSourceGroup("Partecipa").items.find((item) => item.href === href),
  )
  .filter((item): item is NavItem => Boolean(item));
