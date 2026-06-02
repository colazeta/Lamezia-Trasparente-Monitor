import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, pool } from "./client";
import { runOrganiSedutaSync } from "./organi-sync";
import {
  contractsTable,
  reportsTable,
  officialsTable,
  officialActivitiesTable,
  officialRemunerationsTable,
  officialDeclarationsTable,
  officialVotesTable,
  publicationsTable,
  feedStatusTable,
  categoriesTable,
  themesTable,
  questionsTable,
  oversightOpinionsTable,
  oversightOpinionDocumentsTable,
  performanceCategoriesTable,
  performanceIndicatorsTable,
  fundamentalActsTable,
  bandiTable,
} from "./schema";
import { classifyMacrotema } from "./macrotemi";
import {
  PERFORMANCE_CATEGORIES,
  PERFORMANCE_INDICATORS,
} from "./performanceCatalog";

type SeedContract = {
  cig: string;
  cup?: string;
  title: string;
  description: string;
  supplier: string;
  amount: string;
  procedureType: string;
  acquisitionTool: string | null;
  status: string;
  awardDate: string;
};

// Modalità di scelta del contraente che, ai sensi dei codici ANAC, NON
// configurano una gara competitiva (affidamenti diretti / negoziate senza bando).
const NON_COMPETITIVE = [
  "Affidamento diretto",
  "Affidamento diretto a società in house",
  "Procedura negoziata senza previa pubblicazione",
  "Affidamento in economia - cottimo fiduciario",
];

// Strumenti di acquisto che rientrano nel Mercato Elettronico della PA.
const MEPA_TOOLS = [
  "MePA - Ordine diretto",
  "MePA - Trattativa diretta",
  "MePA - RdO",
];

function isWithoutTender(procedureType: string): boolean {
  return NON_COMPETITIVE.some((p) =>
    procedureType.toLowerCase().includes(p.toLowerCase()),
  );
}

function isWithoutMepa(acquisitionTool: string | null): boolean {
  if (!acquisitionTool) return true;
  return !MEPA_TOOLS.some((t) =>
    acquisitionTool.toLowerCase().startsWith("mepa"),
  );
}

// Link alla scheda/portale ufficiale ANAC per il singolo CIG.
function anacUrlForCig(cig: string): string {
  return `https://dati.anticorruzione.it/superset/dashboard/appalti/?cig=${cig}`;
}

const contracts: SeedContract[] = [
  {
    cig: "9A1B2C3D4E",
    cup: "C89J21001230001",
    title: "Lavori di riqualificazione lungomare Marinella",
    description:
      "Rifacimento pavimentazione, illuminazione LED e aree verdi del lungomare",
    supplier: "Edil Sud Costruzioni S.r.l.",
    amount: "1480000.00",
    procedureType: "Procedura aperta",
    acquisitionTool: "Autonomo (fuori MePA)",
    status: "Aggiudicato",
    awardDate: "2025-02-12",
  },
  {
    cig: "8F7E6D5C4B",
    title: "Servizio di igiene urbana e raccolta differenziata",
    description:
      "Appalto pluriennale per la raccolta e gestione dei rifiuti urbani",
    supplier: "Ecologia Calabra S.p.A.",
    amount: "7200000.00",
    procedureType: "Procedura aperta (gara europea)",
    acquisitionTool: "Autonomo (fuori MePA)",
    status: "In esecuzione",
    awardDate: "2024-11-20",
  },
  {
    cig: "7C8D9E0F1A",
    title: "Manutenzione del verde pubblico cittadino",
    description: "Sfalcio, potatura e manutenzione delle aree verdi comunali",
    supplier: "Green Service Lamezia S.r.l.",
    amount: "285000.00",
    procedureType: "Procedura negoziata senza previa pubblicazione",
    acquisitionTool: "MePA - RdO",
    status: "Aggiudicato",
    awardDate: "2024-10-08",
  },
  {
    cig: "6B5A4C3D2E",
    cup: "C84J18000000002",
    title: "Messa in sicurezza torrente Cantagalli",
    description: "Interventi di pulizia e consolidamento argini",
    supplier: "Idrogeo Appalti S.r.l.",
    amount: "3100000.00",
    procedureType: "Procedura aperta",
    acquisitionTool: "Autonomo (fuori MePA)",
    status: "Aggiudicato",
    awardDate: "2024-12-03",
  },
  {
    cig: "5E4D3C2B1A",
    title: "Servizio di global service immobili comunali",
    description: "Manutenzione ordinaria del patrimonio immobiliare",
    supplier: "Facility Management Sud S.r.l.",
    amount: "540000.00",
    procedureType: "Procedura negoziata senza previa pubblicazione",
    acquisitionTool: "MePA - Trattativa diretta",
    status: "In esecuzione",
    awardDate: "2025-01-22",
  },
  {
    cig: "Z1234ABCD5",
    title: "Fornitura di arredi per uffici comunali",
    description:
      "Acquisto di scrivanie, sedute e armadiature per i settori amministrativi",
    supplier: "Ufficio Service Calabria S.r.l.",
    amount: "48500.00",
    procedureType: "Affidamento diretto",
    acquisitionTool: "MePA - Ordine diretto",
    status: "Concluso",
    awardDate: "2024-09-15",
  },
  {
    cig: "Z6789EFGH0",
    title: "Servizio di manutenzione hardware e rete comunale",
    description:
      "Assistenza sistemistica, manutenzione server e apparati di rete",
    supplier: "Tecno Informatica Sud S.r.l.",
    amount: "62000.00",
    procedureType: "Affidamento diretto",
    acquisitionTool: "MePA - Trattativa diretta",
    status: "In esecuzione",
    awardDate: "2025-03-04",
  },
  {
    cig: "A2B3C4D5E6",
    cup: "C81B21003520001",
    title: "Lavori PINQuA - riqualificazione spazi urbani sociali",
    description:
      "Appalto integrato per ristrutturazione e riqualificazione di spazi urbani sociali (PNRR M5C2)",
    supplier: "Edil Sud Costruzioni S.r.l.",
    amount: "4250000.00",
    procedureType: "Procedura aperta",
    acquisitionTool: "Autonomo (fuori MePA)",
    status: "In esecuzione",
    awardDate: "2025-04-18",
  },
  {
    cig: "B3C4D5E6F7",
    title: "Servizio di refezione scolastica",
    description:
      "Preparazione e distribuzione pasti per le scuole dell'infanzia e primarie",
    supplier: "Ristorazione Mediterranea S.p.A.",
    amount: "1980000.00",
    procedureType: "Procedura aperta (gara europea)",
    acquisitionTool: "Autonomo (fuori MePA)",
    status: "In esecuzione",
    awardDate: "2024-08-30",
  },
  {
    cig: "C4D5E6F7G8",
    title: "Fornitura di materiale di cancelleria",
    description: "Acquisto annuale di carta, toner e materiale di consumo",
    supplier: "Ufficio Service Calabria S.r.l.",
    amount: "29800.00",
    procedureType: "Affidamento diretto",
    acquisitionTool: "MePA - Ordine diretto",
    status: "Concluso",
    awardDate: "2025-01-10",
  },
  {
    cig: "D5E6F7G8H9",
    cup: "C83H22000110001",
    title: "Manutenzione straordinaria strade urbane",
    description: "Rifacimento del manto stradale in diverse vie cittadine",
    supplier: "Strade & Asfalti Calabria S.r.l.",
    amount: "890000.00",
    procedureType: "Procedura negoziata senza previa pubblicazione",
    acquisitionTool: "Autonomo (fuori MePA)",
    status: "Aggiudicato",
    awardDate: "2025-02-28",
  },
  {
    cig: "E6F7G8H9I0",
    title: "Servizio di pulizia degli edifici comunali",
    description: "Pulizia ordinaria di uffici, scuole e impianti sportivi",
    supplier: "Facility Management Sud S.r.l.",
    amount: "320000.00",
    procedureType: "Procedura negoziata senza previa pubblicazione",
    acquisitionTool: "MePA - RdO",
    status: "In esecuzione",
    awardDate: "2024-12-12",
  },
  {
    cig: "F7G8H9I0J1",
    title: "Fornitura di energia elettrica per utenze comunali",
    description: "Somministrazione di energia elettrica tramite convenzione",
    supplier: "Energia Italia S.p.A.",
    amount: "1350000.00",
    procedureType: "Adesione a convenzione Consip",
    acquisitionTool: "Convenzione Consip",
    status: "In esecuzione",
    awardDate: "2024-07-01",
  },
  {
    cig: "G8H9I0J1K2",
    title: "Servizio di tesoreria comunale",
    description: "Affidamento del servizio di tesoreria dell'ente",
    supplier: "Banca di Credito Cooperativo del Reventino",
    amount: "180000.00",
    procedureType: "Procedura aperta",
    acquisitionTool: "Autonomo (fuori MePA)",
    status: "Aggiudicato",
    awardDate: "2025-05-06",
  },
  {
    cig: "H9I0J1K2L3",
    cup: "C82C23000050004",
    title: "Progettazione impianto sportivo polivalente",
    description:
      "Servizi di ingegneria e architettura per nuovo impianto sportivo",
    supplier: "Studio Tecnico Associato Progetti Sud",
    amount: "145000.00",
    procedureType: "Affidamento diretto",
    acquisitionTool: "MePA - Trattativa diretta",
    status: "Aggiudicato",
    awardDate: "2025-03-21",
  },
  {
    cig: "I0J1K2L3M4",
    title: "Servizio di trasporto scolastico",
    description: "Trasporto degli alunni delle scuole dell'obbligo",
    supplier: "Autolinee Lametine S.r.l.",
    amount: "760000.00",
    procedureType: "Procedura negoziata senza previa pubblicazione",
    acquisitionTool: "Autonomo (fuori MePA)",
    status: "In esecuzione",
    awardDate: "2024-09-02",
  },
];

const reports = [
  {
    title: "Buche pericolose su Via Marconi",
    description:
      "Diverse buche profonde lungo la carreggiata creano pericolo per scooter e auto",
    category: "Urbanistica e Lavori Pubblici",
    location: "Via Marconi, Nicastro",
    status: "presa_in_carico",
    citizenName: "Antonio R.",
    createdAt: "2025-03-02",
  },
  {
    title: "Cassonetti stracolmi zona Sambiase",
    description:
      "I cassonetti non vengono svuotati da giorni in piazza Fiorentino",
    category: "Ambiente e Rifiuti",
    location: "Piazza Fiorentino, Sambiase",
    status: "in_valutazione",
    citizenName: "Maria G.",
    createdAt: "2025-03-12",
  },
  {
    title: "Illuminazione assente al parco",
    description:
      "Lampioni spenti da settimane nel parco giochi, area insicura la sera",
    category: "Servizi Sociali e Sanità",
    location: "Parco di Capizzaglie",
    status: "ricevuta",
    citizenName: null,
    createdAt: "2025-03-20",
  },
];

type VoteValue = "favorevole" | "contrario" | "astenuto" | "assente";

const officials: {
  name: string;
  slug: string;
  role: string;
  roleTitle: string | null;
  group: string | null;
  status: string;
  appointmentDate: string | null;
  biography: string | null;
  votes: boolean;
  voteBias: VoteValue;
  activities: { title: string; description: string | null; date: string | null }[];
  remunerations: {
    year: number;
    amount: number | null;
    type: string;
    note: string | null;
  }[];
  declarations: {
    title: string;
    date: string | null;
    content: string | null;
    url: string | null;
  }[];
}[] = [
  {
    name: "Mario Murmura",
    slug: "mario-murmura",
    role: "sindaco",
    roleTitle: "Sindaco del Comune di Lamezia Terme",
    group: "Lista del Sindaco",
    status: "in_carica",
    appointmentDate: "2024-06-25",
    biography:
      "Avvocato, eletto Sindaco al ballottaggio del giugno 2024. Già consigliere comunale, si occupa di sviluppo del territorio e rapporti istituzionali.",
    votes: true,
    voteBias: "favorevole",
    activities: [
      {
        title: "Insediamento della nuova Giunta comunale",
        description:
          "Nomina degli assessori e definizione delle deleghe della consiliatura.",
        date: "2024-07-02",
      },
      {
        title: "Avvio del tavolo sul dissesto finanziario",
        description: "Coordinamento del piano di riequilibrio dell'ente.",
        date: "2024-09-15",
      },
    ],
    remunerations: [
      {
        year: 2025,
        amount: 47000,
        type: "Indennità di funzione",
        note: "Indennità annua lorda di carica da Sindaco.",
      },
      {
        year: 2024,
        amount: 23500,
        type: "Indennità di funzione",
        note: "Indennità rapportata ai mesi di carica nel 2024.",
      },
    ],
    declarations: [
      {
        title: "Dichiarazione dei redditi 2024",
        date: "2025-04-30",
        content:
          "Dichiarazione patrimoniale e reddituale pubblicata ai sensi del D.Lgs. 33/2013.",
        url: null,
      },
      {
        title: "Dichiarazione di insussistenza cause di inconferibilità",
        date: "2024-07-02",
        content: null,
        url: null,
      },
    ],
  },
  {
    name: "Giorgia Gargano",
    slug: "giorgia-gargano",
    role: "assessore",
    roleTitle: "Assessora al Bilancio e ai Tributi",
    group: "Lista del Sindaco",
    status: "in_carica",
    appointmentDate: "2024-07-02",
    biography:
      "Commercialista, con delega al bilancio, ai tributi e alla programmazione finanziaria dell'ente.",
    votes: true,
    voteBias: "favorevole",
    activities: [
      {
        title: "Predisposizione del bilancio di previsione 2025-2027",
        description: "Coordinamento tecnico-politico della manovra di bilancio.",
        date: "2025-02-10",
      },
    ],
    remunerations: [
      {
        year: 2025,
        amount: 28000,
        type: "Indennità di funzione",
        note: "Indennità annua lorda da assessore.",
      },
    ],
    declarations: [
      {
        title: "Dichiarazione dei redditi 2024",
        date: "2025-05-12",
        content:
          "Dichiarazione patrimoniale pubblicata ai sensi della normativa sulla trasparenza.",
        url: null,
      },
    ],
  },
  {
    name: "Antonio Bevilacqua",
    slug: "antonio-bevilacqua",
    role: "assessore",
    roleTitle: "Assessore ai Lavori Pubblici e all'Urbanistica",
    group: "Insieme per Lamezia",
    status: "in_carica",
    appointmentDate: "2024-07-02",
    biography:
      "Ingegnere civile, con delega ai lavori pubblici, all'urbanistica e alla rigenerazione urbana.",
    votes: true,
    voteBias: "favorevole",
    activities: [
      {
        title: "Programma triennale delle opere pubbliche",
        description: "Definizione delle priorità di investimento infrastrutturale.",
        date: "2025-01-20",
      },
    ],
    remunerations: [
      {
        year: 2025,
        amount: 28000,
        type: "Indennità di funzione",
        note: null,
      },
    ],
    declarations: [
      {
        title: "Dichiarazione di insussistenza cause di incompatibilità",
        date: "2024-07-05",
        content: null,
        url: null,
      },
    ],
  },
  {
    name: "Rosa Cittadino",
    slug: "rosa-cittadino",
    role: "assessore",
    roleTitle: "Assessora ai Servizi Sociali",
    group: "Lista del Sindaco",
    status: "in_carica",
    appointmentDate: "2024-07-02",
    biography:
      "Assistente sociale, con delega al welfare, alle politiche per la famiglia e all'inclusione.",
    votes: false,
    voteBias: "favorevole",
    activities: [],
    remunerations: [
      {
        year: 2025,
        amount: 28000,
        type: "Indennità di funzione",
        note: null,
      },
    ],
    declarations: [],
  },
  {
    name: "Francesco Costanzo",
    slug: "francesco-costanzo",
    role: "consigliere",
    roleTitle: "Presidente del Consiglio Comunale",
    group: "Lista del Sindaco",
    status: "in_carica",
    appointmentDate: "2024-06-25",
    biography:
      "Consigliere di maggioranza, eletto Presidente del Consiglio Comunale.",
    votes: true,
    voteBias: "favorevole",
    activities: [
      {
        title: "Presidenza delle sedute del Consiglio Comunale",
        description: "Convocazione e direzione dei lavori dell'assemblea.",
        date: "2024-07-10",
      },
    ],
    remunerations: [
      {
        year: 2025,
        amount: 4200,
        type: "Gettoni di presenza",
        note: "Gettoni per la partecipazione alle sedute e alle commissioni.",
      },
    ],
    declarations: [
      {
        title: "Dichiarazione dei redditi 2024",
        date: "2025-05-20",
        content: "Pubblicata ai sensi del D.Lgs. 33/2013.",
        url: null,
      },
    ],
  },
  {
    name: "Eugenio Guarascio",
    slug: "eugenio-guarascio",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
    group: "Lista del Sindaco",
    status: "in_carica",
    appointmentDate: "2024-06-25",
    biography: "Consigliere di maggioranza, componente della commissione bilancio.",
    votes: true,
    voteBias: "favorevole",
    activities: [],
    remunerations: [
      {
        year: 2025,
        amount: 2600,
        type: "Gettoni di presenza",
        note: null,
      },
    ],
    declarations: [],
  },
  {
    name: "Teresa Bambara",
    slug: "teresa-bambara",
    role: "consigliere",
    roleTitle: "Capogruppo di opposizione",
    group: "Lamezia Bene Comune",
    status: "in_carica",
    appointmentDate: "2024-06-25",
    biography:
      "Consigliera di opposizione, capogruppo, attiva sui temi di ambiente e trasparenza.",
    votes: true,
    voteBias: "contrario",
    activities: [
      {
        title: "Interrogazione sulla gestione dei rifiuti",
        description: "Richiesta di chiarimenti sui costi del servizio di igiene urbana.",
        date: "2025-03-05",
      },
    ],
    remunerations: [
      {
        year: 2025,
        amount: 3100,
        type: "Gettoni di presenza",
        note: null,
      },
    ],
    declarations: [
      {
        title: "Dichiarazione dei redditi 2024",
        date: "2025-05-18",
        content: "Pubblicata ai sensi della normativa sulla trasparenza.",
        url: null,
      },
    ],
  },
  {
    name: "Salvatore Paola",
    slug: "salvatore-paola",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
    group: "Movimento Civico Lametino",
    status: "in_carica",
    appointmentDate: "2024-06-25",
    biography: "Consigliere di opposizione, componente della commissione urbanistica.",
    votes: true,
    voteBias: "astenuto",
    activities: [],
    remunerations: [
      {
        year: 2025,
        amount: 2400,
        type: "Gettoni di presenza",
        note: null,
      },
    ],
    declarations: [],
  },
  {
    name: "Caterina Folino",
    slug: "caterina-folino",
    role: "dirigente",
    roleTitle: "Dirigente del Settore Finanziario",
    group: null,
    status: "in_carica",
    appointmentDate: "2023-03-01",
    biography:
      "Dirigente responsabile del settore bilancio, ragioneria e tributi del Comune.",
    votes: false,
    voteBias: "favorevole",
    activities: [
      {
        title: "Responsabile del procedimento di riequilibrio finanziario",
        description: "Coordinamento amministrativo del piano di rientro.",
        date: "2024-10-01",
      },
    ],
    remunerations: [
      {
        year: 2025,
        amount: 62000,
        type: "Retribuzione dirigenziale",
        note: "Trattamento economico complessivo annuo lordo.",
      },
    ],
    declarations: [],
  },
  {
    name: "Domenico Riccelli",
    slug: "domenico-riccelli",
    role: "dipendente",
    roleTitle: "Funzionario Ufficio Tecnico",
    group: null,
    status: "in_carica",
    appointmentDate: "2018-09-01",
    biography:
      "Funzionario tecnico (categoria D) addetto alla gestione dei lavori pubblici.",
    votes: false,
    voteBias: "favorevole",
    activities: [],
    remunerations: [
      {
        year: 2025,
        amount: 34000,
        type: "Retribuzione tabellare",
        note: "Trattamento economico annuo lordo da CCNL Funzioni Locali.",
      },
    ],
    declarations: [],
  },
];

function pickVote(bias: VoteValue, index: number): VoteValue {
  if (bias === "favorevole") {
    return index % 7 === 6 ? "assente" : "favorevole";
  }
  if (bias === "contrario") {
    if (index % 5 === 0) return "favorevole";
    if (index % 5 === 3) return "astenuto";
    return "contrario";
  }
  if (bias === "astenuto") {
    if (index % 3 === 0) return "favorevole";
    if (index % 3 === 1) return "astenuto";
    return "contrario";
  }
  return bias;
}

async function seedOfficials() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(officialsTable);

  if (count > 0) {
    console.log("Officials seed skipped: officials already exist.");
    return;
  }

  const delibere = await db
    .select({ id: publicationsTable.id })
    .from(publicationsTable)
    .where(
      and(
        eq(publicationsTable.category, "delibera"),
        eq(publicationsTable.subcategory, "consiglio"),
      ),
    )
    .orderBy(desc(publicationsTable.dataAtto), asc(publicationsTable.id))
    .limit(6);

  console.log(
    `Seeding officials (${officials.length}) and votes across ${delibere.length} delibere...`,
  );

  await db.transaction(async (tx) => {
    for (const o of officials) {
      const [created] = await tx
        .insert(officialsTable)
        .values({
          name: o.name,
          slug: o.slug,
          role: o.role,
          roleTitle: o.roleTitle,
          group: o.group,
          status: o.status,
          appointmentDate: o.appointmentDate
            ? new Date(o.appointmentDate)
            : null,
          biography: o.biography,
        })
        .returning();

      if (o.activities.length) {
        await tx.insert(officialActivitiesTable).values(
          o.activities.map((a, index) => ({
            officialId: created.id,
            title: a.title,
            description: a.description,
            date: a.date ? new Date(a.date) : null,
            position: index,
          })),
        );
      }

      if (o.remunerations.length) {
        await tx.insert(officialRemunerationsTable).values(
          o.remunerations.map((r, index) => ({
            officialId: created.id,
            year: r.year,
            amount: r.amount === null ? null : r.amount.toFixed(2),
            type: r.type,
            note: r.note,
            position: index,
          })),
        );
      }

      if (o.declarations.length) {
        await tx.insert(officialDeclarationsTable).values(
          o.declarations.map((d, index) => ({
            officialId: created.id,
            title: d.title,
            date: d.date ? new Date(d.date) : null,
            content: d.content,
            url: d.url,
            position: index,
          })),
        );
      }

      if (o.votes && delibere.length) {
        await tx.insert(officialVotesTable).values(
          delibere.map((d, index) => ({
            officialId: created.id,
            publicationId: d.id,
            vote: pickVote(o.voteBias, index),
            position: index,
          })),
        );
      }
    }
  });

  console.log("Officials seed complete.");
}

// Categorie civiche di base. La curatela completa dei Temi è affidata alla
// redazione (vedi area editor), ma alcuni temi di esempio servono a rendere
// utilizzabile il filtro "per tema" della pagina Appalti.
const seedCategories: {
  slug: string;
  name: string;
  description: string;
}[] = [
  {
    slug: "ambiente-rifiuti",
    name: "Ambiente e Rifiuti",
    description:
      "Igiene urbana, raccolta differenziata e tutela dell'ambiente.",
  },
  {
    slug: "urbanistica-lavori-pubblici",
    name: "Urbanistica e Lavori Pubblici",
    description:
      "Opere pubbliche, rigenerazione urbana e sicurezza del territorio.",
  },
  {
    slug: "scuola-servizi-educativi",
    name: "Scuola e Servizi Educativi",
    description: "Mensa, trasporto scolastico e servizi per l'istruzione.",
  },
];

// Temi di esempio. Ogni tema può citare nel testo i CUP dei progetti
// collegati: l'ingestione ANAC usa quei CUP per associare automaticamente i
// contratti al tema corretto. Inoltre `cigs` collega esplicitamente alcuni
// contratti di esempio (utile per i contratti privi di CUP).
const seedThemes: {
  slug: string;
  title: string;
  summary: string;
  description: string;
  categorySlug: string;
  cigs: string[];
}[] = [
  {
    slug: "riqualificazione-lungomare-marinella",
    title: "Riqualificazione del Lungomare di Marinella",
    summary:
      "Il cantiere per il nuovo lungomare: pavimentazione, illuminazione e verde.",
    description:
      "Monitoriamo i lavori di riqualificazione del lungomare Marinella (CUP C89J21001230001), dall'aggiudicazione all'esecuzione, con i relativi contratti pubblici.",
    categorySlug: "urbanistica-lavori-pubblici",
    cigs: ["9A1B2C3D4E"],
  },
  {
    slug: "gestione-rifiuti-urbani",
    title: "Gestione dei rifiuti urbani",
    summary:
      "L'appalto pluriennale per la raccolta e gestione dei rifiuti cittadini.",
    description:
      "Seguiamo il servizio di igiene urbana e raccolta differenziata: costi, durata e qualità del servizio reso alla città.",
    categorySlug: "ambiente-rifiuti",
    cigs: ["8F7E6D5C4B"],
  },
  {
    slug: "sicurezza-idrogeologica",
    title: "Sicurezza idrogeologica del territorio",
    summary:
      "Interventi su torrenti e argini per prevenire il rischio alluvioni.",
    description:
      "Messa in sicurezza del torrente Cantagalli (CUP C84J18000000002) e altri interventi di consolidamento idrogeologico.",
    categorySlug: "urbanistica-lavori-pubblici",
    cigs: ["6B5A4C3D2E"],
  },
  {
    slug: "mensa-trasporto-scolastico",
    title: "Mensa e trasporto scolastico",
    summary:
      "I servizi per gli studenti: refezione scolastica e trasporto degli alunni.",
    description:
      "Monitoriamo gli appalti per la refezione scolastica e per il trasporto degli alunni delle scuole dell'obbligo.",
    categorySlug: "scuola-servizi-educativi",
    cigs: ["B3C4D5E6F7", "I0J1K2L3M4"],
  },
];

async function seedThemesAndCategories(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(themesTable);

  if (count > 0) {
    console.log("Themes seed skipped: themes already exist.");
    return;
  }

  console.log(
    `Seeding ${seedCategories.length} categories and ${seedThemes.length} themes...`,
  );

  await db.transaction(async (tx) => {
    const categoryIdBySlug = new Map<string, number>();
    for (const c of seedCategories) {
      const [row] = await tx
        .insert(categoriesTable)
        .values(c)
        .onConflictDoUpdate({
          target: categoriesTable.slug,
          set: { name: c.name, description: c.description },
        })
        .returning({ id: categoriesTable.id, slug: categoriesTable.slug });
      categoryIdBySlug.set(row.slug, row.id);
    }

    for (const t of seedThemes) {
      const categoryId = categoryIdBySlug.get(t.categorySlug);
      if (!categoryId) continue;
      await tx
        .insert(themesTable)
        .values({
          title: t.title,
          slug: t.slug,
          summary: t.summary,
          description: t.description,
          categoryId,
        })
        .onConflictDoNothing({ target: themesTable.slug });
    }
  });
}

// Collega i contratti ai temi: per ogni tema, i contratti con un CIG elencato
// ricevono il themeId del tema (solo se non già impostato manualmente).
async function linkContractsToThemes(): Promise<void> {
  const themes = await db
    .select({ id: themesTable.id, slug: themesTable.slug })
    .from(themesTable);
  const themeIdBySlug = new Map(themes.map((t) => [t.slug, t.id]));

  let linked = 0;
  for (const t of seedThemes) {
    const themeId = themeIdBySlug.get(t.slug);
    if (!themeId) continue;
    for (const cig of t.cigs) {
      const updated = await db
        .update(contractsTable)
        .set({ themeId })
        .where(
          and(eq(contractsTable.cig, cig), sql`${contractsTable.themeId} is null`),
        )
        .returning({ id: contractsTable.id });
      linked += updated.length;
    }
  }
  if (linked > 0) {
    console.log(`Linked ${linked} contract(s) to themes.`);
  }
}

// Set iniziale di Domande curate ("Cosa puoi scoprire?"). Ogni domanda è
// collegata alla sezione che la risponde (destinationPath) e raggruppata per
// argomento (topic). Alcune sono marcate "in evidenza" per la home.
const seedQuestions: {
  text: string;
  teaser: string;
  destinationPath: string;
  ctaLabel: string;
  topic: string;
  featured?: boolean;
}[] = [
  // Soldi pubblici / Appalti → Contratti
  {
    text: "Quanto ha speso il Comune in appalti?",
    teaser:
      "L'importo complessivo dei contratti pubblici affidati dal Comune di Lamezia Terme.",
    destinationPath: "/contratti",
    ctaLabel: "Vai agli appalti",
    topic: "Soldi pubblici / Appalti",
    featured: true,
  },
  {
    text: "Quali aziende vincono più appalti dal Comune?",
    teaser: "Le imprese che si aggiudicano più contratti pubblici, per importo.",
    destinationPath: "/contratti?sort=amount",
    ctaLabel: "Vedi i fornitori",
    topic: "Soldi pubblici / Appalti",
  },
  {
    text: "Quali sono gli ultimi appalti affidati, e a chi?",
    teaser: "Gli affidamenti più recenti, con importo e beneficiario.",
    destinationPath: "/contratti",
    ctaLabel: "Ultimi appalti",
    topic: "Soldi pubblici / Appalti",
  },
  {
    text: "In cosa spende il Comune?",
    teaser:
      "Le categorie di spesa raggruppate per macrotemi (ambiente, scuole, strade, sociale) e le ultime spese registrate.",
    destinationPath: "/contratti",
    ctaLabel: "Esplora la spesa",
    topic: "Soldi pubblici / Appalti",
  },
  // PNRR → PNRR
  {
    text: "Quanti fondi PNRR ha ricevuto Lamezia, e per quali opere?",
    teaser:
      "I finanziamenti del Piano Nazionale di Ripresa e Resilienza assegnati alla città e le opere collegate.",
    destinationPath: "/pnrr",
    ctaLabel: "Scopri i fondi PNRR",
    topic: "PNRR",
    featured: true,
  },
  {
    text: "A che punto sono i lavori finanziati dal PNRR?",
    teaser: "Lo stato di avanzamento dei progetti finanziati con fondi PNRR.",
    destinationPath: "/pnrr",
    ctaLabel: "Stato dei lavori",
    topic: "PNRR",
  },
  // Atti e decisioni → Albo / Delibere
  {
    text: "Cosa ha deciso il Comune di recente?",
    teaser: "Gli ultimi atti pubblicati all'albo pretorio del Comune.",
    destinationPath: "/albo",
    ctaLabel: "Vai all'albo",
    topic: "Atti e decisioni",
  },
  {
    text: "Quali delibere sono state approvate su un certo tema?",
    teaser: "Le delibere di giunta e consiglio, ricercabili per argomento.",
    destinationPath: "/delibere",
    ctaLabel: "Cerca tra le delibere",
    topic: "Atti e decisioni",
  },
  {
    text: "Come ha votato il Consiglio su una delibera?",
    teaser:
      "L'esito del voto con l'appello nominale dei consiglieri su ogni delibera.",
    destinationPath: "/delibere",
    ctaLabel: "Vedi i voti",
    topic: "Atti e decisioni",
  },
  // Chi governa → Amministratori
  {
    text: "Chi amministra la città, e con quali deleghe?",
    teaser: "Sindaco, giunta e consiglio comunale, con i rispettivi incarichi.",
    destinationPath: "/amministratori",
    ctaLabel: "Chi governa",
    topic: "Chi governa",
    featured: true,
  },
  {
    text: "Quanto guadagnano gli amministratori?",
    teaser: "I compensi e le indennità degli amministratori comunali.",
    destinationPath: "/amministratori",
    ctaLabel: "Vedi i compensi",
    topic: "Chi governa",
  },
  // Agenda istituzionale → Convocazioni
  {
    text: "Quando si riunisce il prossimo Consiglio comunale?",
    teaser: "Le convocazioni del Consiglio comunale e l'ordine del giorno.",
    destinationPath: "/convocazioni",
    ctaLabel: "Prossime sedute",
    topic: "Agenda istituzionale",
  },
  {
    text: "Di cosa si è discusso nell'ultima seduta?",
    teaser: "I resoconti delle sedute del Consiglio comunale.",
    destinationPath: "/convocazioni",
    ctaLabel: "Resoconti delle sedute",
    topic: "Agenda istituzionale",
  },
  // Temi / Cronistoria → Temi
  {
    text: "A che punto è quest'opera pubblica?",
    teaser: "Lo stato dei temi monitorati: opere, servizi e vicende cittadine.",
    destinationPath: "/temi",
    ctaLabel: "Esplora i temi",
    topic: "Temi / Cronistoria",
    featured: true,
  },
  {
    text: "Com'è andata avanti questa vicenda nel tempo?",
    teaser: "La cronistoria di ogni tema, aggiornamento dopo aggiornamento.",
    destinationPath: "/temi",
    ctaLabel: "Leggi le cronistorie",
    topic: "Temi / Cronistoria",
  },
  {
    text: "Quali temi seguono di più i cittadini?",
    teaser: "I temi con più rilevanza e condivisioni da parte dei cittadini.",
    destinationPath: "/temi?sort=relevance",
    ctaLabel: "Temi più seguiti",
    topic: "Temi / Cronistoria",
  },
  // Partecipazione → Segnalazioni
  {
    text: "Quali problemi hanno segnalato i cittadini vicino a me?",
    teaser: "Le segnalazioni di sprechi e disservizi inviate dai cittadini.",
    destinationPath: "/segnalazioni",
    ctaLabel: "Vedi le segnalazioni",
    topic: "Partecipazione",
  },
  {
    text: "Come segnalo uno spreco o un disservizio?",
    teaser: "Invia una segnalazione al Comune in pochi passaggi.",
    destinationPath: "/segnalazioni",
    ctaLabel: "Fai una segnalazione",
    topic: "Partecipazione",
    featured: true,
  },
];

// Carica il set iniziale di Domande. Idempotente: salta se esistono già domande.
async function seedQuestionsData(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questionsTable);

  if (count > 0) {
    console.log("Questions seed skipped: questions already exist.");
    return;
  }

  console.log(`Seeding ${seedQuestions.length} curated questions...`);

  await db.insert(questionsTable).values(
    seedQuestions.map((q, i) => ({
      text: q.text,
      teaser: q.teaser,
      destinationPath: q.destinationPath,
      ctaLabel: q.ctaLabel,
      topic: q.topic,
      featured: q.featured ?? false,
      sortOrder: i,
      status: "published",
    })),
  );
}

type SeedOpinion = {
  title: string;
  issuingBody: string;
  opinionType: string;
  subject: string;
  outcome: string | null;
  body: string | null;
  referenceYear: number | null;
  opinionDate: string;
  documents: {
    title: string;
    type: string;
    url: string | null;
    date: string;
  }[];
};

const oversightOpinions: SeedOpinion[] = [
  {
    title:
      "Parere sul Bilancio di Previsione 2025-2027",
    issuingBody: "Collegio dei Revisori dei Conti",
    opinionType: "Parere obbligatorio",
    subject:
      "Verifica della coerenza, attendibilità e congruità delle previsioni di bilancio per il triennio 2025-2027.",
    outcome: "Parere favorevole con raccomandazioni",
    body: "Il Collegio dei Revisori, esaminato lo schema di bilancio di previsione 2025-2027 e la documentazione allegata, ha verificato la coerenza interna degli equilibri di parte corrente e in conto capitale, l'attendibilità delle previsioni di entrata e la congruità delle previsioni di spesa.\n\nIl Collegio esprime parere favorevole all'approvazione dello schema di bilancio, raccomandando un attento monitoraggio della capacità di riscossione delle entrate proprie e il contenimento della spesa corrente entro i limiti programmati.",
    referenceYear: 2025,
    opinionDate: "2025-01-22",
    documents: [
      {
        title: "Relazione del Collegio dei Revisori al Bilancio 2025-2027",
        type: "PDF",
        url: "https://www.comune.lamezia-terme.cz.it/trasparenza/revisori-bilancio-2025.pdf",
        date: "2025-01-22",
      },
    ],
  },
  {
    title: "Parere sul Rendiconto della Gestione 2024",
    issuingBody: "Collegio dei Revisori dei Conti",
    opinionType: "Parere obbligatorio",
    subject:
      "Esame del rendiconto della gestione dell'esercizio finanziario 2024 e della relazione sulla gestione.",
    outcome: "Parere favorevole",
    body: "Il Collegio ha verificato la corrispondenza del rendiconto alle risultanze della gestione, la regolarità delle scritture contabili e il rispetto dei vincoli di finanza pubblica. Esprime parere favorevole all'approvazione del rendiconto 2024.",
    referenceYear: 2024,
    opinionDate: "2025-04-15",
    documents: [
      {
        title: "Relazione al Rendiconto 2024",
        type: "PDF",
        url: "https://www.comune.lamezia-terme.cz.it/trasparenza/revisori-rendiconto-2024.pdf",
        date: "2025-04-15",
      },
    ],
  },
  {
    title:
      "Validazione della Relazione sulla Performance 2024",
    issuingBody: "OIV / Nucleo di Valutazione",
    opinionType: "Validazione",
    subject:
      "Validazione della Relazione sulla Performance dell'ente per l'anno 2024 ai sensi del D.Lgs. 150/2009.",
    outcome: "Validata",
    body: "Il Nucleo di Valutazione, verificata la conformità della Relazione sulla Performance 2024 al Sistema di Misurazione e Valutazione vigente, ne attesta la validazione, riscontrando il complessivo raggiungimento degli obiettivi strategici e operativi assegnati.",
    referenceYear: 2024,
    opinionDate: "2025-06-30",
    documents: [
      {
        title: "Documento di validazione della Performance 2024",
        type: "PDF",
        url: null,
        date: "2025-06-30",
      },
    ],
  },
  {
    title:
      "Verifica sugli obblighi di pubblicazione - Trasparenza 2025",
    issuingBody: "OIV / Nucleo di Valutazione",
    opinionType: "Attestazione",
    subject:
      "Attestazione sull'assolvimento degli obblighi di pubblicazione previsti dalla normativa in materia di trasparenza.",
    outcome: "Attestazione rilasciata",
    body: "Il Nucleo di Valutazione ha condotto la verifica a campione sulle sezioni di Amministrazione Trasparente, attestando l'assolvimento degli obblighi di pubblicazione, con indicazione di alcune sezioni da aggiornare con maggiore tempestività.",
    referenceYear: 2025,
    opinionDate: "2025-05-31",
    documents: [
      {
        title: "Griglia di rilevazione trasparenza 2025",
        type: "PDF",
        url: null,
        date: "2025-05-31",
      },
      {
        title: "Documento di attestazione OIV",
        type: "PDF",
        url: null,
        date: "2025-05-31",
      },
    ],
  },
  {
    title:
      "Deliberazione della Sezione regionale di controllo sul piano di riequilibrio",
    issuingBody: "Corte dei Conti",
    opinionType: "Deliberazione di controllo",
    subject:
      "Esame dello stato di attuazione del piano di riequilibrio finanziario pluriennale dell'ente.",
    outcome: "Prescrizioni e monitoraggio",
    body: "La Sezione regionale di controllo della Corte dei Conti, esaminata la documentazione trasmessa dall'ente, ha rilevato l'andamento del piano di riequilibrio, formulando prescrizioni in ordine al recupero dei residui attivi e disponendo il monitoraggio semestrale degli equilibri di bilancio.",
    referenceYear: 2023,
    opinionDate: "2025-03-10",
    documents: [
      {
        title: "Deliberazione Corte dei Conti - Sezione Calabria",
        type: "PDF",
        url: null,
        date: "2025-03-10",
      },
    ],
  },
  {
    title:
      "Atto di segnalazione ANAC in materia di affidamenti",
    issuingBody: "ANAC",
    opinionType: "Segnalazione",
    subject:
      "Osservazioni in merito alle procedure di affidamento diretto e all'utilizzo degli strumenti di acquisto telematici.",
    outcome: "Raccomandazioni",
    body: "L'Autorità Nazionale Anticorruzione, nell'ambito dell'attività di vigilanza, ha formulato raccomandazioni sull'adeguata motivazione degli affidamenti diretti e sul ricorso preferenziale agli strumenti di acquisto del Mercato Elettronico della Pubblica Amministrazione, invitando l'ente ad adottare misure organizzative correttive.",
    referenceYear: 2024,
    opinionDate: "2024-11-18",
    documents: [],
  },
];

async function seedOversightOpinions(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(oversightOpinionsTable);

  if (count > 0) {
    console.log("Oversight opinions seed skipped: opinions already exist.");
    return;
  }

  console.log(`Seeding ${oversightOpinions.length} oversight opinions...`);

  await db.transaction(async (tx) => {
    for (const o of oversightOpinions) {
      const [created] = await tx
        .insert(oversightOpinionsTable)
        .values({
          title: o.title,
          issuingBody: o.issuingBody,
          opinionType: o.opinionType,
          subject: o.subject,
          outcome: o.outcome,
          body: o.body,
          referenceYear: o.referenceYear,
          status: "pubblicato",
          opinionDate: new Date(o.opinionDate),
        })
        .returning();

      if (o.documents.length) {
        await tx.insert(oversightOpinionDocumentsTable).values(
          o.documents.map((d) => ({
            opinionId: created.id,
            title: d.title,
            type: d.type,
            url: d.url,
            date: new Date(d.date),
          })),
        );
      }
    }
  });

  console.log("Oversight opinions seed complete.");
}

// Insieme iniziale di tipi di atto fondamentale. L'elenco è estendibile dalla
// redazione (aggiungere/rimuovere voci dal pannello), perciò qui si fa solo un
// upsert non distruttivo: si mantengono le voci correnti già gestite a mano.
const FUNDAMENTAL_ACT_TYPES: {
  slug: string;
  label: string;
  keywords: string[];
}[] = [
  {
    slug: "piao",
    label: "PIAO – Piano Integrato di Attività e Organizzazione",
    keywords: ["piao", "piano integrato di attività"],
  },
  {
    slug: "dup",
    label: "DUP – Documento Unico di Programmazione",
    keywords: ["dup", "documento unico di programmazione"],
  },
  {
    slug: "defr",
    label: "DEFR – Documento di Economia e Finanza Regionale",
    keywords: ["defr", "documento di economia e finanza regionale"],
  },
  {
    slug: "bilancio-previsione",
    label: "Bilancio di previsione",
    keywords: ["bilancio di previsione", "bilancio previsionale"],
  },
  {
    slug: "rendiconto-gestione",
    label: "Rendiconto della gestione (Bilancio consuntivo)",
    keywords: ["rendiconto della gestione", "bilancio consuntivo", "rendiconto"],
  },
  {
    slug: "statuto-comunale",
    label: "Statuto comunale",
    keywords: ["statuto comunale", "statuto del comune"],
  },
  {
    slug: "regolamenti-comunali",
    label: "Regolamenti comunali principali",
    keywords: ["regolamento comunale", "regolamenti comunali"],
  },
  {
    slug: "piano-opere-pubbliche",
    label: "Piano triennale delle opere pubbliche",
    keywords: [
      "piano triennale delle opere pubbliche",
      "programma triennale dei lavori pubblici",
      "opere pubbliche",
    ],
  },
];

async function seedFundamentalActs(): Promise<void> {
  console.log(
    `Seeding ${FUNDAMENTAL_ACT_TYPES.length} fundamental act types...`,
  );
  for (let i = 0; i < FUNDAMENTAL_ACT_TYPES.length; i++) {
    const t = FUNDAMENTAL_ACT_TYPES[i];
    await db
      .insert(fundamentalActsTable)
      .values({
        slug: t.slug,
        label: t.label,
        keywords: t.keywords,
        sortOrder: i,
      })
      // Aggiorna solo metadati del tipo: non tocca la voce corrente (title,
      // description, source, file/link) gestita dalla redazione.
      .onConflictDoUpdate({
        target: fundamentalActsTable.slug,
        set: { label: t.label, keywords: t.keywords, sortOrder: i },
      });
  }
}

// Dati di esempio per la sezione "Bandi e finanziamenti". Bandi curati
// (source manuale) con keyword per il cross-matching della partecipazione.
// Upsert per slug: non sovrascrive le modifiche redazionali su voci esistenti.
const SAMPLE_BANDI: {
  slug: string;
  title: string;
  enteErogatore: string;
  description: string;
  eligibility: string;
  importoStanziato: string;
  importoMedioAggiudicato: string;
  daysToScadenza: number | null;
  status: "aperto" | "in-scadenza" | "concluso";
  settore: string;
  officialUrl: string;
  keywords: string[];
}[] = [
  {
    slug: "pnrr-rigenerazione-urbana-2026",
    title: "PNRR – Rigenerazione urbana e riqualificazione spazi pubblici",
    enteErogatore: "Ministero dell'Interno",
    description:
      "Contributi per progetti di rigenerazione urbana volti alla riduzione del degrado e alla riqualificazione di aree e immobili pubblici.",
    eligibility:
      "Comuni con popolazione superiore a 15.000 abitanti. Cofinanziamento minimo del 20%.",
    importoStanziato: "5000000.00",
    importoMedioAggiudicato: "1200000.00",
    daysToScadenza: 45,
    status: "aperto",
    settore: "strade",
    officialUrl: "https://www.interno.gov.it/",
    keywords: ["rigenerazione urbana", "riqualificazione", "spazi pubblici"],
  },
  {
    slug: "regione-calabria-efficientamento-scuole",
    title: "Efficientamento energetico degli edifici scolastici",
    enteErogatore: "Regione Calabria",
    description:
      "Finanziamenti per interventi di efficientamento energetico e messa in sicurezza degli edifici scolastici comunali.",
    eligibility:
      "Comuni calabresi proprietari di edifici scolastici. Progetto esecutivo cantierabile.",
    importoStanziato: "2000000.00",
    importoMedioAggiudicato: "350000.00",
    daysToScadenza: 12,
    status: "in-scadenza",
    settore: "scuole",
    officialUrl: "https://www.regione.calabria.it/",
    keywords: ["efficientamento", "scuola", "edifici scolastici", "scuole"],
  },
  {
    slug: "por-fesr-mobilita-sostenibile-2025",
    title: "POR FESR – Mobilità sostenibile e piste ciclabili",
    enteErogatore: "Regione Calabria",
    description:
      "Contributi per la realizzazione di piste ciclabili e interventi di mobilità sostenibile urbana.",
    eligibility: "Enti locali. Interventi coerenti con il PUMS.",
    importoStanziato: "1500000.00",
    importoMedioAggiudicato: "280000.00",
    daysToScadenza: -30,
    status: "concluso",
    settore: "mobilita",
    officialUrl: "https://calabriaeuropa.regione.calabria.it/",
    keywords: ["mobilità", "piste ciclabili", "trasporto"],
  },
  {
    slug: "ministero-cultura-biblioteche-2025",
    title: "Fondo per la promozione della lettura e delle biblioteche",
    enteErogatore: "Ministero della Cultura",
    description:
      "Contributi destinati al potenziamento delle biblioteche comunali e alla promozione di eventi culturali.",
    eligibility: "Comuni con biblioteca civica attiva.",
    importoStanziato: "800000.00",
    importoMedioAggiudicato: "60000.00",
    daysToScadenza: -90,
    status: "concluso",
    settore: "cultura",
    officialUrl: "https://cultura.gov.it/",
    keywords: ["biblioteca", "cultura", "lettura", "eventi"],
  },
  {
    slug: "regione-calabria-raccolta-differenziata",
    title: "Incentivi per il potenziamento della raccolta differenziata",
    enteErogatore: "Regione Calabria",
    description:
      "Finanziamenti per migliorare i sistemi di raccolta differenziata e ridurre il conferimento in discarica.",
    eligibility: "Comuni singoli o associati. Piano d'ambito approvato.",
    importoStanziato: "1200000.00",
    importoMedioAggiudicato: "180000.00",
    daysToScadenza: 90,
    status: "aperto",
    settore: "ambiente",
    officialUrl: "https://www.regione.calabria.it/",
    keywords: ["raccolta differenziata", "rifiuti", "ambiente", "igiene"],
  },
  {
    slug: "ministero-lavoro-inclusione-sociale-2025",
    title: "Fondo per l'inclusione e l'assistenza sociale",
    enteErogatore: "Ministero del Lavoro e delle Politiche Sociali",
    description:
      "Risorse per progetti di inclusione sociale, assistenza agli anziani e contrasto alla povertà.",
    eligibility: "Ambiti territoriali sociali. Progetto coprogettato col terzo settore.",
    importoStanziato: "900000.00",
    importoMedioAggiudicato: "150000.00",
    daysToScadenza: -10,
    status: "concluso",
    settore: "sociale",
    officialUrl: "https://www.lavoro.gov.it/",
    keywords: ["inclusione", "assistenza", "anziani", "sociale", "povertà"],
  },
];

async function seedBandi(): Promise<void> {
  console.log(`Seeding ${SAMPLE_BANDI.length} bandi...`);
  const now = Date.now();
  for (const b of SAMPLE_BANDI) {
    const scadenza =
      b.daysToScadenza == null
        ? null
        : new Date(now + b.daysToScadenza * 24 * 60 * 60 * 1000);
    await db
      .insert(bandiTable)
      .values({
        slug: b.slug,
        title: b.title,
        enteErogatore: b.enteErogatore,
        description: b.description,
        eligibility: b.eligibility,
        importoStanziato: b.importoStanziato,
        importoMedioAggiudicato: b.importoMedioAggiudicato,
        scadenza,
        status: b.status,
        settore: b.settore,
        officialUrl: b.officialUrl,
        source: "manual",
        keywords: b.keywords,
      })
      // Non distruttivo: la voce corrente curata dalla redazione resta intatta.
      .onConflictDoNothing({ target: bandiTable.slug });
  }
}

// Popola il catalogo della sezione "Performance del Comune": categorie e
// indicatori. Non distruttivo: aggiorna i metadati per slug (upsert) senza
// toccare le serie storiche già presenti. Eseguibile in modo idempotente.
async function seedPerformance(): Promise<void> {
  console.log(
    `Seeding ${PERFORMANCE_CATEGORIES.length} performance categories and ${PERFORMANCE_INDICATORS.length} indicators...`,
  );

  await db.transaction(async (tx) => {
    const categoryIdBySlug = new Map<string, number>();
    for (let i = 0; i < PERFORMANCE_CATEGORIES.length; i++) {
      const c = PERFORMANCE_CATEGORIES[i];
      const [row] = await tx
        .insert(performanceCategoriesTable)
        .values({
          slug: c.slug,
          name: c.name,
          description: c.description,
          position: i,
        })
        .onConflictDoUpdate({
          target: performanceCategoriesTable.slug,
          set: { name: c.name, description: c.description, position: i },
        })
        .returning({
          id: performanceCategoriesTable.id,
          slug: performanceCategoriesTable.slug,
        });
      categoryIdBySlug.set(row.slug, row.id);
    }

    for (let i = 0; i < PERFORMANCE_INDICATORS.length; i++) {
      const ind = PERFORMANCE_INDICATORS[i];
      const categoryId = categoryIdBySlug.get(ind.categorySlug);
      if (!categoryId) {
        console.warn(
          `Indicator "${ind.slug}" references unknown category "${ind.categorySlug}", skipped.`,
        );
        continue;
      }
      await tx
        .insert(performanceIndicatorsTable)
        .values({
          slug: ind.slug,
          categoryId,
          title: ind.title,
          description: ind.description,
          unit: ind.unit,
          source: ind.source,
          sourceUrl: ind.sourceUrl ?? null,
          updateMode: ind.updateMode,
          polarity: ind.polarity,
          externalKey: ind.externalKey ?? null,
          position: i,
        })
        .onConflictDoUpdate({
          target: performanceIndicatorsTable.slug,
          set: {
            categoryId,
            title: ind.title,
            description: ind.description,
            unit: ind.unit,
            source: ind.source,
            sourceUrl: ind.sourceUrl ?? null,
            updateMode: ind.updateMode,
            polarity: ind.polarity,
            externalKey: ind.externalKey ?? null,
            position: i,
            updatedAt: new Date(),
          },
        });
    }
  });

  console.log("Performance catalog seed complete.");
}

export async function seed() {
  await db.transaction(async (tx) => {
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(contractsTable);

    if (count > 0) {
      console.log("Seed skipped: sample contracts already exist.");
      return;
    }

    console.log("Seeding database with Lamezia Terme sample data...");

    const now = new Date();
    await tx.insert(contractsTable).values(
      contracts.map((c) => ({
        sourceId: `seed-${c.cig}`,
        title: c.title,
        description: c.description,
        supplier: c.supplier,
        amount: c.amount,
        procedureType: c.procedureType,
        status: c.status,
        cig: c.cig,
        cup: c.cup ?? null,
        stazioneAppaltante: "Comune di Lamezia Terme",
        acquisitionTool: c.acquisitionTool,
        withoutTender: isWithoutTender(c.procedureType),
        withoutMepa: isWithoutMepa(c.acquisitionTool),
        anacUrl: anacUrlForCig(c.cig),
        awardDate: new Date(c.awardDate),
        themeId: null,
        macrotema: classifyMacrotema(`${c.title} ${c.description}`),
        firstSeenAt: now,
        lastSeenAt: now,
      })),
    );

    await tx
      .insert(feedStatusTable)
      .values({
        source: "anac-contratti-lamezia",
        label: "Contratti pubblici ANAC – Comune di Lamezia Terme",
        url: "https://dati.anticorruzione.it/superset/dashboard/appalti/",
        status: "ok",
        error: null,
        itemsTotal: contracts.length,
        itemsNew: contracts.length,
        lastCheckedAt: now,
        lastUpdatedAt: now,
      })
      .onConflictDoNothing({ target: feedStatusTable.source });

    await tx.insert(reportsTable).values(
      reports.map((r) => ({
        title: r.title,
        description: r.description,
        category: r.category,
        location: r.location,
        status: r.status,
        citizenName: r.citizenName,
        createdAt: new Date(r.createdAt),
      })),
    );

    console.log("Seed complete.");
  });

  await seedThemesAndCategories();
  await linkContractsToThemes();
  await seedOfficials();
  await seedQuestionsData();
  await runOrganiSedutaSync();
  await seedOversightOpinions();
  await seedPerformance();
  await seedFundamentalActs();
  await seedBandi();
}

const entryPath = process.argv[1] ?? "";
const isMain =
  import.meta.url === `file://${entryPath}` &&
  /(^|[\\/])seed\.(ts|mts|js|mjs|cjs)$/.test(entryPath);
if (isMain) {
  seed()
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      return pool.end().finally(() => process.exit(1));
    });
}
