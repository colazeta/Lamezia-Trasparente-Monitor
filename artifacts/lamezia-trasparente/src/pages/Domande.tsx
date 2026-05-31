import { useMemo, useState } from "react";
import { useSearch } from "wouter";
import { useListQuestions, type Question } from "@workspace/api-client-react";
import { HelpCircle, Search, X, Compass } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { iconForTopic } from "@/lib/questionTopics";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function Domande() {
  const searchString = useSearch();
  const initialTopic = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("topic") ?? "all";
  }, [searchString]);

  const { data: questions, isLoading } = useListQuestions();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>(initialTopic);

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const q of questions ?? []) set.add(q.topic);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "it"));
  }, [questions]);

  // Se l'argomento dell'URL non esiste (più), torna a "tutti".
  const activeTopic = topic !== "all" && !topics.includes(topic) ? "all" : topic;

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return (questions ?? []).filter((item) => {
      if (activeTopic !== "all" && item.topic !== activeTopic) return false;
      if (!q) return true;
      const haystack = normalize(
        `${item.text} ${item.teaser ?? ""} ${item.topic} ${item.ctaLabel}`,
      );
      return haystack.includes(q);
    });
  }, [questions, query, activeTopic]);

  const grouped = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const item of filtered) {
      const list = map.get(item.topic) ?? [];
      list.push(item);
      map.set(item.topic, list);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "it"),
    );
  }, [filtered]);

  const hasFilters = query.trim() !== "" || activeTopic !== "all";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow text-brand">
          <HelpCircle className="h-3.5 w-3.5" />
          Le risposte che cerchi
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Cosa vuoi scoprire?
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Parti da una domanda. Ogni domanda ti porta direttamente alla sezione
          del sito che contiene la risposta, con i dati pubblici del Comune di
          Lamezia Terme.
        </p>
      </div>

      {/* Ricerca + filtro per argomento */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca una domanda… (es. appalti, scuole, voto)"
            className="h-11 pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cerca tra le domande"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Azzera ricerca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover-elevate"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <TopicChip
              label="Tutti gli argomenti"
              active={activeTopic === "all"}
              onClick={() => setTopic("all")}
            />
            {topics.map((t) => (
              <TopicChip
                key={t}
                label={t}
                topic={t}
                active={activeTopic === t}
                onClick={() => setTopic(t)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-52 w-full rounded-xl" />
            ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-8 w-8" />
          </div>
          <h3 className="mb-3 font-display text-2xl font-bold tracking-tight">
            Nessuna domanda trovata
          </h3>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            {hasFilters
              ? "Nessuna domanda corrisponde alla ricerca o all'argomento selezionato. Prova a modificare i filtri."
              : "Le domande sono in fase di curatela. Torna presto: la redazione sta selezionando le domande a cui il sito può rispondere."}
          </p>
          {hasFilters ? (
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setTopic("all");
              }}
            >
              <X className="mr-1.5 h-4 w-4" />
              Azzera filtri
            </Button>
          ) : null}
        </div>
      ) : activeTopic !== "all" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map(([topicName, items]) => {
            const TopicIcon = iconForTopic(topicName);
            return (
              <section key={topicName}>
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <TopicIcon className="h-4 w-4" />
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                    {topicName}
                  </h2>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((q) => (
                    <QuestionCard key={q.id} question={q} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TopicChip({
  label,
  topic,
  active,
  onClick,
}: {
  label: string;
  topic?: string;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = topic ? iconForTopic(topic) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors hover-elevate ${
        active
          ? "border-brand bg-brand/10 text-brand"
          : "border-border text-muted-foreground"
      }`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}
