import { Bot, BookOpen, X, Info } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useCivicHelper } from "./CivicHelperContext";
import { cn } from "@/lib/utils";

export function CivicHelperFAB() {
  const { assistantOpen, openAssistant, closeAssistant, openIntro } =
    useCivicHelper();
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    if (assistantOpen) {
      closeAssistant();
      setExpanded(false);
    } else {
      setExpanded((v) => !v);
    }
  };

  const actions = [
    {
      label: "Assistente",
      icon: Bot,
      onClick: () => {
        openAssistant();
        setExpanded(false);
      },
    },
    {
      label: "Introduzione",
      icon: Info,
      onClick: () => {
        openIntro();
        setExpanded(false);
      },
    },
    {
      label: "Centro guida",
      icon: BookOpen,
      href: "/guida",
      onClick: () => setExpanded(false),
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[140] flex flex-col-reverse items-end gap-2">
      {expanded && (
        <>
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setExpanded(false)}
          />
          {actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                onClick={action.onClick}
                className="flex items-center gap-2.5 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-semibold shadow-lg hover-elevate transition-all"
                aria-label={action.label}
              >
                <action.icon className="h-4 w-4 text-primary shrink-0" />
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex items-center gap-2.5 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-semibold shadow-lg hover-elevate transition-all"
                aria-label={action.label}
              >
                <action.icon className="h-4 w-4 text-primary shrink-0" />
                {action.label}
              </button>
            ),
          )}
        </>
      )}

      <button
        onClick={toggle}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover-elevate",
          assistantOpen || expanded
            ? "bg-primary text-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
        aria-label={
          assistantOpen ? "Chiudi assistente" : "Apri helper cittadinanza civica"
        }
        aria-expanded={expanded || assistantOpen}
      >
        {assistantOpen || expanded ? (
          <X className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
