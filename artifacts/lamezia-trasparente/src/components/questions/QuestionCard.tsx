import { Link } from "wouter";
import { ArrowRight, Star } from "lucide-react";
import type { Question } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { iconForTopic } from "@/lib/questionTopics";

interface QuestionCardProps {
  question: Question;
  showTopic?: boolean;
}

export function QuestionCard({ question, showTopic = false }: QuestionCardProps) {
  const Icon = iconForTopic(question.topic);

  return (
    <Card className="group flex h-full flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        {question.featured ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
            <Star className="h-3 w-3 fill-current" />
            In evidenza
          </span>
        ) : null}
      </div>

      <div className="flex-1 space-y-2">
        {showTopic ? (
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {question.topic}
          </div>
        ) : null}
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-brand">
          {question.text}
        </h3>
        {question.teaser ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {question.teaser}
          </p>
        ) : null}
      </div>

      <Link href={question.destinationPath} className="mt-auto">
        <Button variant="outline" className="w-full justify-between font-semibold">
          {question.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </Card>
  );
}
