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
} from "./schema";

const contracts: {
  title: string;
  description: string;
  supplier: string;
  amount: string;
  procedureType: string;
  status: string;
  awardDate: string;
}[] = [
  {
    title: "Lavori di riqualificazione lungomare Marinella",
    description:
      "Rifacimento pavimentazione, illuminazione LED e aree verdi del lungomare",
    supplier: "Edil Sud Costruzioni S.r.l.",
    amount: "1480000.00",
    procedureType: "Procedura aperta",
    status: "Aggiudicato",
    awardDate: "2025-02-12",
  },
  {
    title: "Servizio di igiene urbana e raccolta differenziata",
    description:
      "Appalto pluriennale per la raccolta e gestione dei rifiuti urbani",
    supplier: "Ecologia Calabra S.p.A.",
    amount: "7200000.00",
    procedureType: "Gara europea",
    status: "In esecuzione",
    awardDate: "2024-11-20",
  },
  {
    title: "Manutenzione del verde pubblico cittadino",
    description: "Sfalcio, potatura e manutenzione delle aree verdi comunali",
    supplier: "Green Service Lamezia S.r.l.",
    amount: "285000.00",
    procedureType: "Procedura negoziata",
    status: "Aggiudicato",
    awardDate: "2024-10-08",
  },
  {
    title: "Messa in sicurezza torrente Cantagalli",
    description: "Interventi di pulizia e consolidamento argini",
    supplier: "Idrogeo Appalti S.r.l.",
    amount: "3100000.00",
    procedureType: "Procedura aperta",
    status: "Aggiudicato",
    awardDate: "2024-12-03",
  },
  {
    title: "Servizio di global service immobili comunali",
    description: "Manutenzione ordinaria del patrimonio immobiliare",
    supplier: "Facility Management Sud S.r.l.",
    amount: "540000.00",
    procedureType: "Procedura negoziata",
    status: "In esecuzione",
    awardDate: "2025-01-22",
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

    await tx.insert(contractsTable).values(
      contracts.map((c) => ({
        title: c.title,
        description: c.description,
        supplier: c.supplier,
        amount: c.amount,
        procedureType: c.procedureType,
        status: c.status,
        awardDate: new Date(c.awardDate),
        themeId: null,
      })),
    );

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
