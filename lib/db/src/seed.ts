import { sql } from "drizzle-orm";
import { db, pool } from "./client";
import { contractsTable, reportsTable } from "./schema";

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
