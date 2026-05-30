import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, pool } from "./client";
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
} from "./schema";

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

  await seedOfficials();
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
