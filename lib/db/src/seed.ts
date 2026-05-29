import { sql } from "drizzle-orm";
import { db, pool } from "./client";
import {
  categoriesTable,
  themesTable,
  themeDocumentsTable,
  themeEmailsTable,
  themeMetricsTable,
  contractsTable,
  actsTable,
  reportsTable,
  sharesTable,
  themeFollowersTable,
} from "./schema";

const categories = [
  {
    name: "Urbanistica e Lavori Pubblici",
    slug: "urbanistica",
    description:
      "Opere pubbliche, viabilità, riqualificazione urbana e gestione del territorio.",
  },
  {
    name: "Ambiente e Rifiuti",
    slug: "ambiente",
    description:
      "Gestione dei rifiuti, verde pubblico, qualità dell'aria e tutela ambientale.",
  },
  {
    name: "Bilancio e Tributi",
    slug: "bilancio",
    description:
      "Bilancio comunale, tributi locali, debiti e gestione finanziaria.",
  },
  {
    name: "Servizi Sociali e Sanità",
    slug: "sociale",
    description:
      "Welfare, assistenza, sanità territoriale e servizi alla persona.",
  },
  {
    name: "Trasparenza e Appalti",
    slug: "trasparenza",
    description:
      "Procedure di gara, affidamenti, conflitti di interesse e accesso agli atti.",
  },
];

const themes = [
  {
    slug: "lungomare-marinella",
    title: "Manutenzione Lungomare di Lamezia (Marinella)",
    categorySlug: "urbanistica",
    status: "in_corso",
    summary:
      "Monitoraggio dei lavori di riqualificazione del lungomare e della passeggiata di Marinella.",
    description:
      "Il progetto di riqualificazione del lungomare di Marinella prevede il rifacimento della pavimentazione, l'illuminazione pubblica a LED e nuove aree verdi. Seguiamo lo stato di avanzamento dei lavori, i tempi di consegna e gli scostamenti rispetto al cronoprogramma originario, raccogliendo segnalazioni dei cittadini sui cantieri aperti.",
    relevanceCount: 142,
    shareCount: 38,
  },
  {
    slug: "appalto-rifiuti",
    title: "Raccolta differenziata e nuovo appalto rifiuti",
    categorySlug: "ambiente",
    status: "monitoraggio",
    summary:
      "Analisi del nuovo contratto di igiene urbana e delle percentuali di raccolta differenziata.",
    description:
      "Il nuovo appalto per il servizio di igiene urbana ha un valore pluriennale significativo. Monitoriamo le percentuali di raccolta differenziata per quartiere, le penali contrattuali e la qualità del servizio, confrontando i dati dichiarati con le segnalazioni dei cittadini su mancati ritiri e discariche abusive.",
    relevanceCount: 98,
    shareCount: 52,
  },
  {
    slug: "bilancio-2025",
    title: "Bilancio comunale 2025 e piano di riequilibrio",
    categorySlug: "bilancio",
    status: "aperto",
    summary:
      "Lettura critica del bilancio di previsione e dello stato del piano di riequilibrio finanziario.",
    description:
      "Il Comune di Lamezia Terme è impegnato in un percorso di riequilibrio finanziario pluriennale. Analizziamo le voci principali del bilancio di previsione, l'andamento dell'indebitamento, la spesa corrente e gli investimenti, rendendo accessibili dati spesso difficili da consultare.",
    relevanceCount: 76,
    shareCount: 21,
  },
  {
    slug: "asili-nido",
    title: "Asili nido e liste d'attesa servizi educativi",
    categorySlug: "sociale",
    status: "aperto",
    summary:
      "Disponibilità di posti negli asili nido comunali e gestione delle liste d'attesa.",
    description:
      "Raccogliamo dati sulla capienza degli asili nido comunali, sulle rette, sui posti effettivamente disponibili e sulle liste d'attesa. L'obiettivo è verificare l'adeguatezza dell'offerta dei servizi educativi 0-3 anni rispetto alla domanda delle famiglie lametine.",
    relevanceCount: 64,
    shareCount: 29,
  },
  {
    slug: "affidamenti-diretti",
    title: "Affidamenti diretti sotto soglia 2024-2025",
    categorySlug: "trasparenza",
    status: "monitoraggio",
    summary:
      "Mappatura degli affidamenti diretti e verifica della rotazione degli operatori economici.",
    description:
      "Gli affidamenti diretti sotto soglia sono uno strumento legittimo ma vanno tenuti sotto osservazione per garantire concorrenza e rotazione. Mappiamo gli affidamenti pubblicati, le ditte beneficiarie e la frequenza degli incarichi, segnalando eventuali concentrazioni anomale.",
    relevanceCount: 121,
    shareCount: 47,
  },
  {
    slug: "villa-comunale",
    title: "Riqualificazione Villa Comunale e verde pubblico",
    categorySlug: "ambiente",
    status: "in_corso",
    summary:
      "Stato del verde pubblico cittadino e progetto di riqualificazione della Villa Comunale.",
    description:
      "La Villa Comunale e le aree verdi cittadine necessitano di manutenzione costante. Seguiamo gli interventi di sfalcio, potatura, sicurezza dei giochi e i progetti di riqualificazione finanziati, raccogliendo segnalazioni su aree degradate.",
    relevanceCount: 53,
    shareCount: 18,
  },
  {
    slug: "dissesto-idrogeologico",
    title: "Dissesto idrogeologico e messa in sicurezza torrenti",
    categorySlug: "urbanistica",
    status: "aperto",
    summary:
      "Interventi di messa in sicurezza dei torrenti e prevenzione del rischio idrogeologico.",
    description:
      "Il territorio lametino è esposto al rischio idrogeologico. Monitoriamo gli interventi di pulizia e messa in sicurezza dei torrenti Cantagalli, Piazza e Canne, i finanziamenti regionali e statali ottenuti e lo stato di avanzamento delle opere.",
    relevanceCount: 87,
    shareCount: 33,
  },
];

const documents: Record<
  string,
  { title: string; type: string; url: string | null; date: string }[]
> = {
  "lungomare-marinella": [
    {
      title: "Determina di aggiudicazione lavori lungomare",
      type: "Determina",
      url: "https://example.org/doc/det-lungomare.pdf",
      date: "2025-02-12",
    },
    {
      title: "Cronoprogramma lavori Marinella",
      type: "Allegato tecnico",
      url: null,
      date: "2025-03-01",
    },
  ],
  "appalto-rifiuti": [
    {
      title: "Capitolato speciale appalto igiene urbana",
      type: "Capitolato",
      url: "https://example.org/doc/capitolato-rifiuti.pdf",
      date: "2024-11-20",
    },
    {
      title: "Report percentuali differenziata 2024",
      type: "Report",
      url: null,
      date: "2025-01-15",
    },
  ],
  "bilancio-2025": [
    {
      title: "Bilancio di previsione 2025",
      type: "Bilancio",
      url: "https://example.org/doc/bilancio-2025.pdf",
      date: "2025-01-31",
    },
  ],
  "affidamenti-diretti": [
    {
      title: "Elenco affidamenti diretti II semestre 2024",
      type: "Elenco",
      url: null,
      date: "2025-01-10",
    },
    {
      title: "Delibera linee guida affidamenti",
      type: "Delibera",
      url: "https://example.org/doc/linee-guida.pdf",
      date: "2024-09-05",
    },
  ],
  "dissesto-idrogeologico": [
    {
      title: "Progetto messa in sicurezza torrente Cantagalli",
      type: "Progetto",
      url: null,
      date: "2024-12-03",
    },
  ],
};

const emails: Record<
  string,
  {
    subject: string;
    sender: string;
    recipient: string;
    direction: string;
    date: string;
    body: string;
  }[]
> = {
  "lungomare-marinella": [
    {
      subject: "Richiesta accesso atti cantiere lungomare",
      sender: "comitato@rendiamolameziatrasparente.it",
      recipient: "protocollo@comune.lameziaterme.it",
      direction: "inviata",
      date: "2025-02-20",
      body: "Con la presente si richiede l'accesso agli atti relativi allo stato di avanzamento dei lavori del lungomare di Marinella, ai sensi dell'art. 5 del D.Lgs. 33/2013.",
    },
    {
      subject: "Riscontro accesso atti - lungomare",
      sender: "protocollo@comune.lameziaterme.it",
      recipient: "comitato@rendiamolameziatrasparente.it",
      direction: "ricevuta",
      date: "2025-03-05",
      body: "In riscontro alla vostra richiesta si trasmettono gli atti disponibili. I lavori risultano in corso con consegna prevista entro il terzo trimestre.",
    },
  ],
  "appalto-rifiuti": [
    {
      subject: "Chiarimenti penali contrattuali rifiuti",
      sender: "comitato@rendiamolameziatrasparente.it",
      recipient: "ufficio.ambiente@comune.lameziaterme.it",
      direction: "inviata",
      date: "2025-01-22",
      body: "Si chiede di conoscere se siano state applicate penali alla ditta affidataria per i mancati ritiri segnalati nei mesi di novembre e dicembre.",
    },
  ],
  "affidamenti-diretti": [
    {
      subject: "Accesso civico generalizzato affidamenti",
      sender: "comitato@rendiamolameziatrasparente.it",
      recipient: "rpct@comune.lameziaterme.it",
      direction: "inviata",
      date: "2025-01-18",
      body: "Richiesta di accesso civico generalizzato relativa all'elenco completo degli affidamenti diretti sopra i 5.000 euro disposti nel 2024.",
    },
  ],
};

const metrics: Record<
  string,
  { label: string; value: string; unit: string }[]
> = {
  "lungomare-marinella": [
    { label: "Importo lavori", value: "1.480.000", unit: "EUR" },
    { label: "Avanzamento", value: "62", unit: "%" },
    { label: "Ritardo sul cronoprogramma", value: "45", unit: "giorni" },
  ],
  "appalto-rifiuti": [
    { label: "Valore appalto (annuo)", value: "7.200.000", unit: "EUR" },
    { label: "Raccolta differenziata", value: "58,4", unit: "%" },
    { label: "Segnalazioni mancati ritiri", value: "214", unit: "nel 2024" },
  ],
  "bilancio-2025": [
    { label: "Disavanzo da ripianare", value: "38.500.000", unit: "EUR" },
    { label: "Spesa corrente", value: "61", unit: "% del bilancio" },
  ],
  "affidamenti-diretti": [
    { label: "Affidamenti diretti 2024", value: "187", unit: "numero" },
    { label: "Valore complessivo", value: "2.350.000", unit: "EUR" },
  ],
  "dissesto-idrogeologico": [
    { label: "Finanziamento ottenuto", value: "3.100.000", unit: "EUR" },
    { label: "Torrenti monitorati", value: "3", unit: "torrenti" },
  ],
};

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

const shareDistribution: Record<string, Record<string, number>> = {
  "lungomare-marinella": { facebook: 12, whatsapp: 14, twitter: 6, email: 3, link: 3 },
  "appalto-rifiuti": { facebook: 18, whatsapp: 20, twitter: 8, email: 3, link: 3 },
  "bilancio-2025": { facebook: 7, whatsapp: 8, twitter: 3, email: 2, link: 1 },
  "asili-nido": { facebook: 9, whatsapp: 11, twitter: 4, email: 3, link: 2 },
  "affidamenti-diretti": { facebook: 15, whatsapp: 18, twitter: 7, email: 4, link: 3 },
  "villa-comunale": { facebook: 6, whatsapp: 7, twitter: 2, email: 2, link: 1 },
  "dissesto-idrogeologico": { facebook: 10, whatsapp: 12, twitter: 5, email: 4, link: 2 },
};

const followerCounts: Record<string, number> = {
  "lungomare-marinella": 24,
  "appalto-rifiuti": 41,
  "bilancio-2025": 12,
  "asili-nido": 19,
  "affidamenti-diretti": 33,
  "villa-comunale": 8,
  "dissesto-idrogeologico": 27,
};

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

    const insertedCategories = await tx
      .insert(categoriesTable)
      .values(categories)
      .returning({ id: categoriesTable.id, slug: categoriesTable.slug });
    const categoryIdBySlug = new Map(
      insertedCategories.map((c) => [c.slug, c.id]),
    );

    const insertedThemes = await tx
      .insert(themesTable)
      .values(
        themes.map((t) => ({
          title: t.title,
          slug: t.slug,
          summary: t.summary,
          description: t.description,
          categoryId: categoryIdBySlug.get(t.categorySlug)!,
          status: t.status,
          relevanceCount: t.relevanceCount,
          shareCount: t.shareCount,
          followerCount: followerCounts[t.slug] ?? 0,
        })),
      )
      .returning({ id: themesTable.id, slug: themesTable.slug });
    const themeIdBySlug = new Map(insertedThemes.map((t) => [t.slug, t.id]));

    const documentValues = Object.entries(documents).flatMap(([slug, docs]) =>
      docs.map((d) => ({
        themeId: themeIdBySlug.get(slug)!,
        title: d.title,
        type: d.type,
        url: d.url,
        date: new Date(d.date),
      })),
    );
    if (documentValues.length) {
      await tx.insert(themeDocumentsTable).values(documentValues);
    }

    const emailValues = Object.entries(emails).flatMap(([slug, items]) =>
      items.map((e) => ({
        themeId: themeIdBySlug.get(slug)!,
        subject: e.subject,
        sender: e.sender,
        recipient: e.recipient,
        direction: e.direction,
        date: new Date(e.date),
        body: e.body,
      })),
    );
    if (emailValues.length) {
      await tx.insert(themeEmailsTable).values(emailValues);
    }

    const metricValues = Object.entries(metrics).flatMap(([slug, items]) =>
      items.map((m) => ({
        themeId: themeIdBySlug.get(slug)!,
        label: m.label,
        value: m.value,
        unit: m.unit,
      })),
    );
    if (metricValues.length) {
      await tx.insert(themeMetricsTable).values(metricValues);
    }

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

    const shareValues = Object.entries(shareDistribution).flatMap(
      ([slug, channels]) =>
        Object.entries(channels).flatMap(([channel, n]) =>
          Array.from({ length: n }, () => ({
            themeId: themeIdBySlug.get(slug)!,
            channel,
          })),
        ),
    );
    if (shareValues.length) {
      await tx.insert(sharesTable).values(shareValues);
    }

    const followerValues = Object.entries(followerCounts).flatMap(
      ([slug, n]) =>
        Array.from({ length: n }, (_, i) => ({
          themeId: themeIdBySlug.get(slug)!,
          email: `cittadino${i + 1}.${slug}@example.com`,
          unsubscribeToken: `${slug}-${i + 1}-${Math.random()
            .toString(36)
            .slice(2)}`,
        })),
    );
    if (followerValues.length) {
      await tx.insert(themeFollowersTable).values(followerValues);
    }

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
