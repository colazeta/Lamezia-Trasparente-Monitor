import { Router, type IRouter } from "express";
import type {
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions";
import {
  listDocuments,
  listContracts,
  listThemes,
  listPerformance,
  listPnrr,
} from "../lib/publicData";
import { helperContents, buildAssistantContext, type HelperSection } from "../lib/helperContent";
import { db, helperOverridesTable } from "@workspace/db";
import { isNotNull } from "drizzle-orm";

// ============================================================================
// Helper Cittadinanza Civica — Routes
//
// GET  /api/helper/guide   — contenuti strutturati dell'helper (sola lettura)
// POST /api/helper/ask     — assistente AI che risponde alle domande del
//                            cittadino, ancorato ai dati reali del sito
//                            tramite OpenAI function calling.
// ============================================================================

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Client AI: caricato in modo lazy alla prima richiesta per evitare che
// l'assenza delle env var (ai integrations non ancora provisionate) faccia
// crashare l'intero processo API all'avvio. Un errore al momento della
// richiesta produce un 503 esplicito invece di un boot failure silenzioso.
// ---------------------------------------------------------------------------
let _openai: import("openai").default | null = null;

async function getOpenAiClient(): Promise<import("openai").default | null> {
  if (_openai) return _openai;
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!baseUrl || !apiKey) return null;
  const { default: OpenAI } = await import("openai");
  _openai = new OpenAI({ apiKey, baseURL: baseUrl });
  return _openai;
}

/**
 * Resetta il client AI in cache. Usato solo nei test per garantire che ogni
 * suite parta con un client fresco (es. per testare il path env vars assenti).
 * Non chiamare in produzione.
 */
export function _resetOpenAiClientForTest(): void {
  _openai = null;
}

// ---------------------------------------------------------------------------
// Rate-limiting in-memory semplice: max 10 richieste per IP per minuto.
// Non sostituisce un rate-limiter infrastrutturale, ma protegge da flood
// accidentali o abusi leggeri senza dipendenze aggiuntive.
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function isFunctionToolCall(
  toolCall: ChatCompletionMessageToolCall,
): toolCall is ChatCompletionMessageFunctionToolCall {
  return toolCall.type === "function";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count += 1;
  return true;
}

// Pulizia periodica dei bucket scaduti per evitare memory leak.
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of ipBuckets.entries()) {
    if (now >= bucket.resetAt) ipBuckets.delete(ip);
  }
}, 5 * 60_000);

// ---------------------------------------------------------------------------
// Definizione strumenti (OpenAI function calling) collegati al layer dati
// pubblico esistente. L'assistente può invocarli per ottenere dati reali
// della piattaforma prima di formulare la risposta.
// ---------------------------------------------------------------------------
const DATA_TOOLS: import("openai").default.Chat.Completions.ChatCompletionTool[] =
  [
    {
      type: "function",
      function: {
        name: "cerca_contratti",
        description:
          "Cerca i contratti pubblici (ANAC) del Comune di Lamezia Terme. " +
          "Usa questo strumento quando il cittadino chiede di appalti, fornitori, " +
          "importi di spesa, CIG, procedure di gara o lavori pubblici.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description:
                "Ricerca testuale su titolo, fornitore, CIG o descrizione.",
            },
            supplier: {
              type: "string",
              description: "Filtra per nome fornitore (parziale).",
            },
            macrotema: {
              type: "string",
              description:
                "Ambito di spesa, es. 'Lavori pubblici', 'Istruzione', 'Sanità'.",
            },
            from: {
              type: "string",
              description: "Data aggiudicazione da (YYYY-MM-DD).",
            },
            to: {
              type: "string",
              description: "Data aggiudicazione a (YYYY-MM-DD).",
            },
            pageSize: {
              type: "integer",
              description: "Numero di risultati (default 5, max 20).",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "cerca_atti",
        description:
          "Cerca gli atti dell'Albo Pretorio del Comune: delibere, determine, " +
          "ordinanze, convocazioni. Usa questo strumento quando il cittadino " +
          "chiede di atti ufficiali, delibere, ordinanze o documenti del Comune.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Ricerca testuale sull'oggetto dell'atto.",
            },
            category: {
              type: "string",
              description:
                "Categoria: albo, delibera, convocazione, ordinanza.",
            },
            from: {
              type: "string",
              description: "Pubblicati dal (YYYY-MM-DD).",
            },
            to: {
              type: "string",
              description: "Pubblicati fino al (YYYY-MM-DD).",
            },
            isPnrr: {
              type: "boolean",
              description: "Solo atti collegati al PNRR.",
            },
            pageSize: {
              type: "integer",
              description: "Numero di risultati (default 5, max 20).",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "cerca_temi",
        description:
          "Elenca i temi di monitoraggio civico del sito: aree tematiche " +
          "come Sanità, Lavori Pubblici, Istruzione, Sicurezza, ecc. " +
          "Usa questo strumento quando il cittadino chiede di temi, monitoraggio " +
          "o vuole sapere su cosa stanno lavorando i cittadini.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Ricerca per titolo del tema.",
            },
            status: {
              type: "string",
              description:
                "Stato: aperto, in_corso, monitoraggio, chiuso.",
            },
            pageSize: {
              type: "integer",
              description: "Numero di risultati (default 5, max 20).",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "indicatori_performance",
        description:
          "Restituisce gli indicatori di performance del Comune con i valori " +
          "più recenti: indicatori economici, ambientali, di servizio, sicurezza " +
          "e istruzione. Usa questo strumento quando il cittadino chiede di " +
          "statistiche comunali, qualità dei servizi o indicatori di benessere.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    },
    {
      type: "function",
      function: {
        name: "cerca_pnrr",
        description:
          "Cerca i progetti PNRR (Piano Nazionale di Ripresa e Resilienza) " +
          "del Comune di Lamezia Terme. Usa questo strumento quando il cittadino " +
          "chiede di fondi PNRR, progetti europei, missioni o investimenti " +
          "finanziati con i fondi del Recovery Plan.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Ricerca su titolo, intervento o CUP.",
            },
            mission: {
              type: "string",
              description: "Missione PNRR, es. 'M1', 'M2', 'M5'.",
            },
            status: {
              type: "string",
              description: "Stato del progetto.",
            },
            pageSize: {
              type: "integer",
              description: "Numero di risultati (default 5, max 20).",
            },
          },
        },
      },
    },
  ];

// ---------------------------------------------------------------------------
// Dispatcher strumenti: chiama la funzione pubblica corrispondente e
// restituisce il risultato come stringa JSON.
// ---------------------------------------------------------------------------
async function callTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  const pageSize = Math.min(
    Number.isFinite(Number(args.pageSize)) ? Number(args.pageSize) : 5,
    20,
  );
  const query = { ...args, pageSize };

  try {
    switch (name) {
      case "cerca_contratti":
        return JSON.stringify(await listContracts(query));
      case "cerca_atti":
        return JSON.stringify(await listDocuments(query));
      case "cerca_temi":
        return JSON.stringify(await listThemes(query));
      case "indicatori_performance":
        return JSON.stringify(await listPerformance());
      case "cerca_pnrr":
        return JSON.stringify(await listPnrr(query));
      default:
        return JSON.stringify({ error: `Strumento sconosciuto: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({
      error: `Errore nel recupero dei dati: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}

// ---------------------------------------------------------------------------
// GET /api/helper/guide
// Restituisce i contenuti strutturati dell'helper: capitoli della storia e
// schede sezioni con i passi del tour. Endpoint pubblico, sola lettura.
// ---------------------------------------------------------------------------
router.get("/helper/guide", async (_req, res) => {
  let overrides: { key: string; publishedJson: unknown }[] = [];
  try {
    overrides = await db
      .select({ key: helperOverridesTable.key, publishedJson: helperOverridesTable.publishedJson })
      .from(helperOverridesTable)
      .where(isNotNull(helperOverridesTable.publishedJson));
  } catch {
    // DB unavailable — serve static content without overrides
  }

  if (overrides.length === 0) {
    res.json(helperContents);
    return;
  }

  const overrideMap = new Map(overrides.map((o) => [o.key, o.publishedJson]));
  const mergedSections = helperContents.sections.map((section) => {
    const override = overrideMap.get(section.id);
    if (!override || typeof override !== "object" || Array.isArray(override)) return section;
    return { ...section, ...(override as Partial<HelperSection>) };
  });

  res.json({ ...helperContents, sections: mergedSections });
});

// ---------------------------------------------------------------------------
// POST /api/helper/ask
// Assistente AI che risponde alle domande del cittadino in italiano,
// ancorato ai dati reali della piattaforma tramite function calling.
//
// Body:  { question: string, currentRoute?: string }
// Reply: SSE (text/event-stream)
//   - dati:  { content: string }   — token di testo progressivi
//   - fine:  { done: true }
//   - errore: { error: string }
// ---------------------------------------------------------------------------
router.post("/helper/ask", async (req, res) => {
  const ip = (req.ip ?? "unknown").replace(/^::ffff:/, "");
  if (!checkRateLimit(ip)) {
    res.status(429).json({
      error:
        "Troppe richieste. Attendi un minuto prima di fare un'altra domanda.",
    });
    return;
  }

  const { question, currentRoute } = req.body as {
    question?: unknown;
    currentRoute?: unknown;
  };

  if (typeof question !== "string" || !question.trim()) {
    res.status(400).json({ error: "Il campo 'question' è obbligatorio." });
    return;
  }

  const openai = await getOpenAiClient();
  if (!openai) {
    res.status(503).json({
      error:
        "L'assistente AI non è disponibile in questo momento. " +
        "Il servizio è in fase di configurazione. Riprova tra qualche istante.",
    });
    return;
  }

  const trimmedQuestion = question.trim().slice(0, 1000);
  const routeHint =
    typeof currentRoute === "string" && currentRoute.trim()
      ? `\nIl cittadino si trova attualmente nella pagina: ${currentRoute.trim()}`
      : "";

  const assistantContext = buildAssistantContext();

  const systemPrompt = `Sei l'assistente civico di rendiamoLameziaTrasparente, un osservatorio civico indipendente sui dati pubblici del Comune di Lamezia Terme (Calabria, Italia).

Il tuo ruolo è aiutare i cittadini a orientarsi nel sito, capire le funzionalità disponibili, trovare le informazioni che cercano e comprendere come usare i dati pubblici a loro vantaggio.

Hai accesso agli strumenti per consultare i dati reali della piattaforma (contratti, atti, temi, indicatori, PNRR). Usali SEMPRE quando la domanda riguarda dati specifici, prima di rispondere.

Rispondi SEMPRE in italiano, con tono diretto, chiaro e accessibile — stai parlando con un cittadino comune, non con un tecnico. Sii conciso ma completo.

Quando suggerisci dove andare nel sito, cita la sezione e il percorso (route) in modo esplicito. Per esempio: "Puoi trovare questa informazione nella sezione Contratti Pubblici (/contratti)".

NON inventare dati o funzionalità. Se una cosa non è disponibile, dillo chiaramente. Quando citi dati reali recuperati dagli strumenti, specifica sempre che provengono dalla piattaforma.

---

${assistantContext}
${routeHint}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Loop agente: il modello può invocare più strumenti in sequenza prima
    // di produrre la risposta finale. Ci fermiamo dopo max 5 turni per
    // evitare loop infiniti.
    const messages: import("openai").default.Chat.Completions.ChatCompletionMessageParam[] =
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: trimmedQuestion },
      ];

    const MAX_TURNS = 5;

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const isLastTurn = turn === MAX_TURNS - 1;

      // All'ultimo turno forziamo la risposta testuale, senza ulteriori tool call.
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        max_completion_tokens: 8192,
        messages,
        tools: isLastTurn ? undefined : DATA_TOOLS,
        tool_choice: isLastTurn ? undefined : "auto",
        stream: false,
      });

      const choice = response.choices[0];
      if (!choice) break;

      const msg = choice.message;

      // Se il modello ha chiamato strumenti, eseguiamo le chiamate e
      // continuiamo il loop con i risultati.
      if (
        msg.tool_calls &&
        msg.tool_calls.length > 0 &&
        choice.finish_reason === "tool_calls"
      ) {
        messages.push(msg);

        for (const tc of msg.tool_calls) {
          if (!isFunctionToolCall(tc)) {
            messages.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify({ error: "Tipo di tool non supportato" }),
            });
            continue;
          }

          let parsedArgs: Record<string, unknown> = {};
          try {
            parsedArgs = JSON.parse(tc.function.arguments) as Record<
              string,
              unknown
            >;
          } catch {
            parsedArgs = {};
          }
          const toolResult = await callTool(tc.function.name, parsedArgs);
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: toolResult,
          });
        }
        continue;
      }

      // Risposta testuale finale: stream simulato token-per-token dalla
      // risposta non-streaming. (Le API proxy di Replit talvolta richiedono
      // non-streaming nel loop agente; la risposta viene comunque inviata
      // in streaming verso il client tramite SSE.)
      const text = msg.content ?? "";
      if (text) {
        // Suddividiamo la risposta in chunk da ~30 caratteri per simulare
        // lo streaming progressivo verso il client.
        const CHUNK = 30;
        for (let i = 0; i < text.length; i += CHUNK) {
          const content = text.slice(i, i + CHUNK);
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      break;
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log?.error({ err }, "Helper AI assistant error");
    if (!res.headersSent) {
      res.status(502).json({
        error:
          "L'assistente AI non è al momento disponibile. Riprova tra qualche istante.",
      });
      return;
    }
    res.write(
      `data: ${JSON.stringify({ error: "Errore durante la generazione della risposta." })}\n\n`,
    );
    res.end();
  }
});

export default router;
