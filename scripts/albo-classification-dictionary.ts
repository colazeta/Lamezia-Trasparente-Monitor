export const ALBO_CLASSIFICATION_DICTIONARY_VERSION = "2026-07-05-a";

export type AlboClassificationConfidence = "high" | "medium" | "low";
export type AlboClassificationBasis = "office" | "act_type" | "office_and_act_type" | "fallback";

export type AlboSectorId =
  | "governo_territorio"
  | "patrimonio_territorio"
  | "manutenzioni"
  | "vigilanza_sicurezza"
  | "bilancio_finanze"
  | "avvocatura_contenzioso"
  | "servizi_persona"
  | "servizi_cittadino_demografici"
  | "organi_istituzionali"
  | "elettorale"
  | "altri_enti"
  | "notifiche_depositi"
  | "non_classificato";

export type AlboActCategoryId =
  | "determinazioni"
  | "deliberazioni"
  | "ordinanze"
  | "edilizia_urbanistica"
  | "avvisi"
  | "convocazioni_istituzionali"
  | "notifiche_depositi"
  | "stato_civile"
  | "elettorale"
  | "atti_diversi"
  | "non_classificato";

export interface AlboDictionaryEntry<Id extends string> {
  id: Id;
  label: string;
  description: string;
}

export interface AlboClassificationTag<Id extends string> extends AlboDictionaryEntry<Id> {
  confidence: AlboClassificationConfidence;
  basis: AlboClassificationBasis;
}

export interface AlboRecordClassification {
  dictionary_version: string;
  sector: AlboClassificationTag<AlboSectorId>;
  act_category: AlboClassificationTag<AlboActCategoryId>;
}

export interface AlboClassificationInput {
  office: string | null;
  act_type: string | null;
  subject?: string | null;
}

type MatchSource = "office" | "act_type" | "subject";

type ClassificationRule<Id extends string> = {
  id: Id;
  includes: string[];
  sources: MatchSource[];
  confidence: AlboClassificationConfidence;
  basis: AlboClassificationBasis;
};

export const ALBO_CLASSIFICATION_KNOWN_LIMIT =
  "Classificazione civica automatica basata su dizionario: settore e tipologia sono derivati da ufficio/provenienza e tipo atto, senza interpretare il contenuto dei PDF.";

export const ALBO_SECTOR_DICTIONARY: readonly AlboDictionaryEntry<AlboSectorId>[] = [
  {
    id: "governo_territorio",
    label: "Governo del territorio e urbanistica",
    description: "Urbanistica, pianificazione territoriale, edilizia e atti tecnici collegati al territorio.",
  },
  {
    id: "patrimonio_territorio",
    label: "Patrimonio e territorio comunale",
    description: "Gestione e valorizzazione del patrimonio comunale e del territorio comunale.",
  },
  {
    id: "manutenzioni",
    label: "Manutenzioni e servizi tecnici",
    description: "Manutenzioni, lavori e servizi tecnici operativi.",
  },
  {
    id: "vigilanza_sicurezza",
    label: "Vigilanza e sicurezza urbana",
    description: "Polizia locale, sicurezza urbana, viabilita e ordinanze di vigilanza.",
  },
  {
    id: "bilancio_finanze",
    label: "Bilancio, finanze e tributi",
    description: "Contabilita, bilancio, finanze, tributi e gestione economica.",
  },
  {
    id: "avvocatura_contenzioso",
    label: "Avvocatura e contenzioso",
    description: "Atti dell'avvocatura, contenzioso, liti e procedimenti legali dell'ente.",
  },
  {
    id: "servizi_persona",
    label: "Servizi alla persona",
    description: "Servizi sociali, welfare e interventi rivolti alla persona.",
  },
  {
    id: "servizi_cittadino_demografici",
    label: "Servizi al cittadino e demografici",
    description: "Anagrafe, stato civile, leva, elettorale e servizi demografici al cittadino.",
  },
  {
    id: "organi_istituzionali",
    label: "Organi istituzionali e segreteria",
    description: "Segreteria generale, giunta, commissioni, attivita istituzionali e organi politici.",
  },
  {
    id: "elettorale",
    label: "Elettorale",
    description: "Atti e comunicazioni riferiti a procedimenti elettorali.",
  },
  {
    id: "altri_enti",
    label: "Altri enti e soggetti esterni",
    description: "Pubblicazioni provenienti da altri enti pubblici o soggetti esterni al Comune.",
  },
  {
    id: "notifiche_depositi",
    label: "Notifiche e depositi",
    description: "Notifiche, depositi e pubblicazioni con ufficio comunale non chiaramente classificabile.",
  },
  {
    id: "non_classificato",
    label: "Non classificato",
    description: "Record non ricondotto con sufficiente certezza a un settore del dizionario.",
  },
];

export const ALBO_ACT_CATEGORY_DICTIONARY: readonly AlboDictionaryEntry<AlboActCategoryId>[] = [
  {
    id: "determinazioni",
    label: "Determinazioni dirigenziali",
    description: "Determinazioni, liquidazioni, affidamenti e altri atti gestionali dirigenziali.",
  },
  {
    id: "deliberazioni",
    label: "Deliberazioni",
    description: "Deliberazioni di giunta o di altri organi deliberativi.",
  },
  {
    id: "ordinanze",
    label: "Ordinanze",
    description: "Ordinanze e provvedimenti ordinatori.",
  },
  {
    id: "edilizia_urbanistica",
    label: "Edilizia e urbanistica",
    description: "Permessi di costruire, avvisi edilizi e atti urbanistici.",
  },
  {
    id: "avvisi",
    label: "Avvisi",
    description: "Avvisi pubblici e comunicazioni pubblicate all'Albo.",
  },
  {
    id: "convocazioni_istituzionali",
    label: "Convocazioni istituzionali",
    description: "Convocazioni di commissioni, sedute e organismi istituzionali.",
  },
  {
    id: "notifiche_depositi",
    label: "Notifiche e depositi",
    description: "Notifiche, depositi, avvisi di deposito e pubblicazioni ex codice di procedura civile.",
  },
  {
    id: "stato_civile",
    label: "Stato civile",
    description: "Pubblicazioni di matrimonio, cambio nome o cognome e atti di stato civile.",
  },
  {
    id: "elettorale",
    label: "Elettorale",
    description: "Atti dell'ufficio elettorale e pubblicazioni collegate alle elezioni.",
  },
  {
    id: "atti_diversi",
    label: "Atti diversi",
    description: "Atti non riconducibili alle famiglie principali del dizionario.",
  },
  {
    id: "non_classificato",
    label: "Non classificato",
    description: "Tipologia non ricondotta con sufficiente certezza a una famiglia del dizionario.",
  },
];

const SECTOR_RULES: readonly ClassificationRule<AlboSectorId>[] = [
  {
    id: "elettorale",
    includes: ["ELETTORALE"],
    sources: ["office", "act_type"],
    confidence: "high",
    basis: "office_and_act_type",
  },
  {
    id: "patrimonio_territorio",
    includes: ["PATRIMONIO", "VALORIZZAZIONE DEL PATRIMONIO"],
    sources: ["office"],
    confidence: "high",
    basis: "office",
  },
  {
    id: "governo_territorio",
    includes: [
      "GOVERNO DEL TERRITORIO",
      "GESTIONE DEL TERRITORIO",
      "PIANIFICAZIONE TERRITORIALE",
      "URBANISTICA",
      "SETTORE TECNICO",
      "PERMESSO DI COSTRUIRE",
    ],
    sources: ["office", "act_type"],
    confidence: "high",
    basis: "office_and_act_type",
  },
  {
    id: "manutenzioni",
    includes: ["SERVIZI MANUTENTIVI", "MANUTENZION"],
    sources: ["office"],
    confidence: "high",
    basis: "office",
  },
  {
    id: "vigilanza_sicurezza",
    includes: ["VIGILANZA", "SICUREZZA URBANA", "POLIZIA MUNICIPALE", "POLIZIA LOCALE"],
    sources: ["office"],
    confidence: "high",
    basis: "office",
  },
  {
    id: "bilancio_finanze",
    includes: ["ECONOMICO FINANZIARIO", "RAGIONERIA", "BILANCIO", "TRIBUT"],
    sources: ["office"],
    confidence: "high",
    basis: "office",
  },
  {
    id: "avvocatura_contenzioso",
    includes: ["AVVOCATURA", "CONTENZIOS"],
    sources: ["office"],
    confidence: "high",
    basis: "office",
  },
  {
    id: "servizi_persona",
    includes: ["SERVIZI ALLA PERSONA", "SERVIZI SOCIALI", "WELFARE"],
    sources: ["office"],
    confidence: "high",
    basis: "office",
  },
  {
    id: "servizi_cittadino_demografici",
    includes: [
      "SERVIZI AL CITTADINO",
      "DEMOGRAFIC",
      "ANAGRAFE",
      "STATO CIVILE",
      "PUBBLICAZIONE DI MATRIMONIO",
      "CAMBIO NOME",
      "CAMBIO COGNOME",
    ],
    sources: ["office", "act_type"],
    confidence: "high",
    basis: "office_and_act_type",
  },
  {
    id: "organi_istituzionali",
    includes: ["SEGRETERIA GENERALE", "ATTIVITA ISTITUZIONALI", "COMMISSIONI CONSILIARI", "DELIBERAZIONE DI GIUNTA"],
    sources: ["office", "act_type"],
    confidence: "high",
    basis: "office_and_act_type",
  },
  {
    id: "altri_enti",
    includes: ["PREFETTURA", "REGIONE", "REGIONECALABRIA", "COMUNE DI"],
    sources: ["office"],
    confidence: "medium",
    basis: "office",
  },
  {
    id: "notifiche_depositi",
    includes: ["ART.140 CPC", "ART.143 CPC", "AVVISO DI DEPOSITO"],
    sources: ["act_type"],
    confidence: "medium",
    basis: "act_type",
  },
];

const ACT_CATEGORY_RULES: readonly ClassificationRule<AlboActCategoryId>[] = [
  {
    id: "edilizia_urbanistica",
    includes: ["AVVISO RILASCIO PERMESSO DI COSTRUIRE", "PERMESSO DI COSTRUIRE"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "convocazioni_istituzionali",
    includes: ["CONVOCAZIONI COMMISSIONI CONSILIARI"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "notifiche_depositi",
    includes: ["ART.140 CPC", "ART.143 CPC", "AVVISO DI DEPOSITO"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "stato_civile",
    includes: ["PUBBLICAZIONE DI MATRIMONIO", "CAMBIO NOME", "CAMBIO COGNOME"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "elettorale",
    includes: ["ELETTORALE"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "determinazioni",
    includes: ["DETERMINAZIONE DIRIGENZIALE", "DETERMINA"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "deliberazioni",
    includes: ["DELIBERAZIONE"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "ordinanze",
    includes: ["ORDINANZA"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "avvisi",
    includes: ["AVVISO PUBBLICO", "AVVISO"],
    sources: ["act_type"],
    confidence: "high",
    basis: "act_type",
  },
  {
    id: "atti_diversi",
    includes: ["ATTI DIVERSI"],
    sources: ["act_type"],
    confidence: "medium",
    basis: "act_type",
  },
];

const SECTOR_BY_ID = dictionaryById(ALBO_SECTOR_DICTIONARY);
const ACT_CATEGORY_BY_ID = dictionaryById(ALBO_ACT_CATEGORY_DICTIONARY);

export const ALBO_CLASSIFICATION_DICTIONARY = {
  version: ALBO_CLASSIFICATION_DICTIONARY_VERSION,
  known_limits: [ALBO_CLASSIFICATION_KNOWN_LIMIT],
  sectors: ALBO_SECTOR_DICTIONARY,
  act_categories: ALBO_ACT_CATEGORY_DICTIONARY,
};

export function classifyAlboRecordCategory(input: AlboClassificationInput): AlboRecordClassification {
  return {
    dictionary_version: ALBO_CLASSIFICATION_DICTIONARY_VERSION,
    sector: classifyWithRules(input, SECTOR_RULES, SECTOR_BY_ID, "non_classificato"),
    act_category: classifyWithRules(input, ACT_CATEGORY_RULES, ACT_CATEGORY_BY_ID, "non_classificato"),
  };
}

function classifyWithRules<Id extends string>(
  input: AlboClassificationInput,
  rules: readonly ClassificationRule<Id>[],
  dictionary: ReadonlyMap<Id, AlboDictionaryEntry<Id>>,
  fallbackId: Id,
): AlboClassificationTag<Id> {
  for (const rule of rules) {
    if (ruleMatches(input, rule)) {
      return tagFromEntry(dictionaryEntry(dictionary, rule.id), rule.confidence, rule.basis);
    }
  }
  return tagFromEntry(dictionaryEntry(dictionary, fallbackId), "low", "fallback");
}

function ruleMatches(input: AlboClassificationInput, rule: ClassificationRule<string>): boolean {
  const haystacks = rule.sources.map((source) => sourceText(input, source)).filter(Boolean);
  return rule.includes.some((needle) => {
    const normalizedNeedle = normalizeDictionaryText(needle);
    return haystacks.some((haystack) => haystack.includes(normalizedNeedle));
  });
}

function sourceText(input: AlboClassificationInput, source: MatchSource): string {
  if (source === "office") return normalizeDictionaryText(input.office);
  if (source === "act_type") return normalizeDictionaryText(input.act_type);
  return normalizeDictionaryText(input.subject);
}

function normalizeDictionaryText(value: string | null | undefined): string {
  return (value ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dictionaryById<Id extends string>(
  entries: readonly AlboDictionaryEntry<Id>[],
): ReadonlyMap<Id, AlboDictionaryEntry<Id>> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

function dictionaryEntry<Id extends string>(
  dictionary: ReadonlyMap<Id, AlboDictionaryEntry<Id>>,
  id: Id,
): AlboDictionaryEntry<Id> {
  const entry = dictionary.get(id);
  if (!entry) throw new Error(`Missing Albo dictionary entry: ${id}`);
  return entry;
}

function tagFromEntry<Id extends string>(
  entry: AlboDictionaryEntry<Id>,
  confidence: AlboClassificationConfidence,
  basis: AlboClassificationBasis,
): AlboClassificationTag<Id> {
  return {
    ...entry,
    confidence,
    basis,
  };
}
