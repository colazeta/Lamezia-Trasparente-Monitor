import { db, publicationsTable } from "@workspace/db";
import { and, asc, eq, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Generazione delle sintesi "In breve" degli atti dell'Albo Pretorio.
//
// Modulo condiviso tra:
//   - la route `GET /publications/:id` (generazione lazy alla prima apertura)
//   - il ciclo di ingestione (batch proattivo, così le anteprime nelle liste
//     web/mobile sono già popolate senza dover aprire ogni atto)
//   - l'endpoint admin `POST /admin/publications/generate-briefs` (avvio manuale)
//
// PROTEZIONE COSTI: due lock in memoria evitano chiamate LLM duplicate.
//   - `briefGenerationInProgress` (per-atto): al massimo una generazione in volo
//     per singolo atto, condivisa tra flusso lazy e batch.
//   - `briefBatchRunning` (di processo): un solo batch attivo alla volta su
//     questa istanza, condiviso tra ingestione e avvio manuale.
// ---------------------------------------------------------------------------

// Lock per-atto: condiviso tra generazione lazy e batch per non duplicare la
// chiamata LLM sullo stesso atto.
export const briefGenerationInProgress = new Set<number>();

// Pausa tra una chiamata LLM e la successiva nel batch, per limitare il rate
// (protezione costi + rispetto dei limiti del proxy AI Integrations).
const BRIEF_BATCH_DELAY_MS = 1500;

// Lock di processo: impedisce l'avvio di più batch concorrenti (un solo job
// di generazione "In breve" è attivo alla volta su questa istanza).
let briefBatchRunning = false;

export function isBriefBatchRunning(): boolean {
  return briefBatchRunning;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// True se le credenziali del proxy AI Integrations sono configurate.
export function isBriefAiConfigured(): boolean {
  return Boolean(
    process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] &&
      process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
  );
}

// Condizioni per gli atti candidati alla generazione automatica della sintesi:
// non hanno ancora un "In breve" e non sono stati curati manualmente
// (briefManual=true → "le modifiche manuali vincono"). L'oggetto è sempre
// presente (colonna NOT NULL), quindi ogni atto senza sintesi è candidato anche
// se manca il testo completo (markdownText): generateBrief sa lavorare con il
// solo oggetto.
export function briefBatchCandidateConditions() {
  return and(
    sql`${publicationsTable.brief} IS NULL`,
    eq(publicationsTable.briefManual, false),
  );
}

// Conta gli atti candidati alla generazione della sintesi.
export async function countBriefCandidates(): Promise<number> {
  const [counts] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(publicationsTable)
    .where(briefBatchCandidateConditions());
  return counts?.count ?? 0;
}

// Genera la sintesi "In breve" per un singolo atto. Lavora sia con il testo
// completo (markdownText) sia con il solo oggetto. Ritorna null se l'AI non è
// configurata o se la chiamata fallisce.
export async function generateBrief(
  oggetto: string,
  markdownText: string | null,
): Promise<string | null> {
  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  if (!baseUrl || !apiKey) return null;

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey, baseURL: baseUrl });

    const text = markdownText
      ? `Oggetto dell'atto: ${oggetto}\n\nTesto dell'atto (estratto):\n${markdownText.slice(0, 2000)}`
      : `Oggetto dell'atto: ${oggetto}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Sei un assistente che aiuta i cittadini del Comune di Lamezia Terme a capire gli atti dell'Albo Pretorio. " +
            "Il tuo compito è spiegare in modo semplice e comprensibile di cosa si tratta. " +
            "Usa un linguaggio chiaro, diretto e accessibile. Evita termini burocratici o tecnici. " +
            "Rispondi con 2-3 frasi al massimo, in italiano.",
        },
        {
          role: "user",
          content: `Spiega in breve questo atto:\n\n${text}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

// Avvia in modo lazy la generazione della sintesi per un singolo atto, senza
// bloccare il chiamante (fire-and-forget). Rispetta il lock per-atto e i flag
// "manuale vince". Il brief appare al prossimo caricamento.
export function startLazyBriefGeneration(
  id: number,
  oggetto: string,
  markdownText: string | null,
): void {
  if (briefGenerationInProgress.has(id)) return;
  briefGenerationInProgress.add(id);
  void generateBrief(oggetto, markdownText)
    .then(async (generated) => {
      if (generated) {
        await db
          .update(publicationsTable)
          .set({ brief: generated, briefGeneratedAt: new Date() })
          .where(
            and(
              eq(publicationsTable.id, id),
              sql`${publicationsTable.brief} IS NULL`,
              eq(publicationsTable.briefManual, false),
            ),
          );
      }
    })
    .catch(() => {})
    .finally(() => briefGenerationInProgress.delete(id));
}

// Rigenera (forzando la sovrascrittura) la sintesi "In breve" di un singolo
// atto, in modo atteso. Pensata per l'azione manuale del pannello di redazione
// quando una sintesi generata è sbagliata o di bassa qualità: a differenza del
// flusso lazy/batch NON richiede brief IS NULL, quindi sovrascrive anche una
// sintesi esistente non manuale. Reimposta briefManual=false (è una sintesi AI)
// e aggiorna briefGeneratedAt. Rispetta il lock per-atto per evitare chiamate
// LLM concorrenti sullo stesso atto (protezione costi).
// Ritorna:
//   - "busy"   se una generazione per questo atto è già in volo;
//   - "failed" se l'AI non è configurata o la chiamata non produce testo;
//   - "ok"     con il nuovo brief.
export async function regenerateBriefNow(
  id: number,
  oggetto: string,
  markdownText: string | null,
): Promise<{ status: "ok" | "busy" | "failed"; brief: string | null }> {
  if (briefGenerationInProgress.has(id)) {
    return { status: "busy", brief: null };
  }
  briefGenerationInProgress.add(id);
  try {
    const generated = await generateBrief(oggetto, markdownText);
    if (!generated) {
      return { status: "failed", brief: null };
    }
    await db
      .update(publicationsTable)
      .set({
        brief: generated,
        briefGeneratedAt: new Date(),
        briefManual: false,
      })
      .where(eq(publicationsTable.id, id));
    return { status: "ok", brief: generated };
  } finally {
    briefGenerationInProgress.delete(id);
  }
}

// Genera le sintesi "In breve" per tutti gli atti candidati, in sequenza e con
// rate-limit. Idempotente: salta gli atti già con brief o briefManual=true e
// ri-verifica lo stato in fase di update. Pensato per girare in background;
// l'avanzamento è loggato e visibile nei log dell'api-server.
async function runBriefBatch(): Promise<{
  candidates: number;
  generated: number;
  failed: number;
  skipped: number;
}> {
  const candidates = await db
    .select({
      id: publicationsTable.id,
      oggetto: publicationsTable.oggetto,
      markdownText: publicationsTable.markdownText,
    })
    .from(publicationsTable)
    .where(briefBatchCandidateConditions())
    .orderBy(asc(publicationsTable.id));

  console.log(
    `[briefs] batch avviato: ${candidates.length} atti senza sintesi "In breve"`,
  );

  let generated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];

    // Coordina con la generazione lazy: se un altro flusso sta già generando
    // questo atto, lo saltiamo per non duplicare la chiamata LLM.
    if (briefGenerationInProgress.has(c.id)) {
      skipped++;
      continue;
    }
    briefGenerationInProgress.add(c.id);

    try {
      // Ri-verifica lo stato corrente prima della chiamata LLM: se la sintesi è
      // stata generata altrove (flusso lazy) o impostata manualmente dopo lo
      // snapshot dei candidati, non paghiamo una generazione inutile.
      const [current] = await db
        .select({
          brief: publicationsTable.brief,
          briefManual: publicationsTable.briefManual,
        })
        .from(publicationsTable)
        .where(eq(publicationsTable.id, c.id));
      if (!current || current.brief || current.briefManual) {
        skipped++;
        continue;
      }

      const brief = await generateBrief(c.oggetto, c.markdownText ?? null);
      if (brief) {
        // Update idempotente: scrive solo se brief è ancora NULL e non è una
        // sintesi manuale; così non sovrascrive valori impostati tra select e
        // update. Il numero di righe aggiornate distingue generato da saltato.
        const updated = await db
          .update(publicationsTable)
          .set({ brief, briefGeneratedAt: new Date() })
          .where(
            and(
              eq(publicationsTable.id, c.id),
              sql`${publicationsTable.brief} IS NULL`,
              eq(publicationsTable.briefManual, false),
            ),
          )
          .returning({ id: publicationsTable.id });
        if (updated.length > 0) {
          generated++;
        } else {
          skipped++;
        }
      } else {
        failed++;
      }
    } catch (err) {
      failed++;
      console.error(`[briefs] errore generazione atto ${c.id}:`, err);
    } finally {
      briefGenerationInProgress.delete(c.id);
    }

    if ((i + 1) % 10 === 0 || i === candidates.length - 1) {
      console.log(
        `[briefs] avanzamento ${i + 1}/${candidates.length} ` +
          `(generati ${generated}, falliti ${failed}, saltati ${skipped})`,
      );
    }

    if (i < candidates.length - 1) {
      await sleep(BRIEF_BATCH_DELAY_MS);
    }
  }

  console.log(
    `[briefs] batch completato: generati ${generated}, falliti ${failed}, ` +
      `saltati ${skipped} su ${candidates.length} candidati`,
  );

  return {
    candidates: candidates.length,
    generated,
    failed,
    skipped,
  };
}

// Avvia il batch in background (fire-and-forget), proteggendolo con il lock di
// processo. Ritorna "started" se il job è partito, "already-running" se un altro
// batch è già attivo. Usato dall'endpoint admin: la risposta torna subito.
export function startBriefBatch(): "started" | "already-running" {
  if (briefBatchRunning) return "already-running";
  briefBatchRunning = true;
  void runBriefBatch()
    .catch((err) => {
      console.error("[briefs] batch interrotto da errore:", err);
    })
    .finally(() => {
      briefBatchRunning = false;
    });
  return "started";
}

// Esegue il batch in modo atteso (await), proteggendolo con il lock di processo.
// Se un batch è già attivo (es. avviato manualmente) ritorna subito senza
// duplicare il lavoro. Usato dal ciclo di ingestione per pre-generare le sintesi
// dopo ogni aggiornamento dei dati. No-op se l'AI non è configurata.
export async function runBriefBatchGuarded(): Promise<void> {
  if (briefBatchRunning) return;
  if (!isBriefAiConfigured()) return;
  briefBatchRunning = true;
  try {
    await runBriefBatch();
  } finally {
    briefBatchRunning = false;
  }
}
