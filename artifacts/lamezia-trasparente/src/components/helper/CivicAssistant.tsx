import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCivicHelper } from "./CivicHelperContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Ciao! Sono l'assistente civico di rendiamoLameziaTrasparente.\n\nPuoi chiedermi di **contratti pubblici**, **atti ufficiali**, **progetti PNRR**, **indicatori di performance** o semplicemente come orientarti nel sito. Rispondo in italiano con link alle sezioni giuste.",
};

const SUGGESTIONS = [
  "Cosa posso trovare in questo sito?",
  "Quali sono i contratti pubblici più recenti?",
  "Come funziona il monitoraggio civico?",
  "Dove trovo i dati sul PNRR?",
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn(
        "flex gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
          isUser
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : msg.error
            ? "border border-destructive/30 bg-destructive/5 text-destructive rounded-tl-sm"
            : "border border-border bg-background rounded-tl-sm",
        )}
      >
        {msg.error && (
          <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            Errore
          </div>
        )}
        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a href={href} target={href?.startsWith("/") ? "_self" : "_blank"} rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-xl rounded-tl-sm border border-border bg-background px-3.5 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CivicAssistant() {
  const { assistantOpen, closeAssistant } = useCivicHelper();
  const [location] = useLocation();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (assistantOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [assistantOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: q,
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setLoading(true);
      setStreaming(false);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/helper/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, currentRoute: location }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Errore sconosciuto." }));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: (err as any).error ?? "Errore nella risposta.", error: true }
                : m,
            ),
          );
          return;
        }

        setStreaming(true);
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw) as {
                content?: string;
                done?: boolean;
                error?: string;
              };
              if (parsed.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: parsed.error!, error: true }
                      : m,
                  ),
                );
                break;
              }
              if (parsed.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + parsed.content }
                      : m,
                  ),
                );
              }
            } catch {
            }
          }
        }
      } catch (err: unknown) {
        if ((err as { name?: string }).name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Connessione interrotta. Riprova tra qualche istante.",
                  error: true,
                }
              : m,
          ),
        );
      } finally {
        setLoading(false);
        setStreaming(false);
      }
    },
    [location, loading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setLoading(false);
    setStreaming(false);
  };

  if (!assistantOpen) return null;

  const showTyping = loading && !streaming;
  const lastMsg = messages[messages.length - 1];
  const showLastEmpty = loading && streaming && lastMsg?.content === "";

  return (
    <div
      className="fixed bottom-20 right-4 z-[150] w-[min(380px,calc(100vw-2rem))] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
      style={{ maxHeight: "min(520px, calc(100dvh - 120px))" }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Assistente Civico</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">rendiamoLameziaTrasparente</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Nuova conversazione"
            title="Nuova conversazione"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={closeAssistant}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Chiudi assistente"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map((msg) =>
          msg.content === "" && !showLastEmpty ? null : (
            <MessageBubble key={msg.id} msg={msg} />
          ),
        )}
        {showTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-background px-3 py-2.5 flex gap-2 items-end"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Fai una domanda…"
          rows={1}
          disabled={loading}
          className="flex-1 resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 max-h-28 overflow-y-auto"
          style={{ minHeight: 36 }}
          aria-label="Messaggio"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || loading}
          className="h-9 w-9 shrink-0"
          aria-label="Invia"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
