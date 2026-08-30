import {
  publicationStandardisationDescriptor,
  standardisePublicationTitle,
  type PublicationStandardisationProfile,
} from "@workspace/publication-standardisation";

export const ALBO_PUBLICATION_STANDARDISATION_PROFILE = {
  id: "albo-public-title-it",
  version: "2026-08-30.2",
  locale: "it-IT",
  max_display_length: 180,
  canonical_terms: [
    { match: "COMUNE DI LAMEZIA TERME", display: "Comune di Lamezia Terme" },
    {
      match: "COMITATO ITALIANO PARALIMPICO",
      display: "Comitato Italiano Paralimpico",
    },
    { match: "LAMEZIA TERME", display: "Lamezia Terme" },
    { match: "SANT'EUFEMIA", display: "Sant'Eufemia" },
    { match: "UNIONE EUROPEA", display: "Unione europea" },
    { match: "ANAC", display: "ANAC" },
    { match: "CIG", display: "CIG" },
    { match: "C.I.P.", display: "CIP" },
    { match: "CUP", display: "CUP" },
    { match: "DUP", display: "DUP" },
    { match: "FESR", display: "FESR" },
    { match: "FSC", display: "FSC" },
    { match: "IMU", display: "IMU" },
    { match: "MEPA", display: "MEPA" },
    { match: "PAC", display: "PAC" },
    { match: "PIAO", display: "PIAO" },
    { match: "PNRR", display: "PNRR" },
    { match: "PON", display: "PON" },
    { match: "POR", display: "POR" },
    { match: "RUP", display: "RUP" },
    { match: "SUAP", display: "SUAP" },
    { match: "TARI", display: "TARI" },
    { match: "UE", display: "UE" },
  ],
  action_prefixes: [
    {
      id: "approvazione",
      label: "Approvazione",
      prefixes: ["APPROVAZIONE"],
      allow_bare_remainder: true,
    },
    {
      id: "presa_atto",
      label: "Presa d'atto",
      prefixes: ["PRESA D'ATTO"],
      allow_bare_remainder: true,
    },
    {
      id: "atto_indirizzo",
      label: "Atto di indirizzo",
      prefixes: ["ATTO DI INDIRIZZO"],
      allow_bare_remainder: true,
    },
    {
      id: "autorizzazione",
      label: "Autorizzazione",
      prefixes: ["AUTORIZZAZIONE"],
      allow_bare_remainder: true,
    },
    {
      id: "adozione",
      label: "Adozione",
      prefixes: ["ADOZIONE"],
      allow_bare_remainder: true,
    },
    {
      id: "riconoscimento",
      label: "Riconoscimento",
      prefixes: ["RICONOSCIMENTO"],
      allow_bare_remainder: true,
    },
  ],
} as const satisfies PublicationStandardisationProfile;

export const ALBO_PUBLICATION_STANDARDISATION =
  publicationStandardisationDescriptor(
    ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  );

export const ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT =
  "Il titolo di presentazione completo e' prodotto da regole deterministiche sul solo oggetto public-safe: non sostituisce il valore conservato nel campo subject, non recupera contenuti esclusi e i casi ambigui richiedono revisione.";

export function standardiseAlboPublicSubject(subject: string | null) {
  return standardisePublicationTitle({
    input_text: subject,
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });
}
