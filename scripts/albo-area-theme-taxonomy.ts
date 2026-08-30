import {
  PUBLICATION_AREA_THEME_SCHEMA_VERSION,
  classifyPublicationAreaTheme,
  type PublicationAreaThemeOverride,
  type PublicationAreaThemeTaxonomy,
} from "@workspace/publication-standardisation";

export const ALBO_PUBLIC_AREA_THEME_TAXONOMY = {
  id: "municipal-public-act-area-theme-it",
  version: "2026-08-30.1",
  locale: "it-IT",
  themes: [
    {
      id: "mobilita_sicurezza",
      label: "Mobilità e sicurezza urbana",
      description:
        "Circolazione, traffico, sosta, trasporto locale e sicurezza degli spazi urbani.",
    },
    {
      id: "territorio_edilizia",
      label: "Urbanistica, edilizia e territorio",
      description:
        "Pianificazione urbanistica, titoli edilizi, sanatorie e governo del territorio.",
    },
    {
      id: "lavori_infrastrutture",
      label: "Lavori pubblici e infrastrutture",
      description:
        "Opere pubbliche, manutenzioni, progettazione e infrastrutture comunali.",
    },
    {
      id: "scuola_educazione",
      label: "Scuola, educazione e infanzia",
      description:
        "Scuole, servizi educativi, asili nido, mense e prima infanzia.",
    },
    {
      id: "welfare_salute",
      label: "Welfare, salute e servizi alla persona",
      description:
        "Assistenza, inclusione sociale, salute e servizi rivolti alle persone.",
    },
    {
      id: "ambiente_energia",
      label: "Ambiente, rifiuti ed energia",
      description:
        "Rifiuti, verde, acqua, ambiente, energia ed efficientamento ambientale.",
    },
    {
      id: "cultura_sport_turismo",
      label: "Cultura, sport, turismo ed eventi",
      description:
        "Biblioteche, iniziative culturali, sport, turismo ed eventi pubblici.",
    },
    {
      id: "bilancio_tributi",
      label: "Bilancio, tributi e partecipate",
      description:
        "Bilancio, entrate, tributi e aspetti economici delle società partecipate.",
    },
    {
      id: "amministrazione_personale",
      label: "Amministrazione, personale e organi",
      description:
        "Personale, incarichi, nomine, organi e organizzazione dell'ente.",
    },
    {
      id: "patrimonio_economia",
      label: "Patrimonio e attività economiche",
      description:
        "Patrimonio, demanio, alienazioni, commercio e attività produttive.",
    },
    {
      id: "servizi_civici",
      label: "Servizi civici e cimiteriali",
      description:
        "Anagrafe, stato civile, servizi elettorali, cimiteriali e altri servizi civici.",
    },
  ],
  rules: [
    {
      id: "mobility-circulation",
      theme_id: "mobilita_sicurezza",
      confidence: "high",
      priority: 120,
      match: {
        any: [
          "modifica temporanea della circolazione",
          "circolazione stradale",
          "traffico veicolare",
          "trasporto pubblico locale",
          "piano della mobilita",
        ],
      },
    },
    {
      id: "mobility-roads",
      theme_id: "mobilita_sicurezza",
      confidence: "medium",
      priority: 90,
      match: { any: ["viabilita", "sosta", "parcheggio"] },
    },
    {
      id: "safety-urban",
      theme_id: "mobilita_sicurezza",
      confidence: "high",
      priority: 80,
      match: {
        any: [
          "sicurezza urbana",
          "videosorveglianza",
          "video sorveglianza",
          "protezione civile",
        ],
      },
    },
    {
      id: "building-permits",
      theme_id: "territorio_edilizia",
      confidence: "high",
      priority: 120,
      match: {
        any: [
          "permesso di costruire",
          "concessione edilizia",
          "condono",
          "sanatoria",
          "piano attuativo",
          "p a u",
        ],
      },
    },
    {
      id: "education-facilities",
      theme_id: "scuola_educazione",
      confidence: "high",
      priority: 115,
      match: {
        any: [
          "asilo nido",
          "asili nido",
          "scuola dell infanzia",
          "plesso scolastico",
          "scuola media",
          "istituto comprensivo",
          "mensa scolastica",
          "servizi di educazione",
        ],
      },
    },
    {
      id: "education-general",
      theme_id: "scuola_educazione",
      confidence: "medium",
      priority: 105,
      match: { any: ["scuola", "scolastico", "prima infanzia"] },
    },
    {
      id: "economic-public-business",
      theme_id: "patrimonio_economia",
      confidence: "high",
      priority: 112,
      match: {
        any: [
          "pubblico esercizio",
          "somministrazione alimenti",
          "attivita commerciale",
          "attivita produttiva",
          "commercio su area pubblica",
          "dehors",
        ],
      },
    },
    {
      id: "civic-cemeteries",
      theme_id: "servizi_civici",
      confidence: "high",
      priority: 110,
      match: {
        any: ["servizi cimiteriali", "ordinanze cimiteriali", "cimitero"],
      },
    },
    {
      id: "civic-services",
      theme_id: "servizi_civici",
      confidence: "high",
      priority: 100,
      match: {
        any: [
          "stato civile",
          "servizi demografici",
          "servizio elettorale",
          "oggetti rinvenuti",
        ],
      },
    },
    {
      id: "environment-waste",
      theme_id: "ambiente_energia",
      confidence: "high",
      priority: 108,
      match: {
        any: [
          "gestione dei rifiuti",
          "raccolta differenziata",
          "rifiuti",
          "depurazione",
          "bonifica ambientale",
          "verde pubblico",
          "rete idrica",
        ],
      },
    },
    {
      id: "environment-energy",
      theme_id: "ambiente_energia",
      confidence: "medium",
      priority: 70,
      match: { any: ["efficientamento energetico", "prestazione energetica"] },
    },
    {
      id: "sport-facilities",
      theme_id: "cultura_sport_turismo",
      confidence: "high",
      priority: 105,
      match: {
        any: [
          "impianti stadio",
          "impianto sportivo",
          "impianti sportivi",
          "sport e inclusione",
          "incontro di calcio",
          "stadio",
        ],
      },
    },
    {
      id: "culture-tourism-events",
      theme_id: "cultura_sport_turismo",
      confidence: "high",
      priority: 100,
      match: {
        any: [
          "cartellone estivo",
          "biblioteca",
          "fornitura di libri",
          "tourism",
          "ricezione turistica",
          "ospitalita di camper",
          "evento culturale",
          "museo",
          "teatro",
        ],
        none: ["cessazione immediata di attivita"],
      },
    },
    {
      id: "welfare-services",
      theme_id: "welfare_salute",
      confidence: "high",
      priority: 100,
      match: {
        any: [
          "servizi sociali",
          "assistenza domiciliare",
          "disabilita",
          "inclusione sociale",
          "contrasto alla poverta",
          "servizi alla persona",
        ],
      },
    },
    {
      id: "budget-specific",
      theme_id: "bilancio_tributi",
      confidence: "high",
      priority: 100,
      match: {
        any: [
          "debito fuori bilancio",
          "ripiano delle perdite",
          "bilancio di previsione",
          "rendiconto della gestione",
          "imposta municipale propria",
          "tassa sui rifiuti",
          "tributi comunali",
          "societa partecipata",
        ],
      },
    },
    {
      id: "administration-personnel",
      theme_id: "amministrazione_personale",
      confidence: "high",
      priority: 98,
      match: {
        any: [
          "dimissioni volontarie",
          "dipendente",
          "incarico assessorile",
          "decreto sindacale",
          "designazione componente",
          "consiglio di amministrazione",
        ],
      },
    },
    {
      id: "patrimony-assets",
      theme_id: "patrimonio_economia",
      confidence: "high",
      priority: 95,
      match: {
        any: [
          "asta pubblica",
          "alienazione",
          "alienare",
          "demanio",
          "patrimonio comunale",
        ],
      },
    },
    {
      id: "public-works-specific",
      theme_id: "lavori_infrastrutture",
      confidence: "high",
      priority: 75,
      match: {
        any: [
          "direzione lavori",
          "adeguamento sismico",
          "demolizione e ricostruzione",
          "riqualificazione quartiere",
          "riqualificazione di spazi urbani",
          "appalto integrato",
          "collaudo tecnico amministrativo",
          "stato avanzamento",
          "opera pubblica",
          "elettrodotto",
        ],
      },
    },
    {
      id: "public-works-general",
      theme_id: "lavori_infrastrutture",
      confidence: "medium",
      priority: 50,
      match: {
        any: ["lavori", "progettazione", "intervento", "servizi tecnici"],
      },
    },
  ],
} as const satisfies PublicationAreaThemeTaxonomy;

export const ALBO_PUBLIC_AREA_THEME_DESCRIPTOR = {
  schema_version: PUBLICATION_AREA_THEME_SCHEMA_VERSION,
  taxonomy_id: ALBO_PUBLIC_AREA_THEME_TAXONOMY.id,
  taxonomy_version: ALBO_PUBLIC_AREA_THEME_TAXONOMY.version,
  locale: ALBO_PUBLIC_AREA_THEME_TAXONOMY.locale,
  input_fields: ["subject"],
  input_boundary: "public_safe_only",
  execution: "deterministic_rules",
  themes: ALBO_PUBLIC_AREA_THEME_TAXONOMY.themes,
} as const;

export const ALBO_PUBLIC_AREA_THEME_KNOWN_LIMIT =
  "L'area tematica e' una classificazione civica locale, deterministica e versionata: non sostituisce tipologia o famiglia dell'atto, organo, ufficio, azione o macrotema ufficiale; i casi senza evidenza sufficiente restano non classificati.";

export function classifyAlboPublicAreaTheme(
  subject: string | null | undefined,
  availability: "available" | "withheld_for_privacy" | "missing" = "available",
  override?: PublicationAreaThemeOverride | null,
) {
  return classifyPublicationAreaTheme({
    taxonomy: ALBO_PUBLIC_AREA_THEME_TAXONOMY,
    texts: [{ field: "subject", value: subject }],
    availability,
    override,
  });
}
