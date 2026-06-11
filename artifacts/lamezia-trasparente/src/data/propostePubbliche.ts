export const PROPOSAL_PROMOTER_TYPES = [
  "cittadino_comitato",
  "associazione",
  "categoria",
  "forza_politica",
  "consigliere",
  "amministrazione",
  "altro",
] as const;

export type ProposalPromoterType = (typeof PROPOSAL_PROMOTER_TYPES)[number];

export const PROPOSAL_CHANNELS = [
  "iniziativa_popolare",
  "petizione",
  "conferenza_stampa",
  "comunicato",
  "mozione",
  "interrogazione",
  "delibera_proposta",
  "assemblea_pubblica",
  "altro",
] as const;

export type ProposalChannel = (typeof PROPOSAL_CHANNELS)[number];

export const PROPOSAL_STATUSES = [
  "proposta_emersa",
  "presentata_formalmente",
  "discussa",
  "recepita_parzialmente",
  "recepita_integralmente",
  "respinta",
  "senza_seguito_noto",
  "non_verificabile",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_EVIDENCE_LEVELS = [
  "fonte_ufficiale",
  "fonte_stampa",
  "fonte_social_verificabile",
  "ricostruzione_multi_fonte",
  "fonte_interna_documentale",
] as const;

export type ProposalEvidenceLevel = (typeof PROPOSAL_EVIDENCE_LEVELS)[number];

export type PublicProposal = {
  id: string;
  title: string;
  summary: string;
  promoter: string;
  promoterType: ProposalPromoterType;
  periodLabel: string;
  year: string;
  theme: string;
  territorialArea?: string;
  institutionalRecipient?: string;
  channel: ProposalChannel;
  sourceLabel: string;
  sourceUrl?: string;
  status: ProposalStatus;
  linkedActs: readonly string[];
  verificationNote: string;
  evidenceLevel: ProposalEvidenceLevel;
  lastUpdated: string;
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  proposta_emersa: "Proposta emersa",
  presentata_formalmente: "Presentata formalmente",
  discussa: "Discussa",
  recepita_parzialmente: "Recepita parzialmente",
  recepita_integralmente: "Recepita integralmente",
  respinta: "Respinta",
  senza_seguito_noto: "Senza seguito noto",
  non_verificabile: "Non verificabile",
};

export const PROPOSAL_CHANNEL_LABELS: Record<ProposalChannel, string> = {
  iniziativa_popolare: "Iniziativa popolare",
  petizione: "Petizione",
  conferenza_stampa: "Conferenza stampa",
  comunicato: "Comunicato",
  mozione: "Mozione",
  interrogazione: "Interrogazione",
  delibera_proposta: "Delibera proposta",
  assemblea_pubblica: "Assemblea pubblica",
  altro: "Altro",
};

export const PROPOSAL_PROMOTER_TYPE_LABELS: Record<
  ProposalPromoterType,
  string
> = {
  cittadino_comitato: "Cittadino/comitato",
  associazione: "Associazione",
  categoria: "Categoria",
  forza_politica: "Forza politica",
  consigliere: "Consigliere",
  amministrazione: "Amministrazione",
  altro: "Altro",
};

export const PROPOSAL_EVIDENCE_LABELS: Record<
  ProposalEvidenceLevel,
  string
> = {
  fonte_ufficiale: "Fonte ufficiale",
  fonte_stampa: "Fonte stampa",
  fonte_social_verificabile: "Fonte social verificabile",
  ricostruzione_multi_fonte: "Ricostruzione da più fonti",
  fonte_interna_documentale: "Fonte interna/documentale",
};

export const PUBLIC_PROPOSALS = [
  {
    id: "convocazioni-ordini-giorno-digitali",
    title: "Pubblicità digitale di convocazioni e ordini del giorno",
    summary:
      "Proposta per rendere più accessibili online convocazioni, ordini del giorno e aggiornamenti delle sedute pubbliche del Consiglio comunale.",
    promoter: "Lamezia Trasparente",
    promoterType: "cittadino_comitato",
    periodLabel: "Seed demo v0 — data di presentazione pubblica non censita",
    year: "non determinato",
    theme: "Trasparenza / partecipazione democratica",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "iniziativa_popolare",
    sourceLabel: "Manifest interno/documentale Lamezia Trasparente Monitor",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Record seed dimostrativo: non collega fonti esterne e richiede verifica redazionale prima di essere trattato come proposta formalmente depositata.",
    evidenceLevel: "fonte_interna_documentale",
    lastUpdated: "2026-06-09",
  },
  {
    id: "streaming-archivio-sedute-pubbliche",
    title: "Diretta streaming e archivio digitale delle sedute pubbliche",
    summary:
      "Proposta per consentire la fruizione a distanza delle sedute pubbliche e conservare un archivio digitale consultabile dai cittadini.",
    promoter: "Lamezia Trasparente",
    promoterType: "cittadino_comitato",
    periodLabel: "Seed demo v0 — data di presentazione pubblica non censita",
    year: "non determinato",
    theme: "Trasparenza / partecipazione democratica",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "iniziativa_popolare",
    sourceLabel: "Manifest interno/documentale Lamezia Trasparente Monitor",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Record seed dimostrativo: l'archivio descrive il contenuto della proposta senza indicare adesione politica o recepimento istituzionale.",
    evidenceLevel: "fonte_interna_documentale",
    lastUpdated: "2026-06-09",
  },
  {
    id: "resoconto-integrale-sedute-consiliari",
    title: "Resoconto integrale delle sedute consiliari",
    summary:
      "Proposta per pubblicare resoconti stenografici o integrali delle sedute consiliari, così da facilitare controllo civico, memoria documentale e accessibilità.",
    promoter: "Lamezia Trasparente",
    promoterType: "cittadino_comitato",
    periodLabel: "Seed demo v0 — data di presentazione pubblica non censita",
    year: "non determinato",
    theme: "Trasparenza / partecipazione democratica",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "iniziativa_popolare",
    sourceLabel: "Manifest interno/documentale Lamezia Trasparente Monitor",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Record seed dimostrativo: non contiene valutazioni sull'operato degli organi e segnala la necessità di collegare eventuali atti futuri.",
    evidenceLevel: "fonte_interna_documentale",
    lastUpdated: "2026-06-09",
  },
  {
    id: "firma-digitale-iniziative-petizioni",
    title: "Firma digitale per iniziative popolari, istanze e petizioni",
    summary:
      "Proposta per valutare strumenti digitali che rendano più accessibile la sottoscrizione di iniziative popolari, istanze e petizioni rivolte all'ente.",
    promoter: "Lamezia Trasparente",
    promoterType: "cittadino_comitato",
    periodLabel: "Seed demo v0 — data di presentazione pubblica non censita",
    year: "non determinato",
    theme: "Trasparenza / partecipazione democratica",
    institutionalRecipient: "Comune di Lamezia Terme",
    channel: "iniziativa_popolare",
    sourceLabel: "Manifest interno/documentale Lamezia Trasparente Monitor",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Record seed dimostrativo: eventuali profili tecnici, regolamentari e privacy richiedono istruttoria e fonti ufficiali dedicate.",
    evidenceLevel: "fonte_interna_documentale",
    lastUpdated: "2026-06-09",
  },
] as const satisfies readonly PublicProposal[];

export type ProposalFilter = {
  theme?: string;
  promoter?: string;
  year?: string;
  status?: ProposalStatus;
  channel?: ProposalChannel;
};

export function normalizeProposalFacet(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("it");
}

export function getProposalThemes(
  proposals: readonly PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return Array.from(new Set(proposals.map((proposal) => proposal.theme))).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}

export function getProposalPromoters(
  proposals: readonly PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return Array.from(new Set(proposals.map((proposal) => proposal.promoter))).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}

export function getProposalYears(
  proposals: readonly PublicProposal[] = PUBLIC_PROPOSALS,
) {
  return Array.from(new Set(proposals.map((proposal) => proposal.year))).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}

export function filterPublicProposals(
  proposals: readonly PublicProposal[],
  filters: ProposalFilter,
) {
  return proposals.filter((proposal) => {
    const matchesTheme =
      !filters.theme ||
      normalizeProposalFacet(proposal.theme) ===
        normalizeProposalFacet(filters.theme);
    const matchesPromoter =
      !filters.promoter ||
      normalizeProposalFacet(proposal.promoter) ===
        normalizeProposalFacet(filters.promoter);
    const matchesYear = !filters.year || proposal.year === filters.year;
    const matchesStatus = !filters.status || proposal.status === filters.status;
    const matchesChannel = !filters.channel || proposal.channel === filters.channel;

    return (
      matchesTheme &&
      matchesPromoter &&
      matchesYear &&
      matchesStatus &&
      matchesChannel
    );
  });
}
