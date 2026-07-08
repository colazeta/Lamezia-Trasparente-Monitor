import type {
  Official,
  OfficialProfile,
  Organo,
  OrganoDetail,
  OrganoMember,
  OrganoTerm,
  Seduta,
} from "@workspace/api-client-react";

import {
  INSTITUTIONAL_COMMISSION_ORGANI,
  INSTITUTIONAL_MEMBERSHIPS,
  INSTITUTIONAL_OFFICIALS,
  type InstitutionalMembershipSeed,
  type InstitutionalOfficialSeed,
} from "../../../../lib/db/src/institutional-officials-data.ts";

type StaticOrganoType = "consiglio" | "giunta" | "commissione";
type StaticOfficial = Official & { sourceSeed: InstitutionalOfficialSeed };

const KEYSTONE_ORGANI: Array<{
  type: StaticOrganoType;
  slug: string;
  name: string;
  description: string;
  position: number;
}> = [
  {
    type: "consiglio",
    slug: "consiglio-comunale",
    name: "Consiglio Comunale",
    description:
      "Organo di indirizzo e di controllo politico-amministrativo del Comune, composto dal Sindaco e dai consiglieri eletti.",
    position: 0,
  },
  {
    type: "giunta",
    slug: "giunta-comunale",
    name: "Giunta Comunale",
    description:
      "Organo esecutivo del Comune, presieduto dal Sindaco e composto dagli assessori.",
    position: 1,
  },
  {
    type: "commissione",
    slug: "commissioni-consiliari",
    name: "Commissioni Consiliari",
    description:
      "Quadro generale delle Commissioni permanenti del Consiglio Comunale. Le singole commissioni storicizzate sono esposte come organi dedicati quando e' disponibile una fonte ufficiale verificabile.",
    position: 2,
  },
  ...INSTITUTIONAL_COMMISSION_ORGANI.map((commission, index) => ({
    type: "commissione" as const,
    slug: commission.slug,
    name: commission.name,
    description: commission.description,
    position: index + 3,
  })),
];

const STATIC_ORGANI: Organo[] = KEYSTONE_ORGANI.map((organo, index) => ({
  id: index + 1,
  type: organo.type,
  slug: organo.slug,
  name: organo.name,
  description: organo.description,
  position: organo.position,
  memberCount: 0,
  historyCount: 0,
  sedutaCount: 0,
}));

const EMPTY_SEDUTE: Seduta[] = [];
const organiBySlug = new Map(STATIC_ORGANI.map((organo) => [organo.slug, organo]));

function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function profileNote(official: InstitutionalOfficialSeed): string {
  const lines = [
    `Anagrafica minima: ${official.name}, ${official.roleTitle}.`,
    official.profileUrl
      ? `Scheda personale istituzionale: ${official.profileUrl}.`
      : "Scheda personale istituzionale non disponibile nel registro corrente; anagrafica collegata alla fonte storica indicata.",
    `Fonte registro: ${official.source.label}, consultata il ${official.source.checkedAt}.`,
  ];

  if (official.profileIncarichi?.length) {
    lines.push(
      `Incarichi dichiarati nella scheda personale istituzionale: ${official.profileIncarichi.join("; ")}.`,
    );
  }
  if (official.profileOrganizations?.length) {
    lines.push(
      `Organizzazioni dichiarate nella scheda personale istituzionale: ${official.profileOrganizations.join("; ")}.`,
    );
  }
  if (official.profileLastUpdated) {
    lines.push(
      `Ultimo aggiornamento dichiarato nella scheda personale istituzionale: ${official.profileLastUpdated}.`,
    );
  }
  if (official.deleghe) {
    lines.push(`Deleghe dichiarate nella scheda personale istituzionale: ${official.deleghe}`);
  }

  const contacts = [
    official.contactPhone ? `telefono ${official.contactPhone}` : null,
    official.contactEmail ? `email ${official.contactEmail}` : null,
  ].filter((contact): contact is string => contact != null);

  if (contacts.length) {
    lines.push(
      `Punti di contatto dichiarati nella scheda personale istituzionale: ${contacts.join("; ")}.`,
    );
  }
  if (official.biographyNote) lines.push(official.biographyNote);
  lines.push(
    "Gruppi consiliari, compensi e dichiarazioni restano da collegare a fonti pubbliche specifiche.",
  );

  return lines.join("\n");
}

const STATIC_OFFICIALS: StaticOfficial[] = INSTITUTIONAL_OFFICIALS.map((official, index) => ({
  id: index + 1,
  name: official.name,
  slug: official.slug,
  role: official.role,
  roleTitle: official.roleTitle,
  group: null,
  status: official.status,
  appointmentDate: toIsoDate(official.appointmentDate),
  biography: profileNote(official),
  sourceSeed: official,
}));

const officialsBySlug = new Map(STATIC_OFFICIALS.map((official) => [official.slug, official]));
const officialsByRouteId = new Map(
  STATIC_OFFICIALS.map((official) => [String(official.id), official]),
);

function isCurrentMembership(
  official: StaticOfficial,
  membership: InstitutionalMembershipSeed,
): boolean {
  return (
    official.status === "in_carica" &&
    membership.endDate == null &&
    membership.termLabel === "Mandato corrente"
  );
}

function mapMember(membership: InstitutionalMembershipSeed): OrganoMember | null {
  const official = officialsBySlug.get(membership.officialSlug);
  if (!official) return null;

  return {
    officialId: official.id,
    name: official.name,
    slug: official.slug,
    role: official.role,
    roleTitle: official.roleTitle ?? null,
    group: official.group ?? null,
    status: official.status,
    membershipRole: membership.membershipRole,
    termLabel: membership.termLabel,
    startDate: toIsoDate(membership.startDate),
    endDate: toIsoDate(membership.endDate),
    sourceLabel: membership.sourceLabel,
    sourceUrl: membership.sourceUrl,
    notes: membership.notes,
    isCurrent: isCurrentMembership(official, membership),
  };
}

function membershipsForOrgano(slug: string): InstitutionalMembershipSeed[] {
  return INSTITUTIONAL_MEMBERSHIPS.filter((membership) => membership.organoSlug === slug).sort(
    (a, b) => {
      const currentDelta =
        Number(mapMember(b)?.isCurrent ?? false) - Number(mapMember(a)?.isCurrent ?? false);
      return currentDelta || a.position - b.position;
    },
  );
}

function membershipsForOfficial(slug: string): InstitutionalMembershipSeed[] {
  return INSTITUTIONAL_MEMBERSHIPS.filter((membership) => membership.officialSlug === slug).sort(
    (a, b) => {
      const organoA = organiBySlug.get(a.organoSlug);
      const organoB = organiBySlug.get(b.organoSlug);
      return (organoA?.position ?? 0) - (organoB?.position ?? 0) || a.position - b.position;
    },
  );
}

function buildTerms(members: OrganoMember[]): OrganoTerm[] {
  const terms = new Map<string, OrganoTerm>();

  for (const member of members) {
    const label = member.termLabel ?? "Mandato non classificato";
    const key = `${label}|${member.startDate ?? ""}|${member.endDate ?? ""}`;
    const term =
      terms.get(key) ??
      ({
        label,
        startDate: member.startDate,
        endDate: member.endDate,
        status: member.isCurrent ? "current" : "historical",
        sourceLabel: member.sourceLabel,
        sourceUrl: member.sourceUrl,
        notes: member.notes,
        members: [],
      } satisfies OrganoTerm);

    if (member.isCurrent) term.status = "current";
    term.members.push(member);
    terms.set(key, term);
  }

  return Array.from(terms.values()).sort((a, b) => {
    if (a.status !== b.status) return a.status === "current" ? -1 : 1;
    return (b.startDate ?? "").localeCompare(a.startDate ?? "");
  });
}

function membersFor(organo: Organo): OrganoMember[] {
  return membershipsForOrgano(organo.slug)
    .map(mapMember)
    .filter((member): member is OrganoMember => member != null);
}

function withCounts(organo: Organo): Organo {
  const members = membersFor(organo);
  const currentCount = members.filter((member) => member.isCurrent).length;
  return {
    ...organo,
    memberCount: currentCount,
    historyCount: members.length - currentCount,
    sedutaCount: 0,
  };
}

export function listStaticOrgani(): Organo[] {
  return STATIC_ORGANI.map(withCounts).sort((a, b) => a.position - b.position);
}

export function getStaticOrgano(slug: string): OrganoDetail | null {
  const organo = organiBySlug.get(slug);
  if (!organo) return null;

  const members = membersFor(organo);
  return {
    ...withCounts(organo),
    members: members.filter((member) => member.isCurrent),
    terms: buildTerms(members),
    sedute: EMPTY_SEDUTE,
  };
}

export function listStaticOfficials(params: { role?: string; q?: string } = {}): Official[] {
  const query = params.q?.trim().toLocaleLowerCase("it-IT") ?? "";
  return STATIC_OFFICIALS.filter((official) => {
    if (params.role && official.role !== params.role) return false;
    return !query || official.name.toLocaleLowerCase("it-IT").includes(query);
  })
    .map(({ sourceSeed: _sourceSeed, ...official }) => official)
    .sort((a, b) => a.name.localeCompare(b.name, "it"));
}

export function getStaticOfficial(routeId: string | number): OfficialProfile | null {
  const key = String(routeId);
  const official = officialsByRouteId.get(key) ?? officialsBySlug.get(key);
  if (!official) return null;

  const organi = membershipsForOfficial(official.slug)
    .map((membership): OfficialProfile["organi"][number] | null => {
      const organo = organiBySlug.get(membership.organoSlug);
      if (!organo) return null;
      return {
        id: organo.id,
        type: organo.type,
        name: organo.name,
        slug: organo.slug,
        membershipRole: membership.membershipRole,
        termLabel: membership.termLabel,
        startDate: toIsoDate(membership.startDate),
        endDate: toIsoDate(membership.endDate),
        sourceLabel: membership.sourceLabel,
        sourceUrl: membership.sourceUrl,
        notes: membership.notes,
        isCurrent: isCurrentMembership(official, membership),
      };
    })
    .filter((entry): entry is OfficialProfile["organi"][number] => entry != null);

  const { sourceSeed: _sourceSeed, ...publicOfficial } = official;
  return {
    ...publicOfficial,
    activities: [],
    remunerations: [],
    declarations: [],
    votes: [],
    organi,
  };
}

export function isOrganoList(value: unknown): value is Organo[] {
  return Array.isArray(value);
}

export function isOfficialList(value: unknown): value is Official[] {
  return Array.isArray(value);
}

export function isOrganoDetail(value: unknown): value is OrganoDetail {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as { members?: unknown }).members) &&
    Array.isArray((value as { terms?: unknown }).terms) &&
    Array.isArray((value as { sedute?: unknown }).sedute)
  );
}

export function isOfficialProfile(value: unknown): value is OfficialProfile {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as { activities?: unknown }).activities) &&
    Array.isArray((value as { remunerations?: unknown }).remunerations) &&
    Array.isArray((value as { declarations?: unknown }).declarations) &&
    Array.isArray((value as { votes?: unknown }).votes) &&
    Array.isArray((value as { organi?: unknown }).organi)
  );
}
